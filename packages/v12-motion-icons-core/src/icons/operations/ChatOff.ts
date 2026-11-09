/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChatOff32 from '@carbon/icons/es/chat--off/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { EVENODD } from '../../paint';
import {
  filletSegs,
  offBase,
  OFF_SHRINK,
  slashPath,
  SLASH_REACH,
  type Slash,
} from '../../off';

/**
 * Chat off, on the set-wide Off rule (the reference animation shrank the
 * bubble 1px): on hover the bubble and its tail shrink to 90% about the
 * bubble's centre at constant 2px weight, under the slash and Carbon's 2px
 * gap above it (a fixed strip, so the cut stays flush as the bubble moves
 * under it), while the slash extends 1px at each end. 160ms entrance ease.
 *
 * The bubble is its 2px centrelines (outer corners r4): the top and right
 * walls (cut flush at the gap, and square at y = 21 as Carbon does), the
 * left and lower-left walls, and the tail with the bottom wall beside it
 * (both running under the slash). No masks. Rest matches Carbon.
 */
export const CHAT_OFF_SLASH: Slash = {
  a: [2.7071, 2.7071],
  b: [29.2929, 29.2929],
  gapSide: -1,
  gap: 2,
};
export const CHAT_OFF_STROKES = [
  /* @__PURE__ */ filletSegs(
    [
      [6, 5],
      [29, 5],
      [29, 21],
    ],
    3
  ),
  /* @__PURE__ */ filletSegs(
    [
      [6, 5],
      [3, 5],
      [3, 23],
      [12, 23],
    ],
    3
  ),
  /* @__PURE__ */ filletSegs(
    [
      [13.87, 29.5],
      [17.58, 23],
      [26, 23],
    ],
    0
  ),
];

export const ChatOffSpec = /* @__PURE__ */ hoverIcon('ChatOff', {
  geo: ({ h }) => {
    const base = offBase(
      CHAT_OFF_STROKES,
      CHAT_OFF_SLASH,
      1 - OFF_SHRINK * h,
      [16, 14]
    );
    return {
      fill: { d: base.fill },
      rings: { d: base.rings, ...EVENODD },
      slash: { d: slashPath(CHAT_OFF_SLASH, SLASH_REACH * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ChatOff32),
});
