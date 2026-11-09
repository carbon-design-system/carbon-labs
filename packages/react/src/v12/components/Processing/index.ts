/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Processing — the working mark: three dots pulsing on the loading clock, shifting into a triangle or a square as the work changes. */
export { Processing } from './components/Processing';
export type {
  ProcessingHandle,
  ProcessingMode,
  ProcessingProps,
  ProcessingSize,
  ProcessingVariant,
} from './components/Processing';
export {
  PROCESSING_MOTION,
  canAnimate as canAnimateProcessing,
  createProcessingEngine,
  processingSetPeriods,
  processingTravelToken,
} from './components/processingEngine';
export type {
  ProcessingEngine,
  ProcessingEngineOptions,
  ProcessingKind,
  ProcessingTravelStep,
} from './components/processingEngine';
