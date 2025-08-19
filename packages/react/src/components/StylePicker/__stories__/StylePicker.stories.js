/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './StylePicker.mdx';
import { StylePicker } from '../components/StylePicker';
import '../components/style-picker.scss';

export default {
  title: 'Components/StylePicker',
  component: StylePicker,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for StylePicker
 */
export const Default = () => <StylePicker />;
