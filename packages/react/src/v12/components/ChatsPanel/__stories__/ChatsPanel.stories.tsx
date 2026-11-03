/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ChatsPanel } from '../components/ChatsPanel';
import '../components/chats-panel.scss';
import mdx from './ChatsPanel.mdx';

const meta: Meta<typeof ChatsPanel> = {
  title: 'V12/ChatsPanel',
  tags: ['squad', 'incubating'],
  component: ChatsPanel,
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
type Story = StoryObj<typeof ChatsPanel>;

/**
 * Default story for ChatsPanel
 */
export const Default: Story = {
  args: {
    children: 'ChatsPanel',
  },
};
