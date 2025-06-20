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
import { UserAvatar } from '@carbon/ibm-products';

export interface UserInfoProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Provide the user's email
   */
  email?: string;

  /**
   * When passing the name prop, either send the initials to be used or the user's full name. The first two capital letters of the user's name will be used as the name.
   */
  name: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  className: customClassName,
  name,
  email,
  ...rest
}) => {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--user-info`]: true,
    [customClassName as string]: !!customClassName,
  });
  return (
    <div className={className}>
      <UserAvatar size="lg" {...rest} />
      <div className={`${prefix}--user-info__text-wrapper`}>
        <div className={`${prefix}--user-info__name`}>{name}</div>
        <div className={`${prefix}--user-info__email`}>{email}</div>
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Provide the user's email
   */
  email: PropTypes.string,

  /**
   * When passing the name prop, either send the initials to be used or the user's full name. The first two capital letters of the user's name will be used as the name.
   */
  name: PropTypes.string.isRequired,
};
