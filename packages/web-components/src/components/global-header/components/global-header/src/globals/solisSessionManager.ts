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
  private tokenRefreshInterval: number;
  private sessionStatusInterval: number;
  private idleTimeoutInterval: number;
  private isIdle: boolean;
  private idleTimeout: ReturnType<typeof setTimeout> | undefined;
  private basePath: string | undefined;
  private activityEvents: string[];
  private boundSetActive: () => void;
  private logoutUrl: string | undefined;
  private logoutCallback: (() => void) | undefined;
  private warningLeadTime: number;
  private onWarningCallback: (() => void) | undefined;
  private onWarningDismissedCallback: (() => void) | undefined;
  private warningTimeout: ReturnType<typeof setTimeout> | undefined;
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
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ];
    this.isIdle = false;
    this.idleTimeout = undefined;
    this.boundSetActive = () => this.setActive();
    this.logoutUrl = config.logoutUrl;
    this.logoutCallback = config.logoutCallback;
    this.warningLeadTime = config.warningLeadTime || 5;
    this.onWarningCallback = config.onWarningCallback;
    this.onWarningDismissedCallback = config.onWarningDismissedCallback;
    this.warningTimeout = undefined;
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

  async triggerRefresh() {
    const fetchRoute = this.basePath
      ? this.basePath + '/v1/solis/session/refresh-token'
      : '/v1/solis/session/refresh-token';
    try {
      const response = await fetch(fetchRoute, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        console.log('Solis token refresh successful');
      } else if (response.status === 429) {
        // refresh happened too recently
        console.log('Solis token refresh skipped (too recent)'); // TODO - this response doesn't yet exist in the backend
      } else if (response.status === 401 || response.status === 403) {
        console.error('Solis token refresh unauthorized - triggering logout');
        await this.performLogout();
      } else {
        console.error('Solis token refresh failed:', response.status);
      }
    } catch (error: any) {
      console.error('Solis token refresh error:', error.message);
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
    const isSessionActive = await this.checkSessionStatus();
    if (!isSessionActive) {
      await this.performLogout(); // no other tabs keeping the session alive, safe to log out
      return;
    }
    // another tab is keeping the session alive, so cancel current warning timer and restart idle monitoring
    this.cancelWarningTimer();
    this.onWarningDismissedCallback?.();
    this.setActive();
  }

  isTabIdle(): boolean {
    return this.isIdle;
  }

  async checkSessionStatus() {
    const fetchRoute = this.basePath
      ? this.basePath + '/v1/solis/session/session-status'
      : '/v1/solis/session/session-status';
    try {
      const response = await fetch(fetchRoute, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        console.log('Solis session is active');
        return true;
      } else {
        console.warn('Solis session is inactive');
        return false;
      }
    } catch (error: any) {
      console.error('Solis session status unknown:', error.message);
      return false;
    }
  }

  async performLogout() {
    if (this.isLoggingOut) {
      return;
    }
    this.isLoggingOut = true;
    this.stopRefreshSchedule();
    this.stopSessionStatusPolling();
    this.unregisterActivityListeners();
    const postRoute = this.basePath
      ? this.basePath + '/v1/solis/session/logout'
      : '/v1/solis/session/logout';
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
    if (this.logoutCallback) {
      try {
        await this.logoutCallback();
      } catch (error: any) {
        console.error('Logout failed with error: ', error.message);
      }
    }
    this.redirect(
      this.logoutUrl ?? (this.basePath ? `${this.basePath}/logout` : '/logout')
    );
  }

  startSessionStatusPolling() {
    const poll = async () => {
      const sessionActive = await this.checkSessionStatus();
      if (!sessionActive) {
        await this.performLogout();
        return; // don't reschedule after logout
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
