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

export const NotFound = ({ usingOutlet }: { usingOutlet?: boolean }) => {
  return usingOutlet ? (
    <h1>Page not found - in the outlet.</h1>
  ) : (
    <HeaderExample>
      {/* Theme goes here for non-outlet. Must be just after header */}
      <Theme as={Content} theme="white">
        <h1>Page not found page.</h1>
      </Theme>
    </HeaderExample>
  );
};
