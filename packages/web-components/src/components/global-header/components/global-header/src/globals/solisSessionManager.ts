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
  } // TODO - call this function when implementing the logout story

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
        this.stopRefreshSchedule();
        // TODO - trigger logout when logout story is implemented
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
      () => this.setIdle,
      this.idleTimeoutInterval * 60 * 1000
    );
  }

  setIdle() {
    this.isIdle = true;
    // check session status incase another tab is still active, before triggering soft logout
  }

  isTabIdle(): boolean {
    return this.isIdle;
  }
}
