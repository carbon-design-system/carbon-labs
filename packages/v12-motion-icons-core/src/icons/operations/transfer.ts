/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Download16 from '@carbon/icons/es/download/16.js';
import Download32 from '@carbon/icons/es/download/32.js';
import Upload16 from '@carbon/icons/es/upload/16.js';
import Upload32 from '@carbon/icons/es/upload/32.js';
import Export16 from '@carbon/icons/es/export/16.js';
import Export32 from '@carbon/icons/es/export/32.js';
import ImportExport32 from '@carbon/icons/es/import-export/32.js';
import Share32 from '@carbon/icons/es/share/32.js';
import Document32 from '@carbon/icons/es/document/32.js';
import DocumentImport32 from '@carbon/icons/es/document--import/32.js';
import DocumentExport32 from '@carbon/icons/es/document--export/32.js';
import CloudUpload32 from '@carbon/icons/es/cloud--upload/32.js';
import CloudDownload32 from '@carbon/icons/es/cloud--download/32.js';
import { defineAction, hoverIcon, carbonArt } from '../../engine';
import { mapPath, ringPath, type Pt } from '../../geometry';
import {
  boxWith,
  cutTo,
  cutToBox,
  movePathBy,
  outAndBack,
  phase,
} from '../../actionGeo';
import { motionTokens } from '../../tokens';
import { STANDARD, together } from '../../ease';
import { EVENODD, f } from '../../paint';
import { cloud, CLOUD_K } from './cloudShape';

/**
 * Transfer icons on the frame engine: Download, Upload, Export, Import
 * export, Share, Document, Document import / export and Cloud upload /
 * download. Every shape is Carbon's own outline at rest (Download, Upload
 * and Export use Carbon's 16px drawings at 16px). On hover the moving parts
 * move as geometry, at constant line weight, with no masks. 160ms entrance
 * ease in, 120ms exit out (Share: a two-stage stagger, 180ms).
 *
 * Every arrow here sits on a glyph (a tray, a page, a cloud) or is one of a
 * pair, so it reaches 2px (the set-wide reach). The head moves rigidly along
 * the arrow and the shaft lengthens behind it; the tail end holds.
 *
 *  - Download / Upload: the arrow reaches 2px toward the tray, and the tray
 *    widens 2px on each side (its walls step out; arms and base keep their
 *    2px weight and length), as a container grows.
 *  - Export: the arrow reaches 2px up, away from the tray, and the tray
 *    narrows 2px on each side (its walls step in).
 *  - Import export: each arrow reaches 2px (down into the tray, and up out
 *    of it); the tray holds.
 *  - Share: the nodes grow 1px in radius in place, as Flow's do: the
 *    source node (left) first, then both shared nodes together, 30ms later.
 *    The links hold, their ends tucked inside the ring walls at rest and
 *    grown, so they stay attached and never poke into a node.
 *  - Document: the page grows 2px on each side (the set-wide container
 *    rule; 20×28 → 24×32, exactly the frame) and the folded corner comes
 *    4px further in: its legs grow from 8 to 12, so its fold lines step 2px
 *    in (x 16 → 14, y 12 → 14 at their inside edges) while the page's
 *    corner moves 2px out. The two text lines ride down 2px with the page's
 *    bottom and reach 1px at each end, so the room above them (to the fold)
 *    and below them (to the bottom edge) stays 4px, as at rest.
 *  - Document import / export: the arrow reaches 2px in (left) / out
 *    (right) through the page's open edge; the page holds (as Launch's
 *    frame does).
 *  - Cloud upload / download: the arrow reaches 2px up / down, and the
 *    cloud grows / shrinks with it: its centrelines scale 1/13 about the
 *    middle of its base (16, 21), rebuilt at a constant 2px wall, so its
 *    sides move 1px and its top 1.38px while its base holds. Its open ends
 *    are cut at x = 9 and 23 at every frame (re-cut, not scaled), so the
 *    space between them and the shaft holds at 6px, and the stubs stay
 *    where they rest. (Growing each wall's radius 1px about its own centre
 *    would change the lobes' proportions.)
 *
 * Not built: Document download. It is Carbon's document--blank with its
 * lower-right corner cut away for an arrow, the same construction as
 * document--add and document--tasks: a base icon with an inset mark, which
 * the set skips.
 */

