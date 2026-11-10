/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  LOADER_BOX,
  LOADER_EDGE,
  loaderDrawing,
} from '@carbon-labs/react-feedback';
import {
  PROGRESS_RING_MOTION,
  progressRingLine,
} from '../components/ProgressRing';

describe('the ring’s line grows with its value', () => {
  it('is its base width to 15%, twice it from 85%, linear between', () => {
    expect(PROGRESS_RING_MOTION).toEqual({
      growFrom: 0.15,
      growTo: 0.85,
      grow: 1,
    });
    expect(progressRingLine(2, 0)).toBe(2);
    expect(progressRingLine(2, 0.15)).toBe(2);
    expect(progressRingLine(2, 0.5)).toBeCloseTo(3, 6);
    expect(progressRingLine(2, 0.85)).toBeCloseTo(4, 6);
    expect(progressRingLine(2, 1)).toBe(4);
  });

  it('at 16px: 1px at 15%, 1.5px at 50%, 2px at 85%, the outer edge at 7px throughout', () => {
    const base = loaderDrawing(16, undefined, { gapStyle: 'break' }).line;
    for (const [share, px] of [
      [0.15, 1],
      [0.5, 1.5],
      [0.85, 2],
    ] as const) {
      const line = progressRingLine(base, share);
      expect((line * 16) / LOADER_BOX).toBeCloseTo(px, 6);
      // Inset: the centreline moves in by half the line, so the edge stays.
      const r = LOADER_EDGE - line / 2;
      expect(((r + line / 2) * 16) / LOADER_BOX).toBe(7);
    }
  });
});
