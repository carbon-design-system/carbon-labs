/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** ShimmerText — a label that shows live work: a band in the primary text passes through words that rest a step quieter, on the skeleton wave's angle and clock. */
export {
  SHIMMER_TEXT,
  ShimmerText,
  shimmerPass,
  shimmerSpeed,
} from './components/ShimmerText';
export type {
  ShimmerBand,
  ShimmerPass,
  ShimmerRule,
  ShimmerTextMotion,
  ShimmerTextProps,
} from './components/ShimmerText';
/** The shimmer's reveal: words arriving through the shimmer's band, as one pass of it, on the shimmer's angle. */
export { playShimmerReveal, shimmerRevealPass } from './components/reveal';
export type { ShimmerRevealOptions } from './components/reveal';
