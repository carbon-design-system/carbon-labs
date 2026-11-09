/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import EditOff32 from '@carbon/icons/es/edit--off/32.js';
import PaintBrush32 from '@carbon/icons/es/paint-brush/32.js';
import Save16 from '@carbon/icons/es/save/16.js';
import Save20 from '@carbon/icons/es/save/20.js';
import Save24 from '@carbon/icons/es/save/24.js';
import Save32 from '@carbon/icons/es/save/32.js';
import Unlink32 from '@carbon/icons/es/unlink/32.js';
import { filletPath, polyPath, rectPath, type Pt } from '../../geometry';
import { defineAction, hoverIcon, type Shapes, carbonArt } from '../../engine';
import { OUT_BACK, outAndBack } from '../../actionGeo';
import { EVENODD, f, lerp, LINE } from '../../paint';
import { OFF_SHRINK } from '../../off';

/**
 * Editing icons (no reference animations). Carbon's drawing is kept verbatim wherever it holds still; the
 * moving parts are rebuilt so they match it at rest.
 */

/** A 2px band along the 45° diagonal from a to b (square ends). */
function band(a: Pt, b: Pt, w = 2): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [nx, ny] = [(-dy / l) * (w / 2), (dx / l) * (w / 2)];
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
/** a and b pushed `d` px further apart along the line through them. */
function extend(a: Pt, b: Pt, d: number): [Pt, Pt] {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [ux, uy] = [((b[0] - a[0]) / l) * d, ((b[1] - a[1]) / l) * d];
  return [
    [a[0] - ux, a[1] - uy],
    [b[0] + ux, b[1] + uy],
  ];
}

/** A point given in rotated coordinates: d = x − y (across the 45° diagonal), u = x + y (along it). */
const DU = (d: number, u: number): Pt => [(u + d) / 2, (u - d) / 2];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

// Edit off: the slash extends 1px at each end (as Chat off) and the pencil
// shrinks to 90% beneath it (the set-wide Off rule), at constant 2px line weight. The pencil is its
// centrelines, fitted exactly to Carbon: the lower piece ends on the
// slash's edge, the upper piece stops short of it (Carbon's cut-out). As
// the pencil shrinks about the icon centre, its cut ends tuck under the
// slash.
function pencil(k: number): Shapes {
  const S = ([x, y]: Pt): Pt => [16 + (x - 16) * k, 16 + (y - 16) * k];
  const line = (pts: Pt[]) => pts.map(S);
  const lower = line([DU(-1.4, 27), [5, 22], [5, 27], [10, 27], DU(-1.4, 37)]);
  const upper = line([DU(4.4, 27), DU(21.8, 27), DU(21.8, 37), DU(4.4, 37)]);
  const bar = line([DU(13, 27), DU(13, 37)]);
  return {
    lower: { d: polyPath(lower), ...LINE, strokeLinejoin: 'miter' },
    upper: { d: filletPath(upper, 1), ...LINE },
    bar: { d: `M${P(bar[0])}L${P(bar[1])}`, ...LINE },
  };
}
export const EditOffSpec = /* @__PURE__ */ hoverIcon('EditOff', {
  geo: ({ h }) => ({
    ...pencil(1 - OFF_SHRINK * h),
    slash: { d: band(...extend([2.7, 2.7], [29.3, 29.3], h), 1.98) },
  }),
  static: /* @__PURE__ */ carbonArt(EditOff32),
});

