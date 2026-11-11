/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, type RefObject } from 'react';
import { rovingKey, useRovingFocus } from '@carbon-labs/react-selection-kit';
import { inlineKey, isRtl } from '@carbon-labs/react-util';

const enabled = (el: HTMLElement | undefined) =>
  !!el &&
  !(el as HTMLButtonElement).disabled &&
  el.getAttribute('aria-disabled') !== 'true';

/**
 * A row's roving tab stop (`useRovingFocus`: one tab stop, ← / →, Home / End),
 * with ← / → the way they point in a right-to-left row.
 *
 * The hook steps in DOM order, which runs right to left there, so → is the
 * previous item: the key is taken on its way down, before the hook sees it.
 */
export function useInlineRovingFocus(
  rootRef: RefObject<HTMLElement | null>,
  items: string
): void {
  useRovingFocus(rootRef, { items });
  // After every render: the row can come and go.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !isRtl(root)) {
        return;
      }
      const els = [...root.querySelectorAll<HTMLElement>(items)];
      const from = els.indexOf(e.target as HTMLElement);
      if (from < 0) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const next = rovingKey(inlineKey(e.key, true), from, {
        orientation: 'horizontal',
        wrap: false,
        count: els.length,
        isDisabled: (k) => !enabled(els[k]),
      });
      if (next != null && next !== from) {
        els[next]?.focus();
      }
    };
    root.addEventListener('keydown', onKey, true);
    return () => root.removeEventListener('keydown', onKey, true);
  });
}
