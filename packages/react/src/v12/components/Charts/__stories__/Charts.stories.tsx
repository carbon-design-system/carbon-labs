/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  ChartCard,
  formatChartNumber,
  type ChartCardOverflowAction,
  type ChartPoint,
  type ChartSize,
  type ChartState,
} from '../index';
import {
  CHART_FIXTURES,
  type ChartFixture,
  type ChartFixtureSet,
} from '../__fixtures__';
import mdx from './Charts.mdx';

/** Every dataset, by a name a control can show. */
const DATASETS = Object.fromEntries(
  Object.values(CHART_FIXTURES).flatMap((family) =>
    (Object.values(family) as ChartFixtureSet<unknown>[]).map((set) => [
      `${set.title} (${set.chart})`,
      set,
    ])
  )
) as Record<string, ChartFixtureSet<unknown>>;
const NAMES = Object.keys(DATASETS);

/** The bars' dataset: its large card has actions. */
const BARS = `${CHART_FIXTURES.bar.single.title} (${CHART_FIXTURES.bar.single.chart})`;

/** The overflow menu every story's card has. */
const OVERFLOW: ChartCardOverflowAction[] = [
  { id: 'export', itemText: 'Export data' },
  { id: 'hide', itemText: 'Hide card' },
];

/**
 * Every point in a dataset.
 *
 * @param data The data.
 * @returns The points.
 */
function pointsOf(data: unknown): ChartPoint[] {
  if (Array.isArray(data)) {
    return data.flatMap(pointsOf);
  }
  if (data && typeof data === 'object') {
    return 'x' in data && 'y' in data
      ? [data as ChartPoint]
      : Object.values(data).flatMap(pointsOf);
  }
  return [];
}

/**
 * Where the plot will be: the data's extent, until each family draws its
 * own.
 *
 * @param props The fixture.
 * @returns The stand-in.
 */
function PlotStandIn({ fixture }: { fixture: ChartFixture<unknown> }) {
  const { format } = fixture;
  const points = pointsOf(fixture.data);
  const measured = points.filter((p) => p.basis !== 'projected');
  const projected = points.filter((p) => p.basis === 'projected');
  const ys = points.map((p) => p.y);
  const n = (v: number) => formatChartNumber(v, format.value, format.locale);
  return (
    <dl
      style={{
        boxSizing: 'border-box',
        height: '100%',
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignContent: 'center',
        gap: '4px 16px',
        fontSize: 'var(--cds-chart-stamp)',
        color: 'var(--cds-chart-color-stamp)',
        border: '1px dashed var(--cds-border-subtle-01)',
        paddingInline: 16,
      }}>
      <dt>Measured</dt>
      <dd style={{ margin: 0 }}>{measured.length} values</dd>
      <dt>Projected</dt>
      <dd style={{ margin: 0 }}>{projected.length} values</dd>
      {ys.length ? (
        <>
          <dt>From</dt>
          <dd style={{ margin: 0 }}>{n(Math.min(...ys))}</dd>
          <dt>To</dt>
          <dd style={{ margin: 0 }}>{n(Math.max(...ys))}</dd>
        </>
      ) : null}
    </dl>
  );
}

interface CardArgs {
  dataset: string;
  size: ChartSize;
  state: ChartState;
  theme: 'page' | 'light' | 'dark' | 'inverse';
  live: boolean;
}

/**
 * A dataset's card at a size: `md`, the summary card, takes the `sm` text.
 *
 * @param args The story's args.
 * @returns The card.
 */
function FixtureCard({ dataset, size, state, theme, live }: CardArgs) {
  const set = DATASETS[dataset] ?? DATASETS[NAMES[0]];
  const fixture = (live ? set.next : set.sizes)[size === 'lg' ? 'lg' : 'sm'];
  const { card, format } = fixture;
  return (
    <ChartCard
      title={card.eyebrow}
      metric={card.metric}
      delta={card.delta}
      format={format}
      headline={card.headline}
      description={card.body}
      status={card.status}
      actions={card.actions?.map((label) => ({ label }))}
      overflowActions={OVERFLOW}
      overflowAriaLabel={`${card.eyebrow} options`}
      size={size}
      state={state}
      theme={theme}>
      <PlotStandIn fixture={fixture} />
    </ChartCard>
  );
}

export default {
  title: 'V12/Charts',
  component: ChartCard,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'duration-moderate-01',
        'easing-standard-productive',
        'easing-entrance-productive',
      ],
      reduced: {
        'duration-moderate-01': 'at-once',
        'easing-standard-productive': 'at-once',
        'easing-entrance-productive': 'at-once',
      },
      states: ['rest', 'live-update', 'loading', 'empty', 'error'],
    },
  },
  argTypes: {
    dataset: { control: 'select', options: NAMES },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    state: {
      control: 'inline-radio',
      options: ['ready', 'loading', 'empty', 'error'],
    },
    theme: {
      control: 'inline-radio',
      options: ['page', 'light', 'dark', 'inverse'],
    },
    live: { control: 'boolean', name: 'live update' },
  },
  args: {
    dataset: NAMES[0],
    size: 'sm',
    state: 'ready',
    theme: 'page',
    live: false,
  },
  render: (args: CardArgs) => <FixtureCard {...args} />,
};

/** A dataset's card and the extent of its data; "live update" swaps in the next reading. */
export const Fixtures = {};

/** The 380 card. */
export const Small = { args: { size: 'sm' } };

/** The 405 summary card: its plot runs to the card's edges. */
export const Medium = { args: { size: 'md' } };

/** The 640 card: the delta follows the unit, the actions in its foot. */
export const Large = { args: { size: 'lg', dataset: BARS } };

/** Loading: the lane's skeleton, the plot as a block. */
export const Loading = { args: { state: 'loading' } };

/** No data: a message in the plot's place. */
export const Empty = { args: { state: 'empty' } };

/** The data couldn't be read: a message in the plot's place. */
export const LoadError = { args: { state: 'error' } };
