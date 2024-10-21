/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for formula
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function historyViewerTemplate(customElementClass) {
  const { sortedParents, columns, branches } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-history-viewer-container">
    <div class="${clabsPrefix}--chat-history-viewer-container-tree">
      <div class="${clabsPrefix}--chat-history-viewer-grid">
        ${branches?.map(
          (branchId) => html` <div
            class="${clabsPrefix}--chat-history-viewer-column">
            <div class="${clabsPrefix}--chat-history-viewer-message">
              branch ${branchId}
            </div>
            ${sortedParents?.map((parentId) => {
              const message = columns[branchId][parentId];
              return message
                ? html` <div
                    class="${clabsPrefix}--chat-history-viewer-message">
                    <div
                      class="${clabsPrefix +
                      '--chat-history-viewer-block-content-' +
                      (message.userSubmitted ? 'user' : 'bot')}">
                      <strong>${message.index}</strong> ${message.text}
                    </div>
                  </div>`
                : html`<div
                    class="${clabsPrefix}--chat-history-viewer-message ${clabsPrefix}--chat-history-viewer-empty"></div>`;
            })}
          </div>`
        )}
      </div>
    </div>
  </div>`;
}
