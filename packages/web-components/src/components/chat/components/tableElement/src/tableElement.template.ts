/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es/components/data-table/index.js';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function tableElementTemplate(customElementClass) {
  const {
    _tableObject: tableObject,
    _invalid: invalid,
    _handleMouseOut: handleMouseOut,
    _handleMouseOver: handleMouseOver,
    _renderAsDataTable: renderAsDataTable,
  } = customElementClass;

  return html`<div
    class="${clabsPrefix}--chat-table"
    @mouseout="${handleMouseOut}"
    @mouseover="${handleMouseOver}">
    ${invalid === true
      ? html` <div class="${clabsPrefix}--chat-table-error">
          <p>Error displaying table</p>
        </div>`
      : html` <div class="${clabsPrefix}--chat-table-container">
          ${!renderAsDataTable
            ? html` <table>
                <thead>
                  <tr>
                    ${tableObject.headers.map(
                      (value) => html`<th>${value}</th>`
                    )}
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
              </table>`
            : html`
                <cds-table
                  headers="${tableObject.headers}"
                  rows="${tableObject.rows}">
                </cds-table>
              `}
        </div>`}
  </div>`;
}
