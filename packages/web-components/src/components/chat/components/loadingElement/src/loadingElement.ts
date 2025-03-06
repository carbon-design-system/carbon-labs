/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';

// @ts-ignore
import styles from './loadingElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class loadingElement extends LitElement {
  static styles = styles;

  /**
   * _loadingMessage - add message to loader
   */
  @state()
  _loadingMessage;

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process loading object
   */
  firstUpdated() {}
}
