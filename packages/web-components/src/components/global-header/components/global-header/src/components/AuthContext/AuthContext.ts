/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import {
  NAMESPACE,
  POPOVER_LABEL_ID,
  AUTOMATION_HEADER_BASE_CLASS,
} from '../../constant';
import {
  MainSectionItem,
  ManagementConsole,
  ProfileFooterLinks,
  UserManagement,
} from '../../types/Header.types';
import { AuthContextProps } from './AuthContext.types';
import '../UserProfileImage/UserProfileImage';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';

import styles from './_index.scss?inline';

import { renderCarbonIcon } from '../../globals/utils';

const { stablePrefix: clabsPrefix } = settings;

const iconSlot = 'title-icon';
const iconSize = 16;

/**
 * Show the authentication context (profile menu)
 */
@customElement(`${clabsPrefix}-global-header-auth-context`)
export class AuthContext extends LitElement {
  static styles = css`
    ${unsafeCSS([styles])}
  `;

  @property({ type: Object }) props: AuthContextProps = {};

  renderMainSection = (mainSectionItems: MainSectionItem[] | undefined) => {
    if (
      typeof mainSectionItems !== 'undefined' &&
      mainSectionItems?.length > 0
    ) {
      return html`
        <section
          tabIndex="${0}"
          role="tabpanel"
          aria-labelledby="${POPOVER_LABEL_ID}"
          class="${AUTOMATION_HEADER_BASE_CLASS}__popover__section">
          ${this.props.mainSectionItems?.map((item: MainSectionItem) => {
            return html`
              <div class="${AUTOMATION_HEADER_BASE_CLASS}__title-bar__label">
                ${item.label}
              </div>
              <div class="${AUTOMATION_HEADER_BASE_CLASS}__title-bar__text">
                ${item.text}
              </div>
            `;
          })}
        </section>
      `;
    } else {
      return nothing;
    }
  };

  renderFooterSection = (
    footerSectionItems: ProfileFooterLinks[] | undefined
  ) => {
    if (
      typeof footerSectionItems !== 'undefined' &&
      footerSectionItems?.length > 0
    ) {
      return footerSectionItems?.map((item) => {
        return html` <div
          class="${AUTOMATION_HEADER_BASE_CLASS}__popover__section ${AUTOMATION_HEADER_BASE_CLASS}__usr_management_lnk_section">
          <ul class="${AUTOMATION_HEADER_BASE_CLASS}__popover__links">
            <li class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link-item">
              <a
                href="${item.href}"
                target="${item?.newTab ? '_blank' : ''}"
                rel="noreferrer">
                <span class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link">
                  <span class="link_icon"
                    >${item.carbonIcon
                      ? renderCarbonIcon(item.carbonIcon, iconSize, iconSlot)
                      : nothing}</span
                  >
                  <span class="link_text">${item.text}</span>
                </span>
              </a>
            </li>
          </ul>
        </div>`;
      });
    } else {
      return nothing;
    }
  };

  renderUserManagementSection = (
    userManagement: UserManagement | undefined
  ) => {
    if (userManagement && userManagement?.href && userManagement?.text) {
      return html`
        <div
          class="${AUTOMATION_HEADER_BASE_CLASS}__popover__section ${AUTOMATION_HEADER_BASE_CLASS}__usr_management_lnk_section">
          <ul class="${AUTOMATION_HEADER_BASE_CLASS}__popover__links">
            <li class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link-item">
              <a href=${userManagement.href} target="_blank" rel="noreferrer">
                <span class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link">
                  <span class="link_icon"
                    >${renderCarbonIcon(
                      userManagement.icon,
                      iconSize,
                      iconSlot
                    )}</span
                  >
                  <span class="link_text">${userManagement.text}</span>
                  <span class="launch_icon"
                    >${renderCarbonIcon('Launch', iconSize, iconSlot)}</span
                  >
                </span>
              </a>
            </li>
          </ul>
        </div>
      `;
    } else {
      return nothing;
    }
  };

