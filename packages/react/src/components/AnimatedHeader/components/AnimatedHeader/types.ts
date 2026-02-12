/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { BaseTileProps } from '../../components/Tiles/BaseTile/BaseTile';

export type Tile = BaseTileProps;

export interface TileGroup {
  id: number;
  label: string;
  tiles: Tile[];
}

export interface AriaLabels {
  welcome?: string;
  description?: string;
  collapseButton?: string;
  expandButton?: string;
  tilesContainer?: string;
}

export interface HeaderTitleConfig {
  showTooltip?: boolean;
}
