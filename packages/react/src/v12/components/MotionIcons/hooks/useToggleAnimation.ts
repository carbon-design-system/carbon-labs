/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import type React from 'react';
import { useToggleState } from './useToggleState';
import { useHover } from './useHover';

/**
 * Options for useToggleAnimation. Hover (`onEnter`, `onLeave`) and the state
 * change (`onStateChange`) are separate channels: the icons' controller
 * tweens the hover's numbers for one and the state's for the other, so a
 * hover mid-change never cancels the change, and the reverse.
 */
interface UseToggleAnimationOptions<S extends string> {
  /** Ordered list of states the icon cycles through on each toggle. */
  states: readonly S[];
  /** The icon's name, for the warning a value outside `states` gives. */
  name?: string;
  /** Uncontrolled initial state. Defaults to `states[0]` when omitted. */
  initial?: S;
  /** Controlled current state. Drives `currentState` when provided. */
  value?: S;
  /** Called whenever the state transitions. Receives the next state name. */
  onChange?: (next: S) => void;
  /**
   * Called when the hover starts: the pointer enters the icon's frame,
   * keyboard focus lands on it, or `play()` (see useHover). It may return a
   * promise for the end of the hover-in, which `play()` waits on.
   */
  onEnter?: () => unknown;
  /** Called when the hover ends (pointer gone, focus gone, a play done). */
  onLeave?: () => unknown;
  /**
   * When `true`, the hover listeners (pointer and mouse) are not attached and
   * `onEnter`/`onLeave` are never called.
   */
  disabled?: boolean;
  /** The icon's press, bound with the hover (see useHover's `press`). */
  press?: { own?: boolean; force?: boolean };
  /**
   * Called after every committed change of `currentState` (never on mount),
   * whatever caused it: a click in uncontrolled mode, or the parent changing
   * the controlled `value`. Start the toggle transition animation here —
   * not in the click handler — so a controlled icon animates when its prop
   * changes and never animates a change the parent didn't make.
   */
  onStateChange?: (prev: S, next: S) => void;
}

interface UseToggleAnimationResult<S extends string> {
  /** The currently active state name. */
  currentState: S;
  /** Cycles to the next state (or jumps to a specific state when called with an argument). */
  transition: (to?: S) => void;
  /** Ref to attach to the `<svg>` element — used by the hover listener. */
  svgRef: React.RefObject<SVGSVGElement | null>;
  /**
   * Assign the icon's own click/toggle handler here on every render (e.g.
   * `frameClickRef.current = handleToggle`) so clicks that land inside a
   * larger caller-supplied interactive ancestor (e.g. `HeaderGlobalAction`
   * wrapping an `asButton={false}` icon) — but outside the SVG's own
   * rendered box — also trigger it. See `useHover`'s "Interactive frame"
   * doc comment for the full mechanism. Safe to leave unassigned.
   */
  frameClickRef: React.MutableRefObject<
    ((e?: React.MouseEvent) => void) | null
  >;
}

// useLayoutEffect warns during SSR on React 18; nothing runs there anyway.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useToggleAnimation<S extends string>({
  states,
  name,
  initial,
  value,
  onChange,
  onEnter,
  onLeave,
  disabled,
  press,
  onStateChange,
}: UseToggleAnimationOptions<S>): UseToggleAnimationResult<S> {
  const { currentState, transition } = useToggleState({
    states,
    name,
    initial,
    value,
    onChange,
  });

  const onStateChangeRef = useRef(onStateChange);
  // Before the effect below, which reads it, so it sees this render's callback.
  useIsomorphicLayoutEffect(() => {
    onStateChangeRef.current = onStateChange;
  });
  const prevStateRef = useRef(currentState);

  // Layout effect so the transition starts in the same frame as the commit
  // that changed the state — no one-frame flash of the new state's rest pose.
  useIsomorphicLayoutEffect(() => {
    const prev = prevStateRef.current;
    if (prev === currentState) {
      return;
    }
    prevStateRef.current = currentState;
    onStateChangeRef.current?.(prev, currentState);
  }, [currentState]);

  const { ref: svgRef, frameClickRef } = useHover({
    onEnter,
    onLeave,
    disabled,
    press,
  });

  return { currentState, transition, svgRef, frameClickRef };
}
