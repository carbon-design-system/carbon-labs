/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { TagSet, TagSetSkeleton } from '../index';
import type { TagSetOverflowAlign, TagSetProps, TagSetTag } from '../index';
import mdx from './TagSet.mdx';

const SIZES = ['sm', 'md', 'lg'] as const;
const ALIGNS: TagSetOverflowAlign[] = [
  'bottom',
  'bottom-start',
  'bottom-end',
  'top',
  'top-start',
  'top-end',
];

export default {
  title: 'V12/TagSet',
  component: TagSet,
  subcomponents: { TagSetSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'reflow-out-then-in',
        'n-slide',
        'n-count',
        'n-arriving-or-leaving',
        'dismissal',
        'arrival',
        'popover',
        'modal',
        'bursts',
      ],
      reduced: {
        'reflow-out-then-in': 'at-once',
        'n-slide': 'at-once',
        'n-count': 'at-once',
        'n-arriving-or-leaving': 'at-once',
        dismissal: 'at-once',
        arrival: 'at-once',
        popover: 'at-once',
      },
      states: ['rest', 'multiline'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    overflowType: { control: 'inline-radio', options: ['default', 'tag'] },
    overflowAlign: { control: 'select', options: ALIGNS },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    containingElementRef: { control: false },
    allTagsModalTarget: { control: false },
    onOverflowTagChange: { control: false },
  },
};

const column = { display: 'grid', gap: 16 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** Room under the set for the overflow's popover. */
const room = { paddingBlockEnd: 240 };

const TAGS: TagSetTag[] = [
  { id: 'design', label: 'Design', type: 'blue' },
  { id: 'research', label: 'Research', type: 'purple' },
  { id: 'billing', label: 'Billing', type: 'teal' },
  { id: 'north', label: 'Region North', type: 'gray' },
  { id: 'urgent', label: 'Urgent', type: 'red' },
  { id: 'beta', label: 'Beta', type: 'cyan' },
  { id: 'docs', label: 'Documentation', type: 'green' },
  { id: 'mobile', label: 'Mobile', type: 'magenta' },
];

/** Tags in a box you can resize: drag its corner to move tags into and out of the "+N". */
export const Default = {
  args: {
    tags: TAGS,
    overflowType: 'default',
    overflowAlign: 'bottom',
    multiline: false,
    allTagsModalSearchThreshold: 10,
    timeScale: 1,
  },
  render: (args: TagSetProps) => (
    <div style={room}>
      <div
        style={{
          inlineSize: 360,
          maxInlineSize: '100%',
          minInlineSize: 120,
          resize: 'horizontal',
          overflow: 'hidden',
          padding: 8,
          outline: '1px dashed currentColor',
        }}>
        <TagSet {...args} />
      </div>
    </div>
  ),
};

const WIDTHS = [
  { name: 'Narrow', px: 200 },
  { name: 'Medium', px: 360 },
  { name: 'Wide', px: 640 },
];

/** Change the width: the tags leaving snap out, the "+N" slides as its count rolls, then the tags coming back snap in. */
export const Reflow = {
  render: function ReflowStory() {
    const [width, setWidth] = useState(360);
    return (
      <div style={{ ...column, ...room }}>
        <div style={row}>
          {WIDTHS.map((w) => (
            <Button
              size="sm"
              variant="outlined"
              key={w.px}
              onClick={() => setWidth(w.px)}>
              {w.name}
            </Button>
          ))}
        </div>
        <div style={{ inlineSize: width, maxInlineSize: '100%' }}>
          <TagSet tags={TAGS} />
        </div>
      </div>
    );
  },
};

/** A narrow container, with the overflow listed as tags. Press the "+N" to open it. */
export const Overflow = {
  render: () => (
    <div style={{ ...column, ...room }}>
      <div style={{ inlineSize: 240, maxInlineSize: '100%' }}>
        <TagSet tags={TAGS} overflowType="tag" />
      </div>
      <div style={{ inlineSize: 240, maxInlineSize: '100%' }}>
        <TagSet tags={TAGS} overflowType="default" />
      </div>
    </div>
  ),
};

const NAMES = [
  'Analytics',
  'Archive',
  'Backend',
  'Billing',
  'Compliance',
  'Data',
  'Design',
  'Finance',
  'Frontend',
  'Hardware',
  'Legal',
  'Marketing',
  'Mobile',
  'Network',
  'Operations',
  'Partners',
  'Platform',
  'Research',
  'Sales',
  'Security',
  'Storage',
  'Support',
  'Testing',
  'Training',
];

const MANY: TagSetTag[] = NAMES.map((label) => ({
  id: label,
  label,
  type: 'cool-gray',
}));

/** More than ten in the overflow: the popover shows ten and "View all tags", which opens a modal with a search. */
export const ViewAll = {
  render: () => (
    <div style={room}>
      <div style={{ inlineSize: 320, maxInlineSize: '100%' }}>
        <TagSet tags={MANY} />
      </div>
    </div>
  ),
};

const FILTERS = [
  'Status: Running',
  'Region: North',
  'Owner: Platform',
  'Tier: Gold',
  'Q3',
  'Type: Service',
];

/** Dismissible tags. Close one: it snaps out where it was as the rest close the gap. Clear all: they leave 20ms apart. */
export const AddAndRemove = {
  render: function AddAndRemoveStory() {
    const next = useRef(1);
    const [labels, setLabels] = useState<string[]>(FILTERS.slice(0, 4));
    const remove = (label: string) =>
      setLabels((l) => l.filter((x) => x !== label));
    const tags: TagSetTag[] = labels.map((label) => ({
      id: label,
      label,
      type: 'blue',
      onClose: () => remove(label),
    }));
    return (
      <div style={{ ...column, ...room }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              setLabels((l) => {
                const fresh = FILTERS.find((f) => !l.includes(f));
                return [...l, fresh ?? `Label ${next.current++}`];
              })
            }>
            Add one
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={labels.length === 0}
            onClick={() => setLabels((l) => l.slice(1))}>
            Remove the first
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setLabels([])}>
            Clear all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setLabels(FILTERS.slice(0, 4))}>
            Reset
          </Button>
        </div>
        <div style={{ inlineSize: 420, maxInlineSize: '100%' }}>
          <TagSet tags={tags} overflowType="tag" />
        </div>
      </div>
    );
  },
};

