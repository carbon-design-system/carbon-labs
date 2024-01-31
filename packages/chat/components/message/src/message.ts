/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
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
  private _messageElements: { content: any; type: string }[] = [];

  /**
   * string url denoting where the message query will be sent, either BAM or watsonx.ai or any other service
   */
  @property({ type: String, attribute: 'raw-text', reflect: true })
  rawText;

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
   * index indicating position in message list
   */
  @property({ type: Boolean, attribute: 'error-state', reflect: true })
  errorState;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this._parseText();
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

  /** parse Raw text param into a sub array of o0bjects to display different elements in a single message block
   **/
  _parseText() {
    const returnedText = this.rawText;
    const subMessages: { content: any; type: string }[] = [];

    if (this.errorState == false) {
      subMessages.push({ content: returnedText, type: 'error' });
      this._messageElements = subMessages;
      this.requestUpdate();
      return;
    }

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
            subMessages.push(subSubReply);
          }
        }
      }
    }
    console.log(this._messageElements);
    this._messageElements = subMessages;
    this.requestUpdate();
  }

  /** _checkForURLs extract plain and image urls from edxtracted text post code checking
   * @param {string} inputText - text block to be checked for URLs
   */
  _checkForURLs(inputText) {
    const splitParts: { content: any; type: string }[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const imageRegex = /\.(png|jpg|jpeg|gif)$/i;
    const segments = inputText.split(urlRegex);
    for (const segment of segments) {
      const isURL = urlRegex.test(segment);
      const isImageURL = isURL && imageRegex.test(segment);

      if (isImageURL) {
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
   * @param {event} event - lit click event
   * @param {Number} index - selected message index within the messages array
   **/
  _handleEdit(event, index) {
    console.log(event);
    console.log(index);
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
