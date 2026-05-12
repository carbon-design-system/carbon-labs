/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { action } from 'storybook/actions';
import { Layer, IconButton } from '@carbon/react';
import {
  ColorPalette,
  TrashCan,
  OverflowMenuVertical,
} from '@carbon/react/icons';
import mdx from './StylePicker.mdx';
import styles from './_storybook-styles.scss?inline';
import {
  StylePicker,
  StylePickerColor,
  StylePickerGroup,
  StylePickerOption,
  StylePickerSection,
} from '../components';

export default {
  title: 'Components/StylePicker',
  component: StylePicker,
  parameters: {
    layout: 'centered',
    styles,
    docs: {
      page: mdx,
    },
  },
};

const colors = ['red', 'blue', 'green'];

/**
 * Default story for StylePicker
 */
export const Default = () => {
  const [open, setOpen] = useState(true);
  /**
   * Open handler
   */
  const handleOpen = () => {
    setOpen(!open);
  };

  /**
   * onChange callback
   */
  const handleOptionChange = () => {
    action('onChange');
  };
  return (
    <div className="style-picker-story-container">
      <Layer className="toolbar-layer">
        <StylePicker open={open} heading="Choose color" enableSearch>
          <div slot="trigger" style={{ display: 'contents' }}>
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
