/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  animateLayout,
  DURATION_FLOOR_MS,
  durationStepForDistance,
  motionTokens,
  playContentSwap,
  SNAP,
  type ContentSwap,
  type DurationToken,
} from '@carbon-labs/v12-motion';

/* InlineEdit's motion, apart from React: the swap between the value and its
   field, the box's move to its new size, and the actions' snap. */

export interface BoxSize {
  w: number;
  h: number;
}

export const INLINE_EDIT_MOTION = {
  /** How long the saved check holds before it fades, ms. */
  savedHoldMs: 1500,
  /** The check's fade. */
  fade: 'fast-02' as DurationToken,
  /** The box's move under this is no move, px. */
  minTravel: 0.5,
};

const bezier = (name: keyof typeof motionTokens.easing) =>
  `cubic-bezier(${motionTokens.easing[name].join(', ')})`;

export const tokenMs = (token: DurationToken, timeScale = 1) =>
  Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * timeScale);

/** The farther of the two edges' travel between two sizes, px. */
export function boxTravel(from: BoxSize, to: BoxSize): number {
  return Math.max(Math.abs(to.w - from.w), Math.abs(to.h - from.h));
}

/** The box's move: its clock from its travel, times the slow motion. */
export function resizeMs(travel: number, timeScale = 1): number {
  return tokenMs(durationStepForDistance(travel), timeScale);
}

/** Rows for a textarea that takes the place of `textHeight` px of text. */
export function rowsFor(textHeight: number, lineHeight: number): number {
  if (!(lineHeight > 0)) {
    return 1;
  }
  return Math.max(1, Math.round(textHeight / lineHeight));
}

/** The words a rejected save shows: the error's message, a string, or the fallback. */
export function failureText(reason: unknown, fallback: string): string {
  if (reason instanceof Error && reason.message) {
    return reason.message;
  }
  if (typeof reason === 'string' && reason) {
    return reason;
  }
  return fallback;
}

export interface EditSwapOptions {
  /** The box both faces share; it holds `from` and moves to the new face's size. */
  box: HTMLElement;
  /** The face leaving (absolutely placed), or null. */
  out: HTMLElement | null;
  /** The part of the arriving face that fades in. */
  in: HTMLElement;
  /** The box's size before the change (its live size, mid-move included). */
  from: BoxSize;
  /** Marks that snap in as the face arrives: the save and cancel buttons. */
  marks?: HTMLElement[];
  timeScale: number;
  reduced: boolean;
}

export interface EditSwap {
  swap: ContentSwap;
  move: Animation | null;
  marks: Animation[];
}

/** The swap in place: the box moves to the new face's size as a layout move, the new face fades in
    once it lands (`playContentSwap`, distance 0), and marks snap in with it. Reduced: a snap. */
export function playEditSwap({
  box,
  out,
  in: incoming,
  from,
  marks = [],
  timeScale,
  reduced,
}: EditSwapOptions): EditSwap {
  const to = { w: box.offsetWidth, h: box.offsetHeight };
  const travel = boxTravel(from, to);
  let move: Animation | null = null;
  if (
    !reduced &&
    travel >= INLINE_EDIT_MOTION.minTravel &&
    typeof box.animate === 'function'
  ) {
    move = animateLayout(
      box,
      box,
      [
        { width: `${from.w}px`, height: `${from.h}px` },
        { width: `${to.w}px`, height: `${to.h}px` },
      ],
      {
        ms: resizeMs(travel, timeScale),
        easing: bezier('standard-productive'),
        reason: 'inline-edit',
        reduced,
      }
    ).animation;
  }
  const swap = playContentSwap({
    out,
    in: incoming,
    axis: 'x',
    direction: 1,
    distance: 0,
    timeScale,
    reduced,
  });
  const snaps: Animation[] = [];
  if (!reduced) {
    const snapMs = tokenMs(SNAP.mark.in, timeScale);
    const total = swap.wait + snapMs;
    const at = swap.wait / total;
    for (const m of marks) {
      // Hidden through the wait, then opaque at half size and up to full.
      snaps.push(
        m.animate(
          [
            { opacity: 0, scale: `${SNAP.mark.from}`, offset: 0 },
            { opacity: 0, scale: `${SNAP.mark.from}`, offset: at },
            {
              opacity: 1,
              scale: `${SNAP.mark.from}`,
              offset: at,
              easing: bezier(SNAP.mark.ease),
            },
            { opacity: 1, scale: '1', offset: 1 },
          ],
          { duration: total }
        )
      );
    }
  }
  return { swap, move, marks: snaps };
}
