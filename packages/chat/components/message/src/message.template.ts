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
import Renew20 from '@carbon/web-components/es/icons/renew/20.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import ThumbsUp20 from '@carbon/web-components/es/icons/thumbs-up/20.js';
import ThumbsDown20 from '@carbon/web-components/es/icons/thumbs-down/20.js';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Undo16 from '@carbon/web-components/es/icons/undo/16.js';
import '@carbon/web-components/es/components/slug/index.js';
import '../../chartElement/chartElement.js';
import '../../tableElement/tableElement.js';
import '../../cardElement/cardElement.js';
import '../../codeElement/codeElement.js';
import '../../tagListElement/tagListElement.js';
import '../../listElement/listElement.js';
import '../../textElement/textElement.js';
import '../../imageElement/imageElement.js';
import '../../editableTextElement/editableTextElement.js';
import '../../errorElement/errorElement.js';
import '../../loadingElement/loadingElement.js';

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
    disableButtons: disableButtons,
    _editing: editing,
    _handleEdit: handleEdit,
    _cancelEdit: cancelEdit,
    _setEditedMessage: setEditedMessage,
    _validateEdit: validateEdit,
    _handleFeedback: handleFeedback,
    _handleRegenerate: handleRegenerate,
    _onTagSelected: onTagSelected,
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
                (message) =>
                  html` ${editing
                    ? html` <c4ai--chat-editable-text
                        content="${message.content}"
                        @message-edited="${setEditedMessage}">
                      </c4ai--chat-editable-text>`
                    : html`<c4ai--chat-text content="${message.content}">
                      </c4ai--chat-text>`}`
              )}
            </div>
            ${!disableButtons
              ? html` <div class="${c4aiPrefix}--chat-message-dropdown-user">
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
                </div>`
              : html``}
          </div>`
        : html` <div class="${c4aiPrefix}--chat-message-icon">
              ${origin == 'user'
                ? html` <div class="${c4aiPrefix}--chat-message-${origin}-icon">
                    User20() : AI16()}
                  </div>`
                : html`<cds-slug kind="hollow" size="2xs"></cds-slug>`}
            </div>
            <div class="${c4aiPrefix}--chat-message-content">
              <div class="${c4aiPrefix}--chat-message-timestamp-${origin}">
                ${displayName == null ? 'AI' : displayName} ${timeStamp}
              </div>
              <div class="${c4aiPrefix}--chat-message-response-bot">
                ${messageElements.map(
                  (message) => html` <div
                    class="${c4aiPrefix}--chat-message-section">
                    ${message.type === 'img'
                      ? html`
                          <c4ai--chat-image content="${message.content}">
                          </c4ai--chat-image>
                        `
                      : message.type === 'chart'
                      ? html`
                          <c4ai--chat-chart content="${message.content}">
                          </c4ai--chat-chart>
                        `
                      : message.type === 'table'
                      ? html`
                          <c4ai--chat-table content="${message.content}">
                          </c4ai--chat-table>
                        `
                      : message.type === 'url'
                      ? html`
                          <c4ai--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </c4ai--chat-card>
                        `
                      : message.type === 'video'
                      ? html`
                          <c4ai--chat-card
                            type="${message.type}"
                            content="${message.content}">
                          </c4ai--chat-card>
                        `
                      : message.type === 'text'
                      ? html`
                          <c4ai--chat-text
                            capitalize
                            content="${message.content}">
                          </c4ai--chat-text>
                        `
                      : message.type === 'list'
                      ? html`
                          <c4ai--chat-list content="${message.content}">
                          </c4ai--chat-list>
                        `
                      : message.type === 'loading'
                      ? html` <c4ai--chat-loading> </c4ai--chat-loading> `
                      : message.type === 'code'
                      ? html`
                          <c4ai--chat-code content="${message.content}">
                          </c4ai--chat-code>
                        `
                      : message.type === 'tags'
                      ? html`
                          <c4ai--chat-tag-list
                            content="${message.content}"
                            @tag-selected="${onTagSelected}">
                          </c4ai--chat-tag-list>
                        `
                      : message.type === 'error'
                      ? html`
                          <c4ai--chat-error
                            content="${message.content}"
                            capitalize>
                          </c4ai--chat-error>
                        `
                      : html`
                          <p class="${c4aiPrefix}--chat-message-warning">
                            Warning: No valid type specified for message
                            subelement in 'elements' array, available types are:
                            'text', 'img', 'url', 'video', 'code', 'list',
                            'table', 'chart', 'tags' and 'error'. Rendering as
                            default: 'text'...
                          </p>
                          <c4ai--chat-text
                            capitalize
                            content="${message.content}">
                          </c4ai--chat-text>
                        `}
                  </div>`
                )}
              </div>
              ${!loadingState && !disableButtons
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
