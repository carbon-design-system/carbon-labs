/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { css, LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import {
  CUSTOM_EVENT_NAME,
  CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS,
  INITIAL_AUTOMATION_HEADER_PROPS,
} from '../../constant';
import {
  GlobalActionConfig,
  HeaderProps,
  MainSectionItem,
  ProfileFooterLinks,
  SearchConfigs,
  solisDeploymentEnvironment,
} from '../../types/Header.types';
import '../CommonHeader/CommonHeader';

import styles from '../../index.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Wrapper component that obtains header options from a backend route
 */
@customElement(`${clabsPrefix}-global-header-hybrid-ipaas`)
export class HybridIpaasHeader extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String }) productName = null;
  @property({ type: String }) productKey = '';
  @property({ type: Object }) fetchHeaders = {};
  @property({ type: Boolean }) sidekickEnabled = false;
  @property({ type: Boolean }) solisEnabled = false;
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

  constructor() {
    super();
    this._customEventListener = this._customEventListener.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(CUSTOM_EVENT_NAME, this._customEventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(CUSTOM_EVENT_NAME, this._customEventListener);
  }

  // reload the header options whenever the custom event is received
  private _customEventListener(evt: Event): void {
    if (
      evt instanceof CustomEvent &&
      (evt as CustomEvent).detail === CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS
    ) {
      this.initializeHeaderOptions();
    }
  }

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
      text: 'Log out',
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

  private initSidekickOptions() {
    return {
      isEnabled: this.sidekickEnabled,
      scriptUrl:
        'https://cdn.dev.saas.ibm.com/solis_ui/v1/sidekick/solis-sidekick.es.js',
      insights_enabled: true,
      reports_enabled: true,
      chat_enabled: false,
      tell_me_more_enabled: false,
    };
  }
  private initSolisOptions(forSidekick = false) {
    if (forSidekick) {
      return {
        isEnabled: false,
        is_prod: false,
        cdn_hostname: 'https://cdn.dev.saas.ibm.com/solis_ui/v1',
        deployment_environment: solisDeploymentEnvironment['local'],
      };
    } else {
      return {
        isEnabled: true,
        scriptUrl:
          'https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js',
        is_prod: false,
        cdn_hostname: 'https://cdn.dev.saas.ibm.com/solis_ui/v1',
        deployment_environment: solisDeploymentEnvironment['local'],
      };
    }
  }

  private buildHeaderOptions(baseOptions: HeaderProps): HeaderProps {
    const overrideProfile = {
      email: this.userEmail,
      displayName: this.displayName,
    };

    const mainSectionItems: Array<MainSectionItem> = [];
    if (this.productName) {
      mainSectionItems.push({ label: 'Product', text: this.productName });
    } else {
      mainSectionItems.push({
        label: 'Product',
        text: baseOptions?.brand?.product,
      });
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
      (link) => link.text.toLowerCase() === 'log out'
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

    if (this.sidekickEnabled) {
      updatedOptions.solisConfig = this.initSolisOptions(true);
      updatedOptions.sidekickConfig = this.initSidekickOptions();
    }
    if (this.solisEnabled) {
      updatedOptions.solisConfig = this.initSolisOptions();
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
      <clabs-global-header-apaas
        ?hasNewNotifications="${this.hasNewNotifications}"
        .headerProps="${this.headerOptions}"></clabs-global-header-apaas>
    </div>`;
  }
}
