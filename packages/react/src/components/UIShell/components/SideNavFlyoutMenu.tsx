/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  FormLabel,
  Popover,
  PopoverAlignment,
  PopoverContent,
} from '@carbon/react';
import { keys, match } from '../internal/keyboard';
import { useDelayedState } from '../internal/useDelayedState';
import { useId } from '../internal/useId.js';
import { usePrefix } from '../internal/usePrefix';
import { type PolymorphicProps } from '../types/common';

/**
 * Event types that trigger a "drag" to stop.
 */
const DRAG_STOP_EVENT_TYPES = new Set(['mouseup', 'touchend', 'touchcancel']);

interface TooltipBaseProps {
  /**
   * Specify how the trigger should align with the tooltip
   */
  align?: PopoverAlignment;

  /**
   * Pass in the child to which the tooltip will be applied
   */
  children?: React.ReactElement;

  /**
   * Specify an optional className to be applied to the container node
   */
  className?: string;

  /**
   * Specify whether the tooltip should be open when it first renders
   */
  defaultOpen?: boolean;

  /**
   * Provide the description to be rendered inside of the Tooltip. The
   * description will use `aria-describedby` and will describe the child node
   * in addition to the text rendered inside of the child. This means that if you
   * have text in the child node, that it will be announced alongside the
   * description to the screen reader.
   *
   * Note: if label and description are both provided, label will be used and
   * description will not be used
   */
  description?: React.ReactNode;

  /**
   * Specify whether a drop shadow should be rendered
   */
  dropShadow?: boolean;

  /**
   * Specify the duration in milliseconds to delay before displaying the tooltip
   */
  enterDelayMs?: number;

  /**
   * Provide the label to be rendered inside of the Tooltip. The label will use
   * `aria-labelledby` and will fully describe the child node that is provided.
   * This means that if you have text in the child node, that it will not be
   * announced to the screen reader.
   *
   * Note: if label and description are both provided, description will not be
   * used
   */
  label?: React.ReactNode;

  /**
   * Specify the duration in milliseconds to delay before hiding the tooltip
   */
  leaveDelayMs?: number;

  /**
   * The content to be rendered inside the popover menu.
   */
  menuContent?: React.ReactNode;

  /**
   *  The boolean to show the flyout menu has been selected.
   */
  selected?: boolean;

  /**
   *  The title for the overall menu name.
   */
  title?: string;
}

export type TooltipProps<T extends React.ElementType> = PolymorphicProps<
  T,
  TooltipBaseProps
>;

