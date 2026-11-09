/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  Microphone as CMicrophone,
  VoiceMode as CVoiceMode,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MicrophoneVoiceModeToggle as T } from '../../icons/toggle/micVoiceMode';
import { cover, coverCarbon, delta, flatten, grid, inside } from './markRaster';

/**
 * MicrophoneVoiceModeToggle (toggle/micVoiceMode.ts), from its geometry,
 * against its motion reference (24 frames, 10ms
 * a frame in the reference, spread over the change's moderate-02): both ends rest on Carbon's drawings at every size
 * (coverage Δ, as the parity story measures); the base trims in to a stub by
 * frame 8 and the holder from its top ends, all of the stand vanishing at
 * (16, 22) by frame 11; the capsule's top drops to a ring of radius 4 about
 * (16, 17) by frame 8 and shrinks to a dot about (16, 18) by frame 11; the
 * bars begin at frame 12 (centre), 14 and 16, each from 2px tall, sliding
 * out to its place as it grows, the side pairs bowed outward and flattening
 * as they land; the loop is seamless in its own time (`l`
 * and `l + 1` draw the same); every line stays 2px; nothing leaves the 36×36
 * box. The engine side (the loop running, held off screen, still under
 * reduced motion) is the core's test/micVoiceMode.test.ts.
 */

const geo = (
  f: { h?: number; p: number; l?: number; w?: number },
  size?: number
): Shapes => T.geo({ h: 0, e: 0, ...f }, size);
const SIZES = [16, 20, 24, 32];
const STEPS = Array.from({ length: 49 }, (_, i) => i / 48);
const GATE = 0.005;
/** The tightest gap between the pill and the stand: the reference's own (the stand rises toward the shrinking dot, frames 8–11), at least 1.15px at 32. */
const GAP = 1.15;
/** The reference's frame f as change progress (24 frames). */
const F = (f: number) => f / 24;
const CUT = F(12);
const pts = (d: unknown) => flatten(String(d ?? '')).flatMap((q) => q.pts);
const box = (d: unknown) => {
  const p = pts(d);
  const xs = p.map(([x]) => x);
  const ys = p.map(([, y]) => y);
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
};
const round = (b: ReturnType<typeof box>) =>
  [b.x0, b.x1, b.y0, b.y1].map((v) => +v.toFixed(2));
/** The bars at progress p, as [left, right, top, bottom] each. */
const barBoxes = (p: number) =>
  flatten(String(geo({ p }).bars.d)).map(({ pts: q }) =>
    round(box(`M${q.map(([x, y]) => `${x} ${y}`).join('L')}Z`))
  );

