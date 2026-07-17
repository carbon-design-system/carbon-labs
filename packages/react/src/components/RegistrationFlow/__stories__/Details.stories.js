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
import { Details } from '../components/Details';
import './RegistrationFlow.stories.scss';

export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: Details,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationFlow
 */
export const DetailStory = () => {
  return (
    <Details title="Title" subtitle="This is the subtitle">
      <>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          lacinia quis libero a vestibulum. Vivamus blandit posuere rhoncus:
        </p>
        <ul>
          <li>Mauris imperdiet iaculis auctor.</li>
          <li>
            Aliquam vulputate mi sed risus varius, ut imperdiet libero pharetra.
          </li>
          <li>Donec accumsan ex risus, ac iaculis nulla ultricies nec.</li>
        </ul>
        <Button
          className="full-width-button"
          kind="tertiary"
          href="http://www.ibm.com">
          Go to the IBM website
        </Button>
      </>
    </Details>
  );
};
