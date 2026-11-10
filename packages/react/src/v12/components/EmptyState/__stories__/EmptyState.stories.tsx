/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '@carbon-labs/react-button';
import {
  playContentSwap,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import {
  EmptyState,
  EmptyStateArt,
  EmptyStateContexts,
  EmptyStateKinds,
} from '../index';
import type { EmptyStateProps } from '../index';
import mdx from './EmptyState.mdx';

export default {
  title: 'V12/EmptyState',
  component: EmptyState,
  subcomponents: { EmptyStateArt },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['content-swap', 'rollover'],
      reduced: {
        'content-swap': 'at-once',
      },
      states: ['page', 'table', 'panel', 'tile'],
    },
  },
  argTypes: {
    kind: { control: 'select', options: [undefined, ...EmptyStateKinds] },
    context: { control: 'inline-radio', options: EmptyStateContexts },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    illustrationPosition: {
      control: 'inline-radio',
      options: ['top', 'end', 'bottom', 'start'],
    },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    action: { control: false },
    link: { control: false },
    icon: { control: false },
    headingAs: { control: false },
  },
};

const KIND_TEXT: Record<
  (typeof EmptyStateKinds)[number],
  { title: string; subtitle: string }
> = {
  'no-data': {
    title: 'Start by adding data',
    subtitle: 'Your projects will show here once you create one.',
  },
  'not-found': {
    title: 'No results found',
    subtitle: 'Try another search or clear the filters.',
  },
  error: {
    title: 'Something went wrong',
    subtitle: 'The data could not load. Try again in a moment.',
  },
  unauthorized: {
    title: 'You do not have access',
    subtitle: 'Ask an owner of this space to invite you.',
  },
  notifications: {
    title: 'You are all caught up',
    subtitle: 'New notifications will show here.',
  },
  'no-tags': {
    title: 'No tags yet',
    subtitle: 'Add a tag to group related items.',
  },
};

/** A panel's surface, so a panel or tile context sits on something. */
const surface = {
  background: 'var(--cds-layer-01)',
  padding: 24,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** A still 32px icon, drawn inline: the `icon` slot takes any component with `size`. */
function FolderIcon({ size = 32 }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true">
      <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
    </svg>
  );
}

/** First use on a page: the kind's drawing, a title, a subtitle, an action and a link. */
export const Default = {
  args: {
    kind: 'no-data',
    context: 'page',
    illustrationPosition: 'top',
    title: 'Start by adding data',
    subtitle: 'Your projects will show here once you create one.',
    action: { text: 'Create project' },
    link: { text: 'Learn about projects', href: '#' },
    timeScale: 1,
  },
  render: (args: EmptyStateProps) => <EmptyState {...args} />,
};

/** Each kind and its drawing, in a tile. */
export const Kinds = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      }}>
      {EmptyStateKinds.map((kind) => (
        <div key={kind} style={surface}>
          <EmptyState kind={kind} context="tile" {...KIND_TEXT[kind]} />
        </div>
      ))}
    </div>
  ),
};

/** The four contexts: a page and a table's place are large, with a wide start margin; a panel and a tile are compact. */
export const Contexts = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <EmptyState
        context="page"
        kind="not-found"
        {...KIND_TEXT['not-found']}
        action={{ text: 'Clear filters' }}
      />
      <div style={{ border: '1px solid var(--cds-border-subtle)' }}>
        <EmptyState
          context="table"
          kind="no-data"
          title="No rows yet"
          subtitle="Rows you add will show in this table."
          action={{ text: 'Add row' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ ...surface, flex: '1 1 320px' }}>
          <EmptyState
            context="panel"
            kind="notifications"
            {...KIND_TEXT.notifications}
          />
        </div>
        <div style={{ ...surface, flex: '0 1 240px' }}>
          <EmptyState context="tile" kind="no-tags" {...KIND_TEXT['no-tags']} />
        </div>
      </div>
    </div>
  ),
};

/** The visual at the top, the end, the bottom or the start of the text. Start and end mirror right to left. */
export const IllustrationPositions = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      }}>
      {(['top', 'end', 'bottom', 'start'] as const).map((position) => (
        <div key={position} style={surface}>
          <EmptyState
            context="panel"
            kind="error"
            illustrationPosition={position}
            title={`Visual at the ${position}`}
            subtitle="The data could not load."
            action={{ text: 'Try again' }}
          />
        </div>
      ))}
    </div>
  ),
};

/** A still 32px icon in place of the illustration. */
export const WithIcon = {
  render: () => (
    <div style={surface}>
      <EmptyState
        context="panel"
        icon={FolderIcon}
        title="This folder is empty"
        subtitle="Drop files here or upload them."
        action={{ text: 'Upload files' }}
      />
    </div>
  ),
};

/**
 * A region whose content changes, out then in: the old face leaves, then the
 * new one comes in, on the content swap. The empty state has no motion of its
 * own; this is the region's.
 */
function SwapRegion({
  swapKey,
  children,
}: {
  swapKey: string;
  children: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(swapKey);
  const [leaving, setLeaving] = useState<{
    key: string;
    node: ReactNode;
  } | null>(null);
  const last = useRef<ReactNode>(children);
  const outRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLDivElement>(null);

  if (swapKey !== shown) {
    setLeaving({ key: shown, node: last.current });
    setShown(swapKey);
  }
  useEffect(() => {
    last.current = children;
  });

  useLayoutEffect(() => {
    if (!leaving || !inRef.current) {
      return;
    }
    const swap = playContentSwap({
      out: outRef.current,
      in: inRef.current,
      axis: 'y',
      direction: 1,
      reduced,
    });
    const done = window.setTimeout(() => setLeaving(null), swap.wait);
    return () => window.clearTimeout(done);
  }, [leaving, reduced]);

  const cell = { gridArea: '1 / 1' };
  return (
    <div style={{ display: 'grid', overflow: 'hidden' }}>
      {leaving && (
        <div
          key={`${leaving.key}-out`}
          ref={outRef}
          style={cell}
          aria-hidden="true">
          {leaving.node}
        </div>
      )}
      <div key={shown} ref={inRef} style={cell}>
        {children}
      </div>
    </div>
  );
}

const TASKS = [
  'Review the draft',
  'Book the meeting room',
  'Send the weekly notes',
  'Update the roadmap',
];

/** Clear the list: it leaves, then the empty state comes in where it was. Its action brings the list back the same way. */
export const ListCleared = {
  render: function ListClearedStory() {
    const [tasks, setTasks] = useState(TASKS);
    const empty = tasks.length === 0;
    return (
      <div style={{ display: 'grid', gap: 16, maxInlineSize: 480 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            disabled={empty}
            onClick={() => setTasks([])}>
            Clear all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={empty}
            onClick={() => setTasks((t) => t.slice(1))}>
            Complete one
          </Button>
        </div>
        <div style={surface}>
          <SwapRegion swapKey={empty ? 'empty' : 'list'}>
            {empty ? (
              <EmptyState
                context="panel"
                kind="no-data"
                title="No tasks left"
                subtitle="Everything on this list is done."
                action={{
                  text: 'Restore tasks',
                  onClick: () => setTasks(TASKS),
                }}
              />
            ) : (
              <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                {tasks.map((task) => (
                  <li key={task} style={{ paddingBlock: 8 }}>
                    {task}
                  </li>
                ))}
              </ul>
            )}
          </SwapRegion>
        </div>
      </div>
    );
  },
};
