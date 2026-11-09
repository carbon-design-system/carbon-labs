/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { SNAP, axialPlan } from '@carbon-labs/v12-motion';
import { SURFACE_RULE_OVER_PX, floatingOrSurface } from '../components/by-size';

/** A stand-in for a laid-out surface of `w` × `h` px. */
const box = (w: number, h: number) =>
  ({
    offsetWidth: w,
    offsetHeight: h,
    hidden: false,
  }) as unknown as HTMLElement;

describe('timing by size', () => {
  it('up to the line: the floating profile, as given', () => {
    const p = SNAP.floating;
    expect(floatingOrSurface(box(SURFACE_RULE_OVER_PX, 200), p)).toBe(p);
    expect(floatingOrSurface(null, p)).toBe(p);
  });

  it("over the line: the surface rule's timing on the floating shape", () => {
    const p = floatingOrSurface(box(480, 430), SNAP.floating);
    expect(p.timing).toBe('axial');
    expect(p.axial ?? 'default').toBe('default');
    expect(p.in).toBe(SNAP.surface.in);
    expect(p.ease).toBe(SNAP.surface.ease);
    // The shape stays: start scales, exit, content axis; the content's own clocks follow the new ones.
    expect([p.fromX, p.fromY, p.toOut, p.contentAxis]).toEqual([
      SNAP.floating.fromX,
      SNAP.floating.fromY,
      SNAP.floating.toOut,
      SNAP.floating.contentAxis,
    ]);
    expect(p.contentOut).toBeUndefined();
  });

  it('a 480px-wide floating panel: 220ms in, 160ms out (the floating rule: 120ms)', () => {
    const s = { w: 480, h: 430, fromX: 0.25, fromY: 0.75 };
    expect(axialPlan(s).total).toEqual({
      in: 'moderate-02',
      out: 'moderate-01',
    });
  });
});
