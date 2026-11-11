/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Demo data for the dot matrix and the cone chart.

import { fixtureSet } from './bars';
import { HOUR, ORIGIN, REGIONS, WEEKDAYS, clock, range, round } from './data';
import type {
  ChartFixture,
  ConeData,
  ConeMultiple,
  DotMatrixData,
} from './types';

type Size = 'sm' | 'lg';

/* ── dot matrix: sign-ins by weekday and week ──────────────────────────── */

const DAY_SHAPE = [1, 1.02, 1.05, 1.04, 0.96, 0.58, 0.52];

/**
 * The dot matrix.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function signIns(size: Size, step: number): ChartFixture<DotMatrixData> {
  const weeks = size === 'sm' ? 6 : 12;
  const now = (size === 'sm' ? 3 : 7) + step;
  const cells = WEEKDAYS.map((_, d) =>
    range(weeks).map((w) =>
      round(8 * DAY_SHAPE[d] * (1 + w * 0.05) + (w % 4 === 3 ? 1.5 : 0), 1)
    )
  );
  const thisWeek = cells.map((row) => row[now]);
  const peak = thisWeek.indexOf(Math.max(...thisWeek));
  return {
    data: {
      rows: WEEKDAYS,
      columns: range(weeks).map((w) => `Wk ${w + 1}`),
      cells,
      now,
    },
    format: { value: { maximumFractionDigits: 1 }, locale: 'en-US' },
    card: {
      eyebrow: 'Sign-ins by day',
      metric: {
        value: cells[peak][now],
        unit: `K sign-ins, ${WEEKDAYS[peak]}`,
        decimals: 1,
      },
      delta: { value: 5, unit: '%', direction: 'up', kind: 'default' },
      headline: 'Midweek stays the busiest',
      body: 'Weekends run at about half of a weekday. Weeks after this one are projected.',
      status: { kind: 'default', label: 'Projection', stamp: `Wk ${now + 1}` },
    },
  };
}

/* ── cones: headroom by region ─────────────────────────────────────────── */

const FLOOR = 10;
/** Each region's headroom now, %, and its hourly change. */
const HEADROOM = [
  { now: 46, perHour: -1.5 },
  { now: 38, perHour: -2 },
  { now: 52, perHour: -0.5 },
  { now: 31, perHour: -3 },
  { now: 41, perHour: -1 },
  { now: 22, perHour: -4.5 },
];

/**
 * The cone chart.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function headroom(size: Size, step: number): ChartFixture<ConeData> {
  const base = size === 'sm' ? 8 : 16;
  const readings = base + step;
  const horizon = size === 'sm' ? 3 : 6;
  const multiples: ConeMultiple[] = HEADROOM.map((r, k) => {
    // Readings every half hour; the last of the first set is `now`.
    const at = (i: number) =>
      r.now + r.perHour * (i - (base - 1)) * 0.5 + Math.sin(i + k) * 0.8;
    const end = at(readings - 1) + r.perHour * horizon;
    const spread = 2 + horizon * 1.2;
    const low = round(Math.max(0, end - spread), 1);
    return {
      label: REGIONS[k],
      points: range(readings).map((i) => ({
        x: ORIGIN + i * HOUR * 0.5,
        y: round(at(i), 1),
      })),
      cone: { low, high: round(Math.max(0, end) + spread, 1) },
      kind: low < FLOOR ? 'danger' : undefined,
    };
  });
  const tightest = multiples.reduce((a, b) =>
    b.cone.low < a.cone.low ? b : a
  );
  const lastX = ORIGIN + (readings - 1) * HOUR * 0.5;
  return {
    data: { multiples, now: lastX, floor: FLOOR, domain: [0, 60] },
    format: {
      value: { style: 'unit', unit: 'percent', maximumFractionDigits: 0 },
      locale: 'en-US',
    },
    card: {
      eyebrow: 'Headroom by region',
      metric: {
        value: tightest.points[tightest.points.length - 1].y,
        unit: `% headroom, ${tightest.label}`,
        decimals: 1,
      },
      delta: { value: 4.5, unit: 'pts', direction: 'down', kind: 'danger' },
      headline: `${tightest.label} may run short within ${horizon} hours`,
      body: `Each cone is the range of headroom projected ${horizon} hours out. Under ${FLOOR}% needs attention.`,
      status: { kind: 'danger', label: 'At risk', stamp: clock(lastX) },
    },
  };
}

export const dotMatrix = fixtureSet('C3', 'Sign-ins by weekday', signIns);
export const cones = fixtureSet('C5', 'Headroom by region', headroom);
