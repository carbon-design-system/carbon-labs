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
import { customElement, property, state } from 'lit/decorators.js';
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

  @state() private expiryTime = '';
  @property({ type: Boolean }) open = false;
  @property({ type: Number }) totalSeconds = 300;
  @state() private remainingSeconds = 300;
  @property({ type: Boolean, reflect: true }) private hiding = false;

  private countdownIntervalId: ReturnType<typeof setInterval> | undefined;

  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.remainingSeconds = this.totalSeconds;
        this.expiryTime = this.getExpiryTime(this.remainingSeconds);
      }
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.hiding = false;
        this.startCountdown();
      } else {
        this.stopCountdown();
        this.hiding = true;
        this.addEventListener(
          'transitionend',
          () => { this.hiding = false; },
          { once: true }
        );
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopCountdown();
  }

  getExpiryTime(remainingSeconds: number): string {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds - minutes * 60;
    const minutesText = minutes > 1 ? ' minutes ' : ' minute ';
    const secondsText = seconds === 1 ? ' second' : ' seconds';
    return minutes > 0
      ? minutes + minutesText + seconds + secondsText
      : seconds + secondsText;
  }

  startCountdown() {
    this.stopCountdown();
    this.countdownIntervalId = window.setInterval(
      () => {
        this.remainingSeconds = this.remainingSeconds - 1
        this.expiryTime = this.getExpiryTime(this.remainingSeconds);
      },
      1 * 1000
    );
  }

  stopCountdown() {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = undefined;
    }
  }
  
  render() {
    if (!this.open && !this.hiding) {
      return html``;
    }
    return html`
      <cds-custom-inline-notification
        kind="warning"
        .title="${'Session expiry'}"
        .subtitle="${'You will be logged out in ' + this.expiryTime + ' due to inactivity.'}"
        role="status"
        ?low-contrast="${true}"
        ?hide-close-button="${true}"
        ?open="${true}"
        aria-label="close"
        status-icon-description="notification">
      </cds-custom-inline-notification>
    `;
  }

}
