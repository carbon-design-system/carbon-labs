/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Login32 from '@carbon/icons/es/login/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { polyPath, rectPath, type Pt } from '../../geometry';
import { filletSegs, outlineD } from '../../off';

/**
 * Login: on hover the door widens 1px to each side (its height holds,
 * walls hold 2px) and the arrow reaches 2px further in: the head moves
 * right and the shaft lengthens behind it. Logout is the reverse: its door
 * narrows. 160ms entrance ease. Rest
 * matches Carbon.
 */
const HEAD: Pt[] = [
  [14.59, 11.41],
  [16, 10],
  [22, 16],
  [16, 22],
  [14.59, 20.59],
  [18.17, 17],
  [18.17, 15],
];
export const LoginSpec = /* @__PURE__ */ hoverIcon('Login', {
  geo: ({ h }) => {
    const [l, r] = [13 - h, 27 + h]; // the door's wall centrelines
    const a = 2 * h;
    return {
      door: {
        d: outlineD(
          filletSegs(
            [
              [l, 7],
              [l, 3],
              [r, 3],
              [r, 29],
              [l, 29],
              [l, 25],
            ],
            1
          )
        ),
      },
      shaft: { d: rectPath(4, 15, 18.17 + a, 17) },
      head: {
        d: polyPath(
          HEAD.map(([x, y]) => [x + a, y] as Pt),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Login32),
});
