/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CaretDown, ChevronDown } from '@carbon/icons-react';
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
import { SharkFinIcon } from './SharkFinIcon';
import { SideNavFlyoutMenu } from './SideNavFlyoutMenu';
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
   *
   * A custom onClick handler hook that runs when the SideNavMenu is toggled.
   */
  onMenuToggle?: () => void;

  /**
   * A custom icon to render next to the SideNavMenu title. This can be a function returning JSX or JSX itself.
   */
  renderIcon?: React.ComponentType;

  /**
   * Indicates if the side navigation container is expanded or collapsed.
   */
  isSideNavExpanded?: boolean;

  /**
   *  The boolean to show the flyout menu has been selected.
   */
  selected?: boolean;

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
      title,
      onMenuToggle,
    },
    ref: ForwardedRef<HTMLElement>
  ) {
    const depth = propDepth as number;
    const { isTreeview, expanded, navType, isRail, setIsTreeview } =
      useContext(SideNavContext);
    const sideNavExpanded = expanded;
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
          },
        });
      }

      return child;
    });

    /**
      Defining the children parameter with the type ReactNode | ReactNode[]. This allows for various possibilities:
      a single element, an array of elements, or null or undefined.
    **/
    function hasActiveDescendant(children: ReactNode | ReactNode[]): boolean {
      if (Array.isArray(children)) {
        return children.some((child) => {
          if (!React.isValidElement(child)) {
            setActive(false);
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
            (props.children instanceof Array &&
              hasActiveDescendant(props.children))
          ) {
            setActive(true);
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
          setActive(true);

          return true;
        }
      }

      return false;
    }

    useEffect(() => {
      if (navType == SIDE_NAV_TYPE.PANEL) {
        // grab first link to redirect if clicked when not expanded
        if (!firstLink?.current && listRef?.current) {
          const firstLinkElement = listRef.current!.querySelector(
            `.${prefix}--side-nav__menu-item a`
          );

          firstLink.current = firstLinkElement?.getAttribute('href') ?? '';
        }
      }

      if (depth === 0) return;

      // if depth is more than 0, that means its nested, thus we set treeview mode
      setIsTreeview?.(true);
    }, [isTreeview]);

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

        if (onMenuToggle) {
          onMenuToggle();
        }
      }

      if (isTreeview) {
        const node = event.target as HTMLElement;
        const isMenu = node.hasAttribute('aria-expanded');
        const isExpanded = node.getAttribute('aria-expanded');
        const parent = parentSideNavMenu(node) as HTMLElement;

        if (match(event, keys.ArrowLeft)) {
          event.stopPropagation();

          // collapse menu
          if (isMenu && sideNavExpanded) {
            if (isExpanded == 'true') {
              if (onMenuToggle) {
                onMenuToggle();
              }
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

          // expand menu when sidenav is expanded
          if (isMenu && sideNavExpanded) {
            setIsExpanded(true);

            if (onMenuToggle) {
              onMenuToggle();
            }

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

    // save expanded state before SideNav collapse
    const [lastExpandedState, setLastExpandedState] = useState(isExpanded);

    // reset to opened/collapsed menu state when Panel SideNav is toggled
    useEffect(() => {
      if (navType == SIDE_NAV_TYPE.PANEL && !sideNavExpanded) {
        setLastExpandedState(isExpanded);
        setIsExpanded(false);
      } else {
        setIsExpanded(lastExpandedState);
      }
    }, [sideNavExpanded]);

    const [openPopover, setOpenPopover] = React.useState(false);

    const content = (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <li
        role={isTreeview ? 'treeitem' : undefined}
        aria-expanded={isExpanded}
        className={className}
        ref={listRef}
        onKeyDown={handleKeyDown}>
        <button
          aria-expanded={isExpanded}
          className={buttonClassName}
          onClick={() => {
            if (onMenuToggle) {
              onMenuToggle();
            }

            // only when sidenav is panel view
            if (
              navType == SIDE_NAV_TYPE.PANEL &&
              !isExpanded &&
              firstLink.current &&
              !sideNavExpanded
            ) {
              setOpenPopover(!openPopover);
              // window.location.href = firstLink.current;
            } else {
              setIsExpanded(!isExpanded);
              setLastExpandedState(!isExpanded);
            }
          }}
          ref={menuRef as Ref<HTMLButtonElement>}
          type="button"
          tabIndex={isTreeview ? -1 : 0}>
          {IconElement && (
            <SideNavIcon>
              <IconElement />
            </SideNavIcon>
          )}
          {!sideNavExpanded && (
            <div
              className={`${prefix}--side-nav--panel-submenu-caret-container`}>
              <div className={`${prefix}--side-nav--panel-submenu-caret`}>
                <SharkFinIcon />
              </div>
            </div>
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

    return navType == SIDE_NAV_TYPE.PANEL && !sideNavExpanded ? (
      <SideNavFlyoutMenu
        selected={active}
        className={`${prefix}--side-nav-flyout-menu`}
        title={title}
        menuContent={children}>
        {content}
      </SideNavFlyoutMenu>
    ) : (
      content
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
   *
   * A custom onClick handler hook that runs when the SideNavMenu is toggled.
   */
  onMenuToggle: PropTypes.func,

  /**
   * Pass in a custom icon to render next to the `SideNavMenu` title
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   *  The boolean to show the flyout menu has been selected.
   */
  selected: PropTypes.bool,

  /**
   * Optional prop to specify the tabIndex of the button. If undefined, it will be applied default validation
   */
  tabIndex: PropTypes.number,

  /**
   * Provide the text for the overall menu name
   */
  title: PropTypes.string.isRequired,
};
