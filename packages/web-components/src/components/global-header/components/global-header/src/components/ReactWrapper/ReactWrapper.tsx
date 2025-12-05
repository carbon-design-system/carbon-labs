/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import React from 'react';
import { createComponent } from '@lit/react';

import { HybridIpaasHeader as WCHybridIpaasHeader } from '../HybridIpaasHeader/HybridIpaasHeader';
import { ReactWrapperProps } from '../../types/Header.types'

const AI_CALLBACK_EVENT = 'hybrid-ipaas-header-ai-callback';
const NOTIFICATION_OPEN_CALLBACK_EVENT = 'hybrid-ipaas-header-notification-open-callback';
const LOGOUT_CALLBACK_EVENT = 'hybrid-ipaas-logout-callback';

// Create a React wrapper component for the Web Component header. This handles passing objects into the header and also
// creates callbacks for the custom events issued by the header. For more info see https://lit.dev/docs/frameworks/react/
const WrappedHybridIpaasHeader = createComponent({
  tagName: 'hybrid-ipaas-header',
  elementClass: WCHybridIpaasHeader,
  react: React,
  events: {
    onaiCallback: AI_CALLBACK_EVENT,
    onNotificationOpenCallback: NOTIFICATION_OPEN_CALLBACK_EVENT,
    onLogoutCallback: LOGOUT_CALLBACK_EVENT
  }
});

export const ReactWrapper = (options: ReactWrapperProps) => {
  return (
    <WrappedHybridIpaasHeader
      role='banner'
      onaiCallback={() => {options.aiCallback()}}
      aiCallbackEvent={AI_CALLBACK_EVENT}
      onNotificationOpenCallback={() => {options.notificationOpenCallback()}}
      notificationOpenCallbackEvent={NOTIFICATION_OPEN_CALLBACK_EVENT}
      onLogoutCallback={() => {options.logoutCallback()}}
      logoutCallbackEvent={LOGOUT_CALLBACK_EVENT}
      {...options}
    />
  )
}