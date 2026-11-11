/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What a story file imports: the matrix and compare helpers. The add-on's
// own entries are `./manager` and `./preview`.

export { matrixStory, PROP_STATES } from './matrix';
export type { MatrixOptions, MatrixState } from './matrix';
export { compareStory, storyFrameUrl } from './compare';
export type { CompareOptions } from './compare';
export { describeMotion, motionReport } from './motion';
export type { MotionEntry, MotionReport, MotionRow } from './motion';
export { applyClock, clockDraft } from './clock';
export { WorkbenchFrame } from './decorator';
export {
  CLOCKS,
  DEFAULT_GLOBALS,
  MOTION_LEVEL,
  CORNERS,
  DENSITIES,
  DIRECTIONS,
  REDUCED_MOTION,
  THEMES,
  ZONE_THEMES,
  readGlobals,
  timeScaleOf,
} from './constants';
export type {
  Clock,
  Corners,
  Density,
  Direction,
  ReducedBehaviour,
  ReducedMotion,
  Theme,
  V12Parameters,
  WorkbenchGlobals,
  ZoneTheme,
} from './constants';
