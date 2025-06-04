/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Menu, Pin } from '@carbon/icons-react';
import { usePrefix } from '../internal/usePrefix';

export default function SideNavPin({ expanded }) {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--side-nav__pin`]: true,
    [`${prefix}--side-nav__item`]: true,
  });
  return (
    <div className={className}>
      <Menu />
      {expanded && <Pin />}
    </div>
  );
}

SideNavPin.propTypes = {
  /**
   * If `true`, the SideNav will be expanded, otherwise it will be collapsed.
   * This prop is used to conditionally render the Pin icon.
   */
  expanded: PropTypes.bool,
};
