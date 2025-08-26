/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Layer, IconButton } from '@carbon/react';
import {
  ColorPalette,
  TrashCan,
  OverflowMenuVertical,
} from '@carbon/react/icons';
import mdx from './StylePicker.mdx';
import styles from './_storybook-styles.scss?inline';
import {
  CLABSStylePicker,
  CLABSStylePickerColor,
  CLABSStylePickerGroup,
  // CLABSStylePickerIcon,
  CLABSStylePickerOption,
  CLABSStylePickerSection,
  // CLABSStylePickerSections,
} from '../index';

export default {
  title: 'Components/StylePicker',
  component: CLABSStylePicker,
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
export const Default = () => (
  <div className="style-picker-story-container">
    <Layer className="toolbar-layer">
      <CLABSStylePicker open heading="Choose color" enableSearch>
        <div slot="trigger" style={{ display: 'contents' }}>
          <IconButton label="Color palette" kind="ghost">
            <ColorPalette />
          </IconButton>
        </div>
        <CLABSStylePickerSection>
          <CLABSStylePickerGroup heading="Color">
            {colors.map((color) => (
              <CLABSStylePickerOption key={color} value={color} label={color}>
                <CLABSStylePickerColor color={color} label={color} />
              </CLABSStylePickerOption>
            ))}
          </CLABSStylePickerGroup>
        </CLABSStylePickerSection>
      </CLABSStylePicker>
      <IconButton label="Delete" kind="ghost">
        <TrashCan />
      </IconButton>
      <IconButton label="More" kind="ghost">
        <OverflowMenuVertical />
      </IconButton>
    </Layer>
  </div>
);
