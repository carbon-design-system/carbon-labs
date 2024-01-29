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
import { LlamaPluginAPI } from '../../../services/LlamaPlugin/index.js';
// @ts-ignore
import styles from './chat.scss?inline';

//const { stablePrefix: c4aiPrefix } = settings;

/**
 * Input component using search typeahead api
 */
export default class C4AIChat extends LitElement {
  static styles = styles;

  /**
   * Core array of message objects to display and interact with, invidual messages are currently described as:
   * {"message":"displayed text", "origin":"can be bot or user, depending on user-defined role names"}
   */
  private _messages: any[] = [];

  /**
   * string variable edited by textInput, auto-updates at every keystroke and is sent to the api url on 'enter' or 'send' button click
   */
  @state()
  _messageText = '';

  /**
   * server side integer denoting the number of messages sent in total
   */
  private _eventNumber = 0;

  /**
   * session ID to ensure no two conversations collide within the server
   */
  private _session = '' + Math.random();

  /**
   * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @state()
  _queryInProgress = false;

  /**
   * current string returned by the input dom object
   **/
  private _inputText = '';

  /**
   * string url denoting where the message query will be sent, either BAM or watsonx.ai or any other service
   */
  @property({ type: String, attribute: 'api-url' })
  apiURL;

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
  @property({ type: String, attribute: 'username' })
  username;

  /**
   * string denoting the bot name, default: 'bot' but can be changed to 'Watson' or 'client assistant' or any other name
   */
  @property({ type: String, attribute: 'agentname' })
  agentname;

  /**
   * string denoting the unique behavior of the model designated by the user, appended to the private system prompt
   */
  @property({ type: String, attribute: 'userprompt' })
  userprompt;

  /**
   * string denoting whether to use a light of dark theme
   */
  @property({ type: String, attribute: 'theme' })
  theme;

  /**
   * TEST OPTION FOR API CONNECTIONS
   */
  private _selectedapi = 'local';

