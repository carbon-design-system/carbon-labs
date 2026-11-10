/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The page's scroll lock — held by a page-wide layer (a modal) while it is up
 * ============================================================================
 *
 * One lock for the page, however many hold it (nested modals): `<html>`'s
 * overflow is hidden and the native scrollbar's width padded at the end, so
 * nothing shifts; it is released when the last holder lets go.
 *
 * The window scroller (`<WindowScroller />`) stands down while it is held.
 * Its pill sits under the layer, but it claims presses in its strip by
 * position, from a window listener (motion-core's scroller), so a press on a
 * modal's overlay near the right edge would be taken as a scrollbar press:
 * the page behind would scroll and the press never reach the modal.
 * ========================================================================== */

let holds = 0;
let saved: { overflow: string; padding: string } | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

/** Locks the page's scroll; returns the release (safe to call more than once). */
export function lockPageScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }
  if (holds++ === 0) {
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    saved = {
      overflow: html.style.overflow,
      padding: html.style.paddingInlineEnd,
    };
    html.style.overflow = 'hidden';
    if (gap > 0) {
      html.style.paddingInlineEnd = `${gap}px`;
    }
    notify();
  }
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    if (--holds > 0) {
      return;
    }
    const html = document.documentElement;
    html.style.overflow = saved?.overflow ?? '';
    html.style.paddingInlineEnd = saved?.padding ?? '';
    saved = null;
    notify();
  };
}

/** Whether something holds the page's scroll lock. */
export const isPageScrollLocked = () => holds > 0;

/** Called when the lock is taken or released (useSyncExternalStore's subscribe). */
export function subscribePageScrollLock(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
