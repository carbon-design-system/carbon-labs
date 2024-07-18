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
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/content-switcher/index.js';

import '../../codeElement/codeElement.js';

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
    _buildLoader: buildLoader,
    _openFullscreenView: openFullscreenView,
    _exportToImage: exportToImage,
    _openCodeView: openCodeView,
    showModal,
    _openEditorView: openEditorView,
    closeModal,
    modalContent,
    _lightenSpec: lightenSpec,
    _visualizationSpec,
    disableOptions,
    disableEditor,
    disableExport,
    disableFullscreen,
    disableCodeInspector,
    _handleOriginalEditorValidation: handleOriginalEditorValidation,
    _handleCarbonEditorValidation: handleCarbonEditorValidation,
    modalMode,
    _uniqueID: uniqueID,
    editOriginalSpecification,
    _showOriginalSpec: showOriginalSpec,
    _showCarbonSpec: showCarbonSpec,
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
                  class="${clabsPrefix}--chat-editor-modal-section-chart ${clabsPrefix}--chat-editor-embed-vis-${uniqueID}"></div>
                <div class="${clabsPrefix}--chat-editor-modal-section-code">
                  <div class="${clabsPrefix}--chat-editor-modal-header">
                    <cds-content-switcher value="all">
                      <cds-content-switcher-item
                        value="original"
                        selected
                        data-selection="original"
                        @click="${showOriginalSpec}">
                        Edit Original Spec
                      </cds-content-switcher-item>
                      <cds-content-switcher-item
                        value="carbonified"
                        data-selection="carbonified"
                        @click="${showCarbonSpec}">
                        Edit Carbonified Spec
                      </cds-content-switcher-item>
                    </cds-content-switcher>
                  </div>
                  <div class="${clabsPrefix}--chat-editor-modal-code-container">
                    ${editOriginalSpecification
                      ? html`
                          <clabs-chat-code
                            editable
                            @on-code-edit-validation="${handleOriginalEditorValidation}"
                            content="${JSON.stringify(
                              lightenSpec(JSON.parse(content)),
                              null,
                              '\t'
                            )}">
                          </clabs-chat-code>
                        `
                      : html`
                          <clabs-chat-code
                            editable
                            @on-code-edit-validation="${handleCarbonEditorValidation}"
                            content="${JSON.stringify(
                              lightenSpec(_visualizationSpec),
                              null,
                              '\t'
                            )}">
                          </clabs-chat-code>
                        `}
                  </div>
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
                          tooltip-position="left"
                          tooltip-alignment="end"
                          tooltip-position="left"
                          tooltip-text="Investigate in editor"
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
          <div class="${clabsPrefix}--chat-chart-options-prefade">&nbsp;</div>
          <div class="${clabsPrefix}--chat-chart-options-buttons">
            ${!disableExport
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${exportToImage}">
                    ${Download16({ slot: 'icon' })}
                    <span slot="tooltip-content">Export to PNG</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableEditor && debugMode
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${openEditorView}">
                    ${Launch16({ slot: 'icon' })}
                    <span slot="tooltip-content">Open in Vega editor</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableCodeInspector
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${openCodeView}">
                    ${Code16({ slot: 'icon' })}
                    <span slot="tooltip-content">Show specification</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableFullscreen
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${openFullscreenView}">
                    ${Maximize16({ slot: 'icon' })}
                    <span slot="tooltip-content">Fullscreen</span>
                  </cds-icon-button>
                `
              : html``}
          </div>
        </div>`}
  `;
}
