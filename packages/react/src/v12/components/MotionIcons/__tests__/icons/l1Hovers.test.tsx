/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, describe, it, expect } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { render } from '@testing-library/react';
import {
  At as CAt,
  Crossroads as CCrossroads,
  IbmWatsonDiscovery as CIbmWatsonDiscovery,
  Sql as CSql,
  ToolsAlt as CToolsAlt,
  WebServicesCluster as CWebServicesCluster,
  SoftwareResourceCluster as CSoftwareResourceCluster,
  CircleSolid as CCircleSolid,
} from '@carbon/icons-react';
import {
  FrameController,
  fromHover,
  HOVER,
  HOVER_OUT,
  type HoverIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { ToolsAltSpec } from '@carbon-labs/motion-icons-core/icons/instruments/instruments';
import {
  CircleSolidSpec,
  CrossroadsSpec,
} from '@carbon-labs/motion-icons-core/icons/assorted/statesTime';
import { IbmWatsonDiscoverySpec } from '@carbon-labs/motion-icons-core/icons/assorted/docs2';
import { AtSpec } from '@carbon-labs/motion-icons-core/icons/data/data-b';
import { SqlSpec } from '@carbon-labs/motion-icons-core/icons/formatting/textStyle';
import {
  SoftwareResourceClusterSpec,
  WebServicesClusterSpec,
} from '@carbon-labs/motion-icons-core/icons/assorted/systems';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import {
  ToolsAlt,
  TOOLS_ALT_TICK_SLIDE,
  TOOLS_ALT_TURN,
} from '../../icons/instruments/instruments';
import {
  CircleSolid,
  Crossroads,
  CROSSROADS_LIFT,
  CROSSROADS_REACH,
} from '../../icons/assorted/statesTime';
import {
  IbmWatsonDiscovery,
  DISCOVERY_SCROLL,
} from '../../icons/assorted/docs2';
import { At, AT_GROW, AT_REACH } from '../../icons/data/data-b';
import { Sql, STYLE_GROW } from '../../icons/formatting/textStyle';
import {
  CLUSTER_DIAMOND_GROW,
  RESOURCE_CLUSTER_SPREAD,
  SoftwareResourceCluster,
  WEB_CLUSTER_SPREAD,
  WEB_HEXAGON_GROW,
  WebServicesCluster,
} from '../../icons/assorted/systems';
import { cover, coverCarbon, delta, flatten, grid } from './markRaster';

/**
 * The L1 and L2 pages' hovers (Workspace prototype):
 * Tools alt (instruments.ts), Crossroads and Circle solid (statesTime.ts),
 * IBM Watson Discovery (docs2.ts), At (data-b.ts), Sql (textStyle.ts), Web
 * services cluster and Software resource cluster (systems.ts). Each rests on
 * Carbon's drawing at 16, 20, 24 and 32 (Carbon draws each once, so one
 * geometry serves every size) and draws Carbon's art with motion off; at
 * the peak each part is where its motion puts it, at its weight; every
 * frame the controller paints on the standard timing (moderate-01 in, fast-02 out)
 * stays inside the 36×36 hover box.
 */

afterEach(() => setScheduler(null));

const SIZES = [16, 20, 24, 32] as const;
const H = Array.from({ length: 21 }, (_, i) => i / 20);
const pts = (d: unknown): Pt[] => flatten(String(d)).flatMap((p) => p.pts);
const near = (a: Pt, b: Pt, tol = 2e-3) =>
  Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
const turn =
  (deg: number) =>
  ([x, y]: Pt): Pt => {
    const [c, s] = [
      Math.cos((deg * Math.PI) / 180),
      Math.sin((deg * Math.PI) / 180),
    ];
    return [16 + (x - 16) * c - (y - 16) * s, 16 + (x - 16) * s + (y - 16) * c];
  };

interface Case {
  name: string;
  icon: FrameHoverIcon;
  spec: HoverIconSpec;
  carbon: CarbonIcon;
}
const CASES: Case[] = [
  { name: 'ToolsAlt', icon: ToolsAlt, spec: ToolsAltSpec, carbon: CToolsAlt },
  {
    name: 'Crossroads',
    icon: Crossroads,
    spec: CrossroadsSpec,
    carbon: CCrossroads,
  },
  {
    name: 'IbmWatsonDiscovery',
    icon: IbmWatsonDiscovery,
    spec: IbmWatsonDiscoverySpec,
    carbon: CIbmWatsonDiscovery,
  },
  { name: 'At', icon: At, spec: AtSpec, carbon: CAt },
  { name: 'Sql', icon: Sql, spec: SqlSpec, carbon: CSql },
  {
    name: 'WebServicesCluster',
    icon: WebServicesCluster,
    spec: WebServicesClusterSpec,
    carbon: CWebServicesCluster,
  },
  {
    name: 'SoftwareResourceCluster',
    icon: SoftwareResourceCluster,
    spec: SoftwareResourceClusterSpec,
    carbon: CSoftwareResourceCluster,
  },
  {
    name: 'CircleSolid',
    icon: CircleSolid,
    spec: CircleSolidSpec,
    carbon: CCircleSolid,
  },
];

/** Every frame a controller paints through a hover in and back out, on the engine's clock. */
async function playHover(spec: HoverIconSpec, size: number) {
  const clock = manualScheduler(1);
  setScheduler(clock);
  const frames: { t: number; h: number; shapes: Shapes }[] = [];
  const ctl = new FrameController(
    fromHover(spec),
    (shapes) => frames.push({ t: clock.time(), h: ctl.frame.h, shapes }),
    size
  );
  const run = async (ms: number) => {
    for (let t = 0; t < ms; t++) {
      clock.advance(1);
      await Promise.resolve();
    }
  };
  const [inMs, outMs] = [
    motionTokens.duration.moderate01,
    motionTokens.duration.fast02,
  ];
  void ctl.enter();
  await run(inMs - 1);
  const before = ctl.frame.h;
  await run(1);
  const inAt = ctl.frame.h;
  await run(50);
  void ctl.leave();
  await run(outMs - 1);
  const outBefore = ctl.frame.h;
  await run(1);
  return { frames, before, inAt, outBefore, outAt: ctl.frame.h };
}

/** The ink's bounds over shapes. */
function bounds(shapes: Shapes) {
  const all = Object.values(shapes).flatMap((s) => pts(s.d));
  return {
    x0: Math.min(...all.map((p) => p[0])),
    y0: Math.min(...all.map((p) => p[1])),
    x1: Math.max(...all.map((p) => p[0])),
    y1: Math.max(...all.map((p) => p[1])),
  };
}

describe.each(CASES)('$name', ({ icon, spec, carbon }) => {
  it("rests on Carbon's drawing at 16, 20, 24 and 32 (no ink pixel differs)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(icon.geo({ h: 0 }, size)), coverCarbon(carbon, size)),
        `@${size}`
      ).toBe(0);
    }
  });

  it("draws Carbon's own art with motion off", () => {
    const Icon = icon;
    for (const size of SIZES) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <Icon size={size} />
        </MotionIconProvider>
      ).container.innerHTML;
      const Carbon = carbon;
      expect(ours, `@${size}`).toBe(
        render(<Carbon size={size} />).container.innerHTML
      );
    }
  });

  it('plays on the standard hover timing: moderate-01 in, fast-02 out', async () => {
    expect(spec.hover).toBeUndefined();
    expect(spec.leave).toBeUndefined();
    expect([HOVER.duration, HOVER_OUT.duration]).toEqual([
      motionTokens.duration.moderate01 / 1000,
      motionTokens.duration.fast02 / 1000,
    ]);
    const { before, inAt, outBefore, outAt } = await playHover(spec, 32);
    expect(before).toBeLessThan(1);
    expect(inAt).toBe(1);
    expect(outBefore).toBeGreaterThan(0);
    expect(outAt).toBe(0);
  });

  it('keeps every painted frame inside the 36×36 box at every size, with the same keys and no NaN', async () => {
    for (const size of SIZES) {
      const { frames } = await playHover(spec, size);
      expect(frames.length).toBeGreaterThan(200);
      const keys = Object.keys(icon.geo({ h: 0 }, size));
      for (const { t, shapes } of frames) {
        expect(Object.keys(shapes)).toEqual(keys);
        for (const s of Object.values(shapes)) {
          expect(String(s.d)).not.toMatch(/NaN|Infinity|undefined/);
          expect(s.transform).toBeUndefined();
        }
        const b = bounds(shapes);
        expect(
          b.x0 >= -2 && b.y0 >= -2 && b.x1 <= 34 && b.y1 <= 34,
          `t=${t} @${size}: ${JSON.stringify(b)}`
        ).toBe(true);
      }
    }
  });
});

