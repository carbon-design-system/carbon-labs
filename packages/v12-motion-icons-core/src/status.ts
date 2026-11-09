/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status layer's framework-free half (moved from
 * `@carbon-labs/react-motion-icons/src/utils/statusLayer.ts`, refactor stage 1):
 * flattening and the square cut, the marks and the count, the frames, the
 * timing plan, and the pip's geometry. The React components that drive it
 * (`makeStatusIcon`, `StatusPip`) stay in the React package, over the core's
 * StatusEngine / PipEngine (engine/status.ts).
 */
import type { Shapes } from './engine/shapes';
import { clipConvex, insetPoly, scalePts, type Pt } from './geometry';
import { cubicBezier, ENTRANCE, EXIT } from './ease';
import { motionTokens } from './tokens';

/**
 * The status layer: status as state on a frame icon.
 *
 * A status (success, warning, error, pending; a notification pip; a count
 * in a pill) is state that arrives on an icon: its mark sits in a corner
 * slot and the base is cut away round it, 4px clear, every wall ending
 * square where it first comes within the gap, at rest and in every frame of
 * every change. The 24 status-capable icons are built on it
 * (icons/statusIcons.ts: `<Save status="success" />`); `makeStatusIcon`
 * makes one from a plain icon, and `StatusPip` is a count on its own.
 *
 * The cut is geometry, with no masks, clip paths or boolean library:
 *  - the zone is the mark's ink grown by the gap, one convex region;
 *  - each painted shape is read as rings (a stroke as its outline: one
 *    convex piece per segment and join) and loses the zone exactly, as rings
 *    (`minusConvex`, Weiler–Atherton against a convex region);
 *  - each wall the zone reaches then ends square across itself
 *    (`squareCut`), its end piece taken off the same way; a part too small
 *    to read after the cut goes (`SLIVER_AREA`);
 *  - where the generic cut leaves part of an icon broken, the icon's
 *    placement carries a hand fix (`fix`, before the cut; icons/statusFixes.ts).
 * The cut is cached per frame (rest frames, and a turning spinner's).
 */

// ── Flattening ───────────────────────────────────────────────────────────────

export interface Sub {
  pts: Pt[];
  closed: boolean;
}

const TOL = 0.02;

function arcPts(
  p0: Pt,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  large: number,
  sweep: number,
  p1: Pt,
  tol: number
): Pt[] {
  let [rx, ry] = [Math.abs(rxIn), Math.abs(ryIn)];
  if (!rx || !ry || (p0[0] === p1[0] && p0[1] === p1[1])) {
    return [p1];
  }
  const phi = (phiDeg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const [dx, dy] = [(p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2];
  const [x1, y1] = [cos * dx + sin * dy, -sin * dx + cos * dy];
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    [rx, ry] = [rx * Math.sqrt(lambda), ry * Math.sqrt(lambda)];
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = Math.sqrt(Math.max(0, num / den)) * (large === sweep ? -1 : 1);
  const [cxp, cyp] = [(co * rx * y1) / ry, (-co * ry * x1) / rx];
  const [cx, cy] = [
    cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2,
    sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2,
  ];
  const ang = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dt = ang(
    (x1 - cxp) / rx,
    (y1 - cyp) / ry,
    (-x1 - cxp) / rx,
    (-y1 - cyp) / ry
  );
  if (!sweep && dt > 0) {
    dt -= 2 * Math.PI;
  }
  if (sweep && dt < 0) {
    dt += 2 * Math.PI;
  }
  const r = Math.max(rx, ry);
  const step = 2 * Math.acos(Math.max(-1, 1 - tol / r));
  const n = Math.max(1, Math.ceil(Math.abs(dt) / step));
  const out: Pt[] = [];
  for (let k = 1; k < n; k++) {
    const t = t1 + (dt * k) / n;
    out.push([
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ]);
  }
  out.push(p1);
  return out;
}

function bezPts(p: Pt[], tol: number): Pt[] {
  // Segment count from the control polygon's second differences.
  let dd = 0;
  for (let i = 0; i + 2 < p.length; i++) {
    dd = Math.max(
      dd,
      Math.hypot(
        p[i][0] - 2 * p[i + 1][0] + p[i + 2][0],
        p[i][1] - 2 * p[i + 1][1] + p[i + 2][1]
      )
    );
  }
  const n = Math.min(
    64,
    Math.max(1, Math.ceil(Math.sqrt((0.75 * (p.length - 2) * dd) / tol)))
  );
  const out: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    let q = p;
    while (q.length > 1) {
      q = q
        .slice(1)
        .map(
          (b, j) =>
            [
              q[j][0] + (b[0] - q[j][0]) * t,
              q[j][1] + (b[1] - q[j][1]) * t,
            ] as Pt
        );
    }
    out.push(q[0]);
  }
  return out;
}

/** Any SVG path (absolute or relative M L H V C S Q T A Z) as polylines, curves within `tol`. */
export function flattenPath(d: string, tol = TOL): Sub[] {
  const tok =
    d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Sub[] = [];
  let [i, cmd, prev] = [0, '', ''];
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let ctrl: Pt = [0, 0];
  let poly: Pt[] = [];
  const num = () => Number(tok[i++]);
  const flush = (closed: boolean) => {
    if (poly.length > 1) {
      out.push({ pts: poly, closed });
    }
    poly = [];
  };
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) {
      cmd = tok[i++];
    }
    const rel = cmd !== cmd.toUpperCase();
    const P = (): Pt => {
      const [x, y] = [num(), num()];
      return rel ? [cur[0] + x, cur[1] + y] : [x, y];
    };
    const C = cmd.toUpperCase();
    if (C === 'M') {
      flush(false);
      cur = P();
      start = cur;
      poly = [cur];
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      cur = P();
      poly.push(cur);
    } else if (C === 'H') {
      const x = num();
      cur = [rel ? cur[0] + x : x, cur[1]];
      poly.push(cur);
    } else if (C === 'V') {
      const y = num();
      cur = [cur[0], rel ? cur[1] + y : y];
      poly.push(cur);
    } else if (C === 'C' || C === 'S') {
      const c1: Pt =
        C === 'C'
          ? P()
          : /[CS]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const [c2, e] = [P(), P()];
      poly.push(...bezPts([cur, c1, c2, e], tol));
      [ctrl, cur] = [c2, e];
    } else if (C === 'Q' || C === 'T') {
      const c1: Pt =
        C === 'Q'
          ? P()
          : /[QT]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const e = P();
      poly.push(...bezPts([cur, c1, e], tol));
      [ctrl, cur] = [c1, e];
    } else if (C === 'A') {
      const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
      const e = P();
      poly.push(...arcPts(cur, rx, ry, rot, large, sweep, e, tol));
      cur = e;
    } else if (C === 'Z') {
      flush(true);
      cur = start;
      poly = [start];
    } else {
      throw new Error(`flattenPath: "${cmd}"`);
    }
    prev = C;
  }
  flush(false);
  return out;
}

// ── Strokes as outline pieces ────────────────────────────────────────────────

const area = (r: readonly Pt[]) =>
  r.reduce(
    (s, p, i) =>
      s + p[0] * r[(i + 1) % r.length][1] - r[(i + 1) % r.length][0] * p[1],
    0
  ) / 2;
/** Every piece wound the same way, so overlapping pieces add up (nonzero) instead of cancelling. */
const wind = (r: Pt[]) => (area(r) < 0 ? r.reverse() : r);

export type Join = 'miter' | 'round' | 'bevel';
export type Cap = 'butt' | 'round' | 'square';

function fan(c: Pt, r: number, a0: number, a1: number): Pt[] {
  let da = a1 - a0;
  while (da > Math.PI) {
    da -= 2 * Math.PI;
  }
  while (da < -Math.PI) {
    da += 2 * Math.PI;
  }
  const n = Math.max(
    1,
    Math.ceil(Math.abs(da) / (2 * Math.acos(Math.max(-1, 1 - TOL / r))))
  );
  return Array.from(
    { length: n + 1 },
    (_, k) =>
      [
        c[0] + r * Math.cos(a0 + (da * k) / n),
        c[1] + r * Math.sin(a0 + (da * k) / n),
      ] as Pt
  );
}

/**
 * A stroked centreline's ink as convex pieces (one quad per segment, one
 * wedge per join, a cap at each open end), all wound alike: painted
 * nonzero in one path, they are the stroke.
 */
export function strokePieces(
  subs: readonly Sub[],
  w: number,
  join: Join = 'miter',
  cap: Cap = 'butt',
  miterLimit = 4
): Pt[][] {
  const hw = w / 2;
  const pieces: Pt[][] = [];
  for (const sub of subs) {
    const pts = sub.pts.filter(
      (p, i, a) =>
        i === 0 || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 1e-9
    );
    if (
      sub.closed &&
      pts.length > 2 &&
      Math.hypot(
        pts[0][0] - pts[pts.length - 1][0],
        pts[0][1] - pts[pts.length - 1][1]
      ) < 1e-9
    ) {
      pts.pop();
    }
    if (pts.length < 2) {
      continue;
    }
    const n = pts.length;
    const segs = sub.closed ? n : n - 1;
    const dir = (i: number): Pt => {
      const [a, b] = [pts[i % n], pts[(i + 1) % n]];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    for (let i = 0; i < segs; i++) {
      const [a, b] = [pts[i], pts[(i + 1) % n]];
      const [ux, uy] = dir(i);
      const [nx, ny] = [-uy * hw, ux * hw];
      pieces.push(
        wind([
          [a[0] + nx, a[1] + ny],
          [b[0] + nx, b[1] + ny],
          [b[0] - nx, b[1] - ny],
          [a[0] - nx, a[1] - ny],
        ])
      );
    }
    // Joins at each interior vertex (every vertex, closed).
    const joins = sub.closed
      ? Array.from({ length: n }, (_, i) => i)
      : Array.from({ length: n - 2 }, (_, i) => i + 1);
    for (const v of joins) {
      const [u1, u2] = [dir((v - 1 + n) % n), dir(v)];
      const cross = u1[0] * u2[1] - u1[1] * u2[0];
      if (Math.abs(cross) < 1e-9 && u1[0] * u2[0] + u1[1] * u2[1] > 0) {
        continue;
      } // straight on
      const s = cross > 0 ? -1 : 1; // the outer side
      const b = pts[v];
      const o1: Pt = [b[0] - u1[1] * hw * s, b[1] + u1[0] * hw * s];
      const o2: Pt = [b[0] - u2[1] * hw * s, b[1] + u2[0] * hw * s];
      const cosT = u1[0] * u2[0] + u1[1] * u2[1];
      // A shallow turn (a flattened curve's) needs only its wedge: a round or
      // miter join there differs from it by under 0.02px.
      if (cosT > Math.cos(0.35)) {
        pieces.push(wind([b, o1, o2]));
        continue;
      }
      if (join === 'round') {
        pieces.push(
          wind([
            b,
            ...fan(
              b,
              hw,
              Math.atan2(o1[1] - b[1], o1[0] - b[0]),
              Math.atan2(o2[1] - b[1], o2[0] - b[0])
            ),
          ])
        );
        continue;
      }
      const miterLen = 1 / Math.sqrt(Math.max(1e-12, (1 + cosT) / 2)); // in half-widths
      if (join === 'miter' && miterLen <= miterLimit) {
        // The miter tip: o1 continued along u1 until it meets o2's line.
        const den = u1[0] * u2[1] - u1[1] * u2[0];
        const t = ((o2[0] - o1[0]) * u2[1] - (o2[1] - o1[1]) * u2[0]) / den;
        pieces.push(wind([b, o1, [o1[0] + u1[0] * t, o1[1] + u1[1] * t], o2]));
      } else {
        pieces.push(wind([b, o1, o2]));
      }
    }
    if (!sub.closed && cap !== 'butt') {
      for (const [p, u] of [
        [pts[0], dir(0).map((x) => -x) as unknown as Pt],
        [pts[n - 1], dir(n - 2)],
      ] as [Pt, Pt][]) {
        const [nx, ny] = [-u[1] * hw, u[0] * hw];
        if (cap === 'square') {
          pieces.push(
            wind([
              [p[0] + nx, p[1] + ny],
              [p[0] + nx + u[0] * hw, p[1] + ny + u[1] * hw],
              [p[0] - nx + u[0] * hw, p[1] - ny + u[1] * hw],
              [p[0] - nx, p[1] - ny],
            ])
          );
        } else {
          // A half disc from +n round through u to −n.
          const a = Math.atan2(ny, nx);
          pieces.push(wind([p, ...fan(p, hw, a, a - Math.PI)]));
        }
      }
    }
  }
  return pieces;
}

// ── Regions and the knockout ─────────────────────────────────────────────────

/** A convex region to cut away, as a polygon. */
export type Region = Pt[];

type Box = [x0: number, y0: number, x1: number, y1: number];
const bboxOf = (pts: readonly Pt[]): Box => {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of pts) {
    if (x < x0) {
      x0 = x;
    }
    if (y < y0) {
      y0 = y;
    }
    if (x > x1) {
      x1 = x;
    }
    if (y > y1) {
      y1 = y;
    }
  }
  return [x0, y0, x1, y1];
};
const meets = (a: Box, b: Box) =>
  a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

export const boxRegion = ([x0, y0, x1, y1]: readonly number[]): Region => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
/** A disc's region: the polygon just outside the circle, so the cut is never short of r. */
export function discRegion([cx, cy]: Pt, r: number, n = 48): Region {
  const R = r / Math.cos(Math.PI / n);
  return Array.from(
    { length: n },
    (_, i) =>
      [
        cx + R * Math.cos((2 * Math.PI * i) / n),
        cy + R * Math.sin((2 * Math.PI * i) / n),
      ] as Pt
  );
}
/** A convex polygon grown by `g` with round corners (its Minkowski sum with a disc): Carbon's offset cut. */
export function offsetRegion(pts: readonly Pt[], g: number): Region {
  const P = area(pts as Pt[]) < 0 ? [...pts].reverse() : [...pts];
  const out: Pt[] = [];
  const n = P.length;
  for (let i = 0; i < n; i++) {
    const [a, b, c] = [P[(i - 1 + n) % n], P[i], P[(i + 1) % n]];
    const na = Math.atan2(-(b[0] - a[0]), b[1] - a[1]); // outward normal of a→b (positive area, y down)
    const nb = Math.atan2(-(c[0] - b[0]), c[1] - b[1]);
    const R = g / Math.cos(Math.PI / 48);
    out.push(...fan(b, R, na, nb));
  }
  return out;
}

type Mat = [number, number, number, number, number, number];
const mul = (m: Mat, n: Mat): Mat => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
/** An SVG transform list (matrix, translate, scale, rotate, skewX/Y) as one matrix. */
export function parseTransform(t: string): Mat {
  let m: Mat = [1, 0, 0, 1, 0, 0];
  for (const [, fn, args] of t.matchAll(/(?<!\w)(\w+)\s*\(([^)]*)\)/g)) {
    const a = (
      args.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []
    ).map(Number);
    const rad = ((a[0] ?? 0) * Math.PI) / 180;
    let n: Mat = [1, 0, 0, 1, 0, 0];
    if (fn === 'matrix') {
      n = a as Mat;
    } else if (fn === 'translate') {
      n = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0];
    } else if (fn === 'scale') {
      n = [a[0], 0, 0, a[1] ?? a[0], 0, 0];
    } else if (fn === 'rotate') {
      const [c, s] = [Math.cos(rad), Math.sin(rad)];
      const [cx, cy] = [a[1] ?? 0, a[2] ?? 0];
      n = [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
    } else if (fn === 'skewX') {
      n = [1, 0, Math.tan(rad), 1, 0, 0];
    } else if (fn === 'skewY') {
      n = [1, Math.tan(rad), 0, 1, 0, 0];
    }
    m = mul(m, n);
  }
  return m;
}

/** A shape's outline as path data, whatever its tag (circle, ellipse, rect, line, polyline, polygon). */
function shapeD(attrs: Shapes[string]): string | null {
  const tag = String(attrs.tag ?? 'path');
  const n = (k: string, dflt = 0) => Number(attrs[k] ?? dflt);
  if (tag === 'path') {
    return String(attrs.d ?? '');
  }
  if (tag === 'circle' || tag === 'ellipse') {
    const [cx, cy] = [n('cx'), n('cy')];
    const [rx, ry] = tag === 'circle' ? [n('r'), n('r')] : [n('rx'), n('ry')];
    return rx > 0 && ry > 0
      ? `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`
      : '';
  }
  if (tag === 'rect') {
    const [x, y, w, h] = [n('x'), n('y'), n('width'), n('height')];
    const r = Math.min(n('rx', n('ry')), w / 2, h / 2);
    if (!r) {
      return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    }
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  }
  if (tag === 'line') {
    return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
  }
  if (tag === 'polyline' || tag === 'polygon') {
    return `M${String(attrs.points ?? '')}${tag === 'polygon' ? 'Z' : ''}`;
  }
  return null;
}

/** Subpaths cut into their dashes (pathLength scales the pattern; it restarts on each subpath). */
function dash(subs: Sub[], attrs: Shapes[string]): Sub[] {
  const pattern = String(attrs.strokeDasharray ?? 'none')
    .split(/[\s,]+/)
    .map(Number)
    .filter((v) => Number.isFinite(v));
  if (!pattern.length || pattern.every((v) => v <= 0)) {
    return subs;
  }
  const pat = pattern.length % 2 ? [...pattern, ...pattern] : pattern;
  const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const total = subs.reduce(
    (t, s) =>
      t +
      s.pts.slice(1).reduce((u, p, i) => u + segLen(s.pts[i], p), 0) +
      (s.closed ? segLen(s.pts[s.pts.length - 1], s.pts[0]) : 0),
    0
  );
  const k =
    attrs.pathLength !== undefined ? total / Number(attrs.pathLength) : 1;
  const period = pat.reduce((a, b) => a + b, 0) * k;
  const out: Sub[] = [];
  for (const s of subs) {
    const pts = s.closed ? [...s.pts, s.pts[0]] : s.pts;
    // Dash windows along this subpath, from the offset.
    let pos = -Number(attrs.strokeDashoffset ?? 0) * k;
    pos = ((pos % period) + period) % period; // where in the pattern the subpath starts
    const len = pts.slice(1).reduce((u, p, i) => u + segLen(pts[i], p), 0);
    const windows: [number, number][] = [];
    let [t, j] = [-pos, 0];
    while (t < len) {
      const on = pat[j % pat.length] * k;
      if (j % 2 === 0 && on > 0) {
        windows.push([Math.max(0, t), Math.min(len, t + on)]);
      }
      t += on;
      j++;
    }
    for (const [a, b] of windows) {
      if (b - a < 1e-6) {
        continue;
      }
      const piece: Pt[] = [];
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = segLen(pts[i - 1], pts[i]);
        const at = (u: number): Pt => [
          pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * u) / l,
          pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * u) / l,
        ];
        const [s0, s1] = [Math.max(a, acc), Math.min(b, acc + l)];
        if (s1 > s0 && l > 0) {
          if (!piece.length) {
            piece.push(at(s0 - acc));
          }
          piece.push(at(s1 - acc));
        }
        acc += l;
      }
      if (piece.length > 1) {
        out.push({ pts: piece, closed: false });
      }
    }
  }
  return out;
}

/** What a shape's attributes mean for the knockout (its ink as rings, and the fill rule they paint by), or why it can't be cut. */
export function inkOf(
  attrs: Shapes[string]
): { rings: Pt[][]; evenodd: boolean; d: string } | string {
  const d = shapeD(attrs);
  if (d === null) {
    return `<${String(attrs.tag)}>`;
  }
  const m = attrs.transform ? parseTransform(String(attrs.transform)) : null;
  const map = (subs: Sub[]) =>
    m
      ? subs.map((s) => ({
          ...s,
          pts: s.pts.map(
            ([x, y]) =>
              [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]] as Pt
          ),
        }))
      : subs;
  const stroked =
    attrs.stroke !== undefined &&
    attrs.stroke !== 'none' &&
    Number(attrs.strokeWidth ?? 1) > 0;
  if (stroked) {
    if (attrs.fill !== 'none') {
      return 'filled and stroked';
    }
    const join = String(attrs.strokeLinejoin ?? 'miter') as Join;
    const cap = String(attrs.strokeLinecap ?? 'butt') as Cap;
    const w =
      Number(attrs.strokeWidth ?? 1) *
      (m ? Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) : 1);
    return {
      rings: strokePieces(map(dash(flattenPath(d), attrs)), w, join, cap),
      evenodd: false,
      d,
    };
  }
  return {
    rings: map(flattenPath(d)).map((s) => s.pts),
    evenodd: attrs.fillRule === 'evenodd',
    d,
  };
}

const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4);
const ringD = (r: readonly Pt[]) =>
  r.length > 2 ? `M${r.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}Z` : '';

// ── Difference with a convex region ──────────────────────────────────────────

const EPS = 1e-7;

/**
 * A ring minus a convex region, as rings (Weiler–Atherton against a convex
 * clip): every stretch of the ring inside the region is replaced by the
 * region's own edge, so the result has no edges inside the region at all.
 * Each ring keeps its orientation (a hole stays a hole), so a path of
 * several rings paints, by its own fill rule, exactly its ink minus the
 * region. A region wholly inside the ring comes back as a hole.
 *
 * (Adding the clipped part back reversed is exact as winding, but leaves
 * pairs of cancelling edges inside the cut, which Chrome's analytic
 * anti-aliasing draws as faint hairlines.)
 */
