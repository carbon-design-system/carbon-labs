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
import MicrophoneOff16 from '@carbon/web-components/es/icons/microphone--off/16.js';
import Menu24 from '@carbon/web-components/es/icons/Menu/24.js';
import Send16 from '@carbon/web-components/es/icons/send/16.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function footerTemplate(customElementClass) {
  const {
    _messageText: messageText,
    _handleInput: handleInput,
    _setMessageText: setMessageText,
    _sendInputToParent: sendInputToParent,
  } = customElementClass;

  return html` 
       <div class="${c4aiPrefix}--chat-footer-container">
      <div class="${c4aiPrefix}--chat-footer-button active">${Menu24()}</div>
      <textarea
        class="${c4aiPrefix}--chat-search-query"
        rows="1"
        placeholder="Type something..."
        .value="${messageText}"
        @input="${setMessageText}"
        @keyup="${handleInput}" />
        </textarea>
      <div class="${c4aiPrefix}--chat-footer-button">${MicrophoneOff16()}</div>
      <div class="${c4aiPrefix}--chat-footer-button" @click="${sendInputToParent}">
        ${Send16()}
      </div>
      </div>
    `;
}
