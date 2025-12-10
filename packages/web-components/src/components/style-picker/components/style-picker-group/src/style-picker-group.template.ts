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
import '@carbon/web-components/es/components/accordion/accordion-item.js';

import '../../style-picker-option/style-picker-option.js';

const { stablePrefix: clabsPrefix, prefix: carbonPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-group`;

/**
 * Lit template style-picker-group component.
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult} The template result
 */
export const stylePickerGroupTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { heading, _stylePickerContext } = customElementClass;
  const { size } = _stylePickerContext;

  /**
   * Wrap group options here.
   */
  const renderDefault = () => {
    return html`<div class=${`${blockClass} ${blockClass}--${size}`}>
      <div
        class=${`cds--contained-list ${carbonPrefix}--contained-list--disclosed ${blockClass}__group`}>
        <div class=${`cds--contained-list__header`} role="presentation">
          ${heading}
        </div>
        <ul class=${`${blockClass}__items`} role="group">
          <slot></slot>
        </ul>
      </div>
    </div>`;
  };

  return renderDefault();
};
