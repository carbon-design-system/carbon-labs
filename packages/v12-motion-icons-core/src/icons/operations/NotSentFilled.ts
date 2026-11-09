/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import NotSentFilled32 from '@carbon/icons/es/not-sent--filled/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import {
  acrossStrike,
  alongStrike,
  planeAt,
  strikeAt,
  tipPiece,
} from './NotSent';

/**
 * Timing: moderate01, entrance
 *
 * As NotSent: on hover the strike extends 1px at each end and the
 * paper plane shrinks to 90% about (14.007, 18).
 *
 * The solid plane is three pieces of Carbon's outline form around its
 * centreline tips (each edge's outside 1px out, round tips), rebuilt from
 * the scaled points every frame, so its outline never thickens: the right
 * tip, cut along the edge of the 3px gap above the strike; and the left and
 * bottom tips, split by the nib's 2px slit (which scales with the plane)
 * and cut inside the strike. No masks. Rest matches Carbon within 0.5%.
 */

// The edge of Carbon's gap above the strike, and a cut inside the strike.
const GAP_EDGE = -5.66;
const UNDER = 0.4;

export const NotSentFilledSpec = /* @__PURE__ */ hoverIcon('NotSentFilled', {
  geo: ({ h }) => {
    const { left, inner, bottom, right } = planeAt(h);
    // The slit runs along the nib's line (x + y = 32 through the inner
    // corner), 1px either side at any scale.
    const nib = inner[0] + inner[1];
    const slitEdge = (side: 1 | -1) => acrossStrike(nib + side * Math.SQRT2);
    return {
      top: {
        d: tipPiece(
          right,
          left,
          bottom,
          alongStrike(GAP_EDGE),
          alongStrike(GAP_EDGE),
          true
        ),
      },
      left: {
        d: tipPiece(left, right, inner, alongStrike(UNDER), slitEdge(-1), true),
      },
      bottom: {
        d: tipPiece(
          bottom,
          right,
          inner,
          alongStrike(UNDER),
          slitEdge(1),
          true
        ),
      },
      strike: strikeAt(h),
    };
  },
  static: /* @__PURE__ */ carbonArt(NotSentFilled32),
});
