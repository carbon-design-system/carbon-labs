/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

/**
 * Grows a textarea with its content up to `maxRows`, then stops and scrolls.
 *
 * The height is reset to `auto` before `scrollHeight` is read; without that the
 * element can only grow, because `scrollHeight` is clamped by the height
 * already set. The reset happens with the transition off and the old height
 * is restored before the new one is set, so the growth animates. Measuring only when the value changes is not enough: the first
 * measurement can land before the web font swaps in, and a width change
 * rewraps the prompt. So this also re-measures on `document.fonts.ready` and on
 * a width change.
 *
 * @param {RefObject<HTMLTextAreaElement | null>} ref The textarea.
 * @param {string} value The prompt, to re-measure when it changes.
 * @param {number} maxRows Rows before it scrolls.
 * @returns {boolean} Whether the prompt takes more than one row, which is what
 *   the box's shape follows.
 */
export function useAutoGrow(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxRows: number
): boolean {
  const [multiline, setMultiline] = useState(false);
  const maxRowsRef = useRef(maxRows);
  maxRowsRef.current = maxRows;

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const style = getComputedStyle(element);
    // `line-height: normal` parses to NaN; fall back to the font size's usual
    // ratio rather than a fixed number.
    const parsed = parseFloat(style.lineHeight);
    const lineHeight = Number.isFinite(parsed)
      ? parsed
      : (parseFloat(style.fontSize) || 14) * 1.43;
    const padding =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    const max = lineHeight * maxRowsRef.current + padding;

    // Measure at `auto` with the transition off, put the old height back,
    // then set the new one, so the stylesheet's block-size transition runs
    // from where the box was rather than jumping.
    const previous = element.style.blockSize;
    element.style.transition = 'none';
    element.style.blockSize = 'auto';
    const content = element.scrollHeight;
    const next = `${Math.min(content, max)}px`;
    if (previous && previous !== next) {
      element.style.blockSize = previous;
      // Commit the old height before the transition returns.
      void element.offsetHeight;
    }
    element.style.transition = '';
    element.style.blockSize = next;
    element.style.overflowY = content > max ? 'auto' : 'hidden';

    // Half a line of tolerance keeps sub-pixel rounding from flipping the
    // shape back and forth on a one-row prompt.
    setMultiline(content > lineHeight * 1.5 + padding);
  }, [ref]);

  useLayoutEffect(measure, [measure, value, maxRows]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        measure();
      }
    });
    if (typeof ResizeObserver === 'undefined') {
      return () => {
        cancelled = true;
      };
    }
    // Only width: `measure` writes the height, so reacting to height would
    // feed the observer its own output.
    let lastWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== lastWidth) {
        lastWidth = element.clientWidth;
        measure();
      }
    });
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref, measure]);

  return multiline;
}
