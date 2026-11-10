/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** ProgressIndicator and ProgressStep — Carbon v11's, on the kit's motion: the current step is the selection marker (it reaches on a press), the line fills on its clock, the icons swap in place. */
export {
  ProgressIndicator,
  ProgressStep,
  useProgressReach,
} from './components/ProgressIndicator';
export type {
  ProgressIndicatorProps,
  ProgressReach,
  ProgressStepProps,
} from './components/ProgressIndicator';
export { ProgressIndicatorSkeleton } from './components/ProgressIndicatorSkeleton';
export type { ProgressIndicatorSkeletonProps } from './components/ProgressIndicatorSkeleton';
