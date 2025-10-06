/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useMemo } from 'react';
import { headerTiles, workspaceData } from './data';
import {
  AnimatedHeader,
  TasksControllerConfig,
  WorkspaceSelectorConfig,
  type HeaderActionConfig,
  type ContentSwitcherConfig,
  type AriaLabels,
  type TileGroup,
  type Workspace,
  watsonXAnimatedLight,
  watsonXStaticLight,
} from '@carbon-labs/react-animated-header';
import { Settings } from '@carbon/react/icons';

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

  const contentSwitcherConfig: ContentSwitcherConfig = useMemo(() => {
    const items = [
      {
        id: 'opt-0',
        text: headerTiles[0].label,
        onSelect: () => setSelectedTile(headerTiles[0]),
      },
      {
        id: 'opt-1',
        text: headerTiles[1].label,
        onSelect: () => setSelectedTile(headerTiles[1]),
      },
    ];

    const selectedIndex = Math.max(
      0,
      Math.min(
        items.findIndex((_, i) => headerTiles[i] === selectedTile),
        items.length - 1
      )
    );

    return {
      ariaLabel: 'Content switcher actions',
      visibleCount: 2,
      // lowContrast: true, // uncomment if you want low-contrast styling
      items,
      selectedIndex,
    };
  }, [selectedTile]);

  const headerActionConfig: HeaderActionConfig = {
    type: 'icon-button',
    icon: Settings,
    iconLabel: 'Open controls',
    onClick: () => alert('Open any modal/panel'),
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
      productName="[Product name]"
      description="Connect, monitor, and manage data."
      welcomeText="Welcome"
      userName="Drew"
      ariaLabels={ariaLabelsConfig}
      headerAnimation={watsonXAnimatedLight}
      headerStatic={watsonXStaticLight}
      allTileGroups={tiles}
      selectedTileGroup={selectedTile}
      workspaceSelectorConfig={workspaceSelectorConfig}
      tasksControllerConfig={tasksControllerConfig}
      contentSwitcherConfig={contentSwitcherConfig}
      headerActionConfig={headerActionConfig}
      isLoading={false}
    />
  );
}

export default App;
