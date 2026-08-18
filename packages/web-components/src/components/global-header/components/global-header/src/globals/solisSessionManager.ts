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
  private tokenRefreshInterval: number;
  private idleTimeoutInterval: number;
  private isIdle: boolean;
  private idleTimeout: ReturnType<typeof setTimeout> | undefined;
  private basePath: string | undefined;
  private activityEvents: string[];
  private boundSetActive: () => void;
  private softLogoutUrl: string | undefined;
  private softLogoutCallback: (() => void) | undefined;
  config: solisSessionManagerConfig;

  constructor(config: solisSessionManagerConfig) {
    this.config = config;
    this.tokenRefreshInterval = config.tokenRefreshInterval || 25;
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
    this.softLogoutUrl = config.softLogoutUrl;
    this.softLogoutCallback = config.softLogoutCallback;
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
        await this.performSoftLogout();
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
    const isSessionActive = await this.checkSessionStatus();
    if (!isSessionActive) {
      await this.performSoftLogout();
    }
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

  async performSoftLogout() {
    this.stopRefreshSchedule();
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
        console.error('Solis session logout - session already expired');
      } else {
        console.error('Solis session logout failed:', response.status);
      }
    } catch (error: any) {
      console.error('Solis session logout error:', error.message);
    }
    if (this.softLogoutCallback) {
      try {
        await this.softLogoutCallback();
      } catch (error: any) {
        console.error('Soft logout failed with error: ', error.message);
      }
    }
    window.location.href =
      this.softLogoutUrl ??
      (this.basePath ? `${this.basePath}/logout` : '/logout');
  }
}
