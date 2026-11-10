/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { MotionIconProvider } from '@carbon-labs/react-motion-icons';

/* ============================================================================
 * The motion icons follow the kit's reduced motion
 * ============================================================================
 *
 * The kit's reduced motion is `usePrefersReducedMotion()`: the nearest
 * `MotionProvider`'s level, else the OS. A motion icon decides on its own:
 * its `animated` prop, else the nearest `MotionIconProvider`, else the OS
 * alone. So with no bridge, a `MotionProvider level="reduced"` (a Reduced
 * motion setting turned on) would leave every icon animating.
 *
 *   FollowKitMotion   a MotionIconProvider set from the kit's reduced: put
 *                     it inside each MotionProvider that sets a level, and
 *                     every motion icon below follows it (an icon's own
 *                     `animated`, or a MotionIconProvider further in, still
 *                     wins)
 *   useIconAnimated   the same, for a component that passes `animated` to
 *                     an icon it draws itself, so it follows the kit even
 *                     where no bridge is put
 *
 * Under the OS's reduce the icons still draw as motion-icons' reduced mode
 * (the rest geometry, changes at once). Under a level that reduces while the
 * OS doesn't, they draw still (Carbon's art, changes at once): a provider
 * holds only a boolean, so motion-icons can't tell that from `animated={false}`.
 * ========================================================================== */

/** Whether the kit's motion icons animate here: not under the kit's reduced motion. */
export function useIconAnimated(): boolean {
  return !usePrefersReducedMotion();
}

/** The motion icons below follow the kit's reduced motion (the nearest MotionProvider's level, else the OS). */
export function FollowKitMotion({ children }: { children: ReactNode }) {
  return (
    <MotionIconProvider animated={useIconAnimated()}>
      {children}
    </MotionIconProvider>
  );
}
