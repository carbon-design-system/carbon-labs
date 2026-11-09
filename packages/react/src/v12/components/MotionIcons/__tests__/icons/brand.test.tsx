/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { render } from '@testing-library/react';
import { Carbon as CCarbon } from '@carbon/icons-react';
import CarbonArt from '@carbon/icons/es/carbon/32.js';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  CARBON_BACK,
  CARBON_BACK_CENTRE,
  CARBON_FRONT,
  CARBON_FRONT_CENTRE,
  CARBON_HOVER,
  CARBON_ORBIT_FROM,
  CARBON_ORBIT_R,
  CARBON_ORBIT_TO,
  CARBON_PAIR_CENTRE,
  CARBON_SETTLE,
  CARBON_TURN,
  Carbon,
  carbonLogo,
  carbonShapes,
} from '../../icons/assorted/brand';

/**
 * Points along a path's straight segments (every 0.1px) and its arc ends:
 * Carbon's carbon path uses M, L/l, H, V, A/a and Z, relative and absolute.
 */
function outlinePoints(d: string): Pt[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g)!;
  const out: Pt[] = [];
  let [i, cmd, cur, start] = [0, '', [0, 0] as Pt, [0, 0] as Pt];
  const num = () => +tokens[i++];
  const lineTo = (p: Pt) => {
    const n = Math.ceil(dist(cur, p) / 0.1);
    for (let k = 1; k <= n; k++)
      out.push([
        cur[0] + ((p[0] - cur[0]) * k) / n,
        cur[1] + ((p[1] - cur[1]) * k) / n,
      ]);
    cur = p;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const at = (x: number, y: number): Pt =>
      rel ? [cur[0] + x, cur[1] + y] : [x, y];
    switch (cmd.toUpperCase()) {
      case 'M':
        cur = start = at(num(), num());
        out.push(cur);
        cmd = rel ? 'l' : 'L';
        break;
      case 'L':
        lineTo(at(num(), num()));
        break;
      case 'H':
        lineTo([rel ? cur[0] + num() : num(), cur[1]]);
        break;
      case 'V':
        lineTo([cur[0], rel ? cur[1] + num() : num()]);
        break;
      case 'A': {
        i += 5;
        cur = at(num(), num());
        out.push(cur);
        break;
      }
      case 'Z':
        lineTo(start);
        break;
      default:
        throw new Error(cmd);
    }
  }
  return out;
}

/**
 * Carbon (brand.ts): the two hexagons rest on Carbon's drawing exactly (every
 * point of Carbon's outline is 1px from our 2px centrelines, and every
 * centreline point is 1px inside Carbon's ink); on hover each turns
 * CARBON_TURN about its own centre (rigid: every edge keeps its length, the
 * walls stay 2px) while the pair orbits clockwise about (16, 16) toward level,
 * the back on the right, finishing 2px in from the widest level spacing
 * (the front down-right, the back up-left), blended in with h; what shows
 * of the back never comes closer to the front than 2.3px (2.5px at rest)
 * and never jumps; and every frame stays inside the 36×36 hover box.
 */

const H = Array.from({ length: 101 }, (_, i) => i / 100);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
const runDist = (p: Pt, run: readonly Pt[], closed: boolean) => {
  let m = Infinity;
  const n = closed ? run.length : run.length - 1;
  for (let i = 0; i < n; i++)
    m = Math.min(m, segDist(p, run[i], run[(i + 1) % run.length]));
  return m;
};
function inside(p: Pt, poly: readonly Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    const c = Math.sign(
      (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
    );
    if (c && sign && c !== sign) return false;
    sign ||= c;
  }
  return true;
}
/** Distance from p to the front hexagon's filled centreline region. */
const regionDist = (p: Pt, poly: readonly Pt[]) =>
  inside(p, poly) ? 0 : runDist(p, poly, true);
/** Samples of a run's 2px stroke: its centreline and both edges. */
function strokeSamples(run: readonly Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < run.length - 1; i++) {
    const [a, b] = [run[i], run[i + 1]];
    const l = dist(a, b);
    const n: Pt = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    for (let t = 0; t <= 1.0001; t += 0.02) {
      const p: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      for (const s of [-1, 0, 1]) out.push([p[0] + n[0] * s, p[1] + n[1] * s]);
    }
  }
  return out;
}

