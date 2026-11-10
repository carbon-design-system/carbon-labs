/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import {
  ChatPanels,
  ChatPanelToggles,
  ChatPanelArea,
} from '../components/ChatPanels';
import '../components/chat-panels.scss';
import './ChatPanels.stories.scss';
import mdx from './ChatPanels.mdx';

const meta: Meta<typeof ChatPanelArea> = {
  title: 'V12/ChatPanels',
  tags: ['squad', 'incubating'],
  component: ChatPanelArea,
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    panelContent: { control: false },
    presentation: { control: 'inline-radio', options: ['push', 'overlay'] },
  },
};

export default meta;
type Story = StoryObj<typeof ChatPanelArea>;

/**
 * A surface's header with its five toggles, and the area the panel opens in.
 */
export const Default: Story = {
  args: {
    presentation: 'push',
  },
  render: (args) => (
    <ChatPanels>
      <div className="chat-panels-story">
        <div className="chat-panels-story__header">
          <ChatPanelToggles />
        </div>
        <ChatPanelArea {...args}>
          <p className="chat-panels-story__content">The conversation</p>
        </ChatPanelArea>
      </div>
    </ChatPanels>
  ),
};
