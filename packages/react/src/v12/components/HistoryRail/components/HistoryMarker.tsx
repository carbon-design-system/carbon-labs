/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';

export type HistoryMarkerState =
  | 'default'
  | 'highlighted'
  | 'current'
  | 'failed';

export interface HistoryMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * What this iteration is: `default` for a past one, `highlighted` for the
   * one the pointer is nearest or the keyboard is on, `current` for the live
   * one, `failed` for a run that did not finish.
   */
  state?: HistoryMarkerState;
}

/**
 * One iteration, drawn on a HistoryRail's track. It is a mark, not a control:
 * the rail is the control, so a mark has no pointer target of its own, takes
 * no focus, and never moves when it changes.
 */
export const HistoryMarker = forwardRef<HTMLSpanElement, HistoryMarkerProps>(
  function HistoryMarker({ className, state = 'default', ...rest }, ref) {
    const prefix = usePrefix();
    const block = `${prefix}--history-marker`;

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cx(block, `${block}--${state}`, className)}
        {...rest}
      />
    );
  }
);

HistoryMarker.displayName = 'HistoryMarker';

HistoryMarker.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * What this iteration is: `default` for a past one, `highlighted` for the
   * one the pointer is nearest or the keyboard is on, `current` for the live
   * one, `failed` for a run that did not finish.
   */
  state: PropTypes.oneOf([
    'default',
    'highlighted',
    'current',
    'failed',
  ] as const),
} as React.WeakValidationMap<HistoryMarkerProps>;
