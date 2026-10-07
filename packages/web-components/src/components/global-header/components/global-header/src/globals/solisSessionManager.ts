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
  private sessionStatusIntervalId: number | null = null;
  private isLoggingOut = false;
  private sessionStatusInterval: number;
  private idleTimeoutInterval: number;
  private isIdle: boolean;
  private idleTimeout: ReturnType<typeof setTimeout> | undefined;
  private basePath: string | undefined;
  private activityEvents: string[];
  private boundSetActive: () => void;
  private logoutCallback: (() => void) | undefined;
  private warningLeadTime: number;
  private onWarningCallback: (() => void) | undefined;
  private onWarningDismissedCallback: (() => void) | undefined;
  private warningTimeout: ReturnType<typeof setTimeout> | undefined;
  private isRefreshing = false;
  config: solisSessionManagerConfig;

  constructor(config: solisSessionManagerConfig) {
    this.config = config;
    this.sessionStatusInterval = config.sessionStatusInterval || 10;
    this.idleTimeoutInterval = config.idleTimeoutInterval || 28;
    this.basePath = config.basePath;
    this.activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ];
    this.isIdle = false;
    this.idleTimeout = undefined;
    this.boundSetActive = () => this.setActive();
    this.logoutCallback = config.logoutCallback;
    this.warningLeadTime = config.warningLeadTime || 5;
    this.onWarningCallback = config.onWarningCallback;
    this.onWarningDismissedCallback = config.onWarningDismissedCallback;
    this.warningTimeout = undefined;
  }

  async triggerRefresh() {
    this.isRefreshing = true;

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
        this.isRefreshing = false;
      } else if (response.status === 401 || response.status === 403) {
        console.error('Solis token refresh unauthorized - triggering logout');
        this.isRefreshing = false;
        await this.performLogout(true);
      } else {
        console.error('Solis token refresh failed:', response.status);
        this.isRefreshing = false;
      }
    } catch (error: any) {
      console.error('Solis token refresh error:', error.message);
      this.isRefreshing = false;
    }
  }

  registerActivityListeners() {
    this.activityEvents.forEach((eventType) => {
      window.addEventListener(eventType, this.boundSetActive, {
        passive: true,
        capture: true,
      });
    });
  }

  unregisterActivityListeners() {
    this.activityEvents.forEach((eventType) => {
      window.removeEventListener(eventType, this.boundSetActive, {
        capture: true,
      });
    });
  }

  setActive() {
    this.isIdle = false;
    this.cancelWarningTimer();
    this.onWarningDismissedCallback?.();
    clearTimeout(this.idleTimeout);
    this.startWarningTimer();
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
    if (
      typeof sessionResult === 'number' &&
      sessionResult <= 60 &&
      !this.isRefreshing
    ) {
      this.triggerRefresh();
    }
  }

  isTabIdle(): boolean {
    return this.isIdle;
  }

  // Returns the token's remaining TTL in seconds when the session is active,
  // true if the session is active but the endpoint did not include a TTL,
  // or false when it is inactive or the request fails.
  async checkSessionStatus(): Promise<number | boolean> {
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
        return ttl ?? true; // active but TTL not provided
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
      if (
        typeof sessionResult === 'number' &&
        sessionResult <= 60 &&
        !this.isRefreshing
      ) {
        this.triggerRefresh();
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

  startWarningTimer() {
    this.warningTimeout = setTimeout(
      () => this.onWarningCallback?.(),
      (this.idleTimeoutInterval - this.warningLeadTime) * 60 * 1000
    );
  }

  cancelWarningTimer() {
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = undefined;
    }
  }

  isWarningTimerRunning(): boolean {
    return this.warningTimeout !== undefined;
  }

  redirect(url: string) {
    window.location.href = url;
  }
}
