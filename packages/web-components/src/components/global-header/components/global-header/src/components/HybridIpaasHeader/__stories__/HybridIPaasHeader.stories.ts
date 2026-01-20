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
import { initialize, mswLoader } from 'msw-storybook-addon';
import { http, HttpResponse } from 'msw';
import { HybridIpaasHeader } from '../HybridIpaasHeader';
import { html } from 'lit';
import {
  GlobalActionConfig,
  SearchConfigs,
  TrialConfigs,
  TrialLinkType,
} from '../../../types/Header.types';
import {
  CUSTOM_EVENT_NAME,
  CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS,
} from '../../../constant';
import mockHeaderOptions from './headeroptions.json';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const meta: Meta = {
  title:
    'Components/Global Header/Subcomponents/webMethods Hybrid Integration Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new HybridIpaasHeader(),
  args: {},
  loaders: [mswLoader],
};

const callback = () => {
  alert('callback activated!');
};
document.addEventListener('ai-callback-event', () => callback());

export default meta;
type Story = StoryObj<typeof HybridIpaasHeader>;

const trialDate = new Date();
trialDate.setDate(trialDate.getDate() + 30);
const trialConfigs: TrialConfigs = {
  trialCount: 30,
  warning: false,
  trialLabel: 'Trial days left',
  description: `Your trial ends on ${trialDate.toLocaleString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`,
  links: [
    {
      type: TrialLinkType.requestQuote,
      label: 'Request trial extension',
      href: '#',
    },
  ],
  actionText: 'Contact sales',
  actionLink: 'https://www.ibm.com',
};

export const Basic: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        productVersion="2.3.4.5"
        .notificationOpenCallback="${callback}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const BasicWithTrial: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json({ ...mockHeaderOptions, trialConfigs });
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        .notificationOpenCallback="${callback}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const Platform: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productKey="mycloud"
        productVersion="2.3.4.5"</clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const WithAIChat: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json({ ...mockHeaderOptions, trialConfigs });
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        aiCallbackEvent="ai-callback-event"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const WithSolis: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json({ ...mockHeaderOptions, trialConfigs });
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        solisEnvironment="local"
        solisDevMode
        solisSwitcherEnabled
        solisSidekickEnabled>
      </clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

const capabilityProfileFooterLinks = [
  {
    text: 'About us',
    href: '#',
    arialLabel: 'About us',
    carbonIcon: 'UserProfile',
  },
  {
    text: 'Helpful link',
    href: '#',
    arialLabel: 'Helpful link',
    carbonIcon: 'Launch',
  },
];

const capabilityGlobalActions: GlobalActionConfig[] = [
  {
    label: 'App Connect global action',
    carbonIcon: 'AppConnectivity',
    onClick: () => {
      console.log('App Connect global action clicked!');
    },
  },
];

export const CustomFooter: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        .capabilityProfileFooterLinks="${capabilityProfileFooterLinks}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const LogoutCallback: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        .capabilityProfileFooterLinks="${capabilityProfileFooterLinks}"
        .logoutCallback="${() =>
          console.log(
            'Logout callback triggered!'
          )}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const CustomActions: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        .capabilityGlobalActions="${capabilityGlobalActions}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

const searchConfigs: SearchConfigs = {
  callback: (value: string) => {
    console.log(value);
  },
  placeholder: 'Search...',
  submitCallback: (value: string) => {
    console.log(`Search submit triggered: '${value}'`);
  },
};

export const SearchCallback: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect"
        .searchConfigs="${searchConfigs}"></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

const sendRefresh = () => {
  mockHeaderOptions.brand.product = 'Mock Product';
  document.dispatchEvent(
    new CustomEvent(CUSTOM_EVENT_NAME, {
      detail: CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS,
    })
  );
};

export const RefreshOptions: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6007/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productKey="mycloud"
        productVersion="2.3.4.5"></clabs-global-header-hybrid-ipaas>
      <br />
      <br />
      <br />
      <button @click="${sendRefresh}">Refresh header options</button>
    </div>
  `,
};
