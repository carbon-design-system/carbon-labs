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
import Renew16 from '@carbon/web-components/es/icons/renew/16.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import ThumbsUp16 from '@carbon/web-components/es/icons/thumbs-up/16.js';
import ThumbsDown16 from '@carbon/web-components/es/icons/thumbs-down/16.js';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Undo16 from '@carbon/web-components/es/icons/undo/16.js';
import WatsonxData24 from '@carbon/web-components/es/icons/Watsonx-data/24.js';
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
import '../../carouselElement/carouselElement.js';

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
    loadingState: loadingState,
    displayName: displayName,
    disableButtons: disableButtons,
    _editing: editing,
    _handleEdit: handleEdit,
    _cancelEdit: cancelEdit,
    _setEditedMessage: setEditedMessage,
    _validateEdit: validateEdit,
    _handlePositiveFeedback: handlePositiveFeedback,
    _handleNegativeFeedback: handleNegativeFeedback,
    _handleRegenerate: handleRegenerate,
    _handleMessageElementClick: handleMessageElementClick,
    _onTagSelected: onTagSelected,
    temporaryMessage,
    watsonIcon,
    displayColor,
  } = customElementClass;

  return html`<div
    class="${c4aiPrefix}--chat-message ${c4aiPrefix}--chat-message-user-message">
    <div class="${c4aiPrefix}--chat-message-container">
      ${origin === 'user'
        ? html` <div class="${c4aiPrefix}--chat-message-content">
            <div class="${c4aiPrefix}--chat-message-timestamp-user">
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
                    : html`<c4ai--chat-text
                        align-right
                        content="${message.content}">
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
              ${displayColor
                ? html` <div class="${c4aiPrefix}--chat-message-agent-icon">
                    ${WatsonxData24()}
                  </div>`
                : html`
                    <div class="${c4aiPrefix}--chat-message-bot-icon">
                      ${unsafeHTML(watsonIcon)}
                    </div>
                  `}
            </div>
            <div class="${c4aiPrefix}--chat-message-content">
              <div class="${c4aiPrefix}--chat-message-timestamp-bot">
                ${displayName == null ? 'AI' : displayName} ${timeStamp}
              </div>
              <div class="${c4aiPrefix}--chat-message-response-bot">
                ${messageElements.map(
                  (message) => html` <div
                    class="${c4aiPrefix}--chat-message-section @click="${handleMessageElementClick}">
                    ${
                      message.type === 'img'
                        ? html`
                            <c4ai--chat-image content="${message.content}">
                            </c4ai--chat-image>
                          `
                        : message.type === 'chart'
                        ? html`
                            <c4ai--chat-chart content="${message.content}">
                            </c4ai--chat-chart>
                          `
                        : message.type === 'carousel'
                        ? html`
                            <c4ai--chat-carousel content="${message.content}">
                            </c4ai--chat-carousel>
                          `
                        : message.type === 'table'
                        ? html`
                            <c4ai--chat-table content="${message.content}">
                            </c4ai--chat-table>
                          `
                        : message.type === 'url' ||
                          message.type === 'video' ||
                          message.type === 'file' ||
                          message.type === 'audio'
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
                              subelement in 'elements' array, available types
                              are: 'text', 'img', 'url', 'video', 'audio',
                              'file', 'code', 'list', 'table', 'chart', 'tags'
                              and 'error'. Rendering as default: 'text'...
                            </p>
                            <c4ai--chat-text
                              capitalize
                              content="${message.content}">
                            </c4ai--chat-text>
                          `
                    }
                  </div>`
                )}
                ${temporaryMessage
                  ? html`
                      <div class="${c4aiPrefix}--chat-message-section">
                        ${temporaryMessage.type === 'table'
                          ? html`
                              <c4ai--chat-table
                                content="${temporaryMessage.content}">
                              </c4ai--chat-table>
                            `
                          : temporaryMessage.type === 'list'
                          ? html`
                              <c4ai--chat-list
                                content="${temporaryMessage.content}">
                              </c4ai--chat-list>
                            `
                          : temporaryMessage.type === 'code'
                          ? html`
                              <c4ai--chat-code
                                content="${temporaryMessage.content}">
                              </c4ai--chat-code>
                            `
                          : temporaryMessage.type === 'chart'
                          ? html`
                              <c4ai--chat-chart
                                loading
                                content="${temporaryMessage.content}">
                              </c4ai--chat-chart>
                            `
                          : temporaryMessage.type === 'carousel'
                          ? html`
                              <c4ai--chat-carousel
                                content="${temporaryMessage.content}">
                              </c4ai--chat-carousel>
                            `
                          : temporaryMessage.type === 'tags'
                          ? html`
                              <c4ai--chat-tag-list
                                content="${temporaryMessage.content}"
                                @tag-selected="${onTagSelected}">
                              </c4ai--chat-tag-list>
                            `
                          : html`
                              <c4ai--chat-text
                                content="${temporaryMessage.content}">
                              </c4ai--chat-text>
                            `}
                      </div>
                    `
                  : html``}
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
                              @click="${handlePositiveFeedback}">
                              ${ThumbsUp16()}
                            </div>
                            <div
                              class="${c4aiPrefix}--chat-message-small-button"
                              @click="${handleNegativeFeedback}">
                              ${ThumbsDown16()}
                            </div>
                            <div
                              class="${c4aiPrefix}--chat-message-small-button"
                              @click="${handleRegenerate}">
                              ${Renew16()}
                            </div>
                          `}
                    </div>
                  `
                : html``}
            </div>`}
    </div>
  </div>`;
}
