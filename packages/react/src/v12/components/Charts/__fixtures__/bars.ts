/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Demo data for the bar charts: single, range, grouped, stacked and
// horizontal bars.

import type { ChartPoint, ChartSeries } from '../components/types';
import {
  DAY,
  MINUTE,
  MONTHS,
  ORIGIN,
  REGIONS,
  SOURCES,
  clock,
  percentChange,
  projected,
  range,
  round,
} from './data';
import type { BarData, ChartFixture, ChartFixtureSet } from './types';

type Size = 'sm' | 'lg';

/**
 * Builds a fixture set from one builder: each size now, and each size one
 * reading later.
 *
 * @param chart The chart.
 * @param title What the data is.
 * @param build The builder, by size and readings past the first.
 * @returns The set.
 */
export function fixtureSet<D>(
  chart: string,
  title: string,
  build: (size: Size, step: number) => ChartFixture<D>
): ChartFixtureSet<D> {
  return {
    chart,
    title,
    sizes: { sm: build('sm', 0), lg: build('lg', 0) },
    next: { sm: build('sm', 1), lg: build('lg', 1) },
  };
}

/* ── single bars: jobs waiting, every 10 minutes ───────────────────────── */

const QUEUE_LIMIT = 450;
const SLOT = 10 * MINUTE;

/**
 * Jobs waiting at slot `i`: a slow start, a steep rise, a plateau.
 *
 * @param i The slot.
 * @param n The slots in the plot.
 * @returns The count.
 */
function queueAt(i: number, n: number): number {
  const mid = n * 0.55;
  return 20 + 540 / (1 + Math.exp(-(i - mid) / (n / 10)));
}

/**
 * Single bars.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function queueBars(size: Size, step: number): ChartFixture<BarData> {
  const total = size === 'sm' ? 15 : 30;
  const measuredCount = (size === 'sm' ? 11 : 22) + step;
  const ahead = size === 'sm' ? 3 : 6;
  const t0 = ORIGIN;
  const points: ChartPoint[] = range(measuredCount + ahead).map((i) => {
    const x = t0 + i * SLOT;
    const y = queueAt(i, total);
    return i < measuredCount
      ? { x, y: round(y) }
      : projected(x, y, i - measuredCount + 1);
  });
  const last = points[measuredCount - 1];
  const before = points[measuredCount - 2];
  const over = last.y > QUEUE_LIMIT;
  return {
    data: {
      series: [{ id: 'waiting', label: 'Jobs waiting', points }],
      now: last.x,
      reference: { value: QUEUE_LIMIT, label: 'Planned limit' },
      domain: [0, 600],
      ticks: [0, 300, 600],
      layout: 'single',
      orientation: 'vertical',
    },
    format: { value: { maximumFractionDigits: 0 }, locale: 'en-US' },
    card: {
      eyebrow: 'Job queue',
      metric: { value: last.y, unit: 'jobs waiting' },
      delta: {
        value: percentChange(before.y, last.y),
        unit: '%',
        direction: last.y >= before.y ? 'up' : 'down',
        kind: over ? 'danger' : 'default',
      },
      headline: over
        ? 'The queue is past its planned limit'
        : 'The queue is rising toward its limit',
      body: `Jobs are arriving faster than workers finish them. The projection holds above ${QUEUE_LIMIT} for the next half hour.`,
      status: {
        kind: over ? 'danger' : 'warning',
        label: over ? 'Over limit' : 'Rising',
        stamp: clock(last.x),
      },
      actions: size === 'lg' ? ['View queue', 'Add workers'] : undefined,
    },
  };
}

/* ── range bars: daily active users, projected as ranges ───────────────── */

/**
 * Daily active users, thousands: a weekly rhythm on a slow climb.
 *
 * @param day The day.
 * @returns The value.
 */
function usersOn(day: number): number {
  const weekly = [1, 1.04, 1.06, 1.05, 0.98, 0.72, 0.68][day % 7];
  return 42 * weekly * (1 + day * 0.006);
}

