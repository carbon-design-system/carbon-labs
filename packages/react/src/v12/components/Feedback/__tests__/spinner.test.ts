/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { motionTokens, easingCss } from '@carbon-labs/v12-motion';
import {
  LOADER_BOX,
  loaderDrawing,
  loaderGap,
  loaderStroke,
  playSpinnerEnter,
  resetSpinnerMotion,
  resolveSpinnerMotion,
  setSpinnerMotion,
  SPINNER_MOTION,
  SPINNER_SHIPPED,
  SPINNER_SIZES,
  spinnerEnterStep,
  spinnerTuning,
  subscribeSpinnerMotion,
} from '../components/Spinner';

describe('the loaders’ stroke and drawing', () => {
  it('maps size to stroke as size / 16, at most 2px: 1px at 16px, 2px from 32px', () => {
    expect(loaderStroke(16)).toBe(1);
    expect(loaderStroke(20)).toBe(1.25);
    expect(loaderStroke(24)).toBe(1.5);
    expect(loaderStroke(32)).toBe(2);
    expect(loaderStroke(48)).toBe(2);
    expect(loaderStroke(64)).toBe(2);
    expect(Math.max(...SPINNER_SIZES)).toBe(64);
  });

  it('is one drawing up to 32px (a 2-unit line on r 13), thinner in the box above', () => {
    for (const size of SPINNER_SIZES) {
      const d = loaderDrawing(size, undefined, { gapStyle: 'break' });
      expect(d.line).toBeCloseTo((loaderStroke(size) * LOADER_BOX) / size, 6);
      if (size <= 32) {
        expect(d.line).toBeCloseTo(2, 6);
      }
      expect(d.r + d.line / 2).toBeCloseTo(14, 6);
      expect(d.arcR).toBe(d.r);
      // The gap is px by size: 2px at 16 to 4px at 64, linearly, in whole pixels.
      expect((d.gap * size) / LOADER_BOX).toBeCloseTo(
        Math.round(2 + ((size - 16) / 48) * 2),
        6
      );
    }
    // 64px: 2px is 1 unit of the 32-unit box.
    expect(
      loaderDrawing(64, undefined, { gapStyle: 'break' }).line
    ).toBeCloseTo(1, 6);
  });

  it('keeps the base ring’s outer edge at 14 for any stroke', () => {
    const d = loaderDrawing(32, 4, { gapStyle: 'break' });
    expect(d.line).toBe(4);
    expect(d.r + d.line / 2).toBe(14);
  });

  it('keeps the gap by size whatever the stroke: 2px at 16px to 4px at 64px, linearly between, in whole pixels', () => {
    expect(SPINNER_SIZES.map((s) => loaderGap(s))).toEqual([2, 2, 2, 3, 3, 4]);
    // Held outside 16 to 64.
    expect([loaderGap(12), loaderGap(96)]).toEqual([2, 4]);
    for (const size of SPINNER_SIZES) {
      for (const stroke of [1, 2, 3, 4]) {
        expect(
          (loaderDrawing(size, stroke, { gapStyle: 'break' }).gap * size) /
            LOADER_BOX
        ).toBeCloseTo(loaderGap(size), 6);
      }
    }
  });

  it('inset: the arc on its own circle, its edge the gap (2px at 16px) inside the base’s', () => {
    const d = loaderDrawing(16, 1, { gapStyle: 'inset' });
    expect(
      ((d.r - d.line / 2 - (d.arcR + d.line / 2)) * 16) / LOADER_BOX
    ).toBeCloseTo(2, 6);
    expect(d.arcCirc).toBeCloseTo(2 * Math.PI * d.arcR, 6);
  });
});

describe('the arc’s swing', () => {
  it('swings between 30% and 70% of the circle', () => {
    expect(SPINNER_MOTION.arc - SPINNER_MOTION.swing).toBeCloseTo(0.3, 6);
    expect(SPINNER_MOTION.arc + SPINNER_MOTION.swing).toBeCloseTo(0.7, 6);
  });
});

describe('dialling the spinner', () => {
  it('writes the numbers, tells the subscribers once, and resets to the shipped numbers', () => {
    let calls = 0;
    const off = subscribeSpinnerMotion(() => (calls += 1));
    setSpinnerMotion({
      swing: 0.1,
      gapSmall: 3,
      gapLarge: 4,
      gapStyle: 'inset',
    });
    expect(spinnerTuning()).toMatchObject({
      swing: 0.1,
      gapSmall: 3,
      gapLarge: 4,
      gapStyle: 'inset',
    });
    expect(calls).toBe(1);
    expect([loaderGap(16), loaderGap(64)]).toEqual([3, 4]);
    expect(loaderStroke(64)).toBe(2);
    setSpinnerMotion({ strokeMax: 1 });
    expect(loaderStroke(64)).toBe(1);
    resetSpinnerMotion();
    expect(spinnerTuning()).toEqual(SPINNER_SHIPPED);
    expect(calls).toBe(3);
    off();
    setSpinnerMotion({ swing: 0.15 });
    expect(calls).toBe(3);
    resetSpinnerMotion();
  });

  it('skips what isn\u2019t one of its numbers, and a change that changes nothing', () => {
    let calls = 0;
    const off = subscribeSpinnerMotion(() => (calls += 1));
    // A draft whose `gap` is the old stroke multiplier is skipped.
    setSpinnerMotion({
      swing: Number.NaN,
      gapStyle: 'wide',
      periodMs: 5,
      gap: 2,
    } as never);
    setSpinnerMotion({ arc: SPINNER_MOTION.arc });
    expect(calls).toBe(0);
    expect(spinnerTuning()).toEqual(SPINNER_SHIPPED);
    off();
  });
});

