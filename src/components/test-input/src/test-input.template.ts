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
 * Lit template for test-input
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function testInputTemplate(customElementClass: any) {
  const { _handleInput: handleInput } = customElementClass;
  return html`<div>
    <label for="typeahead"
      >Search typeahead
      <input type="text" name="typeahead" @input="${handleInput}" />
    </label>
    ${customElementClass.searchResults
      ? customElementClass.searchResults.map(
          (result: string) => html`<p>${result}</p>`
        )
      : undefined}
  </div>`;
}
