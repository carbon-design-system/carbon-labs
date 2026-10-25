/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Tile } from '@carbon/react';
import { Cascade } from '@carbon-labs/react-cascade';

function App() {
  return (
    <Cascade>
      <Tile>Card 1</Tile>
      <Tile>Card 2</Tile>
      <Tile>Card 3</Tile>
      <Tile>Card 4</Tile>
    </Cascade>
  );
}

export default App;
