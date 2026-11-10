/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { bezierEase, motionTokens } from '@carbon-labs/v12-motion';
import {
  DITHER,
  IN_DOT,
  IN_EASE,
  IN_SWEEP,
  OUT_DOT,
  OUT_EASE,
  OUT_SWEEP,
  phaseLength,
  presenceAt,
  presenceDelay,
  shimmerAt,
  type PresencePhase,
} from '../components/twinkleWave';

/** A 384px track's lattice row (4px pitch), the knob's center at its end. */
const PITCH = 4;
const COLS = 96;
const KNOB_X = COLS * PITCH;
const dots = Array.from({ length: COLS }, (_, col) => ({
  col,
  bx: col * PITCH,
}));
const phase = (
  on: boolean,
  prev: PresencePhase | null = null,
  t0 = 0
): PresencePhase => ({
  on,
  t0,
  x: KNOB_X,
  ts: 1,
  prev,
});
const total = (p: PresencePhase, t: number, row = 2) =>
  dots.reduce((s, d) => s + presenceAt(p, d.bx, d.col, row, t), 0);

const pearson = (a: number[], b: number[]) => {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (a[i]! - ma) * (b[i]! - mb);
    saa += (a[i]! - ma) ** 2;
    sbb += (b[i]! - mb) ** 2;
  }
  return sab / Math.sqrt(saa * sbb);
};

