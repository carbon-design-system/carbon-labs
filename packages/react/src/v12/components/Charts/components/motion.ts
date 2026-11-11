/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The family's motion, from token names to times and easing functions. Every
// value comes through the motion seam: durations from its tokens, curves from
// its easings. At the reduced level each change fades in place on the reduced
// clock; at `none` it lands at once.

import {
  bezierEase,
  cubicBezier,
  distanceTokens,
  DURATION_FLOOR_MS,
  motionTokens,
  reducedClock,
  STAGGER,
  staggerSteps,
  toEasing,
  type DurationToken,
  type MotionLevel,
} from '@carbon-labs/v12-motion';
import { CHART_DESIGN, type ChartEasing } from './design';

/** An easing function: progress in, eased progress out. */
export type ChartEaseFn = (t: number) => number;

/** A curve as a function and as a CSS timing function. */
export interface ChartCurve {
  ease: ChartEaseFn;
  css: string;
}

/** One phase of a reveal. */
export interface ChartPhaseTiming {
  /** The window marks depart and land in. */
  frontMs: number;
  /** Each mark's own move. */
  moveMs: number;
  /** Between one series and the next, or after the measured marks land. */
  staggerMs: number;
  ease: ChartEaseFn;
}

/** The family's motion, resolved for one motion level. */
export interface ChartMotion {
  level: MotionLevel;
  /** The fade every change takes at the reduced level. */
  fade: ChartCurve & { durationMs: number };
  measured: ChartPhaseTiming & {
    /** A fixed step between marks, or null to spread them across the front. */
    markStaggerMs: number | null;
    /** How far below its value a mark starts, and its soft leading edge, px. */
    rise: number;
    soften: number;
    /** When the last of `count` measured marks lands. */
    endMs: (count: number) => number;
  };
  projected: ChartPhaseTiming & {
    dissolveMs: number;
    /** When the projected marks start, given the measured marks' count. */
    startMs: (measuredCount: number) => number;
  };
  nowRule: {
    durationMs: number;
    ease: ChartEaseFn;
    startMs: (measuredCount: number) => number;
  };
  /** Projected lines fade in with the projected marks, or draw in. */
  projectedLine: ChartCurve & { fade: boolean; durationMs: number };
  hero: {
    durationMs: number;
    staggerMs: number;
    ease: ChartEaseFn;
    mode: 'expressive' | 'productive';
  };
  productive: {
    rollMs: number;
    staggerMs: number;
    maxMs: number;
    ease: ChartEaseFn;
  };
  /** A traveling mark's own move. */
  travel: ChartCurve;
}

/**
 * A duration token's time.
 *
 * @param token The token.
 * @returns Its time.
 */
const timeOf = (token: DurationToken): number => motionTokens.duration[token];

/**
 * An easing token as a function and as CSS.
 *
 * @param ref The easing, or `linear`.
 * @returns The curve.
 */
export function chartCurve(ref: ChartEasing | 'linear'): ChartCurve {
  if (ref === 'linear') {
    return { ease: (t) => t, css: 'linear' };
  }
  const curve = toEasing(ref);
  return { ease: bezierEase(curve), css: cubicBezier(curve) };
}

/**
 * The family's motion at a motion level.
 *
 * @param level `full`, `reduced` (a fade in place on the reduced clock) or
 *   `none` (at once).
 * @returns The times and curves.
 */
export function resolveChartMotion(level: MotionLevel = 'full'): ChartMotion {
  const m = CHART_DESIGN.motion;
  const fadeCurve = chartCurve(m.reduced.easing);
  const fadeMs =
    level === 'none'
      ? 0
      : Math.max(
          DURATION_FLOOR_MS,
          timeOf(m.reduced.fade) * reducedClock(level === 'reduced')
        );
  const fade = { ...fadeCurve, durationMs: fadeMs };
  if (level !== 'full') {
    const atStart = () => 0;
    return {
      level,
      fade,
      measured: {
        frontMs: 0,
        moveMs: fadeMs,
        staggerMs: 0,
        ease: fadeCurve.ease,
        markStaggerMs: 0,
        rise: 0,
        soften: 0,
        endMs: () => fadeMs,
      },
      projected: {
        frontMs: 0,
        moveMs: fadeMs,
        staggerMs: 0,
        ease: fadeCurve.ease,
        dissolveMs: fadeMs,
        startMs: atStart,
      },
      nowRule: { durationMs: fadeMs, ease: fadeCurve.ease, startMs: atStart },
      projectedLine: { ...fadeCurve, fade: true, durationMs: fadeMs },
      hero: {
        durationMs: fadeMs,
        staggerMs: 0,
        ease: fadeCurve.ease,
        mode: m.hero.mode,
      },
      productive: {
        rollMs: fadeMs,
        staggerMs: 0,
        maxMs: fadeMs,
        ease: fadeCurve.ease,
      },
      travel: fadeCurve,
    };
  }

  const frontMs = timeOf(m.measured.front);
  const moveMs = timeOf(m.measured.grow);
  const step = m.measured.markStagger;
  const markStaggerMs = step === 'spread' ? null : staggerSteps[step];
  const measuredEnd = (count: number): number =>
    markStaggerMs === null
      ? Math.max(frontMs, moveMs)
      : Math.min(STAGGER.windowMs, markStaggerMs * Math.max(0, count - 1)) +
        moveMs;
  const projectedAfter = timeOf(m.projected.after);
  const ruleAfter = timeOf(m.nowRule.after);
  const line = chartCurve(m.projectedLine.easing);

  return {
    level,
    fade,
    measured: {
      frontMs,
      moveMs,
      staggerMs: timeOf(m.measured.stagger),
      ease: chartCurve(m.measured.easing).ease,
      markStaggerMs,
      rise: distanceTokens[m.measured.rise],
      soften: distanceTokens[m.measured.soften],
      endMs: measuredEnd,
    },
    projected: {
      frontMs: timeOf(m.projected.front),
      moveMs: timeOf(m.projected.grow),
      staggerMs: projectedAfter,
      ease: chartCurve(m.projected.easing).ease,
      dissolveMs: timeOf(m.projected.dissolve),
      startMs: (n) => measuredEnd(n) + projectedAfter,
    },
    nowRule: {
      durationMs: timeOf(m.nowRule.duration),
      ease: chartCurve(m.nowRule.easing).ease,
      startMs: (n) => measuredEnd(n) + ruleAfter,
    },
    projectedLine: {
      ...line,
      fade: m.projectedLine.entry === 'fade',
      durationMs: timeOf(m.projectedLine.fade),
    },
    hero: {
      durationMs: timeOf(m.hero.duration),
      staggerMs: timeOf(m.hero.stagger),
      ease: chartCurve(m.hero.easing).ease,
      mode: m.hero.mode,
    },
    productive: {
      rollMs: timeOf(m.productive.roll),
      staggerMs: timeOf(m.productive.stagger),
      maxMs: timeOf(m.productive.max),
      ease: chartCurve(m.productive.easing).ease,
    },
    travel: chartCurve(m.travel.easing),
  };
}
