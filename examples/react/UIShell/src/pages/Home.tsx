/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StoryContent } from '../components/StoryContent';
import { HeaderExample } from '../components/HeaderExample';
import { Content, Theme } from '@carbon/react';

export const Home = ({ usingOutlet }: { usingOutlet?: boolean }) => {
  return usingOutlet ? (
    <StoryContent />
  ) : (
    <HeaderExample>
      {/* Theme goes here for non-outlet. Must be just after header */}
      <Theme as={Content} theme='white'>
        <StoryContent />
      </Theme>
    </HeaderExample>
  );
};
