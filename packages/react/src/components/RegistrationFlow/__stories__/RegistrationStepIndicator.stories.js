/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mdx from './RegistrationFlow.mdx';
import '../components/registration-flow.scss';
import { RegistrationStepIndicator } from '../components/RegistrationStepIndicator';
import './RegistrationFlow.stories.scss';
import React from 'react';
export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationStepIndicator,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationStepIndicator
 */
export const RegistrationStepIndicatorStory = () => {
  return (
    <RegistrationStepIndicator
      currentIndex={0}
      progress={0.5}
      stepLabels={['Flow 1', 'Flow 2', 'Flow 3']}
    />
  );
};
