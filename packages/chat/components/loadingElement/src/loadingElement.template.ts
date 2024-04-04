/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function loadingElementTemplate(customElementClass) {
  const { content } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-loading">
    <div class="${c4aiPrefix}--chat-loading-container">
      ${content}
      <div class="${c4aiPrefix}--chat-loading-bar"></div>
    </div>
  </div>`;
}
