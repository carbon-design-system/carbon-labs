/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Microphone as CMicrophone } from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { Shapes } from '../../utils/frameIcon';
import { MicrophoneListeningToggle as T } from '../../icons/toggle/micListening';
import { cover, coverCarbon, delta, flatten, grid, runs } from './markRaster';

/**
 * MicrophoneListeningToggle (toggle/micListening.ts), from its geometry:
 * off rests on Carbon's microphone at every size; the pills are 2px
 * outlines wherever they are outlined (at rest, at any level, through the
 * loop); nothing leaves the 36×36 box; the `level` prop never reaches the
 * svg; with animation off each state draws its still. The engine side (the
 * swap's order, the level followed, reduced motion) is the core's
 * test/micListening.test.ts.
 */

const geo = (
  f: { h?: number; p: number; l?: number; w?: number; v?: number },
  size?: number
): Shapes => T.geo({ h: 0, e: 0, ...f }, size);
const SIZES = [16, 20, 24, 32];
const STEPS = Array.from({ length: 49 }, (_, i) => i / 48);
const GATE = 0.005;
const pts = (d: unknown) => flatten(String(d ?? '')).flatMap((q) => q.pts);

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MicrophoneListeningToggle', () => {
  it("rests on Carbon's microphone at every size", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(geo({ p: 0 }, size)), coverCarbon(CMicrophone, size)),
        `off @${size}`
      ).toBeLessThan(GATE);
    }
  });

  it('draws three pills, each a 2px outline, at rest, at any level and through the loop', () => {
    for (const v of [undefined, 0, 0.5, 1]) {
      for (const l of [0, 0.3, 0.7]) {
        const pills = geo({ p: 1, l, w: 1, v }).pills;
        // Across the middle: each pill's two sides, 2px each, a 2px hole between.
        const across = runs(pills, [2, 16], [30, 16]);
        expect(across, `v${v} l${l}`).toHaveLength(6);
        across.forEach((r) => expect(r).toBeCloseTo(2, 1));
        // Down the center pill: its top and bottom, 2px each.
        const down = runs(pills, [16, 1], [16, 31]);
        expect(down, `v${v} l${l}`).toHaveLength(2);
        down.forEach((r) => expect(r).toBeCloseTo(2, 1));
      }
    }
  });

  it('grows with the level: the center pill 12 tall at rest, 24 at full level', () => {
    const tall = (v: number) => {
      const ys = pts(geo({ p: 1, l: 0.25, w: 1, v }).pills.d)
        .filter(([x]) => x > 13 && x < 19)
        .map(([, y]) => y);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(tall(0)).toBeCloseTo(12, 1);
    expect(tall(1)).toBeGreaterThan(22);
    expect(tall(1)).toBeLessThanOrEqual(24 + 1e-3);
    expect(tall(0.5)).toBeGreaterThan(tall(0));
    expect(tall(0.5)).toBeLessThan(tall(1));
  });

  it('stays inside the 36×36 box at every sampled frame (the change, the loop, hover)', () => {
    for (const size of [16, 32]) {
      for (const h of [0, 1]) {
        for (const p of STEPS) {
          for (const l of [0, 0.25, 0.5, 0.75]) {
            for (const v of [undefined, 1]) {
              for (const [x, y] of Object.values(
                geo({ h, p, l, w: 1, v }, size)
              ).flatMap((s) => pts(s.d))) {
                expect(Math.min(x, y), `h${h} p${p}`).toBeGreaterThanOrEqual(
                  -2 - 1e-3
                );
                expect(Math.max(x, y), `h${h} p${p}`).toBeLessThanOrEqual(
                  34 + 1e-3
                );
              }
            }
          }
        }
      }
    }
  });

  it('keeps `level` off the svg', () => {
    const { container } = render(<T size={32} toggled level={0.5} />);
    expect(container.querySelector('svg')!.hasAttribute('level')).toBe(false);
  });

  it('draws each state still with animation off: the microphone, and the pills at rest', () => {
    const still = (state: 'off' | 'listening') =>
      render(
        <MotionIconProvider animated={false}>
          <T size={32} initial={state} level={1} />
        </MotionIconProvider>
      ).container.querySelector('svg')!;
    const mic = render(<CMicrophone size={32} />).container.querySelector(
      'svg'
    )!;
    expect(still('off').innerHTML).toBe(mic.innerHTML);
    const pills = still('listening');
    expect(pills.innerHTML).toContain(String(geo({ p: 1 }).pills.d));
  });
});
