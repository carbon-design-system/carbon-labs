/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {
  useRef,
  type ForwardedRef,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEventHandler,
  isValidElement,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { AriaLabelPropType } from '../prop-types/AriaPropTypes';
import { CARBON_SIDENAV_ITEMS } from './_utils';
import { usePrefix } from '../internal/usePrefix';
import { keys, match, matches } from '../internal/keyboard';
import { useMergedRefs } from '../internal/useMergedRefs';
import { useWindowEvent } from '../internal/useEvent';
import { useDelayedState } from '../internal/useDelayedState';
import { breakpoints } from '@carbon/layout';
import { useMatchMedia } from '../internal/useMatchMedia';
import { TranslateWithId } from '../types/common';
import {
  Pin,
  PinFilled,
  SidePanelClose,
  SidePanelOpen,
} from '@carbon/icons-react';
import SideNavToggle from './SideNavToggle';
import { SideNavDivider } from '@carbon/react';

export enum SIDE_NAV_TYPE {
  DEFAULT = 'default',
  RAIL = 'rail',
  RAIL_PANEL = 'panel',
}

export type TranslationKey = keyof typeof translationIds;

export const translationIds = {
  'collapse.sidenav': 'collapse.sidenav',
  'expand.sidenav': 'expand.sidenav',
  'enable.autoexpand': 'enable.autoexpand',
  'disable.autoexpand': 'disable.autoexpand',
} as const;

const defaultTranslations: Record<TranslationKey, string> = {
  [translationIds['collapse.sidenav']]: 'Unpin',
  [translationIds['expand.sidenav']]: 'Pin open',
  [translationIds['enable.autoexpand']]: 'Enable auto-expand',
  [translationIds['disable.autoexpand']]: 'Disable auto-expand',
};

const defaultTranslateWithId = (id: TranslationKey): string =>
  defaultTranslations[id];

export interface SideNavProps
  extends ComponentProps<'nav'>,
    TranslateWithId<TranslationKey> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  isChildOfHeader?: boolean;
  onToggle?: (
    event: FocusEvent<HTMLElement> | KeyboardEvent<HTMLElement> | boolean,
    value: boolean
  ) => void;
  hideRailBreakpointDown?: 'sm' | 'md' | 'lg' | 'xlg' | 'max';
  href?: string;
  isFixedNav?: boolean;
  isRail?: boolean;
  isPersistent?: boolean;
  addFocusListeners?: boolean;
  addMouseListeners?: boolean;
  onOverlayClick?: MouseEventHandler<HTMLDivElement>;
  onSideNavBlur?: () => void;
  enterDelayMs?: number;
  inert?: boolean;
  isCollapsible?: boolean;
  hideOverlay?: boolean;
  navType?: SIDE_NAV_TYPE;
  isTreeview?: boolean;
  headerOverflowPanel?: boolean;
}

interface SideNavContextData {
  autoExpand?: boolean;
  expanded?: boolean;
  isRail?: boolean;
  navType?: SIDE_NAV_TYPE;
  isTreeview?: boolean;
  setIsTreeview?: (value: boolean) => void;
  currentPrimaryMenu?: string;
  setCurrentPrimaryMenu?: (value: string) => void;
  headerOverflowPanel?: boolean;
}

export const SideNavContext = createContext<SideNavContextData>(
  {} as SideNavContextData
);

