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

import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
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
   * disable user input such as when chat is loading
   */
  @property({ type: Boolean, attribute: 'fullscreen-mode' })
  _fullscreenMode;

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
   * focus-prompt set focus targeting
   */
  @property({ type: Boolean, attribute: 'focus-prompt' })
  _focusPrompt;

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
   * enable requestion cancellation
   */
  @property({ type: Boolean, attribute: 'enable-cancellation' })
  enableCancellation;

  /**
   * speechRecognition object to interface with text input
   */
  private _speechRecognition: any = null;

  /**
   * global labels context
   */
  @state()
  _customLabels;

  /**
   * present entry for auto-prompts
   */
  @property({ type: String, attribute: 'preset-entry' })
  _presetEntry;

  /**
   * custom label presets
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /**
   * query in progress
   */
  @property({ type: Boolean, attribute: 'query-processing' })
  queryProcessing;

  /**
   * notification counter to display
   */
  @property({ type: String, attribute: 'notification-count' })
  notificationCount = '0';

  /**
   * trigger notification display
   */
  @state()
  showNotification = false;

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

    if (changedProperties.has('_focusPrompt')) {
      if (this._focusPrompt) {
        const textArea = this.shadowRoot?.querySelector(
          '.' + clabsPrefix + '--chat-search-query'
        );
        if (textArea instanceof HTMLElement) {
          textArea.focus();
          this._isPromptFocused = true;
        }
      }
    }
    if (changedProperties.has('_contextMessage')) {
      this.hideContextMessage = false;
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

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - value to lookup
   */
  _renderLabel = (key) => {
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

  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscapeB(event) {
    const blockedSendTest = this._messageText === '' || this._forceDisableInput;
    if (
      event.key === 'Tab' &&
      blockedSendTest &&
      !event.shiftKey &&
      this._fullscreenMode
    ) {
      event.preventDefault();

      const lastKeyEvent = new CustomEvent('on-footer-escape', {
        detail: {
          action: 'FOOTER: user tabbed beyond chat',
          originalEvent: event,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(lastKeyEvent);
    }
  }

  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscapeC(event) {
    const blockedSendTest = this._messageText === '' || this._forceDisableInput;
    if (
      event.key === 'Tab' &&
      blockedSendTest &&
      !event.shiftKey &&
      !this._voiceAPIAvailable &&
      this._fullscreenMode
    ) {
      event.preventDefault();

      const lastKeyEvent = new CustomEvent('on-footer-escape', {
        detail: {
          action: 'FOOTER: user tabbed beyond chat',
          originalEvent: event,
        },
        bubbles: true,
        composed: true,
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
          originalEvent: event,
        },
        bubbles: true,
        composed: true,
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
    const { value } = event.target;
    this._messageText = value;
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this._forceDisableInput && !this.queryProcessing) {
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
    this._speechRecognition?.start();
    this._isListening = true;
    const recordingEvent = new CustomEvent('on-chat-footer-speech-start', {
      detail: {
        action: 'user started speech recognition',
        currentMessage: this._messageText,
        originalEvent: event,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(recordingEvent);
  }

  /** handle voice recording end click event
   */
  _endRecording() {
    this._speechRecognition?.stop();
    this._isListening = false;
    const recordingEvent = new CustomEvent('on-chat-footer-speech-end', {
      detail: {
        action: 'user ended speech recognition',
        currentMessage: this._messageText,
        originalEvent: event,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(recordingEvent);
  }

  /** handle stop button click event to end streaming
   */
  _endStreaming() {
    if (this.enableCancellation) {
      const stopResponseEvent = new CustomEvent('on-user-request-interrupt', {
        detail: { action: 'FOOTER: user requested to cancel current query' },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(stopResponseEvent);
    } else {
      const stopStreamEvent = new CustomEvent('on-user-stream-interrupt', {
        detail: { action: 'FOOTER: user requested to end text streaming' },
        bubbles: true,
        composed: true,
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
    const maxheight = 182;
    const textArea = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-search-query'
    );

    const textAreaContainer = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-footer-prompt-items-target'
    );
    if (
      textArea instanceof HTMLElement &&
      textAreaContainer instanceof HTMLElement
    ) {
      this.style.setProperty('--chat-footer-text-area-height', 'auto');
      const newHeight = textArea.scrollHeight;
      this.style.setProperty(
        '--chat-footer-text-area-height',
        newHeight + 'px'
      );
      this.style.setProperty(
        '--chat-footer-text-area-container-height',
        newHeight + 24 + 'px'
      );
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
    const textAreaContainer = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-footer-prompt-items-target'
    );
    const textArea = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-search-query'
    );
    if (
      textArea instanceof HTMLElement &&
      textAreaContainer instanceof HTMLElement
    ) {
      textArea.scrollTop = 0;
      this.style.setProperty('--chat-footer-text-area-height', 'auto');
      this.style.setProperty('--chat-footer-text-area-height', 32 + 'px');
      this.style.setProperty(
        '--chat-footer-text-area-container-height',
        32 + 'px'
      );
      this.style.setProperty('--chat-footer-overflow-control', 'hidden');
    }
  }

  /**
   * set focus on component when text area is focused
   * @param {event} event - lit event sent by textarea focus
   */
  _textAreaIsFocused(event) {
    this._isPromptFocused = event?.type === 'focus';
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
