/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shared "kick" displacement helper for the slash on/off toggle icons
 * (FlashOffToggle, MicrophoneOffToggle, NotificationOffToggle, ViewOffToggle,
 * outline and filled): a small reactive nudge — delay,
 * then ease out to `magnitude`, then ease back to 0 — timed proportionally to
 * the slash draw-in duration. See any of those files' header comments for the
 * full derivation ("same system as ...").
 */

export interface KickTiming {
  delay: number;
  outDuration: number;
  backDuration: number;
  totalDuration: number;
}

/* @__NO_SIDE_EFFECTS__ */
export function makeKickTiming(slashInDuration: number): KickTiming {
  const delay = slashInDuration * 0.25;
  const outDuration = slashInDuration * 0.5;
  const backDuration = slashInDuration * 0.5;
  return {
    delay,
    outDuration,
    backDuration,
    totalDuration: delay + outDuration + backDuration,
  };
}

/**
 * Evaluates the kick displacement at `elapsed` ms. `easeOut`/`easeBack` must
 * be passed explicitly by the caller (rather than reusing another animation's
 * easing function) so a later change to that other easing can't silently
 * retime the kick.
 */
/* @__NO_SIDE_EFFECTS__ */
export function stepKick(
  elapsed: number,
  timing: KickTiming,
  magnitude: number,
  easeOut: (t: number) => number,
  easeBack: (t: number) => number
): number {
  const { delay, outDuration, backDuration, totalDuration } = timing;
  if (elapsed < delay) {
    return 0;
  }
  if (elapsed <= delay + outDuration) {
    return magnitude * easeOut((elapsed - delay) / outDuration);
  }
  if (elapsed <= totalDuration) {
    return (
      magnitude * (1 - easeBack((elapsed - delay - outDuration) / backDuration))
    );
  }
  return 0;
}
