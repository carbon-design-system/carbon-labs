/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-color`;

/**
 * Lit template style-picker-color option component.
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerColorTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { label, color } = customElementClass;

  return html`
    <div class=${`${blockClass}__item`}>
      <svg viewBox="0 0 1 1" aria-label=${label}>
        <rect x="0" y="0" width="1" height="1" fill=${color} />
      </svg>
    </div>
  `;
};
