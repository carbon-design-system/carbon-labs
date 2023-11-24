/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/button/index.js';

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

  @state()
  isModelOpen = false;

  @state()
  selection;

  @state()
  selectedText = '';

  @state()
  range;

  @state()
  minOffset = 0;
  @state()
  maxOffset = 0;
  @state()
  offset_x = 0;
  @state()
  offset_y = 0;

  @property({ attribute: 'api-key' })
  api_key: string = '';

  @property({ attribute: 'user' })
  user_id: string = '';

  @property({ attribute: 'ai-model' })
  model_id: string = '';

  @state()
  generation_id?: number;

  @state()
  app_id?: number;

  static properties = {
    formData: {
      feedback_content: '',
    },
  };

  constructor() {
    super();
    this.formData = {
      feedback_content: '',
      feedback_value: '',
    };
  }

  handleTextArea(event) {
    console.log(event?.target.value);
    this.formData.feedback_content = event?.target.value;
  }

  handleFeedRadio(event) {
    console.log(event?.detail.value);
    this.formData.feedback_value = event?.detail.value;
  }

  handleFormData() {
    this.recordFeedback();
    this.selectedText = '';
    this.selection = '';
    this.formData = {};
    this.isModelOpen = false;
  }

  async recordFeedback() {
    try {
      const payload = {
        generation_id: this.generation_id,
        user_id: this.user_id,
        app_id: this.app_id,
        feedback: JSON.stringify(this.formData),
      };
      const response = await fetch('http://0.0.0.0:8000/feedback', {
        // Adding method type
        method: 'POST',
        // Adding body or contents to send
        body: JSON.stringify(payload),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      let resp = await response.json();
      console.log(resp);
    } catch (e) {
      console.log(e);
    }
  }

  async recordGeneration(data) {
    try {
      const payload = {
        user_id: this.user_id,
        api_key: this.api_key,
        model_id: this.model_id,
        input_value: data,
        output_value: data,
      };
      const response = await fetch('http://0.0.0.0:8000/generated_content', {
        // Adding method type
        method: 'POST',
        // Adding body or contents to send
        body: JSON.stringify(payload),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      let resp = await response.json();
      this.generation_id = resp.id;
      this.app_id = resp.app_id;
      console.log('generation_id', this.generation_id);
      console.log('app_id', this.app_id);
    } catch (e) {
      console.log(e);
    }
  }

  handleTextSelection() {
    this.selection = window.getSelection();
    const fullText = this.selection?.focusNode?.textContent;
    const selectedText = this.selection?.toString().trim();

    if (selectedText) {
      this.selectedText = selectedText;
      this.setAttribute('selected', '');
      this.recordGeneration(fullText);
    } else {
      this.removeAttribute('selected');
    }

    if (this.selectedText) {
      this.range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
      this.minOffset = Math.min(
        this.selection.anchorOffset,
        this.selection.focusOffset
      );
      this.maxOffset = Math.max(
        this.selection.anchorOffset,
        this.selection.focusOffset
      );
      this.offset_x = this.range?.right + 16;
      this.offset_y = this.selection.focusNode.parentElement.offsetTop - 18;
    } else {
      // this.selection = null
    }
  }
  // connectedCallback(): void {
  //   super.connectedCallback();
  //   this.addEventListener('click', this.handleTextSelection);
  //   // document.body.addEventListener('click', this.handleBodyClick.bind(this))
  //   // document.onclick = e => this.selection = null
  //   console.log('Connected');
  // }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  //   // window.removeEventListener('keydown', this._handleKeydown);
  //   console.log('Disconnected');
  // }

  openModal() {
    this.formData.feedback_content = this.selectedText;
    return html`
      <div
        class="feedback_dialog"
        style="top: ${-16}px; left: ${this.range?.left}px">
        <cds-textarea
          rows="2"
          value=${this.formData.feedback_content}
          id="selected-text"
          @input=${this.handleTextArea}>
          <span slot="label-text">Selected Text:</span>
        </cds-textarea>

        <cds-radio-button-group
          label-position="right"
          orientation="vertical"
          name="radio-group"
          @cds-radio-button-group-changed=${this.handleFeedRadio}
          defaultSelected="harmful">
          <cds-radio-button
            value="harmful"
            label-text="Harmful"></cds-radio-button>
          <cds-radio-button
            value="not_harmful"
            label-text="Not harmful"></cds-radio-button>
          <cds-radio-button
            value="something_else"
            label-text="Something else"></cds-radio-button>
        </cds-radio-button-group>
        <cds-button
          @click=${this.handleFormData}
          size="sm"
          style="padding-top:8px"
          buttonClassName="save-btn">
          Save
        </cds-button>
      </div>
    `;
  }

  bulb() {
    return html`
      <div
        @click=${this.toggle}
        class="bulb-icon"
        style="top: ${-32}px; left: ${this.range?.left}px">
        <svg
          height="24px"
          width="24px"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          enable-background="new 0 0 512 512"
          fill="#000000">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <g>
              <g fill="#e1df93">
                <path
                  d="m346.1,45.3c-28.7-25.6-67.3-37.8-105.9-33.5-60.7,6.9-110.4,55.7-118.4,116.2-4.7,35.9 4.5,71.4 26.2,99.8 57,74.9 49.5,150.2 49.5,150.2 0,5.8 4.7,10.4 10.4,10.4h96.1c5.8,0 10.4-4.7 10.4-10.4 0,0-9.5-68.7 46.9-146.9 18-25 30-52 30-84.9 5.68434e-14-38.4-16.5-75.2-45.2-100.9zm-1,172.8c-32.1,39.8-50.3,91.2-51.5,148.1h-27.2v-166.4c0-5.8-4.7-10.4-10.4-10.4s-10.4,4.7-10.4,10.4v166.4h-27.2c0-52.3-18.6-104.5-53.7-150.9-18.2-24.1-26.1-54.1-22.1-84.5 6.7-51.1 48.8-92.4 100-98.2 33.2-3.7 65,6.3 89.6,28.3 24.3,21.7 38.3,52.8 38.3,85.4-5.68434e-14,26.5-8.8,51.3-25.4,71.8z"></path>
                <path
                  d="m340.1,416.8h-168.2c-5.8,0-10.4,4.7-10.4,10.4 0,5.8 4.7,10.4 10.4,10.4h11c5.1,35.8 35.9,63.4 73,63.4s68-27.6 73-63.4h11c5.8,0 10.4-4.7 10.4-10.4 0.2-5.8-4.5-10.4-10.2-10.4zm-84.1,63.3c-25.6,0-47.1-18.3-51.9-42.5h103.9c-4.9,24.2-26.4,42.5-52,42.5z"></path>
              </g>
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  toggle() {
    this.isModelOpen = !this.isModelOpen;
  }

  render() {
    return html`
      <div class="carbon-feedback-wrapper">
        ${this.selection ? this.bulb() : ''}
        <slot></slot>
        ${this.isModelOpen ? this.openModal() : ''}
      </div>
    `;
  }
}
