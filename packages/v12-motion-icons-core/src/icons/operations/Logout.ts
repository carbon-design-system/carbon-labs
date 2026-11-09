/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Logout32 from '@carbon/icons/es/logout/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { polyPath, rectPath, type Pt } from '../../geometry';
import { filletSegs, outlineD } from '../../off';

/**
 * Logout: on hover the door narrows 1px from each side (its height holds,
 * walls hold 2px) and the arrow reaches 2px further out: the head moves
 * right and the shaft lengthens behind it. Login is the reverse: its door
 * widens. 160ms entrance ease. Rest matches Carbon.
 */
const HEAD: Pt[] = [
  [20.586, 11.414],
  [22, 10],
  [28, 16],
  [22, 22],
  [20.586, 20.586],
  [24.172, 17],
  [24.172, 15],
];
export const LogoutSpec = /* @__PURE__ */ hoverIcon('Logout', {
  geo: ({ h }) => {
    const [l, r] = [5 + h, 19 - h]; // the door's wall centrelines
    const a = 2 * h;
    return {
      door: {
        d: outlineD(
          filletSegs(
            [
              [r, 7],
              [r, 3],
              [l, 3],
              [l, 29],
              [r, 29],
              [r, 25],
            ],
            1
          )
        ),
      },
      shaft: { d: rectPath(10, 15, 24.172 + a, 17) },
      head: {
        d: polyPath(
          HEAD.map(([x, y]) => [x + a, y] as Pt),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Logout32),
});
