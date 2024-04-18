/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

/**
 * Lit template for Feedback component
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function networkGraphTemplate(customElementClass) {
  const { label } = customElementClass;
  return html`
    <h1>${label}</h1>
    <div id="graph-container"></div>
  `;
}
