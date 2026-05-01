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
import sinon from 'sinon';

describe('solisSessionManager', () => {

    beforeEach(() => {
        sessionStorage.clear();
        // Clear ALL cookies
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    })

    afterEach(() => {
        sessionStorage.clear();
        // Clear ALL cookies
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        sinon.restore();
    })

    describe('constructor', () => {
        let originalURLSearchParams: typeof URLSearchParams;
    
        beforeEach(() => {
            originalURLSearchParams = window.URLSearchParams;
        });
        
        afterEach(() => {
            window.URLSearchParams = originalURLSearchParams;
        });
        
        it('should set the config and state properties with default values when a new solisSessionManager is instatiated', () => {
            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
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
                basePath: 'some/basePath',
                idleTimeout: 1,
                tokenRefreshInterval: 1,
                maxSessionDuration: 5,
                warningTime: 1,
                cookieName: 'foo',
                cookieDomain: '',
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
                onLogout: () => {} // Prevent redirect
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
                capabilityName: 'App Connect',
                basePath: 'some/basePath'
            };
            const sessionManager = new IWHISessionManager(config);
            expect(sessionManager.config.idleTimeout).to.equal(3 * 60 * 1000); // 3 minutes in milliseconds
            expect(sessionManager.config.tokenRefreshInterval).to.equal(5 * 60 * 1000); // 5 minutes in milliseconds
        })
    })

    describe('init', () => {
        it('calls performLogout if logoutCommand is present in the cookie', () => {
            const cookieValue = { leader: 'tab123', leaderCapability: 'App Connect', logoutCommand: { reason: 'logging out' } }
            document.cookie = `iwhi_session_state=${encodeURIComponent(JSON.stringify(cookieValue))}; path=/`;
            
            // Stub init to prevent beforeunload listener and other side effects
            const initStub = sinon.stub(IWHISessionManager.prototype, 'init');
            const performLogoutStub = sinon.stub(IWHISessionManager.prototype, 'performLogout');
            const initializeCookieStateStub = sinon.stub(IWHISessionManager.prototype, 'initializeCookieState');
            
            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };
            
            const sessionManager = new IWHISessionManager(config);
            
            // Restore init and call it manually to test the logic
            initStub.restore();
            sessionManager.init();
            
            expect(performLogoutStub).to.have.been.calledOnce;
            expect(performLogoutStub).to.have.been.calledWith('logging out');
            expect(initializeCookieStateStub).to.not.have.been.called;
        })
        
        it('calls performLogout if there is no existing cookie and there is a logout timestamp in the session storage', () => {
            sessionStorage.setItem('iwhi_last_logout_check', Date.now().toString());
            
            // Stub init to prevent beforeunload listener and other side effects
            const initStub = sinon.stub(IWHISessionManager.prototype, 'init');
            const performLogoutStub = sinon.stub(IWHISessionManager.prototype, 'performLogout');
            const initializeCookieStateStub = sinon.stub(IWHISessionManager.prototype, 'initializeCookieState');
            
            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };
            
            const sessionManager = new IWHISessionManager(config);
            
            // Restore init and call it manually to test the logic
            initStub.restore();
            sessionManager.init();
            
            expect(performLogoutStub).to.have.been.calledOnce;
            expect(performLogoutStub).to.have.been.calledWith('recent_logout_detected_on_init');
            expect(initializeCookieStateStub).to.not.have.been.called;
        })
        
        it('does not call performLogout if there is no existing cookie and there is no logout timestamp in the session storage', () => {
            // Stub init to prevent beforeunload listener and other side effects
            const initStub = sinon.stub(IWHISessionManager.prototype, 'init');
            const performLogoutStub = sinon.stub(IWHISessionManager.prototype, 'performLogout');
            const initializeCookieStateStub = sinon.stub(IWHISessionManager.prototype, 'initializeCookieState');
            
            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };
            
            const sessionManager = new IWHISessionManager(config);
            
            // Restore init and call it manually to test the logic
            initStub.restore();
            sessionManager.init();
            
            expect(performLogoutStub).to.not.have.been.called;
            expect(initializeCookieStateStub).to.have.been.calledOnce;
        })
        
        it('calls initializeCookieState if there is an existing cookie that does not contain a logoutCommand', () => {
            const cookieValue = { leader: 'tab123', leaderCapability: 'App Connect' }
            document.cookie = `iwhi_session_state=${encodeURIComponent(JSON.stringify(cookieValue))}; path=/`;
            
            // Stub init to prevent beforeunload listener and other side effects
            const initStub = sinon.stub(IWHISessionManager.prototype, 'init');
            const initializeCookieStateStub = sinon.stub(IWHISessionManager.prototype, 'initializeCookieState');
            const addEventListenerStub = sinon.stub(window, 'addEventListener');
            
            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };
            
            const sessionManager = new IWHISessionManager(config);
            
            // Restore init and call it manually to test the logic
            initStub.restore();
            sessionManager.init();
            
            expect(initializeCookieStateStub).to.have.been.calledOnce;
            expect(addEventListenerStub).to.have.been.calledOnce;
        })
    })

    describe('readCookieState', () => {
        it('returns the correct value of the cookie named in the config', () => {
            const cookieValue = { leader: 'tab123', leaderCapability: 'App Connect'};
            document.cookie = `iwhi_session_state=${encodeURIComponent(JSON.stringify(cookieValue))}; path=/`;

            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };

            const sessionManager = new IWHISessionManager(config);
            const sessionCookie = sessionManager.readCookieState();
            expect(sessionCookie).to.deep.equal(cookieValue);
        })

        it('returns null if there is an error when decoding the cookie value', () => {
            document.cookie = `iwhi_session_state=%E0%A4%A; path=/`;

            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };

            const sessionManager = new IWHISessionManager(config);
            const sessionCookie = sessionManager.readCookieState();
            expect(sessionCookie).to.be.null;            
        })

        it('returns null if the cookie named in the config is not found', () => {
            document.cookie = `chocolate_chip=%E0%A4%A; path=/`;

            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                onLogout: () => {} // Prevent redirect
            };

            const sessionManager = new IWHISessionManager(config);
            const sessionCookie = sessionManager.readCookieState();
            expect(sessionCookie).to.be.null; 
        })
    })
})