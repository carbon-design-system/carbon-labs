/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../index';
import '../components/focus-region/src/focus-region.scss';
import { html } from 'lit';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/tile/index.js';
import '@carbon/web-components/es/components/link/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/stack/index.js';
import { cdnJs, cdnCss } from '../../../globals/internal/storybook-cdn';
import packageJson from '../package.json';

export default {
  title: 'Components/FocusRegion',
  tags: ['squad', 'incubating'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    role: {
      control: { type: 'select' },
      options: [
        'region',
        'main',
        'navigation',
        'complementary',
        'banner',
        'contentinfo',
      ],
      description: 'ARIA role for the region',
      table: { defaultValue: { summary: 'region' } },
    },
    enabled: {
      control: { type: 'boolean' },
      description: 'Whether this region participates in F6 navigation',
      table: { defaultValue: { summary: 'true' } },
    },
    showNavigationHint: {
      control: { type: 'boolean' },
      description: 'Show a one-time navigation hint on first keyboard focus',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

const instructions = html`
  <cds-tile style="margin-bottom: 1rem">
    <p>
      Press <kbd>F6</kbd> to navigate between regions. Press
      <kbd>Shift+F6</kbd> to navigate backwards.
    </p>
  </cds-tile>
`;

/**
 * Basic example with four regions — F6 moves between them in DOM order.
 */
export const Default = () => html`
  <style>
    .sidebar-layout {
      display: grid;
      grid-template-columns: 1fr 3fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    kbd {
      display: inline-block;
      padding: 0 0.25rem;
      background: var(--cds-layer-01, #f4f4f4);
      border: 1px solid var(--cds-border-subtle-01, #c6c6c6);
      border-radius: 2px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.85em;
    }
  </style>

  ${instructions}

  <clabs-focus-region role="banner" aria-label="Header" default-focus>
    <cds-tile style="margin-bottom: 1rem">
      <h2 style="margin-bottom: 1rem">Header</h2>
      <cds-stack orientation="horizontal" gap="5">
        <cds-button>Home</cds-button>
        <cds-button>About</cds-button>
        <cds-button>Contact</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>

  <div class="sidebar-layout">
    <clabs-focus-region role="navigation" aria-label="Sidebar navigation">
      <cds-tile style="height: 100%">
        <h2 style="margin-bottom: 1rem">Navigation</h2>
        <cds-stack gap="4">
          <cds-link href="#">Section 1</cds-link>
          <cds-link href="#">Section 2</cds-link>
          <cds-link href="#">Section 3</cds-link>
        </cds-stack>
      </cds-tile>
    </clabs-focus-region>

    <clabs-focus-region role="main" aria-label="Main content">
      <cds-tile style="margin-bottom: 1rem">
        <h2 style="margin-bottom: 1rem">Main Content</h2>
        <cds-stack gap="5">
          <cds-text-input label="Name" placeholder="Enter your name"></cds-text-input>
          <cds-text-input label="Email" placeholder="Enter your email"></cds-text-input>
          <cds-button type="submit">Submit</cds-button>
        </cds-stack>
      </cds-tile>
    </clabs-focus-region>
  </div>

  <clabs-focus-region role="contentinfo" aria-label="Footer">
    <cds-tile>
      <h2 style="margin-bottom: 1rem">Footer</h2>
      <cds-stack orientation="horizontal" gap="5">
        <cds-button kind="ghost">Privacy Policy</cds-button>
        <cds-button kind="ghost">Terms of Service</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>
`;

/**
 * A disabled region is skipped during F6 navigation.
 */
export const WithDisabledRegion = () => {
  let sidebarEnabled = true;

  const toggle = (e) => {
    sidebarEnabled = !sidebarEnabled;
    e.target.textContent = sidebarEnabled ? 'Disable Sidebar' : 'Enable Sidebar';
    const sidebar = document.getElementById('wc-sidebar');
    if (sidebar) {
      sidebar.enabled = sidebarEnabled;
    }
  };

  return html`
    <style>
      .sidebar-layout {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 1rem;
      }
      kbd {
        display: inline-block;
        padding: 0 0.25rem;
        background: var(--cds-layer-01, #f4f4f4);
        border: 1px solid var(--cds-border-subtle-01, #c6c6c6);
        border-radius: 2px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.85em;
      }
    </style>

    <cds-tile style="margin-bottom: 1rem">
      <p>Toggle the sidebar to see how a disabled region is skipped during <kbd>F6</kbd> navigation.</p>
    </cds-tile>

    <clabs-focus-region role="banner" aria-label="Controls" default-focus>
      <cds-tile style="margin-bottom: 1rem">
        <h2 style="margin-bottom: 1rem">Controls</h2>
        <cds-button @click=${toggle}>Disable Sidebar</cds-button>
      </cds-tile>
    </clabs-focus-region>

    <div class="sidebar-layout">
      <clabs-focus-region
        id="wc-sidebar"
        role="navigation"
        aria-label="Sidebar"
        enabled>
        <cds-tile>
          <h2 style="margin-bottom: 1rem">Sidebar</h2>
          <cds-stack gap="4">
            <cds-link href="#">Link 1</cds-link>
            <cds-link href="#">Link 2</cds-link>
          </cds-stack>
        </cds-tile>
      </clabs-focus-region>

      <clabs-focus-region role="main" aria-label="Main content">
        <cds-tile>
          <h2 style="margin-bottom: 1rem">Main Content</h2>
          <p style="margin-bottom: 1rem">This region is always enabled.</p>
          <cds-button>Action</cds-button>
        </cds-tile>
      </clabs-focus-region>
    </div>
  `;
};

/**
 * Focus location memory — F6 returns to the last focused element in a region.
 */
export const FocusLocationTracking = () => html`
  <cds-tile style="margin-bottom: 1rem">
    <p>
      Tab to different elements within a region, then press <kbd>F6</kbd> to
      move away. Press <kbd>F6</kbd> again to return — focus lands on the last
      element you were on in that region.
    </p>
  </cds-tile>

  <clabs-focus-region role="region" aria-label="Region 1" default-focus>
    <cds-tile style="margin-bottom: 1rem">
      <h2 style="margin-bottom: 1rem">Region 1</h2>
      <cds-stack gap="5">
        <cds-stack orientation="horizontal" gap="5">
          <cds-button>Button 1</cds-button>
          <cds-button>Button 2</cds-button>
          <cds-button>Button 3</cds-button>
        </cds-stack>
        <cds-text-input label="Input 1"></cds-text-input>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>

  <clabs-focus-region role="region" aria-label="Region 2">
    <cds-tile style="margin-bottom: 1rem">
      <h2 style="margin-bottom: 1rem">Region 2</h2>
      <cds-stack gap="5">
        <cds-text-input label="Input 2"></cds-text-input>
        <cds-text-input label="Input 3"></cds-text-input>
        <cds-button type="submit">Submit</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>

  <clabs-focus-region role="region" aria-label="Region 3">
    <cds-tile>
      <h2 style="margin-bottom: 1rem">Region 3</h2>
      <cds-stack gap="4">
        <cds-link href="#">Link 1</cds-link>
        <cds-link href="#">Link 2</cds-link>
        <cds-link href="#">Link 3</cds-link>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>
`;

/**
 * A one-time navigation hint appears on first keyboard focus.
 * The hint uses cds-actionable-notification and is shown at most once per session.
 */
export const WithNavigationHint = () => html`
  <cds-tile style="margin-bottom: 1rem">
    <p>Tab into a region to see the navigation hint.</p>
    <cds-button style="margin-top: 1rem">Start here — Tab to enter a region</cds-button>
  </cds-tile>

  <clabs-focus-region
    role="banner"
    aria-label="Header"
    show-navigation-hint>
    <cds-tile style="margin-bottom: 1rem">
      <h2 style="margin-bottom: 1rem">Header</h2>
      <cds-stack orientation="horizontal" gap="5">
        <cds-button>Home</cds-button>
        <cds-button>About</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>

  <clabs-focus-region
    role="main"
    aria-label="Main content"
    show-navigation-hint>
    <cds-tile style="margin-bottom: 1rem">
      <h2 style="margin-bottom: 1rem">Main Content</h2>
      <cds-stack gap="5">
        <cds-text-input label="Name"></cds-text-input>
        <cds-button>Submit</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>

  <clabs-focus-region
    role="contentinfo"
    aria-label="Footer"
    show-navigation-hint>
    <cds-tile>
      <h2 style="margin-bottom: 1rem">Footer</h2>
      <cds-stack orientation="horizontal" gap="5">
        <cds-button kind="ghost">Privacy Policy</cds-button>
        <cds-button kind="ghost">Terms</cds-button>
      </cds-stack>
    </cds-tile>
  </clabs-focus-region>
`;
