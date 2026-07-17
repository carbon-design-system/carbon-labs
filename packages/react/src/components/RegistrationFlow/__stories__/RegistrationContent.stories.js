/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState } from 'react';
import mdx from './RegistrationFlow.mdx';
import '../components/registration-flow.scss';
import { Button } from '@carbon/react';
import { RegistrationContent } from '../components/RegistrationContent';
import './RegistrationFlow.stories.scss';

export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationContent,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationFlow
 */
export const RegistrationContentStory = () => {
  return (
    <RegistrationContent>
      <div>Hello world</div>
    </RegistrationContent>
  );
};