/**
 * Range bars.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function usersRange(size: Size, step: number): ChartFixture<BarData> {
  const measuredCount = (size === 'sm' ? 7 : 14) + step;
  const ahead = size === 'sm' ? 5 : 10;
  const points: ChartPoint[] = range(measuredCount + ahead).map((d) => {
    const x = ORIGIN + d * DAY;
    return d < measuredCount
      ? { x, y: round(usersOn(d), 1) }
      : projected(x, usersOn(d), d - measuredCount + 1, 0.05, 1);
  });
  const last = points[measuredCount - 1];
  const weekBefore = points[measuredCount - 1 - 7] ?? points[0];
  return {
    data: {
      series: [{ id: 'users', label: 'Daily active users', points }],
      now: last.x,
      domain: [0, 60],
      ticks: [0, 30, 60],
      layout: 'single',
      orientation: 'vertical',
    },
    format: {
      value: { maximumFractionDigits: 1 },
      x: { weekday: 'short', timeZone: 'UTC' },
      locale: 'en-US',
    },
    card: {
      eyebrow: 'Daily active users',
      metric: { value: last.y, unit: 'K users', decimals: 1 },
      delta: {
        value: percentChange(weekBefore.y, last.y),
        unit: '%',
        direction: last.y >= weekBefore.y ? 'up' : 'down',
        kind: 'success',
      },
      headline: 'Weekday use keeps climbing',
      body: 'Weekends stay lower. The projected range widens the further it runs from today.',
      status: { kind: 'default', label: 'Projection', stamp: 'Daily' },
    },
  };
}

/* ── grouped bars: storage by tier and region ──────────────────────────── */

const TIERS = [
  { id: 'hot', label: 'Hot', share: 0.5 },
  { id: 'warm', label: 'Warm', share: 0.32 },
  { id: 'cold', label: 'Cold', share: 0.18 },
];

/**
 * Grouped bars.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function storageGrouped(size: Size, step: number): ChartFixture<BarData> {
  const groups = size === 'sm' ? 4 : 6;
  const projectedFrom = groups - 1 + Math.min(step, 1);
  const categories = REGIONS.slice(0, groups);
  const series: ChartSeries[] = TIERS.map((tier) => ({
    id: tier.id,
    label: tier.label,
    points: range(groups).map((g) => {
      const y = (60 + g * 9 + (g % 2) * 6) * tier.share * (1 + step * 0.04);
      return g < projectedFrom
        ? { x: g, y: round(y, 1) }
        : projected(g, y, 1, 0.04, 1);
    }),
  }));
  const hot = series[0].points;
  const lastMeasured = hot[Math.min(projectedFrom, groups) - 1];
  return {
    data: {
      series,
      categories,
      now: lastMeasured.x,
      domain: [0, 60],
      ticks: [0, 30, 60],
      layout: 'grouped',
      orientation: 'vertical',
    },
    format: { value: { maximumFractionDigits: 1 }, locale: 'en-US' },
    card: {
      eyebrow: 'Storage used',
      metric: {
        value: lastMeasured.y,
        unit: `TB hot, ${categories[lastMeasured.x]}`,
        decimals: 1,
      },
      delta: { value: 6.2 + step, unit: '%', direction: 'up', kind: 'default' },
      headline: 'Hot storage leads in every region',
      body: 'Cold storage grows the slowest. The last region is projected from its current rate.',
      status: { kind: 'default', label: 'Projection', stamp: 'This quarter' },
    },
  };
}

/* ── stacked bars: monthly requests by client ──────────────────────────── */

const CLIENTS = [
  { id: 'web', label: 'Web', share: 0.55 },
  { id: 'mobile', label: 'Mobile', share: 0.3 },
  { id: 'api', label: 'API', share: 0.15 },
];

