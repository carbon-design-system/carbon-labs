/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Bee as CBee } from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import { Bee, BEE_ACTION_MS, beeShapes } from '../../icons/assorted/brand';

/**
 * Bee (assorted/brand.ts, the core's spec; its geometry, hover and action are
 * tested in the core's test/bee.test.ts): the React icon draws Carbon's art
 * with motion off, rests on Carbon's paths when animated, and carries its
 * action (920ms, no loop).
 */
describe('Bee', () => {
  it('draws Carbon’s own art with motion off', () => {
    for (const size of [16, 20, 24, 32] as const) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <Bee size={size} />
        </MotionIconProvider>
      ).container.innerHTML;
      const theirs = render(<CBee size={size} />).container.innerHTML;
      expect(ours).toBe(theirs);
    }
  });

  it("rests on Carbon's paths when animated", () => {
    const { container } = render(<Bee size={32} />);
    const ds = [...container.querySelectorAll('path')].map((p) =>
      p.getAttribute('d')
    );
    const rest = beeShapes({
      g: 0,
      openLeft: 0,
      openRight: 0,
      sway: 0,
      bend: 0,
      stripe1: 0,
      stripe2: 0,
    });
    for (const k of ['body', 'wingRight', 'wingLeft', 'eyeLeft', 'eyeRight'])
      expect(ds).toContain(rest[k].d);
  });

  it('has its action: 920ms, no cycle, no loop', () => {
    const act = (
      Bee as unknown as {
        action?: { duration: number; cycle?: number; loops?: false };
      }
    ).action;
    expect(act?.loops).toBe(false);
    expect(act?.duration).toBe(BEE_ACTION_MS / 1000);
    expect(act?.cycle).toBeUndefined();
  });
});
