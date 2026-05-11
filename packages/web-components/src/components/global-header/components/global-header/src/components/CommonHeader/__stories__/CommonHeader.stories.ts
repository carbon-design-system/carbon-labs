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
  SearchConfigs,
  TrialLinkType,
  solisDeploymentEnvironment,
} from '../../../types/Header.types';

const trialDate = new Date();
trialDate.setDate(trialDate.getDate() + 30);

const chatBotConfigs = {
  onClick: (e) => {
    e.preventDefault();
    console.log('chatbot onclick triggered.');
  },
};

const notificationConfigs = {
  openNotifications: false,
  onClick: () => {
    console.log('notification onclick triggered.');
  },
  isActive: true,
};

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
  sideNav: {
    isCollapsible: true,
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
  },
  assistMeConfigs: {
    productId: 'a22453643cdb9e22397c6eab9e9da97d',
  },
  trialConfigs: {
    trialCount: 30,
    warning: false,
    trialLabel: 'Trial days left',
    description: `Your trial ends on ${trialDate.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`,
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
      iconsLeft: true,
      initialSelectedIndex: 1,
      items: [
        {
          label: 'Development',
          isHeading: true,
          id: '',
          text: '',
          href: '#',
          carbonIcon: 'Checkmark',
        },
        {
          label: 'Environment 1',
          id: '',
          text: '',
          href: '#',
          carbonIcon: 'Checkmark',
        },
        {
          label: 'Environment 2',
          id: '',
          text: '',
          href: '#',
          carbonIcon: 'Checkmark',
        },
        {
          label: 'Production',
          isHeading: true,
          id: '',
          text: '',
          href: '#',
          carbonIcon: 'Checkmark',
        },
        {
          label: 'Environment 3',
          href: '#',
          id: '',
          text: '',
          carbonIcon: 'Checkmark',
          isLastInList: true,
        },
        {
          label: 'Manage environments',
          href: '#',
          id: '',
          text: '',
          carbonIcon: 'Settings',
          isLinkItem: true,
        },
      ],
    },
  ],
};

const headerPropsUnauthenticated: HeaderProps = {
  brand: {
    company: 'IBM',
    product: 'SaaS Console',
  },
  noAuthHeaderLinks: [
    {
      text: 'Docs',
      href: '/docs',
      carbonIcon: 'Document',
      arialLabel: 'Docs',
    },
    {
      href: '/login',
      text: 'Log in',
      carbonIcon: 'Login',
      arialLabel: 'Log in',
    },
  ],
  helperLinks: [
    {
      link: 'https://carbondesignsystem.com/',
      label: 'Carbon Design System',
      target: '_blank',
    },
  ],
};

const hybridIPaasHeaderProps = {
  isHybridIpaas: true,
  brand: {
    company: 'IBM',
    product: 'Mock Product',
  },
  capabilityName: {
    label: 'Capability',
  },
  profile: {
    imageUrl: null,
    email: 'user@test.com',
    displayName: 'Sample User',
  },
  managementConsoleHref: '#',
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
    },
  ],
  assistMeConfigs: {
    productId: 'a22453643cdb9e22397c6eab9e9da97d',
  },
  switcherConfigs: [
    {
      floatLeft: true,
      iconsLeft: true,
      items: [
        { label: 'Development', isHeading: true },
        {
          label: 'Environment 5992719015825413407182805',
          href: '#',
          carbonIcon: 'Checkmark',
        },
        { label: 'Environment 2', href: '#', carbonIcon: 'Checkmark' },
        { label: 'Production', isHeading: true },
        {
          label: 'Environment 3',
          href: '#',
          carbonIcon: 'Checkmark',
          isLastInList: true,
        },
      ],
    },
  ],
  sideNav: {
    isCollapsible: true,
    autoCollapseOnLeave: true,
    buttonLabel: 'Open menu',
    sidebarLabel: 'Side navigation',
    groups: [
      {
        links: [
          {
            href: '#',
            label: 'Home',
            iconName: 'Home',
            isActive: false,
          },
          {
            href: '#',
            label: 'Access management',
            iconName: 'User',
            isActive: false,
          },
        ],
      },
      {
        links: [
          {
            label: 'APIs',
            iconName: 'Document',
            isSideNavMenuItems: true,
            isActive: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'Connect',
              },
            ],
          },
          {
            label: 'App Integration',
            iconName: 'Email',
            isSideNavMenuItems: true,
            isActive: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'Integration',
              },
              {
                href: '#',
                label: 'Apps',
              },
            ],
          },
          {
            href: '#',
            label: 'Events',
            iconName: 'RequestQuote',
          },
        ],
      },
      {
        links: [
          {
            href: '#',
            label: 'Metering',
            iconName: 'Checkmark',
          },
          {
            href: '#',
            label: 'Monitoring',
            iconName: 'Share',
          },
        ],
      },
    ],
  },
  notificationConfigs: {
    notifications: [],
    openNotifications: false,
    onClick: () => {
      console.log('notification onclick triggered.');
    },
  },
  chatBotConfigs: {
    onClick: () => {},
  },
};

