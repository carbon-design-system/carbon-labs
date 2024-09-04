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
import Close16 from '@carbon/web-components/es/icons/close/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '../../tagListElement/tagListElement.js';

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
    disclaimer,
  } = customElementClass;
  return html`<div class="${clabsPrefix}--chat-popup-container">
    <div class="${clabsPrefix}--chat-popup-main-content">
      <div class="${clabsPrefix}--chat-popup-title">
        ${popupTitle ? popupTitle : 'Feedback'}
      </div>
      <div class="${clabsPrefix}--chat-popup-prompt">
        ${promptTitle ? promptTitle : 'Why did you choose this rating?'}
      </div>
      <div class="${clabsPrefix}--chat-popup-tag-list">
        <clabs-chat-tag-list
          is-inline
          @on-tag-selected="${handleTagSelection}"
          content="${tagList
            ? tagList
            : '["Accurate","Comprehensive","Consise","Easy to understand"]'}">
        </clabs-chat-tag-list>
      </div>
      <div class="${clabsPrefix}--chat-popup-feedback-text">
        <cds-textarea
          placeholder="${textAreaPlaceholder
            ? textAreaPlaceholder
            : 'Add a comment'}"
          rows="3"
          cols="50"
          @input="${handleTextInput}"
          class="${clabsPrefix}--chat-popup-feedback-text-area"></cds-textarea>
      </div>
      <div class="${clabsPrefix}--chat-popup-disclaimer">
        ${disclaimer
          ? disclaimer
          : "Your feedback on the use of AI-powered features by our dedicated team is to drive improvements. By continuing, you agree to IBM's Feedback Collecting Policy."}
      </div>
      <div class="${clabsPrefix}--chat-popup-submit">
        <cds-button
          size="lg"
          link-role="submit-button"
          tooltip-alignment="left"
          tooltip-position="top"
          tooltip-text="Submit"
          @click="${handleSubmit}">
          Submit
        </cds-button>
      </div>
      <div class="${clabsPrefix}--chat-popup-close">
        <cds-icon-button
          kind="ghost"
          size="sm"
          aria-label="Close Feedback Form"
          role="button"
          align="bottom-right"
          @click="${handleClose}">
          ${Close16({ slot: 'icon' })}
          <span slot="tooltip-content">Close</span>
        </cds-icon-button>
      </div>
    </div>
  </div>`;
}
