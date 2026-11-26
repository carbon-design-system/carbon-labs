/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SystemMessage } from '../components/SystemMessage';
import {
  ChatThread,
  ChatMessage,
  ChatSection,
} from '@carbon-labs/react-chat-thread';
import '../components/system-message.scss';
// Story-only: the conversation the notice sits in brings its own styles.
import '../../ChatThread/components/chat-thread.scss';
import './SystemMessage.stories.scss';
import mdx from './SystemMessage.mdx';

const meta: Meta<typeof SystemMessage> = {
  title: 'V12/SystemMessage',
  tags: ['squad', 'incubating'],
  component: SystemMessage,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    className: { control: false },
    severity: {
      control: 'radio',
      options: ['status', 'alert'],
    },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SystemMessage>;

/**
 * A fact about the conversation: recessive, and it waits its turn to be read
 * out.
 */
export const Default: Story = {
  args: {
    text: 'Model changed to Granite 3.1',
    severity: 'status',
  },
};

/**
 * Something that cost the person work. The ink, the glyph and the live region
 * move together — this one interrupts.
 */
export const Alert: Story = {
  args: {
    text: 'Conversation cleared — 14 messages removed',
    severity: 'alert',
  },
};

/**
 * The words say whatever the notice is: a date, a model change, a compaction, a
 * deletion. A boundary is a `ChatSection`, which puts a Rule either side.
 */
export const InASection: Story = {
  render: () => (
    <div className="sb-system-message-sections">
      <ChatSection>
        <SystemMessage text="Today" />
      </ChatSection>
      <ChatSection>
        <SystemMessage text="Conversation compacted — 42 messages summarized" />
      </ChatSection>
      <ChatSection>
        <SystemMessage text="Message deleted" />
      </ChatSection>
    </div>
  ),
};

/**
 * Where it actually lives: between turns, marking what happened to the
 * conversation rather than what was said in it.
 */
export const InAThread: Story = {
  render: () => (
    <div className="sb-system-message-thread">
      <ChatThread label="Conversation with the assistant">
        <ChatMessage from="user" timestamp="13:31">
          Summarise the latency work so far.
        </ChatMessage>
        <ChatMessage from="assistant" timestamp="13:31">
          Three regressions, all in the cache warm-up path.
        </ChatMessage>
        <ChatSection>
          <SystemMessage text="Today" />
        </ChatSection>
        <SystemMessage text="Model changed to Granite 3.1" />
        <ChatMessage from="user" timestamp="09:02">
          Try the second one again.
        </ChatMessage>
        <SystemMessage
          severity="alert"
          text="Conversation cleared — 14 messages removed"
        />
        <ChatMessage from="assistant" timestamp="09:04">
          Starting fresh. What would you like to look at?
        </ChatMessage>
      </ChatThread>
    </div>
  ),
};