/** Multiline: the tags wrap. Only `maxVisible` overflows. */
export const Multiline = {
  render: () => (
    <div style={{ ...column, ...room }}>
      <div style={{ inlineSize: 280, maxInlineSize: '100%' }}>
        <TagSet tags={TAGS} multiline />
      </div>
      <div style={{ inlineSize: 280, maxInlineSize: '100%' }}>
        <TagSet tags={TAGS} multiline maxVisible={5} />
      </div>
    </div>
  ),
};

/** The three sizes, the "+N" included. */
export const Sizes = {
  render: () => (
    <div style={{ ...column, ...room }}>
      {SIZES.map((size) => (
        <div key={size} style={{ inlineSize: 360, maxInlineSize: '100%' }}>
          <TagSet tags={TAGS} size={size} />
        </div>
      ))}
    </div>
  ),
};

/** TagSetSkeleton: each tag as one block of its own box, fitted as the loaded set would be. */
export const Skeleton = {
  render: () => (
    <div style={column}>
      <div style={{ inlineSize: 360, maxInlineSize: '100%' }}>
        <TagSetSkeleton count={6} />
      </div>
      <div style={{ inlineSize: 360, maxInlineSize: '100%' }}>
        <TagSetSkeleton
          count={6}
          labels={['Design', 'Research', 'Billing']}
          multiline
        />
      </div>
    </div>
  ),
};
