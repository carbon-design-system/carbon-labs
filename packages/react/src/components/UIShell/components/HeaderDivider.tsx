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

export interface HeaderDividerProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}
export const HeaderDivider: React.FC<HeaderDividerProps> = ({ className }) => {
  const prefix = usePrefix();
  const classNames = cx(`${prefix}--header__divider`, className);
  return <span className={classNames}></span>;
};

HeaderDivider.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
