/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { ActivityFeed } from '../index';
import type {
  ActivityEvent,
  ActivityFeedCategory,
  ActivityFeedProps,
} from '../index';
import mdx from './ActivityFeed.mdx';

export default {
  title: 'V12/ActivityFeed',
  component: ActivityFeed,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'list-arrival',
        'place-hold',
        'floating-snap',
        'disclosure',
        'content-swap',
        'soft-edge',
        'skeleton-reveal',
        'stillness',
      ],
      reduced: {
        'list-arrival': 'shorter-clock',
        'place-hold': 'at-once',
        'content-swap': 'at-once',
      },
      states: ['loading', 'empty', 'loaded'],
    },
  },
  argTypes: {
    label: { control: 'text' },
    filterLabel: { control: 'text' },
    allLabel: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptySubtitle: { control: 'text' },
    todayLabel: { control: 'text' },
    yesterdayLabel: { control: 'text' },
    latestLabel: { control: 'text' },
    showDetailsLabel: { control: 'text' },
    hideDetailsLabel: { control: 'text' },
    windowAt: { control: 'number' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    events: { control: false },
    categories: { control: false },
    defaultSelectedCategories: { control: false },
    onSelectedCategoriesChange: { control: false },
    newEventsLabel: { control: false },
    timeWords: { control: false },
  },
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A frame with a height: the feed fills it and scrolls inside it. */
const frame = {
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  blockSize: 480,
  maxInlineSize: 480,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const CATEGORIES: ActivityFeedCategory[] = [
  { id: 'deploys', label: 'Deploys' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'comments', label: 'Comments' },
];

const ACTORS = [
  'Avery Lane',
  'Jordan Pike',
  'Riley Shore',
  'Morgan Vale',
  'Casey Brook',
  'Quinn Hale',
];

/** Today, yesterday and an earlier day, newest first. */
function sampleEvents(now = Date.now()): ActivityEvent[] {
  return [
    {
      id: 'e1',
      actor: 'Avery Lane',
      action: 'deployed',
      object: 'web-app 2.4.0',
      timestamp: now - 2 * MINUTE,
      category: 'deploys',
      kind: 'success',
    },
    {
      id: 'e2',
      actor: 'Jordan Pike',
      action: 'asked for your review of',
      object: 'Update the sign-in page',
      timestamp: now - 18 * MINUTE,
      category: 'reviews',
      kind: 'pending',
      kindLabel: 'Waiting for review',
      actions: [{ text: 'Approve' }, { text: 'Request changes' }],
    },
    {
      id: 'e3',
      actor: 'Riley Shore',
      action: 'commented on',
      object: 'Quarterly plan',
      timestamp: now - 2 * HOUR,
      category: 'comments',
      detail: 'The second milestone looks tight. Can we move it a week?',
    },
    {
      id: 'e4',
      actor: 'Morgan Vale',
      action: 'deployed',
      object: 'api-service 1.9.2',
      timestamp: now - DAY,
      category: 'deploys',
      kind: 'error',
      detail:
        'The health check failed after 3 retries. The previous version is still live.',
    },
    {
      id: 'e5',
      actor: 'Casey Brook',
      action: 'approved',
      object: 'Add the export button',
      timestamp: now - DAY - 3 * HOUR,
      category: 'reviews',
      kind: 'success',
      kindLabel: 'Approved',
    },
    {
      id: 'e6',
      actor: 'Quinn Hale',
      action: 'commented on',
      object: 'Release notes',
      timestamp: now - 3 * DAY,
      category: 'comments',
      detail: 'Added a line about the new keyboard shortcuts.',
    },
    {
      id: 'e7',
      actor: 'Avery Lane',
      action: 'paused',
      object: 'nightly-sync',
      timestamp: now - 3 * DAY - 2 * HOUR,
      category: 'deploys',
      kind: 'paused',
    },
  ];
}

let made = 0;

/** A new event, just now. */
function newEvent(): ActivityEvent {
  made += 1;
  const actor = ACTORS[made % ACTORS.length] ?? 'Avery Lane';
  const pick = made % 3;
  return pick === 0
    ? {
        id: `new-${made}`,
        actor,
        action: 'deployed',
        object: `build ${100 + made}`,
        timestamp: Date.now(),
        category: 'deploys',
        kind: 'success',
      }
    : pick === 1
      ? {
          id: `new-${made}`,
          actor,
          action: 'commented on',
          object: `Task ${200 + made}`,
          timestamp: Date.now(),
          category: 'comments',
          detail: 'Looks good to me.',
        }
      : {
          id: `new-${made}`,
          actor,
          action: 'asked for your review of',
          object: `Change ${300 + made}`,
          timestamp: Date.now(),
          category: 'reviews',
          kind: 'pending',
          kindLabel: 'Waiting for review',
          actions: [{ text: 'Approve' }],
        };
}

/** Events by day under sticky headers. An event's detail opens with Show details. */
export const Default = {
  args: {
    events: sampleEvents(),
    categories: CATEGORIES,
    label: 'Activity',
    filterLabel: 'Filter by category',
    allLabel: 'All',
    loading: false,
    windowAt: 200,
    timeScale: 1,
  },
  render: (args: ActivityFeedProps) => (
    <div style={frame}>
      <ActivityFeed {...args} />
    </div>
  ),
};

/** Add events at the top: each one's place opens. Scroll down first: the row you read holds still, and Jump to latest counts the new ones. */
export const Arrivals = {
  render: function ArrivalsStory() {
    const [events, setEvents] = useState<ActivityEvent[]>(() => sampleEvents());
    const [streaming, setStreaming] = useState(false);
    const timer = useRef<number | null>(null);
    useEffect(() => {
      if (!streaming) {
        return;
      }
      timer.current = window.setInterval(
        () => setEvents((list) => [newEvent(), ...list]),
        3000
      );
      return () => {
        if (timer.current != null) {
          window.clearInterval(timer.current);
        }
      };
    }, [streaming]);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setEvents((list) => [newEvent(), ...list])}>
            Add an event
          </Button>
          <Checkbox
            id="activity-feed-streaming"
            labelText="Add one every 3 seconds"
            checked={streaming}
            onChange={(_e, { checked }) => setStreaming(checked)}
          />
        </div>
        <div style={frame}>
          <ActivityFeed events={events} />
        </div>
      </div>
    );
  },
};

