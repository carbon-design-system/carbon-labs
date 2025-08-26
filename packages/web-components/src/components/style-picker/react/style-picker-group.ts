/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import StylePickerGroup from '../components/style-picker-group/style-picker-group';

export const CLABSStylePickerGroup = createComponent({
  tagName: 'clabs-style-picker-group',
  elementClass: StylePickerGroup,
  react: React,
  events: {},
});
