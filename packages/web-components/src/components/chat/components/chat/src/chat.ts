/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { APIPlugin } from '../../../services/APIPlugin/index.js';

// @ts-ignore
import styles from './chat.scss?inline';

import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
/**
 * Input component using search typeahead api
 */
export default class CLABSChat extends LitElement {
  static styles = styles;

  /**
   * Core array of message objects to display and interact with, invidual messages are currently described as:
   * {"message":"displayed text", "origin":"can be bot or user, depending on user-defined role names"}
   */
  @state()
  _messages: any[] = [];

  /**
   * server side integer denoting the number of messages sent in total
   */
  private _eventNumber = 0;

  /**
   * session ID to ensure no two conversations collide within the server
   */
  private _session = '' + Math.random();

  /**
   * user-assigned boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @property({ type: Boolean, attribute: 'loading', reflect: true })
  loading;

  /**
   * closed state to denote if chart is hidden
   */
  @property({ type: Boolean, attribute: 'closed' })
  closed;

  /**
   * user-assigned boolean denoting if the conversation object is user-updated or automatically updated using the api system
   */
  @property({ type: Boolean, attribute: 'auto-update', reflect: true })
  autoUpdate;

  /**
   * user-assigned boolean denoting if the dragging should cancel when the mouse exits the window
   */
  @property({
    type: Boolean,
    attribute: 'cancel-dragging-on-escape',
    reflect: true,
  })
  cancelDraggingOnEscape = true;

  /**
   * force-auto-update - force scroll down no matter what
   */
  @property({ type: Boolean, attribute: 'force-auto-update', reflect: true })
  forceAutoUpdate;

  /**
   * show launcher when closed
   */
  @property({ type: Boolean, attribute: 'enable-launcher' })
  enableLauncher;

  /**
   * start in launcher mode
   */
  @property({ type: Boolean, attribute: 'start-with-launcher' })
  startWithLauncher;

  /**
   * disable header hamburger menu
   */
  @property({ type: Boolean, attribute: 'disable-header-menu' })
  disableHeaderMenu;

  /**
   * custom placeholder for input field in footer
   */
  @property({ type: String, attribute: 'input-field-placeholder' })
  inputFieldPlaceholder;

  /**
   * user-assigned boolean denoting if the conversation object is user-updated or automatically updated using the api system
   */
  @property({ type: Boolean, attribute: 'stream-responses' })
  _streamResponses;

  /**
   * number value in milliseconds to throttle streaming response
   */
  @property({ type: Number, attribute: 'stream-delay' })
  _streamDelay;

  /**
   * boolean denoting when a user triggered a stop-streaming event
   */
  @state()
  _interruptStreaming = true;

  /**
   * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @state()
  _queryInProgress = false;

  /**
   * conversation object to display messages straight from the 'message' attribute, overrides any api_url system
   */
  @property({ type: Object, attribute: 'conversation' })
  conversation;

  /**
   * max character counter specified by developer to prevent large queries
   */
  @property({ type: Number, attribute: 'max-character-count' })
  maxCharacterCount;

  /**
   * string url denoting where the message query will be sent, either BAM or watsonx.ai or any other service
   */
  @property({ type: String, attribute: 'api-url' })
  apiURL;

  /**
   * conversation string that preselects a sample conversation
   */
  @property({ type: String, attribute: 'conversation-example' })
  conversationExample;

  /**
   * string denoting which model to use, only 'llama-2' is available currently
   */
  @property({ type: String, attribute: 'feedback-url' })
  feedbackURL;

  /**
   * string denoting which model to use, only 'llama-2' is available currently
   */
  @property({ type: String, attribute: 'model' })
  model;

  /**
   * float varying from 0.0 to 1.0, denotes how 'creative' the model's response will be. 0.0 (default) is the most safe and predictable while 1.0 is hightly creative but unpredictable (not advised for operations returning code or JSON objects)
   */
  @property({ type: Number, attribute: 'temperature' })
  temperature;

