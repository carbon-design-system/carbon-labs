/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { html } from 'lit';
// import * as CarbonIcons from '@carbon/icons/es';
import {
  AiLaunch20,
  AppConnectivity20,
  ArrowRight16,
  Checkmark16,
  CloudServices20,
  Document16,
  Email16,
  Help20,
  Home16,
  IbmCloudKeyProtect16,
  Launch16,
  Login16,
  Logout16,
  Notification20,
  NotificationNew20,
  RequestQuote16,
  Settings16,
  Share16,
  User16,
  User20,
  User24,
  User32,
  UserFollow16,
  UserProfile16,
} from '@carbon/icons/es';
import { toSVG, getAttributes } from '@carbon/icon-helpers';
import { EventProps } from '../types/Header.types';

export const ASSIST_ME_SCRIPT_DEV =
  'https://ibmassistme-dev.zll1vg8lrcq.us-south.codeengine.appdomain.cloud/resources/assist-me/controller.js';
export const ASSIST_ME_SCRIPT_PROD =
  'https://www.ibm.com/resources/assist-me/controller.js';

/**
 *
 * @param {string} iconType string value for the carbon icon
 * @param {number} size number to indicate the size of the icon
 * @param {string} slot string name of the slot that the icon will be displayed in
 * @returns an svg of the icon if it is found in CarbonIcons
 */
export const renderCarbonIcon = (
  iconType: string,
  size: number,
  slot?: string
) => {
  const iconWithSize = `${iconType}${size}`;
  // console.log('iconWithSize', iconWithSize)

  const CarbonIcons = {
    AiLaunch20,
    AppConnectivity20,
    ArrowRight16,
    Checkmark16,
    CloudServices20,
    Document16,
    Email16,
    Help20,
    Home16,
    IbmCloudKeyProtect16,
    Launch16,
    Login16,
    Logout16,
    Notification20,
    NotificationNew20,
    RequestQuote16,
    Settings16,
    Share16,
    User16,
    User20,
    User24,
    User32,
    UserFollow16,
    UserProfile16,
  };

  const iconsRecord = CarbonIcons as Record<
    string,
    any /* eslint-disable-line @typescript-eslint/no-explicit-any */
  >;
  const LocalIcon = iconsRecord[iconWithSize];

  // Check if the icon exists
  if (!LocalIcon) {
    console.error(`Icon "${iconWithSize}" not found in CarbonIcons.`);
    return html`<div class="icon-container">Icon not found</div>`;
  }

  // Generate the SVG element with updated attributes
  const svgElement: Element = toSVG({
    ...LocalIcon,
    attrs: { ...getAttributes(LocalIcon.attrs), slot },
  });

  // Serialize the SVG element to a string
  // const svgString: string = new XMLSerializer().serializeToString(svgElement);
  return svgElement;
};

export const isValidObject = (obj: unknown): obj is Record<string, unknown> => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.keys(obj).length > 0
  );
};

export function getAssistMeUrl(environment: string) {
  switch (environment) {
    case 'production':
      return ASSIST_ME_SCRIPT_PROD;
    default:
      return ASSIST_ME_SCRIPT_DEV;
  }
}

export const trackEvent = (eventName: string, props: EventProps) => {
  // console.log('trackEvent', eventName, props) // For testing purposes
  const analytics =
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (window as any)?.bluemixAnalytics;
  if (analytics) {
    analytics.trackEvent(eventName, props);
  }
};
