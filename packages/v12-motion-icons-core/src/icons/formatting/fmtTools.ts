/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Copy32 from '@carbon/icons/es/copy/32.js';
import Crop32 from '@carbon/icons/es/crop/32.js';
import Cut32 from '@carbon/icons/es/cut/32.js';
import MagicWand32 from '@carbon/icons/es/magic-wand/32.js';
import MagicWandFilled32 from '@carbon/icons/es/magic-wand--filled/32.js';
import Paste32 from '@carbon/icons/es/paste/32.js';
import {
  defineAction,
  hoverIcon,
  type Shapes,
  carbonArt,
  withStatic,
} from '../../engine';
import { framePath, polyPath, rectPath, type Pt } from '../../geometry';
import { cubicBezier, ENTRANCE, EXIT } from '../../ease';
import { EVENODD, f, lerp } from '../../paint';
import { phase } from '../../actionGeo';
import { motionTokens, toEasing } from '../../tokens';

/**
 * Formatting tools on the frame engine: Copy, Crop, Cut, Magic wand (and
 * its filled twin) and Paste, with the motion of their reference animations. Every moving part is a
 * rigid translate or rotate, or a 2px bar lengthening along its own axis,
 * so line weight holds. Rest matches Carbon.
 */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// ── Copy ─────────────────────────────────────────────────────────────────────

// Copy (the reference animation, on the standard hover): the pages draw together. The back
// page's corner moves 1px down and right while both its arms extend 6px
// (ending 4px short of the front page's far edge), and the front page
// moves 1px up and left.
//
// Drawn from Carbon's numbers at every frame: the back page as its corner
// (arms 16 long at rest), the front page as its frame, both rebuilt at 2px.
const f2 = (n: number) => +n.toFixed(3);
const copyShapes = (h: number): Shapes => copyActionPose(h, 0);
/**
 * Copy's action, from the reference animation (32×32 at 100fps):
 * the back page's corner slides 6px down-right onto the front page's corner
 * (8, 8), its arms 1px longer (17), in 70ms, and back by 200ms; the front
 * page shrinks toward its own top-left corner (which holds at 8, 8) to 16px,
 * in 110ms, and grows back by 240ms. The comp's eases are Carbon's expressive exit
 * going in (0.2 0 0.999 0.9, accelerating) and expressive entrance coming
 * out (0.001 0 0.38 0.9); here they are the productive exit and entrance
 * (icons use the productive eases). Both
 * pages are rebuilt at 2px every frame, as the comp's paths are.
 */
const C_IN = 0.07 / 0.24;
const C_BACK = 0.2 / 0.24;
const F_IN = 0.11 / 0.24;
function copyActionPose(h: number, a: number): Shapes {
  const pb =
    a < C_IN ? EXIT(phase(a, 0, C_IN)) : 1 - ENTRANCE(phase(a, C_IN, C_BACK));
  const pf =
    a < F_IN ? EXIT(phase(a, 0, F_IN)) : 1 - ENTRANCE(phase(a, F_IN, 1));
  const x = 2 + h + 6 * pb; // the back page's corner
  const L = 16 + 6 * h + pb; // its arms
  const [x0, x1] = [8 - h, 30 - h - 6 * pf]; // the front page: its top-left holds, its far sides come in
  const [p, q, r] = [f2(x), f2(x + 2), f2(x + L)];
  return {
    back: {
      d: `M${p} ${q}A2 2 0 0 1 ${q} ${p}L${r} ${p}L${r} ${q}L${q} ${q}L${q} ${r}L${p} ${r}Z`,
    },
    front: { d: framePath(x0, x0, x1, x1) },
  };
}
export const CopySpec = /* @__PURE__ */ hoverIcon('Copy', {
  geo: ({ h }) => copyShapes(h),
  static: /* @__PURE__ */ carbonArt(Copy32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Copied: the back page slides onto the front page as the front page shrinks, then both return to rest. With a hand-off (`then`), the status mark enters as the pages settle.',
    duration: 0.24,
    geo: ({ h, a }) =>
      a <= 0 || a >= 1 ? copyShapes(h) : copyActionPose(h, a),
  }),
});

