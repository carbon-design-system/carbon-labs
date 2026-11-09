/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ZoomIn16 from '@carbon/icons/es/zoom--in/16.js';
import ZoomIn32 from '@carbon/icons/es/zoom--in/32.js';
import ZoomOut16 from '@carbon/icons/es/zoom--out/16.js';
import ZoomOut32 from '@carbon/icons/es/zoom--out/32.js';
import ZoomFit32 from '@carbon/icons/es/zoom--fit/32.js';
import ZoomArea32 from '@carbon/icons/es/zoom--area/32.js';
import ZoomInArea32 from '@carbon/icons/es/zoom--in-area/32.js';
import ZoomOutArea32 from '@carbon/icons/es/zoom--out-area/32.js';
import SelectWindow32 from '@carbon/icons/es/select--window/32.js';
import FitToScreen32 from '@carbon/icons/es/fit-to-screen/32.js';
import Switcher32 from '@carbon/icons/es/switcher/32.js';
import Draggable32 from '@carbon/icons/es/draggable/32.js';
import OverflowMenuHorizontal32 from '@carbon/icons/es/overflow-menu--horizontal/32.js';
import OverflowMenuVertical32 from '@carbon/icons/es/overflow-menu--vertical/32.js';
import Menu16 from '@carbon/icons/es/menu/16.js';
import Menu20 from '@carbon/icons/es/menu/20.js';
import Menu24 from '@carbon/icons/es/menu/24.js';
import Menu32 from '@carbon/icons/es/menu/32.js';
import Home32 from '@carbon/icons/es/home/32.js';
import { hoverIcon, type Shapes, carbonArt } from '../../engine';
import {
  framePath,
  mapPath,
  polyPath,
  rectPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { together } from '../../ease';
import { f } from '../../paint';

/**
 * Zoom, fit, select-window and the small navigation glyphs (Switcher, Menu,
 * Home, Draggable, Overflow menus) on the frame engine: the same motion as
 * their legacy components, with the shared hover (160ms
 * entrance in, 120ms exit out) and cleanup on unmount.
 *
 * Constant line weight: lenses are rings (Carbon's annulus form) whose
 * radius changes at a fixed weight; handles are 2px bands along their
 * centreline; bars only lengthen along their own axis; everything else
 * moves rigidly. Rest matches Carbon.
 */

const at = (dx: number, dy: number) => `translate(${f(dx)} ${f(dy)})`;

/** A 2px band from a to b (square ends), Carbon's magnifier handle. */
function band(a: Pt, b: Pt): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / l, dx / l];
  return polyPath(
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    true
  );
}

/**
 * A magnifier drawn on the 45° diagonal: lens centre (c, c), centreline
 * radius r at weight w; the handle's centreline runs from (h0, h0) to
 * (h1, h1).
 */
type Lens = { c: number; r: number; w: number; h0: number; h1: number };
const magnifier = ({ c, r, w, h0, h1 }: Lens): Shapes => ({
  lens: { d: ringPath([c, c], r, w) },
  handle: { d: band([h0, h0], [h1, h1]) },
});

// ── Zoom in / out / fit: the large lens (Carbon's: centre 13, r 10, 2px) ──────────────

const BIG: Lens = { c: 13, r: 10, w: 2, h0: 19.74, h1: 28.293 };

/** Zoom in: the plus reaches out as the lens tightens and the handle draws in. */
export const ZoomInSpec = /* @__PURE__ */ hoverIcon('ZoomIn', {
  geo: ({ h }) => ({
    ...magnifier({
      ...BIG,
      r: BIG.r - h,
      h0: BIG.h0 - 0.605 * h,
      h1: BIG.h1 - 1.21 * h,
    }),
    armH: { d: rectPath(8 - h, 12, 18 + h, 14) },
    armV: { d: rectPath(12, 8 - h, 14, 18 + h) },
  }),
  static: /* @__PURE__ */ carbonArt(ZoomIn16, ZoomIn32),
});

/** Zoom out / fit share the opening lens: radius +1px, handle out 1px (tip 1.67px). */
const opening = (h: number) =>
  magnifier({ ...BIG, r: BIG.r + h, h0: BIG.h0 + h, h1: BIG.h1 + 1.672 * h });

