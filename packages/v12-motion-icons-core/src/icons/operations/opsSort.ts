/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ArrowsHorizontal32 from '@carbon/icons/es/arrows--horizontal/32.js';
import ArrowsVertical32 from '@carbon/icons/es/arrows--vertical/32.js';
import PanHorizontal32 from '@carbon/icons/es/pan--horizontal/32.js';
import PanVertical32 from '@carbon/icons/es/pan--vertical/32.js';
import CaretSort32 from '@carbon/icons/es/caret--sort/32.js';
import CaretSortDown32 from '@carbon/icons/es/caret--sort--down/32.js';
import CaretSortUp32 from '@carbon/icons/es/caret--sort--up/32.js';
import ChevronSort16 from '@carbon/icons/es/chevron--sort/16.js';
import ChevronSort32 from '@carbon/icons/es/chevron--sort/32.js';
import ChevronMini16 from '@carbon/icons/es/chevron--mini/16.js';
import ChevronMini32 from '@carbon/icons/es/chevron--mini/32.js';
import Maximize16 from '@carbon/icons/es/maximize/16.js';
import Maximize32 from '@carbon/icons/es/maximize/32.js';
import Minimize16 from '@carbon/icons/es/minimize/16.js';
import Minimize32 from '@carbon/icons/es/minimize/32.js';
import NewTab16 from '@carbon/icons/es/new-tab/16.js';
import NewTab32 from '@carbon/icons/es/new-tab/32.js';
import JumpLink32 from '@carbon/icons/es/jump-link/32.js';
import DragHorizontal32 from '@carbon/icons/es/drag--horizontal/32.js';
import DragVertical32 from '@carbon/icons/es/drag--vertical/32.js';
import XAxis32 from '@carbon/icons/es/x-axis/32.js';
import YAxis32 from '@carbon/icons/es/y-axis/32.js';
import ZAxis32 from '@carbon/icons/es/z-axis/32.js';
import Connect32 from '@carbon/icons/es/connect/32.js';
import ChooseItem32 from '@carbon/icons/es/choose-item/32.js';
import { hoverIcon, carbonArt, withStatic } from '../../engine';
import { rectPath } from '../../geometry';
import { EVENODD, f } from '../../paint';

/**
 * Sort, pan, drag, axis, window and connect icons on the frame engine:
 * the same motion as their reference animations, on the shared hover (160ms entrance
 * in, 120ms exit out), at constant line weight. Every shape is Carbon's
 * own outline at rest; on hover the parts that move are moved as geometry
 * (a head rigidly, a shaft or bar lengthening along its own axis).
 *
 * Set-wide rules applied: a standalone arrow reaches 4px, an arrow on a
 * glyph or one of a pair/set reaches 2px (measured along the arrow, so a
 * diagonal head moves √2 on each axis); plus arms reach 2px at each end;
 * a frame grows 2px on each side.
 *
 *  - Arrows horizontal / vertical, Pan horizontal / vertical: each head
 *    reaches 2px out, the shaft lengthening behind it (pairs).
 *  - Caret sort (and its up / down halves), Chevron sort: the carets
 *    slide 2px apart.
 *  - Chevron mini: the corner glyph slides 2px out on each axis.
 *  - Maximize / Minimize: each corner head reaches 2px along its diagonal
 *    (out / in), the shaft lengthening behind it; the tail holds.
 *  - New tab: the plus arms reach 2px at each end and the window's open
 *    ends draw back with them; the window itself holds.
 *  - Jump link: the head drops 4px and the hook's stem lengthens to it.
 *  - Drag horizontal / vertical: the heads reach 2px out
 *    and the bars shorten 2px at each end.
 *  - X / Y / Z axis: the arrowheads reach 2px (Z: the top head up, the
 *    two corner heads out along their diagonals); the axes hold.
 *  - Connect: the ring and the disc each move 2px (per axis) toward each
 *    other along the diagonal, the link between them shortening.
 *  - Choose item: the arrow reaches 2px toward the bar; the bar steps 2px
 *    right to keep the 1px gap and lengthens 2px at each end.
 */

type P = readonly [number, number];
const poly = (pts: readonly P[]) =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
/** Carbon's points, those `pick` selects shifted by (dx, dy). */
const shift = (
  pts: readonly P[],
  pick: (x: number, y: number) => boolean,
  dx: number,
  dy: number
) => poly(pts.map(([x, y]) => (pick(x, y) ? [x + dx, y + dy] : [x, y]) as P));
const all = () => true;

