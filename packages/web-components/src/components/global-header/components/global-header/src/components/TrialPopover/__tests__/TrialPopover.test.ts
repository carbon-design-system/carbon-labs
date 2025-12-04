/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../TrialPopover';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../../constant';

describe('TrialPopover Component', () => {
  it('renders cds-popover with cds-popover-content', async () => {
    const props = { description: 'Test Description' };
    const el = await fixture(
      html`<clabs-global-header-trial-popover
        .open="true"
        .trialConfig="${props}"></clabs-global-header-trial-popover>`
    );
    const popover = el.shadowRoot?.querySelector('cds-custom-popover');

    expect(popover).to.exist;
    const popoverContent = popover?.querySelector('cds-custom-popover-content');
    expect(popoverContent).to.exist;
  });

  it('does not render the description when not provided', async () => {
    const props = {};
    const el = await fixture(
      html` <clabs-global-header-trial-popover
        .open="true"
        .trialConfig="${props}"></clabs-global-header-trial-popover>`
    );
    const description = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__tooltip-description`
    );

    expect(description).to.not.exist;
  });

  it('renders each type of link', async () => {
    const props = {
      links: [
        { href: '#', label: 'Link 1', type: 'invite' },
        { href: '#', label: 'Link 2', type: 'user' },
        { href: '#', label: 'Link 3', type: 'requestQuote' },
      ],
    };
    const el = await fixture(html`
      <clabs-global-header-trial-popover
        ?open="${true}"
        .trialConfig="${props}"></clabs-global-header-trial-popover>
    `);
    const links = el.shadowRoot?.querySelectorAll(
      `.${AUTOMATION_HEADER_BASE_CLASS}__tooltip-link`
    );

    expect(links).to.have.lengthOf(3);
  });

  it('renders the description when provided', async () => {
    const props = { description: 'Test Description' };
    const el = await fixture(
      html`<clabs-global-header-trial-popover
        ?open="${true}"
        .trialConfig="${props}"></clabs-global-header-trial-popover>`
    );
    const description = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__tooltip-description`
    );

    expect(description).to.exist;
    expect(description?.textContent).to.contain('Test Description');
  });

  it('renders the action link when actionText and actionLink are provided', async () => {
    const props = { actionText: 'Action', actionLink: '#' };
    const el = await fixture(
      html`<clabs-global-header-trial-popover
        ?open="${true}"
        .trialConfig="${props}"></clabs-global-header-trial-popover>`
    );
    const actionLink = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__trial-button`
    );

    expect(actionLink).to.exist;
    expect(actionLink?.textContent?.trim()).to.equal('Action');
  });
});
