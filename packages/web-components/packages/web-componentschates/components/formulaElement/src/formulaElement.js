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
//import 'mathjax/es5/tex-svg-full.js';
import 'mathjax/es5/tex-mml-chtml.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
// @ts-ignore
// @ts-ignore
import styles from "./formulaElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class formulaElement extends LitElement {
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.content !== null) {
      this._prepareFormula();
    }
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('formula')) {
      await this._renderFormula();
    }
  }
  /**
   * Prepare table object for rendering from content string
   */
  async _prepareFormula() {
    this.formula = this.content;
  }
  /**
   * Prepare table object for rendering from content string
   */
  async _renderFormula() {
    var _a;
    const targetDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-formula-container');
    if (targetDiv instanceof HTMLElement) {
      try {
        // @ts-ignore
        await MathJax.typesetPromise([targetDiv]).then(() => {
          console.log('success');
        }).catch(error => {
          console.error(error);
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
  /**
   * Prepare table object for rendering from content string
   */
  _renderFormula2() {
    var _a;
    const targetDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + clabsPrefix + '--chat-formula-container');
    if (targetDiv instanceof HTMLElement) {
      try {
        // @ts-ignore
        MathJax.tex2svgPromise(this.content, {
          display: true
        }).then(node => {
          const svg = node.querySelector('svg');
          targetDiv.innerHTML = '';
          targetDiv.append(svg);
        }).catch(error => {
          console.error(error);
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
formulaElement.styles = styles;
export default formulaElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], formulaElement.prototype, "content", void 0);
__decorate([state()], formulaElement.prototype, "formula", void 0);
//# sourceMappingURL=formulaElement.js.map
