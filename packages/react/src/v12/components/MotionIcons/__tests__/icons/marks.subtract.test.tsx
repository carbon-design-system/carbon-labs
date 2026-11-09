/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { suite, STEPS, across, casesOf, type MarkCheck } from './markSuite';
import { cover, delta, grid, runs } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as SUBTRACT from '../../icons/marks/subtract';
import { CLOCK_GROW } from '@carbon-labs/motion-icons-core/icons/marks/bases';
import { plusReach } from '@carbon-labs/motion-icons-core/utils/statusMark';

/** The subtract family (icons/marks/subtract.ts): the minus's ends reach 2px, as the add family's plus. The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    SUBTRACT.MINUS,
    (spec, s, h) => {
      const place = spec.place;
      const l = place.arm + (place.reach ?? plusReach(place.arm)) * h;
      const [cx, cy] = place.c as Pt;
      for (const t of [l - 0.25, 0.3, -l / 2])
        across(s.mark, [cx + t, cy - 3], [cx + t, cy + 3], 2, `height h=${h}`);
      across(
        s.mark,
        [cx - l - 1, cy + 0.5],
        [cx + l + 1, cy + 0.5],
        2 * l,
        `span h=${h}`
      );
    },
  ],
]);

describe('subtract', () => {
  suite(
    casesOf(SUBTRACT, {
      DocumentSubtract: SUBTRACT.DOCUMENT_SUBTRACT,
      AlarmSubtract: SUBTRACT.ALARM_SUBTRACT,
      PillsSubtract: SUBTRACT.PILLS_SUBTRACT,
    }),
    CHECKS
  );
  it("Alarm subtract: the clock's ring grows 1px in radius at a constant 2px, the bells riding out with it; it meets Carbon's drawing as the hover starts", () => {
    const at = (h: number) => SUBTRACT.AlarmSubtract.parts(h).shapes.base;
    for (const h of STEPS) {
      const g = CLOCK_GROW * h;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [-1, 0],
      ]) {
        const r = runs(
          at(h),
          [16 + dx * (9 + g - 1), 17 + dy * (9 + g - 1)],
          [16 + dx * (11 + g + 1), 17 + dy * (11 + g + 1)]
        );
        expect(r.length, `ring h=${h}`).toBe(1);
        expect(Math.abs(r[0] - 2), `ring h=${h}: ${r[0]}`).toBeLessThan(0.03);
      }
    }
    grid(32);
    expect(
      delta(
        cover({ a: at(0) }),
        cover({ b: { d: SUBTRACT.ALARM_SUBTRACT.base.at!(1e-9) } })
      )
    ).toBe(0);
  });
});
