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
import '@carbon/web-components/es/components/icon-button/index.js';

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
                <cds-icon-button size="sm" kind="ghost" align="left">
                  ${Edit16({ slot: 'icon' })}
                  <span slot="tooltip-content">Enable editing</span>
                </cds-icon-button>
              `
            : html``}
          ${!disableCopyButton
            ? html`
                <cds-icon-button
                  size="sm"
                  kind="ghost"
                  align="left"
                  @click="${copyCode}">
                  ${Copy16({ slot: 'icon' })}
                  <span slot="tooltip-content">Copy code</span>
                </cds-icon-button>
              `
            : html``}
        </div>
      </div>

      ${_renderedLines.map(
        (lineObject, index) =>
          html`
            <div class="${clabsPrefix}--chat-code-line">
              ${disableLineTicks || _renderedLines.length < 2
                ? html``
                : html`
                    <div class="${clabsPrefix}--chat-code-line-tick">
                      ${index + 1}
                    </div>
                    <div class="${clabsPrefix}--chat-code-line-divider"></div>
                  `}
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
                tooltip-text="Cancel edit"
                tooltip-position="left"
                tooltip-alignment="end"
                @click="${handleEditCancellation}">
                Cancel edit
              </cds-button>
              <cds-button
                size="sm"
                tooltip-text="Validate edit"
                tooltip-position="left"
                tooltip-alignment="end"
                @click="${handleEditValidation}">
                Validate edit
              </cds-button>
            </div>
          `
        : html``}
    </div>
  </div>`;
}
