/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import AnimatedHeader from './components/AnimatedHeader/AnimatedHeader';
import { AriaLabels, TileGroup } from './components/AnimatedHeader/types';
import HeaderAction from './components/HeaderAction/HeaderAction';
import HeaderTitle from './components/HeaderTitle/HeaderTitle';
import { BaseTile } from './components/Tiles/index';
export * from './assets';

// Export all types
export type { AnimatedHeaderProps } from './components/AnimatedHeader/AnimatedHeader';
export type { Tile } from './components/AnimatedHeader/types';
export type { AITileProps } from './components/Tiles/AITile/AITile';
export type { AIPromptTileProps } from './components/Tiles/AIPromptTile/AIPromptTile';
export type { GlassTileProps } from './components/Tiles/GlassTile/GlassTile';
export type {
  BaseTileProps,
  TileVariant,
} from './components/Tiles/BaseTile/BaseTile';
export type { AutotrackDataAttributes } from './components/types';
export type {
  Workspace,
  WorkspaceSelectorConfig,
} from './components/WorkspaceSelector/WorkspaceSelector';
export type { TasksControllerConfig } from './components/TasksController/TasksController';
export type { HeaderActionConfig } from './components/HeaderAction/header-action.types';
export type { ContentSwitcherConfig } from './components/ContentSwitcherSelector/ContentSwitcherSelector';

export {
  AnimatedHeader,
  BaseTile,
  HeaderAction,
  HeaderTitle,
  type AriaLabels,
  type TileGroup,
};
