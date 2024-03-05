/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import Search24 from '@carbon/web-components/es/icons/search/24';
import MicrophoneOff16 from '@carbon/web-components/es/icons/microphone--off/16';
import Send16 from '@carbon/web-components/es/icons/send/16';

import { settings } from '@carbon/ai-utilities/es/settings/index.js';
import '../../message/message.js';
import '../../header/header.js';
const { stablePrefix: c4aiPrefix } = settings;

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

  return html`<div class="${c4aiPrefix}--chat-container">
    <c4ai--chat-header>
    </c4ai--chat-header>

    <div class="${c4aiPrefix}--chat-messages">
      &nbsp;
      ${messages.map((message, index) =>
        message.hasError
          ? html` <c4ai--chat-message
              raw-text="${message.text}"
              origin="${message.origin}"
              time-stamp="${message.time}"
              error-state
              index="${index}"
              @regenerate="${handleRegenerate}">
            </c4ai--chat-message>`
          : html` <c4ai--chat-message
              raw-text="${message.text}"
              origin="${message.origin}"
              time-stamp="${message.time}"
              index="${index}"
              @regenerate="${handleRegenerate}"
              @message-updated=${handleUpdate}>
            </c4ai--chat-message>`
      )}
      ${
        queryInProgress
          ? html` <c4ai--chat-message
              raw-text="loading"
              origin="bot"
              time-stamp=""
              loading-state
              error-state="false">
            </c4ai--chat-message>`
          : html``
      }
    </div>

    <div class="${c4aiPrefix}--chat-footer">
      <div class="${c4aiPrefix}--chat-footer-button">${Search24()}</div>
      <textarea
        class="${c4aiPrefix}--chat-search-query"
        rows="1"
        placeholder="Type something..."
        .value="${messageText}"
        @input="${setMessageText}"
        @keyup="${handleInput}" />
        </textarea>
      <div class="${c4aiPrefix}--chat-footer-button">${MicrophoneOff16()}</div>
      <div class="${c4aiPrefix}--chat-footer-button" @click="${sendInput}">
        ${Send16()}
      </div>
    </div>
  </div>`;
}
