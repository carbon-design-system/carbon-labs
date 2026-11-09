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
  casesOf,
  near,
  pointsOf,
  type MarkCheck,
} from './markSuite';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  PIN_LIFT,
  STAR_GROW,
} from '@carbon-labs/motion-icons-core/icons/toggle/stateFillToggles';
import * as STAR from '../../icons/marks/star';

/** The star badges (icons/marks/star.ts): the star grows 12.5% about its centre (Star's hover). The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    STAR.STAR_MARK,
    (spec, s, h) => {
      const p = spec.place as STAR.StarPlace;
      const k = 1 + STAR_GROW * h;
      const [dx, dy] = [(p.drift?.[0] ?? 0) * h, (p.drift?.[1] ?? 0) * h];
      near(
        pointsOf(String(s.mark.d)),
        p.pts.map(
          ([x, y]): Pt => [
            p.c[0] + (x - p.c[0]) * k + dx,
            p.c[1] + (y - p.c[1]) * k + dy,
          ]
        ),
        `star h=${h}`
      );
    },
  ],
]);

describe('star', () => {
  suite(
    casesOf(STAR, {
      TaskStar: STAR.TASK_STAR,
      LocationStar: STAR.LOCATION_STAR,
    }),
    CHECKS
  );
  it("Location star: the star rides up with the pin's head (2px), as Location's eye does", () => {
    for (const h of STEPS) {
      const top = Math.min(
        ...STAR.LocationStar.parts(h).ink[0].map(([, y]) => y)
      );
      expect(
        Math.abs(top - (13.4 - 6.4 * (1 + STAR_GROW * h) - PIN_LIFT * h)),
        `h=${h}`
      ).toBeLessThan(1e-6);
    }
  });
});