export function minusConvex(P: readonly Pt[], Z: Region): Pt[][] {
  const sP = area(P as Pt[]);
  if (Math.abs(sP) < 1e-12 || Z.length < 3) {
    return [P as Pt[]];
  }
  const ring = sP > 0 ? [...P] : [...P].reverse();
  const Zp = area(Z) > 0 ? Z : [...Z].reverse();
  const n = ring.length;
  const ins = ring.map((p) => depth(Zp, p) > EPS);
  if (ins.every(Boolean)) {
    return [];
  }
  const per = perimeter(Zp);
  type X = { entry: boolean; p: Pt; ord: number; zs: number };
  const xs: X[] = [];
  for (let i = 0; i < n; i++) {
    const [a, b] = [ring[i], ring[(i + 1) % n]];
    const iv = inside(a, b, Zp);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!iv || (iv[1] - iv[0]) * l < 1e-9) {
      continue;
    }
    const at = (t: number): Pt => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
    if (!ins[i]) {
      const p = at(iv[0]);
      xs.push({ entry: true, p, ord: i + iv[0], zs: per.pos(p) });
    }
    if (!ins[(i + 1) % n]) {
      const p = at(iv[1]);
      xs.push({ entry: false, p, ord: i + iv[1], zs: per.pos(p) });
    }
  }
  const out = (loops: Pt[][]) =>
    sP > 0 ? loops : loops.map((r) => [...r].reverse());
  if (!xs.length) {
    // Disjoint, or the region wholly inside: then it's a hole (wound against the ring).
    const holds = Zp.every((q) => windingAt([ring], q) !== 0);
    return holds ? out([ring, [...Zp].reverse()]) : [P as Pt[]];
  }
  const byRing = [...xs].sort((a, b) => a.ord - b.ord);
  const byZone = [...xs].sort((a, b) => a.zs - b.zs);
  const nextOnRing = (x: X) => byRing[(byRing.indexOf(x) + 1) % byRing.length];
  const prevOnZone = (x: X) =>
    byZone[(byZone.indexOf(x) - 1 + byZone.length) % byZone.length];
  const ringBetween = (o0: number, o1: number): Pt[] => {
    // Vertices strictly after ord o0 up to ord o1 (forward, wrapping).
    const pts: Pt[] = [];
    const span = (((o1 - o0) % n) + n) % n;
    for (let k = Math.floor(o0) + 1; k <= Math.floor(o0) + n; k++) {
      const off = k - o0;
      if (off > 1e-9 && off < span - 1e-9) {
        pts.push(ring[k % n]);
      }
    }
    return pts;
  };
  const zoneBack = (s0: number, s1: number): Pt[] =>
    per.between(s1, s0).reverse(); // s0 → s1 against the region's winding
  const seen = new Set<X>();
  const loops: Pt[][] = [];
  for (const x0 of byRing) {
    if (x0.entry || seen.has(x0)) {
      continue;
    }
    const loop: Pt[] = [];
    let x = x0;
    for (let guard = 0; guard <= xs.length; guard++) {
      seen.add(x);
      const e = nextOnRing(x);
      if (!e.entry) {
        return fallbackDiff(ring, Zp, sP);
      }
      loop.push(x.p, ...ringBetween(x.ord, e.ord), e.p);
      seen.add(e);
      const nx = prevOnZone(e);
      if (nx.entry) {
        return fallbackDiff(ring, Zp, sP);
      }
      loop.push(...zoneBack(e.zs, nx.zs));
      x = nx;
      if (x === x0) {
        break;
      }
    }
    if (x !== x0) {
      return fallbackDiff(ring, Zp, sP);
    }
    const clean = loop.filter(
      (q, i) =>
        Math.hypot(
          q[0] - loop[(i + loop.length - 1) % loop.length][0],
          q[1] - loop[(i + loop.length - 1) % loop.length][1]
        ) > 1e-9
    );
    if (clean.length > 2 && Math.abs(area(clean)) > 1e-9) {
      loops.push(clean);
    }
  }
  return out(loops);
}
/** The spike's cancelling cut, for the rare ring the walk can't follow (a self-touching outline). */
function fallbackDiff(ring: Pt[], Zp: Region, sP: number): Pt[][] {
  const c = clipConvex(ring, Zp);
  const loops = c.length > 2 ? [ring, [...c].reverse()] : [ring];
  return sP > 0 ? loops : loops.map((r) => [...r].reverse());
}

/** Shapes the knockout couldn't cut (and why), from the last call; for the spike's coverage count. */
export const knockoutSkips: string[] = [];

/**
 * Every shape cut by `region`: base − region, as geometry. Shapes clear of
 * the region come back untouched (curves and all). Cut shapes come back as
 * filled paths (a stroke becomes its outline). Shapes it can't read (a
 * transform, a dash, another tag) come back untouched, and are listed in
 * `knockoutSkips`.
 */
export function knockout(base: Shapes, region: Region | null): Shapes {
  knockoutSkips.length = 0;
  const rb = region && region.length > 2 ? bboxOf(region) : null;
  const out: Shapes = {};
  for (const [k, attrs] of Object.entries(base)) {
    const ink = inkOf(attrs);
    if (typeof ink === 'string') {
      knockoutSkips.push(`${k}: ${ink}`);
      out[k] = attrs;
      continue;
    }
    // Another tag becomes a path at every frame (an element's tag can't change mid-animation).
    const asPath = (extra: Record<string, string | number>) => {
      const {
        tag: _t,
        cx: _1,
        cy: _2,
        r: _3,
        rx: _4,
        ry: _5,
        x: _6,
        y: _7,
        width: _8,
        height: _9,
        x1: _a,
        y1: _b,
        x2: _c,
        y2: _d,
        points: _e,
        ...rest
      } = attrs;
      void [_t, _1, _2, _3, _4, _5, _6, _7, _8, _9, _a, _b, _c, _d, _e];
      return { ...rest, ...extra };
    };
    const hw =
      attrs.stroke !== undefined && attrs.stroke !== 'none'
        ? Number(attrs.strokeWidth ?? 1) / 2
        : 0;
    const all = ink.rings.flat();
    const sb = all.length ? bboxOf(all) : null;
    if (
      !rb ||
      !sb ||
      !meets([sb[0] - hw, sb[1] - hw, sb[2] + hw, sb[3] + hw], rb)
    ) {
      // Clear of the region: as it was (fill rule made explicit so a later cut frame can't leave it stale).
      out[k] = asPath({
        d: ink.d,
        fillRule: ink.evenodd ? 'evenodd' : 'nonzero',
      });
      continue;
    }
    let d = '';
    for (const raw of ink.rings) {
      // Round first, so the reversed copy runs exactly along the ring's own (rounded) edges.
      const ring = raw.map(([x, y]) => [+fmt(x), +fmt(y)] as Pt);
      if (!meets(bboxOf(ring), rb)) {
        d += ringD(ring);
        continue;
      }
      for (const r of minusConvex(ring, region!)) {
        d += ringD(r);
      }
    }
    out[k] = asPath({
      d,
      fill: 'currentColor',
      stroke: 'none',
      strokeDasharray: 'none',
      fillRule: ink.evenodd ? 'evenodd' : 'nonzero',
      ...(attrs.transform ? { transform: '' } : {}),
    });
  }
  return out;
}

// ── Placement ────────────────────────────────────────────────────────────────

export type Corner = 'br' | 'tr' | 'bl' | 'tl';
export type Status =
  | 'none'
  | 'success'
  | 'notification'
  | 'pending'
  | 'warning'
  | 'error';
/** What a status-capable icon shows: a status, or a count in a pill (the notification icons' count). */
export type Mark = Status | 'count';
export type Mode = 'box' | 'offset';

export interface Placement {
  /** Which corner the mark sits in (default 'br', Carbon's usual). */
  corner?: Corner;
  /** The glyph marks' square slot (default 12: Carbon's --check / --warning / --error marks, x 18–30). */
  slot?: number;
  /** The pip's diameter (default 8: notification--new, email--new, result--new). */
  pip?: number;
  /** How far the slot sits in from the frame edge (default 2; notification--new's pip: 4 from the top). */
  inset?: number | [x: number, y: number];
  /** The space kept round the mark (default 2). */
  gap?: number;
  /**
   * How the cut is shaped. Unset (every icon but the four below): the mark's
   * ink grown by the gap, walls cut square (squareCut). The two modes are
   * Carbon's own status drawings, for the bases Carbon draws them for
   * (checkmark--outline--warning, in-progress--error, …):
   *  - 'box': the mark's slot grown by the gap and run out past the frame on
   *    its frame sides, its inner corner cut off `gap` along each side (so a
   *    glyph inside the base, clear of the mark, isn't touched); walls end
   *    square on it. On a ring centred on the box's corner (Carbon's badge
   *    ring, 14,14) that's Carbon's quarter cut.
   *  - 'offset': the mark's ink grown by the gap (the check: its slot's
   *    disc), run out to the frame corner (the hull of the two, as Carbon's
   *    checkmark--filled--error cuts its disc), and the cut follows it: no
   *    square ends.
   */
  mode?: Mode;
  /** Base shape keys hidden while a mark shows (for a base whose badge drawing drops a part, as document--add drops the lines). */
  drop?: string[];
  /** The count pill's inset from its corner (default [0, 0]: flush with the frame's corner, as a badge sits). */
  countInset?: [x: number, y: number];
  /** 'overhang': the count pill hangs off the frame's corner (see CountPlacement). */
  countAt?: CountPlacement;
  /**
   * The widest count text that may sit 'inside' on this icon (by width: '9'
   * one figure, '99' two): wider, the count overhangs whatever was asked,
   * because inside it would erase the icon's figure (User's head). `''`:
   * this icon never takes counts inside. Unset: any.
   */
  insideMax?: string;

  /**
   * A hand fix: the base's shapes adjusted while a mark shows, before the
   * square cut (for an icon the generic cut leaves a broken part on). Same
   * keys out as in; at `k` 0 (no cut) it must return the shapes unchanged.
   */
  fix?: (shapes: Shapes, c: FixContext) => Shapes;
}

/** What a hand fix is told about the frame. */
export interface FixContext {
  /** The mark whose zone is cut, and while it morphs in (`km` 0 → 1), the mark it morphs from. */
  mark: Mark;
  from: Mark;
  km: number;
  /** How far the cut is open (0 none, 1 full). */
  k: number;
  /** Hover progress. */
  h: number;
  size?: number;
  /** The zone this frame cuts (the mark's, as far as it's open). */
  zone: Region;
}

/** The square a mark of size s occupies in a corner. */
export function slotBox(p: Placement, s: number): Box {
  const corner = p.corner ?? 'br';
  const [ix, iy] = Array.isArray(p.inset)
    ? p.inset
    : [p.inset ?? 2, p.inset ?? 2];
  const x0 = corner.endsWith('r') ? 32 - ix - s : ix;
  const y0 = corner.startsWith('b') ? 32 - iy - s : iy;
  return [x0, y0, x0 + s, y0 + s];
}
const centreOf = (b: Box): Pt => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

/** The mark's footprint for a status: its slot (a disc for the round marks). */
function footprint(
  p: Placement,
  s: Status
): { box: Box; disc?: { c: Pt; r: number } } {
  if (s === 'notification') {
    const box = slotBox(p, p.pip ?? 8);
    return { box, disc: { c: centreOf(box), r: (box[2] - box[0]) / 2 } };
  }
  const box = slotBox(p, p.slot ?? 12);
  return {
    box,
    disc:
      s === 'warning' || s === 'success'
        ? undefined
        : { c: centreOf(box), r: (box[2] - box[0]) / 2 },
  };
}

/**
 * The knockout region for a status at full size, as four numbers, so a frame
 * can tween it. Box mode (x0 y0 x1 y1): the slot grown by the gap, its sides
 * at the frame edge pushed out past the frame (so nothing is left between
 * the mark and the edge). Offset mode (cx cy r reach): the mark's disc grown
 * by the gap, run out to the frame corner (`reach` 1) as Carbon's
 * checkmark--filled--error cuts its disc: the convex hull of the grown disc
 * and the corner.
 */
export function regionNums(
  p: Placement,
  s: Status
): [number, number, number, number] {
  const g = p.gap ?? 2;
  const { box, disc } = footprint(p, s);
  if ((p.mode ?? 'box') === 'offset') {
    // A glyph mark without a disc (check, triangle) takes its slot's inscribed disc.
    const d = disc ?? { c: centreOf(box), r: (box[2] - box[0]) / 2 };
    return [d.c[0], d.c[1], d.r + g, 1];
  }
  const edge = (v: number, out: number) => (v <= 4 || v >= 28 ? out : v);
  return [
    edge(box[0] - g, -8),
    edge(box[1] - g, -8),
    edge(box[2] + g, 40),
    edge(box[3] + g, 40),
  ];
}
/** A status's mark centre. */
export function markCentre(p: Placement, s: Mark): Pt {
  if (s === 'count') {
    return countCentre(p, COUNT.h);
  }
  return s === 'notification'
    ? footprint(p, 'notification').disc!.c
    : centreOf(slotBox(p, p.slot ?? 12));
}
/** The disc the mark grows in (centre and radius, the gap included): the opening cut always holds it. */
export function markDisc(p: Placement, s: Status): [number, number, number] {
  const { box, disc } = footprint(p, s);
  const d = disc ?? { c: centreOf(box), r: (box[2] - box[0]) / 2 };
  return [d.c[0], d.c[1], d.r + (p.gap ?? 2)];
}
/**
 * Where a status's cut opens from. Box mode: the frame's corner behind the
 * mark, so the base's corner goes first and its wall ends then draw back
 * towards the cut lines (opening from the mark's centre left the corner as
 * an island for a frame or two). Offset mode: the mark's centre.
 */
export function revealCentre(p: Placement, s: Mark): Pt {
  if ((p.mode ?? 'box') === 'offset') {
    return markCentre(p, s);
  }
  const corner = p.corner ?? 'br';
  return [corner.endsWith('r') ? 32 : 0, corner.startsWith('b') ? 32 : 0];
}

function hull(pts: Pt[]): Pt[] {
  const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const h: Pt[] = [];
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) {
        h.pop();
      }
      h.push(p);
    }
    h.pop();
    return h;
  };
  return [...half(P), ...half(P.reverse())];
}

/**
 * The region at a frame: `n` its full-size numbers (regionNums), `c` the
 * point it opens from (revealCentre) and `k` how far open it is (0 closed, 1
 * full).
 *
 * Box mode opens as a disc about `c`, clipped to the full box,
 * so its fixed edges never move: a box growing from the centre would sweep
 * its edges along the walls that lie parallel to them, thinning each to a
 * hairline as it passes (the first build did, on Save's label and
 * Document's lines). A disc only ever crosses a straight wall at an angle,
 * so walls break through and their ends draw back. Offset mode grows the
 * grown disc (and its run to the corner) from the centre.
 */
export function regionOf(
  n: readonly number[],
  p: Placement = {},
  c?: Pt,
  k = 1,
  mark?: readonly number[]
): Region | null {
  if (k <= 1e-3) {
    return null;
  }
  if ((p.mode ?? 'box') === 'offset') {
    const [cx, cy] = n;
    const [r, reach] = [n[2] * k, n[3] * k];
    if (r <= 1e-3) {
      return null;
    }
    const disc = discRegion([cx, cy], r);
    if (reach <= 1e-3) {
      return disc;
    }
    // Run out to the corner: the grown disc's box, its frame-side edges pushed past the frame.
    const corner = p.corner ?? 'br';
    const fx = corner.endsWith('r')
      ? cx + (40 - cx) * reach
      : cx - (cx + 8) * reach;
    const fy = corner.startsWith('b')
      ? cy + (40 - cy) * reach
      : cy - (cy + 8) * reach;
    const [nx, ny] = [
      corner.endsWith('r') ? cx - r : cx + r,
      corner.startsWith('b') ? cy - r : cy + r,
    ];
    return hull([...disc, [fx, ny], [fx, fy], [nx, fy]]);
  }
  if (n[2] - n[0] <= 1e-3 || n[3] - n[1] <= 1e-3) {
    return null;
  }
  const box = boxRegion(n);
  if (k >= 1 - 1e-6 || !c) {
    return box;
  }
  // The disc that just covers the box (within the frame) at k = 1.
  const [x0, y0, x1, y1] = [
    Math.max(n[0], -1),
    Math.max(n[1], -1),
    Math.min(n[2], 33),
    Math.min(n[3], 33),
  ];
  const cover = Math.max(
    ...[
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ].map(([x, y]) => Math.hypot(x - c[0], y - c[1]))
  );
  // Opening from the corner, but never behind the mark: the hull of the corner's
  // disc and the mark's own disc (grown by the gap) as it grows from its centre.
  const reveal = mark
    ? hull([
        ...discRegion(c, cover * k, 32),
        ...discRegion([mark[0], mark[1]], mark[2] * k, 32),
      ])
    : discRegion(c, cover * k);
  const cut = clipConvex(box, reveal);
  return cut.length > 2 ? cut : null;
}

// ── Marks ────────────────────────────────────────────────────────────────────

const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;
const dot = ([cx, cy]: Pt, r: number) =>
  r > 1e-3
    ? `M${fmt(cx - r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx + r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx - r)} ${fmt(cy)}Z`
    : '';
const poly = (pts: readonly Pt[], close = false) =>
  `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}${close ? 'Z' : ''}`;
const scaleAbout = (pts: readonly Pt[], c: Pt, s: number) =>
  pts.map(([x, y]) => [c[0] + (x - c[0]) * s, c[1] + (y - c[1]) * s] as Pt);

/**
 * Carbon's corner check (data--check, mobile--check: the 2px band from
 * 19,26 to 23,30 to 30,23) as its centreline, for the 12px slot at 18–30.
 */
export const CORNER_CHECK: Pt[] = [
  [19.705, 25.295],
  [23, 28.59],
  [29.295, 22.295],
];
/** Carbon's corner warning (checkmark--filled--warning, event--warning): a 2px triangle, round outer corners, sharp inner ones. */
export const CORNER_TRIANGLE: Pt[] = [
  [24, 19],
  [19, 29],
  [29, 29],
];
/** The triangle's visual centre (centroid). */
const TRI_C: Pt = [24, 77 / 3];
/**
 * The pending spinner: an arc of the mark's ring, butt ends, turning clockwise once per SPIN_MS and swinging, its head
 * and tail moving apart and back about its middle, so the turn itself stays steady.
 *  - `arc`: the arc's share of the ring, about which it swings;
 *  - `swing`: how far it swings either side, as a share of the ring (0: a fixed arc);
 *  - `swingPeriods`: the swing's clock, in turns (SPIN_MS each), a sine.
 */
export const PENDING_SPINNER = {
  arc: 0.5,
  swing: 0.1,
  swingPeriods: 2.5,
} as const;
/** The mark's ring: its centreline's radius (outer edge 6, the slot, at the 2px line). */
const SPIN_R = 5;
/**
 * One turn, ms: the loading clock, the skeleton wave's period (`SKELETON_WAVE.periodMs` in @carbon-labs/motion-core). A
 * loop's period, not a transition, so not a duration token. It's a number here because the wave lives in a module the
 * icons don't bundle; test/pendingSpinner.test.ts keeps the two equal.
 */
export const SPIN_MS = 1000;
/**
 * The shared phase: how far round its turn every spinner on the page is at time `t` (ms on the document timeline,
 * `performance.now()`'s clock): `(t mod period) / period`. A spinner that starts later joins in step, so two side by
 * side always point the same way. At phase 0 the arc's middle is at 3 o'clock, its head half its share on, clockwise.
 * The swing runs on the same timeline (`spinPhase(t, SWING_MS)`), so spinners side by side also swing in step.
 */
export function spinPhase(t: number, period = SPIN_MS): number {
  const p = Math.abs(period);
  return (((t % p) + p) % p) / p;
}
/** One swing of the arc, ms: `swingPeriods` turns. */
export const SWING_MS = SPIN_MS * PENDING_SPINNER.swingPeriods;
/** The arc's share of the ring at swing phase `q` (0–1, `spinPhase(t, SWING_MS)`): a sine about `arc`, `swing` either side. */
export function spinShare(q: number): number {
  return (
    PENDING_SPINNER.arc + PENDING_SPINNER.swing * Math.sin(2 * Math.PI * q)
  );
}
/** Match cut (Play ⇄ Pause): an outgoing mark shrinks to this, the incoming one starts at it. */
const MATCH = 0.6;
/** The space between a mark and the cut base: 4px, for legibility. */
export const GAP = 4;
/*
 * No hover while a status shows: neither the mark nor the base moves, so the
 * cut is fixed. (A mark hover's growing zone would notch the walls.)
 */

/**
 * The count pill on an icon: Carbon's small numerals at full size (6 × 10,
 * 2px walls, as StatusPip), knocked out of a pill 14 tall, so a 2px rim
 * holds round them: at 16px the figures are 3 × 5 device pixels with 1px
 * walls, the smallest that reads. One figure makes a disc (14); each more
 * adds 8 (6 + its 2px gap): "9+" is 22 wide, "99+" 30. The pill sits flush
 * in its corner (`countInset`), and a changed figure rolls 10 (out of the
 * pill's 10px inside).
 */
