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
                basePath: 'some/basePath'
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
                onLogout: () => {console.log('logging out')}
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
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
                basePath: 'some/basePath'
            };

            const sessionManager = new IWHISessionManager(config);
            const sessionCookie = sessionManager.readCookieState();
            expect(sessionCookie).to.be.null; 
        })
    })

    describe('dismissWarning', () => {
        beforeEach(() => {
            const warningDialog = document.createElement('clabs-global-header-session-expiry-modal');
            document.body.appendChild(warningDialog); // create the warning dialog 
        })
        afterEach(() => {
            if (document.getElementsByTagName('clabs-global-header-session-expiry-modal').length > 0){
                document.getElementsByTagName('clabs-global-header-session-expiry-modal')[0].remove();
            }
        })
        it('does nothing if warningShown is false', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath'
            };

            const sessionManager = new IWHISessionManager(config);
            sessionManager.warningShown = false;
            expect(document.getElementsByTagName('clabs-global-header-session-expiry-modal').length).to.equal(1);
            sessionManager.dismissWarning();
            expect(sessionManager.warningShown).to.be.false;
            expect(document.getElementsByTagName('clabs-global-header-session-expiry-modal').length).to.equal(1); // warning dialog is not dismissed  
        })

        it('dismisses the warning dialog if warningShown is true', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath'
            };

            const sessionManager = new IWHISessionManager(config);
            sessionManager.warningShown = true;        
            expect(document.getElementsByTagName('clabs-global-header-session-expiry-modal').length).to.equal(1);
            sessionManager.dismissWarning();
            expect(sessionManager.warningShown).to.be.false;
            expect(document.getElementsByTagName('clabs-global-header-session-expiry-modal').length).to.equal(0); // warning dialog is not dismissed  
        })
    })

    describe('initializeCookieState', () => {
        it('initialises the cookie if the cookie does not already exist', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: ''
            };

            const sessionManager = new IWHISessionManager(config);
            sessionManager.initializeCookieState();

            const cookieState = sessionManager.readCookieState(); // cookie should have been set, so read the value
            expect(cookieState).to.not.be.null;
            expect(cookieState).to.have.property('sessionStart');
            expect(cookieState).to.have.property('lastActivity');
            expect(cookieState).to.have.property('lastTokenRefresh');
            expect(cookieState.leader).to.be.null;
            expect(cookieState.leaderLastSeen).to.equal(0);
            expect(cookieState.leaderCapability).to.be.null;
            expect(cookieState.logoutCommand).to.be.null;
            
            // Verify timestamps are recent (within 1 second)
            const now = Date.now();
            expect(cookieState.sessionStart).to.be.closeTo(now, 1000);
            expect(cookieState.lastActivity).to.be.closeTo(now, 1000);
            expect(cookieState.lastTokenRefresh).to.be.closeTo(now, 1000);
        })

        it('sets the logout cookie and does not repair the cookie if the logoutCommand is present in the cookie', () => {
            const cookieValue = { leader: 'tab123', leaderCapability: 'App Connect', logoutCommand: { reason: 'logging out' } }
            document.cookie = `iwhi_session_state=${encodeURIComponent(JSON.stringify(cookieValue))}; path=/`;
            
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');
            const writeCookieStateStub = sinon.stub(IWHISessionManager.prototype, 'writeCookieState');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: ''
            };

            const sessionManager = new IWHISessionManager(config);
            sessionManager.initializeCookieState();
     
            expect(sessionManager.sessionStartTime).to.not.be.null;
            expect(sessionManager.lastActivityTime).to.not.be.null;
            expect(sessionManager.lastTokenRefreshTime).to.not.be.null;
            expect(sessionManager.lastCookieState).to.not.be.null;
            expect(writeCookieStateStub).to.not.be.called;     
        })

        it('repairs a partial cookie', () => {
            const testCookieValue = { foo: 'bar' };
            document.cookie = `iwhi_session_state=${encodeURIComponent(JSON.stringify(testCookieValue))}; path=/`;

            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: ''
            };

            const sessionManager = new IWHISessionManager(config);
            sessionManager.initializeCookieState();

            const cookieState = sessionManager.readCookieState(); // cookie should have been set, so read the value
            expect(cookieState).to.not.be.null;
            expect(cookieState).to.have.property('sessionStart');
            expect(cookieState).to.have.property('lastActivity');
            expect(cookieState).to.have.property('lastTokenRefresh');
            expect(cookieState.leader).to.be.null;
            expect(cookieState.leaderLastSeen).to.equal(0);
            expect(cookieState.leaderCapability).to.be.null;
            expect(cookieState.logoutCommand).to.be.null;
            
            // Verify timestamps are recent (within 1 second)
            const now = Date.now();
            expect(cookieState.sessionStart).to.be.closeTo(now, 1000);
            expect(cookieState.lastActivity).to.be.closeTo(now, 1000);
            expect(cookieState.lastTokenRefresh).to.be.closeTo(now, 1000);
        })
    })

    describe('writeCookieState', () => {
        it('writes the current state to the correct cookie', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: ''
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            const expectedCookie = 'iwhi_session_state=%7B%22leader%22%3A%22tab123%22%2C%22leaderCapability%22%3A%22App%20Connect%22%7D';
            sessionManager.writeCookieState(state);
            const writtenCookie = document.cookie;
            expect(writtenCookie).to.equal(expectedCookie);
        })

        it('adds the secure flag to the cookie if cookieSecure is true in the provided config', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            // Capture what's written to document.cookie
            let capturedCookieString = '';
            const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
            const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!.set!;
            Object.defineProperty(document, 'cookie', {
                get: originalDescriptor.get,
                set: function(value) {
                    capturedCookieString = value;
                    originalCookieSetter.call(this, value);
                },
                configurable: true
            });

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                cookieSecure: true
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            sessionManager.writeCookieState(state);
            expect(capturedCookieString).to.include('; secure');
            expect(capturedCookieString).to.include('iwhi_session_state=');

            // Restore the original property descriptor
            Object.defineProperty(document, 'cookie', originalDescriptor);
        })

        it('does not add the secure flag to the cookie if cookieSecure is false in the provided config', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            // Capture what's written to document.cookie
            let capturedCookieString = '';
            const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
            const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!.set!;
            Object.defineProperty(document, 'cookie', {
                get: originalDescriptor.get,
                set: function(value) {
                    capturedCookieString = value;
                    originalCookieSetter.call(this, value);
                },
                configurable: true
            });

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                cookieSecure: false
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            sessionManager.writeCookieState(state);
            expect(capturedCookieString).to.not.include('; secure');
            expect(capturedCookieString).to.include('iwhi_session_state=');

            // Restore the original property descriptor
            Object.defineProperty(document, 'cookie', originalDescriptor);
        })

        it('adds the samesite flag to the cookie if cookieSameSite is in the provided config', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            // Capture what's written to document.cookie
            let capturedCookieString = '';
            const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
            const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!.set!;
            Object.defineProperty(document, 'cookie', {
                get: originalDescriptor.get,
                set: function(value) {
                    capturedCookieString = value;
                    originalCookieSetter.call(this, value);
                },
                configurable: true
            });

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '',
                cookieSameSite: 'foo'
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            sessionManager.writeCookieState(state);
            expect(capturedCookieString).to.include('; samesite=foo');
            expect(capturedCookieString).to.include('iwhi_session_state=');

            // Restore the original property descriptor
            Object.defineProperty(document, 'cookie', originalDescriptor);
        })

        it('adds the domain to the cookie if cookieDomain is in the provided config', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            // Capture what's written to document.cookie
            let capturedCookieString = '';
            const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
            const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!.set!;
            Object.defineProperty(document, 'cookie', {
                get: originalDescriptor.get,
                set: function(value) {
                    capturedCookieString = value;
                    originalCookieSetter.call(this, value);
                },
                configurable: true
            });

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath',
                cookieDomain: '.ibm.com'
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            sessionManager.writeCookieState(state);
            expect(capturedCookieString).to.include('; domain=.ibm.com');
            expect(capturedCookieString).to.include('iwhi_session_state=');

            // Restore the original property descriptor
            Object.defineProperty(document, 'cookie', originalDescriptor);
        })

        it('adds the maxAge to the cookie if it is passed to the function', () => {
            // Stub init to prevent beforeunload listener and other side effects
            sinon.stub(IWHISessionManager.prototype, 'init');

            // Capture what's written to document.cookie
            let capturedCookieString = '';
            const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
            const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!.set!;
            Object.defineProperty(document, 'cookie', {
                get: originalDescriptor.get,
                set: function(value) {
                    capturedCookieString = value;
                    originalCookieSetter.call(this, value);
                },
                configurable: true
            });

            const config = {
                capabilityName: 'App Connect',
                basePath: 'some/basePath'
            };

            const sessionManager = new IWHISessionManager(config);
            const state = {
                leader: 'tab123',
                leaderCapability: 'App Connect'
            }
            sessionManager.writeCookieState(state, '40');
            expect(capturedCookieString).to.include('; max-age=40');
            expect(capturedCookieString).to.include('iwhi_session_state=');

            // Restore the original property descriptor
            Object.defineProperty(document, 'cookie', originalDescriptor);
        })
    })
})