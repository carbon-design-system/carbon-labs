/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { HTMLProps } from 'react';
import cx from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface BubbleHeaderProps extends HTMLProps<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

const BubbleHeader = ({ children, className, ...rest }: BubbleHeaderProps) => {
  const labsPrefix = usePrefix();
  const prefix = `${labsPrefix}--whats-new`;
  return (
    <header {...rest} className={cx(`${prefix}__bubble__header`, className)}>
      {children}
    </header>
  );
};

BubbleHeader.displayName = 'BubbleHeader';

export { BubbleHeader };