function SideNavFlyoutMenu<T extends React.ElementType>({
  align = 'right-start',
  className: customClassName,
  children,
  label,
  description,
  enterDelayMs = 100,
  leaveDelayMs = 100,
  defaultOpen = false,
  dropShadow = true,
  highContrast = false,
  menuContent,
  selected = false,
  title,
  ...rest
}: TooltipProps<T>) {
  const popoverRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useDelayedState(defaultOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [focusByMouse, setFocusByMouse] = useState(false);
  const [isPointerIntersecting, setIsPointerIntersecting] = useState(false);
  const id = useId('tooltip');
  const prefix = usePrefix();
  const child = React.Children.only(children);
  const menuButton = useRef<HTMLButtonElement | null>();

  const [clickMode, setClickMode] = useState(false);
  const isFocusedInsideRef = useRef(false);
  const popoverMenuLinks = useRef<NodeListOf<HTMLElement> | null>(null);

  const [isButtonFocused, setIsButtonFocused] = useState(false);

  const flyoutMenuItems = React.Children.map(menuContent, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...{
          isFlyoutMenuItem: true,
        },
      });
    }

    return child;
  });

  const triggerProps = {
    onFocus: () => {
      if (!focusByMouse) {
        setOpen(true);
        setIsButtonFocused(true);
        setClickMode(false);
        isFocusedInsideRef.current = false;
      }
    },
    onBlur: () => {
      if (!isFocusedInsideRef.current && !focusByMouse) {
        closeMenu();
      }
    },
    onClick: () => {
      setIsButtonFocused(false);
      setClickMode(!clickMode);
      setOpen(!clickMode);
    },
    // This should be placed on the trigger in case the element is disabled
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseMove: onMouseMove,
    onTouchStart: onDragStart,
  };

  function getChildEventHandlers(childProps: any) {
    const eventHandlerFunctions = Object.keys(triggerProps).filter((prop) =>
      prop.startsWith('on')
    );
    const eventHandlers = {};
    eventHandlerFunctions.forEach((functionName) => {
      eventHandlers[functionName] = (evt: React.SyntheticEvent) => {
        triggerProps[functionName](evt);
        if (childProps?.[functionName]) {
          childProps?.[functionName](evt);
        }
      };
    });
    return eventHandlers;
  }

  if (label) {
    triggerProps['aria-labelledby'] = id;
  } else {
    triggerProps['aria-describedby'] = id;
  }

  function onKeyDown(event) {
    if (open && match(event, keys.Escape)) {
      event.stopPropagation();
      if (!isButtonFocused) {
        closeMenu({ revertFocus: true });
      }

      setOpen(!isButtonFocused);
      setIsButtonFocused(!isButtonFocused);
    }

    if (match(event, keys.Enter) || match(event, keys.Space)) {
      setIsButtonFocused(false);
      setOpen(true);
      setFocusByMouse(false);

      // focus on the first link
      if (popoverMenuLinks?.current && !isFocusedInsideRef.current) {
        const firstLink = popoverMenuLinks?.current?.[0] as HTMLElement;
        setContentTabIndex('0');

        if (firstLink) {
          isFocusedInsideRef.current = true;
          // avoid race condition
          setTimeout(() => firstLink.focus(), 0);
        }
      }
    }
  }

  function onMouseEnter() {
    if (!clickMode) {
      if (!rest?.onMouseEnter) {
        setIsPointerIntersecting(true);
        setOpen(true, enterDelayMs);
      }
    }
  }

  function onMouseDown() {
    setFocusByMouse(true);
    onDragStart();
  }

  function onMouseLeave() {
    if (!clickMode && !isFocusedInsideRef.current) {
      setIsPointerIntersecting(false);
      if (isDragging) {
        return;
      }

      setIsButtonFocused(false);
      setOpen(false, leaveDelayMs);
    }
  }

  function onMouseMove(evt) {
    if (evt.buttons === 1) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  }

  function onDragStart() {
    setIsDragging(true);
  }

  const onDragStop = useCallback(() => {
    setIsDragging(false);
    // Close the tooltip, unless the mouse pointer is within the bounds of the
    // trigger.
    if (!isPointerIntersecting) {
      setIsButtonFocused(false);
      setOpen(false, leaveDelayMs);
    }
  }, [isPointerIntersecting, leaveDelayMs, setOpen]);

  useEffect(() => {
    if (isDragging) {
      // Register drag stop handlers.
      DRAG_STOP_EVENT_TYPES.forEach((eventType) => {
        document.addEventListener(eventType, onDragStop);
      });
    }
    return () => {
      DRAG_STOP_EVENT_TYPES.forEach((eventType) => {
        document.removeEventListener(eventType, onDragStop);
      });
    };
  }, [isDragging, onDragStop]);

  const setContentTabIndex = (value: string) => {
    if (popoverMenuLinks.current) {
      popoverMenuLinks.current.forEach((e) =>
        e.setAttribute('tabindex', value)
      );
    }
  };

  function handleBlur(event) {
    const isFocusOutside = !popoverRef.current?.contains(event.relatedTarget);

    // tab outside the menu
    if (open && isFocusedInsideRef.current && !focusByMouse && isFocusOutside) {
      closeMenu();
    }

    // if button has been clicked, and new click is outside the menu
    if (clickMode && isFocusOutside) {
      closeMenu();
    }
  }

  function closeMenu({ revertFocus = false }: { revertFocus?: boolean } = {}) {
    if (revertFocus) {
      menuButton.current?.focus();
      setOpen(true);
      setIsButtonFocused(true);
    } else {
      setOpen(false);
      setIsButtonFocused(false);
    }
    isFocusedInsideRef.current = false;
    setFocusByMouse(false);
    setIsPointerIntersecting(!clickMode);
    setClickMode(false);
    setContentTabIndex('-1');
  }

  // initiate menu content to be untabbable
  useEffect(() => {
    if (popoverRef.current) {
      popoverMenuLinks.current = popoverRef.current.querySelectorAll(
        `.${prefix}--side-nav-menu--popover-content a`
      ) as NodeListOf<HTMLElement>;

      setContentTabIndex('-1');

      menuButton.current = popoverRef.current.querySelector(
        `.${prefix}--side-nav__submenu`
      ) as HTMLButtonElement;
    }
  }, []);

  // set menu content to be untabbable
  useEffect(() => {
    if (popoverRef.current && !popoverMenuLinks.current) {
      popoverMenuLinks.current = popoverRef.current.querySelectorAll(
        `.${prefix}--side-nav-menu--popover-content a`
      ) as NodeListOf<HTMLElement>;

      setContentTabIndex('-1');
    }
  }, [open]);

  return (
    // @ts-ignore-error Popover throws a TS error everytime is imported
    <Popover
      ref={popoverRef}
      {...rest}
      as="li"
      align={isButtonFocused ? 'right' : align}
      className={cx(customClassName, {
        [`${prefix}--flyout-menu`]: true,
        [`${prefix}--flyout-menu-clicked`]: clickMode,
        [`${prefix}--flyout-menu-selected`]: selected,
        [`${prefix}--flyout-menu-focused`]: isButtonFocused || open,
      })}
      dropShadow={dropShadow}
      highContrast={false}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      onMouseLeave={onMouseLeave}
      open={open}>
      {child !== undefined
        ? React.cloneElement(child, {
            ...triggerProps,
            ...getChildEventHandlers(child.props),
          })
        : null}
      <PopoverContent
        aria-hidden={open ? 'false' : 'true'}
        className={cx({
          [`${prefix}--side-nav-menu--popover-content`]: !isButtonFocused,
          [`${prefix}--flyout-tooltip-content ${prefix}--tooltip-content`]:
            isButtonFocused,
        })}
        id={id}
        onMouseEnter={onMouseEnter}
        role="tooltip">
        {!isButtonFocused ? <FormLabel>{title}</FormLabel> : title}
        <div
          className={cx({
            [`${prefix}--flyout-menu-items`]: true,
            [`${prefix}--flyout-menu-items--focused-trigger`]: isButtonFocused,
          })}>
          {flyoutMenuItems}
        </div>
      </PopoverContent>
    </Popover>
  );
}