const headerPropsWithHelpLinks: HeaderProps = {
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
  helperLinks: [
    {
      link: 'https://ibm.biz/automation-explorer',
      label: 'Automation Explorer documentation',
      onclick: () => {
        window.open('https://ibm.biz/automation-explorer');
      },
    },
    {
      label: 'Connector Development Kit documentation',
      onclick: () => {
        window.open('https://ibm.biz/connector-development-kit');
      },
    },
    {
      link: 'https://ibm.biz/automationexplorer',
      label: 'Automation Explorer Community',
      target: '_blank',
    },
  ],
};

const searchConfigs: SearchConfigs = {
  placeholder: 'Search...',
  callback: (value: string) => {
    console.log(value);
  },
  submitCallback: (value: string) => {
    console.log(`Search triggered with: '${value}'`);
  },
};

const meta: Meta = {
  title: 'Components/Global Header/Subcomponents/Common Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new CommonHeader(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof CommonHeader>;

export const Basic: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${headerProps}"></clabs-global-header-apaas>
    </div>
  `,
};

export const UnauthenticatedContext: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${headerPropsUnauthenticated}"></clabs-global-header-apaas>
    </div>
  `,
};

export const IbmMockProduct: Story = {
  name: 'IBM Mock Product',
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${hybridIPaasHeaderProps}"></clabs-global-header-apaas>
    </div>
  `,
};

export const HelpLinks: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${headerPropsWithHelpLinks}"></clabs-global-header-apaas>
    </div>
  `,
};

export const ChatBot: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{
          ...headerProps,
          chatBotConfigs,
        }}"></clabs-global-header-apaas>
    </div>
  `,
};

const sidekickConfig = {
  isEnabled: true,
  scriptUrl:
    'https://cdn.dev.saas.ibm.com/solis_ui/v1/sidekick/solis-sidekick.es.js',
  correlationId: 'someid',
  title: 'sometitle',
  product: 'someproduct',
  context: 'application',
  insights_enabled: true,
  chat_enabled: true,
  overview_enabled: true,
  tell_me_more_enabled: true,
};

const solisConfig = {
  isEnabled: true,
  scriptUrl:
    'https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js',
  is_prod: false,
  cdn_hostname: 'https://cdn.dev.saas.ibm.com/solis_ui/v1',
  deployment_environment: solisDeploymentEnvironment['local'],
  product_id: 'my_product',
};

export const WithSolis: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{
          ...headerProps,
          sidekickConfig: sidekickConfig,
          solisConfig: solisConfig,
        }}"></clabs-global-header-apaas>
    </div>
  `,
};

export const Notifications: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{
          ...headerProps,
          notificationConfigs,
        }}"></clabs-global-header-apaas>
    </div>
  `,
};

export const NotificationsNew: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        hasNewNotifications
        .headerProps="${{
          ...headerProps,
          notificationConfigs,
        }}"></clabs-global-header-apaas>
    </div>
  `,
};

export const Search: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas
        .headerProps="${{
          ...headerProps,
          searchConfigs,
        }}"></clabs-global-header-apaas>
    </div>
  `,
};

export const Logo: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-apaas .headerProps="${headerProps}">
        <div slot="header-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32">
            <path
              fill="cyan"
              d="M13.5,30.8149a1.0011,1.0011,0,0,1-.4927-.13l-8.5-4.815A1,1,0,0,1,4,25V15a1,1,0,0,1,.5073-.87l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,23,15V25a1,1,0,0,1-.5073.87l-8.5,4.815A1.0011,1.0011,0,0,1,13.5,30.8149ZM6,24.417l7.5,4.2485L21,24.417V15.583l-7.5-4.2485L6,15.583Z" />
            <path
              fill="lightcyan"
              d="M28,17H26V7.583L18.5,3.3345,10.4927,7.87,9.5073,6.13l8.5-4.815a1.0013,1.0013,0,0,1,.9854,0l8.5,4.815A1,1,0,0,1,28,7Z" />
          </svg>
        </div>
      </clabs-global-header-apaas>
    </div>
  `,
};
