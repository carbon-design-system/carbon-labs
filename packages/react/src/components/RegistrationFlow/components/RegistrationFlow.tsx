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
import { Content } from '@carbon/react';
/** Primary UI component for user interaction */

interface RegistrationFlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  backgroundImage?: string;
}

export const RegistrationFlow = ({
  children,
  backgroundImage,
  ...rest
}: RegistrationFlowProps) => {
  const prefix = usePrefix();

  return (
    <div
      className={`${prefix}--registration-flow__container`}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
      {...rest}>
      {children}
    </div>
  );
};
