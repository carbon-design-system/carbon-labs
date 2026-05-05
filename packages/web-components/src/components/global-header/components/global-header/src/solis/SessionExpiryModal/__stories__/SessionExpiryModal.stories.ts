/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { SessionExpiryModal } from '../SessionExpiryModal';

const meta: Meta = {
  title: 'Components/Global Header/Subcomponents/Solis/Session Expiry Modal',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: () => new SessionExpiryModal(),
  args: {},
};

export default meta;
type Story = StoryObj<typeof SessionExpiryModal>;

export const Basic: Story = {
  render: () => html`
    <div role="main">
      <clabs-global-header-session-expiry-modal
        open
        expiryTime="5 minutes"
        .logoutCallback="${() => console.log('Logout now')}"
        .continueCallback="${() => console.log('Continue session')}">
      </clabs-global-header-session-expiry-modal>
    </div>
  `,
};
