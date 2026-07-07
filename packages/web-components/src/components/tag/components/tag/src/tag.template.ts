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

import '@carbon/web-components/es/components/tooltip/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function tagTemplate(customElementClass) {
  const {
    text: text,
    color: color,
    tooltipPosition: tooltipPosition,
    tooltipText: tooltipText,
    handleClick: handleClick,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--tag">
    <div class="${clabsPrefix}--tag-container">
      <cds-tooltip align="${tooltipPosition}">
        <button
          class="${clabsPrefix}--tag-button ${clabsPrefix}--tag-tooltip-trigger"
          color="${color}"
          tooltip-position="${tooltipPosition}"
          @click="${handleClick}">
          <slot>${text}</slot>
        </button>
        <cds-tooltip-content id="content"> ${tooltipText} </cds-tooltip-content>
      </cds-tooltip>
    </div>
  </div>`;
}
