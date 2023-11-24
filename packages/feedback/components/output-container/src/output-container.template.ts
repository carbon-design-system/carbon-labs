import { state } from 'lit/decorators.js';
import { LitElement, html } from 'lit';

export class OutputContainer extends LitElement {
  @state()
  content = '';

  handleTextSelection() {
    let selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    console.log(selectedText);
    console.log(this.content);
    this.setAttribute('selected', '');
    // if (selectedText) {
    //   this.selectedText = selectedText;

    //   this.recordGeneration(fullText);
    // } else {
    //   this.removeAttribute('selected');
    // }

    // if (this.selectedText) {
    //   this.range = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    //   this.minOffset = Math.min(
    //     this.selection.anchorOffset,
    //     this.selection.focusOffset
    //   );
    //   this.maxOffset = Math.max(
    //     this.selection.anchorOffset,
    //     this.selection.focusOffset
    //   );
    //   this.offset_x = this.range?.right + 16;
    //   this.offset_y = this.selection.focusNode.parentElement.offsetTop - 18;
    // } else {
    //   // this.selection = null
    // }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('uuid-updated', this.handleUuid);
    this.addEventListener('click', this.handleTextSelection);
  }

  handleUuid(event) {
    const uuid = event.detail;
    console.log(`Received UUID in output: ${uuid}`);
  }

  get _slottedChildren() {
    const slot = this.shadowRoot?.querySelector('slot')!;
    return slot.assignedElements({ flatten: true });
  }

  handleSlotchange() {
    const text = this._slottedChildren[0].innerHTML;
    this.content = text;
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
