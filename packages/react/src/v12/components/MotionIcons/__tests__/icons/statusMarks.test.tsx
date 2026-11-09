/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as CI from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, Shapes } from '../../utils/frameIcon';
import { mapPath, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  gapBetween,
  makeStatusMarkIcon as statusMarkSpec,
  PLUS,
  PLUS_ALT,
  plusCentre,
  plusReach,
  statusMarkParts,
  type OpenEnd,
  type PlusAltPlace,
  type PlusPlace,
  type StatusMarkIcon as StatusMarkIconSpec,
  type StatusMarkSpec,
} from '@carbon-labs/motion-icons-core/utils/statusMark';
import { toReact, type ReactIcon } from '../../runtime';
import * as ADD from '../../icons/marks/add';

type StatusMarkIcon = ReactIcon<StatusMarkIconSpec>;
/** A status-mark icon from its spec, as a React component. */
const makeStatusMarkIcon = (...args: Parameters<typeof statusMarkSpec>) =>
  toReact(statusMarkSpec(...args));

/**
 * The status-mark system (utils/statusMark.ts) and the add family
 * (icons/marks/add.ts): keys and NaNs across the hover at every size; rest
 * parity with Carbon at 16 / 20 / 24 / 32 by coverage (the sampler of
 * files.test.tsx, which mirrors the browser Parity story: Δ is the share of
 * ink pixels whose coverage differs by more than a quarter, gated at 0.5%);
 * constant line weight (the base's points move only along their open end's
 * wall, or round its ring, the plus's arms keep 2px, a mark's ring keeps
 * 2px); the space between the mark and the base held through the hover
 * (each open end at its resting width, and the mark never within 2px of
 * the base); everything inside the 36×36 hover box; two-tone and calm.
 */

// ── A small rasteriser (as objectsB.test.tsx) ────────────────────────────────

type Poly = { pts: Pt[]; closed: boolean };

function arcPts(
  p0: Pt,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  large: number,
  sweep: number,
  p1: Pt
): Pt[] {
  let [rx, ry] = [Math.abs(rxIn), Math.abs(ryIn)];
  if (!rx || !ry) return [p1];
  const phi = (phiDeg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const [dx, dy] = [(p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2];
  const [x1, y1] = [cos * dx + sin * dy, -sin * dx + cos * dy];
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) [rx, ry] = [rx * Math.sqrt(lambda), ry * Math.sqrt(lambda)];
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
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 120)));
  return Array.from({ length: n }, (_, k) => {
    const t = t1 + (dt * (k + 1)) / n;
    return [
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ] as Pt;
  });
}

/** Any SVG path (absolute or relative M L H V C S Q T A Z) as polylines. */
function flatten(d: string): Poly[] {
  const tok =
    d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Poly[] = [];
  let [i, cmd, prev] = [0, '', ''];
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let ctrl: Pt = [0, 0];
  let poly: Pt[] = [];
  const num = () => Number(tok[i++]);
  const flush = (closed: boolean) => {
    if (poly.length > 1) out.push({ pts: poly, closed });
    poly = [];
  };
  const bez = (pts: Pt[]) => {
    for (let k = 1; k <= 24; k++) {
      const t = k / 24;
      let q = pts;
      while (q.length > 1)
        q = q
          .slice(1)
          .map(
            (b, j) =>
              [
                q[j][0] + (b[0] - q[j][0]) * t,
                q[j][1] + (b[1] - q[j][1]) * t,
              ] as Pt
          );
      poly.push(q[0]);
    }
  };
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
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
      bez([cur, c1, c2, e]);
      [ctrl, cur] = [c2, e];
    } else if (C === 'Q' || C === 'T') {
      const c1: Pt =
        C === 'Q'
          ? P()
          : /[QT]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const e = P();
      bez([cur, c1, e]);
      [ctrl, cur] = [c1, e];
    } else if (C === 'A') {
      const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
      const e = P();
      poly.push(...arcPts(cur, rx, ry, rot, large, sweep, e));
      cur = e;
    } else if (C === 'Z') {
      flush(true);
      cur = start;
      poly = [start];
    } else throw new Error(`flatten: "${cmd}"`);
    prev = C;
  }
  flush(false);
  return out;
}

