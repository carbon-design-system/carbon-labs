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
import { CLABSStylePickerOption } from '@carbon-labs/wc-style-picker/es/index';

export const StylePickerOption = createComponent({
  tagName: 'clabs-style-picker-option',
  elementClass: CLABSStylePickerOption,
  react: React,
  events: {
    onChange: 'clabs-style-picker-option-select',
  },
});
