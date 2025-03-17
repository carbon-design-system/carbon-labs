/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { AnimatedHeader } from '@carbon-labs/react-animated-header/es/index';
import {
  watsonXAnimatedLight,
  watsonXStaticLight,
} from '@carbon-labs/react-animated-header/assets';
import { headerTiles, workspaceData } from './data';

function App() {
  const [tiles] = useState(headerTiles);
  const [workspaces] = useState(workspaceData);
  const [selectedTile, setSelectedTile] = useState(tiles[0]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);

  const handleWorkspaceSelect = (e: any) => {
    setSelectedWorkspace(e.selectedItem);
  };

  const handleTileGroup = (e: any) => {
    setSelectedTile(e.selectedItem.id);
  };

  return (
    <AnimatedHeader
      welcomeText="Welcome"
      userName="Drew"
      description="Connect, monitor, and manage data."
      buttonText="Manage data"
      buttonType="tertiary"
      buttonIcon="Launch"
      headerDropdown={false}
      productName="[Product name]"
      headerAnimation={watsonXAnimatedLight}
      headerStatic={watsonXStaticLight}
      selectedWorkspace={selectedWorkspace}
      setSelectedWorkspace={handleWorkspaceSelect}
      allWorkspaces={workspaces}
      selectedTileGroup={selectedTile}
      setSelectedTileGroup={handleTileGroup}
      allTiles={tiles}
    />
  );
}

export default App;
