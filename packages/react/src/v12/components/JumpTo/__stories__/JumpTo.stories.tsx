/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { JumpTo, JumpToPresets, JumpToSizes } from '../index';
import type { JumpToProps } from '../index';
import mdx from './JumpTo.mdx';

export default {
  title: 'V12/JumpTo',
  component: JumpTo,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['4px-arrival', 'scroll-glide', 'stick-to-end'],
      reduced: {
        'scroll-glide': 'at-once',
      },
      states: ['hidden', 'shown', 'count'],
    },
  },
  argTypes: {
    preset: { control: 'inline-radio', options: JumpToPresets },
    size: { control: 'inline-radio', options: JumpToSizes },
    directions: { control: 'inline-radio', options: ['both', 'up', 'down'] },
    block: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    shadowTone: { control: 'inline-radio', options: ['neutral', 'backdrop'] },
    container: { control: false },
    target: { control: false },
    countLabel: { control: false },
    focusTarget: { control: false },
    onJump: { control: false },
  },
};

/** The scroll container: tall content in a short view. A keyboard jump can focus it (`tabIndex={-1}`). */
const view = {
  blockSize: 400,
  maxInlineSize: 560,
  overflow: 'auto',
  border: '1px solid var(--cds-border-subtle)',
  background: 'var(--cds-layer-01)',
};

const line = { margin: 0, padding: '12px 16px' };

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const TOPICS = [
  'The build finished on the main branch.',
  'Two reviewers approved the change.',
  'The nightly backup completed.',
  'A new comment was added to the draft.',
  'The test run passed with no failures.',
  'The deploy is waiting for approval.',
];

const message = (n: number) =>
  `Update ${n}: ${TOPICS[(n - 1) % TOPICS.length]}`;

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/** A feed that starts at its end. Scroll up: the pill arrives. Add messages while away and it counts them; jump, and it glides back to the end and sticks there as more arrive. */
export const Default = {
  args: {
    size: 'sm',
    threshold: 48,
    directions: 'both',
    shadow: false,
    shadowTone: 'neutral',
    timeScale: 1,
  },
  render: function DefaultStory(args: Omit<JumpToProps, 'container'>) {
    const box = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(40);
    useLayoutEffect(() => {
      const el = box.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, []);
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setCount((c) => c + 1)}>
            Add a message
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setCount((c) => c + 3)}>
            Add three
          </Button>
        </div>
        <div
          ref={box}
          style={view}
          tabIndex={-1}
          role="log"
          aria-label="Activity feed">
          {range(count).map((n) => (
            <p key={n} style={line}>
              {message(n)}
            </p>
          ))}
        </div>
        <JumpTo {...args} preset="latest" container={box} items={count} />
      </div>
    );
  },
};

const UNREAD_FROM = 51;

/** The first unread message, far below: the pill shows its count, and a jump lands it at the top of the view. A jump past two views moves close first, then glides. */
export const Unread = {
  render: function UnreadStory() {
    const box = useRef<HTMLDivElement>(null);
    const first = useRef<HTMLParagraphElement>(null);
    const total = 80;
    return (
      <div>
        <div
          ref={box}
          style={view}
          tabIndex={-1}
          role="log"
          aria-label="Messages">
          {range(total).map((n) => (
            <p
              key={n}
              ref={n === UNREAD_FROM ? first : undefined}
              tabIndex={n === UNREAD_FROM ? -1 : undefined}
              style={{
                ...line,
                fontWeight: n >= UNREAD_FROM ? 600 : undefined,
              }}>
              {message(n)}
            </p>
          ))}
        </div>
        <JumpTo
          container={box}
          preset="unread"
          target={first}
          count={total - UNREAD_FROM + 1}
        />
      </div>
    );
  },
};

/** A long page. Scroll down: Back to top arrives at the top of the view, its arrow up. */
export const BackToTop = {
  render: function BackToTopStory() {
    const box = useRef<HTMLDivElement>(null);
    return (
      <div>
        <div
          ref={box}
          style={view}
          tabIndex={-1}
          role="region"
          aria-label="Article">
          {range(30).map((n) => (
            <p key={n} style={{ ...line, paddingBlock: 16 }}>
              Section {n}. A paragraph of placeholder text that fills the page,
              so the start of it scrolls far out of view. Each section is about
              the same length as the last.
            </p>
          ))}
        </div>
        <JumpTo container={box} preset="top" />
      </div>
    );
  },
};

/** Pick a row, then scroll it away: the pill points toward it, above or below, and a jump lands it in the middle of the view. */
export const Selection = {
  render: function SelectionStory() {
    const box = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(12);
    const selectedRow = () =>
      box.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? null;
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setSelected(12)}>
            Select item 12
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setSelected(88)}>
            Select item 88
          </Button>
        </div>
        <div
          ref={box}
          style={view}
          role="listbox"
          aria-label="Items"
          tabIndex={0}>
          {range(100).map((n) => (
            <div
              key={n}
              role="option"
              aria-selected={n === selected}
              tabIndex={-1}
              onClick={() => setSelected(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(n);
                }
              }}
              style={{
                ...line,
                cursor: 'pointer',
                background:
                  n === selected ? 'var(--cds-layer-selected-01)' : undefined,
              }}>
              Item {n}
            </div>
          ))}
        </div>
        <JumpTo container={box} preset="selection" target={selectedRow} />
      </div>
    );
  },
};

/** The four sizes, the kit button's: each feed starts at its top, so the pill shows at once. */
export const Sizes = {
  render: function SizesStory() {
    const boxes = [
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
    ];
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {JumpToSizes.map((size, i) => (
          <div key={size}>
            <div
              ref={boxes[i]}
              style={{ ...view, blockSize: 240, inlineSize: 260 }}
              tabIndex={-1}
              role="log"
              aria-label={`Feed, size ${size}`}>
              {range(20).map((n) => (
                <p key={n} style={line}>
                  {message(n)}
                </p>
              ))}
            </div>
            <JumpTo container={boxes[i]} preset="latest" size={size} />
          </div>
        ))}
      </div>
    );
  },
};

/** Reduced motion and slow motion. Reduced, the jump lands at once and the pill only fades. Slow motion runs the glide and the arrival four times longer. */
export const ReducedAndSlow = {
  render: function ReducedAndSlowStory() {
    const box = useRef<HTMLDivElement>(null);
    const [reduced, setReduced] = useState(false);
    const [slow, setSlow] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={row}>
          <Checkbox
            id="jump-to-story-reduced"
            labelText="Reduced motion"
            checked={reduced}
            onChange={(_e, { checked }) => setReduced(checked)}
          />
          <Checkbox
            id="jump-to-story-slow"
            labelText="Slow motion"
            checked={slow}
            onChange={(_e, { checked }) => setSlow(checked)}
          />
        </div>
        <div
          ref={box}
          style={view}
          tabIndex={-1}
          role="region"
          aria-label="Article">
          {range(30).map((n) => (
            <p key={n} style={{ ...line, paddingBlock: 16 }}>
              Section {n}. Scroll down until the pill arrives, then jump back to
              the top.
            </p>
          ))}
        </div>
        <JumpTo
          container={box}
          preset="top"
          reduced={reduced}
          timeScale={slow ? 4 : 1}
        />
      </div>
    );
  },
};
