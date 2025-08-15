/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '../internal/usePrefix';
import { SideNavDivider } from '@carbon/react';

export interface SideNavTitleProps {
  /**
   * Provide children to be rendered inside the `SideNavTitle`
   */
  children?: React.ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

export const SideNavTitle: React.FC<SideNavTitleProps> = ({
  children,
  className: customClassName,
}) => {
  const prefix = usePrefix();
  const className = cx(`${prefix}--side-nav__title`, customClassName);

  return (
    <>
      <div className={className}>{children}</div>
      <SideNavDivider></SideNavDivider>
    </>
  );
};

SideNavTitle.propTypes = {
  /**
   * Provide children to be rendered inside the `SideNavTitle`
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
