/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf } from '@carbon-labs/react-feedback';
import { UserAvatar, type UserAvatarProps } from './UserAvatar';

/* ============================================================================
 * UserAvatarSkeleton: an avatar, loading.
 *
 *   data      the person: the avatar is one block of its own circle
 *
 * API: the UserAvatar's `size`.
 * ========================================================================== */

export type UserAvatarSkeletonProps = Pick<
  UserAvatarProps,
  'size' | 'className'
>;

export function UserAvatarSkeleton(props: UserAvatarSkeletonProps) {
  return (
    <SkeletonOf blocks=".cds-avatar">
      <UserAvatar {...props} />
    </SkeletonOf>
  );
}
