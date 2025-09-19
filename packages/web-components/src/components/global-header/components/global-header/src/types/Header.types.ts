/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum TrialLinkType {
  'invite',
  'contact',
  'requestQuote',
}

export enum TrialBannerType {
  'info',
  'warning',
}

export interface Brand {
  company?: string;
  product?: string;
  href?: string;
}

export type Profile = {
  email: string;
  imageUrl?: string;
  displayName: string;
};

export type HelperLinks = {
  link?: string;
  label: string;
  target?: string;
  onclick?: (e: Event) => void;
};

export interface MainSectionItem {
  label: string;
  text: string;
}

export interface AssistMeConfigs {
  productId?: string;
  scriptUrl?: string;
  topSpacing?: string;
  productRelease?: string;
  zIndex?: string | number;
}

export interface ChatBotConfigs {
  onClick: () => void;
}

export interface SearchConfigs {
  placeholder?: string;
  callback: (value: string) => void;
  submitCallback?: (value: string) => void;
}

export interface Link {
  url: string;
  text: string;
}

export interface Data {
  id?: string | number;
  type?: 'error' | 'warning' | 'success' | 'informational';
  timestamp?: Date;
  title?: string;
  description?: string;
  link?: Link;
  unread?: boolean;
  onNotificationClick?: () => void;
}

export interface NotificationConfigs {
  onClick: () => void;
}

export interface TrialLink {
  label: string;
  href: string;
  type: TrialLinkType;
}
export interface TrialConfigs {
  warning?: boolean;
  trialLabel?: string;
  trialCount?: number;
  links?: TrialLink[];
  actionText?: string;
  actionLink?: string;
  description?: string;
}

export interface ItemLink {
  label: string;
  href: string;
  id: string;
  text: string;
  isActive?: boolean;
  carbonIcon: string;
  isLinkItem?: boolean;
  isLastInList?: boolean;
  isHeading?: boolean;
}

export interface SwitcherConfigs {
  label?: string;
  disabled?: boolean;
  items?: readonly ItemLink[];
  floatLeft?: boolean;
  onClick?: (event: MouseEvent, value: ItemLink, idx: number) => void;
  initialSelectedIndex?: number;
  iconsLeft?: boolean;
}

export type NoAuthHeaderLinks = {
  text: string;
  href: string;
  arialLabel: string;
  carbonIcon?: string;
};

export type ProfileFooterLinks = {
  text: string;
  href?: string;
  arialLabel: string;
  carbonIcon?: string;
  newTab?: boolean;
  newTabIcon?: boolean;
  onClickHandler?: () => void;
};

export type GlobalActionConfig = {
  label: string;
  carbonIcon: string;
  onClick?: () => void;
};

export interface ManagementConsole {
  href: string;
  text: string;
  newTab?: boolean;
  newTabIcon?: boolean;
}

export interface UserManagement {
  href: string;
  text: string;
  icon: string;
}

export interface SideNavMenuItems {
  isActive: boolean;
  href: string;
  label: string;
  iconName?: string;
  productIcon?: string;
  onClick?: (e: Event) => void;
  appOrder?: number;
  newTab?: boolean;
  newTabIcon?: boolean;
}

export interface SideNavLink {
  href: string;
  label: string;
  isActive?: boolean;
  iconName?: string;
  productIcon?: string;
  isSideNavMenuItems?: boolean;
  sideNavMenuItems: SideNavMenuItems[];
  menuOpen?: boolean;
  onClick?: (e: Event) => void;
  handleNavItemClick?: (e: Event) => void;
  isOnClickAvailable?: boolean;
  appOrder?: number;
}

export interface SideNav {
  buttonLabel: string;
  sidebarLabel: string;
  isCollapsible?: boolean;
  isRail: boolean;
  onClick?: (e: Event) => void;
  links: SideNavLink[];
  groups?: GroupLinks[];
  isChildOfHeader: boolean;
  autoCollapseOnLeave?: boolean;
  buttonCloseLabel?: string;
}

export interface GroupLinks {
  links: SideNavLink[];
}

export interface SideNavPropsV2 {
  theme?: 'white' | 'g10' | 'g90' | 'g100';
  buttonLabel: string;
  sidebarLabel: string;
  isCollapsible?: boolean;
  isRail: boolean;
  onClick?: (e: Event) => void;
  links: SideNavLink[];
  isChildOfHeader: boolean;
  autoCollapseOnLeave?: boolean;
  buttonCloseLabel?: string;
  isExpandable: boolean;

  sideNav: {
    isRail: boolean;
    isPersistent: boolean;
    isChildOfHeader: boolean;
  };
}

export type CommonAnalyticsProperties = {
  accountId?: string;
  instanceId?: string;
  subscriptionId?: string;
  productId?: string;
  tenantId?: string;
  accountPlan?: string;
  productPlan?: string;
  productTitle?: string;
  accountIdType?: string;
  accountLevel?: string;
  platformTitle?: string;
  hyperscalerFormat?: string;
  enterpriseAccount?: string;
  sabaSubscriptionId?: string;
  hyperscalerChannel?: string;
  hyperscalerProvider?: string;
  productPlanName?: string;
  productPlanType?: string;
  productCode?: string;
  productCodeType?: string;
  operationalId?: string;
  UT30?: string;
};

export type AnalyticsConfig = {
  fullStory?: boolean;
  segment_key?: string;
  optimizely?: boolean;
  coremetrics?: boolean;
  autoPageView?: boolean;
  autoFormEvents?: boolean;
  autoPageEventSpa?: boolean;
  analyticsScriptURL?: string;
  googleAddServices?: boolean;
  commonProperties?: CommonAnalyticsProperties;
};

export interface HeaderProps {
  brand?: Brand;
  capabilityName?: { label: string };
  profile?: Profile;
  sideNav?: SideNav;
  arialLabel?: string;
  sideNavPropsV2?: SideNavPropsV2;
  enableLogs?: boolean;
  trialConfigs?: TrialConfigs;
  environment?: string;
  userManagement?: UserManagement;
  managementConsole?: ManagementConsole;
  analyticsConfig?: AnalyticsConfig;
  assistMeConfigs?: AssistMeConfigs;
  mainSectionItems?: MainSectionItem[];
  noAuthHeaderLinks?: NoAuthHeaderLinks[];
  profileFooterLinks?: ProfileFooterLinks[];
  footerSectionItems?: ProfileFooterLinks[];
  helperLinks?: HelperLinks[];
  switcherConfigs?: SwitcherConfigs[];
  isHybridIpaas?: boolean;
  notificationConfigs?: NotificationConfigs;
  chatBotConfigs?: ChatBotConfigs;
  searchConfigs?: SearchConfigs;
  globalActionConfigs?: GlobalActionConfig[];
}

export interface NavigationItem {
  href: string;
  text: string;
  isActive?: boolean;
}

export interface EventProps {
  action: string;
  CTA: string;
  elementId: string;
  platformTitle?: string;
}
