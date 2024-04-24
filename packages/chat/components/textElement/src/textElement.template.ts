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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function textElementTemplate(customElementClass) {
  const {
    content,
    _formatText: formatText,
    capitalize,
    alignRight,
  } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-text">
    <div
      class="${c4aiPrefix}--chat-text--float-${alignRight ? 'right' : 'left'}">
      <div class="${c4aiPrefix}--chat-text--content">
        ${unsafeHTML(formatText(content, capitalize))}
      </div>
    </div>
  </div>`;
}
