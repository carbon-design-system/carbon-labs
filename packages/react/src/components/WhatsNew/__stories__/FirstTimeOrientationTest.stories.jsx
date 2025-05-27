/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import './storybook.scss';
import mdx from './WhatsNew.mdx';
import App from '../../../../../../examples/react/FirstTimeOrientation/src/App';

export default {
  title: 'Patterns/WhatsNew',

  parameters: {
    docs: {
      page: mdx,
    },
  },
};

export const FirstTimeOrientationStory = () => <App></App>;
