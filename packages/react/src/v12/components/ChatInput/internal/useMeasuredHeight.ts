/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * The height of an element's content, kept current as it changes, so a wrapper
 * can transition to it. A block-size cannot transition to `auto`, and
 * `interpolate-size` is not in every browser Carbon supports, so the wrapper
 * gets a measured length instead.
 *
 * The first measurement lands before paint, from an unset height, so a
 * composer that mounts with files does not animate open.
 *
 * A change to `content` re-measures before paint, so adding or removing a file
 * never waits on the observer, which only runs on rendering frames; the
 * observer catches the rest (a rewrap when the width changes).
 *
 * @param {RefObject<HTMLElement | null>} ref The content to measure.
 * @param {unknown} content What is inside, to re-measure when it changes.
 * @returns {number | undefined} Its height in px, or undefined before the
 *   first measurement (leave the wrapper at its natural height).
 */
export function useMeasuredHeight(
  ref: RefObject<HTMLElement | null>,
  content: unknown
): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref, content]);

  return height;
}
