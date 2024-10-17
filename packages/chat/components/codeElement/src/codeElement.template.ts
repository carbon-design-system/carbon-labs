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

import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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
    _handleEditValidation: handleEditValidation,
    _handleEditCancellation: handleEditCancellation,
    editable,
    _currentlyEdited: currentlyEdited,
    _highlightLine: highlightLine,
    enableColoring,
    language,
    enableLanguageDisplay,
    _renderLabel: renderLabel,
    _handleScroll: handleScroll,
    _controlTabbing: controlTabbing,
    theme,
    _preRender: preRender,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-code">
    <div class="${clabsPrefix}--chat-code-options">
      <div class="${clabsPrefix}--chat-code-options-buttons">
        <div>${enableLanguageDisplay ? language : ''}</div>
        ${!disableEditButton
          ? html`
              <cds-icon-button
                size="sm"
                kind="ghost"
                align="left"
                aria-label="Edit Code"
                role="button">
                ${Edit16({ slot: 'icon' })}
                <span slot="tooltip-content">Enable editing</span>
              </cds-icon-button>
            `
          : html``}
        ${!disableCopyButton
          ? html`
              <cds-copy-button
                @click="${copyCode}"
                tooltip-alignment="end"
                tooltip-position="bottom"
                align="left"
                feedback="${renderLabel('code-copypaste-success')}"
                feedback-timeout="2000">
                ${renderLabel('code-copypaste-button')}
              </cds-copy-button>
            `
          : html``}
      </div>
    </div>

    <div
      class="${clabsPrefix}--chat-code-container"
      tabindex="0"
      role="textbox"
      @wheel="${handleScroll}"
      aria-label="Code Section">
      <textarea
        @input="${handleFullCodeEdit}"
        @keyup="${controlTabbing}"
        aria-label="Editable Text"
        spellcheck="false"
        class="${clabsPrefix}--chat-code-edit-area ${!editable
          ? clabsPrefix + '--chat-code-edit-hidden'
          : ''}">
${_editedContent}</textarea
      >

      <div
        class="${clabsPrefix + '--chat-code-color-area'} ${editable
          ? ' ' + clabsPrefix + '--chat-code-color-hidden'
          : ''}">
        ${_renderedLines.map(
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
                      <div class="${clabsPrefix}--chat-code-line-divider"></div>
                    `}
                <div
                  class="${clabsPrefix}--chat-code-line-text ${clabsPrefix}--chat-code-${theme ||
                  'default'}-theme">
                  ${enableColoring
                    ? lineObject.content
                    : unsafeHTML(
                        preRender
                          ? lineObject.content
                          : highlightLine(lineObject.content, language)
                      )}
                </div>
              </div>
            `
        )}
      </div>
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
