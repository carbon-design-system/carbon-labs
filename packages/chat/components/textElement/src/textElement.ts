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

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process text object
   */
  firstUpdated() {}

  /** format text to properly display in HTML
   * @param {string} inputText - text to be rendered in subelement
   * @param {boolean} capitalize - capitalization flag
   */
  _formatText(inputText, capitalize) {
    let htmlText = '';
    if (inputText) {
      if (capitalize) {
        const lines = inputText.split(/(?<=[.!?]\s)|(?<=\n)/g);
        const capitalizedLines = lines.map(
          (line) =>
            line.trimStart().charAt(0).toUpperCase() + line.trimStart().slice(1)
        );
        inputText = capitalizedLines.join('');
      }

      const prunedText = inputText.replace(/^\s*\n|\n\s*$/g, '');
      const formattedText = prunedText.replace(/\t/g, '&nbsp;&nbsp;');
      htmlText = formattedText.replace(/\n/g, '<br>');
    }
    return htmlText;
  }
}
