/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { version, type ReactElement, type Ref } from 'react';

/** React 19 keeps an element's ref in its props; React 18 keeps it on the element. */
const REF_IN_PROPS = Number.parseInt(version, 10) >= 19;

/** Points a caller's ref (a callback or an object) at a value. */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value as T);
  } else if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

/** A ref to an element, the same type on React 18 and 19 (React 18's `RefObject<T | null>` is no element ref). */
export type NodeRef<T> = { current: T | null };

/** An element's own ref, to merge when cloning it: from its props on React 19, from the element on React 18. */
export function elementRef<T>(element: ReactElement): Ref<T> | undefined {
  const ref = REF_IN_PROPS
    ? (element.props as { ref?: Ref<T> }).ref
    : (element as unknown as { ref?: Ref<T> | null }).ref;
  return ref ?? undefined;
}
