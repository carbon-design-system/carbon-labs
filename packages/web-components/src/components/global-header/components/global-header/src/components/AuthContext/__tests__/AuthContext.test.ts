/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../AuthContext';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../../constant';
import sinon from 'sinon';
import { ProfileFooterLinks } from '../../../types/Header.types';
import { AuthContext } from '../AuthContext';

const profile = {
  imageUrl: null,
  email: 'user@test.com',
  displayName: 'Sample User',
};

const managementConsole = {
  href: '#',
  text: 'IBM SaaS Console',
};

const mainSectionItems = [
  { label: 'Instance name', text: 'APIC-MB-DEV' },
  { label: 'Region', text: 'us-east-1 (N Virginia)' },
  { label: 'Instance owner', text: 'user@ibm.com' },
];

const userManagement = {
  href: '#',
  text: 'User management',
  icon: 'UserFollow',
};

const footerSectionItems = [
  {
    href: '/management/users',
    text: 'User Management',
    carbonIcon: 'UserFollow',
  },
  {
    href: '/management/apikeys',
    text: 'Service IDs and API keys',
    carbonIcon: 'IbmCloudKeyProtect',
  },
];

const profileFooterLinks = [
  {
    text: 'Log out',
    href: '/logout',
    carbonIcon: 'Logout',
    arialLabel: 'Logout',
  },
];

