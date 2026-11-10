/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HistoryRail } from '../components/HistoryRail';
import { HistoryMarker } from '../components/HistoryMarker';
import { HistoryMarkerCard } from '../components/HistoryMarkerCard';
import type { HistoryIteration } from '../components/HistoryRail';
import { ChatThread, ChatMessage } from '@carbon-labs/react-chat-thread';
import '../components/history-rail.scss';
// Story-only: the conversation the rail sits beside brings its own styles.
import '../../ChatThread/components/chat-thread.scss';
import './HistoryRail.stories.scss';
import mdx from './HistoryRail.mdx';

const meta: Meta<typeof HistoryRail> = {
  title: 'V12/HistoryRail',
  tags: ['squad', 'incubating'],
  component: HistoryRail,
  subcomponents: { HistoryMarker, HistoryMarkerCard },
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    items: { control: false },
    className: { control: false },
    translations: { control: false },
    onChange: { action: 'changed' },
  },
  args: {
    label: 'History of this conversation',
  },
};

export default meta;
type Story = StoryObj<typeof HistoryRail>;

const history: HistoryIteration[] = [
  { id: '1', label: 'Iteration 1', description: 'Started from the brief' },
  { id: '2', label: 'Iteration 2', description: 'Drafted the latency table' },
  { id: '3', label: 'Iteration 3', description: 'Added the p99 column' },
  { id: '4', label: 'Iteration 4', description: 'Rewrote the summary' },
  { id: '5', label: 'Iteration 5', description: 'Pulled the older devices in' },
  { id: '6', label: 'Iteration 6', description: 'Split the table in two' },
  { id: '7', label: 'Iteration 7', description: 'Trimmed the preamble' },
  { id: '8', label: 'Iteration 8', description: 'Re-ran the benchmark' },
  { id: '9', label: 'Iteration 9', description: 'Merged the two tables' },
  { id: '10', label: 'Iteration 10', description: 'Fixed the units' },
  {
    id: '11',
    label: 'Iteration 11',
    description: 'Replaced the latency table with the new one',
  },
  {
    id: '12',
    label: 'Iteration 12',
    description: 'The benchmark run timed out',
    status: 'failed',
  },
  { id: '13', label: 'Iteration 13', description: 'Raised the headroom' },
  { id: '14', label: 'Iteration 14', description: 'Working on the summary' },
];

/**
 * The rail on its own. Move the pointer down the track, or tab to it and use
 * the arrow keys: the nearest iteration lights and its card opens.
 */
export const Default: Story = {
  args: { items: history, current: '9' },
  render: (args) => (
    <div className="history-rail-story__panel">
      <HistoryRail {...args} />
    </div>
  ),
};

/** Where the rail belongs: against the edge, beside the conversation. */
export const InAConversation: Story = {
  args: { items: history, current: '9' },
  render: function InAConversationStory(args) {
    const [at, setAt] = useState('11');
    return (
      <div className="history-rail-story__pane">
        <HistoryRail
          {...args}
          value={at}
          onChange={(iteration) => setAt(iteration.id)}
          className="history-rail-story__rail"
        />
        <ChatThread label="Conversation with the assistant">
          <ChatMessage from="user" timestamp="13:31">
            Can you redo the latency table with the new numbers?
          </ChatMessage>
          <ChatMessage from="assistant" timestamp="13:31">
            <p>
              Replaced the latency table with the new one. The p99 moved from
              180ms to 140ms.
            </p>
          </ChatMessage>
          <ChatMessage from="user" timestamp="13:34">
            And the older phones?
          </ChatMessage>
          <ChatMessage from="assistant" timestamp="13:35">
            <p>
              Raised headroom on the oldest device: 6ms to spare against the
              40ms budget.
            </p>
          </ChatMessage>
        </ChatThread>
      </div>
    );
  },
};

/** A run that did not finish is red — the twelfth here. */
export const WithAFailedRun: Story = {
  args: { items: history, current: '14', defaultValue: '12' },
  render: Default.render,
};

/**
 * A history longer than the panel. `maxMarks` holds the rail to what fits and
 * keeps the selected iteration in view; arrow through it and the window moves.
 */
export const LongHistory: Story = {
  args: {
    items: Array.from({ length: 60 }, (_, i) => ({
      id: `${i + 1}`,
      label: `Iteration ${i + 1}`,
      description: i % 7 === 0 ? 'Re-ran the benchmark' : 'Edited the summary',
      status: i === 41 ? ('failed' as const) : ('done' as const),
    })),
    current: '60',
    defaultValue: '44',
    maxMarks: 14,
  },
  render: Default.render,
};

/** Every mark, side by side. */
export const Marks: Story = {
  render: () => (
    <div className="history-rail-story__panel history-rail-story__marks">
      {(['default', 'highlighted', 'current', 'failed'] as const).map(
        (state) => (
          <span key={state} className="history-rail-story__mark">
            <HistoryMarker state={state} />
            <span className="history-rail-story__mark-label">{state}</span>
          </span>
        )
      )}
    </div>
  ),
};

/** The card on its own. */
export const Card: Story = {
  render: () => (
    <div className="history-rail-story__panel">
      <HistoryMarkerCard
        label="Iteration 11"
        description="Replaced the latency table with the new one"
      />
    </div>
  ),
};
