/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import type { ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Accordion, AccordionItem, AccordionSkeleton } from '../index';
import type { AccordionProps, AccordionSize } from '../index';
import mdx from './Accordion.mdx';

export default {
  title: 'V12/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'body',
        'one-motion',
        'soft-edge',
        'content-in',
        'content-out',
        'turn',
        'chevron',
        'rollover',
      ],
      reduced: {
        body: 'at-once',
        'one-motion': 'at-once',
        'soft-edge': 'at-once',
        'content-in': 'shorter-clock',
        'content-out': 'at-once',
        turn: 'at-once',
        chevron: 'at-once',
        rollover: 'at-once',
      },
      states: ['shut', 'opening', 'open', 'shutting', 'disabled'],
    },
  },
  argTypes: {
    align: { control: 'inline-radio', options: ['end', 'start'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['flush', 'ghost'] },
    corners: { control: 'inline-radio', options: ['square', 'rounded'] },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    children: { control: false },
  },
};

const stack = { display: 'grid', gap: 16, maxInlineSize: 640 };
const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const label = { margin: 0, fontWeight: 600 };
const list = { margin: 0, paddingInlineStart: 20 };

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: 'Summary',
    body: <p>A short body: it travels a little, on a quick step.</p>,
  },
  {
    title: 'Details',
    body: (
      <>
        <p>
          A longer body travels farther, so it takes a longer step. The content
          comes down into place as the body opens.
        </p>
        <p>
          On the way out the content holds still and the edge closes over it.
        </p>
      </>
    ),
  },
  {
    title: 'Members',
    body: (
      <ul style={list}>
        {[
          'Owner: one person',
          'Editors: three people',
          'Viewers: twelve people',
          'Pending invitations: two',
        ].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    ),
  },
  {
    title: 'History',
    body: (
      <ul style={list}>
        {[
          'Created the project',
          'Added two members',
          'Renamed the project',
          'Changed the owner',
          'Archived the old plan',
          'Published the report',
          'Moved the project to a new team',
          'Turned on notifications',
        ].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    ),
  },
];

/** The items, each holding its own open state. */
function Items({ disabledAt }: { disabledAt?: number }) {
  return (
    <>
      {SECTIONS.map((s, i) => (
        <AccordionItem
          key={s.title}
          title={s.title}
          disabled={i === disabledAt ? true : undefined}>
          {s.body}
        </AccordionItem>
      ))}
    </>
  );
}

/** Each heading opens or shuts its body. The step follows the travel, so the short body is quicker than the long one. Press again mid-move and it turns from where it is. */
export const Default = {
  args: {
    align: 'end',
    size: 'md',
    frame: 'flush',
    exclusive: false,
    disabled: false,
    ordered: false,
    headingLevel: 3,
    timeScale: 1,
  },
  render: (args: AccordionProps) => (
    <div style={stack}>
      <Accordion {...args}>
        <Items />
      </Accordion>
    </div>
  ),
};

/** Controlled: each item's `open` comes from state, and `onHeadingClick` keeps it in step. Expand all and collapse all change every item in one commit, so they move as one motion. */
export const ExpandAll = {
  render: function ExpandAllStory() {
    const [open, setOpen] = useState<boolean[]>(() =>
      SECTIONS.map((_, i) => i === 0)
    );
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen(SECTIONS.map(() => true))}>
            Expand all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen(SECTIONS.map(() => false))}>
            Collapse all
          </Button>
          <span>
            {open.filter(Boolean).length} of {SECTIONS.length} open
          </span>
        </div>
        <Accordion>
          {SECTIONS.map((s, i) => (
            <AccordionItem
              key={s.title}
              title={s.title}
              open={open[i] ?? false}
              onHeadingClick={({ isOpen }) =>
                setOpen((prev) => prev.map((o, j) => (j === i ? isOpen : o)))
              }>
              {s.body}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  },
};

/** Uncontrolled: the items hold their own state. `open` sets where one starts. */
export const Uncontrolled = {
  render: () => (
    <div style={stack}>
      <Accordion>
        {SECTIONS.map((s, i) => (
          <AccordionItem key={s.title} title={s.title} open={i === 1}>
            {s.body}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** `exclusive`: one item open at a time. Opening one shuts the other, as one motion. */
export const Exclusive = {
  render: () => (
    <div style={stack}>
      <Accordion exclusive>
        {SECTIONS.map((s, i) => (
          <AccordionItem key={s.title} title={s.title} open={i === 0}>
            {s.body}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

const SIZES: AccordionSize[] = ['sm', 'md', 'lg'];

/** Row heights: sm 32, md 40 (default) and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={stack}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'grid', gap: 8 }}>
          <p style={label}>{size}</p>
          <Accordion size={size}>
            <Items />
          </Accordion>
        </div>
      ))}
    </div>
  ),
};

/** `frame="ghost"`: the text 16px in, the hairlines and the hover inset. `corners="rounded"`: 8px corners. */
export const Frames = {
  render: () => (
    <div style={stack}>
      <p style={label}>Ghost</p>
      <Accordion frame="ghost">
        <Items />
      </Accordion>
      <p style={label}>Rounded</p>
      <Accordion corners="rounded">
        <Items />
      </Accordion>
    </div>
  ),
};

/** `align="start"`: the chevron before the title. */
export const AlignStart = {
  render: () => (
    <div style={stack}>
      <Accordion align="start">
        <Items />
      </Accordion>
    </div>
  ),
};

/** A disabled item shows shut. The arrow keys skip it. */
export const Disabled = {
  render: () => (
    <div style={stack}>
      <Accordion>
        <Items disabledAt={1} />
      </Accordion>
    </div>
  ),
};

/** AccordionSkeleton: the rows, their dividers and chevrons drawn as themselves, each title a bar. */
export const Skeleton = {
  render: () => (
    <div style={stack}>
      <AccordionSkeleton />
    </div>
  ),
};
