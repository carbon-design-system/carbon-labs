/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '../internal/usePrefix';

export interface TrialCountdownProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
  /**
   * Provide the number of days remaining
   */
  count: number;
  /**
   * Provide label text displayed next to the count. Defaults to "Trial days left"
   */
  text?: string;
  /**
   * Provide a warning style (red border). defaults to `false`
   */
  warning?: boolean;
}
export const TrialCountdown: React.FC<TrialCountdownProps> = ({
  className,
  count,
  text = 'Trial days left',
  warning = false,
}) => {
  const prefix = usePrefix();
  const classNames = cx(`${prefix}--trial-countdown`, className, {
    [`${prefix}--trial-countdown--warning`]: warning,
  });
  return (
    <p className={classNames}>
      <span className={`${prefix}--trial-countdown__count`}>{count}</span>{' '}
      {text}
    </p>
  );
};

TrialCountdown.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
  /**
   * Provide the number of days remaining
   */
  count: PropTypes.number.isRequired,
  /**
   * Provide label text displayed next to the count. Defaults to "Trial days left"
   */
  text: PropTypes.string,
  /**
   * Provide a warning style (red border). defaults to `false`
   */
  warning: PropTypes.bool,
};
