/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../../style-picker-modules/style-picker-modules';
import '@carbon/web-components/es/components/popover/popover';
import '@carbon/web-components/es/components/popover/popover-content';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerTemplate = (customElementClass) => {
  return html`<cds-popover open>
    <slot name="trigger"></slot>
    <cds-popover-content>
      <!-- <clabs-style-picker-modules></clabs-style-picker-modules> -->
      Hello modules
    </cds-popover-content>
  </cds-popover>`;
};
