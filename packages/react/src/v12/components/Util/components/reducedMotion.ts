/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { useStableCallback } from './stableCallback';

/** A narrower reduced setting than the motion provider's: a prop, or a family's motion override
 *  (tooltip or feedback). `undefined` defers to the provider. */
export type ReducedOverride = boolean | undefined | (() => boolean | undefined);

/** A stable getter for a driver attached once (a rollover's `reduced`): the override, else the
 *  MotionProvider, else the OS. A getter override is read on each call. */
export function useReducedGetter(override?: ReducedOverride): () => boolean {
  const reduced = usePrefersReducedMotion();
  return useStableCallback(
    () => (typeof override === 'function' ? override() : override) ?? reduced
  );
}
