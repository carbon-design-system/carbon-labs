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
import { SidePanelClose, SidePanelOpen } from '@carbon/icons-react';
import SideNavToggle from './SideNavToggle';

export enum SIDE_NAV_TYPE {
  DEFAULT = 'default',
  RAIL = 'rail',
  PANEL = 'panel',
}

export type TranslationKey = keyof typeof translationIds;

export const translationIds = {
  'collapse.sidenav': 'collapse.sidenav',
  'expand.sidenav': 'expand.sidenav',
} as const;

const defaultTranslations: Record<TranslationKey, string> = {
  [translationIds['collapse.sidenav']]: 'Collapse',
  [translationIds['expand.sidenav']]: 'Expand',
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
  navType: SIDE_NAV_TYPE;
  isTreeview: boolean;
}

interface SideNavContextData {
  expanded?: boolean;
  isRail?: boolean;
  navType?: SIDE_NAV_TYPE;
  isTreeview?: boolean;
  setIsTreeview?: (value: boolean) => void;
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
    ...other
  }: SideNavProps,
  ref: ForwardedRef<HTMLElement>
) {
  const [internalIsTreeview, setInternalIsTreeview] = useState(
    isTreeviewProp ?? false
  );
  const prefix = usePrefix();
  const { current: controlled } = useRef(expandedProp !== undefined);
  const [expandedState, setExpandedState] = useDelayedState(defaultExpanded);
  const [expandedViaHoverState, setExpandedViaHoverState] =
    useDelayedState(defaultExpanded);
  const expanded = controlled ? expandedProp : expandedState;
  const sideNavRef = useRef<HTMLDivElement>(null);
  const navRef = useMergedRefs([sideNavRef, ref]);

  const sideNavToggleText = expandedState
    ? t('collapse.sidenav')
    : t('expand.sidenav');

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
    [`${prefix}--side-nav--rail`]: isRail,
    [`${prefix}--side-nav--panel`]: navType === SIDE_NAV_TYPE.PANEL,
    [`${prefix}--side-nav--ux`]: isChildOfHeader,
    [`${prefix}--side-nav--hidden`]: !isPersistent,
    [`${prefix}--side-nav--collapsible`]: isCollapsible,
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
  }, [prefix, internalIsTreeview]);

  useEffect(() => {
    if (sideNavRef.current) {
      const firstElement = sideNavRef?.current?.querySelector(
        'a, button'
      ) as HTMLElement;

      if (firstElement && (navType == SIDE_NAV_TYPE.PANEL || expanded)) {
        firstElement.tabIndex = 0;
      }
    }
  }, [expanded]);

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
      if (!event.currentTarget.contains(event.relatedTarget) && isRail) {
        handleToggle(event, true);
      }
    };
    eventHandlers.onBlur = (event) => {
      if (navType === SIDE_NAV_TYPE.PANEL) {
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

          let previousSideNavMenu =
            parentNode?.previousElementSibling as HTMLElement;

          // skip the divider
          if (
            previousSideNavMenu?.classList.contains(
              `${prefix}--side-nav__divider`
            )
          ) {
            previousSideNavMenu =
              previousSideNavMenu?.previousElementSibling as HTMLElement;
          }

          // when previous sibling is open, go to its last item
          if (previousSideNavMenu?.getAttribute('aria-expanded') == 'true') {
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
            if (nextFocusNode == null) {
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

  if (addMouseListeners && isRail) {
    eventHandlers.onMouseEnter = () => {
      handleToggle(true, true);
    };
    eventHandlers.onMouseLeave = () => {
      setExpandedState(false);
      setExpandedViaHoverState(false);
      handleToggle(false, false);
    };
    eventHandlers.onClick = () => {
      //if delay is enabled, and user intentionally clicks it to see it expanded immediately
      setExpandedState(true);
      setExpandedViaHoverState(true);
      handleToggle(true, true);
    };
  }

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

  const lgMediaQuery = `(min-width: ${breakpoints.lg.width})`;
  const isLg = useMatchMedia(lgMediaQuery);

  hideOverlay;

  function resetNodeTabIndices() {
    const items = sideNavRef?.current?.querySelectorAll('[tabIndex="0"]') ?? [];
    items.forEach((item) => {
      if (item.classList.contains(`${prefix}--side-nav__toggle`)) {
        return;
      }
      item.tabIndex = -1;
    });
  }

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

  const SideNavToggleButton = (
    <SideNavToggle
      className={!expandedState ? `${prefix}--side-nav__toggle--collapsed` : ''}
      renderIcon={expandedState ? SidePanelClose : SidePanelOpen}
      onClick={() => setExpandedState(!expandedState)}>
      {sideNavToggleText}
    </SideNavToggle>
  );

  return (
    <SideNavContext.Provider
      value={{
        expanded,
        isRail,
        navType,
        isTreeview: internalIsTreeview,
        setIsTreeview,
      }}>
      {isFixedNav || hideOverlay ? null : (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={overlayClassName} onClick={onOverlayClick} />
      )}
      <nav
        role={'navigation'}
        tabIndex={-1}
        ref={navRef}
        className={`${prefix}--side-nav__navigation ${className}`}
        inert={
          !isRail && navType !== SIDE_NAV_TYPE.PANEL && !(expanded || isLg)
            ? -1
            : undefined
        }
        {...accessibilityLabel}
        {...eventHandlers}
        {...other}>
        {childrenToRender}
        {navType === SIDE_NAV_TYPE.PANEL &&
          (expandedState ? (
            SideNavToggleButton
          ) : (
            <div className={`${prefix}--side-nav__toggle-container`}>
              {SideNavToggleButton}
            </div>
          ))}
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
   * Optionally provide a custom class to apply to the underlying `<li>` node
   */
  className: PropTypes.string,

  /**
   * If `true`, the SideNav will be open on initial render.
   */
  defaultExpanded: PropTypes.bool,

  /**
   * Specify the duration in milliseconds to delay before displaying the sidenavigation
   */
  enterDelayMs: PropTypes.number,

  /**
   * If `true`, the SideNav will be expanded, otherwise it will be collapsed.
   * Using this prop causes SideNav to become a controled component.
   */
  expanded: PropTypes.bool,

  /**
   * If `true`, the overlay will be hidden. Defaults to `false`.
   */
  hideOverlay: PropTypes.bool,

  /**
   * Provide the `href` to the id of the element on your package that is the
   * main content.
   */
  href: PropTypes.string,

  /**
   * Optionally provide a custom class to apply to the underlying `<li>` node
   */
  isChildOfHeader: PropTypes.bool,

  /**
   * Specify whether the SideNav is collapsible at desktop
   */
  isCollapsible: PropTypes.bool,

  /**
   * Specify if sideNav is standalone
   */
  isFixedNav: PropTypes.bool,

  /**
   * Specify if the sideNav will be persistent above the lg breakpoint
   */
  isPersistent: PropTypes.bool,

  /**
   * Optional prop to display the side nav rail.
   */
  isRail: PropTypes.bool,

  /**
   * An optional listener that is called when the SideNav overlay is clicked
   *
   * @param {object} event
   */
  onOverlayClick: PropTypes.func,

  /**
   * An optional listener that is called a callback to collapse the SideNav
   */

  onSideNavBlur: PropTypes.func,

  /**
   * An optional listener that is called when an event that would cause
   * toggling the SideNav occurs.
   *
   * @param {object} event
   * @param {boolean} value
   */
  onToggle: PropTypes.func,

  /**
   * Provide a custom function for translating all message ids within this
   * component. This function will take in two arguments: the mesasge Id and the
   * state of the component. From this, you should return a string representing
   * the label you want displayed or read by screen readers.
   */
  // translateById: PropTypes.func,
};