describe('Carbon at rest', () => {
  const { front, back } = carbonLogo(0);
  const art = (CarbonArt.content ?? []).map(
    (c) => (c.attrs as { d: string }).d
  );

  it('the back hexagon shows its far half, vertex to vertex, as Carbon draws it', () => {
    expect(back.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)])).toEqual([
      [10, 7],
      [18.5, 2.1851],
      [27, 7],
      [27, 17],
    ]);
    expect(front).toEqual([...CARBON_FRONT]);
  });

  it("every point of Carbon's outline is 1px from our centrelines", () => {
    const [frontArt, backArt] = art.map(outlinePoints);
    expect(frontArt.length).toBeGreaterThan(300);
    for (const p of frontArt)
      expect(Math.abs(runDist(p, front, true) - 1), `front ${p}`).toBeLessThan(
        0.01
      );
    // The back's square-cut ends lie on the end's normal (their distance to the run is under 1).
    for (const p of backArt) {
      const d = runDist(p, back, false);
      const onCap =
        Math.min(dist(p, back[0]), dist(p, back[back.length - 1])) <= 1.0001;
      if (onCap) expect(d).toBeLessThanOrEqual(1.01);
      else expect(Math.abs(d - 1), `back ${p}`).toBeLessThan(0.01);
    }
  });

  it('draws Carbon’s own art with motion off', () => {
    const ours = render(
      <MotionIconProvider animated={false}>
        <Carbon size={32} />
      </MotionIconProvider>
    ).container.innerHTML;
    const theirs = render(<CCarbon size={32} />).container.innerHTML;
    expect(ours).toBe(theirs);
  });
});

