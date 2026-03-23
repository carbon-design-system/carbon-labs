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
const { stablePrefix: clabsPrefix } = settings;

import Renew16 from '@carbon/icons/es/renew/16.js';
import Edit16 from '@carbon/icons/es/edit/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * Lit template for formula
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function historyViewerTemplate(customElementClass) {
  const { sortedParents, columns, branches, branchingIndices, debug } =
    customElementClass;

  return html` <div class="${clabsPrefix}--chat-history-viewer-container">
    <div class="${clabsPrefix}--chat-history-viewer-container-tree">
      <div class="${clabsPrefix}--chat-history-viewer-grid">
        ${branches?.map(
          (branchId) => html` <div
            class="${clabsPrefix}--chat-history-viewer-column">
            <div
              class="${clabsPrefix}--chat-history-viewer-message ${clabsPrefix}--chat-history-viewer-header">
              branch ${branchId}
            </div>
            ${sortedParents?.map((parentId) => {
              const message = columns[branchId][parentId];
              return message
                ? html` <div
                    class="${clabsPrefix}--chat-history-viewer-message ${branchingIndices[
                      parentId
                    ] > 1
                      ? clabsPrefix + '--chat-history-viewer-common-branch'
                      : ''}">
                    ${message.action
                      ? html` <div
                          class="${clabsPrefix}--chat-history-viewer-action-label">
                          ${message.action === 'regenerate'
                            ? iconLoader(Renew16())
                            : ''}
                          ${message.action === 'edit'
                            ? iconLoader(Edit16())
                            : ''}
                        </div>`
                      : ''}
                    <div
                      class="${clabsPrefix +
                      '--chat-history-viewer-block-content-' +
                      (message.userSubmitted ? 'user' : 'bot')}">
                      ${debug
                        ? html`<strong
                            >${message.index + ':' + message.parentId}</strong
                          >`
                        : ''}
                      ${message.text}
                    </div>
                  </div>`
                : html`<div
                    class="${clabsPrefix}--chat-history-viewer-message ${branchingIndices[
                      parentId
                    ] > 1
                      ? clabsPrefix + '--chat-history-viewer-common-branch'
                      : ''} ${clabsPrefix}--chat-history-viewer-empty"></div>`;
            })}
          </div>`
        )}
      </div>
    </div>
  </div>`;
}
