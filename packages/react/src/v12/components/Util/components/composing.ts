/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/** A key that belongs to an input method's composition (an Escape there cancels it, nothing else). */
export function isComposing(e: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = 'nativeEvent' in e ? e.nativeEvent : e;
  return native.isComposing || native.keyCode === 229;
}
