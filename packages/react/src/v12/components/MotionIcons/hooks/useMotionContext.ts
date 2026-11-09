/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useContext } from 'react';
import {
  MotionIconContext,
  MOTION_UNDECIDED,
} from '../context/MotionIconContext';
import { useReducedMotion } from './useReducedMotion';

/**
 * Resolves the animation behaviour an icon should use when it is given no
 * explicit `animated` prop.
 *
 * - Inside a `MotionIconProvider`, the provider's boolean wins verbatim.
 * - Outside any provider, the context holds the `MOTION_UNDECIDED` sentinel
 *   and the icon follows `useReducedMotion()` — a shared, hydration-safe
 *   store with a single media-query listener for all icons, so bare icons
 *   also react to the OS setting changing mid-session.
 */
export function useMotionContext(): { animated: boolean } {
  const { animated } = useContext(MotionIconContext);
  // Called unconditionally (hook order); cheap when a provider decides.
  const reduced = useReducedMotion();
  return { animated: animated !== MOTION_UNDECIDED ? animated : !reduced };
}
