/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from '@open-wc/testing';
import IWHISessionManager from '../solisSessionManager';

describe('solisSessionManager', () => {
    let originalURLSearchParams: typeof URLSearchParams;
    
    beforeEach(() => {
        originalURLSearchParams = window.URLSearchParams;
    });
    
    afterEach(() => {
        window.URLSearchParams = originalURLSearchParams;
    });
    
    it('should set the config and state properties with default values when a new solisSessionManager is instatiated', () => {
        const config = {
            capabilityName: 'App Connect'
        };
        const sessionManager = new IWHISessionManager(config);
        expect(sessionManager.config.capabilityName).to.equal('App Connect');
        expect(sessionManager.config.idleTimeout).to.equal(30 * 60 * 1000);
        expect(sessionManager.isLeader).to.equal(false);
        expect(sessionManager.capability).to.equal('App Connect');
    })

    it('should set the config and state properties when a new solisSessionManager is instatiated with provided config', () => {
        const config = {
            capabilityName: 'App Connect',
            idleTimeout: 1,
            tokenRefreshInterval: 1,
            maxSessionDuration: 5,
            warningTime: 1, 
            cookieName: 'foo', 
            cookieDomain: 'test.ibm.com',
            cookieSecure: false,
            cookieSameSite: 'lax',
            cookiePollInterval: 5,
            leaderHeartbeatInterval: 5,
            leaderStaleTimeout: 5,
            logoutCookieExpiry: 5,
            tokenRefreshEndpoint: '/some/endpoint',
            preferVisibleLeader: true,
            debug: true,
            showWarningDialog: false,
            warningMessage: 'this is a warning',
            onWarning: () => {console.log('warning message')},
            onLogout: () => { console.log('logout message')}
        };
        const sessionManager = new IWHISessionManager(config);
        expect(sessionManager.config.capabilityName).to.equal('App Connect');
        expect(sessionManager.config.idleTimeout).to.equal(1);
        expect(sessionManager.config.tokenRefreshInterval).to.equal(1);
        expect(sessionManager.config.leaderStaleTimeout).to.equal(5);
    })

    it('should set the config and state properties when a new solisSessionManager is instantiated with URL search parameters', () => {
        // Mock URLSearchParams to return test values
        const MockURLSearchParams = class {
            private params: Map<string, string>;
            
            constructor() {
                this.params = new Map();
                this.params.set('idleTimeout', '3');
                this.params.set('refreshInterval', '5');
            }
            
            get(key: string): string | null {
                return this.params.get(key) || null;
            }
        };
        
        // Replace the global URLSearchParams
        (window as any).URLSearchParams = MockURLSearchParams;
        
        const config = {
            capabilityName: 'App Connect'
        };
        const sessionManager = new IWHISessionManager(config);
        expect(sessionManager.config.idleTimeout).to.equal(3 * 60 * 1000); // 3 minutes in milliseconds
        expect(sessionManager.config.tokenRefreshInterval).to.equal(5 * 60 * 1000); // 5 minutes in milliseconds
    })
})