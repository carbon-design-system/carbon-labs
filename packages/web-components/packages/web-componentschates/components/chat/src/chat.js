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
import { APIPlugin } from '../../../services/APIPlugin/index.js';
// @ts-ignore
// @ts-ignore
import styles from "./chat.css.js";
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
/**
 * Input component using search typeahead api
 */
class CLABSChat extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Core array of message objects to display and interact with, invidual messages are currently described as:
     * {"message":"displayed text", "origin":"can be bot or user, depending on user-defined role names"}
     */
    this._messages = [];
    /**
     * server side integer denoting the number of messages sent in total
     */
    this._eventNumber = 0;
    /**
     * session ID to ensure no two conversations collide within the server
     */
    this._session = '' + Math.random();
    /**
     * boolean denoting when a user triggered a stop-streaming event
     */
    this._interruptStreaming = true;
    /**
     * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
     */
    this._queryInProgress = false;
    /**
     * string denoting selected querying method
     */
    this.chosenHost = 'Local';
    /**
     * fullscreen boolean dictated by header child
     */
    this.enableFullscreen = false;
    /**
     * docking boolean dictated by header child
     */
    this.enableDocking = false;
    /**
     * x-axis placement of minimized chat
     */
    this.horizontalDockDirection = 'right';
    /**
     * y-axis placement of minimized chat
     */
    this.verticalDockDirection = 'bottom';
    /**
     * vertical docking position with drag event
     */
    this.verticalDockPosition = 16;
    /**
     * horizontal docking position with drag event
     */
    this.horizontalDockPosition = 16;
    /**
     * dragging state
     */
    this._isDragging = false;
    /**
     * canceled message state
     */
    this.requestCancelled = false;
    /**
     * popup event counter
     */
    this.complexFeedbackCount = 0;
  }
  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    window.addEventListener('resize', event => {
      this._checkPositioning(event);
    });
  }
  /** internal LIT function to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
      if (!this.loading) {
        this._interruptStreaming = true;
      }
    }
    if (changedProperties.has('conversation')) {
      if (this.conversation) {
        this._messages = [...this.conversation];
      } else {
        this._messages = [];
      }
    }
    if (changedProperties.has('defaultViewingMode')) {
      if (this.defaultViewingMode === 'fullscreen') {
        this.enableDocking = false;
        this.enableFullscreen = true;
      }
      if (this.defaultViewingMode === 'minimized') {
        this.enableDocking = true;
        this.enableFullscreen = false;
      }
    }
    if (changedProperties.has('sampleQuery')) {
      this.initializeExamplesText();
    }
    if (changedProperties.has('temperature')) {
      this.originalTemperature = this.temperature;
    }
  }
  /**
   * handle rerendering when children mutate/change
   * @param {event} event - slot change detection event
   */
  _handleSlotChange(event) {
    event.preventDefault();
    const chatSlotUpdateEvent = new CustomEvent('on-chat-slot-update', {
      detail: {
        action: 'Chat slot subcomponent had updated'
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(chatSlotUpdateEvent);
  }
  /**
   * handle when tab escapes chat
   * @param {event} event - shift tab event from header
   */
  _handleHeaderEscape() {
    var _a, _b;
    const firstTabbableElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector(clabsPrefix + '-chat-footer');
    if (firstTabbableElement instanceof HTMLElement) {
      const elem = (_b = firstTabbableElement.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.' + clabsPrefix + '--chat-search-query');
      if (elem instanceof HTMLElement) {
        elem.focus();
      }
    }
  }
  /**
   * handle when tab escapes chat
   * @param {event} event - tab event from footer
   */
  _handleFooterEscape() {
    var _a, _b, _c;
    const firstTabbableElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector(clabsPrefix + '-chat-header');
    if (firstTabbableElement instanceof HTMLElement) {
      const elem = (_b = firstTabbableElement.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('#' + clabsPrefix + '--chat-header-overflow-menu-unique');
      if (elem instanceof HTMLElement) {
        const subelem = (_c = elem.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('#button');
        if (subelem instanceof HTMLElement) {
          subelem.focus();
        }
      }
    }
  }
  /**
   * handle stream-end event from footer
   * @param {event} event - slot change detection event
   */
  _endStreaming(event) {
    event.preventDefault();
    const chatEndStreamingEvent = new CustomEvent('on-chat-end-streaming', {
      detail: {
        action: 'Streaming interrupted by user'
      },
      bubbles: true,
      composed: true
    });
    this._interruptStreaming = true;
    this.dispatchEvent(chatEndStreamingEvent);
  }
  /**
   * handle when header sends dragstart event
   * @param {event} event - drag start event
   */
  _handleHeaderDragStart(event) {
    var _a, _b;
    const originalOffset = event.detail.offset;
    if (this.enableDocking) {
      this._isDragging = true;
      (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousemove', e => {
        e.preventDefault();
        this._dragChat(e, originalOffset);
      });
      (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mouseup', e => {
        this._dragEnd(e);
      });
    }
  }
  /**
   * handle when header sends dragstart event
   * @param {event} event - drag start event
   */
  _handleHeaderDragCancel(event) {
    if (this.enableDocking) {
      this._dragEnd(event);
    }
  }
  /**
   * handle when header sends dragstart event
   * @param {event} event - drag start event
   */
  _handleHeaderKeyboardDragStart(event) {
    const originalOffset = event.detail.offset;
    if (this.enableDocking) {
      this._dragChatKeyboard(originalOffset);
    }
  }
  /**
   * drag chat event
   * @param {event} event - core mousemove event
   * @param {object} originalOffset - x/y click values from header
   */
  _dragChatKeyboard(originalOffset) {
    var _a;
    if (this._isDragging) {
      const chatReference = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-container');
      if (chatReference instanceof HTMLElement) {
        const chatHeight = chatReference.clientHeight;
        const chatWidth = chatReference.clientWidth;
        const mininumPadding = {
          top: 16,
          bottom: 16,
          left: 16,
          right: 16
        };
        let newPositionX = this.horizontalDockPosition + originalOffset.x;
        let newPositionY = this.verticalDockPosition + originalOffset.y;
        newPositionX = Math.min(Math.max(mininumPadding.right, newPositionX), window.innerWidth - mininumPadding.left - chatWidth);
        newPositionY = Math.min(Math.max(mininumPadding.bottom, newPositionY), window.innerHeight - mininumPadding.top - chatHeight);
        if (newPositionX && newPositionY) {
          this.verticalDockPosition = newPositionY;
          this.horizontalDockPosition = newPositionX;
          this.style.setProperty('--chat-docked-bottom-position', newPositionY + 'px');
          this.style.setProperty('--chat-docked-right-position', newPositionX + 'px');
        }
      }
    }
  }
  /**
   * check if chat still viewable after resize
   * @param {event} _event - resize event
   */
  _checkPositioning(_event) {
    if (this.enableDocking) {
      if (window.innerHeight < this.verticalDockPosition + 640) {
        const newVerticalPosition = Math.max(window.innerHeight - 640 - 16, 16);
        this.verticalDockPosition = newVerticalPosition;
        this.style.setProperty('--chat-docked-bottom-position', newVerticalPosition + 'px');
      }
      if (window.innerWidth < this.horizontalDockPosition + 320) {
        const newHorizontalPosition = Math.max(window.innerWidth - 320 - 16, 16);
        this.horizontalDockPosition = newHorizontalPosition;
        this.style.setProperty('--chat-docked-right-position', newHorizontalPosition + 'px');
      }
    }
  }
  /**
   * drag chat event
   * @param {event} event - core mousemove event
   * @param {object} originalOffset - x/y click values from header
   */
  _dragChat(event, originalOffset) {
    var _a;
    if (this._isDragging) {
      if (!this.disableOutsideControl) {
        //document.body.style.userSelect = 'none';
      }
      const chatReference = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-container');
      if (chatReference instanceof HTMLElement) {
        const chatHeight = chatReference.clientHeight;
        const chatWidth = chatReference.clientWidth;
        const mininumPadding = {
          top: 16,
          bottom: 16,
          left: 16,
          right: 16
        };
        let newPositionX = window.innerWidth - (event.clientX - originalOffset.x) - chatWidth;
        let newPositionY = window.innerHeight - (event.clientY - originalOffset.y) - chatHeight;
        newPositionX = Math.min(Math.max(mininumPadding.right, newPositionX), window.innerWidth - mininumPadding.left - chatWidth);
        newPositionY = Math.min(Math.max(mininumPadding.bottom, newPositionY), window.innerHeight - mininumPadding.top - chatHeight);
        if (newPositionX && newPositionY) {
          this.verticalDockPosition = newPositionY;
          this.horizontalDockPosition = newPositionX;
          this.style.setProperty('--chat-docked-bottom-position', newPositionY + 'px');
          this.style.setProperty('--chat-docked-right-position', newPositionX + 'px');
        }
      }
    }
  }
  /**
   * drag chat event
   * @param {event} _event - drag end event
   */
  _dragEnd(_event) {
    this._isDragging = false;
    if (!this.disableOutsideControl) {
      document.body.style.userSelect = 'auto';
    }
  }
  /** Initialize examples for when stories send in a 'sampleQuery' string
   */
  initializeExamplesText() {
    if (this.sampleQuery === '') {
      this._messages = [];
      this._messages.length = 0;
      return;
    }
    this._interruptStreaming = !this._streamResponses;
    this._messages.length = 0;
    const exampleMessageArray = this.sampleQuery.split('bot:');
    const userMessage = exampleMessageArray[0].replace('user:', '');
    const botMessage = exampleMessageArray[1];
    this._messages = [{
      text: userMessage,
      origin: this.userName,
      hasError: false,
      time: this._getCurrentTime(),
      index: 0
    }];
    if (botMessage) {
      this._messages = [...this._messages, {
        text: botMessage,
        origin: this.agentName,
        hasError: false,
        time: this._getCurrentTime(),
        index: 1
      }];
    }
    this._queryInProgress = false;
  }
  /** trigger API call upon text input
   * @param {string} searchQuery - current message being sent
   **/
  async getResults(searchQuery) {
    let response;
    if (this.chosenHost == 'Local') {
      response = await APIPlugin.sendMessageLocal(this.apiURL, this.model, this.temperature, this.userPrompt, this._messages, searchQuery, this._session, this._eventNumber);
    }
    if (this.chosenHost == 'BAM') {
      response = await APIPlugin.sendMessageBAM(this.apiURL, this.model, this.temperature, this.userPrompt, this._messages, searchQuery, this._session, this._eventNumber);
    }
    if (this.chosenHost == 'Watsonx.ai') {
      response = await APIPlugin.sendMessageWatsonX('https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29', this.model, this.temperature, this.userPrompt, this._messages, searchQuery, this._session, this._eventNumber);
    }
    return response;
  }
  /** handle regeneration signal from message subcomponent, resend query and edit the message list
   * @param {event} event - custom regeneration event from message subcomponent
   */
  _handleUserRegenerationRequest(event) {
    const deletionIndex = event.detail.messageIndexInChat - 1;
    const previousMessage = this._messages[deletionIndex].text;
    if (this.autoUpdate || this.apiURL) {
      if (this.temperature) {
        this.temperature += 0.2;
      }
      this._messages = this._messages.slice(0, deletionIndex);
      const inputEvent = new CustomEvent('user-input', {
        detail: {
          textInputValue: previousMessage
        },
        bubbles: true,
        composed: true
      });
      this.sendInput(inputEvent);
    } else {
      event.preventDefault();
      event.detail['previousUserMessage'] = previousMessage;
      event.detail['cutConversationIndex'] = deletionIndex;
      const inputEvent = new CustomEvent('on-user-regeneration-request', {
        detail: event.detail,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(inputEvent);
    }
  }
  /** handle update signal from message subcomponent, only triggered when only text is supplied in parent conversation object
   * @param {event} event - custom update event from message subcomponent
   */
  _handleUserUpdateRequest(event) {
    const deletionIndex = event.detail.messageIndexInChat;
    const previousMessage = event.detail.newMessage;
    if (this.autoUpdate || this.apiURL) {
      this._messages = this._messages.slice(0, deletionIndex);
      const inputEvent = new CustomEvent('user-input', {
        detail: {
          textInputValue: previousMessage
        },
        bubbles: true,
        composed: true
      });
      if (this.temperature) {
        this.temperature += 0.2;
      }
      this.sendInput(inputEvent);
    } else {
      event.preventDefault();
      event.detail['cutConversationIndex'] = deletionIndex;
      const inputEvent = new CustomEvent('on-user-message-update-request', {
        detail: event.detail,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(inputEvent);
    }
  }
  /**
   * _cancelRequest - ignore following response, delete previous user message and restore text in footer
   * @param {event} _event - custom feedback event from message subcomponent
   **/
  _cancelRequest(_event) {
    const lastMessage = this.lastUserMessage;
    if (this.enableRequestCancelling) {
      this.requestCancelled = true;
      this._queryInProgress = false;
      this._messages = this._messages.slice(0, this._messages.length - 1);
      this.setUserMessage = '' + lastMessage;
    }
  }
  /**
   * sendInput - send in the latest user message from the footer element to the api, package it within the messages array and update the DOM
   * @param {event} event - custom feedback event from message subcomponent
   **/
  sendInput(event) {
    const value = event.detail.textInputValue;
    //if streaming is enabled and previously interrupted
    this._interruptStreaming = !this._streamResponses;
    this.lastUserMessage = value;
    if (this.enableRequestCancelling) {
      this.requestCancelled = false;
    }
    this.temperature;
    const newMessage = {
      text: value,
      origin: this.userName,
      hasError: false,
      time: this._getCurrentTime(),
      index: this._messages.length,
      userSubmitted: true
    };
    if (!this.autoUpdate) {
      const onSubmitEvent = new CustomEvent('on-submit', {
        detail: {
          message: newMessage
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(onSubmitEvent);
    } else {
      this._messages = [...this._messages, newMessage];
      this._queryInProgress = true;
      this.getResults(value).then(res => {
        const errorState = Object.prototype.hasOwnProperty.call(res, 'failed') && res['failed'] === true;
        if (!this.requestCancelled) {
          if (this.useWatsonAssistantProtocol) {
            const newElements = this._translateWxA(res.reply);
            this._messages = [...this._messages, ...newElements];
          } else {
            this._messages = [...this._messages, {
              text: res.reply,
              origin: this.agentName,
              hasError: errorState,
              time: this._getCurrentTime(),
              index: this._messages.length
            }];
          }
          this._queryInProgress = false;
        } else {
          this.requestCancelled = false;
        }
        if (this.temperature) {
          this.temperature = this.originalTemperature;
        }
      }).catch(() => {
        if (!this.requestCancelled) {
          this._messages = [...this._messages, {
            text: 'Error reaching the model server, try again',
            origin: this.agentName,
            hasError: true,
            time: this._getCurrentTime(),
            index: this._messages.length
          }];
          this._queryInProgress = false;
        } else {
          this.requestCancelled = false;
        }
        if (this.temperature) {
          this.temperature = this.originalTemperature;
        }
      });
    }
  }
  /** _translateWxA - protocol conversation when querying WxA
   * @param {Object} replyObject - returned API response
   */
  _translateWxA(replyObject) {
    const temporaryMessageElements = [];
    for (const subElement of replyObject.generic) {
      switch (subElement['response_type']) {
        case 'text':
          /*const mergedText = subElement['values']['concat'].reduce(
            (acc, item) => {
              if (item.hasOwnProperty('scalar')) {
                acc += item['scalar'];
              }
              return acc;
            },
            ''
          );
          if (mergedText !== '') {
            temporaryMessageElements.push({
              type: 'text',
              content: mergedText,
            });
          } else {
            temporaryMessageElements.push({
              type: 'error',
              content:
                'Failed to parse text response: ' + JSON.stringify(subElement),
            });
          }*/
          break;
        case 'audio':
          temporaryMessageElements.push({
            type: 'audio',
            cardElements: {
              link: subElement.source,
              description: subElement.description,
              title: subElement.title
            }
          });
          break;
        case 'card':
          temporaryMessageElements.push({
            type: 'audio',
            cardElements: {
              link: subElement.source,
              description: subElement.description,
              title: subElement.title
            }
          });
          break;
      }
    }
    return temporaryMessageElements;
  }
  /**
   * handle fullscreen event when header fullscreen event is called
   * @param {event} event - click event from cds button
   */
  _handleFullscreenMode(event) {
    var _a;
    const mode = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fullscreen;
    this.enableDocking = false;
    if (!mode && this.defaultViewingMode === 'minimized') {
      this.enableDocking = true;
    }
    this.enableFullscreen = mode;
    if (!this.disableOutsideControl) {
      document.body.style.overflow = mode ? 'hidden' : '';
    }
    //this.parentElement.dispatchEvent(new Event('resize'));
  }
  /**
   * handle docking event when header docking event is called
   * @param {event} event - click event from cds button
   */
  _handleDockingMode(event) {
    var _a;
    const mode = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.docking;
    this.enableFullscreen = false;
    this.enableDocking = mode;
    document.body.style.overflow = '';
    //this.parentElement.dispatchEvent(new Event('resize'));
  }
  /**
   * handle closing event when header close event is called
   */
  _handleChatClosed() {
    this.closed = true;
    if (!this.disableOutsideControl) {
      document.body.style.overflow = '';
    }
  }
  /**
   * handle closing event when header close event is called
   */
  _handleChatOpened() {
    this.closed = false;
    if (!this.disableOutsideControl) {
      document.body.style.overflow = '';
    }
    this.requestUpdate();
  }
  /**
   * if complex feedback triggered, notify change to footer for notification
   * @param {event} _event - custom complex feedback event
   */
  _handleComplexFeedback(_event) {
    this.complexFeedbackCount++;
  }
  /** get time of message formatted as 1:23pm or 4:56am
   **/
  _getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const militaryTime = true;
    if (militaryTime) {
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
      const currentTime = hours + ':' + formattedMinutes;
      return currentTime;
    } else {
      const amOrpm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
      const currentTime = hours + ':' + formattedMinutes + amOrpm;
      return currentTime;
    }
  }
}
CLABSChat.styles = styles;
export default CLABSChat;
__decorate([state()], CLABSChat.prototype, "_messages", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'loading',
  reflect: true
})], CLABSChat.prototype, "loading", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'closed'
})], CLABSChat.prototype, "closed", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'auto-update',
  reflect: true
})], CLABSChat.prototype, "autoUpdate", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-launcher'
})], CLABSChat.prototype, "enableLauncher", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'start-with-launcher'
})], CLABSChat.prototype, "startWithLauncher", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-header-menu'
})], CLABSChat.prototype, "disableHeaderMenu", void 0);
__decorate([property({
  type: String,
  attribute: 'input-field-placeholder'
})], CLABSChat.prototype, "inputFieldPlaceholder", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'stream-responses'
})], CLABSChat.prototype, "_streamResponses", void 0);
__decorate([property({
  type: Number,
  attribute: 'stream-delay'
})], CLABSChat.prototype, "_streamDelay", void 0);
__decorate([state()], CLABSChat.prototype, "_interruptStreaming", void 0);
__decorate([state()], CLABSChat.prototype, "_queryInProgress", void 0);
__decorate([property({
  type: Object,
  attribute: 'conversation'
})], CLABSChat.prototype, "conversation", void 0);
__decorate([property({
  type: Number,
  attribute: 'max-character-count'
})], CLABSChat.prototype, "maxCharacterCount", void 0);
__decorate([property({
  type: String,
  attribute: 'api-url'
})], CLABSChat.prototype, "apiURL", void 0);
__decorate([property({
  type: String,
  attribute: 'conversation-example'
})], CLABSChat.prototype, "conversationExample", void 0);
__decorate([property({
  type: String,
  attribute: 'feedback-url'
})], CLABSChat.prototype, "feedbackURL", void 0);
__decorate([property({
  type: String,
  attribute: 'model'
})], CLABSChat.prototype, "model", void 0);
__decorate([property({
  type: Number,
  attribute: 'temperature'
})], CLABSChat.prototype, "temperature", void 0);
__decorate([state()], CLABSChat.prototype, "originalTemperature", void 0);
__decorate([property({
  type: String,
  attribute: 'user-name'
})], CLABSChat.prototype, "userName", void 0);
__decorate([property({
  type: String,
  attribute: 'agent-name'
})], CLABSChat.prototype, "agentName", void 0);
__decorate([property({
  type: String,
  attribute: 'user-prompt'
})], CLABSChat.prototype, "userPrompt", void 0);
__decorate([property({
  type: String,
  attribute: 'default-viewing-mode'
})], CLABSChat.prototype, "defaultViewingMode", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-header-buttons'
})], CLABSChat.prototype, "disableHeaderButtons", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-feedback-form'
})], CLABSChat.prototype, "enableFeedbackForm", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-text-feedback-form'
})], CLABSChat.prototype, "enableTextFeedbackForm", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-header-fullscreen'
})], CLABSChat.prototype, "disableHeaderFullscreen", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-header-close'
})], CLABSChat.prototype, "disableHeaderClose", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-header-minimize'
})], CLABSChat.prototype, "disableHeaderMinimize", void 0);
__decorate([property({
  type: Object,
  attribute: 'headerMenuItems'
})], CLABSChat.prototype, "headerMenuItems", void 0);
__decorate([property({
  type: Object,
  attribute: 'feedbackDefinitions'
})], CLABSChat.prototype, "feedbackDefinitions", void 0);
__decorate([property({
  type: String,
  attribute: 'sample-query'
})], CLABSChat.prototype, "sampleQuery", void 0);
__decorate([property({
  type: String,
  attribute: 'prompt-notification-message'
})], CLABSChat.prototype, "promptNotificationMessage", void 0);
__decorate([property({
  type: String,
  attribute: 'prompt-notification-type'
})], CLABSChat.prototype, "promptNotificationType", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'use-watson-assistant-protocol'
})], CLABSChat.prototype, "useWatsonAssistantProtocol", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-outside-control'
})], CLABSChat.prototype, "disableOutsideControl", void 0);
__decorate([state()], CLABSChat.prototype, "enableFullscreen", void 0);
__decorate([state()], CLABSChat.prototype, "enableDocking", void 0);
__decorate([property({
  type: String,
  attribute: 'horizontal-dock-position'
})], CLABSChat.prototype, "horizontalDockDirection", void 0);
__decorate([property({
  type: String,
  attribute: 'vertical-dock-position'
})], CLABSChat.prototype, "verticalDockDirection", void 0);
__decorate([property({
  type: String,
  attribute: 'ai-slug-content'
})], CLABSChat.prototype, "aiSlugContent", void 0);
__decorate([property({
  type: Object,
  attribute: 'aiSlugObject'
})], CLABSChat.prototype, "aiSlugObject", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-request-cancelling'
})], CLABSChat.prototype, "enableRequestCancelling", void 0);
__decorate([state()], CLABSChat.prototype, "verticalDockPosition", void 0);
__decorate([state()], CLABSChat.prototype, "horizontalDockPosition", void 0);
__decorate([state()], CLABSChat.prototype, "_isDragging", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], CLABSChat.prototype, "customLabels", void 0);
__decorate([state()], CLABSChat.prototype, "requestCancelled", void 0);
__decorate([state()], CLABSChat.prototype, "lastUserMessage", void 0);
__decorate([state()], CLABSChat.prototype, "setUserMessage", void 0);
__decorate([state()], CLABSChat.prototype, "complexFeedbackCount", void 0);
//# sourceMappingURL=chat.js.map
