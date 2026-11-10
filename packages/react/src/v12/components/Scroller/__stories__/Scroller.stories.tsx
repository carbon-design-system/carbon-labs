/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { Scroller } from '../index';
import type { ScrollerProps, ScrollerRest } from '../index';
import mdx from './Scroller.mdx';

export default {
  title: 'V12/Scroller',
  component: Scroller,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'readout',
        'length',
        'arrival',
        'leave',
        'hover',
        'press',
        'squash',
        'track-press',
        'soft-edge',
      ],
      reduced: {
        length: 'at-once',
        arrival: 'shorter-clock',
        leave: 'shorter-clock',
        squash: 'at-once',
        'track-press': 'at-once',
      },
      states: ['hidden', 'shown', 'near', 'pressed', 'dragging', 'disabled'],
    },
  },
  argTypes: {
    axis: { control: 'inline-radio', options: ['y', 'x', 'both'] },
    visibility: { control: 'inline-radio', options: ['auto', 'always'] },
    trackClick: { control: 'inline-radio', options: ['page', 'jump'] },
    rest: {
      control: 'inline-radio',
      options: ['faint', 'thin', 'both', 'full'],
    },
    target: { control: false },
    children: { control: false },
    insets: { control: false },
    scrollerRef: { control: false },
    viewportRef: { control: false },
    viewportProps: { control: false },
  },
};

const row = {
  display: 'flex',
  gap: 24,
  alignItems: 'flex-start',
  flexWrap: 'wrap' as const,
};

const box = {
  blockSize: 240,
  inlineSize: 320,
  border: '1px solid var(--cds-border-subtle)',
};

/** Numbered lines, enough to overflow the box. */
function Lines({ count, width }: { count: number; width?: number }) {
  return (
    <div style={{ padding: 16, inlineSize: width }}>
      {Array.from({ length: count }, (_, i) => (
        <p key={i} style={{ margin: '0 0 8px', whiteSpace: 'nowrap' }}>
          Line {i + 1} of the content
          {width ? ', wide enough to scroll across as well as down' : ''}
        </p>
      ))}
    </div>
  );
}

/**
 * Scroll, or bring the pointer to the edge: the pill arrives, follows the
 * scroll and leaves a second after the last activity. Drag it past an end to
 * see the squash; press beside it to page.
 */
export const Default = {
  args: {
    axis: 'y',
    visibility: 'auto',
    trackClick: 'page',
    rest: 'faint',
    squash: true,
    softEdge: true,
    disabled: false,
    'aria-label': 'Activity',
  },
  render: (args: ScrollerProps) => (
    <Scroller {...args} style={box}>
      <Lines count={30} />
    </Scroller>
  ),
};

const RESTS: ScrollerRest[] = ['faint', 'thin', 'both', 'full'];

/** The four rest looks, shown at once. Hover, press and drag look the same in all four. */
export const RestLooks = {
  render: () => (
    <div style={row}>
      {RESTS.map((rest) => (
        <div key={rest} style={{ display: 'grid', gap: 8 }}>
          <span>{rest}</span>
          <Scroller
            rest={rest}
            visibility="always"
            aria-label={`Rest look ${rest}`}
            style={{ ...box, inlineSize: 200 }}>
            <Lines count={30} />
          </Scroller>
        </div>
      ))}
    </div>
  ),
};

/** Both axes: each track stops short of the corner, so the pills never meet. */
export const BothAxes = {
  render: () => (
    <Scroller
      axis="both"
      visibility="always"
      aria-label="Both axes"
      style={box}>
      <Lines count={30} width={640} />
    </Scroller>
  ),
};

/** A change in the content's size: the pill's length glides to its new share of the content. */
export const ContentChange = {
  render: function ContentChangeStory() {
    const [count, setCount] = useState(16);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="sm"
            kind="tertiary"
            onClick={() => setCount((c) => c + 16)}>
            Add lines
          </Button>
          <Button
            size="sm"
            kind="tertiary"
            onClick={() => setCount((c) => Math.max(16, c - 16))}>
            Remove lines
          </Button>
        </div>
        <Scroller visibility="always" aria-label="Lines" style={box}>
          <Lines count={count} />
        </Scroller>
      </div>
    );
  },
};

/** Jump: a press beside the pill scrolls to the press, timed by how far the pill travels. */
export const TrackJump = {
  render: () => (
    <Scroller
      trackClick="jump"
      visibility="always"
      aria-label="Jump to a press"
      style={box}>
      <Lines count={60} />
    </Scroller>
  ),
};
