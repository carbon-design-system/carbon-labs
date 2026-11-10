/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isValidElement, type ReactNode } from 'react';

/**
 * Whether two React nodes would render the same: equal text, or elements of
 * the same type and key whose props are the same (by identity, and children
 * compared the same way, one level of arrays deep). A row's face is usually
 * a label or an icon element made afresh by its parent each render; this
 * lets a memoized row skip that render when nothing in it changed, so a
 * list re-renders only the rows that changed.
 *
 * Conservative: anything it can't tell is equal (a function child, a ref
 * that changed) counts as a change, so a row never shows stale content.
 */
export function sameNode(a: ReactNode, b: ReactNode, depth = 0): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (depth > 4) {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((x, i) =>
      sameNode(x as ReactNode, b[i] as ReactNode, depth + 1)
    );
  }
  if (!isValidElement(a) || !isValidElement(b)) {
    return false;
  }
  if (a.type !== b.type || a.key !== b.key) {
    return false;
  }
  const pa = a.props as Record<string, unknown>;
  const pb = b.props as Record<string, unknown>;
  const ka = Object.keys(pa);
  if (ka.length !== Object.keys(pb).length) {
    return false;
  }
  for (const k of ka) {
    if (!(k in pb)) {
      return false;
    }
    if (Object.is(pa[k], pb[k])) {
      continue;
    }
    if (
      k === 'children' &&
      sameNode(pa[k] as ReactNode, pb[k] as ReactNode, depth + 1)
    ) {
      continue;
    }
    return false;
  }
  return true;
}

/**
 * Whether two props objects would render the same: the same keys, each value
 * the same by identity or, for a node, by `sameNode` (a row's pass-through
 * props, such as an item's own `className` or `data-*`, are a fresh object
 * each render). A function or style object made afresh counts as a change.
 */
export function sameProps(
  a: Readonly<Record<string, unknown>> | null | undefined,
  b: Readonly<Record<string, unknown>> | null | undefined
): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) {
    return false;
  }
  return ka.every(
    (k) => k in b && sameNode(a[k] as ReactNode, b[k] as ReactNode)
  );
}