/** Where a path's edges cross the line y (or, with `vertical`, the line x), sorted: an ink run between each pair. */
function crossings(d: unknown, at: number, vertical = false): number[] {
  const out: number[] = [];
  for (const { pts: q } of flatten(String(d))) {
    q.forEach((a0, k) => {
      const b0 = q[(k + 1) % q.length];
      const [a, b] = vertical
        ? [
            [a0[1], a0[0]],
            [b0[1], b0[0]],
          ]
        : [a0, b0];
      if (a[1] <= at !== b[1] <= at)
        out.push(
          +(a[0] + ((at - a[1]) * (b[0] - a[0])) / (b[1] - a[1])).toFixed(3)
        );
    });
  }
  return out.sort((p, q) => p - q);
}
/** The narrowest gap between two sets of outline points. */
function gap(a: Pt[], b: Pt[]): number {
  let m = Infinity;
  for (const [x, y] of a)
    for (const [u, v] of b) m = Math.min(m, Math.hypot(x - u, y - v));
  return m;
}
const subpaths = (d: unknown) => flatten(String(d)).map((p) => p.pts);

describe('Tools alt: the ruler and pencil scissor apart 10° about their crossing, the ruler’s ticks sliding', () => {
  // The pencil's side lines (its walls' outer and hollow edges), at rest: the top end's, then the bottom end's.
  const SIDES: [Pt, Pt][] = [
    [
      [29.4, 9.7],
      [23.1, 16],
    ],
    [
      [22.4, 2.7],
      [16, 8.9],
    ],
    [
      [28, 8.2],
      [21.7, 14.5],
    ],
    [
      [23.8, 4],
      [17.5, 10.3],
    ],
    [
      [2, 22.9],
      [8.9, 16],
    ],
    [
      [9.1, 30],
      [16, 23.1],
    ],
    [
      [4, 23.8],
      [10.3, 17.5],
    ],
    [
      [8.2, 28],
      [14.5, 21.7],
    ],
  ];
  const onLine = (p: Pt, [a, b]: [Pt, Pt]) =>
    Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) /
      Math.hypot(b[0] - a[0], b[1] - a[1]) <
    2e-3;
  // Across the ruler, in its own frame (its axis x = y): its hollow ends at 4.2 / √2, its outer wall at 7.1 / √2.
  const across = ([x, y]: Pt) => Math.abs(x - y) / Math.SQRT2;

  it('turns the ruler rigidly −10° and the pencil +10° (clockwise on screen), each about (16, 16)', () => {
    expect(TOOLS_ALT_TURN).toBe(10);
    const rest = ToolsAlt.geo({ h: 0 });
    for (const h of H) {
      const at = ToolsAlt.geo({ h });
      const a = TOOLS_ALT_TURN * h;
      // The ruler: every point Carbon's, turned −a.
      const [r0, r1] = [pts(rest.ruler.d), pts(at.ruler.d)];
      expect(r1.length).toBe(r0.length);
      r0.forEach((p, i) =>
        expect(near(r1[i], turn(-a)(p)), `ruler ${i} h=${h}`).toBe(true)
      );
      // The pencil: every point is Carbon's turned +a, or a cut end: on one of its turned side lines (so its walls
      // keep their 2px) and on the turned ruler's edge (its walls 1px under the ruler's outer wall, its hollow on
      // the line Carbon ends it on).
      const [p0, p1] = [pts(rest.pencil.d), pts(at.pencil.d)];
      expect(p1.length).toBe(p0.length);
      let cuts = 0;
      p0.forEach((p, i) => {
        if (near(p1[i], turn(a)(p))) return;
        cuts++;
        expect(
          SIDES.some(([u, v]) => onLine(p1[i], [turn(a)(u), turn(a)(v)])),
          `pencil ${i} h=${h} on a side`
        ).toBe(true);
        const d = across(turn(a)(p1[i]));
        expect(
          Math.abs(d - (7.1 / Math.SQRT2 - 1)) < 2e-3 ||
            Math.abs(d - 7.2 / Math.SQRT2) < 2e-3,
          `pencil ${i} h=${h} on the ruler (${d})`
        ).toBe(true);
      });
      if (h > 0) expect(cuts).toBe(8);
    }
  });

  it('never shows the pencil inside the ruler’s hollow', () => {
    for (const h of H) {
      for (const p of pts(ToolsAlt.geo({ h }).pencil.d))
        expect(across(turn(TOOLS_ALT_TURN * h)(p)), `h=${h}`).toBeGreaterThan(
          4.2 / Math.SQRT2 + 1
        );
    }
  });

  it('slides the ticks 4px along the turned ruler (Ruler’s), a fourth coming in from under its upper left end', () => {
    expect(TOOLS_ALT_TICK_SLIDE).toBe(4);
    // In the ruler's own frame, a tick's centre-side edge (on the ruler's axis, x = y) at x + y:
    const along = (h: number) => {
      const q = pts(ToolsAlt.geo({ h }).ticks.d).map(turn(TOOLS_ALT_TURN * h));
      return [
        ...new Set(
          q
            .filter(([x, y]) => Math.abs(x - y) < 0.2)
            .map(([x, y]) => +(x + y).toFixed(2))
        ),
      ].sort((a, b) => a - b);
    };
    expect(along(0)).toEqual([19.2, 22, 30.4, 33.2, 41.9, 44.7]);
    const slid = 4 * Math.SQRT2;
    // The three ticks slid 4px along; the incoming one cut at the hollow's end (x + y = 12.2).
    const full = along(1);
    for (const v of [19.2, 22, 30.4, 33.2, 41.9, 44.7])
      expect(
        full.some((w) => Math.abs(w - (v + slid)) < 0.01),
        `${v}`
      ).toBe(true);
    expect(Math.min(...full)).toBeGreaterThan(12.2 - 1e-3);
    // Nothing of a tick outside the hollow's length, at any frame.
    for (const h of H) {
      for (const [x, y] of pts(ToolsAlt.geo({ h }).ticks.d).map(
        turn(TOOLS_ALT_TURN * h)
      )) {
        expect(x + y).toBeGreaterThan(12.2 - 1e-3);
        expect(x + y).toBeLessThan(51.8);
      }
    }
  });
});

