/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Measures for the status-capable icons' cut (statusIcons.test.tsx):
 * a coverage raster of the cut base, and its slivers: ink a 1px-wide brush
 * can't reach (a raster opening by a disc of radius 0.5), plus small
 * islands the cut made, each as a connected area in px² (32px units).
 */
import type { Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { inkOf, type Region } from '../../utils/statusLayer';

export const RES = 8; // samples per unit
/** The sampled window: a square N samples wide from (LX, LY) (set per measure, round the zone). */
let LX = -3;
let LY = -3;
let N = 38 * RES;
export function setWindow(x0: number, y0: number, size: number) {
  [LX, LY, N] = [Math.floor(x0), Math.floor(y0), Math.ceil(size) * RES];
}

/** Painted coverage of shapes (marks excluded: keys starting "status-"), sampled RES per unit over -3…35. */
export function raster(
  shapes: Shapes,
  skip = (k: string) => k.startsWith('status-')
): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const [k, attrs] of Object.entries(shapes)) {
    if (skip(k) || Number(attrs.opacity ?? 1) === 0) {
      continue;
    }
    const r = inkOf(attrs);
    if (typeof r === 'string') {
      throw new Error(`${k}: ${r}`);
    }
    const edges: [number, number, number, number][] = [];
    for (const pts of r.rings) {
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % pts.length];
        if (a[1] !== b[1]) {
          edges.push([a[0], a[1], b[0], b[1]]);
        }
      });
    }
    for (let j = 0; j < N; j++) {
      const y = LY + (j + 0.5) / RES;
      const xs: [number, number][] = [];
      for (const [x0, y0, x1, y1] of edges) {
        if (y0 <= y !== y1 <= y) {
          xs.push([x0 + ((y - y0) * (x1 - x0)) / (y1 - y0), y1 > y0 ? 1 : -1]);
        }
      }
      if (!xs.length) {
        continue;
      }
      xs.sort((p, q) => p[0] - q[0]);
      let [w, c, m] = [0, 0, 0];
      for (let i = 0; i < N; i++) {
        const x = LX + (i + 0.5) / RES;
        while (m < xs.length && xs[m][0] < x) {
          [w, c, m] = [w + xs[m][1], c + 1, m + 1];
        }
        if (r.evenodd ? c % 2 : w) {
          ink[j * N + i] = 1;
        }
      }
    }
  }
  return ink;
}

/** Squared Euclidean distance transform (Felzenszwalb) of a binary image to its zero (`feature`) pixels. */
function edt(feature: (i: number) => boolean): Float64Array {
  const INF = 1e12;
  const d = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) {
    d[i] = feature(i) ? 0 : INF;
  }
  const f = new Float64Array(N);
  const z = new Float64Array(N + 1);
  const v = new Int32Array(N);
  const pass = (
    get: (k: number) => number,
    set: (k: number, x: number) => void
  ) => {
    for (let q = 0; q < N; q++) {
      f[q] = get(q);
    }
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < N; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < N; q++) {
      while (z[k + 1] < q) {
        k++;
      }
      set(q, (q - v[k]) ** 2 + f[v[k]]);
    }
  };
  for (let x = 0; x < N; x++) {
    pass(
      (k) => d[k * N + x],
      (k, val) => {
        d[k * N + x] = val;
      }
    );
  }
  for (let y = 0; y < N; y++) {
    pass(
      (k) => d[y * N + k],
      (k, val) => {
        d[y * N + k] = val;
      }
    );
  }
  return d;
}

/** The ink an opening by a disc of radius r (units) removes: thin parts, and tips. */
export function residue(ink: Uint8Array, r = 0.5): Uint8Array {
  const R2 = (r * RES) ** 2;
  const toBg = edt((i) => !ink[i]);
  const eroded = (i: number) => ink[i] === 1 && toBg[i] > R2;
  const toEroded = edt(eroded);
  const out = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) {
    if (ink[i] && toEroded[i] > R2) {
      out[i] = 1;
    }
  }
  return out;
}

