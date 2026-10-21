/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  InlineTip,
  InlineTipButton,
  InlineTipLink,
} from '@carbon-labs/react-inline-tip';

function App() {
  return (
    <div className="inline-tip-example">
      <InlineTip
        title="Use case-specific heading"
        action={<InlineTipButton>Click me</InlineTipButton>}
        onClose={() => {}}>
        <p>
          Use case-specific content that explains the concept or adds context.{' '}
          <InlineTipLink href="https://www.ibm.com" target="_blank">
            Learn more
          </InlineTipLink>
        </p>
      </InlineTip>
    </div>
  );
}

export default App;
