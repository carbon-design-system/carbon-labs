/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type HeaderCarouselConfig = {
  /** aria-label for the carousel control group wrapper */
  ariaLabel?: string;
  /** aria-label for the previous page chevron button (default: 'Previous page') */
  prevButtonLabel?: string;
  /** aria-label for the next page chevron button (default: 'Next page') */
  nextButtonLabel?: string;
  /**
   * The 0-based index of the currently visible page.
   * Works together with `onPageChange` for external control (like a controlled tab).
   * Defaults to 0.
   */
  currentPage?: number;
  /**
   * Callback fired when the user navigates to a new page via prev/next buttons or a dot.
   * Receives the new 0-based page index.
   */
  onPageChange?: (page: number) => void;
};