/** Zoom out: the minus shortens as the lens opens. */
export const ZoomOutSpec = /* @__PURE__ */ hoverIcon('ZoomOut', {
  geo: ({ h }) => ({
    ...opening(h),
    minus: { d: rectPath(8 + h, 12, 18 - h, 14) },
  }),
  static: /* @__PURE__ */ carbonArt(ZoomOut16, ZoomOut32),
});

/** Zoom fit: the corner brackets step out as the lens opens. */
export const ZoomFitSpec = /* @__PURE__ */ hoverIcon('ZoomFit', {
  geo: ({ h }) => ({
    ...opening(h),
    tl: {
      d: 'M10,12H8V10a2.0023,2.0023,0,0,1,2-2h2v2H10Z',
      transform: at(-h, -h),
    },
    tr: {
      d: 'M18,12H16V10H14V8h2a2.0023,2.0023,0,0,1,2,2Z',
      transform: at(h, -h),
    },
    bl: {
      d: 'M12,18H10a2.0023,2.0023,0,0,1-2-2V14h2v2h2Z',
      transform: at(-h, h),
    },
    br: {
      d: 'M16,18H14V16h2V14h2v2A2.0023,2.0023,0,0,1,16,18Z',
      transform: at(h, h),
    },
  }),
  static: /* @__PURE__ */ carbonArt(ZoomFit32),
});

// ── Area / select-window: five selection brackets around a smaller figure ────

/**
 * The selection brackets: the three corners step 1px out from the centre
 * (14, 14) and the two edge ticks step 1px out and lengthen 1px at each end.
 */
const brackets = (h: number): Shapes => ({
  bl: { d: 'M8,26H4a2.0021,2.0021,0,0,1-2-2V20H4v4H8Z', transform: at(-h, h) },
  ml: { d: rectPath(2 - h, 12 - h, 4 - h, 16 + h) },
  tr: { d: 'M26,8H24V4H20V2h4a2.0021,2.0021,0,0,1,2,2Z', transform: at(h, -h) },
  tm: { d: rectPath(12 - h, 2 - h, 16 + h, 4 - h) },
  tl: { d: 'M4,8H2V4A2.0021,2.0021,0,0,1,4,2H8V4H4Z', transform: at(-h, -h) },
});

/**
 * The small lens: the lens moves 2px up-left and opens 1px in radius; the
 * handle moves 1.5px up-left with it (it stays on the lens, length unchanged).
 */
const SMALL: Lens = { c: 20, r: 7.014, w: 2.028, h0: 25.6045, h1: 30.293 };
const smallLens = (h: number) =>
  magnifier({
    c: SMALL.c - 2 * h,
    r: SMALL.r + h,
    w: SMALL.w,
    h0: SMALL.h0 - 1.5 * h,
    h1: SMALL.h1 - 1.5 * h,
  });

/** Zoom area: brackets step out; the lens moves up-left and opens. */
export const ZoomAreaSpec = /* @__PURE__ */ hoverIcon('ZoomArea', {
  geo: ({ h }) => ({ ...brackets(h), ...smallLens(h) }),
  static: /* @__PURE__ */ carbonArt(ZoomArea32),
});

