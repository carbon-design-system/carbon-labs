/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Path builders for stroke-rebuilt icons.
 *
 * Carbon draws its icons as filled outlines. To scale a shape without its
 * line thickening, we redraw it as a 2px stroke along its centreline and
 * animate the geometry (the `d` string), never a CSS `scale()`: a scaled
 * group scales its stroke width with it.
 *
 * Every builder emits the same command template for any input, so two
 * states of one shape interpolate number-for-number under motion's `attrD`.
 */

export type Pt = readonly [number, number];

const fmt = (n: number): string => String(Math.round(n * 1e4) / 1e4);
const pt = ([x, y]: Pt): string => `${fmt(x)} ${fmt(y)}`;

/** Straight-segment path through `pts`; `close` adds a Z. */
/* @__NO_SIDE_EFFECTS__ */
export function polyPath(pts: readonly Pt[], close = false): string {
  return `M${pts.map(pt).join('L')}${close ? 'Z' : ''}`;
}

/** `pts` scaled by `s` about `c`. */
/* @__NO_SIDE_EFFECTS__ */
export function scalePts(pts: readonly Pt[], c: Pt, s: number): Pt[] {
  return pts.map(
    ([x, y]) => [c[0] + (x - c[0]) * s, c[1] + (y - c[1]) * s] as const
  );
}

/** Centroid of a polygon's vertices (the visual centre of a triangle). */
/* @__NO_SIDE_EFFECTS__ */
export function centroid(pts: readonly Pt[]): Pt {
  const n = pts.length;
  return [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n,
  ];
}

/**
 * Open polyline with every interior corner rounded to radius `r` on the
 * centreline. With a stroke width of 2r this reproduces Carbon's bent lines,
 * whose outer edge is an arc of radius 2r around a sharp inner corner.
 *
 * The turn direction of each corner (the arc's sweep flag) must stay the
 * same between states that morph into each other.
 */
