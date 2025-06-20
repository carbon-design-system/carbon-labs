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
import { renderSvg } from '../../../utilities/renderSvg';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-pictogram-module`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerPictogramModuleTemplate = (
  customElementClass
): TemplateResult<1> => {
  const { items, title, size, selectedItem } = customElementClass;

  /**
   * @param {object} item Item to be rendered
   */
  const _render = (item): TemplateResult => {
    return html`
      ${renderSvg({
        ...item.renderPictogram,
        attrs: { ...item.renderPictogram.attrs, width: '3rem', height: '3rem' },
      })}
    `;
  };

  return html`
    <clabs-style-picker-module
      .title=${title}
      .size=${size}
      .items=${items}
      .renderItem=${_render}
      .selectedItem=${selectedItem}>
    </clabs-style-picker-module>
  `;
};
