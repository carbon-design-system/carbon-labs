/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Measuring an action's drawing (the batch suites): a shape's ink points
 * (transforms applied), and its line weight, measured on a raster.
 *
 * Weight: the shape is filled (its fill rule, transforms applied) on a fine
 * grid, and each inside cell's distance to the nearest outside cell is the
 * radius of the largest disc centred there that fits. The ridge of that map
 * (cells no smaller than any neighbour) runs down the middle of every wall,
 * at half its width: a 2px wall's ridge is 1. The median ridge value is the
 * shape's weight (joins and caps are a small part of it), and the largest
 * is its thickest point (a join). A transform scale, or a wall redrawn
 * thinner or thicker, moves both.
 */
import { pathPoints, type Pt } from '../src/geometry';
import type { Shapes } from '../src/engine';

/** A transform attribute (translate / rotate only) applied to a point. */
export function applyTransform(tf: string | undefined, p: Pt): Pt {
  if (!tf) {
    return p;
  }
  const ops = [...tf.matchAll(/(translate|rotate)\(([^)]*)\)/g)].map(
    (m) =>
      [
        m[1],
        m[2]
          .trim()
          .split(/[\s,]+/)
          .map(Number),
      ] as const
  );
  let q = p;
  for (const [op, v] of ops.reverse()) {
    if (op === 'translate') {
      q = [q[0] + v[0], q[1] + (v[1] ?? 0)];
    } else {
      const [deg, cx = 0, cy = 0] = v;
      const r = (deg * Math.PI) / 180;
      const [x, y] = [q[0] - cx, q[1] - cy];
      q = [
        cx + x * Math.cos(r) - y * Math.sin(r),
        cy + x * Math.sin(r) + y * Math.cos(r),
      ];
    }
  }
  return q;
}

export const subpaths = (d: string) => d.split(/(?=M)/).filter((s) => s.trim());
const stroked = (attrs: Shapes[string]) =>
  !!attrs.stroke && attrs.stroke !== 'none';

/** A shape's ink outlines (path sampled; transform applied), and its stroke half-width (0 when filled). */
export function ink(attrs: Shapes[string]): { pts: Pt[][]; pad: number } {
  const d = String(attrs.d ?? '');
  const pad = stroked(attrs) ? Number(attrs.strokeWidth ?? 1) / 2 : 0;
  return {
    pts: subpaths(d).map((s) =>
      pathPoints(s, 0.1).map((p) =>
        applyTransform(attrs.transform as string | undefined, p)
      )
    ),
    pad,
  };
}

/** Whether every point of a frame's ink is inside the 36×36 box (−2 to 34), and the first one that isn't. */
export function outsideBox(frame: Shapes): string | undefined {
  for (const [k, attrs] of Object.entries(frame)) {
    const { pts, pad } = ink(attrs);
    for (const [x, y] of pts.flat()) {
      if (
        !(
          x - pad >= -2 - 1e-6 &&
          x + pad <= 34 + 1e-6 &&
          y - pad >= -2 - 1e-6 &&
          y + pad <= 34 + 1e-6
        )
      ) {
        return `${k} (${x.toFixed(3)}, ${y.toFixed(3)})`;
      }
    }
  }
  return undefined;
}

export interface Weight {
  /** The median ridge value: half the walls' width. */
  median: number;
  /** The largest: half the thickest point's width. */
  max: number;
  /** Ink area, px². */
  area: number;
}

const STEP = 0.05;