describe('Crossroads: the signs and the post’s top rise 2px (its foot holds), and each board reaches 2px the way it points', () => {
  it('moves every point but the post’s foot 2px up, the upper board’s right and the lower board’s left 2px more', () => {
    expect([CROSSROADS_REACH, CROSSROADS_LIFT]).toEqual([2, 2]);
    const [rest, full] = [
      pts(Crossroads.geo({ h: 0 }).signs.d),
      pts(Crossroads.geo({ h: 1 }).signs.d),
    ];
    expect(full.length).toBe(rest.length);
    rest.forEach(([x, y], i) => {
      const [X, Y] = full[i];
      expect(Y - y, `point ${i} (${x}, ${y})`).toBeCloseTo(
        y === 30 ? 0 : -2,
        3
      );
      const dx = x > 17 ? 2 : x < 15 ? -2 : 0;
      expect(X - x, `point ${i} (${x}, ${y})`).toBeCloseTo(dx, 3);
    });
    const b = bounds(Crossroads.geo({ h: 1 }));
    expect([b.x0, b.y0, b.x1, b.y1].map((v) => +v.toFixed(3))).toEqual([
      0, 0, 32, 30,
    ]);
  });
});

describe('IBM Watson Discovery: the magnifier’s lens hover, the rows scrolling half their repeat', () => {
  it('scrolls the top and bottom rows 10px and the middle row 4px, cut to x 2–14: at full hover they trade Carbon’s compositions', () => {
    expect(DISCOVERY_SCROLL).toEqual({ outer: 10, middle: 4 });
    const lines = (h: number) => IbmWatsonDiscovery.geo({ h }).lines.d;
    expect(crossings(lines(0), 10)).toEqual([2, 4, 6, 14]);
    expect(crossings(lines(0), 14)).toEqual([2, 10, 12, 14]);
    // Top and bottom rows: a big dash on the left (2–10), the small dot on the right (12–14); the middle row a dot on the left (2–4), its dash moved right (6–14). Every piece whole.
    expect(crossings(lines(1), 10)).toEqual([2, 10, 12, 14]);
    expect(crossings(lines(1), 14)).toEqual([2, 4, 6, 14]);
    expect(crossings(lines(1), 18)).toEqual([2, 10, 12, 14]);
    for (const h of H) {
      for (const [x] of pts(lines(h)))
        expect(x >= 2 - 1e-3 && x <= 14 + 1e-3, `h=${h} x=${x}`).toBe(true);
    }
  });

  it('grows the open ring 0.5px at its weight and turns the handle 15° clockwise about the lens centre', () => {
    const lens = (h: number) => IbmWatsonDiscovery.geo({ h }).lens.d;
    const handle = (h: number) => IbmWatsonDiscovery.geo({ h }).handle.d;
    // Across the lens centre's row, right of it: the ring's wall.
    expect(crossings(lens(0), 14).filter((x) => x > 13)).toEqual([23, 25]);
    expect(crossings(lens(1), 14).filter((x) => x > 13)).toEqual([23.5, 25.5]);
    // The handle's far corner: 0.5px further out, turned 15°.
    const far = (h: number) =>
      pts(handle(h)).reduce((m, p) =>
        Math.hypot(p[0] - 13, p[1] - 14) > Math.hypot(m[0] - 13, m[1] - 14)
          ? p
          : m
      );
    const [a, b] = [far(0), far(1)];
    expect(a).toEqual([30, 28.6]);
    expect(
      Math.hypot(b[0] - 13, b[1] - 14) - Math.hypot(a[0] - 13, a[1] - 14)
    ).toBeCloseTo(0.5, 2);
    const ang = (p: Pt) => (Math.atan2(p[1] - 14, p[0] - 13) * 180) / Math.PI;
    expect(ang(b) - ang(a)).toBeCloseTo(15, 0);
  });

  it('keeps the rows clear of the lens at every frame', () => {
    let least = Infinity;
    for (const h of H) {
      const at = IbmWatsonDiscovery.geo({ h });
      least = Math.min(least, gap(pts(at.lines.d), pts(at.lens.d)));
    }
    expect(least).toBeGreaterThan(1.4);
  });
});

