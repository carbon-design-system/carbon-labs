/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode, forwardRef, useId, useState } from 'react';
import { ChevronDown } from '@carbon/react/icons';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

type Theme = 'light' | 'dark';

export interface NonLinearReadingProps {
  /**
   * The keyword of the component appears as a pill.
   */
  children: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node.
   */
  className?: string;

  /**
   * The content that appears when the keyword is toggled open.
   */
  definition: ReactNode;

  /**
   * Determines the theme of the component.
   */
  theme?: Theme;
}

/**
 * Use non-linear reading when space is limited to share a
 * brief, at-a-glance, summary of a concept that may require
 * more explanation for some users.
 */
export const NonLinearReading = forwardRef<
  HTMLSpanElement,
  NonLinearReadingProps
>(({ children, className, definition, theme = 'light', ...rest }, ref) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--non-linear-reading`;
  const [isOpen, setOpen] = useState(false);
  const contentId = useId();

  const handleToggle = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <span
      {...rest}
      className={cx(blockClass, `${blockClass}__${theme}`, className)}
      ref={ref}>
      {' '}
      <button
        type="button"
        aria-controls={contentId}
        aria-expanded={isOpen}
        className={cx(
          `${blockClass}__keyword`,
          isOpen
            ? `${blockClass}__keyword-open`
            : `${blockClass}__keyword-closed`
        )}
        onClick={handleToggle}>
        {children}
        <ChevronDown size={16} />
      </button>{' '}
      <span id={contentId} className={`${blockClass}__body`} hidden={!isOpen}>
        {isOpen && definition}
      </span>{' '}
    </span>
  );
});

NonLinearReading.displayName = 'NonLinearReading';

NonLinearReading.propTypes = {
  /**
   * The keyword of the component appears as a pill.
   */
  children: PropTypes.node
    .isRequired as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,

  /**
   * The content that appears when the keyword is toggled open.
   */
  definition: PropTypes.node
    .isRequired as unknown as React.Validator<React.ReactNode>,

  /**
   * Determines the theme of the component.
   */
  theme: PropTypes.oneOf(['light', 'dark']),
};