const [LO, SUB] = [-2, 8];
let [STEP, N] = [1 / 32, 1152];
const grid = (size: number) => {
  [STEP, N] = [8 / size / SUB, (36 * size * SUB) / 8];
};
const at = (k: number) => LO + (k + 0.5) * STEP;

function fillInto(ink: Uint8Array, polys: Poly[], evenodd: boolean) {
  for (let j = 0; j < N; j++) {
    const y = at(j);
    const xs: [number, number][] = [];
    for (const { pts } of polys) {
      pts.forEach((a, k) => {
        const b = pts[(k + 1) % pts.length];
        if (a[1] <= y !== b[1] <= y)
          xs.push([
            a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
            b[1] > a[1] ? 1 : -1,
          ]);
      });
    }
    if (!xs.length) continue;
    xs.sort((p, q) => p[0] - q[0]);
    let [w, c, m] = [0, 0, 0];
    for (let k = 0; k < N; k++) {
      const x = at(k);
      while (m < xs.length && xs[m][0] < x)
        [w, c, m] = [w + xs[m][1], c + 1, m + 1];
      if (evenodd ? c % 2 : w) ink[j * N + k] = 1;
    }
  }
}

/** Frame-engine shapes (all filled outlines here), sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes))
    fillInto(ink, flatten(String(a.d ?? '')), a.fillRule === 'evenodd');
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid (paths and circles; fill="none" paths are skipped, as the browser does). */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path, circle').forEach((el) => {
    if (el.getAttribute('fill') === 'none') return;
    let d = el.getAttribute('d');
    if (el.tagName.toLowerCase() === 'circle') {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) =>
        Number(el.getAttribute(a))
      );
      d = `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    // Some Carbon paths carry a rotate (alarm's bells).
    const rot = /rotate\(\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*\)/.exec(
      el.getAttribute('transform') ?? ''
    );
    const turn = ([x, y]: Pt): Pt => {
      if (!rot) return [x, y];
      const [a, cx, cy] = [
        (Number(rot[1]) * Math.PI) / 180,
        Number(rot[2]),
        Number(rot[3]),
      ];
      return [
        cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
        cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a),
      ];
    };
    const polys = flatten(d!).map(({ pts, closed }) => ({
      pts: pts.map(turn).map(([x, y]) => [(x * 32) / vb, (y * 32) / vb] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return ink;
}

/** The parity story's Δ, inside the 32-unit box. */
function delta(a: Uint8Array, b: Uint8Array): number {
  const [S, P] = [SUB, N / SUB];
  const inBox = (q: number) => at(q * S) >= 0 && at(q * S + S - 1) <= 32;
  let [diff, ink] = [0, 0];
  for (let pj = 0; pj < P; pj++) {
    for (let pk = 0; pk < P; pk++) {
      if (!inBox(pj) || !inBox(pk)) continue;
      let [ca, cb] = [0, 0];
      for (let j = pj * S; j < pj * S + S; j++) {
        for (let k = pk * S; k < pk * S + S; k++)
          [ca, cb] = [ca + a[j * N + k], cb + b[j * N + k]];
      }
      if (ca || cb) ink++;
      if (Math.abs(ca - cb) > (S * S) / 4) diff++;
    }
  }
  return ink ? diff / ink : 0;
}

/** Is p inside the outline (nonzero, or even-odd)? */
const inside = (polys: Poly[], [x, y]: Pt, evenodd = false) => {
  let [w, c] = [0, 0];
  for (const { pts } of polys) {
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      if (a[1] <= y !== b[1] <= y) {
        const xi = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
        if (xi > x) [w, c] = [w + (b[1] > a[1] ? 1 : -1), c + 1];
      }
    });
  }
  return evenodd ? c % 2 === 1 : w !== 0;
};
/** Ink runs (their lengths) along the segment from a to b, in one shape. */
function runs(attrs: Shapes[string], a: Pt, b: Pt): number[] {
  const polys = flatten(String(attrs.d));
  const evenodd = attrs.fillRule === 'evenodd';
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(len / 0.005);
  const out: number[] = [];
  let run = 0;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    if (
      k < n &&
      inside(
        polys,
        [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
        evenodd
      )
    )
      run++;
    else if (run) {
      out.push((run * len) / n);
      run = 0;
    }
  }
  return out;
}

// ── The icons ────────────────────────────────────────────────────────────────

type AnySpec = StatusMarkSpec<PlusPlace> | StatusMarkSpec<PlusAltPlace>;
interface Case {
  name: string;
  icon: StatusMarkIcon;
  spec: AnySpec;
  carbon: CarbonIcon;
}
const SPECS: Record<string, AnySpec> = {
  DocumentAdd: ADD.DOCUMENT_ADD,
  FolderAdd: ADD.FOLDER_ADD,
  TaskAdd: ADD.TASK_ADD,
  MobileAdd: ADD.MOBILE_ADD,
  CalendarAdd: ADD.CALENDAR_ADD,
  DataAdd: ADD.DATA_ADD,
  FaceAdd: ADD.FACE_ADD,
  FaceActivatedAdd: ADD.FACE_ACTIVATED_ADD,
  MusicAdd: ADD.MUSIC_ADD,
  DeliveryAdd: ADD.DELIVERY_ADD,
  TableAdd: ADD.TABLE_ADD,
  VideoAdd: ADD.VIDEO_ADD,
  AlarmAdd: ADD.ALARM_ADD,
  ShoppingCartPlus: ADD.SHOPPING_CART_PLUS,
  PillsAdd: ADD.PILLS_ADD,
  DataEnrichmentAdd: ADD.DATA_ENRICHMENT_ADD,
  CalendarAddAlt: ADD.CALENDAR_ADD_ALT,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any = (x: unknown) => x as any;
const CASES: Case[] = Object.entries(SPECS).map(([name, spec]) => ({
  name,
  spec,
  icon: any(ADD)[name],
  carbon: any(CI)[name],
}));

const SIZES = [16, 20, 24, 32];
/**
 * Rest drawings that depart from Carbon on review, as Carbon's path edited:
 * Folder add's walls stop at x 16 / y 16 (Carbon: 18), 4px from the plus.
 */
const DEPARTURES: Record<string, string> = {
  FolderAdd:
    'M28 8H16L12.6 4.6C12.2 4.2 11.7 4 11.2 4H4C2.9 4 2 4.9 2 6V26C2 27.1 2.9 28 4 28H16V26H4V6H11.2L14.6 9.4L15.2 10H28V16H30V10C30 8.9 29.1 8 28 8Z' +
    'M26 20L24 20L24 24L20 24L20 26L24 26L24 30L26 30L26 26L30 26L30 24L26 24Z',
};
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];
const GATE = 0.005;

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

const noBad = (shapes: Shapes, where: string) => {
  for (const [k, attrs] of Object.entries(shapes)) {
    for (const [a, v] of Object.entries(attrs))
      expect(
        /NaN|Infinity|undefined/.test(String(v)),
        `${k}.${a} ${where}`
      ).toBe(false);
  }
};
/** Every point mapPath sees in a path (end points and control points), in order. */
const pointsOf = (d: string): Pt[] => {
  const out: Pt[] = [];
  mapPath(d, (p) => (out.push(p), p));
  return out;
};
/** A path's outline as polygons (for gaps). */
const polysOf = (d: string): Pt[][] => flatten(d).map(({ pts }) => pts);
const isTranslate = (b: OpenEnd['back']): b is Pt => Array.isArray(b);
/** The mark's arms (or ring) as the probes that cross them: [from, to] across each arm near its end and its middle. */
function armProbes(c: Pt, l: number): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  for (const t of [l - 0.25, l / 2 + 1]) {
    out.push(
      [
        [c[0] - 3, c[1] - t],
        [c[0] + 3, c[1] - t],
      ],
      [
        [c[0] - 3, c[1] + t],
        [c[0] + 3, c[1] + t],
      ]
    );
    out.push(
      [
        [c[0] - t, c[1] - 3],
        [c[0] - t, c[1] + 3],
      ],
      [
        [c[0] + t, c[1] - 3],
        [c[0] + t, c[1] + 3],
      ]
    );
  }
  return out;
}
const restParity: Record<string, Record<number, number>> = {};

describe.each(CASES)('$name', ({ name, icon, spec, carbon }) => {
  const parts = statusMarkParts(spec as StatusMarkSpec<PlusPlace>);

  it('is a Carbon icon', () => expect(carbon, name).toBeTruthy());

  it('keeps the same shape keys at every hover frame and size, and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(icon.geo({ h: 0 }, size));
      for (const h of STEPS) {
        const shapes = icon.geo({ h }, size);
        expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
        noBad(shapes, `h=${h} @${size}`);
      }
    }
  });

  it("rests on Carbon's icon at 16, 20, 24 and 32 (within 0.5%, as the parity story measures), or on its deliberate departure", () => {
    restParity[name] = {};
    const departure = DEPARTURES[name];
    for (const size of SIZES) {
      grid(size);
      const ours = cover(icon.geo({ h: 0 }, size));
      const d = delta(ours, coverCarbon(carbon, size));
      restParity[name][size] = d;
      if (!departure) expect(d, `@${size}`).toBeLessThan(GATE);
      else
        expect(
          delta(ours, cover({ ref: { d: departure } })),
          `@${size} vs the departure`
        ).toBe(0);
    }
  });

  it.runIf(!spec.base.at)(
    "keeps its weight: base points move only as the base's own hover takes them, and then along their open end's wall (or round its ring)",
    () => {
      const rest = pointsOf(spec.base.d);
      const ends = spec.base.ends ?? [];
      const calm = spec.baseMotion === 'calm' ? spec.base.calm : undefined;
      for (const h of [0.5, 1]) {
        const now = pointsOf(parts(h).base);
        expect(now.length).toBe(rest.length);
        rest.forEach((p0, i) => {
          const q = now[i];
          const end = ends.find((e) =>
            e.at.some((a) => Math.hypot(a[0] - p0[0], a[1] - p0[1]) < 1e-3)
          );
          // With the base's own hover (calm), every point first goes where that hover takes it.
          const p = calm ? calm(p0, h) : p0;
          if (!end) {
            expect(
              Math.hypot(q[0] - p[0], q[1] - p[1]),
              `point ${i} (${p0}) h=${h}`
            ).toBeLessThan(2e-3);
          } else if (isTranslate(end.back)) {
            const [dx, dy] = [q[0] - p[0], q[1] - p[1]];
            const along = dx * end.back[0] + dy * end.back[1];
            expect(
              Math.abs(dx * end.back[1] - dy * end.back[0]),
              `point ${i} sideways h=${h}`
            ).toBeLessThan(2e-3);
            expect(along, `point ${i} draws back h=${h}`).toBeGreaterThan(
              -1e-6
            );
            expect(
              Math.abs(along - parts(h).drawn[ends.indexOf(end)]),
              `point ${i} by the end's draw-back`
            ).toBeLessThan(2e-3);
          } else {
            // Round its ring: same radius.
            const c = end.back.c;
            expect(
              Math.abs(
                Math.hypot(q[0] - c[0], q[1] - c[1]) -
                  Math.hypot(p[0] - c[0], p[1] - c[1])
              ),
              `point ${i} radius h=${h}`
            ).toBeLessThan(2e-3);
          }
        });
      }
    }
  );

  it("keeps the mark's arms (and ring) 2px wide through the hover, reaching by its reach", () => {
    const place = spec.place as PlusAltPlace;
    const reach = place.reach ?? plusReach(place.arm);
    for (const h of [0, 0.5, 1]) {
      const l = place.arm + reach * h;
      const c = plusCentre(place, h);
      const mark = parts(h).shapes.mark;
      for (const [a, b] of armProbes(c, l)) {
        const r = runs(mark, a, b);
        expect(r.length, `${a}→${b} h=${h}`).toBe(1);
        expect(Math.abs(r[0] - 2), `${a}→${b} h=${h}: ${r[0]}`).toBeLessThan(
          0.02
        );
      }
      // Arm to arm, end to end.
      const [run] = runs(
        mark,
        [c[0] - l - 1, c[1] + 0.5],
        [c[0] + l + 1, c[1] + 0.5]
      );
      expect(Math.abs(run - 2 * l), `span h=${h}`).toBeLessThan(0.02);
      if (spec.mark === PLUS_ALT) {
        const ring = parts(h).shapes.ring;
        const R = place.R + reach * h;
        const across = runs(
          ring,
          [place.c[0] + R - 4, place.c[1] - 0.3],
          [place.c[0] + R + 1, place.c[1] - 0.3]
        );
        expect(across.length).toBe(1);
        expect(Math.abs(across[0] - 2), `ring h=${h}`).toBeLessThan(0.03);
      }
    }
  });

  it('holds the space between the mark and the base: each open end at its resting width, the mark never within 2px', () => {
    const others = (h: number) => {
      const p = parts(h);
      return Object.entries(p.shapes)
        .filter(([k]) => k !== 'mark' && k !== 'ring')
        .flatMap(([, a]) => polysOf(String(a.d)));
    };
    const restGap = gapBetween(parts(0).ink, others(0));
    const restEnds = parts(0).gaps;
    for (const h of STEPS) {
      const p = parts(h);
      p.gaps.forEach((g, i) =>
        expect(g, `end ${i} h=${h}`).toBeGreaterThan(restEnds[i] - 1e-3)
      );
      const g = gapBetween(p.ink, others(h));
      expect(
        g,
        `whole base h=${h} (rest ${restGap.toFixed(2)})`
      ).toBeGreaterThan(Math.min(restGap, 2) - 0.02);
      // No shared ink.
      grid(32);
      const [im, ib] = [
        cover({ m: p.shapes.mark }),
        cover(
          Object.fromEntries(
            Object.entries(p.shapes).filter(
              ([k]) => k !== 'mark' && k !== 'ring'
            )
          )
        ),
      ];
      let shared = 0;
      for (let k = 0; k < im.length; k++) shared += im[k] & ib[k];
      expect(shared, `h=${h}`).toBe(0);
    }
  });

  it('stays inside the 36×36 hover box', () => {
    for (const h of STEPS) {
      for (const [k, a] of Object.entries(icon.geo({ h }, 32))) {
        for (const poly of polysOf(String(a.d)))
          for (const [x, y] of poly) {
            expect(x, `${k} h=${h}`).toBeGreaterThanOrEqual(-2 - 1e-6);
            expect(x, `${k} h=${h}`).toBeLessThanOrEqual(34 + 1e-6);
            expect(y, `${k} h=${h}`).toBeGreaterThanOrEqual(-2 - 1e-6);
            expect(y, `${k} h=${h}`).toBeLessThanOrEqual(34 + 1e-6);
          }
      }
    }
  });

  it('renders animated and static with no masks, clip paths, transforms or strokes', () => {
    const Icon = icon;
    const { container } = render(
      <MotionIconProvider animated>
        <Icon aria-label="t" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    expect(
      svg.querySelector('mask, clipPath, [transform], [stroke]')
    ).toBeNull();
    expect(svg.querySelectorAll('[data-k]').length).toBe(
      Object.keys(icon.geo({ h: 0 }, 32)).length
    );
    expect(svg.querySelector('[data-icon-path]')).toBeNull();
    // animated={false}: Carbon's art where the icon has one (decision 5), else the rest geometry.
    const still = render(<Icon animated={false} aria-label="t" />).container;
    expect(
      still.querySelector(
        (Icon as { static?: unknown }).static ? 'svg' : 'svg [data-k]'
      )
    ).not.toBeNull();
    if ((Icon as { static?: unknown }).static)
      expect(still.querySelector('[data-k]')).toBeNull();
  });
});

