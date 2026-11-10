/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
// The copy button's tooltip takes its look from the selection kit.
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  DescriptionList,
  DescriptionListItem,
  DescriptionListSizes,
} from '../index';
import type { DescriptionListProps } from '../index';
import mdx from './DescriptionList.mdx';

export default {
  title: 'V12/DescriptionList',
  component: DescriptionList,
  subcomponents: { DescriptionListItem },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['skeleton-hand-off', 'copy-reveal'],
      reduced: {
        'skeleton-hand-off': 'shorter-clock',
      },
      states: ['loaded', 'loading'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: DescriptionListSizes },
    columns: { control: 'inline-radio', options: [1, 2, 'auto'] },
    layout: { control: 'inline-radio', options: ['stacked', 'inline'] },
  },
};

const stack = { display: 'grid', gap: 48 };

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The details of a made-up storage volume. */
const Details = () => (
  <>
    <DescriptionListItem term="Name" copyable>
      volume-north-01
    </DescriptionListItem>
    <DescriptionListItem term="Status">Available</DescriptionListItem>
    <DescriptionListItem term="Region">North zone 2</DescriptionListItem>
    <DescriptionListItem term="Capacity">500 GB</DescriptionListItem>
    <DescriptionListItem
      term="Volume ID"
      copyable
      copyText="a1b2c3d4-0000-4e5f-9a8b-0c1d2e3f4a5b"
      skeletonWidth="80%">
      a1b2c3d4-0000-4e5f-9a8b-0c1d2e3f4a5b
    </DescriptionListItem>
    <DescriptionListItem term="Created">3 days ago</DescriptionListItem>
    <DescriptionListItem term="Description" span skeletonWidth="90%">
      Shared storage for the build workers. Snapshots run every night and are
      kept for a week.
    </DescriptionListItem>
  </>
);

/** Terms over their values, two columns once the list is wide enough. */
export const Default = {
  args: {
    'aria-label': 'Volume details',
    size: 'md',
    columns: 'auto',
    layout: 'stacked',
    loading: false,
  },
  render: (args: DescriptionListProps) => (
    <DescriptionList {...args}>
      <Details />
    </DescriptionList>
  ),
};

/** The three sizes: the type and the space between pairs. */
export const Sizes = {
  render: () => (
    <div style={stack}>
      {DescriptionListSizes.map((size) => (
        <DescriptionList
          key={size}
          aria-label={`Volume details, ${size}`}
          size={size}
          columns={2}>
          <DescriptionListItem term="Name">volume-north-01</DescriptionListItem>
          <DescriptionListItem term="Status">Available</DescriptionListItem>
          <DescriptionListItem term="Region">North zone 2</DescriptionListItem>
          <DescriptionListItem term="Capacity">500 GB</DescriptionListItem>
        </DescriptionList>
      ))}
    </div>
  ),
};

/** The term above its value, or beside it in its own column. */
export const Layouts = {
  render: () => (
    <div style={stack}>
      <DescriptionList aria-label="Stacked" layout="stacked" columns={1}>
        <Details />
      </DescriptionList>
      <DescriptionList aria-label="Inline" layout="inline" columns={1}>
        <Details />
      </DescriptionList>
    </div>
  ),
};

/** One column, two, or by width. Drag the box's corner: by width, it turns to two columns at the medium size class. */
export const Columns = {
  render: () => (
    <div style={stack}>
      <DescriptionList aria-label="One column" columns={1}>
        <Details />
      </DescriptionList>
      <DescriptionList aria-label="Two columns" columns={2}>
        <Details />
      </DescriptionList>
      <div
        style={{
          resize: 'horizontal',
          overflow: 'auto',
          inlineSize: 560,
          minInlineSize: 240,
          maxInlineSize: '100%',
          padding: 16,
          outline: '1px dashed var(--cds-border-subtle)',
        }}>
        <DescriptionList aria-label="By width" columns="auto">
          <Details />
        </DescriptionList>
      </div>
    </div>
  ),
};

/** Hover or focus a pair: its copy button fades in after the value. A click copies the value's text, or `copyText`. */
export const Copyable = {
  render: () => (
    <DescriptionList aria-label="Connection" columns={1}>
      <DescriptionListItem term="Host" copyable>
        data.example.com
      </DescriptionListItem>
      <DescriptionListItem term="Port" copyable>
        8443
      </DescriptionListItem>
      <DescriptionListItem
        term="Endpoint"
        copyable
        copyText="https://data.example.com:8443/v1/volumes"
        copyLabel="Copy endpoint">
        https://data.example.com:8443/v1/volumes
      </DescriptionListItem>
    </DescriptionList>
  ),
};

/** Loading: the terms are drawn and each value is a bar. Turn loading off and every bar hands off to its value in place; on again, and the values return into their bars. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Checkbox
            id="descriptionlist-loading"
            labelText="Loading"
            checked={loading}
            onChange={(_e, { checked }) => setLoading(checked)}
          />
        </div>
        <DescriptionList aria-label="Volume details" loading={loading}>
          <Details />
        </DescriptionList>
      </div>
    );
  },
};
