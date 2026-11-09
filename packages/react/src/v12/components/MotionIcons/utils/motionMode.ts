/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useContext } from 'react';
import {
  MOTION_UNDECIDED,
  MotionIconContext,
} from '../context/MotionIconContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * How an icon draws:
 *  - 'on': animated;
 *  - 'off': `animated={false}` (on the icon, or a provider's explicit
 *    `false`): still, in Carbon's exact art where the icon has it (toggles'
 *    statics; a hover icon's optional `static`), else its rest geometry;
 *  - 'reduced': the user prefers reduced motion (and nothing said
 *    `animated`): the rest geometry, with state changes made instantly.
 *
 * Resolved exactly as `useMotionContext` resolves `animated` (an explicit
 * prop wins, then a provider's value, then the reduced-motion preference);
 * this only says *why* an icon is still. A provider with `animated={false}`
 * while the OS also asks for reduced motion can't be told apart from one
 * left to follow the OS (the provider stores only the boolean), so it reads
 * as 'reduced'.
 */
export type MotionMode = 'on' | 'off' | 'reduced';

export function useMotionMode(animated: boolean | undefined): MotionMode {
  const { animated: provided } = useContext(MotionIconContext);
  // Called unconditionally (hook order), as useMotionContext does.
  const reduced = useReducedMotion();
  if (animated !== undefined) {
    return animated ? 'on' : 'off';
  }
  if (provided === MOTION_UNDECIDED) {
    return reduced ? 'reduced' : 'on';
  }
  if (provided) {
    return 'on';
  }
  return reduced ? 'reduced' : 'off';
}
