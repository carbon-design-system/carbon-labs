/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { forwardRef, type ReactNode } from 'react';
import cx from 'classnames';
// Carbon's own prefix (`cds`), so class names move to @carbon/react unchanged.
import { usePrefix } from '@carbon/react';

export interface DISPLAY_NAMEProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Provide the content of the DISPLAY_NAME
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

export const DISPLAY_NAME = forwardRef<HTMLDivElement, DISPLAY_NAMEProps>(
  function DISPLAY_NAME({ children, className, ...rest }, ref) {
    const prefix = usePrefix();

    return (
      <div
        ref={ref}
        className={cx(`${prefix}--STYLE_NAME`, className)}
        {...rest}>
        {children}
      </div>
    );
  }
);

DISPLAY_NAME.displayName = 'DISPLAY_NAME';
