/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The data every chart in the family takes. A series is measured up to `now`
// and projected after it: one series, split where the card draws the split.

/** Whether a value was read or is a projection. */
export type ChartBasis = 'measured' | 'projected';

/** One value on a chart. `low` and `high` bound a projected value. */
export interface ChartPoint {
  /** The position along the category or time axis: an index, or a time in ms. */
  x: number;
  y: number;
  /** Measured by default. */
  basis?: ChartBasis;
  low?: number;
  high?: number;
}

/** A named run of points. */
export interface ChartSeries {
  id: string;
  label: string;
  points: ChartPoint[];
}

/** A number format: `Intl.NumberFormat` options, or a function. */
export type ChartNumberFormat =
  | Intl.NumberFormatOptions
  | ((value: number) => string);

/** How a chart writes its values and its x axis, and in which locale. */
export interface ChartFormat {
  value?: ChartNumberFormat;
  /** For a time axis, `Intl.DateTimeFormat` options; for a category axis, a function. */
  x?: Intl.DateTimeFormatOptions | ((x: number) => string);
  locale?: string;
}

/** What a chart shows: its data, a skeleton, its empty state or its error. */
export type ChartState = 'ready' | 'loading' | 'empty' | 'error';

/** The card sizes: `sm` 380, `md` the 405 summary card, `lg` 640. */
export type ChartSize = 'sm' | 'md' | 'lg';

/** A role or a status, never a look. `default` is neither good nor bad. */
export type ChartKind = 'success' | 'danger' | 'warning' | 'default';

/** The card's big number. */
export interface ChartMetric {
  value: number;
  unit?: string;
  /** Digits after the point; the format's own when unset. */
  decimals?: number;
  basis?: ChartBasis;
}

/** The change beside the big number. */
export interface ChartDelta {
  value: number;
  /** `%` follows the number; any other unit follows it after a space. */
  unit?: string;
  direction: 'up' | 'down';
  kind?: ChartKind;
}

/** The status line in the card's foot. */
export interface ChartStatus {
  kind?: ChartKind;
  label: string;
  /** When the data was read, as the card shows it. */
  stamp?: string;
}

/** A labeled value drawn across the plot: a target, a limit, a forecast. */
export interface ChartReference {
  value: number;
  label: string;
}
