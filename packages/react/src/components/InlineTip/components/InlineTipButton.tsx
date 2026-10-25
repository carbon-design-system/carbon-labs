/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ForwardedRef, PropsWithChildren, ReactNode } from 'react';
import { Button } from '@carbon/react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

export interface InlineTipButtonProps {
  /**
   * Provide an optional class to be applied to the containing node.
   */
  className?: string;
  /**
   * Provide the contents of the InlineTip.
   */
  children: ReactNode;
}

/**
 * This is a standard Carbon button, styled specifically for use inside InlineTip.
 */
export const InlineTipButton = React.forwardRef(
  (
    { children, className, ...rest }: PropsWithChildren<InlineTipButtonProps>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const prefix = usePrefix();
    const blockClass = `${prefix}--inline-tip__button`;

    return (
      <Button
        {...rest}
        className={cx(blockClass, className)}
        ref={ref}
        size="md"
        kind="ghost">
        {children}
      </Button>
    );
  }
);

InlineTipButton.displayName = 'InlineTipButton';

InlineTipButton.propTypes = {
  /**
   * Provide the contents of the InlineTipButton.
   */
  children: PropTypes.node
    .isRequired as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,
};
