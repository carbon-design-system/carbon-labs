/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@carbon/web-components/es-custom/components/tile/index.js';
import '@carbon/web-components/es-custom/components/button/index.js';
import { settings } from '@carbon-labs/utilities';
import { renderCarbonIcon } from '../../globals/utils';

import { AUTOMATION_HEADER_BASE_CLASS } from '../../constant';
import styles from './_index.scss?inline' assert { type: 'css' };

const { stablePrefix: clabsPrefix } = settings;
const blockClass = `${AUTOMATION_HEADER_BASE_CLASS}__logout-tile`;

/**
 * Logged out dialog
 */
@customElement(`${clabsPrefix}-global-header-logout-tile`)
export class LogoutTile extends LitElement {
  static styles = css`
    ${unsafeCSS([styles])}
  `;

  @property({ type: String }) brandCompany = '';
  @property({ type: String }) brandProduct = '';
  @property({ type: String }) logoutText = '';
  @property({ type: String }) buttonLabel = '';
  @property({ type: String }) loginHref = '';

  constructor() {
    super();
  }

  render() {
    return html`<cds-custom-tile class="${blockClass}">
      <div>
        <span class="${blockClass}--brand">${this.brandCompany}</span>
        <span class="${blockClass}--product">${this.brandProduct}</span>
      </div>
      <div class="${blockClass}--description">${this.logoutText}</div>
      <div class="${blockClass}--button">
        <cds-custom-button size="xl" href="${this.loginHref}">
          ${this.buttonLabel} ${renderCarbonIcon('ArrowRight', 16, 'icon')}
        </cds-custom-button>
      </div>
    </cds-custom-tile>`;
  }
}
