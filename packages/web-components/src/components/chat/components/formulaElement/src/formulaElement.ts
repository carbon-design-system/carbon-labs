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
//import 'mathjax/es5/tex-svg-full.js';
import 'mathjax/es5/tex-mml-chtml.js';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

// @ts-ignore
import styles from './formulaElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class formulaElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * formula - render-safe math tex string
   */
  @state()
  formula;

  /**
   * startMathJax -  edit target document for rendering
   */
  async startMathJax() {
    // @ts-ignore
    /**
     * getComponents
     */
    // @ts-ignore
    MathJax.startup.getComponents = () => {
      // @ts-ignore
      MathJax.startup.document = MathJax.startup.document.constructor({
        // @ts-ignore
        options: MathJax.config.options,
        // @ts-ignore
        renderActions: MathJax.startup.renderActions,
        // @ts-ignore
        inputJax: MathJax.startup.input,
        // @ts-ignore
        outputJax: MathJax.startup.output,
        // @ts-ignore
        adaptor: MathJax.startup.adaptor,
      });
      // @ts-ignore
      MathJax.startup.document.document = this.shadowRoot;
    };
    // @ts-ignore
    await MathJax.startup.promise;
  }

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
    await this.startMathJax();
    const targetDiv = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-formula-container'
    );

    if (targetDiv instanceof HTMLElement) {
      try {
        // @ts-ignore
        await MathJax.typesetPromise([targetDiv])
          .then(() => {
            console.log('success');
          })
          .catch((error) => {
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
    const targetDiv = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-formula-container'
    );
    if (targetDiv instanceof HTMLElement) {
      try {
        // @ts-ignore
        MathJax.tex2svgPromise(this.content, { display: true })
          .then((node) => {
            const svg = node.querySelector('svg');
            targetDiv.innerHTML = '';
            targetDiv.append(svg);
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
