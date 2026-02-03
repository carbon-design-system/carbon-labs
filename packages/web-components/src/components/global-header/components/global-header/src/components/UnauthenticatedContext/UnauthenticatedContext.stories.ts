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
import { UnauthenticatedContext } from './UnauthenticatedContext';

import { html } from 'lit';
import '@carbon/web-components/es-custom/components/ui-shell/index.js';

const defaultNoAuthHeaderLinks = [
  {
    href: '/login',
    text: 'Log in',
    carbonIcon: 'Login',
    arialLabel: 'Log in',
  },
];

const meta: Meta = {
  title: 'Unauthenticated Context',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new UnauthenticatedContext(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof UnauthenticatedContext>;

export const Basic: Story = {
  render: () => html`
    <div role="main">
      <cds-custom-header aria-label="IBM webMethods Hybrid Integration">
        <cds-custom-header-name>IBM</cds-custom-header-name>
        <cds-custom-header-nav menu-bar-label="IBM [Platform]">
        </cds-custom-header-nav>
        <clabs-global-header-unauthenticated-context
          .noAuthHeaderLinks="${defaultNoAuthHeaderLinks}"></clabs-global-header-unauthenticated-context>
      </cds-custom-header>
    </div>
  `,
};
