/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { TooltipTriggerProps } from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';

/* ============================================================================
 * Stillness under a still pointer — no tooltip opens until the pointer moves
 * ============================================================================
 *
 * A tooltip that opens because something arrived under a pointer that was
 * resting (a contextual bar over the row just pressed, a panel, a scroll)
 * is the rollover's stale hover again: nothing there asked for it. The
 * rollover and the contextual bar already hold their hover until the pointer
 * moves; the tooltip trigger does the same.
 *
 *   enter    a `pointerenter` at the place the pointer last was, with no
 *            movement of its own (the browser's synthetic one, after the
 *            layout under a resting pointer changed), is held, not acted on
 *   open     on the pointer's next move of more than 0.5px while it is still
 *            over the trigger, the trigger is asked again, from there
 *   cancel   leaving, a press, or unmounting
 *
 * A real enter always arrives at a new place (the browser fires it ahead of
 * that move's `pointermove`), so a normal hover opens as usual. Touch has no
 * resting pointer. Where the pointer has not been seen yet, nothing is held.
 * ========================================================================== */

interface Pt {
  x: number;
  y: number;
}

/** Moved no further than this: the same place (the rollover's own 0.5px). */
const SAME_PLACE = 0.5;

let last: Pt | null = null;
let installed = false;

/** The last real pointer position (move or press), tracked once for the page. */
function track() {
  if (installed || typeof window === 'undefined') {
    return;
  }
  installed = true;
  const set = (e: PointerEvent) => {
    last = { x: e.clientX, y: e.clientY };
  };
  window.addEventListener('pointermove', set, { capture: true, passive: true });
  window.addEventListener('pointerdown', set, { capture: true, passive: true });
}

interface EnterLike {
  clientX: number;
  clientY: number;
  pointerType?: string;
  currentTarget: EventTarget;
}

/** Whether this enter came with no movement of the pointer. */
export function enterIsStill(e: EnterLike): boolean {
  if (e.pointerType === 'touch' || !last) {
    return false;
  }
  return Math.hypot(e.clientX - last.x, e.clientY - last.y) <= SAME_PLACE;
}

export interface StillGate {
  /** A `pointerenter`: `open` now, or on the pointer's next move if it is still. */
  enter(
    e: EnterLike,
    open: (at: { clientX: number; clientY: number }) => void
  ): void;
  /** The pointer left: nothing waits. */
  cancel(): void;
}

export function useStillGate(): StillGate {
  const off = useRef<(() => void) | null>(null);
  const cancel = useCallback(() => {
    off.current?.();
    off.current = null;
  }, []);
  useEffect(() => {
    track();
    return cancel;
  }, [cancel]);
  const enter = useCallback<StillGate['enter']>(
    (e, open) => {
      track();
      cancel();
      if (!enterIsStill(e)) {
        return open(e);
      }
      const el = e.currentTarget as Element;
      const at = { x: e.clientX, y: e.clientY };
      const move = (m: PointerEvent) => {
        if (Math.hypot(m.clientX - at.x, m.clientY - at.y) <= SAME_PLACE) {
          return;
        }
        cancel();
        if (el.isConnected && el.matches(':hover')) {
          open(m);
        }
      };
      window.addEventListener('pointermove', move, {
        capture: true,
        passive: true,
      });
      window.addEventListener('pointerdown', cancel, {
        capture: true,
        passive: true,
      });
      off.current = () => {
        window.removeEventListener('pointermove', move, { capture: true });
        window.removeEventListener('pointerdown', cancel, { capture: true });
      };
    },
    [cancel]
  );
  return { enter, cancel };
}

/**
 * A trigger's pointer handlers with the gate in front of them: use these in
 * place of `trigger.onPointerEnter` and `trigger.onPointerLeave`.
 */
export function useStillTrigger(
  trigger: Pick<TooltipTriggerProps, 'onPointerEnter' | 'onPointerLeave'>
) {
  const gate = useStillGate();
  const latest = useLatest(trigger);
  return {
    onPointerEnter: (e: Parameters<TooltipTriggerProps['onPointerEnter']>[0]) =>
      gate.enter(e, (at) => latest.current.onPointerEnter(at as never)),
    onPointerLeave: (
      e: Parameters<TooltipTriggerProps['onPointerLeave']>[0]
    ) => {
      gate.cancel();
      latest.current.onPointerLeave(e);
    },
  };
}