export const COUNT = { h: 14, fig: 6, gap: 2, pad: 4, rim: 2, roll: 10 };
/**
 * Where the count pill sits: 'overhang' (the icons' default) hangs it off the frame's corner, its end cap's centre 1 in from
 * the corner each way, so the pill reaches 6 past the frame on two sides and
 * grows inwards from there; 'inside' sits it flush in its corner of the 32
 * frame. The placement never changes with the count.
 */
export type CountPlacement = 'overhang' | 'inside';
/**
 * Where a count actually sits: as asked (overhang by default), except that
 * an icon whose placement caps `insideMax` keeps a wider count (or, with
 * `''`, every count) overhanging, where inside would erase its figure.
 */
export function countAt(
  p: Placement,
  asked: CountPlacement | undefined,
  text: string
): CountPlacement {
  if ((asked ?? 'overhang') !== 'inside') {
    return 'overhang';
  }
  if (p.insideMax === undefined) {
    return 'inside';
  }
  return p.insideMax !== '' &&
    countWidth(text || '1') <= countWidth(p.insideMax)
    ? 'inside'
    : 'overhang';
}
/** The only size a count shows its number at (at 16–24 the figures don't read); below it, a count is the pip. */
export const COUNT_SIZE = 32;
export const OVERHANG = 1;
export const countWidth = (text: string) =>
  Math.max(
    COUNT.h,
    text.length * COUNT.fig +
      Math.max(0, text.length - 1) * COUNT.gap +
      2 * COUNT.pad
  );
/** The count pill's centre at width w (its corner edges fixed, so a longer count grows inwards). */
export function countCentre(p: Placement, w: number): Pt {
  const corner = p.corner ?? 'br';
  const [ix, iy] =
    p.countAt === 'overhang'
      ? [OVERHANG - COUNT.h / 2, OVERHANG - COUNT.h / 2]
      : (p.countInset ?? [0, 0]);
  return [
    corner.endsWith('r') ? 32 - ix - w / 2 : ix + w / 2,
    corner.startsWith('b') ? 32 - iy - COUNT.h / 2 : iy + COUNT.h / 2,
  ];
}
/** A stadium (w × hgt about c) as a convex polygon, grown by g (negative: inset). */
export function stadium([cx, cy]: Pt, w: number, hgt: number, g = 0): Pt[] {
  const r = hgt / 2 + g;
  if (r <= 1e-3) {
    return [];
  }
  const half = Math.max(0, w / 2 - hgt / 2);
  const R = r / Math.cos(Math.PI / 48);
  const cap = (x: number, from: number) =>
    Array.from(
      { length: 25 },
      (_, i) =>
        [
          x + R * Math.cos(from + (Math.PI * i) / 24),
          cy + R * Math.sin(from + (Math.PI * i) / 24),
        ] as Pt
    );
  return half > 1e-6
    ? [...cap(cx + half, -Math.PI / 2), ...cap(cx - half, Math.PI / 2)]
    : discRegion([cx, cy], r);
}
/** The count's width at a roll (the pill stretches between its two widths at constant height). */
export const countWidthAt = (t: Partial<CountText> & { nt?: number }) => {
  const [a, b] = [
    countWidth(t.nFrom || '1'),
    countWidth(t.nTo || t.nFrom || '1'),
  ];
  return a + (b - a) * (t.nt ?? 1);
};

/** A mark frame: each mark's numbers (0 = absent). */
export interface MarkFrame {
  /** Check: drawn end and wiped start (pathLength 1), as CheckmarkOutlineToggle. */
  cp: number;
  ce: number;
  /** Pip: radius fraction. */
  pp: number;
  /** Spinner: sweep presence, its tail's retreat (exit), the turn (0–1) and the swing (0–1). */
  sp: number;
  se: number;
  sa: number;
  sw: number;
  /** Warning and error: match-cut presence. */
  wp: number;
  ep: number;
  /** Static pending mark (reduced motion): the three dots. */
  dp: number;
  /** Count pill: presence (it grows from its centre) and the figures' roll (0–1, from `nFrom` to `nTo`). */
  np: number;
  nt: number;
  /**
   * The mark's hover (0–1), for the status aliases only (Carbon's static
   * status names, which hover as Carbon's badges do): the warning triangle
   * grows WARN_GROW about its centroid, the error ring ERROR_GROW in radius
   * with its slash. Unset is 0; the status-capable icons hold still.
   */
  mh?: number;
}

/** The warning's mark hover: 14% about its centroid at constant weight (WarningAlt's, and the batch-3 warning badges'). */
export const WARN_GROW = 0.14;
/** The error's mark hover: its ring 1px larger in radius at its 2px weight, the slash with it (Error's, and the batch-3 error badges'). */
export const ERROR_GROW = 1;

/** A count's texts through a roll: from, to, and which way the figures roll (+1 up, counting up). */
export interface CountText {
  nFrom: string;
  nTo: string;
  nDir: number;
}

export type Tone = 'error' | 'warning' | 'success' | 'info';
/**
 * Carbon's support colours as theme custom properties, with the white
 * theme's values as fallbacks, so a mark or pill follows the active theme
 * (g10: #da1e28 / #f1c21b / #24a148 / #0043ce; g100: #fa4d56 / #f1c21b /
 * #42be65 / #4589ff).
 */
export const TONE: Record<Tone | 'interactive', string> = {
  error: 'var(--cds-support-error, #da1e28)',
  warning: 'var(--cds-support-warning, #f1c21b)',
  success: 'var(--cds-support-success, #24a148)',
  info: 'var(--cds-support-info, #0043ce)',
  interactive: 'var(--cds-interactive, #0f62fe)',
};

/**
 * The toned warning, filled as Carbon fills it. With `tone`,
 * the warning mark is Carbon's WarningAltFilled at the mark's size, built as
 * Carbon builds it: a solid triangle in the support yellow with its "!"
 * knocked out, and the "!" painted into the hole in this colour (Carbon's
 * inner path on its warning notifications, `$black-100`, the same on every
 * theme). The dark "!" carries the contrast: about 12.5:1 on the yellow,
 * which is itself about 1.7:1 on white. Under forced colors the "!" path
 * goes and the hole shows the page through the triangle (forcedColors.ts).
 * Untoned, the warning is the outline in currentColor.
 */
export const WARN_BANG = '#000000';
/**
 * Carbon's WarningAltFilled (32px art): its triangle's centreline runs
 * (16,4) (3,29) (29,29) with 1px round corners, the corner mark's (24,19)
 * (19,29) (29,29), so its glyph comes over at 10/25. Its "!": a bar 2.25
 * wide and 9 long, a 2 gap, a dot r 1.5 whose foot is 4 above the
 * triangle's outer base.
 */
const CARBON_BANG = { bar: 2.25, len: 9, gap: 2, dot: 1.5, foot: 4 } as const;
const BANG_K = 10 / 25;

/**
 * The toned warning's "!" at a size, its triangle scaled `s` about its
 * centroid `c` (`base`: the triangle's outer base at rest). Carbon's glyph at
 * the mark's scale, with floors of one CSS pixel on the bar's width and the
 * gap (at 16px the scaled bar would be under half a pixel), and Carbon's
 * dot-to-bar ratio kept. As the triangle grows (the match cut), the glyph's
 * ends scale with it and its weights hold, as every status glyph does; the
 * gap holds too, so the "!" never runs together.
 */
export function warnBang(
  c: Pt,
  base: number,
  s: number,
  size = 32
): { bar: [number, number, number, number] | null; dot: Pt; r: number } {
  const q = 32 / size;
  const bw = Math.max(CARBON_BANG.bar * BANG_K, q);
  const r = Math.max(
    CARBON_BANG.dot * BANG_K,
    (bw * CARBON_BANG.dot) / CARBON_BANG.bar
  );
  const gap = Math.max(CARBON_BANG.gap * BANG_K, q);
  const dotY = base - CARBON_BANG.foot * BANG_K - r;
  const top = dotY - r - gap - CARBON_BANG.len * BANG_K;
  const at = (y: number) => c[1] + (y - c[1]) * s;
  const [y0, d] = [at(top), at(dotY)];
  const y1 = d - r - gap;
  return {
    bar: y1 - y0 > 1e-3 ? [c[0] - bw / 2, y0, c[0] + bw / 2, y1] : null,
    dot: [c[0], d],
    r,
  };
}

/** A triangle's centreline (apex, then its base corners) grown by `g` with round corners (a stroke's outer edge), as path data. */
function roundedTriD(pts: readonly Pt[], g: number): string {
  const n = pts.length;
  const off = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [(-(b[1] - a[1]) / l) * g, ((b[0] - a[0]) / l) * g];
    return [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
    ] as [Pt, Pt];
  });
  const P = ([x, y]: Pt) => `${fmt(x)} ${fmt(y)}`;
  let d = `M${P(off[0][0])}`;
  for (let i = 0; i < n; i++) {
    d += `L${P(off[i][1])}A${fmt(g)} ${fmt(g)} 0 0 0 ${P(off[(i + 1) % n][0])}`;
  }
  return `${d}Z`;
}

/** Where a status's mark sits (the glyph centrelines, the discs' radii). */
function markGeometry(p: Placement) {
  const slot = slotBox(p, p.slot ?? 12);
  const [dx, dy] = [slot[0] - 18, slot[1] - 18];
  const mv = (pts: readonly Pt[]) =>
    pts.map(([x, y]) => [x + dx, y + dy] as Pt);
  const c = centreOf(slot);
  const pip = footprint(p, 'notification').disc!;
  return {
    c,
    check: mv(CORNER_CHECK),
    triangle: mv(CORNER_TRIANGLE),
    triC: [TRI_C[0] + dx, TRI_C[1] + dy] as Pt,
    pip: { c: pip.c, r: pip.r },
    ring: 5, // the error ring's centreline
  };
}

/** A stadium as path data (arcs), w × hgt about c. */
function stadiumD([cx, cy]: Pt, w: number, hgt: number): string {
  if (hgt <= 1e-3) {
    return '';
  }
  const r = hgt / 2;
  const half = Math.max(0, w / 2 - r);
  if (half < 1e-6) {
    return dot([cx, cy], r);
  }
  const [x0, x1, y0, y1] = [cx - half, cx + half, cy - r, cy + r];
  return `M${fmt(x0)} ${fmt(y0)}H${fmt(x1)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x1)} ${fmt(y1)}H${fmt(x0)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x0)} ${fmt(y0)}Z`;
}

/**
 * The count pill at a frame: the pill with the figures knocked out (even-odd). Changed figures roll (`nt`, `nDir`)
 * and are cut 2px inside the pill's edge, so a cut lands on its rim; as the
 * pill grows in (`np`, from its centre) the figures, at full size, are cut
 * to it. Figures never scale.
 */
export function countD(
  p: Placement,
  m: Partial<CountText> & { np: number; nt: number }
): string {
  if (m.np <= 1e-3 || !m.nTo) {
    return '';
  }
  const from = m.nFrom || m.nTo;
  const to = m.nTo;
  const w = countWidthAt({ nFrom: from, nTo: to, nt: m.nt });
  const c = countCentre(p, w);
  const inner = stadium(c, w, COUNT.h, -COUNT.rim);
  const fill = m.np < 1 ? stadium(c, w * m.np, COUNT.h * m.np) : null;
  const xs = (text: string) => {
    const tw = text.length * COUNT.fig + (text.length - 1) * COUNT.gap;
    return [...text]
      .map((_, i) => c[0] - tw / 2 + i * (COUNT.fig + COUNT.gap))
      .reverse(); // units first
  };
  const [xa, xb] = [xs(from), xs(to)];
  let figs = '';
  const glyph = (ch: string, x: number, dy: number) => {
    for (const ring of NUM_RINGS[ch] ?? []) {
      let moved = ring.map(
        ([px, py]) => [px - 13 + x, py - 11 + c[1] - 5 + dy] as Pt
      );
      if (Math.abs(dy) > 1e-6) {
        moved = clipConvex(moved, inner);
      }
      if (fill) {
        moved = fill.length > 2 ? clipConvex(moved, fill) : [];
      }
      figs += ringD(moved);
    }
  };
  const dir = m.nDir ?? 1;
  const n = Math.max(from.length, to.length);
  for (let i = 0; i < n; i++) {
    const [a, b] = [from[from.length - 1 - i], to[to.length - 1 - i]];
    const [x0, x1] = [xa[i] ?? xb[i], xb[i] ?? xa[i]];
    const x = x0 + (x1 - x0) * m.nt;
    if (a === b) {
      glyph(a, x, 0);
    } else {
      if (a !== undefined && m.nt < 1) {
        glyph(a, x, -dir * COUNT.roll * m.nt);
      }
      if (b !== undefined && m.nt > 0) {
        glyph(b, x, dir * COUNT.roll * (1 - m.nt));
      }
    }
  }
  return stadiumD(c, w * m.np, COUNT.h * m.np) + figs;
}

export function markShapes(
  p: Placement,
  m: MarkFrame & Partial<CountText>,
  tone: boolean | Tone = false,
  size = 32
): Shapes {
  const g = markGeometry(p);
  const { c } = g;
  // Spinner: an arc of the r=5 centreline (outer r 6, the slot). At turn 0 its middle is at 3 o'clock; its head leads by
  // half its share. Entering, the tail lengthens back from the head; leaving, it catches the head up (an exit from the
  // start).
  const share = spinShare(m.sw);
  const head = 2 * Math.PI * (m.sa + share / 2);
  const sweep = 2 * Math.PI * share * Math.max(0, m.sp - m.se);
  const at = (a: number) =>
    `${fmt(c[0] + SPIN_R * Math.cos(a))} ${fmt(c[1] + SPIN_R * Math.sin(a))}`;
  const arc =
    sweep > 1e-3
      ? `M${at(head - sweep)}A${SPIN_R} ${SPIN_R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${at(head)}`
      : '';
  const ms = (v: number) => MATCH + (1 - MATCH) * v;
  const mh = m.mh ?? 0;
  const triS = ms(m.wp) * (1 + WARN_GROW * mh);
  const tri = m.wp > 0 ? poly(scaleAbout(g.triangle, g.triC, triS), true) : '';
  // Toned: the filled triangle (the outline's outer edge, so the same footprint in every frame) with its "!" knocked
  // out and painted dark (WARN_BANG). The "!" grows with the triangle, as one mark.
  let warnFill = '';
  let bangD = '';
  if (tone && m.wp > 0) {
    const b = warnBang(g.triC, g.triangle[1][1] + 1, triS, size);
    bangD =
      (b.bar
        ? `M${fmt(b.bar[0])} ${fmt(b.bar[1])}H${fmt(b.bar[2])}V${fmt(b.bar[3])}H${fmt(b.bar[0])}Z`
        : '') + dot(b.dot, b.r);
    warnFill = roundedTriD(scaleAbout(g.triangle, g.triC, triS), 1) + bangD;
  }
  const er = m.ep > 0 ? g.ring * ms(m.ep) + ERROR_GROW * mh * m.ep : 0;
  const k = (er - 1) / Math.SQRT2; // the slash runs to the inside of the ring
  const slash =
    m.ep > 0
      ? poly([
          [c[0] - k, c[1] - k],
          [c[0] + k, c[1] + k],
        ])
      : '';
  const ink = (t: keyof typeof TONE) => (tone ? TONE[t] : 'currentColor');
  // The pip and the count: their own tone when one is named (a green or yellow pip), else error red with `tone`.
  const pipInk = typeof tone === 'string' ? TONE[tone] : ink('error');
  return {
    'status-check': {
      d: m.cp > 0 ? poly(g.check) : '',
      ...LINE,
      stroke: ink('success'),
      strokeLinejoin: 'miter',
      pathLength: 1,
      strokeDasharray: `${fmt(Math.max(m.cp - m.ce, 0))} 2`,
      strokeDashoffset: fmt(-m.ce),
    },
    'status-pip': { d: dot(g.pip.c, g.pip.r * m.pp), fill: pipInk },
    'status-spin': { d: arc, ...LINE, stroke: ink('interactive') },
    'status-warn': tone
      ? { d: warnFill, fill: TONE.warning, fillRule: 'evenodd', stroke: 'none' }
      : { d: tri, ...LINE, stroke: ink('warning'), strokeLinejoin: 'round' },
    // The toned warning's "!" (always a key, as the shapes' keys are fixed; empty untoned).
    'status-bang': { d: bangD, fill: WARN_BANG },
    'status-err': {
      d: m.ep > 0 ? dot(c, er + 1) + dot(c, Math.max(er - 1, 0)) : '',
      fillRule: 'evenodd',
      fill: ink('error'),
    },
    'status-slash': { d: slash, ...LINE, stroke: ink('error') },
    'status-dots': {
      d:
        m.dp > 0
          ? [-4, 0, 4].map((x) => dot([c[0] + x, c[1]], m.dp)).join('')
          : '',
      fill: ink('interactive'),
    },
    'status-count': { d: countD(p, m), fillRule: 'evenodd', fill: pipInk },
  };
}

// ── Zones ────────────────────────────────────────────────────────────────────

export const STATUSES: readonly Mark[] = [
  'none',
  'success',
  'notification',
  'pending',
  'warning',
  'error',
  'count',
];
const sIdx = (s: Mark) => STATUSES.indexOf(s);

/** A status's mark ink (a count's at width w), as convex pieces (the spinner as its whole ring): what the gap is measured to. */
export function markInk(p: Placement, s: Mark, w = COUNT.h, mh = 0): Pt[][] {
  const g = markGeometry(p);
  if (mh > 0 && s === 'error') {
    return strokePieces(
      [{ pts: discRegion(g.c, g.ring + ERROR_GROW * mh, 96), closed: true }],
      2,
      'miter'
    );
  }
  if (mh > 0 && s === 'warning') {
    return strokePieces(
      [
        {
          pts: scaleAbout(g.triangle, g.triC, 1 + WARN_GROW * mh),
          closed: true,
        },
      ],
      2,
      'round'
    );
  }
  if (s === 'count') {
    return [stadium(countCentre(p, w), w, COUNT.h)];
  }
  if (s === 'notification') {
    return [discRegion(g.pip.c, g.pip.r, 96)];
  }
  if (s === 'pending') {
    return strokePieces(
      [{ pts: discRegion(g.c, 5, 96), closed: true }],
      2,
      'miter'
    );
  }
  if (s === 'error') {
    return strokePieces(
      [{ pts: discRegion(g.c, g.ring, 96), closed: true }],
      2,
      'miter'
    );
  }
  if (s === 'warning') {
    return strokePieces([{ pts: g.triangle, closed: true }], 2, 'round');
  }
  if (s === 'success') {
    return strokePieces([{ pts: g.check, closed: false }], 2, 'miter');
  }
  return [];
}

/**
 * A status's zone: its mark's ink grown by the gap, as one convex region
 * (for the check, the hull of its two arms grown: its V's notch is inside).
 * No base ink may enter it; walls that would are cut square where they
 * come within the gap (squareCut).
 */
export function statusZone(p: Placement, s: Mark, w = COUNT.h, mh = 0): Region {
  const G = p.gap ?? GAP;
  const g = markGeometry(p);
  // A hovered mark (the status aliases) keeps its gap: the zone grows with it.
  if (mh > 0 && s === 'error') {
    return discRegion(g.c, g.ring + 1 + ERROR_GROW * mh + G);
  }
  if (mh > 0 && s === 'warning') {
    return offsetRegion(
      scaleAbout(g.triangle, g.triC, 1 + WARN_GROW * mh),
      1 + G
    );
  }
  if (s === 'count') {
    return stadium(countCentre(p, w), w, COUNT.h, G);
  }
  if (s === 'notification') {
    return discRegion(g.pip.c, g.pip.r + G);
  }
  if (s === 'pending') {
    return discRegion(g.c, 6 + G);
  }
  if (s === 'error') {
    return discRegion(g.c, g.ring + 1 + G);
  }
  if (s === 'warning') {
    return offsetRegion(g.triangle, 1 + G);
  }
  if (s === 'success') {
    return hull(
      strokePieces([{ pts: g.check, closed: false }], 2, 'miter').flatMap((q) =>
        offsetRegion(q, G)
      )
    );
  }
  return [];
}
/**
 * A box-mode zone (see Placement.mode): the slot grown by the gap, past the
 * frame on its frame sides (regionNums), its inner corner cut off `gap`
 * along each side. The same for every status.
 */
export function boxZone(p: Placement, mh = 0): Region {
  // A hovered mark (the status aliases) grows by up to ERROR_GROW: the box's inner sides move out with it, its
  // inner corner's cut staying where it was (so the glyph inside still isn't touched).
  const grow = ERROR_GROW * mh;
  const g = (p.gap ?? GAP) + grow;
  const [x0, y0, x1, y1] = regionNums({ ...p, gap: g, mode: 'box' }, 'success');
  const corner = p.corner ?? 'br';
  // The box's corners clockwise from top left; the inner one (opposite the frame corner) is cut off.
  const pts: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const inner = ({ br: 0, bl: 1, tl: 2, tr: 3 } as const)[corner];
  const [prev, at, next] = [
    pts[(inner + 3) % 4],
    pts[inner],
    pts[(inner + 1) % 4],
  ];
  const toward = (q: Pt): Pt => {
    const l = Math.hypot(q[0] - at[0], q[1] - at[1]);
    const leg = g + grow;
    return [
      at[0] + ((q[0] - at[0]) * leg) / l,
      at[1] + ((q[1] - at[1]) * leg) / l,
    ];
  };
  pts.splice(inner, 1, toward(prev), toward(next));
  return pts;
}

