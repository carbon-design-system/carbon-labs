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
import Feedback from '../components/feedback/feedback.js';

export const C4AIFeedback = createComponent({
  tagName: 'c4ai-feedback',
  elementClass: Feedback,
  react: React,
  events: {},
});
