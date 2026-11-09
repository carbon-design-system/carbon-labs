/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Microphone32 from '@carbon/icons/es/microphone/32.js';
import MicrophoneFilled32 from '@carbon/icons/es/microphone--filled/32.js';
import MicrophoneOff32 from '@carbon/icons/es/microphone--off/32.js';
import MicrophoneOffFilled32 from '@carbon/icons/es/microphone--off--filled/32.js';
import { carbonArt, toggleIcon, withStatic } from '../../engine';
import type { Pt } from '../../geometry';
import type { Seg } from '../../cut';
import { arcSeg, type OffStroke } from '../../off';
import {
  makeOffIcon,
  makeSlashToggle,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';

const CMicrophone = /* @__PURE__ */ carbonArt(Microphone32);
const CMicrophoneFilled = /* @__PURE__ */ carbonArt(MicrophoneFilled32);
const CMicrophoneOff = /* @__PURE__ */ carbonArt(MicrophoneOff32);
const CMicrophoneOffFilled = /* @__PURE__ */ carbonArt(MicrophoneOffFilled32);

/**
 * Microphone ⇄ Microphone off, on the frame engine (see utils/slashToggle).
 *
 * On hover (the reference animation): the capsule's top rises 1px and its bottom 2px,
 * the stand lifts 2px and its base widens 1px each side. Off hover (the
 * set-wide Off rule): the whole microphone shrinks to 90%, the
 * slash extends 1px at each end. On → off the microphone kicks 2px left.
 * Every part is a 2px centreline; filled, the capsule is solid. Rest
 * matches Carbon.
 */
const SLASH = {
  a: [29.2929, 2.7071] as Pt,
  b: [2.7071, 29.2929] as Pt,
  gapSide: 1 as const,
  gap: 2,
};
const L = (a: Pt, b: Pt): Seg => ({ k: 'L', a, b });

// Carbon cuts the capsule's left wall square where it meets x + y = 27 (as
// No image's walls) and the rest flush with the gap, so the left wall is its
// own stroke. Both land in one filled path, so their butt ends meet seamlessly.
const SQUARE = (32 - 27) / Math.SQRT2;
const capsuleSegs = (top: number, bottom: number): OffStroke[] => [
  { path: [L([12, bottom], [12, top])], square: SQUARE },
  [
    arcSeg([16, top], 4, 180, 360),
    L([20, top], [20, bottom]),
    arcSeg([16, bottom], 4, 0, 180),
  ],
];
const capsuleSolid = (top: number, bottom: number): Pt[] => {
  const pts: Pt[] = [];
  for (let a = 180; a <= 360; a += 6) {
    pts.push([
      16 + 5 * Math.cos((a * Math.PI) / 180),
      top + 5 * Math.sin((a * Math.PI) / 180),
    ]);
  }
  for (let a = 0; a <= 180; a += 6) {
    pts.push([
      16 + 5 * Math.cos((a * Math.PI) / 180),
      bottom + 5 * Math.sin((a * Math.PI) / 180),
    ]);
  }
  return pts;
};
const stand = (hOn: number, rise = 0): Seg[][] => {
  const y = 17 - 2 * hOn - rise;
  return [
    [
      L([8, 14 - 2 * hOn], [8, y]),
      arcSeg([16, y], 8, 180, 0),
      L([24, y], [24, 14 - 2 * hOn]),
    ],
    [L([16, 25 - 2 * hOn], [16, 29])],
    [L([11 - hOn, 29], [21 + hOn, 29])],
  ];
};

const OUTLINE: SlashToggleSpec = {
  statics: [CMicrophone, CMicrophoneOff],
  slash: SLASH,
  kick: [-2, 0],
  centre: [16, 16],
  base: (hOn) => ({
    strokes: [...capsuleSegs(...micCapsule(hOn)), ...stand(hOn)],
  }),
};
// Carbon cuts its filled drawings with a 3px gap (2px for outlines).
const FILLED: SlashToggleSpec = {
  ...OUTLINE,
  statics: [CMicrophoneFilled, CMicrophoneOffFilled],
  slash: { ...SLASH, gap: 3 },
  base: (hOn) => ({
    strokes: stand(hOn),
    solids: [capsuleSolid(...micCapsule(hOn))],
  }),
};

// Carbon's MicrophoneOffFilled isn't quite MicrophoneFilled cut by the
// slash: its dome's arc (r 5, ending on the gap's edge) centres at y 7.107,
// not 7, and its lower arcs (the capsule's bottom, the stand) at 16.982, not
// 17. The dome's 0.1-unit dip stands out at 16px, so
// as the slash draws in the dome eases down and the lower arcs up, and the
// off end matches Carbon.
const DOME_DROP = 0.107;
const ARC_RISE = 0.018;
const filledAt = (p: number): SlashToggleSpec => ({
  ...FILLED,
  base: (hOn) => {
    const [top, bottom] = micCapsule(hOn);
    return {
      strokes: stand(hOn, ARC_RISE * p),
      solids: [capsuleSolid(top + DOME_DROP * p, bottom - ARC_RISE * p)],
    };
  },
});

export const MicrophoneOffOutlineToggleSpec = /* @__PURE__ */ makeSlashToggle(
  'MicrophoneOffToggle',
  OUTLINE
);
export const MicrophoneOffFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('MicrophoneOffToggle(filled)', {
  states: ['on', 'off'],
  statics: FILLED.statics,
  geo: (fr) => slashShapes(filledAt(fr.p), fr),
  change: slashChange,
});
export const MicrophoneOffIconSpec = /* @__PURE__ */ withStatic(
  makeOffIcon('MicrophoneOff', OUTLINE),
  /* @__PURE__ */ carbonArt(MicrophoneOff32)
);

/** The capsule's [top, bottom] arc centres at on-hover `hOn`, as the art above uses them. */
export const micCapsule = (hOn: number): [number, number] => [
  7 - hOn,
  17 - 2 * hOn,
];
/** The outline art (for MicrophoneToggle's outline ↔ filled). */
export { OUTLINE as MIC_ART };
