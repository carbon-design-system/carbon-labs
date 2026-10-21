/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ForwardedRef, PropsWithChildren, ReactNode } from 'react';
import { Launch } from '@carbon/react/icons';
import { Link } from '@carbon/react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

export interface InlineTipLinkProps extends PropsWithChildren {
  /**
   * Provide the contents of the InlineTipLink.
   */
  children: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node.
   */
  className?: string;
}

/**
 * This is a standard Carbon link, styled specifically for use inside InlineTip.
 */
export const InlineTipLink = React.forwardRef(
  (
    { children, className, ...rest }: InlineTipLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const prefix = usePrefix();
    const blockClass = `${prefix}--inline-tip__link`;

    return (
      <Link
        {...rest}
        className={cx(blockClass, className)}
        ref={ref}
        renderIcon={() => <Launch size={16} />}>
        {children}
      </Link>
    );
  }
);

InlineTipLink.displayName = 'InlineTipLink';

InlineTipLink.propTypes = {
  /**
   * Provide the contents of the InlineTipLink.
   */
  children: PropTypes.node
    .isRequired as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,
};