describe('one spinner’s motion', () => {
  it('lays its own numbers over the store’s, for that spinner alone', () => {
    setSpinnerMotion({ swing: 0.1 });
    expect(resolveSpinnerMotion({ arc: 0.6, gapStyle: 'inset' })).toEqual({
      ...SPINNER_SHIPPED,
      swing: 0.1,
      arc: 0.6,
      gapStyle: 'inset',
    });
    expect(resolveSpinnerMotion()).toEqual({ ...SPINNER_SHIPPED, swing: 0.1 });
    expect(spinnerTuning()).toEqual({ ...SPINNER_SHIPPED, swing: 0.1 });
    resetSpinnerMotion();
  });

  it('skips what isn’t one of its numbers', () => {
    expect(
      resolveSpinnerMotion({
        swing: Number.NaN,
        gapStyle: 'wide',
        periodMs: 5,
      } as never)
    ).toEqual(SPINNER_SHIPPED);
  });

  it('draws with its own gap and stroke', () => {
    const d = loaderDrawing(48, undefined, {
      gapLarge: 4,
      strokeMax: 1,
      gapStyle: 'inset',
    });
    expect(d.gapStyle).toBe('inset');
    // Two thirds of the way from 16px's 2px to 64px's 4px, to the whole pixel.
    expect((d.gap * 48) / LOADER_BOX).toBeCloseTo(3, 6);
    expect((d.line * 48) / LOADER_BOX).toBeCloseTo(1, 6);
    expect(loaderDrawing(48).gapStyle).toBe(SPINNER_SHIPPED.gapStyle);
  });
});

describe('a new spinner’s entrance', () => {
  /** A stand-in svg with two 2-unit circles, recording what it is asked to animate. */
  function fake() {
    const calls: {
      el: string;
      frames: Keyframe[];
      opts: KeyframeAnimationOptions;
    }[] = [];
    const animate =
      (el: string) => (frames: Keyframe[], opts: KeyframeAnimationOptions) => {
        calls.push({ el, frames, opts });
        return {} as Animation;
      };
    const circle = { getAttribute: () => '2', animate: animate('circle') };
    const svg = {
      animate: animate('svg'),
      querySelectorAll: () => [circle, circle],
    } as unknown as SVGSVGElement;
    return { svg, calls };
  }
  const entrance = easingCss('entrance-productive');

  it('comes in at 60% scale and grows to 100%, its line holding its px, on moderate-02 at every size', () => {
    expect(SPINNER_MOTION.enterScale).toBe(0.6);
    expect(SPINNER_MOTION.enter).toBe('moderate-02');
    for (const size of SPINNER_SIZES) {
      const { svg, calls } = fake();
      playSpinnerEnter(svg, size, 1);
      expect(calls).toHaveLength(3);
      expect(calls[0]).toMatchObject({
        el: 'svg',
        frames: [{ scale: '0.6' }, { scale: '1' }],
      });
      // The line × the scale is the same px at both ends.
      for (const c of calls.slice(1)) {
        const w = c.frames.map((f) => parseFloat(String(f.strokeWidth)));
        expect(w[0]! * 0.6).toBeCloseTo(2, 6);
        expect(w[w.length - 1]).toBe(2);
        // In between too: each keyframe is the line over the scale at that point of the (eased) progress.
        w.forEach((v, k) =>
          expect(v * (0.6 + (0.4 * k) / (w.length - 1))).toBeCloseTo(2, 6)
        );
      }
      // The outer edge grows 2.8px at 16px, 11.2px at 64px: a fast-02 on travel alone, floored at moderate-02 (220ms),
      // entrance-productive.
      expect(spinnerEnterStep(((14 * size) / 32) * 0.4)).toBe('moderate-02');
      for (const c of calls) {
        expect(c.opts).toMatchObject({
          duration: motionTokens.duration['moderate-02'],
          easing: entrance,
        });
      }
    }
  });

  it('keeps a longer travel’s own step, and the floor is a dial', () => {
    expect(spinnerEnterStep(600)).toBe('moderate-03');
    expect(spinnerEnterStep(1000)).toBe('slow-01');
    expect(spinnerEnterStep(2, { enter: 'fast-02' })).toBe('fast-02');
    const { svg, calls } = fake();
    playSpinnerEnter(svg, 16, 1, { enter: 'slow-01', enterScale: 0.7 });
    expect(calls[0]).toMatchObject({
      frames: [{ scale: '0.7' }, { scale: '1' }],
      opts: { duration: motionTokens.duration['slow-01'] },
    });
    // Nothing to grow at full scale.
    expect(playSpinnerEnter(fake().svg, 16, 1, { enterScale: 1 })).toEqual([]);
  });

  it('runs on the family’s time scale', () => {
    const { svg, calls } = fake();
    playSpinnerEnter(svg, 16, 10);
    expect(calls[0].opts.duration).toBe(
      motionTokens.duration['moderate-02'] * 10
    );
  });
});
