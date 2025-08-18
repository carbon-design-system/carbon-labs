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
   * Provide a title to `SideNavTitle`
   */
  title?: string;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

export const SideNavTitle: React.FC<SideNavTitleProps> = ({
  title,
  className: customClassName,
}) => {
  const prefix = usePrefix();
  const className = cx(`${prefix}--side-nav__title`, customClassName);

  return (
    <>
      <li className={className}>{title}</li>
      <SideNavDivider></SideNavDivider>
    </>
  );
};

SideNavTitle.propTypes = {
  /**
   * Provide a title to `SideNavTitle`
   */
  title: PropTypes.string,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
