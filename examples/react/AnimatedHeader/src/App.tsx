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
import headerTiles from './data';

function App() {
  const [data] = useState(headerTiles);
  const [selectedTile, setSelectedTile] = useState(data[0]);

  const setSelectedTileGroup = (e: any) => {
    setSelectedTile(e.selectedItem);
  };

  return (
    <AnimatedHeader
      name="Drew"
      description="Connect, monitor, and manage data."
      buttonText="Manage data"
      buttonType="tertiary"
      buttonIcon="Launch"
      headerDropdown={false}
      productName="[Product name]"
      headerAnimation={watsonXAnimatedLight}
      headerStatic={watsonXStaticLight}
      tileDropdownItems={tileDropdownData}
      selectedTileGroup={selectedTile}
      setSelectedTileGroup={setSelectedTileGroup}
      allTiles={data}
    />
  );
}

export default App;
