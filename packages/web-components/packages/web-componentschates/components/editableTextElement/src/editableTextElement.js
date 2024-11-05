/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
// @ts-ignore
// @ts-ignore
import styles from "./editableTextElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class editableTextElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Preset min width from source text
     */
    this._minWidth = 123;
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_presetWidth')) {
      this.style.setProperty('--chat-editable-text-width', Math.max(this._minWidth, this._presetWidth - 30) + 'px');
    }
  }
  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    if (this.content !== null) {
      if (this._presetWidth && this._presetHeight) {
        this._presetTextAreaSize();
      } else {
        this._initiateTextAreaHeight();
      }
    }
    if (this._presetWidth) {
      this.style.setProperty('--chat-editable-text-width', Math.max(this._minWidth, this._presetWidth - 30) + 'px');
    }
  }
  /** record edited changes on message
   * @param {event} event - lit input event
   **/
  _setEditedMessage(event) {
    this._editedMessage = event.target.value;
    const messageEditedEvent = new CustomEvent('message-edited', {
      detail: {
        value: this._editedMessage
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(messageEditedEvent);
    this.updateTextAreaHeight(event);
  }
  /**
   * Set a new height based on the size of the text area
   */
  _initiateTextAreaHeight() {
    var _a;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-editable-text-area');
    if (textArea instanceof HTMLElement) {
      textArea.focus();
      setTimeout(() => {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
        this.requestUpdate();
      }, 1);
    }
  }
  /**
   * Set a new height based on the size of the text area
   */
  _presetTextAreaSize() {
    var _a;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-editable-text-area');
    if (textArea instanceof HTMLElement) {
      textArea.focus();
      textArea.style.height = this._presetHeight + 'px';
      textArea.style.height = this._presetWidth + 'px';
      this.requestUpdate();
    }
  }
  /**
   * Set a new height based on the size of the text area
   * @param {Object} event -- event object
   */
  updateTextAreaHeight(event) {
    const textArea = event.target;
    if (textArea instanceof HTMLElement) {
      setTimeout(() => {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
        this.requestUpdate();
      }, 1);
    }
  }
}
editableTextElement.styles = styles;
export default editableTextElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], editableTextElement.prototype, "content", void 0);
__decorate([state()], editableTextElement.prototype, "_editedMessage", void 0);
__decorate([property({
  type: Number,
  attribute: 'preset-width'
})], editableTextElement.prototype, "_presetWidth", void 0);
__decorate([property({
  type: Number,
  attribute: 'preset-height'
})], editableTextElement.prototype, "_presetHeight", void 0);
__decorate([property({
  type: Number,
  attribute: 'min-width'
})], editableTextElement.prototype, "_minWidth", void 0);
//# sourceMappingURL=editableTextElement.js.map
