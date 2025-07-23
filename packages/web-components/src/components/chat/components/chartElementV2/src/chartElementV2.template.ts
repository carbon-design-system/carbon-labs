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

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chartElementV2Template(customElementClass) {
  const {
    _toggleFullscreen,
    _uniqueID,
    _exportSpec,
    _exportPreSpec,
    streaming,
    _loading,
    specStr,
    _error,
    _onClick,
    _thumbSrc,
    _hovered,
    _selected,
    _exportToImage,
    _parentTheme,
  } = customElementClass;

  return html`
    <div tabindex="0" class="wrapper ${
      _hovered || _selected ? 'container-selected' : ''
    }
    @click="${_onClick}">
        <div class="toolbar">
         <div class="${clabsPrefix}--chat-chart-options-prefade-${_parentTheme}">
            &nbsp;
          </div>
          <div class="${clabsPrefix}--chat-chart-options-buttons">
           <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Export Chart PNG"
                    role="button"
                    align="bottom-right"
                    @click="${_exportToImage}">
                    ${Download16({ slot: 'icon' })}
                    <span slot="tooltip-content">Export to PNG</span>
                  </cds-icon-button>
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Export to Vega Editor"
                    role="button"
                    align="bottom-right"
                    @click="${_exportSpec}">
                    ${Launch16({ slot: 'icon' })}
                    <span slot="tooltip-content">Export to Editor</span>
                  </cds-icon-button>
                  <cds-icon-button
                    kind="ghost"
                    size="sm"
                    aria-label="Fullscreen"
                    role="button"
                    align="bottom-right"
                    @click="${_toggleFullscreen}">
                    ${Maximize16({ slot: 'icon' })}
                    <span slot="tooltip-content">Fullscreen</span>
                  </cds-icon-button>
          </div>
        </div>
        ${
          _thumbSrc
            ? html`<div
                class="${clabsPrefix}--chat-chart-thumbnail-container${_selected
                  ? ' ' +
                    clabsPrefix +
                    '--chat-chart-thumbnail-container-selected'
                  : ''}">
                <img src="${_thumbSrc}" />
              </div>`
            : html`<div id="chart_${_uniqueID}" class="chart"></div>`
        }
        
        ${
          streaming && _loading
            ? html`<pre class="partial">${specStr}</pre>
                <div class="grid"></div>`
            : _loading && !_error
            ? html`<div class="grid ${_error ? 'grid-error' : ''}"></div>`
            : _error
            ? html`<div class="grid grid-error"></div>
                <div class="error">${_error}</div>`
            : null
        }
      </div>
  `;
}
