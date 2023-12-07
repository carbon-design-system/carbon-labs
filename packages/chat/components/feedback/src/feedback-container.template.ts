/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html, css, PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/form-group/index.js';

import Flag24 from '@carbon/web-components/es/icons/flag/24';
import { FeedbackApi } from '../../../services/feedback/api';

export class FeedbackContainer extends LitElement {
  static styles = css`
    .carbon-feedback-wrapper {
      position: relative;
    }

    .feedback_dialog {
      position: absolute;
      max-width: 300px;
      border: 1px dashed lightcoral;
      background: white;
      color: black;
      padding: 16px;
    }

    #selected-text > text-area {
      background-color: red;
    }

    .bulb-icon {
      position: absolute;
    }
  `;

  @property({ attribute: 'api-key' })
  private _api_key: string = '';

  @property({ attribute: 'user' })
  private _user_id: string = '';

  @property({ attribute: 'ai-model' })
  private _model_id: string = '';

  @property({ attribute: 'input' })
  private _input: string = '';

  @property({ attribute: 'output' })
  private _output: string = '';

  @state()
  generation_id: string = '';

  @state()
  app_id?: number;

  @state()
  private isModelOpen = false;

  @state()
  private selection;

  // @state()
  // private selectedText;

  @state()
  private formData = {
    id: '',
    generation_id: '',
    start_index: 0,
    end_index: 0,
    selected_value: '',
    corrected_value: '',
    feedback: '',
    comment: '',
  };

  private feedbackApi = FeedbackApi.getInstance();
  private _feedbacks: string[] = [];

  constructor() {
    super();
    this.generation_id = uuidv4();
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (
      this._api_key &&
      this._model_id &&
      this._user_id &&
      (this._input || this._output)
    ) {
      const payload = {
        id: this.generation_id,
        api_key: this._api_key,
        model_id: this._model_id,
        user_id: this._user_id,
        input_value: this._input,
        output_value: this._output,
      };
      this.feedbackApi.recordGeneration(payload);
    }
  }

  handleTextSelection() {
    let selection = window.getSelection()!;
    this.selection = selection;
    const selectedText = selection?.toString().trim();
    // this.selectedText = selectedText;
    this.setAttribute('selected', '');

    if (selectedText) {
      const minOffset = Math.min(selection.anchorOffset, selection.focusOffset);
      const maxOffset = Math.max(selection.anchorOffset, selection.focusOffset);
      this.formData.generation_id = this.generation_id;
      this.formData.selected_value = selectedText;
      this.formData.start_index = minOffset;
      this.formData.end_index = maxOffset;
    } else {
      this.selection = null;
      this.removeAttribute('selected');
    }
  }

  bulb() {
    const range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    return html`
      <div
        @click=${this.toggle}
        class="bulb-icon"
        style="position:absolute; top: ${-(
          range?.height! + 8
        )}px; left: ${range?.left}px; font-weight: bold">
        ${Flag24({ slot: 'icon' })}
      </div>
    `;
  }

  handleTextInput(event) {
    this.formData.corrected_value = event?.target.value;
  }

  handleTextArea(event) {
    this.formData.comment = event?.target.value;
  }

  handleFeedRadio(event) {
    this.formData.feedback = event?.detail.value;
  }

  handleFormData() {
    if (!this.formData.corrected_value) {
      this.formData.corrected_value = this.formData.selected_value;
    }
    this.feedbackApi.recordFeedback(this.formData);
    // this.selectedText = '';
    this.selection = '';
    this.formData = {
      id: '',
      generation_id: '',
      start_index: 0,
      end_index: 0,
      selected_value: '',
      corrected_value: '',
      feedback: '',
      comment: '',
    };
    this.isModelOpen = false;
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (this.isModelOpen) {
      this.removeEventListener('click', this.handleTextSelection, false);
    } else {
      this.addEventListener('click', this.handleTextSelection);
    }
  }

  handleFeedback(e) {
    let feedback = e.target.labelText;
    if (!this._feedbacks.includes(feedback)) {
      this._feedbacks.push(feedback);
    } else {
      this._feedbacks = this._feedbacks.filter((item) => item != feedback);
    }
    this.formData.feedback = this._feedbacks.join(' | ');
  }

  openModal() {
    this.selection = null;
    return html`
      <cds-modal
        id="feedback-modal"
        ?open=${this.isModelOpen}
        @cds-modal-closed=${() => (this.isModelOpen = false)}>
        <cds-modal-header>
          <cds-modal-close-button></cds-modal-close-button>
          <cds-modal-heading>Provide Feedback</cds-modal-heading>
        </cds-modal-header>
        <cds-modal-body>
          <cds-form-group>
            <cds-text-input
              label="Selected Text:"
              value=${this.formData.selected_value}
              @input=${this.handleTextInput}>
            </cds-text-input>
          </cds-form-group>

          <cds-form-group @cds-checkbox-changed=${this.handleFeedback}>
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
              value=${this.formData.comment}
              @input=${this.handleTextArea}>
              <span slot="label-text">Comments:</span>
            </cds-textarea>
          </cds-form-group>
        </cds-modal-body>
        <cds-modal-footer>
          <cds-modal-footer-button kind="secondary" data-modal-close
            >Cancel</cds-modal-footer-button
          >
          <cds-modal-footer-button kind="primary" @click=${this.handleFormData}
            >Save</cds-modal-footer-button
          >
        </cds-modal-footer>
      </cds-modal>
    `;
  }

  toggle() {
    this.isModelOpen = !this.isModelOpen;
  }

  handleSlotChange() {}

  render() {
    return html`
      <div class="carbon-feedback-wrapper">
        ${this.selection ? this.bulb() : ''}
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.isModelOpen ? this.openModal() : ''}
      </div>
    `;
  }
}