const REACH = 2; // an arrow on a glyph, or one of a pair
const TRAY = 2; // a tray's walls step out (or in) this far on each side

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const polyD = (pts: readonly Pt[]) => `M${pts.map(P).join('L')}Z`;

/**
 * An arrow outline (Carbon's points) reaching `d` along `dir`: every point
 * moves except the two at the tail end of the shaft (where `tail` says), so
 * the head moves rigidly and the shaft lengthens behind it.
 */
const reach = (
  pts: readonly Pt[],
  tail: (p: Pt) => boolean,
  [dx, dy]: Pt,
  d: number
) =>
  polyD(pts.map((p) => (tail(p) ? p : ([p[0] + dx * d, p[1] + dy * d] as Pt))));

const DOWN: Pt = [0, 1];
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];
const RIGHT: Pt = [1, 0];

// ── Trays ────────────────────────────────────────────────────────────────────

/**
 * The bottom tray from x0 to x1 (outer edges): 2px arms rising to y 24, a
 * 2px base from 28 to 30, outer corners r2 (or, `small`, Carbon's 16px
 * cubic corners).
 */
function trayDown(x0: number, x1: number, small = false): string {
  const [a, b, c, d] = [f(x0), f(x0 + 2), f(x1 - 2), f(x1)];
  const left = small
    ? `C${a} 29.2 ${f(x0 + 0.8)} 30 ${b} 30`
    : `A2 2 0 0 0 ${b} 30`;
  const right = small
    ? `C${f(x1 - 0.8)} 30 ${d} 29.2 ${d} 28`
    : `A2 2 0 0 0 ${d} 28`;
  return `M${c} 24V28H${b}V24H${a}V28${left}H${c}${right}V24Z`;
}
/** Upload's tray, at the top, from x0 to x1: 2px arms falling to y 8, the base from 2 to 4. */
function trayUp(x0: number, x1: number, small = false): string {
  const [a, b, c, d] = [f(x0), f(x0 + 2), f(x1 - 2), f(x1)];
  const right = small
    ? `C${d} 2.8 ${f(x1 - 0.8)} 2 ${c} 2`
    : `A2 2 0 0 0 ${c} 2`;
  const left = small
    ? `C${f(x0 + 0.8)} 2 ${a} 2.8 ${a} 4`
    : `A2 2 0 0 0 ${a} 4`;
  return `M${b} 8V4H${c}V8H${d}V4${right}H${b}${left}V8Z`;
}

// ── Download, Upload, Export ─────────────────────────────────────────────────

// Each arrow in Carbon's point order; the 16px drawings doubled into the 32 grid.
const DOWNLOAD: Pt[] = [
  [26, 14],
  [24.59, 12.59],
  [17, 20.17],
  [17, 2],
  [15, 2],
  [15, 20.17],
  [7.41, 12.59],
  [6, 14],
  [16, 24],
];
const DOWNLOAD_16: Pt[] = [
  [26, 14],
  [24.6, 12.6],
  [17, 20.2],
  [17, 2],
  [15, 2],
  [15, 20.2],
  [7.4, 12.6],
  [6, 14],
  [16, 24],
];
const UPLOAD: Pt[] = [
  [6, 18],
  [7.41, 19.41],
  [15, 11.83],
  [15, 30],
  [17, 30],
  [17, 11.83],
  [24.59, 19.41],
  [26, 18],
  [16, 8],
];
const UPLOAD_16: Pt[] = [
  [6, 18],
  [7.4, 19.4],
  [15, 11.8],
  [15, 30],
  [17, 30],
  [17, 11.8],
  [24.6, 19.4],
  [26, 18],
  [16, 8],
];
const EXPORT: Pt[] = [
  [6, 12],
  [7.411, 13.405],
  [15, 5.825],
  [15, 24],
  [17, 24],
  [17, 5.825],
  [24.591, 13.405],
  [26, 12],
  [16, 2],
];
const EXPORT_16: Pt[] = [
  [6, 12],
  [7.4, 13.4],
  [15, 5.8],
  [15, 24],
  [17, 24],
  [17, 5.8],
  [24.6, 13.4],
  [26, 12],
  [16, 2],
];

// ── Download and Upload's action: a conveyor ─────────────────────────────────

