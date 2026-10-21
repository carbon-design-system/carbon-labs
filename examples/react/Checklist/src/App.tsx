/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Checklist } from '@carbon-labs/react-checklist';

function App() {
  return (
    <div className="checklist-example">
      <Checklist
        title="Get started checklist"
        chartValue={0.33}
        chartLabel="33% complete"
        taskLists={[
          {
            title: 'Section label',
            tasks: [
              { kind: 'checked', label: 'Task name', onClick: () => {} },
              { kind: 'indeterminate', label: 'Task name', onClick: () => {} },
              { kind: 'unchecked', label: 'Task name' },
            ],
          },
        ]}
        viewAllLabel="View all (10)"
      />
    </div>
  );
}

export default App;
