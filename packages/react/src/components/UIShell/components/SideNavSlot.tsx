/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { ComponentType } from 'react';
import { usePrefix } from '../internal/usePrefix';

export interface SideNavSlotProps {
  /**
   * Provide children to be rendered inside the `SideNavSlot`
   */
  children?: React.ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Provide an icon to render when the SideNav is in rail mode and collapsed.
   * The icon will be shown instead of child component when collapsed.
   */
  renderIcon?: ComponentType;
}

export const SideNavSlot: React.FC<SideNavSlotProps> = ({
  children,
  className: customClassName,
  renderIcon: IconElement,
}) => {
  const prefix = usePrefix();
  const className = cx(`${prefix}--side-nav__slot`, customClassName);

  return (
    <li className={className}>
      {IconElement && (
        <div className={`${prefix}--side-nav__icon`}>
          <IconElement />
        </div>
      )}
      <div className={`${prefix}--side-nav__slot-item`}>{children}</div>
    </li>
  );
};

SideNavSlot.propTypes = {
  /**
   * Provide children to be rendered inside the `SideNavSlot`
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Provide an icon to render when the SideNav is in rail mode and collapsed.
   * The icon will be shown instead of child component when collapsed.
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
