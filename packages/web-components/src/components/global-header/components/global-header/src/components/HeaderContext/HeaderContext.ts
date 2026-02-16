/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, css, html, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { settings } from '@carbon-labs/utilities';
import {
  AUTOMATION_HEADER_BASE_CLASS,
  AUTOMATION_NAMESPACE_PREFIX,
  ENV_SWITCHER_BUTTON_ID,
  HELP_MENU_BUTTON_ID,
  INTEGRATION_AGENT_BUTTON_ID,
  NOTIFICATIONS_BUTTON_ID,
  PROFILE_MENU_BUTTON_ID,
  SEARCH_BUTTON_ID,
  TRIAL_POPOVER_BUTTON_ID,
} from '../../constant';

/* c8 ignore next */
import cx from 'classnames';

import '../TrialPopover/TrialPopover';
import '../AuthContext/AuthContext';
import '../UnauthenticatedContext/UnauthenticatedContext';
import '../Search/Search';

import '../Switcher/Switcher';
import '../ProfilePopover/ProfilePopover';
import '../UserProfileImage/UserProfileImage';

import { HeaderContextProps, HeaderContextState } from './HeaderContext.types';
import {
  isValidObject,
  renderCarbonIcon,
  trackEvent,
} from '../../globals/utils';

import styles from './_index.scss?inline' assert { type: 'css' };

const { stablePrefix: clabsPrefix } = settings;

/**
 * Header entries depending on context
 */
@customElement(`${clabsPrefix}-global-header-context`)
export class HeaderContext extends LitElement {
  static styles = css`
    ${unsafeCSS([styles])}
  `;

  @state()
  isTrialOpen = false;

  @state()
  isProfileOpen = false;

  @state()
  private state: HeaderContextState = {
    isAuthenticated: false,
    helpMenuController: false,
    assistMeController: undefined,
  };

  @property({ type: Object }) props: HeaderContextProps = {
    footerSectionItems: [],
    managementConsole: {
      href: '',
      text: '',
    },
    userManagement: {
      href: '',
      text: '',
      icon: '',
    },
  };

  @property({ type: Boolean }) assistMeScriptLoaded = false;
  @property({ type: Boolean }) hasNewNotifications = false;

  // emit an event (does nothing if analytics has not been configured)
  private _clickEventAnalytics = (label: string) => {
    trackEvent('UI Interaction', {
      action: 'clicked',
      CTA: label,
      elementId: `common header - ${label}`,
    });
  };

  _toggleTrialPopup() {
    this.isTrialOpen = !this.isTrialOpen;
    this._clickEventAnalytics('Trial days left');
  }

  _toggleProfilePopup() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  _toggleAIChat(callback) {
    callback();
    this._clickEventAnalytics('Launch Chat');
  }

  handleAssistmeToggleClick(e: { preventDefault: () => void }) {
    e.preventDefault();
    let assistMeController;

    if (this.state?.assistMeController) {
      assistMeController = this.state?.assistMeController;
    } else if (
      this.props?.assistMeConfigs?.productId &&
      !this.state?.assistMeController &&
      typeof window?.initAssistMeController === 'function'
    ) {
      assistMeController = window.initAssistMeController(
        this.props?.assistMeConfigs
      );
      this.state = { ...this.state, assistMeController };
    }

    const callback = (error: unknown, data: unknown) => {
      if (error) {
        console.log(`assist me error: ${error}`);
      } else {
        console.log(`assist me data: ${JSON.stringify(data)}`);
      }
    };

    if (assistMeController?.isOpen()) {
      assistMeController?.close({ callback });
    } else {
      assistMeController?.open({ callback });
    }

    this._clickEventAnalytics('Assistance');
  }

