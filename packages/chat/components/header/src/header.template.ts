/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import Popup16 from '@carbon/web-components/es/icons/popup/16.js';
import Subtract16 from '@carbon/web-components/es/icons/subtract/16.js';
import '@carbon/web-components/es/components/slug/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function headerTemplate(customElementClass) {
  const { title, icon } = customElementClass;
  return html` <div class="${clabsPrefix}--chat-header-container">
    <div class="${clabsPrefix}--chat-header-content">
      <div class="${clabsPrefix}--chat-header-elements">
        <div class="${clabsPrefix}--chat-header-elements-left">
          ${icon
            ? html`
                <div class="${clabsPrefix}--chat-header-icon">${icon}</div>
              `
            : null}
          ${title
            ? html` <span class="${clabsPrefix}--chat-header-title">
                ${title}
              </span>`
            : null}
        </div>

        <div class="${clabsPrefix}--chat-header-elements-right">
          <div class="${clabsPrefix}--chat-header-icon">
            <cds-slug kind="hollow">
              <div slot="body-text">
                <p>${title}</p>
              </div>
            </cds-slug>
          </div>
          <div class="${clabsPrefix}--chat-header-icon">${Popup16()}</div>
          <div class="${clabsPrefix}--chat-header-icon">${Subtract16()}</div>
        </div>
      </div>
    </div>
  </div>`;
}
