/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motionTokens, toEasing } from './tokens';

/**
 * A CSS-style cubic-bezier easing as a plain function, for geometry that
 * applies its own easing mid-animation (e.g. a two-part fold). Solves x(t)
 * by bisection, then returns y(t).
 */
/* @__NO_SIDE_EFFECTS__ */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  const at = (a: number, b: number, t: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (x: number) => {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    let [lo, hi, t] = [0, 1, x];
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (at(x1, x2, t) < x) {
        lo = t;
      } else {
        hi = t;
      }
    }
    return at(y1, y2, t);
  };
}

/** Carbon's productive standard, entrance and exit motion tokens as functions. */
export const STANDARD = /* @__PURE__ */ cubicBezier(
  ...toEasing(motionTokens.easing.standard)
);
export const ENTRANCE = /* @__PURE__ */ cubicBezier(
  ...toEasing(motionTokens.easing.entrance)
);
export const EXIT = /* @__PURE__ */ cubicBezier(
  ...toEasing(motionTokens.easing.exit)
);

/**
 * A sequence across `n` parts: the hover runs linear over
 * `move + (n − 1) × gap` ms and part `i` applies the entrance ease to its
 * own `move`-ms slice (`move` is moderate-01 unless given). Kept only where the sequence is the motion (asked
 * for, or one shape's two edges); a stagger across small parts uses
 * `together`.
 */
/* @__NO_SIDE_EFFECTS__ */
export const stagger = (
  n: number,
  move: number = motionTokens.duration.moderate01,
  gap = 30
) => {
  const total = move + (n - 1) * gap;
  return {
    hover: {
      duration: total / 1000,
      ease: [0, 0, 1, 1] as [number, number, number, number],
    },
    at: (h: number, i: number) =>
      ENTRANCE(Math.min(1, Math.max(0, (h * total - i * gap) / move))),
  };
};

/**
 * Parts that move together: the hover runs linear over `move` ms (moderate-01
 * unless given) and every
 * part applies the entrance ease to the whole of it. A stagger doesn't read
 * at small sizes, so the parts move as one; `at` keeps its part argument.
 */
/* @__NO_SIDE_EFFECTS__ */
export const together = (move: number = motionTokens.duration.moderate01) => ({
  hover: {
    duration: move / 1000,
    ease: [0, 0, 1, 1] as [number, number, number, number],
  },
  at: (h: number, part?: number) => (
    void part,
    ENTRANCE(Math.min(1, Math.max(0, h)))
  ),
});

/**
 * The Chevron toggles' fold, from linear progress p: folds flat by 6/15 of
 * the way on the exit ease (0 → 0.5), then opens on the entrance ease
 * (0.5 → 1).
 */
export const FOLD_AT = 6 / 15;
/* @__NO_SIDE_EFFECTS__ */
export const foldProgress = (p: number) =>
  p <= FOLD_AT
    ? EXIT(p / FOLD_AT) / 2
    : 0.5 + ENTRANCE((p - FOLD_AT) / (1 - FOLD_AT)) / 2;
