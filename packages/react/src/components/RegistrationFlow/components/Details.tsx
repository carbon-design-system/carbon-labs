import { Heading, Section } from '@carbon/react';
import { DetailsHTMLAttributes, ReactNode } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import React from 'react';
interface iDetails extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const prefix = 'clabs';
const blockClass = `${prefix}--details`;

const Details = (props: iDetails) => {
  const { title, subtitle, children, ...rest } = props;
  const prefix = usePrefix();

  return (
    <details className={`${prefix}--details`} {...rest}>
      <summary>
        <Section>
          <Heading>{title}</Heading>
          {subtitle && <p className={`${blockClass}-subtitle`}>{subtitle}</p>}
        </Section>
      </summary>
      <div className={`${blockClass}-content`}>{children}</div>
    </details>
  );
};

export { Details };
