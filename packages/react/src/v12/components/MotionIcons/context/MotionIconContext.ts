/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext } from 'react';

/**
 * Sentinel meaning "no provider has decided". It is the context default, so
 * `useMotionContext` can tell "rendered outside a MotionIconProvider" apart
 * from "a provider deliberately chose true/false" and fall back to the user's
 * prefers-reduced-motion setting in the first case.
 *
 * A real provider always supplies a boolean, which passes through untouched.
 */
export const MOTION_UNDECIDED = 'undecided';

export interface MotionIconContextValue {
  animated: boolean | typeof MOTION_UNDECIDED;
}

export const MotionIconContext = createContext<MotionIconContextValue>({
  animated: MOTION_UNDECIDED,
});
