/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ChatsPanel } from '../components/ChatsPanel';
import '../components/chats-panel.scss';
// The trigger and the rows are MegaButtons; their styles come with them in a
// product's bundle.
import '../../MegaButton/components/mega-button.scss';
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
    children: 'The conversation sits here, beside the panel.',
    currentId: 'invoice',
    sections: [
      {
        label: 'Pinned',
        items: [
          { id: 'invoice', label: 'Invoice reconciliation' },
          { id: 'vendor', label: 'Vendor consolidation' },
        ],
      },
      {
        label: 'Today',
        items: [
          { id: 'q3', label: 'Q3 close checklist' },
          { id: 'travel', label: 'Travel policy questions' },
        ],
      },
      {
        label: 'Previous 7 days',
        items: [
          { id: 'onboarding', label: 'Onboarding plan for new hires' },
          { id: 'renewal', label: 'Contract renewal summary' },
        ],
      },
    ],
  },
};
