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
 * Core message component to display a single message
 */
export default class message extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @state()
  _messageElements: { content: any; type: string }[] = [];

  /**
   * Boolean denoting if user submitted the message or not
   */
  @property({ type: Boolean, attribute: 'user-submitted' })
  userSubmitted;

  /**
   * User-imported message sub-elements object, parsing is done on rawText here if none is provided
   */
  @property({ type: Array, attribute: 'elements', reflect: true })
  elements;

  /**
   * Define name of specific bot or user
   */
  @property({ type: String, attribute: 'display-name' })
  displayName;

  /**
   * Define name of specific bot or user
   */
  @property({ type: Boolean, attribute: 'disable-buttons' })
  disableButtons;

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
   * TEMPORARY: parent theme string to denote current theme used
   */
  @property({ type: String, attribute: 'parent-theme' })
  _parentTheme;

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
   * boolean denoting whether to hide icon on the left
   */
  @property({ type: Boolean, attribute: 'compact-icon' })
  compactIcon;

  /**
   * number value in milliseconds to throttle streaming response
   */
  @property({ type: Number, attribute: 'stream-delay' })
  _streamDelay;

  /**
   * editing state to replace text field with a textarea
   */
  @state()
  _editing = false;

  /**
   * type property displaying agent color
   */
  @property({ type: String, attribute: 'display-color', reflect: true })
  displayColor;

  /**
   * Temporary Light watson icon svg
   */
  @state()
  watsonIconLight =
    '<svg id="watsonx" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="ik7o2yqk8a" x1="1186.526" y1="2863.168" x2="1199.825" y2="2845.109" gradientTransform="matrix(.8312 .55596 -.27409 .40979 -198.894 -1827.398)" gradientUnits="userSpaceOnUse"><stop offset=".3"></stop><stop offset="1" stop-opacity="0"></stop></linearGradient><linearGradient id="9hg0dg6llb" x1="1189.388" y1="2911.794" x2="1200.478" y2="2896.735" gradientTransform="rotate(146.223 380.87 -882.286) scale(1 -.493)" gradientUnits="userSpaceOnUse"><stop offset=".3"></stop><stop offset=".9" stop-opacity="0"></stop></linearGradient><linearGradient id="q1snp4vndc" x1="-4995.033" y1="-20162.835" x2="-4981.733" y2="-20180.895" gradientTransform="rotate(-146.223 -971.422 -5714.55) scale(1 .493)" gradientUnits="userSpaceOnUse"><stop offset=".32"></stop><stop offset=".354" stop-opacity=".798"></stop><stop offset=".7" stop-opacity="0"></stop></linearGradient><linearGradient id="8ak2l80n4e" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#a56eff"></stop><stop offset=".9" stop-color="#0f62fe"></stop></linearGradient><mask id="eelbk9r8md" x="0" y="0" width="32" height="32" maskUnits="userSpaceOnUse"><path d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919C31 7.729 24.272 1 16 1zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" style="fill:#fff;stroke-width:0"></path><path style="fill:url(#ik7o2yqk8a);stroke-width:0" d="M8 9 0 0h16l2.305 3.304L8 9z"></path><path style="fill:url(#9hg0dg6llb);stroke-width:0" d="m12 31 4.386-9L6 21 2 31h10z"></path><path style="fill:url(#q1snp4vndc);stroke-width:0" d="m24 23 8 9H16l-2.304-3.305L24 23z"></path><path style="stroke-width:0" d="M16 31h-4.283L15 22h2l-1 9z"></path></mask></defs><g style="mask:url(#eelbk9r8md)"><path style="fill:url(#8ak2l80n4e);stroke-width:0" d="M0 0h32v32H0z"></path></g><circle cx="6" cy="6" r="2" style="fill:#001d6c;stroke-width:0"></circle><circle cx="26" cy="26" r="2" style="fill:#001d6c;stroke-width:0"></circle><path d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z" style="fill:#001d6c;stroke-width:0"></path></svg>';

  /**
   * Temporary dark watson icon svg
   */
  @state()
  watsonIconDark =
    '<svg id="watsonx" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="8913t7g6za" x1="1196.653" y1="2930.892" x2="1209.953" y2="2912.832" gradientTransform="matrix(.8312 .55596 -.27409 .40979 -188.767 -1860.755)" gradientUnits="userSpaceOnUse"><stop offset=".3"/><stop offset="1" stop-opacity="0"/></linearGradient><linearGradient id="woevpxiuib" x1="1299.261" y1="2844.072" x2="1310.351" y2="2829.012" gradientTransform="rotate(146.223 440.869 -882.286) scale(1 -.493)" gradientUnits="userSpaceOnUse"><stop offset=".3"/><stop offset=".9" stop-opacity="0"/></linearGradient><linearGradient id="je2bg9iagc" x1="-4885.16" y1="-20230.559" x2="-4871.86" y2="-20248.618" gradientTransform="rotate(-146.223 -911.421 -5714.55) scale(1 .493)" gradientUnits="userSpaceOnUse"><stop offset=".32"/><stop offset=".354" stop-opacity=".798"/><stop offset=".7" stop-opacity="0"/></linearGradient><linearGradient id="2co5q30b1e" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#be95ff"/><stop offset=".9" stop-color="#4589ff"/></linearGradient><mask id="brch21jdod" x="0" y="0" width="32" height="32" maskUnits="userSpaceOnUse"><path d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919c0-8.271-6.729-15-15-15zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" style="fill:#fff;stroke-width:0"/><path style="fill:url(#8913t7g6za);stroke-width:0" d="M8 9 0 0h16l2.305 3.305L8 9z"/><path style="fill:url(#woevpxiuib);stroke-width:0" d="m12 31 4.386-9L6 21 2 31h10z"/><path style="fill:url(#je2bg9iagc);stroke-width:0" d="m24 23 8 9H16l-2.305-3.305L24 23z"/><path style="stroke-width:0" d="M16 31h-4.283L15 22h2l-1 9z"/></mask></defs><g style="mask:url(#brch21jdod)"><path style="fill:url(#2co5q30b1e);stroke-width:0" d="M0 0h32v32H0z"/></g><circle cx="6" cy="6" r="2" style="fill:#f4f4f4;stroke-width:0"/><circle cx="26" cy="26" r="2" style="fill:#f4f4f4;stroke-width:0"/><path d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z" style="fill:#f4f4f4;stroke-width:0"/></svg>';

  /**
   * Streaming boolean to accept incomplete raw text and change parsing strategy
   */
  @property({ type: Boolean, attribute: 'stream-content' })
  _streamContent;

  /**
   * Force interruption boolean set when parent changes stream-content attribute to false;
   */
  @state()
  _forceStreamEnd = false;

  /**
   * Temporary element that can morph based on type to preview streaming content
   */
  @state()
  temporaryMessage: { content: any; type: string } = {
    content: '',
    type: 'text',
  };

  /**
   * Index in token array to simulate streaming
   */
  @state()
  streamingIndex = 0;

  /**
   * Token array created from slicing rawText
   */
  @state()
  tokens: string[] = [];

  /**
   * Boolean denoting if streaming is currently attempted
   */
  @state()
  currentlyStreaming = false;

  /**
   * String that increments with tokens added and vut when blocks are identified
   */
  @state()
  bufferMessage = '';

  /**
   * Current Identified block type
   */
  @state()
  currentType = '';

  /**
   * Setinterval function ID to animate token streaming and stop when end of rawtext is reached
   */
  @state()
  streamingInterval;

  /**
   * streaming speed in milliseconds
   */
  @state()
  streamingSpeed;

  /**
   * base streaming speed
   */
  @state()
  baseStreamingSpeed = 10;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this._getTheme();
    if (this.hasAttribute('display-color')) {
      this.style.setProperty(
        '--chat-message-unique-display-color',
        this.displayColor
      );
    }

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

    if (this.elements == null) {
      if (this.userSubmitted) {
        if (this.rawText) {
          this._parseText();
        }
      } else {
        if (this._streamContent) {
          this._streamText();
        } else {
          if (this.rawText) {
            this._parseText();
          }
        }
      }
    } else {
      this._messageElements = this.elements;
      this.requestUpdate();
    }
  }

  /** internal LIT function to detect updates to the DOM tree, used to auto update the messageElements attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('bufferMessage')) {
      const messageUpdateEvent = new CustomEvent('on-structure-change', {
        detail: { action: 'message: internal change' },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(messageUpdateEvent);
    }
    if (changedProperties.has('_streamContent')) {
      this._forceStreamEnd = !this._streamContent;
    }
    if (changedProperties.has('rawText')) {
      if (!this._streamContent) {
        this._parseText();
      }
    }
  }

  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this._parentTheme = darkMode ? 'g100' : 'white';
    }
  }

  /**
   * handleSlotchange - handle edits to slots when an element is placed in it
   * @param {event} event - tag click event sent by tagList element
   */
  _handleSlotchange(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: slotted content added';
    event.preventDefault();
    const messageSlotUpdateEvent = new CustomEvent(
      'on-message-element-slot-update',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(messageSlotUpdateEvent);
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

  /**
   * prepare event detail before passing to parent
   */
  _prepareEventDetail() {
    const nullStateMessage = 'not-specified';
    const eventDetail = {
      messageOrigin: this.origin ? this.origin : nullStateMessage,
      messageTime: this.timeStamp ? this.timeStamp : nullStateMessage,
      displayName: this.displayName ? this.displayName : nullStateMessage,
      messageIndexInChat: this.index,
    };
    return eventDetail;
  }

  /** record tag selection
   * @param {event} event - lit custom event from tagList
   **/
  _onTagSelected(event) {
    const messageDetails = this._prepareEventDetail();
    const content = event.tagContent;
    messageDetails['action'] = 'message: tag in tag list element clicked';
    messageDetails['selectedTagContent'] = content;
    event.preventDefault();
    const tagSelectionEvent = new CustomEvent(
      'on-message-element-tag-selected',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(tagSelectionEvent);
  }

  /**
   * _childLinkClicked - record when link clicked in linkList
   * @param {event} event - lit custom event from linkList
   **/
  _childLinkClicked(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: link-sub-element in message clicked';
    messageDetails['event'] = event;

    messageDetails['selectedURL'] = event.detail.selectedURL;
    messageDetails['selectedTitle'] = event.detail.selectedTitle;

    const linkClickedEvent = new CustomEvent(
      'on-message-link-list-item-click',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(linkClickedEvent);
  }

  /** record element click
   * @param {event} event - lit custom event from sub element click
   **/
  _handleMessageElementClick(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: sub-element in message clicked';
    messageDetails['event'] = event;
    //const selectedElement = this._messageElements[index]
    //messageDetails["elementContent"] = selectedElement.content;
    //messageDetails["elementType"] = selectedElement.type;
    //messageDetails["indexInMessage"] = index;

    event.preventDefault();
    const subElementSelectionEvent = new CustomEvent(
      'on-message-element-selected',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(subElementSelectionEvent);
  }

  /**
   * _checkStreamForBlocks - check if a block has started, if it has only check if it has ended and return the type, content, previous text and status of the parsing
   */
  _checkStreamForBlocks() {
    let result: {
      content: any;
      type: string;
      preBlockText: string;
      status: string;
    };
    if (!this.currentType) {
      result = this._checkBlockStart();
    } else {
      result = this._checkBlockEnd();
    }
    return result;
  }

  /**
   * _checkBlock - scan incoming stream of tokens to see the type of block detected
   * @param {string} blockToCheck - string block to check type of to finalize rendering
   */
  _checkBlockType(blockToCheck) {
    const regexPatterns = {
      code: new RegExp('```'),
      json: new RegExp('\\{'),
      table: new RegExp('((\\w+,\\w+)(,[\\w+]*)*[\\r\\n]+)+'),
      array: new RegExp('(?<!\\))\\['),
      url: new RegExp('(http|ftp)'),
      list: new RegExp('(?:\\d+\\.\\s+|[-*]\\s)'),
      //list: new RegExp('(^|\\n)\\s*(?:[-*\\u2022\\u25E6\\u25AA\\u25CF]\\s|\\s1\\.\\s)','m')
    };

    for (const type in regexPatterns) {
      const match: RegExpMatchArray | null = blockToCheck.match(
        regexPatterns[type]
      );
      if (match) {
        const matchIndex: number = match.index ? match.index : -1;
        if (matchIndex > -1) {
          return type;
        }
      }
    }
    return 'text';
  }

  /**
   * _checkBlockStart - scan incoming stream of tokens to see if a typed block has started
   */
  _checkBlockStart() {
    const analysisPriority = [
      'code',
      'json',
      'formula',
      'table',
      'array',
      'molecule',
      'url',
      'list',
    ];
    const regexPatterns = {
      code: new RegExp('```'),
      json: new RegExp('\\{'),
      table: new RegExp('((\\w+,\\w+)(,[\\w+]*)*[\\r\\n]+)+'),
      array: new RegExp('\\[\\"'),
      formula: new RegExp('\\\\\\('),
      //molecule: new RegExp('^[A-Za-z0-9@+\\-\\[\\]\\(\\)=#%$]+$'),
      //molecule: new RegExp('^[CNOSPFIBrcln=#$%@\\-+\\[\\]()\\/0-9]+$'),
      //molecule: new RegExp('^([BCOHNSPKFYIWcl][a-zA-Z0-9@+\\-\\[\\]\\(\\)=#$%]*)+'),
      //molecule: new RegExp('A-Za-z0-9@#=\\+\\-\\(\\)\\[\\]]+'),
      //annotation: new RegExp('\\[[^\\]]*,'),
      annotation: new RegExp('\\(.*?\\)\\[.*?\\]'),
      //molecule: new RegExp('(?:^|\\s)([BCNOPSFIbcnopsdi0-9@+\\-\\[\\]=#%$\\\\()/.]+)(?=\\s|$)'),
      //molecule: new RegExp('[A-Za-z0-9@+\\-=#$%&\\\\\\/()\\[\\]{}]*$'),
      //molecule: new RegExp('^[A-Za-z0-9@+\\-=#$%&\\\\\\/()\\[\\]{}]*$','g'),
      url: new RegExp('(?<!\\(|,)\\b(http|ftp)\\S+'),
      //url: new RegExp('(?<!\\()(http|ftp)'),
      list: new RegExp('(?:1\\.\\s+[-*]\\s|\\d{2,}\\.\\s+[-*]\\s)'),
      //list: new RegExp('(?:\\d+\\.\\s+|[-*]\\s)'),
      //list: new RegExp('(^|\\n)\\s*(?:[-*\\u2022\\u25E6\\u25AA\\u25CF]\\s|\\s1\\.\\s)','m')
    };

    for (const type of analysisPriority) {
      const match: RegExpMatchArray | null = this.bufferMessage.match(
        regexPatterns[type]
      );
      if (match) {
        const matchIndex: number = match.index ? match.index : -1;
        if (matchIndex > -1) {
          const preBlockText = this.bufferMessage.substring(0, matchIndex);
          const subBuffer: string = this.bufferMessage.substring(matchIndex);
          this.bufferMessage = subBuffer;
          return {
            status: 'started',
            type: type,
            content: this.bufferMessage,
            preBlockText: preBlockText,
          };
        }
      }
    }

    return {
      status: '',
      type: '',
      content: '',
      preBlockText: '',
    };
  }

  /**
   * _checkBlockEnd - if type was identified as being streamed in, look for conditions that indifcate the block is done or a next block has started
   */
  _checkBlockEnd() {
    let stopIndex = -1;
    switch (this.currentType) {
      case 'code': {
        stopIndex = this.bufferMessage.indexOf('```', 3);
        if (stopIndex !== -1) {
          stopIndex += 3;
        }
        break;
      }
      case 'chart':
      case 'json': {
        let offset = 0;
        for (let k = 0; k < this.bufferMessage.length; k++) {
          const char = this.bufferMessage[k];
          if (char === '{') {
            offset++;
          }
          if (char === '}') {
            offset--;
            stopIndex = k;
          }
        }
        if (offset !== 0) {
          stopIndex = -1;
        }
        break;
      }
      case 'array':
      case 'tags':
      case 'carousel':
        stopIndex = this.bufferMessage.indexOf(']');
        break;
      case 'annotation':
        stopIndex = this.bufferMessage.indexOf(')');
        break;
      case 'molecule':
      case 'formula':
      case 'url':
        stopIndex = this.bufferMessage.indexOf('\n');
        break;
      case 'table': {
        /*const tableEnd = this.bufferMessage.match(/^[^\r\n]*(?![\r\n]+(\w+,\w+))/);
        stopIndex = tableEnd ? tableEnd.index : -1;*/
        const CSVLines = this.bufferMessage.split('\n');
        let countIndex = 0;
        let nonCSVcount = 0;
        let previousLength = 9;
        for (const line of CSVLines) {
          if (!new RegExp('^[\\w\\s]+(,[\\w\\s]+)*$').test(line)) {
            nonCSVcount++;
            if (nonCSVcount > 1) {
              stopIndex = countIndex - previousLength;
              break;
            }
          }
          previousLength = line.length + 1;
          countIndex += previousLength;
        }
        break;
      }
      case 'list': {
        //const listEnd = this.bufferMessage.match(/^(?![-*]|\d+\.)\s/m);
        //stopIndex = listEnd ? listEnd.index : -1;
        let nonListCount = 0;
        let listCharacterLength = 0;
        let previousLength = 0;
        const listLines = this.bufferMessage.split('\n');
        for (const listItem of listLines) {
          if (
            !new RegExp(
              '\\s*(?:[-*\\u2022\\u25E6\\u25AA\\u25CF]\\s|\\d+\\.\\s)'
            ).test(listItem)
          ) {
            nonListCount++;
            if (nonListCount > 1) {
              stopIndex = listCharacterLength - previousLength;
              break;
            }
          }
          previousLength = listItem.length + 1;
          listCharacterLength += previousLength;
        }
        break;
      }
    }
    if (stopIndex !== null && stopIndex !== -1) {
      if (
        this.currentType === 'array' ||
        this.currentType === 'carousel' ||
        this.currentType === 'tags' ||
        this.currentType === 'chart' ||
        this.currentType === 'json'
      ) {
        stopIndex++;
      }
      if (this.currentType === 'table') {
        stopIndex--;
      }
      const block = this.bufferMessage.substring(0, stopIndex);
      this.bufferMessage = this.bufferMessage.substring(stopIndex);
      let exitType = this.currentType;

      if (exitType === 'array') {
        try {
          JSON.parse(block);
          exitType = 'carousel';
        } catch (error) {
          exitType = 'tags';
        }
      }

      if (exitType === 'json') {
        if (this.bufferMessage.indexOf('$schema') > -1) {
          exitType = 'chart';
        } else {
          exitType = 'code';
        }
      }
      return {
        status: 'ended',
        type: exitType,
        content: block,
        preBlockText: '',
      };
    }
    return {
      status: 'incomplete',
      type: this.currentType,
      content: this.bufferMessage,
      preBlockText: '',
    };
  }

  /**
   * _checkAmbiguousBlock - change type of block if subtype confirmed
   */
  _checkAmbiguousBlock() {
    if (this.currentType === 'code') {
      const smilesRegex = new RegExp(
        '^[CNOSPFIBrcln=#$%@\\-+\\[\\]()\\/0-9]+$'
      );
      //molecule: new RegExp('^[A-Za-z0-9@+\\-\\[\\]\\(\\)=#%$]+$'),
      //molecule: new RegExp('^[CNOSPFIBrcln=#$%@\\-+\\[\\]()\\/0-9]+$'),
      //molecule: new RegExp('^([BCOHNSPKFYIWcl][a-zA-Z0-9@+\\-\\[\\]\\(\\)=#$%]*)+'),
      //molecule: new RegExp('A-Za-z0-9@#=\\+\\-\\(\\)\\[\\]]+'),
      if (smilesRegex.test(this.bufferMessage.replace('```', ''))) {
        this.currentType = 'molecule';
        this.temporaryMessage.type = 'molecule';
      }
    }
    if (this.currentType === 'json') {
      if (this.bufferMessage.indexOf('$schema') > -1) {
        this.currentType = 'chart';
        this.temporaryMessage.type = 'chart';
      }
    }
    if (this.currentType === 'array') {
      const urlRegex = new RegExp('(https?:\\/\\/[^\\s]+)', 'g');
      const items = this.bufferMessage
        .replace('[', '')
        .replace(new RegExp(',\\s*$'), '')
        .split(',');
      if (items.length > 1) {
        const checkAllURLs = urlRegex.test(items[0]);
        if (checkAllURLs) {
          this.temporaryMessage.type = 'carousel';
          this.currentType = 'carousel';
        } else {
          this.temporaryMessage.type = 'tags';
          this.currentType = 'tags';
        }
      }
    }
  }

  /**
   * Parse Raw Text buffer into elements
   */
  _streamText() {
    console.log('streaming...');
    this.currentlyStreaming = true;
    this.tokens = this._tokenize(this.rawText);
    //this.tokens = [...this.tokens,...['\n  ','\n  ']]
    this.bufferMessage = '';
    this.temporaryMessage = { content: '', type: 'text' };
    this.currentType = '';
    this.baseStreamingSpeed = this._streamDelay || this.baseStreamingSpeed;

    this._beginStreaming();
  }

  /**
   * Begin stream animation
   */
  _beginStreaming() {
    if (this.streamingInterval !== null) {
      clearInterval(this.streamingInterval);
    }

    this.streamingInterval = setTimeout(() => {
      const token = this.tokens[this.streamingIndex] || '';
      this.streamingIndex++;
      this.bufferMessage += token;

      const blockSignal: {
        content: any;
        type: string;
        preBlockText: string;
        status: string;
      } = this._checkStreamForBlocks();

      if (blockSignal) {
        if (blockSignal.type !== '') {
          if (blockSignal.status === 'started') {
            this.currentType = blockSignal.type;
            this.temporaryMessage.content = this.bufferMessage;
            if (blockSignal.type === 'url') {
              this.temporaryMessage.type = 'text';
            } else if (blockSignal.type === 'json') {
              this.temporaryMessage.type = 'code';
            } else if (blockSignal.type === 'array') {
              this.temporaryMessage.type = 'text';
            } else {
              this.temporaryMessage.type = blockSignal.type;
            }
            if (blockSignal.preBlockText.length > 0) {
              if (blockSignal.preBlockText.trim() !== '') {
                this._cutPlainText(blockSignal.preBlockText.trim());
              }
            }
          }
          if (blockSignal.status === 'incomplete') {
            this._checkAmbiguousBlock();
            this.temporaryMessage.content = this.bufferMessage;

            if (blockSignal.type === 'text') {
              const splitter = blockSignal.content.split('\n');
              if (splitter.length > 0) {
                for (let i = 0; i < splitter.length - 1; i++) {
                  const subLine = splitter[i];
                  this._messageElements = [
                    ...this._messageElements,
                    { content: subLine, type: 'text' },
                  ];
                  this.bufferMessage = splitter[splitter.length];
                }
              }
            }
          }
          if (blockSignal.status === 'ended') {
            this.currentType = '';
            this.temporaryMessage.type = 'text';
            if (blockSignal.type === 'url') {
              blockSignal.type = this._checkURLType(blockSignal.content);
            }
            if (blockSignal.type === 'text') {
              this._cutPlainText(blockSignal.content);
            } else {
              this._messageElements = [
                ...this._messageElements,
                { content: blockSignal.content, type: blockSignal.type },
              ];
            }
          }
        } else {
          this.temporaryMessage.content = this.bufferMessage;
          this.temporaryMessage.type = 'text';
        }
      } else {
        this.temporaryMessage.content = this.bufferMessage;
        this.temporaryMessage.type = 'text';
      }

      /*if (this.temporaryMessage.type === 'text') {
        this.temporaryMessage.content += '/';
      }*/

      this.streamingSpeed =
        this.baseStreamingSpeed +
        Math.random() *
          Math.random() *
          Math.random() *
          this.baseStreamingSpeed *
          5;

      switch (this.temporaryMessage.type) {
        case 'code':
          this.streamingSpeed = this.baseStreamingSpeed / 1;
          break;
        case 'table':
          this.streamingSpeed = this.baseStreamingSpeed / 1;
          break;
        case 'carousel':
          this.streamingSpeed = this.baseStreamingSpeed / 1;
          break;
        case 'json':
        case 'chart':
          this.streamingSpeed = this.baseStreamingSpeed / 4;
          break;
        case 'molecule':
          this.streamingSpeed = this.baseStreamingSpeed * 4;
          break;
        case 'text':
          this.streamingSpeed = this.baseStreamingSpeed;
          break;
      }
      this.streamingSpeed = Math.max(1, this.streamingSpeed);

      if (this.streamingIndex >= this.tokens.length || this._forceStreamEnd) {
        if (this.currentlyStreaming) {
          this.currentlyStreaming = false;
          this._beginStreaming();
        } else {
          if (this.temporaryMessage.content.length > 0) {
            const trailingContent = this.temporaryMessage.content;
            const finalSegments = trailingContent.trim().split('\n');
            const lastLine = finalSegments.pop();
            const lastBlockType = this._checkBlockType(lastLine);

            if (lastBlockType !== this.temporaryMessage.type) {
              this._messageElements = [
                ...this._messageElements,
                {
                  content: finalSegments.join('\n').replace(/\.\.\.$/, ''),
                  type: this.temporaryMessage.type,
                },
              ];
              this._messageElements = [
                ...this._messageElements,
                {
                  content: lastLine,
                  type: lastBlockType,
                },
              ];
            } else {
              this._messageElements = [
                ...this._messageElements,
                {
                  content: trailingContent.replace(/\.\.\.$/, ''),
                  type: this.temporaryMessage.type,
                },
              ];
            }
          }
          this.temporaryMessage.content = '';
          this.streamingIndex = 0;
          this._signalEndOfStreaming();
        }
      } else {
        this._beginStreaming();
      }
    }, this.streamingSpeed);
  }

  /** _cutPlainText - cut normal text into subelements to display them as unique items
   * @param {string} plainText - text to parse
   */
  _cutPlainText(plainText) {
    const splitLines = plainText.split('\n');
    const splitLineElements = splitLines.map((line) => ({
      content: line,
      type: this._checkLinks(line) ? 'link-list' : 'text',
    }));
    this._messageElements = [...this._messageElements, ...splitLineElements];
  }

  /** _checkLinks - see if annotated markdown text is strictly a link list
   * @param {string} blockText - text to parse
   */
  _checkLinks(blockText) {
    //const linkListRegex = new RegExp('^\\s*(?:\\[[^\\]]+\\]\\([^\\)+\\)|[^[]+)*\\s*$');
    const linkListRegex = new RegExp(
      '^\\[.*?\\]\\(.*?\\)(,\\[.*?\\]\\(.*?\\))*$'
    );
    return linkListRegex.test(blockText.trim());
  }

  /**
   * _signalEndOfStreaming - send custom event to all parents to signal streaming has been finalized
   */
  _signalEndOfStreaming() {
    const endOfStreamingEvent = new CustomEvent('on-message-streaming-done', {
      detail: { action: 'message component reported end of streaming' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(endOfStreamingEvent);
  }

  /**
   * _tokenize - simulate tokens being streamed in but slicing the rawText string with the harshest cutting threshold
   * @param {string} inputText - text to be split into tokens
   */
  _tokenize(inputText) {
    const tokenizerRegex = new RegExp(
      '(\\s|,|#|\\{|\\}|"|\\[|\\]|%|\'|\\n|\\t|\\/|\\.|_|<|>|:|-|\\(|\\)|\\?|\\||@|&|\\*|\\+|=|;|\\`|~)'
    );
    const tokens = inputText.split(tokenizerRegex);
    return tokens;
  }

  /**
   * Parse Raw Text buffer into elements
   */
  _parseText() {
    this.tokens = this._tokenize(this.rawText);
    this.currentType = '';
    this.bufferMessage = '';

    for (const token of this.tokens) {
      this.bufferMessage += token;

      const blockSignal: {
        content: any;
        type: string;
        preBlockText: string;
        status: string;
      } = this._checkStreamForBlocks();

      if (blockSignal) {
        if (blockSignal.type !== '') {
          if (blockSignal.status === 'started') {
            this.currentType = blockSignal.type;
            if (blockSignal.preBlockText.length > 0) {
              if (blockSignal.preBlockText.trim() !== '') {
                this._messageElements = [
                  ...this._messageElements,
                  { content: blockSignal.preBlockText, type: 'text' },
                ];
              }
            }
          }
          if (blockSignal.status === 'incomplete') {
            this._checkAmbiguousBlock();
          }
          if (blockSignal.status === 'ended') {
            this.currentType = '';
            if (blockSignal.type === 'url') {
              blockSignal.type = this._checkURLType(blockSignal.content);
            }
            this._messageElements = [
              ...this._messageElements,
              { content: blockSignal.content, type: blockSignal.type },
            ];
          }
        }
      }
      this.streamingIndex++;
      if (this.streamingIndex === this.tokens.length) {
        if (this.bufferMessage) {
          this._messageElements = [
            ...this._messageElements,
            { content: this.bufferMessage, type: 'text' },
          ];
        }
      }
    }
  }

  /** parse Raw text param into a sub array of objects to display different elements in a single message block
   **/
  _parseTextOld() {
    const returnedText = this.rawText;
    const subMessages: { content: any; type: string }[] = [];

    const codeSplitter = this._checkForCode(returnedText);

    if (codeSplitter.length == 0 || returnedText == 'undefined') {
      subMessages.push({
        content: 'Model reply received but was undefined.',
        type: 'error',
      });
    } else {
      for (const secondReply of codeSplitter) {
        if (secondReply.type == 'code') {
          subMessages.push(secondReply);
        } else {
          const objectSplitter = this._checkForObjects(secondReply.content);
          for (const thirdReply of objectSplitter) {
            if (thirdReply.type !== 'non-object') {
              subMessages.push(thirdReply);
            } else {
              const urlSplitter = this._checkForURLs(thirdReply.content);
              for (const fourthReply of urlSplitter) {
                if (fourthReply.type == 'text') {
                  //subMessages.push(subSubReply);
                  const formattedList = this._checkForFormatting(
                    fourthReply.content
                  );
                  for (const [index, subItem] of formattedList.entries()) {
                    if (index === formattedList.length - 1) {
                      subMessages.push(subItem);
                    } else {
                      subMessages.push(subItem);
                    }
                  }
                } else {
                  subMessages.push(fourthReply);
                }
              }
            }
          }
        }
      }
    }
    this._messageElements = subMessages;
    this.requestUpdate();
  }

  /** _checkForObjects analyze if objects elements are present and parse them out
   * @param {string} inputText - text block to be checked
   */
  _checkForObjects(inputText) {
    const splitParts: { content: any; type: string }[] = [];
    const splitter = inputText.split('\n');
    let messageChunks: string[] = [];
    for (const item of splitter) {
      try {
        const testJSON = JSON.parse(item);
        const objectType = this._checkObjectType(testJSON);

        if (objectType === 'multi-url') {
          splitParts.concat(
            testJSON.map((url) => ({ content: url, type: 'url' }))
          );
        } else {
          splitParts.push({
            type: objectType,
            content: item,
          });
        }

        if (messageChunks.length > 0) {
          splitParts.push({
            type: 'non-object',
            content: messageChunks.join('\n'),
          });
          messageChunks = [];
        }
      } catch (error) {
        messageChunks.push(item);
      }
    }

    if (messageChunks.length > 0) {
      splitParts.push({
        type: 'non-object',
        content: messageChunks.join('\n'),
      });
      messageChunks = [];
    }

    return splitParts;
  }

  /** _checkObjectType - check what category of JSON object it is
   * @param {object} jsonObject - JSON object to be analyzed and aasigned a type, if array check all objects inside to see if carousel or tags, if not make it code or a chart
   */
  _checkObjectType(jsonObject) {
    let jsonType = 'code';
    if (Array.isArray(jsonObject)) {
      const urlRegex = new RegExp('(https?://[^\\s]+)', 'g');
      const imageRegex = new RegExp('\\.(png|jpg|jpeg|gif|svg)$', 'i');

      const checkAllImages = jsonObject.every(
        (item) => imageRegex.test(item) && typeof item === 'string'
      );
      const checkAllURLs = jsonObject.every(
        (item) => urlRegex.test(item) && typeof item === 'string'
      );

      if (checkAllImages) {
        jsonType = 'carousel';
      } else if (checkAllURLs) {
        jsonType = 'multi-url';
      } else {
        jsonType = 'tags';
      }
    } else {
      if ('$schema' in jsonObject) {
        jsonType = 'chart';
      } else {
        jsonType = 'code';
      }
    }
    return jsonType;
  }

  /** _checkObjectType - check what category of JSON object it is
   * @param {object} urlObject - URL string to be parsed and assigned a type
   */
  _checkURLType(urlObject) {
    const imageRegex = new RegExp(
      '\\.(png|jpg|jpeg|gif|svg|bmp|webp|ico|tiff|tif)$',
      'i'
    );
    const videoRegex = new RegExp(
      '\\.(mp4|avi|flv|mkv|mov|webm|m4v|ogv)$',
      'i'
    );
    const fileRegex = new RegExp(
      '\\.(pdf|doc|docx|csv|xls|xlsx|ppt|pptx|txt|rtf|xml|odt|zip|rar|tar|gz)$',
      'i'
    );
    const audioRegex = new RegExp('\\.(mp3|flac|wav|ogg|mpa|wma|midi)$', 'i');

    const urlRegex = new RegExp('(https?:\\/\\/[^\\s]+)', 'g');

    if (imageRegex.test(urlObject)) {
      return 'img';
    }
    if (videoRegex.test(urlObject)) {
      return 'video';
    }
    if (audioRegex.test(urlObject)) {
      return 'audio';
    }
    if (fileRegex.test(urlObject)) {
      return 'file';
    }
    if (urlRegex.test(urlObject)) {
      return 'url';
    }

    return 'text';
  }

  /** _checkForFormatting analyze if text elements like lists are present and parse them out
   * @param {string} inputText - text block to be checked
   */
  _checkForFormatting(inputText) {
    const splitParts: { content: any; type: string }[] = [];
    //eslint-disable-next-line
    const listRegex = new RegExp('^(?:d+.|[\u2022\u2023\u25E6\u2043-])');
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
    let splitParts: { content: any; type: string }[] = [];
    const urlRegex = new RegExp('(https?:\\/\\/[^\\s]+)', 'g');
    const segments = inputText.split(urlRegex);
    splitParts = segments.map((item) => ({
      content: item,
      type: this._checkURLType(item),
    }));
    return splitParts;
  }

  /** editing function when a user click the edit button
   **/
  _handleEdit() {
    this._editing = true;
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'MESSAGE: User started a message edit';
    const startEditEvent = new CustomEvent('on-user-message-edit-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(startEditEvent);
    this.requestUpdate();

    this.requestUpdate();
  }

  /** record edited changes on message
   * @param {event} event - lit input event
   **/
  _setEditedMessage(event) {
    this._editedMessage = event.detail.value;
  }

  /** editing function when a user click the edit button
   **/
  _cancelEdit() {
    this._editing = false;
    this._editedMessage = '';
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'MESSAGE: User aborted a message edit';
    const cancelledEditEvent = new CustomEvent(
      'on-user-message-cancellation-request',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(cancelledEditEvent);
    this.requestUpdate();
  }

  /** editing function when a user click the edit button
   **/
  _validateEdit() {
    this._editing = false;
    const messageDetails = this._prepareEventDetail();

    messageDetails['action'] = 'message: user edited a previous query';
    messageDetails['newMessage'] = this._editedMessage;
    messageDetails['previousMessage'] = this.rawText;
    this.rawText = this._editedMessage;
    this._messageElements = [{ content: this._editedMessage, type: 'text' }];
    const regenerationEvent = new CustomEvent(
      'on-user-message-update-request',
      {
        detail: messageDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(regenerationEvent);

    this.requestUpdate();
  }

  /** trigger regenerate response event
   * @param {event} event - regeneration event from subelement
   */
  _handleRegenerate(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: user regenerated a chat response';
    //messageDetails['newMessage'] = this._editedMessage;
    //messageDetails['rawTextMessage'] = this.rawText;
    messageDetails['messageElements'] = this._messageElements;
    event.preventDefault();
    const regenerationEvent = new CustomEvent('on-message-regeneration', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(regenerationEvent);
  }

  /** trigger message editing start event
   * @param {event} event - message editing from subelement
   */
  _handleMessageEditStart(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: user edited their message';
    messageDetails['messageElements'] = this._messageElements;
    event.preventDefault();
    const messageEditStartEvent = new CustomEvent('on-message-edit-start', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEditStartEvent);
  }

  /** trigger message editing cancel event
   * @param {event} event - message cancel edit from subelement
   */
  _handleMessageEditCancel(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: user canceled their message edit';
    messageDetails['messageElements'] = this._messageElements;
    event.preventDefault();
    const messageEditCancelEvent = new CustomEvent('on-message-edit-cancel', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEditCancelEvent);
  }

  /** feedback function when a user clicks the feedback button
   * @param {event} event - positive event from thumbs up button
   **/
  _handlePositiveFeedback(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: user gave feedback to response';
    messageDetails['type'] = 'positive';
    messageDetails['rawTextMessage'] = this.rawText;
    messageDetails['messageElements'] = this._messageElements;
    event.preventDefault();
    const feedbackEvent = new CustomEvent('on-user-feedback-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(feedbackEvent);
  }
  /** feedback function when a user clicks the feedback button
   * @param {event} event - negative event from thumbs up button
   **/
  _handleNegativeFeedback(event) {
    const messageDetails = this._prepareEventDetail();
    messageDetails['action'] = 'message: user gave feedback to response';
    messageDetails['type'] = 'negative';
    messageDetails['rawTextMessage'] = this.rawText;
    messageDetails['messageElements'] = this._messageElements;
    event.preventDefault();
    const feedbackEvent = new CustomEvent('on-user-feedback-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(feedbackEvent);
  }
}
