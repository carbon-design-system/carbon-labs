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
export function editableTextElementTemplate(customElementClass) {
  const {
    content,
    _setEditedMessage: setEditedMessage,
    alignRight,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-editable-text">
    <div
      class="${clabsPrefix}--chat-editable-text--float-${alignRight
        ? 'right'
        : 'left'}">
      <textarea
        .value="${content}"
        @keydown="${setEditedMessage}"
        @keyup="${setEditedMessage}"
        class="${clabsPrefix}--chat-editable-text-area">
${content}</textarea
      >
    </div>
  </div>`;
}
