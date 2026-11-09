/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DocumentBlank32 from '@carbon/icons/es/document--blank/32.js';
import Application32 from '@carbon/icons/es/application/32.js';
import Workspace32 from '@carbon/icons/es/workspace/32.js';
import Cube32 from '@carbon/icons/es/cube/32.js';
import Folders32 from '@carbon/icons/es/folders/32.js';
import Task32 from '@carbon/icons/es/task/32.js';
import Book32 from '@carbon/icons/es/book/32.js';
import Certificate32 from '@carbon/icons/es/certificate/32.js';
import CopyFile32 from '@carbon/icons/es/copy--file/32.js';
import Api32 from '@carbon/icons/es/api/32.js';
import ContentView32 from '@carbon/icons/es/content-view/32.js';
import Rule32 from '@carbon/icons/es/rule/32.js';
import RuleFilled32 from '@carbon/icons/es/rule--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type Shapes,
} from '../../engine';
import {
  discFillPath,
  framePath,
  insetPoly,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  roundedOutlinePath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import type { Seg } from '../../cut';
import { filletSegs, outlineD, strokeOutline } from '../../off';
import { together } from '../../ease';
import { EVENODD, f } from '../../paint';
import { DocumentSpec } from '../operations/transfer';
import { GLYPH_GROW } from '../status/alerts';
import { SHIELD_GROW, shieldD } from './objectsA';

const CRule = /* @__PURE__ */ carbonArt(Rule32);
const CRuleFilled = /* @__PURE__ */ carbonArt(RuleFilled32);

/**
 * Files and documents on the frame engine: Document blank, Application,
 * Cube, Workspace, Folders, Task, Book, Certificate, Copy file, API, Content
 * view and Rule, plus Rule filled and the Rule ⇄ Rule filled toggle. Carbon
 * has one drawing of each for every size, so one geometry serves 16 to
 * 32px, and each rests on it.
 *
 * Every wall that changes shape is rebuilt as geometry at a constant 2px
 * (a centreline outlined 1px each side, or Carbon's points stepped out
 * whole); rigid parts move whole; solid parts (the certificate's seal) grow
 * as geometry. No masks, clip paths, transforms or stroke widths. Hover:
 * 160ms entrance ease in, 120ms exit out (the engine's standard), except
 * API (Share's, 160ms, no two-stage stagger).
 *
 *  - Document blank: Document's page motion, exactly (it is Document's page
 *    without the text lines): the page grows 2px on each side and the
 *    folded corner comes in, its fold lines stepping 2px in.
 *  - Application: the large tile grows 1px a side; the three small tiles
 *    step 1px right and down with it, so every gap holds 2px. No stagger.
 *  - Workspace: the top-left square widens 3px into the top-right
 *    rectangle (9 → 12px; it narrows 14 → 11px); the bottom-left rectangle
 *    grows 3px into the lower-right square. Gaps and walls hold 2px.
 *  - Cube: turns 20° about its vertical axis, as a solid turned in the
 *    hand: its front edge swings 4.1px right, the left face widens and the
 *    right face narrows, the top face follows. Every edge is the cube's
 *    centreline (an orthographic projection of the turned cube) outlined at
 *    2px, so nothing thickens.
 *  - Folders: the front folder grows 1px on every edge and moves 2px down;
 *    the back folder rises 2px and shows 3px of its side walls, cut 3px
 *    above the front folder, so the space between them holds at 3px.
 *  - Task: the board grows 2px on each side (as Document's page and
 *    Calculator's case); the clip rides up 2px with the top edge, its width
 *    held; the check grows 12% about its centre at constant weight (the
 *    glyph rule, as Security's check).
 *  - Book: Notebook's motion. The cover grows 1px on every side (it fills
 *    the frame's width) and the spine holds, so each page widens 1px; the
 *    lines on each page reach 1px outward with it, so their 2px margins to
 *    the cover hold.
 *  - Certificate: the seal grows 33% about its centre (a solid star); the
 *    certificate's open corner draws back so the space to it holds; the
 *    text lines reach 2px right.
 *  - Copy file: the back page's corner moves 1px down and right and its
 *    arms end on the front page's fold lines as they move; the front page takes Document's motion at 1px (grows
 *    1px a side, fold lines 2px in).
 *  - API: Share's motion; the hub grows 2px in radius, then the endpoints
 *    1px, 30ms later. The links hold.
 *  - Content view: the window grows 1px on every side (it nearly fills the
 *    frame; the title bar rides up with the top edge, its height held), and
 *    the eye opens as View's does: 1px top and bottom (a vertical stretch
 *    of the lens about its middle), the iris growing 1px in radius with it
 *    so the lids hold 2px, the pupil 0.5px. The gaps to the window hold 2px.
 *  - Rule (and Rule filled): Security's shield motion (the same shield):
 *    2px wider (its centreline scaled 24/22 about the icon's centre); the
 *    two bars reach 1px at each end (the line rule).
 *
 * Rule ⇄ Rule filled: the house disc fill (§7.7) via `fillThenClear`: one
 * disc grows from the shield's area centroid, clipped to the shield, in
 * 160ms on the entrance ease; to empty, a hole grows from the same centre in
 * 120ms on the exit ease. The bars share the fill's even-odd path, so as the
 * fill passes them they become Carbon's knockouts, which are 1px longer at
 * each end than the outline's bars: the bars reach 1px each end as the fill
 * comes in (as Thumbs' walls part with the fill).
 *
 * Not built: none of these is a badge icon (base + inset mark). Task's
 * check sits inside the board and Certificate's seal is the certificate's
 * own seal, not a status mark; both are part of the object.
 */

const DEG = Math.PI / 180;
const L = (a: Pt, b: Pt): Seg => ({ k: 'L', a, b });
const circleD = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
const loopD = (pts: readonly Pt[]) =>
  pts.length > 2 ? polyPath(pts, true) : '';

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

// ── Document blank ───────────────────────────────────────────────────────────

/** Document blank: Document's page without its lines, with Document's motion. */
export const DocumentBlankSpec = /* @__PURE__ */ hoverIcon('DocumentBlank', {
  geo: ({ h }) => ({ page: DocumentSpec.geo({ h }).page }),
  static: /* @__PURE__ */ carbonArt(DocumentBlank32),
});

// ── Application and Workspace ────────────────────────────────────────────────
//
// Tiles: Carbon's frames (outer corners r2, square inside, 2px walls) with
// 2px gaps between them. Each tile is drawn from its four edges, and the
// hover moves edges: a tile grows where an edge moves out, and gives way
// where a neighbour's growth pushes its edge in, so the 2px gaps hold.

type Box = readonly [number, number, number, number];
/** A tile's edges at hover h: its rest box plus each edge's full-hover move, by h. */
const tileAt = (
  [x0, y0, x1, y1]: Box,
  [dx0, dy0, dx1, dy1]: Box,
  h: number
) => ({
  d: framePath(x0 + dx0 * h, y0 + dy0 * h, x1 + dx1 * h, y1 + dy1 * h),
  ...EVENODD,
});

/**
 * Application:
 * the large tile grows 1px a side (14 → 16px); the three small tiles hold
 * their size and step 1px right and down together, so every 2px gap and
 * every alignment (the right tile's bottom and the lower tile's right edge
 * with the large tile's) holds. No stagger.
 */
export const APP_GROW = 1;
const APP_TILES: Record<string, [Box, Box]> = {
  main: [
    [4, 4, 18, 18],
    [-1, -1, 1, 1],
  ],
  right: [
    [20, 10, 28, 18],
    [1, 1, 1, 1],
  ],
  below: [
    [10, 20, 18, 28],
    [1, 1, 1, 1],
  ],
  corner: [
    [20, 20, 28, 28],
    [1, 1, 1, 1],
  ],
};
export const ApplicationSpec = /* @__PURE__ */ hoverIcon('Application', {
  geo: ({ h }) =>
    Object.fromEntries(
      Object.entries(APP_TILES).map(([k, [box, move]]) => [
        k,
        tileAt(box, move, APP_GROW * h),
      ])
    ),
  static: /* @__PURE__ */ carbonArt(Application32),
});

/**
 * Workspace: the top-left square widens 3px into the top-right
 * rectangle (9 → 12px), and their shared
 * gap moves 3px right, so the top-right rectangle narrows 3px (14 → 11px).
 * The bottom-left rectangle grows 3px right into the lower-right square
 *, which narrows 3px (9 → 6px) to keep the
 * gap. Both rows' gaps move 3px; gaps hold 2px, walls 2px.
 */
export const WORKSPACE_SWAP = 3;
export const WORKSPACE_GROW = 3;
const WORKSPACE_TILES: Record<string, [Box, Box]> = {
  above: [
    [4, 4, 13, 13],
    [0, 0, WORKSPACE_SWAP, 0],
  ],
  corner: [
    [15, 4, 29, 13],
    [WORKSPACE_SWAP, 0, 0, 0],
  ],
  main: [
    [4, 15, 18, 27],
    [0, 0, WORKSPACE_GROW, 0],
  ],
  right: [
    [20, 15, 29, 24],
    [WORKSPACE_GROW, 0, 0, 0],
  ],
};
export const WorkspaceSpec = /* @__PURE__ */ hoverIcon('Workspace', {
  geo: ({ h }) =>
    Object.fromEntries(
      Object.entries(WORKSPACE_TILES).map(([k, [box, move]]) => [
        k,
        tileAt(box, move, h),
      ])
    ),
  static: /* @__PURE__ */ carbonArt(Workspace32),
});

// ── Cube ─────────────────────────────────────────────────────────────────────
//
// Carbon's cube is an isometric-style drawing of a cube's centreline: its
// top corners at (16, 2) behind, (28, 9) right, (16, 16) in front and
// (4, 9) left, its vertical edges 14 long. The outline is the silhouette
// hexagon 1px out (round outer corners r1, as Carbon's), and each visible
// face's inside is the face 1px in (sharp), so every edge is a 2px wall.
//
// Hover: the cube turns about its vertical axis. A top corner at angle φ
// round the axis (φ = 0 in front) sits at x = 16 + 12 sin φ, y = 9 + 7 cos φ;
// turning adds to every φ. The silhouette and the three faces are rebuilt
// from the turned corners each frame.

/** How far the cube turns on hover (degrees; its front edge swings right). */
export const CUBE_TURN = 20;

/** The cube's centreline turned `deg`: the silhouette hexagon and the visible faces (top, left, right). */
export function cubeArt(deg: number): { hex: Pt[]; faces: Pt[][] } {
  const top = (k: number): Pt => {
    const phi = (deg + 90 * k) * DEG;
    return [16 + 12 * Math.sin(phi), 9 + 7 * Math.cos(phi)];
  };
  const [front, right, back, left] = [0, 1, 2, 3].map(top);
  const down = ([x, y]: Pt): Pt => [x, y + 14];
  return {
    hex: [back, right, down(right), down(front), down(left), left],
    faces: [
      [back, right, front, left],
      [left, front, down(front), down(left)],
      [front, right, down(right), down(front)],
    ],
  };
}

export const CubeSpec = /* @__PURE__ */ hoverIcon('Cube', {
  geo: ({ h }) => {
    const { hex, faces } = cubeArt(CUBE_TURN * h);
    return {
      cube: {
        d:
          roundedOutlinePath(hex, 1) +
          faces.map((q) => loopD(insetPoly(q, 1))).join(''),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Cube32),
});

// ── Folders ──────────────────────────────────────────────────────────────────
//
// Two folders, each a 2px centreline. The front one is closed: its tab (top
// y 10) steps down a 3:4 diagonal to its top edge (y 13); corners filleted
// r1 (outer r2), the diagonal's foot sharp both sides, as Carbon draws it.
// Behind it, the back folder shows as one open band (butt ends at x 6 and
// 28) along the same step, 3px above.
//
// Hover: the folders part vertically and the back folder shows its sides.
// The front folder grows 1px out on every edge (its diagonal 1px out along
// its normal, sliding its corners 1/3px right) and moves 2px down: its top
// edges drop 1px, its bottom 3px. The back folder rises 2px. It is a folder
// too: its band turns down at each end into a side wall (left wall centred
// at x 7, flush against the front's left wall; right wall over the front's
// right wall), and each wall is cut square 3px above the front folder's top,
// so the space between the folders holds at 3px throughout. At rest the
// walls end inside the band and its corners are square (Carbon's butt ends);
// on hover the corners round to the front folder's (r1 on the centreline,
// outer r2) and 3px of each wall shows. The walls step 1px out with the
// front's sides. The back's diagonal moves 1.33px right, so it stays
// parallel to the front's and as far from it as the flats are.

/** How far the front folder grows on each side, how far it moves down, and how far the back folder rises. */
export const FOLDERS_GROW = 1;
export const FRONT_DROP = 2;
export const BACK_RISE = 2;
/** The space between the folders (Carbon's), where the back folder's walls are cut. */
export const FOLDERS_GAP = 3;
/** How far the tab's 3:4 diagonal slides right per px it moves out along its normal. */
const DIAGONAL_SLIDE = 1 / 3;

/** Folders' centrelines at hover h: the front folder (closed) and the back folder (open: its band and side walls). */
export function foldersArt(h: number): { front: Seg[]; back: Seg[] } {
  const [g, dn, up] = [FOLDERS_GROW * h, FRONT_DROP * h, BACK_RISE * h];
  const s = g * DIAGONAL_SLIDE;
  // The flats part by `open`; the back's diagonal moves along the normal (0.6, −0.8) by the front
  // diagonal's own move plus `open`, so the diagonals part as much (the back shifts right).
  const open = up + dn - g;
  const frontOut = g - 0.8 * dn;
  const backRight = (frontOut + open - 0.8 * up) / 0.6;
  // The front's tab top and top edge (outer), and the back's walls cut FOLDERS_GAP above them.
  const [tabTop, edgeTop] = [9 - g + dn, 12 - g + dn];
  return {
    front: filletSegs(
      [
        [5 - g, 10 - g + dn],
        [12 + s, 10 - g + dn],
        [16 + s, 13 - g + dn],
        [27 + g, 13 - g + dn],
        [27 + g, 27 + g + dn],
        [5 - g, 27 + g + dn],
      ],
      [1, 1, 0, 1, 1, 1],
      true
    ),
    back: filletSegs(
      [
        [7 - g, tabTop - FOLDERS_GAP],
        [7 - g, 5 - up],
        [14 + backRight, 5 - up],
        [18 + backRight, 8 - up],
        [27 + g, 8 - up],
        [27 + g, edgeTop - FOLDERS_GAP],
      ],
      [0, h, 1, 0, h, 0]
    ),
  };
}

export const FoldersSpec = /* @__PURE__ */ hoverIcon('Folders', {
  geo: ({ h }) => {
    const { front, back } = foldersArt(h);
    const [a, b] = strokeOutline(front, 2).loops!;
    return {
      front: { d: loopD(a) + loopD(b), ...EVENODD },
      back: { d: outlineD(back) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Folders32),
});

// ── Task ─────────────────────────────────────────────────────────────────────
//
// The board (5–27 × 5–30, outer corners r2) with its clip (10–22 × 2–10,
// a 4px slot) over the top wall, one path; and the check, a 2px centreline
// mitred at its elbow.

const TASK_BOARD =
  'M25 5H22V4A2 2 0 0 0 20 2H12A2 2 0 0 0 10 4V5H7A2 2 0 0 0 5 7V28A2 2 0 0 0 7 30H25A2 2 0 0 0 27 28V7A2 2 0 0 0 25 5Z' +
  'M12 4H20V8H12Z' +
  'M25 28H7V7H10V10H22V7H25Z';
const TASK_CHECK: Pt[] = [
  [9.705, 17.295],
  [14, 21.59],
  [22.295, 13.29],
];
/** The check's visual centre (the middle of its outline's bounds). */
const TASK_CHECK_CENTRE: Pt = [16, 17.79];
/** How far the board grows on each side. */
export const BOARD_GROW = 2;

export const TaskSpec = /* @__PURE__ */ hoverIcon('Task', {
  geo: ({ h }) => {
    const g = BOARD_GROW * h;
    const [a, elbow, b] = scalePts(
      TASK_CHECK,
      TASK_CHECK_CENTRE,
      1 + GLYPH_GROW * h
    );
    return {
      // The walls step out; the clip (x 10–22) rides up with the top edge, rigid.
      board: {
        d: mapPath(TASK_BOARD, ([x, y]) => [
          x + (x < 8 ? -g : x > 24 ? g : 0),
          y + (y < 16 ? -g : g),
        ]),
      },
      check: { d: outlineD([L(a, elbow), L(elbow, b)]) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Task32),
});

// ── Book ─────────────────────────────────────────────────────────────────────
//
// Notebook's cover (the spine is the wall between the pages, x 15–17) with
// three lines on each page (left x 6–13, right x 19–26; y 10, 15, 20).

const BOOK =
  'M28 5H4A2.002 2.002 0 0 0 2 7V25A2.002 2.002 0 0 0 4 27H28A2.002 2.002 0 0 0 30 25V7A2.002 2.002 0 0 0 28 5Z' +
  'M4 7H15V25H4Z' +
  'M17 25V7H28V25Z';
/** How far the cover grows on each side (it fills the frame's width, so 1px, as Notebook). */
export const BOOK_GROW = 1;

export const BookSpec = /* @__PURE__ */ hoverIcon('Book', {
  geo: ({ h }) => {
    const g = BOOK_GROW * h;
    return {
      cover: {
        d: mapPath(BOOK, ([x, y]) => [
          x + (x < 15 ? -g : x > 17 ? g : 0),
          y + (y < 16 ? -g : g),
        ]),
        ...EVENODD,
      },
      lines: {
        d: [10, 15, 20]
          .map(
            (y) =>
              rectPath(6 - g, y, 13, y + 2) + rectPath(19, y, 26 + g, y + 2)
          )
          .join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Book32),
});

// ── Certificate ──────────────────────────────────────────────────────────────
//
// The certificate (2–30 × 4–28, outer corners r2) open at its lower right,
// where its seal sits: a solid five-point star. Three text lines.
//
// Hover: the seal
// grows 33% about its area centroid; the certificate's open corner draws
// back as it grows, as Event's calendar does for its star: the right wall's
// end draws up and the bottom wall's end draws left along their walls by
// just enough that the narrowest space from each to the seal holds at its
// rest value. The text lines reach 2px right, toward the seal (their left ends hold their 2px
// to the certificate's wall, and the seal's side has room).

const certFrame = (dr: number, db: number) =>
  `M${f(16 - db)} 26H4V6H28V${f(16 - dr)}H30V6A2 2 0 0 0 28 4H4A2 2 0 0 0 2 6V26A2 2 0 0 0 4 28H${f(16 - db)}Z`;
/** How far the text lines reach right on hover. */
export const CERT_LINE_REACH = 2;
const certLines = (e: number) =>
  rectPath(6, 16, 12 + e, 18) +
  rectPath(6, 12, 16 + e, 14) +
  rectPath(6, 8, 16 + e, 10);
const SEAL: Pt[] = [
  [24, 17],
  [25.912, 20.703],
  [30, 21.297],
  [27, 24],
  [27.771, 28],
  [24, 25.75],
  [20.229, 28],
  [21, 24],
  [18, 21.297],
  [22.2, 20.703],
];
/** The seal's centre (its area centroid), which it grows about. */
export const SEAL_CENTRE = /* @__PURE__ */ areaCentroid(SEAL);
/** How much the seal grows on hover. */
export const SEAL_GROW = 0.33;
export const sealAt = (h: number) =>
  scalePts(SEAL, SEAL_CENTRE, 1 + SEAL_GROW * h);

/** The distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
/** The narrowest space between two non-overlapping polygons. */
function polyGap(a: readonly Pt[], b: readonly Pt[]): number {
  let m = Infinity;
  const edges = (q: readonly Pt[]) =>
    q.map((p, i) => [p, q[(i + 1) % q.length]] as const);
  for (const [p, q] of edges(b)) {
    for (const v of a) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  for (const [p, q] of edges(a)) {
    for (const v of b) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  return m;
}
/** The open ends' stubs (the right wall from y 6 down, the bottom wall from x 4 right), drawn back by d. */
const rightEnd = (d: number): Pt[] => [
  [28, 6],
  [30, 6],
  [30, 16 - d],
  [28, 16 - d],
];
const bottomEnd = (d: number): Pt[] => [
  [4, 26],
  [16 - d, 26],
  [16 - d, 28],
  [4, 28],
];
/** The least draw-back (0–6) that keeps `gapAt(d)` at `want` (bisection; the gap grows with d). */
function drawBack(gapAt: (d: number) => number, want: number): number {
  if (gapAt(0) >= want - 1e-9) {
    return 0;
  }
  let [lo, hi] = [0, 6];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}
const SEAL_GAP = {
  right: /* @__PURE__ */ polyGap(SEAL, /* @__PURE__ */ rightEnd(0)),
  bottom: /* @__PURE__ */ polyGap(SEAL, /* @__PURE__ */ bottomEnd(0)),
};

/** How far the certificate's open ends draw back at hover h: [right wall up, bottom wall left]. */
export function certDrawBack(h: number): [number, number] {
  if (h <= 0) {
    return [0, 0];
  }
  const seal = sealAt(h);
  return [
    drawBack((d) => polyGap(seal, rightEnd(d)), SEAL_GAP.right),
    drawBack((d) => polyGap(seal, bottomEnd(d)), SEAL_GAP.bottom),
  ];
}

export const CertificateSpec = /* @__PURE__ */ hoverIcon('Certificate', {
  geo: ({ h }) => {
    const [dr, db] = certDrawBack(h);
    return {
      frame: { d: certFrame(dr, db) },
      lines: { d: certLines(CERT_LINE_REACH * h) },
      seal: { d: polyPath(sealAt(h), true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Certificate32),
});

// ── Copy file ────────────────────────────────────────────────────────────────
//
// Copy's pages: the back page's corner (an L, outer corner r2, 2px arms) and
// the front page, a document with its folded corner.
//
// Hover: the back
// page's corner moves 1px down and right (Copy's draw-together). Its arms
// end on the front page's folded corner, as Carbon draws them at rest (the
// top arm's end level with the fold's vertical line's right edge, the side
// arm's with its horizontal line's bottom edge), and follow it: the top arm's end moves 2px left
// (x 20 → 18, the arm 16 → 13px long) and the side arm's 2px down (y 18 →
// 20, 16 → 17px). The front page is a document, so it
// takes Document's page motion at 1px: it grows 1px on each side (18×22 →
// 20×24) and its fold comes in, its fold lines stepping 2px in (the fold's
// legs 8 → 11) while its walls keep 2px. The gaps between the pages 4 → 2px.

const COPY_FRONT =
  'M27.4 14.7L21.3 8.6C21 8.2 20.5 8 20 8H12C10.9 8 10 8.9 10 10V28C10 29.1 10.9 30 12 30H26C27.1 30 28 29.1 28 28V16.1C28 15.6 27.8 15.1 27.4 14.7Z' +
  'M20 10L25.9 16H20V10Z' +
  'M12 28V10H18V16C18 17.1 18.9 18 20 18H26L26 28H12Z';
/** How far the back page's corner moves (down and right). */
export const BACK_DRAW = 1;
/** How far the front page grows on each side, and how far its fold lines step in. */
export const FRONT_GROW = 1;
export const FRONT_FOLD = 2;
// As Document's page: the points on the fold's vertical line (and the top edge's end at the diagonal) move
// left by the fold, those on its horizontal line (and the right edge's end) down; the rest step out.
const copyFoldLeft = (x: number, y: number) => x > 14 && x < 21.5 && y < 19;
const copyFoldDown = (x: number, y: number) => x > 17 && y > 14 && y < 19;

export const CopyFileSpec = /* @__PURE__ */ hoverIcon('CopyFile', {
  geo: ({ h }) => {
    const m = BACK_DRAW * h;
    const [x0, y0] = [4 + m, 2 + m];
    const g = FRONT_GROW * h;
    const k = (FRONT_GROW + FRONT_FOLD) * h; // the fold lines move with the page's corner, then come in
    // The arms end on the fold's lines: the vertical line's right edge (x 20) and the horizontal line's bottom (y 18), as they move.
    const [top, side] = [20 + g - k, 18 - g + k];
    return {
      back: {
        d: `M${f(x0 + 2)} ${f(side)}H${f(x0)}V${f(y0 + 2)}A2 2 0 0 1 ${f(x0 + 2)} ${f(y0)}H${f(top)}V${f(y0 + 2)}H${f(x0 + 2)}Z`,
      },
      front: {
        d: mapPath(COPY_FRONT, ([x, y]) => [
          x + (x > 14 ? g : -g) - (copyFoldLeft(x, y) ? k : 0),
          y + (y < 19 ? -g : g) + (copyFoldDown(x, y) ? k : 0),
        ]),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(CopyFile32),
});

// ── API ──────────────────────────────────────────────────────────────────────
//
// A hub (ring r 4–6 about the centre) linked along the diagonals to four
// endpoints (rings r 2–4 about (6, 6), (26, 6), (6, 26), (26, 26)) by 2px
// bars. Each link is a bar along its diagonal, tucked from the hub's
// centreline (which moves out as it grows) to 3.5 from its endpoint's
// centre: inside both rings' walls at rest and grown, so it always ends in
// ink and never pokes into a ring's hole.
//
// Hover (Share's): the
// hub grows 2px in radius (r 4–6 → 6–8), then the four endpoints 1px
// (r 2–4 → 3–5) together, 30ms later. The links hold; the visible length of
// each, between the rings, goes 4.14 → 1.14px.

const HUB: Pt = [16, 16];
const ENDS: Pt[] = [
  [6, 6],
  [26, 6],
  [6, 26],
  [26, 26],
];
/** How far the hub and each endpoint grow in radius. */
export const HUB_GROW = 2;
export const NODE_GROW = 1;
const NODE_STAGGER = /* @__PURE__ */ together(); // the hub and the four endpoints together (no stagger)
const END_TUCK = 3.5;
function link(c: Pt, hubTuck: number): string {
  const l = Math.hypot(c[0] - HUB[0], c[1] - HUB[1]);
  const u: Pt = [(c[0] - HUB[0]) / l, (c[1] - HUB[1]) / l];
  const n: Pt = [-u[1], u[0]];
  const [a, b]: Pt[] = [
    [HUB[0] + u[0] * hubTuck, HUB[1] + u[1] * hubTuck],
    [c[0] - u[0] * END_TUCK, c[1] - u[1] * END_TUCK],
  ];
  return polyPath(
    [
      [a[0] + n[0], a[1] + n[1]],
      [b[0] + n[0], b[1] + n[1]],
      [b[0] - n[0], b[1] - n[1]],
      [a[0] - n[0], a[1] - n[1]],
    ],
    true
  );
}

export const ApiSpec = /* @__PURE__ */ hoverIcon('Api', {
  hover: NODE_STAGGER.hover,
  geo: ({ h }) => {
    const hub = 5 + HUB_GROW * NODE_STAGGER.at(h, 0);
    const ends = 3 + NODE_GROW * NODE_STAGGER.at(h, 1);
    return {
      links: { d: ENDS.map((c) => link(c, hub)).join('') },
      hub: { d: ringPath(HUB, hub, 2), ...EVENODD },
      ends: { d: ENDS.map((c) => ringPath(c, ends, 2)).join(''), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Api32),
});

// ── Content view ─────────────────────────────────────────────────────────────
//
// A window (3–29 square, outer corners r2) with a title bar (a 4px band
// under its top edge, then a 2px wall) and an eye: a solid lens (two arcs
// of r 8.64 above and two below, meeting at short flats at x 8 and 24)
// with its iris knocked out (r 4) round a pupil (r 2), all about (16, 19).

/** How far the window grows on each side (it nearly fills the frame: 1px). */
export const CV_GROW = 1;
/** How far the eye opens at its top and bottom, and how much the pupil grows in radius. */
export const EYE_OPEN = 1;
export const PUPIL_GROW = 0.5;
const EYE_C: Pt = [16, 19];
const hole = (x0: number, y0: number, x1: number, y1: number) =>
  `M${f(x0)} ${f(y0)}V${f(y1)}H${f(x1)}V${f(y0)}Z`; // anticlockwise
/** The lens stretched vertically by k about its middle (y 19): its arcs become ellipses of the same width. */
function lens(k: number): string {
  const y = (d: number) => f(19 + d * k);
  const r = `8.64 ${f(8.64 * k)} 0 0 0`;
  return `M23.7769 ${y(-0.5215)}A${r} 16 ${y(-6)}A${r} 8.2231 ${y(-0.5215)}L8 19L8.2231 ${y(0.5215)}A${r} 16 ${y(6)}A${r} 23.7769 ${y(0.5215)}L24 19Z`;
}

export const ContentViewSpec = /* @__PURE__ */ hoverIcon('ContentView', {
  geo: ({ h }) => {
    const g = CV_GROW * h;
    const open = EYE_OPEN * h;
    return {
      window: {
        d:
          roundedRectPath(3 - g, 3 - g, 29 + g, 29 + g) +
          hole(5 - g, 5 - g, 27 + g, 9 - g) +
          hole(5 - g, 11 - g, 27 + g, 27 + g),
        ...EVENODD,
      },
      // The lens opens 1px top and bottom; the iris grows with it, so the lids hold 2px.
      eye: { d: lens((6 + open) / 6) + circleD(EYE_C, 4 + open), ...EVENODD },
      pupil: { d: circleD(EYE_C, 2 + PUPIL_GROW * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ContentView32),
});

// ── Rule, Rule filled and the toggle ─────────────────────────────────────────
//
// The shield is Security's (Carbon draws them identically), from objectsA's
// shieldD: a 2px wall about its centreline, scaled about the icon's centre.
// The bars are 2px tall at y 10 and 16: x 10–22 in the outline drawing, and
// knocked out of the filled shield at x 9–23.

/** How far each bar reaches at each end on hover, and as the fill comes in. */
export const BAR_REACH = 1;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * The convex hull of points (monotone chain). The shield's outer edge is
 * convex, but sampling it from rounded path data leaves near-duplicate
 * points whose tiny edges point anywhere; as clip edges they would cut the
 * fill. Its hull is the same outline without them.
 */
function hull(pts: readonly Pt[]): Pt[] {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
  return [...half(s), ...half([...s].reverse())];
}

/** Rule at hover h, fill p and emptying e (0 0 is the outline, 1 0 the filled drawing). */
export function ruleShapes(h: number, p: number, e: number): Shapes {
  const s = 1 + (SHIELD_GROW - 1) * h;
  const shield = shieldD(s);
  // The fill is clipped to the shield's outer edge (convex), so it meets the wall with no seam.
  const outer = hull(
    pathPoints(shield.slice(0, shield.indexOf('Z') + 1), 0.25)
  );
  const k = clamp01(p - e);
  const x0 = 10 - BAR_REACH * (h + k);
  const x1 = 22 + BAR_REACH * (h + k);
  return {
    shield: { d: shield, ...EVENODD },
    fill: {
      d:
        discFillPath(outer, areaCentroid(outer), p, e) +
        rectPath(x0, 10, x1, 12) +
        rectPath(x0, 16, x1, 18),
      ...EVENODD,
    },
  };
}

export const RuleSpec = /* @__PURE__ */ hoverIcon('Rule', {
  geo: ({ h }) => ruleShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(Rule32),
});
export const RuleFilledSpec = /* @__PURE__ */ hoverIcon('RuleFilled', {
  geo: ({ h }) => ruleShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(RuleFilled32),
});
/** Rule ⇄ Rule filled; `toggled` shows Rule filled. */
export const RuleToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'RuleToggle',
  {
    states: ['off', 'on'],
    statics: [CRule, CRuleFilled],
    geo: ({ h, p, e }) => ruleShapes(h, p, e),
    change: fillThenClear,
  }
);