  /** lit property to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** trigger API call upon text input
   * @param {string} searchQuery - current message being sent
   **/
  async getResults(searchQuery) {
    let response;
    if (this._selectedapi == 'local') {
      response = await LlamaPluginAPI.sendMessageLocal(
        'http://localhost:5001',
        this.model,
        this.temperature,
        this.userprompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this._selectedapi == 'bam') {
      response = await LlamaPluginAPI.sendMessageBAM(
        this.apiURL,
        this.model,
        this.temperature,
        this.userprompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this._selectedapi == 'watsonx-ai') {
      response = await LlamaPluginAPI.sendMessageWatsonX(
        'https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29',
        this.model,
        this.temperature,
        this.userprompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    return response;
  }

  /** handle user inputs inside the input field, trigger a search upon an 'enter' key down event
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleInput(event) {
    const { value } = event.target;
    this._inputText = value;
    if (event.key == 'Enter') {
      this._sendInput();
    }
  }

  /** handle test selection to streamline API selection (will be removed soon once CORS errors are dealt with)
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleAPIselection(event) {
    console.log(event);
    const target = event.target.value;
    console.log(target);
    this._selectedapi = target.value;
  }

  /** send in the latest user message to the api, package it within the messages array and update the DOM
   **/
  _sendInput() {
    const value = this._inputText;
    this._messageText = '';
    this._messages.push({
      text: value,
      origin: this.username,
      showButtons: false,
      time: this._getCurrentTime(),
    });
    this._queryInProgress = true;
    this.requestUpdate();
    this._updateScroll();

    this.getResults(value)
      .then((res) => {
        console.log(res);
        const reply = this._checkForCode(res.reply.split('\nundefined')[0]);
        if (reply.length == 0 || res.reply == 'undefined') {
          this._messages.push({
            text: 'Error reaching the server, try again',
            origin: this.agentname,
            showButtons: false,
            style: 'error',
            time: this._getCurrentTime(),
          });
        } else {
          for (const subreply of reply) {
            this._messages.push({
              text: subreply.text,
              origin: this.agentname,
              showButtons: false,
              style: subreply.type,
              time: this._getCurrentTime(),
            });
          }
        }
        this._queryInProgress = false;
        this.requestUpdate();
        this._updateScroll();
      })
      .catch((error) => {
        console.log(error);
        this._messages.push({
          text: 'Error reaching the model server, try again',
          origin: this.agentname,
          showButtons: false,
          style: 'error',
          time: this._getCurrentTime(),
        });
        this._queryInProgress = false;
        this.requestUpdate();
        this._updateScroll();
      });
  }

  /** check the returned model response for a specified code delimiter, split and package the string into multiple messages of type 'text' or 'code'
   * @param {string} string - returned API call response
   **/
  _checkForCode(string) {
    console.log(string);
    console.log(string.includes('```'));
    if (!string.includes('```')) {
      return [{ type: 'text', text: string }];
    }
    const strings = string.split('\n');
    let mode = 'text';
    const splitStrings: any[] = [];
    let currentString: any[] = [];
    let toggler = false;
    for (const ss of strings) {
      if (ss == '```' && mode == 'text') {
        mode = 'code';
        toggler = true;
      } else if (ss == '```' && mode == 'code') {
        mode = 'text';
        toggler = true;
      }
      if (toggler) {
        let subtype = 'text';
        if (mode == 'text') {
          subtype = 'code';
        }
        splitStrings.push({ type: subtype, text: currentString.join('\n') });
        currentString = [];
      } else {
        currentString.push(ss);
      }
      toggler = false;
    }
    return splitStrings;
  }
  /**
   * Set the message text value on input
   * @param {Object} event - event object
   */
  _setMessageText(event) {
    this._messageText = event.target.value;
  }

  /** get time of message formatted as 1:23pm or 4:56am
   **/
  _getCurrentTime(): string {
    const now = new Date();
    let hours: number = now.getHours();
    const minutes: number = now.getMinutes();
    const amOrpm: string = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12;
    const formattedMinutes: string =
      minutes < 10 ? '0' + minutes : minutes.toString();

    const currentTime: string = hours + ':' + formattedMinutes + amOrpm;

    return currentTime;
  }

  /** handle hover event on any message, open up feedback buttons
   * @param {Number} index - index of message within the messages array
   * @param {event} event - lit hover event
   * @param {string} type - type of message being hovered upon
   **/
  _handleHoverIn(index, event, type) {
    console.log(index);
    const object = event.target;
    if (object.className == 'message-container') {
      const dropdown = object.parentElement.querySelector(
        '.' + type + '-dropdown'
      );
      dropdown.style.height = '38px';
      //this.requestUpdate();
    }
  }

  /** handle hover event on any message, open up feedback buttons
   * @param {Number} index - index of message within the messages array
   * @param {event} event - lit hover event
   * @param {string} type - type of message being hovered upon
   **/
  _handleHoverOut(index, event, type) {
    const object = event.target;
    //let target = event.target.firstElementChild;
    const relatedTarget = event.relatedTarget;
    console.log(index);

    if (
      relatedTarget &&
      relatedTarget.className !== 'user-dropdown' &&
      relatedTarget.className !== 'bot-dropdown' &&
      relatedTarget.className !== 'message-container' &&
      relatedTarget.className !== 'message-icon' &&
      relatedTarget.className !== 'message-text' &&
      relatedTarget.className !== 'small-button'
    ) {
      const dropdown = object.parentElement.querySelector(
        '.' + type + '-dropdown'
      );
      dropdown.style.height = '0px';
      //this.requestUpdate();
    }
  }

  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    const scrollDiv = this.shadowRoot?.querySelector('.chat-messages');
    setTimeout(() => {
      scrollDiv?.scrollTo({
        top: scrollDiv?.scrollHeight,
        behavior: 'smooth',
      });
    }, 200);
  }

  /** editing function when a user click the edit button
   * @param {event} event - lit click event
   * @param {Number} index - selected message index within the messages array
   **/
  _handleEdit(event, index) {
    console.log(event);
    console.log(index);
    /*let parent = event.target.parentElement;
    let textDiv = parent.querySelector(".message-text");
    console.log(event);
    console.log(index);*/
  }

  /** feedback function when a user clicks the feedback button
   * @param {event} event - lit click event
   * @param {Number} index - selected message index within the messages array
   * @param {string} type - type of selected div
   * @param {string} message - string text inside div
   **/
  _handleFeedback(event, index, type, message) {
    const url = this.feedbackURL;
    const requestOptions = {
      type: type,
      id: index,
      message: message,
    };
    console.log(event);
    console.log(url);
    console.log(requestOptions);
    /*fetch(url, requestOptions).then(response => response.json())
    .then((response) => {console.log(response)});*/
  }
}
