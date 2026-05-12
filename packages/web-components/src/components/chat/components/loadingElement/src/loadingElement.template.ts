/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function loadingElementTemplate(customElementClass) {
  const { _loadingMessage: loadingMessage } = customElementClass;
  return html`
  </div>
    ${loadingMessage ? '' : ''}
    <div class="${clabsPrefix}--chat-loading-container">
      <div class="${clabsPrefix}--chat-loading-dot-container">
        <div
          class="${clabsPrefix}--chat-loading-dot ${clabsPrefix}--chat-loading-dot-first"></div>
      </div>
      <div class="${clabsPrefix}--chat-loading-dot-container">
        <div
          class="${clabsPrefix}--chat-loading-dot ${clabsPrefix}--chat-loading-dot-second"></div>
      </div>
      <div class="${clabsPrefix}--chat-loading-dot-container">
        <div
          class="${clabsPrefix}--chat-loading-dot ${clabsPrefix}--chat-loading-dot-third"></div>
      </div>
    </div>
  </div>`;
}
