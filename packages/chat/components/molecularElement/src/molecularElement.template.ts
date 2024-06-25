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

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function molecularElementTemplate(customElementClass) {
  const {
    theme,
    _uniqueID: uniqueID,
    _smilesContent: smilesContent,
    streaming,
  } = customElementClass;

  return html`
    <div
      class="${clabsPrefix}--chat-molecule-container ${clabsPrefix}--chat-molecule-${theme}">
      <svg id="clabs-chat-molecule-${uniqueID}"></svg>
      ${streaming
        ? html`<div class="${clabsPrefix}--chat-molecule-stream-text-container">
            <div class="${clabsPrefix}--chat-molecule-stream-text-content">
              ${smilesContent}
            </div>
          </div>`
        : ``}
    </div>
    <div class="${clabsPrefix}--chat-molecule-tester">
      <svg id="clabs-chat-molecule-test-${uniqueID}"></svg>
    </div>
  `;
}
