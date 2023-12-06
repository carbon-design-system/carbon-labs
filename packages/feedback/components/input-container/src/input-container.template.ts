import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { FeedbackContainer } from '../../feedback-container/src/feedback-container.template';
import { FeedbackApi } from '../../../services/api';

export class InputContainer extends LitElement {
  @property({ type: String })
  generationId: string = '';

  @property({ type: String })
  content: string = '';

  feedbackApi = FeedbackApi.getInstance();

  constructor() {
    super();
    if (!this.generationId) {
      this.generationId = uuidv4();
    }
    this.setAttribute('generation_id', this.generationId);
  }

  get _slottedChildren() {
    const slot = this.shadowRoot?.querySelector('slot')!;
    return slot.assignedElements({ flatten: true });
  }

  handleSlotchange() {
    // const text = this._slottedChildren[0].innerHTML;
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

  updated(changedProperties) {
    super.updated(changedProperties);
    const feedbackContainer = this.parentElement as FeedbackContainer;
    if (
      feedbackContainer &&
      feedbackContainer.api_key &&
      feedbackContainer.model_id &&
      feedbackContainer.user_id &&
      this.content
    ) {
      const payload = {
        id: this.generationId,
        api_key: feedbackContainer.api_key,
        model_id: feedbackContainer.model_id,
        user_id: feedbackContainer.user_id,
        input_value: this.content,
      };

      this.feedbackApi.recordGeneration(payload);
      //  feedbackContainer.recordGeneration(payload)
    }
  }

  render() {
    return html`
      <h6
        style="padding:0.5rem; margin: 0.25rem 0; background: #427D9D; color: #fff">
        User: <slot @slotchange=${this.handleSlotchange}></slot>
      </h6>
    `;
  }
}
