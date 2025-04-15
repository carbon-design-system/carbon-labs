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
