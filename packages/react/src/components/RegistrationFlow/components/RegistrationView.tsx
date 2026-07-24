/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ReactNode } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface RegistrationViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const RegistrationView = ({
  children,
  ...rest
}: RegistrationViewProps) => {
  const prefix = usePrefix();
  return (
    <div {...rest} className={`${prefix}--registration-flow__view`}>
      {children}
    </div>
  );
};