describe('At: the “a” grows 15% at its weight, the tail extends 4px', () => {
  const g = AT_GROW * 4.5;
  it('extends the tail’s end 4px along its line', () => {
    expect([AT_REACH, AT_GROW]).toEqual([4, 0.15]);
    expect(Math.max(...crossings(At.geo({ h: 0 }).at.d, 29))).toBeCloseTo(
      23,
      3
    );
    expect(Math.max(...crossings(At.geo({ h: 1 }).at.d, 29))).toBeCloseTo(
      27,
      3
    );
  });

  it('moves every edge of the bowl, its hollow and the stem 0.675px out, so their walls hold', () => {
    // Across the bowl's middle: the ring's walls hold; the bowl's left wall and the stem move out.
    const [r0, r1] = [
      crossings(At.geo({ h: 0 }).at.d, 16.5),
      crossings(At.geo({ h: 1 }).at.d, 16.5),
    ];
    expect(r0.slice(0, 6)).toEqual([3, 5, 10, 12, 19, 21]);
    // (The last two are where the hook leaves the ring, which bends as its other end rides out.)
    expect(r1.slice(0, 6).map((v, i) => +(v - r0[i]).toFixed(3))).toEqual(
      [0, 0, -g, -g, g, g].map((v) => +v.toFixed(3))
    );
    // Down the bowl's middle: its top and bottom walls (Carbon's 1.94) move out and hold.
    const down = (h: number) => crossings(At.geo({ h }).at.d, 15.5, true);
    const [r, f1] = [down(0), down(1)];
    expect(f1[2] - r[2]).toBeCloseTo(-g, 3);
    expect(f1[3] - f1[2]).toBeCloseTo(r[3] - r[2], 3);
    expect(f1[5] - r[5]).toBeCloseTo(g, 3);
    expect(f1[5] - f1[4]).toBeCloseTo(r[5] - r[4], 3);
  });
});