/** Pick a category: the list swaps out, then in. */
export const Filters = {
  render: () => (
    <div style={frame}>
      <ActivityFeed
        events={sampleEvents()}
        categories={CATEGORIES}
        defaultSelectedCategories={['reviews']}
      />
    </div>
  ),
};

/** Up to two actions, only on an event that asks for an answer. */
export const Actions = {
  render: function ActionsStory() {
    const [answer, setAnswer] = useState('No answer yet');
    const now = Date.now();
    const events: ActivityEvent[] = [
      {
        id: 'a1',
        actor: 'Jordan Pike',
        action: 'asked for your approval of',
        object: 'Budget change',
        timestamp: now - 5 * MINUTE,
        kind: 'pending',
        kindLabel: 'Waiting for you',
        actions: [
          { text: 'Approve', onClick: () => setAnswer('Approved') },
          { text: 'Decline', onClick: () => setAnswer('Declined') },
        ],
      },
      {
        id: 'a2',
        actor: 'Riley Shore',
        action: 'asked for your review of',
        object: 'New onboarding flow',
        timestamp: now - 40 * MINUTE,
        kind: 'pending',
        kindLabel: 'Waiting for review',
        actions: [{ text: 'Review', onClick: () => setAnswer('Reviewing') }],
      },
      {
        id: 'a3',
        actor: 'Casey Brook',
        action: 'closed',
        object: 'Task 118',
        timestamp: now - 3 * HOUR,
        kind: 'success',
        kindLabel: 'Done',
      },
    ];
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <p style={{ margin: 0 }}>{answer}</p>
        <div style={frame}>
          <ActivityFeed events={events} />
        </div>
      </div>
    );
  },
};

/** Loading: skeleton rows in an event's shape. Turn it off: the skeleton dissolves as the events fade in. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <Checkbox
          id="activity-feed-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <div style={frame}>
          <ActivityFeed
            events={loading ? [] : sampleEvents()}
            loading={loading}
          />
        </div>
      </div>
    );
  },
};

/** No events: the empty state. */
export const Empty = {
  render: () => (
    <div style={frame}>
      <ActivityFeed
        events={[]}
        emptyTitle="No activity yet"
        emptySubtitle="Changes to this project show up here."
      />
    </div>
  ),
};

/** Many events: past `windowAt`, blocks out of view are spacers. */
export const LongFeed = {
  render: function LongFeedStory() {
    const [events] = useState<ActivityEvent[]>(() => {
      const now = Date.now();
      return Array.from({ length: 400 }, (_, i) => ({
        id: `long-${i}`,
        actor: ACTORS[i % ACTORS.length] ?? 'Avery Lane',
        action: i % 2 ? 'commented on' : 'deployed',
        object: `Item ${i + 1}`,
        timestamp: now - i * 37 * MINUTE,
        kind: i % 2 ? undefined : ('success' as const),
      }));
    });
    return (
      <div style={frame}>
        <ActivityFeed events={events} />
      </div>
    );
  },
};
