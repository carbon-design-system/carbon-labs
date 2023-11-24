import { property } from 'lit/decorators.js';
import { LitElement, html } from 'lit';
import { FeedbackContainer } from '../../feedback-container/src/feedback-container.template';
import { InputContainer } from '../../input-container/src/input-container.template';
import { FeedbackApi } from '../../../services/api';

export class OutputContainer extends LitElement {
  @property()
  content = '';

  @property({type: String})
  generationId = '';

  feedbackApi = FeedbackApi.getInstance()

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleTextSelection);
  }

  shouldUpdate(changedProperties) {
    super.shouldUpdate(changedProperties);
    const previousInputContainer = this.previousElementSibling as InputContainer;

    this.generationId = previousInputContainer?.generationId;
    if (this.generationId) {
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
      this.content
    ) {
      const payload = {
        id: this.generationId,
        api_key: feedbackContainer.api_key,
        model_id: feedbackContainer.model_id,
        user_id: feedbackContainer.user_id,
        output_value: this.content,
      };
      this.feedbackApi.recordGeneration(payload)
    }
  }

  get _slottedChildren() {
    const slot = this.shadowRoot?.querySelector('slot')!;
    return slot.assignedElements({ flatten: true });
  }

  handleTextSelection() {
    console.log('Output: ', this.generationId);
    let selection = window.getSelection()!;
    const selectedText = selection?.toString().trim();
    this.setAttribute('selected', '');
    // if (selectedText) {
    //   this.selectedText = selectedText;

    //   this.recordGeneration(fullText);
    // } else {
    //   this.removeAttribute('selected');
    // }

    if (selectedText) {
      const range = window
        .getSelection()
        ?.getRangeAt(0)
        .getBoundingClientRect();
      const minOffset = Math.min(selection.anchorOffset, selection.focusOffset);
      const maxOffset = Math.max(selection.anchorOffset, selection.focusOffset);
    } else {
      // this.selection = null
    }
  }

  handleSlotchange() {
    // const text = this._slottedChildren[0]?.innerHTML;
    // this.content = text;

    const slot = this.shadowRoot?.querySelector('slot')!;
    const assignNodes = slot.assignedNodes()
    assignNodes.forEach(node=>{
      if(node.nodeType === Node.ELEMENT_NODE && node.textContent?.trim() !== ''){
        const text = node.textContent?.trim();
        this.content = text!
      }else if(node.textContent?.trim()!==''){
        this.content = node.textContent?.trim()!
      }
    })
  }

  render() {
    return html`
      <h5
        style="padding:0.5rem; margin: 0.25rem 0; background: #DDF2FD; color:#000">
        Bot: <slot @slotchange=${this.handleSlotchange}></slot>
      </h5>
    `;
  }
}
