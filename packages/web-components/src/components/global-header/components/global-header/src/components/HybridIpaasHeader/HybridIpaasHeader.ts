/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import { INITIAL_AUTOMATION_HEADER_PROPS } from '../../constant';
import {
  GlobalActionConfig,
  HeaderProps,
  ProfileFooterLinks,
  SearchConfigs,
} from '../../types/Header.types';
import '../CommonHeader/CommonHeader';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Wrapper component that obtains header options from a backend route
 */
@customElement(`${clabsPrefix}-global-header-hybrid-ipaas`)
export class HybridIpaasHeader extends LitElement {
  @property({ type: String }) productName = null;
  @property({ type: String }) productKey = '';
  @property({ type: Object }) fetchHeaders = {};
  @property({ type: String }) basePath = '';
  @property({ type: String }) displayName = '';
  @property({ type: String }) userEmail = '';
  @property({ type: String }) productVersion = null;
  @property({ type: String }) assistMeKey = '';
  @property({ type: Function }) aiCallback: (() => void) | undefined;
  @property({ type: String }) aiCallbackEvent = '';
  @property({ type: Function }) logoutCallback: (() => void) | undefined;
  @property({ type: Function }) notificationOpenCallback:
    | (() => void)
    | undefined;
  @property({ type: Boolean }) hasNewNotifications = false;
  @property({ type: Object }) searchConfigs: SearchConfigs | null = null;
  @property({ type: Array })
  capabilityProfileFooterLinks: ProfileFooterLinks[] = [];
  @property({ type: Array }) capabilityGlobalActions: GlobalActionConfig[] = [];
  @state()
  headerOptions: HeaderProps = { ...INITIAL_AUTOMATION_HEADER_PROPS };

  firstUpdated(): void {
    if (!this.productKey) {
      console.error(
        'A product key is required for the environment switcher to function.'
      );
    }
    this.initializeHeaderOptions();
  }

  public async initializeHeaderOptions(): Promise<void> {
    try {
      const serverOptions = await this.loadIpaasHeaderOptionsFromServer(
        this.fetchHeaders,
        this.basePath,
        this.productKey
      );

      this.headerOptions = this.buildHeaderOptions(serverOptions);
    } catch (error) {
      console.error('Failed to load header options:', error);
    }
  }

  async loadIpaasHeaderOptionsFromServer(
    headers: { [x: string]: string },
    basePath: string,
    productKey: string
  ) {
    headers = headers || {};
    headers['x-hybrid-ipaas-product-key'] = productKey;
    const fetchRoute = basePath
      ? basePath + '/hybrid-ipaas/v1/header/options'
      : '/hybrid-ipaas/v1/header/options';
    const response = await fetch(fetchRoute, {
      credentials: 'same-origin',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch header options: ${response.statusText}`);
    }
    return response.json();
  }

  private initLogoutLink() {
    const footerLink: ProfileFooterLinks = {
      text: 'Logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
    };

    if (this.logoutCallback) {
      footerLink.onClickHandler = this.logoutCallback;
    } else {
      footerLink.href = `${this.basePath}/logout`;
    }

    return footerLink;
  }

  private buildHeaderOptions(baseOptions: HeaderProps): HeaderProps {
    const overrideProfile = {
      email: this.userEmail,
      displayName: this.displayName,
    };

    const mainSectionItems = [];
    if (this.productName) {
      mainSectionItems.push({ label: 'Product', text: this.productName });
    }
    if (this.productVersion) {
      mainSectionItems.push({ label: 'Version', text: this.productVersion });
    }

    if (
      baseOptions.mainSectionItems &&
      baseOptions.mainSectionItems.length > 0
    ) {
      baseOptions.mainSectionItems.forEach((item) => {
        mainSectionItems.push(item);
      });
    } // This is unlikely to be needed but keeping in case anything is passed back in mainSectionItems

    const overrideCapabilityName = {
      label: this.productName ? this.productName : '',
    };

    const logoutIndex = baseOptions.profileFooterLinks?.findIndex(
      (link) => link.text.toLowerCase() === 'logout'
    );
    if (logoutIndex !== undefined && logoutIndex > -1) {
      baseOptions.profileFooterLinks?.splice(
        logoutIndex,
        1,
        this.initLogoutLink()
      );
    } else {
      baseOptions.profileFooterLinks?.push(this.initLogoutLink());
    } // override the 'logout' object if it comes from the service to avoid duplicate

    // The assumption is that input props take priority over values provided by the service
    const updatedOptions: HeaderProps = {
      ...baseOptions,
      capabilityName:
        this.productName === null
          ? baseOptions.capabilityName
          : overrideCapabilityName,
      profile:
        this.userEmail === '' || this.displayName === ''
          ? baseOptions.profile
          : overrideProfile,
      mainSectionItems: mainSectionItems,
    };

    // Add assistMeConfigs if assistMeKey exists
    if (this.assistMeKey) {
      updatedOptions.assistMeConfigs = {
        productId: this.assistMeKey,
      };
    }

    if (this.notificationOpenCallback) {
      updatedOptions.notificationConfigs = {
        onClick: this.notificationOpenCallback,
      };
    }

    if (this.searchConfigs) {
      updatedOptions.searchConfigs = {
        placeholder: this.searchConfigs?.placeholder ?? 'Search',
        callback: this.searchConfigs?.callback,
        submitCallback: this.searchConfigs?.submitCallback,
      };
    }

    if (this.aiCallback) {
      updatedOptions.chatBotConfigs = {
        onClick: this.aiCallback,
      };
    }
    if (this.aiCallbackEvent) {
      updatedOptions.chatBotConfigs = {
        onClick: () => {
          const event = new CustomEvent(this.aiCallbackEvent, {
            bubbles: true,
            cancelable: true,
          });
          this.dispatchEvent(event);
        },
      };
    }

    if (
      this.capabilityProfileFooterLinks &&
      this.capabilityProfileFooterLinks.length > 0
    ) {
      updatedOptions.profileFooterLinks = [
        ...this.capabilityProfileFooterLinks,
        ...(updatedOptions.profileFooterLinks ?? []),
      ];
    }

    if (
      this.capabilityGlobalActions &&
      this.capabilityGlobalActions.length > 0
    ) {
      updatedOptions.globalActionConfigs = [...this.capabilityGlobalActions];
    }

    return updatedOptions;
  }

  render() {
    return html`<div id="ipaas-header-container">
      <apaas-common-header
        ?hasNewNotifications="${this.hasNewNotifications}"
        .headerProps="${this.headerOptions}"></apaas-common-header>
    </div>`;
  }
}
