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
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * tick html line count object to display alongside the code
   */
  @state()
  _renderTicks = '';

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

  /** format code to properly display in HTML
   */
  _formatCode() {
    let formattedText = this.content.replace(/\t/g, '&nbsp;&nbsp;');
    const lines = formattedText.split('\n');
    const tickValues: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      tickValues.push(i.toString());
    }
    this._renderTicks = tickValues.join('<br/>');
    this._renderCode = formattedText.replace(/\n/g, '<br>');
  }
}
