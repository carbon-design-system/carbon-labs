/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Extracts data-autotrack-* attributes from props object.
 * This utility filters out only the autotrack data attributes for spreading onto DOM elements.
 *
 * @param {Record<string, any>} props - Props object that may contain data-autotrack-* attributes
 * @returns {Record<string, string | undefined>} Object containing only data-autotrack-* attributes
 * 
 * @example
 * ```typescript
 * const props = { title: 'My Tile', 'data-autotrack-action': 'click', ...rest };
 * const dataAttrs = extractAutotrackAttributes(rest);
 * // Returns: { 'data-autotrack-action': 'click' }
 * ```
 */
export function extractAutotrackAttributes(
  props: Record<string, any>
): Record<string, string | undefined> {
  return Object.keys(props).reduce((acc, key) => {
    if (key.startsWith('data-autotrack-')) {
      acc[key] = props[key];
    }
    return acc;
  }, {} as Record<string, string | undefined>);
}
