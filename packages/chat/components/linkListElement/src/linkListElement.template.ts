/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/link/index.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function linkListElementTemplate(customElementClass) {
  const {
    _linkList: linkList,
    expanded,
    expandList,
    collapseList,
    maxItems,
  } = customElementClass;

  return html`
    <div class="${clabsPrefix}--chat-link-list-header">
      References (${linkList.length})
    </div>
    <div class="${clabsPrefix}--chat-link-list-container">
      ${linkList.map((linkObject, index) =>
        index < maxItems || expanded
          ? html` <div class="${clabsPrefix}--chat-link-list-item">
              <div class="${clabsPrefix}--chat-link-list-item-text">
                <cds-link href="${linkObject.url}" target="_blank"
                  >${linkObject.title}</cds-link
                >
              </div>
              <div>
                <cds-link href="${linkObject.url}" target="_blank"
                  >${ArrowRight16()}</cds-link
                >
              </div>
            </div>`
          : html``
      )}
      ${linkList.length > maxItems
        ? html`<div class="${clabsPrefix}--chat-link-list-item">
            ${expanded
              ? html` <div class="${clabsPrefix}--chat-link-list-item-text">
                  <cds-link @click="${collapseList}"> Collapse list </cds-link>
                </div>`
              : html` <div class="${clabsPrefix}--chat-link-list-item-text">
                  <cds-link @click="${expandList}"> View all </cds-link>
                </div>`}
          </div>`
        : html``}
    </div>
  `;
}
