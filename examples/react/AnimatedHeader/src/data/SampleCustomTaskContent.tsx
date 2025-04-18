/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProgressIndicator, ProgressStep, Stack } from '@carbon/react';
import React from 'react';

const SampleCustomTaskContent = () => {
  return (
    <Stack orientation="vertical" gap={8}>
      <h3>Continue your sample process</h3>
      <ProgressIndicator vertical>
        <ProgressStep
          complete
          label="First step"
          description="Sample first step"
        />
        <ProgressStep
          current
          label="Second step"
          description="Sample second step"
        />
        <ProgressStep label="Third step" description="Sample third step" />
        <ProgressStep label="Fourth step" description="Sample fourth step" />
      </ProgressIndicator>
    </Stack>
  );
};

export default SampleCustomTaskContent;
