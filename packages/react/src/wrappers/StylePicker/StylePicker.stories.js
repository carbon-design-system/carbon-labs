/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './StylePicker.mdx';
import { CLABSStylePicker } from './StylePicker';

export default {
  title: 'Wrappers/Style Picker',
  component: CLABSStylePicker,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for CLABSStylePicker
 */
export const Default = () => <CLABSStylePicker />;
