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
import styles from "./errorElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class errorElement extends LitElement {
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }
  /** detect when component is rendered to process text object
   */
  firstUpdated() {}
  /** format text to properly display in HTML
   * @param {string} inputText - text to be rendered in subelement
   * @param {boolean} capitalize - capitalization flag
   */
  _formatText(inputText, capitalize) {
    if (capitalize) {
      const lines = inputText.split(/(?<=[.!?]\s)|(?<=\n)/g);
      const capitalizedLines = lines.map(line => line.trimStart().charAt(0).toUpperCase() + line.trimStart().slice(1));
      inputText = capitalizedLines.join('');
    }
    const prunedText = inputText.replace(/^\s*\n|\n\s*$/g, '');
    const formattedText = prunedText.replace(/\t/g, '&nbsp;&nbsp;');
    const htmlText = formattedText.replace(/\n/g, '<br>');
    return htmlText;
  }
}
errorElement.styles = styles;
export default errorElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], errorElement.prototype, "content", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'capitalize'
})], errorElement.prototype, "capitalize", void 0);
//# sourceMappingURL=errorElement.js.map
