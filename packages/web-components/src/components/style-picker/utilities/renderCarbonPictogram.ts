/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { svg } from 'lit';
import spread, {
  AttributesInfo,
} from '@carbon/web-components/es/globals/directives/spread.js';

/**
 * A dedicated function to render svg from `@carbon/pictograms` package
 *
 * @param {object} svgData - An object with the svg object from @carbon/pictograms package and additional attributes
 * @param {object} svgData.content - SVG content.
 * @param {object} svgData.attrs - Attributes object.
 */
export const renderCarbonPictogram = (svgData: {
  content: any;
  attrs: AttributesInfo;
}) => {
  const { content, attrs } = svgData;
  // Create SVG element using svg template tag
  return svg`
      <svg 
        ...="${spread(attrs)}"
      >
        ${content.map(
          (item: { attrs: AttributesInfo }) =>
            svg`<path ...="${spread(item.attrs)}" />`
        )}
      </svg>
    `;
};
