/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import type { ChartPoint } from '../index';
import {
  CHART_FIXTURES,
  STATUS_FRESHNESS,
  STATUS_STANDING,
  statusScene,
  type ChartFixture,
  type ChartFixtureSet,
} from '../__fixtures__';

const SETS = Object.values(CHART_FIXTURES).flatMap(
  (family) => Object.values(family) as ChartFixtureSet<unknown>[]
);

/**
 * Every point in a fixture's data.
 *
 * @param data The data.
 * @returns The points.
 */
function pointsOf(data: unknown): ChartPoint[] {
  if (Array.isArray(data)) {
    return data.flatMap(pointsOf);
  }
  if (data && typeof data === 'object') {
    if ('x' in data && 'y' in data) {
      return [data as ChartPoint];
    }
    return Object.values(data).flatMap(pointsOf);
  }
  return [];
}

/**
 * Every string in a value.
 *
 * @param value The value.
 * @returns The strings.
 */
function textOf(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(textOf);
  }
  return [];
}

const ALL = SETS.flatMap((set) => [
  ...Object.values(set.sizes),
  ...Object.values(set.next),
]) as ChartFixture<unknown>[];

describe('the fixtures', () => {
  it('cover every chart in the family', () => {
    expect(SETS.map((s) => s.chart).sort()).toEqual(
      [
        'C10',
        'C10s',
        'C2',
        'C3',
        'C4',
        'C5',
        'C6',
        'C7',
        'C8',
        'C8e',
        'C8l',
        'C8s',
        'C9',
        'status',
      ].sort()
    );
  });

  it('come in both sizes, now and one reading later', () => {
    for (const set of SETS) {
      expect(Object.keys(set.sizes).sort(), set.chart).toEqual(['lg', 'sm']);
      expect(Object.keys(set.next).sort(), set.chart).toEqual(['lg', 'sm']);
      for (const size of ['sm', 'lg'] as const) {
        expect(JSON.stringify(set.next[size].data), set.chart).not.toBe(
          JSON.stringify(set.sizes[size].data)
        );
      }
    }
  });

  it('draw more at the large size', () => {
    for (const set of SETS) {
      expect(
        pointsOf(set.sizes.lg.data).length,
        set.chart
      ).toBeGreaterThanOrEqual(pointsOf(set.sizes.sm.data).length);
    }
  });

  it('hold only finite values, ranges round their projection', () => {
    for (const f of ALL) {
      for (const p of pointsOf(f.data)) {
        expect(Number.isFinite(p.y)).toBe(true);
        if (p.basis === 'projected' && p.low != null && p.high != null) {
          expect(p.low).toBeLessThanOrEqual(p.y);
          expect(p.high).toBeGreaterThanOrEqual(p.y);
        }
      }
    }
  });

  it('give every card its text', () => {
    for (const f of ALL) {
      const c = f.card;
      expect(c.eyebrow.length).toBeGreaterThan(0);
      expect(c.headline.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
      expect(Number.isFinite(c.metric.value)).toBe(true);
      expect(c.status.label.length).toBeGreaterThan(0);
    }
  });

  it('keep their text short and neutral', () => {
    const text = [
      ...ALL,
      ...Object.values(STATUS_FRESHNESS),
      ...Object.values(STATUS_STANDING),
    ].flatMap((f) => textOf(f.card));
    for (const t of text) {
      expect(t.length, t).toBeLessThanOrEqual(160);
      // No dates and no British spellings.
      expect(t, t).not.toMatch(/\b20\d\d\b|colour|behaviour|centre|grey/i);
    }
  });

  it('are the same on every build', () => {
    expect(JSON.stringify(statusScene('stale', 12, true))).toBe(
      JSON.stringify(statusScene('stale', 12, true))
    );
  });

  it('give the status cards every state', () => {
    expect(Object.keys(STATUS_FRESHNESS)).toEqual([
      'live',
      'stale',
      'failed',
      'recovered',
    ]);
    expect(
      Object.entries(STATUS_STANDING).map(([k, f]) => [
        k,
        f.data.forecast?.standing,
      ])
    ).toEqual([
      ['good', 'good'],
      ['warning', 'warning'],
      ['critical', 'critical'],
    ]);
  });
});
