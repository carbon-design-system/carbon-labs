/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChevronDown } from '@carbon/icons-react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {
  ForwardedRef,
  ReactNode,
  Ref,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CARBON_SIDENAV_ITEMS } from './_utils';
import { SideNavIcon } from '@carbon/react';
import { keys, match } from '../internal/keyboard';
import { usePrefix } from '../internal/usePrefix';
import { SIDE_NAV_TYPE, SideNavContext } from './SideNav';
import { useMergedRefs } from '../internal/useMergedRefs';

export interface SideNavMenuProps {
  /**
   * An optional CSS class to apply to the component.
   */
  className?: string;

  /**
   * The content to render within the SideNavMenu component.
   */
  children?: React.ReactNode;

  /**
   * Specifies whether the menu should be expanded by default.
   */
  defaultExpanded?: boolean;

  /**
   * **Note:** this is controlled by the parent SideNav component, do not set manually.
   * SideNavMenu depth to determine spacing
   */
  depth?: number;

  /**
   * Indicates whether the SideNavMenu is active.
   */
  isActive?: boolean;

  /**
   * Specifies whether the SideNavMenu is in a large variation.
   */
  large?: boolean;

  /**
   * The SideNav's nav type
   */
  navType: SIDE_NAV_TYPE;

  /**
   * A custom icon to render next to the SideNavMenu title. This can be a function returning JSX or JSX itself.
   */
  renderIcon?: React.ComponentType;

  /**
   * Indicates if the side navigation container is expanded or collapsed.
   */
  isSideNavExpanded?: boolean;

  /**
   * The tabIndex for the button element.
   * If not specified, the default validation will be applied.
   */
  tabIndex?: number;

  // The title for the overall menu name.

  title: string;
}

export const SideNavMenu = React.forwardRef<HTMLElement, SideNavMenuProps>(
  function SideNavMenu(
    {
      className: customClassName,
      children,
      defaultExpanded = false,
      depth: propDepth,
      isActive = false,
      large = false,
      renderIcon: IconElement,
      isSideNavExpanded,
      navType,
      title,
    },
    ref: ForwardedRef<HTMLElement>
  ) {
    const depth = propDepth as number;
    const { isRail } = useContext(SideNavContext);
    const prefix = usePrefix();
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
    const [active, setActive] = useState<boolean>(isActive);
    const firstLink = useRef<string | null>(null);

    const [prevExpanded, setPrevExpanded] = useState<boolean>(defaultExpanded);

    const className = cx({
      [`${prefix}--side-nav__item`]: true,
      [`${prefix}--side-nav__item--active`]:
        active || (hasActiveDescendant(children) && !isExpanded),
      [`${prefix}--side-nav__item--icon`]: IconElement,
      [`${prefix}--side-nav__item--large`]: large,
      [customClassName as string]: !!customClassName,
    });

    const buttonClassName = cx({
      [`${prefix}--side-nav__submenu`]: true,
      [`${prefix}--side-nav__submenu--active`]:
        active || (hasActiveDescendant(children) && isExpanded),
    });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLLIElement>(null);
    const menuRef = useMergedRefs([buttonRef, ref]);

    if (!isSideNavExpanded && isExpanded && isRail) {
      setIsExpanded(false);
      setPrevExpanded(true);
    } else if (isSideNavExpanded && prevExpanded && isRail) {
      setIsExpanded(true);
      setPrevExpanded(false);
    }

    let childrenToRender = children;

    // modify nested SideNavMenus
    childrenToRender = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childJsxElement = child as JSX.Element;

        const childDisplayName =
          childJsxElement.type?.displayName ?? childJsxElement.type?.name;

        const isCarbonSideNavItem =
          CARBON_SIDENAV_ITEMS.includes(childDisplayName);

        return React.cloneElement(child, {
          ...(isCarbonSideNavItem && {
            isSideNavExpanded: isSideNavExpanded,
          }),
          ...{
            depth: depth + 1,
            navType: navType,
          },
        });
      }

      return child;
    });

    useEffect(() => {
      if (depth === 0) return;

      if (!firstLink?.current && listRef?.current) {
        const firstLinkElement = listRef.current!.querySelector(
          `.${prefix}--side-nav__menu-item a`
        );

        firstLink.current = firstLinkElement?.getAttribute('href') ?? '';
      }

      if (navType == SIDE_NAV_TYPE.TREEVIEW) {
        const calcButtonOffset = () => {
          // menu with icon
          if (children && IconElement) {
            return depth + 3;
          }

          // menu without icon
          if (children) {
            return depth * 4;
          }
          return depth;
        };

        if (buttonRef.current) {
          buttonRef.current.style.paddingLeft = `${calcButtonOffset()}rem`;
        }
      }
    }, []);

    /**
     * Returns the parent SideNavMenu, if node is actually inside one.
     * @param node
     * @returns parent side nav menu node
     */
    function parentSideNavMenu(node: Node) {
      const parentNode = (node as HTMLElement).parentElement?.closest(
        `.${prefix}--side-nav__item`
      );
      if (parentNode) return parentNode;
      return node;
    }

    function handleKeyDown(event) {
      if (match(event, keys.Escape)) {
        setIsExpanded(false);
      }

      if (navType == SIDE_NAV_TYPE.TREEVIEW) {
        const node = event.target as HTMLElement;
        const isMenu = node.hasAttribute('aria-expanded');
        const isExpanded = node.getAttribute('aria-expanded');
        const parent = parentSideNavMenu(node) as HTMLElement;

        if (match(event, keys.ArrowLeft)) {
          event.stopPropagation();

          if (isMenu) {
            // collapse menu
            if (isExpanded == 'true') {
              setIsExpanded(false);

              // go to previous level's side nav menu button
            } else {
              // since we're in a menu, it finds its own <li>, we go up one more
              const previousMenu = parentSideNavMenu(parent) as HTMLElement;
              const button = previousMenu.querySelector('button');
              button!.tabIndex = 0;
              button?.focus();
            }

            // go to side nav menu button
          } else if (parent) {
            const button = parent.querySelector('button');
            button!.tabIndex = 0;
            button?.focus();
          }
        }

        if (match(event, keys.ArrowRight)) {
          event.stopPropagation();

          // expand menu
          if (isMenu) {
            setIsExpanded(true);

            // if already expanded, focus on first element
            if (isExpanded == 'true') {
              let nextNode = node.nextElementSibling?.querySelector(
                'a, button'
              ) as HTMLElement;

              if (nextNode) {
                nextNode.tabIndex = 0;
                nextNode.focus();
              }
            }
          }
        }
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <li
        role="treeitem"
        aria-expanded={isExpanded}
        className={className}
        ref={listRef}
        onKeyDown={handleKeyDown}>
        <button
          aria-expanded={isExpanded}
          className={buttonClassName}
          onClick={() => {
            if (!isExpanded && firstLink.current) {
              window.location.href = firstLink.current;
            }
            setIsExpanded(!isExpanded);
          }}
          ref={menuRef as Ref<HTMLButtonElement>}
          type="button"
          tabIndex={navType == SIDE_NAV_TYPE.TREEVIEW ? -1 : 0}>
          {IconElement && (
            <SideNavIcon>
              <IconElement />
            </SideNavIcon>
          )}
          <span className={`${prefix}--side-nav__submenu-title`}>{title}</span>
          <SideNavIcon className={`${prefix}--side-nav__submenu-chevron`} small>
            <ChevronDown size={20} />
          </SideNavIcon>
        </button>
        <ul className={`${prefix}--side-nav__menu`} role="group">
          {childrenToRender}
        </ul>
      </li>
    );
  }
);
SideNavMenu.displayName = 'SideNavMenu';

