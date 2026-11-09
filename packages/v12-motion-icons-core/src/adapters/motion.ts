/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The icons on motion.dev's frameloop. Framework-free; the React package and
 * the web components each wrap it in a `/motion` entry that imports `motion`
 * and connects on import.
 *
 * What it changes, and only this:
 *  - the clock: every frame the engine asks for (its tween's tick, its
 *    per-frame and next-frame work) runs in motion's `render` step, with
 *    motion's frame time, so a page that animates with motion and shows
 *    icons makes one rAF callback a frame, not one for motion plus one for
 *    the icons;
 *  - skip: while `MotionGlobalConfig.skipAnimations` (or
 *    `instantAnimations`) is set, every icon animation jumps to its end, as
 *    motion's own do (engine/skip.ts): a hover lands hovered, a toggle on its
 *    new state, an action at rest with its hand-off status, a loop stops at
 *    rest. Setting or clearing either flag later is seen at once. (The OS's
 *    reduced motion is unchanged: the still drawing.)
 *
 * The clock is whatever `setScheduler(null)` restores (the engine's one
 * shared tick): connecting takes that tick over, disconnecting gives it back.
 *
 * What it doesn't: the tween is still the engine's own (frame for frame what
 * it draws without motion), and the compositor turns (Renew's loop, the
 * pending spinner) stay Web Animations on the document timeline, which is
 * the clock motion's frames are stamped with.
 *
 * It takes motion's exports as an argument rather than importing `motion`,
 * so the core never depends on it and an app can hand over the copy of
 * motion it animates with (two copies of motion are two frameloops).
 */
import { setScheduler, type Scheduler } from '../engine/animate';
import { addSkipSource } from '../engine/skip';

type Process = (data: { timestamp: number }) => void;

/** The parts of `motion` the adapter uses (structural, so the core needs no types from it). */
export interface MotionFrameloop {
  frame: {
    render(process: Process, keepAlive?: boolean, immediate?: boolean): unknown;
  };
  cancelFrame(process: Process): void;
  frameData: { timestamp: number; isProcessing: boolean };
  /** motion's synced clock (`time.now()`); without it, the frame's timestamp or performance.now(). */
  time?: { now(): number };
  MotionGlobalConfig?: {
    skipAnimations?: boolean;
    instantAnimations?: boolean;
  };
}

/** A Scheduler that asks motion's `render` step for each frame. */
export function motionScheduler(m: MotionFrameloop): Scheduler {
  return {
    // As motion's own frameloop driver: inside a frame, the frame's timestamp; outside, motion's synced clock.
    now: () =>
      m.frameData.isProcessing
        ? m.frameData.timestamp
        : m.time
          ? m.time.now()
          : performance.now(),
    request: (cb) => {
      const p: Process = () => cb(m.frameData.timestamp);
      m.frame.render(p);
      return p;
    },
    cancel: (p) => m.cancelFrame(p as Process),
  };
}

type Flags = NonNullable<MotionFrameloop['MotionGlobalConfig']>;
const FLAGS = ['skipAnimations', 'instantAnimations'] as const;

/**
 * Call `onChange` when `obj[key]` is assigned a different value. motion reads
 * its global config as plain fields and fires nothing, so the field becomes
 * an accessor that keeps the value (motion reads it as before). An accessor
 * already there (another copy of this adapter: the web components beside
 * the React package) is kept and chained, not replaced.
 */
function watchField(
  obj: Flags,
  key: (typeof FLAGS)[number],
  onChange: () => void
): void {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  if (d && !d.configurable) {
    return;
  }
  let value = d && !d.get ? d.value : undefined;
  const get = d?.get ? d.get.bind(obj) : () => value;
  const set = d?.set ? d.set.bind(obj) : (v: unknown) => (value = v);
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get,
    set(v) {
      const before = get();
      set(v);
      if (get() !== before) {
        onChange();
      }
    },
  });
}

let connected: (() => void) | undefined;

/**
 * Drive the engine from motion's frameloop and honour motion's
 * skipAnimations / instantAnimations. Returns the disconnect (the engine's
 * own clock again, and no skip).
 * Connecting again replaces the earlier connection.
 */
export function connectMotion(m: MotionFrameloop): () => void {
  connected?.();
  let live = true;
  setScheduler(motionScheduler(m));
  const cfg = m.MotionGlobalConfig;
  let tell: (() => void) | undefined;
  let unskip: (() => void) | undefined;
  if (cfg) {
    for (const k of FLAGS) {
      watchField(cfg, k, () => live && tell?.());
    }
    unskip = addSkipSource({
      get: () => !!(cfg.skipAnimations || cfg.instantAnimations),
      subscribe(onChange) {
        tell = onChange;
        return () => (tell = undefined);
      },
    });
  }
  const disconnect = () => {
    if (!live) {
      return;
    }
    live = false;
    setScheduler(null);
    unskip?.();
    if (connected === disconnect) {
      connected = undefined;
    }
  };
  connected = disconnect;
  return disconnect;
}
