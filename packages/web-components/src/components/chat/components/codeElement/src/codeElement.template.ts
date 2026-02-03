/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';

import Edit16 from '@carbon/icons/es/edit/16.js';
import '@carbon/web-components/es/components/copy-button/index.js';
import Checkmark16 from '@carbon/icons/es/checkmark/16.js';
import Undo16 from '@carbon/icons/es/undo/16.js';
import ChevronDown from '@carbon/icons/es/chevron--down/16.js';
import ChevronLeft from '@carbon/icons/es/chevron--left/16.js';
import Compare16 from '@carbon/icons/es/compare/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
    enableEditButton,
    disableEditingOptions,
    showContentDifferences,
    editingEnabled,
    _comparisonReference: comparisonReference,
    comparisonEnabled,
    _handleFullCodeEdit: handleFullCodeEdit,
    _copyCode: copyCode,
    _handleEditValidation: handleEditValidation,
    _handleEditCancellation: handleEditCancellation,
    _handleComparisonEnabled: handleComparisonEnabled,
    _handleEditingEnabled: handleEditingEnabled,
    editable,
    assignedLanguage,
    autoAssignLanguage,
    _displayedContent: displayedContent,
    _currentlyEdited: currentlyEdited,
    _highlightLine: highlightLine,
    enableColoring,
    language,
    lineCount,
    _startFullEdit: startFullEdit,
    displayLineCount,
    enableLanguageDisplay,
    _renderLabel: renderLabel,
    _handleScroll: handleScroll,
    _controlTabbing: controlTabbing,
    theme,
    _preRender: preRender,
    enableBlockCollapse,
    collapsedList,
    _collapseBlock: collapseBlock,
    collapseAvailable,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--chat-code" @wheel="${handleScroll}">
    ${enableLanguageDisplay || displayLineCount
      ? html`<div class="${clabsPrefix}--chat-code-lang">
          ${enableLanguageDisplay
            ? html`
                ${assignedLanguage
                  ? assignedLanguage
                  : autoAssignLanguage
                  ? language + ' ' + renderLabel('code-estimated-warning')
                  : 'no language detected'}
              `
            : ``}
          ${displayLineCount && lineCount > 1
            ? (enableLanguageDisplay ? ', ' : '') +
              lineCount +
              ' ' +
              renderLabel('code-line-descriptor')
            : ''}
        </div>`
      : ``}

    <div class="${clabsPrefix}--chat-code-options">
      <div class="${clabsPrefix}--chat-code-options-buttons">
        ${showContentDifferences
          ? html`
              <cds-icon-button
                size="md"
                kind="ghost"
                align="left"
                ?disabled="${!showContentDifferences}"
                aria-label="${comparisonEnabled
                  ? 'Exit comparison'
                  : 'Show comparison'}"
                ?isSelected="${comparisonEnabled}"
                @click="${handleComparisonEnabled}"
                role="button">
                ${iconLoader(Compare16, { slot: 'icon' })}
                <span slot="tooltip-content"
                  >${comparisonEnabled
                    ? 'Exit comparison'
                    : 'Show comparison'}</span
                >
              </cds-icon-button>
            `
          : html``}
        ${enableEditButton
          ? html`
              <cds-icon-button
                size="md"
                kind="ghost"
                align="left"
                aria-label="Edit Code"
                ?isSelected="${editingEnabled}"
                @click="${handleEditingEnabled}"
                role="button">
                ${iconLoader(Edit16, { slot: 'icon' })}
                <span slot="tooltip-content"
                  >${!editingEnabled
                    ? renderLabel('code-enable-editing')
                    : renderLabel('code-disable-editing')}</span
                >
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
                size="sm"
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
      @mousemove="${handleScroll}">
      <textarea
        @keydown="${controlTabbing}"
        @input="${handleFullCodeEdit}"
        @click="${handleScroll}"
        @focus="${startFullEdit}"
        .value=${displayedContent}
        aria-label="Editable Text"
        spellcheck="false"
        class="${clabsPrefix}--chat-code-edit-area ${!editable
          ? clabsPrefix + '--chat-code-edit-hidden'
          : ''}"></textarea>
      <div
        tabindex="0"
        role="textbox"
        aria-label="Code Section"
        class="${clabsPrefix + '--chat-code-color-area'} ${editable
          ? ' ' + clabsPrefix + '--chat-code-color-hidden'
          : ''}">
        ${_renderedLines.map(
          (lineObject, index) =>
            html`
              <div
                class="${clabsPrefix}--chat-code-line ${comparisonReference[
                  index
                ]
                  ? clabsPrefix +
                    '--chat-code-line-' +
                    comparisonReference[index]
                  : ''} ${clabsPrefix}--chat-code-line-fade-in ${lineObject.hidden
                  ? clabsPrefix + '--chat-code-line-hidden'
                  : ''}">
                ${disableLineTicks || _renderedLines.length < 2
                  ? html``
                  : html`
                      <div class="${clabsPrefix}--chat-code-line-tick">
                        ${
                          !comparisonReference[index]
                            ? index + 1
                            : comparisonReference[index] === 'removed'
                            ? '-'
                            : comparisonReference[index] === 'added'
                            ? '+'
                            : index + 1
                        }
                      </div>
                      <div class="${clabsPrefix}--chat-code-line-divider">
                      </div>

                      </div>
                    `}
                ${enableBlockCollapse && collapseAvailable
                  ? html`
                      <div
                        class="${clabsPrefix}--chat-code-line-collapser"
                        @click="${() => {
                          collapseBlock(index);
                        }}">
                        ${!lineObject.collapsable
                          ? ''
                          : collapsedList.includes(index)
                          ? iconLoader(ChevronLeft())
                          : iconLoader(ChevronDown())}
                      </div>
                    `
                  : ``}
                <div
                  class="${clabsPrefix}--chat-code-line-text ${clabsPrefix}--chat-code-${theme ||
                  'default'}-theme ${editable
                    ? ''
                    : clabsPrefix +
                      '--chat-code-line-offset-level-' +
                      lineObject.indent}">
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
      ${currentlyEdited && !disableEditingOptions
        ? html` <div class="${clabsPrefix}--chat-code-editing-controls">
            <cds-icon-button
              size="md"
              align="left"
              aria-label="Undo edit"
              role="button"
              kind="danger-tertiary"
              @click="${handleEditCancellation}">
              ${iconLoader(Undo16, { slot: 'icon' })}
              <span slot="tooltip-content"
                >${renderLabel('code-editing-cancelled')}</span
              >
            </cds-icon-button>

            <cds-icon-button
              size="md"
              aria-label="Validate Edit"
              role="button"
              align="left"
              kind="ghost"
              @click="${handleEditValidation}">
              ${iconLoader(Checkmark16, { slot: 'icon' })}
              <span slot="tooltip-content"
                >${renderLabel('code-editing-validation')}</span
              >
            </cds-icon-button>
          </div>`
        : html``}
    </div>
  </div>`;
}