SideNavMenu.propTypes = {
  /**
   * Provide <SideNavMenuItem>'s inside of the `SideNavMenu`
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Specify whether the menu should default to expanded. By default, it will
   * be closed.
   */
  defaultExpanded: PropTypes.bool,

  /**
   * **Note:** this is controlled by the parent SideNav component, do not set manually.
   * SideNavMenu depth to determine spacing
   */
  depth: PropTypes.number,

  /**
   * Specify whether the `SideNavMenu` is "active". `SideNavMenu` should be
   * considered active if one of its menu items are a link for the current
   * page.
   */
  isActive: PropTypes.bool,

  /**
   * Property to indicate if the side nav container is open (or not). Use to
   * keep local state and styling in step with the SideNav expansion state.
   */
  isSideNavExpanded: PropTypes.bool,

  /**
   * Specify if this is a large variation of the SideNavMenu
   */
  large: PropTypes.bool,

  /**
   * Pass in a custom icon to render next to the `SideNavMenu` title
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * Optional prop to specify the tabIndex of the button. If undefined, it will be applied default validation
   */
  tabIndex: PropTypes.number,

  /**
   * Provide the text for the overall menu name
   */
  title: PropTypes.string.isRequired,
};

/**
Defining the children parameter with the type ReactNode | ReactNode[]. This allows for various possibilities:
a single element, an array of elements, or null or undefined.
**/
function hasActiveDescendant(children: ReactNode | ReactNode[]): boolean {
  if (Array.isArray(children)) {
    return children.some((child) => {
      if (!React.isValidElement(child)) {
        return false;
      }

      /** Explicitly defining the expected prop types (isActive and 'aria-current) for the children to ensure type
  safety when accessing their props.
  **/
      const props = child.props as {
        isActive?: boolean;
        'aria-current'?: string;
        children: ReactNode | ReactNode[];
      };

      if (
        props.isActive === true ||
        props['aria-current'] ||
        (props.children instanceof Array && hasActiveDescendant(props.children))
      ) {
        return true;
      }

      return false;
    });
  }

  // We use React.isValidElement(child) to check if the child is a valid React element before accessing its props

  if (React.isValidElement(children)) {
    const props = children.props as {
      isActive?: boolean;
      'aria-current'?: string;
    };

    if (props.isActive === true || props['aria-current']) {
      return true;
    }
  }

  return false;
}
