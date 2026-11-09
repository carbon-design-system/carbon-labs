/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import View16 from '@carbon/icons/es/view/16.js';
import View32 from '@carbon/icons/es/view/32.js';
import ViewFilled32 from '@carbon/icons/es/view--filled/32.js';
import ViewOff16 from '@carbon/icons/es/view--off/16.js';
import ViewOff32 from '@carbon/icons/es/view--off/32.js';
import ViewOffFilled32 from '@carbon/icons/es/view--off--filled/32.js';
import { carbonArt, hoverIcon, toggleIcon } from '../../engine';
import type { Pt } from '../../geometry';
import type { Seg } from '../../cut';
import { arcSeg, strokeOutline } from '../../off';
import {
  makeSlashToggle,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';

const CView = /* @__PURE__ */ carbonArt(View16, View32);
const CViewFilled = /* @__PURE__ */ carbonArt(ViewFilled32);
const CViewOff = /* @__PURE__ */ carbonArt(ViewOff16, ViewOff32);
const CViewOffFilled = /* @__PURE__ */ carbonArt(ViewOffFilled32);

/**
 * View ⇄ View off, on the frame engine (see utils/slashToggle).
 *
 * On hover (the View reference): the eye opens 1px top and bottom and the iris grows
 * 0.5px. Off hover (the set-wide Off rule): the eye and iris shrink to 90%,
 * the slash extends 1px at each end. On → off the eye kicks 2px left. The
 * eye is its 2px centreline (two arcs meeting at the tips, which Carbon
 * rounds outside); filled, it's solid with the pupil's ring knocked out.
 * Rest matches Carbon.
 */
const SLASH = {
  a: [29.2929, 2.7071] as Pt,
  b: [2.7071, 29.2929] as Pt,
  gapSide: 1 as const,
  gap: 2,
};

/**
 * The eye's centreline: Carbon's inner contour (two cubics per half, tip
 * (3.07, 16) to top (16, 7)) offset 1px outward, so the 2px stroke lands on
 * both of Carbon's edges. Sampled once as a quarter, mirrored, and opened by
 * stretching it vertically: the top sits `open` above the centre (10 at rest).
 */
const QUARTER: Pt[] = /* @__PURE__ */ (() => {
  const [p0, c1, c2, p3]: Pt[] = [
    [3.07, 16],
    [5.1, 10.93],
    [10.7, 7],
    [16, 7],
  ];
  const at = (t: number, k: 0 | 1) =>
    (1 - t) ** 3 * p0[k] +
    3 * (1 - t) ** 2 * t * c1[k] +
    3 * (1 - t) * t * t * c2[k] +
    t ** 3 * p3[k];
  const d = (t: number, k: 0 | 1) =>
    3 * (1 - t) ** 2 * (c1[k] - p0[k]) +
    6 * (1 - t) * t * (c2[k] - c1[k]) +
    3 * t * t * (p3[k] - c2[k]);
  const n = 24;
  // The tip is a corner (the halves meet at an angle), so its offset is the
  // miter point on the axis, 1/sin(tangent angle) out from Carbon's tip.
  const tip: Pt = [p0[0] - Math.hypot(d(0, 0), d(0, 1)) / -d(0, 1), 16];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    if (i === 0) {
      return tip;
    }
    const [dx, dy] = [d(t, 0), d(t, 1)];
    const l = Math.hypot(dx, dy);
    // Outward (away from the eye's centre) is the tangent turned anticlockwise on screen.
    return [at(t, 0) + dy / l, at(t, 1) - dx / l] as Pt;
  });
})();
function eye(open: number, { bottom = open, tuck = 0 }: EyeArt = {}): Seg[] {
  const top = QUARTER.concat(
    QUARTER.slice(0, -1)
      .reverse()
      .map(([x, y]) => [32 - x, y] as Pt)
  );
  const loop = top.concat(
    top
      .map(([x, y]) => [x, 32 - y] as Pt)
      .reverse()
      .slice(1)
  );
  const pts = loop.map(([x, y]) => {
    const yy = 16 + ((y - 16) * (y < 16 ? open : bottom)) / 10;
    // The tuck lifts the lower left, from nothing at the bottom (x 16) to `tuck` at x 10,
    // and only past the slash (x + y > 30), so the upper-left piece keeps its line.
    const w =
      y > 16 && x < 16 ? ((16 - x) / 6) ** 2 * smooth((x + y - 28) / 4) : 0;
    return [x, yy - tuck * w] as Pt;
  });
  return pts.slice(1).map((b, i) => ({ k: 'L' as const, a: pts[i], b }));
}
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** Per-size tweaks: the bottom half's opening (`open` above), and the lower-left tuck. */
type EyeArt = { bottom?: number; tuck?: number };
// The closed eye is wound clockwise on screen, so its outer side is the right (−1).
const OUTER: -1 = -1;
const circle = (r: number): Pt[] =>
  Array.from(
    { length: 72 },
    (_, i) =>
      [
        16 + r * Math.cos((i * Math.PI) / 36),
        16 + r * Math.sin((i * Math.PI) / 36),
      ] as Pt
  );

