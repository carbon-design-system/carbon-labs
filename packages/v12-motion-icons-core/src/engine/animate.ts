/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A small rAF tween with motion's `animate(from, to, options)` call shape, so
 * icon specs written against motion (`tween`, the status layer's plan, a
 * spec's own `animate` for a ring or a spinner) port by changing one import.
 * It replaces motion in the frame engine (refactor stage 1): motion's
 * `animate` is ~20 kB gz for the one call shape the icons use.
 *
 * One shared frame loop drives every running tween (one rAF for a page of
 * icons, as motion's frameloop), and every other frame-driven thing in the
 * package with it: the per-frame work (`onFrame`: the ink's colour while
 * its fill transitions) and the
 * one-off frame callbacks (`nextFrame`: a hover checked on the next
 * layout). However many icons, a page
 * gets one rAF callback a frame from the package, and none while nothing
 * moves. The clock is injectable (`setScheduler`) so
 * tests and the parity harness can step frames deterministically; nothing
 * touches `window` or `performance` at import, so the module is SSR-safe.
 *
 * Motion's semantics, matched so the two engines paint the same frames
 * (packages/motion-icons-core/test checks it frame by frame):
 *  - time is motion's synced clock: inside a frame, the frame's timestamp;
 *    outside, one `performance.now()` per synchronous task (cached until
 *    the next microtask), so tweens started together start together;
 *  - the start time is the call time; each frame calls `onUpdate` with the
 *    eased value at the whole-millisecond-rounded (frame time − start);
 *  - cubic-bezier eases are solved as motion solves them (12-step bisection);
 *  - `onComplete` runs once, after the frame that painted the final value
 *    (a microtask after the frame's updates, before the next frame);
 *  - `repeat: Infinity` loops (the spinner), `ease: 'linear'` or a
 *    cubic-bezier tuple or an easing function;
 *  - `stop()` commits the value at that instant (one last `onUpdate`) and
 *    never completes.
 */

export type Bezier = readonly [number, number, number, number];
export type Easing = Bezier | ((t: number) => number) | 'linear';

export interface AnimateOptions {
  /** Seconds, as motion. */
  duration: number;
  ease?: Easing;
  repeat?: number;
  onUpdate?: (v: number) => void;
  onComplete?: () => void;
}

/** What a running tween returns (motion's AnimationPlaybackControls, as far as the engine uses it). */
export interface Playback {
  stop(): void;
  /** Hold the tween where it is (no frames) until `resume()`: the engine's own tweens (an icon off screen). */
  pause?(): void;
  /** Carry on from where `pause()` held it. */
  resume?(): void;
}

export interface Scheduler {
  now(): number;
  request(cb: (t: number) => void): unknown;
  cancel(handle: unknown): void;
}

const browserScheduler: Scheduler = {
  now: () =>
    typeof performance !== 'undefined' ? performance.now() : Date.now(),
  request: (cb) =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(cb)
      : setTimeout(() => cb(Date.now()), 16),
  cancel: (h) =>
    typeof cancelAnimationFrame === 'function'
      ? cancelAnimationFrame(h as number)
      : clearTimeout(h as ReturnType<typeof setTimeout>),
};

let scheduler: Scheduler = browserScheduler;
/**
 * Swap the clock (tests, the parity harness, a frozen-clock check in a real
 * browser). `null` restores rAF + performance.now. A frame already requested
 * moves to the new clock; tweens started on the old clock hold until their
 * start time comes round on the new one.
 */
export function setScheduler(s: Scheduler | null) {
  if (handle !== null) {
    scheduler.cancel(handle);
  }
  handle = null;
  scheduler = s ?? browserScheduler;
  synced = undefined;
  if (wanted()) {
    handle = scheduler.request(tick);
  }
}

// ── Synced time (motion's `time.now()`) ──────────────────────────────────────

let synced: number | undefined;
let frameTime: number | undefined;
const clearSynced = () => {
  synced = undefined;
};
/** The engine's "now": the frame timestamp while a frame runs, else one reading per synchronous task. */
export function now(): number {
  if (synced === undefined) {
    synced = frameTime ?? scheduler.now();
    queueTask(clearSynced);
  }
  return synced;
}

/**
 * A cubic-bezier easing solved as motion solves it (motion-utils
 * cubic-bezier: bisection to 1e-7 or 12 steps, whichever first), so a tween
 * here lands on the same value as the React package's motion tween, frame
 * for frame. (Its 12-step cap is ~2e-4 off the exact curve near the ends,
 * well under a hundredth of a pixel on a 32px icon.)
 */
const calc = (t: number, a1: number, a2: number) =>
  (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
export function tweenBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  if (x1 === y1 && x2 === y2) {
    return (t) => t;
  }
  const tForX = (x: number) => {
    let [lo, hi, t, cx, i] = [0, 1, 0, 0, 0];
    do {
      t = lo + (hi - lo) / 2;
      cx = calc(t, x1, x2) - x;
      if (cx > 0) {
        hi = t;
      } else {
        lo = t;
      }
    } while (Math.abs(cx) > 1e-7 && ++i < 12);
    return t;
  };
  return (t) => (t === 0 || t === 1 ? t : calc(tForX(t), y1, y2));
}

const bezierCache = new Map<string, (t: number) => number>();
export function easeFn(e: Easing | undefined): (t: number) => number {
  if (!e || e === 'linear') {
    return (t) => t;
  }
  if (typeof e === 'function') {
    return e;
  }
  const [x1, y1, x2, y2] = e;
  if (x1 === y1 && x2 === y2) {
    return (t) => t;
  }
  const key = e.join();
  let fn = bezierCache.get(key);
  if (!fn) {
    bezierCache.set(key, (fn = tweenBezier(x1, y1, x2, y2)));
  }
  return fn;
}

interface Running {
  start: number;
  ms: number;
  from: number;
  to: number;
  ease: (t: number) => number;
  repeat: number;
  o: AnimateOptions;
  done: boolean;
  /** While paused: how far in it was (ms). */
  held?: number;
}

const running = new Set<Running>();
/** Per-frame work that isn't a tween (onFrame): run each frame after the tweens' updates. */
const everyFrame = new Set<(time: number) => void>();
/** One-off callbacks for the next frame (nextFrame): run once, at the start of the frame after they were asked for. */
let once = new Set<(time: number) => void>();
let handle: unknown = null;
const wanted = () => running.size > 0 || everyFrame.size > 0 || once.size > 0;

/** A running tween's value at `now`, and whether it has finished. */
function sample(r: Running, now: number): [number, boolean] {
  // Whole milliseconds, as motion rounds its JS animations' current time (keeps the two engines frame-identical).
  let u = r.ms > 0 ? Math.max(0, Math.round(now - r.start)) / r.ms : 1;
  let finished = false;
  if (u >= r.repeat + 1) {
    finished = true;
    u = 1;
  } else if (r.repeat > 0) {
    u %= 1;
  }
  return [finished ? r.to : r.from + (r.to - r.from) * r.ease(u), finished];
}

/** True from a frame's pass until the next task: the pass has run and the frame may not have painted yet. */
let passed = false;

/**
 * Whether this frame's pass of the shared loop has run and the frame may not
 * have painted yet (from the pass until the next task). Work asked for now
 * with `nextFrame` would only show a frame late.
 */
export function framePassed(): boolean {
  return passed;
}

function tick() {
  handle = null;
  if (!passed) {
    passed = true;
    // A task queued in a frame's callbacks runs after that frame has painted.
    setTimeout(() => {
      passed = false;
    }, 0);
  }
  // As motion's frameloop: the frame's timestamp is read when the frame starts (not the rAF argument).
  const t = scheduler.now();
  frameTime = t;
  const finished: Running[] = [];
  // This frame's one-off callbacks (any asked for while they run are the next frame's).
  const due = once;
  if (due.size) {
    once = new Set();
  }
  try {
    for (const cb of due) {
      cb(t);
    }
    for (const r of [...running]) {
      if (r.done) {
        continue;
      }
      const [v, end] = sample(r, t);
      r.o.onUpdate?.(v);
      if (end) {
        r.done = true;
        running.delete(r);
        finished.push(r);
      }
    }
    // Then the per-frame work (a goal followed, the frame's paint gathered up), on the same frame and clock.
    for (const cb of everyFrame) {
      cb(t);
    }
  } finally {
    frameTime = undefined;
  }
  // As motion: a tween that reached its end completes after the frame's updates, before the next frame.
  if (finished.length) {
    queueTask(() => finished.forEach((r) => r.o.onComplete?.()));
  }
  if (wanted() && handle === null) {
    handle = scheduler.request(tick);
  }
}

const queueTask = (fn: () => void) =>
  typeof queueMicrotask === 'function'
    ? queueMicrotask(fn)
    : Promise.resolve().then(fn);

export function animate(from: number, to: number, o: AnimateOptions): Playback {
  const r: Running = {
    start: now(),
    ms: Math.max(0, o.duration * 1000),
    from,
    to,
    ease: easeFn(o.ease),
    repeat: o.repeat ?? 0,
    o,
    done: false,
  };
  running.add(r);
  if (handle === null) {
    handle = scheduler.request(tick);
  }
  const idle = () => {
    if (!wanted() && handle !== null) {
      scheduler.cancel(handle);
      handle = null;
    }
  };
  return {
    stop() {
      if (r.done) {
        return;
      }
      // As motion: stopping commits the value at this instant (an interruption reverses from exactly here).
      r.o.onUpdate?.(
        sample(r, r.held !== undefined ? r.start + r.held : now())[0]
      );
      r.done = true;
      running.delete(r);
      idle();
    },
    pause() {
      if (r.done || r.held !== undefined) {
        return;
      }
      r.held = now() - r.start;
      running.delete(r);
      idle();
    },
    resume() {
      if (r.done || r.held === undefined) {
        return;
      }
      r.start = now() - r.held;
      r.held = undefined;
      running.add(r);
      if (handle === null) {
        handle = scheduler.request(tick);
      }
    },
  };
}

/**
 * Run `cb` on every frame of the shared loop (after that frame's tween
 * updates, with its time) until the returned stop is called: for work that
 * follows something every frame (the ink's colour as its fill transitions). It keeps
 * the loop running while registered, so stop it once there is nothing to do.
 */
export function onFrame(cb: (time: number) => void): () => void {
  everyFrame.add(cb);
  if (handle === null) {
    handle = scheduler.request(tick);
  }
  return () => {
    if (!everyFrame.delete(cb) || wanted() || handle === null) {
      return;
    }
    scheduler.cancel(handle);
    handle = null;
  };
}

/**
 * Run `cb` once on the next frame of the shared loop (rAF, or the scheduler
 * a test set), with that frame's time, before its tweens' updates: one frame
 * request for every caller, not one each. Returns its cancel.
 */
export function nextFrame(cb: (time: number) => void): () => void {
  // Its own wrapper, so the same function asked for twice runs twice, and cancels one.
  const one = (t: number) => cb(t);
  once.add(one);
  if (handle === null) {
    handle = scheduler.request(tick);
  }
  return () => {
    if (!once.delete(one) || wanted() || handle === null) {
      return;
    }
    scheduler.cancel(handle);
    handle = null;
  };
}

/**
 * A scheduler for tests and the parity harness: time only moves when
 * `advance(ms)` is called, one frame per `step` ms.
 */
export function manualScheduler(step = 1000 / 60) {
  let t = 0;
  let queue: ((t: number) => void)[] = [];
  const s: Scheduler & {
    advance(ms: number): void;
    time(): number;
    pending(): number;
  } = {
    now: () => t,
    request: (cb) => {
      queue.push(cb);
      return cb;
    },
    cancel: (h) => {
      queue = queue.filter((cb) => cb !== h);
    },
    advance(ms: number) {
      const end = t + ms;
      while (t < end - 1e-9) {
        t = Math.min(end, t + step);
        const q = queue;
        queue = [];
        q.forEach((cb) => cb(t));
      }
    },
    time: () => t,
    /** How many frame requests wait for the next frame. */
    pending: () => queue.length,
  };
  return s;
}
