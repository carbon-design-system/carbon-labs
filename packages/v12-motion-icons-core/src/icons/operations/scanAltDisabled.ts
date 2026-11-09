/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ScanAlt32 from '@carbon/icons/es/scan--alt/32.js';
import ScanDisabled32 from '@carbon/icons/es/scan--disabled/32.js';
import { carbonArt, hoverIcon, toggleIcon, type Shapes } from '../../engine';
import { cutPoly, cutSegs, type HalfPlane, type Seg } from '../../cut';
import { filletSegs, strokeOutline } from '../../off';
import { f, lerp } from '../../paint';
import { kickAmount, slashChange } from '../../utils/slashToggle';
import { cubicBezier, ENTRANCE } from '../../ease';
import type { Pt } from '../../geometry';

const CScanAlt = /* @__PURE__ */ carbonArt(ScanAlt32);
const CScanDisabled = /* @__PURE__ */ carbonArt(ScanDisabled32);

/**
 * Scan alt and Scan disabled, from one geometry, and the toggle between
 * them (p: 0 = scan alt, 1 = scan disabled). Every part is a 2px centreline
 * drawn as its outline, so line weight never changes; Carbon's gaps are
 * cut flush. No masks.
 *
 * Toggle (the standard Off slash; on → off 160ms entrance,
 * back 120ms exit): the slash draws in from the top-right bracket to the
 * bottom-left one, with Carbon's gap opening behind its head, and the centre
 * kicks 2px left and back as it arrives (the other Off toggles' kick; the
 * corner brackets hold, as the slash joins two of them). The scan line
 * shrinks to 50% about the centre and cuts out before the slash's head
 * reaches it (a match cut, as Play ↔ Pause); then the centre brackets close
 * into the square, so the 2px gap around the line holds while it's there.
 * The corner brackets lengthen 1px. Off → on runs it back: the walls open,
 * the line appears at 50% and grows, and the centre recoils half as far.
 *
 * Hover, scan alt (its reference animation): the corner brackets step 1px out and
 * the scan line widens 1px each side (150ms); the line bounces up 3px, then
 * down to 2px below rest (100ms + 100ms); the centre brackets close in 1px
 * and their legs track the line (see below). Hover, scan disabled (the
 * set-wide Off rule): the corner brackets step 1px in, the slash shortening
 * with the two it joins, and the square shrinks to 90% (150ms).
 */

