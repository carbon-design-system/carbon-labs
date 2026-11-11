/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { inlineKey, isRtl, type Direction } from './direction';

/* ============================================================================
 * The roving tab stop: one keyboard model for a group of controls that is
 * one stop in the tab order (a toolbar, a row of chips, a list of tabs).
 *
 *   rovingIndex       framework-free: the index a key moves to. Arrows along
 *                     the group's axis, disabled items skipped, Home / End.
 *                     Horizontal arrows read by direction (`inlineKey`), so
 *                     `ArrowLeft` moves on in a right-to-left group
 *   useRovingTabStop  the whole pattern on a root: one tab stop (the item
 *                     last focused, else the first enabled), the arrow keys,
 *                     Home / End; it stops at the ends unless `wrap`. The
 *                     tab stop is re-applied after every render, so items
 *                     can come and go
 * ========================================================================== */

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface RovingIndexOptions {
  /** `horizontal` (← / →), `vertical` (↑ / ↓) or `both`. */
  orientation: RovingOrientation;
  /** How many items the group has. */
  count: number;
  /** An item that focus passes over. */
  isDisabled?: (index: number) => boolean;
  /** Arrows wrap past the ends. Default true. */
  wrap?: boolean;
  /** The group's direction, `true` for right to left, or the group's element. */
  dir?: Direction | boolean | Element | null;
}

/** The next enabled index from `from` in direction `step`, or `from` if there is none. */
function stepIndex(
  from: number,
  step: 1 | -1,
  count: number,
  wrap: boolean,
  isDisabled: (index: number) => boolean
): number {
  for (let k = 1; k <= count; k++) {
    let i = from + step * k;
    if (wrap) {
      i = ((i % count) + count) % count;
    } else if (i < 0 || i >= count) {
      return from;
    }
    if (!isDisabled(i)) {
      return i;
    }
  }
  return from;
}

/**
 * The index a key moves to from `from`, or null when the key isn't a
 * navigation key for this orientation.
 */
export function rovingIndex(
  key: string,
  from: number,
  {
    orientation,
    count,
    isDisabled = () => false,
    wrap = true,
    dir,
  }: RovingIndexOptions
): number | null {
  if (count <= 0) {
    return null;
  }
  const k = inlineKey(key, dir);
  const across = orientation !== 'vertical';
  const down = orientation !== 'horizontal';
  if ((across && k === 'ArrowRight') || (down && k === 'ArrowDown')) {
    return stepIndex(from, 1, count, wrap, isDisabled);
  }
  if ((across && k === 'ArrowLeft') || (down && k === 'ArrowUp')) {
    return stepIndex(from, -1, count, wrap, isDisabled);
  }
  if (k === 'Home') {
    return stepIndex(-1, 1, count, false, isDisabled);
  }
  if (k === 'End') {
    return stepIndex(count, -1, count, false, isDisabled);
  }
  return null;
}

export interface RovingTabStopOptions {
  /** A selector for the group's items inside the root, in document order. */
  items: string;
  /** Default `horizontal`. */
  orientation?: RovingOrientation;
  /** Arrows wrap past the ends. Default false (a toolbar's pattern). */
  wrap?: boolean;
}

const enabled = (el: HTMLElement | undefined): boolean =>
  !!el &&
  !(el as HTMLButtonElement).disabled &&
  el.getAttribute('aria-disabled') !== 'true';

/** One tab stop: the item last focused (else the first enabled) takes 0, the rest -1. */
function settle(root: HTMLElement, active: { current: number }, items: string) {
  const els = [...root.querySelectorAll<HTMLElement>(items)];
  if (!els.length) {
    return;
  }
  let i = Math.min(active.current, els.length - 1);
  if (!enabled(els[i])) {
    i = Math.max(0, els.findIndex(enabled));
  }
  els.forEach((el, k) => {
    el.tabIndex = k === i ? 0 : -1;
  });
}

/** The keys and the focus on the root; returns the detach. */
function listen(
  root: HTMLElement,
  active: { current: number },
  options: { current: Required<RovingTabStopOptions> }
): () => void {
  const list = () => [
    ...root.querySelectorAll<HTMLElement>(options.current.items),
  ];
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const els = list();
    const from = els.indexOf(e.target as HTMLElement);
    if (from < 0) {
      return;
    }
    const next = rovingIndex(e.key, from, {
      orientation: options.current.orientation,
      wrap: options.current.wrap,
      count: els.length,
      isDisabled: (k) => !enabled(els[k]),
      dir: isRtl(root),
    });
    if (next == null) {
      return;
    }
    e.preventDefault();
    els[next]?.focus();
  };
  const onFocus = (e: FocusEvent) => {
    const i = list().indexOf(e.target as HTMLElement);
    if (i < 0) {
      return;
    }
    active.current = i;
    settle(root, active, options.current.items);
  };
  root.addEventListener('keydown', onKey);
  root.addEventListener('focusin', onFocus);
  return () => {
    root.removeEventListener('keydown', onKey);
    root.removeEventListener('focusin', onFocus);
  };
}

/** A roving tab stop over the items `items` selects inside `rootRef`. */
export function useRovingTabStop(
  rootRef: RefObject<HTMLElement | null>,
  { items, orientation = 'horizontal', wrap = false }: RovingTabStopOptions
): void {
  const active = useRef(0);
  const options = useRef<Required<RovingTabStopOptions>>({
    items,
    orientation,
    wrap,
  });
  // The root it's listening on, and how to stop (the root can come and go).
  const attached = useRef<{ root: HTMLElement; detach: () => void } | null>(
    null
  );

  // After every render: the options, the listeners on the root as it is now, one tab stop.
  useLayoutEffect(() => {
    options.current = { items, orientation, wrap };
    const root = rootRef.current;
    if (attached.current?.root !== root) {
      attached.current?.detach();
      attached.current = root
        ? { root, detach: listen(root, active, options) }
        : null;
    }
    if (root) {
      settle(root, active, items);
    }
  });
  useEffect(
    () => () => {
      attached.current?.detach();
      attached.current = null;
    },
    []
  );
}
