/**
 * @license
 *
 * Copyright IBM Corp. 2024
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
import { state, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
// @ts-ignore
// @ts-ignore
import styles from "./footer.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class footer extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * force disable input because of internal error state
     */
    this._forceDisableInput = false;
    /**
     * string variable edited by textInput, auto-updates at every keystroke and is sent to the api url on 'enter' or 'send' button click
     */
    this._messageText = '';
    /**
     * boolean denoting if recording is in progress
     */
    this._isListening = false;
    /**
     * boolean denoting if voiceAPI capabilities are available in browser, otherwise disable icon
     */
    this._voiceAPIAvailable = true;
    /**
     * see if text area is currently focused or not
     */
    this._isPromptFocused = false;
    /**
     * triggered when close icon is selected
     */
    this.hideContextMessage = false;
    /**
     * speechRecognition object to interface with text input
     */
    this._speechRecognition = null;
    /**
     * notification counter to display
     */
    this.notificationCount = '0';
    /**
     * trigger notification display
     */
    this.showNotification = false;
    /**
     * _renderLabel - render default or custom label
     * @param {string} key - value to lookup
     */
    this._renderLabel = key => {
      let customValue;
      const labels = this.customLabels || {};
      if (labels) {
        switch (key) {
          case 'prompt-start-listening':
            customValue = labels[key] || 'Start listening';
            break;
          case 'prompt-stop-listening':
            customValue = labels[key] || 'Stop listening';
            break;
          case 'prompt-microphone-unavailable':
            customValue = labels[key] || 'Microphone unavailable';
            break;
          case 'prompt-loading-state-placeholder':
            customValue = labels[key] || 'Thinking...';
            break;
          case 'prompt-entry-placeholder':
            customValue = labels[key] || 'Type something...';
            break;
          case 'prompt-send-button':
            customValue = labels[key] || 'Send response';
            break;
          case 'prompt-send-blocked-button':
            customValue = labels[key] || 'Send unavailable';
            break;
          case 'prompt-cancel-button':
            customValue = labels[key] || 'Cancel request';
            break;
          case 'prompt-close-warning':
            customValue = labels[key] || 'Close';
            break;
          case 'complex-feedback-notification-title':
            customValue = labels[key] || 'Feedback sent';
            break;
          case 'complex-feedback-notification-subtitle':
            customValue = labels[key] || 'Thank you, we value your input';
            break;
          case 'complex-feedback-notification-close-label':
            customValue = labels[key] || 'Close';
            break;
        }
      }
      return customValue || key;
    };
  }
  /**
   * LIT firstUpdated cycle to define initial parameters on first render
   */
  firstUpdated() {
    this._checkSize();
    this._resizeObserver = new ResizeObserver(async () => {
      this._checkSize();
    });
    this._resizeObserver.observe(this.parentElement);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this._speechRecognition = new SpeechRecognition();
      this._speechRecognition.continuous = true;
      this._speechRecognition.interimResults = true;
      /**
       * handles the result event from speech recognition
       * @param {event} event - object containing speech result
       */
      this._speechRecognition.onresult = event => {
        this._handleVoiceInput(event);
      };
      /**
       * handles the end event from speechrecognition
       */
      this._speechRecognition.onend = () => {
        this._handleVoiceInputEnd();
      };
    } else {
      this._voiceAPIAvailable = false;
    }
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_messageText')) {
      this.updateTextAreaHeight();
      if (this._characterLimit) {
        this._checkLimit();
      }
    }
    if (changedProperties.has('_fullscreenMode')) {
      this._checkSize();
    }
    if (changedProperties.has('_presetEntry')) {
      this._messageText = this._presetEntry;
    }
    if (changedProperties.has('notificationCount')) {
      if (this.notificationCount !== '0') {
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 1250);
      }
    }
  }
  /** _checkLimit - show warning message if character limit is exceeded
   */
  _checkLimit() {
    const limit = this._characterLimit || Number.MAX_SAFE_INTEGER;
    if (this._messageText.length > limit) {
      this._contextMessage = '(' + this._messageText.length + '/' + limit.toString() + ') Character limit exceeded';
      this._contextMessageType = 'error';
      this._forceDisableInput = true;
    } else {
      this._contextMessage = null;
      this._contextMessageType = null;
      this._forceDisableInput = false;
    }
  }
  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscapeB(event) {
    const blockedSendTest = this._messageText === '' || this._forceDisableInput;
    if (event.key === 'Tab' && blockedSendTest && !event.shiftKey && this._fullscreenMode) {
      event.preventDefault();
      const lastKeyEvent = new CustomEvent('on-footer-escape', {
        detail: {
          action: 'FOOTER: user tabbed beyond chat',
          originalEvent: event
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(lastKeyEvent);
    }
  }
  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscapeC(event) {
    const blockedSendTest = this._messageText === '' || this._forceDisableInput;
    if (event.key === 'Tab' && blockedSendTest && !event.shiftKey && !this._voiceAPIAvailable && this._fullscreenMode) {
      event.preventDefault();
      const lastKeyEvent = new CustomEvent('on-footer-escape', {
        detail: {
          action: 'FOOTER: user tabbed beyond chat',
          originalEvent: event
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(lastKeyEvent);
    }
  }
  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscape(event) {
    if (event.key === 'Tab' && !event.shiftKey && this._fullscreenMode) {
      event.preventDefault();
      const lastKeyEvent = new CustomEvent('on-footer-escape', {
        detail: {
          action: 'FOOTER: user tabbed beyond chat',
          originalEvent: event
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(lastKeyEvent);
    }
  }
  /** checkSize - see if width/height warrant changing the footer mode
   */
  _checkSize() {
    const parentWidth = this.clientWidth;
    const parentHeight = this.clientHeight;
    if (parentWidth && parentHeight) {
      this._expandedWidth = parentWidth > 672;
      this._expandedHeight = this._expandedWidth;
    }
    if (this._fullscreenMode) {
      this._expandedWidth = true;
      this._expandedHeight = true;
    }
  }
  /** handle user inputs inside the input field, trigger a search upon an 'enter' key down event
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleInput(event) {
    const {
      value
    } = event.target;
    this._messageText = value;
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this._forceDisableInput) {
        if (value.length > 0) {
          this._sendInputToParent();
        }
      }
    }
    this._checkKeyboardEscapeC(event);
  }
  /** handle voice recording start click event
   */
  _startRecording() {
    var _a;
    (_a = this._speechRecognition) === null || _a === void 0 ? void 0 : _a.start();
    this._isListening = true;
    const recordingEvent = new CustomEvent('on-chat-footer-speech-start', {
      detail: {
        action: 'user started speech recognition',
        currentMessage: this._messageText,
        originalEvent: event
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(recordingEvent);
  }
  /** handle voice recording end click event
   */
  _endRecording() {
    var _a;
    (_a = this._speechRecognition) === null || _a === void 0 ? void 0 : _a.stop();
    this._isListening = false;
    const recordingEvent = new CustomEvent('on-chat-footer-speech-end', {
      detail: {
        action: 'user ended speech recognition',
        currentMessage: this._messageText,
        originalEvent: event
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(recordingEvent);
  }
  /** handle stop button click event to end streaming
   */
  _endStreaming() {
    if (this.enableCancellation) {
      const stopResponseEvent = new CustomEvent('on-user-request-interrupt', {
        detail: {
          action: 'FOOTER: user requested to cancel current query'
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(stopResponseEvent);
    } else {
      const stopStreamEvent = new CustomEvent('on-user-stream-interrupt', {
        detail: {
          action: 'FOOTER: user requested to end text streaming'
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(stopStreamEvent);
      this._currentlyStreaming = false;
    }
  }
  /** handle voice input from speech recognition
   * @param {event} event - speech recognition input event
   */
  _handleVoiceInput(event) {
    const result = event.results[event.resultIndex];
    this._messageText = result[0].transcript;
  }
  /** handle end of voice input
   */
  _handleVoiceInputEnd() {
    this._isListening = false;
  }
  /** handleMenuFileUpload - upload event in footer menu
   * @param {event} event - lit event sent by the file uploader in menu
   **/
  _handleMenuFileUpload(event) {
    var _a;
    const files = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.addedFiles;
    console.log(files[0]);
  }
  /**
   * Set the message text value on input
   * @param {Object} event - event object
   */
  _setMessageText(event) {
    this._messageText = event.target.value;
  }
  /**
   * Set a new height based on the size of the text area
   */
  updateTextAreaHeight() {
    var _a, _b;
    const maxheight = 182;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-search-query');
    const textAreaContainer = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.' + clabsPrefix + '--chat-footer-prompt-items-target');
    if (textArea instanceof HTMLElement && textAreaContainer instanceof HTMLElement) {
      textArea.style.height = 'auto';
      const newHeight = textArea.scrollHeight;
      textArea.style.height = newHeight + 'px';
      textAreaContainer.style.height = newHeight + 24 + 'px';
      if (textArea.scrollHeight < maxheight) {
        this.style.setProperty('--chat-footer-overflow-control', 'hidden');
      } else {
        this.style.setProperty('--chat-footer-overflow-control', 'scroll');
      }
    }
  }
  /**
   * reset height of the text area
   */
  resetTextAreaHeight() {
    var _a, _b;
    const textAreaContainer = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-footer-prompt-items-target');
    const textArea = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.' + clabsPrefix + '--chat-search-query');
    if (textArea instanceof HTMLElement && textAreaContainer instanceof HTMLElement) {
      textArea.scrollTop = 0;
      textArea.style.height = 'auto';
      textArea.style.height = 32 + 'px';
      textAreaContainer.style.height = 32 + 'px';
      this.style.setProperty('--chat-footer-overflow-control', 'hidden');
    }
  }
  /**
   * set focus on component when text area is focused
   * @param {event} event - lit event sent by textarea focus
   */
  _textAreaIsFocused(event) {
    this._isPromptFocused = (event === null || event === void 0 ? void 0 : event.type) === 'focus';
    if (!this._isPromptFocused) {
      this.resetTextAreaHeight();
    } else {
      this.updateTextAreaHeight();
    }
    this.hideContextMessage = false;
  }
  /**
   * handle when context message above prompt is closed
   */
  _handleContextMessageClose() {
    this.hideContextMessage = true;
  }
  /**
   * Send input text event to parent Chat Element
   **/
  _sendInputToParent() {
    const value = this._messageText;
    this._endRecording();
    if (value.length > 0) {
      this._messageText = '';
      const inputEvent = new CustomEvent('on-user-text-input', {
        detail: {
          textInputValue: value
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(inputEvent);
      this.requestUpdate();
      this.resetTextAreaHeight();
    }
  }
}
footer.styles = styles;
export default footer;
__decorate([property({
  type: String,
  attribute: 'input-placeholder'
})], footer.prototype, "_inputPlaceholder", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-input'
})], footer.prototype, "_disableInput", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'fullscreen-mode'
})], footer.prototype, "_fullscreenMode", void 0);
__decorate([state()], footer.prototype, "_forceDisableInput", void 0);
__decorate([property({
  type: Number,
  attribute: 'character-limit'
})], footer.prototype, "_characterLimit", void 0);
__decorate([state()], footer.prototype, "_expandedHeight", void 0);
__decorate([state()], footer.prototype, "_expandedWidth", void 0);
__decorate([state()], footer.prototype, "_messageText", void 0);
__decorate([state()], footer.prototype, "_isListening", void 0);
__decorate([state()], footer.prototype, "_voiceAPIAvailable", void 0);
__decorate([state()], footer.prototype, "_isPromptFocused", void 0);
__decorate([state()], footer.prototype, "hideContextMessage", void 0);
__decorate([property({
  type: String,
  attribute: 'context-message'
})], footer.prototype, "_contextMessage", void 0);
__decorate([property({
  type: String,
  attribute: 'context-message-type'
})], footer.prototype, "_contextMessageType", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'currently-streaming'
})], footer.prototype, "_currentlyStreaming", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-cancellation'
})], footer.prototype, "enableCancellation", void 0);
__decorate([state()], footer.prototype, "_customLabels", void 0);
__decorate([property({
  type: String,
  attribute: 'preset-entry'
})], footer.prototype, "_presetEntry", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], footer.prototype, "customLabels", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'query-processing'
})], footer.prototype, "queryProcessing", void 0);
__decorate([property({
  type: String,
  attribute: 'notification-count'
})], footer.prototype, "notificationCount", void 0);
__decorate([state()], footer.prototype, "showNotification", void 0);
//# sourceMappingURL=footer.js.map
