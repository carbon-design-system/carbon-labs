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
import Close16 from '@carbon/web-components/es/icons/close/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/link/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '../../tagListElement/tagListElement.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';

/**
 * Lit template for popup
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function popupElementTemplate(customElementClass) {
  const {
    _handleClose: handleClose,
    _handleSubmit: handleSubmit,
    _handleTextInput: handleTextInput,
    popupTitle,
    promptTitle,
    textAreaPlaceholder,
    handleTagSelection,
    tagList,
    orientation,
    disclaimer,
    parentMessageId,
    disableTextArea,
    description,
    listTitle,
    model,
    radioTitle,
    radioButtons,
    listItems,
    invalidEntry,
    enableDataCollectionCheck,
    dataCollectionTitle,
    _handleEscape: handleEscape,
    _handleEscapeB: handleEscapeB,
    _renderLabel: renderLabel,
    _handleCheckBoxChange: handleCheckBoxChange,
  } = customElementClass;
  return html`<div
    class="${clabsPrefix}--chat-popup-container"
    @keydown="${handleEscape}">
    <div class="${clabsPrefix}--chat-popup-caret-${orientation}">
      ${orientation === 'bottom'
        ? html` <svg
            width="22"
            height="11"
            aria-label="caret container"
            transform="translate(0,0)"
            id="caret-up-${parentMessageId}"
            xmlns="http://www.w3.org/2000/svg">
            <polygon
              aria-label="caret triangle"
              id="caret-up-poly-${parentMessageId}"
              points="0 11,11 22,22 11,11 0"></polygon>
          </svg>`
        : html`
            <svg
              width="22"
              height="22"
              transform="translate(0,-10)"
              id="caret-down-${parentMessageId}"
              aria-label="caret container"
              xmlns="http://www.w3.org/2000/svg">
              <polygon
                aria-label="caret triangle"
                id="caret-down-poly-${parentMessageId}"
                points="0 11,11 22,22 11,11 0"></polygon>
            </svg>
          `}
    </div>
    <div class="${clabsPrefix}--chat-popup-main-content">
      ${popupTitle
        ? html`
            <div
              class="${clabsPrefix}--chat-popup-title"
              id="popup-title-${parentMessageId}">
              ${popupTitle}
            </div>
          `
        : ''}
      ${promptTitle
        ? html` <h2 class="${clabsPrefix}--chat-popup-prompt">
            ${promptTitle}
          </h2>`
        : ''}
      ${description
        ? html`<div class="${clabsPrefix}--chat-popup-description">
            ${description}
          </div>`
        : ''}
      <div class="${clabsPrefix}--chat-popup-divider"></div>

      ${!disableTextArea
        ? html`
            <div class="${clabsPrefix}--chat-popup-feedback-text">
              <cds-textarea
                placeholder="${textAreaPlaceholder
                  ? textAreaPlaceholder
                  : 'Add a comment'}"
                rows="3"
                cols="50"
                @input="${handleTextInput}"
                class="${clabsPrefix}--chat-popup-feedback-text-area">
                <span slot="label-text">Feedback comment</span>
              </cds-textarea>
            </div>
          `
        : ''}
      ${tagList
        ? html`
            <div class="${clabsPrefix}--chat-popup-tag-list">
              <clabs-chat-tag-list
                is-inline
                @on-tag-selected="${handleTagSelection}"
                content="${tagList
                  ? tagList
                  : '["Accurate","Comprehensive","Consise","Easy to understand"]'}">
              </clabs-chat-tag-list>
            </div>
          `
        : ''}
      ${listItems
        ? html`
            ${listTitle ? listTitle : ''}
            <ul class="${clabsPrefix}--chat-popup-list">
              ${listItems?.map(
                (item) => html`
                  <li class="${clabsPrefix}--chat-popup-list-item">
                    <strong>${item.title}</strong> ${item.text}
                  </li>
                `
              )}
            </ul>
          `
        : ''}

      <div class="${clabsPrefix}--chat-popup-divider"></div>
      ${disclaimer
        ? html`
            <div class="${clabsPrefix}--chat-popup-disclaimer">
              ${disclaimer
                ? unsafeHTML(disclaimer)
                : "Your feedback on the use of AI-powered features by our dedicated team is to drive improvements. By continuing, you agree to IBM's Feedback Collecting Policy."}
            </div>
          `
        : ''}
      ${radioTitle ? html`<div>${radioTitle}</div>` : ''}
      ${radioButtons
        ? html`
            <cds-radio-button-group
              label-position="right"
              orientation="vertical"
              name="radio-group">
              ${radioButtons?.map(
                (item) => html`
                  <cds-radio-button
                    label-text="${item.text}"
                    value="${item.value}"></cds-radio-button>
                `
              )}
            </cds-radio-button-group>
          `
        : ''}
      ${model
        ? html`
            <div class="${clabsPrefix}--chat-popup-divider"></div>
            <div class="${clabsPrefix}--chat-popup-model-title">AI model</div>
            <cds-link target="_blank" href="${model.url}">
              ${model.name}
            </cds-link>
          `
        : ''}
      ${enableDataCollectionCheck
        ? html`
            <div class="${clabsPrefix}--chat-popup-divider"></div>
            <cds-checkbox @cds-checkbox-changed="${handleCheckBoxChange}">
              ${dataCollectionTitle
                ? dataCollectionTitle
                : 'Missing Data Collection title value'}
            </cds-checkbox>
          `
        : ''}

      <div class="${clabsPrefix}--chat-popup-submit">
        <cds-button
          size="md"
          link-role="submit-button"
          tooltip-alignment="left"
          tooltip-position="top"
          class="${clabsPrefix}--chat-popup-submit-element"
          tooltip-text=" ${invalidEntry
            ? renderLabel('feedback-submit-button-unavailable')
            : renderLabel('feedback-submit-button')}"
          ?disabled="${invalidEntry}"
          @click="${handleSubmit}">
          ${invalidEntry
            ? renderLabel('feedback-submit-button-unavailable')
            : renderLabel('feedback-submit-button')}
        </cds-button>
      </div>

      <div class="${clabsPrefix}--chat-popup-close">
        <cds-icon-button
          kind="ghost"
          size="sm"
          aria-label="Close Feedback Form"
          role="button"
          align="bottom-right"
          @keydown="${handleEscapeB}"
          @click="${handleClose}">
          ${Close16({ slot: 'icon' })}
          <span slot="tooltip-content">${renderLabel('feedback-close')}</span>
        </cds-icon-button>
      </div>
    </div>
  </div>`;
}
