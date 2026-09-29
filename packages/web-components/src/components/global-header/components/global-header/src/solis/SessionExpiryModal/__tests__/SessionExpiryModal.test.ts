/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../SessionExpiryModal';

describe('SessionExpiryModal Component', () => {
  it('renders component', async () => {
    const el = await fixture(
      html`<clabs-global-header-session-expiry-modal></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    expect(el.shadowRoot?.querySelector('cds-custom-inline-notification')).to
      .exist;
  });

  it('renders component with expiry', async () => {
    const el = await fixture<HTMLElement>(
      html`<clabs-global-header-session-expiry-modal
        expiryTime="2 minutes"></clabs-global-header-session-expiry-modal>`
    );
    expect(el.shadowRoot).not.to.be.null;
    const notification = el.shadowRoot?.querySelector(
      'cds-custom-inline-notification'
    );
    expect(notification?.shadowRoot?.textContent).to.contain('Session expiry');
    expect(notification?.shadowRoot?.textContent).to.contain(
      'You will be logged out'
    );
    expect(notification?.shadowRoot?.textContent).to.contain('2 minutes');
  });
});