// Paint brush, from its reference animation (fr 100, frames 0→15 → moderate01,
// entrance ease). The brush is one 2px outline (round joins) whose points
// all move: the whole brush shifts 2px right (the null) while the handle end
// drops 1px, the ferrule slides down and left, and the head's two long
// sides bow outward, so the bristles fan. The ferrule line rides with it.
// The reference leaves out the two bristle slits; they're added back here,
// warped with the head: each slit keeps its place across the head (a third
// and two thirds of the way over) and its length along it, following the
// bowed sides. Every line stays 2px.
type Vert = [
  x: number,
  y: number,
  ix: number,
  iy: number,
  ox: number,
  oy: number,
];
// [vertex, in-tangent, out-tangent], layer space; the layer sits at (3.998, 13.003) under the null.
const BRUSH_REST: Vert[] = [
  [11.832, 7.58, 0, 0, 0, 0],
  [11.832, 7.591, 0, 0, 0, 0],
  [12.125, 7.884, 0, 0, 0.563, 0.563],
  [13.004, 10.007, 0, -0.796, 0, 0.796],
  [12.125, 12.13, 0.563, -0.563, -0.563, 0.563],
  [10.002, 13.009, 0.796, 0, -0.796, 0],
  [7.879, 12.13, 0.563, 0.563, 0, 0],
  [1.757, 5.997, 0, 0, 0, 0],
  [-3.004, 5.997, 0, 0, 0, 0],
  [-4.993, 3.992, 0, 0, 0, 0],
  [-13.004, -4.003, 0, 0, 0, 0],
  [-3.998, -13.009, 0, 0, 0, 0],
  [3.997, -4.998, 0, 0, 0, 0],
  [6.002, -3.009, 0, 0, 0, 0],
  [6.002, 1.74, 0, 0, 0, 0],
];
const BRUSH_HOVER: Vert[] = [
  [7.832, 8.58, 0, 0, 0, 0],
  [7.832, 8.591, 0, 0, 0, 0],
  [8.125, 8.884, 0, 0, 0.563, 0.563],
  [9.004, 11.007, 0, -0.796, 0, 0.796],
  [8.125, 13.13, 0.563, -0.563, -0.563, 0.563],
  [6.002, 14.009, 0.796, 0, -0.796, 0],
  [3.879, 13.13, 0.563, 0.563, 0, 0],
  [-2.243, 6.997, 0, 0, 0, 0],
  [-7.004, 6.997, 0, 0, 0, 0],
  [-8.993, 4.992, 0, 0, 0.006, 0],
  [-13.004, -4.003, -0.006, 6, 0, 0.006],
  [-3.998, -13.009, 0, 0.006, 0, 7.006],
  [-0.003, -3.998, 0, 0, 0, 0],
  [2.002, -2.009, 0, 0, 0, 0],
  [2.002, 2.74, 0, 0, 0, 0],
];
/** A point on the cubic from p0 (out-handle c0) to p3 (in-handle c3). */
function cubicAt(p0: Pt, c0: Pt, c3: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [
    k[0] * p0[0] + k[1] * c0[0] + k[2] * c3[0] + k[3] * p3[0],
    k[0] * p0[1] + k[1] * c0[1] + k[2] * c3[1] + k[3] * p3[1],
  ];
}
/**
 * The point `b` of the way along a cubic side (from p0 to p3), measured along
 * its chord rather than by the curve's parameter: the reference's straight
 * sides put both handles on their ends, which bunches the parameter up.
 */
