/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Helpers for the demo data: a fixed clock, rounding, and projected ranges
// that widen with distance from now. Every value is computed from these, so
// the data is the same on every run.

import type { ChartPoint } from '../components/types';

/** A Monday at 08:00 UTC: the demo clock's origin. */
export const ORIGIN = Date.UTC(2030, 0, 7, 8);
export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
/** Neutral names for places: regions A to H. */
export const REGIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(
  (l) => `Region ${l}`
);
/** Neutral names for sources: source A to H. */
export const SOURCES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(
  (l) => `Source ${l}`
);

/**
 * A number at `places` decimal places.
 *
 * @param n The number.
 * @param places The places.
 * @returns It, rounded.
 */
export function round(n: number, places = 0): number {
  const k = 10 ** places;
  return Math.round(n * k) / k;
}

/**
 * The integers from 0 to `n - 1`.
 *
 * @param n How many.
 * @returns The list.
 */
export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * A projected point with a range that widens the further it is from now.
 *
 * @param x Its x.
 * @param y Its value.
 * @param ahead How many steps past now.
 * @param spread The range's half width at one step, as a share of the value.
 * @param places Decimal places.
 * @returns The point.
 */
export function projected(
  x: number,
  y: number,
  ahead: number,
  spread = 0.03,
  places = 0
): ChartPoint {
  const half = y * spread * Math.sqrt(Math.max(1, ahead));
  return {
    x,
    y: round(y, places),
    basis: 'projected',
    low: round(y - half, places),
    high: round(y + half, places),
  };
}

/**
 * The change from one value to the next, as a percentage.
 *
 * @param from The earlier value.
 * @param to The later value.
 * @returns The change, one decimal place.
 */
export function percentChange(from: number, to: number): number {
  return round(((to - from) / from) * 100, 1);
}

/**
 * A clock time on the demo clock, as a card's stamp writes it.
 *
 * @param t The time.
 * @returns For example `9:50 AM`.
 */
export function clock(t: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(t);
}
