/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motionTokens } from '@carbon-labs/v12-motion';

/* ============================================================================
 * The burst throttle for a value's tween (ProgressBar's fill, ProgressRing's
 * arc). Feedback rule 5: a burst animates once, to the latest state.
 *
 * A value that updates many times a second would start a new tween on every
 * update, each from rest, and the fill would chase the value. Instead, at most
 * one new tween starts per window (`fast-02`, at the family's time scale); an
 * update inside the window retargets the running tween.
 *
 * The ring's arc keeps the tween's clock and end time and moves its start, so
 * that at the eased progress `e` it has reached it is where the arc is:
 *
 *   now = from' + (to' − from') · e   ⇒   from' = (now − to' · e) / (1 − e)
 *
 * That keeps the place but not the speed: late in a tween (1 − e small) the
 * speed jumps. The bar's fill retargets from its place and its speed
 * (`tweenSpeed`): the new tween leaves at that speed (`curveAtSpeed`:
 * standard-productive, its start handle set), over the travel's duration or
 * the running tween's remaining time, whichever is longer, in the same window.
 *
 * Past the window a new tween starts from the live edge, at the speed the
 * value is moving (the running tween's, or the last readings').
 * ========================================================================== */

/** The eased progress past which a tween is too near its end to retarget (a new tween starts instead). */
const LATE = 0.95;

/**
 * Where a running tween must start from, so that it ends at `to` and is at
 * `now` at its current progress. Null when there is no tween to retarget
 * (none running, started outside the window, or nearly done): start a new one.
 */
export function retargetFrom(
  anim: Animation | null,
  startedAt: number,
  at: number,
  windowMs: number,
  now: number,
  to: number
): number | null {
  if (!anim || anim.playState !== 'running' || at - startedAt >= windowMs) {
    return null;
  }
  // A tween that hasn't started yet (pending) is at its start.
  const e = anim.effect?.getComputedTiming().progress ?? 0;
  if (e >= LATE) {
    return null;
  }
  return (now - to * e) / (1 - e);
}

/** The time the running tween ends, ms from now (for a status that waits for it to land). */
export function remainingMs(anim: Animation | null): number {
  if (!anim || anim.playState !== 'running') {
    return 0;
  }
  const t = anim.effect?.getComputedTiming();
  if (!t || t.endTime == null || t.localTime == null) {
    return 0;
  }
  return Math.max(0, Number(t.endTime) - Number(t.localTime));
}

/**
 * Start a tween on this frame rather than the next one. A new animation waits
 * a frame before it starts (pending); updates that arrive every frame would
 * each replace a tween that never started, so the value would stall.
 */
export function startNow<T extends Animation>(anim: T): T {
  const at = document.timeline.currentTime;
  if (at != null) {
    anim.startTime = at;
  }
  return anim;
}

/** A cubic-bezier easing's four numbers. */
export type Curve = readonly [number, number, number, number];

/**
 * standard-productive, its start handle set so the curve leaves at `slope`
 * (its initial rate, in the curve's own units: speed × duration ÷ distance).
 * A slope of 0 (or less) is standard-productive itself.
 */
export function curveFrom(slope: number): Curve {
  const [sx1, sy1, x2, y2] = motionTokens.easing['standard-productive'];
  if (!(slope > 0.01)) {
    return [sx1, sy1, x2, y2];
  }
  const x1 = Math.min(sx1, 1 / slope);
  return [+x1.toFixed(4), +(x1 * slope).toFixed(4), x2, y2];
}

export const curveCss = ([x1, y1, x2, y2]: Curve) =>
  `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

/** `curveFrom` as CSS. */
export const easeFrom = (slope: number): string => curveCss(curveFrom(slope));

/** A curve's slope (eased progress per unit of time progress) at time progress `p`. */
export function curveSlope([x1, y1, x2, y2]: Curve, p: number): number {
  const at = (a: number, b: number, u: number) =>
    3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u * u * b + u ** 3;
  const d = (a: number, b: number, u: number) =>
    3 * (1 - u) ** 2 * a + 6 * (1 - u) * u * (b - a) + 3 * u * u * (1 - b);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const u = (lo + hi) / 2;
    if (at(x1, x2, u) < p) {
      lo = u;
    } else {
      hi = u;
    }
  }
  const u = (lo + hi) / 2;
  const dx = d(x1, x2, u);
  return Math.abs(dx) < 1e-6 ? 0 : d(y1, y2, u) / dx;
}

/** A tween of a value, as far as its speed goes: its ends and its curve. */
export interface Tween {
  anim: Animation;
  from: number;
  to: number;
  curve: Curve;
}

/** How fast a running tween moves its value now, per ms (0 when it isn't running). */
export function tweenSpeed({ anim, from, to, curve }: Tween): number {
  const t = anim.effect?.getComputedTiming();
  const duration = Number(t?.duration);
  if (anim.playState !== 'running' || !t || !(duration > 0)) {
    return 0;
  }
  // A tween that hasn't started yet (pending) is at its start.
  const p = Math.min(1, Math.max(0, Number(t.localTime ?? 0) / duration));
  return ((to - from) * curveSlope(curve, p)) / duration;
}

/** The curve for a tween from `value` to `target` over `durationMs` that leaves at `speed` (per ms). */
export function curveAtSpeed(
  speed: number,
  value: number,
  target: number,
  durationMs: number
): Curve {
  const distance = target - value;
  return Math.abs(distance) < 1e-6
    ? curveFrom(0)
    : curveFrom((speed * durationMs) / distance);
}

/** A value's last reading, to tell how fast it is moving when a new tween starts. */
export interface Reading {
  value: number;
  at: number;
}

/** The speed the last reading shows, per ms, if it is recent (0 otherwise). */
export function readSpeed(
  last: Reading | null,
  value: number,
  at: number
): number {
  const dt = last ? at - last.at : Infinity;
  return !last || dt <= 0 || dt > 40 ? 0 : (value - last.value) / dt;
}

/** The curve for a new tween over `distance` in `durationMs`, leaving at the speed the last reading shows (if it is recent). */
export function continueFrom(
  last: Reading | null,
  value: number,
  at: number,
  durationMs: number,
  target: number
): string {
  return curveCss(
    curveAtSpeed(readSpeed(last, value, at), value, target, durationMs)
  );
}