describe('Sql: the word grows 15% about (16, 16) at its weight', () => {
  const s = 1 + STYLE_GROW;
  const at = (c: number) => 16 + (c - 16) * s;
  it('moves each wall’s centreline with the growth and keeps its 2px', () => {
    // Across the columns (the S's upper left, the Q's sides, the L's stem).
    const word = (h: number) => {
      const g = Sql.geo({ h });
      return [g.s.d, g.q.d, g.l.d].join('');
    };
    expect(crossings(word(0), 13)).toEqual([2, 4, 12, 14, 18, 20, 22, 24]);
    const full = Sql.geo({ h: 1 });
    expect(crossings(word(1), 13)).toEqual(
      [3, 13, 19, 23]
        .flatMap((c) => [at(c) - 1, at(c) + 1])
        .map((v) => +v.toFixed(3))
    );
    // Down the S's bars.
    expect(crossings(Sql.geo({ h: 0 }).s.d, 6, true)).toEqual([
      9, 11, 15, 17, 21, 23,
    ]);
    expect(crossings(full.s.d, 6, true)).toEqual(
      [10, 16, 22]
        .flatMap((c) => [at(c) - 1, at(c) + 1])
        .map((v) => +v.toFixed(3))
    );
    const b = bounds(full);
    expect([b.x0, b.y0, b.x1, b.y1].map((v) => +v.toFixed(2))).toEqual([
      0.05, 8.1, 32.1, 28.5,
    ]);
  });
});

