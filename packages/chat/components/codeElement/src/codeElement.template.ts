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
import '@carbon/web-components/es/components/copy-button/index.js';
import Checkmark16 from '@carbon/web-components/es/icons/checkmark/16.js';
import Close16 from '@carbon/web-components/es/icons/close/16.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function codeElementTemplate(customElementClass) {
  const {
    _renderedLines,
    _editedContent,
    disableLineTicks,
    disableCopyButton,
    disableEditButton,
    _handleFullCodeEdit: handleFullCodeEdit,
    _copyCode: copyCode,
    _handleCodeEdit: handleCodeEdit,
    _handleEditValidation: handleEditValidation,
    _handleEditCancellation: handleEditCancellation,
    editable,
    _currentlyFullyEdited: currentlyFullyEdited,
    _setCurrentIndex: setCurrentIndex,
    _currentlyEdited: currentlyEdited,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-code">
    <div class="${clabsPrefix}--chat-code-options">
      <div class="${clabsPrefix}--chat-code-options-buttons">
        ${!disableEditButton
          ? html`
              <cds-icon-button
                size="sm"
                kind="ghost"
                align="left"
                aria-label="Edit Code"
                role="button">
                ${Edit16({ slot: 'icon' })}
                <span slot="tooltip-content">Enable Editing</span>
              </cds-icon-button>
            `
          : html``}
        ${!disableCopyButton
          ? html`
              <cds-copy-button
                @click="${copyCode}"
                feedback="Copied!"
                feedback-timeout="2000">
                Copy to Clipboard
              </cds-copy-button>
            `
          : html``}
      </div>
    </div>
    <div class="${clabsPrefix}--chat-code-container">
      ${currentlyFullyEdited && !disableLineTicks
        ? html`
            <div class="${clabsPrefix}--chat-code-container-full-elements">
              <div class="${clabsPrefix}--chat-code-line-ticks-full"></div>
              <div class="${clabsPrefix}--chat-code-line-divider-full"></div>
              <textarea
                @input="${handleFullCodeEdit}"
                class="${clabsPrefix}--chat-code-edit-area">
${_editedContent}
          </textarea
              >
            </div>
          `
        : currentlyFullyEdited || editable
        ? html`
            <textarea
              @input="${handleFullCodeEdit}"
              class="${clabsPrefix}--chat-code-edit-area">
${_editedContent}
          </textarea
            >
          `
        : html` ${_renderedLines.map(
            (lineObject, index) =>
              html`
                <div
                  class="${clabsPrefix}--chat-code-line ${clabsPrefix}--chat-code-line-fade-in">
                  ${disableLineTicks || _renderedLines.length < 2
                    ? html``
                    : html`
                        <div class="${clabsPrefix}--chat-code-line-tick">
                          ${index + 1}
                        </div>
                        <div
                          class="${clabsPrefix}--chat-code-line-divider"></div>
                      `}
                  ${!editable
                    ? html`<div
                        class="${clabsPrefix}--chat-code-line-text ${clabsPrefix}--chat-code-line${editable
                          ? '-editable'
                          : ''} ${lineObject.type}"
                        style="padding-left: ${lineObject.paddingLeft}">
                        ${lineObject.content}
                      </div>`
                    : html`
                        <textarea
                          @keydown="${handleCodeEdit}"
                          rows="1"
                          @click="${setCurrentIndex}"
                          data-codeindex="${index}"
                          class="${clabsPrefix}--chat-code-line-text-area ${lineObject.type}"
                          style="padding-left: ${lineObject.paddingLeft}">
${lineObject.content}</textarea
                        >
                      `}
                </div>
              `
          )}`}
    </div>

    ${currentlyEdited
      ? html`
          <div class="${clabsPrefix}--chat-code-editing-controls">
            <cds-button
              size="md"
              align="top"
              aria-label="Undo Edit"
              role="button"
              kind="danger--tertiary"
              @click="${handleEditCancellation}">
              ${Close16({ slot: 'icon' })} Revert all changes
            </cds-button>

            <cds-button
              size="md"
              aria-label="Validate Edit"
              role="button"
              align="top"
              kind="tertiary"
              @click="${handleEditValidation}">
              ${Checkmark16({ slot: 'icon' })} Apply changes
            </cds-button>
          </div>
        `
      : html``}
  </div>`;
}