describe('AuthContext Component', () => {
  it('renders default with no props', async () => {
    const el = await fixture(
      html`<clabs-global-header-auth-context></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const tabpanel = el.shadowRoot?.querySelectorAll('[role="tabpanel"');
    expect(tabpanel).to.not.be.null;

    // Check that the name section renders regardless of the props
    const profileNameSection = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__name_section`
    );
    expect(profileNameSection).not.to.be.null;

    // Check that only one popover section has rendered
    const sectionsCount = el.shadowRoot?.querySelectorAll(
      `.${AUTOMATION_HEADER_BASE_CLASS}__popover__section`
    ).length;
    expect(sectionsCount).to.be.equal(1);
  });

  it('renders all section with props', async () => {
    const props = {
      enableLogs: true,
      profile,
      managementConsole,
      mainSectionItems,
      footerSectionItems,
      profileFooterLinks,
    };

    const el = await fixture(
      html`<clabs-global-header-auth-context
        .props="${{ ...props }}"></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const tabpanel = el.shadowRoot?.querySelectorAll('[role="tabpanel"]');
    expect(tabpanel).to.not.be.null;

    // Check that all sections have been rendered
    const sectionsCount = el.shadowRoot?.querySelectorAll(
      `.${AUTOMATION_HEADER_BASE_CLASS}__popover__section`
    ).length;
    expect(sectionsCount).to.be.equal(5);
  });

  it('renders the profile section', async () => {
    const el = await fixture(
      html`<clabs-global-header-auth-context
        .props="${{
          enableLogs: true,
          profile,
        }}"></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const profileNameSection = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__name_section`
    );
    expect(profileNameSection).not.to.be.null;

    expect(profileNameSection).to.contains.text('Sample User');
    expect(profileNameSection).to.contains.text('user@test.com');
  });

  it('renders the main section', async () => {
    const el = await fixture(
      html`<clabs-global-header-auth-context
        .props="${{
          enableLogs: true,
          mainSectionItems,
        }}"></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const mainSection = el.shadowRoot?.querySelectorAll('[role="tabpanel"]')[1]; // second tabpanel to render
    expect(mainSection).not.to.be.null;

    // Check that the expected text is rendered in this section
    expect(mainSection).to.contains.text('Instance name');
    expect(mainSection).to.contains.text('APIC-MB-DEV');

    expect(mainSection).to.contains.text('Region');
    expect(mainSection).to.contains.text('us-east-1 (N Virginia)');

    expect(mainSection).to.contains.text('Instance owner');
    expect(mainSection).to.contains.text('user@ibm.com');
  });

  describe('renders the footer section', () => {
    it('basic render', async () => {
      const el = await fixture(
        html`<clabs-global-header-auth-context
          .props="${{
            enableLogs: true,
            footerSectionItems,
          }}"></clabs-global-header-auth-context>`
      );
      expect(el).not.to.be.undefined;

      const footerSections = el.shadowRoot?.querySelectorAll(
        `.${AUTOMATION_HEADER_BASE_CLASS}__usr_management_lnk_section`
      );
      expect(footerSections).not.to.be.null;

      expect(footerSections?.length).to.be.equal(2);

      // check the first link is 'User Management'
      expect(footerSections?.[0].querySelectorAll('a').length).to.equal(1);
      expect(footerSections?.[0]).to.contains.text('User Management');

      // check the second section is 'Service IDs and API keys'
      expect(footerSections?.[1].querySelectorAll('a').length).to.equal(1);
      expect(footerSections?.[1]).to.contains.text('Service IDs and API keys');
    });

    it('renders when newTab is set ', async () => {
      const footerSectionItems: ProfileFooterLinks[] = [
        {
          href: '/management/users',
          text: 'User Management',
          arialLabel: 'User Management',
          newTab: true,
        },
      ];

      const el = await fixture(
        html`<clabs-global-header-auth-context
          .props="${{
            enableLogs: true,
            footerSectionItems,
          }}"></clabs-global-header-auth-context>`
      );
      expect(el).not.to.be.undefined;

      const footerSections = el.shadowRoot?.querySelectorAll(
        `.${AUTOMATION_HEADER_BASE_CLASS}__usr_management_lnk_section`
      );
      expect(footerSections).not.to.be.null;

      expect(footerSections?.length).to.be.equal(1);

      // check the first link is 'User Management'
      expect(footerSections?.[0]).to.contains.text('User Management');
      const link = footerSections?.[0].querySelector('a');
      expect(link).to.exist;
      expect(link).to.have.attribute('target', '_blank');
    });
  });

  it('renders the management console section', async () => {
    const el = await fixture(
      html`<clabs-global-header-auth-context
        .props="${{
          enableLogs: true,
          managementConsole,
        }}"></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const managementSection = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__console_lnk_section`
    );
    expect(managementSection).not.to.be.null;

    expect(managementSection?.querySelectorAll('a').length).to.equal(1);
    expect(managementSection).to.contains.text('IBM SaaS Console');
  });

  describe('renders the profile footer link section', () => {
    it('renders with href in profile link', async () => {
      const el = await fixture(
        html`<clabs-global-header-auth-context
          .props="${{
            enableLogs: true,
            profileFooterLinks,
          }}"></clabs-global-header-auth-context>`
      );
      expect(el).not.to.be.undefined;

      const profileFooterLinksSection = el.shadowRoot?.querySelector(
        `.${AUTOMATION_HEADER_BASE_CLASS}__profile_footer`
      );
      expect(profileFooterLinksSection).not.to.be.null;

      expect(profileFooterLinksSection?.querySelectorAll('a').length).to.equal(
        1
      );
      expect(profileFooterLinksSection).to.contains.text('Log out');
    });

    it('renders callback in profile link', async () => {
      const logoutCallbackSpy = sinon.spy();

      const profileFooterLinks: ProfileFooterLinks[] = [
        {
          text: 'Log out',
          arialLabel: 'Logout',
          carbonIcon: 'Logout',
          onClickHandler: logoutCallbackSpy,
        },
      ];

      const el = await fixture<AuthContext>(
        html`<clabs-global-header-auth-context
          .props="${{
            enableLogs: true,
            profileFooterLinks,
          }}"></clabs-global-header-auth-context>`
      );
      expect(el).not.to.be.undefined;

      const profileFooterLinksSection = el.shadowRoot?.querySelector(
        `.${AUTOMATION_HEADER_BASE_CLASS}__profile_footer`
      );
      expect(profileFooterLinksSection).not.to.be.null;

      const link = profileFooterLinksSection?.querySelector('cds-button');
      expect(link).to.exist;
      expect(profileFooterLinksSection).to.contains.text('Log out');

      link?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      await el.updateComplete;
      expect(logoutCallbackSpy).to.have.been.calledOnce;
    });

    it('renders the external launch icon', async () => {
      const profileFooterLinks: ProfileFooterLinks[] = [
        {
          text: 'Random Link',
          arialLabel: 'Random Link',
          href: '#',
          newTabIcon: true,
          newTab: true,
        },
      ];

      const el = await fixture(
        html`<clabs-global-header-auth-context
          .props="${{
            enableLogs: true,
            profileFooterLinks,
          }}"></clabs-global-header-auth-context>`
      );
      expect(el).not.to.be.undefined;

      const profileFooterLinksSection = el.shadowRoot?.querySelector(
        `.${AUTOMATION_HEADER_BASE_CLASS}__profile_footer`
      );
      expect(profileFooterLinksSection).not.to.be.null;

      expect(
        profileFooterLinksSection?.querySelectorAll('.launch_icon').length
      ).to.equal(1);
      expect(
        profileFooterLinksSection?.querySelectorAll('svg').length
      ).to.equal(1);
      expect(profileFooterLinksSection).to.contains.text('Random Link');
    });
  });

  it('renders the user management console section', async () => {
    const el = await fixture(
      html`<clabs-global-header-auth-context
        .props="${{
          enableLogs: true,
          userManagement,
        }}"></clabs-global-header-auth-context>`
    );
    expect(el).not.to.be.undefined;

    const userManagementSection = el.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__usr_management_lnk_section`
    );
    expect(userManagementSection).not.to.be.null;

    expect(userManagementSection?.querySelectorAll('a').length).to.equal(1);
    expect(userManagementSection).to.contains.text('User management');
  });
});
