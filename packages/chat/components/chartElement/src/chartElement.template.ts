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
    chartLoading,
    content,
    _buildLoader: buildLoader,
  } = customElementClass;

  return html`<div
    class="${clabsPrefix}--chat-chart-container"
    id="${clabsPrefix}--chat-embed-vis-${uniqueID}">
    ${errorMessage !== ''
      ? html`<div class="${clabsPrefix}--chat-chart-loading-container">
          <div class="${clabsPrefix}--chat-chart-error-grid">
            ${unsafeHTML(buildLoader())}
          </div>
          <div class="${clabsPrefix}--chat-chart-error-text">
            ${errorMessage}
          </div>
        </div>`
      : html`
            ${
              chartLoading
                ? html`<div
                    class="${clabsPrefix}--chat-chart-loading-container">
                    <div class="${clabsPrefix}--chat-chart-loading-grid">
                      ${unsafeHTML(buildLoader())}
                    </div>
                    <div class="${clabsPrefix}--chat-chart-loading-text">
                      ${content}
                    </div>
                  </div>`
                : html``
            }
          </div>
        `}
  </div>`;
}
