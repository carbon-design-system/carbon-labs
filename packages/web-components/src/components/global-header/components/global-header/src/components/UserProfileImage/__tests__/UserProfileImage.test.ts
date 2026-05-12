/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../UserProfileImage';

describe('UserProfileImage Component', () => {
  it('renders the basic component with initial', async () => {
    const el = await fixture(
      html`<clabs-global-header-user-profile-image
        initials="test user"></clabs-global-header-user-profile-image>`
    );
    const profileImageContainer = el.shadowRoot?.querySelector(
      '.automation-global-header__user-profile-image'
    );

    expect(profileImageContainer?.textContent?.trim()).to.contain('TU');
    expect(profileImageContainer?.querySelector('svg')).not.to.exist;
  });

  it('renders the basic component with lower case initials', async () => {
    const el = await fixture(
      html`<clabs-global-header-user-profile-image
        initials="ab"></clabs-global-header-user-profile-image>`
    );
    const profileImageContainer = el.shadowRoot?.querySelector(
      '.automation-global-header__user-profile-image'
    );

    expect(profileImageContainer?.textContent?.trim()).to.contain('AB');
    expect(profileImageContainer?.querySelector('svg')).not.to.exist;
  });

  it('renders the basic component with lower case initials', async () => {
    const el = await fixture(
      html`<clabs-global-header-user-profile-image
        initials="test user"
        image="test_value"></clabs-global-header-user-profile-image>`
    );
    const profileImageContainer = el.shadowRoot?.querySelector(
      '.automation-global-header__user-profile-image'
    );

    expect(profileImageContainer?.querySelector('img')).to.exist;
  });

  it('renders the basic component with carbon icon', async () => {
    const el = await fixture(
      html`<clabs-global-header-user-profile-image
        kind="User"
        size="20"></clabs-global-header-user-profile-image>`
    );
    const profileImageContainer = el.shadowRoot?.querySelector(
      '.automation-global-header__user-profile-image'
    );

    expect(profileImageContainer?.querySelector('svg')).to.exist;
  });

  it('renders the profile icon if initial prop is not passed in', async () => {
    const el = await fixture(
      html`<clabs-global-header-user-profile-image></clabs-global-header-user-profile-image>`
    );
    const profileImageContainer = el.shadowRoot?.querySelector(
      '.automation-global-header__user-profile-image'
    );
    expect(profileImageContainer?.querySelector('svg')).to.exist;
    expect(profileImageContainer?.textContent?.trim()).to.equal('');
  });
});
