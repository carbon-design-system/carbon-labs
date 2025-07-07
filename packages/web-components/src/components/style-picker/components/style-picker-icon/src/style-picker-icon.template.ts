/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import '../../style-picker-module/style-picker-module';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-icon`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerIconTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { items, heading, size, selectedItem, moduleIndex } =
    customElementClass;

  return html`<div part=${`${blockClass}__item`}>
    <slot></slot>
  </div> `;

  /**
   * @param {object} item Item to be rendered
   */
  // const _render = (item): TemplateResult =>
  //   html` <div part=${`${blockClass}__item`}>${item.renderIcon()}</div> `;

  // return html`
  //   <clabs-style-picker-module
  //     heading=${heading}
  //     size=${size}
  //     .items=${items}
  //     .renderItem=${_render}
  //     selected-item=${selectedItem}
  //     slot-index=${moduleIndex}>
  //   </clabs-style-picker-module>
  // `;
};
