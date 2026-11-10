/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** ProgressBar — Carbon's, on the kit's motion: a fill that travels by distance, a loop on the loading clock, a status icon that swaps in place. */
export {
  ProgressBar,
  PROGRESS_BAR_LINE,
  PROGRESS_BAR_MOTION,
  progressBarLine,
  progressBarPulseMs,
} from './components/ProgressBar';
export type {
  ProgressBarMotion,
  ProgressBarProps,
  ProgressBarStatus,
} from './components/ProgressBar';

// The names other v12 packages take from this package's files.
export {
  continueFrom,
  easeFrom,
  retargetFrom,
  startNow,
} from './components/retarget';
export type { Reading } from './components/retarget';
