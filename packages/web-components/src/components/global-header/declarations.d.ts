/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare module '@carbon-labs/wc-global-header';

interface HybridIpaasHeader {
  productName?: string;
  productKey?: string;
  fetchHeaders?: object;
  solisSidekickEnabled?: boolean;
  solisSwitcherEnabled?: boolean;
  solisEnvironment?: string;
  basePath?: string;
  displayName?: string;
  userEmail?: string;
  productVersion?: string;
  assistMeKey?: string;
  aiCallback?: () => void;
  aiCallbackEvent?: string;
  logoutCallback?: () => void;
  notificationOpenCallback?: () => void;
  hasNewNotifications?: boolean;
  searchConfigs?: object;
  capabilityProfileFooterLinks?: Array<object>;
  capabilityGlobalActions?: Array<object>;
}
