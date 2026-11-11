/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState, type RefObject } from 'react';

/* ============================================================================
 * Direction: read one way, by every component.
 *
 *   isRtl         an element's resolved direction, from `:dir(rtl)`, with no
 *                 style pass (the nearest `dir` attribute where `:dir()` is
 *                 not supported)
 *   useDirection  a root's direction, kept current when a `dir` attribute
 *                 changes anywhere on the page (one page-wide observer, only
 *                 while such a root is mounted)
 *   inlineKey     a horizontal arrow key as it reads left to right:
 *                 `ArrowRight` toward the inline end, `ArrowLeft` toward the
 *                 start. A handler compares the result, so one set of cases
 *                 serves both directions
 * ========================================================================== */

export type Direction = 'ltr' | 'rtl';

const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  if (
    !observer &&
    typeof MutationObserver !== 'undefined' &&
    typeof document !== 'undefined'
  ) {
    observer = new MutationObserver(() => {
      for (const l of [...listeners]) {
        l();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    });
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      observer?.disconnect();
      observer = null;
    }
  };
}

/** `:dir(rtl)`, or the nearest `dir` attribute where `:dir()` isn't supported. */
export function isRtl(el: Element | null | undefined): boolean {
  if (!el) {
    return false;
  }
  try {
    return el.matches(':dir(rtl)');
  } catch {
    return el.closest('[dir]')?.getAttribute('dir')?.toLowerCase() === 'rtl';
  }
}

/** The root's resolved direction, kept current when a `dir` attribute changes anywhere on the page. */
export function useDirection(rootRef: RefObject<Element | null>): Direction {
  const [dir, setDir] = useState<Direction>('ltr');
  useLayoutEffect(() => {
    const read = () => {
      const root = rootRef.current;
      // `:dir()` reads the `dir` attributes, with no style pass. Nothing in
      // the kit sets the CSS `direction` apart from `dir`.
      if (root) {
        setDir(isRtl(root) ? 'rtl' : 'ltr');
      }
    };
    read();
    return subscribe(read);
  }, [rootRef]);
  return dir;
}

/**
 * A key as it reads left to right: in a right-to-left context `ArrowLeft`
 * and `ArrowRight` swap; every other key comes back as it is.
 *
 * `dir` is the direction itself, `true` for right to left, or the element
 * the key acts on (its direction is read with `isRtl`).
 */
export function inlineKey(
  key: string,
  dir: Direction | boolean | Element | null | undefined
): string {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
    return key;
  }
  const rtl =
    typeof dir === 'string'
      ? dir === 'rtl'
      : typeof dir === 'boolean'
        ? dir
        : isRtl(dir);
  if (!rtl) {
    return key;
  }
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}