  renderTrial() {
    const trialConfig = this.props?.trialConfigs;
    const trialBannerType = cx({
      [`${AUTOMATION_HEADER_BASE_CLASS}__trial-menu__counting-box-alert`]:
        trialConfig?.warning,
    });

    if (isValidObject(trialConfig)) {
      return html`
        <div class="${AUTOMATION_HEADER_BASE_CLASS}--popover-content-container">
          <clabs-global-header-trial-popover
            id="${TRIAL_POPOVER_BUTTON_ID}"
            .open="${this.isTrialOpen}"
            .trialConfig="${trialConfig}"
            @trial-toggle="${this._toggleTrialPopup}">
            <cds-custom-header-global-action
              role="button"
              class="${AUTOMATION_HEADER_BASE_CLASS}__trial-menu"
              aria-label="Trial menu"
              @click=${this._toggleTrialPopup}>
              <span
                class="${AUTOMATION_HEADER_BASE_CLASS}__trial-menu__counting-box ${trialBannerType}"
                >${trialConfig.trialCount}</span
              >
              <p class="trial-label">${trialConfig.trialLabel}</p>
            </cds-custom-header-global-action>
          </clabs-global-header-trial-popover>
        </div>
      `;
    } else {
      return nothing;
    }
  }

  renderHelpMenu() {
    const { helpMenuController } = this.state;
    const { helperLinks } = this.props;

    if (
      helpMenuController &&
      Array.isArray(helperLinks) &&
      helperLinks?.length > 0
    ) {
      return html`<cds-custom-header-menu
        menu-label="Help"
        id="${HELP_MENU_BUTTON_ID}"
        class="${AUTOMATION_NAMESPACE_PREFIX}__help-menu"
        trigger-content="Help"
        tabindex="${this.isTrialOpen ? -1 : 0}">
        ${helperLinks?.map((item) => {
          return html`
            <cds-custom-header-menu-item
              @click="${item.onclick}"
              target="${item.target}"
              href="${item.link}">
              <span>${item.label}</span>
              <span>${renderCarbonIcon('Launch', 16)}</span>
            </cds-custom-header-menu-item>
          `;
        })}
      </cds-custom-header-menu> `;
    }
  }

  renderAssistMe() {
    return html`
      <cds-custom-header-global-action
        id="${HELP_MENU_BUTTON_ID}"
        role="button"
        aria-label="open assistance side panel"
        tooltipAlignment="center"
        tabindex="${this.isTrialOpen ? -1 : 0}"
        class="${AUTOMATION_NAMESPACE_PREFIX}__help-menu"
        @click="${(e: Event) => this.handleAssistmeToggleClick(e)}">
        ${renderCarbonIcon('Help', 20, 'icon')}
      </cds-custom-header-global-action>
    `;
  }

  renderNotifications() {
    const { notificationConfigs } = this.props;

    if (notificationConfigs) {
      return html`
        <cds-custom-header-global-action
          id="${NOTIFICATIONS_BUTTON_ID}"
          role="button"
          aria-label="Notifications"
          class="${AUTOMATION_HEADER_BASE_CLASS}__notification"
          tooltipAlignment="center"
          @click="${notificationConfigs.onClick}"
          tabindex="${this.isTrialOpen ? -1 : 0}">
          ${renderCarbonIcon(
            this.hasNewNotifications ? 'NotificationNew' : 'Notification',
            20,
            'icon'
          )}
        </cds-custom-header-global-action>
      `;
    }
  }

  renderChatBot() {
    const { chatBotConfigs } = this.props;
    if (chatBotConfigs && chatBotConfigs.onClick) {
      return html`
        <cds-custom-header-global-action
          id="${INTEGRATION_AGENT_BUTTON_ID}"
          role="button"
          aria-label="Launch Chat"
          tooltipAlignment="center"
          class="${AUTOMATION_NAMESPACE_PREFIX}__globalaction"
          tabindex="${this.isTrialOpen ? -1 : 0}"
          @click="${() => this._toggleAIChat(chatBotConfigs.onClick)}">
          ${renderCarbonIcon('AiLaunch', 20, 'icon')}
        </cds-custom-header-global-action>
      `;
    }
  }

  renderSidekick() {
    const { sidekickConfig } = this.props;
    if (sidekickConfig?.isEnabled) {
      return html` <solis-sidekick />`;
    }
  }

