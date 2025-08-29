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
import { CLABSStylePicker } from '@carbon-labs/wc-style-picker/es/index';

export const StylePicker = createComponent({
  tagName: 'clabs-style-picker',
  elementClass: CLABSStylePicker,
  react: React,
  events: {},
});
