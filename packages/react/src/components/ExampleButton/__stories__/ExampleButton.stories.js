/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './ExampleButton.mdx';
import { ExampleButton } from '../components/ExampleButton';

export default {
  title: 'Components/ExampleButton',
  component: ExampleButton,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for ExampleButton
 */
export const Default = () => <ExampleButton />;
