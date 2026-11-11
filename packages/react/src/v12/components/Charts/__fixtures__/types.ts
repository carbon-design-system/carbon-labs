/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The shapes of the demo data, as each chart family takes it.

import type {
  ChartDelta,
  ChartFormat,
  ChartKind,
  ChartMetric,
  ChartPoint,
  ChartReference,
  ChartSeries,
  ChartSize,
  ChartStatus,
} from '../components/types';

/** What a card says around its plot. */
export interface CardContent {
  eyebrow: string;
  metric: ChartMetric;
  delta?: ChartDelta;
  headline: string;
  body: string;
  status: ChartStatus;
  /** Button labels, the first the primary. */
  actions?: string[];
}

/** One chart's data and card text at one size. */
export interface ChartFixture<D> {
  card: CardContent;
  data: D;
  format: ChartFormat;
}

/** One chart's demo data: both sizes, and the next reading for live updates. */
export interface ChartFixtureSet<D> {
  /** The chart in the family. */
  chart: string;
  /** What the data is, for a story's dataset control. */
  title: string;
  sizes: Record<Exclude<ChartSize, 'md'>, ChartFixture<D>>;
  next: Record<Exclude<ChartSize, 'md'>, ChartFixture<D>>;
}

/**
 * Bars: one series per color. A projected point at an x that also has a
 * measured point continues that bar.
 */
export interface BarData {
  series: ChartSeries[];
  /** Category labels, one per x, for a category axis. */
  categories?: string[];
  /** The last measured x. */
  now?: number;
  reference?: ChartReference;
  /** A stacked bar's target, per x. */
  target?: { x: number; value: number }[];
  domain?: [number, number];
  ticks?: number[];
  layout: 'single' | 'grouped' | 'stacked';
  orientation: 'vertical' | 'horizontal';
}

/** One ring of a radial chart. */
export interface RadialRing {
  label: string;
  value: number;
  projected?: number;
  max: number;
}

/** Radial charts. */
export interface RadialData {
  rings: RadialRing[];
  threshold?: ChartReference;
}

/** A labeled span of the x axis. */
export interface AreaRegion {
  from: number;
  to: number;
  label: string;
}

/** Area charts. */
export interface AreaData {
  series: ChartSeries[];
  now: number;
  regions?: AreaRegion[];
  domain?: [number, number];
  ticks?: number[];
}

/** The dot matrix: one value per row and column. */
export interface DotMatrixData {
  rows: string[];
  columns: string[];
  cells: number[][];
  /** The last measured column. */
  now: number;
}

/** One small multiple of the cone chart. */
export interface ConeMultiple {
  label: string;
  points: ChartPoint[];
  cone: { low: number; high: number };
  kind?: ChartKind;
}

/** The cone chart: small multiples, each projected to a range. */
export interface ConeData {
  multiples: ConeMultiple[];
  now: number;
  /** The level under which a multiple needs attention. */
  floor: number;
  domain: [number, number];
}

/** How fresh a status card's reading is. */
export type Freshness = 'live' | 'stale' | 'failed' | 'recovered';

/** How a projection stands against its limit. */
export type ForecastStanding = 'good' | 'warning' | 'critical';

/** A status card: a reading, how fresh it is, and where it is heading. */
export interface StatusData {
  freshness: Freshness;
  readings: ChartPoint[];
  forecast?: {
    standing: ForecastStanding;
    limit: ChartReference;
    /** When the projection reaches the limit, or null when it doesn't. */
    reachesAt: number | null;
  };
}
