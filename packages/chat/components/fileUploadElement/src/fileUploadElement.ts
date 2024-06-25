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
import styles from './fileUploadElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class fileUploadElement extends LitElement {
  static styles = styles;

  /**
   * Content text to display in textElement
   */
  @property({ type: String, attribute: 'content' })
  content;

  /**
   * Content text to display in textElement
   */
  @property({ type: String, attribute: 'error-message' })
  _errorMessage;

  /**
   * Content loading/success status
   */
  @property({ type: String, attribute: 'status' })
  _status = 'loading';

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      //this._formatText();
    }
  }

  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    if (this.content) {
      //this._formatText();
    }
  }
}