describe('Pills add', () => {
  const at = (h: number) => ADD.PillsAdd.parts(h).shapes.base;
  it("grows the round pill's ring about its centre at a constant 2px, giving the plus room for the set's 2px reach", () => {
    expect(ADD.PILL_GROW).toBeCloseTo(1.099, 3);
    for (const h of STEPS) {
      const ri = 6 + ADD.PILL_GROW * h;
      // Out from the centre to the right, and down: one 2px wall, starting at the inner radius.
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [Math.SQRT1_2, Math.SQRT1_2],
      ]) {
        const r = runs(
          at(h),
          [22 + dx * (ri - 1), 22 + dy * (ri - 1)],
          [22 + dx * (ri + 4), 22 + dy * (ri + 4)]
        );
        expect(r.length, `h=${h}`).toBe(1);
        expect(Math.abs(r[0] - 2), `ring h=${h}: ${r[0]}`).toBeLessThan(0.03);
      }
      // The capsule's walls hold 2px: its left wall, its waist, and the ring between its lower hollow and the round pill.
      expect(
        runs(at(h), [2, 20], [9, 20]).map((w) => +w.toFixed(2)),
        `left wall h=${h}`
      ).toEqual([2]);
      expect(
        runs(at(h), [10, 13], [10, 19]).map((w) => +w.toFixed(2)),
        `waist h=${h}`
      ).toEqual([2]);
    }
    // The plus's arm-end corners stay 2px inside the ring at full hover (2.84 at rest).
    const gapIn = (h: number) =>
      6 + ADD.PILL_GROW * h - Math.hypot(3 + 2 * h, 1);
    expect(gapIn(0)).toBeCloseTo(2.838, 3);
    expect(gapIn(1)).toBeCloseTo(2, 6);
  });
  it("rests on Carbon's drawing, and its parametric drawing meets it as the hover starts", () => {
    expect(ADD.PillsAdd.parts(0).base).toBe(ADD.PILLS_ADD.base.d);
    grid(32);
    expect(
      delta(
        cover({ a: ADD.PillsAdd.parts(0).shapes.base }),
        cover({ b: { d: ADD.PILLS_ADD.base.at!(1e-9) } })
      )
    ).toBe(0);
  });
});

