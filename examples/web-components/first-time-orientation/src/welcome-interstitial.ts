/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '@carbon/web-components/es/components/grid/index.js';

import welcomeImage from './assets/welcomeInterstitial.png';
import styles from './first-time-orientation.scss?lit';

import { LitElement, html } from 'lit';
/**
 * WelcomeInterstitial component for LitElement.
 * Renders a welcome interstitial with text and image.
 */
export class WelcomeInterstitial extends LitElement {
  /**
   *render method
   */
  render() {
    const prefix = 'clabs';

    return html`
      <cds-grid class="${prefix}__flex-container">
        <cds-column lg="8" md="4" sm="4" class="${prefix}__content-column"
          ><div class="${prefix}__interstitial-text-container">
            <h3><span>Built to scale; made for the analyst</span></h3>
            <p>
              Explore how to leverage search-based detection of your logs,
              respond to automatically correlated and investigated cases,
              advanced data source management, extended detection and response,
              and much more.
            </p>
          </div></cds-column
        >
        <cds-column lg="8" md="4" sm="4">
          <img
            src="${welcomeImage}"
            class="${prefix}__interstitial-image"
            alt="Welcome interstitial"
        /></cds-column>
      </cds-grid>
    `;
  }
  static styles = styles;
}

customElements.define('welcome-interstitial', WelcomeInterstitial);
