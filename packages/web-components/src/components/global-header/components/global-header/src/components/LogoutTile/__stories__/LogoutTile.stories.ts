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

import { LogoutTile } from '../LogoutTile';

const meta: Meta = {
  title: 'Components/Global Header/Subcomponents/Logout Tile',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new LogoutTile(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof LogoutTile>;

const brand = {
  company: 'IBM',
  product: 'App Connect',
};

export const Basic: Story = {
  render: () => html`
    <div role="main">
        <clabs-global-header-logout-tile brandCompany="${brand.company}" brandProduct="${brand.product}" loginHref="http://www.ibm.com" logoutText="You are being logged out" buttonLabel="Log in"></clabs-global-header-logout-tile>
      </cds-custom-header>
    </div>
  `,
};
