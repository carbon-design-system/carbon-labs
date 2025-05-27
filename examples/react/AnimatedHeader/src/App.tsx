/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {
  AnimatedHeader,
  TasksControllerConfig,
  WorkspaceSelectorConfig,
} from '@carbon-labs/react-animated-header/es/index';
import {
  watsonXAnimatedLight,
  watsonXStaticLight,
} from '@carbon-labs/react-animated-header/assets';
import { headerTiles, workspaceData, workspaces } from './data';
import { TileGroup } from '@carbon-labs/react-animated-header/es/components/AnimatedHeader/AnimatedHeader';
import { Workspace } from '@carbon-labs/react-animated-header/es/components/AnimatedHeader/WorkspaceSelector/WorkspaceSelector';

function App() {
  const [tiles] = useState(headerTiles);
  const [selectedTile, setSelectedTile] = useState(tiles[0]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);

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
  };

  return (
    <AnimatedHeader
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