function SideNavRenderFunction(
  {
    expanded: expandedProp,
    defaultExpanded = false,
    isChildOfHeader = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    onToggle,
    className: customClassName,
    hideRailBreakpointDown,
    href,
    isFixedNav = false,
    isRail,
    isPersistent = true,
    isTreeview: isTreeviewProp,
    navType = SIDE_NAV_TYPE.DEFAULT,
    addFocusListeners = true,
    addMouseListeners = true,
    onOverlayClick,
    onSideNavBlur,
    enterDelayMs = 100,
    isCollapsible = false,
    hideOverlay = false,
    translateWithId: t = defaultTranslateWithId,
    headerOverflowPanel,
    ...other
  }: SideNavProps,
  ref: ForwardedRef<HTMLElement>
) {
  const [internalIsTreeview, setInternalIsTreeview] = useState(
    isTreeviewProp ?? false
  );
  const prefix = usePrefix();
  const { current: controlled } = useRef(expandedProp !== undefined);
  const [autoExpand, setAutoExpand] = useState(false);
  const [expandedState, setExpandedState] = useDelayedState(defaultExpanded);
  const [expandedViaHoverState, setExpandedViaHoverState] =
    useDelayedState(defaultExpanded);
  const [pinned, setPinned] = useState(false);
  const expanded = controlled ? expandedProp : expandedState;
  const sideNavRef = useRef<HTMLDivElement>(null);
  const navRef = useMergedRefs([sideNavRef, ref]);
  const [currentPrimaryMenu, setCurrentPrimaryMenu] = useState<
    string | undefined
  >();

  const pinText = pinned ? t('collapse.sidenav') : t('expand.sidenav');

  const autoExpandText = autoExpand
    ? t('disable.autoexpand')
    : t('enable.autoexpand');

  const handleToggle: typeof onToggle = (event, value = !expanded) => {
    if (!controlled) {
      setExpandedState(value, enterDelayMs);
    }
    if (onToggle) {
      onToggle(event, value);
    }
    if (controlled || isRail) {
      setExpandedViaHoverState(value, enterDelayMs);
    }
  };

  const accessibilityLabel = {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  };

  const className = cx(customClassName, {
    [`${prefix}--side-nav`]: true,
    [`${prefix}--side-nav--expanded`]: expanded || expandedViaHoverState,
    [`${prefix}--side-nav--collapsed`]: !expanded && isFixedNav,
    [`${prefix}--side-nav--hide-rail-breakpoint-down-${hideRailBreakpointDown}`]:
      hideRailBreakpointDown,
    [`${prefix}--side-nav--rail`]: isRail || autoExpand,
    [`${prefix}--side-nav--panel`]: navType === SIDE_NAV_TYPE.RAIL_PANEL,
    [`${prefix}--side-nav--pinned`]: pinned,
    [`${prefix}--side-nav--ux`]: isChildOfHeader,
    [`${prefix}--side-nav--hidden`]: !isPersistent,
    [`${prefix}--side-nav--collapsible`]: isCollapsible,
    [`${prefix}--side-nav--with-overlay`]: !hideOverlay,
  });

  const overlayClassName = cx({
    [`${prefix}--side-nav__overlay`]: true,
    [`${prefix}--side-nav__overlay-active`]: expanded || expandedViaHoverState,
  });

  let childrenToRender = children;

  // Pass the expansion state as a prop, so children can update themselves to match
  childrenToRender = React.Children.map(children, (child) => {
    // if we are controlled, check for if we have hovered over or the expanded state, else just use the expanded state (uncontrolled)
    const currentExpansionState = controlled
      ? expandedViaHoverState || expanded
      : expanded;
    if (isValidElement(child)) {
      const childJsxElement = child as JSX.Element;
      // avoid spreading `isSideNavExpanded` to non-Carbon UI Shell children
      return React.cloneElement(childJsxElement, {
        ...(CARBON_SIDENAV_ITEMS.includes(
          childJsxElement.type?.displayName ?? childJsxElement.type?.name
        )
          ? {
              isSideNavExpanded: currentExpansionState,
              ...(childJsxElement.type?.displayName === 'SideNavItems' && {
                accessibilityLabel: accessibilityLabel,
              }),
            }
          : {}),
      });
    }
    return child;
  });

  const eventHandlers: Partial<
    Pick<
      ComponentProps<'nav'>,
      | 'onFocus'
      | 'onBlur'
      | 'onKeyDown'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onClick'
    >
  > = {};

  const resetNodeTabIndices = useCallback(() => {
    const items = sideNavRef?.current?.querySelectorAll('[tabIndex="0"]') ?? [];
    items.forEach((item) => {
      if (
        item.classList.contains(`${prefix}--side-nav__toggle`) ||
        item.classList.contains(`${prefix}--side-nav__back-button`) ||
        item.closest(`.${prefix}--side-nav__slot-item`) ||
        (item.classList.contains(`${prefix}--side-nav__link`) &&
          (item as HTMLElement).closest('ul')?.getAttribute('aria-label') ===
            ariaLabel) ||
        (item as HTMLElement).closest(
          `.${prefix}--header-overflow-panel-secondary-container`
        )
      ) {
        return;
      }
      item.tabIndex = -1;
    });
  }, [prefix, ariaLabel]);

  const treeWalkerRef = useRef<TreeWalker | null>(null);
  useEffect(() => {
    if (internalIsTreeview) {
      treeWalkerRef.current =
        treeWalkerRef.current ??
        document.createTreeWalker(
          sideNavRef?.current as unknown as Node,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: function (node) {
              if (!(node instanceof Element)) {
                return NodeFilter.FILTER_SKIP;
              }

              if (node.classList.contains(`${prefix}--side-nav__divider`)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (
                node.matches(`li.${prefix}--side-nav__item`) ||
                node.matches(`li.${prefix}--side-nav__menu-item`)
              ) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            },
          }
        );
      resetNodeTabIndices();
    }
  }, [prefix, internalIsTreeview, resetNodeTabIndices]);

  const smMediaQuery = `(min-width: ${breakpoints.sm.width})`;
  const lgMediaQuery = `(min-width: ${breakpoints.lg.width})`;
  const query = !headerOverflowPanel ? smMediaQuery : lgMediaQuery;
  const isSm = useMatchMedia(query);

  useEffect(() => {
    if (sideNavRef.current) {
      const backButton = sideNavRef?.current.querySelector(
        `.${prefix}--side-nav__back-button`
      ) as HTMLElement;

      const slotElement = sideNavRef?.current.querySelector(
        `.${prefix}--side-nav__slot`
      ) as HTMLElement;

      const firstElement = sideNavRef?.current?.querySelector(
        'a, button'
      ) as HTMLElement;

      const currentElement = sideNavRef?.current?.querySelector(
        `.cds--side-nav__link--current`
      ) as HTMLElement;

      if (navType == SIDE_NAV_TYPE.RAIL_PANEL || expanded) {
        if (isSm && backButton) {
          backButton.tabIndex = 0;
          const firstElementAfterBack =
            backButton.nextElementSibling?.querySelector(
              'a, button'
            ) as HTMLElement;
          if (firstElementAfterBack) {
            firstElementAfterBack.tabIndex = 0;
          }
        } else if (
          currentElement &&
          currentElement.closest(`[id="${currentPrimaryMenu}"]`)
        ) {
          currentElement.tabIndex = 0;
        } else if (firstElement) {
          firstElement.tabIndex = 0;

          if (slotElement) {
            const firstElementAfterSlot =
              slotElement.nextElementSibling?.querySelector(
                'a, button'
              ) as HTMLElement;

            if (firstElementAfterSlot) {
              firstElementAfterSlot.tabIndex = 0;
            }
          }
        }
      }
    }
  }, [expanded, currentPrimaryMenu, isSm, navType, prefix]);

  /**
   * Returns the parent SideNavMenu, if node is actually inside one.
   * @param node
   * @returns parent side nav menu node
   */
  function parentSideNavMenu(node: Node) {
    const parentNode = (node as HTMLElement).parentElement?.closest(
      `.${prefix}--side-nav__item`
    );
    if (parentNode) {
      return parentNode;
    }
    return node;
  }

  if (addFocusListeners) {
    eventHandlers.onFocus = (event) => {
      if (
        !event.currentTarget.contains(event.relatedTarget) &&
        (isRail || autoExpand)
      ) {
        handleToggle(event, true);
      }
    };
    eventHandlers.onBlur = (event) => {
      if (navType === SIDE_NAV_TYPE.RAIL_PANEL) {
        return;
      }

      if (!event.currentTarget.contains(event.relatedTarget)) {
        handleToggle(event, false);
      }
      if (
        !event.currentTarget.contains(event.relatedTarget) &&
        expanded &&
        !isFixedNav
      ) {
        if (onSideNavBlur) {
          onSideNavBlur();
        }
      }
    };
    eventHandlers.onKeyDown = (event) => {
      // close menu
      if (match(event, keys.Escape)) {
        if (expanded && !isFixedNav) {
          resetNodeTabIndices();
          if (onSideNavBlur) {
            onSideNavBlur();
          }
        }
        handleToggle(event, false);
        if (href) {
          window.location.href = href;
        }
      }

      // Treeview keyboard navigation
      if (treeWalkerRef?.current && internalIsTreeview) {
        const treeWalker = treeWalkerRef.current;

        event.stopPropagation();

        // stops page from scrolling
        if (
          matches(event, [
            keys.ArrowUp,
            keys.ArrowDown,
            keys.Home,
            keys.End,
            // @ts-ignore - `matches` doesn't like the object syntax without missing properties
            { code: 'KeyA' },
          ])
        ) {
          event.preventDefault();
        }

        treeWalker.currentNode =
          (event.target as HTMLElement).closest(`li`) ??
          treeWalker?.currentNode;

        let nextFocusNode: Node | null = null;

        if (match(event, keys.ArrowUp)) {
          const parentNode = parentSideNavMenu(
            treeWalker.currentNode
          ) as HTMLElement;

          let previousSideNavMenu = treeWalker.currentNode
            ?.previousSibling as HTMLElement;
          // skip the divider
          if (
            previousSideNavMenu?.classList.contains(
              `${prefix}--side-nav__divider`
            )
          ) {
            previousSideNavMenu =
              previousSideNavMenu?.previousElementSibling as HTMLElement;
          }

          if (
            previousSideNavMenu?.classList.contains(
              `${prefix}--side-nav__item--primary`
            )
          ) {
            nextFocusNode = previousSideNavMenu;
          } else if (
            (treeWalker.currentNode as HTMLElement).classList.contains(
              `${prefix}--side-nav__item--primary`
            )
          ) {
            nextFocusNode = treeWalker.currentNode.previousSibling;
          } // when previous sibling is open, go to its last item
          else if (
            previousSideNavMenu?.getAttribute('aria-expanded') == 'true'
          ) {
            const allItems = previousSideNavMenu.querySelectorAll(
              `.${prefix}--side-nav__item`
            );

            const lastMenu = allItems[allItems.length - 1];

            if (lastMenu && lastMenu.getAttribute('aria-expanded') == 'false') {
              nextFocusNode = lastMenu;
            } else {
              nextFocusNode = treeWalker.previousNode();
            }
          } else {
            nextFocusNode = treeWalker.previousSibling();

            // first item in the menu, go back up to SideNavMenu button
            if (
              nextFocusNode == null &&
              !parentNode.classList.contains(
                `${prefix}--side-nav__item--primary`
              )
            ) {
              nextFocusNode = parentNode;
            }
          }
        }

        if (match(event, keys.ArrowDown)) {
          if (
            (treeWalker.currentNode as HTMLElement).getAttribute(
              'aria-expanded'
            ) == 'false'
          ) {
            nextFocusNode = treeWalker.nextSibling();

            if (!nextFocusNode) {
              const parent = parentSideNavMenu(
                treeWalker.currentNode
              ) as HTMLElement;
              nextFocusNode = parent?.nextElementSibling;
            }
          } else if (
            (treeWalker.currentNode as HTMLElement).classList.contains(
              `${prefix}--side-nav__item--primary`
            )
          ) {
            nextFocusNode = treeWalker.currentNode.nextSibling as HTMLElement;
            if (
              (nextFocusNode as HTMLElement)?.classList.contains(
                `${prefix}--side-nav__divider`
              )
            ) {
              nextFocusNode = nextFocusNode!.nextSibling;
            }
          } else {
            nextFocusNode = treeWalker.nextNode();
          }
        }

        // Home/End functionality
        if (matches(event, [keys.Home, keys.End])) {
          if (!sideNavRef?.current) {
            return;
          }

          const allItems = Array.from(
            sideNavRef.current.querySelectorAll('a, button')
          );

          if (match(event, keys.Home)) {
            const firstElement = allItems[0] as HTMLElement;

            if (firstElement) {
              firstElement.tabIndex = 0;
              firstElement?.focus();
            }
          }

          if (match(event, keys.End)) {
            const allItems = Array.from(
              sideNavRef.current.querySelectorAll('li')
            );

            const lastVisibleItem = allItems
              .reverse()
              .find((item) => getComputedStyle(item).visibility !== 'hidden');

            if (lastVisibleItem) {
              const node =
                lastVisibleItem.querySelector('button') ??
                lastVisibleItem.querySelector('a');
              if (node) {
                node.tabIndex = 0;
                node?.focus();
              }
            }
          }
        }

        // focus on the focusable element within the node
        if (nextFocusNode && nextFocusNode !== event.target) {
          resetNodeTabIndices();
          if (nextFocusNode instanceof HTMLElement) {
            const node =
              nextFocusNode.querySelector('button') ??
              nextFocusNode.querySelector('a');
            if (node) {
              node.tabIndex = 0;
              node?.focus();
            }
          }
        }
      }
    };
  }

  if (addMouseListeners && !pinned && (isRail || autoExpand)) {
    eventHandlers.onMouseEnter = () => {
      handleToggle(true, true);
    };
    eventHandlers.onMouseLeave = () => {
      setExpandedState(false);
      setExpandedViaHoverState(false);
      handleToggle(false, false);
    };
    eventHandlers.onClick = () => {
      if (autoExpand) {
        return;
      }
      //if delay is enabled, and user intentionally clicks it to see it expanded immediately
      setExpandedState(true);
      setExpandedViaHoverState(true);
      handleToggle(true, true);
    };
  }

  useWindowEvent('click', (event) => {
    const target = event.target as HTMLElement;
    const isNavItemClick = target.closest(
      `.${prefix}--side-nav a, .${prefix}--side-nav button`
    );
    const isInRail = isNavItemClick?.closest(`.${prefix}--side-nav--rail`);
    if (
      isNavItemClick &&
      !isNavItemClick.classList.contains(`${prefix}--side-nav__submenu`) &&
      !isNavItemClick.classList.contains(`${prefix}--side-nav__back-button`) &&
      !isNavItemClick.classList.contains(`${prefix}--side-nav__toggle`)
    ) {
      isInRail ? handleToggle(false, false) : onSideNavBlur?.();
    }
  });

  useWindowEvent('keydown', (event: Event) => {
    const focusedElement = document.activeElement;

    // going from header menu to sideNav
    if (
      match(event, keys.Tab) &&
      expanded &&
      !isFixedNav &&
      sideNavRef?.current &&
      focusedElement?.classList.contains(`${prefix}--header__menu-toggle`) &&
      !focusedElement.closest('nav')
    ) {
      sideNavRef.current.focus();
    }
  });

  const isLg = useMatchMedia(lgMediaQuery);

  hideOverlay;

  // ensure that changes are in sync with internal treeview prop
  useEffect(() => {
    if (isTreeviewProp !== undefined) {
      setInternalIsTreeview(isTreeviewProp);
    }
  }, [isTreeviewProp]);

  // prevent changes if prop is passed in
  const setIsTreeview = (value: boolean) => {
    if (isTreeviewProp === undefined) {
      setInternalIsTreeview(value);
    }
  };

  const handlePinClick = () => {
    setPinned(!pinned);
    if (!autoExpand) {
      setExpandedState(!pinned);
    }
  };

  const handleAutoExpand = () => {
    if (pinned) {
      return;
    }
    setExpandedState(!autoExpand);
    setAutoExpand(!autoExpand);
  };

  return (
    <SideNavContext.Provider
      value={{
        autoExpand,
        expanded,
        isRail,
        navType,
        isTreeview: internalIsTreeview,
        setIsTreeview,
        currentPrimaryMenu,
        setCurrentPrimaryMenu,
        headerOverflowPanel,
      }}>
      {isFixedNav ||
      hideOverlay ||
      navType === SIDE_NAV_TYPE.RAIL_PANEL ? null : (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={overlayClassName} onClick={onOverlayClick} />
      )}
      <nav
        role={'navigation'}
        tabIndex={-1}
        ref={navRef}
        className={`${prefix}--side-nav__navigation ${className}`}
        inert={
          !isRail && navType !== SIDE_NAV_TYPE.RAIL_PANEL && !(expanded || isLg)
            ? -1
            : undefined
        }
        {...accessibilityLabel}
        {...eventHandlers}
        {...other}>
        {childrenToRender}
        {navType === SIDE_NAV_TYPE.RAIL_PANEL && (
          <ul className={`${prefix}--side-nav__toggle-container`}>
            <SideNavDivider />
            <SideNavToggle
              onClick={handlePinClick}
              renderIcon={pinned ? PinFilled : Pin}>
              {pinText}
            </SideNavToggle>
            <SideNavToggle
              disabled={pinned}
              renderIcon={expandedState ? SidePanelClose : SidePanelOpen}
              onClick={handleAutoExpand}>
              {autoExpandText}
            </SideNavToggle>
          </ul>
        )}
      </nav>
    </SideNavContext.Provider>
  );
}