describe('the AI dots coming in', () => {
  it('runs on the entrance curve, with token durations', () => {
    expect(IN_EASE).toEqual(motionTokens.easing['entrance-productive']);
    expect(IN_DOT).toBe(motionTokens.duration['slow-01']);
    expect(IN_SWEEP).toBe(motionTokens.duration['slow-01']);
    expect(phaseLength({ on: true, ts: 1 })).toBeCloseTo(
      IN_SWEEP * (1 + DITHER) + IN_DOT
    );
    expect(phaseLength({ on: true, ts: 2 })).toBeCloseTo(
      2 * phaseLength({ on: true, ts: 1 })
    );
  });

  it('brings each dot in on the curve, from nothing, with no overshoot', () => {
    const p = phase(true);
    const ease = bezierEase(IN_EASE);
    for (const { bx, col } of dots.filter((_, i) => i % 7 === 0)) {
      const d = presenceDelay(p, bx, col, 2);
      expect(presenceAt(p, bx, col, 2, d)).toBe(0);
      for (const e of [0.1, 0.25, 0.5, 0.75]) {
        expect(presenceAt(p, bx, col, 2, d + e * IN_DOT)).toBeCloseTo(
          ease(e),
          5
        );
      }
      expect(presenceAt(p, bx, col, 2, d + IN_DOT)).toBeCloseTo(1, 9);
    }
    for (let t = 0; t <= phaseLength(p); t += 8) {
      for (const { bx, col } of dots) {
        expect(presenceAt(p, bx, col, 2, t)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('starts at the knob and sweeps leftward', () => {
    const p = phase(true);
    const near = presenceDelay(p, KNOB_X - PITCH, COLS - 1, 2);
    const far = presenceDelay(p, 0, 0, 2);
    expect(near).toBeLessThan(0.1 * IN_SWEEP);
    expect(far).toBeGreaterThan(0.85 * IN_SWEEP);
  });

  it('never pops: the texture grows by under a tenth of itself a frame, and is whole at the end', () => {
    const p = phase(true);
    const end = phaseLength(p);
    let last = 0;
    let biggest = 0;
    for (let t = 0; t <= end + 16; t += 16) {
      const v = total(p, t) / COLS;
      biggest = Math.max(biggest, v - last);
      last = v;
    }
    expect(biggest).toBeLessThan(0.1);
    expect(total(p, end)).toBeCloseTo(COLS, 6);
  });
});

describe('the AI dots leaving', () => {
  it('runs on the exit curve, with token durations', () => {
    expect(OUT_EASE).toEqual(motionTokens.easing['exit-productive']);
    expect(OUT_DOT).toBe(motionTokens.duration['moderate-03']);
    expect(OUT_SWEEP).toBe(motionTokens.duration['slow-01']);
    const p = phase(false);
    const ease = bezierEase(OUT_EASE);
    const { bx, col } = dots[40]!;
    const d = presenceDelay(p, bx, col, 2);
    expect(presenceAt(p, bx, col, 2, d + 0.5 * OUT_DOT)).toBeCloseTo(
      1 - ease(0.5),
      5
    );
  });

  it('dissolves from left to right', () => {
    const p = phase(false);
    // When each dot is half gone, by the eighth of the track it sits in.
    const half = (bx: number, col: number, row: number) => {
      let t = 0;
      while (presenceAt(p, bx, col, row, t) > 0.5) {
        t += 2;
      }
      return t;
    };
    const bins = Array.from({ length: 8 }, (_, k) => {
      const ts: number[] = [];
      for (const { bx, col } of dots.slice(k * 12, k * 12 + 12)) {
        for (let row = 0; row < 4; row++) {
          ts.push(half(bx, col, row));
        }
      }
      return ts.reduce((s, v) => s + v, 0) / ts.length;
    });
    for (let k = 1; k < bins.length; k++) {
      expect(bins[k]!).toBeGreaterThan(bins[k - 1]!);
    }
    expect(bins.at(-1)! - bins[0]!).toBeGreaterThan(0.6 * OUT_SWEEP);
    // All gone by the change's end.
    expect(total(p, phaseLength(p))).toBe(0);
  });

  it('turns back from where each dot is, with no jump', () => {
    const out = phase(false);
    const back = phase(true, out, 250);
    for (const { bx, col } of dots) {
      const before = presenceAt(out, bx, col, 2, 250);
      expect(presenceAt(back, bx, col, 2, 250)).toBeCloseTo(before, 6);
      expect(presenceAt(back, bx, col, 2, 250 + phaseLength(back))).toBe(1);
    }
  });
});

describe('the shimmer', () => {
  const T = Array.from({ length: 1200 }, (_, i) => i * 50); // 60s
  const series = (col: number, row: number) =>
    T.map((t) => shimmerAt(col, row, t));

  it('keeps the round-12 swing: −1 to 1, about 1/√2 RMS', () => {
    const all = [0, 13, 27, 51, 80].flatMap((c) => series(c, 2));
    const rms = Math.sqrt(all.reduce((s, v) => s + v * v, 0) / all.length);
    expect(rms).toBeGreaterThan(0.6);
    expect(rms).toBeLessThan(0.75);
    expect(Math.max(...all)).toBeLessThanOrEqual(1);
    expect(Math.min(...all)).toBeGreaterThanOrEqual(-1);
  });

  it('has no wave: neighbouring dots are unrelated, in place and in time', () => {
    const rs: number[] = [];
    const lagged: number[] = [];
    for (let col = 4; col < 64; col += 3) {
      for (let row = 0; row < 4; row++) {
        const a = series(col, row);
        rs.push(Math.abs(pearson(a, series(col + 1, row))));
        rs.push(Math.abs(pearson(a, series(col, row + 1))));
        // A front moving at any speed would show as one dot following another a little later.
        const b = series(col + 2, row);
        for (const lag of [2, 4, 8]) {
          lagged.push(Math.abs(pearson(a.slice(0, -lag), b.slice(lag))));
        }
      }
    }
    const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
    // The round-12 flow (one shared phase less distance) put neighbours at about 0.9.
    expect(mean(rs)).toBeLessThan(0.2);
    expect(mean(lagged)).toBeLessThan(0.2);
  });

  it('is as calm as the round-12 cosine: it moves no faster, on average', () => {
    // The round-12 cosine at 2.4s moved at 2π/2400 a ms at its steepest, 1/√2 of that on average.
    let sq = 0;
    let n = 0;
    for (let col = 0; col < 40; col++) {
      const s = series(col, 1);
      for (let i = 1; i < s.length; i++) {
        sq += ((s[i]! - s[i - 1]!) / 50) ** 2;
        n++;
      }
    }
    expect(Math.sqrt(sq / n)).toBeLessThan((2 * Math.PI) / 2400 / Math.SQRT2);
  });
});
