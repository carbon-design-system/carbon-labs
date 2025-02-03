/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { ForwardedRef, Ref } from 'react';
import { SideNavIcon } from '@carbon/react';
import { usePrefix } from '@carbon/react/lib/internal/usePrefix';

interface SideNavToggleProps {
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

  /**
   * The title of the SideNavToggle.
   */
  title: string;
}

export const SideNavToggle = React.forwardRef<HTMLElement, SideNavToggleProps>(
  function SideNavToggle(
    { renderIcon: IconElement, tabIndex, title, ...rest },
    ref: ForwardedRef<HTMLElement>
  ) {
    const prefix = usePrefix();

    return (
      <button
        className={`${prefix}--side-nav__toggle`}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        tabIndex={tabIndex ?? 0}
        {...rest}>
        {IconElement && (
          <SideNavIcon>
            <IconElement />
          </SideNavIcon>
        )}
        <span className={`${prefix}--side-nav__toggle-title`}>{title}</span>
      </button>
    );
  }
);
SideNavToggle.displayName = 'SideNavToggle';

SideNavToggle.propTypes = {
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

  /**
   * Provide the text for the overall toggle name
   */
  title: PropTypes.string.isRequired,
};

export default SideNavToggle;
