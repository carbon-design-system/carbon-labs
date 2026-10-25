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
  /**
   * Optional callback that returns the aria-label and tooltip text for a page
   * dot given its 1-based page number. When omitted the default label
   * `'Page N'` is used.
   *
   * @param pageNumber - 1-based index of the page dot (1, 2, 3, …)
   * @returns The full label string for that dot, e.g. `'Page 1'`
   *
   * @example
   * // Simple translation
   * getPageIndicatorLabel={(n) => `Seite ${n}`}
   *
   * @example
   * // Per-page descriptive names
   * const labels = ['Overview', 'Models', 'Deployments', 'Monitors', 'Jobs'];
   * getPageIndicatorLabel={(n) => labels[n - 1]}
   */
  getPageIndicatorLabel?: (pageNumber: number) => string;
};