/** Two paths with the same commands, interpolated number by number. */
function morph(rest: string, hover: string): (h: number) => string {
  const nums = (d: string) => d.match(/-?\d*\.?\d+/g)!.map(Number);
  const [a, b] = [nums(rest), nums(hover)];
  const parts = rest.split(/-?\d*\.?\d+/g);
  return (h) =>
    parts.reduce(
      (d, part, i) =>
        d + part + (i < a.length ? f(a[i] + (b[i] - a[i]) * h) : ''),
      ''
    );
}

const REACH = 2; // an arrow on a glyph or one of a set
const DIAG = REACH / Math.SQRT2; // the same reach along a 45° arrow, per axis

// ── Arrow pairs ──────────────────────────────────────────────────────────────

const AH_LEFT: P[] = [
  [11.41, 26.59],
  [7.83, 23],
  [28, 23],
  [28, 21],
  [7.83, 21],
  [11.41, 17.41],
  [10, 16],
  [4, 22],
  [10, 28],
];
const AH_RIGHT: P[] = [
  [28, 10],
  [22, 4],
  [20.59, 5.41],
  [24.17, 9],
  [4, 9],
  [4, 11],
  [24.17, 11],
  [20.59, 14.59],
  [22, 16],
];
export const ArrowsHorizontalSpec = /* @__PURE__ */ hoverIcon(
  'ArrowsHorizontal',
  {
    geo: ({ h }) => ({
      left: { d: shift(AH_LEFT, (x) => x < 12, -REACH * h, 0) },
      right: { d: shift(AH_RIGHT, (x) => x > 20, REACH * h, 0) },
    }),
    static: /* @__PURE__ */ carbonArt(ArrowsHorizontal32),
  }
);