  renderManagementConsole = (
    managementConsole: ManagementConsole | undefined
  ) => {
    if (
      managementConsole &&
      managementConsole?.href &&
      managementConsole?.text
    ) {
      return html`
        <div
          class="${AUTOMATION_HEADER_BASE_CLASS}__popover__section ${AUTOMATION_HEADER_BASE_CLASS}__console_lnk_section">
          <ul class="${AUTOMATION_HEADER_BASE_CLASS}__popover__links">
            <li class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link-item">
              <a
                href="${managementConsole.href}"
                target="${managementConsole?.newTab ? '_blank' : undefined}"
                rel="noreferrer">
                <span class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link">
                  <span class="link_icon"
                    >${renderCarbonIcon('Settings', iconSize, iconSlot)}</span
                  >
                  <span class="link_text">${managementConsole.text}</span>
                  ${managementConsole.newTabIcon
                    ? html`<span class="launch_icon"
                        >${renderCarbonIcon('Launch', iconSize, iconSlot)}</span
                      >`
                    : nothing}
                </span>
              </a>
            </li>
          </ul>
        </div>
      `;
    } else {
      return nothing;
    }
  };

  renderLinkItem = (item: ProfileFooterLinks) => {
    return html`<span class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link">
      <span class="link_icon"
        >${item.carbonIcon
          ? renderCarbonIcon(item.carbonIcon, iconSize, iconSlot)
          : nothing}</span
      >
      <span class="link_text">${item.text}</span>
      ${item.newTabIcon
        ? html`<span class="launch_icon"
            >${renderCarbonIcon('Launch', iconSize, iconSlot)}</span
          >`
        : nothing}
    </span>`;
  };

  renderProfileFooterLinks = (
    profileFooterLinks: ProfileFooterLinks[] | undefined
  ) => {
    if (profileFooterLinks) {
      return profileFooterLinks.map((item) => {
        return html`
          <section
            class="${AUTOMATION_HEADER_BASE_CLASS}__profile_footer ${NAMESPACE}__popover__footer">
            <ul class="${AUTOMATION_HEADER_BASE_CLASS}__popover__links">
              <li class="${AUTOMATION_HEADER_BASE_CLASS}__popover__link-item">
                ${item.onClickHandler
                  ? html`<cds-button
                      @click="${item.onClickHandler}"
                      size="xs"
                      kind="ghost"
                      aria-label="${item.arialLabel}"
                      >${this.renderLinkItem(item)}</cds-button
                    >`
                  : html`<a
                      href="${item.href}"
                      target="${item?.newTab ? '_blank' : nothing}"
                      rel="noreferrer"
                      aria-label="${item.arialLabel}">
                      ${this.renderLinkItem(item)}
                    </a>`}
              </li>
            </ul>
          </section>
        `;
      });
    } else {
      return nothing;
    }
  };

  render() {
    const {
      profile,
      mainSectionItems,
      footerSectionItems,
      userManagement,
      managementConsole,
      profileFooterLinks,
    } = this.props;
    return html`
      <div
        tabindex=${0}
        role="tabpanel"
        aria-labelledby="${POPOVER_LABEL_ID}"
        class="${NAMESPACE}__popover--focus">
        <div
          class="${NAMESPACE}__popover__header ${AUTOMATION_HEADER_BASE_CLASS}__popover__section">
          <clabs-global-header-user-profile-image
            size="xlg"
            .image="${profile?.imageUrl}"
            .initials="${profile?.displayName}">
            .className="${NAMESPACE}__popover__profile-icon"
          </clabs-global-header-user-profile-image>
          <div class="${AUTOMATION_HEADER_BASE_CLASS}__name_section">
            <span
              id="${POPOVER_LABEL_ID}"
              class="${NAMESPACE}__popover__profile__header__title"
              >${profile?.displayName}</span
            >
            <span class="${NAMESPACE}__popover__profile__header__email"
              >${profile?.email}</span
            >
          </div>
        </div>
        ${this.renderMainSection(mainSectionItems)}
        ${this.renderFooterSection(footerSectionItems)}
        ${this.renderUserManagementSection(userManagement)}
        ${this.renderManagementConsole(managementConsole)}
        ${this.renderProfileFooterLinks(profileFooterLinks)}
      </div>
    `;
  }
}
