/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { ForwardedRef, ReactNode, Ref } from 'react';
import { SideNavIcon } from '@carbon/react';
import { usePrefix } from '../internal/usePrefix';

interface SideNavToggleProps {
  /**
   * Specify an optional className to be applied to the button node
   */
  className?: string;

  /**
   * Specify the text content for the link
   */
  children: ReactNode;

  /**
   * Provide an optional function to be called when the item is clicked.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * A custom icon to render next to the SideNavToggle title. This can be a function returning JSX or JSX itself.
   */
  renderIcon?: React.ComponentType;

  /**
   * The tabIndex for the button element.
   * If not specified, the default validation will be applied.
   */
  tabIndex?: number;
}

export const SideNavToggle = React.forwardRef<HTMLElement, SideNavToggleProps>(
  function SideNavToggle(
    {
      className: customClassName,
      renderIcon: IconElement,
      tabIndex,
      children,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>
  ) {
    const prefix = usePrefix();

    return (
      <button
        className={cx(customClassName, {
          [`${prefix}--side-nav__toggle`]: true,
        })}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        tabIndex={tabIndex ?? 0}
        {...rest}>
        {IconElement && (
          <SideNavIcon>
            <IconElement />
          </SideNavIcon>
        )}
        <span className={`${prefix}--side-nav__toggle-text`}>{children}</span>
      </button>
    );
  }
);
SideNavToggle.displayName = 'SideNavToggle';

SideNavToggle.propTypes = {
  /**
   * Specify the text content for the toggle
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Specify an optional className to be applied to the button node
   */
  className: PropTypes.string,

  /**
   * Provide an optional function to be called when clicked
   */
  onClick: PropTypes.func,

  /**
   * Pass in a custom icon to render next to the `SideNavToggle` title
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * Optional prop to specify the tabIndex of the button. If undefined, it will be applied default validation
   */
  tabIndex: PropTypes.number,
};

export default SideNavToggle;
