/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { HeadingLevel } from '../types/editor.types.js';
import type { EditorService } from '../services/editor.service.js';

/**
 * Utility functions for editor-specific operations
 */
export class EditorUtils {
  /**
   * Get the currently active heading value for the dropdown
   * @param {EditorService} editorService - The editor service instance
   * @returns {string} The current heading value
   */
  public static getCurrentHeadingValue(
    editorService: EditorService
  ): 'p' | `h${HeadingLevel}` {
    const headingValues: Array<`h${HeadingLevel}`> = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];

    for (const value of headingValues) {
      const level = Number.parseInt(value.replace('h', ''), 10) as HeadingLevel;
      if (editorService.isActive('heading', { level })) {
        return value;
      }
    }

    return 'p';
  }

  /**
   * Parse heading value string to heading level number
   * @param {string} value - The heading value (e.g., 'h1', 'h2')
   * @returns {HeadingLevel | null} The heading level or null if invalid
   */
  public static parseHeadingLevel(value: string): HeadingLevel | null {
    if (value === 'p') {
      return null;
    }
    const level = Number.parseInt(value.replace('h', ''), 10);
    if (level >= 1 && level <= 6) {
      return level as HeadingLevel;
    }
    return null;
  }

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
