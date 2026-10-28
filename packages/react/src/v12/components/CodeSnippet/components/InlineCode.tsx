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

export interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The file, command or tool being named (`page.py`, `carbon-mcp`).
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

/**
 * A file, command or tool named in running text: a reference, not a snippet to
 * copy. Carbon's inline CodeSnippet is a copy button; this is a `<code>`
 * element and does nothing on its own. Wrap it in a link or a button when the
 * name should open something.
 */
export const InlineCode = forwardRef<HTMLElement, InlineCodeProps>(
  function InlineCode({ children, className, ...rest }, ref) {
    const prefix = usePrefix();
    return (
      <code
        ref={ref}
        className={cx(`${prefix}--inline-code`, className)}
        {...rest}>
        {children}
      </code>
    );
  }
);

InlineCode.displayName = 'InlineCode';

InlineCode.propTypes = {
  /**
   * The file, command or tool being named (`page.py`, `carbon-mcp`).
   */
  children: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
