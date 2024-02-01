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
   * string provided through playground for testing, otherwise .env is preferred
   */
  @property({ type: String, attribute: 'api-key' })
  apiKey;

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
   * string denoting the bot name, default: 'bot' but can be changed to 'Watson' or 'client assistant' or any other name
   */
  @property({ type: String, attribute: 'agent-name' })
  agentName;

  /**
   * string denoting the unique behavior of the model designated by the user, appended to the private system prompt
   */
  @property({ type: String, attribute: 'user-prompt' })
  userPrompt;

  /**
   * string denoting whether to use a light of dark theme
   */
  @property({ type: String, attribute: 'theme' })
  theme;

  /**
   * TESTING: case number to trigger auto generation
   */
  @property({ type: String, attribute: 'sample-query' })
  sampleQuery;

  /**
   * TEST OPTION FOR API CONNECTIONS
   */
  private _selectedApi = 'local';

  /** internal LIT function to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('sampleQuery')) {
      this.initializeExamples();
    }
  }

  /** Initialize examples
   */
  initializeExamples() {
    this._messages = [];
    this.requestUpdate();
    switch (this.sampleQuery) {
      case 'Greetings':
        this._messages.push({
          text: 'Greetings, how may I help you today?',
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        break;
      case 'List of flowers':
        this._messages.push({
          text: 'Can you give me a list of flower images?',
          origin: this.userName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        this._messages.push({
          text: 'Of course, here is a list of flowers:\nCosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        break;
      case 'Chessboard in HTML/CSS':
        this._messages.push({
          text: 'How do I make a Chessboard in HTML/CSS ?',
          origin: this.userName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        this._messages.push({
          text: 'You can make a chessboard in HTML/CSS by using a table element and applying CSS styling to it. Here is an example of how you can create a chessboard using these methods:\n \nHTML:\n```html\n<table>\n  <tbody>\n    <tr>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n    </tr>\n    <tr>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n    </tr>\n    <tr>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n    </tr>\n    <tr>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n    </tr>\n    <tr>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n    </tr>\n    <tr>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n    </tr>\n    <tr>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n      <td class="white"></td>\n      <td class="black"></td>\n    </tr>\n  </tbody>\n</table>\n```\nCSS:\n```css\ntable {\n  border-collapse: collapse;\n}\n \ntd {\n  width: 50px;\n  height: 50px;\n}\n \n.black {\n  background-color: #000;\n}\n \n.white {\n  background-color: #fff;\n}\n```\nThis will create a table with 8 rows and 8 columns, with each cell alternating between black and white. You can adjust the width and height of the cells as needed.\n \nNote: The `border-collapse: collapse;` property is used to remove the spacing between the table cells.',
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        break;
      case 'Python code with images':
        this._messages.push({
          text: 'Give me a function in python to find if a number is prime, then show me two Ulam spirals and annotate them.',
          origin: this.userName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        this._messages.push({
          text: "Certainly, here's how to check if a number is prime in Python:\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n  #base condition\n  if itr == 1:\n    return True\n  #if given number divided by itr or not\n  if number % itr == 0:\n    return False\n  #Recursive function Call\n  if Prime(number,itr-1) == False:\n    return False\n  return True\n```Source: https://www.geeksforgeeks.org/python-program-to-check-whether-a-number-is-prime-or-not/\nAnd here some sample images using Prime numbers to display Ulam Spirals taken from Wikipedia:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ulam_spiral_10x.png/402px-Ulam_spiral_10x.png\nUlam spiral of size 201×201. Black dots represent prime numbers. Diagonal, vertical, and horizontal lines with a high density of prime numbers are clearly visible.\nhttps://upload.wikimedia.org/wikipedia/commons/e/e0/Randomly_black_odd_numbers.png\nFor comparison, a spiral with random odd numbers colored black (at the same density of primes in a 200x200 spiral).\n\nWhat else may I do for you?",
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        break;
    }
    this._queryInProgress = false;
    this.requestUpdate();
    this._updateScroll();
  }

  /** trigger API call upon text input
   * @param {string} searchQuery - current message being sent
   **/
  async getResults(searchQuery) {
    let response;
    if (this._selectedApi == 'local' || this.apiKey !== null) {
      response = await LlamaPluginAPI.sendMessageLocal(
        'http://localhost:5001',
        this.apiKey,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this._selectedApi == 'bam') {
      response = await LlamaPluginAPI.sendMessageBAM(
        this.apiURL,
        this.apiKey,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this._selectedApi == 'watsonx-ai') {
      response = await LlamaPluginAPI.sendMessageWatsonX(
        'https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29',
        this.apiKey,
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
    this._selectedApi = target.value;
  }

  /** send in the latest user message to the api, package it within the messages array and update the DOM
   **/
  _sendInput() {
    const value = this._inputText;
    this._messageText = '';
    this._messages.push({
      text: value,
      origin: this.userName,
      hasError: false,
      time: this._getCurrentTime(),
    });
    this._queryInProgress = true;
    this.requestUpdate();
    this._updateScroll();

    this.getResults(value)
      .then((res) => {
        this._messages.push({
          text: res.reply,
          origin: this.agentName,
          hasError: false,
          time: this._getCurrentTime(),
        });
        this._queryInProgress = false;
        this.requestUpdate();
        this._updateScroll();
      })
      .catch((error) => {
        console.log(error);
        this._messages.push({
          text: 'Error reaching the model server, try again',
          origin: this.agentName,
          hasError: true,
          time: this._getCurrentTime(),
        });
        this._queryInProgress = false;
        this.requestUpdate();
        this._updateScroll();
      });
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

  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    const scrollDiv = this.shadowRoot?.querySelector('.c4ai--chat-messages');
    setTimeout(() => {
      scrollDiv?.scrollTo({
        top: scrollDiv?.scrollHeight,
        behavior: 'smooth',
      });
    }, 200);
  }
}
