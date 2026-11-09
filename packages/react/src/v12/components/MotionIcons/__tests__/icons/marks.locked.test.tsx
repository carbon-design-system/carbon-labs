/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { suite, casesOf, type MarkCheck } from './markSuite';
import { runs } from './markRaster';
import * as LOCKED from '../../icons/marks/locked';

/** The locked badge (icons/marks/locked.ts): the body grows 1px a side at 2px, the shackle's arch drops 1px (Locked's press). The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    LOCKED.LOCK,
    (spec, s, h) => {
      const p = spec.place as LOCKED.LockPlace;
      const g = LOCKED.LOCK_GROW * h;
      const [x0, y0, x1, y1] = [
        p.body[0] - g,
        p.body[1] - g,
        p.body[2] + g,
        p.body[3] + g,
      ];
      // Across the body: its two 2px walls, x0 to x1.
      const ym = (y0 + y1) / 2;
      const r = runs(s.mark, [x0 - 1, ym], [x1 + 1, ym]);
      expect(r.length, `body h=${h}`).toBe(2);
      r.forEach((w) =>
        expect(Math.abs(w - 2), `body wall h=${h}: ${r}`).toBeLessThan(0.02)
      );
      // Down the body's middle: the shackle's arch (2px, its top 4 above its centre), then the body's top and bottom walls.
      const ay = p.arch[1] + LOCKED.LOCK_DROP * h;
      const v = runs(
        s.mark,
        [p.arch[0] + 0.01, ay - 6],
        [p.arch[0] + 0.01, y1 + 1]
      );
      expect(v.length, `arch and body h=${h}`).toBe(3);
      v.forEach((w) =>
        expect(Math.abs(w - 2), `wall h=${h}: ${v}`).toBeLessThan(0.02)
      );
      // Across the shackle's legs: two 2px legs.
      const yl = (ay + y0) / 2;
      const legs = runs(s.mark, [p.arch[0] - 6, yl], [p.arch[0] + 6, yl]);
      expect(legs.length, `legs h=${h}`).toBe(2);
      legs.forEach((w) =>
        expect(Math.abs(w - 2), `leg h=${h}: ${legs}`).toBeLessThan(0.02)
      );
    },
  ],
]);

describe('locked', () => {
  suite(casesOf(LOCKED, { RuleLocked: LOCKED.RULE_LOCKED }), CHECKS);
  it("Rule locked: the rule's bars reach 1px at each end (Rule's hover)", () => {
    expect(String(LOCKED.RuleLocked.parts(1).shapes.bars.d)).toContain(
      'M7 16H15'
    );
  });
});
