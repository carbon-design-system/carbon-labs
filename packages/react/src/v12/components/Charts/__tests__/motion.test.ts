/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  cubicBezier,
  motionTokens,
  reducedClock,
  toEasing,
} from '@carbon-labs/v12-motion';
import { describe, expect, it } from 'vitest';
import { CHART_DESIGN, chartCurve, resolveChartMotion } from '../index';

const m = CHART_DESIGN.motion;

describe('resolveChartMotion', () => {
  it('reads every time from the seam’s tokens at the full level', () => {
    const full = resolveChartMotion('full');
    expect(full.measured.frontMs).toBe(motionTokens.duration[m.measured.front]);
    expect(full.measured.moveMs).toBe(motionTokens.duration[m.measured.grow]);
    expect(full.projected.dissolveMs).toBe(
      motionTokens.duration[m.projected.dissolve]
    );
    expect(full.productive.maxMs).toBe(motionTokens.duration[m.productive.max]);
    expect(full.travel.css).toBe(cubicBezier(toEasing(m.travel.easing)));
  });

  it('starts the projected marks after the measured ones land', () => {
    const full = resolveChartMotion('full');
    const end = full.measured.endMs(12);
    expect(end).toBe(Math.max(full.measured.frontMs, full.measured.moveMs));
    expect(full.projected.startMs(12)).toBe(
      end + motionTokens.duration[m.projected.after]
    );
  });

  it('fades every change in place on the reduced clock', () => {
    const reduced = resolveChartMotion('reduced');
    const fade = motionTokens.duration[m.reduced.fade] * reducedClock(true);
    expect(reduced.fade.durationMs).toBe(fade);
    expect(reduced.fade.durationMs).toBeLessThan(
      motionTokens.duration[m.reduced.fade]
    );
    expect(reduced.measured.frontMs).toBe(0);
    expect(reduced.measured.staggerMs).toBe(0);
    expect(reduced.measured.rise).toBe(0);
    expect(reduced.measured.soften).toBe(0);
    expect(reduced.measured.moveMs).toBe(fade);
    expect(reduced.projected.startMs(12)).toBe(0);
    expect(reduced.projectedLine.fade).toBe(true);
  });

  it('lands every change at once at the none level', () => {
    const none = resolveChartMotion('none');
    expect(none.fade.durationMs).toBe(0);
    expect(none.measured.moveMs).toBe(0);
    expect(none.measured.endMs(12)).toBe(0);
    expect(none.hero.durationMs).toBe(0);
  });

  it('defaults to the full level', () => {
    expect(resolveChartMotion().level).toBe('full');
  });
});

describe('chartCurve', () => {
  it('turns a token into a function and CSS that agree at the ends', () => {
    const c = chartCurve({ name: 'standard', mode: 'productive' });
    expect(c.ease(0)).toBeCloseTo(0);
    expect(c.ease(1)).toBeCloseTo(1);
    expect(c.css).toMatch(/^cubic-bezier\(/);
  });

  it('keeps linear linear', () => {
    const c = chartCurve('linear');
    expect(c.ease(0.3)).toBe(0.3);
    expect(c.css).toBe('linear');
  });
});
