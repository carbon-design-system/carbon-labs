/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es-custom/components/modal/index.js';

import styles from './_index.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Modal dialog to warn about session expiry
 */
@customElement(`${clabsPrefix}-global-header-session-expiry-modal`)
export class SessionExpiryModal extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: String }) expiryTime = '';
  @property({ type: Function }) logoutCallback: (() => void) | undefined;
  @property({ type: Function }) continueCallback: (() => void) | undefined;

  render() {
    return html` <cds-custom-modal
      ?open=${this.open}
      prevent-close-on-click-outside>
      <cds-custom-modal-header>
        <cds-custom-modal-close-button
          close-button-label="Close"></cds-custom-modal-close-button>
        <cds-custom-modal-heading
          >Session expiring soon</cds-custom-modal-heading
        >
      </cds-custom-modal-header>
      <cds-custom-modal-body>
        Your session will expire in ${this.expiryTime} due to inactivity. Do you
        want to continue?
      </cds-custom-modal-body>
      <cds-custom-modal-footer>
        <cds-custom-modal-footer-button
          kind="secondary"
          @click="${this.logoutCallback}"
          >Logout now</cds-custom-modal-footer-button
        >
        <cds-custom-modal-footer-button
          kind="primary"
          @click="${this.continueCallback}"
          >Continue session</cds-custom-modal-footer-button
        >
      </cds-custom-modal-footer>
    </cds-custom-modal>`;
  }
}
