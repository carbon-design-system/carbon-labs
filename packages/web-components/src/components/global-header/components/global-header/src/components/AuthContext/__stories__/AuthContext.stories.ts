/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

import type { Meta } from '@storybook/web-components-vite';
import { CommonHeader } from '../../CommonHeader/CommonHeader.ts';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta = {
  title: 'Profile Popover (AuthContext)',
  render: () => new CommonHeader(),
  argTypes: {},
};

export default meta;

const renderAuthContext = (args) =>
  html` <apaas-common-header .headerProps="${args}"></common-header> `;

export const Default = renderAuthContext.bind({});
Default.args = {
  profile: {
    imageUrl: null,
    email: 'user@test.com',
    displayName: 'Sample User',
  },
  enableLogs: true,
  managementConsole: {
    href: '#',
    text: 'IBM SaaS Console',
  },
  mainSectionItems: [
    { label: 'Instance name', text: 'APIC-MB-DEV' },
    { label: 'Region', text: 'us-east-1 (N Virginia)' },
    { label: 'Instance owner', text: 'user@ibm.com' },
  ],
  footerSectionItems: [
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
  ],
  userManagement: {
    href: '',
    text: 'User management',
    icon: 'UserFollow',
  },
  profileFooterLinks: [
    {
      text: 'Logout',
      href: '/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
      onClickHandler: () => {
        console.log('onClickHandler clicked');
      },
    },
  ],
};
