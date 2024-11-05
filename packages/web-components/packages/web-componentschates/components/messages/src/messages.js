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
import styles from "./messages.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class messages extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * computed message object
     */
    this._computedMessages = [];
    /**
     * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
     */
    this._queryInProgress = false;
    /**
     * check if scrolled to bottom
     */
    this._autoScroll = false;
    /**
     * limit autoscroll when new message arrives
     */
    this._limitScroll = true;
    /**
     * check if initial render
     */
    this._firstRender = true;
  }
  /**
   * detect when component is rendered to process rawtext
   */
  firstUpdated() {
    var _a;
    this.scrollDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-messages-container');
  }
  /**
   * _handlescroll - wheele event to trigger/cancel auto-scroll
   */
  _handleScroll() {
    const atBottom = this.scrollDiv.scrollTop + this.scrollDiv.clientHeight >= this.scrollDiv.scrollHeight - 50;
    this._limitScroll = false;
    if (atBottom) {
      this._autoScroll = true;
    } else {
      this._autoScroll = false;
    }
  }
  /** shouldUpdate - internal LIT function to predetect updates
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  shouldUpdate(changedProperties) {
    var _a;
    if (changedProperties.has('messages')) {
      const newHeight = (_a = this.scrollDiv) === null || _a === void 0 ? void 0 : _a.scrollHeight;
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage) {
        if (lastMessage.userSubmitted) {
          this._previousScrollHeight = newHeight - 36;
        } else {
          this._previousScrollHeight = newHeight - 36;
        }
      }
    }
    return true;
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('messages')) {
      /*if (this._computedMessages.length !== this.messages.length) {
        console.log('diff');
      }*/
      this._computedMessages = [...this.messages];
    }
    if (changedProperties.has('_computedMessages')) {
      this._scrollMessage();
    }
    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
      this._autoScroll = true;
      this._updateScroll();
    }
    if (changedProperties.has('_streamResponses')) {
      this._queryInProgress = this.loading;
    }
  }
  /**
   * handleSlotChange - handle edits to slots when an element is placed in it
   * @param {event} event - tag click event sent by tagList element
   */
  _handleSlotchange(event) {
    event.preventDefault();
    const messageSlotUpdateEvent = new CustomEvent('on-messages-slot-update', {
      detail: {
        action: 'Messages slot had updated'
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(messageSlotUpdateEvent);
    if (this._autoScroll) {
      this._updateScroll();
    }
  }
  /**
   * handleInternalChange - handle event when children update
   */
  _handleInternalChange() {
    if (this._autoScroll) {
      this._updateScroll();
    }
  }
  /**
   * handle updating of inner messages object when parent updates
   */
  computeMessages() {
    this._computedMessages = [...this.messages];
  }
  /**
   * _scrollMessage - move message down post render
   */
  _scrollMessage() {
    //const newHeight = this.scrollDiv?.scrollHeight;
    //this._previousScrollHeight = newHeight;
    this._autoScroll = true;
    this._limitScroll = true;
    this._updateScroll();
  }
  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    if (this.scrollDiv instanceof HTMLElement) {
      if (!this.scrollTimeout) {
        this.scrollTimeout = setTimeout(() => {
          var _a, _b;
          if (this._autoScroll) {
            let scrollTarget = (_a = this.scrollDiv) === null || _a === void 0 ? void 0 : _a.scrollHeight;
            if (this._limitScroll) {
              scrollTarget = this._previousScrollHeight;
            }
            (_b = this.scrollDiv) === null || _b === void 0 ? void 0 : _b.scrollTo({
              top: scrollTarget,
              behavior: 'smooth'
            });
          }
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = null;
        }, 200);
      }
    }
  }
}
messages.styles = styles;
export default messages;
__decorate([property({
  type: Object,
  attribute: 'messages'
})], messages.prototype, "messages", void 0);
__decorate([state()], messages.prototype, "_computedMessages", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'loading',
  reflect: true
})], messages.prototype, "loading", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'stream-responses',
  reflect: true
})], messages.prototype, "_streamResponses", void 0);
__decorate([property({
  type: Number,
  attribute: 'stream-delay'
})], messages.prototype, "_streamDelay", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'docking-enabled'
})], messages.prototype, "_dockingEnabled", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'user-interrupted-streaming'
})], messages.prototype, "userInterruptedStreaming", void 0);
__decorate([state()], messages.prototype, "_queryInProgress", void 0);
__decorate([property({
  type: String,
  attribute: 'user-name'
})], messages.prototype, "userName", void 0);
__decorate([property({
  type: String,
  attribute: 'agent-name'
})], messages.prototype, "agentName", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-feedback-form'
})], messages.prototype, "enableFeedbackForm", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-text-feedback-form'
})], messages.prototype, "enableTextFeedbackForm", void 0);
__decorate([property({
  type: Object,
  attribute: 'feedbackFormDefinitions'
})], messages.prototype, "feedbackFormDefinitions", void 0);
__decorate([state()], messages.prototype, "_parentTheme", void 0);
__decorate([state()], messages.prototype, "_autoScroll", void 0);
__decorate([state()], messages.prototype, "_limitScroll", void 0);
__decorate([state()], messages.prototype, "_previousScrollHeight", void 0);
__decorate([state()], messages.prototype, "_firstRender", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], messages.prototype, "customLabels", void 0);
//# sourceMappingURL=messages.js.map
