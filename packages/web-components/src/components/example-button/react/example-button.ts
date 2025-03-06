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
import ExampleButton from '../components/example-button/example-button.js';

export const CLABSExampleButton = createComponent({
  tagName: 'clabs-example-button',
  elementClass: ExampleButton,
  react: React,
  events: {},
});
