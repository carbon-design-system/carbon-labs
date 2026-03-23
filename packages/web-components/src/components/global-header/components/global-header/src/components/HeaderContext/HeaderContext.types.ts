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
  TrialConfigs,
  MainSectionItem,
  NoAuthHeaderLinks,
  ProfileFooterLinks,
  AssistMeConfigs,
  ChatBotConfigs,
  AnalyticsConfig,
  SwitcherConfigs,
  NavigationItem,
  HelperLinks,
  NotificationConfigs,
  HeaderProps,
  SearchConfigs,
  GlobalActionConfig,
  UserManagement,
  ManagementConsole,
  SidekickConfig,
  SolisConfig,
} from '../../types/Header.types';

export type BooleanCallback = () => boolean;
export type VoidCallback = (callback?: {
  callback: (error: unknown, data: unknown) => unknown;
}) => boolean;

export interface HeaderContextProps {
  footerSectionItems: ProfileFooterLinks[];
  userManagement: UserManagement;
  managementConsole: ManagementConsole;
  profile?: Profile;
  trialConfigs?: TrialConfigs;
  managementConsoleHref?: string;
  analyticsConfig?: AnalyticsConfig;
  switcherConfigs?: SwitcherConfigs[];
  assistMeConfigs?: AssistMeConfigs;
  chatBotConfigs?: ChatBotConfigs;
  mainSectionItems?: MainSectionItem[];
  noAuthHeaderLinks?: NoAuthHeaderLinks[];
  notificationConfigs?: NotificationConfigs;
  profileFooterLinks?: ProfileFooterLinks[];
  navigationItems?: NavigationItem[];
  navigationAreaLabel?: string;
  helperLinks?: HelperLinks[];
  isHybridIpaas?: HeaderProps['isHybridIpaas'];
  searchConfigs?: SearchConfigs;
  globalActionConfigs?: GlobalActionConfig[];
  sidekickConfig?: SidekickConfig;
  solisConfig?: SolisConfig;
}

export interface HeaderContextState {
  isAuthenticated: boolean;
  helpMenuController: boolean;
  assistMeCloseIcon?: HTMLButtonElement | null;
  assistMeController?: any /* eslint-disable-line @typescript-eslint/no-explicit-any */;
}

declare global {
  interface Window {
    initAssistMeController: (assistMeConfigs: AssistMeConfigs) => unknown;
  }
}
