/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '../internal/usePrefix';

export interface SharkFinIconProps {
  /**
   * Provide a single icon as the child to `SharkfinIcon` to render in the
   * container
   */
  children?: React.ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Specify whether the icon should be placed in a smaller bounding box
   * Since the 'small' prop is not provided, we make it optional and set a default value to `false`.
   */
  small?: boolean;
}

export const SharkFinIcon: React.FC<SharkFinIconProps> = ({
  className: customClassName,
}) => {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--side-nav__icon`]: true,
    [`${prefix}--shark-fin__icon`]: true,
    [customClassName as string]: !!customClassName,
  });
  return (
    <svg
      className={className}
      width="4"
      height="4"
      viewBox="0 0 4 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_519_52879)">
        <path d="M2 2L4 0V4H0L2 2Z" />
      </g>
      <defs>
        <clipPath id="clip0_519_52879">
          <rect width="4" height="4" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

SharkFinIcon.propTypes = {
  /**
   * Provide a single icon as the child to `SharkfinIcon` to render in the
   * container
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Specify whether the icon should be placed in a smaller bounding box
   */
  small: PropTypes.bool,
};
