/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Layer } from '@carbon/react';
import mdx from './StylePicker.mdx';
import styles from './_storybook-styles.scss?inline';
import {
  CLABSStylePicker,
  // CLABSStylePickerColor,
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
    styles,
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for StylePicker
 */
export const Default = () => (
  <div className="style-picker-story-container">
    <Layer>
      <CLABSStylePicker open heading="Example">
        <CLABSStylePickerSection>
          <CLABSStylePickerGroup heading="example group">
            <CLABSStylePickerOption
              value="example option"
              label="example option"
            />
          </CLABSStylePickerGroup>
        </CLABSStylePickerSection>
      </CLABSStylePicker>
    </Layer>
  </div>
);