/**
 * Stacked bars.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function requestsStacked(size: Size, step: number): ChartFixture<BarData> {
  const months = size === 'sm' ? 6 : 12;
  const measuredCount = (size === 'sm' ? 4 : 8) + step;
  const totalOf = (m: number) => 18 + m * 1.6 + (m % 3 === 2 ? 2 : 0);
  const series: ChartSeries[] = CLIENTS.map((client) => ({
    id: client.id,
    label: client.label,
    points: range(months).map((m) => {
      const y = totalOf(m) * client.share;
      return m < measuredCount
        ? { x: m, y: round(y, 1) }
        : projected(m, y, m - measuredCount + 1, 0.04, 1);
    }),
  }));
  const total = (m: number) =>
    round(
      series.reduce((s, c) => s + c.points[m].y, 0),
      1
    );
  const last = measuredCount - 1;
  return {
    data: {
      series,
      categories: MONTHS.slice(0, months),
      now: last,
      target: range(months).map((m) => ({
        x: m,
        value: round(totalOf(m) * 1.05, 1),
      })),
      domain: [0, 40],
      ticks: [0, 20, 40],
      layout: 'stacked',
      orientation: 'vertical',
    },
    format: { value: { maximumFractionDigits: 1 }, locale: 'en-US' },
    card: {
      eyebrow: 'Requests by client',
      metric: { value: total(last), unit: 'M requests', decimals: 1 },
      delta: {
        value: percentChange(total(last - 1), total(last)),
        unit: '%',
        direction: total(last) >= total(last - 1) ? 'up' : 'down',
        kind: 'default',
      },
      headline: 'Web carries more than half of all requests',
      body: 'The API share holds steady. Months ahead are projected from the trend so far.',
      status: { kind: 'default', label: 'Projection', stamp: MONTHS[last] },
      actions: size === 'lg' ? ['View report'] : undefined,
    },
  };
}

/* ── horizontal bars: events by source ─────────────────────────────────── */

const MODELS = [
  { id: 'standard', label: 'Standard', share: 0.6 },
  { id: 'priority', label: 'Priority', share: 0.4 },
];

/**
 * Horizontal bars, one segment or two.
 *
 * @param stacked Whether each bar has segments.
 * @returns The builder.
 */
function eventsHorizontal(stacked: boolean) {
  return (size: Size, step: number): ChartFixture<BarData> => {
    const rows = size === 'sm' ? 5 : 8;
    const categories = SOURCES.slice(0, rows);
    const measuredOf = (r: number) => 48 - r * 5 + (r % 2) * 3 + step * 2;
    const projectedOf = (r: number) => 14 - r + (r % 3);
    const parts = stacked
      ? MODELS
      : [{ id: 'all', label: 'All events', share: 1 }];
    const series: ChartSeries[] = parts.map((p) => ({
      id: p.id,
      label: p.label,
      points: range(rows).flatMap((r) => [
        { x: r, y: round(measuredOf(r) * p.share, 1) },
        projected(r, projectedOf(r) * p.share, 1, 0.08, 1),
      ]),
    }));
    const lead = round(measuredOf(0), 1);
    return {
      data: {
        series,
        categories,
        domain: [0, 80],
        ticks: [0, 40, 80],
        layout: stacked ? 'stacked' : 'single',
        orientation: 'horizontal',
      },
      format: { value: { maximumFractionDigits: 1 }, locale: 'en-US' },
      card: {
        eyebrow: 'Events by source',
        metric: {
          value: lead,
          unit: `K events, ${categories[0]}`,
          decimals: 1,
        },
        delta: { value: 4.8, unit: '%', direction: 'up', kind: 'default' },
        headline: stacked
          ? 'Priority events stay under half'
          : `${categories[0]} sends the most events`,
        body: 'Each bar is the week so far, then the rest of the week as projected.',
        status: { kind: 'default', label: 'Projection', stamp: 'This week' },
      },
    };
  };
}

export const singleBars = fixtureSet('C2', 'Jobs waiting', queueBars);
export const rangeBars = fixtureSet('C4', 'Daily active users', usersRange);
export const groupedBars = fixtureSet(
  'C6',
  'Storage used by tier',
  storageGrouped
);
export const stackedBars = fixtureSet(
  'C7',
  'Requests by client',
  requestsStacked
);
export const horizontalBars = fixtureSet(
  'C10',
  'Events by source',
  eventsHorizontal(false)
);
export const horizontalStacked = fixtureSet(
  'C10s',
  'Events by source and class',
  eventsHorizontal(true)
);
