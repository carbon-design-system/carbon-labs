/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './Props.mdx';

// The prop vocabulary is a module of shared types and resolvers, not a
// component; the docs page is the reference.
export default {
  title: 'V12/Props',
  tags: ['alpha'],
  parameters: {
    docs: { page: mdx },
    v12: { motion: [], reduced: {}, states: [] },
  },
};

export const Default = {
  render: () => <p>The shared prop vocabulary. See the docs page.</p>,
};
