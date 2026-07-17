/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Heading, Section, SectionProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface RegistrationGreetingProps extends SectionProps<'div'> {
  title: string;
  description: string;
}

export const RegistrationGreeting = ({
  title,
  description,
  ...rest
}: RegistrationGreetingProps) => {
  const prefix = usePrefix();
  return (
    <Section className={`${prefix}--registration-flow__greeting`} {...rest}>
      <Heading className={`${prefix}--registration-flow__greeting-heading`}>
        {title}
      </Heading>
      <p>{description}</p>
    </Section>
  );
};
