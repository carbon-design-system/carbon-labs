/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Template32 from '@carbon/icons/es/template/32.js';
import Script32 from '@carbon/icons/es/script/32.js';
import DocumentVertical32 from '@carbon/icons/es/document--vertical/32.js';
import DocumentHorizontal32 from '@carbon/icons/es/document--horizontal/32.js';
import StarReview32 from '@carbon/icons/es/star--review/32.js';
import Playlist32 from '@carbon/icons/es/playlist/32.js';
import Product32 from '@carbon/icons/es/product/32.js';
import PresentationFile32 from '@carbon/icons/es/presentation-file/32.js';
import Badge32 from '@carbon/icons/es/badge/32.js';
import CopyLink32 from '@carbon/icons/es/copy--link/32.js';
import ModelAlt32 from '@carbon/icons/es/model--alt/32.js';
import Scale32 from '@carbon/icons/es/scale/32.js';
import Sprout32 from '@carbon/icons/es/sprout/32.js';
import WatsonHealthMagnify32 from '@carbon/icons/es/watson-health/magnify/32.js';
import IbmWatsonDiscovery32 from '@carbon/icons/es/ibm-watson--discovery/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import {
  framePath,
  insetPoly,
  mapPath,
  polyPath,
  rectPath,
  ringPath,
  roundedOutlinePath,
  scalePts,
  type Pt,
} from '../../geometry';
import { cutPoly, growPoly, type HalfPlane } from '../../cut';
import { ENTRANCE, stagger } from '../../ease';
import { HANDLE_TURN, magnifierAt, LENS_GROW } from '../../magnifier';
import { EVENODD, f } from '../../paint';
import { CHAT_HOVER, chatHover } from '../operations/opsLast';

/**
 * Documents and objects on the frame engine: Template, Script,
 * Document vertical, Document horizontal, Star review, Playlist, Product,
 * Presentation file, Badge, Copy link, Model alt, Scale, Sprout, Watson
 * Health magnify and IBM Watson Discovery. Carbon has one (32px) drawing
 * of each, so one geometry serves every size, and each rests on Carbon's
 * outline. On hover the parts
 * move as geometry at a constant 2px wall: points move, nothing is
 * transform-scaled, no masks or clip paths. Standard hover (160ms entrance
 * in, 120ms exit out) except Playlist (Chat's 190ms) and Model alt (a
 * three-stage stagger, 210ms).
 *
 *  - Template: Workspace's re-flow: the gap under the header moves 2px down
 *    and the gap between sidebar and content 2px right (header 8 → 10px
 *    tall, sidebar 8 → 10px wide, content 14 → 12px square); 2px gaps and
 *    the layout's outer edges hold.
 *  - Script: Document PDF's fold: the folded corner comes 2px in (its fold
 *    lines 2px left and down, the diagonal 1.41px in), walls held at 2px.
 *    The code brackets step 1px apart (Code's motion, halved: the page's
 *    bottom wall ends 2px from the left bracket), and that wall's open end
 *    draws back 1px with it, so the space between them holds.
 *  - Document vertical / Document horizontal: the page fills the frame, so
 *    it grows 1px a side (Identification's card); the person inside takes
 *    the People family motion: shoulders 2px wider (1px a side), head 1px
 *    larger in diameter with its bottom held. The head's 1px gap to the
 *    shoulders and its 2px to the page's top hold; the shoulders' legs run
 *    on 1px into the page's bottom wall as it moves down.
 *  - Star review: the half star grows 1px out along every edge (its tips,
 *    52.6° in Carbon's drawing, reach 2.26px); its cuts (the vertical one at
 *    x 14, the right arm's square end) and the review lines hold.
 *  - Playlist: Chat's hover (190ms): the list scrolls up a line. The top
 *    line rises 6.59px and fades, the others rise 6px (the short one
 *    widening to full length), and a new short line comes in from 4.47px
 *    below, fading in and widening 8 → 12px. The triangle grows 20%.
 *  - Product: the box grows 1px a side; the tab rides up 1px and widens 2px
 *    (slot too, walls 2px); the label lines ride 1px left and down and
 *    lengthen 2px.
 *  - Presentation file: the board grows 1px a side, its post riding up 1px;
 *    the base widens 1px at each end, the stand's foot holds; the bars ride
 *    down 1px with the board and grow 2px taller.
 *  - Badge: Recommend's medal motion: the ring grows 2px in radius, the legs
 *    hold, the tails drop 3px; the star grows 25% and moves out with the
 *    ring, whose open ends re-cut to keep 1.91px to it.
 *  - Copy link: the links come together 1px per axis each, their gaps
 *    sliding with them (re-cut where they slide into an arc, so the 1.51px
 *    space between the links holds); the page grows 1px a side.
 *  - Model alt: each cube turns 90° about its own axis (top clockwise, then
 *    left anticlockwise, then right clockwise, 30ms apart, 210ms), and the
 *    model grows 1px a side about the icon's centre.
 *  - Scale: the small square grows 2px up and right from its fixed corner
 *    (10 → 12px); the outline's open ends draw back 2px, so the 4px spaces
 *    to the square hold.
 *  - Sprout: grows 1px taller (stem lengthens, leaves rise), and each leaf
 *    grows about its base so its tip reaches out on each axis, the big leaf
 *    2px and the small one 1px; the ground's arc runs 1px further round at
 *    each end.
 *  - Watson Health magnify: Search's magnifier (lens 1px larger in diameter,
 *    handle turned 15°); the frame grows 1px a side, its open ends re-cut so
 *    they keep 4px to the lens.
 *  - IBM Watson Discovery: the lens takes the magnifier's hover (Search's):
 *    its open ring grows 0.5px in radius at its 2px weight, its open ends
 *    staying on their rays, and the handle turns 15° clockwise about the
 *    lens centre, riding out with the ring. The three dot-and-dash rows
 *    scroll right through their row, cut at its ends (x 2 and 14), each to
 *    its own place, so data seems to move through them.
 *    The row repeats every 14px (dot 2, space 2, dash 8, space 2): the top
 *    and bottom rows scroll 10px, to dash 2–10 and dot 12–14; the middle
 *    row 4px, to dot 2–4 and dash 6–14. So at full hover the rows trade
 *    Carbon's two compositions, every piece whole at the window's ends.
 *
 * Not built: Document tasks. It is the page with its corner cut away for a
 * check (a base icon with an inset status mark, as Document add and
 * Document download), which the set skips.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const DEG = Math.PI / 180;
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];

/** The area centroid of a simple polygon. */
function areaCentroid(pts: readonly Pt[]): Pt {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    [a, cx, cy] = [a + k, cx + (x0 + x1) * k, cy + (y0 + y1) * k];
  });
  return [cx / (3 * a), cy / (3 * a)];
}

