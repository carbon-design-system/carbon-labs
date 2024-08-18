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
import styles from './detailedErrorElement.scss?inline';

export interface DetailedErrorActionProps {
  text: string;
  click: () => void;
}

/**
 * Input component using search typeahead api
 */
export default class detailedErrorElement extends LitElement {
  static styles = styles;

  /**
   * Error title to display in detailedErrorElement
   */
  @property({ type: String, attribute: 'title', reflect: true })
  title;

  /**
   * Error description to display in detailedErrorElement
   */
  @property({ type: String, attribute: 'description', reflect: true })
  description;

  /**
   * Action to take when error button is clicked (optional)
   * Action should have a title and a call function to execute
   */
  @property({ type: Object, attribute: 'action', reflect: true })
  action?: DetailedErrorActionProps;

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
