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
// @ts-ignore
// @ts-ignore
import styles from "./textElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class textElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * html boolean to render html content (TEMPORARY, for experimental use only)
     */
    this.enableHtmlRendering = false;
    /**
     * Newline boolean to disable splitting text by newlines
     */
    this.disableNewLines = false;
    /**
     * Internal element array to be rendered
     */
    this._textElements = [];
    /**
     * External element array to be rendered
     */
    this.textSubElements = [];
    /**
     * show summarizations or not
     */
    this._showSummarization = false;
    /**
     * translate textpiece ids to annotation IDs
     */
    this._translationRegistry = [];
    /**
     * Spliced sub element list of plain text to fade in text
     */
    this._animationList = [];
  }
  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    var _a;
    if (((_a = this.textSubElements) === null || _a === void 0 ? void 0 : _a.length) > 1) {
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
      this.style.setProperty('--chat-text-element-highlight-color', this.textHighlightColor);
    }
    this.style.setProperty('--chat-text-content-annotation-element-height', '0px');
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content') && !(this.textSubElements.length > 0)) {
      this._formatText();
    }
  }
  /** updateHighlightTarget - when the carousel element returns a change event, update current highlight
   * @param {event} event - slide event
   */
  _updateHighlightTarget(event) {
    var _a;
    const carouselIndex = (_a = event === null || event === void 0 ? void 0 : event.detail) === null || _a === void 0 ? void 0 : _a.currentIndex;
    if (carouselIndex >= 0) {
      const foundItem = this._translationRegistry.find(item => item.annotationIndex === carouselIndex + 1);
      this._textElements.forEach(element => {
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
      this._textElements.forEach(element => {
        element.active = false;
      });
    } else {
      if (!this.selectedAnnotationIndex) {
        this.selectedAnnotationIndex = 0;
      }
      const trueAnnotationIndex = this.selectedAnnotationIndex + 1;
      const foundItem = this._translationRegistry.find(item => item.annotationIndex === trueAnnotationIndex);
      if (foundItem) {
        const registryID = foundItem.subElementIndex;
        if (typeof registryID === 'number') {
          this._textElements[registryID - 1].active = true;
          setTimeout(() => {
            this.style.setProperty('--chat-text-content-annotation-element-height', '400px');
          }, 20);
        }
      }
    }
  }
  /** _handleAnnotationClick - open and load Card element when annotation dropdown clicked
   * @param {event} event - click event
   */
  _handleAnnotationClick(event) {
    var _a, _b;
    const targetElement = (event === null || event === void 0 ? void 0 : event.originalTarget) || (event === null || event === void 0 ? void 0 : event.target) || (event === null || event === void 0 ? void 0 : event.srcElement);
    const source = (_a = targetElement === null || targetElement === void 0 ? void 0 : targetElement.dataset) === null || _a === void 0 ? void 0 : _a.source;
    this.style.setProperty('--chat-text-content-annotation-element-height', '0px');
    const index = (_b = targetElement === null || targetElement === void 0 ? void 0 : targetElement.dataset) === null || _b === void 0 ? void 0 : _b.index;
    const annotationClickEventDetails = {
      originalEvent: event,
      annotationContent: source,
      indexInElementsArray: index,
      elementsArray: this._textElements
    };
    if (index) {
      this._textElements.forEach((element, elementIndex) => {
        if (elementIndex !== parseInt(index)) {
          element.active = false;
        }
      });
      this._textElements[parseInt(index)].active = !this._textElements[parseInt(index)].active;
      if (this._textElements[parseInt(index)].active) {
        annotationClickEventDetails['action'] = 'annotation popup closed';
        this._showSummarization = true;
      } else {
        annotationClickEventDetails['action'] = 'annotation popup opened';
        this._showSummarization = false;
      }
      annotationClickEventDetails['isOpened'] = this._textElements[parseInt(index)].active;
      annotationClickEventDetails['textContent'] = this._textElements[parseInt(index)].text;
      if (this._textElements[parseInt(index)].active) {
        if (source) {
          this._annotationURLs = this._arrangeSources(source);
          setTimeout(() => {
            this.style.setProperty('--chat-text-content-annotation-element-height', '400px');
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
      const foundItem = this._translationRegistry.find(item => item.subElementIndex === parseInt(index) + 1);
      if (typeof (foundItem === null || foundItem === void 0 ? void 0 : foundItem.annotationIndex) === 'number') {
        if (foundItem) {
          this.selectedAnnotationIndex = foundItem.annotationIndex - 1;
          this.requestUpdate();
        }
      }
    }
    const annotationClickEvent = new CustomEvent('on-text-annotation-click', {
      detail: annotationClickEventDetails,
      bubbles: true,
      composed: true
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
    const capitalizedLines = lines.map(line => line.trimStart().charAt(0).toUpperCase() + line.trimStart().slice(1));
    return capitalizedLines.join('');
  }
  /** _formatText - slice text content when markdowns are detected
   */
  _formatText() {
    const annotationRegex = new RegExp('(\\[([^\\]]+)\\]\\(([^)]+)\\))|([^\\[]+)', 'g');
    const temporaryAnnotationList = [];
    const temporaryTextArray = [];
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
            active: false
          });
          temporaryAnnotationList.push(regexResult[3]);
          this._translationRegistry.push({
            annotationIndex: temporaryAnnotationList.length,
            subElementIndex: temporaryTextArray.length
          });
        } else if (regexResult[4]) {
          const checkHtmlContent = this._checkForHTML(regexResult[4]);
          const textType = checkHtmlContent ? 'html' : 'default';
          const currentLine = regexResult[4];
          temporaryTextArray.push({
            text: this.capitalize ? this._capitalizeText(currentLine) : currentLine,
            type: textType,
            active: false,
            content: ''
          });
        }
      }
      if (!this.disableNewLines && !this.streaming) {
        if (temporaryTextArray.length > 1) {
          if (temporaryTextArray[temporaryTextArray.length - 1]) {
            const prevObject = temporaryTextArray[temporaryTextArray.length - 1];
            if ((prevObject === null || prevObject === void 0 ? void 0 : prevObject.type) === 'new-line') {
              continue;
            }
          }
        }
        temporaryTextArray.push({
          text: '',
          type: 'new-line',
          active: false,
          content: ''
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
    const animationList = [];
    for (const item of temporaryTextArray) {
      if (item.type === 'default') {
        const words = item.text.split(' ');
        for (const word of words) {
          animationList.push({
            text: word + ' ',
            type: 'default',
            content: '',
            active: false
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
    const temporaryTextArray = [];
    //const annotationRegex = new RegExp('(.*?)\\[([^\\[]+)\\]\\(([^\\)]+)\\)','g');
    //const annotationRegex = new RegExp("(.*?)(?:\\[([^\\[]+)\\])\\(([^)]+)\\)","g");
    //const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)', 'g');
    const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(((?:[^)(]+|\\([^)]+\\))*)\\)', 'g');
    //const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)','g')
    const inputText = this.content;
    const slicedTextArray = this.disableNewLines ? [inputText] : inputText.split('\n');
    for (let k = 0; k < slicedTextArray.length; k++) {
      let match;
      const annotatedSentence = slicedTextArray[k];
      let lastIndex = 0;
      while ((match = annotationRegex.exec(annotatedSentence)) !== null) {
        if (match.index > lastIndex) {
          const finalizedText = annotatedSentence.slice(lastIndex, match.index);
          temporaryTextArray.push({
            text: this.capitalize ? this._capitalizeText(finalizedText) : finalizedText,
            type: 'default',
            active: false,
            content: ''
          });
        }
        const linkRegex = new RegExp('^https?:\\/\\/\\S+$');
        temporaryTextArray.push({
          text: match[1],
          type: linkRegex.test(match[2]) ? 'link' : 'annotation',
          content: match[2],
          active: false
        });
        lastIndex = annotationRegex.lastIndex;
      }
      if (lastIndex < annotatedSentence.length) {
        const lastSentence = annotatedSentence.slice(lastIndex);
        temporaryTextArray.push({
          text: this.capitalize ? this._capitalizeText(lastSentence) : lastSentence,
          type: 'default',
          content: '',
          active: false
        });
      }
    }
    this._textElements = temporaryTextArray;
  }
}
textElement.styles = styles;
export default textElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], textElement.prototype, "content", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'align-right'
})], textElement.prototype, "alignRight", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'capitalize'
})], textElement.prototype, "capitalize", void 0);
__decorate([property({
  type: String,
  attribute: 'text-highlight-color'
})], textElement.prototype, "textHighlightColor", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-annotations'
})], textElement.prototype, "enableAnnotations", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-summarization'
})], textElement.prototype, "enableSummarization", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-html-rendering'
})], textElement.prototype, "enableHtmlRendering", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-text-highlighting'
})], textElement.prototype, "enableTextHighlighting", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-new-lines'
})], textElement.prototype, "disableNewLines", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-complex-feedback'
})], textElement.prototype, "enableComplexFeedback", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-chevrons'
})], textElement.prototype, "disableChevrons", void 0);
__decorate([state()], textElement.prototype, "_textElements", void 0);
__decorate([property({
  type: Array,
  attribute: 'textSubElements'
})], textElement.prototype, "textSubElements", void 0);
__decorate([state()], textElement.prototype, "_annotationURLs", void 0);
__decorate([state()], textElement.prototype, "_annotationList", void 0);
__decorate([state()], textElement.prototype, "_annotationIndex", void 0);
__decorate([state()], textElement.prototype, "_showSummarization", void 0);
__decorate([state()], textElement.prototype, "_translationRegistry", void 0);
__decorate([state()], textElement.prototype, "selectedAnnotationIndex", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'streaming'
})], textElement.prototype, "streaming", void 0);
__decorate([state()], textElement.prototype, "_animationList", void 0);
//# sourceMappingURL=textElement.js.map
