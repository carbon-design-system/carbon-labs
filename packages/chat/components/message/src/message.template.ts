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
import AI16 from '@carbon/web-components/es/icons/AI/16.js';
import User20 from '@carbon/web-components/es/icons/user/20.js';
import Renew20 from '@carbon/web-components/es/icons/renew/20.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import ThumbsUp20 from '@carbon/web-components/es/icons/thumbs-up/20.js';
import ThumbsDown20 from '@carbon/web-components/es/icons/thumbs-down/20.js';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16.js';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Undo16 from '@carbon/web-components/es/icons/undo/16.js';

/**
 * Lit template for message
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messageTemplate(customElementClass) {
  const {
    _messageElements: messageElements,
    origin: origin,
    timeStamp: timeStamp,
    index: index,
    loadingState: loadingState,
    _editing: editing,
    _handleEdit: handleEdit,
    _cancelEdit: cancelEdit,
    _setEditedMessage: setEditedMessage,
    _validateEdit: validateEdit,
    _handleFeedback: handleFeedback,
    _handleRegenerate: handleRegenerate,
    _getSiteName: getSiteName,
    _getShortenedURL: getShortenedURL,
  } = customElementClass;

  return html`<div
    class="${c4aiPrefix}--chat-message ${c4aiPrefix}--chat-message-${origin}-message">
    <div class="${c4aiPrefix}--chat-message-container">
      <div class="${c4aiPrefix}--chat-message-icon">
        <div class="${c4aiPrefix}--chat-message-${origin}-icon">
          ${origin == 'user' ? User20() : AI16()}
        </div>
      </div>
      <div class="${c4aiPrefix}--chat-message-content">
        <div class="${c4aiPrefix}--chat-message-timestamp">
          ${origin == 'user' ? 'User' : 'AI'} ${timeStamp}
        </div>
        <div class="${c4aiPrefix}--chat-message-response">
          ${messageElements.map(
            (message) => html`
              ${message.type === 'url'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-url-card">
                      <div class="${c4aiPrefix}--chat-message-url-card-title">
                        ${getSiteName(message.content)}
                      </div>
                      <div
                        class="${c4aiPrefix}--chat-message-url-card-link-container">
                        <a href="${message.content}" target="_blank"
                          >${getShortenedURL(message.content)}</a
                        >
                        <div class="${c4aiPrefix}--chat-message-url-card-icon">
                          <a href="${message.content}" target="_blank"
                            >${ArrowRight16()}</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>`
                : message.type === 'img'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-img-card">
                      <img src="${message.content}" />
                    </div>
                  </div>`
                : message.type === 'video'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-video-card">
                      <video controls>
                        <source src="${message.content}" type="video/webm" />
                      </video>
                      <div class="${c4aiPrefix}--chat-message-video-title">
                        Video Title
                      </div>
                    </div>
                  </div>`
                : message.type === 'text'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    ${editing
                      ? html`<textarea
                          .value="${message.content}"
                          @input="${setEditedMessage}"
                          class="${c4aiPrefix}--chat-message-edit-area">
${message.content}</textarea
                        >`
                      : message.content}
                  </div>`
                : message.type === 'loading'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-loading-container">
                      <div
                        class="${c4aiPrefix}--chat-message-loading-bar"></div>
                    </div>
                  </div>`
                : html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    ${message.content}
                  </div>`}
            `
          )}
        </div>
        ${!loadingState
          ? html`
              <div class="${c4aiPrefix}--chat-message-dropdown">
                ${origin === 'user'
                  ? editing === true
                    ? html` <div
                          class="${c4aiPrefix}--chat-message-small-button"
                          @click="${cancelEdit}">
                          ${Undo16()}
                        </div>
                        <div
                          class="${c4aiPrefix}--chat-message-small-button"
                          @click="${validateEdit}">
                          ${CheckMark16()}
                        </div>`
                    : html` <div
                        class="${c4aiPrefix}--chat-message-small-button"
                        @click="${handleEdit}">
                        ${Edit16()}
                      </div>`
                  : html`
                      <div
                        class="${c4aiPrefix}--chat-message-small-button"
                        @click="${(e) => {
                          handleFeedback(e, index, 'like', timeStamp);
                        }}">
                        ${ThumbsUp20()}
                      </div>
                      <div
                        class="${c4aiPrefix}--chat-message-small-button"
                        @click="${(e) => {
                          handleFeedback(e, index, 'dislike', timeStamp);
                        }}">
                        ${ThumbsDown20()}
                      </div>
                      <div
                        class="${c4aiPrefix}--chat-message-small-button"
                        @click="${handleRegenerate}">
                        ${Renew20()}
                      </div>
                    `}
              </div>
            `
          : html``}
      </div>
    </div>
  </div>`;
}
