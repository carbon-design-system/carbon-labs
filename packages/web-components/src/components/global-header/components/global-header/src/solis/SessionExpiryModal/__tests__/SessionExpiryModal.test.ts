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
      html`<clabs-global-header-session-expiry-modal open>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('.cds--inline-notification')).to.exist;
  });

  it('does not render component when open is false', async () => {
    const el = await fixture(
      html`<clabs-global-header-session-expiry-modal>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(
      el.shadowRoot?.querySelectorAll('.cds--inline-notification').length
    ).to.equal(0);
  });

  it('does not render the component when open switches from true to false', async () => {
    const el = await fixture<SessionExpiryModal>(
      html`<clabs-global-header-session-expiry-modal open>
      </clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('.cds--inline-notification')).to.exist;
    el.open = false;
    await el.updateComplete;
    // no CSS transitions in test environment so transitionend never fires automatically —
    // dispatch it manually to complete the fade-out and remove the element
    el.dispatchEvent(new Event('transitionend'));
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelectorAll('.cds--inline-notification').length
    ).to.equal(0);
  });

  it('renders component with expiry', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${120}"></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    const title = el.shadowRoot?.querySelector(
      '.cds--inline-notification__title'
    );
    const subtitle = el.shadowRoot?.querySelector(
      '.cds--inline-notification__subtitle'
    );
    expect(title?.textContent).to.contain('Session expiry');
    expect(subtitle?.textContent).to.contain('You will be logged out');
    expect(subtitle?.textContent).to.contain('2 minutes');
  });

  it('renders component with expiry in minutes and seconds', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${125}"></clabs-global-header-session-expiry-modal>`
    );
    const subtitle = el.shadowRoot?.querySelector(
      '.cds--inline-notification__subtitle'
    );
    expect(subtitle?.textContent).to.contain('2 minutes 5 seconds');
  });

  it('renders component with expiry in seconds only', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        open
        totalSeconds="${30}"></clabs-global-header-session-expiry-modal>`
    );
    const subtitle = el.shadowRoot?.querySelector(
      '.cds--inline-notification__subtitle'
    );
    expect(subtitle?.textContent).to.contain('30 seconds');
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

    it('updates the expiry time in the notification every second', async () => {
      const el = await fixture<SessionExpiryModal>(
        html`<clabs-global-header-session-expiry-modal
          open
          totalSeconds="${125}"></clabs-global-header-session-expiry-modal>`
      );
      let subtitle = el.shadowRoot?.querySelector(
        '.cds--inline-notification__subtitle'
      );
      expect(subtitle?.textContent).to.contain('2 minutes 5 seconds');
      clock.tick(1000);
      await el.updateComplete;
      subtitle = el.shadowRoot?.querySelector(
        '.cds--inline-notification__subtitle'
      );
      expect(subtitle?.textContent).to.contain('2 minutes 4 seconds');
    });

    it('stops at 0 seconds and does not cycle back', async () => {
      const el = await fixture<SessionExpiryModal>(
        html`<clabs-global-header-session-expiry-modal
          open
          totalSeconds="${2}"></clabs-global-header-session-expiry-modal>`
      );
      clock.tick(2000);
      await el.updateComplete;
      let subtitle = el.shadowRoot?.querySelector(
        '.cds--inline-notification__subtitle'
      );
      expect(subtitle?.textContent).to.contain('in 0 seconds');
      expect(clock.countTimers()).to.equal(0);

      clock.tick(5000);
      await el.updateComplete;
      subtitle = el.shadowRoot?.querySelector(
        '.cds--inline-notification__subtitle'
      );
      expect(subtitle?.textContent).to.contain('in 0 seconds');
      expect(subtitle?.textContent).to.not.contain('59');
    });
  });
});