/** 1D squared distance transform (Felzenszwalb & Huttenlocher). */
function edt1(
  f: Float64Array,
  n: number,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array
): void {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) {
      k++;
    }
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** A filled shape's weight on a STEP grid (strokes: half their width, exactly). */
export function weight(
  attrs: Shapes[string],
  skip?: (p: Pt) => boolean
): Weight {
  if (stroked(attrs)) {
    const w = Number(attrs.strokeWidth ?? 1) / 2;
    return { median: w, max: NaN, area: NaN };
  }
  const polys = ink(attrs).pts.filter((p) => p.length > 2);
  if (!polys.length) {
    return { median: 0, max: 0, area: 0 };
  }
  const all = polys.flat();
  const x0 = Math.min(...all.map((p) => p[0])) - 0.5;
  const y0 = Math.min(...all.map((p) => p[1])) - 0.5;
  const W = Math.ceil((Math.max(...all.map((p) => p[0])) + 0.5 - x0) / STEP);
  const H = Math.ceil((Math.max(...all.map((p) => p[1])) + 0.5 - y0) / STEP);
  const evenodd = attrs.fillRule === 'evenodd';
  const inside = new Uint8Array(W * H);
  const xs: [number, number][] = [];
  for (let j = 0; j < H; j++) {
    const y = y0 + (j + 0.5) * STEP;
    xs.length = 0;
    for (const p of polys) {
      for (let i = 0; i < p.length; i++) {
        const [a, b] = [p[i], p[(i + 1) % p.length]];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push([
            a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]),
            b[1] > a[1] ? 1 : -1,
          ]);
        }
      }
    }
    xs.sort((p, q) => p[0] - q[0]);
    let wind = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      wind += evenodd ? 1 : xs[i][1];
      const on = evenodd ? wind % 2 === 1 : wind !== 0;
      if (!on) {
        continue;
      }
      const from = Math.max(0, Math.ceil((xs[i][0] - x0) / STEP - 0.5));
      const to = Math.min(W - 1, Math.floor((xs[i + 1][0] - x0) / STEP - 0.5));
      for (let c = from; c <= to; c++) {
        inside[j * W + c] = 1;
      }
    }
  }
  // Squared distance from each cell to the nearest outside cell, in cells.
  const n = Math.max(W, H);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  const g = new Float64Array(W * H);
  const BIG = 1e12;
  for (let c = 0; c < W; c++) {
    for (let j = 0; j < H; j++) {
      f[j] = inside[j * W + c] ? BIG : 0;
    }
    edt1(f, H, d, v, z);
    for (let j = 0; j < H; j++) {
      g[j * W + c] = d[j];
    }
  }
  for (let j = 0; j < H; j++) {
    for (let c = 0; c < W; c++) {
      f[c] = g[j * W + c];
    }
    edt1(f, W, d, v, z);
    for (let c = 0; c < W; c++) {
      g[j * W + c] = d[c];
    }
  }
  let area = 0;
  const ridge: number[] = [];
  for (let j = 1; j < H - 1; j++) {
    for (let c = 1; c < W - 1; c++) {
      const i = j * W + c;
      if (!inside[i]) {
        continue;
      }
      area++;
      const r = g[i];
      if (
        r >= g[i - 1] &&
        r >= g[i + 1] &&
        r >= g[i - W] &&
        r >= g[i + W] &&
        r >= g[i - W - 1] &&
        r >= g[i - W + 1] &&
        r >= g[i + W - 1] &&
        r >= g[i + W + 1]
      ) {
        if (!skip?.([x0 + (c + 0.5) * STEP, y0 + (j + 0.5) * STEP])) {
          ridge.push(r);
        }
      }
    }
  }
  ridge.sort((p, q) => p - q);
  // A cell's distance is to the nearest outside cell's centre: the edge is half a cell nearer.
  const toPx = (r2: number) => (Math.sqrt(r2) - 0.5) * STEP;
  return {
    median: ridge.length ? toPx(ridge[ridge.length >> 1]) : NaN,
    max: ridge.length ? toPx(ridge[ridge.length - 1]) : NaN,
    area: area * STEP * STEP,
  };
}

/** Whether a shape's ink covers p (its fill rule; transforms applied; a stroke within half its width of its line). */
export function covers(attrs: Shapes[string], p: Pt): boolean {
  const { pts, pad } = ink(attrs);
  if (pad) {
    return pts.some((s) =>
      s.some((a, i) => {
        if (i === s.length - 1) {
          return false;
        }
        const b = s[i + 1];
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
        const L = dx * dx + dy * dy;
        const u = L
          ? Math.max(
              0,
              Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)
            )
          : 0;
        return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy) <= pad;
      })
    );
  }
  let wind = 0;
  let cross = 0;
  for (const s of pts) {
    for (let i = 0; i < s.length; i++) {
      const [a, b] = [s[i], s[(i + 1) % s.length]];
      if ((a[1] <= p[1] && b[1] > p[1]) || (b[1] <= p[1] && a[1] > p[1])) {
        const x = a[0] + ((p[1] - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
        if (x > p[0]) {
          cross++;
          wind += b[1] > a[1] ? 1 : -1;
        }
      }
    }
  }
  return attrs.fillRule === 'evenodd' ? cross % 2 === 1 : wind !== 0;
}
