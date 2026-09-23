/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import sinon from 'sinon';
import '../SessionExpiryModal';
import { SessionExpiryModal } from '../SessionExpiryModal';

describe('SessionExpiryModal Component', () => {
  it('renders component when open is true', async () => {
    const el = await fixture(
      html`<clabs-global-header-session-expiry-modal
      open>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('cds-custom-inline-notification')).to
      .exist;
  });

  it('does not render component when open is false', async () => {
    const el = await fixture(
      html`<clabs-global-header-session-expiry-modal>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelectorAll('cds-custom-inline-notification').length).to
      .equal(0);
  });

  it('does not render the component when open switches from true to false', async() => {
    const el = await fixture<SessionExpiryModal>(
      html`<clabs-global-header-session-expiry-modal
      open>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('cds-custom-inline-notification')).to
      .exist;
    el.open = false;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('cds-custom-inline-notification').length).to
      .equal(0);
  });

  it('renders component with expiry', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${120}"></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    const notification = el.shadowRoot?.querySelector(
      'cds-custom-inline-notification'
    );
    expect((notification as any)?.title).to.contain('Session expiry');
    expect((notification as any)?.subtitle).to.contain('You will be logged out');
    expect((notification as any)?.subtitle).to.contain('2 minutes');
  });

  it('renders component with expiry in minutes and seconds', async() => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${125}"></clabs-global-header-session-expiry-modal>`
    );
    const notification = el.shadowRoot?.querySelector(
      'cds-custom-inline-notification'
    );
    expect((notification as any)?.subtitle).to.contain('2 minutes 5 seconds');
  });

  it('renders component with expiry in seconds only', async() => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${30}"></clabs-global-header-session-expiry-modal>`
    );
    const notification = el.shadowRoot?.querySelector(
      'cds-custom-inline-notification'
    );
    expect((notification as any)?.subtitle).to.contain('30 seconds');
  });

  describe('countdown', () => {
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

    it('updates the expiry time in the notification every second', async() => {
      const el = await fixture<SessionExpiryModal>(
        html`<clabs-global-header-session-expiry-modal
          open
          totalSeconds="${125}"></clabs-global-header-session-expiry-modal>`
      );
      let notification = el.shadowRoot?.querySelector(
        'cds-custom-inline-notification'
      );
      expect((notification as any)?.subtitle).to.contain('2 minutes 5 seconds');
      clock.tick(1000);
      await el.updateComplete;
      notification = el.shadowRoot?.querySelector('cds-custom-inline-notification');
      expect((notification as any)?.subtitle).to.contain('2 minutes 4 seconds');
    });
  });
});
