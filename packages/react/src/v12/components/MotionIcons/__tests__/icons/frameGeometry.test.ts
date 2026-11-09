/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import * as Package from '../../index';
import type { Shapes } from '../../utils/frameIcon';

/**
 * Every frame-engine icon (anything exported with a `geo`): its geometry must
 * be paintable at every frame. `paint()` only updates shapes rendered from
 * the resting frame, so a key that appears mid-hover never shows, and a NaN
 * in a `d` string makes the browser drop the whole path for that frame.
 */
type Geo = (f: Record<string, number>, size?: number) => Shapes;
const frameIcons = (
  Object.entries(Package) as [string, { geo?: unknown }][]
).filter(([, v]) => typeof v.geo === 'function') as [string, { geo: Geo }][];

const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const SIZES = [16, 20, 24, 32];
const BAD_NUMBER = /NaN|Infinity|undefined/;

function frames(isToggle: boolean): Record<string, number>[] {
  if (!isToggle) {
    return STEPS.flatMap((h) => [
      { h, entering: 1 },
      { h, entering: 0 },
    ]);
  }
  return STEPS.flatMap((h) =>
    STEPS.flatMap((p) => [
      { h, p, e: 0 },
      { h, p: 1, e: p },
    ])
  );
}

describe('frame icon geometry', () => {
  it('finds the frame icons', () => {
    expect(frameIcons.length).toBeGreaterThan(200);
  });

  describe.each(frameIcons)('%s', (name, Icon) => {
    const isToggle = name.endsWith('Toggle');

    it('keeps the same shape keys at every frame and size', () => {
      for (const size of SIZES) {
        const rest = Object.keys(
          Icon.geo(isToggle ? { h: 0, p: 0, e: 0 } : { h: 0 }, size)
        ).sort();
        for (const f of frames(isToggle)) {
          expect(
            Object.keys(Icon.geo(f, size)).sort(),
            `${JSON.stringify(f)} @${size}`
          ).toEqual(rest);
        }
      }
    });

    it('never paints NaN or Infinity', () => {
      for (const size of SIZES) {
        for (const f of frames(isToggle)) {
          const shapes: Shapes = Icon.geo(f, size);
          for (const [k, attrs] of Object.entries(shapes)) {
            for (const [a, v] of Object.entries(attrs)) {
              expect(
                BAD_NUMBER.test(String(v)),
                `${k}.${a} at ${JSON.stringify(f)} @${size}: ${v}`
              ).toBe(false);
            }
          }
        }
      }
    });
  });
});
