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
import StylePickerOption from '../components/style-picker-option/style-picker-option.js';

export const CLABSStylePickerOption = createComponent({
  tagName: 'clabs-style-picker-option',
  elementClass: StylePickerOption,
  react: React,
  events: {},
});
