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
import '@carbon/web-components/es/components/loading/index.js';
import Maximize16 from '@carbon/icons/es/maximize/16.js';
import Download16 from '@carbon/icons/es/download/16.js';
import Launch16 from '@carbon/icons/es/launch/16.js';
import Close16 from '@carbon/icons/es/close/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function molecularElementTemplate(customElementClass) {
  const {
    theme,
    title,
    _uniqueID: uniqueID,
    _smilesContent: smilesContent,
    streaming,
    loading,
    fullscreenMode,
    disableOptions,
    _openEditorView: openEditorView,
    disableFullscreen,
    _openFullscreenView: openFullscreenView,
    _closeFullscreenView: closeFullscreenView,
    disableExport,
    thumbNailMode,
    _handleMouseOver: handleMouseOver,
    _handleMouseOut: handleMouseOut,
    isHovered,
    _exportToImage: exportToImage,
    disableCodeInspector,
    pubChemUrl,
    _handleFullScreenScroll: handleFullScreenScroll,
  } = customElementClass;

  return html`
    <div
      @mouseout="${handleMouseOut}"
      @mouseover="${handleMouseOver}"
      id="${clabsPrefix}--chat-molecule-container-id-${uniqueID}"
      class="${clabsPrefix}--chat-molecule-container ${clabsPrefix}--chat-molecule-${theme}">
      ${loading
        ? html`
            <div class="${clabsPrefix}--chat-molecule-container-loader">
              <cds-loading></cds-loading>
            </div>
          `
        : ''}

      <svg
        class="${clabsPrefix}--chat-molecule-target"
        id="clabs--chat-molecule-${uniqueID}"></svg>

      ${streaming
        ? html`<div class="${clabsPrefix}--chat-molecule-stream-text-container">
            <div class="${clabsPrefix}--chat-molecule-stream-text-content">
              ${smilesContent}
            </div>
          </div>`
        : ``}
      ${title && !(!isHovered && thumbNailMode)
        ? html`<div
            class="${clabsPrefix}--chat-molecule-title ${thumbNailMode
              ? clabsPrefix + '--chat-molecule-title-thumbnail'
              : ''}">
            ${title}
          </div>`
        : html``}
      ${disableOptions || loading || streaming
        ? html``
        : html` <div
            class="${clabsPrefix}--chat-molecule-options ${thumbNailMode &&
            !isHovered
              ? clabsPrefix + '--chat-molecule-options-hidden'
              : ''}">
            <div class="${clabsPrefix}--chat-molecule-options-prefade-${theme}">
              &nbsp;
            </div>
            <div class="${clabsPrefix}--chat-molecule-options-buttons">
              ${!disableExport
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      size="sm"
                      aria-label="Export to PNG"
                      role="button"
                      align="bottom-right"
                      @click="${exportToImage}">
                      ${iconLoader(Download16, { slot: 'icon' })}
                      <span slot="tooltip-content">Export to PNG</span>
                    </cds-icon-button>
                  `
                : html``}
              ${!disableCodeInspector && pubChemUrl
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      size="sm"
                      aria-label="Open in PubChem"
                      role="button"
                      align="bottom-right"
                      disabled="${!pubChemUrl}"
                      @click="${openEditorView}">
                      ${iconLoader(Launch16, { slot: 'icon' })}
                      <span slot="tooltip-content">Open in PubChem</span>
                    </cds-icon-button>
                  `
                : html``}
              ${!disableFullscreen
                ? html`
                    <cds-icon-button
                      kind="ghost"
                      aria-label="Fullscreen"
                      role="button"
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
    </div>

    <div class="${clabsPrefix}--chat-molecule-tester">
      <svg id="clabs--chat-molecule-test-${uniqueID}"></svg>
    </div>

    ${fullscreenMode
      ? html` <div
          class="${clabsPrefix}--chat-molecule-fullscreen-container-close">
          <cds-icon-button
            kind="tertiary"
            size="md"
            aria-label="Close Fullscreen"
            role="button"
            align="bottom-right"
            @click="${openFullscreenView}">
            ${iconLoader(Close16, { slot: 'icon' })}
            <span slot="tooltip-content">Fullscreen</span>
          </cds-icon-button>
        </div>`
      : ''}

    <div
      class="${clabsPrefix}--chat-molecule-fullscreen-container"
      @wheel="${handleFullScreenScroll}"
      @click="${closeFullscreenView}">
      <svg
        class="${clabsPrefix}--chat-molecule-target-fullscreen"
        id="clabs--chat-molecule-fullscreen-${uniqueID}"></svg>
    </div>
  `;
}
