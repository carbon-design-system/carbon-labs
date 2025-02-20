/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {
  ElementType,
  ForwardedRef,
  ComponentProps,
  useContext,
  ComponentType,
} from 'react';
import { SideNavLinkText, SideNavIcon } from '@carbon/react';
import Link from './Link';
import { usePrefix } from '../internal/usePrefix';
import { SideNavContext } from './SideNav';

export interface SideNavMenuItemProps extends ComponentProps<typeof Link> {
  /**
   * Specify the children to be rendered inside of the `SideNavMenuItem`
   */
  children?: React.ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Optionally specify whether the link is "active". An active link is one that
   * has an href that is the same as the current page. Can also pass in
   * `aria-current="page"`, as well.
   */
  isActive?: boolean;

  /**
   * Optionally provide an href for the underlying li`
   */
  href?: string;

  /**
   * Optional component to render instead of default Link
   */
  as?: ElementType;

  /**
   * Provide an icon to render in the side navigation link. Should be a React class.
   */
  renderIcon?: ComponentType;
}

export const SideNavMenuItem = React.forwardRef<
  HTMLElement,
  SideNavMenuItemProps
>(function SideNavMenuItem(props, ref: ForwardedRef<HTMLElement>) {
  const prefix = usePrefix();
  const {
    children,
    className: customClassName,
    as: Component = Link,
    isActive,
    renderIcon: IconElement,
    ...rest
  } = props;
  const { isTreeview } = useContext(SideNavContext);
  const className = cx(`${prefix}--side-nav__menu-item`, customClassName);
  const linkClassName = cx({
    [`${prefix}--side-nav__link`]: true,
    [`${prefix}--side-nav__link--current`]: isActive,
  });

  return (
    <li className={className}>
      <Component
        {...rest}
        aria-selected={isActive ? 'true' : 'false'}
        role={isTreeview ? 'treeitem' : undefined}
        className={linkClassName}
        tabIndex={isTreeview ? -1 : 0}
        ref={ref}>
        {IconElement && (
          <SideNavIcon small>
            <IconElement />
          </SideNavIcon>
        )}
        <SideNavLinkText>{children}</SideNavLinkText>
      </Component>
    </li>
  );
});

SideNavMenuItem.displayName = 'SideNavMenuItem';
SideNavMenuItem.propTypes = {
  /**
   * Optional component to render instead of default Link
   */
  as: PropTypes.elementType,

  /**
   * Specify the children to be rendered inside of the `SideNavMenuItem`
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Optionally provide an href for the underlying li`
   */
  href: PropTypes.string,

  /**
   * Optionally specify whether the link is "active". An active link is one that
   * has an href that is the same as the current page. Can also pass in
   * `aria-current="page"`, as well.
   */
  isActive: PropTypes.bool,

  /**
   * Provide an icon to render in the side navigation link. Should be a React class.
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
