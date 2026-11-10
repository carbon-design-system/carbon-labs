/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { DismissibleTag, SelectableTag, Tag, TagSkeleton } from '../index';
import type { TagCorners, TagProps, TagSize, TagType } from '../index';
import mdx from './Tag.mdx';

const TYPES: TagType[] = [
  'gray',
  'success',
  'warning',
  'outline',
  'red',
  'magenta',
  'purple',
  'blue',
  'cyan',
  'teal',
  'green',
  'cool-gray',
  'warm-gray',
  'high-contrast',
];
const SIZES: TagSize[] = ['sm', 'md', 'lg'];
const CORNERS: TagCorners[] = ['full', 'rounded', 'square'];

export default {
  title: 'V12/Tag',
  component: Tag,
  subcomponents: { SelectableTag, DismissibleTag, TagSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap-from-below-in',
        'snap-from-below-out',
        'stillness',
        'turn',
        'rollover',
        'close-icon',
      ],
      reduced: {
        'snap-from-below-in': 'at-once',
        'snap-from-below-out': 'at-once',
        turn: 'at-once',
        rollover: 'at-once',
      },
      states: ['shown', 'hidden'],
    },
  },
  argTypes: {
    type: { control: 'select', options: TYPES },
    size: { control: 'inline-radio', options: SIZES },
    corners: { control: 'inline-radio', options: CORNERS },
    arrive: { control: 'inline-radio', options: ['auto', true, false] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    renderIcon: { control: false },
    children: { control: 'text' },
  },
};

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const column = { display: 'grid', gap: 16 };

/** One read-only tag. */
export const Default = {
  args: {
    children: 'Running',
    type: 'gray',
    arrive: 'auto',
    show: true,
    timeScale: 1,
  },
  render: (args: TagProps) => <Tag {...args} />,
};

/** Every type: Carbon's colors and the status pills. */
export const Types = {
  render: () => (
    <div style={row}>
      {TYPES.map((type) => (
        <Tag key={type} type={type}>
          {type}
        </Tag>
      ))}
    </div>
  ),
};

/** The three sizes, sm 18px, md 20px and lg 32px, in each corner style. */
export const Sizes = {
  render: () => (
    <div style={column}>
      {CORNERS.map((corners) => (
        <div key={corners} style={row}>
          {SIZES.map((size) => (
            <Tag key={size} size={size} corners={corners} type="blue">
              {`${size}, ${corners}`}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Add tags to a row already on screen: the first of a run snaps in from below. Tags added together snap together; one added within the run is simply there. */
export const Arriving = {
  render: function ArrivingStory() {
    const next = useRef(1);
    const [tags, setTags] = useState<number[]>([]);
    const add = (n: number) =>
      setTags((t) => [
        ...t,
        ...Array.from({ length: n }, () => next.current++),
      ]);
    return (
      <div style={column}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => add(1)}>
            Add one
          </Button>
          <Button size="sm" variant="outlined" onClick={() => add(3)}>
            Add three
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setTags([])}>
            Clear
          </Button>
        </div>
        <div style={{ ...row, minBlockSize: 32 }}>
          {tags.map((n) => (
            <Tag key={n} type="green">
              {`Changed ${n}`}
            </Tag>
          ))}
        </div>
      </div>
    );
  },
};

/** Toggle `show`: the tag snaps out, then it is gone. Toggle again mid-exit to turn it round from where it is. */
export const ShowAndHide = {
  args: { timeScale: 1, size: 'md' },
  render: function ShowAndHideStory(args: Omit<TagProps, 'children'>) {
    const [show, setShow] = useState(true);
    return (
      <div style={row}>
        <Button size="sm" variant="outlined" onClick={() => setShow((v) => !v)}>
          {show ? 'Hide' : 'Show'}
        </Button>
        <Tag {...args} type="warning" show={show} arrive>
          Draft
        </Tag>
      </div>
    );
  },
};

const FILTERS = ['Region: North', 'Status: Running', 'Owner: Platform', 'Q3'];

/** DismissibleTag: hover a tag to play its close icon. Press the close, or Delete or Backspace on it, to dismiss; focus moves to the tag now in its place. */
export const Dismissible = {
  render: function DismissibleStory() {
    const [tags, setTags] = useState(FILTERS);
    return (
      <div style={column}>
        <div style={row}>
          {tags.map((text) => (
            <DismissibleTag
              key={text}
              text={text}
              type="blue"
              onClose={() => setTags((t) => t.filter((x) => x !== text))}
            />
          ))}
          <DismissibleTag text="Locked" disabled />
        </div>
        <div>
          <Button size="sm" variant="outlined" onClick={() => setTags(FILTERS)}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
};

const CHOICES = ['All', 'Running', 'Stopped', 'Failed'];

/** SelectableTag: press to turn a tag on and off, on the rollover. The second row is toned with a tag color. */
export const Selectable = {
  render: function SelectableStory() {
    const [selected, setSelected] = useState<string[]>([
      'neutral Running',
      'purple Running',
    ]);
    const toggle = (id: string, on: boolean) =>
      setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
    return (
      <div style={column}>
        {([undefined, 'purple'] as const).map((type) => (
          <div key={type ?? 'neutral'} style={row}>
            {CHOICES.map((choice) => {
              const id = `${type ?? 'neutral'} ${choice}`;
              return (
                <SelectableTag
                  key={choice}
                  text={choice}
                  type={type}
                  selected={selected.includes(id)}
                  onChange={(on) => toggle(id, on)}
                />
              );
            })}
            <SelectableTag text="Archived" type={type} disabled />
          </div>
        ))}
      </div>
    );
  },
};

/** TagSkeleton: the tag as one block of its own box, as wide as its expected text. */
export const Skeleton = {
  render: () => (
    <div style={row}>
      {SIZES.map((size) => (
        <TagSkeleton key={size} size={size} />
      ))}
    </div>
  ),
};
