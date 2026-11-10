/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, type ReactNode } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';

export interface HistoryMarkerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * One line on what changed in this iteration.
   */
  description?: ReactNode;

  /**
   * Which iteration this is — "Iteration 11".
   */
  label: ReactNode;
}

/**
 * What the rail says about the iteration under the pointer or the keyboard:
 * the iteration, and one line on what changed.
 *
 * It is hidden from assistive technology on purpose. The rail is a slider and
 * its `aria-valuetext` already carries these words; a second copy would say
 * everything twice.
 */
export const HistoryMarkerCard = forwardRef<
  HTMLDivElement,
  HistoryMarkerCardProps
>(function HistoryMarkerCard({ className, description, label, ...rest }, ref) {
  const prefix = usePrefix();
  const block = `${prefix}--history-marker-card`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx(block, className)}
      {...rest}>
      <span className={`${block}__label`}>{label}</span>
      {description ? (
        <span className={`${block}__description`}>{description}</span>
      ) : null}
    </div>
  );
});

HistoryMarkerCard.displayName = 'HistoryMarkerCard';

HistoryMarkerCard.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * One line on what changed in this iteration.
   */
  description: PropTypes.node,

  /**
   * Which iteration this is — "Iteration 11".
   */
  label: PropTypes.node.isRequired,
} as React.WeakValidationMap<HistoryMarkerCardProps>;
