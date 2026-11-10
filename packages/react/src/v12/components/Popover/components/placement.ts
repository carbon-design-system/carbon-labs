/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  normalizeTooltipAlign,
  tooltipBounds,
  tooltipFallbacks,
  tooltipPosition,
  type TooltipAlign,
  type TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import type { SelectionRect } from '@carbon-labs/v12-motion';
import { EDGE, GAP } from '@carbon-labs/v12-motion';

/* ============================================================================
 * Where a Popover goes: v11's twelve alignments (and its deprecated names),
 * `GAP` off the trigger (4px, the family's: the menu's and the tooltip's;
 * no caret); `autoAlign` takes v11's fallback order (the Popover's `flip`) inside the
 * viewport cut down by the trigger's clipping ancestors (floating-ui's
 * default boundary, as the kit's tooltip does). The Menu's `placeOnAnchor`
 * covers the six above / below; a popover also opens beside its trigger.
 * ========================================================================== */

/** v11's Popover alignments. */
export type PopoverAlignment = TooltipAlign;
/** v11's deprecated Popover alignments (`top-left` …), mapped as v11's `mapPopoverAlign`. */
export type PopoverAlignmentDeprecated = TooltipAlignDeprecated;

export const normalizePopoverAlign = (
  a: PopoverAlignment | PopoverAlignmentDeprecated | undefined,
  fallback: PopoverAlignment
): PopoverAlignment => normalizeTooltipAlign(a, fallback);

/** v11's `autoAlignBoundary`: an element (or several), `clippingAncestors`, or a client rect. */
export type PopoverBoundary =
  | Element
  | Element[]
  | 'clippingAncestors'
  | { x: number; y: number; width: number; height: number };

export interface PopoverPlaceOptions {
  /** The trigger's box, client px. */
  anchor: SelectionRect;
  /** The surface's size, px. */
  size: { w: number; h: number };
  align: PopoverAlignment;
  /** Flip to the first of v11's fallbacks that fits the bounds. */
  autoAlign: boolean;
  /** A tab tip: flush on its trigger (no gap), `-start` / `-end` only. */
  tabTip: boolean;
  /** v11's `alignmentAxisOffset`: along the alignment axis, inward from a `-start` / `-end` edge. */
  alignmentAxisOffset?: number;
  /** The bounds to fit, client px (the viewport, or v11's boundary). */
  bounds: SelectionRect;
}

export interface PopoverPlacement {
  left: number;
  top: number;
  /** The alignment it took (after any flip). */
  align: PopoverAlignment;
}

const sideOf = (a: PopoverAlignment) =>
  a.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
const alongOf = (a: PopoverAlignment) =>
  a.split('-')[1] as 'start' | 'end' | undefined;
const vertical = (a: PopoverAlignment) => {
  const s = sideOf(a);
  return s === 'top' || s === 'bottom';
};

/** The tab tip's fallbacks (v11's): below first, or above first, start before end. */
function tabTipFallbacks(align: PopoverAlignment): PopoverAlignment[] {
  const list: PopoverAlignment[] = align.startsWith('bottom')
    ? ['bottom-start', 'bottom-end', 'top-start', 'top-end']
    : ['top-start', 'top-end', 'bottom-start', 'bottom-end'];
  return [align, ...list.filter((a) => a !== align)];
}

/** The surface's top-left for one alignment, before it is kept in view. */
function at(
  o: PopoverPlaceOptions,
  align: PopoverAlignment
): { x: number; y: number } {
  const p = tooltipPosition(
    align,
    o.anchor,
    o.size.w,
    o.size.h,
    o.tabTip ? 0 : GAP
  );
  const along = alongOf(align);
  if (!along) {
    return p;
  }
  const off = o.alignmentAxisOffset ?? 0;
  const inward = along === 'start' ? off : -off;
  return vertical(align)
    ? { x: p.x + inward, y: p.y }
    : { x: p.x, y: p.y + inward };
}

const fits = (
  p: { x: number; y: number },
  size: { w: number; h: number },
  b: SelectionRect
) => p.x >= b.l && p.y >= b.t && p.x + size.w <= b.r && p.y + size.h <= b.b;

/**
 * Where the surface goes. Without `autoAlign` it is placed exactly as asked
 * (v11). With it: the first fallback that fits the bounds (none: the one
 * asked for), then kept `EDGE` inside the viewport along its edge.
 */
export function placePopover(o: PopoverPlaceOptions): PopoverPlacement {
  let align = o.align;
  let p = at(o, align);
  if (o.autoAlign && !fits(p, o.size, o.bounds)) {
    const list = o.tabTip
      ? tabTipFallbacks(o.align)
      : tooltipFallbacks(o.align);
    const found = list.find((a) => fits(at(o, a), o.size, o.bounds));
    if (found) {
      align = found;
      p = at(o, found);
    }
  }
  if (o.autoAlign) {
    // Slide along the edge it sits on to stay in view (it never leaves its side).
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (vertical(align)) {
      p = { x: Math.min(Math.max(EDGE, p.x), W - EDGE - o.size.w), y: p.y };
    } else {
      p = { x: p.x, y: Math.min(Math.max(EDGE, p.y), H - EDGE - o.size.h) };
    }
  }
  return { left: p.x, top: p.y, align };
}

/** The bounds `autoAlign` fits: v11's `autoAlignBoundary`, else the viewport cut down by the trigger's clipping ancestors. */
export function popoverBounds(
  trigger: Element,
  boundary?: PopoverBoundary
): SelectionRect {
  const view = { l: 0, t: 0, r: window.innerWidth, b: window.innerHeight };
  if (!boundary || boundary === 'clippingAncestors') {
    return tooltipBounds(trigger);
  }
  const cut = (
    b: SelectionRect,
    r: { left: number; top: number; right: number; bottom: number }
  ) => ({
    l: Math.max(b.l, r.left),
    t: Math.max(b.t, r.top),
    r: Math.min(b.r, r.right),
    b: Math.min(b.b, r.bottom),
  });
  if (Array.isArray(boundary)) {
    return boundary.reduce((b, el) => cut(b, el.getBoundingClientRect()), view);
  }
  if (boundary instanceof Element) {
    return cut(view, boundary.getBoundingClientRect());
  }
  return cut(view, {
    left: boundary.x,
    top: boundary.y,
    right: boundary.x + boundary.width,
    bottom: boundary.y + boundary.height,
  });
}
