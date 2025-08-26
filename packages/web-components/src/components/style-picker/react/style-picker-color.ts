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
import StylePickerColor from '../components/style-picker-color/style-picker-color';

export const CLABSStylePickerColor = createComponent({
  tagName: 'clabs-style-picker-color',
  elementClass: StylePickerColor,
  react: React,
  events: {},
});
