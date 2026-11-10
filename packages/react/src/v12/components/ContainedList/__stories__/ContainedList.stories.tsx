/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { IconButton } from '@carbon-labs/react-tooltip';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Search } from '@carbon-labs/react-search';
import {
  ContainedList,
  ContainedListItem,
  ContainedListSkeleton,
} from '../index';
import type { ContainedListProps, ContainedListSize } from '../index';
import mdx from './ContainedList.mdx';

const SIZES: ContainedListSize[] = ['sm', 'md', 'lg', 'xl'];

export default {
  title: 'V12/ContainedList',
  component: ContainedList,
  subcomponents: { ContainedListItem, ContainedListSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['rollover', 'out', 'move', 'in', 'typing'],
      reduced: {
        rollover: 'at-once',
        out: 'shorter-clock',
        move: 'at-once',
        in: 'shorter-clock',
        typing: 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'focus', 'disabled'],
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['on-page', 'disclosed'] },
    size: { control: 'inline-radio', options: SIZES },
    corners: { control: 'inline-radio', options: ['square', 'rounded'] },
    label: { control: 'text' },
    action: { control: false },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

const column = { display: 'grid', gap: 32, maxInlineSize: 480 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** A small document glyph, for `renderIcon`. */
function DocumentIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true">
      <path d="M3.5 1.5h6l3 3v10h-9z" />
      <path d="M9.5 1.5v3h3" />
    </svg>
  );
}

/** A small close glyph, for a remove action. */
function CloseIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/** A small overflow glyph, three dots. */
function OverflowIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true">
      <circle cx="8" cy="3.5" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="8" cy="12.5" r="1" />
    </svg>
  );
}

const ITEMS = [
  'Quarterly report',
  'Team roster',
  'Budget draft',
  'Meeting notes',
  'Release plan',
];

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Grape',
  'Lemon',
  'Lime',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Plum',
];

/** A labelled list of items, static. */
export const Default = {
  args: {
    label: 'Documents',
    kind: 'on-page',
    size: 'lg',
    isInset: false,
    timeScale: 1,
  },
  render: (args: ContainedListProps) => (
    <div style={{ maxInlineSize: 480 }}>
      <ContainedList {...args}>
        {ITEMS.map((item) => (
          <ContainedListItem key={item}>{item}</ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
};

/** `on-page` labels the list over a hairline; `disclosed` is the small header for a list inside a disclosure. */
export const Kinds = {
  render: () => (
    <div style={column}>
      <ContainedList label="On page" kind="on-page">
        {ITEMS.slice(0, 3).map((item) => (
          <ContainedListItem key={item}>{item}</ContainedListItem>
        ))}
      </ContainedList>
      <ContainedList label="Disclosed" kind="disclosed">
        {ITEMS.slice(0, 3).map((item) => (
          <ContainedListItem key={item}>{item}</ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
};

/** Item heights: sm 32, md 40, lg 48 (the default) and xl 64px. */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <ContainedList key={size} label={`Size ${size}`} size={size}>
          {ITEMS.slice(0, 3).map((item) => (
            <ContainedListItem key={item}>{item}</ContainedListItem>
          ))}
        </ContainedList>
      ))}
    </div>
  ),
};

/** Clickable items with icons: each is a button and takes the rollover. One is disabled. `isInset` stops the hairlines short of the sides. */
export const Clickable = {
  render: () => (
    <div style={{ maxInlineSize: 480 }}>
      <ContainedList label="Recent files" isInset>
        {ITEMS.map((item, i) => (
          <ContainedListItem
            key={item}
            renderIcon={DocumentIcon}
            disabled={i === 3}
            onClick={() => {}}>
            {item}
          </ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
};

/** An action at the end of each row, and one in the header. */
export const WithActions = {
  render: () => (
    <div style={{ maxInlineSize: 480 }}>
      <ContainedList
        label="Shared with"
        action={
          <IconButton label="More options" size="sm" frame="ghost">
            <OverflowIcon />
          </IconButton>
        }>
        {['Team A', 'Team B', 'Team C', 'Team D'].map((team) => (
          <ContainedListItem
            key={team}
            action={
              <IconButton label={`Options for ${team}`} size="sm" frame="ghost">
                <OverflowIcon />
              </IconButton>
            }>
            {team}
          </ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
};

/** A Search as the header's action filters the list. The leaving items fade, the rest move up, then any new ones fade in. Typing fast lands at once. */
export const WithSearch = {
  render: function WithSearchStory() {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const shown = FRUITS.filter((f) => f.toLowerCase().includes(q));
    return (
      <div style={{ maxInlineSize: 480 }}>
        <ContainedList
          label="Fruit"
          action={
            <Search
              labelText="Filter fruit"
              placeholder="Filter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          }>
          {shown.map((fruit) => (
            <ContainedListItem key={fruit}>{fruit}</ContainedListItem>
          ))}
        </ContainedList>
      </div>
    );
  },
};

/** Add and remove rows: a removed row fades out, then the rows below move up. A new row fades in where it lands. */
export const AddAndRemove = {
  render: function AddAndRemoveStory() {
    const [items, setItems] = useState([1, 2, 3]);
    const next = useRef(4);
    const add = () => setItems((xs) => [...xs, next.current++]);
    const remove = (id: number) => setItems((xs) => xs.filter((x) => x !== id));
    return (
      <div style={{ display: 'grid', gap: 16, maxInlineSize: 480 }}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={add}>
            Add a row
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={items.length === 0}
            onClick={() => setItems([])}>
            Remove all
          </Button>
        </div>
        <ContainedList label="Tasks">
          {items.map((id) => (
            <ContainedListItem
              key={id}
              action={
                <IconButton
                  label={`Remove task ${id}`}
                  size="sm"
                  frame="ghost"
                  onClick={() => remove(id)}>
                  <CloseIcon />
                </IconButton>
              }>
              Task {id}
            </ContainedListItem>
          ))}
        </ContainedList>
      </div>
    );
  },
};

/** A long list in a scrolling box: the header stays at the top, and a Search child stays under it. */
export const LongList = {
  render: function LongListStory() {
    const [query, setQuery] = useState('');
    const all = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`);
    const shown = all.filter((x) => x.includes(query.trim()));
    return (
      <div style={{ maxInlineSize: 480, maxBlockSize: 360, overflow: 'auto' }}>
        <ContainedList label="Items" size="md">
          <Search
            labelText="Filter items"
            placeholder="Filter by number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
          {shown.map((item) => (
            <ContainedListItem key={item} onClick={() => {}}>
              {item}
            </ContainedListItem>
          ))}
        </ContainedList>
      </div>
    );
  },
};

/** `corners="rounded"`: 8px, for a list inside a card or a rounded region. */
export const Rounded = {
  render: () => (
    <div style={{ maxInlineSize: 480 }}>
      <ContainedList label="Documents" corners="rounded">
        {ITEMS.slice(0, 4).map((item) => (
          <ContainedListItem key={item} onClick={() => {}}>
            {item}
          </ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
};

/** ContainedListSkeleton: the header and rows drawn as themselves, each row's text a bar. */
export const Skeleton = {
  render: () => (
    <div style={{ maxInlineSize: 480 }}>
      <ContainedListSkeleton label="Documents" count={4} />
    </div>
  ),
};
