/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ReactNode } from 'react';
import { Heading, Section, SectionProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface RegistrationViewContainerProps extends SectionProps<'div'> {
  title: string;
  children: ReactNode;
}

export const RegistrationViewContainer = ({
  title,
  children,
  ...rest
}: RegistrationViewContainerProps) => {
  const prefix = usePrefix();
  return (
    <Section
      {...rest}
      level={4}
      className={`${prefix}--registration-flow__viewcontainer`}>
      <Heading>{title}</Heading>
      {children}
    </Section>
  );
};
