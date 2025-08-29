/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fixture, html, expect } from '@open-wc/testing';
import '../LogoutTile';

describe('LogoutTile Component', () => {
  it('renders component', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-tile></apaas-logout-tile>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.querySelector('cds-custom-tile')).to.exist;
  });

  it('renders component with props', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-tile
        brandCompany="mockCompany"
        brandProduct="mockProduct"
        logoutText="mockLogoutText"></apaas-logout-tile>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.textContent).to.contain('mockCompany');
    expect(el.shadowRoot?.textContent).to.contain('mockProduct');
    expect(el.shadowRoot?.textContent).to.contain('mockLogoutText');
  });

  it('renders component with button', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-tile
        buttonLabel="mockButton"
        loginHref="/"></apaas-logout-tile>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.textContent).to.contain('mockButton');
  });
});
