/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing } from 'lit';
import Search24 from '@carbon/web-components/es/icons/search/24.js';
import MicrophoneOff16 from '@carbon/web-components/es/icons/microphone--off/16.js';
import Send16 from '@carbon/web-components/es/icons/send/16.js';

import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import '../../message/message.ts';
import '../../header/header.ts';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for Chat interface
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chatTemplate(customElementClass) {
  const {
    _handleInput: handleInput,
    _sendInput: sendInput,
    _setMessageText: setMessageText,
    _messages: messages,
    _messageText: messageText,
    _queryInProgress: queryInProgress,
    _handleRegenerate: handleRegenerate,
    _handleUpdate: handleUpdate,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-container">
    <clabs--chat-header>
    </clabs--chat-header>

    <div class="${clabsPrefix}--chat-messages">
      &nbsp;
      ${messages.map((message, index) =>
        message.hasError
          ? html` <clabs--chat-message
              raw-text="${message.text}"
              origin="${message.origin}"
              time-stamp="${message.time}"
              error-state
              disable-buttons
              index="${index}"
              @regenerate="${handleRegenerate}">
            </clabs--chat-message>`
          : html` <clabs--chat-message
              raw-text="${message.text}"
              origin="${message.origin}"
              time-stamp="${message.time}"
              disable-buttons="${message.disableButtons || nothing}"
              index="${index}"
              display-name="${message.displayName || nothing}"
              .elements="${message.elements || nothing}"
              @regenerate="${handleRegenerate}"
              @message-updated=${handleUpdate}>
            </clabs--chat-message>`
      )}
      ${
        queryInProgress
          ? html` <clabs--chat-message
              raw-text="loading"
              origin="bot"
              time-stamp=""
              loading-state
              error-state="false">
            </clabs--chat-message>`
          : html``
      }
    </div>

    <div class="${clabsPrefix}--chat-footer">
      <div class="${clabsPrefix}--chat-footer-button">${Search24()}</div>
      <textarea
        class="${clabsPrefix}--chat-search-query"
        rows="1"
        placeholder="Type something..."
        .value="${messageText}"
        @input="${setMessageText}"
        @keyup="${handleInput}" />
        </textarea>
      <div class="${clabsPrefix}--chat-footer-button">${MicrophoneOff16()}</div>
      <div class="${clabsPrefix}--chat-footer-button" @click="${sendInput}">
        ${Send16()}
      </div>
    </div>
  </div>`;
}
