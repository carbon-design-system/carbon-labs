import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

export class InputContainer extends LitElement {
  @property({ type: String })
  generationId: string = '';

  constructor() {
    super();
    if (!this.generationId) {
      this.generationId = uuidv4();
    }
    this.setAttribute('generation_id', this.generationId);
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  // updated(changedProperties) {
  //   super.updated(changedProperties);
  //   this.dispatchEvent(
  //     new CustomEvent('uuid-updated', {
  //       detail: this.generationId,
  //       bubbles: true,
  //       composed: true,
  //     })
  //   );
  // }

  render() {
    return html`
      <h6 style="padding:0.5rem; margin: 0.25rem 0; background: #427D9D; color: #fff">
        User: <slot></slot>
      </h6>
    `;
  }
}