/* @__NO_SIDE_EFFECTS__ */
export function filletPath(pts: readonly Pt[], r: number): string {
  let d = `M${pt(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[i + 1]];
    const u = unit(p1, p0);
    const v = unit(p1, p2);
    const half =
      Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / 2;
    const t = r / Math.tan(half);
    const a: Pt = [p1[0] + u[0] * t, p1[1] + u[1] * t];
    const b: Pt = [p1[0] + v[0] * t, p1[1] + v[1] * t];
    // Cross product of incoming and outgoing directions gives the turn.
    const sweep =
      (p1[0] - p0[0]) * (p2[1] - p1[1]) - (p1[1] - p0[1]) * (p2[0] - p1[0]) > 0
        ? 1
        : 0;
    d += `L${pt(a)}A${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${pt(b)}`;
  }
  return `${d}L${pt(pts[pts.length - 1])}`;
}

/**
 * A ring of line weight `w` centred on radius `r`, as a filled annulus in
 * the same form Carbon draws it. Rasterises identically to Carbon's ring
 * (a stroked `<circle>` anti-aliases slightly differently), and growing `r`
 * keeps `w` fixed.
 */
/* @__NO_SIDE_EFFECTS__ */
export function ringPath([cx, cy]: Pt, r: number, w: number): string {
  const o = fmt(r + w / 2);
  const i = fmt(r - w / 2);
  const [x, y] = [fmt(cx), fmt(cy)];
  const ox = fmt(cx + r + w / 2),
    oy = fmt(cy - r - w / 2);
  const ix = fmt(cx + r - w / 2),
    iy = fmt(cy + r - w / 2);
  return (
    `M${x} ${oy}A${o} ${o} 0 1 0 ${ox} ${y}A${o} ${o} 0 0 0 ${x} ${oy}Z` +
    `M${x} ${iy}A${i} ${i} 0 1 1 ${ix} ${y}A${i} ${i} 0 0 1 ${x} ${iy}Z`
  );
}

/**
 * Carbon's frame: a rounded rect (outer corners r=2) with a square-cornered
 * inside, 2px wall. Used by panels, windows and fit-to icons.
 */
/* @__NO_SIDE_EFFECTS__ */
export function framePath(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): string {
  return `${roundedRectPath(x0, y0, x1, y1)}M${fmt(x0 + 2)} ${fmt(y0 + 2)}V${fmt(y1 - 2)}H${fmt(x1 - 2)}V${fmt(y0 + 2)}Z`;
}

/**
 * A rounded rect (corner radius `r`, clamped to fit), drawn clockwise.
 * Filled, it's a solid rounded rect; stroked 2px with r=1 on the
 * centreline, it's Carbon's bar outline (outer corners r=2, inner square).
 * A square with r = half its side is a circle, so r morphs one into the other.
 */
/* @__NO_SIDE_EFFECTS__ */
export function roundedRectPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r = 2
): string {
  r = Math.max(0, Math.min(r, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2));
  const [a, b, c, d] = [fmt(x0), fmt(y0), fmt(x1), fmt(y1)];
  const R = fmt(r);
  return (
    `M${fmt(x0 + r)} ${b}H${fmt(x1 - r)}A${R} ${R} 0 0 1 ${c} ${fmt(y0 + r)}V${fmt(y1 - r)}A${R} ${R} 0 0 1 ${fmt(x1 - r)} ${d}` +
    `H${fmt(x0 + r)}A${R} ${R} 0 0 1 ${a} ${fmt(y1 - r)}V${fmt(y0 + r)}A${R} ${R} 0 0 1 ${fmt(x0 + r)} ${b}Z`
  );
}

/** An axis-aligned rect, drawn clockwise; zero-size rects draw nothing. */
/* @__NO_SIDE_EFFECTS__ */
export function rectPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): string {
  const [l, r] = [Math.min(x0, x1), Math.max(x0, x1)];
  const [t, b] = [Math.min(y0, y1), Math.max(y0, y1)];
  return `M${fmt(l)} ${fmt(t)}H${fmt(r)}V${fmt(b)}H${fmt(l)}Z`;
}

/** A circle as an n-gon (for clipping; 64 sides is within 0.02px at r=12). */
/* @__NO_SIDE_EFFECTS__ */
export function circlePts([cx, cy]: Pt, r: number, n = 64): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

/**
 * `subject` clipped to the convex polygon `clip` (Sutherland–Hodgman).
 * Used to draw "a disc, but only inside this shape" without a mask.
 */
/* @__NO_SIDE_EFFECTS__ */
export function clipConvex(subject: readonly Pt[], clip: readonly Pt[]): Pt[] {
  // Orient the clip edges so "inside" is consistently to the left.
  const area = clip.reduce(
    (s, p, i) =>
      s +
      p[0] * clip[(i + 1) % clip.length][1] -
      clip[(i + 1) % clip.length][0] * p[1],
    0
  );
  const c = area < 0 ? [...clip].reverse() : clip;
  let out: Pt[] = [...subject];
  for (let i = 0; i < c.length && out.length; i++) {
    const [a, b] = [c[i], c[(i + 1) % c.length]];
    const inside = (p: Pt) =>
      (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0;
    const cross = (p: Pt, q: Pt): Pt => {
      const [x1, y1, x2, y2, x3, y3, x4, y4] = [
        p[0],
        p[1],
        q[0],
        q[1],
        a[0],
        a[1],
        b[0],
        b[1],
      ];
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (den === 0) {
        return [x1, y1];
      } // parallel (only on a degenerate clip edge): no crossing to find
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    };
    const input = out;
    out = [];
    input.forEach((p, j) => {
      const prev = input[(j + input.length - 1) % input.length];
      if (inside(p)) {
        if (!inside(prev)) {
          out.push(cross(prev, p));
        }
        out.push(p);
      } else if (inside(prev)) {
        out.push(cross(prev, p));
      }
    });
  }
  return out;
}

/**
 * The house fill toggle (§7.7) inside any convex `shape`, as one even-odd
 * path: a disc from `centre` grows to fill the shape (`fill` 0→1), then a
 * hole grows from the same centre to empty it (`hole` 0→1). No masks.
 */
/* @__NO_SIDE_EFFECTS__ */
export function discFillPath(
  shape: readonly Pt[],
  centre: Pt,
  fill: number,
  hole: number
): string {
  const reach =
    Math.max(
      ...shape.map(([x, y]) => Math.hypot(x - centre[0], y - centre[1]))
    ) + 0.5;
  const disc = (k: number) =>
    k > 0 ? clipConvex(circlePts(centre, reach * k), shape) : [];
  const [a, b] = [disc(fill), disc(hole)];
  return (
    (a.length > 2 ? polyPath(a, true) : '') +
    (b.length > 2 ? polyPath(b, true) : '')
  );
}

/**
 * The outer boundary of a convex polygon stroked `r` wide on each side with
 * round joins (its Minkowski sum with a disc): offset edges joined by arcs
 * of radius `r` around each vertex. Drawn clockwise on screen.
 */
/* @__NO_SIDE_EFFECTS__ */
export function roundedOutlinePath(pts: readonly Pt[], r: number): string {
  const n = pts.length;
  const area = pts.reduce(
    (s, p, i) => s + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1],
    0
  );
  const P = area < 0 ? [...pts].reverse() : [...pts]; // clockwise on screen (y down)
  const normal = (a: Pt, b: Pt): Pt => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy);
    return [dy / l, -dx / l]; // outward for clockwise-on-screen order
  };
  let d = '';
  for (let i = 0; i < n; i++) {
    const [a, b] = [P[i], P[(i + 1) % n]];
    const nn = normal(a, b);
    const start: Pt = [a[0] + nn[0] * r, a[1] + nn[1] * r];
    const end: Pt = [b[0] + nn[0] * r, b[1] + nn[1] * r];
    d += i === 0 ? `M${pt(start)}` : `A${fmt(r)} ${fmt(r)} 0 0 1 ${pt(start)}`;
    d += `L${pt(end)}`;
  }
  const n0 = normal(P[0], P[1]);
  return `${d}A${fmt(r)} ${fmt(r)} 0 0 1 ${pt([P[0][0] + n0[0] * r, P[0][1] + n0[1] * r])}Z`;
}

/** A convex polygon moved inward by `d` along each edge (sharp corners). */
/* @__NO_SIDE_EFFECTS__ */
export function insetPoly(pts: readonly Pt[], d: number): Pt[] {
  const n = pts.length;
  const c = centroid(pts);
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy);
    let [nx, ny] = [-dy / l, dx / l];
    if ((c[0] - a[0]) * nx + (c[1] - a[1]) * ny < 0) {
      [nx, ny] = [-nx, -ny];
    }
    return [
      [a[0] + nx * d, a[1] + ny * d],
      [b[0] + nx * d, b[1] + ny * d],
    ] as const;
  });
  return pts.map((_, i) => {
    const [[x1, y1], [x2, y2]] = lines[(i + n - 1) % n];
    const [[x3, y3], [x4, y4]] = lines[i];
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)] as const;
  });
}

function unit(from: Pt, to: Pt): Pt {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
}

/**
 * An absolute path (M L H V C S Q T A Z) with every point mapped through
 * `fn` and arc radii multiplied by `k`. H and V come out as L, so every
 * state of one path keeps the same command template. For moving and scaling
 * a centreline at constant line weight: the points move, the stroke doesn't.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapPath(d: string, fn: (p: Pt) => Pt, k = 1): string {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  let out = '';
  let cmd = '';
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let i = 0;
  const num = () => Number(tokens[i++]);
  const P = (p: Pt) => pt(fn(p));
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    if (cmd !== cmd.toUpperCase() && cmd !== 'z') {
      throw new Error(`mapPath: relative command "${cmd}"`);
    }
    switch (cmd) {
      case 'M':
      case 'L':
      case 'T':
        cur = [num(), num()];
        if (cmd === 'M') {
          start = cur;
        }
        out += `${cmd}${P(cur)}`;
        if (cmd === 'M') {
          cmd = 'L';
        } // implicit lineto after a moveto
        break;
      case 'H':
        cur = [num(), cur[1]];
        out += `L${P(cur)}`;
        break;
      case 'V':
        cur = [cur[0], num()];
        out += `L${P(cur)}`;
        break;
      case 'C': {
        const a: Pt = [num(), num()],
          b: Pt = [num(), num()];
        cur = [num(), num()];
        out += `C${P(a)} ${P(b)} ${P(cur)}`;
        break;
      }
      case 'S':
      case 'Q': {
        const a: Pt = [num(), num()];
        cur = [num(), num()];
        out += `${cmd}${P(a)} ${P(cur)}`;
        break;
      }
      case 'A': {
        const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
        cur = [num(), num()];
        out += `A${fmt(rx * k)} ${fmt(ry * k)} ${rot} ${large} ${sweep} ${P(cur)}`;
        break;
      }
      case 'Z':
      case 'z':
        out += 'Z';
        cur = start;
        break;
      default:
        throw new Error(`mapPath: unsupported command "${cmd}"`);
    }
  }
  return out;
}

/** `d` scaled by `s` about `c`, then moved by (dx, dy); the stroke is untouched. */
/* @__NO_SIDE_EFFECTS__ */
export function scalePath(
  d: string,
  [cx, cy]: Pt,
  s: number,
  dx = 0,
  dy = 0
): string {
  return mapPath(
    d,
    ([x, y]) => [cx + (x - cx) * s + dx, cy + (y - cy) * s + dy],
    s
  );
}

/** `d` moved by (dx, dy). */
/* @__NO_SIDE_EFFECTS__ */
export const movePath = (d: string, dx: number, dy: number): string =>
  mapPath(d, ([x, y]) => [x + dx, y + dy]);

/**
 * Points along an absolute path's first closed outline (M L H V C A Z),
 * curves sampled every ~`step` units. For shapes a fill is clipped to.
 */
/* @__NO_SIDE_EFFECTS__ */
export function pathPoints(d: string, step = 0.5): Pt[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const out: Pt[] = [];
  let i = 0;
  let cmd = '';
  let cur: Pt = [0, 0];
  const num = () => Number(tokens[i++]);
  const push = (p: Pt) => out.push(p);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    if (cmd === 'Z' || cmd === 'z') {
      break;
    }
    if (cmd !== cmd.toUpperCase()) {
      throw new Error(`pathPoints: relative command "${cmd}"`);
    }
    if (cmd === 'M' || cmd === 'L') {
      cur = [num(), num()];
      push(cur);
      if (cmd === 'M') {
        cmd = 'L';
      }
    } else if (cmd === 'H') {
      cur = [num(), cur[1]];
      push(cur);
    } else if (cmd === 'V') {
      cur = [cur[0], num()];
      push(cur);
    } else if (cmd === 'C') {
      const [a, b, e]: Pt[] = [
        [num(), num()],
        [num(), num()],
        [num(), num()],
      ];
      const n = Math.max(
        2,
        Math.ceil(
          (Math.hypot(a[0] - cur[0], a[1] - cur[1]) +
            Math.hypot(b[0] - a[0], b[1] - a[1]) +
            Math.hypot(e[0] - b[0], e[1] - b[1])) /
            step
        )
      );
      for (let k = 1; k <= n; k++) {
        const t = k / n,
          u = 1 - t;
        push([
          u * u * u * cur[0] +
            3 * u * u * t * a[0] +
            3 * u * t * t * b[0] +
            t * t * t * e[0],
          u * u * u * cur[1] +
            3 * u * u * t * a[1] +
            3 * u * t * t * b[1] +
            t * t * t * e[1],
        ]);
      }
      cur = e;
    } else if (cmd === 'A') {
      const [r, , , large, sweep] = [num(), num(), num(), num(), num()];
      const e: Pt = [num(), num()];
      // Circular arcs only (rx = ry): find the centre, then sample.
      const [mx, my] = [(cur[0] + e[0]) / 2, (cur[1] + e[1]) / 2];
      const [dx, dy] = [e[0] - cur[0], e[1] - cur[1]];
      const half = Math.hypot(dx, dy) / 2;
      const h =
        Math.sqrt(Math.max(0, r * r - half * half)) *
        (large === sweep ? -1 : 1);
      const c: Pt = [mx - (dy / (2 * half)) * h, my + (dx / (2 * half)) * h];
      let a0 = Math.atan2(cur[1] - c[1], cur[0] - c[0]);
      let a1 = Math.atan2(e[1] - c[1], e[0] - c[0]);
      if (sweep && a1 < a0) {
        a1 += 2 * Math.PI;
      }
      if (!sweep && a1 > a0) {
        a1 -= 2 * Math.PI;
      }
      const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / step));
      for (let k = 1; k <= n; k++) {
        push([
          c[0] + r * Math.cos(a0 + ((a1 - a0) * k) / n),
          c[1] + r * Math.sin(a0 + ((a1 - a0) * k) / n),
        ]);
      }
      a0 = a1;
      cur = e;
    } else {
      throw new Error(`pathPoints: unsupported command "${cmd}"`);
    }
  }
  return out;
}

/**
 * The house fill (§7.7) inside any shape, convex or not, as one even-odd
 * path: the shape clipped to a disc of radius `fill` about `centre`, minus
 * the shape clipped to a hole of radius `hole`. (discFillPath clips the disc
 * to the shape, which needs a convex shape; here the disc is the convex
 * clip.) No masks or clip paths.
 */
/* @__NO_SIDE_EFFECTS__ */
export function shapeFillPath(
  shape: readonly Pt[],
  centre: Pt,
  fill: number,
  hole: number
): string {
  const part = (r: number) =>
    r > 0 ? clipConvex(shape, circlePts(centre, r)) : [];
  const [a, b] = [part(fill), part(hole)];
  return (
    (a.length > 2 ? polyPath(a, true) : '') +
    (b.length > 2 ? polyPath(b, true) : '')
  );
}
