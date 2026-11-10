/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  SELECTION_ARRIVAL,
  snapClocks,
  snapFadeFor,
} from '@carbon-labs/v12-motion';
import { shrinkSnap } from '../components/JumpTo';

const box = (w: number, h: number) =>
  ({ offsetWidth: w, offsetHeight: h }) as HTMLElement;

describe('shrinkSnap', () => {
  it('starts and ends 4px under the measured width and height', () => {
    for (const [w, h] of [
      [140, 32],
      [96, 24],
      [220, 48],
    ] as const) {
      const p = shrinkSnap(box(w, h));
      expect(w * p.fromX!).toBeCloseTo(w - 4, 6);
      expect(h * p.fromY!).toBeCloseTo(h - 4, 6);
      expect(w * p.toOutX!).toBeCloseTo(w - 4, 6);
      expect(h * p.toOutY!).toBeCloseTo(h - 4, 6);
    }
  });

  it("plays the kit arrival's clocks and curve, the content still, reduced as a fade", () => {
    const p = shrinkSnap(box(140, 32));
    expect(p.in).toBe(SELECTION_ARRIVAL.in);
    expect(p.out).toBe(SELECTION_ARRIVAL.out);
    expect(p.ease).toBe(SELECTION_ARRIVAL.ease);
    expect(p.exitEase).toBe('exit-productive');
    expect(p.exitMode).toBe('scale');
    expect(p.contentOffset).toBe(0);
    expect(p.blinkOff).toBe(false);
    expect(p.timing).toBe('own');
    // The presence fade by its clock: 40ms both ways.
    expect(snapFadeFor(snapClocks(p, 'in').ms)).toBe('fast-00');
    expect(snapFadeFor(snapClocks(p, 'out').ms)).toBe('fast-00');
  });

  it('holds at rest size with nothing to measure', () => {
    const p = shrinkSnap(null);
    expect(p.fromX).toBe(1);
    expect(p.fromY).toBe(1);
  });
});
