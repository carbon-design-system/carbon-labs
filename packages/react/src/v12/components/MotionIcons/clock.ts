/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `@carbon-labs/react-motion-icons/clock`: the engine's clock and motion
 * preferences, for tests, frozen-clock checks, animation libraries and
 * design systems (see the core's engine/clock.ts). It reaches the same copy
 * of the engine as this package's icons. `<FollowCarbonMotion>` makes the
 * icons below it follow carbon-motion's motion level.
 */
export * from '@carbon-labs/motion-icons-core/engine/clock';
export {
  FollowCarbonMotion,
  type FollowCarbonMotionProps,
} from './motion/FollowCarbonMotion';