/** Connected components (8-way) of a binary image: each as its pixel indices. */
export function components(img: Uint8Array): number[][] {
  const seen = new Uint8Array(N * N);
  const out: number[][] = [];
  for (let i = 0; i < N * N; i++) {
    if (!img[i] || seen[i]) {
      continue;
    }
    const comp: number[] = [];
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const p = stack.pop()!;
      comp.push(p);
      const [x, y] = [p % N, Math.floor(p / N)];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const [nx, ny] = [x + dx, y + dy];
          if (nx < 0 || ny < 0 || nx >= N || ny >= N) {
            continue;
          }
          const q = ny * N + nx;
          if (img[q] && !seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
    }
    out.push(comp);
  }
  return out;
}

const centre = (i: number): Pt => [
  LX + ((i % N) + 0.5) / RES,
  LY + (Math.floor(i / N) + 0.5) / RES,
];
function distToRegion(z: Region, [x, y]: Pt): number {
  // Signed: negative inside.
  const ar = z.reduce(
    (s, p, i) =>
      s + p[0] * z[(i + 1) % z.length][1] - z[(i + 1) % z.length][0] * p[1],
    0
  );
  let d = -Infinity;
  for (let i = 0; i < z.length; i++) {
    const [a, b] = [z[i], z[(i + 1) % z.length]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const s = ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) / l;
    d = Math.max(d, ar > 0 ? -s : s);
  }
  return d;
}

/**
 * The cut's slivers: the largest residue component (thin ink a 1px brush
 * can't reach) near the zone that the uncut base doesn't have, and the
 * smallest island the cut made (a connected piece of ink near the zone that
 * isn't one of the base's own), both in px² at 32px.
 */
export function slivers(
  base: Shapes,
  cut: Shapes,
  zone: Region | null
): { sliver: number; island: number; at?: Pt } {
  if (!zone) {
    return { sliver: 0, island: Infinity };
  }
  // A window round the zone: 4 past it each way (islands and slivers are measured within 2), within -3…35.
  const xs = zone.map((q) => q[0]);
  const ys = zone.map((q) => q[1]);
  const [x0, y0] = [
    Math.max(-3, Math.min(...xs) - 4),
    Math.max(-3, Math.min(...ys) - 4),
  ];
  const size = Math.max(
    Math.min(35, Math.max(...xs) + 4) - x0,
    Math.min(35, Math.max(...ys) + 4) - y0
  );
  setWindow(x0, y0, size);
  const [B, C] = [raster(base), raster(cut)];
  const near = (i: number) => distToRegion(zone, centre(i)) < 2;
  const [rb, rc] = [residue(B), residue(C)];
  let sliver = 0;
  let at: Pt | undefined;
  for (const comp of components(rc)) {
    if (!comp.some(near)) {
      continue;
    }
    // Thin in the base already (a sharp tip of Carbon's own) doesn't count.
    const own = comp.filter((i) => !rb[i]).length;
    const a = own / RES / RES;
    if (a > sliver) {
      [sliver, at] = [a, centre(comp[0])];
    }
  }
  const baseComps = new Map<number, number>();
  components(B).forEach((comp) =>
    comp.forEach((i) => baseComps.set(i, comp.length))
  );
  let island = Infinity;
  for (const comp of components(C)) {
    if (!comp.some(near)) {
      continue;
    }
    if (baseComps.get(comp[0]) === comp.length && comp.every((i) => B[i])) {
      continue;
    } // untouched
    if (
      comp.some(
        (i) => i % N === 0 || i % N === N - 1 || i < N || i >= N * (N - 1)
      )
    ) {
      continue;
    } // runs out of the window: not small
    island = Math.min(island, comp.length / RES / RES);
  }
  return { sliver, island, at };
}

/** How deep the deepest ink of `shapes` (marks excluded) lies inside the zone (0: none inside). */
export function deepestInk(shapes: Shapes, zone: Region | null): number {
  if (!zone) {
    return 0;
  }
  const xs = zone.map((q) => q[0]);
  const ys = zone.map((q) => q[1]);
  const [x0, y0] = [
    Math.max(-3, Math.min(...xs) - 1),
    Math.max(-3, Math.min(...ys) - 1),
  ];
  setWindow(
    x0,
    y0,
    Math.max(
      Math.min(35, Math.max(...xs) + 1) - x0,
      Math.min(35, Math.max(...ys) + 1) - y0
    )
  );
  const ink = raster(shapes);
  let deepest = 0;
  for (let i = 0; i < ink.length; i++) {
    if (ink[i]) {
      deepest = Math.max(deepest, -distToRegion(zone, centre(i)));
    }
  }
  return deepest;
}
