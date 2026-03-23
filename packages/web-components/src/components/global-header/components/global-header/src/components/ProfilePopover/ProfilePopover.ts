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
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import styles from './_index.scss?inline';
import { animate, fadeIn, fadeOut } from '@lit-labs/motion';
import { HeaderContextProps } from '../HeaderContext/HeaderContext.types';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Contents of the profile menu
 */
@customElement(`${clabsPrefix}-global-header-profile-popover`)
export class AuthContext extends LitElement {
  static styles = css`
    ${unsafeCSS([styles])}
  `;

  @property({ type: Boolean }) profileOpen = false;
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

  constructor() {
    super();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('profileOpen')) {
      if (this.profileOpen) {
        document.addEventListener('click', this.handleOutsideClick);
      } else {
        document.removeEventListener('click', this.handleOutsideClick);
      }
    }
  }

  handleOutsideClick(event: MouseEvent) {
    const path = event.composedPath();
    if (!path.includes(this)) {
      const toggleEvent = new CustomEvent('profile-toggle', {
        bubbles: true,
        composed: true,
      }); // event to trigger the parent component to update the toggle value
      this.dispatchEvent(toggleEvent);
    }
  }

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
      <cds-custom-popover
        ?open="${this.profileOpen}"
        tabTip
        align="bottom-right">
        <slot></slot>
        <cds-custom-popover-content>
          ${this.profileOpen
            ? html` <div
                class="automation-header__popover"
                ${animate({ in: fadeIn, out: fadeOut })}>
                <clabs-global-header-auth-context
                  .props="${{
                    profile,
                    mainSectionItems,
                    footerSectionItems,
                    userManagement,
                    managementConsole,
                    profileFooterLinks,
                  }}"></clabs-global-header-auth-context>
              </div>`
            : nothing}
        </cds-custom-popover-content>
      </cds-custom-popover>
    `;
  }
}
