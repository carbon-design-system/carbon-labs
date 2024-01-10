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
import TestInput from '../components/test-input/test-input.js';

export const C4AITestInput = createComponent({
  tagName: 'c4ai-test-input',
  elementClass: TestInput,
  react: React,
  events: {},
});
