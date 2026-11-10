/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Slider — one knob or two on a number line, or a few named steps (`steps`,
 * the step slider), on the selection family's motion.
 */
export { DOT_PHYSICS, Slider, SliderSkeleton } from './components/Slider';
export type {
  SliderProps,
  SliderChangeData,
  SliderSkeletonProps,
  SliderStep,
  SliderHandlePosition,
  SliderStatus,
  SliderTranslationKey,
} from './components/Slider';
export { DOT_BEHAVIORS } from '@carbon-labs/v12-motion';
export type { DotBehaviors, DotPhysics } from '@carbon-labs/v12-motion';

// The names other v12 packages take from this package's files.
export {
  contrastRatio,
  cssHex,
  solveStatusColor,
  surfaceOf,
} from './components/statusColor';
export type { SolvedStatus } from './components/statusColor';
