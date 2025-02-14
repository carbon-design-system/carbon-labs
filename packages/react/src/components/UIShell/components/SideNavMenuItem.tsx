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
  useEffect,
  useRef,
  useContext,
} from 'react';
import { SideNavLinkText } from '@carbon/react';
import Link from './Link';
import { usePrefix } from '../internal/usePrefix';
import { useMergedRefs } from '../internal/useMergedRefs';
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
   * **Note:** this is controlled by the parent SideNavMenu component, do not set manually.
   * SideNavMenu depth to determine spacing
   */
  depth?: number;

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
}

export const SideNavMenuItem = React.forwardRef<
  HTMLElement,
  SideNavMenuItemProps
>(function SideNavMenuItem(props, ref: ForwardedRef<HTMLElement>) {
  const prefix = usePrefix();
  const {
    children,
    className: customClassName,
    depth: propDepth,
    as: Component = Link,
    isActive,
    ...rest
  } = props;
  const { isTreeview } = useContext(SideNavContext);
  const className = cx(`${prefix}--side-nav__menu-item`, customClassName);
  const depth = propDepth as number;
  const linkClassName = cx({
    [`${prefix}--side-nav__link`]: true,
    [`${prefix}--side-nav__link--current`]: isActive,
  });

  const linkRef = useRef<HTMLElement | null>(null);
  const itemRef = useMergedRefs([linkRef, ref]);

  useEffect(() => {
    const calcLinkOffset = () => {
      return 4 + Math.max(0, depth - 1) * 1;
    };

    if (linkRef.current) {
      linkRef.current.style.paddingLeft = `${calcLinkOffset()}rem`;
    }
  }, []);

  return (
    <li className={className}>
      <Component
        {...rest}
        aria-selected={isActive ? 'true' : 'false'}
        role={isTreeview ? 'treeitem' : undefined}
        className={linkClassName}
        tabIndex={isTreeview ? -1 : 0}
        ref={itemRef}>
        <SideNavLinkText>{children}</SideNavLinkText>
      </Component>
    </li>
  );
});

SideNavMenuItem.displayName = 'SideNavMenuItem';
SideNavMenuItem.propTypes = {
  /**
   * Specify the children to be rendered inside of the `SideNavMenuItem`
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * **Note:** this is controlled by the parent SideNavMenu component, do not set manually.
   * SideNavMenu depth to determine spacing
   */
  depth: PropTypes.number,

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
   * Optional component to render instead of default Link
   */
  as: PropTypes.elementType,
};