/**
 * One pass carries the arrow TRAVEL px into its tray, where it is cut at the
 * tray's floor (its base's inside edge) as it goes in, while the next arrow
 * comes in from the box's far edge, cut there, and lands where the first one
 * was. TRAVEL is the arrow's length plus a 4px gap, so the two never touch.
 * The arrows move over 220ms (moderate-02, on the
 * standard easing); the tray widens in 80ms (fast-01, exit easing) and
 * narrows back in 140ms (entrance easing); no loop:
 * `loop` plays one pass. All on Carbon's productive curves.
 */
const TRAVEL = 26;
const TRANSFER_MS = motionTokens.duration.moderate02;
const TRAY_OUT = motionTokens.duration.fast01 / TRANSFER_MS;
/** The tray takes the arrow in: out in fast-01, back over the rest of the pass. */
const trayTake = (a: number) => outAndBack(a, TRAY_OUT);
const CONVEYOR = { duration: TRANSFER_MS / 1000, loops: false } as const;
const TRANSFER_TIMING = "It doesn't loop: `loop` and `until` play one pass.";

function downloadShapes(h: number, size: number | undefined, a = 0) {
  const small = size === 16;
  const pts = small ? DOWNLOAD_16 : DOWNLOAD;
  if (a <= 0 || a >= 1) {
    return {
      tray: { d: trayDown(4 - TRAY * h, 28 + TRAY * h, small) },
      arrow: { d: reach(pts, ([, y]) => y === 2, DOWN, REACH * h) },
    };
  }
  const m = Math.max(h, trayTake(a));
  const u = STANDARD(a);
  // The arrow going in carries the hover's reach; the next one arrives without it (the hover eases out as the action starts).
  const going = cutTo(
    movePathBy(
      reach(pts, ([, y]) => y === 2, DOWN, REACH * h),
      0,
      TRAVEL * u
    ),
    boxWith({ y1: 28 })
  );
  const coming = cutToBox(movePathBy(polyD(pts), 0, TRAVEL * (u - 1)));
  return {
    tray: { d: trayDown(4 - TRAY * m, 28 + TRAY * m, small) },
    arrow: { d: going + coming },
  };
}

function uploadShapes(h: number, size: number | undefined, a = 0) {
  const small = size === 16;
  const pts = small ? UPLOAD_16 : UPLOAD;
  if (a <= 0 || a >= 1) {
    return {
      tray: { d: trayUp(4 - TRAY * h, 28 + TRAY * h, small) },
      arrow: { d: reach(pts, ([, y]) => y === 30, UP, REACH * h) },
    };
  }
  const m = Math.max(h, trayTake(a));
  const u = STANDARD(a);
  const going = cutTo(
    movePathBy(
      reach(pts, ([, y]) => y === 30, UP, REACH * h),
      0,
      -TRAVEL * u
    ),
    boxWith({ y0: 4 })
  );
  const coming = cutToBox(movePathBy(polyD(pts), 0, TRAVEL * (1 - u)));
  return {
    tray: { d: trayUp(4 - TRAY * m, 28 + TRAY * m, small) },
    arrow: { d: going + coming },
  };
}

export const DownloadSpec = /* @__PURE__ */ hoverIcon('Download', {
  geo: ({ h }, size) => downloadShapes(h, size),
  static: /* @__PURE__ */ carbonArt(Download16, Download32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Downloaded: the arrow drops into the tray and disappears while the next arrow comes down from the top to take its place. The tray widens as the arrow arrives. ' +
      TRANSFER_TIMING +
      ' Download takes no status, so there is no hand-off.',
    ...CONVEYOR,
    geo: ({ h, a }, size) => downloadShapes(h, size, a),
  }),
});

export const UploadSpec = /* @__PURE__ */ hoverIcon('Upload', {
  geo: ({ h }, size) => uploadShapes(h, size),
  static: /* @__PURE__ */ carbonArt(Upload16, Upload32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Uploaded: the arrow rises into the tray at the top and disappears while the next arrow comes up from the bottom to take its place. The tray widens as the arrow arrives. ' +
      TRANSFER_TIMING +
      ' Upload takes no status, so there is no hand-off.',
    ...CONVEYOR,
    geo: ({ h, a }, size) => uploadShapes(h, size, a),
  }),
});

