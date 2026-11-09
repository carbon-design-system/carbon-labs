/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The icons below follow carbon-motion's motion level (its `MotionProvider`,
 * resolved by `useMotionPreference().level`), mapped as the core's
 * adapters/level.ts maps it:
 *  - "full": animated, even under the OS's reduce (an explicit level wins);
 *  - "reduced": still, as under prefers-reduced-motion;
 *  - "none": every animation jumps to its end (skip). Skip is the engine's,
 *    so it holds page-wide while a `<FollowCarbonMotion level="none">` is
 *    mounted, not only below it;
 *  - "system": the OS setting, as with no bridge.
 * It takes the level as a prop, so this package needs nothing from
 * carbon-motion. An icon's own `animated` prop still wins.
 */
import {
  createElement,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';
import { addSkipSource } from '@carbon-labs/motion-icons-core/engine/skip';
import {
  levelSkips,
  levelStill,
  type MotionLevel,
} from '@carbon-labs/motion-icons-core/adapters/level';
import { MotionIconProvider } from '../context/MotionIconProvider';

export interface FollowCarbonMotionProps {
  /** carbon-motion's resolved level (`useMotionPreference().level`), or 'system'. */
  level: MotionLevel | 'system';
  children: ReactNode;
}

export function FollowCarbonMotion({
  level,
  children,
}: FollowCarbonMotionProps): ReactElement {
  const skips = levelSkips(level);
  useEffect(
    () => (skips ? addSkipSource({ get: () => true }) : undefined),
    [skips]
  );
  const still = levelStill(level);
  return createElement(
    MotionIconProvider,
    { animated: still === null ? undefined : !still },
    children
  );
}
