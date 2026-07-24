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

interface RegistrationViewFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const RegistrationViewFooter = ({
  children,
  ...rest
}: RegistrationViewFooterProps) => {
  const prefix = usePrefix();
  return (
    <div {...rest} className={`${prefix}--registration-flow__view-footer`}>
      {children}
    </div>
  );
};
