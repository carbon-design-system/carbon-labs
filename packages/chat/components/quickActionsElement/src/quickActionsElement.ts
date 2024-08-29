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
import styles from './quickActionsElement.scss?inline';

export default class quickActionsElement extends LitElement {
  static styles = styles;

  /**
   * List of options to display in quickActionsElement
   */
  @property({ type: Array, attribute: 'options', reflect: true })
  options: string[] = [];

  /**
   * Action to take when quick action button is clicked
   */
  @property({ type: Function, attribute: 'action', reflect: true })
  action;

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process text object
   */
  firstUpdated() {}
}
