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
                capabilityKey: 'test-key',
                basePath: 'some/basePath',
                solisLogoutEndpoint: '/v1/logout'
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
                capabilityKey: 'test-key',
                basePath: 'some/basePath',
                solisLogoutEndpoint: '/v1/logout',
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
                /**
                 * Warning callback
                 */
                onWarning: () => {console.log('warning message')},
                /**
                 * Logout callback
                 */
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

                /**
                 * Constructor for mock URLSearchParams
                 */
                constructor() {
                    this.params = new Map();
                    this.params.set('idleTimeout', '3');
                    this.params.set('refreshInterval', '5');
                }

                /**
                 * Get parameter value by key
                 * @param {string} key - The parameter key
                 * @returns {string | null} The parameter value or null
                 */
                get(key: string): string | null {
                    return this.params.get(key) || null;
                }
            };

            // Replace the global URLSearchParams
            (window as any).URLSearchParams = MockURLSearchParams;

            const config = {
                capabilityName: 'App Connect',
                capabilityKey: 'test-key',
                basePath: 'some/basePath',
                solisLogoutEndpoint: '/v1/logout'
            };
            const sessionManager = new IWHISessionManager(config);
            expect(sessionManager.config.idleTimeout).to.equal(3 * 60 * 1000); // 3 minutes in milliseconds
            expect(sessionManager.config.tokenRefreshInterval).to.equal(5 * 60 * 1000); // 5 minutes in milliseconds
        })
    })

    describe('performSolisLogoutFromServer', () => {
        let sessionManager: IWHISessionManager;
        let fetchStub: sinon.SinonStub;

        beforeEach(() => {
            const config = {
                capabilityName: 'App Connect',
                capabilityKey: 'test-key',
                basePath: '/test-base',
                solisLogoutEndpoint: '/v1/logout'
            };
            sessionManager = new IWHISessionManager(config);
            fetchStub = sinon.stub(window, 'fetch');
        });

        afterEach(() => {
            fetchStub.restore();
        });

        it('should call fetch with correct URL and headers', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const headers = { 'Custom-Header': 'custom-value' };
            await sessionManager.performSolisLogoutFromServer(headers, 'test-key');

            expect(fetchStub.calledOnce).to.be.true;
            const [url, options] = fetchStub.firstCall.args;
            expect(url).to.equal('/test-base/v1/logout');
            expect(options.method).to.equal('POST');
            expect(options.credentials).to.equal('same-origin');
            expect(options.headers['x-hybrid-ipaas-product-key']).to.equal('test-key');
            expect(options.headers['Custom-Header']).to.equal('custom-value');
        });

        it('should add product key header when headers object is empty', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            await sessionManager.performSolisLogoutFromServer({}, 'my-product-key');

            const [, options] = fetchStub.firstCall.args;
            expect(options.headers['x-hybrid-ipaas-product-key']).to.equal('my-product-key');
        });

        it('should throw error when response is not ok', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ error: 'Server error' })
            };
            fetchStub.resolves(mockResponse as Response);

            try {
                await sessionManager.performSolisLogoutFromServer({}, 'test-key');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Failed to logout of solis through common service');
            }
        });

        it('should return parsed JSON response on success', async () => {
            const mockResponseData = { success: true, message: 'Logged out successfully' };
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => mockResponseData
            };
            fetchStub.resolves(mockResponse as Response);

            const result = await sessionManager.performSolisLogoutFromServer({}, 'test-key');
            expect(result).to.deep.equal(mockResponseData);
        });

        it('should handle network errors', async () => {
            fetchStub.rejects(new Error('Network error'));

            try {
                await sessionManager.performSolisLogoutFromServer({}, 'test-key');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Network error');
            }
        });
    });

    describe('performLogout', () => {
        let sessionManager: IWHISessionManager;
        let fetchStub: sinon.SinonStub;
        let sessionStorageStub: sinon.SinonStub;
        let consoleErrorStub: sinon.SinonStub;

        beforeEach(() => {
            const config = {
                capabilityName: 'App Connect',
                capabilityKey: 'test-key',
                basePath: '/test-base',
                solisLogoutEndpoint: '/v1/logout'
            };
            sessionManager = new IWHISessionManager(config);
            fetchStub = sinon.stub(window, 'fetch');
            sessionStorageStub = sinon.stub(sessionStorage, 'setItem');
            consoleErrorStub = sinon.stub(console, 'error');

            // Mock dismissWarning to avoid DOM manipulation in tests
            sinon.stub(sessionManager, 'dismissWarning');
        });

        afterEach(() => {
            fetchStub.restore();
            sessionStorageStub.restore();
            consoleErrorStub.restore();
            sinon.restore();
        });

        it('should store logout timestamp in sessionStorage', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            // Mock window.location.href to prevent actual navigation
            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            await sessionManager.performLogout('idle_timeout');

            expect(sessionStorageStub.calledOnce).to.be.true;
            expect(sessionStorageStub.firstCall.args[0]).to.equal('iwhi_last_logout_check');
            expect(sessionStorageStub.firstCall.args[1]).to.be.a('string');

            // Restore location
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });

        it('should call performSolisLogoutFromServer with correct parameters', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            await sessionManager.performLogout('session_expired');

            expect(fetchStub.calledOnce).to.be.true;
            const [url, options] = fetchStub.firstCall.args;
            expect(url).to.equal('/test-base/v1/logout');
            expect(options.headers['x-hybrid-ipaas-product-key']).to.equal('test-key');

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });

        it('should call onLogout callback if provided', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const onLogoutSpy = sinon.spy();
            const config = {
                capabilityName: 'App Connect',
                capabilityKey: 'test-key',
                basePath: '/test-base',
                solisLogoutEndpoint: '/v1/logout',
                onLogout: onLogoutSpy
            };
            const sessionManagerWithCallback = new IWHISessionManager(config);
            sinon.stub(sessionManagerWithCallback, 'dismissWarning');

            await sessionManagerWithCallback.performLogout('user_action');

            expect(onLogoutSpy.calledOnce).to.be.true;
            expect(onLogoutSpy.firstCall.args[0]).to.equal('user_action');
        });

        it('should redirect to basePath + reason when no onLogout callback', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            await sessionManager.performLogout('timeout');

            expect((window as any).location.href).to.equal('/test-basetimeout');

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });

        it('should handle sessionStorage errors gracefully', async () => {
            sessionStorageStub.throws(new Error('Storage quota exceeded'));
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            await sessionManager.performLogout('error_test');

            expect(consoleErrorStub.calledWith('Failed to set sessionStorage logout flag:', sinon.match.instanceOf(Error))).to.be.true;

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });

        it('should handle server logout errors gracefully and still redirect', async () => {
            fetchStub.rejects(new Error('Server error'));

            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            await sessionManager.performLogout('server_error_test');

            expect(consoleErrorStub.calledWith('Failed to logout through common service:', sinon.match.instanceOf(Error))).to.be.true;
            expect((window as any).location.href).to.equal('/test-baseserver_error_test');

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });

        it('should call dismissWarning before logout', async () => {
            const mockResponse = {
                ok: true,
                /**
                 * Mock JSON response
                 */
                json: async () => ({ success: true })
            };
            fetchStub.resolves(mockResponse as Response);

            const originalLocation = window.location;
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
                configurable: true
            });

            const dismissWarningSpy = sessionManager.dismissWarning as sinon.SinonStub;

            await sessionManager.performLogout('test_reason');

            expect(dismissWarningSpy.calledOnce).to.be.true;

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
            });
        });
    });

    describe('dismissWarning', () => {
        let sessionManager: IWHISessionManager;

        beforeEach(() => {
            const config = {
                capabilityName: 'App Connect',
                capabilityKey: 'test-key',
                basePath: '/test-base',
                solisLogoutEndpoint: '/v1/logout'
            };
            sessionManager = new IWHISessionManager(config);
        });

        it('should do nothing if warning is not shown', () => {
            sessionManager.warningShown = false;

            // Should not throw
            sessionManager.dismissWarning();

            expect(sessionManager.warningShown).to.be.false;
        });

        it('should remove warning dialog element if it exists', () => {
            sessionManager.warningShown = true;

            // Create a mock warning dialog
            const warningDialog = document.createElement('div');
            warningDialog.id = 'iwhi-session-warning-overlay';
            document.body.appendChild(warningDialog);

            sessionManager.dismissWarning();

            expect(sessionManager.warningShown).to.be.false;
            expect(document.getElementById('iwhi-session-warning-overlay')).to.be.null;
        });

        it('should set warningShown to false even if dialog does not exist', () => {
            sessionManager.warningShown = true;

            sessionManager.dismissWarning();

            expect(sessionManager.warningShown).to.be.false;
        });
    });
})
