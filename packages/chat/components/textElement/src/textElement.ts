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
   * Annotation boolean to append citation events/styling
   */
  @property({ type: Boolean, attribute: 'enable-annotations' })
  enableAnnotations;

  /**
   * html boolean to render html content (TEMPORARY, for experimental use only)
   */
  @property({ type: Boolean, attribute: 'enable-html-rendering' })
  enableHtmlRendering;

  /**
   * Newline boolean to disable splitting text by newlines
   */
  @property({ type: Boolean, attribute: 'disable-new-lines' })
  disableNewLines = false;

  /**
   * Element array to be rendered
   */
  @state()
  _textElements: {
    text: string;
    type: string;
    active: boolean;
    content: string;
  }[] = [];

  /**
   * highlightCard data url
   */
  @state()
  _annotationURL;

  /**
   * targest div index
   */
  @state()
  _annotationIndex;

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._formatText();
    }
  }

  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    if (this.content) {
      this._formatText();
    }
  }

  /** _handleAnnotationClick - open and load Card element when annotation dropdown clicked
   * @param {event} event - click event
   */
  _handleAnnotationClick(event) {
    const source = event?.originalTarget?.dataset?.source;

    const index = event?.originalTarget?.dataset?.index;
    if (index) {
      this._textElements[parseInt(index)].active =
        !this._textElements[parseInt(index)].active;

      /*this._textElements.forEach((element, elementIndex) => {
        if(elementIndex !== index){
          element.active = false;
        }
      })*/

      if (this._textElements[parseInt(index)].active) {
        if (source) {
          this._annotationURL = source;
          this._annotationIndex = parseInt(index);
        } else {
          this._annotationURL = null;
          this._annotationIndex = null;
        }
      } else {
        this._annotationURL = null;
        this._annotationIndex = null;
      }
      this.requestUpdate();
    }
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
    const temporaryTextArray: {
      text: string;
      type: string;
      active: boolean;
      content: string;
    }[] = [];
    //const annotationRegex = new RegExp('(.*?)\\[([^\\[]+)\\]\\(([^\\)]+)\\)','g');
    //const annotationRegex = new RegExp("(.*?)(?:\\[([^\\[]+)\\])\\(([^)]+)\\)","g");
    const annotationRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)', 'g');
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

        //previousIndex = annotationRegex.lastIndex;
        //console.log(previousIndex)
        //annotatedSentence =  annotatedSentence.substring(match.index + match[0].length)
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