/** An offset-mode zone (see Placement.mode): the mark's zone run out to the frame corner (the hull of the two). */
export function offsetZone(p: Placement, s: Mark, w = COUNT.h, mh = 0): Region {
  // The check takes its slot's disc (as the error ring and the spinner): its own outline grown leaves a hairline
  // tip on a base edge it crosses at a shallow angle (in-progress's wedge), and Carbon draws no check badge to follow.
  const z =
    s === 'success'
      ? discRegion(markCentre(p, s), (p.slot ?? 12) / 2 + (p.gap ?? GAP))
      : statusZone(p, s, w, mh);
  if (z.length < 3) {
    return z;
  }
  const corner = p.corner ?? 'br';
  const [bx0, by0, bx1, by1] = bboxOf(z);
  const [fx, nx] = corner.endsWith('r') ? [40, bx0] : [-8, bx1];
  const [fy, ny] = corner.startsWith('b') ? [40, by0] : [-8, by1];
  return hull([...z, [fx, ny], [fx, fy], [nx, fy]]);
}

/** The zone a mark cuts, by the placement's mode. */
export function modeZone(p: Placement, s: Mark, w = COUNT.h, mh = 0): Region {
  if (p.mode === 'box') {
    return boxZone(p, mh);
  }
  if (p.mode === 'offset') {
    return offsetZone(p, s, w, mh);
  }
  return statusZone(p, s, w, mh);
}

/** Kept for the earlier comparisons: each status's cut as convex pieces. */
export const statusRegions = (p: Placement, s: Mark): Region[] =>
  s === 'none' ? [] : [statusZone(p, s)];

/** The Minkowski blend (1 − t)·A + t·B of two convex regions: a status change morphs one zone into the other, staying convex. */
export function blendZones(a: Region, b: Region, t: number): Region {
  if (t <= 1e-6) {
    return a;
  }
  if (t >= 1 - 1e-6) {
    return b;
  }
  const step = (q: Region) =>
    q.length > 32 ? q.filter((_, i) => i % Math.ceil(q.length / 32) === 0) : q;
  const [A, B] = [step(a), step(b)];
  const pts: Pt[] = [];
  for (const u of A) {
    for (const v of B) {
      pts.push([u[0] * (1 - t) + v[0] * t, u[1] * (1 - t) + v[1] * t]);
    }
  }
  return hull(pts);
}

// ── The square cut ───────────────────────────────────────────────────────────

/**
 * Carbon's badge rule, generically: every wall the zone reaches ends square,
 * across the wall (perpendicular to it, or to a curve's tangent there),
 * where the whole of its end first clears the zone; the zone itself is cut
 * away too, so whatever isn't a wall (a filled disc, a junction, a dot)
 * keeps the outline-hugging cut, and anything thin left inside goes.
 *
 * Walls are found from the outline alone. For a filled shape, each run of
 * the zone's edge through the shape's ink is a "chain"; its two ends sit on
 * the outline. From one end the outline is followed away from the zone and,
 * at each step, the wall's far side is the nearest outline point across
 * from it (the foot of the perpendicular); that pair is the wall's cross-
 * section. The first cross-section clear of the zone is where the wall ends.
 * The wall end between the zone and that cross-section is removed by adding
 * its outline, reversed, to the shape's path (it lies inside the shape's
 * ink, so the winding there drops to 0). A wall followed across (both chain
 * ends on its two sides) gets one square end; a wall only grazed (both
 * chain ends on one side) is cut through with two. A chain that isn't a
 * wall (wider than 3.2px, its cross-section skewing, or its side turning a
 * corner before it clears) keeps the hugging cut: a fallback, reported.
 *
 * A stroke is cut on its centreline: wherever its cross-section meets the
 * zone, the centreline is removed, so its ends are butt ends across it.
 */
export interface CutEnd {
  a: Pt;
  b: Pt;
  square: boolean;
  shape: string;
}
export interface CutReport {
  ends: CutEnd[];
  squared: number;
  fallbacks: number;
  /** Chains through solid ink (wider than a wall: a filled disc or block), which keep the hugging cut by design (Carbon's offset cut on filled bases). */
  solids: number;
  /** Why each fallback chain kept the hugging cut. */
  reasons: string[];
  /** Where the clean-cut rule fired (see CLEAN). */
  clean: CleanEvent[];
}

/**
 * The clean-cut rule (no small cuts from the square cut that look
 * unintended), on every status icon, mark and count:
 *
 *  - nick: where the zone only nicks a part (a corner clipped, a wall's side
 *    grazed: the ink it would take reaches less than `nick` into the zone),
 *    the part isn't cut. It stays whole, at least 4 − nick (≈3px) from the
 *    mark. 1.05 from the measured nicks: across the 21 icons the
 *    dips cluster at 0.25–0.75 and at 1.00 (User's head by a single
 *    figure), then none until 1.46 (a real cut: Renew's arc by the error
 *    ring), so anything from 1.01 to 1.45 sorts them the same; 1.05 keeps
 *    the gap at 3 (2.95).
 *  - stub: a wall the cut leaves shorter than `stub` (MIN_STUB) from its
 *    square end to the wall it hangs on goes back to that wall (cut flush
 *    with its edge).
 *  - corner: the same where the wall turns a corner just past the cut: the
 *    cut extends to the corner (flush with the other wall's inside edge),
 *    so no tail is left past it.
 *  - fragment: a piece the cut leaves on its own, smaller than a stub (a
 *    2px wall MIN_STUB long), goes.
 *
 * Mutable for measuring (the tests read it); the icons use the defaults.
 */
export const CLEAN = { on: true, nick: 1.05, stub: 4 };
/** The shortest stub a square end may leave on a wall: twice the 2px weight. */
export const MIN_STUB = 4;
export interface CleanEvent {
  rule: 'nick' | 'stub' | 'corner' | 'fragment';
  shape: string;
  size: number;
  at: Pt;
}
let why = '';

/** The parameter interval of segment ab inside the convex region (Cyrus–Beck), or null. */
function inside(a: Pt, b: Pt, z: Region): [number, number] | null {
  const ar = area(z as Pt[]);
  let [t0, t1] = [0, 1];
  const d: Pt = [b[0] - a[0], b[1] - a[1]];
  for (let i = 0; i < z.length; i++) {
    const [p, q] = [z[i], z[(i + 1) % z.length]];
    // Inward normal for this orientation.
    const n: Pt =
      ar > 0 ? [-(q[1] - p[1]), q[0] - p[0]] : [q[1] - p[1], -(q[0] - p[0])];
    const num = n[0] * (a[0] - p[0]) + n[1] * (a[1] - p[1]);
    const den = n[0] * d[0] + n[1] * d[1];
    if (Math.abs(den) < 1e-12) {
      if (num < 0) {
        return null;
      }
      continue;
    }
    const t = -num / den;
    if (den > 0) {
      t0 = Math.max(t0, t);
    } else {
      t1 = Math.min(t1, t);
    }
    if (t0 > t1) {
      return null;
    }
  }
  return [t0, t1];
}
/** Does segment ab reach into the zone (more than touching it)? */
const meetsZone = (a: Pt, b: Pt, z: Region) => {
  const r = inside(a, b, z);
  return (
    r !== null && (r[1] - r[0]) * Math.hypot(b[0] - a[0], b[1] - a[1]) > 1e-3
  );
};
const inZone = (p: Pt, z: Region) => depth(z, p) > 1e-6;

/** The winding of rings at p. */
function windingAt(rings: readonly Pt[][], [x, y]: Pt): number {
  let w = 0;
  for (const r of rings) {
    for (let i = 0; i < r.length; i++) {
      const [a, b] = [r[i], r[(i + 1) % r.length]];
      if (
        a[1] <= y !== b[1] <= y &&
        a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]) > x
      ) {
        w += b[1] > a[1] ? 1 : -1;
      }
    }
  }
  return w;
}
const paintedBy = (rings: readonly Pt[][], evenodd: boolean, p: Pt) => {
  const w = windingAt(rings, p);
  return evenodd ? (w & 1) !== 0 : w !== 0;
};

