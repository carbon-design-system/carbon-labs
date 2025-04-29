/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef } from 'react';
import { CARBON_SIDENAV_ITEMS } from './_utils';
import { usePrefix } from '../internal/usePrefix';
import { SideNavContext } from './SideNav';

export interface SideNavItemsProps {
  /**
   * Object to provide an aria-label to the component when used in treeview,
   * to ensure it meets a11y requirements.
   */
  accessibilityLabel: object;

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
}

export const SideNavItems: React.FC<SideNavItemsProps> = ({
  className: customClassName,
  children,
  isSideNavExpanded,
  accessibilityLabel: accessibilityLabel,
}) => {
  const { isTreeview } = useContext(SideNavContext);
  const listRef = useRef<HTMLUListElement>(null); // Adjust type if necessary
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
        }),
      });
    }
  });

  useEffect(() => {
    // set SideNavLink's role without needing to extend original component
    if (isTreeview && listRef.current) {
      const sideNavItem = listRef.current.querySelectorAll(
        `.${prefix}--side-nav__item a`
      );
      sideNavItem.forEach((e) => {
        if (!e.hasAttribute('role')) {
          e.setAttribute('role', 'treeitem');
        }
      });
    }
  }, [isTreeview]);

  return (
    <ul
      {...(isTreeview && accessibilityLabel)}
      ref={listRef}
      className={className}
      role={isTreeview ? 'tree' : ''}>
      {childrenWithExpandedState}
    </ul>
  );
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
