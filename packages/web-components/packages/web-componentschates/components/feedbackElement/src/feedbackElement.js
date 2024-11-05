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
import styles from "./feedbackElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class feedbackElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * optional orientation value to show caret
     */
    this.orientation = 'top';
    /** whether to show text area
     */
    this.showTextArea = true;
    /**
     * Event listener to check if parent visibility changed
     */
    //private intersectionObserver;
    this.usePopup = true;
    this.isSelected = false;
  }
  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    var _a;
    if (this.feedbackFormValues) {
      this._setValues(this.feedbackFormValues);
    }
    if (this.isSlotted) {
      this.style.setProperty('--chat-popup-slotted-mode', 'fixed');
    }
    const container = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-popup-container');
    if (container instanceof HTMLElement) {
      container.focus();
    }
  }
  /** _handleTextInput - handle text change in submission
   * @param {event} event -  textarea change event
   */
  _handleTextInput(event) {
    const {
      value
    } = event.target;
    this._textInput = value;
  }
  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  updated(changedProperties) {
    if (changedProperties.has('isOpen')) {
      this.style.setProperty('--chat-popup-element-visibility', this.isOpen ? 'visible' : 'hidden');
    }
    if (changedProperties.has('feedbackFormValues')) {
      this._setValues(this.feedbackFormValues);
    }
  }
  /**
   * _setValues -  if preset Object is added, update all display values
   * @param {object} values - defined values
   */
  _setValues(values) {
    this.popupTitle = values.title;
    this.textAreaPlaceholder = values.responsePlaceholder;
    this.promptTitle = values.prompt;
    this.tagList = values.tags;
    this.disclaimer = values.disclaimer;
    this.requestUpdate();
  }
  /**
   * _handleSubmit - submit event when submit button click
   * @param {event} event - button click event
   */
  _handleSubmit(event) {
    const feedbackDetails = {
      formValues: this.feedbackFormValues,
      userComment: this._textInput ? this._textInput : 'no feedback given',
      parentMessageId: this.parentMessageId ? this.parentMessageId : 'unknown',
      tagSelections: this._tagSelections
    };
    const complexFeedbackSubmission = new CustomEvent('on-user-complex-feedback-request', {
      detail: feedbackDetails,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(complexFeedbackSubmission);
    this._handleClose(event);
  }
  /**
   * handleTagSelection - handle when tag list subelement sends seelction signal
   * @param {event} event -  tag click event
   */
  handleTagSelection(event) {
    const selections = event.detail.selectionList;
    this._tagSelections = selections;
  }
  /**
   * closing event when close button is selected
   * @param {event} event - clsing button event
   */
  _handleClose(event) {
    event.preventDefault();
    //this.isSelected = false;
  }
}
feedbackElement.styles = styles;
export default feedbackElement;
__decorate([property({
  type: Object,
  attribute: 'popup-elements',
  reflect: true
})], feedbackElement.prototype, "popupElements", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'is-slotted'
})], feedbackElement.prototype, "isSlotted", void 0);
__decorate([property({
  type: String,
  attribute: 'popup-title'
})], feedbackElement.prototype, "popupTitle", void 0);
__decorate([property({
  type: Object,
  attribute: 'tag-list'
})], feedbackElement.prototype, "tagList", void 0);
__decorate([property({
  type: String,
  attribute: 'disclaimer'
})], feedbackElement.prototype, "disclaimer", void 0);
__decorate([property({
  type: String,
  attribute: 'prompt-title'
})], feedbackElement.prototype, "promptTitle", void 0);
__decorate([property({
  type: String,
  attribute: 'text-area-placeholder'
})], feedbackElement.prototype, "textAreaPlaceholder", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'is-open'
})], feedbackElement.prototype, "isOpen", void 0);
__decorate([property({
  type: String,
  attribute: 'orientation',
  reflect: true
})], feedbackElement.prototype, "orientation", void 0);
__decorate([property({
  type: Object,
  attribute: 'targetElement'
})], feedbackElement.prototype, "targetElement", void 0);
__decorate([property({
  type: Object,
  attribute: 'feedbackFormValues'
})], feedbackElement.prototype, "feedbackFormValues", void 0);
__decorate([property({
  type: String,
  attribute: 'description'
})], feedbackElement.prototype, "description", void 0);
__decorate([property({
  type: String,
  attribute: 'list-title'
})], feedbackElement.prototype, "listTitle", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'show-list'
})], feedbackElement.prototype, "showList", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'show-text-area'
})], feedbackElement.prototype, "showTextArea", void 0);
__decorate([property({
  type: Object,
  attribute: 'listItems'
})], feedbackElement.prototype, "listItems", void 0);
__decorate([property({
  type: Object,
  attribute: 'model'
})], feedbackElement.prototype, "model", void 0);
__decorate([state()], feedbackElement.prototype, "_textInput", void 0);
__decorate([state()], feedbackElement.prototype, "_tagSelections", void 0);
__decorate([property({
  type: String,
  attribute: 'parent-message-id'
})], feedbackElement.prototype, "parentMessageId", void 0);
__decorate([state()], feedbackElement.prototype, "usePopup", void 0);
__decorate([state()], feedbackElement.prototype, "isSelected", void 0);
//# sourceMappingURL=feedbackElement.js.map
