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
import { RegistrationGreeting } from '../components/RegistrationGreeting';
import './RegistrationFlow.stories.scss';
import React from 'react';
export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationGreeting,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationGreeting
 */
export const RegistrationGreetingStory = () => {
  return (
    <RegistrationGreeting title="IBM Product" description="Description here" />
  );
};
