/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TileVariant } from './Tiles/BaseTile/BaseTile';
import type { Tile } from './AnimatedHeader/types';

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
  return Object.keys(props).reduce(
    (acc, key) => {
      if (key.startsWith('data-autotrack-')) {
        acc[key] = props[key];
      }
      return acc;
    },
    {} as Record<string, string | undefined>
  );
}

/**
 * Maximum visual width-units allowed on a single carousel page.
 * Derived from the XL breakpoint layout: 4 columns of 25% width each.
 */
export const MAX_UNITS_PER_PAGE = 4;

/**
 * Visual width-units consumed by each tile variant.
 * Matches the XL breakpoint (≥ 82rem) rules in animated-header.scss:
 *   glass / ai  → 25%  (1 unit)
 *   aiPrompt    → 50%  (2 units)
 */
export const TILE_WIDTH_UNITS: Record<TileVariant, number> = {
  glass: 1,
  ai: 1,
  aiPrompt: 2,
};

/**
 * Splits a flat tile array into pages using greedy bin-filling up to
 * MAX_UNITS_PER_PAGE width-units per page.
 *
 * @param tiles - Flat array of tiles to split into pages.
 * @example
 * // 4 glass tiles → [[g,g,g,g]]
 * // 5 glass tiles → [[g,g,g,g],[g]]
 * // [aiPrompt, glass, glass] → [[aiPrompt, g, g]]  (2+1+1 = 4 units)
 * // [aiPrompt, glass×3]     → [[aiPrompt, g, g], [g]]
 */
export function chunkTilesByWidth(tiles: Tile[]): Tile[][] {
  const pages: Tile[][] = [];
  let current: Tile[] = [];
  let units = 0;

  for (const tile of tiles) {
    const tileUnits =
      TILE_WIDTH_UNITS[(tile as any).variant as TileVariant] ??
      TILE_WIDTH_UNITS.glass;
    if (units + tileUnits > MAX_UNITS_PER_PAGE && current.length > 0) {
      pages.push(current);
      current = [];
      units = 0;
    }
    current.push(tile);
    units += tileUnits;
  }
  if (current.length > 0) {
    pages.push(current);
  }
  return pages;
}