SideNavFlyoutMenu.propTypes = {
  /**
   * Specify how the trigger should align with the tooltip
   */
  align: PropTypes.oneOf([
    'top',
    'top-left', // deprecated use top-start instead
    'top-right', // deprecated use top-end instead

    'bottom',
    'bottom-left', // deprecated use bottom-start instead
    'bottom-right', // deprecated use bottom-end instead

    'left',
    'left-bottom', // deprecated use left-end instead
    'left-top', // deprecated use left-start instead

    'right',
    'right-bottom', // deprecated use right-end instead
    'right-top', // deprecated use right-start instead

    // new values to match floating-ui
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end',
    'left-end',
    'left-start',
    'right-end',
    'right-start',
  ]),

  /**
   * Pass in the child to which the tooltip will be applied
   */
  children: PropTypes.node,

  /**
   * Specify an optional className to be applied to the container node
   */
  className: PropTypes.string,

  /**
   * Specify whether the tooltip should be open when it first renders
   */
  defaultOpen: PropTypes.bool,

  /**
   * Provide the description to be rendered inside of the Tooltip. The
   * description will use `aria-describedby` and will describe the child node
   * in addition to the text rendered inside of the child. This means that if you
   * have text in the child node, that it will be announced alongside the
   * description to the screen reader.
   *
   * Note: if label and description are both provided, label will be used and
   * description will not be used
   */
  description: PropTypes.node,

  /**
   * Specify whether a drop shadow should be rendered
   */
  dropShadow: PropTypes.bool,

  /**
   * Specify the duration in milliseconds to delay before displaying the tooltip
   */
  enterDelayMs: PropTypes.number,

  /**
   * Provide the label to be rendered inside of the Tooltip. The label will use
   * `aria-labelledby` and will fully describe the child node that is provided.
   * This means that if you have text in the child node, that it will not be
   * announced to the screen reader.
   *
   * Note: if label and description are both provided, description will not be
   * used
   */
  label: PropTypes.node,

  /**
   * Specify the duration in milliseconds to delay before hiding the tooltip
   */
  leaveDelayMs: PropTypes.number,

  /**
   * The content to be rendered inside the popover menu.
   */
  menuContent: PropTypes.node,

  /**
   *  The boolean to show the flyout menu has been selected.
   */
  selected: PropTypes.bool,

  /**
   * The title for the overall menu name.
   */
  title: PropTypes.string,
};

export { SideNavFlyoutMenu };