export const ExportSpec = /* @__PURE__ */ hoverIcon('Export', {
  geo: ({ h }, size) => {
    const small = size === 16;
    return {
      tray: { d: trayDown(4 + TRAY * h, 28 - TRAY * h, small) },
      arrow: {
        d: reach(
          small ? EXPORT_16 : EXPORT,
          ([, y]) => y === 24,
          UP,
          REACH * h
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Export16, Export32),
});

// ── Import export ────────────────────────────────────────────────────────────

const IE_DOWN: Pt[] = [
  [27.6, 14.6],
  [24, 18.2],
  [24, 4],
  [22, 4],
  [22, 18.2],
  [18.4, 14.6],
  [17, 16],
  [23, 22],
  [29, 16],
];
const IE_UP: Pt[] = [
  [9, 4],
  [3, 10],
  [4.4, 11.4],
  [8, 7.8],
  [8, 22],
  [10, 22],
  [10, 7.8],
  [13.6, 11.4],
  [15, 10],
];
export const ImportExportSpec = /* @__PURE__ */ hoverIcon('ImportExport', {
  geo: ({ h }) => ({
    tray: { d: trayDown(2, 30) },
    down: { d: reach(IE_DOWN, ([, y]) => y === 4, DOWN, REACH * h) },
    up: { d: reach(IE_UP, ([, y]) => y === 22, UP, REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(ImportExport32),
});

// ── Share ────────────────────────────────────────────────────────────────────

// Three rings (Carbon's r5 / r3: centreline r4, 2px wall) and two 2px links.
// Each link is Carbon's band (its two edges, as Carbon draws them), carried
// on into the rings to TUCK from each centre: inside the wall at rest (r 3–5)
// and grown (r 4–6), so it always ends in ink.
const SHARE_SRC: Pt = [7, 16];
const SHARE_TOP: Pt = [23, 7];
const SHARE_BOT: Pt = [23, 25];
const TUCK = 4.4;
/** Where the line through a and b meets the circle about c of radius r, nearest a. */
function meet(a: Pt, b: Pt, c: Pt, r: number): Pt {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const [fx, fy] = [a[0] - c[0], a[1] - c[1]];
  const [A, B, C] = [
    dx * dx + dy * dy,
    2 * (fx * dx + fy * dy),
    fx * fx + fy * fy - r * r,
  ];
  const disc = Math.sqrt(B * B - 4 * A * C);
  const ts = [(-B - disc) / (2 * A), (-B + disc) / (2 * A)];
  const t = Math.abs(ts[0]) < Math.abs(ts[1]) ? ts[0] : ts[1];
  return [a[0] + dx * t, a[1] + dy * t];
}
/** A link band from Carbon's two edges (each [end at `from`, end at `to`]), tucked into both rings. */
function link(
  edges: readonly [Pt, Pt][],
  from: Pt,
  to: Pt,
  tuckFrom = TUCK,
  tuckTo = TUCK
): string {
  const [[a0, a1], [b0, b1]] = edges;
  return polyD([
    meet(a0, a1, from, tuckFrom),
    meet(a1, a0, to, tuckTo),
    meet(b1, b0, to, tuckTo),
    meet(b0, b1, from, tuckFrom),
  ]);
}
const LINK_TOP: [Pt, Pt][] = [
  [
    [19.11, 10.11],
    [11.8, 14.68],
  ],
  [
    [18.2, 8.32],
    [10.89, 12.89],
  ],
];
const LINK_BOT: [Pt, Pt][] = [
  [
    [19.11, 21.89],
    [11.8, 17.32],
  ],
  [
    [18.2, 23.68],
    [10.89, 19.11],
  ],
];
const SHARE_LINKS =
  /* @__PURE__ */ link(LINK_TOP, SHARE_TOP, SHARE_SRC) +
  /* @__PURE__ */ link(LINK_BOT, SHARE_BOT, SHARE_SRC);
const share = /* @__PURE__ */ together(); // the source node and both shared nodes together (no stagger)
/** The rings grown `src` (the source) and `out` (the shared nodes) px in radius; the links' ends tucked into the walls as they grow. */
function shareShapes(src: number, out: number, links = SHARE_LINKS) {
  return {
    links: { d: links },
    source: { d: ringPath(SHARE_SRC, 4 + src, 2), ...EVENODD },
    top: { d: ringPath(SHARE_TOP, 4 + out, 2), ...EVENODD },
    bottom: { d: ringPath(SHARE_BOT, 4 + out, 2), ...EVENODD },
  };
}
// ── Share's action: the nodes turn one place round ──────────────────────────
//
// Each node takes the next one's place in an arc, while the links shift
// like a stroke round the triangle the three form. The three centres lie on one circle (centre SHARE_O, radius
// SHARE_R: the triangle's circumcircle), so each node travels along it,
// clockwise, into the next node's place: the source (left) to the top, the
// top to the bottom, the bottom to the source. Carbon's triangle isn't
// equilateral, so the arcs aren't equal (121.3°, 117.4° from the top to the
// bottom, 121.3°); they run on one timing, and the drawing they land on is
// Carbon's, node for node.
//
// The links are a stroke on the triangle through the nodes, dashed: the dash
// covers two of its three sides (the source's two) and, as the nodes turn,
// slides back one side round the triangle, so it lands on the new source's
// two sides. The triangle's corners sit on Carbon's link centrelines (the
// source's corner where the two meet, 0.8px right of its centre; the others
// where each line passes closest to its node), carried with the nodes. Each
// visible piece is a 2px band whose ends are tucked into the rings' walls
// (TUCK from the node's centre, as at rest), and the dash's own ends are
// square across the band.

const SHARE_PLACES: readonly Pt[] = [SHARE_SRC, SHARE_TOP, SHARE_BOT];
/** The circle through the three centres: on y 16 (the icon is symmetric), equidistant from the source and the top. */
const SHARE_OX =
  (SHARE_TOP[0] ** 2 + (SHARE_TOP[1] - 16) ** 2 - SHARE_SRC[0] ** 2) /
  (2 * (SHARE_TOP[0] - SHARE_SRC[0]));
const SHARE_O: Pt = [SHARE_OX, 16];
const SHARE_R = SHARE_OX - SHARE_SRC[0];
const angleOf = ([x, y]: Pt) => Math.atan2(y - SHARE_O[1], x - SHARE_O[0]);
/** Each place's angle on the circle, and the clockwise arc from it to the next place. */
const SHARE_ANG = /* @__PURE__ */ SHARE_PLACES.map(angleOf);
const SHARE_ARC = /* @__PURE__ */ SHARE_ANG.map((t, i) => {
  const d = SHARE_ANG[(i + 1) % 3] - t;
  return d > 0 ? d : d + 2 * Math.PI;
});
/** A link's centreline, from Carbon's two edges: their midpoints at each end. */
const centreline = ([[a0, a1], [b0, b1]]: readonly [Pt, Pt][]): [Pt, Pt] => [
  [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2],
  [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2],
];
/** Where the triangle's corner sits, from each place's centre. */
const SHARE_CORNER = /* @__PURE__ */ (() => {
  const [t0, t1] = centreline(LINK_TOP);
  const [u0, u1] = centreline(LINK_BOT);
  // The source's corner: where the two centrelines meet.
  const [dx, dy, ex, ey] = [
    t1[0] - t0[0],
    t1[1] - t0[1],
    u1[0] - u0[0],
    u1[1] - u0[1],
  ];
  const t = ((u0[0] - t0[0]) * ey - (u0[1] - t0[1]) * ex) / (dx * ey - dy * ex);
  const src: Pt = [t0[0] + dx * t, t0[1] + dy * t];
  // The others: the point on their own centreline nearest their centre.
  const foot = (c: Pt, [p, q]: [Pt, Pt]): Pt => {
    const [vx, vy] = [q[0] - p[0], q[1] - p[1]];
    const u = ((c[0] - p[0]) * vx + (c[1] - p[1]) * vy) / (vx * vx + vy * vy);
    return [p[0] + vx * u, p[1] + vy * u];
  };
  return [src, foot(SHARE_TOP, [t0, t1]), foot(SHARE_BOT, [u0, u1])].map(
    (v, i): Pt => [v[0] - SHARE_PLACES[i][0], v[1] - SHARE_PLACES[i][1]]
  );
})();

/**
 * A 2px band along the side from corner `va` to corner `vb` (nodes at `ca`
 * and `cb`), over the stretch [t0, t1] of it (0 at va, 1 at vb), its ends
 * tucked into the rings (`ta`, `tb` from their centres): nothing where the
 * stretch is all inside a ring.
 */
function sideBand(
  va: Pt,
  vb: Pt,
  ca: Pt,
  cb: Pt,
  t0: number,
  t1: number,
  ta: number,
  tb: number
): string {
  if (t1 - t0 <= 1e-6) {
    return '';
  }
  const L = Math.hypot(vb[0] - va[0], vb[1] - va[1]);
  const d: Pt = [(vb[0] - va[0]) / L, (vb[1] - va[1]) / L];
  const n: Pt = [-d[1], d[0]];
  const side = (w: number): [number, number] | null => {
    const o: Pt = [va[0] + n[0] * w, va[1] + n[1] * w];
    // Along the line o + d·s: out of ring a (its far crossing), into ring b (its near one).
    const cross = (c: Pt, r: number, far: boolean) => {
      const [fx, fy] = [o[0] - c[0], o[1] - c[1]];
      const B = fx * d[0] + fy * d[1];
      const C = fx * fx + fy * fy - r * r;
      const disc = B * B - C;
      if (disc < 0) {
        return far ? -Infinity : Infinity;
      }
      return far ? -B + Math.sqrt(disc) : -B - Math.sqrt(disc);
    };
    const s0 = Math.max(t0 * L, cross(ca, ta, true));
    const s1 = Math.min(t1 * L, cross(cb, tb, false));
    return s1 > s0 ? [s0, s1] : null;
  };
  const [p, q] = [side(1), side(-1)];
  if (!p || !q) {
    return '';
  }
  const at = (w: number, s: number): Pt => [
    va[0] + n[0] * w + d[0] * s,
    va[1] + n[1] * w + d[1] * s,
  ];
  return polyD([at(1, p[0]), at(1, p[1]), at(-1, q[1]), at(-1, q[0])]);
}

/**
 * The drawing with each node k[i] of the way along its arc (by node: source,
 * top, bottom at the start), the links drawn over the stretch `cover[j]`
 * ([from, to], 0 → 1 along it) of each side j of the triangle (0 source →
 * top, 1 top → bottom, 2 bottom → source; clockwise), the rings grown `g`;
 * `landed`: each key draws the node coming into its place.
 */
function shareTurn(
  k: readonly number[],
  cover: readonly (readonly [number, number])[],
  g: readonly number[],
  landed: boolean
) {
  const pos = SHARE_PLACES.map((_, i): Pt => {
    const t = SHARE_ANG[i] + SHARE_ARC[i] * k[i];
    return [
      SHARE_O[0] + SHARE_R * Math.cos(t),
      SHARE_O[1] + SHARE_R * Math.sin(t),
    ];
  });
  const corner = pos.map((c, i): Pt => {
    const [o0, o1] = [SHARE_CORNER[i], SHARE_CORNER[(i + 1) % 3]];
    return [
      c[0] + o0[0] + (o1[0] - o0[0]) * k[i],
      c[1] + o0[1] + (o1[1] - o0[1]) * k[i],
    ];
  });
  const tuck = (i: number) => TUCK + Math.max(0, g[i] - 1);
  const links = [0, 1, 2]
    .map((j) => {
      const i = (j + 1) % 3;
      return sideBand(
        corner[j],
        corner[i],
        pos[j],
        pos[i],
        cover[j][0],
        cover[j][1],
        tuck(j),
        tuck(i)
      );
    })
    .join('');
  const ring = (i: number) => ({
    d: ringPath(pos[i], 4 + g[i], 2),
    ...EVENODD,
  });
  // Past halfway each key draws the node coming into its place (an invisible swap: the rings are alike), so a status cut
  // fixed by place (the lower node's) follows the node that lands there.
  return !landed
    ? { links: { d: links }, source: ring(0), top: ring(1), bottom: ring(2) }
    : { links: { d: links }, source: ring(2), top: ring(0), bottom: ring(1) };
}

/**
 * The nodes go in turn, the top one first, then the bottom one, then
 * the source, SHARE_STEP apart, each over SHARE_MOVE on the standard
 * easing (Carbon's productive curve).
 *
 * The links are strokes on the
 * triangle through the node centres. Over the first half of the pass the
 * open side, the gap in Carbon's drawing (top → bottom), draws closed, a trim
 * growing from the top node to the bottom one; over the second half the side
 * that becomes the new gap (between the old source and the old top node,
 * which are landing at the top and bottom) opens, its trim retracting from
 * the bottom up to the top node. (Retracting the other way, the stroke would slide
 * out from under the hand-off's mark as it enters.) Each half is SHARE_STROKE / 2 on the standard
 * easing, over the side's visible span only (SHARE_HIDDEN), so the
 * stroke moves for the whole of each half.
 */
const SHARE_MOVE = 220;
const SHARE_STEP = 35;
const SHARE_MS = 320;
/**
 * The links'
 * two halves run over the first SHARE_STROKE of the pass, so the stroke has stopped before the last node lands (290ms).
 */
const SHARE_STROKE = 240;
/**
 * The first and last SHARE_HIDDEN of a side lie inside the rings (TUCK of a side about 18px long), where a trim's moving end
 * draws nothing: each trim runs only over the rest (SHARE_HIDDEN to 1 − SHARE_HIDDEN of its side), so it moves visibly for its
 * whole half. (At both ends the drawing is the one at 0 and 1: the moving end is in a ring.)
 */
const SHARE_HIDDEN = 0.18;
/** When each node (source, top, bottom) starts: the top first, then the bottom, then the source. */
const SHARE_START = [2 * SHARE_STEP, 0, SHARE_STEP];

export const ShareSpec = /* @__PURE__ */ hoverIcon('Share', {
  hover: share.hover,
  geo: ({ h }) => shareShapes(share.at(h, 0), share.at(h, 1)),
  static: /* @__PURE__ */ carbonArt(Share32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Shared: the three nodes each move one place clockwise around the icon, one after another, and the links redraw between them. With a hand-off (`then`), the status mark enters halfway through.',
    duration: SHARE_MS / 1000,
    geo: ({ h, a }) => {
      const [src, out] = [share.at(h, 0), share.at(h, 1)];
      if (a <= 0 || a >= 1) {
        return shareShapes(src, out);
      }
      const t = a * SHARE_MS;
      const k = SHARE_START.map((t0) =>
        STANDARD(phase(t, t0, t0 + SHARE_MOVE))
      );
      // A trim's moving end, over its side's visible span, on the standard easing over its half.
      const trim = (u: number) =>
        SHARE_HIDDEN + (1 - 2 * SHARE_HIDDEN) * STANDARD(u);
      const close = trim(phase(t, 0, SHARE_STROKE / 2));
      const open =
        t > SHARE_STROKE / 2
          ? trim(phase(t, SHARE_STROKE / 2, SHARE_STROKE))
          : 0;
      // Side 0 (source → top, landing top → bottom) opens from its top-node end back to the source's; side 1 (top → bottom)
      // closes from the top node's end; side 2 holds.
      const cover: [number, number][] = [
        [0, open ? 1 - open : 1],
        [0, close],
        [0, 1],
      ];
      return shareTurn(
        k,
        cover,
        [src, out, out],
        t >= (2 * SHARE_STEP + SHARE_MOVE) / 2
      );
    },
  }),
});

// ── Document ─────────────────────────────────────────────────────────────────

// Carbon's page (absolute): the outline, the fold's triangle, and the page's
// inside. Growing it moves every point g out from the page's middle: the
// right part right, the left part left, the top up, the bottom down, so each
// wall keeps its 2px. The fold then comes k further in: the points on its
// vertical fold line (and the top edge's end at the diagonal) move k left,
// those on its horizontal fold line (and the right edge's end) move k down.
// Its diagonal stays parallel and every wall in it keeps its weight.
const PAGE =
  'M25.7 9.3L18.7 2.3C18.5 2.1 18.3 2 18 2H8C6.9 2 6 2.9 6 4V28C6 29.1 6.9 30 8 30H24C25.1 30 26 29.1 26 28V10C26 9.7 25.9 9.5 25.7 9.3Z' +
  'M18 4.4L23.6 10H18V4.4Z' +
  'M24 28H8V4H16V10C16 11.1 16.9 12 18 12H24V28Z';
const GROW = 2;
const FOLD = 4;
const LINE_REACH = 1;
const foldLeft = (x: number, y: number) => x > 12 && x < 19.5 && y < 13;
const foldDown = (x: number, y: number) => x > 15 && y > 8 && y < 13;
const bar = (x0: number, x1: number, y: number) =>
  `M${f(x0)} ${y}H${f(x1)}V${y + 2}H${f(x0)}Z`;
export const DocumentSpec = /* @__PURE__ */ hoverIcon('Document', {
  geo: ({ h }) => {
    const g = GROW * h;
    const k = FOLD * h;
    const e = LINE_REACH * h;
    return {
      page: {
        d: mapPath(PAGE, ([x, y]) => [
          x + (x > 12 ? g : -g) - (foldLeft(x, y) ? k : 0),
          y + (y < 16 ? -g : g) + (foldDown(x, y) ? k : 0),
        ]),
      },
      lines: { d: bar(10 - e, 22 + e, 22 + g) + bar(10 - e, 22 + e, 16 + g) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Document32),
});

// ── Document import / export ─────────────────────────────────────────────────

const DOC_IMPORT_PAGE =
  'M24,14V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,16,2H6A2,2,0,0,0,4,4V28a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V26H22v2H6V4h8v6a2,2,0,0,0,2,2h6v2Zm-8-4V4.41L21.59,10Z';
const DOC_IMPORT_ARROW: Pt[] = [
  [28, 19],
  [14.83, 19],
  [17.41, 16.41],
  [16, 15],
  [11, 20],
  [16, 25],
  [17.41, 23.59],
  [14.83, 21],
  [28, 21],
];
export const DocumentImportSpec = /* @__PURE__ */ hoverIcon('DocumentImport', {
  geo: ({ h }) => ({
    page: { d: DOC_IMPORT_PAGE },
    arrow: { d: reach(DOC_IMPORT_ARROW, ([x]) => x === 28, LEFT, REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(DocumentImport32),
});

const DOC_EXPORT_PAGE =
  'M22,14V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,14,2H4A2,2,0,0,0,2,4V28a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V26H20v2H4V4h8v6a2,2,0,0,0,2,2h6v2Zm-8-4V4.41L19.59,10Z';
const DOC_EXPORT_ARROW: Pt[] = [
  [13, 21],
  [26.17, 21],
  [23.59, 23.59],
  [25, 25],
  [30, 20],
  [25, 15],
  [23.59, 16.41],
  [26.17, 19],
  [13, 19],
];
export const DocumentExportSpec = /* @__PURE__ */ hoverIcon('DocumentExport', {
  geo: ({ h }) => ({
    page: { d: DOC_EXPORT_PAGE },
    arrow: { d: reach(DOC_EXPORT_ARROW, ([x]) => x === 13, RIGHT, REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(DocumentExport32),
});

// ── Cloud upload / download ──────────────────────────────────────────────────

// Carbon's cloud is geometry of its own (cloudShape.ts, a leaf the status fixes share).
export { cloud, CLOUD_K };

const CLOUD_UP: Pt[] = [
  [11, 18],
  [12.41, 19.41],
  [15, 16.83],
  [15, 29],
  [17, 29],
  [17, 16.83],
  [19.59, 19.41],
  [21, 18],
  [16, 13],
];
const CLOUD_DOWN: Pt[] = [
  [17, 26.17],
  [17, 14],
  [15, 14],
  [15, 26.17],
  [12.41, 23.59],
  [11, 25],
  [16, 30],
  [21, 25],
  [19.59, 23.59],
];
export const CloudUploadSpec = /* @__PURE__ */ hoverIcon('CloudUpload', {
  geo: ({ h }) => ({
    cloud: { d: cloud(1 + CLOUD_K * h) },
    arrow: { d: reach(CLOUD_UP, ([, y]) => y === 29, UP, REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(CloudUpload32),
});
export const CloudDownloadSpec = /* @__PURE__ */ hoverIcon('CloudDownload', {
  geo: ({ h }) => ({
    cloud: { d: cloud(1 - CLOUD_K * h) },
    arrow: { d: reach(CLOUD_DOWN, ([, y]) => y === 14, DOWN, REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(CloudDownload32),
});
