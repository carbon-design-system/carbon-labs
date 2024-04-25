/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
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
    _queryInProgress: queryInProgress,
    _streamResponses: streamResponses,
    _handleInternalChange: handleInternalChange,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-messages-container">
    ${computedMessages
      ? html`
          ${computedMessages.map((message, index) =>
            message.hasError
              ? html` <clabs--chat-message
                  raw-text="${message.text}"
                  origin="${message.origin}"
                  time-stamp="${message.time}"
                  error-state
                  disable-buttons
                  index="${index}">
                </clabs--chat-message>`
              : html` <clabs--chat-message
                  raw-text="${message.text}"
                  origin="${message.origin}"
                  time-stamp="${message.time}"
                  disable-buttons="${message.disableButtons || nothing}"
                  index="${index}"
                  @on-structure-change="${handleInternalChange}"
                  ?stream-content="${streamResponses}"
                  display-name="${message.displayName || nothing}"
                  display-color="${message.displayColor || nothing}"
                  .elements="${message.elements || nothing}">
                </clabs--chat-message>`
          )}
          ${queryInProgress
            ? html` <clabs--chat-message
                raw-text="loading"
                origin="bot"
                time-stamp=""
                loading-state
                error-state="false">
              </clabs--chat-message>`
            : html``}
        `
      : html``}
  </div>`;
}
