/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import type { SnapSurface } from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';

/* ============================================================================
 * The floating surface's presence, shared by Popover, Menu, the listbox
 * (ListboxSurface), DatePicker's calendar and NotificationsPanel. The motion is the snap surface's
 * (`useSnapSurface`, with the snap's fade standard, `snapFadeFor`); this is
 * only its lifecycle around React:
 *
 *   mount    mounted while open and while it leaves (`useFloatingMount`), so
 *            the exit plays before React drops it
 *   theme    portalled with its trigger's theme, kept while it leaves
 *            (`useKeptTheme`): dropping it mid-exit would repaint the surface in
 *            the page's theme
 *   open     on open, the surface's own `enter` (its snap from its cause);
 *            on close, `leave` (freeze what's on screen), the snap's close,
 *            then `onExited` once it has left — not when it was opened again
 *            first, nor when the effect was torn down (the `gone` guard)
 *   follow   while open it follows its trigger through scrolls and resizes:
 *            every scroll and resize in a frame comes down to ONE `reflow`, on
 *            the next animation frame (scroll events land before the frame's
 *            animation callbacks, so it is placed before that frame paints).
 *            Not once per captured scroll event, a forced layout each
 * ========================================================================== */

/**
 * The snap's close: back toward the origin it opened from. Shown open without a snap in, it has
 * none, so it folds back into its trigger (`source`, the cause the rule gives for no pointer),
 * the far edge travelling, rather than toward its own center from both sides.
 */
export function closeOptions(
  surface: Pick<SnapSurface, 'origin'>,
  source?: () => { x: number; y: number } | null
): { source: { x: number; y: number } } | undefined {
  if (surface.origin()) {
    return undefined;
  }
  const at = source?.();
  return at ? { source: at } : undefined;
}

/** Mounted while open and while it leaves: `exited` (stable) unmounts it. */
export function useFloatingMount(open: boolean): {
  present: boolean;
  exited: () => void;
} {
  const [present, setPresent] = useState(open);
  if (open && !present) {
    setPresent(true);
  }
  const exited = useCallback(() => setPresent(false), []);
  return { present, exited };
}

/** The trigger's theme while open (`live`, undefined when closed), kept while the surface leaves. */
export function useKeptTheme(live: string | null | undefined): string | null {
  const [kept, setKept] = useState<string | null>(null);
  if (live !== undefined && live !== kept) {
    setKept(live);
  }
  return live !== undefined ? live : kept;
}

export interface FloatingFollow {
  /** Re-place it (and its shadow): at most once per frame, however many scrolls and resizes came. */
  reflow: () => void;
  /** An event that isn't the page moving (its own content scrolling). */
  ignore?: (e: Event) => boolean;
}

export interface FloatingPresenceOptions {
  open: boolean;
  /** False: in flow (an inline menu), nothing to open, close or follow. Default true. */
  enabled?: boolean;
  /** Opening: the snap from its cause (`surface.open(…)`), focus, and the rest. */
  enter: () => void;
  /** Closing, before the snap's close: freeze what's on screen. Returning false: nothing leaves (never shown). */
  leave?: () => boolean | void;
  /**
   * Its trigger's center, client px: where it folds back to when it was shown open without a snap
   * in (no origin of its own). Without it, that fold closes toward its own center.
   */
  source?: () => { x: number; y: number } | null;
  /** The close has started (a soft edge to play with it). */
  leaving?: () => void;
  /** It has left (the snap's close resolved true, and this close is still the current one). */
  onExited: () => void;
  /** While open it follows its trigger. */
  follow?: FloatingFollow | null;
}

/**
 * The floating surface's open, close and follow, around its snap surface
 * (`useSnapSurface`). Run it in the surface's body, after `useSnapSurface`.
 */
export function useFloatingPresence(
  surface: SnapSurface,
  o: FloatingPresenceOptions
): void {
  const { open, enabled = true } = o;
  const latest = useLatest(o);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const l = latest.current;
    if (open) {
      l.enter();
      return;
    }
    if (l.leave?.() === false) {
      return;
    }
    let gone = false;
    const done = surface.close(closeOptions(surface, l.source));
    l.leaving?.();
    void done.then((left) => {
      if (left && !gone) {
        latest.current.onExited();
      }
    });
    return () => {
      gone = true;
    };
    // On open / close only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const following = enabled && !!o.follow;
  useEffect(() => {
    if (!open || !following) {
      return;
    }
    let raf = 0;
    const reflow = (e: Event) => {
      if (latest.current.follow?.ignore?.(e)) {
        return;
      }
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = 0;
        latest.current.follow?.reflow();
      });
    };
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow, { capture: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the follow reads through `latest`
  }, [open, following]);
}