describe('Carbon hover', () => {
  const centreOf = (pts: readonly Pt[]): Pt => [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];
  const D = Math.PI / 180;

  it('turns each hexagon rigidly 30° about its own centre, the front clockwise', () => {
    const edges = (pts: readonly Pt[]) =>
      pts.map((p, i) => dist(p, pts[(i + 1) % pts.length]));
    const rest = edges(CARBON_FRONT);
    for (const h of H) {
      const { front } = carbonLogo(h);
      edges(front).forEach((e, i) => expect(e).toBeCloseTo(rest[i], 9));
      const c = centreOf(front);
      const a0 = Math.atan2(
        CARBON_FRONT[0][1] - CARBON_FRONT_CENTRE[1],
        CARBON_FRONT[0][0] - CARBON_FRONT_CENTRE[0]
      );
      const a1 = Math.atan2(front[0][1] - c[1], front[0][0] - c[0]);
      expect((a1 - a0) / D).toBeCloseTo(CARBON_TURN * h, 6);
    }
  });

  it('shows only the back hexagon turned the other way, about its own centre', () => {
    for (const h of H) {
      const { back, centres } = carbonLogo(h);
      const cb = centres[1];
      const [s, k] = [
        Math.sin(-CARBON_TURN * h * D),
        Math.cos(-CARBON_TURN * h * D),
      ];
      const hex = CARBON_BACK.map(([x, y]) => {
        const [dx, dy] = [x - CARBON_BACK_CENTRE[0], y - CARBON_BACK_CENTRE[1]];
        return [cb[0] + dx * k - dy * s, cb[1] + dx * s + dy * k] as Pt;
      });
      for (const p of back)
        expect(runDist(p, hex, true), `h ${h}`).toBeLessThan(1e-6);
    }
  });

  it('orbits clockwise about the shared centre, finishing 2px in from level: the front down-right, the back up-left', () => {
    let last = -Infinity;
    for (const h of H) {
      const { front, centres } = carbonLogo(h);
      const [cf, cb] = centres;
      expect(dist(centreOf(front), cf)).toBeLessThan(1e-9);
      // Opposite each other about (16, 16).
      expect((cf[0] + cb[0]) / 2).toBeCloseTo(CARBON_PAIR_CENTRE[0], 9);
      expect((cf[1] + cb[1]) / 2).toBeCloseTo(CARBON_PAIR_CENTRE[1], 9);
      // Clockwise on screen: the back's angle about the centre only grows.
      const a = Math.atan2(
        cb[1] - CARBON_PAIR_CENTRE[1],
        cb[0] - CARBON_PAIR_CENTRE[0]
      );
      expect(a).toBeGreaterThanOrEqual(last - 1e-12);
      last = a;
    }
    expect(CARBON_ORBIT_FROM / D).toBeCloseTo(-57.99, 2);
    expect(CARBON_ORBIT_TO).toBe(0);
    const { front, back, centres } = carbonLogo(1);
    // The orbit's level end, as wide as the box allows (its walls on x −2 and 34), moved by CARBON_SETTLE.
    expect(2 * CARBON_ORBIT_R).toBeCloseTo(14.28, 2);
    expect(CARBON_SETTLE).toEqual([2, 2]);
    expect(centres[0][0]).toBeCloseTo(
      CARBON_PAIR_CENTRE[0] - CARBON_ORBIT_R + 2,
      9
    );
    expect(centres[0][1]).toBeCloseTo(16 + 2, 9);
    expect(centres[1][0]).toBeCloseTo(
      CARBON_PAIR_CENTRE[0] + CARBON_ORBIT_R - 2,
      9
    );
    expect(centres[1][1]).toBeCloseTo(16 - 2, 9);
    expect(dist(centres[0], centres[1])).toBeCloseTo(11.03, 2);
    // So the outer corners' walls finish 2px inside the box's sides.
    expect(Math.min(...front.map((p) => p[0])) - 1).toBeCloseTo(0, 9);
    expect(Math.max(...back.map((p) => p[0])) + 1).toBeCloseTo(32, 9);
  });

  it('blends the finish offset in with h (no step at the end)', () => {
    for (const h of H) {
      const [cf] = carbonLogo(h).centres;
      const a = CARBON_ORBIT_FROM + (CARBON_ORBIT_TO - CARBON_ORBIT_FROM) * h;
      const r =
        Math.hypot(5, 8) / 2 + (CARBON_ORBIT_R - Math.hypot(5, 8) / 2) * h;
      expect(cf[0]).toBeCloseTo(16 - r * Math.cos(a) + 2 * h, 9);
      expect(cf[1]).toBeCloseTo(16 - r * Math.sin(a) + 2 * h, 9);
    }
  });

  it('paints filled 2px walls (no strokes, no transforms), one rectangle per edge of the back run', () => {
    for (const h of H) {
      const shapes = carbonShapes(h);
      for (const s of Object.values(shapes)) {
        expect(Object.keys(s)).toEqual(['d']);
        expect(String(s.d)).not.toMatch(/NaN|Infinity/);
      }
      const { back, backClosed } = carbonLogo(h);
      expect(backClosed).toBe(false);
      const rects = String(shapes.back.d)
        .split('Z')
        .filter((p) => p.includes('L'))
        .map((p) =>
          [...p.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(
            (m) => [+m[1], +m[2]] as Pt
          )
        );
      expect(rects.length).toBe(back.length - 1);
      for (const r of rects) {
        expect(dist(r[0], r[3])).toBeCloseTo(2, 3);
        expect(dist(r[1], r[2])).toBeCloseTo(2, 3);
      }
    }
  });

  it('keeps what shows of the back at least 2.3px clear of the front (2.5px at rest)', () => {
    const clear = (h: number) => {
      const { front, back } = carbonLogo(h);
      return Math.min(
        ...strokeSamples(back).map((p) => regionDist(p, front) - 1)
      );
    };
    const rest = clear(0);
    expect(rest).toBeCloseTo(2.5, 1);
    for (const h of H) expect(clear(h), `h ${h}`).toBeGreaterThan(2.29);
  });

  it('never jumps: the back’s run ends move continuously', () => {
    for (let i = 1; i <= 10000; i++) {
      const [a, b] = [
        carbonLogo((i - 1) / 10000).back,
        carbonLogo(i / 10000).back,
      ];
      for (const end of [0, -1])
        expect(dist(a.at(end)!, b.at(end)!), `h ${i / 10000}`).toBeLessThan(
          0.1
        );
    }
  });

  it('stays inside the 36×36 box', () => {
    for (const h of H) {
      const { front, back } = carbonLogo(h);
      for (const [x, y] of [...front, ...back]) {
        expect(x - 1).toBeGreaterThanOrEqual(-2 - 1e-9);
        expect(y - 1).toBeGreaterThanOrEqual(-2 - 1e-9);
        expect(x + 1).toBeLessThanOrEqual(34 + 1e-9);
        expect(y + 1).toBeLessThanOrEqual(34 + 1e-9);
      }
    }
  });

  it('hovers for moderate-02 and returns along the same arc', () => {
    expect(CARBON_HOVER.duration).toBe(motionTokens.duration.moderate02 / 1000);
    // The drawing is a function of h alone, so the leave retraces the hover.
    for (const h of [0.25, 0.5, 0.75])
      expect(carbonShapes(h)).toEqual(carbonShapes(h));
  });

  it('renders at every size with the same two parts', () => {
    for (const size of [16, 20, 24, 32] as const) {
      const svg = render(<Carbon size={size} />).container.querySelector(
        'svg'
      )!;
      expect(svg.querySelectorAll('path').length).toBe(2);
    }
  });
});
