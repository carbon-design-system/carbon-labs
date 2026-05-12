/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '../internal/usePrefix';

import {
  HeaderPopover,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';
import { OverflowMenuVertical } from '@carbon/icons-react';
import { useMatchMedia } from '../internal/useMatchMedia';
import { breakpoints } from '@carbon/layout';
const mdMediaQuery = `(max-width: ${breakpoints.md.width})`;

export interface HeaderOverflowPanelProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Custom children to be rendered within the popover of the Overflow panel menu
   */
  children?: React.ReactNode;

  /**
   * Provide the Overflow panel's label
   */
  label?: string;
}

export const HeaderOverflowPanel = React.forwardRef<
  HTMLDivElement,
  HeaderOverflowPanelProps
>(function HeaderOverflowPanel(
  {
    className: customClassName,
    children,
    label,
    ...rest
  }: HeaderOverflowPanelProps,
  ref
) {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--header-overflow-panel`]: true,
    [customClassName as string]: !!customClassName,
  });
  const isMd = useMatchMedia(mdMediaQuery);
  return (
    <HeaderPopover ref={ref} align="bottom-end" className={className} {...rest}>
      <HeaderPopoverButton align={isMd ? 'bottom-end' : 'bottom'} label={label}>
        <OverflowMenuVertical />
      </HeaderPopoverButton>
      <HeaderPopoverContent>
        <ul>{children}</ul>
      </HeaderPopoverContent>
    </HeaderPopover>
  );
});

HeaderOverflowPanel.propTypes = {
  /**
   * Custom children to be rendered within the popover of the Profile menu
   */
  children: PropTypes.any,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Provide the Overflow panel's label
   */
  label: PropTypes.string,
};
