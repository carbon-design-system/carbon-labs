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
import '@carbon/web-components/es/components/accordion/accordion-item.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-disclosed`;

/**
 * Lit template for disclosed item.
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerDisclosedTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { heading, slotIndex, _stylePickerContext } = customElementClass;
  const { setActiveSection } = _stylePickerContext;

  return html`<cds-accordion-item
    .title=${heading}
    class=${`${blockClass}--disclosed`}
    @cds-accordion-item-toggled=${() => {
      setActiveSection?.(slotIndex);
    }}>
    <slot></slot>
  </cds-accordion-item>`;
};
