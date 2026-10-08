/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from '@open-wc/testing';
import solisSessionManager from '../solisSessionManager';
import sinon from 'sinon';

describe('solisSessionManager', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('triggerRefresh', () => {
    it('calls fetch with the correct URL and options', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({ basePath: '/api' });
      await sessionManager.triggerRefresh();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/api/hybrid-ipaas/v1/solis/session/refresh-token',
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      );
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis token refresh successful'
      );
    });

    it('calls fetch with the correct URL and options when the basePath is undefined', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/hybrid-ipaas/v1/solis/session/refresh-token',
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      );
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis token refresh successful'
      );
    });

    it('logs an error if the user is not authenticated, response status 401', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 401,
          statusText: 'Not found',
        })
      );
      const consoleErrorStub = sinon.stub(console, 'error');
      const performLogoutStub = sinon.stub(
        solisSessionManager.prototype,
        'performLogout'
      );
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh unauthorized - triggering logout'
      );
      expect(performLogoutStub).to.have.been.calledWith(true);
    });

    it('logs an error if the user is not authenticated, response status 403', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 403,
          statusText: 'Unauthorized',
        })
      );
      const consoleErrorStub = sinon.stub(console, 'error');
      const performLogoutStub = sinon.stub(
        solisSessionManager.prototype,
        'performLogout'
      );
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh unauthorized - triggering logout'
      );
      expect(performLogoutStub).to.have.been.calledWith(true);
    });

    it('logs an error if the response status is 500', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 500,
          statusText: 'Internal Server Error',
        })
      );
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh failed:',
        500
      );
    });

    it('logs an error if the fetch call fails', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.rejects(new Error('Network error'));
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh error:',
        'Network error'
      );
    });

    it('sets isRefreshing to false after a successful response', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({}), { status: 200, statusText: 'OK' })
      );
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(sessionManager['isRefreshing']).to.be.false;
    });

    it('sets isRefreshing to false after a non-ok response', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      );
      sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(sessionManager['isRefreshing']).to.be.false;
    });

    it('sets isRefreshing to false after a fetch error', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.rejects(new Error('Network error'));
      sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(sessionManager['isRefreshing']).to.be.false;
    });
  });

  describe('registerActivityListeners', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('registers an event listener for each activity event', () => {
      const addEventListenerStub = sinon.stub(window, 'addEventListener');
      const sessionManager = new solisSessionManager({});

      sessionManager.registerActivityListeners();
      expect(addEventListenerStub.callCount).to.equal(7);
    });

    it('resets idle state when an activity event is dispatched', () => {
      const sessionManager = new solisSessionManager({});

      sessionManager['isIdle'] = true;

      sessionManager.registerActivityListeners();
      window.dispatchEvent(new Event('click'));

      expect(sessionManager.isTabIdle()).to.be.false;
    });
  });

  describe('unregisterActivityListeners', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('removes the event listeners from each activity event', () => {
      const removeEventListenerStub = sinon.stub(window, 'removeEventListener');
      const sessionManager = new solisSessionManager({});
      sessionManager.registerActivityListeners();
      sessionManager.unregisterActivityListeners();
      expect(removeEventListenerStub.callCount).to.equal(7);
    });
  });

  describe('checkSessionStatus', () => {
    it('returns the ttl from the response body when the session is active (200)', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({ ttl: 123 }), {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({ basePath: '/api' });
      const result = await sessionManager.checkSessionStatus();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/api/hybrid-ipaas/v1/solis/session/session-status',
        { method: 'GET', credentials: 'same-origin' }
      );
      expect(result).to.equal(123);
      expect(consoleLogStub).to.have.been.calledWith('Solis session is active');
    });

    it('returns the ttl from the response body when the session is active and basePath is undefined', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({ ttl: 123 }), {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      const result = await sessionManager.checkSessionStatus();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/hybrid-ipaas/v1/solis/session/session-status',
        { method: 'GET', credentials: 'same-origin' }
      );
      expect(result).to.equal(123);
      expect(consoleLogStub).to.have.been.calledWith('Solis session is active');
    });

    it('returns true if ttl is not in the response body when the session is active', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      const result = await sessionManager.checkSessionStatus();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/hybrid-ipaas/v1/solis/session/session-status',
        { method: 'GET', credentials: 'same-origin' }
      );
      expect(result).to.be.true;
      expect(consoleLogStub).to.have.been.calledWith('Solis session is active');
    });

    it('returns false when the session is inactive (401)', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, { status: 401, statusText: 'Unauthorized' })
      );
      const consoleWarnStub = sinon.stub(console, 'warn');
      const sessionManager = new solisSessionManager({});
      const result = await sessionManager.checkSessionStatus();
      expect(result).to.be.false;
      expect(consoleWarnStub).to.have.been.calledWith(
        'Solis session is inactive'
      );
    });

    it('returns false and logs an error when the fetch call fails', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.rejects(new Error('Network error'));
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      const result = await sessionManager.checkSessionStatus();
      expect(result).to.be.false;
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis session status unknown:',
        'Network error'
      );
    });
  });

  describe('performLogout', () => {
    let redirectStub: sinon.SinonStub;
    let checkSessionStatusStub: sinon.SinonStub;

    beforeEach(() => {
      redirectStub = sinon.stub(solisSessionManager.prototype, 'redirect');
      checkSessionStatusStub = sinon.stub(
        solisSessionManager.prototype,
        'checkSessionStatus'
      );
      checkSessionStatusStub.resolves(true);
    });

    it('calls the logout endpoint with the correct URL and method', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({ basePath: '/api' });
      await sessionManager.performLogout(true);
      expect(fetchStub).to.have.been.calledWith(
        '/api/hybrid-ipaas/v1/solis/session/logout',
        { method: 'POST', credentials: 'same-origin' }
      );
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis session logout - successful'
      );
    });

    it('calls the logout endpoint without basePath when basePath is undefined', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      await sessionManager.performLogout(true);
      expect(fetchStub).to.have.been.calledWith(
        '/hybrid-ipaas/v1/solis/session/logout',
        {
          method: 'POST',
          credentials: 'same-origin',
        }
      );
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis session logout - successful'
      );
    });

    it('logs a message when the logout endpoint returns 401 (session already expired)', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, { status: 401, statusText: 'Unauthorized' })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      await sessionManager.performLogout(true);
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis session logout - session already expired'
      );
    });

    it('logs an error when the logout endpoint returns a non-ok status', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      );
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.performLogout(true);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis session logout failed:',
        500
      );
    });

    it('logs an error and still redirects when the logout endpoint fetch fails', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.rejects(new Error('Network error'));
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.performLogout(true);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis session logout error:',
        'Network error'
      );
      expect(redirectStub).to.have.been.calledWith('/solis-logout');
    });

    it('invokes logoutCallback if provided', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const callbackSpy = sinon.spy();
      const sessionManager = new solisSessionManager({
        logoutCallback: callbackSpy,
      });
      await sessionManager.performLogout(true);
      expect(callbackSpy).to.have.been.calledOnce;
    });

    it('still redirects when logoutCallback throws', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const consoleErrorStub = sinon.stub(console, 'error');
      const failingCallback = sinon.stub().rejects(new Error('Callback error'));
      const sessionManager = new solisSessionManager({
        logoutCallback: failingCallback,
      });
      await sessionManager.performLogout(true);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Logout failed with error: ',
        'Callback error'
      );
      expect(redirectStub).to.have.been.calledWith('/solis-logout');
    });

    it('redirects to /login after a soft logout', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const callbackSpy = sinon.spy();
      const sessionManager = new solisSessionManager({
        logoutCallback: callbackSpy,
      });
      await sessionManager.performLogout(false);
      expect(redirectStub).to.have.been.calledWith('/login');
    });

    it('stops session status polling, and unregisters activity listeners', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const stopPollingSpy = sinon.spy(
        solisSessionManager.prototype,
        'stopSessionStatusPolling'
      );
      const unregisterSpy = sinon.spy(
        solisSessionManager.prototype,
        'unregisterActivityListeners'
      );
      const sessionManager = new solisSessionManager({});
      await sessionManager.performLogout(true);
      expect(stopPollingSpy).to.have.been.calledOnce;
      expect(unregisterSpy).to.have.been.calledOnce;
    });

    it('does not execute if a logout is already in progress', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(new Response(null, { status: 200, statusText: 'OK' }));
      const sessionManager = new solisSessionManager({});
      // kick off two concurrent calls
      await Promise.all([
        sessionManager.performLogout(true),
        sessionManager.performLogout(true),
      ]);
      expect(fetchStub).to.have.been.calledOnce;
    });

    describe('when session is not active', () => {
      it('does not call the logout endpoint', async () => {
        checkSessionStatusStub.resolves(false);
        const fetchStub = sinon.stub(window, 'fetch');
        fetchStub.resolves(
          new Response(null, { status: 200, statusText: 'OK' })
        );
        const sessionManager = new solisSessionManager({});
        await sessionManager.performLogout(true);
        expect(fetchStub).to.not.have.been.called;
      });
    });
  });

  describe('setActive', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('sets isIdle to false', () => {
      const sessionManager = new solisSessionManager({});
      sessionManager['isIdle'] = true;
      sessionManager.setActive();
      expect(sessionManager.isTabIdle()).to.be.false;
    });

    it('resets isIdle to false and restarts the idle timeout when called again', () => {
      const setIdleStub = sinon.stub(solisSessionManager.prototype, 'setIdle');
      const sessionManager = new solisSessionManager({
        idleTimeoutInterval: 1,
      });

      // First call — starts the idle timeout
      sessionManager.setActive();
      // Second call before timeout fires — should clear the first timeout and restart
      sessionManager['isIdle'] = true;
      sessionManager.setActive();

      expect(sessionManager.isTabIdle()).to.be.false;
      // Advance past one interval — only one setIdle call should fire (from the restarted timeout)
      clock.tick(1 * 60 * 1000);
      expect(setIdleStub).to.have.been.calledOnce;
    });

    it('calls setIdle after the idle timeout elapses', () => {
      const setIdleStub = sinon.stub(solisSessionManager.prototype, 'setIdle');
      const sessionManager = new solisSessionManager({
        idleTimeoutInterval: 1,
      });

      sessionManager.setActive();
      expect(setIdleStub).to.not.have.been.called;
      clock.tick(1 * 60 * 1000);
      expect(setIdleStub).to.have.been.calledOnce;
    });
  });

  describe('setActive', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('calls cancelWarningTimer to stop the current the idle warning timer', () => {
      const cancelWarningTimerStub = sinon.stub(
        solisSessionManager.prototype,
        'cancelWarningTimer'
      );
      const sessionManager = new solisSessionManager({});
      sessionManager.setActive();
      expect(cancelWarningTimerStub).to.have.been.called;
    });

    it('calls startWarningTimer to restart the idle warning timer', () => {
      const startWarningTimerStub = sinon.stub(
        solisSessionManager.prototype,
        'startWarningTimer'
      );
      const sessionManager = new solisSessionManager({});
      sessionManager.setActive();
      expect(startWarningTimerStub).to.have.been.called;
    });

    it('calls onWarningDismissedCallback if the function is passed', () => {
      const onWarningDismissedCallbackStub = sinon.stub();
      const sessionManager = new solisSessionManager({
        onWarningDismissedCallback: onWarningDismissedCallbackStub,
      });
      sessionManager.setActive();
      expect(onWarningDismissedCallbackStub).to.have.been.called;
    });

    it('does not throw if onWarningDismissedCallback is not passed', () => {
      const sessionManager = new solisSessionManager({});
      expect(() => {
        sessionManager.setActive();
      }).to.not.throw();
    });
  });

  describe('setIdle', () => {
    it('sets isIdle to true and calls performLogout when session is inactive', async () => {
      const performLogoutStub = sinon.stub(
        solisSessionManager.prototype,
        'performLogout'
      );
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(false);
      const sessionManager = new solisSessionManager({});
      await sessionManager.setIdle();
      expect(sessionManager.isTabIdle()).to.be.true;
      expect(performLogoutStub).to.have.been.calledOnce;
    });

    it('does not call performLogout when session is active', async () => {
      const performLogoutStub = sinon.stub(
        solisSessionManager.prototype,
        'performLogout'
      );
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(123);
      const sessionManager = new solisSessionManager({});
      await sessionManager.setIdle();
      expect(performLogoutStub).to.not.have.been.called;
    });

    it('calls triggerRefresh when session is active and ttl is <= 60 seconds', async () => {
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(45);
      const sessionManager = new solisSessionManager({});
      await sessionManager.setIdle();
      expect(triggerRefreshStub).to.have.been.called;
    });

    it('does not call triggerRefresh when session is active and ttl is > 60 seconds', async () => {
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(120);
      const sessionManager = new solisSessionManager({});
      await sessionManager.setIdle();
      expect(triggerRefreshStub).to.not.have.been.called;
    });

    it('does not call triggerRefresh when session is active and ttl is not returned', async () => {
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(true);
      const sessionManager = new solisSessionManager({});
      await sessionManager.setIdle();
      expect(triggerRefreshStub).to.not.have.been.called;
    });
  });

  describe('startSessionStatusPolling', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('sets the sessionStatusIntervalId', () => {
      const sessionManager = new solisSessionManager({});
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      sessionManager.stopSessionStatusPolling();
    });

    it('calls checkSessionStatus after the specified interval has passed', async () => {
      const checkSessionStatusStub = sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(123);
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      clock.tick(1 * 1000);
      await Promise.resolve(); // flush so poll completes before we stop
      sessionManager.stopSessionStatusPolling();
      expect(checkSessionStatusStub).to.have.been.calledOnce;
    });

    it('calls triggerRefresh when ttl is <= 60 seconds and isRefreshing is false', async () => {
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(45);
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      clock.tick(1 * 1000);
      await Promise.resolve(); // flush: setTimeout callback fires, checkSessionStatus called
      await Promise.resolve(); // flush: awaited checkSessionStatus resolves, triggerRefresh called
      sessionManager.stopSessionStatusPolling();
      expect(triggerRefreshStub).to.have.been.called;
    });

    it('does not call triggerRefresh when isRefreshing is true', async () => {
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(45);
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager['isRefreshing'] = true;
      sessionManager.startSessionStatusPolling();
      clock.tick(1 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      sessionManager.stopSessionStatusPolling();
      expect(triggerRefreshStub).to.not.have.been.called;
    });

    it('does not call triggerRefresh if ttl > 60 seconds', async () => {
      sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(120);
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      clock.tick(1 * 1000);
      await Promise.resolve(); // flush: setTimeout callback fires, checkSessionStatus called
      await Promise.resolve(); // flush: awaited checkSessionStatus resolves, triggerRefresh skipped
      sessionManager.stopSessionStatusPolling();
      expect(triggerRefreshStub).to.not.have.been.called;
    });

    it('calls performLogout if the session is inactive', async () => {
      const checkSessionStatusStub = sinon
        .stub(solisSessionManager.prototype, 'checkSessionStatus')
        .resolves(false);
      const performLogoutStub = sinon.stub(
        solisSessionManager.prototype,
        'performLogout'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      clock.tick(1 * 1000);
      await Promise.resolve(); // flush microtask queue so the async interval callback resolves
      expect(checkSessionStatusStub).to.have.been.calledOnce;
      expect(performLogoutStub).to.have.been.calledOnce;
      sessionManager.stopSessionStatusPolling();
    });

    it('calls triggerRefresh if ttl is greater than previous poll', async () => {
      const checkSessionStatusStub = sinon.stub(
        solisSessionManager.prototype,
        'checkSessionStatus'
      );
      checkSessionStatusStub.onFirstCall().resolves(120);
      checkSessionStatusStub.onSecondCall().resolves(150);

      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();

      // First tick
      clock.tick(1 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(triggerRefreshStub).to.not.have.been.called;

      // Second tick
      clock.tick(1 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(triggerRefreshStub).to.have.been.calledOnce;

      sessionManager.stopSessionStatusPolling();
    });

    it('does not call triggerRefresh if ttl is less than previous poll', async () => {
      const checkSessionStatusStub = sinon.stub(
        solisSessionManager.prototype,
        'checkSessionStatus'
      );
      checkSessionStatusStub.onFirstCall().resolves(150);
      checkSessionStatusStub.onSecondCall().resolves(140);

      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        sessionStatusInterval: 1,
      });
      sessionManager.startSessionStatusPolling();

      // First tick
      clock.tick(1 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(triggerRefreshStub).to.not.have.been.called;

      // Second tick
      clock.tick(1 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(triggerRefreshStub).to.not.have.been.called;

      sessionManager.stopSessionStatusPolling();
    });
  });

  describe('stopSessionStatusPolling', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('does nothing if the session status polling is not running', () => {
      const clearTimeoutStub = sinon.stub(window, 'clearTimeout');
      const sessionManager = new solisSessionManager({});
      sessionManager.stopSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.false;
      expect(clearTimeoutStub).to.not.have.been.called;
    });

    it('clears the timeout if the session status polling is running', () => {
      const clearTimeoutStub = sinon.stub(window, 'clearTimeout');
      const sessionManager = new solisSessionManager({});
      sessionManager.startSessionStatusPolling();
      expect(sessionManager.isPollingRunning()).to.be.true;
      sessionManager.stopSessionStatusPolling();
      expect(clearTimeoutStub).to.have.been.calledOnce;
      expect(sessionManager.isPollingRunning()).to.be.false;
    });
  });

  describe('startWarningTimer', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('calls the onWarningCallback function after (idleTimeoutInterval - warningLeadTime) * 60 * 1000 ms', () => {
      const onWarningCallbackStub = sinon.stub();
      const sessionManager = new solisSessionManager({
        onWarningCallback: onWarningCallbackStub,
        idleTimeoutInterval: 2,
        warningLeadTime: 1,
      });
      sessionManager.startWarningTimer();
      clock.tick(1 * 60 * 1000);
      expect(onWarningCallbackStub).to.have.been.called;
    });

    it('does not throw if onWarningCallback is not provided', () => {
      const sessionManager = new solisSessionManager({
        idleTimeoutInterval: 2,
        warningLeadTime: 1,
      });
      expect(() => {
        sessionManager.startWarningTimer();
        clock.tick(1 * 60 * 1000);
      }).to.not.throw();
    });
  });

  describe('cancelWarningTimer', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setTimeout', 'clearTimeout'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('prevents onWarningCallback from firing when called before the timeout elapses', () => {
      const onWarningCallbackStub = sinon.stub();
      const sessionManager = new solisSessionManager({
        onWarningCallback: onWarningCallbackStub,
        idleTimeoutInterval: 3,
        warningLeadTime: 1,
      });
      sessionManager.startWarningTimer();
      clock.tick(1 * 60 * 1000);
      sessionManager.cancelWarningTimer();
      expect(onWarningCallbackStub).to.not.have.been.called;
    });

    it('resets warningTimeout to undefined', () => {
      const onWarningCallbackStub = sinon.stub();
      const clearTimeoutStub = sinon.stub(window, 'clearTimeout');
      const sessionManager = new solisSessionManager({
        onWarningCallback: onWarningCallbackStub,
        idleTimeoutInterval: 3,
        warningLeadTime: 1,
      });
      sessionManager.startWarningTimer();
      expect(sessionManager.isWarningTimerRunning()).to.be.true;
      clock.tick(1 * 60 * 1000);
      sessionManager.cancelWarningTimer();
      expect(clearTimeoutStub).to.have.been.called;
      expect(sessionManager.isWarningTimerRunning()).to.be.false;
    });

    it('does nothing if the warning timer is not running', () => {
      const onWarningCallbackStub = sinon.stub();
      const clearTimeoutStub = sinon.stub(window, 'clearTimeout');
      const sessionManager = new solisSessionManager({
        onWarningCallback: onWarningCallbackStub,
        idleTimeoutInterval: 3,
        warningLeadTime: 1,
      });
      sessionManager.cancelWarningTimer();
      expect(clearTimeoutStub).to.not.have.been.called;
    });
  });
});
