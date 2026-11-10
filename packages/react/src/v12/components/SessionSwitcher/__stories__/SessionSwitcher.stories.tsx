/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SessionSwitcher } from '../components/SessionSwitcher';
import '../components/session-switcher.scss';
// The trigger is a MegaButton; its styles come with it in a product's bundle.
import '../../MegaButton/components/mega-button.scss';
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
    currentId: 'invoice',
    sessions: [
      { id: 'invoice', label: 'Invoice reconciliation' },
      { id: 'vendor', label: 'Vendor consolidation' },
      { id: 'q3', label: 'Q3 close checklist' },
    ],
    action: { label: 'New conversation' },
  },
  render: function Render(args) {
    // The product owns which session is current; the story keeps it in state.
    const [currentId, setCurrentId] = useState(args.currentId);
    return (
      <SessionSwitcher
        {...args}
        currentId={currentId}
        onSelect={(id) => {
          setCurrentId(id);
          args.onSelect?.(id);
        }}
      />
    );
  },
};
