/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Utility functions for URL manipulation
 */
export class URLUtils {
  /**
   * Validate URL format
   * @param {string} url - The URL string to validate
   * @returns {boolean} True if the URL is valid, false otherwise
   */
  public static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