  /**
   * save original user temp
   */
  @state()
  originalTemperature;

  /**
   * string denoting the user name, used for internal logic in the server to differentiate bot responses and user reseponses. default: 'user' but should be the user's real name based on IBM ID or any other data available
   */
  @property({ type: String, attribute: 'user-name' })
  userName;

  /**
   * string denoting the bot name, default: 'external' but can be changed to 'Watson' or 'client assistant' or any other name
   */
  @property({ type: String, attribute: 'agent-name' })
  agentName;

  /**
   * string denoting the unique behavior of the model designated by the user, appended to the private system prompt
   */
  @property({ type: String, attribute: 'user-prompt' })
  userPrompt;

  /**
   * string denoting default viewing mode, can be "container" (default), "fullscreen" or "minimized"
   */
  @property({ type: String, attribute: 'default-viewing-mode' })
  defaultViewingMode;

  /**
   * TEMPORARY: disable all buttons except slug
   */
  @property({ type: Boolean, attribute: 'disable-header-buttons' })
  disableHeaderButtons;

  /**
   * enableFeedBackCard - show feedback card on like buttons
   */
  @property({ type: Boolean, attribute: 'enable-feedback-form' })
  enableFeedbackForm;

  /**
   * enableFeedBackCard - show feedback card on like buttons
   */
  @property({ type: Boolean, attribute: 'enable-text-feedback-form' })
  enableTextFeedbackForm;

  /**
   * Remove header fullscreen button option
   */
  @property({ type: Boolean, attribute: 'disable-header-fullscreen' })
  disableHeaderFullscreen;

  /**
   * Remove header closing button option
   */
  @property({ type: Boolean, attribute: 'disable-header-close' })
  disableHeaderClose;

  /**
   * Remove fullscreen button option
   */
  @property({ type: Boolean, attribute: 'disable-header-minimize' })
  disableHeaderMinimize;

  /**
   * JSON array of menu items to be display in header dropdown menu
   */
  @property({ type: Object, attribute: 'headerMenuItems' })
  headerMenuItems;

  /**
   * JSON object with feedback options given a list of options: thumbs-up, thumbs-down, highlighted-text
   */
  @property({ type: Object, attribute: 'feedbackDefinitions' })
  feedbackDefinitions;

  /**
   * JSON object defining moving dock boundaries
   */
  @property({ type: Object, attribute: 'dockBoundaries' })
  dockBoundaries;

  /**
   * string denoting selected querying method
   */
  private chosenHost = 'Local';

  /**
   * TESTING: case number to trigger auto generation
   */
  @property({ type: String, attribute: 'sample-query' })
  sampleQuery;

  /**
   * string denoting message to append above prompt
   */
  @property({ type: String, attribute: 'prompt-notification-message' })
  promptNotificationMessage;

  /**
   * string denoting type of appended prompt message (error, information, file)
   */
  @property({ type: String, attribute: 'prompt-notification-type' })
  promptNotificationType;

  /**
   * string denoting type of appended prompt message (error, information, file)
   */
  @property({ type: Boolean, attribute: 'use-watson-assistant-protocol' })
  useWatsonAssistantProtocol;

  /**
   * remove all events that effect the core dom outside the chat
   */
  @property({ type: Boolean, attribute: 'disable-outside-control' })
  disableOutsideControl;

  /**
   * fullscreen boolean dictated by header child
   */
  @state()
  enableFullscreen = false;

  /**
   * docking boolean dictated by header child
   */
  @state()
  enableDocking = false;

  /**
   * x-axis placement of minimized chat
   */
  @property({ type: String, attribute: 'horizontal-dock-position' })
  horizontalDockDirection = 'right';

  /**
   * y-axis placement of minimized chat
   */
  @property({ type: String, attribute: 'vertical-dock-position' })
  verticalDockDirection = 'bottom';

  /**
   * html content to show inside slug
   */
  @property({ type: String, attribute: 'ai-slug-content' })
  aiSlugContent;

