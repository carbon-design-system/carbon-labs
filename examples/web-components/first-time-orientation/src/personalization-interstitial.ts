/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '@carbon/web-components/es/components/grid/index.js';
import '@carbon/web-components/es/components/tag/index.js';

import { LitElement, html } from 'lit';
import styles from './first-time-orientation.scss?lit';
/**
 * PersonalizationInterstitial component for LitElement.
 * Renders a personalization interstitial with selectable tags.
 */
export class PersonalizationInterstitial extends LitElement {
  private tags = [
    {
      id: 1,
      text: 'Accelerate process with automation',
    },
    {
      id: 2,
      text: 'Proactively identify issues',
    },
    {
      id: 3,
      text: 'Accelerate response times',
    },
    {
      id: 4,
      text: 'Create rules with greater efficiency',
    },
    {
      id: 5,
      text: 'Query faster and monitor in real-time',
    },
    {
      id: 6,
      text: 'Stay ahead of emerging issues',
    },
    {
      id: 7,
      text: 'Take action with custom and built-in dashboards',
    },
  ];

  /**
   * render method
   */
  render() {
    const prefix = 'clabs';

    return html`
      <div class="${prefix}__flex-container">
        <div class="${prefix}__content-column">
          <div
            class="${prefix}__interstitial-text-container ${prefix}__firstTimeOrientation">
            <h4>What experience interest you?</h4>
            <p>
              Personalize your experience by selecting all areas you want to
              explore.
            </p>
          </div>

          <div aria-label="Selectable tags" role="group">
            ${this.tags.map(
              (tag) => html`
           
            </selectable-tag>
            <cds-selectable-tag
            
            id="${tag.id}"
            text="${tag.text}"
            size="lg"
            
            >
          </cds-selectable-tag>
          `
            )}
          </div>
        </div>
      </div>
    `;
  }

  static styles = styles;
}

customElements.define(
  'personalization-interstitial',
  PersonalizationInterstitial
);
