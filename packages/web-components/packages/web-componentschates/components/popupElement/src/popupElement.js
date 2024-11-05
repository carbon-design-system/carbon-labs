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
import styles from "./popupElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class popupElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * top level title for section
     */
    this.popupTitle = 'placeholder title';
    /**
     * legal disclaimer text
     */
    this.disclaimer = 'placeholder disclaimer';
    /**
     * question asked of user to give feedback
     */
    this.promptTitle = 'placeholder prompt';
    /**
     * internal saved text values for feedback
     */
    this._textInput = '';
    /**
     * internal tag seelction list
     */
    this._tagSelections = {};
    /**
     * check if submission is valid
     */
    this.invalidEntry = true;
    /**
     * enable data =collection checkbox area
     */
    this.enableDataCollectionCheck = false;
    /**
     * _renderLabel - render default or custom label
     * @param {string} key - dictionary key for label
     */
    this._renderLabel = key => {
      let customValue;
      const labels = this.customLabels || {};
      if (labels) {
        switch (key) {
          case 'feedback-submit-button':
            customValue = labels[key] || 'Submit';
            break;
          case 'feedback-submit-button-unavailable':
            customValue = labels[key] || 'Submit';
            break;
          case 'feedback-close':
            customValue = labels[key] || 'Close';
            break;
        }
      }
      return customValue || key;
    };
  }
  /**
   * Event listener to check if parent visibility changed
   */
  //private intersectionObserver;
  /**
   * Event listener to check if parent visibility changed
   */
  //private resizeObserver;
  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    var _a;
    this.style.setProperty('--chat-popup-element-inline-position', this.inlinePosition);
    this.style.setProperty('--chat-popup-element-block-position', this.blockPosition);
    if (this.feedbackFormValues) {
      this._setValues(this.feedbackFormValues);
    }
    if (this.type === 'thumbs-up') {
      const offset = this.compactMode ? -8 : -2;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
    if (this.type === 'thumbs-down') {
      const offset = this.compactMode ? 46 : 34;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
    if (this.isSlotted) {
      this.style.setProperty('--chat-popup-slotted-mode', 'fixed');
    }
    const container = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-popup-container');
    if (container instanceof HTMLElement) {
      container.focus();
    }
    this._setPosition();
    //this.addEventListener('on-messages-scrolled', this._handleScrollChange)
    /*this.resizeObserver = new ResizeObserver(()=>{
      this.setPosition();
    })
    this.resizeObserver.observe(this.targetElement);*/
    /*this.intersectionObserver = new IntersectionObserver((entries)=>{
      entries.forEach((entry) =>{
        if(!entry.isIntersecting){
          //this.refitPosition();
          console.log("inter")
        }
      })
    })
    this.intersectionObserver.observe(this);*/
  }
  /** handle when users escapes
   * @param {event} event - key event on popup
   */
  _handleEscape(event) {
    if (event.key === 'Escape') {
      this._handleClose(event);
    }
  }
  /** handle when users escapes
   * @param {event} event - key event on popup
   */
  _handleEscapeB(event) {
    if (event.key === 'Tab') {
      this._handleClose(event);
    }
  }
  /**
   * setPosition -  place popup according to client positioning of target element
   */
  setPosition() {
    var _a;
    if (this.targetElement instanceof HTMLElement) {
      const targetBounds = this.targetElement.getBoundingClientRect();
      const popupBounds = this.getBoundingClientRect();
      const parentBounds = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
      if (targetBounds && popupBounds && parentBounds) {
        let offsetLeft = targetBounds.left - parentBounds.left;
        let offsetTop = targetBounds.bottom - parentBounds.top;
        if (targetBounds.left + popupBounds.width > parentBounds.width) {
          offsetLeft = parentBounds.width - popupBounds.width - 10;
        }
        if (offsetTop + popupBounds.height > parentBounds.height) {
          offsetTop = targetBounds.top - parentBounds.top - popupBounds.height;
        }
        this.inlinePosition = offsetLeft;
        this.blockPosition = offsetTop;
      }
    }
  }
  /**
   * refitPosition - animate/move popup according to client events and target element
   */
  refitPosition() {
    var _a;
    if (this.parentElement instanceof HTMLElement) {
      const popupBounds = this.getBoundingClientRect();
      const parentBounds = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
      const offsetLeft = parentBounds.width - popupBounds.width - 10;
      const offsetTop = parentBounds.height - parentBounds.height - 10;
      if (popupBounds.right > parentBounds.right) {
        this.inlinePosition = offsetLeft;
      } else if (popupBounds.left < parentBounds.left) {
        this.inlinePosition = 10;
      }
      if (popupBounds.bottom > parentBounds.bottom) {
        this.blockPosition = offsetTop;
      } else if (popupBounds.top < parentBounds.top) {
        this.blockPosition = 10;
      }
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
    this._checkValidity();
  }
  /** _checkValidity
   */
  _checkValidity() {
    const selectionLength = Object.keys(this._tagSelections).length;
    let invalidSubmit = false;
    if (!this._textInput && selectionLength <= 0) {
      invalidSubmit = true;
    }
    if (this.enableDataCollectionCheck && !this.collectionAgreement) {
      invalidSubmit = true;
    }
    this.invalidEntry = invalidSubmit;
  }
  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  async updated(changedProperties) {
    if (changedProperties.has('inlinePosition')) {
      this.style.setProperty('--chat-popup-element-inline-position', this.inlinePosition + 'px');
    }
    if (changedProperties.has('blockPosition')) {
      this.style.setProperty('--chat-popup-element-block-position', this.blockPosition + 'px');
    }
    if (changedProperties.has('isOpen')) {
      this.style.setProperty('--chat-popup-element-visibility', this.isOpen ? 'visible' : 'hidden');
    }
    if (changedProperties.has('feedbackFormValues')) {
      this._setValues(this.feedbackFormValues);
      await this.updateComplete;
      this._setPosition();
    }
    if (this.type === 'thumbs-up') {
      const offset = this.compactMode ? 12 : -2;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
    if (this.type === 'thumbs-down') {
      const offset = this.compactMode ? 48 : 34;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
  }
  /**
   * _handleCheckBoxChange - see if checkbox modifed
   * @param {event} _event - checbox event
   */
  _handleCheckBoxChange(_event) {
    var _a;
    if ((_a = _event === null || _event === void 0 ? void 0 : _event.detail) === null || _a === void 0 ? void 0 : _a.checked) {
      this.collectionAgreement = true;
    } else {
      this.collectionAgreement = false;
    }
    this._checkValidity();
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
    this.description = values.description;
    this.listTitle = values.listTitle;
    this.listItems = values.listItems;
    this.disableTextArea = values.disableTextArea;
    this.radioButtons = values.radioButtons;
    this.radioTitle = values.radioTitle;
    this.model = values.model;
    this.enableDataCollectionCheck = values.enableDataCollectionCheck;
    this.dataCollectionTitle = values.dataCollectionTitle;
    this.requestUpdate();
  }
  /**
   * _setPosition - place div next to target
   */
  _setPosition() {
    this.style.setProperty('--chat-popup-element-visibility', 'hidden');
    setTimeout(() => {
      var _a, _b, _c, _d;
      this.style.setProperty('--chat-popup-element-visibility', 'visible');
      const offsetTop = (_b = (_a = this.feedbackFormValues) === null || _a === void 0 ? void 0 : _a.parentValues) === null || _b === void 0 ? void 0 : _b.offsetTop;
      const feedbackHeight = this.scrollHeight;
      const parentHeight = ((_d = (_c = this.feedbackFormValues) === null || _c === void 0 ? void 0 : _c.parentValues) === null || _d === void 0 ? void 0 : _d.scrollHeight) || 0;
      let horizontalPosition = 54;
      let verticalPosition = 60;
      let orientation = 'top';
      if (parentHeight - feedbackHeight > offsetTop || feedbackHeight > offsetTop) {
        verticalPosition = -feedbackHeight;
        orientation = 'bottom';
      }
      if (this.compactMode) {
        horizontalPosition = 0;
      }
      this.inlinePosition = horizontalPosition;
      this.blockPosition = verticalPosition;
      this.orientation = orientation;
    }, 100);
  }
  /**
   * _handleSubmit - submit event when submit button click
   * @param {event} event - button click event
   */
  _handleSubmit() {
    const feedbackDetails = {
      type: this.type ? this.type : 'unknown',
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
    this.style.setProperty('--chat-popup-element-visibility', 'hidden');
    const closePopupEvent = new CustomEvent('on-feedback-popup-closed', {
      detail: {
        action: 'Closed Feedback Popup after valid submit',
        success: true
      },
      bubbles: true,
      composed: true
    });
    if (this.targetElement instanceof HTMLElement || this.targetElement instanceof SVGElement) {
      this.targetElement.focus();
    }
    this.dispatchEvent(closePopupEvent);
  }
  /**
   * handleTagSelection - handle when tag list subelement sends seelction signal
   * @param {event} event -  tag click event
   */
  handleTagSelection(event) {
    const selections = event.detail.selectionList;
    this._tagSelections = selections;
    this._checkValidity();
  }
  /**
   * closing event when close button is selected
   * @param {event} event - clsing button event
   */
  _handleClose(event) {
    event.preventDefault();
    this.style.setProperty('--chat-popup-element-visibility', 'hidden');
    const closePopupEvent = new CustomEvent('on-feedback-popup-closed', {
      detail: {
        action: 'Closed Feedback Popup',
        success: false
      },
      bubbles: true,
      composed: true
    });
    if (this.targetElement instanceof HTMLElement || this.targetElement instanceof SVGElement) {
      this.targetElement.focus();
    }
    this.dispatchEvent(closePopupEvent);
    this.requestUpdate();
  }
}
popupElement.styles = styles;
export default popupElement;
__decorate([property({
  type: Object,
  attribute: 'popup-elements',
  reflect: true
})], popupElement.prototype, "popupElements", void 0);
__decorate([property({
  type: Object,
  attribute: 'inline-position'
})], popupElement.prototype, "inlinePosition", void 0);
__decorate([property({
  type: Object,
  attribute: 'block-position'
})], popupElement.prototype, "blockPosition", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'is-slotted'
})], popupElement.prototype, "isSlotted", void 0);
__decorate([property({
  type: String,
  attribute: 'popup-title'
})], popupElement.prototype, "popupTitle", void 0);
__decorate([property({
  type: Object,
  attribute: 'tag-list'
})], popupElement.prototype, "tagList", void 0);
__decorate([property({
  type: String,
  attribute: 'disclaimer'
})], popupElement.prototype, "disclaimer", void 0);
__decorate([property({
  type: String,
  attribute: 'prompt-title'
})], popupElement.prototype, "promptTitle", void 0);
__decorate([property({
  type: String,
  attribute: 'text-area-placeholder'
})], popupElement.prototype, "textAreaPlaceholder", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'is-open'
})], popupElement.prototype, "isOpen", void 0);
__decorate([property({
  type: String,
  attribute: 'orientation',
  reflect: true
})], popupElement.prototype, "orientation", void 0);
__decorate([property({
  type: Object,
  attribute: 'targetElement'
})], popupElement.prototype, "targetElement", void 0);
__decorate([property({
  type: Object,
  attribute: 'radioButtons'
})], popupElement.prototype, "radioButtons", void 0);
__decorate([property({
  type: String,
  attribute: 'radio-title'
})], popupElement.prototype, "radioTitle", void 0);
__decorate([property({
  type: Object,
  attribute: 'feedbackFormValues'
})], popupElement.prototype, "feedbackFormValues", void 0);
__decorate([property({
  type: String,
  attribute: 'description'
})], popupElement.prototype, "description", void 0);
__decorate([property({
  type: String,
  attribute: 'list-title'
})], popupElement.prototype, "listTitle", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'show-list'
})], popupElement.prototype, "showList", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-text-area'
})], popupElement.prototype, "disableTextArea", void 0);
__decorate([property({
  type: Object,
  attribute: 'listItems'
})], popupElement.prototype, "listItems", void 0);
__decorate([property({
  type: Object,
  attribute: 'model'
})], popupElement.prototype, "model", void 0);
__decorate([state()], popupElement.prototype, "_textInput", void 0);
__decorate([state()], popupElement.prototype, "_tagSelections", void 0);
__decorate([property({
  type: String,
  attribute: 'type'
})], popupElement.prototype, "type", void 0);
__decorate([property({
  type: String,
  attribute: 'parent-message-id'
})], popupElement.prototype, "parentMessageId", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'compact-mode'
})], popupElement.prototype, "compactMode", void 0);
__decorate([state()], popupElement.prototype, "invalidEntry", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], popupElement.prototype, "customLabels", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-data-collection-check'
})], popupElement.prototype, "enableDataCollectionCheck", void 0);
__decorate([property({
  type: String,
  attribute: 'data-collection-title'
})], popupElement.prototype, "dataCollectionTitle", void 0);
__decorate([state()], popupElement.prototype, "collectionAgreement", void 0);
//# sourceMappingURL=popupElement.js.map
