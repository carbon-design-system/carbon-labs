/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Copy, Edit, Renew, ThumbsDown, ThumbsUp } from '@carbon/icons-react';
import { ChatThread } from '../components/ChatThread';
import { ChatMessage, ChatMessageAction } from '../components/ChatMessage';
import {
  ReasoningTrace,
  ReasoningStep,
} from '@carbon-labs/react-reasoning-trace';
import { CodeSnippet, InlineCode } from '@carbon-labs/react-code-snippet-alt';
import '../components/chat-thread.scss';
// Story-only: the parts a turn composes bring their own styles.
import '../../MegaButton/components/mega-button.scss';
import '../../ReasoningTrace/components/reasoning-trace.scss';
import '../../CodeSnippetAlt/components/code-snippet.scss';
import './ChatThread.stories.scss';
import mdx from './ChatThread.mdx';

const meta: Meta<typeof ChatThread> = {
  title: 'V12/ChatThread',
  tags: ['squad', 'incubating'],
  component: ChatThread,
  subcomponents: { ChatMessage, ChatMessageAction },
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    align: { control: 'radio', options: ['bottom', 'top'] },
    density: { control: 'radio', options: ['balanced', 'compact'] },
    announcement: { control: false },
    children: { control: false },
    className: { control: false },
  },
  args: {
    align: 'bottom',
    density: 'balanced',
    label: 'Conversation with the assistant',
  },
  decorators: [
    (Story) => (
      <div className="chat-thread-story__pane">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatThread>;

function UserActions() {
  return (
    <>
      <ChatMessageAction icon={Copy} label="Copy" />
      <ChatMessageAction icon={Edit} label="Edit" />
    </>
  );
}

/** The three controls under a reply, with the vote held as state. */
function ReplyActions() {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <>
      <ChatMessageAction
        icon={ThumbsUp}
        label="Good response"
        isSelected={vote === 'up'}
        onClick={() => setVote(vote === 'up' ? null : 'up')}
      />
      <ChatMessageAction
        icon={ThumbsDown}
        label="Bad response"
        isSelected={vote === 'down'}
        onClick={() => setVote(vote === 'down' ? null : 'down')}
      />
      <ChatMessageAction icon={Renew} label="Regenerate" />
    </>
  );
}

const question = 'Can you synthesize insights into a briefing?';

/**
 * A question and a plain answer. The actions and the time are there on hover
 * or keyboard focus, in the gap below the turn.
 */
export const Default: Story = {
  render: (args) => (
    <ChatThread {...args}>
      <ChatMessage from="user" actions={<UserActions />} timestamp="13:37">
        {question}
      </ChatMessage>
      <ChatMessage
        from="assistant"
        actions={<ReplyActions />}
        timestamp="13:37">
        <p>
          Here is the briefing. The three themes that recur are consolidation,
          pricing pressure, and on-device inference.
        </p>
      </ChatMessage>
    </ChatThread>
  ),
};

/**
 * The turn the design shows: a resolved trace, a line naming the file it
 * wrote, the plan it followed, and the answer. No timestamp — the trace
 * already says how long the work took.
 */
export const AgentTurn: Story = {
  render: (args) => (
    <ChatThread {...args}>
      <ChatMessage from="user" actions={<UserActions />} timestamp="13:37">
        {question}
      </ChatMessage>
      <ChatMessage from="assistant" actions={<ReplyActions />}>
        <ReasoningTrace
          label="Complete"
          duration="1m 48s"
          defaultOpen
          onViewDetails={() => {}}>
          <ReasoningStep label="Deciding where the spec should live in the repo">
            docs/components/ holds the PRDs; specs/ is unused since March.
          </ReasoningStep>
          <ReasoningStep label="Ran a command on your computer">
            <CodeSnippet
              language="Shell"
              code={'rg --files docs | head\ngit log -1 --stat specs/'}
            />
          </ReasoningStep>
          <ReasoningStep label="Read files" />
          <ReasoningStep label="Weighed latency trade-offs" />
        </ReasoningTrace>
        <p>
          I’ve mapped the activity states and saved them in{' '}
          <InlineCode>activity-model.md</InlineCode>
        </p>
        <p>
          Here’s the <strong>full output of the commands</strong>. Here’s some
          more information based on that output.
        </p>
      </ChatMessage>
    </ChatThread>
  ),
};

/** A long question wraps inside the bubble and stops at three quarters. */
export const LongQuestion: Story = {
  render: (args) => (
    <ChatThread {...args}>
      <ChatMessage from="user" actions={<UserActions />} timestamp="13:36">
        Can you synthesize the interview insights into a one-page briefing for
        the leadership review on Thursday, with the three recurring themes
        first?
      </ChatMessage>
      <ChatMessage
        from="assistant"
        actions={<ReplyActions />}
        timestamp="13:37">
        <p>Yes — here it is, themes first.</p>
      </ChatMessage>
    </ChatThread>
  ),
};

/** Compact, for a narrow pane or one thread among several. */
export const Compact: Story = {
  args: { density: 'compact' },
  render: Default.render,
};

/** Read as a document: the conversation starts at the top. */
export const AlignTop: Story = {
  args: { align: 'top' },
  render: Default.render,
};

/** Several turns, to read the rhythm. */
export const Conversation: Story = {
  render: (args) => (
    <ChatThread
      {...args}
      announcement="New reply: Yes — the latency budget holds.">
      <ChatMessage from="user" actions={<UserActions />} timestamp="13:31">
        What did the on-device inference work land on?
      </ChatMessage>
      <ChatMessage
        from="assistant"
        actions={<ReplyActions />}
        timestamp="13:31">
        <p>A 40ms budget per frame, with the model quantized to 8 bits.</p>
      </ChatMessage>
      <ChatMessage from="user" actions={<UserActions />} timestamp="13:34">
        Does that hold on the older phones?
      </ChatMessage>
      <ChatMessage from="assistant" actions={<ReplyActions />}>
        <ReasoningTrace label="Complete" duration="22s">
          <ReasoningStep label="Read the benchmark table" />
          <ReasoningStep label="Compared three devices" />
        </ReasoningTrace>
        <p>Yes — the latency budget holds, with 6ms to spare on the oldest.</p>
      </ChatMessage>
    </ChatThread>
  ),
};
