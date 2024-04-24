/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '../../errorElement/errorElement.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chartElementTemplate(customElementClass) {
  const {
    _uniqueID: uniqueID,
    _errorMessage: errorMessage,
    loading,
    content,
    _buildLoader: buildLoader,
  } = customElementClass;

  return html`
    <div
      class="${c4aiPrefix}--chat-chart-container"
      id="${c4aiPrefix}--chat-embed-vis-${uniqueID}">
      ${loading
        ? html`
         <div class="${c4aiPrefix}--chat-chart-loading-container">
          <div class="${c4aiPrefix}--chat-chart-loading-grid">
           ${unsafeHTML(buildLoader())}
          </div>
          <div class="${c4aiPrefix}--chat-chart-loading-text">
            ${content}
          </div>
          </div>
          </div>`
        : html``}
    </div>
    ${errorMessage !== ''
      ? html`
          <div class="${c4aiPrefix}--chat-chart-container">
            <div class="${c4aiPrefix}--chat-chart-loading-container">
              <div class="${c4aiPrefix}--chat-chart-error-text">
                ${errorMessage}
              </div>
            </div>
          </div>
        `
      : html``}
  `;
}
