/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as CarbonIcons from '@carbon/icons-react';
import {
  ArrowDownLeftToggleSpec,
  ArrowDownRightToggleSpec,
  ArrowDownToggleSpec,
  ArrowLeftToggleSpec,
} from '@carbon-labs/motion-icons-core/icons/toggle/arrowToggles';
import { FOLD_AT } from '@carbon-labs/motion-icons-core/ease';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import * as Lib from '../../index';

/**
 * Arrow direction toggles (toggle/arrowToggles.ts): the whole arrow flips
 * across its axis like the Chevron toggles, its head landing at the other
 * end of the shaft.
 *
 * Checked from the geometry: both ends are Carbon's drawings at every size
 * (rasterised, as the parity story measures, < 0.5% of ink), the line width
 * never changes at 32, the arrow is one flat bar at the fold (6/15), each
 * end's hover moves as its Arrow icon at half the reach (2px, as the Chevron
 * toggles halve theirs; the tail holds), and no frame
 * leaves the 36×36 box.
 */

type Pt = [number, number];
type Shape = Record<string, string | number>;
type Spec = {
  name: string;
  states: readonly [string, string];
  geo: (
    f: { h: number; p: number; e: number },
    size?: number
  ) => Record<string, Shape>;
};
type Comp = React.ComponentType<Record<string, unknown>>;

/** [name, spec, Carbon's off and on icons, the off end's pointing direction]. */
const PAIRS: Array<[string, Spec, string, string, Pt]> = [
  [
    'ArrowDownToggle',
    ArrowDownToggleSpec as unknown as Spec,
    'ArrowDown',
    'ArrowUp',
    [0, 1],
  ],
  [
    'ArrowLeftToggle',
    ArrowLeftToggleSpec as unknown as Spec,
    'ArrowLeft',
    'ArrowRight',
    [-1, 0],
  ],
  [
    'ArrowDownLeftToggle',
    ArrowDownLeftToggleSpec as unknown as Spec,
    'ArrowDownLeft',
    'ArrowUpRight',
    [-Math.SQRT1_2, Math.SQRT1_2],
  ],
  [
    'ArrowDownRightToggle',
    ArrowDownRightToggleSpec as unknown as Spec,
    'ArrowDownRight',
    'ArrowUpLeft',
    [Math.SQRT1_2, Math.SQRT1_2],
  ],
];
const SIZES = [16, 20, 24, 32];
const STEPS = Array.from({ length: 31 }, (_, i) => i / 30);
const HS = [0, 0.5, 1];

const nums = (d: string) => d.match(/-?\d*\.?\d+(?:e-?\d+)?/g)!.map(Number);
const ptsOf = (d: string): Pt[] => {
  const n = nums(d);
  return Array.from(
    { length: n.length / 2 },
    (_, i) => [n[2 * i], n[2 * i + 1]] as Pt
  );
};

// ── A small rasteriser: Carbon's straight-line paths, and our mitred strokes ──
type Poly = Pt[];
const inside = (poly: Poly, [x, y]: Pt) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};
/** A stroked polyline (butt ends, miter joins) as polygons. */
function strokePolys(pts: Pt[], w: number): Poly[] {
  const out: Poly[] = [];
  const r = w / 2;
  const norm = (a: Pt, b: Pt): Pt => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy) || 1;
    return [(-dy / l) * r, (dx / l) * r];
  };
  for (let i = 0; i + 1 < pts.length; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9) continue;
    const n = norm(a, b);
    out.push([
      [a[0] + n[0], a[1] + n[1]],
      [b[0] + n[0], b[1] + n[1]],
      [b[0] - n[0], b[1] - n[1]],
      [a[0] - n[0], a[1] - n[1]],
    ]);
  }
  for (let i = 1; i + 1 < pts.length; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const [n1, n2] = [norm(a, b), norm(b, c)];
    for (const s of [1, -1]) {
      const p1: Pt = [b[0] + s * n1[0], b[1] + s * n1[1]];
      const p2: Pt = [b[0] + s * n2[0], b[1] + s * n2[1]];
      const m: Pt = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
      const ml = Math.hypot(m[0], m[1]);
      if (ml < 1e-9) continue;
      const k = (r * r) / (ml * ml);
      out.push([b, p1, [b[0] + s * m[0] * k, b[1] + s * m[1] * k], p2]);
    }
  }
  return out;
}
// Samples across the 36 box (8 a unit), off the half-unit grid (by different amounts in x and y) so no sample sits exactly on a 45° edge.
const N = 288;
const at = (k: number, off = 0.137) => -2 + ((k + 0.5 + off) * 36) / N;
function raster(polys: Poly[]): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const poly of polys) {
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    const [k0, k1] = [
      Math.floor(((Math.min(...xs) + 2) * N) / 36),
      Math.ceil(((Math.max(...xs) + 2) * N) / 36),
    ];
    const [j0, j1] = [
      Math.floor(((Math.min(...ys) + 2) * N) / 36),
      Math.ceil(((Math.max(...ys) + 2) * N) / 36),
    ];
    for (let j = Math.max(0, j0); j < Math.min(N, j1); j++)
      for (let k = Math.max(0, k0); k < Math.min(N, k1); k++)
        if (inside(poly, [at(k), at(j, 0.311)])) ink[j * N + k] = 1;
  }
  return ink;
}
const ours = (shapes: Record<string, Shape>) =>
  raster(
    Object.values(shapes).flatMap((s) =>
      strokePolys(ptsOf(String(s.d)), Number(s.strokeWidth))
    )
  );