  renderSolis() {
    const { solisConfig } = this.props;
    if (solisConfig?.isEnabled) {
      return html` <solis-switcher /> `;
    }
  }

  renderProfile() {
    return html`
      <div class="${AUTOMATION_HEADER_BASE_CLASS}--popover-content-container">
        <clabs-global-header-profile-popover
          ?profileOpen="${this.isProfileOpen}"
          .props="${this.props}"
          @profile-toggle="${this._toggleProfilePopup}">
          <cds-custom-header-global-action
            id="${PROFILE_MENU_BUTTON_ID}"
            role="button"
            @click=${this._toggleProfilePopup}
            class="mcsp-header-user-profile"
            aria-label="Profile"
            tooltip-text=""
            tabindex="${this.isTrialOpen ? -1 : 0}">
            <clabs-global-header-user-profile-image
              .size="lg"
              .image="${this.props.profile?.imageUrl}"
              .backgroundColor="light-cyan"
              .initials="${this.props.profile
                ?.displayName}"></clabs-global-header-user-profile-image>
          </cds-custom-header-global-action>
        </clabs-global-header-profile-popover>
      </div>
    `;
  }

  renderSearch() {
    const { searchConfigs } = this.props;
    if (searchConfigs) {
      return html`<clabs-global-header-search
        id="${SEARCH_BUTTON_ID}"
        .props="${searchConfigs}"></clabs-global-header-search>`;
    }
  }

  renderGlobalActions() {
    const { globalActionConfigs } = this.props;
    if (globalActionConfigs && globalActionConfigs.length > 0) {
      return globalActionConfigs.map((action) => {
        return html`
          <cds-custom-header-global-action
            role="button"
            aria-label="${action.label}"
            tooltip-text="${ifDefined(action.tooltip)}"
            tooltip-position="bottom"
            class="${AUTOMATION_NAMESPACE_PREFIX}__globalaction"
            @click="${action.onClick}">
            ${renderCarbonIcon(action.carbonIcon, 20, 'icon')}
          </cds-custom-header-global-action>
        `;
      });
    }
  }

  render() {
    this.state = {
      assistMeController: undefined,
      isAuthenticated:
        this.props?.profile !== null &&
        typeof this.props?.profile !== 'undefined',
      helpMenuController: this.props?.helperLinks !== null,
    };

    const { isAuthenticated } = this.state;
    const { noAuthHeaderLinks, assistMeConfigs } = this.props;
    const switcherProps = this.props?.switcherConfigs?.[0] || {};
    if (isAuthenticated) {
      return html`
        ${this.renderTrial()}
        ${switcherProps && switcherProps.items?.length
          ? html` <clabs-global-header-switcher-component
              id="${ENV_SWITCHER_BUTTON_ID}"
              .items=${switcherProps.items}
              .iconsLeft=${switcherProps.iconsLeft}
              .disabled=${switcherProps.disabled}
              .initialSelectedIndex=${switcherProps.initialSelectedIndex}
              ?isTrialOpen="${this.isTrialOpen}"
              .onClick=${switcherProps.onClick}></clabs-global-header-switcher-component>`
          : nothing}
        ${this.renderGlobalActions()}
        ${this.props.isHybridIpaas
          ? html`<div class="${AUTOMATION_HEADER_BASE_CLASS}__divider"></div>`
          : nothing}
        ${this.renderSearch()} ${this.renderNotifications()}
        ${this.renderChatBot()}
        ${!assistMeConfigs ? this.renderHelpMenu() : nothing}
        ${assistMeConfigs?.productId ? this.renderAssistMe() : nothing}
        ${this.renderSidekick()} ${this.renderProfile()} ${this.renderSolis()}
      `;
    } else {
      return html`<clabs-global-header-unauthenticated-context
        .noAuthHeaderLinks="${noAuthHeaderLinks}"></clabs-global-header-unauthenticated-context>`;
    }
  }
}
