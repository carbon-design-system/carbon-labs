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

export default class IWHISessionManager {
    config: sessionManagerConfig;
    tabId: string;
    capability: string;
    isLeader: boolean;
    lastCookieState: {
        sessionStart?: number,
        lastActivity?: number,
        lastTokenRefresh?: number,
        leaderLastSeen?: number,
        leader?: string,
        leaderCapability?: string,
        logoutCommand?: {
            timestamp?: number,
            reason?: string
        }
    } | null;
    sessionStartTime: number;
    lastActivityTime: number;
    lastActivityUpdate: number | null;
    lastTokenRefreshTime: number;
    timers: {
        cookiePolling?: ReturnType<typeof setTimeout>;
        leaderHeartbeat?: ReturnType<typeof setTimeout>;
        tokenRefresh?: ReturnType<typeof setTimeout>;
    };
    warningShown: boolean;
    isLoggedOut: boolean;
    activityEvents: string[];
    constructor(config: sessionManagerConfig) {
        // Parse URL parameters
        // Only used for testing, won't be present in production
        const urlParams = new URLSearchParams(window.location.search);
        const urlIdleTimeout = urlParams.get('idleTimeout'); // unit is minutes
        const urlRefreshInterval = urlParams.get('refreshInterval'); // unit is minutes

        // Configuration
        this.config = {
            capabilityName: config.capabilityName, // Must be passed in by the header
            basePath: config.basePath, // Must be passed in by the header for use in log out function
            idleTimeout: urlIdleTimeout ? parseInt(urlIdleTimeout) * 60 * 1000 : (config.idleTimeout || 30 * 60 * 1000),
            tokenRefreshInterval: urlRefreshInterval ? parseInt(urlRefreshInterval) * 60 * 1000 : (config.tokenRefreshInterval || 32 * 60 * 1000),
            maxSessionDuration: config.maxSessionDuration || 8 * 60 * 60 * 1000, // default is 8 hours
            warningTime: config.warningTime || 5 * 60 * 1000, // default is 5 minutes
            
            // Cookie settings
            cookieName: config.cookieName || 'iwhi_session_state',
            cookieDomain: config.cookieDomain !== undefined ? config.cookieDomain : '.ipaas.automation.ibm.com',
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

        // State
        this.tabId = this.generateTabId();
        this.capability = this.config.capabilityName;
        this.isLeader = false;
        this.lastCookieState = null;
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.lastActivityUpdate = null;
        this.lastTokenRefreshTime = Date.now();
        this.timers = {};
        this.warningShown = false;
        this.isLoggedOut = false;

        // Activity events
        this.activityEvents = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 
            'touchstart', 'click', 'focus'
        ];

        // Initialize
        this.init();
    }

