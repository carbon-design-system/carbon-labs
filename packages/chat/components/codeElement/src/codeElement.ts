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
import styles from './codeElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class codeElement extends LitElement {
  static styles = styles;
  /**
   * Code string to be parsed into lines and displayed
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'editable', reflect: true })
  editable;

  /**
   * html code text
   */
  @state()
  _renderCode = '';

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._formatCode();
      this.requestUpdate();
    }
  }

  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    if (this.content !== undefined) {
      this._formatCode();
      this.requestUpdate();
    } else {
      this._renderCode = 'codeElement: error rendering code, content is empty';
    }
  }

  /**
   * _exportCode - when an edit is detected, send back an event to notify the parent of changes
   */

  /** format code to properly display in HTML
   */
  _formatCode() {
    const formattedText = this.content;
    const htmlSafeText = formattedText
      .replace(/```/g, '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const lines = htmlSafeText.trim().split('\n');
    const tabWidth = 16;
    const paddingLeft = 16;
    const tickValues: string[] = [];
    const textValues: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      tickValues.push(i.toString());
      let lineType = '';
      const trimmedLine = lines[i].replace(/\t/g, '');
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        lineType = 'clabs--chat-code-line-comment';
      }

      let tabOffset = paddingLeft;
      const tabMatch = lines[i].match(/^\t*/);
      if (tabMatch) {
        tabOffset += tabMatch[0].length * tabWidth;
      }

      let lineString =
        '<div class="clabs--chat-code-line"><div class="clabs--chat-code-line-tick">' +
        i.toString() +
        '</div><div class="clabs--chat-code-line-divider"></div>';

      if (this.editable) {
        lineString +=
          '<div class="clabs--chat-code-line-text ' +
          lineType +
          '" style="padding-left:' +
          tabOffset +
          'px">';
        lineString += lines[i].replace(/\t/g, '').replace(/\n/g, '');
        lineString += '</div></div>';
      } else {
        lineString +=
          '<textarea rows="1" class="clabs--chat-code-line-text-area ' +
          lineType +
          '" style="padding-left:' +
          tabOffset +
          'px">';
        lineString += lines[i].replace(/\t/g, '').replace(/\n/g, '');
        lineString += '</textarea></div>';
      }
      textValues.push(lineString);
    }
    this._renderCode = textValues.join('');
  }
}
