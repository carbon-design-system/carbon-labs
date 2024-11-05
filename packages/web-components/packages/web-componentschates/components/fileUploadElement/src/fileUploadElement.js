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
import { property } from 'lit/decorators.js';
// @ts-ignore
// @ts-ignore
import styles from "./fileUploadElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class fileUploadElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Content loading/success status
     */
    this._status = 'loading';
  }
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
fileUploadElement.styles = styles;
export default fileUploadElement;
__decorate([property({
  type: String,
  attribute: 'content'
})], fileUploadElement.prototype, "content", void 0);
__decorate([property({
  type: String,
  attribute: 'error-message'
})], fileUploadElement.prototype, "_errorMessage", void 0);
__decorate([property({
  type: String,
  attribute: 'status'
})], fileUploadElement.prototype, "_status", void 0);
//# sourceMappingURL=fileUploadElement.js.map