  /** dict for all renderable value
   */
  @property({ type: Object, attribute: 'aiSlugObject' })
  aiSlugObject;

  /**
   * enable/disable user request canceling
   */
  @property({ type: Boolean, attribute: 'enable-request-cancelling' })
  enableRequestCancelling;

  /**
   * vertical docking position with drag event
   */
  @state()
  verticalDockPosition = 16;

  /**
   * horizontal docking position with drag event
   */
  @state()
  horizontalDockPosition = 16;

  /**
   * dragging state
   */
  @state()
  _isDragging = false;

  /**
   * imported custom labels from parent
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /**
   * canceled message state
   */
  @state()
  requestCancelled = false;

  /**
   * last user entry
   */
  @state()
  lastUserMessage;

  /**
   * preset prompt in chat
   */
  @property({ type: String, attribute: 'preset-prompt-message' })
  presetPromptMessage;

  /**
   * set custom message in footer
   */
  @state()
  setUserMessage;

  /**
   * popup event counter
   */
  @state()
  complexFeedbackCount = 0;

  /**
   * force focus trigger in footer
   */
  @property({ type: Boolean, attribute: 'trigger-footer-focus' })
  triggerFooterFocus;

  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    window.addEventListener('resize', (event) => {
      this._checkPositioning(event);
    });

    if (this.hasAttribute('preset-prompt-message')) {
      this.setUserMessage = this.presetPromptMessage;
    }
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

