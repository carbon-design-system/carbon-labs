/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { svg } from 'lit';

/**
 *
 * @param {object} svgData - object from @carbon/pictograms package
 */
export const renderSvg = (svgData) => {
  // Create SVG element using svg template tag
  return svg`
      <svg 
        xmlns=${svgData.attrs.xmlns}
        viewBox=${svgData.attrs.viewBox}
        fill=${svgData.attrs.fill}
        width=${svgData.attrs.width}
        height=${svgData.attrs.height}
      >
        ${svgData.content.map((item) => svg`<path d=${item.attrs.d} />`)}
      </svg>
    `;
};