/** A ring with arc-length positions, for walking along it. */
class Walk {
  len: number[] = [0];
  box: Box;
  constructor(readonly pts: Pt[]) {
    for (let i = 0; i < pts.length; i++) {
      const [a, b] = [pts[i], pts[(i + 1) % pts.length]];
      this.len.push(this.len[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    this.box = bboxOf(pts);
  }
  get total() {
    return this.len[this.len.length - 1];
  }
  wrap(s: number) {
    const T = this.total;
    return ((s % T) + T) % T;
  }
  /** Edge index and point at arc position s. */
  at(s: number): { i: number; p: Pt } {
    s = this.wrap(s);
    let [lo, hi] = [0, this.pts.length - 1];
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.len[mid] <= s) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    const [a, b] = [this.pts[lo], this.pts[(lo + 1) % this.pts.length]];
    const l = this.len[lo + 1] - this.len[lo] || 1;
    const t = (s - this.len[lo]) / l;
    return { i: lo, p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
  }
  /** The unit direction of the edge at s, walking forward. */
  dir(s: number): Pt {
    const { i } = this.at(s);
    const [a, b] = [this.pts[i], this.pts[(i + 1) % this.pts.length]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  }
  /** The ring's vertices strictly between arc positions s0 and s1, walking in `dir`. */
  between(s0: number, s1: number, dir: 1 | -1): Pt[] {
    const span = dir > 0 ? this.wrap(s1 - s0) : this.wrap(s0 - s1);
    const out: [number, Pt][] = [];
    for (let k = 0; k < this.pts.length; k++) {
      const off =
        dir > 0 ? this.wrap(this.len[k] - s0) : this.wrap(s0 - this.len[k]);
      if (off > 1e-9 && off < span - 1e-9) {
        out.push([off, this.pts[k]]);
      }
    }
    return out.sort((a, b) => a[0] - b[0]).map(([, q]) => q);
  }
  /** Cyclic distance along the ring. */
  gap(s0: number, s1: number) {
    const d = this.wrap(s1 - s0);
    return Math.min(d, this.total - d);
  }
}

type Foot = { ring: number; s: number; p: Pt; d: number };
/**
 * The nearest outline point to p across the ink (within 45° of `inward`,
 * the normal into the ink at p), ignoring the stretch of ring `own` within
 * `window` of arc position `s`.
 */
function foot(
  walks: Walk[],
  p: Pt,
  own: number,
  s: number,
  window: number,
  inward?: Pt
): Foot | null {
  let best: Foot | null = null;
  const R = 3.5; // walls are at most 3.2 across: nothing farther counts
  walks.forEach((w, r) => {
    if (
      p[0] < w.box[0] - R ||
      p[0] > w.box[2] + R ||
      p[1] < w.box[1] - R ||
      p[1] > w.box[3] + R
    ) {
      return;
    }
    for (let i = 0; i < w.pts.length; i++) {
      const [a, b] = [w.pts[i], w.pts[(i + 1) % w.pts.length]];
      if (
        Math.min(a[0], b[0]) > p[0] + R ||
        Math.max(a[0], b[0]) < p[0] - R ||
        Math.min(a[1], b[1]) > p[1] + R ||
        Math.max(a[1], b[1]) < p[1] - R
      ) {
        continue;
      }
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy;
      const t = l2
        ? Math.max(
            0,
            Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)
          )
        : 0;
      const q: Pt = [a[0] + dx * t, a[1] + dy * t];
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (best && d >= best.d) {
        continue;
      }
      if (
        inward &&
        d > 1e-9 &&
        ((q[0] - p[0]) * inward[0] + (q[1] - p[1]) * inward[1]) / d < 0.7
      ) {
        continue;
      }
      const sq = w.len[i] + t * Math.sqrt(l2);
      if (r === own && w.gap(sq, s) < window) {
        continue;
      }
      best = { ring: r, s: sq, p: q, d };
    }
  });
  return best;
}

/**
 * Follow the outline from a chain end (ring r, arc position s0) away from
 * the zone (`dir`) until the wall's cross-section clears it. Returns the
 * clear cross-section and the arc positions it sits at, or null where the
 * outline doesn't behave like a wall.
 */
function march(
  walks: Walk[],
  r: number,
  s0: number,
  dir: 1 | -1,
  zone: Region,
  ink: (p: Pt) => boolean
): { s: number; a: Pt; b: Foot } | null {
  const w = walks[r];
  const STEP = 0.1;
  const MAX = 20;
  let w0 = 0;
  let prev: { s: number } | null = null;
  const section = (s: number) => {
    const a = w.at(s).p;
    const t = w.dir(s);
    const n: Pt = ink([a[0] - t[1] * 0.05, a[1] + t[0] * 0.05])
      ? [-t[1], t[0]]
      : [t[1], -t[0]];
    const b = foot(walks, a, r, s, 1.2, n);
    return { a, b };
  };
  const ok = (a: Pt, b: Foot | null, s: number) => {
    if (!b || b.d < 0.8 || b.d > 3.2) {
      return false;
    }
    if (w0 && (b.d < 0.6 * w0 || b.d > 1.6 * w0)) {
      return false;
    }
    const t = w.dir(s);
    const n: Pt = [(b.p[0] - a[0]) / b.d, (b.p[1] - a[1]) / b.d];
    return Math.abs(n[0] * t[0] + n[1] * t[1]) < 0.45;
  };
  for (let k = 1; k * STEP <= MAX; k++) {
    const s = s0 + dir * k * STEP;
    const { a, b } = section(s);
    if (inZone(a, zone) && k * STEP > 0.3) {
      why = 'side re-enters the zone';
      return null;
    } // the side runs back into the zone
    if (!ok(a, b, s)) {
      if (prev) {
        const t = w.dir(s);
        const dt = b
          ? Math.abs(((b.p[0] - a[0]) * t[0] + (b.p[1] - a[1]) * t[1]) / b.d)
          : -1;
        why = `not a wall at ${(k * STEP).toFixed(1)}px (width ${b ? b.d.toFixed(2) : '-'}, w0 ${w0.toFixed(2)}, skew ${dt.toFixed(2)})`;
        return null;
      }
      continue; // still in the chain's corner
    }
    if (!w0) {
      w0 = b!.d;
    }
    if (!meetsZone(a, b!.p, zone)) {
      // Clear: refine between the last uncleared step and this one.
      let [lo, hi] = [prev ? prev.s : s0, s];
      for (let j = 0; j < 12; j++) {
        const mid = (lo + hi) / 2;
        const m = section(mid);
        if (m.b && ok(m.a, m.b, mid) && !meetsZone(m.a, m.b.p, zone)) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      // A hair past the touch, so the end's outline never pinches against the zone.
      const sEnd = hi + dir * 0.02;
      const fin = section(sEnd);
      return fin.b ? { s: sEnd, a: fin.a, b: fin.b } : null;
    }
    prev = { s };
  }
  why = 'no clear cross-section within 20px';
  return null;
}

/** A point on the convex region's boundary as its perimeter position, and the region's vertices between two positions (forward). */
function perimeter(z: Region) {
  const len = [0];
  for (let i = 0; i < z.length; i++) {
    len.push(
      len[i] +
        Math.hypot(
          z[(i + 1) % z.length][0] - z[i][0],
          z[(i + 1) % z.length][1] - z[i][1]
        )
    );
  }
  const T = len[z.length];
  const pos = (p: Pt) => {
    let [best, bs] = [Infinity, 0];
    for (let i = 0; i < z.length; i++) {
      const [a, b] = [z[i], z[(i + 1) % z.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy || 1;
      const t = Math.max(
        0,
        Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)
      );
      const d = Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
      if (d < best) {
        [best, bs] = [d, len[i] + t * Math.sqrt(l2)];
      }
    }
    return bs;
  };
  const point = (s: number): Pt => {
    s = ((s % T) + T) % T;
    let i = 0;
    while (i < z.length - 1 && len[i + 1] < s) {
      i++;
    }
    const [a, b] = [z[i], z[(i + 1) % z.length]];
    const t = (s - len[i]) / (len[i + 1] - len[i] || 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  const between = (s0: number, s1: number): Pt[] => {
    const span = (((s1 - s0) % T) + T) % T;
    const out: [number, Pt][] = [];
    for (let i = 0; i < z.length; i++) {
      const off = (((len[i] - s0) % T) + T) % T;
      if (off > 1e-9 && off < span - 1e-9) {
        out.push([off, z[i]]);
      }
    }
    return out.sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  };
  return { T, pos, point, between };
}

type Crossing = { ring: number; s: number; p: Pt; dir: 1 | -1; per: number };

/** The wall-end outlines to remove from one filled shape's rings, and the ends they leave. */
/** A nick: a chain where the ink the zone takes dips less than CLEAN.nick in and comes out again on the same outline. */
interface Nick {
  piece: Pt[];
  depth: number;
  at: Pt;
}

function squareEnds(
  rings: Pt[][],
  evenodd: boolean,
  zone: Region
): {
  cuts: Pt[][];
  ends: { a: Pt; b: Pt; square: boolean; solid?: boolean }[];
  fallbacks: number;
  solids: number;
  reasons: string[];
  nicks: Nick[];
} {
  const walks = rings.map((r) => new Walk(r));
  const per = perimeter(zone);
  // Where each ring crosses the zone's edge, and which way along it leads out.
  const xs: Crossing[] = [];
  walks.forEach((w, r) => {
    for (let i = 0; i < w.pts.length; i++) {
      const [a, b] = [w.pts[i], w.pts[(i + 1) % w.pts.length]];
      const iv = inside(a, b, zone);
      if (!iv) {
        continue;
      }
      const l = w.len[i + 1] - w.len[i];
      const aIn = inZone(a, zone);
      const bIn = inZone(b, zone);
      if (!aIn && iv[0] > 1e-9 && iv[0] < 1 - 1e-9) {
        const p: Pt = [
          a[0] + (b[0] - a[0]) * iv[0],
          a[1] + (b[1] - a[1]) * iv[0],
        ];
        xs.push({
          ring: r,
          s: w.len[i] + iv[0] * l,
          p,
          dir: -1,
          per: per.pos(p),
        });
      }
      if (!bIn && iv[1] < 1 - 1e-9 && iv[1] > 1e-9) {
        const p: Pt = [
          a[0] + (b[0] - a[0]) * iv[1],
          a[1] + (b[1] - a[1]) * iv[1],
        ];
        xs.push({
          ring: r,
          s: w.len[i] + iv[1] * l,
          p,
          dir: 1,
          per: per.pos(p),
        });
      }
    }
  });
  xs.sort((a, b) => a.per - b.per);
  const cuts: Pt[][] = [];
  const ends: { a: Pt; b: Pt; square: boolean; solid?: boolean }[] = [];
  const nicks: Nick[] = [];
  let fallbacks = 0;
  let solids = 0;
  const reasons: string[] = [];
  for (let k = 0; k < xs.length; k++) {
    const [e1, e2] = [xs[k], xs[(k + 1) % xs.length]];
    if (xs.length < 2) {
      break;
    }
    const span = (((e2.per - e1.per) % per.T) + per.T) % per.T;
    if (span < 1e-6) {
      continue;
    }
    // A chain: the zone's edge between them runs through the shape's ink.
    if (!paintedBy(rings, evenodd, per.point(e1.per + span / 2))) {
      continue;
    }
    const arc = per.between(e1.per, e2.per); // e1 → e2 along the zone's edge
    // A nick (the clean-cut rule): the outline dips into the zone from e1 and comes straight back out at e2,
    // never deeper than CLEAN.nick. The part isn't cut there: the piece the zone took is kept (put back below).
    const nick = CLEAN.on ? nickOf(walks[e1.ring], zone, e1, e2, arc) : null;
    if (nick) {
      nicks.push(nick);
      continue;
    }
    // Solid ink (wider than a wall where the chain meets it) keeps the hugging cut, by design.
    const ink0 = (q: Pt) => paintedBy(rings, evenodd, q);
    const solid = [e1, e2].every((e) => {
      const t = walks[e.ring].dir(e.s);
      const n: Pt = ink0([e.p[0] - t[1] * 0.05, e.p[1] + t[0] * 0.05])
        ? [-t[1], t[0]]
        : [t[1], -t[0]];
      const f = foot(walks, e.p, e.ring, e.s, 1.2, n);
      return !f || f.d > 3.2;
    });
    if (solid) {
      solids++;
      ends.push({ a: e1.p, b: e2.p, square: false, solid: true });
      continue;
    }
    const built = buildCut(walks, zone, e1, e2, arc, rings, evenodd);
    // The clean-cut rule for a straight wall the zone crosses at a slant and leaves through its end (where the
    // wall can't be walked out of the zone): cut square where the zone first reaches it, not along the slant.
    const slant =
      !built && CLEAN.on ? slantEnd(walks, zone, e1, e2, rings, evenodd) : null;
    if (built) {
      if (built.ring.length > 2) {
        cuts.push(built.ring);
      }
      ends.push(...built.ends.map((e) => ({ ...e, square: true })));
    } else if (slant) {
      cuts.push(slant.ring);
      ends.push({ ...slant.end, square: true });
    } else {
      fallbacks++;
      reasons.push(why);
      ends.push({ a: e1.p, b: e2.p, square: false });
    }
  }
  return { cuts, ends, fallbacks, solids, reasons, nicks };
}

/**
 * The clean-cut rule's slant: a straight wall the zone bites across at a
 * slant, running out through the wall's own end (its end face), so the side
 * can't be walked clear of the zone and the plain cut would leave a tapering
 * wedge. Instead the wall ends square where the zone first reaches its
 * cross-section (status.ts `wallEnd`), and everything from there to its end
 * goes. Only for a chain wholly on one wall: one crossing on a side of the
 * wall (straight for 2px either way, 1.5–2.6 across), the other on its end
 * face (square to the side, within the wall's width, nothing painted past
 * it). The band stops just past that face.
 */
function slantEnd(
  walks: Walk[],
  zone: Region,
  e1: Crossing,
  e2: Crossing,
  rings: Pt[][],
  evenodd: boolean
): { ring: Pt[]; end: { a: Pt; b: Pt } } | null {
  const ink = (q: Pt) => paintedBy(rings, evenodd, q);
  for (const [e, o] of [
    [e1, e2],
    [e2, e1],
  ] as const) {
    const w = walks[e.ring];
    const t = w.dir(e.s);
    if (
      ![-2, -1, 1, 2].every((k) => {
        const tk = w.dir(e.s + k);
        return Math.abs(tk[0] * t[0] + tk[1] * t[1]) > 0.999;
      })
    ) {
      continue;
    }
    const n: Pt = ink([e.p[0] - t[1] * 0.05, e.p[1] + t[0] * 0.05])
      ? [-t[1], t[0]]
      : [t[1], -t[0]];
    const f = foot(walks, e.p, e.ring, e.s, 1.2, n);
    if (!f || f.d < 1.5 || f.d > 2.6) {
      continue;
    }
    const c: Pt = [(e.p[0] + f.p[0]) / 2, (e.p[1] + f.p[1]) / 2];
    // The other crossing: ahead along the wall, inside its width, on its end face.
    const along = (o.p[0] - c[0]) * t[0] + (o.p[1] - c[1]) * t[1];
    const across = Math.abs((o.p[0] - c[0]) * n[0] + (o.p[1] - c[1]) * n[1]);
    if (Math.abs(along) < 0.3 || across > f.d / 2 + 0.05) {
      continue;
    }
    const to = walks[o.ring].dir(o.s);
    if (Math.abs(to[0] * t[0] + to[1] * t[1]) > 0.3) {
      continue;
    }
    const u: Pt = along > 0 ? t : [-t[0], -t[1]];
    // A free end: nothing painted just past the end face, across the wall (not an inner corner, where it turns into the next wall).
    const tip: Pt = [
      c[0] + u[0] * (Math.abs(along) + 0.15),
      c[1] + u[1] * (Math.abs(along) + 0.15),
    ];
    if (
      [-0.8, -0.4, 0, 0.4, 0.8].some((k) =>
        ink([tip[0] + (n[0] * k * f.d) / 2, tip[1] + (n[1] * k * f.d) / 2])
      )
    ) {
      continue;
    }
    const from: Pt = [c[0] - u[0] * 6, c[1] - u[1] * 6];
    if (inZone(from, zone)) {
      continue;
    }
    const band = wallEnd(
      zone,
      from,
      [c[0] + u[0] * Math.abs(along), c[1] + u[1] * Math.abs(along)],
      f.d / 2
    );
    if (!band) {
      continue;
    }
    // Stop just past the end face (wallEnd runs a pixel on), so the band takes nothing of a wall beyond it.
    for (const i of [1, 2]) {
      band[i] = [band[i][0] - u[0] * 0.98, band[i][1] - u[1] * 0.98];
    }
    return { ring: band, end: { a: band[0], b: band[3] } };
  }
  return null;
}

/**
 * Is the chain e1 → e2 a nick? Both on one outline, which runs into the zone
 * at e1 and out at e2 (the shortest way, under 30 along it) without going
 * deeper than CLEAN.nick. Returns the ink the zone took there, reaching a
 * hair (0.05) past the zone's edge into the ink that stays, so that putting
 * it back overlaps rather than abuts (no seam).
 */
function nickOf(
  w: Walk,
  zone: Region,
  e1: Crossing,
  e2: Crossing,
  arc: Pt[]
): Nick | null {
  if (e1.ring !== e2.ring || e1.dir === e2.dir) {
    return null;
  }
  const into = -e1.dir as 1 | -1;
  const len = w.wrap(into * (e2.s - e1.s));
  if (len > 30 || len < 1e-6) {
    return null;
  }
  const path = w.between(e1.s, e2.s, into);
  let [deepest, at]: [number, Pt] = [0, e1.p];
  // Along the outline from e1 to e2 (a straight edge's middle can be its deepest point).
  for (let t = 0; t <= len; t += Math.min(0.1, len / 4)) {
    const q = w.at(e1.s + into * t).p;
    const d = depth(zone, q);
    if (d < -1e-3) {
      return null;
    } // it leaves the zone between: not one dip
    if (d > deepest) {
      [deepest, at] = [d, q];
    }
  }
  // Deeper than the rule allows, or barely touching (an end already at the zone's edge): not a nick.
  if (deepest >= CLEAN.nick || deepest < 0.02) {
    return null;
  }
  const ext = (e: Crossing) => w.at(e.s + e.dir * 0.05).p; // along the outline, out of the zone
  const out = (q: Pt): Pt => {
    // The zone's outward normal at q (its nearest edge), 0.05 out.
    let [best, n]: [number, Pt] = [Infinity, [0, 0]];
    const ar = area(zone as Pt[]);
    for (let i = 0; i < zone.length; i++) {
      const [a, b] = [zone[i], zone[(i + 1) % zone.length]];
      const dd = segDist(q, a, b);
      if (dd < best) {
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nn: Pt = [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
        best = dd;
        n = ar > 0 ? [-nn[0], -nn[1]] : nn;
      }
    }
    return [q[0] + n[0] * 0.05, q[1] + n[1] * 0.05];
  };
  const piece = [
    ext(e1),
    e1.p,
    ...path,
    e2.p,
    ext(e2),
    ...[...arc].reverse().map(out),
  ];
  return { piece, depth: deepest, at };
}

/**
 * A wall that never clears the zone before it ends (a short stub, a line
 * whose end is in the gap): it goes entirely, out to its end, rather than
 * leaving a sliver. The outline from e1 out round the stub's end back to e2
 * (on one ring, short, thin) and the zone's edge back to e1.
 */
function stub(
  walks: Walk[],
  zone: Region,
  e1: Crossing,
  e2: Crossing,
  arc: Pt[],
  rings: Pt[][],
  evenodd: boolean
): { ring: Pt[]; ends: { a: Pt; b: Pt }[] } | null {
  const reason = why;
  if (e1.ring !== e2.ring) {
    return null;
  }
  const w = walks[e1.ring];
  const len = w.wrap(e1.dir * (e2.s - e1.s));
  if (len > 30 || len <= 0) {
    return null;
  }
  const path = [e1.p, ...w.between(e1.s, e2.s, e1.dir), e2.p];
  const ring = [...path, ...[...arc].reverse()];
  const A = Math.abs(area(ring));
  // Thin: no wider than a wall along its length.
  if (A > 1.7 * (len / 2) + 1) {
    why = reason;
    return null;
  }
  const probe = path[Math.floor(path.length / 2)];
  const inner = [0.05, -0.05]
    .map((d) => {
      const t = w.dir(w.wrap(e1.s + (e1.dir * len) / 2));
      return [probe[0] - t[1] * d, probe[1] + t[0] * d] as Pt;
    })
    .find((q) => paintedBy(rings, evenodd, q));
  if (!inner) {
    why = reason;
    return null;
  }
  const wShape = windingAt(rings, inner);
  const wCut = windingAt([ring], inner);
  if (wCut === 0) {
    why = reason;
    return null;
  }
  if (!evenodd && Math.sign(wCut) === Math.sign(wShape)) {
    ring.reverse();
  }
  return { ring, ends: [] };
}

/** The outline of a wall end between a chain and the wall's square end(s), oriented to cancel the shape's ink. */
function buildCut(
  walks: Walk[],
  zone: Region,
  e1: Crossing,
  e2: Crossing,
  arc: Pt[],
  rings: Pt[][],
  evenodd: boolean
): { ring: Pt[]; ends: { a: Pt; b: Pt }[] } | null {
  const ink = (q: Pt) => paintedBy(rings, evenodd, q);
  const m1 = march(walks, e1.ring, e1.s, e1.dir, zone, ink);
  if (!m1) {
    return stub(walks, zone, e1, e2, arc, rings, evenodd);
  }
  const w1 = walks[e1.ring];
  const side1 = [e1.p, ...w1.between(e1.s, m1.s, e1.dir), m1.a];
  const wb = walks[m1.b.ring];
  let ring: Pt[];
  const endsOut: { a: Pt; b: Pt }[] = [{ a: m1.a, b: m1.b.p }];
  // Across: the foot lies on e2's side, beyond e2.
  const across =
    m1.b.ring === e2.ring &&
    wb.gap(m1.b.s, e2.s) < 16 &&
    (wb.gap(m1.b.s, e2.s) < 0.05 ||
      wb.wrap(e2.dir * (m1.b.s - e2.s)) < wb.total / 2);
  if (across) {
    // From the foot back to e2 (nothing between when the foot is e2 itself).
    const back =
      wb.gap(m1.b.s, e2.s) < 0.05
        ? []
        : wb.between(m1.b.s, e2.s, -e2.dir as 1 | -1);
    if (back.length && wb.wrap(-e2.dir * (e2.s - m1.b.s)) > wb.total / 2) {
      why = 'far side runs the long way';
      return null;
    }
    ring = [...side1, m1.b.p, ...back, e2.p, ...[...arc].reverse()];
  } else {
    // Grazed: cut through with a second square end from e2.
    const m2 = march(walks, e2.ring, e2.s, e2.dir, zone, ink);
    if (!m2) {
      return null;
    }
    if (m2.b.ring !== m1.b.ring) {
      why = `grazed, far sides on different rings (e1 r${e1.ring} e2 r${e2.ring} m1.b r${m1.b.ring} m2.b r${m2.b.ring} gap ${wb.gap(m1.b.s, e2.s).toFixed(2)} wrap ${wb.wrap(e2.dir * (m1.b.s - e2.s)).toFixed(2)}/${wb.total.toFixed(1)})`;
      return null;
    }
    const ws = walks[m1.b.ring];
    const fwd = ws.wrap(m2.b.s - m1.b.s) <= ws.total / 2;
    const far = ws.between(m1.b.s, m2.b.s, fwd ? 1 : -1);
    if (
      ws.gap(m1.b.s, m2.b.s) >
      Math.hypot(m1.b.p[0] - m2.b.p[0], m1.b.p[1] - m2.b.p[1]) * 2 + 2
    ) {
      why = 'grazed, far side not continuous';
      return null;
    }
    const w2 = walks[e2.ring];
    const side2 = [e2.p, ...w2.between(e2.s, m2.s, e2.dir), m2.a];
    ring = [
      ...side1,
      m1.b.p,
      ...far,
      m2.b.p,
      ...[...side2].reverse(),
      ...[...arc].reverse(),
    ];
    endsOut.push({ a: m2.a, b: m2.b.p });
  }
  // Nothing to take off: the zone's edge already crosses the wall square
  // there (to within 0.05px of the square end).
  if (across) {
    const [a, b] = [m1.a, m1.b.p];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dev = Math.max(
      0,
      ...[e1.p, e2.p, ...arc].map((q) =>
        Math.abs(
          ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) / l
        )
      )
    );
    if (dev < 0.05) {
      return { ring: [], ends: endsOut };
    }
  }
  // Inside the shape's ink, and wound against it: probe a point inside the outline.
  const mid: Pt = [(m1.a[0] + m1.b.p[0]) / 2, (m1.a[1] + m1.b.p[1]) / 2];
  const towards: Pt = [
    (e1.p[0] + e2.p[0]) / 2 - mid[0],
    (e1.p[1] + e2.p[1]) / 2 - mid[1],
  ];
  const tl = Math.hypot(towards[0], towards[1]) || 1;
  const A = area(ring);
  const cen: [number, number] = [0, 0];
  for (let i = 0; i < ring.length; i++) {
    const [p0, p1] = [ring[i], ring[(i + 1) % ring.length]];
    const c = p0[0] * p1[1] - p1[0] * p0[1];
    cen[0] += ((p0[0] + p1[0]) * c) / (6 * A);
    cen[1] += ((p0[1] + p1[1]) * c) / (6 * A);
  }
  const fanC: Pt[] = ring
    .slice(1, -1)
    .map(
      (q, i) =>
        [
          (ring[0][0] + q[0] + ring[i + 2][0]) / 3,
          (ring[0][1] + q[1] + ring[i + 2][1]) / 3,
        ] as Pt
    );
  const tries: Pt[] = [
    ...[0.005, 0.02, 0.05].map(
      (k) =>
        [mid[0] + (towards[0] / tl) * k, mid[1] + (towards[1] / tl) * k] as Pt
    ),
    cen,
    ...fanC,
  ];
  const probe =
    tries.find(
      (q) => windingAt([ring], q) !== 0 && paintedBy(rings, evenodd, q)
    ) ?? tries[0];
  if (!paintedBy(rings, evenodd, probe)) {
    why = 'cut outline not in ink';
    return null;
  }
  const wShape = windingAt(rings, probe);
  const wCut = windingAt([ring], probe);
  if (wCut === 0) {
    why = `cut outline degenerate (${across ? 'across' : 'grazed'}, area ${area(ring).toFixed(2)}, probe ${probe.map((v) => v.toFixed(2))}, ring ${ring.map((q) => q.map((v) => v.toFixed(2)).join(',')).join(' ')})`;
    return null;
  }
  if (!evenodd && Math.sign(wCut) === Math.sign(wShape)) {
    ring.reverse();
  }
  return { ring, ends: endsOut };
}

/** A stroke's centreline with every stretch removed whose cross-section meets the zone; the ends left are butt ends across it. */
function trimStroke(
  subs: Sub[],
  hw: number,
  zone: Region,
  events: Omit<CleanEvent, 'shape'>[] = []
): { subs: Sub[]; ends: { a: Pt; b: Pt }[]; cut: boolean; nicked: Set<Sub> } {
  const out: Sub[] = [];
  const ends: { a: Pt; b: Pt }[] = [];
  const nicked = new Set<Sub>();
  let cut = false;
  for (const sub of subs) {
    const pts = sub.closed ? [...sub.pts, sub.pts[0]] : sub.pts;
    const walk = new Walk(pts.slice(0, -1).length > 1 ? pts : pts); // open polyline walk (closing edge unused)
    const total = walk.len[pts.length - 1];
    if (total <= 0) {
      continue;
    }
    const sect = (s: number) => {
      const { p } = walk.at(Math.min(s, total - 1e-9));
      const t = walk.dir(Math.min(s, total - 1e-9));
      return {
        p,
        a: [p[0] - t[1] * hw, p[1] + t[0] * hw] as Pt,
        b: [p[0] + t[1] * hw, p[1] - t[0] * hw] as Pt,
      };
    };
    const hit = (s: number) => {
      const c = sect(s);
      return meetsZone(c.a, c.b, zone);
    };
    const N = Math.max(2, Math.ceil(total / 0.1));
    const samples = Array.from({ length: N + 1 }, (_, i) => (total * i) / N);
    const flags = samples.map(hit);
    // Nicks (the clean-cut rule): a run of the line the zone only grazes, its ink never more than CLEAN.nick
    // inside, isn't cut.
    let nickedHere = false;
    if (CLEAN.on && flags.some(Boolean)) {
      const deep = (i: number) => {
        const c = sect(samples[i]);
        return Math.max(depth(zone, c.a), depth(zone, c.b), depth(zone, c.p));
      };
      const n = flags.length;
      const startAt = flags.findIndex((f) => !f);
      if (startAt >= 0) {
        for (let k = 0; k < n; k++) {
          const i = (startAt + k) % n;
          if (!flags[i] || (k > 0 && flags[(i - 1 + n) % n])) {
            continue;
          }
          // A run of flagged samples from i (wrapping round a closed line).
          const run: number[] = [];
          for (let j = i; flags[j % n] && run.length < n; j++) {
            run.push(j % n);
            if (!sub.closed && j === n - 1) {
              break;
            }
          }
          let [dmax, at]: [number, Pt] = [0, sect(samples[i]).p];
          for (const j of run) {
            const d = deep(j);
            if (d > dmax) {
              [dmax, at] = [d, sect(samples[j]).p];
            }
          }
          if (dmax < CLEAN.nick && dmax >= 0.02) {
            for (const j of run) {
              flags[j] = false;
            }
            events.push({ rule: 'nick', size: dmax, at });
            nickedHere = true;
          }
        }
      }
    }
    if (!flags.some(Boolean)) {
      out.push(sub);
      if (nickedHere) {
        nicked.add(sub);
      }
      continue;
    }
    cut = true;
    if (flags.every(Boolean)) {
      continue;
    }
    // Boundaries between kept and removed, refined.
    const edge = (i: number) => {
      let [lo, hi] = [samples[i], samples[i + 1]];
      const keepLo = !flags[i];
      for (let j = 0; j < 14; j++) {
        const mid = (lo + hi) / 2;
        if (!hit(mid) === keepLo) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return keepLo ? lo : hi;
    };
    // Kept runs, as arc intervals (a closed ring's run may wrap round).
    const runs: [number, number][] = [];
    let start: number | null = flags[0] ? null : 0;
    for (let i = 0; i < N; i++) {
      if (flags[i] !== flags[i + 1]) {
        const s = edge(i);
        if (flags[i + 1]) {
          if (start !== null) {
            runs.push([start, s]);
          }
          start = null;
        } else {
          start = s;
        }
      }
    }
    if (start !== null) {
      runs.push([start, total]);
    }
    if (
      sub.closed &&
      runs.length > 1 &&
      runs[0][0] === 0 &&
      runs[runs.length - 1][1] === total
    ) {
      const last = runs.pop()!;
      runs[0] = [last[0] - total, runs[0][1]];
    }
    // The clean-cut rule's corners: a cut end just short of a corner (a vertex turning more than 25°), under
    // CLEAN.stub from it, extends to the corner.
    const turnAt = (v: number) => {
      const [u, w2] = [
        walk.dir(Math.max(0, v - 1e-4)),
        walk.dir(Math.min(total - 1e-9, v + 1e-4)),
      ];
      return Math.acos(Math.max(-1, Math.min(1, u[0] * w2[0] + u[1] * w2[1])));
    };
    const corner = (from: number, toward: 1 | -1): number | null => {
      if (!CLEAN.on) {
        return null;
      }
      const vs = walk.len
        .slice(0, pts.length)
        .flatMap((v) => (sub.closed ? [v - total, v, v + total] : [v]));
      const near = vs
        .filter(
          (v) => toward * (v - from) > 1e-6 && toward * (v - from) < CLEAN.stub
        )
        .sort((a, b) => toward * (a - b));
      for (const v of near) {
        if (turnAt(((v % total) + total) % total) > (25 * Math.PI) / 180) {
          return Math.abs(v - from) >= 0.15 ? v : null;
        }
      }
      return null;
    };
    for (let [s0, s1] of runs) {
      const cutStart = s0 > 1e-9 || sub.closed;
      const cutEnd = s1 < total - 1e-9 || sub.closed;
      if (cutStart) {
        const v = corner(s0, 1);
        if (v !== null && v < s1) {
          events.push({
            rule: 'corner',
            size: v - s0,
            at: walk.at(((s0 % total) + total) % total).p,
          });
          s0 = v;
        }
      }
      if (cutEnd) {
        const v = corner(s1, -1);
        if (v !== null && v > s0) {
          events.push({
            rule: 'corner',
            size: s1 - v,
            at: walk.at(((s1 % total) + total) % total).p,
          });
          s1 = v;
        }
      }
      // A run the cut leaves shorter than a stub (CLEAN.stub; without the rule, its own weight) is a fragment: it goes.
      if (
        s1 - s0 <
        (CLEAN.on ? CLEAN.stub : Math.max(SLIVER_AREA / (2 * hw), 2 * hw))
      ) {
        if (CLEAN.on) {
          events.push({
            rule: 'fragment',
            size: s1 - s0,
            at: walk.at(((((s0 + s1) / 2) % total) + total) % total).p,
          });
        }
        continue;
      }
      const at = (s: number) => walk.at(((s % total) + total) % total).p;
      const mid: [number, Pt][] = [];
      for (let k = 0; k < pts.length; k++) {
        const v = walk.len[k];
        for (const vv of [v - total, v]) {
          if (vv > s0 + 1e-9 && vv < s1 - 1e-9) {
            mid.push([vv, pts[k]]);
          }
        }
      }
      const ptsRun: Pt[] = [
        at(s0),
        ...mid.sort((a, b) => a[0] - b[0]).map(([, q]) => q),
        at(s1),
      ];
      const dedup = ptsRun.filter(
        (q, i) =>
          i === 0 ||
          Math.hypot(q[0] - ptsRun[i - 1][0], q[1] - ptsRun[i - 1][1]) > 1e-9
      );
      if (dedup.length > 1) {
        const run = { pts: dedup, closed: false };
        out.push(run);
        if (nickedHere) {
          nicked.add(run);
        }
      }
      if (cutStart) {
        const c = sect(((s0 % total) + total) % total);
        ends.push({ a: c.a, b: c.b });
      }
      if (cutEnd) {
        const c = sect(((s1 % total) + total) % total);
        ends.push({ a: c.a, b: c.b });
      }
    }
  }
  return { subs: out, ends, cut, nicked };
}

/** Does the convex hull H of a wall end c reach ink that isn't c's (beside the wall, outside the zone)? */
function bites(
  loops: Pt[][],
  evenodd: boolean,
  H: Region,
  c: Pt[],
  zone: Region
): boolean {
  const [x0, y0, x1, y1] = bboxOf(H);
  const step = 0.2;
  for (let y = y0 + step / 2; y < y1; y += step) {
    for (let x = x0 + step / 2; x < x1; x += step) {
      const q: Pt = [x, y];
      if (
        depth(H, q) < 0.02 ||
        depth(zone, q) > -0.02 ||
        windingAt([c], q) !== 0
      ) {
        continue;
      }
      // Just outside c's own outline doesn't count (its edges run along the ink's).
      let near = false;
      for (let i = 0; i < c.length && !near; i++) {
        near = segDist(q, c[i], c[(i + 1) % c.length]) < 0.05;
      }
      if (!near && paintedBy(loops, evenodd, q)) {
        return true;
      }
    }
  }
  return false;
}

/** Below this, a piece the cut leaves is a sliver, not a wall: shorter than its own 2px weight and a bit. */
export const SLIVER_AREA = 2.5;

/**
 * Pieces the cut leaves that are too small to read (a wall's tip just
 * outside the gap, a corner cut off): a loop near the cut, not one of the
 * shape's own rings (a dot the cut never touched), whose painted area (net
 * of any wall end cancelled inside it) is under SLIVER_AREA goes, with the
 * cancelling rings inside it.
 */
function dropSlivers(
  loops: Pt[][],
  cancel: Pt[][],
  original: Pt[][],
  evenodd: boolean,
  near: Box,
  limit = SLIVER_AREA,
  dropped: { size: number; at: Pt }[] = []
): { loops: Pt[][]; cancel: Pt[][] } {
  const own = new Set(original);
  const box: Box = [near[0] - 2, near[1] - 2, near[2] + 2, near[3] + 2];
  const all = [...loops, ...cancel];
  const gone = new Set<Pt[]>();
  for (const r of loops) {
    if (
      own.has(r) ||
      Math.abs(area(r)) >= 4 * limit ||
      !meets(bboxOf(r), box)
    ) {
      continue;
    }
    const rbox = bboxOf(r);
    const [x0, y0, x1, y1] = rbox;
    const local = all.filter((o) =>
      meets(bboxOf(o), [x0 - 1e-6, y0 - 1e-6, x1 + 1e-6, y1 + 1e-6])
    );
    const step = 0.12;
    let net = 0;
    for (let y = y0 + step / 2; y < y1 && net < limit; y += step) {
      for (let x = x0 + step / 2; x < x1; x += step) {
        if (windingAt([r], [x, y]) !== 0 && paintedBy(local, evenodd, [x, y])) {
          net += step * step;
        }
      }
    }
    if (net >= limit) {
      continue;
    }
    // Not if another kept loop crosses into it (it's part of something bigger).
    if (
      loops.some(
        (o) =>
          o !== r &&
          !gone.has(o) &&
          Math.abs(area(o)) > Math.abs(area(r)) &&
          o.some(
            ([x, y]) =>
              x > x0 &&
              x < x1 &&
              y > y0 &&
              y < y1 &&
              windingAt([r], [x, y]) !== 0
          )
      )
    ) {
      continue;
    }
    gone.add(r);
    if (net >= 0.01) {
      dropped.push({ size: net, at: [(x0 + x1) / 2, (y0 + y1) / 2] });
    }
    for (const c of cancel) {
      if (
        c.every(
          (q) =>
            q[0] >= x0 - 1e-6 &&
            q[0] <= x1 + 1e-6 &&
            q[1] >= y0 - 1e-6 &&
            q[1] <= y1 + 1e-6
        )
      ) {
        gone.add(c);
      }
    }
  }
  return {
    loops: loops.filter((r) => !gone.has(r)),
    cancel: cancel.filter((c) => !gone.has(c)),
  };
}

/**
 * Rings as a nonzero path that paints what they painted by `evenodd`: each
 * ring wound by how deep it nests (outlines one way, holes the other, islands
 * in holes the first way again). The clean-cut rule puts nicked ink back by
 * overlapping it, which only adds up under nonzero.
 */
function asNonzero(rings: Pt[][], evenodd: boolean): Pt[][] {
  if (!evenodd) {
    return rings;
  }
  return rings.map((r, i) => {
    // A point just inside the ring (off its outline, which a cut may share with another ring).
    let probe: Pt = r[0];
    for (let k = 0; k < r.length; k++) {
      const [a, b] = [r[k], r[(k + 1) % r.length]];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (l < 1e-3) {
        continue;
      }
      const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const q: Pt = [
        m[0] - ((b[1] - a[1]) / l) * 1e-3,
        m[1] + ((b[0] - a[0]) / l) * 1e-3,
      ];
      const q2: Pt = [
        m[0] + ((b[1] - a[1]) / l) * 1e-3,
        m[1] - ((b[0] - a[0]) / l) * 1e-3,
      ];
      const inside =
        windingAt([r], q) !== 0 ? q : windingAt([r], q2) !== 0 ? q2 : null;
      if (
        inside &&
        rings.every(
          (o, j) =>
            j === i ||
            o.every((p, n) => segDist(inside, p, o[(n + 1) % o.length]) > 2e-3)
        )
      ) {
        probe = inside;
        break;
      }
    }
    const nest = rings.filter(
      (o, j) => j !== i && windingAt([o], probe) !== 0
    ).length;
    const want = nest % 2 === 0 ? 1 : -1;
    return Math.sign(area(r)) === want ? r : [...r].reverse();
  });
}

/** The nearest point on any loop's outline to p (within 0.06), as ring and arc position. */
function onOutline(walks: Walk[], p: Pt): { r: number; s: number } | null {
  let best: { r: number; s: number; d: number } | null = null;
  walks.forEach((w, r) => {
    for (let i = 0; i < w.pts.length; i++) {
      const [a, b] = [w.pts[i], w.pts[(i + 1) % w.pts.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy || 1;
      const t = Math.max(
        0,
        Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)
      );
      const d = Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
      if (d < 0.06 && (!best || d < best.d)) {
        best = { r, s: w.len[i] + t * Math.sqrt(l2), d };
      }
    }
  });
  return best;
}

/**
 * The clean-cut rule's stubs and corners on a filled shape: from each square
 * end (a, b), each side of the wall is followed away from the cut while the
 * wall keeps its width (the other side straight across, within 30%); where
 * either side stops being a wall (it meets the wall it hangs on, or turns a
 * corner) under CLEAN.stub from the end, the wall back to there goes: cut
 * across it there, flush with the other wall's edge.
 */
function cleanStubs(
  loops: Pt[][],
  ends: { a: Pt; b: Pt; square: boolean }[],
  zone: Region,
  events: Omit<CleanEvent, 'shape'>[]
): Pt[][] {
  for (const e of ends) {
    if (!e.square) {
      continue;
    }
    const w0 = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]);
    if (w0 < 1 || w0 > 3.2) {
      continue;
    }
    const walks = loops.map((r) => new Walk(r));
    const ink = (q: Pt) => paintedBy(loops, false, q);
    const onCut = (q: Pt) => segDist(q, e.a, e.b) < 0.03;
    /** Across the wall from q (inward normal n): the nearest outline point within 45° of n, off the cut line. */
    const across = (q: Pt, n: Pt): number | null => {
      let best = Infinity;
      for (const w of walks) {
        for (let i = 0; i < w.pts.length; i++) {
          const [a, b] = [w.pts[i], w.pts[(i + 1) % w.pts.length]];
          const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
          const l2 = dx * dx + dy * dy || 1;
          const t = Math.max(
            0,
            Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2)
          );
          const f: Pt = [a[0] + dx * t, a[1] + dy * t];
          const d = Math.hypot(f[0] - q[0], f[1] - q[1]);
          if (d < 0.2 || d >= best || onCut(f)) {
            continue;
          }
          if (((f[0] - q[0]) * n[0] + (f[1] - q[1]) * n[1]) / d < 0.85) {
            continue;
          }
          best = d;
        }
      }
      return Number.isFinite(best) ? best : null;
    };
    /** How far side `p` runs as this wall before it stops being one (Infinity: past CLEAN.stub), and where. */
    const side = (p: Pt, other: Pt) => {
      const at = onOutline(walks, p);
      if (!at) {
        return null;
      }
      const w = walks[at.r];
      const off = (q: Pt) =>
        Math.abs(
          (other[0] - p[0]) * (q[1] - p[1]) - (other[1] - p[1]) * (q[0] - p[0])
        ) / w0;
      const dir: 1 | -1 =
        off(w.at(at.s + 0.25).p) > off(w.at(at.s - 0.25).p) ? 1 : -1;
      const t0 = w.dir(at.s + dir * 0.02);
      const ok = (t: number) => {
        const q = w.at(at.s + dir * t).p;
        const tg = w.dir(at.s + dir * t);
        // The side turning sharply (onto the wall it hangs on, or round a corner) ends the wall here;
        // a curved wall's gentle turn doesn't (a ring of r 4 turns 4° in 0.3).
        const back = w.dir(at.s + dir * Math.max(0.02, t - 0.3));
        if (
          tg[0] * back[0] + tg[1] * back[1] <
          Math.cos((35 * Math.PI) / 180)
        ) {
          return false;
        }
        void t0;
        const n: Pt = ink([q[0] - tg[1] * 0.05, q[1] + tg[0] * 0.05])
          ? [-tg[1], tg[0]]
          : [tg[1], -tg[0]];
        const d = across(q, n);
        return d !== null && Math.abs(d - w0) < 0.3 * w0;
      };
      const step = 0.05;
      for (let t = step; t <= CLEAN.stub + step; t += step) {
        if (ok(t)) {
          continue;
        }
        let [lo, hi] = [t - step, t];
        for (let j = 0; j < 12; j++) {
          const m = (lo + hi) / 2;
          if (ok(m)) {
            lo = m;
          } else {
            hi = m;
          }
        }
        return { len: lo, at: (L: number) => w.at(at.s + dir * L).p };
      }
      return { len: Infinity, at: (L: number) => w.at(at.s + dir * L).p };
    };
    const [sa, sb] = [side(e.a, e.b), side(e.b, e.a)];
    if (!sa || !sb) {
      continue;
    }
    const L = Math.min(sa.len, sb.len);
    if (!(L < CLEAN.stub) || L < 0.05) {
      continue;
    }
    const [a2, b2] = [sa.at(L), sb.at(L)];
    // Where a side stopped by turning back on itself (the wall's own end), it's a fragment, not a stub: leave it to the fragment rule.
    if (Math.abs(Math.hypot(b2[0] - a2[0], b2[1] - a2[1]) - w0) > 0.4 * w0) {
      continue;
    }
    const Q: Pt[] = [e.a, e.b, b2, a2];
    const H = insetPoly(hull(Q), -0.002);
    if (bites(loops, false, H, Q, zone)) {
      continue;
    }
    const count = loops.length;
    loops = loops.flatMap((r) =>
      meets(bboxOf(r), bboxOf(H)) ? minusConvex(r, H) : [r]
    );
    // A piece that went whole (the walk reached its own far end) is a fragment; else a stub off a wall, or a tail past a corner.
    const rule =
      loops.length < count
        ? 'fragment'
        : Math.abs(sa.len - sb.len) < 0.8
          ? 'stub'
          : 'corner';
    events.push({
      rule,
      size: rule === 'fragment' ? L * w0 : L,
      at: [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2],
    });
    [e.a, e.b] = [a2, b2];
  }
  return loops;
}

/** base − zone, with Carbon's square wall ends (see above). */
export function squareCut(
  base: Shapes,
  zone: Region | null,
  opts: { swallow?: boolean } = {}
): { shapes: Shapes; report: CutReport } {
  const report: CutReport = {
    ends: [],
    squared: 0,
    fallbacks: 0,
    solids: 0,
    reasons: [],
    clean: [],
  };
  if (!zone || zone.length < 3) {
    return { shapes: knockout(base, null), report };
  }
  const rb = bboxOf(zone);
  const out: Shapes = {};
  for (const [key, attrs] of Object.entries(base)) {
    const d = shapeD(attrs);
    const stroked =
      attrs.stroke !== undefined &&
      attrs.stroke !== 'none' &&
      Number(attrs.strokeWidth ?? 1) > 0;
    if (d === null || (stroked && attrs.fill !== 'none')) {
      out[key] = knockout({ [key]: attrs }, zone)[key];
      continue;
    }
    const m = attrs.transform ? parseTransform(String(attrs.transform)) : null;
    const map = (subs: Sub[]) =>
      m
        ? subs.map((s) => ({
            ...s,
            pts: s.pts.map(
              ([x, y]) =>
                [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]] as Pt
            ),
          }))
        : subs;
    const {
      tag: _t,
      cx: _1,
      cy: _2,
      r: _3,
      rx: _4,
      ry: _5,
      x: _6,
      y: _7,
      width: _8,
      height: _9,
      x1: _a,
      y1: _b,
      x2: _c,
      y2: _e,
      points: _f,
      ...rest
    } = attrs;
    void [_t, _1, _2, _3, _4, _5, _6, _7, _8, _9, _a, _b, _c, _e, _f];
    const untouched = () => {
      out[key] = { ...rest, d, fillRule: attrs.fillRule ?? 'nonzero' };
    };
    if (stroked) {
      const w =
        Number(attrs.strokeWidth ?? 1) *
        (m ? Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) : 1);
      const subs = map(dash(flattenPath(d), attrs));
      const sb = bboxOf(subs.flatMap((s) => s.pts));
      if (!meets([sb[0] - w, sb[1] - w, sb[2] + w, sb[3] + w], rb)) {
        untouched();
        continue;
      }
      const ev: Omit<CleanEvent, 'shape'>[] = [];
      const t = trimStroke(subs, w / 2, zone, ev);
      report.clean.push(...ev.map((x) => ({ ...x, shape: key })));
      if (!t.cut) {
        if (!t.nicked.size) {
          untouched();
          continue;
        }
        // Only nicked: the line as it was.
        untouched();
        continue;
      }
      const join = String(attrs.strokeLinejoin ?? 'miter') as Join;
      const pieces = strokePieces(
        t.subs.filter((q) => !t.nicked.has(q)),
        w,
        join,
        'butt'
      );
      // Joins near the zone are still cut to it (the hug, rarely needed); not where a nick was kept.
      const dd =
        String(
          knockout(
            {
              k: {
                d: pieces.map((q) => ringD(q)).join(''),
                fillRule: 'nonzero',
              },
            },
            zone
          ).k.d
        ) +
        strokePieces(
          t.subs.filter((q) => t.nicked.has(q)),
          w,
          join,
          'butt'
        )
          .map((q) => ringD(q))
          .join('');
      report.ends.push(
        ...t.ends.map((e) => ({ ...e, square: true, shape: key }))
      );
      report.squared += t.ends.length;
      out[key] = {
        ...rest,
        d: String(dd),
        fill: 'currentColor',
        stroke: 'none',
        strokeDasharray: 'none',
        fillRule: 'nonzero',
        ...(attrs.transform ? { transform: '' } : {}),
      };
      continue;
    }
    const raw = map(flattenPath(d)).map((s) =>
      s.pts.map(([x, y]) => [+fmt(x), +fmt(y)] as Pt)
    );
    const all = raw.flat();
    if (!all.length || !meets(bboxOf(all), rb)) {
      untouched();
      continue;
    }
    // With the clean-cut rule every shape is cut as nonzero (an even-odd one rewound to paint the same).
    const evenodd = !CLEAN.on && attrs.fillRule === 'evenodd';
    const rings = CLEAN.on ? asNonzero(raw, attrs.fillRule === 'evenodd') : raw;
    const sq = squareEnds(rings, evenodd, zone);
    // `swallow` (box mode): a piece wholly inside the zone goes even where the rest is only nicked (Incomplete's lower
    // dashes, in the box, beside the upper dash's nicked end). Off for the other icons, whose cuts predate it.
    const swallowed =
      !!opts.swallow && rings.some((r) => r.every((q) => inZone(q, zone)));
    if (sq.nicks.length && !sq.cuts.length && !sq.ends.length && !swallowed) {
      // Only nicked: the shape as it was.
      for (const n of sq.nicks) {
        report.clean.push({
          rule: 'nick',
          shape: key,
          size: n.depth,
          at: n.at,
        });
      }
      untouched();
      continue;
    }
    let loops = rings.flatMap((r) =>
      meets(bboxOf(r), rb) ? minusConvex(r, zone) : [r]
    );
    // Each wall end goes as a convex piece too (its hull), unless the hull would bite other ink:
    // then it's cancelled as winding (inside the ink, so no hairline shows in the cut).
    const cancel: Pt[][] = [];
    for (const c of sq.cuts) {
      if (c.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) {
        // A wall end the walk couldn't trace (a degenerate outline): it keeps the hugging cut.
        report.fallbacks++;
        report.reasons.push(`${key}: wall end not traceable`);
        continue;
      }
      // Grown a hair, so the ink's own edges along the hull's sides fall inside it (a clean crossing, not a touch).
      const H = insetPoly(hull(c), -0.002);
      if (bites(loops, evenodd, H, c, zone)) {
        cancel.push(c);
      } else {
        loops = loops.flatMap((r) =>
          meets(bboxOf(r), bboxOf(H)) ? minusConvex(r, H) : [r]
        );
      }
    }
    const dropped: { size: number; at: Pt }[] = [];
    const kept = dropSlivers(
      loops,
      cancel,
      rings,
      evenodd,
      rb,
      CLEAN.on ? 2 * CLEAN.stub : SLIVER_AREA,
      dropped
    );
    loops = kept.loops;
    cancel.length = 0;
    cancel.push(...kept.cancel);
    if (CLEAN.on) {
      report.clean.push(
        ...dropped.map((x) => ({ rule: 'fragment' as const, shape: key, ...x }))
      );
      // Stubs and corners (the cancelling cuts are inside the ink and would read as walls: not with them).
      if (!cancel.length) {
        const ev: Omit<CleanEvent, 'shape'>[] = [];
        loops = cleanStubs(loops, sq.ends, zone, ev);
        report.clean.push(...ev.map((x) => ({ ...x, shape: key })));
        const again = dropSlivers(
          loops,
          [],
          rings,
          false,
          rb,
          2 * CLEAN.stub,
          dropped
        );
        loops = again.loops;
      }
      // Nicks: the ink the zone took there goes back: the shape's own rings clipped to the nick's window (each
      // ring keeps its winding, so they add up to the shape's ink there), overlapping the ink beside it (no seam).
      for (const n of sq.nicks) {
        const W = hull(n.piece);
        for (const r of rings) {
          if (!meets(bboxOf(r), bboxOf(W))) {
            continue;
          }
          const c = clipConvex(r, W);
          if (c.length > 2 && Math.abs(area(c)) > 1e-6) {
            loops.push(c);
          }
        }
        report.clean.push({
          rule: 'nick',
          shape: key,
          size: n.depth,
          at: n.at,
        });
      }
    }
    let dd = '';
    for (const r of [...loops, ...cancel]) {
      dd += ringD(r);
    }
    // Ends on a piece that went as a sliver aren't ends any more.
    const onInk = (e: { a: Pt; b: Pt; square: boolean }) => {
      // A square end's middle lies on the outline; a hugging chain's chord crosses the zone, so test its ends.
      const pts: Pt[] = e.square
        ? [[(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2]]
        : [e.a, e.b];
      return pts.some((m) =>
        [...loops, ...cancel].some((r) =>
          r.some((q, i) => segDist(m, q, r[(i + 1) % r.length]) < 0.05)
        )
      );
    };
    const ends = sq.ends.filter(onInk);
    report.ends.push(
      ...ends.map((e) => ({ a: e.a, b: e.b, square: e.square, shape: key }))
    );
    report.squared += ends.filter((e) => e.square).length;
    // A hugging chain on a piece that went as a sliver left nothing behind: only the ones still drawn count.
    const hugging = ends.filter((e) => !e.square && !e.solid).length;
    report.fallbacks += hugging;
    report.solids += sq.solids;
    if (hugging) {
      report.reasons.push(...sq.reasons.map((r) => `${key}: ${r}`));
    }
    out[key] = {
      ...rest,
      d: dd,
      fill: 'currentColor',
      stroke: 'none',
      strokeDasharray: 'none',
      fillRule: evenodd ? 'evenodd' : 'nonzero',
      ...(attrs.transform ? { transform: '' } : {}),
    };
  }
  return { shapes: out, report };
}

// ── Measuring the gap ────────────────────────────────────────────────────────

const segDist = (p: Pt, a: Pt, b: Pt) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = dx * dx + dy * dy;
  const t = l
    ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l))
    : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
/** How far p is inside the convex polygon q (negative: outside, by at least that much). */
function depth(q: readonly Pt[], [x, y]: Pt): number {
  const ar = area(q as Pt[]);
  let m = Infinity;
  for (let i = 0; i < q.length; i++) {
    const [a, b] = [q[i], q[(i + 1) % q.length]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const sd = ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) / l;
    m = Math.min(m, ar > 0 ? sd : -sd);
  }
  return m;
}
/** Distance from p to ink made of convex pieces (0 inside). */
function inkDist(pieces: readonly Pt[][], p: Pt): number {
  let m = Infinity;
  for (const q of pieces) {
    if (depth(q, p) >= 0) {
      return 0;
    }
    for (let i = 0; i < q.length; i++) {
      m = Math.min(m, segDist(p, q[i], q[(i + 1) % q.length]));
    }
  }
  return m;
}

/**
 * The gap between a status's mark and the cut base at rest: over
 * every wall end, the distance from the mark to its nearest point (`min`,
 * which should be the gap: the end sits where the wall first clears it) and
 * to its farthest (`max`: more at a square end's far corner, as Carbon's).
 * `ends` / `fallbacks` count the square ends and the chains left hugging.
 */
export function measureGap(
  base: Shapes,
  p: Placement,
  s: Mark,
  text = '1'
): Gap {
  const w = countWidth(text);
  const { report } = squareCut(base, statusZone(p, s, w));
  return gapOf(report, markInk(p, s, w));
}
export interface Gap {
  min: number;
  max: number;
  ends: number;
  fallbacks: number;
  perEnd: number[];
}
/** The gap a cut leaves: from the mark's ink to each wall end (as measureGap). */
export function gapOf(report: CutReport, mark: Pt[][]): Gap {
  let [min, max] = [Infinity, 0];
  const perEnd: number[] = [];
  for (const e of report.ends) {
    let near = Infinity;
    // A square end's whole width; a hugging chain's two ends (its chord runs through the zone).
    for (let k = 0; k <= 8; k += e.square ? 1 : 8) {
      const q: Pt = [
        e.a[0] + ((e.b[0] - e.a[0]) * k) / 8,
        e.a[1] + ((e.b[1] - e.a[1]) * k) / 8,
      ];
      const d = inkDist(mark, q);
      [min, max, near] = [
        Math.min(min, d),
        Math.max(max, d),
        Math.min(near, d),
      ];
    }
    perEnd.push(near);
  }
  return {
    min,
    max,
    ends: report.ends.length,
    fallbacks: report.fallbacks,
    perEnd,
  };
}

// ── The status layer ─────────────────────────────────────────────────────────

/** A frame icon's geometry (a hover icon's, or a toggle's in its first state). */
/**
 * A status icon's base: its plain geometry at hover `h` (`p`, `e` 0). `k`,
 * how far the cut is open (0–1), is for a base that settles into Carbon's
 * own badge drawing as a mark arrives (the checkmarks, in-progress and
 * incomplete: Carbon's status variants draw them smaller, centred at 14,14);
 * the other bases ignore it. `mh`, the mark's hover (the status aliases),
 * is for a base whose open end must draw back as the mark grows (Incomplete's
 * upper dash).
 */
export type BaseGeo = (
  f: {
    h: number;
    p: number;
    e: number;
    entering?: number;
    k?: number;
    mh?: number;
  },
  size?: number
) => Shapes;

export interface StatusFrame extends MarkFrame, CountText {
  h: number;
  entering: number;
  /** The mark whose zone is cut (an index into STATUSES), how far it's open (0–1), and the zone it's morphing from (`as`, `km` 0 → 1). */
  ks: number;
  kr: number;
  as: number;
  km: number;
  /**
   * An action's tail (its hand-off, engine/action.ts): while it runs, the
   * base is the action's drawing at `tail.at(ta)`, so the icon finishes its
   * motion under the entering mark.
   */
  tail?: {
    geo: (f: { h: number; a: number }, size?: number) => Shapes;
    at(u: number): number;
    id: number;
  };
  ta?: number;
}

const ZERO_MARKS: MarkFrame = {
  cp: 0,
  ce: 0,
  pp: 0,
  sp: 0,
  se: 0,
  sa: 0,
  sw: 0,
  wp: 0,
  ep: 0,
  dp: 0,
  np: 0,
  nt: 1,
};

/** The resting frame for a mark (`still`: the reduced-motion drawing, dots for pending; `text`: a count's). */
export function restFrame(
  p: Placement,
  s: Mark,
  still = false,
  text = ''
): StatusFrame {
  void p;
  const i = sIdx(s === 'none' ? 'success' : s);
  return {
    h: 0,
    entering: 1,
    ks: i,
    kr: s === 'none' ? 0 : 1,
    as: i,
    km: 1,
    ...ZERO_MARKS,
    cp: s === 'success' ? 1 : 0,
    pp: s === 'notification' ? 1 : 0,
    sp: s === 'pending' && !still ? 1 : 0,
    dp: s === 'pending' && still ? 1 : 0,
    wp: s === 'warning' ? 1 : 0,
    ep: s === 'error' ? 1 : 0,
    np: s === 'count' ? 1 : 0,
    nFrom: text,
    nTo: text,
    nDir: 1,
  };
}

/** The zone a frame cuts: the mark's (morphing from the last one's), at the marks' hover and the count's width, opened `kr`. */
export function frameZone(p: Placement, f: StatusFrame): Region | null {
  const w = countWidthAt(f);
  const mh = f.mh ?? 0;
  const to = modeZone(p, STATUSES[Math.round(f.ks)], w, mh);
  // (A box is the same for every mark: nothing to morph.)
  const z =
    f.km < 1 - 1e-6 && p.mode !== 'box'
      ? blendZones(modeZone(p, STATUSES[Math.round(f.as)], w, mh), to, f.km)
      : to;
  // Opening or closing, the zone scaled about its reveal centre (the frame's corner; the mark's centre in the
  // offset mode) by its opening: the fixes' and reports' zone. The cut itself grows its own region (cutFrame), so
  // the knockout doesn't take most of its final area on the first frame.
  if (f.kr <= 1e-3) {
    return null;
  }
  return f.kr >= 1 - 1e-6
    ? z
    : scalePts(z, revealCentre(p, STATUSES[Math.round(f.ks)]), f.kr);
}

/**
 * Where a status cut's growth starts: the share of its change its first frame
 * shows. From there it grows to the whole; closing, it shrinks back to this
 * share, and the last frame takes the rest. 0: it grows from nothing.
 */
export const CUT_START = 0;
/** How much of the opening passes before the cut shows anything (its first frame takes next to nothing). */
const CUT_LAG = 0.15;
/**
 * The share of the cut's change shown at opening k (0 while it's closed). The
 * opening runs linear in time (plan), and this is its ease: a smoothstep after
 * CUT_LAG, so a fast-01 opening shows no frame more than about 40% (at 70ms, its four
 * frames showed about 3%, 36%, 73% and 99%), and a fast-02 one smaller steps.
 */
const growth = (k: number) => {
  if (k <= 1e-3) {
    return 0;
  }
  const x = Math.min(1, Math.max(0, (k - CUT_LAG) / (1 - CUT_LAG)));
  return CUT_START + (1 - CUT_START) * x * x * (3 - 2 * x);
};

/** One frame's cut, with its working: the (hand-fixed) base, the cut base, the cut's report, the zone and the part of it the cut has reached. */
export function cutFrame(
  base: BaseGeo,
  p: Placement,
  f: StatusFrame,
  size?: number
): {
  base: Shapes;
  cut: Shapes;
  report: CutReport;
  zone: Region | null;
  reached: Region | null;
} {
  const zone = frameZone(p, f);
  // A status arriving mid-hover: the base's hover (easing out on its own) is also taken down with the cut's
  // opening (by (1 − k)²), so it's at rest by the time the cut is fully open and barely moves a wall through a
  // half-open cut (Settings' gear turning back through it left slanted ends).
  const h = f.h * (1 - Math.min(1, Math.max(0, f.kr))) ** 2;
  const shapes =
    f.tail && f.ta !== undefined
      ? f.tail.geo({ h: 0, a: f.tail.at(f.ta) }, size)
      : base(
          {
            h,
            p: 0,
            e: 0,
            entering: f.entering,
            k: Math.min(1, Math.max(0, f.kr)),
            ...(f.mh ? { mh: f.mh } : {}),
          },
          size
        );
  const cutWith = (z: Region | null, k: number) => {
    const fixed =
      p.fix && z
        ? p.fix(shapes, {
            mark: STATUSES[Math.round(f.ks)],
            from: STATUSES[Math.round(f.as)],
            km: f.km,
            k,
            h,
            size,
            zone: z,
          })
        : shapes;
    const { shapes: cut, report } =
      p.mode === 'offset'
        ? hugCut(fixed, z)
        : squareCut(fixed, z, { swallow: p.mode === 'box' });
    if (p.drop) {
      for (const key of p.drop) {
        if (cut[key]) {
          cut[key] = { ...cut[key], opacity: z ? 0 : 1 };
        }
      }
    }
    return { fixed, cut, report };
  };
  if (!zone || f.kr >= 1 - 1e-6) {
    const r = cutWith(zone, f.kr);
    return { base: r.fixed, cut: r.cut, report: r.report, zone, reached: zone };
  }
  // Opening or closing (the cut grows from nothing): this frame's final cut (the whole zone, hand
  // fixes and all) shows inside a region that grows from nothing, the base outside it. The knockout grows smoothly
  // over the whole opening whatever the clean-cut rules and the fixes do at full size, and tracks a base that is
  // still moving (the final cut is this frame's).
  const whole = frameZone(p, { ...f, kr: 1 });
  const r = cutWith(whole, 1);
  if (!whole) {
    return {
      base: shapes,
      cut: r.cut,
      report: r.report,
      zone: null,
      reached: null,
    };
  }
  // The region: the box round everything the final cut changes (the zone, and the base's points it takes away or
  // adds: square ends past the zone's edge, a wall cut to its free end, a fix's own regions and wall ends), so
  // nothing waits for the last frame, square to the icon's walls so its front ends them square. It grows from its
  // point nearest the reveal centre (the frame's corner; the mark's centre in the offset mode), so the cut starts
  // where it first touches and spreads from there, as far as shows growth(k) of the change (by area, sampled):
  // however the change lies in it, it starts at CUT_START and eases in. A wall a side runs along thins for a frame
  // or two as the front passes it (the sliver suite allows slivers only while a cut grows, shrinks or moves, and
  // holds every frame at rest to the clean-cut rule).
  const [x0, y0, x1, y1] = bboxOf([
    ...whole,
    ...removedPoints(shapes, r.cut),
    ...removedPoints(r.cut, shapes),
  ]);
  const box: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const from = nearestIn(box, revealCentre(p, STATUSES[Math.round(f.ks)]));
  const [pa, pb] = [inkParts(shapes), inkParts(r.cut)];
  const gauges = changeGauges(pa, pb, box, from);
  const share = growth(f.kr) * gauges.length;
  const i = Math.floor(share);
  const s0 =
    i >= gauges.length
      ? (gauges[gauges.length - 1] ?? 1)
      : (gauges[i - 1] ?? 0) +
        ((gauges[i] ?? 0) - (gauges[i - 1] ?? 0)) * (share - i);
  if (s0 <= 1e-4) {
    return {
      base: shapes,
      cut: cutWith(null, 0).cut,
      report: r.report,
      zone: null,
      reached: null,
    };
  }
  const region = scalePts(box, from, s0);
  // (`zone` is where the cut is this frame, the region; `reached`, the part of the mark's zone it has reached.)
  return {
    base: shapes,
    cut: composeIn(shapes, r.cut, region),
    report: r.report,
    zone: region,
    reached: clipConvex(whole, region),
  };
}

/** The change's sampling pitch (px): 4 samples a pixel. */
const PITCH = 0.5;

/**
 * Where the change from `pa` to `pb` lies in `reach` (convex) from `o`: for
 * each point (on a half-pixel grid) where they differ, the scale about `o` at
 * which the reach first takes it in; sorted.
 */
function changeGauges(
  pa: InkPart[],
  pb: InkPart[],
  reach: Pt[],
  o: Pt
): number[] {
  const sign = polyArea(reach) >= 0 ? 1 : -1;
  // Each edge's outward normal and its distance from o along it.
  const edges = reach.map((p, j) => {
    const q = reach[(j + 1) % reach.length];
    const n: Pt = [sign * (q[1] - p[1]), -sign * (q[0] - p[0])];
    return { n, d: (p[0] - o[0]) * n[0] + (p[1] - o[1]) * n[1] };
  });
  const gauge = (x: number, y: number) => {
    let g = 0;
    for (const e of edges) {
      const num = (x - o[0]) * e.n[0] + (y - o[1]) * e.n[1];
      if (e.d > 1e-9) {
        g = Math.max(g, num / e.d);
      } else if (num > 1e-9) {
        return Infinity;
      }
    }
    return g;
  };
  const [x0, y0, x1, y1] = bboxOf(reach);
  const out: number[] = [];
  for (let y = Math.floor(y0 / PITCH) * PITCH + PITCH / 2; y < y1; y += PITCH) {
    for (
      let x = Math.floor(x0 / PITCH) * PITCH + PITCH / 2;
      x < x1;
      x += PITCH
    ) {
      const g = gauge(x, y);
      if (!Number.isFinite(g)) {
        continue;
      }
      if (
        pa.some((part) => inPart(x, y, part)) !==
        pb.some((part) => inPart(x, y, part))
      ) {
        out.push(g);
      }
    }
  }
  return out.sort((m, n) => m - n);
}

type InkPart = {
  rings: Pt[][];
  evenodd: boolean;
  box: [number, number, number, number];
};
/** A drawing's parts as rings to sample (a part neither can cut, a tag or filled and stroked, aside). */
function inkParts(s: Shapes): InkPart[] {
  const out: InkPart[] = [];
  for (const a of Object.values(s)) {
    if (a.opacity === 0) {
      continue;
    }
    const ink = inkOf(a);
    if (typeof ink === 'string') {
      continue;
    }
    const rings = ink.rings.filter((r) => r.length > 2);
    if (rings.length) {
      out.push({
        rings,
        evenodd: ink.evenodd,
        box: bboxOf(rings.flat()) as InkPart['box'],
      });
    }
  }
  return out;
}
function inPart(x: number, y: number, part: InkPart): boolean {
  if (
    x < part.box[0] ||
    x > part.box[2] ||
    y < part.box[1] ||
    y > part.box[3]
  ) {
    return false;
  }
  let wind = 0;
  let cross = 0;
  for (const ring of part.rings) {
    for (let i = 0; i < ring.length; i++) {
      const [p, q] = [ring[i], ring[(i + 1) % ring.length]];
      if (
        p[1] <= y !== q[1] <= y &&
        p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]) > x
      ) {
        cross++;
        wind += q[1] > p[1] ? 1 : -1;
      }
    }
  }
  return part.evenodd ? cross % 2 === 1 : wind !== 0;
}

/** `pt` if it's inside the convex polygon `poly`, else the nearest point of its outline. */
function nearestIn(poly: Pt[], pt: Pt): Pt {
  let inside = true;
  let best: Pt = pt;
  let bd = Infinity;
  const sign = Math.sign(polyArea(poly)) || 1;
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    const cross =
      (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
    if (cross * sign < 0) {
      inside = false;
    }
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const L = dx * dx + dy * dy;
    const u = L
      ? Math.max(
          0,
          Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / L)
        )
      : 0;
    const q: Pt = [a[0] + u * dx, a[1] + u * dy];
    const d = Math.hypot(q[0] - pt[0], q[1] - pt[1]);
    if (d < bd) {
      [bd, best] = [d, q];
    }
  }
  return inside ? pt : best;
}
const polyArea = (p: Pt[]) =>
  p.reduce(
    (s, q, i) =>
      s + q[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * q[1],
    0
  ) / 2;

/** The base's points the final cut doesn't keep (its outline's vertices outside the cut's ink). */
function removedPoints(base: Shapes, cut: Shapes): Pt[] {
  const out: Pt[] = [];
  for (const [k, a] of Object.entries(base)) {
    if (a.opacity === 0) {
      continue;
    }
    const ink = inkOf(a);
    if (typeof ink === 'string') {
      continue;
    }
    const b = cut[k];
    const kept = b && b.opacity !== 0 ? inkOf(b) : null;
    const inside = (pt: Pt) => {
      if (!kept || typeof kept === 'string') {
        return false;
      }
      let wind = 0;
      let cross = 0;
      for (const ring of kept.rings) {
        for (let i = 0; i < ring.length; i++) {
          const [p, q] = [ring[i], ring[(i + 1) % ring.length]];
          if (p[1] <= pt[1] !== q[1] <= pt[1]) {
            const x = p[0] + ((pt[1] - p[1]) * (q[0] - p[0])) / (q[1] - p[1]);
            if (x > pt[0]) {
              cross++;
              wind += q[1] > p[1] ? 1 : -1;
            }
          }
        }
      }
      return kept.evenodd ? cross % 2 === 1 : wind !== 0;
    };
    // A vertex on the cut's own edge counts as kept: test a hair inside along the ring.
    for (const ring of ink.rings) {
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        const nx = ring[(i + 1) % ring.length];
        const probe: Pt = [
          pt[0] + (nx[0] - pt[0]) * 1e-3,
          pt[1] + (nx[1] - pt[1]) * 1e-3,
        ];
        if (!inside(pt) && !inside(probe)) {
          out.push(pt);
        }
      }
    }
  }
  return out;
}

