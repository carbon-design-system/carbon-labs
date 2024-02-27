/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/form-group/index.js';
import '@carbon/web-components/es/components/slug/index.js';
import '@carbon/web-components/es/components/tooltip/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/notification/index.js';
import {
  FEEDBACK_TYPE,
  FeedbackData,
  FeedbackDescription,
  ModalData,
} from '../defs';

/**
 * Lit template for Feedback Flag
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function openFeedbackFlag(customElementClass) {
  const { _toggle: toggle, isModelOpen, pageX, pageY } = customElementClass;
  return html`
    <div
      @mousedown=${toggle}
      class="feedback-flag"
      style="top: ${pageY -
      40}px; left: ${pageX}px; font-weight: bold; display: ${isModelOpen
        ? 'none'
        : 'block'}">
      <slot name="icon"></slot>
    </div>
  `;
}

/**
 * Lit template for Feedback Modal
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function openModal(customElementClass) {
  const {
    formData,
    isEditable,
    isModelOpen,
    _handleTextInput: handleTextInput,
    _handleFeedback: handleFeedback,
    _handleTextArea: handleTextArea,
    _handleFormData: handleFormData,
    handleFeedbackDelete,
    _toggleEdit: toggleEdit,
    _toggle: toggle,
    isUpdateMode,
    disableSave,
  } = customElementClass;

  return html`
    <cds-modal
      id="feedback-modal"
      ?open=${isModelOpen}
      ?has-scrolling-content=${true}
      @cds-modal-closed=${toggle}>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>${ModalData.heading}</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-inline-notification
          data-modal-primary-focus
          hide-close-button
          style="min-width: 30rem; margin-bottom: .5rem"
          subtitle=${ModalData.notificationSubtitle}
          kind="info">
        </cds-inline-notification>
        <div style="margin-block-end:0.5rem">
          <cds-form-group>
            <div class="label">Selected text</div>
            <p class="selected-text">
              ${formData.selected_text}
              <cds-icon-button @click=${toggleEdit} size="xs">
                ${Edit16({ slot: 'icon' })}
                <span slot="tooltip-content">Improved text</span>
              </cds-icon-button>
            </p>
          </cds-form-group>
        </div>

        ${isEditable
          ? html`
              <div style="margin-block-end:0.5rem">
                <cds-form-group style="margin-bottom-end:0.5rem">
                  <cds-text-input
                    label="Improved text"
                    value=${formData.selected_text}
                    @input=${handleTextInput}>
                  </cds-text-input>
                </cds-form-group>
              </div>
            `
          : null}

        <div style="margin-block-end:0.5rem">
          <cds-checkbox-group
            style="margin-bottom-end:0.5rem"
            @cds-checkbox-changed=${handleFeedback}
            legend-text="Content Quality Feedback">
            ${Object.keys(FeedbackDescription).map((item) => {
              return html`
                <cds-checkbox
                  value=${FEEDBACK_TYPE[item]}
                  label-text=${FeedbackDescription[item]}
                  ?checked=${formData.feedback_type.includes(
                    FEEDBACK_TYPE[item]
                  )}></cds-checkbox>
              `;
            })}
          </cds-checkbox-group>
        </div>
        <div style="margin-block-end:0.5rem">
          <cds-textarea
            rows="4"
            value=${formData.comment}
            @input=${handleTextArea}>
            <span slot="label-text">Comments:</span>
          </cds-textarea>
        </div>
      </cds-modal-body>
      <cds-modal-footer>
        ${isUpdateMode
          ? html`
              <cds-modal-footer-button
                kind="danger"
                @click=${handleFeedbackDelete.bind(
                  customElementClass,
                  formData.feedback_id
                )}
                data-modal-close
                >Delete</cds-modal-footer-button
              >
              <cds-modal-footer-button
                kind="primary"
                @click=${handleFormData}
                ?disabled=${disableSave}
                >Update</cds-modal-footer-button
              >
            `
          : html`
              <cds-modal-footer-button kind="secondary" data-modal-close
                >Cancel</cds-modal-footer-button
              >
              <cds-modal-footer-button
                kind="primary"
                ?disabled=${disableSave}
                @click=${handleFormData}
                >Save</cds-modal-footer-button
              >
            `}
      </cds-modal-footer>
    </cds-modal>
  `;
}

/**
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function showSlug(customElementClass) {
  const { _input: input, _model_id: model } = customElementClass;
  return html`
    <cds-slug size="2xs" alignment="bottom-left">
      <div slot="body-text">
        <!-- <p class="secondary">AI Explained</p> -->
        <!-- <h1>84%</h1>
        <p class="secondary bold">Confidence score</p> -->
        <!-- <hr /> -->
        <p class="secondary">Input</p>
        <p class="bold">${input}</p>
        ${model
          ? html` <hr />
              <p class="secondary">Model type</p>
              <p class="bold">${model}</p>`
          : null}
        <hr />
        <p class="secondary">
          To provide feedback on a specific part of a paragraph, simply select
          the portion of text you want to comment on.
        </p>
      </div>
      <!-- <cds-slug-action-button>Submit</cds-slug-action-button> -->
    </cds-slug>
  `;
}

/**
 *
 * @param {FeedbackData} feedback Feedback object
 * @param {DOMRect} position Position of feedback in sentence
 * @param {object} customElementClass Class functionality for the custom element
 */
function renderIcons(feedback: FeedbackData, position, customElementClass) {
  const { handleFeedbackUpdate, highlightedText, resetHiglightedText } =
    customElementClass;
  return html`
    <span
      class="highlight blink_me"
      @mouseover=${highlightedText.bind(customElementClass, feedback)}
      @mouseout=${resetHiglightedText}
      @click=${handleFeedbackUpdate.bind(customElementClass, feedback)}
      style="position:absolute; top: ${position?.bottom -
      position?.height +
      5}px; left: ${position?.left + position?.width}px;"></span>
  `;
}

/**
 * Lit template for Feedback component
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function feedbackTemplate(customElementClass) {
  const {
    isModelOpen,
    Selection,
    feedbackList,
    textPositions,
    handleSlotchange,
    highlighted,
    calculateTextPosition,
  } = customElementClass;
  return html`
    <div
      style="display:flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;position:relative">
      <div class="slug">
        ${feedbackList.length !== 0
          ? html`<span class="notify"></span>`
          : null}${showSlug(customElementClass)}
      </div>
    </div>
    ${Selection ? openFeedbackFlag(customElementClass) : null}
    <div id="container">
      ${feedbackList.length !== 0 && textPositions.length !== 0
        ? feedbackList.map((feedback, index) =>
            renderIcons(feedback, textPositions[index], customElementClass)
          )
        : null}
      ${highlighted
        ? highlighted
        : html`<slot
            @mouseover=${calculateTextPosition}
            @slotchange=${handleSlotchange}></slot>`}
      ${isModelOpen ? openModal(customElementClass) : null}
    </div>
  `;
}