function along(p0: Pt, c0: Pt, c3: Pt, p3: Pt, b: number): Pt {
  const [dx, dy] = [p3[0] - p0[0], p3[1] - p0[1]];
  const len2 = dx * dx + dy * dy;
  let [lo, hi] = [0, 1];
  for (let n = 0; n < 30; n++) {
    const t = (lo + hi) / 2;
    const q = cubicAt(p0, c0, c3, p3, t);
    if (((q[0] - p0[0]) * dx + (q[1] - p0[1]) * dy) / len2 < b) {
      lo = t;
    } else {
      hi = t;
    }
  }
  return cubicAt(p0, c0, c3, p3, (lo + hi) / 2);
}
export const PaintBrushSpec = /* @__PURE__ */ hoverIcon('PaintBrush', {
  geo: ({ h }) => {
    const [ox, oy] = [3.998 + 12 + 2 * h, 13.003 + 3]; // layer position plus the null's
    const v = BRUSH_REST.map(
      (r, i) =>
        r.map((n, k) => lerp(n, BRUSH_HOVER[i][k], h)) as unknown as Vert
    );
    const at = (i: number): Pt => [v[i][0] + ox, v[i][1] + oy];
    const inH = (i: number): Pt => [
      v[i][0] + v[i][2] + ox,
      v[i][1] + v[i][3] + oy,
    ];
    const outH = (i: number): Pt => [
      v[i][0] + v[i][4] + ox,
      v[i][1] + v[i][5] + oy,
    ];
    let d = `M${P(at(0))}`;
    for (let i = 0; i < v.length; i++) {
      const j = (i + 1) % v.length;
      d += `C${P(outH(i))} ${P(inH(j))} ${P(at(j))}`;
    }
    // The ferrule line (the reference's "Vector 10"): 9px each way along the diagonal from its centre.
    const [fx, fy] = [lerp(3.5, -0.5, h) + 12 + 2 * h, lerp(12.5, 13.5, h) + 3];
    // The head's sides, tip to ferrule: left is vertex 10 → 9, right is 11 → 12 (each a cubic).
    const left = (b: number) => along(at(10), inH(10), outH(9), at(9), b);
    const right = (b: number) => along(at(11), outH(11), inH(12), at(12), b);
    const inside = (a: number, b: number): Pt => {
      const [l, r] = [left(b), right(b)];
      return [lerp(l[0], r[0], a), lerp(l[1], r[1], a)];
    };
    // Slits at a third and two thirds across, from the tip to 6/16 and 10/16 of the head's length.
    const slit = (a: number, b: number) =>
      `M${P(inside(a, 0))}L${P(inside(a, b))}`;
    return {
      brush: { d: `${d}Z`, ...LINE, strokeLinejoin: 'round' },
      lines: {
        d:
          `M${P([fx - 4.5, fy + 4.5])}L${P([fx + 4.5, fy - 4.5])}` +
          slit(1 / 3, 6 / 16) +
          slit(2 / 3, 10 / 16),
        ...LINE,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(PaintBrush32),
});

// Save: the whole icon grows 1px all round while the shutter slides 1.5px
// right. Positions scale about the centre; walls and corner radii don't.
// Carbon's 16 and 24px drawings are the 32px one scaled; its 20px drawing
// differs, so it's rebuilt the same way from its own measurements. Body,
// shutter and label are separate pieces, tucked under the body's rim.
function save32(h: number, k = 0) {
  const s = 1 + h / 12 - k * PRESS;
  const S = (v: number) => f(16 + (v - 16) * s);
  const [L, T, R, B] = [+S(4), +S(4), +S(28), +S(28)];
  const [xc, yc] = [+S(22), +S(10)];
  const body =
    `M${f(R - 0.29)} ${f(yc - 0.71)}L${f(xc + 0.71)} ${f(T + 0.29)}A1 1 0 0 0 ${xc} ${T}H${f(L + 2)}A2 2 0 0 0 ${L} ${f(T + 2)}V${f(B - 2)}` +
    `A2 2 0 0 0 ${f(L + 2)} ${B}H${f(R - 2)}A2 2 0 0 0 ${R} ${f(B - 2)}V${yc}A1 1 0 0 0 ${f(R - 0.29)} ${f(yc - 0.71)}Z` +
    `M${f(L + 2)} ${f(T + 2)}V${f(B - 2)}H${f(R - 2)}V${f(yc + 0.41)}L${xc} ${f(T + 2.41)}V${f(T + 2)}Z`;
  const [a, b] = [+S(10) + 1.5 * h, +S(22) + 1.5 * h];
  const bot = +S(12);
  const shutter =
    `M${f(a)} ${f(T + 1)}V${f(bot - 2)}A2 2 0 0 0 ${f(a + 2)} ${f(bot)}H${f(b - 2)}A2 2 0 0 0 ${f(b)} ${f(bot - 2)}V${f(T + 1)}Z` +
    `M${f(a + 2)} ${f(T + 1)}V${f(bot - 2)}H${f(b - 2)}V${f(T + 1)}Z`;
  const [la, lb, top] = [+S(10), +S(22), +S(16)];
  const label =
    `M${f(la)} ${f(B - 1)}V${f(top + 2)}A2 2 0 0 1 ${f(la + 2)} ${f(top)}H${f(lb - 2)}A2 2 0 0 1 ${f(lb)} ${f(top + 2)}V${f(B - 1)}Z` +
    `M${f(la + 2)} ${f(top + 2)}V${f(B - 2)}H${f(lb - 2)}V${f(top + 2)}Z`;
  return { body, shutter, label };
}
/** Carbon's 20px save, in 32px units: positions (P, in 20px units) scale; thicknesses (t) don't. */
function save20(h: number, k = 0) {
  const s = 1 + h / 12 - k * PRESS;
  const P = (v: number) => +f(16 + (v * 1.6 - 16) * s);
  const t = (v: number) => v * 1.6;
  const r = t(1.3);
  const [L, T, R, B] = [P(2), P(2), P(18), P(18)];
  const body =
    `M${R} ${P(6.1)}L${f(R - t(0.2))} ${f(P(6.1) - t(0.6))}L${f(P(14) + t(0.5))} ${f(T + t(0.2))}L${P(14)} ${T}` +
    `H${f(L + r)}A${f(r)} ${f(r)} 0 0 0 ${L} ${f(T + r)}V${f(B - r)}A${f(r)} ${f(r)} 0 0 0 ${f(L + r)} ${B}H${f(R - r)}A${f(r)} ${f(r)} 0 0 0 ${R} ${f(B - r)}Z` +
    `M${f(L + t(1.3))} ${f(T + t(1.3))}V${f(B - t(1.3))}H${f(R - t(1.3))}V${f(P(6.1) + t(0.3))}L${P(14)} ${f(T + t(1.7))}V${f(T + t(1.3))}Z`;
  const [a, b, bot] = [P(6) + 1.5 * h, P(14) + 1.5 * h, P(8)];
  const shutter =
    `M${f(a)} ${f(T + 1)}V${f(bot - r)}A${f(r)} ${f(r)} 0 0 0 ${f(a + r)} ${bot}H${f(b - r)}A${f(r)} ${f(r)} 0 0 0 ${f(b)} ${f(bot - r)}V${f(T + 1)}Z` +
    `M${f(a + t(1.3))} ${f(T + 1)}V${f(bot - t(1.4))}H${f(b - t(1.4))}V${f(T + 1)}Z`;
  const [la, lb, top] = [P(6), P(14), P(10.05)];
  const label =
    `M${la} ${f(B - 1)}V${f(top + r)}A${f(r)} ${f(r)} 0 0 1 ${f(la + r)} ${top}H${f(lb - r)}A${f(r)} ${f(r)} 0 0 1 ${lb} ${f(top + r)}V${f(B - 1)}Z` +
    `M${f(la + t(1.3))} ${f(top + t(1.35))}V${f(B - t(1.3))}H${f(lb - t(1.3))}V${f(top + t(1.35))}Z`;
  return { body, shutter, label };
}
/** The action's press: the disk comes in this fraction of its half-width (12px): 2px a side. */
const PRESS = 1 / 6;
/** Save at hover h, pressed k (0 → 1). */
function saveShapes(h: number, size: number | undefined, k = 0): Shapes {
  const p = size === 20 ? save20(h, k) : save32(h, k);
  return {
    body: { d: p.body, ...EVENODD },
    label: { d: p.label, ...EVENODD },
    shutter: { d: p.shutter, ...EVENODD },
  };
}
export const SaveSpec = /* @__PURE__ */ hoverIcon('Save', {
  geo: ({ h }, size) => saveShapes(h, size),
  static: /* @__PURE__ */ carbonArt(Save16, Save20, Save24, Save32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Saved: the disk presses in on every side, like a key or a stamp, then comes back out. With a hand-off (`then`), the status mark enters as the disk comes back.',
    duration: OUT_BACK,
    geo: ({ h, a }, size) => {
      if (a <= 0 || a >= 1) {
        return saveShapes(h, size);
      }
      const k = outAndBack(a);
      // The hover's growth gives way to the press (the hover is easing out as the action starts).
      return saveShapes(h * (1 - k), size, k);
    },
  }),
});

/** A 2px × 4.83px mark along the break, centred at c; its outer end (towards `side`) extends `h` px. */
function diagonalMark(c: Pt, side: 1 | -1, h: number): string {
  const k = 2.415 * Math.SQRT1_2;
  const [a, b]: [Pt, Pt] = [
    [c[0] - k, c[1] - k],
    [c[0] + k, c[1] + k],
  ];
  const e = h * Math.SQRT1_2;
  return side < 0
    ? band([a[0] - e, a[1] - e], b)
    : band(a, [b[0] + e, b[1] + e]);
}

// Unlink: the halves pull 1px per axis further apart (as Link's loops do),
// and each break mark extends 1px outward.
const HALF_LOWER =
  'M16.58,21.07l-3.71,3.72a4,4,0,1,1-5.66-5.66l3.72-3.72L9.51,14,5.8,17.72a6,6,0,0,0-.06,8.54A6,6,0,0,0,10,28a6.07,6.07,0,0,0,4.32-1.8L18,22.49Z';
const HALF_UPPER =
  'M15.41,10.93l3.72-3.72a4,4,0,1,1,5.66,5.66l-3.72,3.72L22.49,18l3.71-3.72a6,6,0,0,0,.06-8.54A6,6,0,0,0,22,4a6.07,6.07,0,0,0-4.32,1.8L14,9.51Z';
export const UnlinkSpec = /* @__PURE__ */ hoverIcon('Unlink', {
  geo: ({ h }) => ({
    lower: { d: HALF_LOWER, transform: `translate(${f(-h)} ${f(h)})` },
    upper: { d: HALF_UPPER, transform: `translate(${f(h)} ${f(-h)})` },
    // The corner marks (along the break) and the four ticks beside them.
    marks: {
      d:
        diagonalMark([5.996, 6.005], -1, h) +
        diagonalMark([25.995, 25.999], 1, h) +
        rectPath(11, 2 - h, 13, 6) +
        rectPath(2 - h, 11, 6, 13) +
        rectPath(26, 19, 30 + h, 21) +
        rectPath(19, 26, 21, 30 + h),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Unlink32),
});
