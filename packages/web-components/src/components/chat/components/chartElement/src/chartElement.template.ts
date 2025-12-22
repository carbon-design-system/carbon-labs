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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../errorElement/errorElement.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/content-switcher/index.js';

import '../../codeElement/codeElement.js';

import Maximize16 from '@carbon/icons/es/maximize/16.js';
import Download16 from '@carbon/icons/es/download/16.js';
import Launch16 from '@carbon/icons/es/launch/16.js';
import Code16 from '@carbon/icons/es/code/16.js';
import Close16 from '@carbon/icons/es/close/16.js';
import ViewNext16 from '@carbon/icons/es/view-next/16.js';
import Redo16 from '@carbon/icons/es/redo/16.js';

import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
    theme,
    debugMode,
    streaming,
    _buildLoader: buildLoader,
    _openFullscreenView: openFullscreenView,
    _exportToImage: exportToImage,
    _openCodeView: openCodeView,
    _handleLiveRawEditorChange: handleLiveRawEditorChange,
    _handleLiveCarbonEditorChange: handleLiveCarbonEditorChange,
    showModal,
    _openEditorView: openEditorView,
    closeModal,
    _lightenSpec: lightenSpec,
    _visualizationSpec,
    _editedContent: editedContent,
    disableOptions,
    disableEditor,
    disableExport,
    disableFullscreen,
    disableCodeInspector,
    _handleMouseOut: handleMouseOut,
    _handleMouseOver: handleMouseOver,
    _handleOriginalEditorValidation: handleOriginalEditorValidation,
    _handleCarbonEditorValidation: handleCarbonEditorValidation,
    modalMode,
    _uniqueID: uniqueID,
    editOriginalSpecification,
    _showOriginalSpec: showOriginalSpec,
    _showCarbonSpec: showCarbonSpec,
    _enableContext: enableContext,
    _appendToContext: appendToContext,
    _chartClicked: chartClicked,
    exportedImageURL,
    _handleFullScreenScroll: handleFullScreenScroll,
    selected,
    isHovered,
    thumbNail,
  } = customElementClass;

  return html`
    ${showModal && !thumbNail
      ? html`
          <div class="${clabsPrefix}--chat-chart-fullscreen-container-close">
            <cds-icon-button
              kind="tertiary"
              aria-label="Close Fullscreen"
              role="button"
              align="bottom-right"
              @click="${closeModal}">
              ${iconLoader(Close16, { slot: 'icon' })}
              <span slot="tooltip-content">${'Close ' + modalMode}</span>
            </cds-icon-button>
          </div>
        `
      : html``}
    ${content && !thumbNail
      ? html`
    <div class="${clabsPrefix}--chat-chart-fullscreen-container ${
          modalMode === 'fullscreen'
            ? clabsPrefix + '--chat-chart-modal-visible'
            : ''
        }" @wheel=
          "${handleFullScreenScroll}">
      <div
          class="${clabsPrefix}--chat-chart-modal-container" id="${clabsPrefix}--chat-chart-fullscreen-embed-vis-${uniqueID}">

      </div>
    </div>

    <div class="${clabsPrefix}--chat-chart-fullscreen-container ${clabsPrefix}--chat-chart-fullscreen-container-editor ${
          modalMode === 'edit'
            ? clabsPrefix + '--chat-chart-edit-modal-visible'
            : ''
        }">
      ${
        chartLoading || errorMessage
          ? html`
              <div class="${clabsPrefix}--chat-editor-modal-section-chart">
                <div class="${clabsPrefix}--chat-chart-loading-container">
                  ${errorMessage
                    ? html` <div class="${clabsPrefix}--chat-chart-error-grid">
                          ${unsafeHTML(buildLoader())}
                        </div>
                        <div class="${clabsPrefix}--chat-chart-error-text">
                          ${errorMessage}
                        </div>`
                    : html` <div
                        class="${clabsPrefix}--chat-chart-loading-grid">
                        ${unsafeHTML(buildLoader())}
                      </div>`}
                </div>
              </div>
            `
          : html` <div
              class="${clabsPrefix}--chat-editor-modal-section-chart"
              id="${clabsPrefix}--chat-chart-editor-embed-vis-${uniqueID}"></div>`
      }

      ${
        showModal && !thumbNail
          ? html` <div class="${clabsPrefix}--chat-editor-modal-section-code">
              <div class="${clabsPrefix}--chat-editor-modal-header">
                <cds-content-switcher value="carbonified">
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
                    Edit Carbon Spec
                  </cds-content-switcher-item>
                </cds-content-switcher>
              </div>
              <div class="${clabsPrefix}--chat-editor-modal-code-container">
                ${!editedContent || !_visualizationSpec
                  ? ''
                  : html`
                      ${editOriginalSpecification
                        ? html`
                            <clabs-chat-code
                              editable
                              max-height="calc(100vh - 190px)"
                              debug
                              disable-line-ticks
                              render-language="json"
                              @on-code-edit-change="${handleLiveRawEditorChange}"
                              @on-code-edit-validation="${handleOriginalEditorValidation}"
                              content="${JSON.stringify(
                                JSON.parse(editedContent),
                                null,
                                '\t'
                              )}">
                            </clabs-chat-code>
                          `
                        : html`
                            <clabs-chat-code
                              editable
                              max-height="calc(100vh - 190px)"
                              disable-line-ticks
                              render-language="json"
                              @on-code-edit-change="${handleLiveCarbonEditorChange}"
                              @on-code-edit-validation="${handleCarbonEditorValidation}"
                              content="${JSON.stringify(
                                lightenSpec(_visualizationSpec),
                                null,
                                '\t'
                              )}">
                            </clabs-chat-code>
                          `}
                    `}
              </div>
            </div>`
          : html``
      }
      </div>
    </div>`
      : html``}
    ${exportedImageURL
      ? html`
          <div
            class="${clabsPrefix}--chat-chart-thumbnail-container${selected
              ? ' ' + clabsPrefix + '--chat-chart-thumbnail-container-selected'
              : ''}"
            @click="${chartClicked}"
            @mouseout="${handleMouseOut}"
            @mouseover="${handleMouseOver}">
            <img src="${exportedImageURL}" />
          </div>
        `
      : html`
          ${_visualizationSpec && !errorMessage && !streaming
            ? html` <div
                @click="${chartClicked}"
                class="${clabsPrefix}--chat-chart-container${selected
                  ? ' ' + clabsPrefix + '--chat-chart-container-selected'
                  : ''}"
                id="${clabsPrefix}--chat-chart-embed-vis-${uniqueID}"></div>`
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
                                aria-label="Open Code Viewer"
                                role="button"
                                size="sm"
                                tooltip-position="left"
                                tooltip-alignment="end"
                                tooltip-position="left"
                                tooltip-text="Investigate in editor"
                                @click="${openCodeView}">
                                ${iconLoader(Launch16, { slot: 'icon' })} View
                                in charts editor
                              </cds-button>`
                            : html``}
                          <br />
                          ${debugMode
                            ? html` <cds-button
                                kind="danger--tertiary"
                                aria-label="Open Vega Viewer"
                                role="button"
                                size="sm"
                                tooltip-position="left"
                                tooltip-alignment="end"
                                tooltip-position="left"
                                tooltip-text="Investigate in editor"
                                @click="${openEditorView}">
                                ${iconLoader(Launch16, { slot: 'icon' })} View
                                in Vega editor
                              </cds-button>`
                            : html``}
                        </div>`
                    : html` <div
                          class="${clabsPrefix}--chat-chart-loading-grid">
                          ${unsafeHTML(buildLoader())}
                        </div>
                        <div class="${clabsPrefix}--chat-chart-loading-text">
                          ${content}
                        </div>`}
                </div>
              </div>`}
        `}
    ${!isHovered &&
    (disableOptions || errorMessage || chartLoading || streaming)
      ? html``
      : html` <div
          class="${clabsPrefix}--chat-chart-options"
          @mouseover="${handleMouseOver}">
          <div class="${clabsPrefix}--chat-chart-options-prefade-${theme}">
            &nbsp;
          </div>
          <div class="${clabsPrefix}--chat-chart-options-buttons">
            ${!disableExport
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Make context"
                    role="button"
                    align="bottom-right"
                    @click="${exportToImage}">
                    ${iconLoader(Redo16, { slot: 'icon' })}
                    <span slot="tooltip-content">Return to this chart</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableExport
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Export Chart PNG"
                    role="button"
                    align="bottom-right"
                    @click="${exportToImage}">
                    ${iconLoader(Download16, { slot: 'icon' })}
                    <span slot="tooltip-content">Export to PNG</span>
                  </cds-icon-button>
                `
              : html``}
            ${enableContext
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Make latest Chart"
                    role="button"
                    align="bottom-right"
                    @click="${appendToContext}">
                    ${iconLoader(ViewNext16, { slot: 'icon' })}
                    <span slot="tooltip-content">Make latest chart</span>
                  </cds-icon-button>
                `
              : html``}
            ${enableContext
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Make latest Chart"
                    role="button"
                    align="bottom-right"
                    @click="${appendToContext}">
                    ${iconLoader(ViewNext16, { slot: 'icon' })}
                    <span slot="tooltip-content">Make latest chart</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableEditor && debugMode
              ? html`
                  <cds-icon-button
                    aria-label="Open in external Vega editor"
                    role="button"
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${openEditorView}">
                    ${iconLoader(Launch16, { slot: 'icon' })}
                    <span slot="tooltip-content">Open in Vega editor</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableCodeInspector
              ? html`
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Inspect and Edit Specification"
                    role="button"
                    align="bottom-right"
                    @click="${openCodeView}">
                    ${iconLoader(Code16, { slot: 'icon' })}
                    <span slot="tooltip-content">Show specification</span>
                  </cds-icon-button>
                `
              : html``}
            ${!disableFullscreen
              ? html`
                  <cds-icon-button
                    aria-label="View in Fullscreen"
                    role="button"
                    kind="ghost"
                    size="sm"
                    align="bottom-right"
                    @click="${openFullscreenView}">
                    ${iconLoader(Maximize16, { slot: 'icon' })}
                    <span slot="tooltip-content">Fullscreen</span>
                  </cds-icon-button>
                `
              : html``}
          </div>
        </div>`}
  `;
}
