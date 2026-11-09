/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Apps16 from '@carbon/icons/es/apps/16.js';
import Apps32 from '@carbon/icons/es/apps/32.js';
import { hoverIcon, type Shapes, carbonArt } from '../../engine';
import { rectPath } from '../../geometry';
import { together } from '../../ease';
import { EVENODD } from '../../paint';

/**
 * Apps: on hover the grid spaces out — every tile moves 1px further from
 * the centre tile (the gaps grow 2px → 3px), all together (no stagger); the
 * tiles keep their size and 2px walls. 160ms entrance ease.
 */
const grid = /* @__PURE__ */ together();
export const AppsSpec = /* @__PURE__ */ hoverIcon('Apps', {
  hover: grid.hover,
  geo: ({ h }) => {
    const s: Shapes = {};
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const [dx, dy] = [col - 1, row - 1];
        const k = grid.at(h, Math.abs(dx) + Math.abs(dy) - 1);
        const [x, y] = [2 + 10 * col + dx * k, 2 + 10 * row + dy * k];
        s[`t${row}${col}`] = {
          d:
            rectPath(x, y, x + 8, y + 8) + rectPath(x + 2, y + 2, x + 6, y + 6),
          ...EVENODD,
        };
      }
    }
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Apps16, Apps32),
});
