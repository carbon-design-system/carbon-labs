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

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chartTemplate(customElementClass) {
  const {
    _invalid: invalid,
    _uniqueID: uniqueID,
    _errorMessage: errorMessage,
  } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-chart">
    ${invalid === true
      ? html` <div class="${c4aiPrefix}--chat-chart-error">
          ${errorMessage}
        </div>`
      : html` <div class="${c4aiPrefix}--chat-chart-container" id="${c4aiPrefix}--chat-embed-vis-${uniqueID}">
          
          </div>
        </div>`}
  </div>`;
}