const C: Pt = [16, 16];
const outline = (segs: Seg[]) => strokeOutline(segs).open ?? [];
const polyD = (pts: readonly Pt[]) => {
  if (pts.length < 3) {
    return '';
  }
  const area = pts.reduce(
    (a, p, i) =>
      a +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  return `M${(area >= 0 ? pts : [...pts].reverse()).map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** A 2px bar along a → b, butt ends. */
const barPoly = (a: Pt, b: Pt): Pt[] => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  return [
    [a[0] + nx, a[1] + ny],
    [b[0] + nx, b[1] + ny],
    [b[0] - nx, b[1] - ny],
    [a[0] - nx, a[1] - ny],
  ];
};

// The line is gone by LINE_OUT (before the slash's head, which reaches it at
// ~0.46); the walls close over WALLS.
const LINE_OUT = 0.4;
const WALLS: [number, number] = [0.4, 0.7];

// Hover timing (the reference animation, 100fps, 200ms): the engine runs t linearly
// and each part takes its own ease from the comp. The bounce is two steps,
// each on [0.2, 0, 0.38, 0.9]: up to 100ms, then on to 200ms. The widen and
// step-out run 150ms on the entrance ease (the comp's [0, 0, 0.38, 0.9]).
const STEP_EASE = /* @__PURE__ */ cubicBezier(0.2, 0, 0.38, 0.9);
const hoverAt = (t: number) => ({
  a: STEP_EASE(clamp01(t / 0.5)),
  b: STEP_EASE(clamp01((t - 0.5) / 0.5)),
  c: ENTRANCE(clamp01(t / 0.75)),
});

function scanShapes(p: number, t: number, e = 0): Shapes {
  const on = 1 - p;
  const { a, b, c: h } = hoverAt(t);
  // The centre's kick (the square and the line), as the other Off toggles.
  const kx = -2 * kickAmount(e);
  // The corner brackets: legs 7 → 8 long; on hover 1px out (scan alt) or in (scan disabled).
  const len = lerp(7, 8, p);
  const step = h * (p - on);

  // The scan line: shrinks to the centre as the slash draws (bouncing on hover, on).
  const dy = (-3 * a + 5 * b) * on;
  const half = p < LINE_OUT ? (14 + h * on) * (1 - 0.5 * (p / LINE_OUT)) : 0;
  const by = C[1] + dy;
  const cx = C[0] + kx;

  // The slash, from the top-right bracket's vertex to the bottom-left one's.
  const T: Pt = [29 - step, 3 + step];
  const B: Pt = [3 + step, 29 - step];
  const L = Math.hypot(B[0] - T[0], B[1] - T[1]);
  const u: Pt = [(B[0] - T[0]) / L, (B[1] - T[1]) / L];
  const n: Pt = [-Math.SQRT1_2, -Math.SQRT1_2]; // the gap side: up-left
  const nT = n[0] * T[0] + n[1] * T[1];
  const uT = u[0] * T[0] + u[1] * T[1];
  const slashBand = (lo: number, hi: number): HalfPlane[] => [
    { n, c: nT + lo },
    { n: [-n[0], -n[1]], c: -(nT + hi) },
    { n: [u[0], u[1]], c: uT - 2 },
    { n: [-u[0], -u[1]], c: -(uT + L * p) },
  ];
  const drawn = p > 1e-4;

  // The centre square's walls open around the scan line (Carbon's 2px gaps
  // above and below it) and close once the line is gone. On hover the two
  // brackets close in 1px and their legs track the bouncing line, per the
  // comp: as it rises the top legs fold flat and the bottom ones reach up;
  // as it drops the top legs reach down and the bottom ones fold flat.
  const s = 7 - a * on - 0.7 * h * p;
  const [g0, g1] = [13 + (-2 * a + 4 * b) * on, 19 + (-4 * a + 6 * b) * on];
  const close = clamp01((p - WALLS[0]) / (WALLS[1] - WALLS[0]));
  const [gm, gh] = [(g0 + g1) / 2, ((g1 - g0) / 2) * (1 - close)];
  const G = gh;
  const wallBand = (g: number): HalfPlane[] => [
    { n: [0, 1], c: gm - g },
    { n: [0, -1], c: -(gm + g) },
    { n: [1, 0], c: cx - 9 },
    { n: [-1, 0], c: -(cx + 9) },
  ];

  const cut = (segs: Seg[], walls: boolean) => {
    let pieces = [segs];
    if (walls && G > 1.3) {
      pieces = cutSegs(pieces, wallBand(G - 1.3));
    }
    if (drawn) {
      pieces = cutSegs(pieces, slashBand(0.3, 1.7));
    }
    let d = '';
    for (const piece of pieces) {
      let polys = [outline(piece)];
      if (walls && G > 1e-4) {
        polys = polys.flatMap((q) =>
          q.length > 2 ? cutPoly(q, wallBand(G)) : []
        );
      }
      if (drawn) {
        polys = polys.flatMap((q) =>
          q.length > 2 ? cutPoly(q, slashBand(1, 3)) : []
        );
      }
      d += polys.map(polyD).join('');
    }
    return d;
  };

  const square = filletSegs(
    [
      [cx - s, C[1] - s],
      [cx + s, C[1] - s],
      [cx + s, C[1] + s],
      [cx - s, C[1] + s],
    ],
    1,
    true
  );
  // Start the loop in the middle of its left side, inside the cut.
  const start = square.findIndex(
    (sg) =>
      sg.k === 'L' && Math.abs(sg.a[0] - (cx - s)) < 1e-6 && sg.a[1] > C[1]
  );

  // A corner bracket: its vertex, and the directions its two legs run.
  const corner = (
    cx: number,
    cy: number,
    sx: number,
    sy: number,
    round: boolean
  ): Seg[] => {
    const [x, y] = [cx + sx * step, cy + sy * step];
    return filletSegs(
      [
        [x, y + sy * len],
        [x, y],
        [x + sx * len, y],
      ],
      round ? 0.001 : 0
    );
  };
  // The two brackets the slash joins take Carbon's round outer corner once it's there.
  const tr = corner(29, 3, -1, 1, p >= 0.5);
  const bl = corner(3, 29, 1, -1, p >= 0.5);

  let bar = '';
  if (half > 1e-3) {
    const poly = barPoly([cx - half, by], [cx + half, by]);
    bar = (drawn ? cutPoly(poly, slashBand(1, 3)) : [poly]).map(polyD).join('');
  }
  return {
    tl: { d: cut(corner(3, 3, 1, 1, false), false) },
    tr: { d: cut(tr, false) },
    bl: { d: cut(bl, false) },
    br: { d: cut(corner(29, 29, -1, -1, false), false) },
    square: {
      d: cut(
        start > 0
          ? [...square.slice(start), ...square.slice(0, start)]
          : square,
        true
      ),
    },
    bar: { d: bar },
    slash: {
      d: drawn
        ? polyD(barPoly(T, [T[0] + u[0] * L * p, T[1] + u[1] * L * p]))
        : '',
    },
  };
}

const HOVER = {
  duration: 0.2,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};
export const ScanAltSpec = /* @__PURE__ */ hoverIcon('ScanAlt', {
  hover: HOVER,
  geo: ({ h }) => scanShapes(0, h),
  static: /* @__PURE__ */ carbonArt(ScanAlt32),
});
export const ScanDisabledSpec = /* @__PURE__ */ hoverIcon('ScanDisabled', {
  hover: HOVER,
  geo: ({ h }) => scanShapes(1, h),
  static: /* @__PURE__ */ carbonArt(ScanDisabled32),
});
export const ScanAltOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'ScanAltOffToggle',
  {
    states: ['on', 'off'],
    statics: [CScanAlt, CScanDisabled],
    geo: ({ h, p, e }) => scanShapes(p, h, e),
    change: slashChange,
  }
);
