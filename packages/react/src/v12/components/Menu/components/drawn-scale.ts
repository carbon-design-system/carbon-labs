/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * A portalled surface at its trigger's drawn scale.
 * ============================================================================
 *
 * A floating surface (a menu, a listbox) is portalled to the page, out of
 * whatever its trigger sits in. A trigger drawn scaled (a screen shown
 * smaller than its own width, as a recipe's frame or a lab playground is)
 * would have its surface at full size beside it: text and rows larger than
 * the trigger's, its 10rem floor wider than the field. The surface takes the trigger's scale as its CSS
 * `zoom`, so everything in it is drawn at that scale; its own lengths (left,
 * top, width) are then in zoomed px, so placement, worked out in client px,
 * is written divided by the scale (`cssPx`). The snap reads the surface's
 * own box, so it plays as at 1x. At 1x there is no zoom.
 * ========================================================================== */

/** The scale `anchor` is drawn at (its client width over its layout width); 1 when there's none or it's within half a percent of 1. */
export function drawnScale(anchor: Element | null | undefined): number {
  if (!(anchor instanceof HTMLElement) || anchor.offsetWidth <= 0) {
    return 1;
  }
  const k = anchor.getBoundingClientRect().width / anchor.offsetWidth;
  return Number.isFinite(k) && k > 0 && Math.abs(k - 1) >= 0.005 ? k : 1;
}

/** Sets `el`'s zoom to `scale` (none at 1). */
export function applyDrawnScale(el: HTMLElement, scale: number): void {
  el.style.zoom = scale === 1 ? '' : String(scale);
}

/** A client-px length as `el`'s own CSS px under `scale`. */
export const cssPx = (clientPx: number, scale: number): string =>
  `${clientPx / scale}px`;
