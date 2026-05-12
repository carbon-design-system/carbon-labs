/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../ProfilePopover';

describe('ProfilePopover Component', () => {
  it('renders cds-popover with cds-popover-content', async () => {
    const props = {
      footerSectionItems: undefined,
      userManagement: undefined,
      managementConsole: undefined,
    };
    const el = await fixture(
      html`<clabs-global-header-profile-popover
        ?profileOpen="${true}"
        .props="${props}"
        ?activeProfileMenu="${false}"></clabs-global-header-profile-popover>`
    );
    const popoverContainer = el.shadowRoot?.querySelector(
      'cds-custom-popover-content'
    );

    expect(popoverContainer).to.exist;
    const authContext = popoverContainer?.querySelector(
      'clabs-global-header-auth-context'
    );
    expect(authContext).to.exist;
  });
});
