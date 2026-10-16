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
import { purple50, gray20, gray70 } from '@carbon/colors';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { Theme, Themes } from './Checklist.types';

// Default values for props
const defaults = {
  theme: Themes.light,
};

export interface ChecklistChartProps {
  /**
   * Optional class name for this component.
   */
  className?: string;
  /**
   * Determines the theme of the component.
   */
  theme?: Theme;
  /**
   * Number between 0 and 1.
   */
  value: number;
}

/**
 * Custom donut chart component used within the Checklist.
 */
export const ChecklistChart = React.forwardRef(
  (
    { className, value, theme = defaults.theme, ...rest }: ChecklistChartProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const prefix = usePrefix();
    const blockClass = `${prefix}--checklist__chart`;

    const numDegrees = Math.min(Math.max(value * 360, 0), 360);
    const circleColor = theme === Themes.light ? gray20 : gray70; // $ui-03 (-ish)
    const progressColor = purple50;

    return (
      <div
        {...rest}
        className={cx(blockClass, className)}
        ref={ref}
        role="img"
        // eslint-disable-next-line react/forbid-dom-props
        style={{
          backgroundImage: `conic-gradient(${progressColor} ${numDegrees}deg, ${circleColor} ${numDegrees}deg 360deg)`,
          borderRadius: '50%',
        }}
      />
    );
  }
);

ChecklistChart.displayName = 'ChecklistChart';

ChecklistChart.propTypes = {
  /**
   * Optional class name for this component.
   */
  className: PropTypes.string,
  /**
   * Determines the theme of the component.
   */
  theme: PropTypes.oneOf([Themes.light, Themes.dark]),
  /**
   * Number between 0 and 1.
   */
  value: PropTypes.number.isRequired,
};
