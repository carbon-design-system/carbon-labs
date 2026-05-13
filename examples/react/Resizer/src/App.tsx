/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resizer } from '@carbon-labs/react-resizer';

function App() {
  return (
    <div className="resizer-demo">
      <div className="resizer-demo__pane">First region</div>
      <Resizer orientation="vertical thinkness={4}" />
      <div className="resizer-demo__pane">Second region</div>
    </div>
  );
}

export default App;