/** Zoom in area: as Zoom area, with the plus's arms reaching further. */
export const ZoomInAreaSpec = /* @__PURE__ */ hoverIcon('ZoomInArea', {
  geo: ({ h }) => {
    const [c, l] = [20 - 2 * h, 4 + h];
    return {
      ...brackets(h),
      ...smallLens(h),
      armH: { d: rectPath(c - l, c - 1, c + l, c + 1) },
      armV: { d: rectPath(c - 1, c - l, c + 1, c + l) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ZoomInArea32),
});

/** Zoom out area: as Zoom area, with the minus reaching further. */
export const ZoomOutAreaSpec = /* @__PURE__ */ hoverIcon('ZoomOutArea', {
  geo: ({ h }) => {
    const [c, l] = [20 - 2 * h, 4 + h];
    return {
      ...brackets(h),
      ...smallLens(h),
      minus: { d: rectPath(c - l, c - 1, c + l, c + 1) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ZoomOutArea32),
});

/** Select window: the brackets step out and the cursor moves up and to the left. */
export const SelectWindowSpec = /* @__PURE__ */ hoverIcon('SelectWindow', {
  geo: ({ h }) => ({
    ...brackets(h),
    cursor: {
      d: 'M27,32a.9967.9967,0,0,1-.707-.293l-6.1377-6.1377L16.832,30.5547a1,1,0,0,1-1.79-.2676l-6-20A1,1,0,0,1,10.2871,9.042l20,6a1,1,0,0,1,.2676,1.79l-4.9854,3.3233L31.707,26.293a.9994.9994,0,0,1,0,1.414l-4,4A.9967.9967,0,0,1,27,32Zm0-2.4141L29.5859,27,22.431,19.845l5.2458-3.4978L11.4917,11.4917l4.8555,16.1851L19.845,22.431Z',
      transform: at(-2 * h, -2 * h),
    },
  }),
  static: /* @__PURE__ */ carbonArt(SelectWindow32),
});

// ── Fit to screen ────────────────────────────────────────────────────────────

/** Fit to screen: the frame grows and the two brackets step out. */
export const FitToScreenSpec = /* @__PURE__ */ hoverIcon('FitToScreen', {
  geo: ({ h }) => ({
    frame: { d: framePath(4 - 2 * h, 4 - 2 * h, 28 + 2 * h, 28 + 2 * h) },
    tr: {
      d: 'M22 16 24 16 24 8 16 8 16 10 22 10 22 16z',
      transform: at(2 * h, -2 * h),
    },
    bl: {
      d: 'M8 24 16 24 16 22 10 22 10 16 8 16 8 24z',
      transform: at(-2 * h, 2 * h),
    },
  }),
  static: /* @__PURE__ */ carbonArt(FitToScreen32),
});

// ── Grids and dots ───────────────────────────────────────────────────────────

/** Switcher: the nine tiles draw in toward the center tile, keeping their size. */
export const SwitcherSpec = /* @__PURE__ */ hoverIcon('Switcher', {
  geo: ({ h }) => {
    const s: Shapes = {};
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const [x, y] = [
          4 + 10 * col - 2 * (col - 1) * h,
          4 + 10 * row - 2 * (row - 1) * h,
        ];
        s[`t${row}${col}`] = { d: rectPath(x, y, x + 4, y + 4) };
      }
    }
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Switcher32),
});

/** Draggable: the six dots draw in toward the center. */
export const DraggableSpec = /* @__PURE__ */ hoverIcon('Draggable', {
  geo: ({ h }) => {
    const s: Shapes = {};
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const [x, y] = [
          10 + 8 * col + (col ? -1 : 1) * h,
          6 + 8 * row - 2 * (row - 1) * h,
        ];
        s[`d${row}${col}`] = { d: rectPath(x, y, x + 4, y + 4) };
      }
    }
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Draggable32),
});

/** Overflow menu (horizontal): the outer dots spread out from the center dot. */
export const OverflowMenuHorizontalSpec = /* @__PURE__ */ hoverIcon(
  'OverflowMenuHorizontal',
  {
    geo: ({ h }) => ({
      a: { tag: 'circle', cx: f(8 - 2 * h), cy: 16, r: 2 },
      b: { tag: 'circle', cx: 16, cy: 16, r: 2 },
      c: { tag: 'circle', cx: f(24 + 2 * h), cy: 16, r: 2 },
    }),
    static: /* @__PURE__ */ carbonArt(OverflowMenuHorizontal32),
  }
);

/** Overflow menu (vertical): the outer dots spread out from the center dot. */
export const OverflowMenuVerticalSpec = /* @__PURE__ */ hoverIcon(
  'OverflowMenuVertical',
  {
    geo: ({ h }) => ({
      a: { tag: 'circle', cx: 16, cy: f(8 - 2 * h), r: 2 },
      b: { tag: 'circle', cx: 16, cy: 16, r: 2 },
      c: { tag: 'circle', cx: 16, cy: f(24 + 2 * h), r: 2 },
    }),
    static: /* @__PURE__ */ carbonArt(OverflowMenuVertical32),
  }
);

// ── Menu ─────────────────────────────────────────────────────────────────────

/**
 * Menu: each bar reaches 1.5px further at each end (its height never
 * changes), all together (no stagger). Carbon's 20px drawing has its own
 * longer, thinner bars (in 32 units: x 3.2–28.8, 1.92 tall).
 */
export const bars = /* @__PURE__ */ together();
/** Menu's four bars: their ends (x0–x1), their tops (ys) and their height (t), in the 32 frame. */
export type Bars = { x0: number; x1: number; ys: readonly number[]; t: number };
const BARS_32: Bars = { x0: 4, x1: 28, ys: [6, 12, 18, 24], t: 2 };
const BARS_20: Bars = {
  x0: 3.2,
  x1: 28.8,
  ys: [6.4, 12.16, 17.92, 23.68],
  t: 1.92,
};
/** Menu's bars at a size (20 has its own drawing; 16 and 24 are the 32 drawing scaled). */
export const menuBars = (size?: number): Bars =>
  size === 20 ? BARS_20 : BARS_32;
