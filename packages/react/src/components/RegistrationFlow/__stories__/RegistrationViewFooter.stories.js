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
import { Button } from '@carbon/react';
import { RegistrationViewFooter } from '../components/RegistrationViewFooter';
import './RegistrationFlow.stories.scss';

export default {
  title: 'Components/RegistrationFlow',
  tags: ['squad', 'incubating'],
  component: RegistrationViewFooter,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for RegistrationFlow
 */
export const RegistrationViewFooterStory = () => {
  return (
    <RegistrationViewFooter>
      <Button>Submit</Button>
    </RegistrationViewFooter>
  );
};
