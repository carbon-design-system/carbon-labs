/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { CARBON_SIDENAV_ITEMS } from './_utils';
import { SIDE_NAV_TYPE } from './SideNav';
import { usePrefix } from '../internal/usePrefix';

export interface SideNavItemsProps {
  /**
   * Provide a single icon as the child to `SideNavIcon` to render in the
   * container
   */
  children: React.ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Property to indicate if the side nav container is open (or not). Use to
   * keep local state and styling in step with the SideNav expansion state.
   */
  isSideNavExpanded?: boolean;

  navType: SIDE_NAV_TYPE;
}

export const SideNavItems: React.FC<SideNavItemsProps> = ({
  className: customClassName,
  children,
  isSideNavExpanded,
  navType: propType,
}) => {
  const prefix = usePrefix();
  const className = cx([`${prefix}--side-nav__items`], customClassName);
  const childrenWithExpandedState = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // avoid spreading `isSideNavExpanded` to non-Carbon UI Shell children
      const childJsxElement = child as JSX.Element;
      const childDisplayName =
        childJsxElement.type?.displayName ?? childJsxElement.type?.name;

      const isCarbonSideNavItem =
        CARBON_SIDENAV_ITEMS.includes(childDisplayName);
      const isSideNavMenu = childDisplayName === 'SideNavMenu';

      return React.cloneElement(child, {
        ...(isCarbonSideNavItem && { isSideNavExpanded: isSideNavExpanded }),
        ...(isSideNavMenu && {
          depth: 0,
          navType: propType,
        }),
      });
    }
  });
  return <ul className={className}>{childrenWithExpandedState}</ul>;
};

SideNavItems.displayName = 'SideNavItems';
SideNavItems.propTypes = {
  /**
   * Provide a single icon as the child to `SideNavIcon` to render in the
   * container
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Property to indicate if the side nav container is open (or not). Use to
   * keep local state and styling in step with the SideNav expansion state.
   */
  isSideNavExpanded: PropTypes.bool,
};