describe("the base's own hover (review rounds 3 and 4)", () => {
  const hold = statusMarkParts({ ...ADD.DOCUMENT_ADD, baseMotion: 'hold' });
  it("Document add's fold folds down 2px (Document's corner) while the page holds, its open ends still keeping their space", () => {
    const parts = ADD.DocumentAdd.parts;
    const rest = parts(0);
    expect(pointsOf(rest.base)).toEqual(pointsOf(ADD.DOCUMENT_ADD.base.d));
    for (const h of STEPS)
      parts(h).gaps.forEach((g, i) =>
        expect(g, `end ${i} h=${h}`).toBeGreaterThan(rest.gaps[i] - 1e-3)
      );
    const [r0, r1] = [pointsOf(rest.base), pointsOf(parts(1).base)];
    // The page's left wall holds; the fold's vertical line (x 16) comes 2px left.
    expect(r1[1][0]).toBeCloseTo(r0[1][0], 3);
    const fold = r0.findIndex(([x, y]) => x === 16 && y === 10);
    expect(r1[fold][0]).toBeCloseTo(14, 3);
  });
  it('hold (the earlier rule) is still there: the base still apart from its open ends', () => {
    expect(hold(1).drawn).toEqual([2, 2].map((d) => expect.closeTo(d, 3)));
  });
});

