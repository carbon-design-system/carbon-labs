/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * Timing by size: a free-floating surface whose longer side is over
 * `SURFACE_RULE_OVER_PX` takes the surface rule's timing (Axial's default
 * rule, duration by travel); a smaller one keeps the floating rule.
 *
 * The shape stays the floating profile's (its scales, exit, content axis,
 * fades); only the clocks and curves change.
 * ========================================================================== */

import { SNAP, type SnapProfile } from '@carbon-labs/v12-motion';

/** px: over this, on its longer side, a free-floating surface times as a surface. */
export const SURFACE_RULE_OVER_PX = 320;

/** The box `el` lays out at, px. A surface hidden with `hidden` is shown for
 *  the read and hidden again, before any paint. */
export function surfaceBox(el: HTMLElement | null): { w: number; h: number } {
  if (!el) {
    return { w: 0, h: 0 };
  }
  const hide = el.hidden && el.offsetWidth === 0;
  if (hide) {
    el.hidden = false;
  }
  const box = { w: el.offsetWidth, h: el.offsetHeight };
  if (hide) {
    el.hidden = true;
  }
  return box;
}

/** Whether a surface of `w` × `h` px takes the surface rule's timing. */
export function timesAsSurface({ w, h }: { w: number; h: number }): boolean {
  return Math.max(w, h) > SURFACE_RULE_OVER_PX;
}

/** `floating` as played on `el`: unchanged up to the line; over it, on the surface
 *  rule's clocks, worked out on the element from the floating shape's start scales. */
export function floatingOrSurface(
  el: HTMLElement | null,
  floating: SnapProfile
): SnapProfile {
  if (!timesAsSurface(surfaceBox(el))) {
    return floating;
  }
  // The content's own clocks go too: the snap's defaults follow the new ones.
  const { contentIn: _in, contentOut: _out, ...shape } = floating;
  const surface: SnapProfile = SNAP.surface;
  return {
    ...shape,
    in: surface.in,
    out: surface.out,
    ease: surface.ease,
    exitEase: surface.exitEase,
    timing: 'axial',
    axial: surface.axial ?? 'default',
  };
}
