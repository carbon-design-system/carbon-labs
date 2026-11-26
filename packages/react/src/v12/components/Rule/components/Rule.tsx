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

export interface RuleProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Provide an optional class to be applied to the rule
   */
  className?: string;
}

/**
 * One 1px line in `$border-subtle`, the width of whatever holds it. Carbon has
 * no standalone divider: its Menu, Switcher and SideNav dividers are each this
 * rule, so this is that rule and nothing more. It carries no text and no
 * layout; a boundary composes it beside a notice (see `ChatSection`). A
 * standalone rule is a separator; where it only flanks text, pass
 * `aria-hidden` so it is not announced.
 */
export const Rule = forwardRef<HTMLHRElement, RuleProps>(function Rule(
  { className, ...rest },
  ref
) {
  const prefix = usePrefix();

  return (
    <hr ref={ref} className={cx(`${prefix}--rule`, className)} {...rest} />
  );
});

Rule.displayName = 'Rule';

Rule.propTypes = {
  /**
   * Provide an optional class to be applied to the rule
   */
  className: PropTypes.string,
};
