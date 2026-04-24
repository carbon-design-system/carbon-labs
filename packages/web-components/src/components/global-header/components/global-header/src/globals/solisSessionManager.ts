/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */
import { sessionManagerConfig } from '../types/Header.types'

class IWHISessionManager {
    config: sessionManagerConfig;
    constructor(config: sessionManagerConfig) {
        // Parse URL parameters
        // Only used for testing, won't be present in production
        const urlParams = new URLSearchParams(window.location.search);
        const urlIdleTimeout = urlParams.get('idleTimeout'); // unit is minutes
        const urlRefreshInterval = urlParams.get('refreshInterval'); // unit is minutes

        // Configuration
        this.config = {
            idleTimeout: urlIdleTimeout ? parseInt(urlIdleTimeout) * 60 * 1000 : (config.idleTimeout || 30 * 60 * 1000),
            tokenRefreshInterval: urlRefreshInterval ? parseInt(urlRefreshInterval) * 60 * 1000 : (config.tokenRefreshInterval || 32 * 60 * 1000),
            maxSessionDuration: config.maxSessionDuration || 8 * 60 * 60 * 1000, // default is 8 hours
            warningTime: config.warningTime || 5 * 60 * 1000, // default is 5 minutes
            
            // Cookie settings
            cookieName: config.cookieName || 'iwhi_session_state',
            cookieDomain: config.cookieDomain || '.ipaas.automation.ibm.com',
            cookieSecure: config.cookieSecure !== false && (window.location.protocol === 'https:' || window.location.hostname === 'localhost'),
            cookieSameSite: config.cookieSameSite || 'lax',
            cookiePollInterval: config.cookiePollInterval || 2000, // Poll cookie every 2 seconds
            leaderHeartbeatInterval: config.leaderHeartbeatInterval || 2000, // Leader updates cookie every 2 seconds
            leaderStaleTimeout: config.leaderStaleTimeout || 6000, // Leader is stale after 6 seconds (3x heartbeat)
            logoutCookieExpiry: config.logoutCookieExpiry || 6, // Cookie expires 6 seconds after logout (3 polling cycles)
            
            // Endpoints
            tokenRefreshEndpoint: config.tokenRefreshEndpoint || '/api/refresh-token',
            
            // Preferences
            preferVisibleLeader: config.preferVisibleLeader !== false, // Prefer visible tabs as leaders
            
            debug: config.debug || false,
            showWarningDialog: config.showWarningDialog !== false,
            warningMessage: config.warningMessage || 'Your session will expire in {time} due to inactivity. Do you want to continue?',
            onWarning: config.onWarning,
            onLogout: config.onLogout
        };
    }
}

// Auto-initialize
if (typeof window.IWHI_SESSION_CONFIG !== 'undefined') {
  window.iwhi_session_manager = new IWHISessionManager(window.IWHI_SESSION_CONFIG)
}