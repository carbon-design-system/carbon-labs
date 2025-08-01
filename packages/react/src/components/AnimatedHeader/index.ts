/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import AnimatedHeader, {
  AriaLabels,
  TileGroup,
} from './components/AnimatedHeader/AnimatedHeader';
import HeaderTitle from './components/HeaderTitle/HeaderTitle';
import { BaseTile } from './components/Tiles/index.js';
export * from './assets';
export type {
  Workspace,
  WorkspaceSelectorConfig,
} from './components/WorkspaceSelector/WorkspaceSelector';
export type { TasksControllerConfig } from './components/TasksController/TasksController';

export {
  AnimatedHeader,
  BaseTile,
  HeaderTitle,
  type AriaLabels,
  type TileGroup,
};
