/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { suite, STEPS, casesOf, pointsOf, type MarkCheck } from './markSuite';
import { runs } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as TIME from '../../icons/marks/time';

/** The time badges (icons/marks/time.ts): the ring grows 1px at 2px, the minute hand turns 90° and the hour hand 7.5° (Time's hover). The suite: markSuite.tsx. */

// Down and to the left of the centre, where no hand ever is (the minute hand turns from 12 to 3, the hour hand stays near half past 4).
const SW: Pt = [-Math.SQRT1_2, Math.SQRT1_2];

const CHECKS = new Map<unknown, MarkCheck>([
  [
    TIME.CLOCK_MARK,
    (spec, s, h) => {
      const p = spec.place as TIME.ClockPlace;
      const [cx, cy] = [
        p.c[0] + (p.drift?.[0] ?? 0) * h,
        p.c[1] + (p.drift?.[1] ?? 0) * h,
      ];
      const r = p.r + (p.still ? 0 : TIME.CLOCK_RING_GROW * h);
      const along = (shape: typeof s.mark, from: number, to: number) =>
        runs(
          shape,
          [cx + SW[0] * from, cy + SW[1] * from],
          [cx + SW[0] * to, cy + SW[1] * to]
        );
      if (p.filled) {
        // The disc reaches r, the hands' knockout stops short of here.
        const w = along(s.mark, 2.5, r + 2);
        expect(w.length, `disc h=${h}`).toBe(1);
        expect(Math.abs(w[0] - (r - 2.5)), `disc h=${h}: ${w}`).toBeLessThan(
          0.03
        );
      } else {
        const w = along(s.ring, 0, r + 3);
        expect(w.length, `ring h=${h}`).toBe(1);
        expect(Math.abs(w[0] - 2), `ring h=${h}: ${w}`).toBeLessThan(0.02);
      }
      // The minute hand: 2px (or its own width) across, at the angle it has turned to, half way out.
      const t = (TIME.MINUTE_TURN * h * Math.PI) / 180;
      const half = (p.minute * (p.handsGrow ? r / p.r : 1)) / 2 + 0.5;
      const m: Pt = [cx + half * Math.sin(t), cy - half * Math.cos(t)];
      const n: Pt = [Math.cos(t), Math.sin(t)];
      const across = runs(
        s.mark,
        [m[0] - n[0] * 1.4, m[1] - n[1] * 1.4],
        [m[0] + n[0] * 1.4, m[1] + n[1] * 1.4]
      );
      if (!p.filled) {
        expect(across.length, `minute hand h=${h}`).toBe(1);
        expect(
          Math.abs(across[0] - (p.w ?? 2)),
          `minute hand h=${h}: ${across}`
        ).toBeLessThan(0.03);
      } else {
        // Knocked out of the disc: the gap between the two runs is the hand.
        expect(across.length, `minute hand h=${h}`).toBe(2);
      }
    },
  ],
]);

describe('time', () => {
  suite(
    casesOf(TIME, {
      ArrayTime: TIME.ARRAY_TIME,
      DeliveryTime: TIME.DELIVERY_TIME,
      ServerTime: TIME.SERVER_TIME,
      TrainTime: TIME.TRAIN_TIME,
    }),
    CHECKS
  );
  it("Server time: the clock holds its size (its hands turn) and the server widens 1px a side, its light growing 1 → 1.5 (the servers' hover)", () => {
    for (const h of STEPS) {
      const bottom = Math.max(
        ...TIME.ServerTime.parts(h).ink[0].map(([, y]) => y)
      );
      expect(bottom, `h=${h}`).toBeLessThan(18.03);
    }
    const xs = pointsOf(TIME.ServerTime.parts(1).base).map(([x]) => x);
    expect(Math.min(...xs)).toBeCloseTo(1, 6);
    expect(Math.max(...xs)).toBeCloseTo(31, 6);
    expect(String(TIME.ServerTime.parts(1).shapes.light.d)).toContain('5.5 25');
  });
  it('Train time: the disc grows about its own centre (no drift), the hands with it', () => {
    const top = Math.min(...TIME.TrainTime.parts(1).ink[0].map(([, y]) => y));
    expect(top).toBeCloseTo(0, 1);
  });
  it('Array time: the corner brackets move 2px out on each axis', () => {
    const xs = pointsOf(TIME.ArrayTime.parts(1).base).map(([x]) => x);
    expect(Math.min(...xs)).toBeCloseTo(0, 6);
    expect(Math.max(...xs)).toBeCloseTo(32, 6);
  });
});
