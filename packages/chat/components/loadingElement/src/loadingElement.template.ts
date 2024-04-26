/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function loadingElementTemplate(customElementClass) {
  const { content } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-loading">
    <div class="${clabsPrefix}--chat-loading-container">
      ${content}
      <div class="${clabsPrefix}--chat-loading-bar"></div>
    </div>
  </div>`;
}