describe('Software resource cluster: the diamonds’ tips move 2px out as they grow, their spacing held', () => {
  it('grows each diamond 1px (half-diagonal 5 → 6) as its centre moves 1px out, at its 2px wall', () => {
    expect([RESOURCE_CLUSTER_SPREAD, CLUSTER_DIAMOND_GROW]).toEqual([2, 0.5]);
    const d = (h: number) => SoftwareResourceCluster.geo({ h }).diamonds.d;
    // Across the middle: the left and right diamonds, outline and hollow; the inner tips hold, the outer ones move 2px.
    expect(crossings(d(0), 16)).toEqual([3, 5, 11, 13, 19, 21, 27, 29]);
    expect(crossings(d(1), 16)).toEqual([1, 3, 11, 13, 19, 21, 29, 31]);
    expect(crossings(d(1), 16, true)).toEqual([1, 3, 11, 13, 19, 21, 29, 31]);
  });

  it('keeps the space between neighbours (4.24px) at every frame', () => {
    for (const h of H) {
      const q = subpaths(SoftwareResourceCluster.geo({ h }).diamonds.d);
      // Subpaths: [down outline, hollow, right outline, hollow, up …, left …]: down beside right.
      expect(gap(q[0], q[2]), `h=${h}`).toBeCloseTo(
        gap(
          subpaths(SoftwareResourceCluster.geo({ h: 0 }).diamonds.d)[0],
          subpaths(SoftwareResourceCluster.geo({ h: 0 }).diamonds.d)[2]
        ),
        1
      );
    }
  });
});

