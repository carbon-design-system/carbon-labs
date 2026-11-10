/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  SelectItem,
  SelectItemDivider,
  SelectItemGroup,
  SelectList,
} from '../index';
import type { SelectListProps, SelectListValue } from '../index';
import mdx from './SelectList.mdx';

export default {
  title: 'V12/SelectList',
  component: SelectList,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['glide', 'reach', 'drag', 'arrival', 'hover', 'loading'],
      reduced: {},
      states: [
        'rest',
        'hover',
        'pressed',
        'selected',
        'none',
        'disabled',
        'loading',
      ],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['inverse', 'tonal', 'outlined', 'hero'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['inset', 'ghost'] },
    fit: { control: 'inline-radio', options: ['hug', 'fill'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    interaction: { control: 'inline-radio', options: ['preview', 'lightness'] },
    outlinedFill: { control: 'inline-radio', options: ['subtle', 'raised'] },
  },
};

const REGIONS = [
  { value: 'us-south', text: 'Dallas' },
  { value: 'us-east', text: 'Washington DC' },
  { value: 'ca-tor', text: 'Toronto' },
  { value: 'br-sao', text: 'São Paulo' },
  { value: 'eu-de', text: 'Frankfurt' },
  { value: 'eu-gb', text: 'London' },
  { value: 'jp-tok', text: 'Tokyo' },
];

/** A list of regions, one picked. */
export const Default = {
  args: {
    label: 'Region',
    defaultValue: 'us-south',
    variant: 'inverse',
    size: 'md',
    frame: 'inset',
    fit: 'hug',
    activation: 'automatic',
    wrap: false,
  },
  render: (args: SelectListProps) => (
    <SelectList {...args}>
      {REGIONS.map((r) => (
        <SelectItem key={r.value} value={r.value} text={r.text} />
      ))}
    </SelectList>
  ),
};

/** Headings, a divider, a disabled row, secondary text and a trailing accessory. */
export const Groups = {
  render: () => (
    <SelectList label="Sort by" defaultValue="modified">
      <SelectItemGroup label="Date">
        <SelectItem
          value="modified"
          text="Last modified"
          secondaryLabel="Newest first"
        />
        <SelectItem
          value="created"
          text="Date created"
          secondaryLabel="Newest first"
        />
        <SelectItem
          value="opened"
          text="Last opened"
          secondaryLabel="No history yet"
          disabled
        />
      </SelectItemGroup>
      <SelectItemGroup label="Details">
        <SelectItem value="name" text="Name" accessory="A–Z" />
        <SelectItem value="size" text="Size" accessory="Largest" />
        <SelectItem value="type" text="Type" accessory="A–Z" />
      </SelectItemGroup>
      <SelectItemDivider />
      <SelectItem value="manual" text="Manual order" />
    </SelectList>
  ),
};

const VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;

/** The four selector looks, side by side. */
export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {VARIANTS.map((variant) => (
        <SelectList
          key={variant}
          label={`Region, ${variant}`}
          variant={variant}
          defaultValue="ca-tor">
          {REGIONS.slice(0, 5).map((r) => (
            <SelectItem key={r.value} value={r.value} text={r.text} />
          ))}
        </SelectList>
      ))}
    </div>
  ),
};

/** Controlled, with nothing picked at first: the first pick brings the selector in, and Clear takes it away. */
export const Clearing = {
  render: function ClearingStory() {
    const [value, setValue] = useState<SelectListValue | null>(null);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <SelectList
          label="Region"
          value={value}
          onChange={({ value: next }) => setValue(next)}>
          {REGIONS.slice(0, 6).map((r) => (
            <SelectItem key={r.value} value={r.value} text={r.text} />
          ))}
        </SelectList>
        <Button
          size="sm"
          variant="outlined"
          disabled={value == null}
          onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    );
  },
};

/** Options that load: placeholder rows stand in until the rows arrive. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    const rows = REGIONS.slice(0, 5);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Checkbox
          id="selectlist-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <SelectList
          label="Region"
          defaultValue="eu-de"
          loading={loading}
          skeletonCount={rows.length}
          skeletonLabels={rows.map((r) => r.text)}>
          {loading
            ? null
            : rows.map((r) => (
                <SelectItem key={r.value} value={r.value} text={r.text} />
              ))}
        </SelectList>
      </div>
    );
  },
};
