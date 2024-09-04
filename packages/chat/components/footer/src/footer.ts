/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { state, property } from 'lit/decorators.js';
// @ts-ignore
import styles from './footer.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class footer extends LitElement {
  static styles = styles;

  /**
   * resizeobserver for when parent is larger then 672px
   */
  private _resizeObserver;

  /**
   * custom placeholder for input field
   */
  @property({ type: String, attribute: 'input-placeholder' })
  _inputPlaceholder;

  /**
   * disable user input such as when chat is loading
   */
  @property({ type: Boolean, attribute: 'disable-input' })
  _disableInput;

  /**
   * force disable input because of internal error state
   */
  @state()
  _forceDisableInput = false;

  /**
   * maximum character count for input, show warning and disable input
   */
  @property({ type: Number, attribute: 'character-limit' })
  _characterLimit;

  /**
   * expanded mode when chat width is large
   */
  @state()
  _expandedHeight;

  /**
   * expanded mode when chat height is large
   */
  @state()
  _expandedWidth;

  /**
   * string variable edited by textInput, auto-updates at every keystroke and is sent to the api url on 'enter' or 'send' button click
   */
  @state()
  _messageText = '';

  /**
   * boolean denoting if recording is in progress
   */
  @state()
  _isListening = false;

  /**
   * boolean denoting if voiceAPI capabilities are available in browser, otherwise disable icon
   */
  @state()
  _voiceAPIAvailable = true;

  /**
   * see if text area is currently focused or not
   */
  @state()
  _isPromptFocused = false;

  /**
   * triggered when close icon is selected
   */
  @state()
  hideContextMessage = false;

  /**
   * add context meesage above prompt
   */
  @property({ type: String, attribute: 'context-message' })
  _contextMessage;

  /**
   * type context meesage above prompt
   */
  @property({ type: String, attribute: 'context-message-type' })
  _contextMessageType;

  /**
   * type context meesage above prompt
   */
  @property({ type: Boolean, attribute: 'currently-streaming' })
  _currentlyStreaming;

  /**
   * speechRecognition object to interface with text input
   */
  private _speechRecognition: any = null;

  /**
   * LIT firstUpdated cycle to define initial parameters on first render
   */
  firstUpdated() {
    this._checkSize();
    this._resizeObserver = new ResizeObserver(async () => {
      this._checkSize();
    });
    this._resizeObserver.observe(this.parentElement);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this._speechRecognition = new SpeechRecognition();
      this._speechRecognition.continuous = true;
      this._speechRecognition.interimResults = true;
      /**
       * handles the result event from speech recognition
       * @param {event} event - object containing speech result
       */
      this._speechRecognition.onresult = (event) => {
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
  }

  /** _checkLimit - show warning message if character limit is exceeded
   */
  _checkLimit() {
    const limit = this._characterLimit || Number.MAX_SAFE_INTEGER;
    if (this._messageText.length > limit) {
      this._contextMessage =
        '(' +
        this._messageText.length +
        '/' +
        limit.toString() +
        ') Character limit exceeded';
      this._contextMessageType = 'error';
      this._forceDisableInput = true;
    } else {
      this._contextMessage = null;
      this._contextMessageType = null;
      this._forceDisableInput = false;
    }
  }

  /** checkSize - see if width/height warrant changing the footer mode
   */
  _checkSize() {
    const parentWidth = this.parentElement?.clientWidth;
    const parentHeight = this.parentElement?.clientHeight;
    if (parentWidth && parentHeight) {
      this._expandedWidth = this.parentElement?.clientWidth > 672;
      this._expandedHeight =
        this._expandedWidth && this.parentElement?.clientHeight > 672;
    }
  }

  /** handle user inputs inside the input field, trigger a search upon an 'enter' key down event
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleInput(event) {
    const { value } = event.target;
    this._messageText = value;
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this._forceDisableInput) {
        if (value.length > 0) {
          this._sendInputToParent();
        }
      }
    }
  }

  /** handle voice recording start click event
   */
  _startRecording() {
    this._speechRecognition?.start();
    this._isListening = true;
  }

  /** handle voice recording end click event
   */
  _endRecording() {
    this._speechRecognition?.stop();
    this._isListening = false;
  }

  /** handle stop button click event to end streaming
   */
  _endStreaming() {
    const stopStreamEvent = new CustomEvent('on-user-stream-interrupt', {
      detail: { action: 'FOOTER: user requested to end text streaming' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(stopStreamEvent);
    this._currentlyStreaming = false;
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
    const files = event.detail?.addedFiles;
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
    const textArea = this.shadowRoot?.querySelector(
      '.clabs--chat-search-query'
    );
    if (textArea instanceof HTMLElement) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  /**
   * reset height of the text area
   */
  resetTextAreaHeight() {
    const textArea = this.shadowRoot?.querySelector(
      '.clabs--chat-search-query'
    );
    if (textArea instanceof HTMLElement) {
      textArea.style.height = 'auto';
      textArea.style.height = '40px';
    }
  }

  /**
   * set focus on component when text area is focused
   * @param {event} event - lit event sent by textarea focus
   */
  _textAreaIsFocused(event) {
    this._isPromptFocused = event?.type === 'focus';
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
        detail: { textInputValue: value },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(inputEvent);
      this.requestUpdate();

      this.resetTextAreaHeight();
    }
  }
}
