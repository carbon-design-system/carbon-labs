/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */
import { solisSessionManagerConfig } from '../types/Header.types'

export default class solisSessionManager {
    private refreshIntervalId: number | null = null;
    private tokenRefreshInterval: number;
    config: solisSessionManagerConfig;

    constructor(config: solisSessionManagerConfig) {
        this.config = config;
        this.tokenRefreshInterval = config.tokenRefreshInterval || 25;
    }

    startRefreshSchedule() {
        this.refreshIntervalId = window.setInterval(() => {
            this.triggerRefresh();
        }, this.tokenRefreshInterval * 60 * 1000);
    }

    stopRefreshSchedule() {
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    } // TODO - remember to call this function when implementing the logout story

    async triggerRefresh() {
        try {
            const response = await fetch('/v1/solis/session/refresh-token', {
                method: 'GET',
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                console.log('Solis token refresh successful');
            } else if (response.status === 429) { // refresh happened too recently 
                console.log('Solis token refresh skipped (too recent)'); // TODO - this response doesn't yet exist in the backend 
            } else if (response.status === 401 || response.status === 403) {
                console.error('Solis token refresh unauthorized - triggering logout');
                // TODO - trigger logout when logout story is implemented
            } else {
                console.error('Solis token refresh failed:', response.status)
            }
        } catch (error) {
            console.error('Solis token refresh error:', error);
        }
    }

}