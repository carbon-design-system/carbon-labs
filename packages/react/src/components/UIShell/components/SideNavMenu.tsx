/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChevronDown, ChevronRight, ArrowLeft } from '@carbon/icons-react';
import { Layer } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {
  ForwardedRef,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CARBON_SIDENAV_ITEMS } from './_utils';
import { useId } from '../internal/useId';
import { SideNavIcon, Button } from '@carbon/react';
import { keys, match } from '../internal/keyboard';
import { usePrefix } from '../internal/usePrefix';
import { SIDE_NAV_TYPE, SideNavContext } from './SideNav';
import { useMergedRefs } from '../internal/useMergedRefs';
import { SharkFinIcon } from './SharkFinIcon';
import { SideNavFlyoutMenu } from './SideNavFlyoutMenu';
import { SideNavItems } from './SideNavItems';

import { useMatchMedia } from '../internal/useMatchMedia';
const smMediaQuery = `(max-width: ${breakpoints.md.width})`;
const mdMediaQuery = `(max-width: ${breakpoints.lg.width})`;

export interface SideNavMenuProps {
  /**
   * Title for back button in sm screen
   */
  backButtonTitle?: string;

  /**
   * A custom icon to render on the back button in sm screen
   * default is ArrowLeft
   */
  backButtonRenderIcon?: React.ComponentType;

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
   * Provide a unique id
   */
  id?: string;

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
   * Specifies if this is the primary SideNav.
   * If true, child components will open to the right,
   * creating the double-wide navigation layout
   */
  primary?: boolean;

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
      backButtonRenderIcon = () => <ArrowLeft size={16} />,
      backButtonTitle = 'My products',
      className: customClassName,
      children,
      defaultExpanded = false,
      depth: propDepth,
      id,
      isActive = false,
      large = false,
      renderIcon: IconElement,
      isSideNavExpanded,
      title,
      onMenuToggle,
      primary,
    },
    ref: ForwardedRef<HTMLElement>
  ) {
    const depth = (propDepth || 0) as number;
    const isSideNavCollapsed = isSideNavExpanded === false;
    const {
      isTreeview,
      expanded,
      navType,
      isRail,
      setIsTreeview,
      headerOverflowPanel,
    } = useContext(SideNavContext);
    const sideNavExpanded = expanded;
    const prefix = usePrefix();
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
    const [active, setActive] = useState<boolean>(isActive);
    const firstLink = useRef<string | null>(null);
    const backButtonRef = useRef<HTMLButtonElement>(null);
    const uid = useId('side-nav-menu');
    const uniqueId = id || uid;

    const [prevExpanded, setPrevExpanded] = useState<boolean>(defaultExpanded);

    const [isSecondaryOpen, setSecondaryOpen] =
      useState<boolean>(defaultExpanded);
    const { autoExpand, currentPrimaryMenu, setCurrentPrimaryMenu } =
      useContext(SideNavContext);

    /**
      Defining the children parameter with the type ReactNode | ReactNode[]. This allows for various possibilities:
      a single element, an array of elements, or null or undefined.
    **/
    const hasActiveDescendantInner = useCallback(
      (children: ReactNode | ReactNode[]): boolean => {
        if (Array.isArray(children)) {
          return children.some((child) => {
            if (!React.isValidElement(child)) {
              // setActive(false);
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
                hasActiveDescendantInner(props.children))
            ) {
              // setActive(true);
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
      },
      []
    );

    const hasActiveDescendant = useMemo(() => {
      return hasActiveDescendantInner(children);
    }, [children, hasActiveDescendantInner]);

    useEffect(() => {
      setActive(hasActiveDescendant);
    }, [hasActiveDescendant]);

    useEffect(() => {
      if (navType == SIDE_NAV_TYPE.RAIL_PANEL) {
        // grab first link to redirect if clicked when not expanded
        if (!firstLink?.current && listRef?.current) {
          const firstLinkElement = listRef.current!.querySelector(
            `.${prefix}--side-nav__menu-item a`
          );

          firstLink.current = firstLinkElement?.getAttribute('href') ?? '';
        }
      }

      if (depth === 0) {
        return;
      }

      // if depth is more than 0, that means its nested, thus we set treeview mode
      setIsTreeview?.(true);
    }, [isTreeview]);

    const className = cx({
      [`${prefix}--side-nav__item`]: true,
      [`${prefix}--side-nav__item--primary`]: primary,
      [`${prefix}--side-nav__item--active`]:
        !primary && (active || (hasActiveDescendant && !isExpanded)),
      [`${prefix}--side-nav__item--has-active-descendant`]:
        active || (hasActiveDescendant && !isExpanded),
      [`${prefix}--side-nav__item--icon`]: IconElement,
      [`${prefix}--side-nav__item--large`]: large,
      [customClassName as string]: !!customClassName,
    });

    const buttonClassName = cx({
      [`${prefix}--side-nav__submenu`]: true,
      [`${prefix}--side-nav__submenu--active`]:
        active || (hasActiveDescendant && isExpanded),
    });

    const secondaryClassNames = cx({
      [`${prefix}--side-nav__menu-secondary-wrapper`]: true,
      [`${prefix}--side-nav__menu-secondary-wrapper-expanded`]:
        isSideNavExpanded && isSecondaryOpen && currentPrimaryMenu === uniqueId,
    });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLLIElement>(null);
    const menuRef = useMergedRefs([buttonRef, ref]);

    if (isSideNavCollapsed && isExpanded && isRail) {
      setIsExpanded(false);
      setPrevExpanded(true);
    } else if (!isSideNavCollapsed && prevExpanded && isRail) {
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
            isSideNavExpanded: !isSideNavCollapsed,
          }),
          ...{
            depth: depth + 1,
          },
        });
      }

      return child;
    });

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
      if (match(event, keys.Escape) && !primary) {
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

        if (match(event, keys.Tab)) {
          const slotElement = node.closest(`.${prefix}--side-nav__slot`);
          if (slotElement) {
            (
              slotElement.nextElementSibling?.querySelector(
                'a, button'
              ) as HTMLElement
            ).tabIndex = 0;
          }
        }

        if (match(event, keys.ArrowLeft)) {
          event.stopPropagation();

          // collapse menu
          if (isMenu && sideNavExpanded) {
            if (isExpanded == 'true') {
              if (onMenuToggle) {
                onMenuToggle();
              }
              if (!primary && isExpanded) {
                setIsExpanded(false);
              }
              // go to previous level's side nav menu button
            } else if (!isSm) {
              // since we're in a menu, it finds its own <li>, we go up one more
              const previousMenu = parentSideNavMenu(parent) as HTMLElement;
              const button = previousMenu.querySelector('button');
              button!.tabIndex = 0;
              button?.focus();
            }

            // go to side nav menu button
          } else if (parent) {
            if (parent.hasAttribute('aria-expanded')) {
              const button = parent.querySelector('button');
              if (button) {
                button.tabIndex = 0;
                button.focus();
              }
            } else if (!isSm) {
              const previousMenu = parentSideNavMenu(parent) as HTMLElement;
              const button = previousMenu.querySelector('button');
              button!.tabIndex = 0;
              button?.focus();
            }
          }
        }

        if (match(event, keys.ArrowRight)) {
          setIsExpanded(true);

          if (primary && node.hasAttribute('aria-expanded')) {
            event.preventDefault();
          }

          event.stopPropagation();

          // expand menu when sidenav is expanded
          if (isMenu && sideNavExpanded) {
            if (onMenuToggle) {
              onMenuToggle();
            }

            // if already expanded, focus on first element
            if (isExpanded == 'true' || isSm) {
              const nextNode = node.nextElementSibling?.querySelector(
                'a, button'
              ) as HTMLElement;

              if (nextNode) {
                nextNode.tabIndex = 0;
                nextNode.focus();
              }

              if (isSm) {
                const nextNodeAfterBackButton =
                  nextNode.nextElementSibling?.querySelector(
                    'a, button'
                  ) as HTMLElement;
                if (nextNodeAfterBackButton) {
                  nextNodeAfterBackButton.tabIndex = 0;
                }
              }
            }
          }
        }
      }
    }

    function handleOnBackButtonClick(event) {
      const node = event.target as HTMLElement;
      const parent = parentSideNavMenu(node) as HTMLElement;
      const button = parent.querySelector('button');
      if (button) {
        button.tabIndex = 0;
        button.focus();
      }
      setIsExpanded(false);
    }

    useEffect(() => {
      if (isExpanded && primary && setCurrentPrimaryMenu) {
        setCurrentPrimaryMenu(uniqueId);
      }

      setSecondaryOpen(isExpanded);
    }, [isExpanded]);

    useEffect(() => {
      if (primary) {
        setIsExpanded(currentPrimaryMenu === uniqueId);
      }
    }, [currentPrimaryMenu]);
    // reset to opened/collapsed menu state when Panel SideNav is toggled
    useEffect(() => {
      if (navType == SIDE_NAV_TYPE.RAIL_PANEL && !sideNavExpanded) {
        setIsExpanded(false);
      }

      // will always open to the menu with an active element
      if (primary && (active || hasActiveDescendant)) {
        setIsExpanded(true);
      }
    }, [sideNavExpanded]);

    const [openPopover, setOpenPopover] = React.useState(false);

    const query = !headerOverflowPanel ? smMediaQuery : mdMediaQuery;
    const isSm = useMatchMedia(query);

    // keeps the secondary open when moving from small to large breakpoints
    useEffect(() => {
      if (!isSm && uniqueId === currentPrimaryMenu) {
        setIsExpanded(true);
      }
    }, [isSm]);

    const content = (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <li
        role={isTreeview ? 'treeitem' : undefined}
        aria-expanded={isExpanded}
        className={className}
        ref={listRef}
        onKeyDown={handleKeyDown}
        id={uniqueId}>
        <button
          aria-expanded={isExpanded}
          className={buttonClassName}
          onClick={() => {
            if (onMenuToggle) {
              onMenuToggle();
            }

            // only when sidenav is panel view
            if (
              navType == SIDE_NAV_TYPE.RAIL_PANEL &&
              !isExpanded &&
              firstLink.current &&
              !sideNavExpanded
            ) {
              setOpenPopover(!openPopover);
              // window.location.href = firstLink.current;
            } else if (isSm || !primary || currentPrimaryMenu !== uniqueId) {
              setIsExpanded(!isExpanded);
            }

            if (isSm && backButtonRef.current) {
              backButtonRef.current.focus();
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
          {!autoExpand &&
            !sideNavExpanded &&
            navType == SIDE_NAV_TYPE.RAIL_PANEL && (
              <div
                className={`${prefix}--side-nav--panel-submenu-caret-container`}>
                <div className={`${prefix}--side-nav--panel-submenu-caret`}>
                  <SharkFinIcon />
                </div>
              </div>
            )}
          <span className={`${prefix}--side-nav__submenu-title`}>{title}</span>
          <SideNavIcon className={`${prefix}--side-nav__submenu-chevron`} small>
            {primary ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </SideNavIcon>
        </button>

        {primary ? (
          <Layer>
            <div className={secondaryClassNames}>
              {!headerOverflowPanel ? (
                <SideNavItems
                  accessibilityLabel={{ 'aria-label': `${title} submenu` }}>
                  {isSm && (
                    <Button
                      ref={backButtonRef}
                      kind="ghost"
                      size="md"
                      onClick={handleOnBackButtonClick}
                      className={`${prefix}--side-nav__back-button`}
                      renderIcon={backButtonRenderIcon}>
                      {backButtonTitle}
                    </Button>
                  )}
                  {childrenToRender}
                </SideNavItems>
              ) : (
                <div
                  className={`${prefix}--header-overflow-panel-secondary-container`}>
                  <Button
                    ref={backButtonRef}
                    kind="ghost"
                    size="md"
                    onClick={handleOnBackButtonClick}
                    className={`${prefix}--side-nav__back-button`}
                    renderIcon={backButtonRenderIcon}>
                    {backButtonTitle}
                  </Button>
                  <SideNavItems
                    accessibilityLabel={{ 'aria-label': `${title} submenu` }}>
                    {childrenToRender}
                  </SideNavItems>
                </div>
              )}
            </div>
          </Layer>
        ) : (
          <ul className={`${prefix}--side-nav__menu`} role="group">
            {childrenToRender}
          </ul>
        )}
      </li>
    );

    return navType == SIDE_NAV_TYPE.RAIL_PANEL && !sideNavExpanded ? (
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
   * A custom icon to render on the back button in sm screen
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  backButtonRenderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * Title for back button in sm screen
   */
  backButtonTitle: PropTypes.string,

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
   * Provide a unique id
   */
  id: PropTypes.string,

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
