/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import { IconButton, IconButtonAlignment, ButtonSize } from '@carbon/react';
import { usePrefix } from '../internal/usePrefix';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Specify how the trigger should align with the tooltip
   */
  align?: IconButtonAlignment;

  /**
   * **Experimental**: Will attempt to automatically align the tooltip
   */
  autoAlign?: boolean;

  /**
   * Optionally specify an href for your IconButton to become an `<a>` element
   */
  href?: string;

  /**
   * Provide an icon or asset to be rendered inside of the IconButton
   */
  children?: ReactNode;

  /**
   * Specify an optional className to be added to your Button
   */
  className?: string;

  /**
   * Determines whether the tooltip should close when inner content is activated (click, Enter or Space)
   */
  closeOnActivation?: boolean;

  /**
   * Specify whether the tooltip should be open when it first renders
   */
  defaultOpen?: boolean;

  /**
   * Specify whether the Button should be disabled, or not
   */
  disabled?: boolean;

  /**
   * Specify the duration in milliseconds to delay before displaying the tooltip
   */
  enterDelayMs?: number;

  /**
   * Specify whether the IconButton is currently selected
   */

  isSelected?: boolean;

  /**
   * Provide the label to be rendered inside of the Tooltip. The label will use
   * `aria-labelledby` and will fully describe the child node that is provided.
   * This means that if you have text in the child node it will not be
   * announced to the screen reader.
   */
  label: ReactNode;

  /**
   * Specify the duration in milliseconds to delay before hiding the tooltip
   */
  leaveDelayMs?: number;

  /**
   * Specify the size of the Button. Defaults to `md`.
   */
  size?: ButtonSize;

  /**
   * Specify an optional className to be added to your Tooltip wrapper
   */
  wrapperClasses?: string;
}

export function SideNavLinkPopover({
  className,
  children,
  ...rest
}: IconButtonProps) {
  const prefix = usePrefix();
  return (
    <IconButton
      className={cx(className, `${prefix}--side-nav-link-popover`)}
      dropShadow
      highContrast={false}
      kind="ghost"
      {...rest}>
      {children}
    </IconButton>
  );
}

SideNavLinkPopover.propTypes = {
  /**
   * Specify how the trigger should align with the tooltip
   */
  align: PropTypes.oneOf([
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-end',
    'left-start',
    'right',
    'right-end',
    'right-start',
  ]),

  /**
   * **Experimental**: Will attempt to automatically align the tooltip
   */
  autoAlign: PropTypes.bool,

  /**
   * Provide an icon or asset to be rendered inside of the IconButton
   */
  children: PropTypes.node,

  /**
   * Specify an optional className to be added to your Button
   */
  className: PropTypes.string,

  /**
   * Determines whether the tooltip should close when inner content is activated (click, Enter or Space)
   */
  closeOnActivation: PropTypes.bool,

  /**
   * Specify whether the tooltip should be open when it first renders
   */
  defaultOpen: PropTypes.bool,

  /**
   * Specify whether the Button should be disabled, or not
   */
  disabled: PropTypes.bool,

  /**
   * Specify the duration in milliseconds to delay before displaying the tooltip
   */
  enterDelayMs: PropTypes.number,

  /**
   * Optionally specify an href for your IconButton to become an `<a>` element
   */
  href: PropTypes.string,

  /**
   * Specify whether the IconButton is currently selected
   */

  isSelected: PropTypes.bool,

  /**
   * Provide the label to be rendered inside of the Tooltip. The label will use
   * `aria-labelledby` and will fully describe the child node that is provided.
   * This means that if you have text in the child node it will not be
   * announced to the screen reader.
   */
  label: PropTypes.node.isRequired,

  /**
   * Specify the duration in milliseconds to delay before hiding the tooltip
   */
  leaveDelayMs: PropTypes.number,

  /**
   * Specify the size of the Button. Defaults to `md`.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  /**
   * Specify an optional className to be added to your Tooltip wrapper
   */
  wrapperClasses: PropTypes.string,
};

export default SideNavLinkPopover;
