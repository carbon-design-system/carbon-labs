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
import { CLABSStylePickerSection } from '@carbon-labs/wc-style-picker/es/index';

export const StylePickerSection = createComponent({
  tagName: 'clabs-style-picker-section',
  elementClass: CLABSStylePickerSection,
  react: React,
  events: {},
});
