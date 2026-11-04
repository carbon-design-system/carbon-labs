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
        this.hiding = false;
        this.remainingSeconds = this.totalSeconds;
        this.expiryTime = this.getExpiryTime(this.remainingSeconds);
      } else if (changedProperties.get('open') === true) {
        // only fade out if open was previously true — ignore initial render
        this.hiding = true;
      }
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.startCountdown();
      } else if (changedProperties.get('open') === true) {
        this.stopCountdown();
        this.addEventListener(
          'transitionend',
          () => {
            this.hiding = false;
          },
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
    this.countdownIntervalId = window.setInterval(() => {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      this.expiryTime = this.getExpiryTime(this.remainingSeconds);
      if (this.remainingSeconds === 0) {
        this.stopCountdown();
      }
    }, 1 * 1000);
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
      <div
        class="cds--inline-notification cds--inline-notification--warning cds--inline-notification--low-contrast cds--inline-notification--hide-close-button"
        role="status"
        aria-label="close">
        <div class="cds--inline-notification__details">
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            aria-label="notification"
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            class="cds--inline-notification__icon">
            <path
              d="M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"></path>
            <path
              d="M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"
              data-icon-path="inner-path"
              opacity="0"></path>
          </svg>
          <div class="cds--inline-notification__text-wrapper">
            <p class="cds--inline-notification__title">Session expiry</p>
            <div class="cds--inline-notification__subtitle">
              You will be logged out in ${this.expiryTime} due to inactivity.
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
