import { property, state } from 'lit/decorators.js';
import { LitElement, html } from 'lit';
import { FeedbackContainer } from '../../feedback-container/src/feedback-container.template';
import { InputContainer } from '../../input-container/src/input-container.template';
import { FeedbackApi } from '../../../services/api';
import Flag16 from '@carbon/web-components/es/icons/flag/24';
import { v4 as uuidv4 } from 'uuid';
export class OutputContainer extends LitElement {
  @property()
  content = '';

  @property({ type: String })
  generationId = '';

  @state()
  isModelOpen = false;

  @state()
  private selection;

  @state()
  private selectedText;

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

  feedbackApi = FeedbackApi.getInstance();

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleTextSelection);
  }

  shouldUpdate(changedProperties) {
    super.shouldUpdate(changedProperties);
    const previousInputContainer = this
      .previousElementSibling as InputContainer;

    this.generationId = previousInputContainer?.generationId;
    if (this.generationId) {
      this.setAttribute('generation-id', this.generationId);
    } else {
      this.generationId = uuidv4();
      this.setAttribute('generation-id', this.generationId);
    }
    return true;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    const feedbackContainer = this.parentElement as FeedbackContainer;
    if (
      feedbackContainer &&
      feedbackContainer.api_key &&
      feedbackContainer.model_id &&
      feedbackContainer.user_id &&
      this.content &&
      changedProperties.has('content')
    ) {
      const payload = {
        id: this.generationId,
        api_key: feedbackContainer.api_key,
        model_id: feedbackContainer.model_id,
        user_id: feedbackContainer.user_id,
        output_value: this.content,
      };
      this.feedbackApi.recordGeneration(payload);
    }
  }

  get _slottedChildren() {
    const slot = this.shadowRoot?.querySelector('slot')!;
    return slot.assignedElements({ flatten: true });
  }

  handleTextSelection() {
    console.log('Output: ', this.generationId);
    let selection = window.getSelection()!;
    this.selection = selection;
    const selectedText = selection?.toString().trim();
    this.selectedText = selectedText;
    this.setAttribute('selected', '');

    if (selectedText) {
      const minOffset = Math.min(selection.anchorOffset, selection.focusOffset);
      const maxOffset = Math.max(selection.anchorOffset, selection.focusOffset);
      this.formData.generation_id = this.generationId;
      this.formData.selected_value = selectedText;
      this.formData.start_index = minOffset;
      this.formData.end_index = maxOffset;
    } else {
      this.selection = null;
      this.removeAttribute('selected');
    }
  }

  handleSlotchange() {
    // const text = this._slottedChildren[0]?.innerHTML;
    // this.content = text;

    const slot = this.shadowRoot?.querySelector('slot')!;
    const assignNodes = slot.assignedNodes();
    assignNodes.forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.textContent?.trim() !== ''
      ) {
        const text = node.textContent?.trim();
        this.content = text!;
      } else if (node.textContent?.trim() !== '') {
        this.content = node.textContent?.trim()!;
      }
    });
  }

  bulb() {
    const range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    return html`
      <div
        @click=${this.toggle}
        class="bulb-icon"
        style="position:absolute; top: ${-(
          range?.height! + 16
        )}px; left: ${range?.left}px; font-weight: bold">
        ${Flag16({ slot: 'icon' })}
      </div>
    `;
  }

  handleTextArea(event) {
    this.formData.corrected_value = event?.target.value;
  }

  handleFeedRadio(event) {
    this.formData.feedback = event?.detail.value;
  }

  handleFormData() {
    if (!this.formData.corrected_value) {
      this.formData.corrected_value = this.formData.selected_value;
    }
    this.feedbackApi.recordFeedback(this.formData);
    this.selectedText = '';
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

  openModal() {
    const range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    return html`
      <div
        class="feedback_dialog"
        style="top: ${-range?.top!}px; left: ${range?.left}px">
        <cds-textarea
          rows="2"
          value=${this.formData.selected_value}
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

  toggle() {
    this.isModelOpen = !this.isModelOpen;
  }

  render() {
    return html`
      <div
        style="padding:0.5rem; margin: 0.25rem 0; background: #DDF2FD; color:#000;">
        <h5 style="padding: 0; margin:0">Bot:</h5>
        <div style=" position: relative;">
          ${this.selection ? this.bulb() : ''}
          <slot @slotchange=${this.handleSlotchange}></slot>
          ${this.isModelOpen ? this.openModal() : ''}
        </div>
      </div>
    `;
  }
}
