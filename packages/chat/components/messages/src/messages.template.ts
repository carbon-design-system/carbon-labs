/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;
import '../../message/message.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messagesTemplate(customElementClass) {
  const {
    _computedMessages: computedMessages,
    _handleRegenerate: handleRegenerate,
    _handleUpdate: handleUpdate,
    _queryInProgress: queryInProgress,
    _handleTagSelection: handleTagSelection,
  } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-messages">
    ${computedMessages.map((message, index) =>
      message.hasError
        ? html` <c4ai--chat-message
            raw-text="${message.text}"
            origin="${message.origin}"
            time-stamp="${message.time}"
            error-state
            disable-buttons
            index="${index}"
            @regenerate="${handleRegenerate}">
          </c4ai--chat-message>`
        : html` <c4ai--chat-message
            raw-text="${message.text}"
            origin="${message.origin}"
            time-stamp="${message.time}"
            disable-buttons="${message.disableButtons || nothing}"
            index="${index}"
            display-name="${message.displayName || nothing}"
            .elements="${message.elements || nothing}"
            @regenerate="${handleRegenerate}"
            @message-updated="${handleUpdate}"
            @tag-selected="${handleTagSelection}">
          </c4ai--chat-message>`
    )}
    ${queryInProgress
      ? html` <c4ai--chat-message
          raw-text="loading"
          origin="bot"
          time-stamp=""
          loading-state
          error-state="false">
        </c4ai--chat-message>`
      : html``}
  </div>`;
}
