/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useContext } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Menu, Pin, PinFilled } from '@carbon/icons-react';
import { usePrefix } from '../internal/usePrefix';
import { SideNavContext } from './SideNav';

export interface SideNavPinProps {
  handlePin?: () => void;
  onSideNavPinClick?: () => void;
  pinned?: boolean;
  renderIcon?: React.ComponentType;
}

export default function SideNavPin({
  handlePin,
  onSideNavPinClick,
  pinned,
  renderIcon: IconElement = Menu,
}: SideNavPinProps) {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--side-nav__pin`]: true,
    [`${prefix}--side-nav__item`]: true,
  });
  const Icon = () =>
    IconElement && (
      <div className={`${prefix}--side-nav__icon`}>
        <IconElement />
      </div>
    );
  const PinIcon = (props?: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`${prefix}--side-nav__icon`} {...props}>
      {pinned ? <PinFilled /> : <Pin />}
    </div>
  );
  const { expanded } = useContext(SideNavContext);
  return (
    <div className={className}>
      <Icon />
      {expanded && (
        <PinIcon
          onClick={() => {
            onSideNavPinClick?.();
            handlePin?.();
          }}
        />
      )}
    </div>
  );
}

SideNavPin.propTypes = {
  /**
   * Function to handle pinning the side navigation
   */
  handlePin: PropTypes.func,

  /**
   * Function to handle pin click event
   */
  onSideNavPinClick: PropTypes.func,

  /**
   * Whether the side navigation is pinned
   */
  pinned: PropTypes.bool,

  /**
   * The icon to render in the side navigation rail
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
