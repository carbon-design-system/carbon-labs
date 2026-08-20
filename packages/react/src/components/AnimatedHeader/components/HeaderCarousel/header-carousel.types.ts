/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Optional accessibility and label overrides for the carousel pagination
 * controls. Pagination itself activates automatically when a TileGroup's tiles
 * exceed the per-page width-unit limit — this config is not required to enable
 * it.
 */
export type HeaderCarouselConfig = {
  /** aria-label for the carousel control group wrapper */
  ariaLabel?: string;
  /** aria-label for the previous page chevron button (default: 'Previous page') */
  prevButtonLabel?: string;
  /** aria-label for the next page chevron button (default: 'Next page') */
  nextButtonLabel?: string;
};
