/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './WhatsNew.mdx';
import { WhatsNew } from '../components/WhatsNew';
import '../components/whats-new.scss';

export default {
  title: 'Components/WhatsNew',
  component: WhatsNew,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for WhatsNew
 */
export const Default = () => <WhatsNew />;
