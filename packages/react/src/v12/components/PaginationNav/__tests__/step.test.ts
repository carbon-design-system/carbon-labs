/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { reachPx, stepTarget } from '../components/step';

describe('stepTarget', () => {
  it('steps one page on or back', () => {
    expect(stepTarget(3, 1, 10, false)).toBe(4);
    expect(stepTarget(3, -1, 10, false)).toBe(2);
  });

  it('has no page past the ends, unless it loops', () => {
    expect(stepTarget(9, 1, 10, false)).toBe(-1);
    expect(stepTarget(0, -1, 10, false)).toBe(-1);
    expect(stepTarget(9, 1, 10, true)).toBe(0);
    expect(stepTarget(0, -1, 10, true)).toBe(9);
    expect(stepTarget(0, 1, 0, true)).toBe(-1);
  });
});

describe('reachPx', () => {
  // Page centres 48px apart, as the lg row draws them.
  const centres = [24, 72, 120, 168];

  it("reaches as a press on the page does: by the pitch when 'auto'", () => {
    expect(reachPx('auto', centres, 1)).toBe(3);
    expect(reachPx('auto', [16, 40, 64], 2)).toBe(2);
    expect(reachPx('auto', [0, 80], 1)).toBe(4);
  });

  it('keeps a reach given in px', () => {
    expect(reachPx(6, centres, 2)).toBe(6);
  });
});