function carbon(name: string, size: number): Uint8Array {
  const { container } = render(
    React.createElement(
      (CarbonIcons as unknown as Record<string, Comp>)[name],
      { size }
    )
  );
  const svg = container.querySelector('svg')!;
  const k = 32 / Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const polys = [...svg.querySelectorAll('path')].map((p) =>
    ptsOf(p.getAttribute('d')!).map(([x, y]) => [x * k, y * k] as Pt)
  );
  return raster(polys);
}
const delta = (a: Uint8Array, b: Uint8Array) => {
  let [diff, ink] = [0, 0];
  for (let i = 0; i < a.length; i++) {
    if (a[i] || b[i]) ink++;
    if (a[i] !== b[i]) diff++;
  }
  return diff / ink;
};

describe.each(PAIRS)('%s', (_name, spec, offIcon, onIcon, u) => {
  const geo = (h: number, p: number, size?: number) =>
    spec.geo({ h, p, e: 0 }, size);
  const along = ([x, y]: Pt) => (x - 16) * u[0] + (y - 16) * u[1];

  it("rests on Carbon's drawings at both ends and every size (< 0.5% of ink)", () => {
    for (const size of SIZES) {
      for (const [p, icon] of [
        [0, offIcon],
        [1, onIcon],
      ] as const) {
        const d = delta(ours(geo(0, p, size)), carbon(icon, size));
        // Carbon's own 20 and 24 Arrow right taper their arms (the 20's inner edges end at 16.2, not 16.3; the 24's at
        // 18.9, not 19): a constant-width stroke leaves a 0.1px sliver this fine sampler counts (up to 1.2%); Chrome's
        // rest parity reads 0.00%.
        expect(d, `${icon} @${size}`).toBeLessThan(
          icon === 'ArrowRight' && (size === 20 || size === 24) ? 0.015 : 0.005
        );
      }
    }
  });

  it('keeps its keys, its line width at 32, and finite numbers at every frame', () => {
    const rest = geo(0, 0);
    for (const h of HS) {
      for (const p of STEPS) {
        const s = geo(h, p);
        expect(Object.keys(s)).toEqual(['shaft', 'head']);
        expect(s.head.strokeWidth).toBe(rest.head.strokeWidth);
        expect(s.shaft.strokeWidth).toBe(rest.shaft.strokeWidth);
        for (const k of Object.keys(s))
          expect(nums(String(s[k].d)).every(Number.isFinite)).toBe(true);
      }
    }
  });

  it('folds flat at 6/15: one bar across the middle, the shaft closed up', () => {
    for (const size of SIZES) {
      const s = geo(1, FOLD_AT, size);
      const all = [...ptsOf(String(s.head.d)), ...ptsOf(String(s.shaft.d))];
      for (const pt of all) expect(Math.abs(along(pt))).toBeLessThan(1e-3);
    }
  });

  it('turns over, never in the plane: each point moves only along the axis', () => {
    const across = ([x, y]: Pt) => -(x - 16) * u[1] + (y - 16) * u[0];
    const a0 = ptsOf(String(geo(0, 0).head.d)).map(across);
    for (const p of STEPS) {
      const a = ptsOf(String(geo(0, p).head.d)).map(across);
      a.forEach((v, i) => expect(v).toBeCloseTo(a0[i], 1));
    }
  });

  it('hovers as its Arrow icons at each end at half the reach (as the Chevron toggles): the head reaches 2, the tail holds', () => {
    for (const p of [0, 1]) {
      const [r, h] = [geo(0, p), geo(1, p)];
      const sign = p === 0 ? 1 : -1;
      const [apexR, apexH] = [
        ptsOf(String(r.head.d))[1],
        ptsOf(String(h.head.d))[1],
      ];
      expect(along(apexH) - along(apexR)).toBeCloseTo(2 * sign, 3);
      expect(ptsOf(String(h.shaft.d))[1]).toEqual(ptsOf(String(r.shaft.d))[1]);
    }
  });

  it('stays inside the 36×36 box at every frame, size and hover', () => {
    for (const size of SIZES) {
      for (const h of HS) {
        for (const p of STEPS) {
          const s = geo(h, p, size);
          for (const k of Object.keys(s)) {
            for (const poly of strokePolys(
              ptsOf(String(s[k].d)),
              Number(s[k].strokeWidth)
            )) {
              for (const [x, y] of poly) {
                expect(x, `${k} @${size} h${h} p${p}`).toBeGreaterThanOrEqual(
                  -2 - 1e-3
                );
                expect(x).toBeLessThanOrEqual(34 + 1e-3);
                expect(y).toBeGreaterThanOrEqual(-2 - 1e-3);
                expect(y).toBeLessThanOrEqual(34 + 1e-3);
              }
            }
          }
        }
      }
    }
  });

  it("draws Carbon's art for each state with animation off", () => {
    const T = (Lib as unknown as Record<string, Comp>)[spec.name];
    for (const [state, icon] of [
      [spec.states[0], offIcon],
      [spec.states[1], onIcon],
    ] as const) {
      for (const size of SIZES) {
        const ours = render(
          <MotionIconProvider animated={false}>
            <T size={size} initial={state} />
          </MotionIconProvider>
        ).container.querySelector('svg')!;
        const theirs = render(
          React.createElement(
            (CarbonIcons as unknown as Record<string, Comp>)[icon],
            { size }
          )
        ).container.querySelector('svg')!;
        expect(ours.innerHTML, `${state} @${size}`).toBe(theirs.innerHTML);
      }
    }
  });
});
