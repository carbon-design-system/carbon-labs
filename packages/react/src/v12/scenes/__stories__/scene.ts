/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The scene's state, and the handle the behavior tier drives it through:
// `window.__scene.set({ open: true })` renders the change in the same task,
// so a run can start its frame count on the frame it asked for.

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

/** What a scene changes on its subject. */
export interface SceneState {
  /** The subject is open: shown, expanded or toggled on. */
  open: boolean;
  /** A size, for a subject with sizes (a side panel's). */
  size: string;
  /** The selected index, for a subject with a selection (tabs). */
  index: number;
  /** How many toasts have been asked for. */
  toasts: number;
}

/** The handle on `window`. */
export interface SceneHandle {
  set: (patch: Partial<SceneState>) => SceneState;
  get: () => SceneState;
}

declare global {
  interface Window {
    __scene?: SceneHandle;
  }
}

/**
 * The scene's state, and its handle on `window` while the story is shown.
 *
 * @param {SceneState} initial The first state.
 * @returns {Array} The state and its setter.
 */
export function useScene(initial: SceneState) {
  const [state, setState] = useState(initial);
  const current = useRef(state);
  current.current = state;
  useEffect(() => {
    /**
     * Renders a change in this task, so its first frame is the next.
     *
     * @param {Partial<SceneState>} patch What changes.
     * @returns {SceneState} The state after it.
     */
    function setNow(patch: Partial<SceneState>) {
      flushSync(() => setState((s) => ({ ...s, ...patch })));
      return current.current;
    }
    /**
     * The state now.
     *
     * @returns {SceneState} It.
     */
    function get() {
      return current.current;
    }
    window.__scene = { set: setNow, get };
    return () => {
      delete window.__scene;
    };
  }, []);
  /**
   * Changes the state from the story's own controls.
   *
   * @param {Partial<SceneState>} patch What changes.
   */
  function set(patch: Partial<SceneState>) {
    setState((s) => ({ ...s, ...patch }));
  }
  return [state, set] as const;
}
