/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  SNAP_SLIVER_PX,
  snapEaseBezier,
  snapFades,
  snapSliverWindow,
} from '@carbon-labs/v12-motion';
import { barProfile } from '../components/ContextualBar';

// The bar's curve (standard-productive), solved as the snap does, to read its height back.
const heightAt = (h0: number, t: number) => {
  const [x1, y1, x2, y2] = snapEaseBezier('standard-productive');
  const at = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (at(x1, x2, mid) < t) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return h0 * (1 - at(y1, y2, (lo + hi) / 2));
};

describe('the contextual bar: the sliver guard fades only its last 4px', () => {
  it('is on the guard in every placement, with no presence fade of its own', () => {
    const p = barProfile(null, undefined, 0);
    expect(p.sliver).toBe(true);
    expect(p.fadeIn).toBeUndefined();
    expect(p.fadeOut).toBeUndefined();
    expect(p.exitFade).toBeUndefined();
  });

  it('reports no timed fade: the guard, by size (no box here to measure)', () => {
    expect(snapFades(barProfile(null, undefined, 0))).toEqual({
      in: null,
      out: null,
      sliver: null,
    });
  });

  it('folding a 48px bar: opaque until its height is 4px, then its opacity is height / 4px', () => {
    const ms = 110;
    const w = snapSliverWindow(
      [{ size: 48, from: 1, to: 0, ease: 'standard-productive', ms }],
      ms,
      'out'
    )!;
    expect(heightAt(48, w.start / ms)).toBeCloseTo(SNAP_SLIVER_PX, 1);
    expect(w.end).toBeCloseTo(ms, 3);
    for (const k of w.keys) {
      const h = heightAt(48, k.at / ms);
      expect(
        k.opacity,
        `at ${k.at.toFixed(1)}ms, ${h.toFixed(2)}px`
      ).toBeCloseTo(Math.min(1, h / SNAP_SLIVER_PX), 2);
    }
  });
});
