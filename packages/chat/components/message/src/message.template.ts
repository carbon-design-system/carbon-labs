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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Renew20 from '@carbon/web-components/es/icons/renew/20.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import ThumbsUp20 from '@carbon/web-components/es/icons/thumbs-up/20.js';
import ThumbsDown20 from '@carbon/web-components/es/icons/thumbs-down/20.js';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Undo16 from '@carbon/web-components/es/icons/undo/16.js';
import '../../card/card.js';
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
    displayName: displayName,
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
    class="${clabsPrefix}--chat-message ${clabsPrefix}--chat-message-${origin}-message">
    <div class="${clabsPrefix}--chat-message-container">
      ${origin === 'user'
        ? html` <div class="${clabsPrefix}--chat-message-content">
            <div class="${clabsPrefix}--chat-message-timestamp-${origin}">
              You ${timeStamp}
            </div>
            <div class="${clabsPrefix}--chat-message-response-user">
              ${messageElements.map(
                (message) => html` <div
                  class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                  ${editing
                    ? html`<textarea
                        .value="${message.content}"
                        @input="${setEditedMessage}"
                        class="${clabsPrefix}--chat-message-edit-area">
                            ${message.content}</textarea
                      >`
                    : unsafeHTML(formatText(message.content))}
                </div>`
              )}
            </div>
            <div class="${clabsPrefix}--chat-message-dropdown-user">
              ${editing === true
                ? html` <div
                      class="${clabsPrefix}--chat-message-small-button"
                      @click="${cancelEdit}">
                      ${Undo16()}
                    </div>
                    <div
                      class="${clabsPrefix}--chat-message-small-button"
                      @click="${validateEdit}">
                      ${CheckMark16()}
                    </div>`
                : html` <div
                    class="${clabsPrefix}--chat-message-small-button"
                    @click="${handleEdit}">
                    ${Edit16()}
                  </div>`}
            </div>
          </div>`
        : html` <div class="${clabsPrefix}--chat-message-icon">
              ${origin == 'user'
                ? html` <div
                    class="${clabsPrefix}--chat-message-${origin}-icon">
                    User20() : AI16()}
                  </div>`
                : html`<cds-slug kind="default" size="2xs"></cds-slug>`}
            </div>
            <div class="${clabsPrefix}--chat-message-content">
              <div class="${clabsPrefix}--chat-message-timestamp-${origin}">
                ${displayName == null ? 'AI' : displayName} ${timeStamp}
              </div>
              <div class="${clabsPrefix}--chat-message-response-bot">
                ${messageElements.map(
                  (message) => html`
                    ${message.type === 'img'
                      ? html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          <div class="${clabsPrefix}--chat-message-img-card">
                            <img src="${message.content}" />
                          </div>
                        </div>`
                      : message.type === 'url'
                      ? html` <div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          <clabs--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </clabs--chat-card>
                        </div>`
                      : message.type === 'video'
                      ? html` <div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          <clabs--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </clabs--chat-card>
                        </div>`
                      : message.type === 'text'
                      ? html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatText(message.content))}
                        </div>`
                      : message.type === 'list'
                      ? html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatList(message.content))}
                        </div>`
                      : message.type === 'loading'
                      ? html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          <div
                            class="${clabsPrefix}--chat-message-loading-container">
                            <div
                              class="${clabsPrefix}--chat-message-loading-bar"></div>
                          </div>
                        </div>`
                      : message.type === 'code'
                      ? html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          ${unsafeHTML(formatCode(message.content))}
                        </div>`
                      : html`<div
                          class="${clabsPrefix}--chat-message-piece ${clabsPrefix}--chat-message-subsection-${message.type}">
                          ${message.content}
                        </div>`}
                  `
                )}
              </div>
              ${!loadingState
                ? html`
                    <div class="${clabsPrefix}--chat-message-dropdown-bot">
                      ${origin === 'user'
                        ? editing === true
                          ? html` <div
                                class="${clabsPrefix}--chat-message-small-button"
                                @click="${cancelEdit}">
                                ${Undo16()}
                              </div>
                              <div
                                class="${clabsPrefix}--chat-message-small-button"
                                @click="${validateEdit}">
                                ${CheckMark16()}
                              </div>`
                          : html` <div
                              class="${clabsPrefix}--chat-message-small-button"
                              @click="${handleEdit}">
                              ${Edit16()}
                            </div>`
                        : html`
                            <div
                              class="${clabsPrefix}--chat-message-small-button"
                              @click="${(e) => {
                                handleFeedback(e, index, 'like', timeStamp);
                              }}">
                              ${ThumbsUp20()}
                            </div>
                            <div
                              class="${clabsPrefix}--chat-message-small-button"
                              @click="${(e) => {
                                handleFeedback(e, index, 'dislike', timeStamp);
                              }}">
                              ${ThumbsDown20()}
                            </div>
                            <div
                              class="${clabsPrefix}--chat-message-small-button"
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
