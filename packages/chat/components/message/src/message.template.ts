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
import Renew16 from '@carbon/web-components/es/icons/renew/16.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import ThumbsUp16 from '@carbon/web-components/es/icons/thumbs-up/16.js';
import ThumbsDown16 from '@carbon/web-components/es/icons/thumbs-down/16.js';
import CheckMark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Undo16 from '@carbon/web-components/es/icons/undo/16.js';
import WatsonxData24 from '@carbon/web-components/es/icons/watsonx-data/24.js';
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
import '../../linkListElement/linkListElement.js';
import '../../molecularElement/molecularElement.js';

/**
 * Lit template for message
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messageTemplate(customElementClass) {
  const {
    _messageElements: messageElements,
    userSubmitted,
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
    _onTagSelected: onTagSelected,
    temporaryMessage,
    watsonIconDark,
    watsonIconLight,
    _parentTheme: parentTheme,
    displayColor,
    currentlyStreaming,
    _handleSlotchange,
    disableIcon,
  } = customElementClass;

  return html`<div
    class="${clabsPrefix}--chat-message ${clabsPrefix}--chat-message-user-message">
    <div class="${clabsPrefix}--chat-message-container">
      ${userSubmitted
        ? html` <div class="${clabsPrefix}--chat-message-content">
            <div class="${clabsPrefix}--chat-message-timestamp-user">
              ${displayName ? displayName : 'You'} ${timeStamp}
            </div>
            <div class="${clabsPrefix}--chat-message-response-user">
              <slot
                name="message-item-content"
                @slotchange="${_handleSlotchange}">
                ${messageElements.map(
                  (message) =>
                    html` ${editing
                      ? html` <clabs-chat-editable-text
                          content="${message.content}"
                          @message-edited="${setEditedMessage}">
                        </clabs-chat-editable-text>`
                      : html`<clabs-chat-text
                          align-right
                          content="${message.content}">
                        </clabs-chat-text>`}`
                )}
              </slot>
            </div>
            ${!disableButtons
              ? html` <div class="${clabsPrefix}--chat-message-dropdown-user">
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
                </div>`
              : html` <div
                  class="${clabsPrefix}--chat-message-dropdown-user"></div>`}
          </div>`
        : html` ${!disableIcon
              ? html`<div class="${clabsPrefix}--chat-message-icon">
                  ${displayColor
                    ? html` <div
                        class="${clabsPrefix}--chat-message-agent-icon">
                        ${WatsonxData24()}
                      </div>`
                    : html`
                        <div class="${clabsPrefix}--chat-message-bot-icon">
                          ${parentTheme === 'white'
                            ? unsafeHTML(watsonIconLight)
                            : unsafeHTML(watsonIconDark)}
                        </div>
                      `}
                </div> `
              : html``}
            <div class="${clabsPrefix}--chat-message-content">
              <div class="${clabsPrefix}--chat-message-timestamp-bot">
                ${displayName == null ? 'watsonx' : displayName} ${timeStamp}
              </div>
              <div class="${clabsPrefix}--chat-message-response-bot">
                <slot
                  name="message-item-content"
                  @slotchange="${_handleSlotchange}">
                  ${messageElements.map(
                    (message) => html`
                      ${message.type === 'img'
                        ? html`
                            <clabs-chat-image content="${message.content}">
                            </clabs-chat-image>
                          `
                        : message.type === 'chart'
                        ? html`
                            <clabs-chat-chart content="${message.content}">
                            </clabs-chat-chart>
                          `
                        : message.type === 'link-list'
                        ? html`
                            <clabs-chat-link-list content="${message.content}">
                            </clabs-chat-link-list>
                          `
                        : message.type === 'carousel'
                        ? html`
                            <clabs-chat-carousel content="${message.content}">
                            </clabs-chat-carousel>
                          `
                        : message.type === 'molecule'
                        ? html`
                            <clabs-chat-molecule
                              width="246"
                              height="246"
                              content="${message.content}">
                            </clabs-chat-molecule>
                          `
                        : message.type === 'table'
                        ? html`
                            <clabs-chat-table content="${message.content}">
                            </clabs-chat-table>
                          `
                        : message.type === 'url' ||
                          message.type === 'video' ||
                          message.type === 'file' ||
                          message.type === 'audio'
                        ? html`
                            <clabs-chat-card
                              type="${message.type}"
                              content="${message.content}">
                            </clabs-chat-card>
                          `
                        : message.type === 'text'
                        ? html`
                            <clabs-chat-text
                              capitalize
                              content="${message.content}">
                            </clabs-chat-text>
                          `
                        : message.type === 'annotated-text'
                        ? html`
                            <clabs-chat-text
                              capitalize
                              enable-annotations
                              content="${message.content}">
                            </clabs-chat-text>
                          `
                        : message.type === 'html-text'
                        ? html`
                            <clabs-chat-text
                              capitalize
                              enable-html-rendering
                              content="${message.content}">
                            </clabs-chat-text>
                          `
                        : message.type === 'list'
                        ? html`
                            <clabs-chat-list content="${message.content}">
                            </clabs-chat-list>
                          `
                        : message.type === 'loading'
                        ? html` <clabs-chat-loading> </clabs-chat-loading> `
                        : message.type === 'code'
                        ? html`
                            <clabs-chat-code
                              content="${message.content}"
                              max-height="246px">
                            </clabs-chat-code>
                          `
                        : message.type === 'tags'
                        ? html`
                            <clabs-chat-tag-list
                              content="${message.content}"
                              @tag-selected="${onTagSelected}">
                            </clabs-chat-tag-list>
                          `
                        : message.type === 'error'
                        ? html`
                            <clabs-chat-error
                              content="${message.content}"
                              capitalize>
                            </clabs-chat-error>
                          `
                        : html`
                            <p class="${clabsPrefix}--chat-message-warning">
                              Warning: No valid type specified for message
                              subelement in 'elements' array, available types
                              are: 'text', 'img', 'url', 'video', 'audio',
                              'file', 'code', 'list', 'table', 'chart', 'tags'
                              and 'error'. Rendering as default: 'text'...
                            </p>
                            <clabs-chat-text
                              capitalize
                              content="${message.content}">
                            </clabs-chat-text>
                          </div>`}
                    `
                  )}
                </slot>
                ${currentlyStreaming
                  ? html`
                      ${temporaryMessage.type === 'table'
                        ? html`
                            <clabs-chat-table
                              content="${temporaryMessage.content}">
                            </clabs-chat-table>
                          `
                        : temporaryMessage.type === 'list'
                        ? html`
                            <clabs-chat-list
                              content="${temporaryMessage.content}">
                            </clabs-chat-list>
                          `
                        : temporaryMessage.type === 'code'
                        ? html`
                            <clabs-chat-code
                              content="${temporaryMessage.content}">
                            </clabs-chat-code>
                          `
                        : temporaryMessage.type === 'chart'
                        ? html`
                            <clabs-chat-chart
                              ?streaming="${true}"
                              content="${temporaryMessage.content}">
                            </clabs-chat-chart>
                          `
                        : temporaryMessage.type === 'carousel'
                        ? html`
                            <clabs-chat-carousel
                              content="${temporaryMessage.content}">
                            </clabs-chat-carousel>
                          `
                        : temporaryMessage.type === 'molecule'
                        ? html`
                            <clabs-chat-molecule
                              streaming
                              width="246"
                              height="246"
                              content="${temporaryMessage.content}">
                            </clabs-chat-molecule>
                          `
                        : temporaryMessage.type === 'tags'
                        ? html`
                            <clabs-chat-tag-list
                              content="${temporaryMessage.content}"
                              @tag-selected="${onTagSelected}">
                            </clabs-chat-tag-list>
                          `
                        : html`
                            <clabs-chat-text
                              content="${temporaryMessage.content}">
                            </clabs-chat-text>
                          `}
                    `
                  : html``}
              </div>
              ${!loadingState && !disableButtons && !currentlyStreaming
                ? html`
                    <div class="${clabsPrefix}--chat-message-dropdown-bot">
                      ${userSubmitted
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
                              @click="${handlePositiveFeedback}">
                              ${ThumbsUp16()}
                            </div>
                            <div
                              class="${clabsPrefix}--chat-message-small-button"
                              @click="${handleNegativeFeedback}">
                              ${ThumbsDown16()}
                            </div>
                            <div
                              class="${clabsPrefix}--chat-message-small-button"
                              @click="${handleRegenerate}">
                              ${Renew16()}
                            </div>
                          `}
                    </div>
                  `
                : html`<div
                    class="${clabsPrefix}--chat-message-dropdown-bot"></div>`}
            </div>`}
    </div>
  </div>`;
}
