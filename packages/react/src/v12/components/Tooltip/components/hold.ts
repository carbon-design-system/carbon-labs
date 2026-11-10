/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext } from 'react';

/* ============================================================================
 * The tooltip hold — tooltips inside a surface that is still moving wait
 * until it lands (the side panel's close button, for one)
 * ============================================================================
 *
 * A tooltip is placed against its trigger's box as it is when the tooltip is
 * asked for, and it isn't placed again until a scroll or a resize. A trigger
 * inside a surface that is snapping in (its content arriving 8px back, its
 * clip growing) is measured mid-move: a pointer resting where the panel's
 * close button lands, or the focus the panel moves in on open, put the
 * tooltip up to 8px off the button, where it stayed.
 *
 *   held     while the surface moves, a hover or a focus on a trigger inside
 *            it is noted, not acted on
 *   land     when it lands, each trigger that noted one asks again: still
 *            hovered, its tooltip opens from the pointer; still focused and
 *            focus-visible (the keyboard in use), from the trigger. Measured
 *            then, against the trigger's final box
 *
 * The surface creates one (`createTooltipHold`), holds it as it starts to
 * move and lands it once its motion has finished; it provides it to what it
 * holds (`TooltipHoldContext`). The kit's IconButton reads it.
 * ========================================================================== */

export interface TooltipHold {
  /** The surface is moving: its tooltips wait. */
  held(): boolean;
  /** Called once, when it next lands. Returns an unsubscribe. */
  onLand(cb: () => void): () => void;
}

export interface TooltipHoldControl extends TooltipHold {
  /** It has started to move. */
  hold(): void;
  /** It has landed: the triggers that waited ask again. */
  land(): void;
}

export function createTooltipHold(): TooltipHoldControl {
  let held = false;
  const waiting = new Set<() => void>();
  return {
    held: () => held,
    onLand(cb) {
      waiting.add(cb);
      return () => waiting.delete(cb);
    },
    hold() {
      held = true;
    },
    land() {
      if (!held) {
        return;
      }
      held = false;
      const all = [...waiting];
      waiting.clear();
      all.forEach((cb) => cb());
    },
  };
}

/** The hold of the moving surface a tooltip trigger sits in (none: never held). */
export const TooltipHoldContext = createContext<TooltipHold | null>(null);
