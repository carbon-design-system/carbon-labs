/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEventHandler,
  type FocusEventHandler,
} from 'react';
import {
  IconButton,
  Popover,
  PopoverContent,
  ToggletipActions,
  ToggleTipButtonProps,
  ToggletipContent,
  ToggletipContentProps,
  ToggletipProps,
} from '@carbon/react';
import { match, keys } from '../internal/keyboard';
import { useWindowEvent } from '../internal/useEvent';
import { useId } from '../internal/useId.js';
import { usePrefix } from '../internal/usePrefix';

type ToggleTipContextType =
  | undefined
  | {
      buttonProps: ComponentProps<'button'>;
      contentProps: ComponentProps<typeof PopoverContent>;
      onClick: ComponentProps<'button'>;
    };

// Used to coordinate accessibility props between button and content along with
// the actions to open and close the toggletip
const HeaderPopoverContext =
  React.createContext<ToggleTipContextType>(undefined);

function useToggletip() {
  return useContext(HeaderPopoverContext);
}

/**
 * Used as a container for the button and content of a toggletip. This component
 * is responsible for coordinating between interactions with the button and the
 * visibility of the content
 */
export function HeaderPopover({
  align,
  as,
  autoAlign,
  className: customClassName,
  children,
  defaultOpen = false,
  ...rest
}: ToggletipProps<any>) {
  const ref = useRef<Element>(null);
  const [open, setOpen] = useState(defaultOpen);
  const prefix = usePrefix();
  const id = useId();
  const className = cx(customClassName, {
    [`${prefix}--header-action`]: true,
    [`${prefix}--autoalign`]: autoAlign,
  });
  const actions = {
    toggle: () => {
      setOpen(!open);
    },
    close: () => {
      setOpen(false);
    },
  };
  const value = {
    buttonProps: {
      'aria-expanded': open,
      'aria-controls': id,
      onClick: actions.toggle,
    },
    contentProps: {
      id,
    },
    onClick: {
      onClick: actions.toggle,
    },
  };

  const onKeyDown: KeyboardEventHandler = (event) => {
    if (open && match(event, keys.Escape)) {
      actions.close();

      // If the menu is closed while focus is still inside the menu, it should return to the trigger button  (#12922)
      const button = ref.current?.children[0];
      if (button instanceof HTMLButtonElement) {
        button.focus();
      }
    }
  };

  const handleBlur: FocusEventHandler = (event) => {
    // Do not close if the menu itself is clicked, should only close on focus out
    if (open && event.relatedTarget === null) {
      return;
    }
    if (!event.currentTarget.contains(event.relatedTarget)) {
      // The menu should be closed when focus leaves the `Toggletip`  (#12922)
      actions.close();
    }
  };

  // If the `Toggletip` is the last focusable item in the tab order, it should also close when the browser window loses focus  (#12922)
  useWindowEvent('blur', () => {
    if (open) {
      actions.close();
    }
  });

  useWindowEvent('click', (event) => {
    if (open && ref.current && !ref.current.contains(event.target as Node)) {
      actions.close();
    }
  });

  return (
    <HeaderPopoverContext.Provider value={value}>
      <Popover<any>
        align={align}
        autoAlign={autoAlign}
        as={as}
        backgroundToken="background"
        border
        isTabTip
        className={className}
        dropShadow={true}
        highContrast={false}
        open={open}
        onKeyDown={onKeyDown}
        onBlur={handleBlur}
        ref={ref}
        {...rest}>
        {children}
      </Popover>
    </HeaderPopoverContext.Provider>
  );
}

HeaderPopover.propTypes = {
  /**
   * Specify how the toggletip should align with the button
   */
  align: PropTypes.oneOf([
    'top',
    'bottom',
    'left',
    'right',
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
   * Provide an offset value for alignment axis.
   */
  alignmentAxisOffset: PropTypes.number,

  /**
   * Provide a custom element or component to render the top-level node for the
   * component.
   */
  as: PropTypes.elementType,

  /**
   * Will auto-align the popover on first render if it is not visible. This prop is currently experimental and is subject to future changes.
   */
  autoAlign: PropTypes.bool,

  /**
   * Custom children to be rendered as the content of the label
   */
  children: PropTypes.node,

  /**
   * Provide a custom class name to be added to the outermost node in the
   * component
   */
  className: PropTypes.string,

  /**
   * Specify if the toggletip should be open by default
   */
  defaultOpen: PropTypes.bool,
};

/**
 * `ToggletipButton` controls the visibility of the Toggletip through mouse
 * clicks and keyboard interactions.
 */

export function HeaderPopoverButton<T extends React.ElementType>({
  children,
  className: customClassName,
  label = 'Show information',
  as: BaseComponent,
  ...rest
}: ToggleTipButtonProps<T>) {
  const toggletip = useToggletip();
  const prefix = usePrefix();
  const className = cx(customClassName, {
    [`${prefix}--header-action__button`]: true,
  });
  const ComponentToggle: any = BaseComponent ?? IconButton;

  // Only pass highContrast to IconButton, not to custom components
  const componentProps = BaseComponent
    ? {
        ...toggletip?.onClick,
        className,
        kind: null,
        label,
        ...rest,
      }
    : {
        ...toggletip?.onClick,
        className,
        kind: 'ghost',
        label,
        highContrast: false,
        ...rest,
      };

  return <ComponentToggle {...componentProps}>{children}</ComponentToggle>;
}

HeaderPopoverButton.propTypes = {
  /**
   * Custom children to be rendered as the content of the label
   */
  children: PropTypes.node,

  /**
   * Provide a custom class name to be added to the outermost node in the
   * component
   */
  className: PropTypes.string,

  /**
   * Provide an accessible label for this button
   */
  label: PropTypes.string,
};

/**
 * `ToggletipContent` is a wrapper around `PopoverContent`. It places the
 * `children` passed in as a prop inside of `PopoverContent` so that they will
 * be rendered inside of the popover for this component.
 */
export function HeaderPopoverContent({
  children,
  className,
  ...rest
}: ToggletipContentProps) {
  const prefix = usePrefix();
  return (
    <ToggletipContent
      className={cx(className, {
        [`${prefix}--header-action__content`]: true,
      })}
      {...rest}>
      {children}
    </ToggletipContent>
  );
}

/**
 * `ToggletipActions` is a container for one or two actions present at the base
 * of a toggletip. It is used for layout of these items.
 */
const HeaderPopoverActions = ToggletipActions;
export { HeaderPopoverActions };
