/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState } from 'react';
import { createLoadingGate, type LoadingView } from './gate';

/* ============================================================================
 * useLoadingGate — the loading gate (gate.ts) for a component or a page.
 *
 *   active     whether the work is running: true starts the gate, false
 *              finishes it
 *   show       whether the loader shows now: false for the first `showAfter`
 *              ms, then true until the work has ended and the loader has
 *              shown at least `minVisible` ms
 *   settled    the gate holds nothing back: no work is running and no loader
 *              is held, so the result can show
 *   timeScale  multiplies both timings (a lab's slow motion, which slows its
 *              pretend work too). Reduced motion doesn't change them
 *
 * With both timings 0 (the defaults), `show` is `active` and `settled` is
 * `!active`, in the same render: v11's behaviour, with no extra frame.
 * ========================================================================== */

export interface LoadingGateTimings {
  /** ms of work before the loader shows. Default 0. Patterns: 300 (`LOADING_GATE.showAfterMs`). */
  showAfter?: number;
  /** ms the loader stays once shown. Default 0. Patterns: 500 (`LOADING_GATE.minVisibleMs`). */
  minVisible?: number;
  /** Multiplies both (a lab's slow motion). Default 1. */
  timeScale?: number;
}

export interface LoadingGateState {
  /** Show the loader now. */
  show: boolean;
  /** Nothing is running or held: the result can show. */
  settled: boolean;
}

export function useLoadingGate(
  active: boolean,
  { showAfter = 0, minVisible = 0, timeScale = 1 }: LoadingGateTimings = {}
): LoadingGateState {
  const showAfterMs = Math.max(0, showAfter) * timeScale;
  const minVisibleMs = Math.max(0, minVisible) * timeScale;
  const ungated = showAfterMs <= 0 && minVisibleMs <= 0;
  const [view, setView] = useState<LoadingView>(() =>
    active && showAfterMs <= 0 ? 'loader' : 'nothing'
  );
  const [gate] = useState(() =>
    createLoadingGate({
      showAfterMs,
      minVisibleMs,
      onChange: (v) => setView(v),
    })
  );

  // The timings as they are now, before the gate acts on a change of `active`.
  useLayoutEffect(
    () => gate.set({ showAfterMs, minVisibleMs }),
    [gate, showAfterMs, minVisibleMs]
  );
  useLayoutEffect(() => {
    if (active) {
      gate.start();
    } else {
      gate.finish();
    }
  }, [gate, active]);
  // Unmounting abandons the work (and a strict-mode remount starts it afresh).
  useLayoutEffect(() => () => gate.cancel(), [gate]);

  if (ungated) {
    return { show: active, settled: !active };
  }
  return { show: view === 'loader', settled: !active && view !== 'loader' };
}
