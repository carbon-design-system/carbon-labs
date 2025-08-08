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
import styles from './textElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class textElement extends LitElement {
  static styles = styles;

  /**
   * Content text to display in textElement
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Content text to display in textElement
   */
  @property({ type: Boolean, attribute: 'align-right' })
  alignRight;

  /**
   * Capitalization boolean to edit AI returned text or not
   */
  @property({ type: Boolean, attribute: 'capitalize' })
  capitalize;

  /**
   * Highlight color chosen by user
   */
  @property({ type: String, attribute: 'text-highlight-color' })
  textHighlightColor;

  /**
   * Annotation boolean to append citation events/styling
   */
  @property({ type: Boolean, attribute: 'enable-annotations' })
  enableAnnotations;

  /**
   * remove all chevrons and dropdowns, put carousel at the end
   */
  @property({ type: Boolean, attribute: 'enable-summarization' })
  enableSummarization;

  /**
   * html boolean to render html content (TEMPORARY, for experimental use only)
   */
  @property({ type: Boolean, attribute: 'enable-html-rendering' })
  enableHtmlRendering = false;

  /**
   * enableTextHighlighting - show colored background for text
   */
  @property({ type: Boolean, attribute: 'enable-text-highlighting' })
  enableTextHighlighting;

  /**
   * Newline boolean to disable splitting text by newlines
   */
  @property({ type: Boolean, attribute: 'disable-new-lines' })
  disableNewLines = false;

  /**
   * Feedback mode is enabled
   */
  @property({ type: Boolean, attribute: 'enable-complex-feedback' })
  enableComplexFeedback;

  /**
   * Hide chevron buttons
   */
  @property({ type: Boolean, attribute: 'disable-chevrons' })
  disableChevrons;

  /**
   * Internal element array to be rendered
   */
  @state()
  _textElements: {
    text: string;
    type: string;
    active: boolean;
    content: string;
  }[] = [];

  /**
   * External element array to be rendered
   */
  @property({ type: Array, attribute: 'textSubElements' })
  textSubElements: {
    text: string;
    type: string;
    active: boolean;
    content: string;
    color: string;
  }[] = [];

  /**
   * highlightCard data url
   */
  @state()
  _annotationURLs;

  /**
   * annotation url list
   */
  @state()
  _annotationList;

  /**
   * target annotation index
   */
  @state()
  _annotationIndex;

  /**
   * show summarizations or not
   */
  @state()
  _showSummarization = false;

  /**
   * translate textpiece ids to annotation IDs
   */
  @state()
  _translationRegistry: { annotationIndex: number; subElementIndex: number }[] =
    [];

  /**
   * selected annotation index in order of appearence
   */
  @state()
  selectedAnnotationIndex;

  /**
   * Streaming flag from message parent
   */
  @property({ type: Boolean, attribute: 'streaming' })
  streaming;

  /**
   * Spliced sub element list of plain text to fade in text
   */
  @state()
  _animationList: {
    text: string;
    type: string;
    active: boolean;
    content: string;
    color: string;
  }[] = [];

  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    if (this.textSubElements?.length > 1) {
      this._textElements = this.textSubElements;
    } else {
      if (this.content) {
        this._formatText();
      }
    }

    if (this.hasAttribute('enable-summarization')) {
      this.disableChevrons = true;
    }

    if (this.hasAttribute('text-highlight-color')) {
      this.style.setProperty(
        '--chat-text-element-highlight-color',
        this.textHighlightColor
      );
    }

    this.style.setProperty(
      '--chat-text-content-annotation-element-height',
      '0px'
    );
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (
      changedProperties.has('content') &&
      !(this.textSubElements.length > 0)
    ) {
      this._formatText();
    }
  }

  /** updateHighlightTarget - when the carousel element returns a change event, update current highlight
   * @param {event} event - slide event
   */
  _updateHighlightTarget(event) {
    const carouselIndex = event?.detail?.currentIndex;
    if (carouselIndex >= 0) {
      const foundItem = this._translationRegistry.find(
        (item) => item.annotationIndex === carouselIndex + 1
      );

      this._textElements.forEach((element) => {
        element.active = false;
      });
      if (foundItem || foundItem === 0) {
        const registryID = foundItem.subElementIndex;
        if (typeof registryID === 'number') {
          this._textElements[registryID - 1].active = true;
        }
      }

      this.requestUpdate();
    }
  }

  /**
   * _toggleSummarization - toggle whether to show summarization or not
   */
  _toggleSummarization() {
    this._showSummarization = !this._showSummarization;
    if (!this._showSummarization) {
      this._textElements.forEach((element) => {
        element.active = false;
      });
    } else {
      if (!this.selectedAnnotationIndex) {
        this.selectedAnnotationIndex = 0;
      }
      const trueAnnotationIndex = this.selectedAnnotationIndex + 1;
      const foundItem = this._translationRegistry.find(
        (item) => item.annotationIndex === trueAnnotationIndex
      );
      if (foundItem) {
        const registryID = foundItem.subElementIndex;
        if (typeof registryID === 'number') {
          this._textElements[registryID - 1].active = true;
          setTimeout(() => {
            this.style.setProperty(
              '--chat-text-content-annotation-element-height',
              '400px'
            );
          }, 20);
        }
      }
    }
  }

  /** _handleAnnotationClick - open and load Card element when annotation dropdown clicked
   * @param {event} event - click event
   */
  _handleAnnotationClick(event) {
    const targetElement =
      event?.originalTarget || event?.target || event?.srcElement;
    const source = targetElement?.dataset?.source;
    this.style.setProperty(
      '--chat-text-content-annotation-element-height',
      '0px'
    );

    const index = targetElement?.dataset?.index;

    const annotationClickEventDetails = {
      originalEvent: event,
      annotationContent: source,
      indexInElementsArray: index,
      elementsArray: this._textElements,
    };
    if (index) {
      this._textElements.forEach((element, elementIndex) => {
        if (elementIndex !== parseInt(index)) {
          element.active = false;
        }
      });
      this._textElements[parseInt(index)].active =
        !this._textElements[parseInt(index)].active;

      if (this._textElements[parseInt(index)].active) {
        annotationClickEventDetails['action'] = 'annotation popup closed';
        this._showSummarization = true;
      } else {
        annotationClickEventDetails['action'] = 'annotation popup opened';
        this._showSummarization = false;
      }
      annotationClickEventDetails['isOpened'] =
        this._textElements[parseInt(index)].active;
      annotationClickEventDetails['textContent'] =
        this._textElements[parseInt(index)].text;

      if (this._textElements[parseInt(index)].active) {
        if (source) {
          this._annotationURLs = this._arrangeSources(source);
          setTimeout(() => {
            this.style.setProperty(
              '--chat-text-content-annotation-element-height',
              '400px'
            );
          }, 20);
          this._annotationIndex = parseInt(index);
        } else {
          this._annotationURLs = null;
          this._annotationIndex = null;
        }
      } else {
        this._annotationURLs = null;
        this._annotationIndex = null;
      }

      const foundItem = this._translationRegistry.find(
        (item) => item.subElementIndex === parseInt(index) + 1
      );
      if (typeof foundItem?.annotationIndex === 'number') {
        if (foundItem) {
          this.selectedAnnotationIndex = foundItem.annotationIndex - 1;
          this.requestUpdate();
        }
      }
    }

    const annotationClickEvent = new CustomEvent('on-text-annotation-click', {
      detail: annotationClickEventDetails,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(annotationClickEvent);
  }

  /** _arrangeSources - cut content into array of sources
   * @param {string} content - string content to be sliced
   */
  _arrangeSources(content) {
    return content.split(',');
  }

  /** _capitalizeText - capitalize incoming string when flag is enabled
   * @param {string} text - text to capitalize and return
   */
  _capitalizeText(text) {
    const lines = text.split(/(?<=[.!?]\s)|(?<=\n)/g);
    const capitalizedLines = lines.map(
      (line) =>
        line.trimStart().charAt(0).toUpperCase() + line.trimStart().slice(1)
    );
    return capitalizedLines.join('');
  }

  /** _formatText - slice text content when markdowns are detected
   */
  _formatText() {
    const annotationRegex = new RegExp(
      '(\\[([^\\]]+)\\]\\(([^)]+)\\))|([^\\[]+)',
      'g'
    );
    const temporaryAnnotationList: string[] = [];
    const temporaryTextArray: {
      text: string;
      type: string;
      active: boolean;
      content: string;
    }[] = [];
    let regexResult;
    const inputText = this.content;
    const newLines = inputText.trim().split('\n');
    for (const newLine of newLines) {
      while ((regexResult = annotationRegex.exec(newLine)) != null) {
        if (regexResult[1]) {
          temporaryTextArray.push({
            text: regexResult[2],
            type: 'annotation',
            content: regexResult[3],
            active: false,
          });
          temporaryAnnotationList.push(regexResult[3]);
          this._translationRegistry.push({
            annotationIndex: temporaryAnnotationList.length,
            subElementIndex: temporaryTextArray.length,
          });
        } else if (regexResult[4]) {
          const checkHtmlContent = this._checkForHTML(regexResult[4]);
          const textType =
            enableHtmlRendering && checkHtmlContent ? 'html' : 'default';
          const currentLine = regexResult[4];
          temporaryTextArray.push({
            text: this.capitalize
              ? this._capitalizeText(currentLine)
              : currentLine,
            type: textType,
            active: false,
            content: '',
          });
        }
      }
      if (!this.disableNewLines && !this.streaming) {
        if (temporaryTextArray.length > 1) {
          if (temporaryTextArray[temporaryTextArray.length - 1]) {
            const prevObject =
              temporaryTextArray[temporaryTextArray.length - 1];
            if (prevObject?.type === 'new-line') {
              continue;
            }
          }
        }
        temporaryTextArray.push({
          text: '',
          type: 'new-line',
          active: false,
          content: '',
        });
      }
    }
    this._annotationList = temporaryAnnotationList;
    if (this.streaming) {
      this._animateFadeIn(temporaryTextArray);
    } else {
      if (this._annotationList.length > 0) {
        //this.enableSummarization = true;
        //this.disableChevrons = true;
      }
      this._textElements = temporaryTextArray;
    }
  }

  /**
   * _animateFadeIn() - bring in new text one by one
   * @param { object } temporaryTextArray - array of text elements
   */
  _animateFadeIn(temporaryTextArray) {
    const animationList: {
      text: string;
      type: string;
      active: boolean;
      content: string;
    }[] = [];
    for (const item of temporaryTextArray) {
      if (item.type === 'default') {
        const words = item.text.split(' ');
        for (const word of words) {
          animationList.push({
            text: word + ' ',
            type: 'default',
            content: '',
            active: false,
          });
        }
      } else {
        animationList.push(item);
      }
    }
    this._textElements = animationList;
  }

  /**
   * _checkForHTML - see if complete html is present in text block
   * @param {string} text - text to be checked for html tags
   */
  _checkForHTML(text) {
    //const HTMlRegex = new RegExp('^<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)$');
    //const HTMlRegex = new RegExp('^<\s*[a-zA-Z]+,*?>')
    const HTMlRegex = new RegExp('<[^>]+>', 'g');
    //const HTMlRegex = new RegExp('^([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(?:[^<]*(?:[^<]*(?:<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]|*>[^<]*<\\/\\2>)*[^<]*)*<\\/\\1>$')
    return HTMlRegex.test(text);
  }
  /** _formatTextOld - slice text content when markdowns are detected
   */
  _formatTextOld() {
    const temporaryTextArray: {
      text: string;
      type: string;
      active: boolean;
      content: string;
    }[] = [];
    //const annotationRegex = new RegExp('(.*?)\\[([^\\[]+)\\]\\(([^\\)]+)\\)','g');
    //const annotationRegex = new RegExp("(.*?)(?:\\[([^\\[]+)\\])\\(([^)]+)\\)","g");
    //const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)', 'g');
    const annotationRegex = new RegExp(
      '\\[([^\\]]+)\\]\\(((?:[^)(]+|\\([^)]+\\))*)\\)',
      'g'
    );
    //const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)','g')
    const inputText = this.content;
    const slicedTextArray = this.disableNewLines
      ? [inputText]
      : inputText.split('\n');

    for (let k = 0; k < slicedTextArray.length; k++) {
      let match;
      const annotatedSentence = slicedTextArray[k];
      let lastIndex = 0;
      while ((match = annotationRegex.exec(annotatedSentence)) !== null) {
        if (match.index > lastIndex) {
          const finalizedText = annotatedSentence.slice(lastIndex, match.index);
          temporaryTextArray.push({
            text: this.capitalize
              ? this._capitalizeText(finalizedText)
              : finalizedText,
            type: 'default',
            active: false,
            content: '',
          });
        }
        const linkRegex = new RegExp('^https?:\\/\\/\\S+$');

        temporaryTextArray.push({
          text: match[1],
          type: linkRegex.test(match[2]) ? 'link' : 'annotation',
          content: match[2],
          active: false,
        });
        lastIndex = annotationRegex.lastIndex;
      }
      if (lastIndex < annotatedSentence.length) {
        const lastSentence = annotatedSentence.slice(lastIndex);
        temporaryTextArray.push({
          text: this.capitalize
            ? this._capitalizeText(lastSentence)
            : lastSentence,
          type: 'default',
          content: '',
          active: false,
        });
      }
    }
    this._textElements = temporaryTextArray;
  }
}