/** The distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = sub(b, a);
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** A 2px band along a → b (square ends). */
function band(a: Pt, b: Pt): string {
  const [dx, dy] = sub(b, a);
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

// ── Template ─────────────────────────────────────────────────────────────────
//
// Three of Carbon's frames (outer corners r2, square inside, 2px walls): the
// header 4–28 × 4–12, the sidebar 4–12 × 14–28 and the content 14–28 ×
// 14–28, 2px apart. Hover, Workspace's re-flow: the layout's two gaps move,
// and each tile's edge on a gap moves with it, so the 2px gaps hold. The
// gap under the header moves 2px down (header 8 → 10px tall, the lower row
// 14 → 12) and the gap between sidebar and content 2px right (sidebar 8 →
// 10px wide, content 14 → 12), so the content block ends square (12 × 12).
// The layout's outer edges hold.

/** How far the gap under the header moves down, and the gap between sidebar and content moves right. */
export const TEMPLATE_SHIFT = 2;
export const TemplateSpec = /* @__PURE__ */ hoverIcon('Template', {
  geo: ({ h }) => {
    const m = TEMPLATE_SHIFT * h;
    return {
      header: { d: framePath(4, 4, 28, 12 + m), ...EVENODD },
      sidebar: { d: framePath(4, 14 + m, 12 + m, 28), ...EVENODD },
      content: { d: framePath(14 + m, 14 + m, 28, 28), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Template32),
});

// ── Script ───────────────────────────────────────────────────────────────────
//
// Carbon's page (absolute): open at its lower right, where the brackets sit
// (its bottom wall ends at x 14, its right wall at y 18), with the fold's
// triangle. The fold comes in as Document PDF's does: the points on its
// vertical fold line (and the top edge's end at the diagonal) move k left,
// those on its horizontal fold line (and the right wall's top) k down.

const SCRIPT_PAGE =
  'M14 28H8V4H16V10A2.0058 2.0058 0 0 0 18 12H24V18H26V10A0.9092 0.9092 0 0 0 25.7 9.3L18.7 2.3A0.9087 0.9087 0 0 0 18 2H8A2.0058 2.0058 0 0 0 6 4V28A2.0058 2.0058 0 0 0 8 30H14Z' +
  'M18 4.4L23.6 10H18Z';
const SCRIPT_LEFT =
  'M18.83 26L21.41 23.42L20 22L16 26L20 30L21.42 28.59L18.83 26Z';
const SCRIPT_RIGHT =
  'M27.17 26L24.59 28.58L26 30L30 26L26 22L24.58 23.41L27.17 26Z';
/** How far the fold comes in (Document PDF's). */
export const SCRIPT_FOLD = 2;
/** How far each bracket steps out (and the bottom wall's open end draws back). */
export const BRACKET_STEP = 1;
const foldLeft = (x: number, y: number) => x > 12 && x < 19.5 && y < 13;
const foldDown = (x: number, y: number) => x > 15 && y > 8 && y < 13;

export const ScriptSpec = /* @__PURE__ */ hoverIcon('Script', {
  geo: ({ h }) => {
    const [k, b] = [SCRIPT_FOLD * h, BRACKET_STEP * h];
    return {
      page: {
        d: mapPath(SCRIPT_PAGE, ([x, y]) => [
          x - (foldLeft(x, y) ? k : 0) - (x === 14 && y >= 28 ? b : 0),
          y + (foldDown(x, y) ? k : 0),
        ]),
      },
      left: { d: mapPath(SCRIPT_LEFT, ([x, y]) => [x - b, y]) },
      right: { d: mapPath(SCRIPT_RIGHT, ([x, y]) => [x + b, y]) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Script32),
});

// ── Document vertical / horizontal ───────────────────────────────────────────
//
// A page (outer corners r2) whose inside wraps round a person's shoulders:
// the shoulders are a 2px wall standing on the page's bottom wall, the head a
// ring (r 2–4) 1px above them. One path for page and shoulders, as Carbon
// draws it, and the head.
//
// Hover: the page's points step g out (each wall keeps 2px); the shoulders'
// points step w out sideways (their corners rigid), and their feet, on the
// page's bottom wall, move down with it. The head grows with its bottom held.

/** How far the page grows on each side (it fills the frame). */
export const PAGE_GROW = 1;
/** How far each side of the shoulders steps out, and how much the head's diameter grows (the People family). */
export const SHOULDER_WIDEN = 1;
export const HEAD_GROW = 1;

function portrait(
  d: string,
  isBody: (p: Pt) => boolean,
  feet: number,
  h: number
): string {
  const [g, w] = [PAGE_GROW * h, SHOULDER_WIDEN * h];
  return mapPath(d, ([x, y]) =>
    isBody([x, y])
      ? [x + (x < 16 ? -w : x > 16 ? w : 0), y + (y >= feet - 0.05 ? g : 0)]
      : [x + (x < 16 ? -g : g), y + (y < 16 ? -g : g)]
  );
}
/** The head ring about c (centreline r 3) grown with its bottom held. */
const head = ([cx, cy]: Pt, h: number) => {
  const k = (HEAD_GROW / 2) * h;
  return { d: ringPath([cx, cy - k], 3 + k, 2), ...EVENODD };
};

const DOC_V =
  'M24 2H8A2.0023 2.0023 0 0 0 6 4V28A2.0023 2.0023 0 0 0 8 30H24A2.0023 2.0023 0 0 0 26 28V4A2.0023 2.0023 0 0 0 24 2Z' +
  'M12 24V18A0.9447 0.9447 0 0 1 13 17H19A0.9447 0.9447 0 0 1 20 18V24H18V28H14V24Z' +
  'M20 28V26A2.0058 2.0058 0 0 0 22 24V18A2.9463 2.9463 0 0 0 19 15H13A2.9463 2.9463 0 0 0 10 18V24A2.0058 2.0058 0 0 0 12 26V28H8V4H24V28Z';
export const DocumentVerticalSpec = /* @__PURE__ */ hoverIcon(
  'DocumentVertical',
  {
    geo: ({ h }) => ({
      page: {
        d: portrait(DOC_V, ([x, y]) => x > 9.5 && x < 22.5 && y > 14.5, 28, h),
      },
      head: head([16, 10], h),
    }),
    static: /* @__PURE__ */ carbonArt(DocumentVertical32),
  }
);

const DOC_H =
  'M28 6H4A2.0023 2.0023 0 0 0 2 8V24A2.0023 2.0023 0 0 0 4 26H28A2.0023 2.0023 0 0 0 30 24V8A2.0023 2.0023 0 0 0 28 6Z' +
  'M20 24H12V22A1 1 0 0 1 13 21H19A1 1 0 0 1 20 22Z' +
  'M28 24H22V22A3 3 0 0 0 19 19H13A3 3 0 0 0 10 22V24H4V8H28Z';
export const DocumentHorizontalSpec = /* @__PURE__ */ hoverIcon(
  'DocumentHorizontal',
  {
    geo: ({ h }) => ({
      page: {
        d: portrait(DOC_H, ([x, y]) => x > 9.5 && x < 22.5 && y > 18.5, 24, h),
      },
      head: head([16, 14], h),
    }),
    static: /* @__PURE__ */ carbonArt(DocumentHorizontal32),
  }
);

// ── Star review ──────────────────────────────────────────────────────────────
//
// Carbon's half star: a 2px wall round the star's left half and along its
// upper right arm, cut square at the arm's end and straight down (x 14)
// through its bottom valley; three review lines fill the right half. Each
// vertex is where two lines meet: the star's edges (outer and inner, each
// pair 2px apart) and the two cuts. Growing, every star edge moves g out
// along its normal (the centreline grows about the star's centre), so the
// walls keep 2px; the cuts hold.

type Line = { n: Pt; c: number; moves: boolean };
/** The line through a and b; a star edge (given the centre) has its normal pointing away from it. */
function lineThrough(a: Pt, b: Pt, centre?: Pt): Line {
  const [dx, dy] = sub(b, a);
  const l = Math.hypot(dx, dy);
  let n: Pt = [dy / l, -dx / l];
  let c = dot(n, a);
  if (centre && dot(n, centre) > c) {
    [n, c] = [[-n[0], -n[1]], -c];
  }
  return { n, c, moves: !!centre };
}
function meetLines(p: Line, q: Line, g: number): Pt {
  const [c1, c2] = [p.c + (p.moves ? g : 0), q.c + (q.moves ? g : 0)];
  const det = p.n[0] * q.n[1] - p.n[1] * q.n[0];
  return [(c1 * q.n[1] - c2 * p.n[1]) / det, (p.n[0] * c2 - q.n[0] * c1) / det];
}
/** The full star's centre (its tips' circumcentre). */
const STAR_C: Pt = [16, 17.478];
const SL = (a: Pt, b: Pt) => lineThrough(a, b, STAR_C);
const STAR_LINES = {
  A: SL([20.549, 11.217], [28, 12.3]),
  B: SL([16, 2], [20.549, 11.217]),
  C: SL([16, 2], [11.451, 11.217]),
  D: SL([11.451, 11.217], [1.28, 12.695]),
  E: SL([1.28, 12.695], [8.64, 19.87]),
  F: SL([8.64, 19.87], [6.902, 30]),
  G: SL([6.902, 30], [14, 26.269]),
  a: SL([19.221, 13.045], [27.715, 14.281]),
  b: SL([16, 6.519], [19.221, 13.045]),
  c: SL([16, 6.519], [12.779, 13.045]),
  d: SL([12.779, 13.045], [5.578, 14.091]),
  e: SL([5.578, 14.091], [10.789, 19.171]),
  f: SL([10.789, 19.171], [9.559, 26.344]),
  g: SL([9.559, 26.344], [14, 24.009]),
  X: lineThrough([14, 24], [14, 27]),
  S: lineThrough([28, 12.3], [27.715, 14.281]),
};
type StarLine = keyof typeof STAR_LINES;
const STAR_VERTS: [StarLine, StarLine][] = [
  ['S', 'A'],
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['D', 'E'],
  ['E', 'F'],
  ['F', 'G'],
  ['G', 'X'],
  ['X', 'g'],
  ['g', 'f'],
  ['f', 'e'],
  ['e', 'd'],
  ['d', 'c'],
  ['c', 'b'],
  ['b', 'a'],
  ['a', 'S'],
];
/** How far every star edge moves out along its normal (its 52.6° tips reach 1 / sin 26.3° = 2.26px). */
export const STAR_GROW = 1;
export const halfStar = (h: number): Pt[] =>
  STAR_VERTS.map(([p, q]) =>
    meetLines(STAR_LINES[p], STAR_LINES[q], STAR_GROW * h)
  );
const REVIEW_LINES =
  /* @__PURE__ */ rectPath(18, 26, 26, 28) +
  /* @__PURE__ */ rectPath(18, 22, 30, 24) +
  /* @__PURE__ */ rectPath(18, 18, 30, 20);

export const StarReviewSpec = /* @__PURE__ */ hoverIcon('StarReview', {
  geo: ({ h }) => ({
    star: { d: polyPath(halfStar(h), true) },
    lines: { d: REVIEW_LINES },
  }),
  static: /* @__PURE__ */ carbonArt(StarReview32),
});

// ── Playlist ─────────────────────────────────────────────────────────────────
//
// Chat's
// hover, on Chat's timing and slices (chatHover: 190ms linear, each line
// easing its own slice): the top line rises 6.59px and fades as Chat's first
// line does; the other two rise 6px (one pitch), the short one widening to
// full length (12 → 18px) over the second half of its rise (clear of the
// triangle) as it takes the full line's place; a new short
// line comes in from 4.47px below the list, fading in and widening 8 → 12px
// as Chat's third line does. At full hover the list reads as Carbon's again,
// one line on. The triangle keeps its growth (20% about its centroid), on
// the bubble's slice (0–150ms).

const PLAY: Pt[] = [
  [21, 18],
  [28, 23],
  [21, 28],
];
/** How much the play triangle grows about its centroid. */
export const PLAYLIST_GROW = 0.2;
/** One line pitch (the lines rise this far), and the new line's start below its place. */
const PITCH = 6;
export const PlaylistSpec = /* @__PURE__ */ hoverIcon('Playlist', {
  hover: CHAT_HOVER,
  geo: ({ h }) => {
    const { g, line1, line2, line3 } = chatHover(h);
    const k2 = (16 - line2.y0) / 6;
    const k3 = (20.469 - line3.y0) / 4.469;
    const up = PITCH * k2;
    const y4 = 18 + 4.469 * (1 - k3);
    return {
      lineA: {
        d: line1.hidden
          ? ''
          : rectPath(4, 6 - (10 - line1.y0), 22, 8 - (10 - line1.y0)),
        opacity: f(line1.opacity),
      },
      lineB: { d: rectPath(4, 12 - up, 22, 14 - up) },
      // It widens over the second half of its rise, once it has risen clear of the triangle.
      lineC: {
        d: rectPath(
          4,
          18 - up,
          16 + 6 * Math.max(0, Math.min(1, (up - 3) / 3)),
          20 - up
        ),
      },
      lineD: {
        d: line3.hidden ? '' : rectPath(4, y4, 12 + 4 * k3, y4 + 2),
        opacity: f(line3.opacity),
      },
      play: {
        d: polyPath(
          scalePts(PLAY, areaCentroid(PLAY), 1 + PLAYLIST_GROW * (g / 2)),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Playlist32),
});

// ── Product ──────────────────────────────────────────────────────────────────
//
// The box (4–28, outer corners r2) with its tab hanging from the top wall
// (12–20 × 6–12, a 2px U round the 14–18 × 6–10 slot), and two label lines.

const PRODUCT_BOX =
  'M26 4H6A2.0025 2.0025 0 0 0 4 6V26A2.0025 2.0025 0 0 0 6 28H26A2.0025 2.0025 0 0 0 28 26V6A2.0025 2.0025 0 0 0 26 4Z' +
  'M18 6V10H14V6Z' +
  'M6 26V6H12V12H20V6H26L26.0012 26Z';
/**
 * The box grows 1px on every side; the tab rides up 1px
 * with the top wall and widens 2px (its walls step 1px out each side, as the
 * box's do, so the slot widens 2px and every wall keeps 2px). The label
 * lines ride 1px left and down with the box's corner, keeping their 2px
 * margins, and lengthen 2px (their right ends reach 1px right).
 */
export const PRODUCT_GROW = 1;
export const LABEL_REACH = 2;
export const ProductSpec = /* @__PURE__ */ hoverIcon('Product', {
  geo: ({ h }) => {
    const g = PRODUCT_GROW * h;
    const e = LABEL_REACH * h;
    return {
      box: {
        d: mapPath(PRODUCT_BOX, ([x, y]) => [
          x + (x < 16 ? -g : g),
          y + (y < 16 ? -g : g),
        ]),
      },
      lines: {
        d:
          rectPath(8 - g, 18 + g, 14 - g + e, 20 + g) +
          rectPath(8 - g, 22 + g, 18 - g + e, 24 + g),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Product32),
});

// ── Presentation file ────────────────────────────────────────────────────────
//
// The board grows 1px on every side; the post on
// its top rides up 1px with the top wall (its size held); the stand holds at
// its foot (it shortens 1px as the board's bottom comes down) and the base
// widens 1px at each end. The bars ride down 1px with the board's bottom and
// grow 2px taller, so their tops rise 1px and the tallest keeps its 4px to
// the board's top wall.

const EASEL =
  'M25 4H17V2H15V4H7A2 2 0 0 0 5 6V20A2 2 0 0 0 7 22H15V28H11V30H21V28H17V22H25A2 2 0 0 0 27 20V6A2 2 0 0 0 25 4Z' +
  'M25 20H7V6H25Z';
/** How far the board grows on each side, how far each end of the base reaches, and how much taller the bars grow. */
export const BOARD_GROW = 1;
export const BASE_WIDEN = 1;
export const BAR_RISE = 2;
export const PresentationFileSpec = /* @__PURE__ */ hoverIcon(
  'PresentationFile',
  {
    geo: ({ h }) => {
      const [g, w, r] = [BOARD_GROW * h, BASE_WIDEN * h, BAR_RISE * h];
      const easel = mapPath(EASEL, ([x, y]) =>
        y > 27.9
          ? [x + (x === 11 ? -w : x === 21 ? w : 0), y] // the base's ends (the stand's foot holds)
          : [x + (x < 10 ? -g : x > 22 ? g : 0), y + (y < 13 ? -g : g)]
      ); // the board, the post riding on it
      const bar = (x: number, top: number) =>
        rectPath(x, top + g - r, x + 2, 18 + g);
      return {
        easel: { d: easel },
        bars: { d: bar(10, 12) + bar(15, 10) + bar(20, 14) },
      };
    },
    static: /* @__PURE__ */ carbonArt(PresentationFile32),
  }
);

// ── Badge ────────────────────────────────────────────────────────────────
//
// A ring (r 7–9 about (14, 11)) open at its upper right, where the star
// sits, with the ribbon's two legs and tails below it (one path, as
// Carbon's), and the star (solid). It is Recommend's medal (operations/
// opsMisc.ts) 2px to the left, with the star in the ring's gap.
//
// Recommend's hover, exactly: the ring grows 2px in radius (r 7–9 →
// 9–11); the legs hold, their tops meeting the ring where it now crosses
// them; the tails drop 3px. The star grows and moves out with the ring (its
// points scale about the ring's centre by the centreline's 10/8, so it grows
// 25%), and the ring's open ends turn back round it just enough that the
// narrowest space from each to the star holds its rest value (1.91px).

const RING_C: Pt = [14, 11];
/** How far the ring grows in radius and the ribbon's tails drop (Recommend's). */
export const BADGE_RING_GROW = 2;
export const BADGE_TAIL_DROP = 3;
const onRing = (r: number, a: number): Pt => [
  RING_C[0] + r * Math.cos(a),
  RING_C[1] + r * Math.sin(a),
];
/** The ends' angles at rest (screen angles; the ring's ink runs clockwise from the right end round to the top end). */
const END_R = Math.atan2(13.249 - 11, 22.7168 - 14);
const END_T = Math.atan2(2.2835 - 11, 16.2495 - 14);
/** The medal with the ring grown g, the tails dropped d and the ends at aR, aT. */
function medal(g: number, d: number, aR: number, aT: number): string {
  const [ro, ri] = [9 + g, 7 + g];
  // Where the grown ring's outer edge crosses the legs' outer (x 8, 20) and inner (x 10, 18) sides, from Carbon's.
  const yo = Math.sqrt(ro * ro - 36) - Math.sqrt(45);
  const yi = Math.sqrt(ro * ro - 16) - Math.sqrt(65);
  return (
    `M${P(onRing(ro, aR))}L${P(onRing(ri, aR))}A${f(ri)} ${f(ri)} 0 1 1 ${P(onRing(ri, aT))}L${P(onRing(ro, aT))}` +
    `A${f(ro)} ${f(ro)} 0 0 0 8 ${f(17.689 + yo)}V${f(30 + d)}L14 ${f(26 + d)}L20 ${f(30 + d)}V${f(17.7078 + yo)}A${f(ro)} ${f(ro)} 0 0 0 ${P(onRing(ro, aR))}Z` +
    `M18 ${f(26.2627 + d)}L14 ${f(23.5962 + d)}L10 ${f(26.2627 + d)}V${f(19.05 + yi)}A${f(8.9238 + g)} ${f(8.9238 + g)} 0 0 0 18 ${f(19.0562 + yi)}Z`
  );
}
const BADGE_STAR: Pt[] = [
  [23, 2],
  [24.593, 5],
  [28, 5.414],
  [25.5, 7.667],
  [26, 11],
  [23, 9.125],
  [20, 11],
  [20.5, 7.667],
  [18, 5.414],
  [21.5, 5],
];
/** The star at hover h: scaled about the ring's centre with the ring's centreline (8 → 10). */
export const badgeStarAt = (h: number) =>
  scalePts(BADGE_STAR, RING_C, (8 + BADGE_RING_GROW * h) / 8);

/** The star's outline, sampled every ~0.05 (its vertices included). */
function outlineSamples(pts: readonly Pt[]): Pt[] {
  return pts.flatMap((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const n = Math.max(
      1,
      Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05)
    );
    return Array.from(
      { length: n },
      (_, k): Pt => [
        a[0] + ((b[0] - a[0]) * k) / n,
        a[1] + ((b[1] - a[1]) * k) / n,
      ]
    );
  });
}
/**
 * The distance from p to the ring's end piece: the ring (radii ri–ro) from
 * its end at angle `end` running `dir` (+1 clockwise, −1 anticlockwise) for 60°.
 */
function endDist(
  p: Pt,
  end: number,
  dir: 1 | -1,
  ri: number,
  ro: number
): number {
  let t = (Math.atan2(p[1] - RING_C[1], p[0] - RING_C[0]) - end) * dir;
  t -= 2 * Math.PI * Math.floor((t + Math.PI) / (2 * Math.PI));
  if (t >= 0 && t <= 60 * DEG) {
    const r = Math.hypot(p[0] - RING_C[0], p[1] - RING_C[1]);
    return r < ri ? ri - r : r > ro ? r - ro : 0;
  }
  return segDist(p, onRing(ri, end), onRing(ro, end));
}
const starGap = (samples: readonly Pt[], end: number, dir: 1 | -1, g: number) =>
  Math.min(...samples.map((p) => endDist(p, end, dir, 7 + g, 9 + g)));
const REST_SAMPLES = /* @__PURE__ */ outlineSamples(BADGE_STAR);
const BADGE_GAP = {
  right: /* @__PURE__ */ starGap(REST_SAMPLES, END_R, 1, 0),
  top: /* @__PURE__ */ starGap(REST_SAMPLES, END_T, -1, 0),
};
/** The least turn (−20…40°) that keeps `gapAt(turn)` at `want` (bisection; the gap grows with the turn). */
function turnBack(gapAt: (a: number) => number, want: number): number {
  let [lo, hi] = [-20 * DEG, 40 * DEG];
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}
/** How far (radians) the ring's ends turn back at hover h: [right end clockwise, top end anticlockwise] (negative: they reach on). */
export function badgeDrawBack(h: number): [number, number] {
  if (h <= 0) {
    return [0, 0];
  }
  const g = BADGE_RING_GROW * h;
  const samples = outlineSamples(badgeStarAt(h));
  return [
    turnBack((a) => starGap(samples, END_R + a, 1, g), BADGE_GAP.right),
    turnBack((a) => starGap(samples, END_T - a, -1, g), BADGE_GAP.top),
  ];
}

export const BadgeSpec = /* @__PURE__ */ hoverIcon('Badge', {
  geo: ({ h }) => {
    const [r, t] = badgeDrawBack(h);
    return {
      ribbon: {
        d: medal(
          BADGE_RING_GROW * h,
          BADGE_TAIL_DROP * h,
          END_R + r,
          END_T - t
        ),
      },
      star: { d: polyPath(badgeStarAt(h), true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Badge32),
});

// ── Copy link ────────────────────────────────────────────────────────────────
//
// Link's construction (formatting/Link.tsx) at Copy link's size: each link is
// a capsule (centreline r 3.95 about two arc centres 7.22 apart on the
// diagonal; walls 2px) drawn as one closed band from its gap's end round to
// its start, closed by square cuts. Each gap is where the other link passes
// through.
//
// Hover: the
// links come together 1px per axis each along their diagonal (Link's 1px
// drift, toward each other; Link's own hover drifts them apart), and each
// gap slides 2√2 × progress along its side with the link passing through
// it. The page grows 1px on every side.

type Capsule = { c1: Pt; c2: Pt; sign: 1 | -1; gap: [number, number] };
const CR = 3.9476;
const CSIDE = Math.hypot(5.1056, 5.1045);
const CARC = Math.PI * CR;
const CLEN = 2 * CSIDE + 2 * CARC;
/** How far each link moves per axis (toward the other), and how far its gap slides along its side. */
export const LINK_TRAVEL = 1;
const LINK_SLIDE = 2 * Math.SQRT2 * LINK_TRAVEL;
const CAPSULES: Capsule[] = [
  // The lower link (moves up-right): its gap on its lower right side (from the upper arc's end, toward the lower arc).
  {
    c1: [17.0526, 8.948],
    c2: [11.947, 14.0525],
    sign: 1,
    gap: [0.7813, CSIDE],
  },
  // The upper link (moves down-left): its gap on its upper left side (from the lower arc's end, toward the upper arc).
  {
    c1: [19.947, 12.0525],
    c2: [25.0526, 6.948],
    sign: -1,
    gap: [0.7813, CSIDE],
  },
];

/** A point at arc length s round the capsule's centreline (cut side, arc round c2, far side, arc round c1), offset o outward. */
function capAt(l: Capsule, s: number, o: number): Pt {
  const [ux, uy] = [(l.c2[0] - l.c1[0]) / CSIDE, (l.c2[1] - l.c1[1]) / CSIDE];
  const [nx, ny] = [uy, -ux];
  const r = CR + o;
  const t = ((s % CLEN) + CLEN) % CLEN;
  const arc = (c: Pt, a: number): Pt => [
    c[0] + r * Math.cos(a),
    c[1] + r * Math.sin(a),
  ];
  if (t <= CSIDE) {
    return [l.c1[0] + ux * t + nx * r, l.c1[1] + uy * t + ny * r];
  }
  if (t <= CSIDE + CARC) {
    return arc(l.c2, Math.atan2(ny, nx) + (t - CSIDE) / CR);
  }
  if (t <= 2 * CSIDE + CARC) {
    const d = t - CSIDE - CARC;
    return [l.c2[0] - ux * d - nx * r, l.c2[1] - uy * d - ny * r];
  }
  return arc(l.c1, Math.atan2(-ny, -nx) + (t - 2 * CSIDE - CARC) / CR);
}
/** Arc-length breakpoints strictly between a and b, in travel order: each segment's end and each arc's midpoint. */
function capBreaks(a: number, b: number): number[] {
  const ends = [
    CSIDE,
    CSIDE + CARC / 2,
    CSIDE + CARC,
    2 * CSIDE + CARC,
    2 * CSIDE + 1.5 * CARC,
    CLEN,
  ];
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  const out: number[] = [];
  for (let k = Math.floor(lo / CLEN) - 1; k <= Math.ceil(hi / CLEN); k++) {
    for (const e of ends) {
      const v = k * CLEN + e;
      if (v > lo + 1e-6 && v < hi - 1e-6) {
        out.push(v);
      }
    }
  }
  out.sort((x, y) => x - y);
  return a < b ? out : out.reverse();
}
const capOnArc = (s: number) => {
  const t = ((s % CLEN) + CLEN) % CLEN;
  return (t > CSIDE && t < CSIDE + CARC) || t > 2 * CSIDE + CARC;
};
function capEdge(
  l: Capsule,
  a: number,
  b: number,
  o: number,
  move: (p: Pt) => Pt
): string {
  let d = '';
  let prev = a;
  for (const s of [...capBreaks(a, b), b]) {
    const q = move(capAt(l, s, o));
    d += capOnArc((prev + s) / 2)
      ? `A${f(CR + o)} ${f(CR + o)} 0 0 ${b > a ? 1 : 0} ${P(q)}`
      : `L${P(q)}`;
    prev = s;
  }
  return d;
}
const capMove =
  (l: Capsule, t: number) =>
  ([x, y]: Pt): Pt => [
    x + l.sign * LINK_TRAVEL * t,
    y - l.sign * LINK_TRAVEL * t,
  ];

// The gap's two cuts slide with the link through it. On a straight side the
// other link's wall moves straight along it, so the space there holds
// exactly; but a cut that slides into an arc lags the other link's straight
// drift, and the space closes (here the gap's end, sliding into the arc round
// c2). So each cut is drawn back, as Certificate's open corner is, just far
// enough that the space between the links holds its rest value. The links
// are symmetric (a half turn about (18.5, 10.5) swaps them), so both cuts of
// a kind sit at the same arc length.

/** The distance from p to a convex quad (0 inside). */
function quadDist(p: Pt, q: readonly Pt[]): number {
  const side = (a: Pt, b: Pt) =>
    (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const s = q.map((a, i) => side(a, q[(i + 1) % q.length]));
  if (s.every((v) => v >= 0) || s.every((v) => v <= 0)) {
    return 0;
  }
  return Math.min(...q.map((a, i) => segDist(p, a, q[(i + 1) % q.length])));
}
/** The distance from p to a 2px annular sector about c (centreline r CR) from angle a0 through `span` clockwise. */
function sectorDist(p: Pt, c: Pt, a0: number, span: number): number {
  let k = Math.atan2(p[1] - c[1], p[0] - c[0]) - a0;
  k -= 2 * Math.PI * Math.floor(k / (2 * Math.PI));
  if (k <= span) {
    const r = Math.hypot(p[0] - c[0], p[1] - c[1]);
    return r < CR - 1 ? CR - 1 - r : r > CR + 1 ? r - CR - 1 : 0;
  }
  const end = (a: number): [Pt, Pt] => [
    [c[0] + (CR - 1) * Math.cos(a), c[1] + (CR - 1) * Math.sin(a)],
    [c[0] + (CR + 1) * Math.cos(a), c[1] + (CR + 1) * Math.sin(a)],
  ];
  return Math.min(segDist(p, ...end(a0)), segDist(p, ...end(a0 + span)));
}
/** The distance from p to a link's band between arc lengths sa and sb (sa < sb), moved. */
function bandDist(
  p: Pt,
  l: Capsule,
  sa: number,
  sb: number,
  move: (q: Pt) => Pt
): number {
  const bounds = [0, CSIDE, CSIDE + CARC, 2 * CSIDE + CARC, CLEN];
  let d = Infinity;
  for (let k = Math.floor(sa / CLEN) - 1; k <= Math.floor(sb / CLEN) + 1; k++) {
    for (let i = 0; i < 4; i++) {
      const [a, b] = [
        Math.max(sa, k * CLEN + bounds[i]),
        Math.min(sb, k * CLEN + bounds[i + 1]),
      ];
      if (b <= a + 1e-9) {
        continue;
      }
      if (i % 2 === 0) {
        d = Math.min(
          d,
          quadDist(
            p,
            [
              capAt(l, a, 1),
              capAt(l, b, 1),
              capAt(l, b, -1),
              capAt(l, a, -1),
            ].map(move)
          )
        );
      } else {
        const c = move(i === 1 ? l.c2 : l.c1);
        const q = move(capAt(l, a, 0));
        d = Math.min(
          d,
          sectorDist(p, c, Math.atan2(q[1] - c[1], q[0] - c[0]), (b - a) / CR)
        );
      }
    }
  }
  return d;
}
/** The space between the links' ink beside a cut at arc length s: before it (side −1, a gap's start) or after it (+1, its end). */
function cutSpace(t: number, s: number, side: -1 | 1): number {
  const [l, o] = CAPSULES;
  const [ml, mo] = [capMove(l, t), capMove(o, t)];
  const [sa, sb] = side < 0 ? [s - 6, s] : [s, s + 6];
  let m = Infinity;
  const n = Math.ceil(6 / 0.05);
  for (let i = 0; i <= n; i++) {
    for (const off of [-1, 1]) {
      m = Math.min(
        m,
        bandDist(ml(capAt(l, sa + (6 * i) / n, off)), o, sa, sb, mo)
      );
    }
  }
  for (let i = 0; i <= 40; i++) {
    m = Math.min(m, bandDist(ml(capAt(l, s, -1 + i / 20)), o, sa, sb, mo));
  }
  return m;
}
const CUT_SPACE = {
  start: /* @__PURE__ */ cutSpace(0, CAPSULES[0].gap[0], -1),
  end: /* @__PURE__ */ cutSpace(0, CAPSULES[0].gap[1], 1),
};
/** The cut at t: slid with the links, then drawn back (start: toward smaller s; end: larger) as far as the space needs. */
function solveCut(t: number, slid: number, side: -1 | 1, want: number): number {
  if (t <= 0 || cutSpace(t, slid, side) >= want - 1e-9) {
    return slid;
  }
  let [near, far] = [slid, slid + 4 * side];
  for (let i = 0; i < 24; i++) {
    const mid = (near + far) / 2;
    if (cutSpace(t, mid, side) >= want) {
      far = mid;
    } else {
      near = mid;
    }
  }
  return far;
}
/** Where the gaps start and end at t. */
export function gapAt(t: number): [number, number] {
  const [s, e] = [
    CAPSULES[0].gap[0] + LINK_SLIDE * t,
    CAPSULES[0].gap[1] + LINK_SLIDE * t,
  ];
  return [
    solveCut(t, s, -1, CUT_SPACE.start),
    solveCut(t, e, 1, CUT_SPACE.end),
  ];
}

/** The link at hover progress t, moved (sign·t, −sign·t), its gap from s0 to s1; one closed band. */
export function capsulePath(
  l: Capsule,
  t: number,
  [s0, s1] = gapAt(t)
): string {
  const move = capMove(l, t);
  const [from, to] = [s1, s0 + CLEN];
  return `M${P(move(capAt(l, from, 1)))}${capEdge(l, from, to, 1, move)}L${P(move(capAt(l, to, -1)))}${capEdge(l, to, from, -1, move)}Z`;
}
/** How far the page grows on each side. */
export const COPY_PAGE_GROW = 1;
/** The page: a frame open at its upper right (its top wall a stub ending at x 8, its right wall ending at y 18), grown g a side; the ends hold. */
const copyPage = (g: number) =>
  `M${f(24 + g)} ${f(30 + g)}H${f(4 - g)}A2 2 0 0 1 ${f(2 - g)} ${f(28 + g)}V${f(8 - g)}A2 2 0 0 1 ${f(4 - g)} ${f(6 - g)}H8V${f(8 - g)}H${f(4 - g)}` +
  `V${f(28 + g)}H${f(24 + g)}V18H${f(26 + g)}V${f(28 + g)}A2 2 0 0 1 ${f(24 + g)} ${f(30 + g)}Z`;

export const CopyLinkSpec = /* @__PURE__ */ hoverIcon('CopyLink', {
  geo: ({ h }) => {
    const gap = gapAt(h);
    return {
      page: { d: copyPage(COPY_PAGE_GROW * h) },
      lower: { d: capsulePath(CAPSULES[0], h, gap) },
      upper: { d: capsulePath(CAPSULES[1], h, gap) },
    };
  },
  static: /* @__PURE__ */ carbonArt(CopyLink32),
});

// ── Model alt ────────────────────────────────────────────────────────────────
//
// Three cubes, one standing on a fourth hidden behind the two in front:
// Carbon's drawing is the top cube and the left and right cubes, sharing the
// edges where they touch. Each is drawn as Carbon's Cube is: its silhouette's
// centreline outlined 1px out (round corners r1) and each visible face's
// inside 1px in (sharp), so every edge is a 2px wall. A cube's top-face
// corners sit on an ellipse (half-axes 6 and 3) about its top face's centre,
// and its vertical edges are 7 long, so turning it about its vertical axis
// moves its corners round that ellipse (as Cube's turn, files.ts).
//
// Each cube turns 90° about its own vertical axis, landing back on
// its own drawing: the top cube first, clockwise from above (its front
// corner swings right), then the left cube anticlockwise, then the right
// cube clockwise, 30ms apart (Share's stagger, 210ms in all). Meanwhile the
// whole model grows 1px on each side: every point scales 13/12 about the
// icon's centre, walls rebuilt at 2px.
//
// Touching cubes: while a cube turns, its silhouette never crosses a
// neighbour's (a turning cube stays inside its own corners' ellipse), so the
// shared walls part. The seams they share at rest (the hidden cube's front
// edges: the V under the top cube and the vertical between the lower two)
// hold, cut away wherever a cube in front covers them, so no sliver of
// background opens at a joint; where a turning cube's wall runs less than 2px
// from a seam they read as one, briefly thicker (at most 3.8px, mid-turn).

const [CUBE_A, CUBE_B, CUBE_V] = [6, 3, 7];
/** The top-face centres: the hidden cube behind (the top cube stands on it), then the top, left and right cubes. */
const MODEL_CUBES: Record<'back' | 'top' | 'left' | 'right', Pt> = {
  back: [16, 14],
  top: [16, 7],
  left: [10, 17],
  right: [22, 17],
};
/** How much the model scales about the icon's centre: its half-width 12 → 13 (1px a side). */
export const MODEL_SCALE = 13 / 12;
const MODEL_O: Pt = [16, 16];
/** The turn (degrees), its direction per cube (+1: the front corner swings right), and the stagger: top, left, right. */
export const CUBE_TURN_DEG = 90;
const TURN_ORDER = [
  ['top', 1],
  ['left', -1],
  ['right', 1],
] as const;
const MODEL_STAGGER = /* @__PURE__ */ stagger(3);

const polyArea = (q: readonly Pt[]) =>
  q.reduce(
    (a, p, i) =>
      a + p[0] * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * p[1],
    0
  ) / 2;
/** The convex hull of points (monotone chain), clockwise on screen. */
function convexHull(pts: readonly Pt[]): Pt[] {
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], p) <= 1e-9
      ) {
        out.pop();
      }
      out.push(p);
    }
    out.pop();
    return out;
  };
  const h = [...half(sorted), ...half([...sorted].reverse())];
  return polyArea(h) < 0 ? h.reverse() : h;
}
/** A cube with its top face centred on c, turned `deg`, scaled s about the icon's centre: its silhouette and visible faces. */
export function modelCube(
  c: Pt,
  deg: number,
  s: number
): { hull: Pt[]; faces: Pt[][] } {
  const sc = ([x, y]: Pt): Pt => [
    MODEL_O[0] + s * (x - MODEL_O[0]),
    MODEL_O[1] + s * (y - MODEL_O[1]),
  ];
  const top = [0, 1, 2, 3].map((k): Pt => {
    const a = (deg + 90 * k) * DEG;
    return [c[0] + CUBE_A * Math.sin(a), c[1] + CUBE_B * Math.cos(a)];
  });
  const down = ([x, y]: Pt): Pt => [x, y + CUBE_V];
  const faces: Pt[][] = [top];
  // A side face shows while it faces the viewer (its outward normal within 90° of the front).
  for (let k = 0; k < 4; k++) {
    if (Math.cos((deg + 90 * k + 45) * DEG) > 1e-6) {
      faces.push([
        top[k],
        top[(k + 1) % 4],
        down(top[(k + 1) % 4]),
        down(top[k]),
      ]);
    }
  }
  return {
    hull: convexHull([...top, ...top.map(down)].map(sc)),
    faces: faces.map((q) => q.map(sc)),
  };
}
/** A face's inside, 1px in; none once the face is too thin to have one. */
function faceHole(q: readonly Pt[]): Pt[] | null {
  if (Math.abs(polyArea(q)) < 0.5) {
    return null;
  }
  const inner = insetPoly(q, 1);
  // A face under 2px across has no inside: its inset lines cross (the polygon flips, or runs out of the face).
  const inFace = (p: Pt) =>
    q.every((a, i) => {
      const b = q[(i + 1) % q.length];
      return (
        ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) *
          polyArea(q) >=
        -1e-9
      );
    });
  // Each inside edge runs the way its face's edge does (where the face is too thin, the short ones turn back).
  const sameWay = inner.every((p, i) => {
    const [pn, a, b] = [
      inner[(i + 1) % inner.length],
      q[i],
      q[(i + 1) % q.length],
    ];
    return (
      (pn[0] - p[0]) * (b[0] - a[0]) + (pn[1] - p[1]) * (b[1] - a[1]) > 1e-6
    );
  });
  return polyArea(inner) * polyArea(q) > 1e-3 && sameWay && inner.every(inFace)
    ? inner
    : null;
}
const cubeD = ({ hull, faces }: { hull: Pt[]; faces: Pt[][] }) =>
  roundedOutlinePath(hull, 1) +
  faces
    .map(faceHole)
    .filter((q): q is Pt[] => !!q)
    .map((q) => polyPath(q, true))
    .join('');
/** A convex polygon (the silhouette's outline) as half-planes, each n·p ≥ c inside. */
function halfPlanes(q: readonly Pt[]): HalfPlane[] {
  const sign = polyArea(q) > 0 ? 1 : -1;
  return q
    .map((a, i) => {
      const b = q[(i + 1) % q.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n: Pt = [(-sign * (b[1] - a[1])) / l, (sign * (b[0] - a[0])) / l];
      return { n, c: n[0] * a[0] + n[1] * a[1] };
    })
    .filter((hp) => Number.isFinite(hp.c));
}
/**
 * The seams the cubes share at rest (the hidden cube's top-face front edges
 * and its front vertical edge, where the cubes meet), as 2px bands, minus
 * every region a cube in front covers. At rest they lie under the cubes'
 * own walls; as a cube turns away from one, the seam holds the joint, so no
 * sliver of background opens there.
 */
function seamsD(back: { faces: Pt[][] }, front: { hull: Pt[] }[]): string {
  const [t0, t1, , t3] = back.faces[0]; // the hidden cube's top face: front, right, back, left corners
  const foot: Pt = [t0[0], t0[1] + (back.faces[1][2][1] - back.faces[1][1][1])];
  const ext = (a: Pt, b: Pt, e: number): [Pt, Pt] => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [
      a,
      [b[0] + ((b[0] - a[0]) / l) * e, b[1] + ((b[1] - a[1]) / l) * e],
    ];
  };
  const quad = ([a, b]: [Pt, Pt]): Pt[] => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    return [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ];
  };
  let pieces: Pt[][] = [
    quad(ext(t3, t0, 1)),
    quad(ext(t1, t0, 1)),
    quad([t0, foot]),
  ];
  // Cut 0.75px out from each silhouette (its outline is 1px out), so a seam tucks 0.25px under the walls it meets: no anti-aliased hairline where they abut.
  for (const cube of front) {
    const hs = halfPlanes(growPoly(cube.hull, 0.75, Math.PI / 8));
    pieces = pieces.flatMap((q) => cutPoly(q, hs));
  }
  return pieces
    .filter((q) => Math.abs(polyArea(q)) > 1e-3)
    .map((q) => polyPath(polyArea(q) < 0 ? [...q].reverse() : q, true))
    .join('');
}

/** The model at hover h: each cube's silhouette and faces (the hidden one unturned). */
export function modelArt(h: number) {
  const s = 1 + (MODEL_SCALE - 1) * ENTRANCE(Math.max(0, Math.min(1, h)));
  const deg = Object.fromEntries(
    TURN_ORDER.map(([k, dir], i) => [
      k,
      dir * CUBE_TURN_DEG * MODEL_STAGGER.at(h, i),
    ])
  );
  const cube = (k: 'top' | 'left' | 'right') =>
    modelCube(MODEL_CUBES[k], deg[k], s);
  return {
    back: modelCube(MODEL_CUBES.back, 0, s),
    top: cube('top'),
    left: cube('left'),
    right: cube('right'),
    deg,
  };
}

export const ModelAltSpec = /* @__PURE__ */ hoverIcon('ModelAlt', {
  hover: MODEL_STAGGER.hover,
  geo: ({ h }) => {
    const cubes = modelArt(h);
    return {
      seams: { d: seamsD(cubes.back, [cubes.top, cubes.left, cubes.right]) },
      top: { d: cubeD(cubes.top), ...EVENODD },
      left: { d: cubeD(cubes.left), ...EVENODD },
      right: { d: cubeD(cubes.right), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(ModelAlt32),
});

// ── Scale ────────────────────────────────────────────────────────────────────
//
// A small square (5–15 × 17–27, Carbon's frame) at the open lower-left
// corner of a large outline (9–27 × 5–23), whose left wall ends at y 13 and
// bottom wall at x 19, 4px from the square.

/** How far the square grows up and right (its lower-left corner holds), and how far the outline's ends draw back. */
export const SQUARE_GROW = 2;
export const ScaleSpec = /* @__PURE__ */ hoverIcon('Scale', {
  geo: ({ h }) => {
    const g = SQUARE_GROW * h;
    return {
      square: { d: framePath(5, 17 - g, 15 + g, 27), ...EVENODD },
      outline: {
        d: `M${f(19 + g)} 21V23H25A2 2 0 0 0 27 21V7A2 2 0 0 0 25 5H11A2 2 0 0 0 9 7V${f(13 - g)}H11V7H25V21Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Scale32),
});

// ── Sprout ───────────────────────────────────────────────────────────────────
//
// Carbon's sprout: two leaves on a stem, over the ground's arc. Each leaf is
// a 2px wall round two arcs that meet at a square tip: the right leaf's
// centrelines are circles of r 10 about (25, 13) (its upper edge) and
// (17, 5) (its lower edge), the left leaf's r 6 about (9, 13) and (13, 9);
// the leaves' upper walls meet in a crotch over the stem (x 14–16).
//
// Hover: the sprout grows 1px taller: the stem lengthens and the leaves rise on it. Each leaf also grows
// about its base (where its two centreline circles meet, by the stem), at a
// constant 2px wall (its centrelines scale, their offsets hold), so its tip
// reaches out on each axis: the big (right) leaf 2px, the small one 1px. The
// big leaf's tip reaches 3px higher (1px taller plus its own 2px). The
// ground's arc (a 2px band about (15, 35), centreline r 9) runs 1px further
// round at each end.

/** How far the leaves rise (the stem lengthens as much), and how far the small and the big leaf's tips reach on each axis. */
export const SPROUT_RISE = 1;
export const LEAF_REACH = 1;
export const BIG_LEAF_REACH = 2;
/** How far the ground's arc runs further round at each end (along its centreline, r 9 about GROUND_C). */
export const GROUND_REACH = 1;
const GROUND_C: Pt = [15, 35];
type Leaf = { up: Pt; low: Pt; r: number; base: Pt };
/** Where two circles of radius r about a and b meet, on the side of `towards`. */
function meetCircles(a: Pt, b: Pt, r: number, towards: Pt): Pt {
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const half = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
  const k = Math.sqrt(r * r - half * half) / (2 * half);
  const n: Pt = [-(b[1] - a[1]) * k, (b[0] - a[0]) * k];
  const [p, q]: Pt[] = [
    [m[0] + n[0], m[1] + n[1]],
    [m[0] - n[0], m[1] - n[1]],
  ];
  return Math.hypot(p[0] - towards[0], p[1] - towards[1]) <
    Math.hypot(q[0] - towards[0], q[1] - towards[1])
    ? p
    : q;
}
const leaf = (up: Pt, low: Pt, r: number): Leaf => ({
  up,
  low,
  r,
  base: meetCircles(up, low, r, [15, 15]),
});
const RIGHT_LEAF = leaf([25, 13], [17, 5], 10);
const LEFT_LEAF = leaf([9, 13], [13, 9], 6);
/** The leaf grown s about its base. */
const grownLeaf = ({ up, low, r, base }: Leaf, s: number): Leaf => {
  const sc = ([x, y]: Pt): Pt => [
    base[0] + s * (x - base[0]),
    base[1] + s * (y - base[1]),
  ];
  return { up: sc(up), low: sc(low), r: r * s, base };
};
/** The scale that takes a leaf's tip corner `reach` further out on each axis (its tip is r + 1 beyond its circles' centres). */
const leafScale = ({ low, r, base }: Leaf, reach: number) =>
  1 + reach / Math.abs(low[0] - base[0] + Math.sign(low[0] - base[0]) * r);
/** The two leaves at hover h, their centrelines grown, before the rise. */
export function sproutLeaves(h: number): { right: Leaf; left: Leaf } {
  return {
    right: grownLeaf(
      RIGHT_LEAF,
      1 + (leafScale(RIGHT_LEAF, BIG_LEAF_REACH) - 1) * h
    ),
    left: grownLeaf(LEFT_LEAF, 1 + (leafScale(LEFT_LEAF, LEAF_REACH) - 1) * h),
  };
}
/** The upper of the two points where circles (a, ra) and (b, rb) cross. */
function crossing(a: Pt, ra: number, b: Pt, rb: number): Pt {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const x = (d * d + ra * ra - rb * rb) / (2 * d);
  const y = Math.sqrt(Math.max(0, ra * ra - x * x));
  const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const [p, q]: Pt[] = [
    [a[0] + ux * x - uy * y, a[1] + uy * x + ux * y],
    [a[0] + ux * x + uy * y, a[1] + uy * x - ux * y],
  ];
  return p[1] < q[1] ? p : q;
}

/** Carbon's point p turned a radians round the ground's centre. */
const turnGround = ([x, y]: Pt, a: number) => {
  const [dx, dy, c, s] = [
    x - GROUND_C[0],
    y - GROUND_C[1],
    Math.cos(a),
    Math.sin(a),
  ];
  return `${f(GROUND_C[0] + dx * c - dy * s)} ${f(GROUND_C[1] + dx * s + dy * c)}`;
};
/** The ground (Carbon's arcs, from the stem's left wall round to its right), its ends run a radians further round. */
const groundD = (a: number) =>
  `A9.9229 9.9229 0 0 0 ${turnGround([7.929, 27.9287], -a)}L${turnGround([9.343, 29.3428], -a)}A8 8 0 0 1 ${turnGround([21.6516, 30.5562], a)}` +
  `L${turnGround([23.3132, 29.4434], a)}A9.98 9.98 0 0 0 16 25.062`;

export const SproutSpec = /* @__PURE__ */ hoverIcon('Sprout', {
  geo: ({ h }) => {
    const { right: R, left: L } = sproutLeaves(h);
    const rise = SPROUT_RISE * h;
    const Y = (y: number) => f(y - rise);
    const X = f;
    const [ro, ri, lo, li] = [R.r + 1, R.r - 1, L.r + 1, L.r - 1];
    const crotch = crossing(R.up, ro, L.up, lo);
    const outer =
      `M${X(R.up[0])} ${Y(R.up[1] - ro)}A${f(ro)} ${f(ro)} 0 0 0 ${X(crotch[0])} ${Y(crotch[1])}` +
      `A${f(lo)} ${f(lo)} 0 0 0 ${X(L.up[0])} ${Y(L.up[1] - lo)}L${X(L.low[0] - lo)} ${Y(L.up[1] - lo)}L${X(L.low[0] - lo)} ${Y(L.low[1])}` +
      `A${f(lo)} ${f(lo)} 0 0 0 ${X(L.low[0])} ${Y(L.low[1] + lo)}L14 ${Y(L.low[1] + lo)}L14 25.0493` +
      groundD((GROUND_REACH / 9) * h) +
      `L16 ${Y(R.low[1] + ro)}L${X(R.low[0])} ${Y(R.low[1] + ro)}A${f(ro)} ${f(ro)} 0 0 0 ${X(R.low[0] + ro)} ${Y(R.low[1])}` +
      `L${X(R.low[0] + ro)} ${Y(R.up[1] - ro)}Z`;
    const leftHole =
      `M${X(L.low[0])} ${Y(L.low[1] + li)}A${f(li)} ${f(li)} 0 0 1 ${X(L.low[0] - li)} ${Y(L.low[1])}L${X(L.low[0] - li)} ${Y(L.up[1] - li)}` +
      `L${X(L.up[0])} ${Y(L.up[1] - li)}A${f(li)} ${f(li)} 0 0 1 ${X(L.up[0] + li)} ${Y(L.up[1])}L${X(L.up[0] + li)} ${Y(L.low[1] + li)}Z`;
    const rightHole =
      `M${X(R.low[0] + ri)} ${Y(R.low[1])}A${f(ri)} ${f(ri)} 0 0 1 ${X(R.low[0])} ${Y(R.low[1] + ri)}L${X(R.up[0] - ri)} ${Y(R.low[1] + ri)}` +
      `L${X(R.up[0] - ri)} ${Y(R.up[1])}A${f(ri)} ${f(ri)} 0 0 1 ${X(R.up[0])} ${Y(R.up[1] - ri)}L${X(R.low[0] + ri)} ${Y(R.up[1] - ri)}Z`;
    return { plant: { d: outer + leftHole + rightHole } };
  },
  static: /* @__PURE__ */ carbonArt(Sprout32),
});

// ── Watson Health magnify ────────────────────────────────────────────────────
//
// A frame (2–24 × 2–23, outer corners r2) open at its lower right, where the
// magnifier sits: a lens (r 4–6 about (22, 22)) and a 2px handle along the
// diagonal to (29.29, 29.29), starting inside the lens's wall.
//
// Hover: Search's magnifier (the lens grows 1px in diameter in place, the
// handle turns 15° clockwise about its centre), and the frame grows 1px on every side (it nearly fills the frame). Its
// open ends are re-cut each frame so their space to the lens holds at 4px:
// the bottom wall's end draws back 0.5px (the lens grows toward it), the
// right wall's end 0.45px.

const MAGNIFIER = {
  c: [22, 22] as Pt,
  r: 5,
  w: 2,
  handle: [5, 7.29 * Math.SQRT2] as [number, number],
};
/** How far the frame grows on each side, and the space its open ends keep to the lens. */
export const MAGNIFY_FRAME_GROW = 1;
const MAGNIFY_SPACE = 4;
export const WatsonHealthMagnifySpec = /* @__PURE__ */ hoverIcon(
  'WatsonHealthMagnify',
  {
    geo: ({ h }) => {
      const m = magnifierAt(MAGNIFIER, h);
      const g = MAGNIFY_FRAME_GROW * h;
      const R = 6 + LENS_GROW * h + MAGNIFY_SPACE; // the lens's outer edge plus the space
      // The bottom wall (y 21–23, grown 21+g–23+g) still spans the lens's centre row, so its end is R left of it;
      // the right wall (x 22+g–24+g) has its inner edge g right of the lens's centre.
      const bottomEnd = 22 - R;
      const rightEnd = 22 - Math.sqrt(R * R - g * g);
      return {
        frame: {
          d:
            `M${f(bottomEnd)} ${f(21 + g)}H${f(4 - g)}V${f(4 - g)}H${f(22 + g)}V${f(rightEnd)}H${f(24 + g)}V${f(4 - g)}A2 2 0 0 0 ${f(22 + g)} ${f(2 - g)}` +
            `H${f(4 - g)}A2 2 0 0 0 ${f(2 - g)} ${f(4 - g)}V${f(21 + g)}A2 2 0 0 0 ${f(4 - g)} ${f(23 + g)}H${f(bottomEnd)}Z`,
        },
        lens: { d: ringPath(m.c, m.r, 2), ...EVENODD },
        handle: { d: band(m.a, m.b) },
      };
    },
    static: /* @__PURE__ */ carbonArt(WatsonHealthMagnify32),
  }
);

// ── IBM Watson Discovery ─────────────────────────────────────────────────────

/** The rows' repeat, and how far the top and bottom rows and the middle row scroll at full hover. */
export const DISCOVERY_PERIOD = 14;
export const DISCOVERY_SCROLL = { outer: 10, middle: 4 } as const;
const LENS_C: Pt = [13, 14];
/**
 * Carbon's open ring, its inner edge (r 10, from the top end round the
 * right to the bottom end) and its outer edge (r 12, back), absolute; the
 * short arc under the handle's root is added (the handle covers it).
 */
const LENS_INNER =
  'M5.8 7.2C7.6 5.1 10.2 4 13 4C18.5 4 23 8.5 23 14C23 19.5 18.5 24 13 24C10 24 7.2 22.7 5.3 20.4';
const LENS_OUTER =
  'M3.8 21.7C6 24.4 9.4 26 13 26C16.2 26 19.1 24.7 21.3 22.7A12 12 0 0 0 22.6 21.2C24.1 19.2 25 16.7 25 14C25 7.4 19.6 2 13 2C9.7 2 6.6 3.3 4.3 5.8';
/** The handle: its 2px band along Carbon's x = y, from inside the ring's wall (centreline r 11) to its square end. */
const HANDLE_IN: Pt = [21.2614, 21.2614];
const HANDLE_OUT: Pt = [29.3, 29.3];
const HANDLE_SIDE: Pt = [0.7, -0.7];
/** The open ring grown g: each edge g further from the centre, so its wall holds. */
function discoveryRing(g: number): string {
  const scale =
    (k: number) =>
    ([x, y]: Pt): Pt => [
      LENS_C[0] + (x - LENS_C[0]) * k,
      LENS_C[1] + (y - LENS_C[1]) * k,
    ];
  const [ki, ko] = [(10 + g) / 10, (12 + g) / 12];
  return (
    mapPath(LENS_INNER, scale(ki)) +
    mapPath(LENS_OUTER, scale(ko), ko).replace(/^M/, 'L') +
    'Z'
  );
}
/** The handle turned `turn`° about the lens centre and pushed g along itself (it stays in the grown ring's wall). */
function discoveryHandle(g: number, turn: number): string {
  const [c, s] = [
    Math.cos((turn * Math.PI) / 180),
    Math.sin((turn * Math.PI) / 180),
  ];
  const move = ([x, y]: Pt): Pt => {
    const [dx, dy] = [x - LENS_C[0], y - LENS_C[1]];
    return [
      LENS_C[0] + dx * c - dy * s + g * (c - s) * Math.SQRT1_2,
      LENS_C[1] + dx * s + dy * c + g * (s + c) * Math.SQRT1_2,
    ];
  };
  const side = (p: Pt, k: number): Pt => [
    p[0] + HANDLE_SIDE[0] * k,
    p[1] + HANDLE_SIDE[1] * k,
  ];
  return polyPath(
    [
      side(HANDLE_OUT, 1),
      side(HANDLE_OUT, -1),
      side(HANDLE_IN, -1),
      side(HANDLE_IN, 1),
    ].map(move),
    true
  );
}

/** A dot (r 1) at (cx, cy), cut to the rows' window x 2–14 ('' when none of it shows). */
function rowDot(cx: number, cy: number): string {
  const [a, b] = [2, 14];
  if (cx + 1 <= a || cx - 1 >= b) {
    return '';
  }
  if (cx - 1 >= a && cx + 1 <= b) {
    return `M${f(cx - 1)} ${f(cy)}A1 1 0 1 0 ${f(cx + 1)} ${f(cy)}A1 1 0 1 0 ${f(cx - 1)} ${f(cy)}Z`;
  }
  // Cut by one end: the part on the window's side, a chord and the arc round through the far side.
  const x = cx - 1 < a ? a : b;
  const k = Math.sqrt(Math.max(0, 1 - (x - cx) ** 2));
  const large = (x === a ? cx > a : cx < b) ? 1 : 0;
  const [y0, y1] = x === a ? [cy - k, cy + k] : [cy + k, cy - k];
  return `M${f(x)} ${f(y0)}A1 1 0 ${large} 1 ${f(x)} ${f(y1)}Z`;
}
/** The three rows: each its centre y, where its dot starts (the dash starts 4px on, 8px long) and its scroll at full hover. */
const DISCOVERY_ROWS: [number, number, number][] = [
  [10, 2, DISCOVERY_SCROLL.outer],
  [14, 12, DISCOVERY_SCROLL.middle],
  [18, 2, DISCOVERY_SCROLL.outer],
];
/** The rows scrolled right (each its own distance times h), cut to x 2–14. */
function discoveryRows(h: number): string {
  let d = '';
  for (const [y, dot, scroll] of DISCOVERY_ROWS) {
    const s = scroll * h;
    for (let k = -2; k <= 1; k++) {
      const x = dot + s + DISCOVERY_PERIOD * k;
      const [a, b] = [Math.max(x + 4, 2), Math.min(x + 12, 14)];
      d +=
        rowDot(x + 1, y) + (b - a > 1e-6 ? rectPath(a, y - 1, b, y + 1) : '');
    }
  }
  return d;
}
export const IbmWatsonDiscoverySpec = /* @__PURE__ */ hoverIcon(
  'IbmWatsonDiscovery',
  {
    geo: ({ h }) => ({
      lines: { d: discoveryRows(h) },
      lens: { d: discoveryRing(LENS_GROW * h) },
      handle: { d: discoveryHandle(LENS_GROW * h, HANDLE_TURN * h) },
    }),
    static: /* @__PURE__ */ carbonArt(IbmWatsonDiscovery32),
  }
);
