/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HeaderExample } from '../components/HeaderExample';
import { Content, Theme } from '@carbon/react';

import { useLocation } from 'react-router';

export const Placeholder = ({ usingOutlet }: { usingOutlet?: boolean }) => {
  const location = useLocation();

  return usingOutlet ? (
    <h1>{location.pathname}</h1>
  ) : (
    <HeaderExample>
      {/* Theme goes here for non-outlet. Must be just after header */}
      <Theme as={Content} theme='white'>
        <h1>{location.pathname}</h1>
      </Theme>
    </HeaderExample>
  );
};
