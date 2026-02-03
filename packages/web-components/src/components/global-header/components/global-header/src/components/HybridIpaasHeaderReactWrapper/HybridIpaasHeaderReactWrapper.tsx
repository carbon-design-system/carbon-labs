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

import { HybridIpaasHeader } from '../HybridIpaasHeader/HybridIpaasHeader';
import { ReactWrapperProps } from '../../types/Header.types';

const AI_CALLBACK_EVENT = 'clabs-hybrid-ipaas-header-ai-callback';
const NOTIFICATION_OPEN_CALLBACK_EVENT =
  'clabs-hybrid-ipaas-header-notification-open-callback';
const LOGOUT_CALLBACK_EVENT = 'clabs-hybrid-ipaas-logout-callback';
const SEARCH_CALLBACK_EVENT = 'clabs-hybrid-ipaas-search-callback';
const SEARCH_SUBMIT_CALLBACK_EVENT =
  'clabs-hybrid-ipaas-search-submit-callback';

// Create a React wrapper component for the Web Component header. This handles passing objects into the header and also
// creates callbacks for the custom events issued by the header. For more info see https://lit.dev/docs/frameworks/react/
const WrappedHybridIpaasHeader = createComponent({
  tagName: 'clabs-global-header-hybrid-ipaas',
  elementClass: HybridIpaasHeader,
  react: React,
  events: {
    onaiCallback: AI_CALLBACK_EVENT,
    onNotificationOpenCallback: NOTIFICATION_OPEN_CALLBACK_EVENT,
    onLogoutCallback: LOGOUT_CALLBACK_EVENT,
    onSearchCallback: SEARCH_CALLBACK_EVENT,
    onSearchSubmitCallback: SEARCH_SUBMIT_CALLBACK_EVENT,
  },
});

export const HybridIpaasHeaderReactWrapper = (props: ReactWrapperProps) => {
  const {
    aiCallback,
    notificationOpenCallback,
    logoutCallback,
    searchCallback,
    searchSubmitCallback,
    ...headerOptions
  } = props;

  return (
    <WrappedHybridIpaasHeader
      role="banner"
      onaiCallback={
        aiCallback &&
        (() => {
          aiCallback();
        })
      }
      aiCallbackEvent={aiCallback && AI_CALLBACK_EVENT}
      onNotificationOpenCallback={
        notificationOpenCallback &&
        (() => {
          notificationOpenCallback();
        })
      }
      notificationOpenCallbackEvent={
        notificationOpenCallback && NOTIFICATION_OPEN_CALLBACK_EVENT
      }
      onLogoutCallback={
        logoutCallback &&
        (() => {
          logoutCallback();
        })
      }
      logoutCallbackEvent={logoutCallback && LOGOUT_CALLBACK_EVENT}
      onSearchCallback={
        searchCallback &&
        ((event) => {
          searchCallback((event as CustomEvent).detail?.value || '');
        })
      }
      searchCallbackEvent={searchCallback && SEARCH_CALLBACK_EVENT}
      onSearchSubmitCallback={
        searchSubmitCallback &&
        ((event) => {
          searchSubmitCallback((event as CustomEvent).detail?.value || '');
        })
      }
      searchSubmitCallbackEvent={
        searchSubmitCallback && SEARCH_SUBMIT_CALLBACK_EVENT
      }
      {...headerOptions}
    />
  );
};