describe('MicrophoneVoiceModeToggle', () => {
  it("rests on Carbon's microphone and voice-mode at every size (voice-mode whatever l at weight 0)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(geo({ p: 0 }, size)), coverCarbon(CMicrophone, size)),
        `off @${size}`
      ).toBeLessThan(GATE);
      for (const l of [0, 0.3, 0.7])
        expect(
          delta(cover(geo({ p: 1, l }, size)), coverCarbon(CVoiceMode, size)),
          `listening l${l} @${size}`
        ).toBeLessThan(GATE);
    }
  });

  it('the stand: the base trims in to a 2px stub by frame 8, the holder from its top ends, all gone at (16, 22) by frame 11', () => {
    // Frame 8: the base is a 2px stub on the middle (x 15–17), still at y 29.
    const base = pts(geo({ p: F(8) }).stand.d).filter(([, y]) => y > 27.5);
    expect(Math.min(...base.map(([x]) => x))).toBeCloseTo(15, 2);
    expect(Math.max(...base.map(([x]) => x))).toBeCloseTo(17, 2);
    // The holder's top ends come down every frame (until frame 8, when what is left starts to rise).
    let top = -Infinity;
    for (const p of STEPS.filter((s) => s > 0 && s <= F(8))) {
      const t = Math.min(...pts(geo({ p }).stand.d).map(([, y]) => y));
      expect(t, `p${p}`).toBeGreaterThanOrEqual(top - 1e-6);
      top = t;
    }
    // Just before frame 11 what is left is round (16, 22); at frame 11 it is gone.
    for (const [x, y] of pts(geo({ p: F(10.9) }).stand.d))
      expect(Math.hypot(x - 16, y - 22.1), `(${x}, ${y})`).toBeLessThan(1.6);
    expect(geo({ p: F(11) }).stand.d).toBe('');
  });

  it('the pill: a ring of radius 4 about (16, 17) at frame 8, a dot of radius 1 about (16, 18) at frame 11, gone at frame 12', () => {
    expect(round(box(geo({ p: F(8) }).pill.d))).toEqual([11, 21, 12, 22]);
    expect(flatten(String(geo({ p: F(8) }).pill.d))).toHaveLength(2);
    expect(round(box(geo({ p: F(11) }).pill.d))).toEqual([14, 18, 16, 20]);
    expect(flatten(String(geo({ p: F(11) }).pill.d))).toHaveLength(1);
    expect(geo({ p: CUT }).pill.d).toBe('');
  });

  it('the bars: the centre from frame 12, the inner pair from 14 (2px either side), the outer from 16 (4px), each sliding out as it grows', () => {
    expect(barBoxes(F(12))).toEqual([[15, 17, 15, 17]]);
    // The side bars start bowed (a short arc where the reference has a square), 2px either side of the centre, then 4px.
    const starts = (p: number, idx: number[]) =>
      barBoxes(p)
        .filter((_, i) => idx.includes(i))
        .map(([x0, x1, y0, y1]) => [
          +((x0 + x1) / 2).toFixed(1),
          y1 - y0 < 4.5,
        ]);
    expect(starts(F(14), [0, 2])).toEqual([
      [14, true],
      [18, true],
    ]);
    expect(starts(F(16), [0, 4])).toEqual([
      [12, true],
      [20, true],
    ]);
    // Each bar lands at frame from + 8 on voice-mode.
    expect(barBoxes(1)).toEqual([
      [3, 5, 11, 21],
      [9, 11, 6, 26],
      [15, 17, 3, 29],
      [21, 23, 6, 26],
      [27, 29, 11, 21],
    ]);
    const mid = barBoxes(F(18)).map(([x0, x1, y0, y1]) => [
      (x0 + x1) / 2,
      y1 - y0,
    ]);
    expect(mid[2][1]).toBeGreaterThan(mid[1][1]);
    expect(mid[1][1]).toBeGreaterThan(mid[0][1]);
    expect(Math.abs(mid[0][0] + mid[4][0] - 32)).toBeLessThan(0.011); // (the drawing rounds to 0.01px)
  });

  it('keeps a gap between the pill and the stand while both show', () => {
    let min = Infinity;
    for (const p of STEPS.filter((s) => s < F(11))) {
      const pill = flatten(String(geo({ p }).pill.d));
      const pillPts = pill.flatMap((q) => q.pts);
      for (const [x, y] of pts(geo({ p }).stand.d)) {
        expect(inside(pill, [x, y] as Pt, true), `p${p} (${x}, ${y})`).toBe(
          false
        );
        min = Math.min(
          min,
          ...pillPts.map(([u, v]) => Math.hypot(u - x, v - y))
        );
      }
    }
    expect(min).toBeGreaterThan(GAP);
  });

  it('loops seamlessly: l and l + 1 draw the same, and the loop moves', () => {
    const seen = new Set<string>();
    for (const l of STEPS) {
      const a = JSON.stringify(geo({ p: 1, l, w: 1 }));
      expect(JSON.stringify(geo({ p: 1, l: l + 1, w: 1 }))).toBe(a);
      seen.add(a);
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  it('the side pairs come out bowed outward and land straight; the centre bar grows straight', () => {
    // How far a bar bows at p (its width past 2px), and which way: + away from the icon's centre (its middle row
    // further out than its ends).
    const bowOf = (p: number, i: number) => {
      const q = flatten(String(geo({ p }).bars.d))[i].pts;
      const xs = q.map(([x]) => x);
      const ys = q.map(([, y]) => y);
      const across = (y: number) => {
        const row = q
          .filter(([, qy]) => Math.abs(qy - y) < 0.5)
          .map(([x]) => x);
        return Math.abs((Math.min(...row) + Math.max(...row)) / 2 - 16);
      };
      const out = across(16) > across(Math.min(...ys) + 0.3) ? 1 : -1;
      return out * (Math.max(...xs) - Math.min(...xs) - 2);
    };
    // Frame 19: all five out; the pairs bow away from the centre, symmetrically; the centre bar is straight. (Not frame
    // 18: on the expressive curve, (0.8, 0, 0, 1), the outer pair has barely grown by then.)
    expect(flatten(String(geo({ p: F(19) }).bars.d))).toHaveLength(5);
    for (const i of [0, 1, 3, 4])
      expect(bowOf(F(19), i), `bar ${i}`).toBeGreaterThan(0.5);
    expect(bowOf(F(19), 0)).toBeCloseTo(bowOf(F(19), 4), 6);
    expect(bowOf(F(19), 2)).toBeCloseTo(0, 6);
    // Flat as each lands: the inner pair at frame 22, the outer at 24; and 2px wide from then on, through the loop.
    for (const [p, idx] of [
      [F(22), [1, 3]],
      [1, [0, 1, 2, 3, 4]],
    ] as const) {
      const q = flatten(String(geo({ p }).bars.d));
      for (const i of idx) {
        const xs = q[i].pts.map(([x]) => x);
        expect(
          Math.max(...xs) - Math.min(...xs),
          `bar ${i} at p${p}`
        ).toBeCloseTo(2, 3);
      }
    }
    for (const l of STEPS) {
      for (const { pts: q } of flatten(String(geo({ p: 1, l, w: 1 }).bars.d))) {
        const xs = q.map(([x]) => x);
        expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(2, 3);
      }
    }
  });

  it('the bowed bars keep their 2px weight: two arcs 2px apart, concentric', () => {
    for (const p of STEPS.filter((s) => s >= CUT && s < F(24))) {
      for (const m of String(geo({ p }).bars.d).matchAll(
        /A([\d.]+) [\d.]+ 0 0 [01] [-\d. ]+L[-\d. ]+A([\d.]+)/g
      ))
        expect(Number(m[1]) - Number(m[2]), `p${p}`).toBeCloseTo(2, 2);
    }
  });

  it('stays inside the 36×36 box at every sampled frame (the change, the loop, hover)', () => {
    for (const size of [16, 32]) {
      for (const h of [0, 1]) {
        for (const p of STEPS) {
          for (const l of [0, 0.25, 0.5, 0.75]) {
            for (const w of [0, 1]) {
              for (const [x, y] of Object.values(
                geo({ h, p, l, w }, size)
              ).flatMap((s) => pts(s.d))) {
                expect(
                  Math.min(x, y),
                  `h${h} p${p} l${l} w${w}`
                ).toBeGreaterThanOrEqual(-2 - 1e-3);
                expect(
                  Math.max(x, y),
                  `h${h} p${p} l${l} w${w}`
                ).toBeLessThanOrEqual(34 + 1e-3);
              }
            }
          }
        }
      }
    }
  });

  it("draws Carbon's art for each state with animation off", () => {
    for (const [state, Icon] of [
      ['off', CMicrophone],
      ['listening', CVoiceMode],
    ] as const) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <T size={32} initial={state} />
        </MotionIconProvider>
      ).container.querySelector('svg')!;
      const theirs = render(<Icon size={32} />).container.querySelector('svg')!;
      expect(ours.innerHTML, state).toBe(theirs.innerHTML);
    }
  });
});
