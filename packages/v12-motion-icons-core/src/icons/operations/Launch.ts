/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Launch16 from '@carbon/icons/es/launch/16.js';
import Launch32 from '@carbon/icons/es/launch/32.js';
import { defineAction, hoverIcon, carbonArt } from '../../engine';
import { LINE } from '../../paint';
import { filletSegs, outlineD } from '../../off';
import { OUT_BACK, outAndBack } from '../../actionGeo';

/**
 * Launch: on hover the arrow reaches 2px further up-right: the head moves
 * and the shaft lengthens behind it. The frame holds. 160ms
 * entrance ease. Rest matches Carbon.
 *
 * Action (70ms out, 110ms back): the same reach, out until the head's
 * outer corner (30, 2 at rest) is on the box's corner (34, −2): 4px on each
 * axis. The shaft lengthens behind it; the frame holds.
 */
const D = Math.SQRT1_2 * 2;
/** How far (px on each axis) the action's reach takes the head: its outer corner onto the box's corner. */
const TO_BOX = 4;
const FRAME = /* @__PURE__ */ outlineD(
  /* @__PURE__ */ filletSegs(
    [
      [16, 5],
      [5, 5],
      [5, 27],
      [27, 27],
      [27, 16],
    ],
    1
  )
);
/** The arrow with its head moved m px up and right (the shaft lengthening behind it). */
const shapes = (m: number) => ({
  frame: { d: FRAME },
  head: { d: `M${20 + m} ${3 + -m}H${29 + m}V${12 + -m}`, ...LINE },
  shaft: { d: `M18.7071 13.2929L${29 + m} ${3 + -m}`, ...LINE },
});
export const LaunchSpec = /* @__PURE__ */ hoverIcon('Launch', {
  geo: ({ h }) => shapes(D * h),
  static: /* @__PURE__ */ carbonArt(Launch16, Launch32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Launched: the arrow reaches out of the frame's open corner, up and to the right, then draws back to rest. The frame holds still.",
    duration: OUT_BACK,
    geo: ({ h, a }) =>
      shapes(Math.max(D * h, a <= 0 || a >= 1 ? 0 : TO_BOX * outAndBack(a))),
  }),
});
