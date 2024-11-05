/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
// @ts-ignore
// @ts-ignore
import styles from "./tableElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class tableElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * invalid - if spec fails to render or is missing, an error will be displayed
     */
    this._invalid = false;
    /**
     * tableObject - table object, contains headers and rows
     */
    this._tableObject = {
      headers: [],
      rows: []
    };
    /**
     * is the component hovered upon
     */
    this.isHovered = false;
    /**
     * is the component hovered upon
     */
    this._renderAsDataTable = false;
  }
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.hasAttribute('max-height')) {
      this.style.setProperty('--chat-table-height', this.maxHeight);
    }
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
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOut() {
    this.isHovered = false;
  }
  /**
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOver() {
    this.isHovered = true;
  }
  /**
   * Prepare table object for rendering from content string
   */
  _prepareTable() {
    const tableString = this.content.trim();
    const table = {
      headers: [],
      rows: []
    };
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
tableElement.styles = styles;
export default tableElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], tableElement.prototype, "content", void 0);
__decorate([state()], tableElement.prototype, "_invalid", void 0);
__decorate([state()], tableElement.prototype, "_tableObject", void 0);
__decorate([property({
  type: String,
  attribute: 'max-height'
})], tableElement.prototype, "maxHeight", void 0);
__decorate([state()], tableElement.prototype, "isHovered", void 0);
__decorate([state()], tableElement.prototype, "_renderAsDataTable", void 0);
//# sourceMappingURL=tableElement.js.map
