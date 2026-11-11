/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { closeOrigin } from '../components/ContextualBar';

// A 600 × 48 bar at (100, 200), in the flow (not a toolbar row's place).
const bar = {
  offsetWidth: 600,
  offsetHeight: 48,
  getBoundingClientRect: () => ({
    left: 100,
    top: 200,
    width: 600,
    height: 48,
    right: 700,
    bottom: 248,
  }),
  parentElement: { classList: { contains: () => false } },
} as unknown as HTMLElement;

describe('the contextual bar folds back to the edge it grew from', () => {
  it('after a snap in: the origin the snap kept, nothing passed', () => {
    expect(closeOrigin(bar, { x: 24, y: 48 }, 0.5)).toBeUndefined();
  });

  it('shown open from the start: its top edge, so only the bottom edge travels', () => {
    expect(closeOrigin(bar, null, 0.5)).toEqual({ x: 300, y: 0 });
  });
});
