/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import mdx from './RegistrationFlow.mdx';
import '../components/registration-flow.scss';
import { Button } from '@carbon/react';
import { RegistrationViewStack } from '../components/RegistrationViewStack';
import { RegistrationView } from '../components/RegistrationView';
import { RegistrationViewFooter } from '../components/RegistrationViewFooter';
import './RegistrationFlow.stories.scss';
import { initCarousel } from '@carbon/utilities';

export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationViewStack,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationFlow
 */
export const RegistrationViewStackStory = () => {
  const viewStackRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('ViewStackContainer');
    const config = {
      excludeSwipeSupport: true,
      useMaxHeight: true,
    };
    console.log('INIT NOW....');
    viewStackRef.current = initCarousel(container, config);
  }, []);
  return (
    <RegistrationViewStack id="ViewStackContainer">
      <RegistrationView>
        <RegistrationViewFooter>
          <Button kind="primary" onClick={() => viewStackRef.current?.next()}>
            Next
          </Button>
        </RegistrationViewFooter>
      </RegistrationView>
      <RegistrationView>
        <RegistrationViewFooter>
          <Button kind="primary" onClick={() => viewStackRef.current?.prev()}>
            Back
          </Button>
        </RegistrationViewFooter>
      </RegistrationView>
    </RegistrationViewStack>
  );
};
