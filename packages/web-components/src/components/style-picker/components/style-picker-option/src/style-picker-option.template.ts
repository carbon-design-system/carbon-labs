/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import CheckmarkFilled16 from '@carbon/web-components/es/icons/checkmark--filled/16.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-option`;

/**
 * Lit template for style-picker-option component
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerOptionTemplate = (customElementClass) => {
  const { label, value, isSelected, size, handleClick } = customElementClass;

  return html`<li
    class=${`${blockClass} ${blockClass}--${size}`}
    data-value=${value}
    role="option"
    tabindex=${isSelected ? '0' : '-1'}
    aria-label=${label}
    aria-selected=${isSelected}
    title=${label}
    @click=${handleClick}>
    <div class=${`${blockClass}__container`}>
      <slot></slot>
      <div class=${`${blockClass}__selection-indicator`} aria-hidden=${false}>
        ${CheckmarkFilled16()}
      </div>
    </div>
  </li>`;
};
