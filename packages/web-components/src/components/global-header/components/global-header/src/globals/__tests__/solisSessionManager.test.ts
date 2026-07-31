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

  describe('startRefreshSchedule', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: false,
        shouldClearNativeTimers: true,
        toFake: ['setInterval', 'clearInterval'],
      });
    });

    afterEach(() => {
      clock.restore();
    });

    it('sets the refreshIntervalId', () => {
      const sessionManager = new solisSessionManager({});
      sessionManager.startRefreshSchedule();
      expect(sessionManager.isScheduleRunning()).to.be.true;
      sessionManager.stopRefreshSchedule();
    });

    it('calls triggerRefresh after the specified interval has passed', () => {
      const triggerRefreshStub = sinon.stub(
        solisSessionManager.prototype,
        'triggerRefresh'
      );
      const sessionManager = new solisSessionManager({
        tokenRefreshInterval: 1,
      });
      sessionManager.startRefreshSchedule();
      expect(sessionManager.isScheduleRunning()).to.be.true;
      clock.tick(1 * 60 * 1000);
      expect(triggerRefreshStub).to.have.been.calledOnce;
      sessionManager.stopRefreshSchedule();
    });
  });

  describe('stopRefreshSchedule', () => {
    it('does nothing if the token refresh schedule is not running', () => {
      const clearIntervalStub = sinon.stub(window, 'clearInterval');
      const sessionManager = new solisSessionManager({});
      sessionManager.stopRefreshSchedule();
      expect(sessionManager.isScheduleRunning()).to.be.false;
      expect(clearIntervalStub).to.not.have.been.called;
    });

    it('clears the interval if the token refresh schedule is running', () => {
      const clearIntervalStub = sinon.stub(window, 'clearInterval');
      const sessionManager = new solisSessionManager({});
      sessionManager.startRefreshSchedule();
      expect(sessionManager.isScheduleRunning()).to.be.true;
      sessionManager.stopRefreshSchedule();
      expect(clearIntervalStub).to.have.been.calledOnce;
      expect(sessionManager.isScheduleRunning()).to.be.false;
    });
  });

  describe('triggerRefresh', () => {
    it('calls fetch with the correct URL and options', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({ basePath: '/api' });
      await sessionManager.triggerRefresh();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/api/v1/solis/session/refresh-token',
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
        new Response(null, {
          status: 200,
          statusText: 'OK',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(fetchStub).to.have.been.calledOnceWith(
        '/v1/solis/session/refresh-token',
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      );
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis token refresh successful'
      );
    });

    it('logs a message if the token refresh happened too recently, response status 429', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 429,
          statusText: 'Refresh already in progress',
        })
      );
      const consoleLogStub = sinon.stub(console, 'log');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleLogStub).to.have.been.calledWith(
        'Solis token refresh skipped (too recent)'
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
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh unauthorized - triggering logout'
      );
    });

    it('logs an error if the user is not authenticated, response status 403', async () => {
      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.resolves(
        new Response(null, {
          status: 401,
          statusText: 'Unauthorized',
        })
      );
      const consoleErrorStub = sinon.stub(console, 'error');
      const sessionManager = new solisSessionManager({});
      await sessionManager.triggerRefresh();
      expect(consoleErrorStub).to.have.been.calledWith(
        'Solis token refresh unauthorized - triggering logout'
      );
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
      const addEventListenerStub = sinon.stub(document, 'addEventListener');
      const sessionManager = new solisSessionManager({});

      sessionManager.registerActivityListeners();
      expect(addEventListenerStub.callCount).to.equal(7);
    });

    it('resets idle state when an activity event is dispatched', () => {
      const sessionManager = new solisSessionManager({});

      sessionManager['isIdle'] = true;

      sessionManager.registerActivityListeners();
      document.dispatchEvent(new Event('click'));

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
      const removeEventListenerStub = sinon.stub(
        document,
        'removeEventListener'
      );
      const sessionManager = new solisSessionManager({});
      sessionManager.registerActivityListeners();
      sessionManager.unregisterActivityListeners();
      expect(removeEventListenerStub.callCount).to.equal(7);
    });
  });
});
