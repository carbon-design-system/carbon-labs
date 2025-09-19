/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum ProfileImageSize {
  'lg',
  'md',
  'xlg',
}
export interface UserProfileImageIProps {
  kind?: string;
  size?: string;
  image?: string;
  initials?: string;
  className?: string;
  backgroundColor?: string;
}