const AV_DOWN: P[] = [
  [27.6, 20.6],
  [24, 24.2],
  [24, 4],
  [22, 4],
  [22, 24.2],
  [18.4, 20.6],
  [17, 22],
  [23, 28],
  [29, 22],
];
const AV_UP: P[] = [
  [9, 4],
  [3, 10],
  [4.4, 11.4],
  [8, 7.8],
  [8, 28],
  [10, 28],
  [10, 7.8],
  [13.6, 11.4],
  [15, 10],
];
export const ArrowsVerticalSpec = /* @__PURE__ */ hoverIcon('ArrowsVertical', {
  geo: ({ h }) => ({
    down: { d: shift(AV_DOWN, (_, y) => y > 20, 0, REACH * h) },
    up: { d: shift(AV_UP, (_, y) => y < 12, 0, -REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(ArrowsVertical32),
});

const PAN_H: P[] = [
  [24, 10],
  [22.586, 11.414],
  [26.172, 15],
  [5.828, 15],
  [9.414, 11.414],
  [8, 10],
  [2, 16],
  [8, 22],
  [9.414, 20.586],
  [5.828, 17],
  [26.172, 17],
  [22.586, 20.586],
  [24, 22],
  [30, 16],
];
const PAN_V: P[] = PAN_H.map(([x, y]) => [y, x] as P);
const panOut = (v: number, h: number) =>
  v > 16 ? v + REACH * h : v < 16 ? v - REACH * h : v;
export const PanHorizontalSpec = /* @__PURE__ */ hoverIcon('PanHorizontal', {
  geo: ({ h }) => ({
    arrow: { d: poly(PAN_H.map(([x, y]) => [panOut(x, h), y] as P)) },
  }),
  static: /* @__PURE__ */ carbonArt(PanHorizontal32),
});
export const PanVerticalSpec = /* @__PURE__ */ hoverIcon('PanVertical', {
  geo: ({ h }) => ({
    arrow: { d: poly(PAN_V.map(([x, y]) => [x, panOut(y, h)] as P)) },
  }),
  static: /* @__PURE__ */ carbonArt(PanVertical32),
});

// ── Carets and chevrons ──────────────────────────────────────────────────────

const CARET_DOWN: P[] = [
  [24, 24],
  [16, 32],
  [8, 24],
];
const CARET_UP: P[] = [
  [8, 8],
  [16, 0],
  [24, 8],
];
export const CaretSortSpec = /* @__PURE__ */ hoverIcon('CaretSort', {
  geo: ({ h }) => ({
    down: { d: shift(CARET_DOWN, all, 0, REACH * h) },
    up: { d: shift(CARET_UP, all, 0, -REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(CaretSort32),
});
export const CaretSortDownSpec = /* @__PURE__ */ hoverIcon('CaretSortDown', {
  geo: ({ h }) => ({ down: { d: shift(CARET_DOWN, all, 0, REACH * h) } }),
  static: /* @__PURE__ */ carbonArt(CaretSortDown32),
});
export const CaretSortUpSpec = /* @__PURE__ */ hoverIcon('CaretSortUp', {
  geo: ({ h }) => ({ up: { d: shift(CARET_UP, all, 0, -REACH * h) } }),
  static: /* @__PURE__ */ carbonArt(CaretSortUp32),
});

const CHEV_DOWN: P[] = [
  [16, 28],
  [9, 21],
  [10.41, 19.59],
  [16, 25.17],
  [21.59, 19.59],
  [23, 21],
];
const CHEV_UP: P[] = [
  [16, 4],
  [23, 11],
  [21.59, 12.41],
  [16, 6.83],
  [10.41, 12.41],
  [9, 11],
];
export const ChevronSortSpec = /* @__PURE__ */ hoverIcon('ChevronSort', {
  geo: ({ h }) => ({
    down: { d: shift(CHEV_DOWN, all, 0, REACH * h) },
    up: { d: shift(CHEV_UP, all, 0, -REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(ChevronSort16, ChevronSort32),
});

// Carbon's 16px Chevron mini sits 1 unit further in (its 15/9 grid, ×2).
const MINI: P[] = [
  [31, 19],
  [31, 31],
  [19, 31],
];
const MINI_16: P[] = [
  [30, 18],
  [30, 30],
  [18, 30],
];
export const ChevronMiniSpec = /* @__PURE__ */ hoverIcon('ChevronMini', {
  geo: ({ h }, size) => ({
    glyph: { d: shift(size === 16 ? MINI_16 : MINI, all, 2 * h, 2 * h) },
  }),
  static: /* @__PURE__ */ carbonArt(ChevronMini16, ChevronMini32),
});

// ── Maximize / Minimize ──────────────────────────────────────────────────────

// Each outline: the corner head (moves along the diagonal) and the shaft's
// two tail points (hold), told apart by how far they sit off the diagonal.
const MAX_TR: P[] = [
  [20, 2],
  [20, 4],
  [26.586, 4],
  [18, 12.582],
  [19.414, 14],
  [28, 5.414],
  [28, 12],
  [30, 12],
  [30, 2],
];
const MAX_BL: P[] = [
  [14, 19.416],
  [12.592, 18],
  [4, 26.586],
  [4, 20],
  [2, 20],
  [2, 30],
  [12, 30],
  [12, 28],
  [5.414, 28],
];
export const MaximizeSpec = /* @__PURE__ */ hoverIcon('Maximize', {
  geo: ({ h }) => ({
    tr: { d: shift(MAX_TR, (x, y) => x - y > 10, DIAG * h, -DIAG * h) },
    bl: { d: shift(MAX_BL, (x, y) => y - x > 10, -DIAG * h, DIAG * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Maximize16, Maximize32),
});
const MIN_TR: P[] = [
  [30, 3.416],
  [28.592, 2],
  [20, 10.586],
  [20, 4],
  [18, 4],
  [18, 14],
  [28, 14],
  [28, 12],
  [21.414, 12],
];
const MIN_BL: P[] = [
  [4, 18],
  [4, 20],
  [10.586, 20],
  [2, 28.582],
  [3.414, 30],
  [12, 21.414],
  [12, 28],
  [14, 28],
  [14, 18],
];
export const MinimizeSpec = /* @__PURE__ */ hoverIcon('Minimize', {
  geo: ({ h }) => ({
    tr: { d: shift(MIN_TR, (x, y) => x - y < 20, -DIAG * h, DIAG * h) },
    bl: { d: shift(MIN_BL, (x, y) => y - x < 20, DIAG * h, -DIAG * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Minimize16, Minimize32),
});

// ── New tab ──────────────────────────────────────────────────────────────────

/** A plus about (cx, cy): arms reaching `l`, 1px half-width. */
const plus = (cx: number, cy: number, l: number): P[] =>
  (
    [
      [-1, -l],
      [1, -l],
      [1, -1],
      [l, -1],
      [l, 1],
      [1, 1],
      [1, l],
      [-1, l],
      [-1, 1],
      [-l, 1],
      [-l, -1],
      [-1, -1],
    ] as P[]
  ).map(([x, y]) => [cx + x, cy + y] as P);

export const NewTabSpec = /* @__PURE__ */ hoverIcon('NewTab', {
  geo: ({ h }) => {
    // The window holds; the plus's arms reach 2px at each end,
    // and the window's open ends draw back 2px with them, so the 4px of
    // space between the plus and the window holds.
    const g = 2 * h;
    const frame = `M26 26H6V6H${f(16 - g)}V4H6A2 2 0 0 0 4 6V26A2 2 0 0 0 6 28H26A2 2 0 0 0 28 26V${f(16 + g)}H26Z`;
    return { frame: { d: frame }, plus: { d: poly(plus(25, 7, 5 + g)) } };
  },
  static: /* @__PURE__ */ carbonArt(NewTab16, NewTab32),
});

// ── Jump link ────────────────────────────────────────────────────────────────

// Standalone arrow: the head drops 4px; the hook's stem lengthens to it.
export const JumpLinkSpec = /* @__PURE__ */ hoverIcon('JumpLink', {
  geo: ({ h }) => {
    const y = (v: number) => f(v + 4 * h);
    return {
      arrow: {
        d:
          `M13.4141 ${y(17.5859)}L18 ${y(22.1719)}V8H8V6H18A2 2 0 0 1 20 8V${y(22.1719)}` +
          `L24.5859 ${y(17.5859)}L26 ${y(19)}L19 ${y(26)}L12 ${y(19)}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(JumpLink32),
});

// ── Drag ─────────────────────────────────────────────────────────────────────

const dragPair = (name: string, a: [string, string], b: [string, string]) => {
  const [ma, mb] = [morph(...a), morph(...b)];
  return hoverIcon(name, {
    geo: ({ h }) => ({ a: { d: ma(h) }, b: { d: mb(h) } }),
  });
};
export const DragHorizontalSpec = /* @__PURE__ */ withStatic(
  /* @__PURE__ */ dragPair(
    'DragHorizontal',
    [
      'M5.83,15 L8.41,12.41 L7,11 L2,16 L7,21 L8.41,19.59 L5.83,17 L12,17 L12,28 L14,28 L14,4 L12,4 L12,15 Z',
      'M3.83,15 L6.41,12.41 L5,11 L0,16 L5,21 L6.41,19.59 L3.83,17 L12,17 L12,26 L14,26 L14,6 L12,6 L12,15 Z',
    ],
    [
      'M26.17,17 L23.59,19.59 L25,21 L30,16 L25,11 L23.59,12.41 L26.17,15 L20,15 L20,4 L18,4 L18,28 L20,28 L20,17 Z',
      'M28.17,17 L25.59,19.59 L27,21 L32,16 L27,11 L25.59,12.41 L28.17,15 L20,15 L20,6 L18,6 L18,26 L20,26 L20,17 Z',
    ]
  ),
  /* @__PURE__ */ carbonArt(DragHorizontal32)
);
export const DragVerticalSpec = /* @__PURE__ */ withStatic(
  /* @__PURE__ */ dragPair(
    'DragVertical',
    [
      'M17,5.83 L19.59,8.41 L21,7 L16,2 L11,7 L12.41,8.41 L15,5.83 L15,12 L4,12 L4,14 L28,14 L28,12 L17,12 Z',
      'M17,3.83 L19.59,6.41 L21,5 L16,0 L11,5 L12.41,6.41 L15,3.83 L15,12 L6,12 L6,14 L26,14 L26,12 L17,12 Z',
    ],
    [
      'M15,26.17 L12.41,23.59 L11,25 L16,30 L21,25 L19.59,23.59 L17,26.17 L17,20 L28,20 L28,18 L4,18 L4,20 L15,20 Z',
      'M15,28.17 L12.41,25.59 L11,27 L16,32 L21,27 L19.59,25.59 L17,28.17 L17,20 L26,20 L26,18 L6,18 L6,20 L15,20 Z',
    ]
  ),
  /* @__PURE__ */ carbonArt(DragVertical32)
);

// ── Axes ─────────────────────────────────────────────────────────────────────

export const XAxisSpec = /* @__PURE__ */ hoverIcon('XAxis', {
  geo: ({ h }) => {
    const x = (v: number) => f(v + REACH * h);
    return {
      axes: {
        d:
          `M${x(23)} 20L${x(21.5859)} 21.4141L${x(24.1719)} 24H6V4H4V24A2 2 0 0 0 6 26H${x(24.1719)}` +
          `L${x(21.5859)} 28.5859L${x(23)} 30L${x(28)} 25Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(XAxis32),
});

export const YAxisSpec = /* @__PURE__ */ hoverIcon('YAxis', {
  geo: ({ h }) => {
    const y = (v: number) => f(v - REACH * h);
    return {
      axes: {
        d:
          `M8 26V${y(7.8281)}L10.5859 ${y(10.4141)}L12 ${y(9)}L7 ${y(4)}L2 ${y(9)}L3.4141 ${y(10.4141)}L6 ${y(7.8281)}` +
          'V26A2 2 0 0 0 8 28H28V26Z',
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(YAxis32),
});

const Z_AXIS: P[] = [
  [26, 22],
  [26, 25.586],
  [17, 16.586],
  [17, 10],
  [17, 6],
  [17, 5.828],
  [19.586, 8.414],
  [21, 7],
  [16, 2],
  [11, 7],
  [12.414, 8.414],
  [15, 5.828],
  [15, 6],
  [15, 10],
  [15, 16.586],
  [6, 25.586],
  [6, 22],
  [4, 22],
  [4, 29],
  [11, 29],
  [11, 27],
  [7.414, 27],
  [16, 18.414],
  [24.586, 27],
  [21, 27],
  [21, 29],
  [28, 29],
  [28, 22],
];
export const ZAxisSpec = /* @__PURE__ */ hoverIcon('ZAxis', {
  geo: ({ h }) => {
    const [r, k] = [REACH * h, DIAG * h];
    const moved = Z_AXIS.map(([x, y]): P => {
      if (y < 9) {
        return [x, y - r];
      } // the top head (its shaft lengthens below it)
      if (y > 20 && x < 12) {
        return [x - k, y + k];
      } // bottom-left corner head
      if (y > 20 && x > 20) {
        return [x + k, y + k];
      } // bottom-right corner head
      return [x, y];
    });
    return { axes: { d: poly(moved) } };
  },
  static: /* @__PURE__ */ carbonArt(ZAxis32),
});

// ── Connect ──────────────────────────────────────────────────────────────────

// Carbon's outline: a ring (r 7 / 5) at (9, 9) and a disc (r 7) at (23, 23),
// linked by a 2px band along the diagonal. On hover each centre moves 2px
// per axis toward the other and the band shortens between them.
const CONNECT_T = Math.sqrt(48); // where the band's edges (1px off the diagonal) meet a r=7 circle
export const ConnectSpec = /* @__PURE__ */ hoverIcon('Connect', {
  geo: ({ h }) => {
    const [a, b] = [9 + 2 * h, 23 - 2 * h];
    const u = CONNECT_T / Math.SQRT2; // along the diagonal, per axis
    const n = 1 / Math.SQRT2; // 1px across it, per axis
    const pt = (x: number, y: number) => `${f(x)} ${f(y)}`;
    const outer =
      `M${pt(b - u + n, b - u - n)}A7 7 0 1 1 ${pt(b - u - n, b - u + n)}` +
      `L${pt(a + u - n, a + u + n)}A7 7 0 1 1 ${pt(a + u + n, a + u - n)}Z`;
    const hole = `M${pt(a - 5, a)}A5 5 0 1 1 ${pt(a + 5, a)}A5 5 0 1 1 ${pt(a - 5, a)}Z`;
    return { link: { d: outer + hole, ...EVENODD } };
  },
  static: /* @__PURE__ */ carbonArt(Connect32),
});

// ── Choose item ──────────────────────────────────────────────────────────────

const CHOOSE_ARROW: P[] = [
  [17, 6],
  [15.57, 7.393],
  [23.15, 15],
  [2, 15],
  [2, 17],
  [23.15, 17],
  [15.57, 24.573],
  [17, 26],
  [27, 16],
];
export const ChooseItemSpec = /* @__PURE__ */ hoverIcon('ChooseItem', {
  geo: ({ h }) => {
    const r = REACH * h;
    return {
      bar: { d: rectPath(28 + r, 6 - r, 30 + r, 26 + r) },
      arrow: { d: shift(CHOOSE_ARROW, (x) => x > 10, r, 0) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ChooseItem32),
});
