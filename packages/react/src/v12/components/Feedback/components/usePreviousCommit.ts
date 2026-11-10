/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef } from 'react';

/** The value as of the last commit (first render: `initial`); read in render, written after commit. */
export function usePreviousCommit<T>(value: T, initial: T = value): T {
  const ref = useRef(initial);
  const previous = ref.current;
  useLayoutEffect(() => {
    ref.current = value;
  });
  return previous;
}
