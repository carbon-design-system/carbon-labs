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
import styles from './tableElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class tableElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * invalid - if spec fails to render or is missing, an error will be displayed
   */
  @state()
  _invalid = false;

  /**
   * tableObject - table object, contains headers and rows
   */
  @state()
  _tableObject = { headers: [], rows: [] };

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.content !== null) {
      this._tableObject = this._prepareTable();
      this.requestUpdate();
    } else {
      this._invalid = true;
      this.requestUpdate();
    }
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._tableObject = this._prepareTable();
    }
  }

  /**
   * Prepare table object for rendering from content string
   */
  _prepareTable() {
    const tableString = this.content.trim();
    const table = { headers: <any>[], rows: <any>[] };
    const rows = tableString.split('\n');
    const headers = rows.shift().split(',');
    table.headers = headers;
    for (const row of rows) {
      const cells = row.split(',');
      table.rows = [...table.rows, cells];
    }
    return table;
  }
}
