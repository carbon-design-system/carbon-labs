/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-group`;

/**
 * Lit template for group
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerGroupTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { heading, group } = customElementClass;

  return html`
    <div
      key=${group.label}
      class=${`cds--contained-list ${carbonPrefix}--contained-list--disclosed ${blockClass}__group`}>
      <div class=${`cds--contained-list__header`} role="presentation">
        ${group.label}
      </div>
      <ul role="group">
        <slot></slot>
      </ul>
    </div>
  `;
};
