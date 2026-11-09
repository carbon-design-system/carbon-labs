/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Flash32 from '@carbon/icons/es/flash/32.js';
import FlashFilled32 from '@carbon/icons/es/flash--filled/32.js';
import FlashOff32 from '@carbon/icons/es/flash--off/32.js';
import FlashOffFilled32 from '@carbon/icons/es/flash--off--filled/32.js';
import { carbonArt, withStatic } from '../../engine';
import type { Pt } from '../../geometry';
import { growPoly } from '../../cut';
import { filletSegs } from '../../off';
import {
  makeOffIcon,
  makeSlashToggle,
  type SlashToggleSpec,
} from '../../utils/slashToggle';

const CFlash = /* @__PURE__ */ carbonArt(Flash32);
const CFlashFilled = /* @__PURE__ */ carbonArt(FlashFilled32);
const CFlashOff = /* @__PURE__ */ carbonArt(FlashOff32);
const CFlashOffFilled = /* @__PURE__ */ carbonArt(FlashOffFilled32);

/**
 * Flash ⇄ Flash off, on the frame engine (see utils/slashToggle).
 *
 * On hover (the Flash reference): the bolt's corners morph to the reference's keyframe (the
 * bolt stretches up and down and leans). Off hover: the bolt shrinks to 90%, the slash extends 1px at each
 * end. On → off the bolt kicks 2px right. The bolt is its 2px centreline
 * (Carbon's outline rounds its outer corners and keeps its inner ones
 * sharp), or, filled, that centreline grown 1px. Rest matches Carbon.
 */
const BOLT: Pt[] = [
  [18.9966, 12],
  [20.9966, 3],
  [11.0046, 3],
  [8.0028, 16],
  [14.0034, 16],
  [11.9943, 28.9902],
  [25.0274, 12],
];
const PIVOT: Pt = [16.5, 16];
const SLASH = {
  a: [2.7071, 2.7071] as Pt,
  b: [29.2929, 29.2929] as Pt,
  gapSide: -1 as const,
  gap: 2,
};

// Flash's hover keyframe as the same corners (its fillet tangent pairs
// intersected back to sharp corners): the top rises ~1.9px and leans right,
// the waist drops 1px and the tip reaches 2px further down: a path morph,
// not a uniform scale. Applied as offsets from the rest corners.
const AE_REST: Pt[] = [
  [19, 12],
  [21.0004, 3],
  [10.9997, 3],
  [8.0003, 16],
  [14.001, 16],
  [12.0001, 29.0007],
  [24.9995, 12],
];
const AE_HOVER: Pt[] = [
  [19.403, 10.97],
  [21.6116, 1.103],
  [11.6109, 1.103],
  [7.7539, 17],
  [13.755, 17],
  [11.4365, 31.0104],
  [25.4003, 10.97],
];

const bolt = (hOn: number): Pt[] =>
  BOLT.map(
    ([x, y], i) =>
      [
        x + (AE_HOVER[i][0] - AE_REST[i][0]) * hOn,
        y + (AE_HOVER[i][1] - AE_REST[i][1]) * hOn,
      ] as Pt
  );

const OUTLINE: SlashToggleSpec = {
  statics: [CFlash, CFlashOff],
  slash: SLASH,
  kick: [2, 0],
  centre: PIVOT,
  base: (hOn) => ({
    strokes: [{ path: filletSegs(bolt(hOn), 0, true), round: 1 }],
  }),
};
// Carbon cuts its filled drawings with a 3px gap (2px for outlines).
const FILLED: SlashToggleSpec = {
  ...OUTLINE,
  slash: { ...SLASH, gap: 3 },
  statics: [CFlashFilled, CFlashOffFilled],
  base: (hOn) => ({ strokes: [], solids: [growPoly(bolt(hOn), 1)] }),
};

export const FlashOffOutlineToggleSpec = /* @__PURE__ */ makeSlashToggle(
  'FlashOffToggle',
  OUTLINE
);
export const FlashOffFilledToggleSpec = /* @__PURE__ */ makeSlashToggle(
  'FlashOffToggle(filled)',
  FILLED
);
export const FlashOffIconSpec = /* @__PURE__ */ withStatic(
  makeOffIcon('FlashOff', OUTLINE),
  /* @__PURE__ */ carbonArt(FlashOff32)
);
export const FlashOffFilledIconSpec = /* @__PURE__ */ withStatic(
  makeOffIcon('FlashOffFilled', FILLED),
  /* @__PURE__ */ carbonArt(FlashOffFilled32)
);

/** The bolt's centreline corners at on-hover `hOn`, and the outline art (for FlashToggle's outline ↔ filled). */
export { bolt as flashBolt, OUTLINE as FLASH_ART };
