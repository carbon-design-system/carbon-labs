import React, { HTMLProps } from 'react';
import cx from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
const BubbleHeader = ({
  children,
  className,
  ...rest
}: HTMLProps<HTMLElement>) => {
  const prefix = usePrefix();
  return (
    <header
      {...rest}
      className={cx(`${prefix}--whats-new__bubble__header`, className)}>
      {children}
    </header>
  );
};

BubbleHeader.displayName = 'BubbleHeader';

export { BubbleHeader };
