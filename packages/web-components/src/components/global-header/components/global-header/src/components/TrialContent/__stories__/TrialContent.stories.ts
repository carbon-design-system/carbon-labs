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

const trialDate = new Date();
trialDate.setDate(trialDate.getDate() + 30);

const warningDate = new Date();
warningDate.setDate(warningDate.getDate() + 2);

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta = {
  title: 'Trial Banner',
  render: () => new CommonHeader(),
  argTypes: {},
};

export default meta;

const renderTrialTooltip = (args) =>
  html` <apaas-common-header .headerProps="${args}"></common-header> `;

export const Default = renderTrialTooltip.bind({});
Default.args = {
  brand: {
    company: 'IBM',
    product: 'SaaS Console',
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
  trialConfigs: {
    trialCount: 30,
    warning: false,
    trialLabel: 'Trial days left',
    description: `Your trial ends on ${trialDate.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`,
    links: [{ type: 'invite', label: 'Invite team member', href: '#' }],
    actionText: 'Contact sales',
    actionLink: 'https://www.ibm.com',
  },
};

export const Warning = renderTrialTooltip.bind({});
Warning.args = {
  brand: {
    company: 'IBM',
    product: 'SaaS Console',
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
  trialConfigs: {
    trialCount: 2,
    warning: true,
    trialLabel: 'Trial days left',
    description: `Your trial ends on ${warningDate.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`,
    links: [{ type: 'invite', label: 'Invite team member', href: '#' }],
    actionText: 'Contact sales',
    actionLink: 'https://www.ibm.com',
  },
};

export const Expired = renderTrialTooltip.bind({});
Expired.args = {
  brand: {
    company: 'IBM',
    product: 'SaaS Console',
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
  trialConfigs: {
    trialCount: 0,
    warning: true,
    trialLabel: 'Trial days left',
    description: `Your trial ends on ${trialDate.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`,
    links: [{ type: 'invite', label: 'Invite team member', href: '#' }],
    actionText: 'Contact sales',
    actionLink: 'https://www.ibm.com',
  },
};
