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
// @ts-ignore
import styles from './message.scss?inline';

/**
 * Input component using search typeahead api
 */
export default class message extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @state()
  _messageElements: { content: any; type: string }[] = [];

  /**
   * User-imported message sub-elements object, parsing is done on rawText here if none is provided
   */
  @property({ type: Object, attribute: 'sub-elements', reflect: true })
  subElements;

  /**
   * Define name of specific bot or user
   */
  @property({ type: String, attribute: 'display-name' })
  displayName;

  /**
   * string url denoting where the message query will be sent, either BAM or watsonx.ai or any other service
   */
  @property({ type: String, attribute: 'raw-text', reflect: true })
  rawText;

  /**
   * string variable edited by textArea
   */
  @state()
  _editedMessage = '';

  /**
   * type property dictating if origin is from user or bot
   */
  @property({ type: String, attribute: 'origin' })
  origin;

  /**
   * type property displaying timestamp of message
   */
  @property({ type: String, attribute: 'time-stamp' })
  timeStamp;

  /**
   * index indicating position in message list
   */
  @property({ type: Number, attribute: 'index' })
  index;

  /**
   * boolean error state indicating if an error occured at any time during fetching or parsing
   */
  @property({ type: Boolean, attribute: 'error-state' })
  errorState;

  /**
   * boolean error state indicating if an error occured at any time during fetching or parsing
   */
  @property({ type: Boolean, attribute: 'loading-state', reflect: true })
  loadingState;

  /**
   * editing state to replace text field with a textarea
   */
  @state()
  _editing = false;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    if (this.loadingState) {
      this._messageElements = [{ content: '', type: 'loading' }];
      this.requestUpdate();
      return;
    }

    if (this.errorState) {
      this._messageElements = [{ content: this.rawText, type: 'error' }];
      this.requestUpdate();
      return;
    }

    if (this.subElements == null) {
      this._parseText();
    } else {
      this._messageElements = this.subElements;
      this.requestUpdate();
    }
  }

  /** internal LIT function to detect updates to the DOM tree, used to auto update the messageElements attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_messageElements')) {
      const messageUpdateEvent = new CustomEvent('message-updated', {
        detail: { index: this.index, messageElements: this._messageElements },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(messageUpdateEvent);
    }
  }

  /** check the returned model response for a specified code delimiter, split and package the string into multiple messages of type 'text' or 'code'
   * @param {string} string - returned API call response
   **/
  _checkForCode(string) {
    const delimiter = '```';
    const segments = string.split(delimiter);
    const splitParts: { content: any; type: string }[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i].trim();
      if (i % 2 === 0) {
        if (segment.length > 0) {
          splitParts.push({ content: segment, type: 'text' });
        }
      } else {
        if (segment.length > 0) {
          splitParts.push({ content: segment, type: 'code' });
        }
      }
    }
    return splitParts;
  }

  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getShortenedURL(url) {
    try {
      const host = new URL(url).host;
      return host;
    } catch (error) {
      return 'Site url';
    }
  }

  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getSiteName(url) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
      const formattedName = domain.charAt(0).toUpperCase() + domain.slice(1);
      return formattedName;
    } catch (error) {
      return 'Site name';
    }
  }

  /** parse Raw text param into a sub array of objects to display different elements in a single message block
   **/
  _parseText() {
    const returnedText = this.rawText;
    const subMessages: { content: any; type: string }[] = [];

    const codeSplitter = this._checkForCode(returnedText);

    if (codeSplitter.length == 0 || returnedText == 'undefined') {
      subMessages.push({
        content: 'Model reply received but was undefined.',
        type: 'error',
      });
    } else {
      for (const subReply of codeSplitter) {
        if (subReply.type == 'code') {
          subMessages.push(subReply);
        } else {
          const urlSplitter = this._checkForURLs(subReply.content);
          for (const subSubReply of urlSplitter) {
            if (subSubReply.type == 'text') {
              //subMessages.push(subSubReply);
              const formattedList = this._checkForFormatting(
                subSubReply.content
              );
              for (const subItem of formattedList) {
                subMessages.push(subItem);
              }
            } else {
              subMessages.push(subSubReply);
            }
          }
        }
      }
    }
    this._messageElements = subMessages;
    this.requestUpdate();
  }

  /** _checkForFormatting analyze if text elements like lists are present and parse them out
   * @param {string} inputText - text block to be checked
   */
  _checkForFormatting(inputText) {
    const splitParts: { content: any; type: string }[] = [];
    //const listRegex = /^(?:\d+\.|[\u2022\u2023\u25E6\u2043\-]|(?:[a-zA-Z]|\d+)\s*=?)/;
    //eslint-disable-next-line
    const listRegex = /^(?:\d+\.|[\u2022\u2023\u25E6\u2043\-])/;
    const splitMatches: string[] = inputText.split('\n');

    let currentType = '';
    let tempString = '';
    for (const match of splitMatches) {
      const itemType = listRegex.test(match) ? 'list' : 'text';
      if (currentType === '') {
        currentType = itemType;
        tempString += match;
      } else if (itemType === currentType) {
        tempString += '\n' + match;
      } else {
        splitParts.push({ type: currentType, content: tempString.trim() });
        tempString = match;
        currentType = itemType;
      }
    }

    if (tempString !== '') {
      splitParts.push({
        type: listRegex.test(tempString) ? 'list' : 'text',
        content: tempString,
      });
    }
    return splitParts;
  }

  /** _checkForURLs extract plain and image urls from edxtracted text post code checking
   * @param {string} inputText - text block to be checked for URLs
   */
  _checkForURLs(inputText) {
    const splitParts: { content: any; type: string }[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const imageRegex = /\.(png|jpg|jpeg|gif)$/i;
    const videoRegex = /\.(mp4|webm|mkv|mov|wmv|avi)$/i;
    const segments = inputText.split(urlRegex);
    for (const segment of segments) {
      const isURL = urlRegex.test(segment);
      const isImageURL = isURL && imageRegex.test(segment);
      const isvideoURL = isURL && videoRegex.test(segment);

      if (isvideoURL) {
        splitParts.push({ content: segment, type: 'video' });
      } else if (isImageURL) {
        splitParts.push({ content: segment, type: 'img' });
      } else if (isURL) {
        splitParts.push({ content: segment, type: 'url' });
      } else {
        splitParts.push({ content: segment, type: 'text' });
      }
    }
    return splitParts;
  }

  /** editing function when a user click the edit button
   **/
  _handleEdit() {
    this._editing = true;
    this.requestUpdate();
  }

  /** record edited changes on message
   * @param {event} event - lit input event
   **/
  _setEditedMessage(event) {
    this._editedMessage = event.target.value;
  }

  /** editing function when a user click the edit button
   **/
  _cancelEdit() {
    this._editing = false;
    this._editedMessage = '';
    this.requestUpdate();
  }

  /** editing function when a user click the edit button
   **/
  _validateEdit() {
    this._editing = false;
    this.rawText = this._editedMessage;
    this._messageElements = [{ content: this._editedMessage, type: 'text' }];
    const regenerationEvent = new CustomEvent('regenerate', {
      detail: { index: this.index, message: this.rawText },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(regenerationEvent);
    this.requestUpdate();
  }

  /** trigger regenerate response event
   */
  _handleRegenerate() {
    const regenerationEvent = new CustomEvent('regenerate', {
      detail: { index: this.index, message: null },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(regenerationEvent);
  }

  /** format text to properly display in HTML
   * @param {string} inputText - text to be rendered in subelement
   */
  _formatText(inputText) {
    let formattedText = inputText.replace(/\t/g, '&nbsp;&nbsp;');
    formattedText = formattedText.replace(/\n/g, '<br>');
    return formattedText;
  }

  /** format list text into html list object
   * @param {string} inputText - text to be rendered in subelement
   */
  _formatList(inputText) {
    const items = inputText.split('\n');
    return (
      '<ul>' + items.map((item) => '<li>' + item + '</li>').join('') + '</ul>'
    );
  }

  /** format code to properly display in HTML
   * @param {string} inputText - text to be rendered in subelement
   */
  _formatCode(inputText) {
    //const commentRegex = /\/\/;*|\/\*[^]*?\*\/|#.*|<!--[\s\S]*?-->/g;

    let formattedText = inputText.replace(/\t/g, '&nbsp;&nbsp;');
    /*formattedText = formattedText.replace(commentRegex, (match) => {
      match = match.trim();
      return '<div class="comment">' + match + '</div>';
    });*/
    formattedText = formattedText.replace(/\n/g, '<br>');
    return formattedText;
  }

  /** feedback function when a user clicks the feedback button
   * @param {event} event - lit click event
   * @param {Number} index - selected message index within the messages array
   * @param {string} type - type of selected div
   * @param {string} message - string text inside div
   **/
  _handleFeedback(event, index, type, message) {
    const url = 'xxx';
    const requestOptions = {
      type: type,
      id: index,
      message: message,
    };
    console.log(event);
    console.log(url);
    console.log(requestOptions);
  }
}
