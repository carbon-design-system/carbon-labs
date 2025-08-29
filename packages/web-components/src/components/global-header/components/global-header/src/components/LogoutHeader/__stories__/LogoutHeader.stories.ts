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
import { html } from 'lit';

import { LogoutHeader } from '../LogoutHeader';

const meta: Meta = {
  title: 'Components/Global Header/Subcomponents/Logout Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new LogoutHeader(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof LogoutHeader>;

export const Basic: Story = {
  render: () => html`
    <div role="main">
      <apaas-logout-header brandCompany="Company name"></apaas-logout-header>
    </div>
  `,
};

export const Corporate: Story = {
  render: () => html`
    <div role="main">
      <apaas-logout-header brandCompany="IBM"></apaas-logout-header>
    </div>
  `,
};
