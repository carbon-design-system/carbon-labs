/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListInput,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper,
} from '../index';
import type { StructuredListWrapperProps } from '../index';
import mdx from './StructuredList.mdx';

export default {
  title: 'V12/StructuredList',
  component: StructuredListWrapper,
  subcomponents: {
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    StructuredListInput,
    StructuredListSkeleton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover',
        'selection-glide',
        'line-marker',
        'ghost-marker',
        'radio-mark',
      ],
      reduced: {
        rollover: 'at-once',
        'selection-glide': 'shorter-clock',
        'line-marker': 'shorter-clock',
        'ghost-marker': 'shorter-clock',
        'radio-mark': 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'selected', 'focus'],
    },
  },
  argTypes: {
    frame: { control: 'inline-radio', options: ['line', 'ghost'] },
    corners: { control: 'inline-radio', options: ['square', 'rounded'] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    children: { control: false },
  },
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    storage: '20 GB',
    note: 'For a single project with light traffic.',
  },
  {
    id: 'standard',
    name: 'Standard',
    storage: '100 GB',
    note: 'For a small team, with daily backups.',
  },
  {
    id: 'plus',
    name: 'Plus',
    storage: '500 GB',
    note: 'For several teams, with hourly backups and priority support.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    storage: '2 TB',
    note: 'For an organization, with dedicated support and custom terms.',
  },
];

const Head = ({ selection = false }: { selection?: boolean }) => (
  <StructuredListHead>
    <StructuredListRow head selection={selection}>
      <StructuredListCell head>Plan</StructuredListCell>
      <StructuredListCell head>Storage</StructuredListCell>
      <StructuredListCell head>Details</StructuredListCell>
    </StructuredListRow>
  </StructuredListHead>
);

const PlainBody = () => (
  <StructuredListBody>
    {PLANS.map((p) => (
      <StructuredListRow key={p.id}>
        <StructuredListCell noWrap>{p.name}</StructuredListCell>
        <StructuredListCell noWrap>{p.storage}</StructuredListCell>
        <StructuredListCell>{p.note}</StructuredListCell>
      </StructuredListRow>
    ))}
  </StructuredListBody>
);

const SelectableBody = ({ onPick }: { onPick?: (id: string) => void }) => (
  <StructuredListBody>
    {PLANS.map((p) => (
      <StructuredListRow
        key={p.id}
        id={p.id}
        selection
        onClick={() => onPick?.(p.id)}>
        <StructuredListCell noWrap>
          <StructuredListInput
            title={p.name}
            onChange={(e) => onPick?.(e.target.value)}
          />
          {p.name}
        </StructuredListCell>
        <StructuredListCell noWrap>{p.storage}</StructuredListCell>
        <StructuredListCell>{p.note}</StructuredListCell>
      </StructuredListRow>
    ))}
  </StructuredListBody>
);

/** A plain list: rows of details, read across. It has no hover and no motion. */
export const Default = {
  args: {
    'aria-label': 'Plans',
    isCondensed: false,
    isFlush: false,
  },
  render: (args: StructuredListWrapperProps) => (
    <StructuredListWrapper {...args}>
      <Head />
      <PlainBody />
    </StructuredListWrapper>
  ),
};

/**
 * Rows as choices. Pick a row, or tab in and use the arrow keys: the marker
 * travels to the new row. The readout follows the pick.
 */
export const Selectable = {
  args: {
    'aria-label': 'Choose a plan',
    selection: true,
    selectedInitialRow: 'standard',
    frame: 'line',
    isCondensed: false,
    timeScale: 1,
  },
  render: function SelectableStory(args: StructuredListWrapperProps) {
    const [picked, setPicked] = useState(args.selectedInitialRow ?? '');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <StructuredListWrapper {...args}>
          <Head selection />
          <SelectableBody onPick={setPicked} />
        </StructuredListWrapper>
        <p style={{ margin: 0 }}>
          Selected: {PLANS.find((p) => p.id === picked)?.name ?? 'none'}
        </p>
      </div>
    );
  },
};

/** The two marker looks: `line`, the row lines it lands on, and `ghost`, a wash over the row. */
export const Frames = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {(['line', 'ghost'] as const).map((frame) => (
        <StructuredListWrapper
          key={frame}
          aria-label={`Choose a plan, ${frame}`}
          selection
          frame={frame}
          selectedInitialRow="basic">
          <Head selection />
          <SelectableBody />
        </StructuredListWrapper>
      ))}
    </div>
  ),
};

/** Nothing selected at first: the first pick grows the marker in from its row's center. */
export const NoInitialSelection = {
  render: () => (
    <StructuredListWrapper aria-label="Choose a plan" selection>
      <Head selection />
      <SelectableBody />
    </StructuredListWrapper>
  ),
};

/** `isCondensed`: 8px cells. */
export const Condensed = {
  render: () => (
    <StructuredListWrapper aria-label="Plans" isCondensed>
      <Head />
      <PlainBody />
    </StructuredListWrapper>
  ),
};

/** `isFlush`: no start padding, in line with the text around it. */
export const Flush = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0 }}>Each plan includes the same core features.</p>
      <StructuredListWrapper aria-label="Plans" isFlush>
        <Head />
        <PlainBody />
      </StructuredListWrapper>
    </div>
  ),
};

/** Loading: placeholder lines in three columns. */
export const Skeleton = {
  render: () => <StructuredListSkeleton rowCount={4} />,
};
