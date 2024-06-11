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
    trimmedList,
    expanded,
    expandList,
    collapseList,
  } = customElementClass;

  return html`
    <div class="${clabsPrefix}--chat-link-list-header">
      References (${linkList.length})
    </div>
    ${linkList.length > 4
      ? html` ${expanded
          ? html` <ul class="${clabsPrefix}--chat-link-list-ul">
              ${linkList.map(
                (linkObject) =>
                  html`
                    <li class="${clabsPrefix}--chat-link-list-li">
                      <cds-link href="${linkObject.url}" target="_blank"
                        >${linkObject.title}</cds-link
                      >
                      <cds-link href="${linkObject.url}" target="_blank"
                        >${ArrowRight16()}</cds-link
                      >
                    </li>
                  `
              )}
              <li class="${clabsPrefix}--chat-link-list-li">
                <cds-link @click="${collapseList}"> Collapse list </cds-link>
              </li>
            </ul>`
          : html` <ul class="${clabsPrefix}--chat-link-list-ul">
              ${trimmedList.map(
                (linkObject) =>
                  html`
                    <li class="${clabsPrefix}--chat-link-list-li">
                      <cds-link href="${linkObject.url}" target="_blank"
                        >${linkObject.title}</cds-link
                      >
                      ${ArrowRight16()}
                    </li>
                  `
              )}

              <li class="${clabsPrefix}--chat-link-list-li">
                <cds-link @click="${expandList}"> View all </cds-link>
              </li>
            </ul>`}`
      : html`
          <ul class="${clabsPrefix}--chat-link-list-ul">
            ${linkList.map(
              (linkObject) =>
                html`
                  <li class="${clabsPrefix}--chat-link-list-li">
                    <cds-link href="${linkObject.url}" target="_blank"
                      >${linkObject.title}</cds-link
                    >
                    <cds-link href="${linkObject.url}" target="_blank"
                      >${ArrowRight16()}</cds-link
                    >
                  </li>
                `
            )}
          </ul>
        `}
  `;
}
