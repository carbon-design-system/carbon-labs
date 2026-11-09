/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { createRef } from 'react';
import {
  Earth,
  EarthFilled,
  EARTH_TURN,
} from '../../icons/toggle/stateFillToggles';
import {
  EarthSpec,
  EarthFilledSpec,
} from '@carbon-labs/motion-icons-core/icons/toggle/stateFillToggles';
import type { MotionIconHandle } from '../../types';

/**
 * Earth's action (the core's spec, "Earth's action"; its geometry is tested
 * in the core's test/earth.test.ts): Earth and Earth filled carry the full
 * turn (1000ms, no loop), and `trigger()` turns the globe and lands on the
 * rest drawing.
 */
afterEach(() => vi.useRealTimers());

describe.each([
  ['Earth', Earth, EarthSpec],
  ['EarthFilled', EarthFilled, EarthFilledSpec],
] as const)('%s', (_, Icon, spec) => {
  it('has its action: the full turn, 1000ms, no cycle, no loop', () => {
    const a = (
      Icon as unknown as {
        action?: { duration: number; cycle?: number; loops?: false };
      }
    ).action;
    expect(a?.duration).toBe(EARTH_TURN);
    expect(a?.loops).toBe(false);
    expect(a?.cycle).toBeUndefined();
  });

  it('trigger() turns the globe and lands on the rest drawing', async () => {
    vi.useFakeTimers();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Icon size={32} ref={ref} />);
    const d = () => container.querySelector('path')!.getAttribute('d');
    const rest = d();
    expect(rest).toBe(String(spec.geo({ h: 0 }).earth.d));
    act(() => void ref.current!.trigger());
    const seen = new Set<string | null>();
    for (let t = 0; t < 1100; t += 1000 / 60) {
      act(() => vi.advanceTimersByTime(1000 / 60));
      seen.add(d());
    }
    expect(seen.size).toBeGreaterThan(20);
    expect(d()).toBe(rest);
  });
});
