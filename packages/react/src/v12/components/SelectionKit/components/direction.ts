/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** A root's direction, for what places by it (the side panel, the progress indicator).
 *  One page-wide observer, only while such a root is mounted. */
import { useLayoutEffect, useState, type RefObject } from 'react';

type Dir = 'ltr' | 'rtl';

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
export function isRtl(el: Element): boolean {
  try {
    return el.matches(':dir(rtl)');
  } catch {
    return el.closest('[dir]')?.getAttribute('dir')?.toLowerCase() === 'rtl';
  }
}

/**
 * An arrow key in reading order: ArrowLeft and ArrowRight swap when `rtl`,
 * so ArrowRight always means "next" to a horizontal list. Other keys pass.
 */
export function inlineKey(key: string, rtl: boolean): string {
  if (!rtl) {
    return key;
  }
  if (key === 'ArrowLeft') {
    return 'ArrowRight';
  }
  return key === 'ArrowRight' ? 'ArrowLeft' : key;
}

/** The root's resolved direction, kept current when a `dir` attribute changes anywhere on the page. */
export function useDirection(rootRef: RefObject<HTMLElement | null>): Dir {
  const [dir, setDir] = useState<Dir>('ltr');
  useLayoutEffect(() => {
    const read = () => {
      const root = rootRef.current;
      // `:dir()` reads the `dir` attributes, with no style pass: a computed
      // style here, once per root, restyled the page between every list's
      // mount writes (the slider lab: two roots per slider). Nothing in the
      // kit sets the CSS `direction` apart from `dir`.
      if (root) {
        setDir(isRtl(root) ? 'rtl' : 'ltr');
      }
    };
    read();
    return subscribe(read);
  }, [rootRef]);
  return dir;
}
