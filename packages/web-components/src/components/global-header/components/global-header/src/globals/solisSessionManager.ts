/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */
import { solisSessionManagerConfig } from '../types/Header.types';

export default class solisSessionManager {
  private refreshIntervalId: number | null = null;
  private sessionStatusIntervalId: number | null = null;
  private isLoggingOut = false;
  // Earliest wall-clock time (ms) at which the next refresh is permitted.
  // Set after each successful refresh so that any scheduled call that fires
  // before (30 - tokenRefreshInterval) minutes before token expiry is skipped.
  private refreshNotBefore: number = 0;
  private tokenRefreshInterval: number;
  private sessionStatusInterval: number;
  private idleTimeoutInterval: number;
  private isIdle: boolean;
  private idleTimeout: ReturnType<typeof setTimeout> | undefined;
  private basePath: string | undefined;
  private activityEvents: string[];
  private boundSetActive: () => void;
  private logoutCallback: (() => void) | undefined;
  config: solisSessionManagerConfig;

  constructor(config: solisSessionManagerConfig) {
    this.config = config;
    this.tokenRefreshInterval = config.tokenRefreshInterval || 25;
    this.sessionStatusInterval = config.sessionStatusInterval || 10;
    this.idleTimeoutInterval = config.idleTimeoutInterval || 28;
    this.basePath = config.basePath;
    this.activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ];
    this.isIdle = false;
    this.idleTimeout = undefined;
    this.boundSetActive = () => this.setActive();
    this.logoutCallback = config.logoutCallback;
  }

  startRefreshSchedule() {
    this.refreshIntervalId = window.setInterval(
      () => {
        this.triggerRefresh();
      },
      this.tokenRefreshInterval * 60 * 1000
    );
  }

  isScheduleRunning(): boolean {
    return this.refreshIntervalId !== null;
  }

  stopRefreshSchedule() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  rescheduleRefresh(ttlMs: number) {
    this.stopRefreshSchedule();
    const delay = Math.max(0, ttlMs - 300 * 1000); // 5 minutes before token expiry
    window.setTimeout(() => {
      this.triggerRefresh(); // Trigger a one off refresh 5 minutes before token expires
      this.startRefreshSchedule(); // Trigger usual 25 minute refresh schedule from then on
    }, delay);
  }

  async triggerRefresh() {
    // Skip if the token was refreshed recently enough that the next scheduled
    // refresh is not yet due, preventing tight loops and redundant calls.
    if (Date.now() < this.refreshNotBefore) {
      console.log('Solis token refresh skipped (token still fresh)');
      return;
    }

    const fetchRoute = this.basePath
      ? this.basePath + '/hybrid-ipaas/v1/solis/session/refresh-token'
      : '/hybrid-ipaas/v1/solis/session/refresh-token';
    try {
      const response = await fetch(fetchRoute, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        console.log('Solis token refresh successful');
        const data = await response.json().catch(() => null);
        if (data?.ttl != null) {
          // ttl is the Solis token "time-to-live, in seconds".
          // Block further refreshes until (30 - tokenRefreshInterval) minutes
          // before this token expires, keeping the guard in sync with the
          // configured refresh cadence.
          const minTtlBeforeRefreshMs =
            (30 - this.tokenRefreshInterval) * 60 * 1000;
          this.refreshNotBefore =
            Date.now() + data.ttl * 1000 - minTtlBeforeRefreshMs;
          // Safety net to sync up refresh schedule with token expiry if lead tab is closed
          this.rescheduleRefresh(data.ttl * 1000);
        }
      } else if (response.status === 429) {
        // Another tab refreshed the token very recently; this tab's request
        // was rejected to protect the just-issued token.  Use the TTL from
        // the response body (same shape as a successful refresh) to resync
        // this tab's refresh schedule so it stays aligned with token expiry.
        console.log('Solis token refresh skipped (too recent - 429)');
        const data = await response.json().catch(() => null);
        if (data?.ttl != null) {
          this.rescheduleRefresh(data.ttl * 1000);
        }
      } else if (response.status === 401 || response.status === 403) {
        console.error('Solis token refresh unauthorized - triggering logout');
        await this.performLogout(true);
      } else {
        console.error('Solis token refresh failed:', response.status);
      }
    } catch (error: any) {
      console.error('Solis token refresh error:', error.message);
    }
  }

  registerActivityListeners() {
    this.activityEvents.forEach((eventType) => {
      document.addEventListener(eventType, this.boundSetActive, {
        passive: true,
        capture: true,
      });
    });
  }

  unregisterActivityListeners() {
    this.activityEvents.forEach((eventType) => {
      document.removeEventListener(eventType, this.boundSetActive, {
        capture: true,
      });
    });
  }

  setActive() {
    this.isIdle = false;
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(
      () => this.setIdle(),
      this.idleTimeoutInterval * 60 * 1000
    );
  }

  async setIdle() {
    this.isIdle = true;
    const sessionResult = await this.checkSessionStatus();
    if (!sessionResult) {
      await this.performLogout(false);
      return;
    }
    if (typeof sessionResult === 'number') {
      // Resync the refresh schedule with the actual token expiry
      this.rescheduleRefresh(sessionResult * 1000);
    }
  }

  isTabIdle(): boolean {
    return this.isIdle;
  }

  // Returns the token's remaining TTL in seconds when the session is active
  // (0 if the endpoint did not include a TTL), or false when it is inactive
  // or the request fails.
  async checkSessionStatus(): Promise<number | false> {
    const fetchRoute = this.basePath
      ? this.basePath + '/hybrid-ipaas/v1/solis/session/session-status'
      : '/hybrid-ipaas/v1/solis/session/session-status';
    try {
      const response = await fetch(fetchRoute, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const ttl: number | null = data?.ttl ?? null;
        console.log('Solis session is active');
        return ttl ?? 0; // 0 = active but TTL not provided; still truthy
      } else {
        console.warn('Solis session is inactive');
        return false;
      }
    } catch (error: any) {
      console.error('Solis session status unknown:', error.message);
      return false;
    }
  }

  async performLogout(hardLogout: boolean) {
    if (this.isLoggingOut) {
      return;
    }
    this.isLoggingOut = true;
    this.stopRefreshSchedule();
    this.stopSessionStatusPolling();
    this.unregisterActivityListeners();
    const sessionActive = await this.checkSessionStatus();
    if (sessionActive) {
      const postRoute = this.basePath
        ? this.basePath + '/hybrid-ipaas/v1/solis/session/logout'
        : '/hybrid-ipaas/v1/solis/session/logout';
      try {
        const response = await fetch(postRoute, {
          method: 'POST',
          credentials: 'same-origin',
        });

        if (response.ok) {
          console.log('Solis session logout - successful');
        } else if (response.status === 401) {
          console.log('Solis session logout - session already expired');
        } else {
          console.error('Solis session logout failed:', response.status);
        }
      } catch (error: any) {
        console.error('Solis session logout error:', error.message);
      }
    }
    if (this.logoutCallback) {
      try {
        await this.logoutCallback();
      } catch (error: any) {
        console.error('Logout failed with error: ', error.message);
      }
    }
    const logoutEndpoint = hardLogout ? '/solis-logout' : '/login';
    this.redirect(
      this.basePath ? `${this.basePath}${logoutEndpoint}` : logoutEndpoint
    );
  }

  startSessionStatusPolling() {
    const poll = async () => {
      const sessionResult = await this.checkSessionStatus();
      if (!sessionResult) {
        await this.performLogout(false);
        return; // don't reschedule after logout
      }
      if (typeof sessionResult === 'number') {
        // Resync the refresh schedule with the actual token expiry so that
        // tabs opening after the lead tab has already refreshed stay aligned.
        this.rescheduleRefresh(sessionResult * 1000);
      }
      this.sessionStatusIntervalId = window.setTimeout(
        poll,
        this.sessionStatusInterval * 1000
      );
    };
    this.sessionStatusIntervalId = window.setTimeout(
      poll,
      this.sessionStatusInterval * 1000
    );
  }

  stopSessionStatusPolling() {
    if (this.sessionStatusIntervalId) {
      clearTimeout(this.sessionStatusIntervalId);
      this.sessionStatusIntervalId = null;
    }
  }

  isPollingRunning(): boolean {
    return this.sessionStatusIntervalId !== null;
  }

  redirect(url: string) {
    window.location.href = url;
  }
}
