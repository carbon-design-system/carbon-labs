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

describe('SessionExpiryModal Component', () => {
  it('renders component', async () => {
    const el = await fixture(
      html`<clabs-global-header-session-expiry-modal></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('cds-custom-modal')).to.exist;
  });

  it('renders component with expiry', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        expiryTime="2 minutes"></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.textContent).to.contain('Session expiring soon');
    expect(el.shadowRoot?.textContent).to.contain('Your session will expire');
    expect(el.shadowRoot?.textContent).to.contain('2 minutes');
  });

  it('renders component with callbacks', async () => {
    const logoutSpy = sinon.spy();
    const continueSpy = sinon.spy();
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        expiryTime="2 minutes"
        .logoutCallback="${logoutSpy}"
        .continueCallback="${continueSpy}"></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;

    const buttons = el?.shadowRoot?.querySelectorAll('[type="button"]');
    expect(buttons).to.exist;
    expect(buttons?.length).to.equal(2);

    if (buttons && buttons.length === 2) {
      expect(buttons[0].textContent?.trim()).to.equal('Logout now');
      expect(buttons[1].textContent?.trim()).to.equal('Continue session');

      buttons[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(logoutSpy.calledOnce).to.be.true;

      buttons[1].dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(continueSpy.calledOnce).to.be.true;
    }
  });
});
