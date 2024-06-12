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

import '@carbon/web-components/es/components/button/index.js';

import Edit16 from '@carbon/web-components/es/icons/edit/16.js';
import Copy16 from '@carbon/web-components/es/icons/copy/16.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function codeElementTemplate(customElementClass) {
  const {
    _renderedLines,
    disableLineTicks,
    disableCopyButton,
    disableEditButton,
    _copyCode: copyCode,
    _handleCodeEdit: handleCodeEdit,
    _handleEditValidation: handleEditValidation,
    _handleEditCancellation: handleEditCancellation,
    editable,
    _currentlyEdited: currentlyEdited,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-code">
    <div class="${clabsPrefix}--chat-code-container">
      <div class="${clabsPrefix}--chat-code-options">
        <div class="${clabsPrefix}--chat-code-options-buttons">
          ${!disableEditButton
            ? html`
                <cds-button
                  size="sm"
                  kind="ghost"
                  tooltip-text="Enable editing"
                  tooltip-position="left"
                  tooltip-alignment="end">
                  ${Edit16({ slot: 'icon' })}
                </cds-button>
              `
            : html``}
          ${!disableCopyButton
            ? html`
                <cds-button
                  size="sm"
                  kind="ghost"
                  tooltip-text="Copy code"
                  tooltip-position="left"
                  tooltip-alignment="end"
                  @click="${copyCode}">
                  ${Copy16({ slot: 'icon' })}
                </cds-button>
              `
            : html``}
        </div>
      </div>

      ${_renderedLines.map(
        (lineObject, index) =>
          html`
            <div class="${clabsPrefix}--chat-code-line">
              ${!disableLineTicks
                ? html`
                    <div class="${clabsPrefix}--chat-code-line-tick">
                      ${index}
                    </div>
                    <div class="${clabsPrefix}--chat-code-line-divider"></div>
                  `
                : html``}
              ${!editable
                ? html`<div
                    class="${clabsPrefix}--chat-code-line-text ${clabsPrefix}--chat-code-line-${editable
                      ? 'editable'
                      : ''} ${lineObject.type}"
                    style="padding-left: ${lineObject.paddingLeft}">
                    ${lineObject.content}
                  </div>`
                : html`
                    <textarea
                      @keydown="${handleCodeEdit}"
                      rows="1"
                      data-code-index="${index}"
                      class="${clabsPrefix}--chat-code-line-text-area ${lineObject.type}"
                      style="padding-left: ${lineObject.paddingLeft}">
${lineObject.content}</textarea
                    >
                  `}
            </div>
          `
      )}
      ${currentlyEdited
        ? html`
            <div class="${clabsPrefix}--chat-code-editing-controls">
              <cds-button
                size="sm"
                kind="danger"
                @click="${handleEditCancellation}">
                Cancel edit
              </cds-button>
              <cds-button size="sm" @click="${handleEditValidation}">
                Validate edit
              </cds-button>
            </div>
          `
        : html``}
    </div>
  </div>`;
}