/** Rings oriented by nesting depth (outlines one way, holes the other, islands back), so nonzero paints them as even-odd does. */
function byDepth(rings: Pt[][]): Pt[][] {
  return rings.map((ring, i) => {
    if (ring.length < 3) {
      return ring;
    }
    const probe = ring[0];
    let depth = 0;
    rings.forEach((other, j) => {
      if (j === i || other.length < 3) {
        return;
      }
      let c = false;
      for (let a = 0, b = other.length - 1; a < other.length; b = a++) {
        const [p, q] = [other[a], other[b]];
        if (
          p[1] > probe[1] !== q[1] > probe[1] &&
          probe[0] < ((q[0] - p[0]) * (probe[1] - p[1])) / (q[1] - p[1]) + p[0]
        ) {
          c = !c;
        }
      }
      if (c) {
        depth++;
      }
    });
    const positive = polyArea(ring) > 0;
    return positive === (depth % 2 === 0) ? ring : [...ring].reverse();
  });
}

/**
 * Inside `region` (convex) the final cut, outside it the base: each part one
 * path, its outside rings (the base's minus the region) and inside rings (the
 * final cut's clipped to it) meeting along the region's edge, run in opposite
 * directions with no overlap, so the part paints whole across it, with no
 * seam. A part the region doesn't reach is drawn as the final cut draws it
 * where that leaves it as it was (a circle as its path), else as the base.
 */
