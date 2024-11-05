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
import styles from "./listElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class listElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * List HTML string
     */
    this._renderedList = '';
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._formatList();
    }
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
    const items = this.content.split('\n');
    this._renderedList = '<ul>' + items.map(item => '<li>' + item + '</li>').join('') + '</ul>';
  }
}
listElement.styles = styles;
export default listElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], listElement.prototype, "content", void 0);
__decorate([state()], listElement.prototype, "_renderedList", void 0);
//# sourceMappingURL=listElement.js.map
