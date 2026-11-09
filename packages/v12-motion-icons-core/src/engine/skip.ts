/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Skip: every animation jumps to its end, as motion's
 * `MotionGlobalConfig.skipAnimations` means it. Not
 * reduced motion, which draws the still drawing: under skip the icons still
 * change (a hover reaches its hovered drawing, a toggle its new state, a
 * status shows), they just don't move getting there.
 *
 *  - A tween started while skipping lands on its end on the next frame (its
 *    last onUpdate, then onComplete), a repeating one included.
 *  - Skip turning on lands every tween in flight on its end at once, after
 *    the engines that keep more than tweens (a loop, an action's compositor
 *    turn, the pending spinner) have stopped theirs at rest (`onSkipChange`).
 *  - Loops don't loop, actions jump to rest and hand off at once (playAction
 *    plays nothing), the pending spinner holds.
 *
 * The sources are the page's (per copy of the core), and any one skipping
 * skips: the `/motion` adapter's (motion's skipAnimations /
 * instantAnimations) and a design system's motion level
 * (`followMotionLevel`) can both be on one page.
 *
 * The engine's modules take their tween from here rather than from
 * animate.ts, so the clock (animate.ts) stays as it is.
 */
import {
  animate as tween,
  type AnimateOptions,
  type Playback,
} from './animate';

export interface SkipSource {
  get(): boolean;
  subscribe?(onChange: () => void): () => void;
}

const sources = new Set<SkipSource>();
let was = false;
const listeners = new Set<() => void>();

/** Whether animations jump to their end now. */
export function skipping(): boolean {
  for (const s of sources) {
    if (s.get() === true) {
      return true;
    }
  }
  return false;
}

/**
 * Add a skip source; returns its removal. When skip turns on (this source or
 * another), every animation in flight lands on its end.
 */
export function addSkipSource(s: SkipSource): () => void {
  sources.add(s);
  const unsubscribe = s.subscribe?.(changed);
  changed();
  return () => {
    if (!sources.delete(s)) {
      return;
    }
    unsubscribe?.();
    changed();
  };
}

/** Call `cb` when skip turns on or off; returns the unsubscribe. */
export function onSkipChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

interface Live {
  to: number;
  o: AnimateOptions;
  p: Playback;
}
const live = new Set<Live>();

function changed(): void {
  const now = skipping();
  if (now === was) {
    return;
  }
  was = now;
  [...listeners].forEach((l) => l());
  if (!now) {
    return;
  }
  // What the engines left in flight lands on its end: its last value, and its completion a microtask later.
  for (const r of [...live]) {
    live.delete(r);
    r.p.stop();
    r.o.onUpdate?.(r.to);
    if (r.o.onComplete) {
      queueMicrotask(r.o.onComplete);
    }
  }
}

/** The engine's tween (animate.ts), skippable: while skipping, it lands on `to` on the next frame. */
export function animate(from: number, to: number, o: AnimateOptions): Playback {
  if (skipping()) {
    return tween(from, to, { ...o, duration: 0, repeat: 0 });
  }
  // Its own record, made before the tween starts: a tween can complete inside the call (a test's instant clock).
  const r = { to, o, done: false } as Live & { done: boolean };
  r.p = tween(from, to, {
    ...o,
    onComplete: () => {
      r.done = true;
      live.delete(r);
      o.onComplete?.();
    },
  });
  if (!r.done) {
    live.add(r);
  }
  return {
    stop() {
      live.delete(r);
      r.p.stop();
    },
    pause: () => r.p.pause?.(),
    resume: () => r.p.resume?.(),
  };
}
