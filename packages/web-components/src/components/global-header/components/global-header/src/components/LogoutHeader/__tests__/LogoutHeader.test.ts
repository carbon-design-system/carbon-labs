/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fixture, html, expect } from '@open-wc/testing';
import '../LogoutHeader';

describe('LogoutHeader Component', () => {
  it('renders component', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-header></apaas-logout-header>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.querySelector('cds-custom-header')).to.exist;
  });

  it('renders component with props', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-header
        brandCompany="mockCompany"></apaas-logout-header>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.textContent).to.contain('mockCompany');
    expect(el.shadowRoot?.querySelectorAll('svg').length).to.equal(0);
  });

  it('renders component with IBM logo', async () => {
    const el = await fixture<HTMLElement>(
      html` <apaas-logout-header brandCompany="IBM"></apaas-logout-header>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.textContent).not.to.contain('IBM');
    expect(el.shadowRoot?.querySelectorAll('svg').length).to.equal(1);
  });
});
