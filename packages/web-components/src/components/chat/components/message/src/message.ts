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

import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

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
   * Boolean denoting if message is small annotation
   */
  @property({ type: Boolean, attribute: 'separator' })
  isSeparator;

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
   * Define name of specific bot or user
   */
  @property({ type: Boolean, attribute: 'disable-feedback-buttons' })
  disableFeedbackButtons;

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
   * showFeedbackForm - message decides if selecting feedback buttons displays the full form
   */
  @state()
  showFeedBackForm = false;

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
   * Streaming boolean to accept incomplete raw text and change parsing strategy
   */
  @property({ type: Boolean, attribute: 'stream-content' })
  _streamContent;

  /**
   * Boolean to allow feedback forms to appear
   */
  @property({ type: Boolean, attribute: 'enable-complex-feedback' })
  enableComplexFeedback;

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
  baseStreamingSpeed = 6;

  /**
   * feedbackFormTarget - div object to give to popup
   */
  @state()
  feedbackFormTarget;

  /**
   * selection state for thumbs up
   */
  @state()
  positiveFeedbackSelected = false;

  /**
   * selection state for thumbs down
   */
  @state()
  negativeFeedbackSelected = false;

  /** JSON dictionary of items describing feedback values
   */
  @property({ type: Object, attribute: 'feedbackFormDefinitions' })
  feedbackFormDefinitions;

  /** Desired feedback top/bottom orientation
   */
  @state()
  _feedbackFormOrientation = 'top';

  /**
   * current user defined feedback form values (title, selections etcc...)
   */
  @state()
  _feedbackFormValues;

  /**
   * target DOM element for popup
   */
  @state()
  popupTargetElement;

  /**
   * unique id to tie feedback together
   */
  @state()
  uniqueFeedbackId;

  /**
   * custom label presets
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  @state()
  _readerContent;

  @state()
  previousMessageWidth;

  @state()
  uniqueIconId;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this.uniqueIconId = this.generateUniqueId();
    this._getTheme();
    if (this.hasAttribute('display-color')) {
      this.style.setProperty(
        '--chat-message-unique-display-color',
        this.displayColor
      );
    }

    if (this.loadingState) {
      this._messageElements = [{ content: '', type: 'loading' }];

      return;
    }

    if (this.errorState) {
      this._messageElements = [{ content: this.rawText, type: 'error' }];

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
            //this._parseText();
          }
        }
      }
    } else {
      this._messageElements = this.elements;
      //this._readerContent = this._prepareReaderText(this.elements);
    }
  }

  /** _prepareReaderText - convert obecjts into readable text
   * @param {Object} elements -  array of objects
   */
  _prepareReaderText(elements) {
    let textToRead = '';
    /*const userElement = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-message-response-user'
    );
    const botElement = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-message-response-bot'
    );
    if(userElement instanceof HTMLElement){
      console.log('user')
      textToRead = userElement.textContent || userElement.innerText || '';
    }else if(botElement instanceof HTMLElement){
      console.log('bot')
      console.log(botElement)
      textToRead = botElement.textContent || botElement.innerText || '';
    }else{
      console.log('fail')
      textToRead = elements.map((element) => element.content).join('\n');
    }*/
    if (elements.length == 1) {
      if (elements[0]?.type === 'loading') {
        return this._renderLabel('message-loading-aria-label');
      }
    }
    textToRead = elements.map((element) => element.content).join('\n');
    const tagRegex = '<[^>]*>';
    const extrasRegex = '<(script|style)[^>]*>[\\s\\S]*?<\\/\\1>';

    const cleanText = textToRead.replace(new RegExp(extrasRegex, 'gi'), '');
    const pureText = cleanText.replace(new RegExp(tagRegex, 'g'), '');
    return pureText.trim();
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
      //this._readerContent = this.rawText;
      if (!this._streamContent) {
        this._parseText();
      }
    }
    if (changedProperties.has('_messageElements')) {
      this._readerContent = this._prepareReaderText(this._messageElements);
    }
    if (changedProperties.has('compactIcon')) {
      this.showFeedBackForm = false;
    }
    if (changedProperties.has('_readerContent')) {
      setTimeout(() => {
        /*const hiddenLabel = this.shadowRoot?.querySelector(
          '.' + clabsPrefix + '--chat-message-hidden-label'
        );
        if (hiddenLabel instanceof HTMLElement) {
          hiddenLabel.setAttribute('role', 'alert');
          setTimeout(() => {
            hiddenLabel.setAttribute('role', 'heading');
          }, 1000);
        }*/
      }, 200);
    }
  }

  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      let darkMode = false;
      if (
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2
      ) {
        darkMode = true;
      }

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

  /** _hideFeedBackForm -  hide popup subelement
   *
   **/
  _hideFeedBackForm() {
    this.showFeedBackForm = false;
  }

  /**
   * generateUniqueId - create random string to give unique feedback signature
   */
  generateUniqueId() {
    const randomString: string = Math.random().toString(36).substr(2, 9);
    return randomString;
  }

  /**  _handleDisplayFeedBackForm - target div and place popup appropriately
   * @param {event} event - target button click event
   * @param {string} type - thumbs up or down or custom
   * @param {string} uniqueId - unique code for event
   **/
  _handleDisplayFeedBackForm(event, type, uniqueId) {
    const targetItem = event.target;
    this.popupTargetElement = targetItem;
    //const boundingRect = targetItem.getBoundingClientRect();
    event.preventDefault();
    const mainHeight = this.parentElement?.parentElement?.scrollHeight;

    if (this.feedbackFormDefinitions) {
      this._feedbackFormValues = this.feedbackFormDefinitions[type];
      this._feedbackFormValues.uniqueFeedbackId = this.uniqueFeedbackId;
      this._feedbackFormValues.parentValues = {
        offsetTop: this.offsetTop,
        scrollHeight: mainHeight,
        uniqueId: uniqueId,
      };
    }
    this.showFeedBackForm = true;
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
    const textElement = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-message-response-user'
    );
    let previousWidth = this.clientWidth;
    if (textElement instanceof HTMLElement) {
      previousWidth = textElement.clientWidth;
    }
    this._editing = true;
    const messageDetails = this._prepareEventDetail();
    this.previousMessageWidth = previousWidth;
    messageDetails['action'] = 'MESSAGE: User started a message edit';
    const startEditEvent = new CustomEvent('on-user-message-edit-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(startEditEvent);
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

  /** feedback function when a user navigates by keyboard and selects the feedback button
   * @param {event} event - positive event from thumbs up button
   **/
  handlePositiveKeyboardInput(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._handlePositiveFeedback(event);
      event.preventDefault();
    }
  }

  /** feedback function when a user navigates by keyboard and selects the feedback button
   * @param {event} event - positive event from thumbs up button
   **/
  handleNegativeKeyboardInput(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._handleNegativeFeedback(event);
      event.preventDefault();
    }
  }

  /**
   * focus on popup element with aria system
   */
  _focusOnPopup() {
    const popUpId = clabsPrefix + '--chat-popup-unique-feedback-' + this.index;
    const popupElement = this.shadowRoot?.getElementById(popUpId);
    if (popupElement instanceof HTMLElement) {
      popupElement.focus();
    }
  }

  /** feedback function when a user clicks the feedback button
   * @param {event} event - positive event from thumbs up button
   **/
  _handlePositiveFeedback(event) {
    const uniqueFeedbackId = this.generateUniqueId();
    this.positiveFeedbackSelected = !this.positiveFeedbackSelected;
    this.negativeFeedbackSelected = false;

    const messageDetails = this._prepareEventDetail();
    if (this.positiveFeedbackSelected) {
      messageDetails['action'] = 'message: user gave feedback to response';

      messageDetails['feedbackRetracted'] = false;
      this._focusOnPopup();
    } else {
      messageDetails['action'] = 'message: user removed feedback to response';

      messageDetails['feedbackRetracted'] = true;
    }
    messageDetails['type'] = 'positive';
    messageDetails['rawTextMessage'] = this.rawText;
    messageDetails['messageElements'] = this._messageElements;
    messageDetails['originalEvent'] = event;
    messageDetails['feedbackId'] = uniqueFeedbackId;
    event.preventDefault();
    const feedbackEvent = new CustomEvent('on-user-feedback-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(feedbackEvent);
    if (this.positiveFeedbackSelected) {
      this._handleDisplayFeedBackForm(event, 'thumbs-up', uniqueFeedbackId);
    } else {
      this._hideFeedBackForm();
    }
  }
  /** feedback function when a user clicks the feedback button
   * @param {event} event - negative event from thumbs up button
   **/
  _handleNegativeFeedback(event) {
    const uniqueFeedbackId = this.generateUniqueId();
    this.positiveFeedbackSelected = false;
    this.negativeFeedbackSelected = !this.negativeFeedbackSelected;
    const messageDetails = this._prepareEventDetail();
    if (this.negativeFeedbackSelected) {
      messageDetails['action'] = 'message: user gave feedback to response';
      messageDetails['feedbackRetracted'] = false;
      this._focusOnPopup();
    } else {
      messageDetails['action'] = 'message: user removed feedback to response';
      messageDetails['feedbackRetracted'] = true;
    }
    messageDetails['type'] = 'negative';
    messageDetails['rawTextMessage'] = this.rawText;
    messageDetails['messageElements'] = this._messageElements;
    messageDetails['originalEvent'] = event;
    messageDetails['feedbackId'] = uniqueFeedbackId;
    event.preventDefault();
    const feedbackEvent = new CustomEvent('on-user-feedback-request', {
      detail: messageDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(feedbackEvent);
    if (this.negativeFeedbackSelected) {
      this._handleDisplayFeedBackForm(event, 'thumbs-down', uniqueFeedbackId);
    } else {
      this._hideFeedBackForm();
    }
  }

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - dictionary key for label
   */
  _renderLabel = (key) => {
    let customValue;
    const labels = this.customLabels || {};
    if (labels) {
      switch (key) {
        case 'message-regenerate-button':
          customValue = labels[key] || 'Regenerate';
          break;
        case 'message-like-button':
          customValue = labels[key] || 'Thumbs up';
          break;
        case 'message-undo-like-button':
          customValue = labels[key] || 'Remove thumbs up';
          break;
        case 'message-dislike-button':
          customValue = labels[key] || 'Thumbs down';
          break;
        case 'message-undo-dislike-button':
          customValue = labels[key] || 'Remove thumbs down';
          break;
        case 'message-enable-editing':
          customValue = labels[key] || 'Edit';
          break;
        case 'message-undo-edit':
          customValue = labels[key] || 'Undo edit';
          break;
        case 'message-validate-edit':
          customValue = labels[key] || 'Validate edit';
          break;
        case 'message-loading-aria-label':
          customValue = labels[key] || 'Message sent, please wait...';
          break;
        case 'message-feedback-disabled':
          customValue = labels[key] || 'Feedback sent';
      }
    }
    return customValue || key;
  };
}
