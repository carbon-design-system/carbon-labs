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
import ThumbsUpFilled16 from '@carbon/web-components/es/icons/thumbs-up--filled/16.js';
import ThumbsDownFilled16 from '@carbon/web-components/es/icons/thumbs-down--filled/16.js';
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
import '../../formulaElement/formulaElement.js';
import '../../fileUploadElement/fileUploadElement.js';
import '../../popupElement/popupElement.js';
import '../../diagramElement/diagramElement.js';

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
    index,
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
    showFeedBackForm,
    watsonIconDark,
    watsonIconLight,
    _parentTheme: parentTheme,
    _childLinkClicked: childLinkClicked,
    displayColor,
    currentlyStreaming,
    _handleSlotchange,
    _hideFeedBackForm: hideFeedBackForm,
    positiveFeedbackSelected,
    negativeFeedbackSelected,
    enableComplexFeedback,
    handlePositiveKeyboardInput,
    handleNegativeKeyboardInput,
    compactIcon,
    _feedbackFormValues: feedbackFormValues,
    popupTargetElement,
    _renderLabel: renderLabel,
    customLabels,
  } = customElementClass;

  return html`<div
    role="article"
    aria-label="Message #${index} from ${userSubmitted
      ? displayName
        ? displayName
        : 'You'
      : displayName == null
      ? 'watsonx'
      : displayName} at ${timeStamp}"
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
                    ? html` <cds-icon-button
                          size="sm"
                          kind="ghost"
                          align="left"
                          label="Undo edit"
                          @click="${cancelEdit}">
                          ${Undo16({ slot: 'icon' })}
                          <span slot="tooltip-content"
                            >${renderLabel('message-undo-edit')}</span
                          >
                        </cds-icon-button>
                        <cds-icon-button
                          size="sm"
                          kind="ghost"
                          align="left"
                          label="Send edit"
                          @click="${validateEdit}">
                          ${CheckMark16({ slot: 'icon' })}
                          <span slot="tooltip-content"
                            >${renderLabel('message-validate-edit')}</span
                          >
                        </cds-icon-button>`
                    : html` <cds-icon-button
                        size="sm"
                        kind="ghost"
                        align="left"
                        label="Edit Code"
                        @click="${handleEdit}">
                        ${Edit16({ slot: 'icon' })}
                        <span slot="tooltip-content"
                          >${renderLabel('message-enable-editing')}</span
                        >
                      </cds-icon-button>`}
                </div>`
              : html` <div
                  class="${clabsPrefix}--chat-message-dropdown-user"></div>`}
          </div>`
        : html` ${!compactIcon
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
            <div
              class="${clabsPrefix}--chat-message-content ${compactIcon
                ? clabsPrefix + '--chat-message-content-compact'
                : ''}">
              ${!compactIcon
                ? html` <div class="${clabsPrefix}--chat-message-timestamp-bot">
                    ${displayName == null ? 'watsonx' : displayName}
                    ${timeStamp}
                  </div>`
                : html` <div
                    class="${clabsPrefix}--chat-message-header-bot-compact">
                    <div class="${clabsPrefix}--chat-message-bot-icon-compact">
                      ${parentTheme === 'white'
                        ? unsafeHTML(watsonIconLight)
                        : unsafeHTML(watsonIconDark)}
                    </div>
                    <div
                      class="${clabsPrefix}--chat-message-timestamp-bot-compact"
                      id="message${index}-origin">
                      ${displayName == null ? 'watsonx' : displayName}
                      ${timeStamp}
                    </div>
                  </div>`}

              <div
                class="${clabsPrefix}--chat-message-response-bot ${currentlyStreaming
                  ? clabsPrefix + '--chat-message-streaming'
                  : ''}">
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
                            <clabs-chat-chart
                              content="${message.content}"
                              container-height="320px">
                            </clabs-chat-chart>
                          `
                        : message.type === 'link-list'
                        ? html`
                            <clabs-chat-link-list
                              @on-link-list-item-selected="${childLinkClicked}"
                              .customLabels="${customLabels}"
                              content="${message.content}">
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
                              height="${369}"
                              content="${message.content}">
                            </clabs-chat-molecule>
                          `
                        : message.type === 'formula'
                        ? html`
                            <clabs-chat-formula content="${message.content}">
                            </clabs-chat-formula>
                          `
                        : message.type === 'file-upload'
                        ? html`
                            <clabs-chat-file-upload
                              content="${message.content}">
                            </clabs-chat-file-upload>
                          `
                        : message.type === 'table'
                        ? html`
                            <clabs-chat-table
                              max-height="246px"
                              content="${message.content}">
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
                        : message.type === 'card'
                        ? html`
                            <clabs-chat-card content="${message.content}">
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
                        : message.type === 'highlight-text'
                        ? html`
                            <clabs-chat-text
                              enable-text-highlighting
                              content="${message.content}">
                            </clabs-chat-text>
                          `
                        : message.type === 'summarized-text'
                        ? html`
                            <clabs-chat-text
                              enable-summarization
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
                        : message.type === 'diagram'
                        ? html` <clabs-chat-diagram
                            definition="${message.content}">
                          </clabs-chat-diagram>`
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
                              .customLabels="${customLabels}"
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
                              [Warning] No valid block-type specified, rendering as type 'text': 
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
                              max-height="246px"
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
                              streaming
                              .customLabels="${customLabels}"
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
                              height="${369}"
                              content="${temporaryMessage.content}">
                            </clabs-chat-molecule>
                          `
                        : temporaryMessage.type === 'formula'
                        ? html`
                            <clabs-chat-formula
                              content="${temporaryMessage.content}">
                            </clabs-chat-formula>
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
                              streaming
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
                          ? html` <cds-icon-button
                                size="sm"
                                kind="ghost"
                                align="left"
                                label="Undo Edit"
                                @click="${cancelEdit}">
                                ${Undo16({ slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel('message-undo-edit')}</span
                                >
                              </cds-icon-button>
                              <cds-icon-button
                                size="sm"
                                kind="ghost"
                                align="left"
                                label="Send edit"
                                @click="${validateEdit}">
                                ${CheckMark16({ slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel('message-validate-edit')}</span
                                >
                              </cds-icon-button>`
                          : html` <cds-icon-button
                              size="sm"
                              kind="ghost"
                              align="left"
                              label="Edit message"
                              @click="${handleEdit}">
                              ${Edit16({ slot: 'icon' })}
                              <span slot="tooltip-content"
                                >${renderLabel('message-enable-editing')}</span
                              >
                            </cds-icon-button>`
                        : html`
                            <cds-icon-button
                              size="sm"
                              kind="ghost"
                              align="right"
                              role="button"
                              tabindex="0"
                              aria-expanded="${positiveFeedbackSelected}"
                              aria-controls="${showFeedBackForm
                                ? clabsPrefix +
                                  '--chat-popup-unique-feedback-' +
                                  index
                                : ''}"
                              label="${renderLabel(
                                positiveFeedbackSelected
                                  ? 'message-undo-like-button'
                                  : 'message-like-button'
                              )}"
                              @keydown="${handlePositiveKeyboardInput}"
                              @click="${handlePositiveFeedback}">
                              ${positiveFeedbackSelected
                                ? ThumbsUpFilled16({ slot: 'icon' })
                                : ThumbsUp16({ slot: 'icon' })}
                              <span slot="tooltip-content"
                                >${renderLabel(
                                  positiveFeedbackSelected
                                    ? 'message-undo-like-button'
                                    : 'message-like-button'
                                )}</span
                              >
                            </cds-icon-button>

                            <cds-icon-button
                              size="sm"
                              kind="ghost"
                              align="right"
                              role="button"
                              tabindex="0"
                              aria-expanded="${negativeFeedbackSelected}"
                              aria-controls="${showFeedBackForm
                                ? clabsPrefix +
                                  '--chat-popup-unique-feedback-' +
                                  index
                                : ''}"
                              label="Thumbs down"
                              @keydown="${handleNegativeKeyboardInput}"
                              @click="${handleNegativeFeedback}">
                              ${negativeFeedbackSelected
                                ? ThumbsDownFilled16({ slot: 'icon' })
                                : ThumbsDown16({ slot: 'icon' })}
                              <span slot="tooltip-content"
                                >${renderLabel(
                                  negativeFeedbackSelected
                                    ? 'message-undo-dislike-button'
                                    : 'message-dislike-button'
                                )}</span
                              >
                            </cds-icon-button>
                            <cds-icon-button
                              size="sm"
                              kind="ghost"
                              align="right"
                              label="Regenerate"
                              @click="${handleRegenerate}">
                              ${Renew16({ slot: 'icon' })}
                              <span slot="tooltip-content"
                                >${renderLabel(
                                  'message-regenerate-button'
                                )}</span
                              >
                            </cds-icon-button>
                          `}
                    </div>
                  `
                : html`<div
                    class="${clabsPrefix}--chat-message-dropdown-bot"></div>`}
            </div>`}
    </div>
    ${showFeedBackForm || enableComplexFeedback
      ? html`
          <clabs-chat-popup
            @on-feedback-popup-closed="${hideFeedBackForm}"
            ?is-open="${showFeedBackForm}"
            id="${clabsPrefix}--chat-popup-unique-feedback-${index}"
            .feedbackFormValues="${feedbackFormValues}"
            .targetElement="${popupTargetElement}"
            .customLabels="${customLabels}"
            parent-message-id="${index}"
            ?compact-mode="${compactIcon}"
            type="${positiveFeedbackSelected
              ? 'thumbs-up'
              : negativeFeedbackSelected
              ? 'thumbs-down'
              : 'custom'}">
          </clabs-chat-popup>
        `
      : html``}
  </div>`;
}