// ── Crop ─────────────────────────────────────────────────────────────────────

// Crop (the reference animation, on the standard hover): the two brackets close in on the crop,
// each moving 2px diagonally toward the other. The inner bracket's arms
// draw back 2px at their ends so the 3px gaps to the outer bracket hold,
// and the two guide tails (the outer bracket's arms run on past the
// corners) reach 2px further out, staying flush with the bars they cross.
export const CropSpec = /* @__PURE__ */ hoverIcon('Crop', {
  geo: ({ h }) => {
    const m = 2 * h;
    return {
      outer: {
        d: `M${f(9 + m)} ${f(23 - m)}L${f(9 + m)} ${f(2 - m)}L${f(7 + m)} ${f(2 - m)}L${f(7 + m)} ${f(23 - m)}A2 2 0 0 0 ${f(9 + m)} ${f(25 - m)}L${f(30 + m)} ${f(25 - m)}L${f(30 + m)} ${f(23 - m)}Z`,
      },
      inner: {
        d: `M${f(25 - m)} ${f(20 - m)}L${f(23 - m)} ${f(20 - m)}L${f(23 - m)} ${f(9 + m)}L${f(12 + m)} ${f(9 + m)}L${f(12 + m)} ${f(7 + m)}L${f(23 - m)} ${f(7 + m)}A2 2 0 0 1 ${f(25 - m)} ${f(9 + m)}Z`,
      },
      tailLeft: { d: rectPath(2 - m, 7 + m, 9 + m, 9 + m) },
      tailBottom: { d: rectPath(23 - m, 23 - m, 25 - m, 30 + m) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Crop32),
});

// ── Cut ──────────────────────────────────────────────────────────────────────

// Cut (the reference animation, on the standard hover): the blades snip. Each blade (handle ring
// and blade, one rigid outline from the reference animation) turns 27° about the pivot
// at (18, 16), in opposite directions, so the blades swing together.
// The lower blade's outline, placed in the icon; the upper blade is its mirror in y = 16.
const BLADE: [number, number, number, number, number, number][] = [
  // [c1x, c1y, c2x, c2y, x, y] for each cubic; lines repeat the end point.
  [12.851, 7.829, 12.428, 8.757, 11.766, 9.504],
  [11.104, 10.251, 10.234, 10.782, 9.267, 11.03],
  [8.846, 11.141, 8.412, 11.198, 7.977, 11.2],
  [7.095, 11.203, 6.227, 10.972, 5.463, 10.532],
  [4.699, 10.092, 4.065, 9.457, 3.625, 8.692],
  [3.185, 7.927, 2.955, 7.061, 2.959, 6.179],
  [2.963, 5.297, 3.201, 4.431, 3.647, 3.67],
  [4.194, 2.729, 5.032, 1.991, 6.036, 1.57],
];
function blade(mirror: boolean): string {
  const P = ([x, y]: Pt) => `${f(x + 16)} ${f(mirror ? 14.2 - y : y + 17.8)}`;
  let d = `M${P([12.981, 6.839])}`;
  for (const [a, b, c, e, x, y] of BLADE) {
    d += `C${P([a, b])} ${P([c, e])} ${P([x, y])}`;
  }
  d += `L${P([-13.023, -9.46])}L${P([-12.023, -11.2])}L${P([10.477, 1.83])}`;
  d += `C${P([11.347, 2.32])} ${P([12.05, 3.058])} ${P([12.496, 3.951])}C${P([12.942, 4.844])} ${P([13.111, 5.85])} ${P([12.981, 6.839])}Z`;
  // The handle's hole (evenodd), radius 3.
  const [top, bottom] = [P([8, 3.2]), P([8, 9.2])];
  return `${d}M${top}A3 3 0 1 0 ${bottom}A3 3 0 1 0 ${top}Z`;
}
const BLADE_LOWER = /* @__PURE__ */ blade(false);
const BLADE_UPPER = /* @__PURE__ */ blade(true);
export const CutSpec = /* @__PURE__ */ hoverIcon('Cut', {
  geo: ({ h }) => ({
    upper: {
      d: BLADE_UPPER,
      transform: `rotate(${f(27 * h)} 18 16)`,
      ...EVENODD,
    },
    lower: {
      d: BLADE_LOWER,
      transform: `rotate(${f(-27 * h)} 18 16)`,
      ...EVENODD,
    },
  }),
  static: /* @__PURE__ */ carbonArt(Cut32),
});

// ── Magic wand ───────────────────────────────────────────────────────────────

// Magic wand: the wand tips clockwise about the end of
// its handle, and the three sparkles pop in turn (the left one, then 100ms
// later the top right, then the top left: the reference's stagger): each moves out
// over 200ms, swells to 175% and back on the reference's (0.4, 0.14, 0.3, 1) curve
// (100ms out, 240ms back) while it turns a quarter (0.2, 0, 0.38, 0.9), 340ms
// in all. The sparkles are solid diamonds, so they're scaled as geometry.
// Leaving, the sparkles snap back to rest and the wand and
// positions return.
//
// Where it departs from the reference animation:
//  - the wand tips in WAND_TIP_T, moderate-01 (160ms, the comp's 200ms),
//    while the sparkles keep their timing;
//  - the sparkles land 1px further out towards the box's edges: the left
//    one 3px left and 2px down, the top left 3px left and up, the top
//    right 3px up (the comp's 2px each). The 36 box has
//    1.5px of room past the comp's landing places (the tightest moment is late
//    in each sparkle's swell, about 175ms after it starts, not its landing);
//    they take 1px of it, so a swelling sparkle's corner stays 0.49px inside
//    the box and a landed one 1px;
//  - the wand tips 5° (the comp's 10°), so at its peak it sits more
//    centrally between them;
//  - as it tips, the wand
//    also moves 2px left and 1px up (WAND_SHIFT), on the tip's own 160ms.
//  - the top right one
//    lands 2px across, so landed, centre to
//    centre, it is 17px from the top left one, as the left one is.
//    At its peak the wand's outline is 7.3px from the left sparkle, 6.0 from
//    the top right and 6.1 from the top left, and never nearer than 1.9 to
//    any.
//
// The hover runs 540ms on the entrance curve; geo reads the time back out of
// h, so the sequence plays at its reference timing on the way in and the wand and
// sparkles go home quickly on the way out.
const WAND_T = 540;
/** The wand's own tip: its angle at the peak (degrees, clockwise) and how long it takes (ms), its shift with it. */
const WAND_TIP = 5;
const WAND_TIP_T = motionTokens.duration.moderate01;
/** How far the wand moves (x, y) by its peak, as it tips. */
const WAND_SHIFT: Pt = [-2, -1];
/** Each sparkle: its rest centre (Carbon's), where it lands, and when it starts (ms). */
const SPARKLES: readonly { c: Pt; to: Pt; delay: number }[] = [
  { c: [4, 16], to: [1, 18], delay: 0 },
  { c: [16, 4], to: [18, 1], delay: 100 },
  { c: [4, 4], to: [1, 1], delay: 200 },
];
const SWELL = /* @__PURE__ */ cubicBezier(0.4, 0.14, 0.3, 1);
const TURN = /* @__PURE__ */ cubicBezier(0.2, 0, 0.38, 0.9);
const PEAK = 10 / 34;
/** The time (ms) at hover progress h: the inverse of the entrance curve the hover runs on. */
function wandTime(h: number): number {
  if (h <= 0) {
    return 0;
  }
  if (h >= 1) {
    return WAND_T;
  }
  let [lo, hi] = [0, 1];
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ENTRANCE(mid) < h) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return ((lo + hi) / 2) * WAND_T;
}
/** A diamond (Carbon's 2.83px square at 45°) of half-diagonal 2·s, turned `deg` past rest. */
function diamond([cx, cy]: Pt, s: number, deg: number): string {
  const pts: Pt[] = [0, 1, 2, 3].map((k) => {
    const a = ((deg + 90 * k) * Math.PI) / 180;
    return [cx + 2 * s * Math.cos(a), cy + 2 * s * Math.sin(a)];
  });
  return polyPath(pts, true);
}
const WAND_D =
  'M29.4141,24,12,6.5859a2.0476,2.0476,0,0,0-2.8281,0l-2.586,2.586a2.0021,2.0021,0,0,0,0,2.8281L23.999,29.4141a2.0024,2.0024,0,0,0,2.8281,0l2.587-2.5865a1.9993,1.9993,0,0,0,0-2.8281Z' +
  'M8,10.5859,10.5859,8l5,5-2.5866,2.5869-5-5Z';
const WAND_INLAY = 'M25.4131,28l-11-10.999L17,14.4141l11,11Z';
const magicWand = (name: string, d: string) =>
  hoverIcon(name, {
    hover: {
      duration: WAND_T / 1000,
      ease: /* @__PURE__ */ toEasing(motionTokens.easing.entrance),
    },
    geo: ({ h, entering }) => {
      const t = wandTime(h);
      const k = ENTRANCE(clamp01(t / WAND_TIP_T));
      const shapes: Shapes = {
        wand: {
          d,
          transform: `translate(${f(WAND_SHIFT[0] * k)} ${f(WAND_SHIFT[1] * k)}) rotate(${f(WAND_TIP * k)} 22 22)`,
        },
      };
      SPARKLES.forEach(({ c, to, delay }, i) => {
        const move = ENTRANCE(clamp01((t - delay) / 200));
        const u = entering === 0 ? 0 : clamp01((t - delay) / 340);
        const s =
          u < PEAK
            ? 1 + 0.75 * SWELL(u / PEAK)
            : 1.75 - 0.75 * SWELL((u - PEAK) / (1 - PEAK));
        shapes[`sparkle${i}`] = {
          d: diamond(
            [lerp(c[0], to[0], move), lerp(c[1], to[1], move)],
            s,
            90 * TURN(u)
          ),
        };
      });
      return shapes;
    },
  });
export const MagicWandSpec = /* @__PURE__ */ withStatic(
  magicWand('MagicWand', WAND_D + WAND_INLAY),
  /* @__PURE__ */ carbonArt(MagicWand32)
);
/** Magic wand filled: the same wand with a solid handle, and the same motion. */
export const MagicWandFilledSpec = /* @__PURE__ */ withStatic(
  magicWand('MagicWandFilled', WAND_D),
  /* @__PURE__ */ carbonArt(MagicWandFilled32)
);

// ── Paste ────────────────────────────────────────────────────────────────────

// Paste (the reference animation, on the standard hover): the arrow pushes into the clipboard.
// Its head moves 2px left (the set-wide reach for an arrow in a glyph; the
// reference animation moved it 4px) and its shaft lengthens behind it, the corner and the
// tail down to the bottom holding still. The clipboard doesn't move.
const PASTE_BOARD =
  'M23.71,9.29l-7-7A1,1,0,0,0,16,2H6A2,2,0,0,0,4,4V28a2,2,0,0,0,2,2h8V28H6V4h8v6a2,2,0,0,0,2,2h6v2h2V10A1,1,0,0,0,23.71,9.29ZM16,4.41,21.59,10H16Z';
const PASTE_HEAD: Pt[] = [
  [20.41, 24.59],
  [19, 26],
  [14, 21],
  [19, 16],
  [20.41, 17.41],
  [16.82, 21],
];
export const PasteSpec = /* @__PURE__ */ hoverIcon('Paste', {
  geo: ({ h }) => {
    const m = 2 * h;
    return {
      board: { d: PASTE_BOARD },
      shaft: {
        d: `M${f(16 - m)} 20L26 20A2 2 0 0 1 28 22L28 30L26 30L26 22L${f(16 - m)} 22Z`,
      },
      head: {
        d: polyPath(
          PASTE_HEAD.map(([x, y]): Pt => [x - m, y]),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Paste32),
});