function composeIn(base: Shapes, final: Shapes, region: Region): Shapes {
  const rb = bboxOf(region);
  const out: Shapes = {};
  for (const k of new Set([...Object.keys(base), ...Object.keys(final)])) {
    const [a, b] = [base[k], final[k]];
    const aInk = a ? inkOf(a) : null;
    const bInk = b && b.opacity !== 0 ? inkOf(b) : null;
    if (typeof aInk === 'string' || typeof bInk === 'string') {
      out[k] = b ?? a; // a part neither can cut (a tag, filled and stroked): the final cut's
      continue;
    }
    const near = (ink: { rings: Pt[][] } | null) =>
      !!ink &&
      ink.rings.some((ring) => ring.length > 2 && meets(bboxOf(ring), rb));
    if (!near(aInk) && !near(bInk)) {
      out[k] =
        a &&
        b &&
        aInk &&
        bInk &&
        aInk.d === bInk.d &&
        a.transform === b.transform
          ? b
          : (a ?? b);
      continue;
    }
    // Both parts under one rule: when the base and the final cut differ, each even-odd part is re-oriented by depth
    // and the whole painted nonzero.
    const same = !aInk || !bInk || aInk.evenodd === bInk.evenodd;
    const rule = same ? !!(aInk ?? bInk)?.evenodd : false;
    const ringsOf = (ink: { rings: Pt[][]; evenodd: boolean } | null) => {
      const rs = (ink?.rings ?? []).map((raw) =>
        raw.map(([x, y]) => [+fmt(x), +fmt(y)] as Pt)
      );
      return !same && ink?.evenodd ? byDepth(rs) : rs;
    };
    let d = '';
    for (const ring of ringsOf(aInk)) {
      if (!meets(bboxOf(ring), rb)) {
        d += ringD(ring);
      } else {
        for (const piece of minusConvex(ring, region)) {
          d += ringD(piece);
        }
      }
    }
    for (const ring of ringsOf(bInk)) {
      if (meets(bboxOf(ring), rb)) {
        d += ringD(clipConvex(ring, region));
      }
    }
    const like = a ?? b;
    const {
      tag: _t,
      cx: _1,
      cy: _2,
      r: _3,
      rx: _4,
      ry: _5,
      x: _6,
      y: _7,
      width: _8,
      height: _9,
      x1: _a,
      y1: _b,
      x2: _c,
      y2: _d,
      points: _e,
      ...rest
    } = like;
    void [_t, _1, _2, _3, _4, _5, _6, _7, _8, _9, _a, _b, _c, _d, _e];
    out[k] = {
      ...rest,
      d,
      fill: 'currentColor',
      stroke: 'none',
      strokeDasharray: 'none',
      fillRule: rule ? 'evenodd' : 'nonzero',
      ...(like.transform ? { transform: '' } : {}),
    };
  }
  return out;
}

/**
 * The offset mode's cut: the base minus the zone, following its outline (no
 * square ends), as Carbon's status variants of filled and in-progress bases
 * cut. A piece the cut leaves smaller than a stub goes (the clean-cut
 * rule's fragment), as in the square cut.
 */
