/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import Flag24 from '@carbon/web-components/es/icons/flag/24.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/form-group/index.js';

/**
 * Lit template for Feedback Flag
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function openFeedbackFlag(customElementClass) {
  const range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
  const { _toggle: toggle, isModelOpen } = customElementClass;
  return html`
    <div
      @click=${toggle}
      class="feedback-flag"
      style="top: ${-(
        (range?.height || 0) + 8
      )}px; left: ${range?.left}px; font-weight: bold; display: ${isModelOpen
        ? 'none'
        : 'block'}">
      ${Flag24({ slot: 'icon' })}
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
    _handleTextInput: handleTextInput,
    _handleFeedback: handleFeedback,
    _handleTextArea: handleTextArea,
    _handleFormData: handleFormData,
  } = customElementClass;

  let { isModelOpen } = customElementClass;

  return html`
    <cds-modal
      id="feedback-modal"
      ?open=${isModelOpen}
      @cds-modal-closed=${() => (isModelOpen = false)}>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>Provide Feedback</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-form-group>
          <cds-text-input
            label="Selected Text:"
            value=${formData.selected_value}
            @input=${handleTextInput}>
          </cds-text-input>
        </cds-form-group>

        <cds-form-group @cds-checkbox-changed=${handleFeedback}>
          <cds-checkbox label-text="No problematic text found"></cds-checkbox>
          <cds-checkbox
            label-text="Contains HAP (e.g. hate, abusive language, profanity)"></cds-checkbox>
          <cds-checkbox
            label-text="Contains PII (e.g. SSN, VIN, personal address)"></cds-checkbox>
          <cds-checkbox
            label-text="Contains social bias (e.g. race, religion, social status, etc.)"></cds-checkbox>
          <cds-checkbox label-text="Isn’t truthful/honest"></cds-checkbox>
          <cds-checkbox
            label-text="Contains Taboo Topics (eg. religion, politics etc.)"></cds-checkbox>
          <cds-checkbox
            label-text="Other problem (please provide detail)"></cds-checkbox>
        </cds-form-group>

        <cds-form-group>
          <cds-textarea
            rows="4"
            style="padding:8px"
            value=${formData.comment}
            @input=${handleTextArea}>
            <span slot="label-text">Comments:</span>
          </cds-textarea>
        </cds-form-group>
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" data-modal-close
          >Cancel</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary" @click=${handleFormData}
          >Save</cds-modal-footer-button
        >
      </cds-modal-footer>
    </cds-modal>
  `;
}

/**
 * Lit template for Feedback component
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function feedbackTemplate(customElementClass) {
  const { isModelOpen, Selection } = customElementClass;
  return html`
    ${Selection ? openFeedbackFlag(customElementClass) : null}
    <slot></slot>
    ${isModelOpen ? openModal(customElementClass) : ''}
  `;
}
