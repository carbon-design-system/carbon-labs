/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The loaders' line grows with progress, across one span of it (a ring's
 * stroke doubles, inset, from 15% to 85%; the default bar goes 2px → 3px
 * and the thin one 1px → 2px): its rest width up to
 * `from`, its grown width from `to`, linearly between. The progress ring
 * (`PROGRESS_RING_MOTION`) and the progress bar (`PROGRESS_BAR_LINE`) read it,
 * so the two grow over the same share of the work. An indeterminate loader has
 * no amount to grow by, so it keeps its rest width.
 */
export const LOADER_GROWTH = {
  from: 0.15,
  to: 0.85,
};

/** How far through the growth a share of the work (0–1) is: 0 up to `from`, 1 from `to`, linear between. */
export function loaderGrowth(
  share: number,
  from = LOADER_GROWTH.from,
  to = LOADER_GROWTH.to
): number {
  return Math.min(1, Math.max(0, (share - from) / (to - from)));
}
