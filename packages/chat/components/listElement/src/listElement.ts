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
import styles from './listElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class listElement extends LitElement {
  static styles = styles;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * List HTML string
   */
  @state()
  _renderedList = '';

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.content !== undefined) {
      this._formatList();
      this.requestUpdate();
    } else {
      this._renderedList = 'listElement: error rendring list, content is empty';
    }
  }
  /** format list text into html list object
   * @param {string} inputText - text to be rendered in subelement
   */
  _formatList() {
    console.log(this.content);
    const items = this.content.split('\n');
    this._renderedList =
      '<ul>' + items.map((item) => '<li>' + item + '</li>').join('') + '</ul>';
  }
}
