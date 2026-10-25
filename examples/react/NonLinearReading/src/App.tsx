/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { NonLinearReading } from '@carbon-labs/react-non-linear-reading';

function App() {
  return (
    <p>
      XDR Connect’s correlation{' '}
      <NonLinearReading definition="This is a technical component that uses a set of rules to process alerts from your sources, and streamline threat analysis.">
        engine,
      </NonLinearReading>{' '}
      creates a case by processing data from alerts across multiple security
      tools.
    </p>
  );
}

export default App;
