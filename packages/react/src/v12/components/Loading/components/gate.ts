/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The loading gate: when a loader shows, and how long it stays.
 * Framework-free; the kit's hook
 * is `useLoadingGate` (useLoadingGate.ts), and `Loading` takes it as `delay`
 * and `minDuration`.
 *
 *   gated      `start()`: nothing shows for `showAfterMs`. Work that finishes
 *              inside that window goes straight to its result, and the
 *              loader never shows (a fast save shows only its result)
 *   loader     after `showAfterMs`, the loader shows
 *   held       `finish()` while the loader shows: the result waits until the
 *              loader has been visible `minVisibleMs`, so it never flashes
 *   result     the work is done and the gate holds nothing back
 *   cancel     `cancel()`: back to nothing at once, from any state
 *
 * Patterns ask for 300ms (`moderate-03`) and 500ms (half a loading period);
 * the defaults are 0 and 0, v11's: the loader shows at once and goes at once.
 * Reduced motion doesn't change the gate: it governs flashing, not movement.
 * ========================================================================== */

import { SKELETON_WAVE, motionTokens } from '@carbon-labs/v12-motion';

/** What a gated loader's host shows now. */
export type LoadingView = 'nothing' | 'loader' | 'result';

/** A timer the gate can set and clear (a fake clock in tests). */
export interface GateClock {
  now(): number;
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

export interface LoadingGateOptions {
  /** How long the work runs before the loader shows, ms. Default 0: at once. */
  showAfterMs?: number;
  /** How long the loader stays once shown, ms. Default 0: it goes when the work ends. */
  minVisibleMs?: number;
  /** Called on every change of view, with the result given to `finish`. */
  onChange?: (view: LoadingView, result: unknown) => void;
  /** The clock: `performance.now()` and `setTimeout` by default. */
  clock?: GateClock;
}

export interface LoadingGate {
  /** Work has started. A start while work runs is ignored. */
  start(): void;
  /** Work has ended, with its result (passed on to `onChange`). */
  finish(result?: unknown): void;
  /** Work abandoned: nothing, at once. */
  cancel(): void;
  /** What to show now. */
  readonly view: LoadingView;
  /** Whether work is running (started, not yet finished or cancelled). */
  readonly running: boolean;
  /** Change the timings; they apply from the next start (or the next wait). */
  set(options: Pick<LoadingGateOptions, 'showAfterMs' | 'minVisibleMs'>): void;
  /** Clear every timer. */
  dispose(): void;
}

/**
 * The recommended timings for patterns, read when used: `moderate-03` (300ms)
 * before the loader shows, and half a loading period (the skeleton wave's,
 * 500ms) once it has.
 */
export const LOADING_GATE = {
  /** ms of work before the loader shows: `moderate-03`. */
  get showAfterMs(): number {
    return motionTokens.duration['moderate-03'];
  },
  /** ms the loader stays once shown: half a loading period. */
  get minVisibleMs(): number {
    return SKELETON_WAVE.periodMs / 2;
  },
};

const realClock: GateClock = {
  now: () =>
    typeof performance !== 'undefined' ? performance.now() : Date.now(),
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

export function createLoadingGate(
  options: LoadingGateOptions = {}
): LoadingGate {
  const clock = options.clock ?? realClock;
  let showAfter = Math.max(0, options.showAfterMs ?? 0);
  let minVisible = Math.max(0, options.minVisibleMs ?? 0);
  let view: LoadingView = 'nothing';
  let running = false;
  let shownAt = 0;
  let timer: unknown = null;
  let result: unknown;

  const stopTimer = () => {
    if (timer !== null) {
      clock.clear(timer);
    }
    timer = null;
  };
  const go = (next: LoadingView) => {
    if (next === view) {
      return;
    }
    view = next;
    options.onChange?.(view, result);
  };
  const showLoader = () => {
    timer = null;
    shownAt = clock.now();
    go('loader');
  };

  return {
    start() {
      if (running) {
        return;
      }
      stopTimer();
      running = true;
      result = undefined;
      if (showAfter <= 0) {
        showLoader();
      } else {
        go('nothing');
        timer = clock.set(showLoader, showAfter);
      }
    },
    finish(value?: unknown) {
      if (!running) {
        return;
      }
      running = false;
      result = value;
      stopTimer();
      // Inside the gate: the loader never showed, so the result comes straight away.
      if (view !== 'loader') {
        return go('result');
      }
      const left = minVisible - (clock.now() - shownAt);
      if (left <= 0) {
        return go('result');
      }
      timer = clock.set(() => {
        timer = null;
        go('result');
      }, left);
    },
    cancel() {
      running = false;
      stopTimer();
      result = undefined;
      go('nothing');
    },
    get view() {
      return view;
    },
    get running() {
      return running;
    },
    set(next) {
      if (next.showAfterMs !== undefined) {
        showAfter = Math.max(0, next.showAfterMs);
      }
      if (next.minVisibleMs !== undefined) {
        minVisible = Math.max(0, next.minVisibleMs);
      }
    },
    dispose() {
      stopTimer();
    },
  };
}