/** The iris's centreline as an ellipse about (16, 16), in 72 steps. */
function irisRing(rx: number, ry: number): Seg[] {
  const pts = Array.from(
    { length: 73 },
    (_, i) =>
      [
        16 + rx * Math.cos((i * Math.PI) / 36),
        16 + ry * Math.sin((i * Math.PI) / 36),
      ] as Pt
  );
  pts[72] = pts[0];
  return pts.slice(1).map((b, i) => ({ k: 'L' as const, a: pts[i], b }));
}

/**
 * The outline art. Carbon's 16px eyes are their own drawings: View's
 * bottom sits 0.1 higher (LIFT_16); View off's lower left is tucked up
 * towards the slash by up to 0.25 (TUCK_16) and its iris is 0.1 shorter
 * than wide (IRIS_16). At 16px, `off` (the slash's progress) eases View's
 * drawing into View off's, so each end equals Carbon's icon. There are no
 * 16px filled drawings, so FILLED keeps the 32px art.
 */
function outlineArt(size?: number, off = 0): SlashToggleSpec {
  const k = size === 16 ? 1 : 0;
  const lift = LIFT_16 * k * (1 - off);
  // View off's iris is a touch shorter than wide at 16px: squashed vertically.
  const squash = IRIS_16 * k * off;
  return {
    statics: [CView, CViewOff],
    slash: SLASH,
    kick: [-2, 0],
    centre: [16, 16],
    base: (hOn) => ({
      strokes: [
        {
          path: eye(10 + hOn, {
            bottom: 10 + hOn - lift,
            tuck: TUCK_16 * k * off,
          }),
          round: OUTER,
        },
        squash
          ? irisRing(5 + 0.5 * hOn, 5 + 0.5 * hOn - squash)
          : [
              arcSeg([16, 16], 5 + 0.5 * hOn, 0, 180),
              arcSeg([16, 16], 5 + 0.5 * hOn, 180, 360),
            ],
      ],
    }),
  };
}
const [LIFT_16, TUCK_16, IRIS_16] = [0.1, 0.25, 0.1];
const OUTLINE = outlineArt();
// Carbon cuts its filled drawings with a 3px gap (2px for outlines).
const FILLED: SlashToggleSpec = {
  ...OUTLINE,
  statics: [CViewFilled, CViewOffFilled],
  slash: { ...SLASH, gap: 3 },
  solidRule: 'evenodd',
  base: (hOn) => {
    const o = strokeOutline(eye(10 + hOn), 2, OUTER).loops!;
    // The solid eye, its pupil's ring knocked out, and the pupil.
    return {
      strokes: [],
      solids: [o[1], circle(6.5 + 0.5 * hOn), circle(4 + 0.5 * hOn)],
    };
  },
};

export const ViewOffOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('ViewOffToggle', {
  states: ['on', 'off'],
  statics: OUTLINE.statics,
  geo: (fr, size) =>
    slashShapes(size === 16 ? outlineArt(16, fr.p) : OUTLINE, fr),
  change: slashChange,
});
export const ViewOffFilledToggleSpec = /* @__PURE__ */ makeSlashToggle(
  'ViewOffToggle(filled)',
  FILLED
);
export const ViewOffIconSpec = /* @__PURE__ */ hoverIcon('ViewOff', {
  geo: ({ h }, size) => slashShapes(outlineArt(size, 1), { h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(ViewOff16, ViewOff32),
});

/** The eye's centreline, its outer side, and the outline art (for ViewToggle's outline ↔ filled). */
export {
  eye as viewEye,
  OUTER as VIEW_EYE_OUTER,
  OUTLINE as VIEW_ART,
  LIFT_16 as VIEW_LIFT_16,
};