/** How much further each bar reaches at each end on hover. */
export const MENU_REACH = 1.5;
export const MenuSpec = /* @__PURE__ */ hoverIcon('Menu', {
  hover: bars.hover,
  geo: ({ h }, size) => {
    const b = menuBars(size);
    const s: Shapes = {};
    b.ys.forEach((y, i) => {
      const k = MENU_REACH * bars.at(h, i);
      s[`b${i}`] = { d: rectPath(b.x0 - k, y, b.x1 + k, y + b.t) };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Menu16, Menu20, Menu24, Menu32),
});

// ── Home ─────────────────────────────────────────────────────────────────────

/** Carbon's Home (one drawing at every size), absolute: the outline, the doorway and the space inside. */
const HOME =
  'M16.6123,2.2138A1.01,1.01,0,0,0,15.3696,2.2138L1,13.4194L2.2427,14.9911L4,13.6209V26A2.0041,2.0041,0,0,0,6,28H26A2.0037,2.0037,0,0,0,28,26V13.63L29.7573,15L31,13.4282Z' +
  'M18,26H14V18H18Z' +
  'M20,26V18A2.0023,2.0023,0,0,0,18,16H14A2.002,2.002,0,0,0,12,18V26H6V12.0615L16,4.2715L26,12.072V26Z';
/** How far each wall steps out, how far each doorpost steps out, and how far the roof (and lintel) rises, at full hover. */
export const HOME_WALL = 2;
export const HOME_DOOR = 1;
export const HOME_RISE = 4;
/** The roof's pitch (rise over run): a wall's top rises less than the ridge, as the roof meets it further out. */
const PITCH = 0.78;
const EPS = 1e-6;

/**
 * Home's drawing at hover h, its door frame stepped k px further out all
 * round (HomeFilled's wider doorway). Each point moves with its part: the
 * door frame (its posts out, its lintel up), a wall with its eave and its
 * base corner (out, the wall's top up along the roof), or the ridge (up).
 * The base stays where it is.
 */
export function homePath(h: number, k = 0): string {
  const [wall, door, rise] = [HOME_WALL * h, HOME_DOOR * h, HOME_RISE * h];
  return mapPath(HOME, ([x, y]) => {
    const side = x < 16 ? -1 : 1;
    const onBase = y > 26 - EPS;
    if (x > 12 - EPS && x < 20 + EPS && y > 16 - EPS && y < 26 + EPS) {
      return [x + side * (door + k), onBase ? y : y - rise - k];
    }
    if (x < 8 || x > 24) {
      return [x + side * wall, onBase ? y : y - rise + PITCH * wall];
    }
    return [x, y - rise];
  });
}
// The house grows 4px wider and 4px taller on its base (at 32 it reaches 1px
// past each side of the frame and 2px above it); the doorway grows from 4 × 8
// to 6 × 12 with it, its posts stepping out half as far as the walls. Whole
// pixels at 32 (the doorposts land on half pixels at 16). Every part moves rigidly, so the line weight holds.
/** Home: the house grows on its base, and its doorway opens wider and taller with it. */
export const HomeSpec = /* @__PURE__ */ hoverIcon('Home', {
  geo: ({ h }) => ({ house: { d: homePath(h) } }),
  static: /* @__PURE__ */ carbonArt(Home32),
});

/**
 * The same geometry as numbers, for HomeFilled (toggle/homeToggle.ts): the
 * inner corners of the walls and roof, and the doorway (x 14–18 from under
 * its lintel to the top of the base), at hover h.
 */
export const homeInside = (h: number): Pt[] => {
  const [wall, rise] = [HOME_WALL * h, HOME_RISE * h];
  const top = rise - PITCH * wall;
  return [
    [6 - wall, 26],
    [6 - wall, 12.0615 - top],
    [16, 4.2715 - rise],
    [26 + wall, 12.072 - top],
    [26 + wall, 26],
  ];
};
export const homeDoorway = (h: number) => ({
  x0: 14 - HOME_DOOR * h,
  x1: 18 + HOME_DOOR * h,
  top: 18 - HOME_RISE * h,
  bottom: 26,
});
