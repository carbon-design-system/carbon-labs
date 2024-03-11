/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function tableTemplate(customElementClass) {
  const { _tableObject: tableObject, _invalid: invalid } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-table">
    ${invalid === true
      ? html` <div class="${c4aiPrefix}--chat-table-error">
          <p>Error displaying table</p>
        </div>`
      : html` <div class="${c4aiPrefix}--chat-table-container">
          <table>
            <thead>
              <tr>
                ${tableObject.headers.map((value) => html`<th>${value}</th>`)}
              </tr>
            </thead>
            <tbody>
              ${tableObject.rows.map(
                (row) =>
                  html` <tr>
                    ${row.map((cell) => html`<td>${cell}</td>`)}
                  </tr>`
              )}
            </tbody>
          </table>
        </div>`}
  </div>`;
}
