/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Layer, IconButton } from '@carbon/react';
import {
  ColorPalette,
  TrashCan,
  OverflowMenuVertical,
} from '@carbon/react/icons';
import {
  StylePicker,
  StylePickerColor,
  StylePickerGroup,
  StylePickerOption,
  StylePickerSection,
} from '@carbon-labs/react-style-picker';

const colors = ['red', 'blue', 'green'];

const App = () => {
  const [open, setOpen] = useState(true);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleOptionChange = () => {
    console.log('change');
  };

  return (
    <div className="style-picker-example-container">
      <Layer className="toolbar-layer">
        <StylePicker open={open} heading="Choose color" enableSearch>
          <div className="trigger-slot" slot="trigger">
            <IconButton label="Color palette" kind="ghost" onClick={handleOpen}>
              <ColorPalette />
            </IconButton>
          </div>
          <StylePickerSection>
            <StylePickerGroup heading="Color">
              {colors.map((color) => (
                <StylePickerOption
                  key={color}
                  value={color}
                  label={color}
                  onChange={handleOptionChange}>
                  <StylePickerColor color={color} label={color} />
                </StylePickerOption>
              ))}
            </StylePickerGroup>
          </StylePickerSection>
        </StylePicker>
        <IconButton label="Delete" kind="ghost">
          <TrashCan />
        </IconButton>
        <IconButton label="More" kind="ghost">
          <OverflowMenuVertical />
        </IconButton>
      </Layer>
    </div>
  );
};

export default App;