describe('two-tone', () => {
  // A filled disc with a knocked-out bar (an inner glyph), and a plus beside it.
  const spec: StatusMarkSpec<PlusPlace> = {
    base: {
      d: 'M14 2A12 12 0 1 0 14 26A12 12 0 1 0 14 2ZM9 13H19V15H9Z',
      evenodd: true,
      inner: 'M9 13H19V15H9Z',
    },
    mark: PLUS,
    place: { c: [26, 26], arm: 4 },
  };
  it('by default, the glyph is only knocked out (as our filled status icons): no inner-path', () => {
    const Icon = makeStatusMarkIcon('TwoTone', spec);
    const { container } = render(<Icon animated={false} />);
    expect(container.querySelector('[data-icon-path]')).toBeNull();
  });
  it("with twoTone, the glyph is also Carbon's unpainted inner-path, for a host to colour", () => {
    const Icon = makeStatusMarkIcon('TwoTone', { ...spec, twoTone: true });
    for (const animated of [false, true]) {
      const { container } = render(<Icon animated={animated} />);
      const inner = container.querySelector('[data-icon-path="inner-path"]')!;
      expect(inner).not.toBeNull();
      expect(inner.getAttribute('fill')).toBe('none');
      expect(inner.getAttribute('d')).toBe(spec.base.inner);
    }
  });
});