export const SideNav = React.forwardRef(SideNavRenderFunction);

SideNav.displayName = 'SideNav';

SideNav.propTypes = {
  /**
   * Required props for accessibility label on the underlying menu
   */
  ...AriaLabelPropType,

  /**
   * Specify whether focus and blur listeners are added. They are by default.
   */
  addFocusListeners: PropTypes.bool,

  /**
   * Specify whether mouse entry/exit listeners are added. They are by default.
   */
  addMouseListeners: PropTypes.bool,

  /**
   * Optionally provide a custom class to apply to the `<nav>` element
   */
  className: PropTypes.string,

  /**
   * Specify whether the `SideNav` starts expanded when initially rendered. Only applies when using the `SideNav` as an uncontrolled component.
   */
  defaultExpanded: PropTypes.bool,

  /**
   * Specify the duration in milliseconds to delay before displaying the `SideNav`.
   */
  enterDelayMs: PropTypes.number,

  /**
   * Control the expanded state of the `SideNav` externally. When provided, the `SideNav` becomes a controlled component and you must handle toggle events.
   */
  expanded: PropTypes.bool,

  /**
   * Specify whether the `SideNav` is rendered inside a `HeaderOverflowPanel`. When `true`, adjusts the responsive behavior to work correctly within the overflow menu at mobile/tablet breakpoints.
   */
  headerOverflowPanel: PropTypes.bool,

  /**
   * If `true`, the backdrop overlay will be hidden at all breakpoints. By default, the overlay appears behind the `SideNav` on mobile and tablet (below `lg` breakpoint).
   */
  hideOverlay: PropTypes.bool,

  /**
   * Specify the breakpoint at which the `SideNav` will be hidden. Can be one of `sm`, `md`, `lg`, `xlg`, or `max`. Only applies when `isRail` is `true` or `navType` is `RAIL_PANEL`.
   */
  hideRailBreakpointDown: PropTypes.oneOf(['sm', 'md', 'lg', 'xlg', 'max']),

  /**
   * Provide an `href` (typically an anchor like `#main-content`) to move focus to when closing the `SideNav` with the Escape key.
   */
  href: PropTypes.string,

  /**
   * Specify whether the `SideNav` is the primary navigation controlled by the header. When `true`, the `SideNav` is part of the UI Shell header layout (full-width on desktop, collapses on mobile). Set to `false` for secondary navigation / rails, overflow panels, or standalone navigation that is independent of the header.
   */
  isChildOfHeader: PropTypes.bool,

  /**
   * Specify whether the `SideNav` can be toggled open/closed on desktop. When `true`, the `SideNav` starts collapsed and users can expand it. Requires `isChildOfHeader` to be `true` (default).
   */
  isCollapsible: PropTypes.bool,

  /**
   * Specify if `SideNav` is standalone.
   */
  isFixedNav: PropTypes.bool,

  /**
   * Specify whether the `SideNav` is visible by default. When `false`, applies the hidden class which sets width to 0.
   */
  isPersistent: PropTypes.bool,

  /**
   * Specify whether to display the `SideNav` rail variant. When `true`, the `SideNav` displays as a narrow rail (48px) that expands to full-width on hover.
   */
  isRail: PropTypes.bool,

  /**
   * An optional listener that is called when the `SideNav` overlay is clicked.
   *
   * @param {object} event
   */
  onOverlayClick: PropTypes.func,

  /**
   * An optional listener that is called as a callback to collapse the `SideNav`.
   */
  onSideNavBlur: PropTypes.func,

  /**
   * An optional listener that is called when an event that would cause toggling the `SideNav` occurs.
   *
   * @param {object} event
   * @param {boolean} value
   */
  onToggle: PropTypes.func,
};
