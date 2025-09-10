/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { headerTiles, workspaceData } from './data';
import {
  AnimatedHeader,
  TasksControllerConfig,
  WorkspaceSelectorConfig,
  type AriaLabels,
  type TileGroup,
  type Workspace,
  watsonXAnimatedLight,
  watsonXStaticLight,
} from '@carbon-labs/react-animated-header';

function App() {
  const [tiles] = useState(headerTiles);
  const [selectedTile, setSelectedTile] = useState(tiles[0]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceData[0]);

  const handleWorkspaceSelect = (e: any) => {
    setSelectedWorkspace(e.selectedItem);
  };

  const handleTileGroupSelect = (e: any) => {
    setSelectedTile(e.selectedItem);
  };

  const tasksDropdownItemRenderer = (item: TileGroup | null) =>
    item?.label ?? '';

  const workspaceDropdownItemRenderer = (item: Workspace | null) =>
    item?.label ?? '';

  const selectedWorkspaceItemRenderer = (item: Workspace | null) =>
    item?.label ?? '';

  const selectedTileGroupRenderer = (item: TileGroup | null) =>
    item?.label ?? '';

  const tasksControllerConfig: TasksControllerConfig = {
    type: 'dropdown',
    dropdown: {
      allTileGroups: headerTiles,
      selectedTileGroup: selectedTile,
      setSelectedTileGroup: handleTileGroupSelect,
      propsOverrides: {
        renderSelectedItem: selectedTileGroupRenderer,
        itemToString: tasksDropdownItemRenderer,
      },
      ariaLabel: 'Select a task group',
    },
  };

  const workspaceSelectorConfig: WorkspaceSelectorConfig = {
    allWorkspaces: workspaceData,
    selectedWorkspace,
    setSelectedWorkspace: handleWorkspaceSelect,
    propsOverrides: {
      label: "Open in: Drew's workspace",
      renderSelectedItem: selectedWorkspaceItemRenderer,
      itemToString: workspaceDropdownItemRenderer,
    },
    ariaLabel: 'Select a workspace',
  };

  const ariaLabelsConfig: AriaLabels = {
    welcome: 'Welcomes the user',
    description: 'Short description of the product',
    collapseButton: 'Collapse header details',
    expandButton: 'Expand header details',
    tilesContainer: 'Feature tiles list',
  };

  return (
    <AnimatedHeader
      ariaLabels={ariaLabelsConfig}
      tasksControllerConfig={tasksControllerConfig}
      workspaceSelectorConfig={workspaceSelectorConfig}
      description="Connect, monitor, and manage data."
      headerAnimation={watsonXAnimatedLight}
      headerStatic={watsonXStaticLight}
      productName="[Product name]"
      userName="Drew"
      welcomeText="Welcome"
      isLoading={false}
    />
  );
}

export default App;