describe('Web services cluster: the open hexagon grows 2px, the diamonds grow and spread inside it', () => {
  it('grows each diamond 0.5px (half-diagonal 4 → 4.5) as its centre moves 0.5px out: its tip 1px', () => {
    expect([WEB_CLUSTER_SPREAD, CLUSTER_DIAMOND_GROW]).toEqual([1, 0.5]);
    const at = (h: number) =>
      crossings(WebServicesCluster.geo({ h }).diamonds.d, 16);
    expect(at(0)).toEqual([6, 8.414, 11.586, 14, 18, 20.414, 23.586, 26]);
    expect(at(1)).toEqual([5, 7.414, 11.586, 14, 18, 20.414, 24.586, 27]);
  });

  it('keeps the hexagon’s walls 2px and moves every edge 2px out', () => {
    expect(WEB_HEXAGON_GROW).toBe(2);
    expect(crossings(WebServicesCluster.geo({ h: 0 }).hexagon.d, 16)).toEqual([
      3, 5, 27, 29,
    ]);
    expect(crossings(WebServicesCluster.geo({ h: 1 }).hexagon.d, 16)).toEqual([
      1, 3, 29, 31,
    ]);
    // Top and bottom: the corner's round outer edge, 1px out of its centreline vertex, which moves 2 × 1.158 out (its miter).
    const [rest, full] = [
      bounds({ hexagon: WebServicesCluster.geo({ h: 0 }).hexagon }),
      bounds({ hexagon: WebServicesCluster.geo({ h: 1 }).hexagon }),
    ];
    expect(rest.y0).toBeCloseTo(1, 3);
    expect(rest.y1).toBeCloseTo(31, 3);
    expect(full.y0).toBeCloseTo(1 - 2 * 1.158, 2);
    expect(full.y1).toBeCloseTo(31 + 2 * 1.158, 2);
  });

  it('holds the diamonds’ spacing to each other, and never brings them nearer the wall, at every frame', () => {
    const rest = WebServicesCluster.geo({ h: 0 });
    const [q0, w0] = [subpaths(rest.diamonds.d), pts(rest.hexagon.d)];
    const [between, wall] = [gap(q0[0], q0[2]), gap(pts(rest.diamonds.d), w0)];
    for (const h of H) {
      const at = WebServicesCluster.geo({ h });
      const q = subpaths(at.diamonds.d);
      expect(gap(q[0], q[2]), `between h=${h}`).toBeCloseTo(between, 1);
      expect(
        gap(pts(at.diamonds.d), pts(at.hexagon.d)),
        `wall h=${h}`
      ).toBeGreaterThan(wall - 0.1);
    }
  });
});

describe('Circle solid: the disc grows 1px in radius (Circle filled’s)', () => {
  it('grows r 14 → 15 about the centre', () => {
    const b = (h: number) => bounds(CircleSolid.geo({ h }));
    expect(
      [b(0).x0, b(0).y0, b(0).x1, b(0).y1].map((v) => +v.toFixed(3))
    ).toEqual([2, 2, 30, 30]);
    expect(
      [b(1).x0, b(1).y0, b(1).x1, b(1).y1].map((v) => +v.toFixed(3))
    ).toEqual([1, 1, 31, 31]);
  });
});
