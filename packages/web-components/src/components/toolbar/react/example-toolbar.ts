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
import Toolbar from '../components/toolbar/src/toolbar.template';

export const CLABSToolbar = createComponent({
  tagName: 'clabs-toolbar',
  elementClass: Toolbar,
  react: React,
  events: {},
});
