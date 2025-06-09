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

export const GenericPage = ({ usingOutlet }: { usingOutlet?: boolean }) => {
  const location = useLocation();

  return usingOutlet ? (
    <>A placeholder page, in an outlet, at route "{location.pathname}".</>
  ) : (
    <HeaderExample>
      {/* Theme goes here for non-outlet. Must be just after header */}
      <Theme as={Content} theme='white'>
        A placeholder page at route "{location.pathname}".
      </Theme>
    </HeaderExample>
  );
};
