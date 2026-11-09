/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import ContentNavigatorSyncError32 from '@carbon/icons/es/content-navigator-sync--error/32.js';
import {
  suite,
  STEPS,
  casesOf,
  NOT_IN_REACT,
  fromDescriptor,
  type Descriptor,
  type MarkCheck,
} from './markSuite';
import { runs } from './markRaster';
import * as ERROR from '../../icons/marks/error';

/** The error badges (icons/marks/error.ts): the ring (or disc) grows 1px in radius at 2px, its 2px slash with it. The suite: markSuite.tsx. */

NOT_IN_REACT.ContentNavigatorSyncError = fromDescriptor(
  ContentNavigatorSyncError32 as unknown as Descriptor
);

const CHECKS = new Map<unknown, MarkCheck>([
  [
    ERROR.ERROR,
    (spec, s, h) => {
      const p = spec.place as ERROR.ErrorPlace;
      const [cx, cy] = [
        p.c[0] + (p.drift?.[0] ?? 0) * h,
        p.c[1] + (p.drift?.[1] ?? 0) * h,
      ];
      const R = p.r + ERROR.ERROR_GROW * h;
      // Across the middle: the slash crosses it 2√2 wide.
      const r = runs(s.mark, [cx - R - 1, cy + 0.01], [cx + R + 1, cy + 0.01]);
      if (p.filled) {
        expect(r.length, `halves h=${h}`).toBe(2);
        r.forEach((w) =>
          expect(
            Math.abs(w - (R - Math.SQRT2)),
            `half h=${h}: ${r}`
          ).toBeLessThan(0.03)
        );
      } else {
        expect(r.length, `ring and slash h=${h}`).toBe(3);
        expect(Math.abs(r[0] - 2), `ring h=${h}: ${r}`).toBeLessThan(0.03);
        expect(
          Math.abs(r[1] - 2 * Math.SQRT2),
          `slash h=${h}: ${r}`
        ).toBeLessThan(0.03);
        expect(Math.abs(r[2] - 2), `ring h=${h}: ${r}`).toBeLessThan(0.03);
      }
    },
  ],
]);

describe('error', () => {
  suite(
    casesOf(ERROR, {
      BatteryError: ERROR.BATTERY_ERROR,
      ShoppingCartError: ERROR.SHOPPING_CART_ERROR,
      ContentNavigatorSyncError: ERROR.CONTENT_NAVIGATOR_SYNC_ERROR,
    }),
    CHECKS
  );
  it("Shopping cart error: the ring keeps 2px above the basket's floor as the floor rises with the cart's hover", () => {
    for (const h of STEPS) {
      const p = ERROR.ShoppingCartError.parts(h);
      const bottom = Math.max(...p.ink[0].map(([, y]) => y));
      expect(bottom, `h=${h}`).toBeLessThan(16 - 0.54 * h - 2 + 0.05);
    }
  });
  it('Content navigator sync error: the disc is a disc less its slash at every frame (no ring)', () => {
    for (const h of STEPS)
      expect(
        Object.keys(ERROR.ContentNavigatorSyncError.parts(h).shapes),
        `h=${h}`
      ).not.toContain('ring');
  });
});
