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
import { delay, http, HttpResponse } from 'msw';
import { HybridIpaasHeader } from '../HybridIpaasHeader';
import { html } from 'lit';
import type {
  GlobalActionConfig,
  SearchConfigs,
  TrialConfigs,
} from '../../../types/Header.types';
import { TrialLinkType } from '../../../types/Header.types';
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
        http.get(
          '/hybrid-ipaas/v1/header/options',
          async () => {
            await delay();
            return HttpResponse.json(mockHeaderOptions);
          }
        ),
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
        http.get(
          '/hybrid-ipaas/v1/header/options',
          async () => {
            await delay();
            return HttpResponse.json({ ...mockHeaderOptions, trialConfigs });
          }
        ),
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
        http.get(
          '/hybrid-ipaas/v1/header/options',
          async () => {
            await delay();
            return HttpResponse.json(mockHeaderOptions);
          }
        ),
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
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
    label: 'Cloud Services global action',
    carbonIcon: 'CloudServices',
    tooltip: 'This is a tooltip',
    onClick: () => {
      console.log('Cloud Services global action clicked!');
    },
  },
];

export const CustomFooter: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
        http.get('/hybrid-ipaas/v1/header/options', () => {
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

export const WithCookiePrefs: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
        addCookiePreferences></clabs-global-header-hybrid-ipaas>
    </div>
  `,
};

export const WithYPCContentInjected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/hybrid-ipaas/v1/header/options', () => {
          return HttpResponse.json(mockHeaderOptions);
        }),
      ],
    },
    docs: {
      description: {
        story:
          'This story demonstrates how external scripts can inject content into the `data-ypc-link` placeholder. **Click the profile menu** to see the "Your privacy choices" link with icon automatically appear in the footer.',
      },
    },
  },
  render: () => {
    // Use a unique ID for this story instance
    const storyId = 'ypc-injector-' + Date.now();

    const injectYPCContent = (ypcDiv: Element) => {
      if (ypcDiv.innerHTML.trim() === '') {
        ypcDiv.innerHTML = `
          <a
            href="#"
            class="automation-global-header__popover__link"
            target="_blank"
            rel="noreferrer"
            aria-label="Your privacy choices">
            <span class="link_icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor">
                <path d="M8 1L3 3v4c0 3.5 2.5 6.5 5 7 2.5-.5 5-3.5 5-7V3l-5-2zm0 1.3L12 4v3c0 2.8-2 5.2-4 5.9-2-.7-4-3.1-4-5.9V4l4-1.7z"/>
                <path d="M6.5 7.5L5 9l2 2 4-4-1.5-1.5L7 8z"/>
              </svg>
            </span>
            <span class="link_text">Your privacy choices</span>
          </a>
        `;
        console.log('✅ YPC content injected successfully!');
      }
    };

    const checkForYPCDiv = () => {
      const searchInShadowRoot = (
        root: ShadowRoot | Document
      ): Element | null => {
        // Search in this shadow root
        const ypcDiv = root.querySelector('div[data-ypc-link]');
        if (ypcDiv) {
          return ypcDiv;
        }

        // Search in nested shadow roots
        const elements = root.querySelectorAll('*');
        for (const el of elements) {
          if (el.shadowRoot) {
            const found = searchInShadowRoot(el.shadowRoot);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      const ypcDiv = searchInShadowRoot(document);
      if (ypcDiv) {
        injectYPCContent(ypcDiv);
      }
    };

    // Set up interval and store the ID
    const intervalId = setInterval(checkForYPCDiv, 300);
    (window as any)[storyId] = intervalId;

    console.log('🔍 YPC injector script active for this story only');

    // Create a container that will clean up when removed
    const container = document.createElement('div');
    container.setAttribute('role', 'main');
    container.setAttribute('data-ypc-story', storyId);

    // Set up cleanup when the story unmounts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (
            node === container ||
            (node as Element).querySelector?.(`[data-ypc-story="${storyId}"]`)
          ) {
            clearInterval((window as any)[storyId]);
            delete (window as any)[storyId];
            observer.disconnect();
            console.log('🧹 YPC injector cleaned up');
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return html`
      <div role="main" data-ypc-story="${storyId}">
        <clabs-global-header-hybrid-ipaas
          productName="App Connect"
          productKey="appconnect"></clabs-global-header-hybrid-ipaas>
      </div>
    `;
  },
};

export const CustomActions: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
        http.get('/hybrid-ipaas/v1/header/options', () => {
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
        http.get(
          '/hybrid-ipaas/v1/header/options',
          async () => {
            await delay();
            return HttpResponse.json(mockHeaderOptions);
          }
        ),
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

export const Logo: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          '/hybrid-ipaas/v1/header/options',
          async () => {
            await delay();
            return HttpResponse.json(mockHeaderOptions);
          }
        ),
      ],
    },
  },
  render: () => html`
    <div role="main">
      <clabs-global-header-hybrid-ipaas
        productName="App Connect"
        productKey="appconnect">
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
      </clabs-global-header-hybrid-ipaas>
    </div>
  `,
};
