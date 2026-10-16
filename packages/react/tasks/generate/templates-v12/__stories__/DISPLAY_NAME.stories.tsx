/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { DISPLAY_NAME } from '../components/DISPLAY_NAME';
import '../components/STYLE_NAME.scss';
import mdx from './DISPLAY_NAME.mdx';

export default {
  title: 'V12/DISPLAY_NAME',
  component: DISPLAY_NAME,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for DISPLAY_NAME
 */
export const Default = () => <DISPLAY_NAME>DISPLAY_NAME</DISPLAY_NAME>;
