/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import '@carbon/web-components/es/components/accordion/accordion.js';
import { settings } from '@carbon-labs/utilities';

const { stablePrefix: clabsPrefix } = settings;

const blockClass = `${clabsPrefix}--style-picker-sections`;

/**
 * Lit template for style-picker-section component
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerSectionsTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { updateSlotCount, slotCount, _stylePickerContext } =
    customElementClass;
  const { kind } = _stylePickerContext;

  // If the kind is 'disclosed', we wrap the slot in an accordion
  // Otherwise, we just render the slot directly
  if (kind === 'disclosed') {
    return html`
      <div
        class=${`${blockClass}__container`}
        style=${`--${blockClass}-count: ${slotCount}`}>
        <cds-accordion>
          <slot @slotchange=${updateSlotCount}></slot>
        </cds-accordion>
      </div>
    `;
  } else {
    return html`<slot></slot>`;
  }
};
