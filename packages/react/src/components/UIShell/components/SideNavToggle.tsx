/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {
  ComponentType,
  ElementType,
  ForwardedRef,
  ReactNode,
  forwardRef,
  useContext,
} from 'react';
import { LinkProps, LinkPropTypes } from './Link';
import { SideNavIcon, SideNavItem, SideNavLinkText } from '@carbon/react';
import { usePrefix } from '../internal/usePrefix';
import { SIDE_NAV_TYPE, SideNavContext } from './SideNav';
import { SideNavLinkPopover } from './SideNavLinkPopover';

export type SideNavToggleProps<E extends ElementType> = LinkProps<E> & {
  /**
   * Required props for the accessibility label
   */
  'aria-label'?: string;

  /**
   * Required props for the accessibility label
   */

  'aria-labelledby'?: string;
  /**
   * Specify the text content for the link
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Specify whether the link is the current page
   */
  isActive?: boolean;

  /**
   * Property to indicate if the side nav container is open (or not). Use to
   * keep local state and styling in step with the SideNav expansion state.
   */
  isSideNavExpanded?: boolean;

  /**
   * Specify if this is a large variation of the SideNavLink
   */
  large?: boolean;

  /**
   * Provide an icon to render in the side navigation link. Should be a React class.
   */
  renderIcon?: ComponentType;

  /**
   * Optional prop to specify the tabIndex of the button. If undefined, it will be applied default validation
   */
  tabIndex?: number;
};

export interface SideNavLinkComponent {
  (
    props: SideNavToggleProps<'button'> & {
      ref?: ForwardedRef<HTMLButtonElement>;
    }
  ): JSX.Element | null;
  displayName?: string;
  propTypes?: Partial<
    Record<keyof SideNavToggleProps<any>, PropTypes.Validator<any>>
  >;
}

export const SideNavToggle: SideNavLinkComponent = forwardRef(
  function SideNavToggle(
    {
      children,
      className: customClassName,
      disabled,
      renderIcon: IconElement,
      large = false,
      tabIndex,
      ...rest
    }: SideNavToggleProps<'button'>,
    ref: ForwardedRef<HTMLButtonElement>
  ) {
    const { expanded, navType } = useContext(SideNavContext);
    const prefix = usePrefix();
    const className = cx({
      [`${prefix}--side-nav__toggle`]: true,
      [`${prefix}--side-nav__toggle--disabled`]: disabled,
      [customClassName as string]: !!customClassName,
    });
    const SideNavLinkIcon = IconElement && (
      <SideNavIcon small>
        <IconElement />
      </SideNavIcon>
    );

    if (!expanded && navType === SIDE_NAV_TYPE.RAIL_PANEL) {
      return (
        <SideNavLinkPopover
          align="right"
          className={className}
          label={children}
          {...rest}>
          {SideNavLinkIcon}
        </SideNavLinkPopover>
      );
    }

    return (
      <SideNavItem large={large}>
        <button
          className={className}
          ref={ref}
          type="button"
          tabIndex={tabIndex ?? 0}
          disabled={disabled}
          {...rest}>
          {SideNavLinkIcon}
          <SideNavLinkText>{children}</SideNavLinkText>
        </button>
      </SideNavItem>
    );
  }
) as SideNavLinkComponent;

SideNavToggle.displayName = 'SideNavToggle';
SideNavToggle.propTypes = {
  ...LinkPropTypes,

  /**
   * Specify the text content for the link
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Specify whether the link is the current page
   */
  isActive: PropTypes.bool,

  /**
   * Property to indicate if the side nav container is open (or not). Use to
   * keep local state and styling in step with the SideNav expansion state.
   */
  isSideNavExpanded: PropTypes.bool,

  /**
   * Specify if this is a large variation of the SideNavLink
   */
  large: PropTypes.bool,

  /**
   * Provide an icon to render in the side navigation link. Should be a React class.
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * Optional prop to specify the tabIndex of the button. If undefined, it will be applied default validation
   */
  tabIndex: PropTypes.number,
};

export default SideNavToggle;
