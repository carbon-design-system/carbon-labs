/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { fitColumns } from '../components/DataTableSkeleton';

const sum = (ws: number[]) => ws.reduce((s, w) => s + w, 0);

describe('fitColumns (DataTableReveal: every column holds its minimum)', () => {
  // The resource index's: Name 26.5%, Status 17%, Region 14.5%, Owner 19.5%, Updated the rest.
  const recipe = [
    { pct: 0.265, min: 176 },
    { pct: 0.17, min: 112 },
    { pct: 0.145, min: 96 },
    { pct: 0.195, min: 128 },
    { min: 112 },
  ];

  it('gives each share of the table, and what is left to the column without one', () => {
    const ws = fitColumns(1000, 40, recipe);
    expect(ws.slice(0, 4)).toEqual([265, 170, 145, 195]);
    expect(ws[4]).toBeCloseTo(185);
    expect(sum(ws)).toBeCloseTo(960);
  });

  it('holds a minimum a share would go under; the others give way in proportion', () => {
    // Status at 6% of an 800px table is 48px, under its 112.
    const skewed = recipe.map((c, i) => (i === 1 ? { ...c, pct: 0.06 } : c));
    const ws = fitColumns(800, 40, skewed);
    expect(ws[1]).toBe(112);
    ws.forEach((w, i) =>
      expect(w).toBeGreaterThanOrEqual(skewed[i]!.min - 0.01)
    );
    expect(sum(ws)).toBeCloseTo(760);
    // Name and Owner keep their shares' proportion to each other.
    expect(ws[0]! / ws[3]!).toBeCloseTo(0.265 / 0.195);
  });

  it('narrower than the minimums, every column is at its minimum (the table scrolls)', () => {
    expect(fitColumns(400, 40, recipe)).toEqual([176, 112, 96, 128, 112]);
  });

  it('fills the room when the shares add up to more or less than it', () => {
    const over = fitColumns(1000, 0, [
      { pct: 0.6, min: 50 },
      { pct: 0.6, min: 50 },
    ]);
    expect(over).toEqual([500, 500]);
    const under = fitColumns(1000, 0, [
      { pct: 0.2, min: 50 },
      { pct: 0.3, min: 50 },
    ]);
    expect(under[0]).toBeCloseTo(400);
    expect(under[1]).toBeCloseTo(600);
  });

  it('keeps a length as the column own width, never under its minimum', () => {
    const ws = fitColumns(1000, 0, [
      { px: 80, min: 120 },
      { px: 200, min: 100 },
      { min: 100 },
    ]);
    expect(ws).toEqual([120, 200, 680]);
  });
});
