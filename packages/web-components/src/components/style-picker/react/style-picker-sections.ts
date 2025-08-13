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
import StylePickerSections from '../components/style-picker-sections/style-picker-sections.js';

export const CLABSStylePickerSections = createComponent({
  tagName: 'clabs-style-picker-sections',
  elementClass: StylePickerSections,
  react: React,
  events: {},
});
