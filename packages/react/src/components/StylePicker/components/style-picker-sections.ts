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
import { CLABSStylePickerSections } from '@carbon-labs/wc-style-picker/es/index.js';

export const StylePickerSections = createComponent({
  tagName: 'clabs-style-picker-sections',
  elementClass: CLABSStylePickerSections,
  react: React,
  events: {},
});
