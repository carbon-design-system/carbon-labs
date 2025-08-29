/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Profile,
  MainSectionItem,
  HeaderProps,
  ProfileFooterLinks,
  ManagementConsole,
  UserManagement,
} from '../../types/Header.types';

export interface AuthContextProps extends HeaderProps {
  profile?: Profile;
  mainSectionItems?: MainSectionItem[];
  footerSectionItems?: ProfileFooterLinks[];
  managementConsole?: ManagementConsole;
  userManagement?: UserManagement;
  profileFooterLinks?: ProfileFooterLinks[];
}
