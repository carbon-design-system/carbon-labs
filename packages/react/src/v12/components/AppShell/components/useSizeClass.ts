/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState, type RefObject } from 'react';
import { afterLayout, inLayout } from '@carbon-labs/v12-motion';

/* ============================================================================
 * Size classes (docs/recipes/README.md): the class of an element from its own
 * width, not the window's, so a recipe works inside a split pane or a
 * tearsheet. The edges are the 2x Grid's md, lg and xlg breakpoints.
 *
 *   compact    < 672
 *   medium     672–1055
 *   expanded   1056–1311
 *   large      ≥ 1312
 * ========================================================================== */

export type SizeClass = 'compact' | 'medium' | 'expanded' | 'large';

/** The narrowest width, px, of each class above compact. CSS takes them from styles/_size-classes.scss (a test keeps the two equal). */
export const SIZE_CLASS_EDGES = {
  medium: 672,
  expanded: 1056,
  large: 1312,
} as const;

/** Every class, narrowest first. */
export const SIZE_CLASSES: readonly SizeClass[] = [
  'compact',
  'medium',
  'expanded',
  'large',
];

/** The class of a width, px. */
export function sizeClassOf(width: number): SizeClass {
  if (width >= SIZE_CLASS_EDGES.large) {
    return 'large';
  }
  if (width >= SIZE_CLASS_EDGES.expanded) {
    return 'expanded';
  }
  if (width >= SIZE_CLASS_EDGES.medium) {
    return 'medium';
  }
  return 'compact';
}

/** The element's border-box width (a ResizeObserver entry's, else its layout box's). */
function widthOf(el: Element, entry?: ResizeObserverEntry): number {
  const box = entry?.borderBoxSize?.[0];
  if (box) {
    return box.inlineSize;
  }
  return (el as HTMLElement).offsetWidth ?? el.getBoundingClientRect().width;
}

/** `ref`'s element's size class from its own width, measured before the first paint; `initial` until it mounts.
 *  `holdInLayout`: a width change inside a layout transaction takes effect once it lands, so it flips once. */
export function useSizeClass(
  ref: RefObject<Element | null>,
  initial: SizeClass = 'large',
  options?: { holdInLayout?: boolean }
): SizeClass {
  const [sizeClass, setSizeClass] = useState<SizeClass>(initial);
  const hold = options?.holdInLayout ?? false;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setSizeClass(sizeClassOf(widthOf(el)));
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    let waiting = false;
    let live = true;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) {
        return;
      }
      // Held: one change, to the width the move lands on, so a layout flips once rather than mid-move.
      if (hold && inLayout(el)) {
        if (waiting) {
          return;
        }
        waiting = true;
        void afterLayout(el).then(() => {
          waiting = false;
          if (live) {
            setSizeClass(sizeClassOf(widthOf(el)));
          }
        });
        return;
      }
      setSizeClass(sizeClassOf(widthOf(el, entry)));
    });
    ro.observe(el);
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [ref, hold]);
  return sizeClass;
}
