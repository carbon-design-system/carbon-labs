/**
 * @license
 *
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@carbon/ibm-products-web-components/es/components/interstitial-screen/index.js';
import './personalization-interstitial.ts';
import './welcome-interstitial.ts';

import styles from './first-time-orientation.scss?lit';

/**
 * ToolbarVertical pattern example.
 *
 * @element clabs-toolbar-vertical
 *
 */
@customElement('clabs-first-time-orientation')
class FirstTimeOrientation extends LitElement {
  /**
   *
   * @param e
   */
  private toggleButton = (e: any) => {
    e.target.nextElementSibling?.toggleAttribute('open');
  };

  /**
   *
   */
  private handleClose = () => {
    document.getElementById('launcherButton')?.focus();
  };
  /**
   * Renders the toolbar template.
   */
  render() {
    return html`
      <cds-button id="launcherButton" @click="${this.toggleButton}"
        >Show Interstitial modal</cds-button
      >

      <c4p-interstitial-screen
        ?open=${true}
        @c4p-interstitial-opened=${(e) => {
          console.log('event initialize', e.detail);
        }}
        @c4p-interstitial-closed=${this.handleClose}>
        <style>
          c4p-interstitial-screen-body {
            block-size: 28rem;
            display: flex;
          }
        </style>
        <c4p-interstitial-screen-header
          header-title="Use case-specific title"
          header-subtitle="Use case-specific sub title"></c4p-interstitial-screen-header>
        <c4p-interstitial-screen-body>
          <c4p-interstitial-screen-body-item stepTitle="Welcome" id="${1}">
            <welcome-interstitial />
          </c4p-interstitial-screen-body-item>
          <c4p-interstitial-screen-body-item
            stepTitle="Tailor your experience"
            id="${2}">
            <personalization-interstitial />
          </c4p-interstitial-screen-body-item>
        </c4p-interstitial-screen-body>
        <c4p-interstitial-screen-footer></c4p-interstitial-screen-footer>
      </c4p-interstitial-screen>
    `;
  }

  static styles = styles;
}
export default FirstTimeOrientation;
