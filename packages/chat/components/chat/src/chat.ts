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

  /** internal LIT function to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
    }

    if (changedProperties.has('conversation')) {
      if (this.conversation) {
        this._messages = [...this.conversation];
        this.requestUpdate();
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
    if (changedProperties.has('_messages')) {
      this.requestUpdate();
    }

    if (changedProperties.has('sampleQuery')) {
      this.initializeExamplesText();
    }

    if (changedProperties.has('_streamResponses')) {
      this.requestUpdate();
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
    this.requestUpdate();
    this.requestUpdate();
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
      this._messages = this._messages.slice(0, deletionIndex);
      const inputEvent = new CustomEvent('user-input', {
        detail: { textInputValue: previousMessage },
        bubbles: true,
        composed: true,
      });
      this.requestUpdate();
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
      this.requestUpdate();
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
   * sendInput - send in the latest user message from the footer element to the api, package it within the messages array and update the DOM
   * @param {event} event - custom feedback event from message subcomponent
   **/
  sendInput(event) {
    const value = event.detail.textInputValue;

    //if streaming is enabled and previously interrupted
    this._interruptStreaming = !this._streamResponses;

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
      this.requestUpdate();

      this.getResults(value)
        .then((res) => {
          const errorState =
            Object.prototype.hasOwnProperty.call(res, 'failed') &&
            res['failed'] === true;

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
          this.requestUpdate();
        })
        .catch(() => {
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
          this.requestUpdate();
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
  }

  /**
   * handle docking event when header docking event is called
   * @param {event} event - click event from cds button
   */
  _handleDockingMode(event) {
    const mode = event.detail?.docking;
    this.enableFullscreen = false;
    this.enableDocking = mode;
  }

  /**
   * handle closing event when header close event is called
   */
  _handleChatClosed() {
    this.closed = true;
    this.requestUpdate();
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
