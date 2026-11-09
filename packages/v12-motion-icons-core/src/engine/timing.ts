/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The house timings (moved from the React package's utils/frameIcon.tsx,
 * refactor stage 1; frameIcon re-exports them unchanged).
 */
import { motionTokens, toEasing } from '../tokens';

/** A tween's timing: seconds, and a Carbon easing as a cubic-bezier tuple (the React package's type, re-exported unchanged). */
export type TweenOpts = { duration: number; ease: ReturnType<typeof toEasing> };
/**
 * What the core engine accepts as a timing: TweenOpts, a readonly bezier
 * tuple, `'linear'` or an easing function (the spec format stage 2's codemod
 * writes; a mutable tuple assigns to it).
 */
export type TweenTiming = {
  duration: number;
  ease:
    | readonly [number, number, number, number]
    | 'linear'
    | ((t: number) => number);
};

export const HOVER = {
  duration: motionTokens.duration.moderate01 / 1000,
  ease: toEasing(motionTokens.easing.entrance),
};
/** Hover-leave runs one token faster than the enter, on the exit ease. */
export const HOVER_OUT = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: toEasing(motionTokens.easing.exit),
};
/** A custom hover timing's leave: the same curve, sped up as fast02/moderate01. */
export const leaveOf = <E = TweenOpts['ease']>(t: {
  duration: number;
  ease: E;
}) => ({
  duration:
    (t.duration * motionTokens.duration.fast02) /
    motionTokens.duration.moderate01,
  ease: t.ease,
});
/** Toggle into the "on" state, and back out one token faster (house rule). */
export const TOGGLE_IN = {
  duration: motionTokens.duration.moderate01 / 1000,
  ease: toEasing(motionTokens.easing.entrance),
};
export const TOGGLE_OUT = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: toEasing(motionTokens.easing.exit),
};
/** A looping state's weight eases in over this share of its cycle, on Carbon's standard ease (frame.ts: Loop). */
export const LOOP_IN = {
  share: 1 / 2,
  ease: toEasing(motionTokens.easing.standard),
};
/**
 * The press (engine/press.ts): the pair to change together. In: at once (duration 0: the full press lands on the
 * next frame); give it `motionTokens.duration.fast01 / 1000` to try an animated press-in. Out:
 * fast-02 on the exit ease, no overshoot.
 */
export const PRESS_IN = {
  duration: 0,
  ease: toEasing(motionTokens.easing.entrance),
};
export const PRESS_OUT = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: toEasing(motionTokens.easing.exit),
};
