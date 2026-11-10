/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';

export interface ThinkingIndicatorProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

/**
 * The processing animation an agent shows while it thinks (Carbon2027 -
 * Modelling, Processing/Loading): three dots settle, ripple, a darker square
 * passes along them, they collapse to a point and spread again. It is
 * decorative; the label beside it says "Thinking". It replaces labs's
 * Processing for v12, and holds still under reduced motion.
 */
export function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
  const prefix = usePrefix();
  const block = `${prefix}--thinking-indicator`;
  return (
    <span className={cx(block, className)} aria-hidden="true">
      <span className={`${block}__dot ${block}__dot--start`} />
      <span className={`${block}__dot ${block}__dot--middle`} />
      <span className={`${block}__dot ${block}__dot--end`} />
    </span>
  );
}

ThinkingIndicator.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
