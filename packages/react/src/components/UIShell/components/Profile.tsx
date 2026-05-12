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

import { UserAvatar } from '@carbon/ibm-products';

interface ProfileProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Custom children to be rendered within the popover of the Profile menu
   */
  children?: React.ReactNode;

  /**
   * Provide the Profile's label
   */
  label?: string;

  /**
   * Provide an optional icon to render in Profile.
   */
  renderIcon?: React.ReactNode;
}

const Profile = React.forwardRef<HTMLDivElement, ProfileProps>(function Profile(
  {
    className: customClassName,
    label,
    children,
    renderIcon: IconElement,
    ...rest
  }: ProfileProps,
  ref
) {
  const prefix = usePrefix();
  const className = cx({
    [`${prefix}--profile`]: true,
    [customClassName as string]: !!customClassName,
  });
  return (
    <HeaderPopover ref={ref} align="bottom-end" className={className} {...rest}>
      <HeaderPopoverButton align="bottom-end" label={label}>
        {IconElement}
      </HeaderPopoverButton>
      <HeaderPopoverContent>{children}</HeaderPopoverContent>
    </HeaderPopover>
  );
});
Profile.displayName = 'Profile';

Profile.propTypes = {
  /**
   * Custom children to be rendered within the popover of the Profile menu
   */
  children: PropTypes.any,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Provide the Profile's label
   */
  label: PropTypes.string,

  /**
   * Provide an optional icon to render in Profile.
   */
  // @ts-expect-error - PropTypes are unable to cover this case.
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

interface ProfileUserInfoProps {
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

const ProfileUserInfo = React.forwardRef<HTMLDivElement, ProfileUserInfoProps>(
  function ProfileUserInfo(
    { className: customClassName, name, email, ...rest }: ProfileUserInfoProps,
    ref
  ) {
    const prefix = usePrefix();
    const className = cx({
      [`${prefix}--profile-user-info`]: true,
      [customClassName as string]: !!customClassName,
    });
    return (
      <div ref={ref} className={className}>
        <UserAvatar size="lg" name={name} {...rest} />
        <div className={`${prefix}--profile-user-info__text-wrapper`}>
          <div className={`${prefix}--profile-user-info__name`}>{name}</div>
          <div className={`${prefix}--profile-user-info__email`}>{email}</div>
        </div>
      </div>
    );
  }
);
ProfileUserInfo.displayName = 'ProfileUserInfo';

ProfileUserInfo.propTypes = {
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

interface ProfileReadOnlyItem {
  label: string;
  title: string;
}

interface ProfileReadOnlyProps {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * List of read-only profile items
   */
  items?: ProfileReadOnlyItem[];
}

const ProfileReadOnly = React.forwardRef<HTMLDivElement, ProfileReadOnlyProps>(
  function ProfileReadOnly(
    { className: customClassName, items }: ProfileReadOnlyProps,
    ref
  ) {
    const prefix = usePrefix();
    const className = cx({
      [`${prefix}--profile-read-only`]: true,
      [customClassName as string]: !!customClassName,
    });
    return (
      <div ref={ref} className={className}>
        {items?.map((item, index) => (
          <div className={`${prefix}--profile-read-only__items`} key={index}>
            <div className={`${prefix}--profile-read-only__label`}>
              {item.label}
            </div>
            <div className={`${prefix}--profile-read-only__title`}>
              {item.title}
            </div>
          </div>
        ))}
      </div>
    );
  }
);
ProfileReadOnly.displayName = 'ProfileReadOnly';

ProfileReadOnly.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * List of read-only profile items
   */
  items: PropTypes.array,
};

/**
 * -------
 * Exports
 * -------
 */
const Root = Profile;
Root.displayName = 'Profile.Root';

const UserInfo = ProfileUserInfo;
UserInfo.displayName = 'ProfileUserInfo';

const ReadOnly = ProfileReadOnly;
ReadOnly.displayName = 'ProfileReadOnly';

export {
  // direct exports
  Profile,
  ProfileUserInfo,
  ProfileReadOnly,
  // namespaced
  Root,
  UserInfo,
  ReadOnly,
};

export type { ProfileProps, ProfileUserInfoProps };
