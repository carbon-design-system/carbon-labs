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
export function tagElementTemplate(customElementClass) {
  const {
    content: content,
    color: color,
    _handleClick: handleClick,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-tag">
    <div class="${clabsPrefix}--chat-tag-container">
      <button class="tag" .color=${color} @click="${handleClick}">
        <slot>${content}</slot>
      </button>
      <div class="tooltip">Default tooltip text.</div>
    </div>
  </div>`;
}
