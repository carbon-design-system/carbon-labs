/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import ExtendedButton from '../components/extended-button/extended-button.js';

export const C4AIExtendedButton = createComponent({
  tagName: 'c4ai-extended-button',
  elementClass: ExtendedButton,
  react: React,
  events: {},
});
