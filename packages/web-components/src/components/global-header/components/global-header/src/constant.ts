/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const AUTOMATION_NAMESPACE_PREFIX = 'ibm-automation-cds';
export const AUTOMATION_HEADER_BASE_CLASS = 'automation-global-header';

export const NAMESPACE = 'automation--header';
export const HEADER_NAVIGATION_ACTION = 'automation-header-navigation-action';
export const POPOVER_LABEL_ID = `automation--header__popover__label--profile`;

export const APP_SWITCHER_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-app-switcher-button`;
export const ENV_SWITCHER_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-env-switcher-button`;
export const HELP_MENU_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-help-menu-button`;
export const INTEGRATION_AGENT_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-chatbot-menu-button`;
export const NOTIFICATIONS_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-notifications-button`;
export const PROFILE_MENU_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-profile-menu-button`;
export const SEARCH_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-search-button`;
export const TRIAL_POPOVER_BUTTON_ID = `${AUTOMATION_NAMESPACE_PREFIX}-trial-popover-button`;

export const CUSTOM_EVENT_NAME = 'global-header';
export const CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS = 'refresh-header-options';

export const INITIAL_AUTOMATION_HEADER_PROPS = {
  brand: {
    company: '',
    product: '',
  },
  enableLogs: false,
  managementConsole: {
    href: '',
    text: 'Console',
  },
  noAuthHeaderLinks: [],
  profileFooterLinks: [],
  footerSectionItems: [
    {
      href: '',
      text: 'Service IDs and API keys',
      arialLabel: 'APIKeys',
      carbonIcon: 'IbmCloudKeyProtect',
    },
  ],
  userManagement: {
    href: '',
    text: 'User management',
    icon: 'UserFollow',
  },
  switcherConfigs: [],
  environment: 'staging',
};
export const DEFAULT_NO_AUTH_HEADER_LINKS = [
  {
    text: 'Docs',
    href: '/docs',
    carbonIcon: 'Document',
    arialLabel: 'Docs',
  },
  {
    href: '/login',
    text: 'Log in',
    carbonIcon: 'Login',
    arialLabel: 'Log in',
  },
];

export const SOLIS_CDN_HOSTNAMES = {
  local: 'https://cdn.dev.saas.ibm.com',
  dev: 'https://cdn.dev.saas.ibm.com',
  stage: 'https://cdn.test.saas.ibm.com',
  prod: 'https://cdn.saas.ibm.com',
};
