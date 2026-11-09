/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The icons following a design system's graded motion level: carbon-motion's
 * `MotionProvider` (`full | reduced | none`, or `'system'` for the OS
 * setting). Framework-free; React's `<FollowCarbonMotion>` is this for a
 * subtree's resolved level.
 *
 *   level      carbon-motion means                     the icons
 *   full       durations ×1, travel                    animated (even under the OS's reduce: an explicit level wins)
 *   reduced    durations ×0.5, no travel (the OS        still: the still drawing, as under prefers-reduced-motion
 *              setting's default)
 *   none       durations ~0 (floored at 1ms)            skip: every animation jumps to its end (engine/skip.ts)
 *   system     the OS setting                           the OS setting (still under reduce), as with no bridge
 *
 * `reduced` is still, not slower: an icon's hover is travel (its geometry
 * moves), which `reduced` takes away, and the still drawing is how the icons
 * already answer reduced motion. `none` is skip: its 1ms durations are
 * carbon-motion's "instant", and skip is the icons' instant.
 */
import { setReducedMotionSource } from '../engine/env';
import { addSkipSource } from '../engine/skip';

export type MotionLevel = 'full' | 'reduced' | 'none';

/** Where the level comes from: `get()` the resolved level (null or 'system': the OS decides), `subscribe` its changes. */
export interface MotionLevelSource {
  get(): MotionLevel | 'system' | null;
  subscribe?(onChange: () => void): () => void;
}

/** The icons' reduced-motion say for a level: true still, false animated, null the OS setting. */
export const levelStill = (
  level: MotionLevel | 'system' | null
): boolean | null =>
  level === 'reduced'
    ? true
    : level === 'full' || level === 'none'
      ? false
      : null;
/** Whether a level makes the icons' animations jump to their end. */
export const levelSkips = (level: MotionLevel | 'system' | null): boolean =>
  level === 'none';

/**
 * Drive the icons' stillness and skip from `src` (page-wide, for this copy of
 * the core); returns the undo. It takes the reduced-motion source (one at a
 * time) and adds a skip source (beside the `/motion` adapter's).
 */
export function followMotionLevel(src: MotionLevelSource): () => void {
  let tellStill: (() => void) | undefined;
  let tellSkip: (() => void) | undefined;
  const off = src.subscribe?.(() => {
    tellStill?.();
    tellSkip?.();
  });
  setReducedMotionSource({
    get: () => levelStill(src.get()),
    subscribe: (cb) => ((tellStill = cb), () => (tellStill = undefined)),
  });
  const unskip = addSkipSource({
    get: () => levelSkips(src.get()),
    subscribe: (cb) => ((tellSkip = cb), () => (tellSkip = undefined)),
  });
  return () => {
    off?.();
    setReducedMotionSource(null);
    unskip();
  };
}