    generateTabId() {
        return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    init() {
        this.log('Initializing cookie-based session manager'); 
        this.log('Capability:', this.capability);
        this.log('Tab ID:', this.tabId);
        
        // Check if logout is in progress BEFORE initializing cookie state
        const existingState = this.readCookieState();
        if (existingState?.logoutCommand) {
            this.log('Logout command found, performing logout immediately');
            this.performLogout(existingState.logoutCommand.reason);
            return; // Don't start normal operations
        }
        
        // CRITICAL: If no cookie exists, check if logout happened recently
        // This prevents pages that load AFTER logout cookie expires from creating new cookie
        if (!existingState) {
            const lastLogoutCheck = sessionStorage.getItem('iwhi_last_logout_check'); // session storage is page session for a particular tab
            if (lastLogoutCheck) {
                const timeSinceLogout = Date.now() - parseInt(lastLogoutCheck);
                if (timeSinceLogout < 10000) { // Within 10 seconds of logout
                    this.log('Recent logout detected during init, refusing to start session');
                    this.isLoggedOut = true;
                    this.performLogout('recent_logout_detected_on_init');
                    return; // Don't start normal operations
                }
            }
        }
    
        // Initialize cookie state (now safe to clear stale data)
        this.initializeCookieState();
        
        // // Register activity listeners AFTER cookie initialization
        // // This prevents race condition where activity creates partial cookie
        this.registerActivityListeners();
        
        // // Start cookie polling
        this.startCookiePolling();
        
        // // Attempt leader election
        // this.electLeader();
        
        // // Start monitoring
        // this.startMonitoring();
        
        // // Handle visibility changes
        // this.handleVisibilityChange();
        
        // // Cleanup on unload
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    readCookieState() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === this.config.cookieName) {
                try {
                    return JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    console.error('Error parsing cookie:', e);
                    return null;
                }
            }
        }
        return null;
    }

    async performLogout(reason) {
        this.dismissWarning();
        this.log(`Performing logout: reason=${reason}, tabId=${this.tabId}`);
        
        // Store logout timestamp to prevent race condition with slow-loading tabs
        try {
            sessionStorage.setItem('iwhi_last_logout_check', Date.now().toString());
        } catch (e) {
            this.log('Failed to set sessionStorage logout flag:', e);
        }
        
        // Immediately redirect - no dialog, no delay
        // Call user-provided logout callback or redirect to login
        if (this.config.onLogout) {
            this.config.onLogout(reason);
        /* c8 ignore next 4 */
        } else {
            // Default: redirect to login page immediately
            window.location.href = this.config.basePath + reason; // Ignoring from test coverage as not possible to redefine location property
        }
    }

    dismissWarning() {
        if (!this.warningShown) return;

        const warningDialog = document.getElementsByTagName('clabs-global-header-session-expiry-modal')[0] // probably only one on the page
    
        this.warningShown = false;
        
        if (warningDialog) {
            warningDialog.remove(); // Remove warning dialog element from parent node
        }
    }

    initializeCookieState() {
        let state = this.readCookieState();

        if (!state) {
            // First tab to be opened - initialize cookie
            state = {
                sessionStart: Date.now(),
                lastActivity: Date.now(),
                lastTokenRefresh: Date.now(),
                leader: null,
                leaderLastSeen: 0,
                leaderCapability: null,
                logoutCommand: null
            };
            this.writeCookieState(state);
            this.log('Initialized Solis session manager cookie state');
        } else {
            // CRITICAL: If logout command is present, DO NOT repair the cookie
            // logoutCommand is present in cookie if triggerLogout has been called
            // The logout cookie is intentionally minimal and should not be "fixed"
            if (state.logoutCommand) {
                this.log('Logout command present - skipping Solis session manager cookie repair');
                // Don't repair, don't write, just sync local state
                this.sessionStartTime = state.sessionStart || Date.now();
                this.lastActivityTime = state.lastActivity || Date.now();
                this.lastTokenRefreshTime = state.lastTokenRefresh || Date.now();
                this.lastCookieState = state;
                return;
            }
            // Validate and repair partial cookie (defense against race conditions)
            let needsRepair = false;
            const now = Date.now();
            
            if (!state.sessionStart) {
                state.sessionStart = now;
                needsRepair = true;
                this.log('Repaired missing sessionStart');
            }
            if (!state.lastActivity) {
                state.lastActivity = now;
                needsRepair = true;
                this.log('Repaired missing lastActivity');
            }
            if (!state.lastTokenRefresh) {
                state.lastTokenRefresh = now;
                needsRepair = true;
                this.log('Repaired missing lastTokenRefresh');
            }
            if (!state.leader) {
                state.leader = null;
                needsRepair = true;
            }
            if (state.leaderLastSeen === undefined) {
                state.leaderLastSeen = 0;
                needsRepair = true;
            }
            if (state.leaderCapability === undefined) {
                state.leaderCapability = null;
                needsRepair = true;
            }
            if (state.logoutCommand === undefined) {
                state.logoutCommand = null;
                needsRepair = true;
            }
            
            if (needsRepair) {
                this.writeCookieState(state);
                this.log('Repaired partial Solis session manager cookie state');
            }
        }
    }

    /**
        * Write cookie state
        * @param {Object} state - Solis session manager cookie state object
        * @param {number} [maxAge] - Optional max-age in seconds (for logout coordination)
    */
    writeCookieState(state, maxAge?: string) {
        const value = encodeURIComponent(JSON.stringify(state));
        const secureFlag = this.config.cookieSecure ? '; secure' : '';
        const sameSiteFlag = `; samesite=${this.config.cookieSameSite}`;
        
        // For file:// protocol, don't set domain attribute (cookies won't work with domain on file://)
        const isFileProtocol = window.location.protocol === 'file:';
        const domainFlag = !isFileProtocol && this.config.cookieDomain ? `; domain=${this.config.cookieDomain}` : '';
        
        // If maxAge is provided, set it (for logout coordination with time-based expiry)
        // Otherwise, create session cookie (deleted when browser closes)
        const maxAgeFlag = maxAge !== undefined ? `; max-age=${maxAge}` : '';
        
        document.cookie = `${this.config.cookieName}=${value}${domainFlag}; path=/${secureFlag}${sameSiteFlag}${maxAgeFlag}`;
        this.lastCookieState = state;
        
        /* c8 ignore next 5 */
        if (this.config.debug) { // Ignoring the debug logging from test coverage 
            const expiryType = maxAge !== undefined ? `max-age=${maxAge}s` : 'session';
            this.log(`Cookie written (${expiryType}): ${this.config.cookieName}=${value.substring(0, 50)}...`);
            this.log(`Cookie flags: domain=${domainFlag || 'none'}, secure=${this.config.cookieSecure}, samesite=${this.config.cookieSameSite}, expires=${expiryType}`);
        }
    }

    registerActivityListeners() {
        this.activityEvents.forEach(eventType => {
            document.addEventListener(eventType, () => this.recordActivity(), { 
                passive: true,
                capture: true 
            });
        });
    }

    recordActivity() {
        // Ignore activity after logout
        if (this.isLoggedOut) {
            return;
        }
        
        const now = Date.now();
        this.lastActivityTime = now;
        
        // Don't auto-dismiss warning on activity
        // User must explicitly click "Continue Session" button
        // This allows user to interact with the warning dialog
        
        // Update cookie (throttled)
        // Only update if cookie is initialized (has sessionStart)
        if (!this.lastActivityUpdate || now - this.lastActivityUpdate > 2000) {
            const state = this.readCookieState();
            if (state && state.sessionStart) {
                this.updateCookieState({
                    lastActivity: now
                });
                this.lastActivityUpdate = now;
            }
        }
    }

    /**
        * Update cookie state
        * @param {Object} updates - new property values to be written to the Solis session manager cookie state object
    */
    updateCookieState(updates) {
        const state = this.readCookieState();

        // Only update if cookie already exists (was initialized)
        // This prevents accidental cookie creation from focus events after logout
        if (!state) {
            if (this.config.debug) {
                this.log('Cookie not initialized, skipping update');
            }
            return;
        }
        
        // CRITICAL: Never overwrite a logout cookie
        // If logout command is present, abort the update to preserve logout state
        if (state.logoutCommand) {
            this.log('Logout command present - refusing to update cookie');
            // Mark this tab as logged out if not already
            if (!this.isLoggedOut) {
                this.isLoggedOut = true;
                this.cleanup();
                this.performLogout(state.logoutCommand.reason);
            }
            return;
        }
        
        const newState = { ...state, ...updates };
        this.writeCookieState(newState);
    }

    startCookiePolling() {
        this.timers.cookiePolling = setInterval(() => {
            // Don't poll after logout
            if (this.isLoggedOut) {
                return;
            }
        
            const state = this.readCookieState();
        
            // CRITICAL: If cookie disappears unexpectedly, trigger logout
            if (!state && this.lastCookieState) {
                // Cookie existed before but is now gone
                // This happens when:
                // 1. Logout cookie expired (after 6 seconds)
                // 2. Cookie was manually deleted
                // 3. Browser cleared cookies
                
                // Check sessionStorage for recent logout to determine reason
                const lastLogoutCheck = sessionStorage.getItem('iwhi_last_logout_check');
                let reason = 'cookie_disappeared';
                
                if (lastLogoutCheck) {
                    const timeSinceLogout = Date.now() - parseInt(lastLogoutCheck);
                    if (timeSinceLogout < 10000) { // Within 10 seconds
                        reason = 'cookie_disappeared_after_logout';
                    }
                }
                
                // ALWAYS trigger logout when cookie disappears
                // Don't leave tabs running without a session cookie
                this.log('Cookie disappeared, performing logout');
                this.isLoggedOut = true;
                this.cleanup();
                this.performLogout(reason);
                return;
            }
        
            if (!state) return;
        
            // Check if state changed
            if (JSON.stringify(state) !== JSON.stringify(this.lastCookieState)) {
                this.handleCookieStateChange(state);
                this.lastCookieState = state;
            }
        
            // Check if leader is stale or missing (but NOT during logout)
            const now = Date.now();
            if (state.leader !== this.tabId && !state.logoutCommand) {
                // Leader is either null (no leader) or another tab
                if (!state.leader || now - state.leaderLastSeen > (this.config.leaderStaleTimeout ?? 6000)) {
                    this.log('Leader is stale or missing, attempting election');
                    this.electLeader();
                }
            }
        }, this.config.cookiePollInterval);
    }

    /**
        * Write cookie state
        * @param {Object} newState - the new Solis session manager cookie state object
    */
    handleCookieStateChange(newState) {
        this.log('Cookie state changed:', newState);
    
        // Check for logout command FIRST - highest priority
        if (newState.logoutCommand &&
            (!this.lastCookieState?.logoutCommand ||
            newState.logoutCommand.timestamp !== this.lastCookieState.logoutCommand.timestamp)) {
            this.log('Logout command received from cookie');
            
            // Mark as logged out to prevent further activity
            this.isLoggedOut = true;
            
            // Stop all timers
            this.cleanup();
            
            // Perform logout (redirect)
            this.performLogout(newState.logoutCommand.reason);
            return; // Don't process any other state changes
        }
            
        // Don't process other state changes after logout
        if (this.isLoggedOut) {
            return;
        }
        
        // Update local state
        if (newState.lastActivity > this.lastActivityTime) {
            this.lastActivityTime = newState.lastActivity;
            // Don't auto-dismiss warning when activity is detected
            // User must explicitly click "Continue Session" button
            // This allows user to interact with the warning dialog
        }
        
        if (newState.lastTokenRefresh > this.lastTokenRefreshTime) {
            this.lastTokenRefreshTime = newState.lastTokenRefresh;
            this.log('Token was refreshed by another tab');
        }
        
        if (newState.sessionStart) {
            this.sessionStartTime = newState.sessionStart;
        }
        
        // Check leader status
        if (newState.leader !== this.tabId && this.isLeader) {
            this.log('Another tab claimed leadership');
            this.resignLeadership();
        }
    }

    electLeader() {
        console.log('hello for now');
    }

    resignLeadership() {
        this.log('Resigning leadership');
        this.isLeader = false;
        this.stopLeaderHeartbeat();
        this.stopTokenRefreshTimer();
    }

    stopLeaderHeartbeat() {
        if (this.timers.leaderHeartbeat) {
            clearInterval(this.timers.leaderHeartbeat);
            delete this.timers.leaderHeartbeat;
        }
    }

    stopTokenRefreshTimer() {
        if (this.timers.tokenRefresh) {
            clearInterval(this.timers.tokenRefresh);
            delete this.timers.tokenRefresh;
        }
    }

    cleanup() {
        this.log('Solis session manager clean up');
    
        this.dismissWarning();
        
        // Clear leader flag first
        this.isLeader = false;
        
        // Stop all timers
        Object.values(this.timers).forEach(timer => clearInterval(timer));
        this.timers = {};
        
        // Don't update cookie during cleanup - it may be a logout cookie
        // or may not exist at all. Let the logout flow handle cookie state.
    }
    
    log(...args) {
        if (this.config.debug) {
            console.log(`[IWHI Session Manager - ${this.capability} - ${this.tabId}]`, ...args);
        }
    }
}

// Auto-initialize
if (typeof window.IWHI_SESSION_CONFIG !== 'undefined' && 
    (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
  window.iwhi_session_manager = new IWHISessionManager(window.IWHI_SESSION_CONFIG)
}