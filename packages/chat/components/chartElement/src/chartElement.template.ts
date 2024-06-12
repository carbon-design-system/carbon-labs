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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../errorElement/errorElement.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/modal/index.js';

import Maximize16 from '@carbon/web-components/es/icons/maximize/16.js';
import Download16 from '@carbon/web-components/es/icons/download/16.js';
import Launch16 from '@carbon/web-components/es/icons/launch/16.js';
import Code16 from '@carbon/web-components/es/icons/code/16.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chartElementTemplate(customElementClass) {
  const {
    _errorMessage: errorMessage,
    chartLoading,
    content,
    debugMode,
    renderMethod,
    _buildLoader: buildLoader,
    _openFullscreenView: openFullscreenView,
    _exportToImage: exportToImage,
    _openCodeView: openCodeView,
    showModal,
    _openEditorView: openEditorView,
    closeModal,
    modalContent,
    _visualizationSpec,
    disableOptions,
    disableEditor,
    disableExport,
    disableFullscreen,
    disableCodeInspector,
    _handleModelEditorValidation: handleModelEditorValidation,
    modalMode,
    theme,
    _uniqueID: uniqueID,
  } = customElementClass;

  return html`
    ${modalMode === 'fullscreen'
      ? html` <cds-modal
          size="lg"
          passive-modal
          ?open="${showModal}"
          @cds-modal-closed="${closeModal}"
          class="${clabsPrefix}--chat-chart-modal-custom">
          <cds-modal-header>
            <cds-modal-close-button></cds-modal-close-button>
            <cds-modal-title>Chart Viewer</cds-modal-title>
          </cds-modal-header>
          <cds-modal-body class="${clabsPrefix}--chat-chart-modal-body">
            <div class="${clabsPrefix}--chat-chart-modal-container">
              ${unsafeHTML(modalContent)}
            </div>
          </cds-modal-body>
        </cds-modal>`
      : modalMode === 'code'
      ? html` <cds-modal
          size="lg"
          passive-modal
          ?open="${showModal}"
          @cds-modal-closed="${closeModal}"
          class="${clabsPrefix}--chat-chart-modal-custom">
          <cds-modal-header>
            <cds-modal-close-button></cds-modal-close-button>
            <cds-modal-title>Vega specification Editor</cds-modal-title>
          </cds-modal-header>
          <cds-modal-body class="${clabsPrefix}--chat-chart-modal-body">
            <div class="${clabsPrefix}--chat-chart-modal-container">
              <div class="${clabsPrefix}--chat-editor-modal-container">
                <div
                  class="${clabsPrefix}--chat-editor-modal-section ${clabsPrefix}--chat-editor-embed-vis-${uniqueID}"></div>
                <div class="${clabsPrefix}--chat-editor-modal-section">
                  <clabs-chat-code
                    editable
                    @on-code-edit-validation="${handleModelEditorValidation}"
                    content="${JSON.stringify(_visualizationSpec, null, '\t')}">
                  </clabs-chat-code>
                </div>
              </div>
            </div>
          </cds-modal-body>
        </cds-modal>`
      : html``}
    ${_visualizationSpec
      ? html` <div
          class="${clabsPrefix}--chat-chart-container"
          id="${clabsPrefix + '--chat-embed-vis-' + uniqueID}"></div>`
      : html` <div class="${clabsPrefix}--chat-chart-container">
          <div class="${clabsPrefix}--chat-chart-loading-container">
            ${errorMessage
              ? html` <div class="${clabsPrefix}--chat-chart-error-grid">
                    ${unsafeHTML(buildLoader())}
                  </div>
                  <div class="${clabsPrefix}--chat-chart-error-text">
                    ${debugMode
                      ? errorMessage
                      : 'Chart failed to render, see console for more details.'}
                    <br />
                    <br />
                    ${debugMode
                      ? html` <cds-button
                          kind="danger--tertiary"
                          size="sm"
                          @click="${openEditorView}">
                          ${Launch16({ slot: 'icon' })} Investigate in Editor
                        </cds-button>`
                      : html``}
                  </div>`
              : html` <div class="${clabsPrefix}--chat-chart-loading-grid">
                    ${unsafeHTML(buildLoader())}
                  </div>
                  <div class="${clabsPrefix}--chat-chart-loading-text">
                    ${content}
                  </div>`}
          </div>
        </div>`}
    ${disableOptions || errorMessage || chartLoading
      ? html``
      : html` <div class="${clabsPrefix}--chat-chart-options">
          <div class="${clabsPrefix}--chat-chart-options-prefade-${theme}">
            &nbsp;
          </div>
          <div class="${clabsPrefix}--chat-chart-options-buttons">
            ${!disableExport
              ? html`
                  <cds-button
                    kind="ghost"
                    size="sm"
                    ?disabled="${renderMethod !== 'canvas'}"
                    tooltip-text="${renderMethod === 'canvas'
                      ? 'Export to PNG'
                      : 'SVG export unavailable'}"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    @click="${exportToImage}">
                    ${Download16({ slot: 'icon' })}
                  </cds-button>
                `
              : html``}
            ${!disableEditor && debugMode
              ? html`
                  <cds-button
                    kind="ghost"
                    size="sm"
                    tooltip-text="Open in Vega editor"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    @click="${openEditorView}">
                    ${Launch16({ slot: 'icon' })}
                  </cds-button>
                `
              : html``}
            ${!disableCodeInspector
              ? html`
                  <cds-button
                    kind="ghost"
                    size="sm"
                    tooltip-text="Show specification"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    @click="${openCodeView}">
                    ${Code16({ slot: 'icon' })}
                  </cds-button>
                `
              : html``}
            ${!disableFullscreen
              ? html`
                  <cds-button
                    kind="ghost"
                    size="sm"
                    tooltip-text="Fullscreen"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    @click="${openFullscreenView}">
                    ${Maximize16({ slot: 'icon' })}
                  </cds-button>
                `
              : html``}
          </div>
        </div>`}
  `;
}
