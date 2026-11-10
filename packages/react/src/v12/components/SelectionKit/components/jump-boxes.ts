/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DURATION_FLOOR_MS,
  motionTokens,
  SELECTION_ARRIVAL,
  selectionDuration,
  easingCss,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { JUMP_IN_SHRINK, JUMP_OUT_SHARE, JUMP_OUT_SHRINK } from './jump';

/* ============================================================================
 * The jump for boxes — the selection kit's jump (jump.ts) where there is no
 * selector to move: a set of boxes goes out and another comes in, in place
 * (the page header's buttons folding into one menu button and back).
 *
 * jump.ts drives a Selection engine's indicator (its leave and arrival), so
 * it can't move a button; this plays the same jump on any element, with the
 * same amounts, curves and clock:
 *
 *   out      each leaving box shrinks JUMP_OUT_SHRINK px in width and height
 *            (half on every side), from its centre, exit-productive, opaque
 *            to its last frame, and is gone (it stays hidden: a copy the
 *            caller removes, or an element that's leaving anyway)
 *   in       then each arriving box comes in JUMP_IN_SHRINK px small, opaque,
 *            growing to full, entrance-snap (the selection arrival's curve);
 *            hidden until then
 *   clock    the glide's shortest, as jump.ts's: the step one row's
 *            travel takes (`selectionDuration`), a row here being the
 *            tallest box (a 40px button: fast-01, 80ms), in the caller's
 *            slow motion; a third for the out, two thirds
 *            for the in (JUMP_OUT_SHARE). Inside a longer motion that has
 *            beats of its own (the page header's collapse, whose title
 *            swaps out then in on those shares), `clock` puts the jump on
 *            that motion's clock instead, so its out and in are the
 *            motion's: nothing arrives where something is still leaving
 *   reduced  the caller's: nothing plays (at once)
 * ========================================================================== */

const easing = (name: keyof typeof motionTokens.easing) => easingCss(name);
/** The selection arrival's curve, entrance-snap. */
const ENTRANCE_SNAP = cubicBezier([...SELECTION_ARRIVAL.ease]);

/** A box `px` smaller in width and height, from its centre, as a scale (its laid-out size: transforms left out). */
function shrunk(el: HTMLElement, px: number): string {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const sx = w > px ? (w - px) / w : 1;
  const sy = h > px ? (h - px) / h : 1;
  return `scale(${sx}, ${sy})`;
}

/** The jump's whole clock for boxes `rowPx` tall, ms: the glide's step for one row's travel, in slow motion. */
export function jumpBoxesClock(rowPx: number, timeScale = 1): number {
  return Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[selectionDuration(rowPx)] * timeScale
  );
}

export interface JumpBoxesOptions {
  /** What leaves: shrinks out, then is hidden. */
  out?: readonly HTMLElement[];
  /** What arrives: hidden through the out, then grows in. */
  in?: readonly HTMLElement[];
  /** Slow motion, as a multiplier. Default 1. */
  timeScale?: number;
  /** The whole jump's clock, ms, when it's a beat of a longer motion (that motion's clock). Default the glide's shortest step. */
  clock?: number;
}

export interface JumpBoxes {
  /** Every animation it started (cancel them to stop it). */
  animations: Animation[];
  /** The out's and the in's durations, and when the in starts, ms. */
  outMs: number;
  inMs: number;
  inAt: number;
}

/** Plays the jump on `out` and `in` (see above). */
export function jumpBoxes(o: JumpBoxesOptions): JumpBoxes {
  const out = o.out ?? [];
  const into = o.in ?? [];
  const clock =
    o.clock ??
    jumpBoxesClock(
      Math.max(0, ...[...out, ...into].map((el) => el.offsetHeight)),
      o.timeScale
    );
  const outMs = Math.max(DURATION_FLOOR_MS, clock * JUMP_OUT_SHARE);
  const inMs = Math.max(DURATION_FLOOR_MS, clock - outMs);
  // The in waits for the out (a longer motion's out beat, when it has one).
  const inAt = out.length || o.clock != null ? outMs : 0;
  const animations: Animation[] = [];
  // Every size read before any animation starts: a start between two reads
  // made each read recalculate the page's style.
  const outSmall = out.map((el) => shrunk(el, JUMP_OUT_SHRINK));
  const inSmall = into.map((el) => shrunk(el, JUMP_IN_SHRINK));
  out.forEach((el, i) => {
    const small = outSmall[i]!;
    animations.push(
      el.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: small, opacity: 1, offset: 0.9999 },
          { transform: small, opacity: 0 },
        ],
        { duration: outMs, easing: easing('exit-productive'), fill: 'forwards' }
      )
    );
  });
  into.forEach((el, i) => {
    const small = inSmall[i]!;
    const total = inAt + inMs;
    const at = inAt / total;
    animations.push(
      el.animate(
        inAt > 0
          ? [
              { transform: small, opacity: 0, offset: 0 },
              { transform: small, opacity: 0, offset: at },
              {
                transform: small,
                opacity: 1,
                offset: Math.min(1, at + 0.0001),
                easing: ENTRANCE_SNAP,
              },
              { transform: 'none', opacity: 1, offset: 1 },
            ]
          : [
              { transform: small, opacity: 1, easing: ENTRANCE_SNAP },
              { transform: 'none', opacity: 1 },
            ],
        { duration: total, easing: 'linear', fill: 'backwards' }
      )
    );
  });
  return { animations, outMs, inMs, inAt };
}
