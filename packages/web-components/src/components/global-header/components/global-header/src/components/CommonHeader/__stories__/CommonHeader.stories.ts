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
      text: 'Logout',
      href: '/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
      newTab: false,
      newTabIcon: false,
    },
  ],
  sideNav: {
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
};

const hybridIPaasHeaderProps = {
  isHybridIpaas: true,
  brand: {
    company: 'IBM',
    product: 'webMethods Hybrid Integration',
  },
  capabilityName: {
    label: 'App Connect',
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
      text: 'Logout',
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
        // { label: 'Manage environments', href: '#', carbonIcon: 'Settings', isLinkItem: true }
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
            href: 'https://ibm.com',
            label: 'Home',
            iconName: 'Home',
            isActive: false,
          },
          {
            href: 'http://google.com',
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
            iconName: 'Api',
            isSideNavMenuItems: true,
            isActive: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'API Connect',
              },
            ],
          },
          {
            label: 'App Integration',
            iconName: 'FlowConnection',
            isSideNavMenuItems: true,
            isActive: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'webMethods Integration',
              },
              {
                href: 'https://ibm.com',
                label: 'App Connect',
              },
            ],
          },
          {
            href: '#',
            label: 'Event endpoint management',
            iconName: 'IbmEventAutomation',
          },
        ],
      },
      {
        links: [
          {
            href: '#',
            label: 'Metering',
            iconName: 'Meter',
          },
          {
            href: '#',
            label: 'End-to-end monitoring',
            iconName: 'Analytics',
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
    hasNewNotifications: true,
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
      text: 'Logout',
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
			<apaas-common-header .headerProps="${headerProps}"></common-header>
		</div>
	`,
};

export const UnauthenticatedContext: Story = {
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${headerPropsUnauthenticated}"></common-header>
		</div>
	`,
};

export const WebMethodsHybridIntegration: Story = {
  name: 'webMethods Hybrid Integration',
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${hybridIPaasHeaderProps}"></common-header>
		</div>
	`,
};

export const HelpLinks: Story = {
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${headerPropsWithHelpLinks}"></common-header>
		</div>
	`,
};

export const ChatBot: Story = {
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${{
        ...headerProps,
        chatBotConfigs,
      }}"></common-header>
		</div>
	`,
};

export const Notifications: Story = {
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${{
        ...headerProps,
        notificationConfigs,
      }}"></common-header>
		</div>
	`,
};

export const Search: Story = {
  render: () => html`
		<div role="main">
			<apaas-common-header .headerProps="${{
        ...headerProps,
        searchConfigs,
      }}"></common-header>
		</div>
	`,
};
