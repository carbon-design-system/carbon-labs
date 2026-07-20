/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ReactNode, HTMLAttributes } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { Content } from '@carbon/react';
/** Primary UI component for user interaction */

interface RegistrationContentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export const RegistrationContent = ({
  children,
  ...rest
}: RegistrationContentProps) => {
  const prefix = usePrefix();
  return (
    <Content className={`${prefix}--registration-flow__body`}>
      {children}
    </Content>
  );
};
