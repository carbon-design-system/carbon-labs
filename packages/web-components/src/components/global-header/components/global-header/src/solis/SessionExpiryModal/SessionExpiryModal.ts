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
import '@carbon/web-components/es-custom/components/notification/inline-notification.js';

import styles from './_index.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Notification to warn about session expiry
 */
@customElement(`${clabsPrefix}-global-header-session-expiry-modal`)
export class SessionExpiryModal extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String }) expiryTime = '';

  render() {
    return html`
      <cds-custom-inline-notification
        kind="warning"
        title="Session expiry"
        subtitle="You will be logged out in ${this
          .expiryTime} due to inactivity."
        role="status"
        low-contrast
        hide-close-button
        aria-label="close"
        status-icon-description="notification">
      </cds-custom-inline-notification>
    `;
  }
}
