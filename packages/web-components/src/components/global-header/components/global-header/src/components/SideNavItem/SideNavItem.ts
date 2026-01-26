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
import { SideNavLink, SideNavMenuItems } from '../../types/Header.types';

/* c8 ignore next */
import cx from 'classnames';
import { AUTOMATION_NAMESPACE_PREFIX } from '../../constant';
import { customElement, property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import { renderCarbonIcon, trackEvent } from '../../globals/utils';
import styles from './SideNavItem.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Entries for the left-hand Apps menu
 */
@customElement(`${clabsPrefix}-global-header-side-nav-item`)
export class SideNavItem extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  // emit an event (does nothing if analytics has not been configured)
  private clickEventAnalytics = (label: string) => {
    trackEvent('UI Interaction', {
      action: 'clicked',
      CTA: label,
      elementId: 'common header - app switcher',
    });
  };

  private handleSideNavMenuItemClick = (e: Event, link: SideNavMenuItems) => {
    this.clickEventAnalytics(link.label);
    if (link?.onClick) {
      link.onClick(e);
    }

    if (this.handleNavItemClick) {
      this.handleNavItemClick(e);
    }
  };

  private handleSideNavLinkClick = (e: Event, label: string) => {
    this.clickEventAnalytics(label);

    if (this.handleNavItemClick) {
      this.handleNavItemClick(e);
    }
  };

  private getIcon = (iconName?: string, productIcon?: string) => {
    const iconSlot = 'title-icon';
    if (productIcon) {
      return html`<img
        width="16"
        height="16"
        role="presentation"
        src="data:image/svg+xml;utf8,${encodeURIComponent(productIcon)}" />`;
    } else if (iconName) {
      return renderCarbonIcon(iconName, 16, iconSlot);
    }
    return nothing;
  };

  @property({ type: Object }) link: SideNavLink = {
    href: '',
    label: '',
    sideNavMenuItems: [],
  };
  @property({ type: Boolean }) isCollapsible = false;
  @property({ type: Boolean }) isActive = false;
  @property({ type: Function }) handleNavItemClick: (e: Event) => void =
    () => {};
  @property({ type: Boolean }) menuOpen = false;
  @property({ type: Boolean }) isSideNavMenuItems = false;
  @property({ type: Boolean }) isOnClickAvailable = false;
  @property({ type: Boolean }) isHybridIpaas = false;

  @state() private _isHoveringOnSideNavItem = false;

  private _setIsHoveringOnSideNavItem = (isHovering: boolean) => {
    this._isHoveringOnSideNavItem = isHovering;
  };

  render() {
    const iconSlot = 'title-icon';
    if (typeof this.isCollapsible === 'undefined' || this.isCollapsible) {
      return this.isSideNavMenuItems
        ? html`
            <cds-custom-side-nav-menu
              title="${this.link?.label}"
              expanded="${this.isActive}"
              ${!this.isHybridIpaas ? 'large' : ''}>
              <span slot="title-icon"
                >${this.getIcon(
                  this.link?.iconName,
                  this.link?.productIcon
                )}</span
              >
              ${this.link?.sideNavMenuItems.map((link) => {
                return this.isOnClickAvailable || link.onClick
                  ? html`
                      <cds-custom-side-nav-menu-item
                        @click="${(e: Event) =>
                          this.handleSideNavMenuItemClick(e, link)}"
                        tabIndex="${0}"
                        ?active="${link?.isActive}">
                        ${link.label}
                      </cds-custom-side-nav-menu-item>
                    `
                  : html` <cds-custom-side-nav-menu-item
                      class="${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link-text"
                      href="${link?.href}"
                      target="${link.newTab ? '_blank' : nothing}"
                      rel="noreferrer"
                      @click="${(e: Event) =>
                        this.handleSideNavMenuItemClick(e, link)}"
                      role="link"
                      ?active="${this.isHybridIpaas
                        ? window.location.href.includes(link?.href)
                        : link?.isActive}">
                      <span
                        class="${AUTOMATION_NAMESPACE_PREFIX}--side-panel-nav-item__link">
                        ${link.label}
                        ${link.newTabIcon &&
                        html`<span class="launch_icon"
                          >${renderCarbonIcon('Launch', 16)}</span
                        >`}
                      </span>
                    </cds-custom-side-nav-menu-item>`;
              })}
            </cds-custom-side-nav-menu>
          `
        : this.isOnClickAvailable || this.link?.onClick
        ? html` <cds-custom-side-nav-link
            class="${cx(`${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link`, {
              [`${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link--current`]:
                this.isActive,
            })}"
            role="link"
            ?active="${this.isActive}"
            href="${this.link?.href}"
            @click="${(e: Event) =>
              this.handleSideNavLinkClick(e, this.link?.label)}"
            title="${this.link?.label}"
            ${!this.isHybridIpaas ? 'large' : nothing}>
            ${this.getIcon(this.link?.iconName, this.link?.productIcon)}${this
              .link?.label}
          </cds-custom-side-nav-link>`
        : html`
            <cds-custom-side-nav-link
              class="${cx(`${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link`, {
                [`${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link--current`]:
                  this.isActive,
              })}"
              role="link"
              ?active="${this.isActive}"
              href="${this.link?.href}"
              @click="${(e: Event) =>
                this.handleSideNavLinkClick(e, this.link?.label)}"
              title="${this.link?.label}"
              ${!this.isHybridIpaas ? 'large' : nothing}>
              ${this.getIcon(this.link?.iconName, this.link?.productIcon)}${this
                .link?.label}
            </cds-custom-side-nav-link>
          `;
    }

    return html`
      <div>
        <cds-custom-popover
          caret
          ?open="${this._isHoveringOnSideNavItem}"
          align="right"
          dropShadow="false"
          class="${AUTOMATION_NAMESPACE_PREFIX}--side-panel-nav-item__popover-content">
          <span style="display: none;"></span>
          <cds-custom-side-nav-link
            role="link"
            href="${this.link?.href}"
            @click="${this.link?.onClick}"
            title="${this.link?.label}"
            class="${cx({
              [`${AUTOMATION_NAMESPACE_PREFIX}--side-nav__link--current`]:
                this.isActive,
            })}"
            @mouseleave="${() => this._setIsHoveringOnSideNavItem(false)}"
            @mouseenter="${() => this._setIsHoveringOnSideNavItem(true)}"
            large="${!this.isHybridIpaas}">
            ${this.link?.iconName
              ? renderCarbonIcon(this.link?.iconName, 16, iconSlot)
              : this.link?.label}
          </cds-custom-side-nav-link>
          <cds-custom-popover-content
            >${this.link?.label}</cds-custom-popover-content
          >
        </cds-custom-popover>
      </div>
    `;
  }
}