    if (changedProperties.has('presetPromptMessage')) {
      this.setUserMessage = this.presetPromptMessage;
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
      detail: { action: 'Chat slot subcomponent had updated' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(chatSlotUpdateEvent);
  }

  /**
   * handle when tab escapes chat
   * @param {event} event - shift tab event from header
   */
  _handleHeaderEscape() {
    const firstTabbableElement = this.shadowRoot?.querySelector(
      clabsPrefix + '-chat-footer'
    );
    if (firstTabbableElement instanceof HTMLElement) {
      const elem = firstTabbableElement.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-search-query'
      );
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
    const firstTabbableElement = this.shadowRoot?.querySelector(
      clabsPrefix + '-chat-header'
    );

    if (firstTabbableElement instanceof HTMLElement) {
      const elem = firstTabbableElement.shadowRoot?.querySelector(
        '#' + clabsPrefix + '--chat-header-overflow-menu-unique'
      );
      if (elem instanceof HTMLElement) {
        const subelem = elem.shadowRoot?.querySelector('#button');
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
      detail: { action: 'Streaming interrupted by user' },
      bubbles: true,
      composed: true,
    });
    this._interruptStreaming = true;
    this.dispatchEvent(chatEndStreamingEvent);
  }

  /**
   * handle when header sends dragstart event
   * @param {event} event - drag start event
   */
  _handleHeaderDragStart(event) {
    const originalOffset = event.detail.offset;
    if (this.enableDocking) {
      this._isDragging = true;
      this.parentElement?.addEventListener('mousemove', (e) => {
        e.preventDefault();
        this._dragChat(e, originalOffset);
      });
      this.parentElement?.addEventListener('mouseup', (e) => {
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
    if (this._isDragging) {
      const chatReference = this.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-container'
      );
      if (chatReference instanceof HTMLElement) {
        const chatHeight = chatReference.clientHeight;
        const chatWidth = chatReference.clientWidth;
        const mininumPadding = { top: 16, bottom: 16, left: 16, right: 16 };
        if (this.dockBoundaries) {
          mininumPadding.top = this.dockBoundaries.top || 16;
          mininumPadding.bottom = this.dockBoundaries.bottom || 16;
          mininumPadding.left = this.dockBoundaries.left || 16;
          mininumPadding.right = this.dockBoundaries.right || 16;
        }

        let newPositionX = this.horizontalDockPosition + originalOffset.x;

        let newPositionY = this.verticalDockPosition + originalOffset.y;

        newPositionX = Math.min(
          Math.max(mininumPadding.right, newPositionX),
          window.innerWidth - mininumPadding.left - chatWidth
        );
        newPositionY = Math.min(
          Math.max(mininumPadding.bottom, newPositionY),
          window.innerHeight - mininumPadding.top - chatHeight
        );

        if (newPositionX && newPositionY) {
          this.verticalDockPosition = newPositionY;
          this.horizontalDockPosition = newPositionX;

          this.style.setProperty(
            '--chat-docked-bottom-position',
            newPositionY + 'px'
          );
          this.style.setProperty(
            '--chat-docked-right-position',
            newPositionX + 'px'
          );
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
        this.style.setProperty(
          '--chat-docked-bottom-position',
          newVerticalPosition + 'px'
        );
      }
      if (window.innerWidth < this.horizontalDockPosition + 320) {
        const newHorizontalPosition = Math.max(
          window.innerWidth - 320 - 16,
          16
        );
        this.horizontalDockPosition = newHorizontalPosition;
        this.style.setProperty(
          '--chat-docked-right-position',
          newHorizontalPosition + 'px'
        );
      }
    }
  }

  /**
   * drag chat event
   * @param {event} event - core mousemove event
   * @param {object} originalOffset - x/y click values from header
   */
  _dragChat(event, originalOffset) {
    if (this._isDragging) {
      if (!this.disableOutsideControl) {
        //document.body.style.userSelect = 'none';
      }
      const chatReference = this.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-container'
      );
      if (chatReference instanceof HTMLElement) {
        const chatHeight = chatReference.clientHeight;
        const chatWidth = chatReference.clientWidth;
        const mininumPadding = { top: 16, bottom: 16, left: 16, right: 16 };
        if (this.dockBoundaries) {
          mininumPadding.top = this.dockBoundaries.top || 16;
          mininumPadding.bottom = this.dockBoundaries.bottom || 16;
          mininumPadding.left = this.dockBoundaries.left || 16;
          mininumPadding.right = this.dockBoundaries.right || 16;
        }

        let newPositionX =
          window.innerWidth - (event.clientX - originalOffset.x) - chatWidth;
        let newPositionY =
          window.innerHeight - (event.clientY - originalOffset.y) - chatHeight;

        let exitCheck = false;
        if (this.cancelDraggingOnEscape) {
          if (
            newPositionX >
            window.innerWidth - mininumPadding.left - chatWidth
          ) {
            exitCheck = true;
          } /*
          if(newPositionX < mininumPadding.right){
            exitCheck = true;
          }
          if(newPositionY > window.innerHeight - mininumPadding.top - chatHeight){
            exitCheck = true;
          }
          if(newPositionY > mininumPadding.bottom){
            exitCheck = true;
          }*/
        }
        newPositionX = Math.min(
          Math.max(mininumPadding.right, newPositionX),
          window.innerWidth - mininumPadding.left - chatWidth
        );
        newPositionY = Math.min(
          Math.max(mininumPadding.bottom, newPositionY),
          window.innerHeight - mininumPadding.top - chatHeight
        );

        if (newPositionX && newPositionY) {
          this.verticalDockPosition = newPositionY;
          this.horizontalDockPosition = newPositionX;
          this.style.setProperty(
            '--chat-docked-bottom-position',
            newPositionY + 'px'
          );
          this.style.setProperty(
            '--chat-docked-right-position',
            newPositionX + 'px'
          );
        }

        if (exitCheck) {
          this._isDragging = false;
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
      //document.body.style.userSelect = 'auto';
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
    this._messages = [
      {
        text: userMessage,
        origin: this.userName,
        hasError: false,
        time: this._getCurrentTime(),
        index: 0,
      },
    ];
    if (botMessage) {
      this._messages = [
        ...this._messages,
        {
          text: botMessage,
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
          index: 1,
        },
      ];
    }

    this._queryInProgress = false;
  }

  /** trigger API call upon text input
   * @param {string} searchQuery - current message being sent
   **/
  async getResults(searchQuery) {
    let response;
    if (this.chosenHost == 'Local') {
      response = await APIPlugin.sendMessageLocal(
        this.apiURL,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this.chosenHost == 'BAM') {
      response = await APIPlugin.sendMessageBAM(
        this.apiURL,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this.chosenHost == 'Watsonx.ai') {
      response = await APIPlugin.sendMessageWatsonX(
        'https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29',
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
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
        detail: { textInputValue: previousMessage },
        bubbles: true,
        composed: true,
      });
      this.sendInput(inputEvent);
    } else {
      event.preventDefault();
      event.detail['previousUserMessage'] = previousMessage;
      event.detail['cutConversationIndex'] = deletionIndex;
      const inputEvent = new CustomEvent('on-user-regeneration-request', {
        detail: event.detail,
        bubbles: true,
        composed: true,
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
        detail: { textInputValue: previousMessage },
        bubbles: true,
        composed: true,
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
        composed: true,
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
      userSubmitted: true,
    };

    if (!this.autoUpdate) {
      const onSubmitEvent = new CustomEvent('on-submit', {
        detail: { message: newMessage },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(onSubmitEvent);
    } else {
      this._messages = [...this._messages, newMessage];

      this._queryInProgress = true;

      this.getResults(value)
        .then((res) => {
          const errorState =
            Object.prototype.hasOwnProperty.call(res, 'failed') &&
            res['failed'] === true;

          if (!this.requestCancelled) {
            if (this.useWatsonAssistantProtocol) {
              const newElements = this._translateWxA(res.reply);
              this._messages = [...this._messages, ...newElements];
            } else {
              this._messages = [
                ...this._messages,
                {
                  text: res.reply,
                  origin: this.agentName,
                  hasError: errorState,
                  time: this._getCurrentTime(),
                  index: this._messages.length,
                },
              ];
            }
            this._queryInProgress = false;
          } else {
            this.requestCancelled = false;
          }
          if (this.temperature) {
            this.temperature = this.originalTemperature;
          }
        })
        .catch(() => {
          if (!this.requestCancelled) {
            this._messages = [
              ...this._messages,
              {
                text: 'Error reaching the model server, try again',
                origin: this.agentName,
                hasError: true,
                time: this._getCurrentTime(),
                index: this._messages.length,
              },
            ];
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
    const temporaryMessageElements: any[] = [];
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
              title: subElement.title,
            },
          });
          break;
        case 'card':
          temporaryMessageElements.push({
            type: 'audio',
            cardElements: {
              link: subElement.source,
              description: subElement.description,
              title: subElement.title,
            },
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
    const mode = event.detail?.fullscreen;
    this.enableDocking = false;
    if (!mode && this.defaultViewingMode === 'minimized') {
      this.enableDocking = true;
    }
    this.enableFullscreen = mode;
    if (!this.disableOutsideControl) {
      //document.body.style.overflow = mode ? 'hidden' : '';
    }
    //this.parentElement.dispatchEvent(new Event('resize'));
  }

  /**
   * handle docking event when header docking event is called
   * @param {event} event - click event from cds button
   */
  _handleDockingMode(event) {
    const mode = event.detail?.docking;
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
      //document.body.style.overflow = '';
    }
  }

  /**
   * handle closing event when header close event is called
   */
  _handleChatOpened() {
    this.closed = false;
    if (!this.disableOutsideControl) {
      //document.body.style.overflow = '';
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
  _getCurrentTime(): string {
    const now = new Date();
    let hours: number = now.getHours();
    const minutes: number = now.getMinutes();

    const militaryTime = true;
    if (militaryTime) {
      const formattedMinutes: string =
        minutes < 10 ? '0' + minutes : minutes.toString();

      const currentTime: string = hours + ':' + formattedMinutes;

      return currentTime;
    } else {
      const amOrpm: string = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12 || 12;
      const formattedMinutes: string =
        minutes < 10 ? '0' + minutes : minutes.toString();

      const currentTime: string = hours + ':' + formattedMinutes + amOrpm;

      return currentTime;
    }
  }
}
