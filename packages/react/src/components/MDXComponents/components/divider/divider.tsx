/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface DividerProps {
  children: ReactNode;
  className?: string | null;
}

/**
 * The `<Divider>` component is a wrapper that adds a top border
 * and spacing to divide sections of content. It can a also be
 * used without children `<Divider />` to provide a horizontal
 * rule with correct spacing.
 */
export const Divider: MdxComponent<DividerProps> = ({
  children,
  className,
}) => {
  const classNames = clsx(className, withPrefix('divider'), {
    [withPrefix('divider--empty')]: children === undefined,
  });
  return <div className={classNames}>{children}</div>;
};

Divider.propTypes = {
  /**
   * Pass in the children that will be rendered within the divider
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Optional class name on the divider.
   */
  className: PropTypes.string,
};
