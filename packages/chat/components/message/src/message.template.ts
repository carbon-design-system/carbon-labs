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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Renew20 from '@carbon/web-components/es/icons/renew/20';
import Edit16 from '@carbon/web-components/es/icons/edit/16';
import ThumbsUp20 from '@carbon/web-components/es/icons/thumbs-up/20';
import ThumbsDown20 from '@carbon/web-components/es/icons/thumbs-down/20';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16';
import Undo16 from '@carbon/web-components/es/icons/undo/16';
import '../../card/card.ts';
import '@carbon/web-components/es/components/slug/index.js';

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
    _formatCode: formatCode,
    _formatText: formatText,
    _formatList: formatList,
  } = customElementClass;

  return html`<div
    class="${c4aiPrefix}--chat-message ${c4aiPrefix}--chat-message-${origin}-message">
    <div class="${c4aiPrefix}--chat-message-container">
      ${origin === 'user'
        ? html` <div class="${c4aiPrefix}--chat-message-content">
            <div class="${c4aiPrefix}--chat-message-timestamp-${origin}">
              You ${timeStamp}
            </div>
            <div class="${c4aiPrefix}--chat-message-response-user">
              ${messageElements.map(
                (message) => html` <div
                  class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                  ${editing
                    ? html`<textarea
                        .value="${message.content}"
                        @input="${setEditedMessage}"
                        class="${c4aiPrefix}--chat-message-edit-area">
                            ${message.content}</textarea
                      >`
                    : unsafeHTML(formatText(message.content))}
                </div>`
              )}
            </div>
            <div class="${c4aiPrefix}--chat-message-dropdown-user">
              ${editing === true
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
                  </div>`}
            </div>
          </div>`
        : html` <div class="${c4aiPrefix}--chat-message-icon">
              ${origin == 'user'
                ? html` <div class="${c4aiPrefix}--chat-message-${origin}-icon">
                    User20() : AI16()}
                  </div>`
                : html`<cds-slug kind="default" size="2xs"></cds-slug>`}
            </div>
            <div class="${c4aiPrefix}--chat-message-content">
              <div class="${c4aiPrefix}--chat-message-timestamp-${origin}">
                ${origin == 'user' ? 'User' : 'AI'} ${timeStamp}
              </div>
              <div class="${c4aiPrefix}--chat-message-response-bot">
                ${messageElements.map(
                  (message) => html`
                    ${message.type === 'img'
                      ? html`<div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          <div class="${c4aiPrefix}--chat-message-img-card">
                            <img src="${message.content}" />
                          </div>
                        </div>`
                      : message.type === 'url'
                      ? html` <div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          <c4ai--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </c4ai--chat-card>
                        </div>`
                      : message.type === 'video'
                      ? html` <div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          <c4ai--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </c4ai--chat-card>
                        </div>`
                      : message.type === 'text'
                      ? html`<div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatText(message.content))}
                        </div>`
                      : message.type === 'list'
                      ? html`<div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatList(message.content))}
                        </div>`
                      : message.type === 'loading'
                      ? html`<div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          <div
                            class="${c4aiPrefix}--chat-message-loading-container">
                            <div
                              class="${c4aiPrefix}--chat-message-loading-bar"></div>
                          </div>
                        </div>`
                      : message.type === 'code'
                      ? html`<div
                          class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatCode(message.content))}
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
                    <div class="${c4aiPrefix}--chat-message-dropdown-bot">
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
            </div>`}
    </div>
  </div>`;
}
