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
import StylePickerSection from '../components/style-picker-section/style-picker-section';

export const CLABSStylePickerSection = createComponent({
  tagName: 'clabs-style-picker-section',
  elementClass: StylePickerSection,
  react: React,
  events: {},
});
