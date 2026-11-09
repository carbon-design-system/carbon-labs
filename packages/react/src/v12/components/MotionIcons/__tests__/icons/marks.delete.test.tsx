/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  suite,
  STEPS,
  across,
  casesOf,
  pointsOf,
  type MarkCheck,
} from './markSuite';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as DELETE from '../../icons/marks/delete';
import { OFF_SHRINK } from '@carbon-labs/motion-icons-core/off';
import { CROSS, CROSS_REACH, type CrossPlace } from '../../icons/marks/remove';

/** The delete badges (icons/marks/delete.ts): Carbon's close x, each arm end reaching 2px along its arm (the remove family's x). The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    CROSS,
    (spec, s, h) => {
      const p = spec.place as CrossPlace;
      const l = p.arm + (p.reach ?? CROSS_REACH) * h;
      const [cx, cy] = [
        p.c[0] + (p.drift?.[0] ?? 0) * h,
        p.c[1] + (p.drift?.[1] ?? 0) * h,
      ];
      const S = Math.SQRT1_2;
      for (const [ux, uy] of [
        [S, -S],
        [-S, -S],
        [-S, S],
        [S, S],
      ]) {
        for (const t of [l - 0.25, l / 2 + 0.5]) {
          const [mx, my] = [cx + ux * t, cy + uy * t];
          across(
            s.mark,
            [mx - uy * 3, my + ux * 3],
            [mx + uy * 3, my - ux * 3],
            2,
            `arm (${ux}, ${uy}) h=${h}`
          );
        }
      }
      across(
        s.mark,
        [cx - S * (l + 1) + 0.1, cy - S * (l + 1) - 0.1],
        [cx + S * (l + 1) + 0.1, cy + S * (l + 1) - 0.1],
        2 * l,
        `span h=${h}`
      );
    },
  ],
]);

describe('delete', () => {
  suite(
    casesOf(DELETE, {
      ColumnDelete: DELETE.COLUMN_DELETE,
      RowDelete: DELETE.ROW_DELETE,
    }),
    CHECKS
  );
  it('the x grows about its own centre, which holds (no drift)', () => {
    for (const icon of [DELETE.ColumnDelete, DELETE.RowDelete]) {
      for (const h of STEPS) {
        const xs = icon
          .parts(h)
          .ink.flat()
          .map(([x]: Pt) => x);
        const ys = icon
          .parts(h)
          .ink.flat()
          .map(([, y]: Pt) => y);
        expect((Math.min(...xs) + Math.max(...xs)) / 2, `h=${h}`).toBeCloseTo(
          25,
          6
        );
        expect((Math.min(...ys) + Math.max(...ys)) / 2, `h=${h}`).toBeCloseTo(
          7,
          6
        );
      }
    }
  });
  it("the base takes the Off icons' hover: 90% about its own centre (14, 18), at constant weight", () => {
    const s = 1 - OFF_SHRINK;
    const at = (v: number, c: number) => c + (v - c) * s;
    // Column delete's left column: its centreline x 3–11, y 7–29 scaled about (14, 18); walls 2px.
    const pts = pointsOf(DELETE.ColumnDelete.parts(1).base).filter(
      ([x]) => x < 14
    );
    expect(Math.min(...pts.map(([x]) => x))).toBeCloseTo(at(3, 14) - 1, 6);
    expect(Math.max(...pts.map(([x]) => x))).toBeCloseTo(at(11, 14) + 1, 6);
    expect(Math.min(...pts.map(([, y]) => y))).toBeCloseTo(at(7, 18) - 1, 6);
    // Row delete's lower row: centreline x 3–25, y 21–29.
    const row = pointsOf(DELETE.RowDelete.parts(1).base).filter(
      ([, y]) => y > 18
    );
    expect(Math.max(...row.map(([x]) => x))).toBeCloseTo(at(25, 14) + 1, 6);
    expect(Math.max(...row.map(([, y]) => y))).toBeCloseTo(at(29, 18) + 1, 6);
  });
  it('the x reaches 0.4px, so the 2px to the wall beside it holds with no cut at any frame', () => {
    expect(DELETE.DELETE_REACH).toBe(0.4);
    for (const icon of [DELETE.ColumnDelete, DELETE.RowDelete]) {
      for (const h of STEPS) {
        expect(Math.max(...icon.parts(h).drawn), `h=${h}`).toBe(0);
        for (const g of icon.parts(h).gaps)
          expect(g, `h=${h}`).toBeGreaterThan(2 - 1e-3);
      }
    }
  });
});
