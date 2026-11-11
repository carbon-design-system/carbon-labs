/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { shimmerRevealPass } from '../components/reveal';
import {
  SHIMMER_TEXT,
  shimmerPass,
  shimmerSpeed,
} from '../components/ShimmerText';

describe('the shimmer’s pass', () => {
  it('by default: 0.09px/ms at a short label to 0.16 at a long one, a 500ms rest, on standard-productive, the band 75% of the label, 96 to 240px', () => {
    expect(SHIMMER_TEXT.speed).toEqual({ short: 0.09, long: 0.16 });
    expect([SHIMMER_TEXT.shortPx, SHIMMER_TEXT.longPx]).toEqual([66, 381]);
    expect(SHIMMER_TEXT.restMs).toBe(500);
    expect(SHIMMER_TEXT.band).toBe('75%');
    expect([SHIMMER_TEXT.bandMinPx, SHIMMER_TEXT.bandMaxPx]).toEqual([96, 240]);
    expect(SHIMMER_TEXT.easing).toBe('standard-productive');
  });

  it('takes its speed from the words’ length: 0.09 at 66px, 0.16 at 381px, linearly between, held outside', () => {
    expect(shimmerSpeed(66)).toBeCloseTo(0.09, 9);
    expect(shimmerSpeed(381)).toBeCloseTo(0.16, 9);
    expect(shimmerSpeed((66 + 381) / 2)).toBeCloseTo(0.125, 9);
    expect(shimmerSpeed(20)).toBeCloseTo(0.09, 9);
    expect(shimmerSpeed(900)).toBeCloseTo(0.16, 9);
    // The step label on the page (175px): between.
    expect(shimmerSpeed(175)).toBeCloseTo(0.09 + (0.07 * (175 - 66)) / 315, 9);
    // The speeds are dials.
    expect(shimmerSpeed(381, 0.1, 0.2)).toBeCloseTo(0.2, 9);
  });

  it('crosses from wholly before the label to wholly past it, at its speed on average, then rests 500ms', () => {
    const pass = shimmerPass({ width: 66, height: 18 });
    expect(pass.span).toBeCloseTo((66 + 18) * Math.SQRT1_2 + 96, 6);
    expect(pass.speed).toBeCloseTo(0.09, 9);
    expect(pass.travelMs).toBeCloseTo(pass.span / 0.09, 6);
    expect(pass.periodMs - pass.travelMs).toBeCloseTo(500, 6);
  });

  it('"Thinking…" crosses in 1.73s and rests 0.5s (it rested 1.28s); the long line crosses in 3.03s at 0.16 and rests 0.5s (it crossed in 5.3s and rested 0.74s)', () => {
    const short = shimmerPass({ width: 66, height: 18 });
    expect(short.travelMs).toBeCloseTo(1726, -1);
    expect(short.periodMs).toBeCloseTo(2226, -1);
    const long = shimmerPass({ width: 381, height: 18 });
    expect(long.speed).toBeCloseTo(0.16, 9);
    expect(long.travelMs).toBeCloseTo(long.span / 0.16, 6);
    expect(long.travelMs).toBeCloseTo(3026, -1);
    expect(long.periodMs - long.travelMs).toBeCloseTo(500, 6);
    // A box wider than its words (a grid cell): the speed is the words'.
    expect(
      shimmerPass({ width: 900, height: 18, words: 66 }).speed
    ).toBeCloseTo(0.09, 9);
    // The rest is a dial; never below none.
    expect(
      shimmerPass({ width: 66, height: 18, restMs: 200 }).periodMs -
        short.travelMs
    ).toBeCloseTo(200, 6);
    expect(
      shimmerPass({ width: 66, height: 18, restMs: -5 }).periodMs
    ).toBeCloseTo(short.travelMs, 6);
  });

  it('follows the label’s length: narrow on a short label, wider on a long one, between the least and the most', () => {
    // A share is of the label's width along the sweep.
    expect(
      shimmerPass({ width: 200, height: 18, band: '100%' }).bandPx
    ).toBeCloseTo(200 * Math.SQRT1_2, 6);
    // "Thinking…" (65px) takes the least; the long line 75% of its 263px; a very long label the most.
    expect(shimmerPass({ width: 65, height: 18 }).bandPx).toBe(96);
    expect(shimmerPass({ width: 372, height: 18 }).bandPx).toBeCloseTo(
      0.75 * 372 * Math.SQRT1_2,
      6
    );
    expect(shimmerPass({ width: 900, height: 18 }).bandPx).toBe(240);
    // A box wider than its words (a grid cell): the share is of the words.
    expect(
      shimmerPass({ width: 900, height: 18, words: 372 }).bandPx
    ).toBeCloseTo(0.75 * 372 * Math.SQRT1_2, 6);
    // A width in px is every label's.
    expect(shimmerPass({ width: 65, height: 18, band: 160 }).bandPx).toBe(160);
  });

  it('reveals as one crossing of the label’s own pass: its band and its speed by the words’ length', () => {
    // A step list's trailing words ("214 deals · 1.6s", ~100px at 12px) and "Thinking…".
    for (const [width, height] of [
      [100, 16],
      [66, 20],
      [381, 20],
    ] as const) {
      const reveal = shimmerRevealPass({ width, height });
      const pass = shimmerPass({ width, height });
      expect(reveal).toEqual(pass);
      expect(reveal.speed).toBeCloseTo(shimmerSpeed(width), 6);
      // Never the old fixed 160px band and slow-01 clock: at 100px that crossed at about six times the shimmer's speed.
      expect(reveal.span / reveal.travelMs).toBeLessThan(0.17);
    }
    // Words narrower than their box: the band and the speed are the words'.
    expect(shimmerRevealPass({ width: 300, height: 16, words: 100 })).toEqual(
      shimmerPass({ width: 300, height: 16, words: 100 })
    );
  });

  it('crosses a row at its label’s own speed, not the row’s', () => {
    // "Thinking…" (66px) in a 160px row with its seconds: the band crosses the row at the label's 0.09px/ms.
    const label = shimmerSpeed(66);
    const reveal = shimmerRevealPass({ width: 160, height: 24, speed: label });
    const row = shimmerPass({ width: 160, height: 24 });
    expect(reveal.speed).toBeCloseTo(label, 6);
    expect(reveal.span).toBe(row.span);
    expect(reveal.travelMs).toBeCloseTo(row.span / label, 6);
    expect(reveal.travelMs).toBeGreaterThan(row.travelMs);
  });
});
