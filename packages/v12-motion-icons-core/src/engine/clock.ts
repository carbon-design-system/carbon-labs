/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The engine's clock and motion preferences, for code that needs to drive
 * them: tests, a parity harness, a frozen-clock check in a real browser, an
 * animation library the page already runs (the `/motion` entries build on
 * this), a design system's motion level.
 *
 * Not part of the icons' main entries: the React package and the web
 * components publish it as their `/clock` subpath, which reaches the same
 * copy of the core their icons run on. (Each package bundles its own copy
 * of the core, so a page with both has two clocks: set each package's.)
 *
 *  - `setScheduler(s)`: the engine's one shared tick (its tweens, `onFrame`,
 *    `nextFrame`) asks `s.request` for each frame, and `s.now()` is its
 *    time; `null` restores requestAnimationFrame and performance.now().
 *  - `manualScheduler(step)`: time moves only when `advance(ms)` is called.
 *  - `setReducedMotionSource(src)`: a second say in whether icons draw still,
 *    beside `prefers-reduced-motion`.
 *  - `addSkipSource(src)`: while any source says so, every animation jumps
 *    to its end (motion's skipAnimations meaning; engine/skip.ts).
 *  - `followMotionLevel(src)`: both, from a design system's graded level
 *    (carbon-motion's `full | reduced | none`; adapters/level.ts).
 */
export {
  setScheduler,
  manualScheduler,
  nextFrame,
  now,
  type Scheduler,
} from './animate';
export {
  setReducedMotionSource,
  prefersReducedMotion,
  onReducedMotionChange,
  type ReducedMotionSource,
} from './env';
export { addSkipSource, skipping, onSkipChange, type SkipSource } from './skip';
export {
  followMotionLevel,
  levelStill,
  levelSkips,
  type MotionLevel,
  type MotionLevelSource,
} from '../adapters/level';