export function hugCut(
  base: Shapes,
  zone: Region | null
): { shapes: Shapes; report: CutReport } {
  const report: CutReport = {
    ends: [],
    squared: 0,
    fallbacks: 0,
    solids: 0,
    reasons: [],
    clean: [],
  };
  if (!zone || zone.length < 3) {
    return { shapes: knockout(base, null), report };
  }
  const rb = bboxOf(zone);
  const out: Shapes = {};
  for (const [key, attrs] of Object.entries(base)) {
    const ink = inkOf(attrs);
    const stroked = attrs.stroke !== undefined && attrs.stroke !== 'none';
    if (typeof ink === 'string' || stroked || attrs.transform) {
      out[key] = knockout({ [key]: attrs }, zone)[key];
      continue;
    }
    const raw = ink.rings.map((r) =>
      r.map(([x, y]) => [+fmt(x), +fmt(y)] as Pt)
    );
    const all = raw.flat();
    const {
      tag: _t,
      cx: _1,
      cy: _2,
      r: _3,
      rx: _4,
      ry: _5,
      x: _6,
      y: _7,
      width: _8,
      height: _9,
      x1: _a,
      y1: _b,
      x2: _c,
      y2: _e,
      points: _f,
      ...rest
    } = attrs;
    void [_t, _1, _2, _3, _4, _5, _6, _7, _8, _9, _a, _b, _c, _e, _f];
    if (!all.length || !meets(bboxOf(all), rb)) {
      out[key] = {
        ...rest,
        d: ink.d,
        fillRule: ink.evenodd ? 'evenodd' : 'nonzero',
      };
      continue;
    }
    // As the square cut: cut as nonzero (an even-odd shape rewound to paint the same), and a piece the cut leaves smaller than a stub goes.
    const rings = CLEAN.on ? asNonzero(raw, ink.evenodd) : raw;
    let loops = rings.flatMap((r) =>
      meets(bboxOf(r), rb) ? minusConvex(r, zone) : [r]
    );
    if (CLEAN.on) {
      const dropped: { size: number; at: Pt }[] = [];
      loops = dropSlivers(
        loops,
        [],
        rings,
        false,
        rb,
        2 * CLEAN.stub,
        dropped
      ).loops;
      report.clean.push(
        ...dropped.map((x) => ({ rule: 'fragment' as const, shape: key, ...x }))
      );
    }
    out[key] = {
      ...rest,
      d: loops.map((r) => ringD(r)).join(''),
      fill: 'currentColor',
      stroke: 'none',
      strokeDasharray: 'none',
      fillRule: CLEAN.on || !ink.evenodd ? 'nonzero' : 'evenodd',
    };
  }
  return { shapes: out, report };
}

/** Cut frames kept per icon (rest frames, and a spinner's: only its mark moves). */
const CUT_CACHE = 32;

/**
 * The status icon's geometry: the base at hover h (hand-fixed, if its
 * placement says), cut square round the zone, with the marks (each in its
 * tone, with `tone`). The base and the mark both hover; the cut is
 * recomputed from both whenever they move, and reused while only a mark
 * moves (a turning spinner, a rolling count at a held width) or at rest.
 */
export function statusGeo(
  base: BaseGeo,
  p: Placement,
  tone: boolean | Tone = false
): (f: StatusFrame, size?: number) => Shapes {
  const cache = new Map<string, Shapes>();
  return (f, size) => {
    const w = countWidthAt(f);
    const key = `${size}|${f.h}|${f.entering}|${f.ks}|${f.kr}|${f.as}|${f.km}|${f.ks === sIdx('count') || f.as === sIdx('count') ? w : ''}${f.mh ? `|${f.mh}` : ''}${f.tail && f.ta !== undefined ? `|t${f.tail.id}:${f.ta}` : ''}`;
    let cut = cache.get(key);
    if (!cut) {
      cut = cutFrame(base, p, f, size).cut;
      cache.set(key, cut);
      if (cache.size > CUT_CACHE) {
        cache.delete(cache.keys().next().value!);
      }
    }
    return { ...cut, ...markShapes(p, f, tone, size) };
  };
}

/**
 * Hand fixes: `shapes` with the ink of `keys` minus convex `regions` (as
 * filled paths). For a fix that takes a part away with the cut (an arrow's
 * arm the mark would leave a sliver of).
 */
/**
 * A straight wall's square end against a zone: walking from `from` (the end
 * it hangs on) to `to` (its free end), the first cross-section (`half`
 * either side of the axis) the zone reaches; everything from there to the
 * free end goes. So a wall that dips back into the zone past its first
 * contact (a shaft grazing a ring) still ends square, once. Returns the
 * band to cut, or null if the zone doesn't reach it.
 */
export function wallEnd(
  zone: Region,
  from: Pt,
  to: Pt,
  half: number
): Region | null {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const [ux, uy] = [(to[0] - from[0]) / L, (to[1] - from[1]) / L];
  const [nx, ny] = [-uy * half, ux * half];
  const meetsAt = (s: number) => {
    const c: Pt = [from[0] + ux * s, from[1] + uy * s];
    return meetsZone([c[0] + nx, c[1] + ny], [c[0] - nx, c[1] - ny], zone);
  };
  let s0 = -1;
  for (let s = 0; s <= L + 1e-9; s += 0.1) {
    if (meetsAt(s)) {
      s0 = s;
      break;
    }
  }
  if (s0 < 0) {
    return null;
  }
  let [lo, hi] = [Math.max(0, s0 - 0.1), s0];
  if (s0 > 0) {
    for (let j = 0; j < 16; j++) {
      const m = (lo + hi) / 2;
      if (meetsAt(m)) {
        hi = m;
      } else {
        lo = m;
      }
    }
  }
  const a: Pt = [from[0] + ux * lo, from[1] + uy * lo];
  const b: Pt = [to[0] + ux, to[1] + uy];
  const w = 1 + 0.05 / half; // just wider than the wall
  return [
    [a[0] + nx * w, a[1] + ny * w],
    [b[0] + nx * w, b[1] + ny * w],
    [b[0] - nx * w, b[1] - ny * w],
    [a[0] - nx * w, a[1] - ny * w],
  ];
}

export function cutAway(
  shapes: Shapes,
  keys: readonly string[],
  regions: readonly (Region | null)[]
): Shapes {
  const out = { ...shapes };
  for (const k of keys) {
    if (!out[k]) {
      continue;
    }
    const before = inkOf(out[k]);
    let cut = false;
    for (const r of regions) {
      if (r && r.length > 2) {
        out[k] = knockout({ [k]: out[k] }, r)[k];
        cut = true;
      }
    }
    if (!cut || typeof before === 'string') {
      continue;
    }
    // A piece the fix leaves too small to read (an arm's tip as the arrow draws back) goes, as the square cut's slivers do.
    const after = inkOf(out[k]);
    if (typeof after === 'string') {
      continue;
    }
    const had = new Set(
      before.rings.map((r) =>
        ringD(r.map(([x, y]) => [+fmt(x), +fmt(y)] as Pt))
      )
    );
    const keep = after.rings.filter(
      (r) =>
        had.has(ringD(r)) ||
        Math.abs(area(r)) >= SLIVER_AREA ||
        area(r) * Math.sign(area(after.rings[0] ?? r)) < 0
    );
    if (keep.length < after.rings.length) {
      out[k] = { ...out[k], d: keep.map((r) => ringD(r)).join('') };
    }
  }
  return out;
}

// ── Timing ───────────────────────────────────────────────────────────────────

// The loading family's clocks: a mark changes on the clock of the spinner and the text beside it, in on
// moderate-01 and out on fast-02, as the kit's spinner starts and stops.
const MS = {
  in: motionTokens.duration.moderate01,
  out: motionTokens.duration.fast02,
};
/** The status layer's two durations (ms): marks enter on moderate-01, leave (and cuts open and close) on fast-02. */
export const STATUS_MS = MS;
/** The house draw-in (CheckmarkOutlineToggle's DRAW_IN): much stronger than the entrance token. */
const STRONG_OUT = /* @__PURE__ */ cubicBezier(0.16, 1, 0.3, 1);
/** How far into the cut's opening the check starts drawing (the cut leads). */
export const CHECK_LEAD = 0.7;

const LINEAR_T = (t: number) => t;

type Channel = {
  key: keyof MarkFrame | 'h' | 'ks' | 'kr' | 'as' | 'km';
  from: number;
  to: number;
  at: number;
  ms: number;
  ease: (t: number) => number;
};

/**
 * The tweens for a change of mark, from the frame as it is now (so a change
 * mid-transition carries on from where it is). Exits first (one token
 * faster, on the exit ease); the cut moves; then the new mark enters.
 *
 *  - none → success: the cut opens (120ms, entrance), the check draws in
 *    from its short arm (160ms, the house draw-in) from 70% of the way.
 *    Exit: the check wipes away from the same end (120ms, exit), then the
 *    cut closes (120ms, exit) from halfway.
 *  - none → notification (or a count): the pip (the pill) grows from its
 *    centre and the cut opens with it (160ms, entrance). Exit: both shrink
 *    back (120ms, exit).
 *  - none → pending: the cut opens (120ms), the arc draws on as it turns
 *    (160ms, draw-in), its tail lengthening back from its head; it turns
 *    once per loading period (1000ms) and swings once per 2.5, both on the
 *    shared phase. Exit: its tail catches up with its head (120ms, exit),
 *    then the cut closes.
 *  - mark → mark: the outgoing mark leaves (120ms); from halfway, the
 *    zone morphs into the new one (120ms, its Minkowski blend, so walls run
 *    along themselves to their new square ends); the incoming mark enters
 *    (160ms). Warning and error leave and enter by match cut.
 * (In on moderate-01, out on fast-02, the loading family's clocks.)
 *
 * A count changing while it shows isn't a change of mark: its figures roll
 * (see the component).
 */
export function plan(
  p: Placement,
  f: StatusFrame,
  next: Mark
): { channels: Channel[]; total: number; done: Partial<StatusFrame> } {
  void p;
  const ch: Channel[] = [];
  const go = (
    key: Channel['key'],
    to: number,
    at: number,
    ms: number,
    ease: (t: number) => number
  ) => {
    if (Math.abs((f[key] as number) - to) > 1e-6) {
      ch.push({ key, from: f[key] as number, to, at, ms, ease });
    }
  };
  const done: Partial<StatusFrame> = {};
  // Exits.
  const leaving = {
    check: f.cp > 0 && next !== 'success',
    pip: f.pp > 0 && next !== 'notification',
    spin: f.sp > 0 && next !== 'pending',
    warn: f.wp > 0 && next !== 'warning',
    err: f.ep > 0 && next !== 'error',
    count: f.np > 0 && next !== 'count',
  };
  const anyLeaving = Object.values(leaving).some(Boolean);
  if (leaving.check) {
    go('ce', f.cp, 0, MS.out, EXIT);
    Object.assign(done, { cp: 0, ce: 0 });
  }
  if (leaving.pip) {
    go('pp', 0, 0, MS.out, EXIT);
  }
  if (leaving.spin) {
    go('se', f.sp, 0, MS.out, EXIT);
    Object.assign(done, { sp: 0, se: 0 });
  }
  if (leaving.warn) {
    go('wp', 0, 0, MS.out, EXIT);
  }
  if (leaving.err) {
    go('ep', 0, 0, MS.out, EXIT);
  }
  if (leaving.count) {
    go('np', 0, 0, MS.out, EXIT);
  }
  const exitMs = anyLeaving ? MS.out : 0;
  // The cut.
  const opened = f.kr > 1e-3;
  let moving = false;
  if (next !== 'none') {
    if (opened && Math.round(f.ks) !== sIdx(next)) {
      f.as = f.ks;
      f.km = 0;
      moving = true;
    } else if (!opened) {
      f.as = sIdx(next);
      f.km = 1;
    }
    f.ks = sIdx(next);
  }
  const pipLike = next === 'notification' || next === 'count';
  const pipOnly =
    pipLike ||
    (next === 'none' &&
      (leaving.pip || leaving.count) &&
      !leaving.check &&
      !leaving.spin &&
      !leaving.warn &&
      !leaving.err);
  const cutAt = next === 'none' ? (pipOnly ? 0 : exitMs / 2) : 0;
  const cutMs =
    next === 'none' ? MS.out : pipOnly && !anyLeaving ? MS.in : MS.out;
  // (Linear: the cut's own ease is its growth, cutFrame's growth(k), the same each way.)
  go('kr', next === 'none' ? 0 : 1, cutAt, cutMs, LINEAR_T);
  if (moving) {
    go('km', 1, exitMs / 2, MS.out, ENTRANCE);
  }
  // The entrance.
  let enterAt = exitMs;
  if (next === 'success') {
    if (f.ce > 0) {
      go('ce', 0, 0, MS.in, STRONG_OUT);
    } // mid-wipe: bring it back
    else {
      enterAt = Math.max(exitMs, cutAt + (opened ? 0 : CHECK_LEAD * cutMs));
      go('cp', 1, enterAt, MS.in, STRONG_OUT);
    }
  }
  if (next === 'notification') {
    go('pp', 1, exitMs, MS.in, ENTRANCE);
  }
  if (next === 'count') {
    go('np', 1, exitMs, MS.in, ENTRANCE);
  }
  if (next === 'pending') {
    if (f.se > 0) {
      go('se', 0, 0, MS.in, STRONG_OUT);
    } else {
      enterAt = Math.max(exitMs, cutAt + (opened ? 0 : CHECK_LEAD * cutMs));
      go('sp', 1, enterAt, MS.in, STRONG_OUT);
    }
  }
  if (next === 'warning') {
    go('wp', 1, exitMs, MS.in, ENTRANCE);
  }
  if (next === 'error') {
    go('ep', 1, exitMs, MS.in, ENTRANCE);
  }
  const total = ch.reduce((m, c) => Math.max(m, c.at + c.ms), 0);
  return { channels: ch, total, done };
}

/** Apply a plan's channels at time t (ms). */
export function applyPlan(
  f: StatusFrame,
  channels: readonly Channel[],
  t: number
) {
  for (const c of channels) {
    const u = Math.min(1, Math.max(0, (t - c.at) / c.ms));
    (f[c.key] as number) = c.from + (c.to - c.from) * c.ease(u);
  }
}

/** A count's roll: its figures change from `nTo` (where any roll in flight was going) to `text`, 120ms on the entrance ease. */
export const ROLL_MS = MS.in;

// ── StatusPip: a count in a pill ─────────────────────────────────────────────

/**
 * Carbon's small numerals (number--small--0 … 9: 6 × 10 at x 13–19, y
 * 11–21, 2px walls, 2px outer radii) and a small plus, as the pip's glyphs:
 * the set's own geometric figures, knocked out of the pill (even-odd).
 */
export const NUMERALS: Record<string, string> = {
  0: 'M17,21H15a2,2,0,0,1-2-2V13a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2v6A2,2,0,0,1,17,21Zm-2-8v6h2V13Z',
  1: 'M17 19 17 11 15 11 15 12 13 12 13 14 15 14 15 19 13 19 13 21 19 21 19 19 17 19z',
  2: 'M19,21H13V17a2,2,0,0,1,2-2h2V13H13V11h4a2,2,0,0,1,2,2v2a2,2,0,0,1-2,2H15v2h4Z',
  3: 'M17,11H13v2h4v2H14v2h3v2H13v2h4a2,2,0,0,0,2-2V13A2,2,0,0,0,17,11Z',
  4: 'M17 11 17 15 15 15 15 11 13 11 13 17 17 17 17 21 19 21 19 11 17 11z',
  5: 'M17,21H13V19h4V17H13V11h6v2H15v2h2a2,2,0,0,1,2,2v2A2,2,0,0,1,17,21Z',
  6: 'M17,21H15a2,2,0,0,1-2-2V13a2,2,0,0,1,2-2h3v2H15v2h2a2,2,0,0,1,2,2v2A2,2,0,0,1,17,21Zm-2-4v2h2V17Z',
  7: 'M16.44 21 14.44 21 17 13 15 13 15 14 13 14 13 11 19 11 19 13 16.44 21z',
  8: 'M17,11H15a2,2,0,0,0-2,2v6a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V13A2,2,0,0,0,17,11Zm0,2v2H15V13Zm-2,6V17h2v2Z',
  9: 'M17,21H14V19h3V17H15a2,2,0,0,1-2-2V13a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2v6A2,2,0,0,1,17,21Zm-2-8v2h2V13Z',
  '+': 'M17 13 15 13 15 15 13 15 13 17 15 17 15 19 17 19 17 17 19 17 19 15 17 15z',
};
const NUM_RINGS: Record<string, Pt[][]> = Object.fromEntries(
  Object.entries(NUMERALS).map(([k, d]) => [
    k,
    flattenPath(d).map((s) => s.pts),
  ])
);

/** The pill: 20 tall (y 6–26), caps r 10; one figure is a disc. Figures sit 2px apart with 5px each side. */
export const PILL = { y0: 6, y1: 26, pad: 5, gap: 2, fig: 6 };
/**
 * The count as the pip shows it. "9+" means nine or more, so the cap is its
 * own resting state: at `max` or above it shows "max+" (9+ or 99+), below it
 * the digits.
 */
export const pillText = (n: number, max: 9 | 99 = 99) =>
  n >= max ? `${max}+` : String(Math.max(0, Math.floor(n)));
/** The default cap by size: two figures and a plus are too small to read at 16 and 20px, so those cap at 9+. */
export const defaultMax = (size: number): 9 | 99 => (size <= 20 ? 9 : 99);
export const pillWidth = (text: string) =>
  Math.max(
    PILL.y1 - PILL.y0,
    text.length * PILL.fig + (text.length - 1) * PILL.gap + 2 * PILL.pad
  );
/** Each figure's left edge, right to left (units first), for a text centred at 16. */
const placeXs = (text: string) => {
  const w = text.length * PILL.fig + (text.length - 1) * PILL.gap;
  return [...text]
    .map((_, i) => 16 - w / 2 + i * (PILL.fig + PILL.gap))
    .reverse();
};

/** The pill as a convex polygon: w wide, its caps' radius r about the centre line, grown by `g` (negative: inset). */
function pillPoly(w: number, s: number, g = 0): Pt[] {
  const r = ((PILL.y1 - PILL.y0) / 2) * s + g;
  const half = (w / 2) * s;
  const [x0, x1] = [
    16 - half + ((PILL.y1 - PILL.y0) / 2) * s,
    16 + half - ((PILL.y1 - PILL.y0) / 2) * s,
  ];
  if (r <= 0) {
    return [];
  }
  const cap = (cx: number, from: number) =>
    Array.from({ length: 25 }, (_, i) => {
      const a = from + (Math.PI * i) / 24;
      return [cx + r * Math.cos(a), 16 + r * Math.sin(a)] as Pt;
    });
  return [...cap(x1, -Math.PI / 2), ...cap(x0, Math.PI / 2)];
}

function pillPath(w: number, s: number): string {
  // A stadium w wide, scaled by s about (16, 16) (the pip grows in from its centre).
  if (s <= 1e-3) {
    return '';
  }
  const r = ((PILL.y1 - PILL.y0) / 2) * s;
  const half = (w / 2) * s;
  const [x0, x1, y0, y1] = [16 - half + r, 16 + half - r, 16 - r, 16 + r];
  return `M${fmt(x0)} ${fmt(y0)}H${fmt(x1)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x1)} ${fmt(y1)}H${fmt(x0)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x0)} ${fmt(y0)}Z`;
}

/** The roll's travel: far enough that a figure leaves the pill's inside (2px in from its edge) completely. */
export const ROLL = 13;

/**
 * The pip at a frame: `from` → `to` texts, `t` the roll (0–1, eased), `dir`
 * +1 counting up (figures roll up) or −1 down, `s` the pill's presence.
 * Changed figures roll; unchanged ones slide to their new places; the pill
 * stretches between widths at constant height. Figures never scale: a
 * rolling figure is cut 2px inside the pill's edge (so the cut lands on a
 * solid rim), and as the pill grows in from its centre (the house fill)
 * the figures, at full size, are cut to it, so they knock out of the fill
 * only where it has reached. All as geometry, no mask.
 */
export function pipShapes(
  from: string,
  to: string,
  t: number,
  dir: 1 | -1,
  s: number,
  colour = 'currentColor'
): Shapes {
  const w = pillWidth(from) + (pillWidth(to) - pillWidth(from)) * t;
  const [xa, xb] = [placeXs(from), placeXs(to)];
  const inside = pillPoly(w, 1, -2);
  const fill = s < 1 ? pillPoly(w, s) : null;
  let figs = '';
  const n = Math.max(from.length, to.length);
  const glyph = (ch: string, x: number, y: number) => {
    for (const ring of NUM_RINGS[ch] ?? []) {
      let moved = ring.map(([px, py]) => [px - 13 + x, py + y] as Pt);
      if (Math.abs(y) > 1e-6) {
        moved = clipConvex(moved, inside);
      }
      if (fill) {
        moved = fill.length > 2 ? clipConvex(moved, fill) : [];
      }
      figs += ringD(moved);
    }
  };
  for (let i = 0; i < n; i++) {
    const [a, b] = [from[from.length - 1 - i], to[to.length - 1 - i]];
    const [x0, x1] = [xa[i] ?? xb[i], xb[i] ?? xa[i]];
    const x = x0 + (x1 - x0) * t;
    if (a === b) {
      glyph(a, x, 0);
    } else {
      if (a !== undefined && t < 1) {
        glyph(a, x, -dir * ROLL * t);
      }
      if (b !== undefined && t > 0) {
        glyph(b, x, dir * ROLL * (1 - t));
      }
    }
  }
  return {
    pip: { d: pillPath(w, s) + figs, fillRule: 'evenodd', fill: colour },
  };
}
