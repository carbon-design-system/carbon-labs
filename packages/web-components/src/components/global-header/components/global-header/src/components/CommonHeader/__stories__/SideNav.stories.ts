/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { CommonHeader } from '../CommonHeader';
import { html } from 'lit';
import {
  HeaderProps,
  SideNav,
  SideNavPropsV2,
  TrialLinkType,
} from '../../../types/Header.types';

const headerProps: HeaderProps = {
  brand: {
    company: 'IBM',
    product: 'SaaS Console',
  },
  profile: {
    imageUrl: '',
    email: 'user@test.com',
    displayName: 'Sample User',
  },
  enableLogs: true,
  managementConsole: {
    href: 'https://www.ibm.com',
    text: 'IBM SaaS Console',
    newTab: true,
    newTabIcon: true,
  },
  mainSectionItems: [
    { label: 'Instance name', text: 'APIC-MB-DEV' },
    { label: 'Region', text: 'us-east-1 (N Virginia)' },
    { label: 'Instance owner', text: 'user@ibm.com' },
  ],
  profileFooterLinks: [
    {
      text: 'Log out',
      href: '/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
      newTab: false,
      newTabIcon: false,
    },
  ],
  assistMeConfigs: {
    productId: 'a22453643cdb9e22397c6eab9e9da97d',
  },
  trialConfigs: {
    trialCount: 30,
    warning: false,
    trialLabel: 'Trial days left',
    description: `Your trial ends on ${Date.now().toLocaleString('default')}`,
    links: [
      { type: TrialLinkType.contact, label: 'Invite team member', href: '#' },
      {
        type: TrialLinkType.invite,
        label: 'Contact sales',
        href: 'https://www.ibm.com',
      },
    ],
    actionText: 'Buy',
    actionLink: '#',
  },
  switcherConfigs: [
    {
      floatLeft: true,
      items: [
        {
          label: 'Designer',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
        {
          label: 'Dashboard',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
      ],
    },
  ],
};

const sideNavBasic: SideNav = {
  isCollapsible: false,
  buttonLabel: 'Open menu',
  sidebarLabel: 'Side navigation',
  links: [
    {
      href: '#',
      label: 'Link 1',
      iconName: 'Settings',
      isActive: true,
      sideNavMenuItems: [],
    },
    {
      href: '#',
      label: 'Link 2',
      iconName: 'Launch',
      sideNavMenuItems: [],
    },
    {
      href: '#',
      label: 'Link 3',
      iconName: 'Launch',
      sideNavMenuItems: [],
    },
  ],
  isRail: false,
  isChildOfHeader: false,
};

const sideNavGroups: SideNav = {
  isCollapsible: true,
  autoCollapseOnLeave: true,
  buttonLabel: 'Open menu',
  sidebarLabel: 'Side navigation',
  isRail: false,
  links: [],
  isChildOfHeader: false,
  groups: [
    {
      links: [
        {
          href: '#',
          label: 'Home',
          iconName: 'Home',
          isActive: true,
          sideNavMenuItems: [],
        },
        {
          href: '#',
          label: 'Access management',
          iconName: 'User',
          isActive: false,
          sideNavMenuItems: [],
        },
      ],
    },
    {
      links: [
        {
          label: 'APIs',
          iconName: 'Api',
          isSideNavMenuItems: true,
          sideNavMenuItems: [
            {
              href: '#',
              label: 'API Connect',
              isActive: false,
            },
          ],
          href: '',
        },
        {
          label: 'App Integration',
          iconName: 'FlowConnection',
          isSideNavMenuItems: true,
          sideNavMenuItems: [
            {
              href: '#',
              label: 'webMethods Integration',
              isActive: false,
            },
            {
              href: '#',
              label: 'App Connect',
              isActive: false,
            },
          ],
          href: '',
        },
        {
          href: '#',
          label: 'Event endpoint management',
          iconName: 'IbmEventAutomation',
          sideNavMenuItems: [],
        },
      ],
    },
    {
      links: [
        {
          href: '#',
          label: 'Metering',
          iconName: 'Meter',
          sideNavMenuItems: [],
        },
        {
          href: '#',
          label: 'End-to-end monitoring',
          iconName: 'Analytics',
          sideNavMenuItems: [],
        },
      ],
    },
  ],
};

const sideNavWithV2: SideNavPropsV2 = {
  theme: 'g10',
  isExpandable: true,
  isCollapsible: true,
  autoCollapseOnLeave: true,

  sideNav: {
    isRail: true,
    isPersistent: true,
    isChildOfHeader: true,
  },
  links: [
    {
      label: 'Subscriptions',
      iconName: 'Launch',
      href: '',
      sideNavMenuItems: [],
    },
    {
      iconName: 'Settings',
      label: 'Account settings',
      isSideNavMenuItems: true,
      href: '',
      sideNavMenuItems: [
        {
          label: 'Details',
          isActive: false,
          href: '',
        },
        {
          label: 'Access management',
          iconName: 'UserMultiple',
          isActive: false,
          href: '',
        },
      ],
    },
  ],
  buttonLabel: '',
  sidebarLabel: '',
  isRail: false,
  isChildOfHeader: false,
};

const meta: Meta = {
  title: 'Components/Global Header/Subcomponents/Side Nav',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new CommonHeader(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof CommonHeader>;

export const SideNavBasic: Story = {
  render: () => html`
		<div role="main">
			<clabs-global-header-apaas
				.headerProps="${{
          ...headerProps,
          sideNav: sideNavBasic,
        }}"></common-header>
		</div>
	`,
};

export const SideNavWithGroups: Story = {
  render: () => html`
		<div role="main">
			<clabs-global-header-apaas
				.headerProps="${{
          ...headerProps,
          sideNav: sideNavGroups,
        }}"></common-header>
		</div>
	`,
};

export const SideNavWithPropsV2: Story = {
  render: () => html`
		<div role="main">
			<clabs-global-header-apaas
				.headerProps="${{
          ...headerProps,
          sideNavPropsV2: sideNavWithV2,
        }}"></common-header>
		</div>
	`,
};
