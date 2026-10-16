/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ForwardedRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  CheckmarkOutline,
  CircleDash,
  Incomplete,
  Warning,
} from '@carbon/react/icons';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { Kind, Kinds, Theme, Themes } from './Checklist.types';

// Default values for props
const defaults = {
  theme: Themes.light,
};

export interface ChecklistIconProps {
  /**
   * Provide an optional class to be applied to the containing node.
   */
  className?: string;
  /**
   * The icon to be displayed.
   */
  kind?: Kind;
  /**
   * Determines the theme of the component.
   */
  theme?: Theme;
}

/**
 * Icon that represents the state of a task in the Checklist.
 */
export const ChecklistIcon = React.forwardRef(
  (
    { className, kind, theme = defaults.theme, ...rest }: ChecklistIconProps,
    ref: ForwardedRef<HTMLSpanElement>
  ) => {
    const prefix = usePrefix();
    const blockClass = `${prefix}--checklist__icon`;

    let Icon;

    switch (kind) {
      case Kinds.error:
        Icon = Warning;
        break;
      case Kinds.indeterminate:
        Icon = Incomplete;
        break;
      case Kinds.checked:
        Icon = CheckmarkOutline;
        break;

      default:
        // "unchecked" or "disabled"
        Icon = CircleDash;
        break;
    }

    return (
      <span
        {...rest}
        className={cx(
          blockClass,
          className,
          `${blockClass}--${kind}`,
          `${blockClass}__${theme}`
        )}
        ref={ref}>
        <Icon size={16} />
      </span>
    );
  }
);

ChecklistIcon.displayName = 'ChecklistIcon';

ChecklistIcon.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,
  /**
   * The icon to be displayed.
   */
  kind: PropTypes.oneOf([
    Kinds.unchecked,
    Kinds.indeterminate,
    Kinds.checked,
    Kinds.disabled,
    Kinds.error,
  ]),
  /**
   * Determines the theme of the component.
   */
  theme: PropTypes.oneOf([Themes.light, Themes.dark]),
};
