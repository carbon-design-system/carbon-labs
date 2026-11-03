/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SessionSwitcher } from '../components/SessionSwitcher';
import '../components/session-switcher.scss';
import mdx from './SessionSwitcher.mdx';

const meta: Meta<typeof SessionSwitcher> = {
  title: 'V12/SessionSwitcher',
  tags: ['squad', 'incubating'],
  component: SessionSwitcher,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof SessionSwitcher>;

/**
 * Default story for SessionSwitcher
 */
export const Default: Story = {
  args: {
    children: 'SessionSwitcher',
  },
};
