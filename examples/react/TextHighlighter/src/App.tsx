/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { TextHighlighter } from '@carbon-labs/react-text-highlighter';

function App() {
  return (
    <p>
      This text is not highlighted
      <TextHighlighter kind='mark' type='default'>
        {' '}
        This is some highlighted text{' '}
      </TextHighlighter>
      This is also not highlighted
    </p>
  );
}

export default App;
