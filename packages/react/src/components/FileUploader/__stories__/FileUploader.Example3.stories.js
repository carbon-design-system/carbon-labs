/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './FileUploader.mdx';

export default {
  title: 'Components/FileUploader/Composable examples',
  tags: ['squad', 'incubating'],
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Example 3 - Coming Soon
 * @returns {React.ReactElement} The rendered component
 */
const ComingSoonTemplate = () => (
  <div className="coming-soon-content">
    <h3>Example 3</h3>
    <p>Coming Soon</p>
    <ul style={{ all: 'revert' }}>
      <li>
        Synchronus file upload to a mock server. with realtime upload progress
        indicators with in-progress, success, failure.
      </li>
      <li>cancel, pause, resume uploads examples</li>
      <li>file renaming</li>
      <li>overflow menu</li>
      <li>status indicator</li>
    </ul>
  </div>
);

export const Example3 = {
  render: ComingSoonTemplate,
};
