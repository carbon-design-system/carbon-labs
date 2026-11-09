/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The toned warning, filled like Carbon: with `tone`, the warning mark is a solid yellow triangle (the
 * outline's outer edge, so the same footprint, position and cut) with its
 * "!" knocked out and painted dark (WARN_BANG), Carbon's WarningAltFilled at
 * the mark's size. Checked here, for every process icon that takes a
 * warning:
 *  - the rest geometry at 16, 20, 24 and 32 (the triangle, the "!" and its
 *    one-pixel floors, the hole, and the cut, which is the untoned one's);
 *  - the contrast of the yellow against the "!" and the four themes;
 *  - untoned, nothing changed: every frame of every warning transition
 *    (and an action's hand-off) is the same as before, byte for byte;
 *  - motion: the fill and the "!" arrive and leave as one mark, on the
 *    untoned mark's frames, inside its footprint; the cuts still grow as
 *    growCheck.ts asks, the hand-off included;
 *  - forced colors: the "!" path goes and its hole shows the page.
 */
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  manualScheduler,
  playAction,
  setScheduler,
  StatusController,
  stillShapes,
  type Shapes,
  type StatusIconSpec,
  type StatusInput,
} from '../src/engine';
import {
  cutFrame,
  flattenPath,
  inkOf,
  STATUSES,
  TONE,
  WARN_BANG,
  type StatusFrame,
} from '../src/status';
import { FORCED_COLORS_CSS } from '../src/forcedColors';
import { PROCESS_ICONS, STATUS_ICONS } from '../src/icons/statusIcons';
import {
  changed,
  growthProblems,
  IN_SLACK,
  OUT_SLACK,
  STEP_MAX,
} from './growCheck';

afterEach(() => setScheduler(null));

type Pt = [number, number];
const SIZES = [16, 20, 24, 32] as const;
const ICONS = PROCESS_ICONS.filter((n) =>
  (STATUS_ICONS[n].statuses as readonly string[]).includes('warning')
).map((n) => [n, STATUS_ICONS[n] as unknown as StatusIconSpec] as const);
/** The corner warning's centreline (status.ts CORNER_TRIANGLE; every process icon's mark sits in the br slot). */
const TRI: Pt[] = [
  [24, 19],
  [19, 29],
  [29, 29],
];
const FRAME = 1000 / 60;

// ── Reading shapes ────────────────────────────────────────────────────────────

const rings = (d: string) => flattenPath(d).map((s) => s.pts as Pt[]);
const bbox = (pts: Pt[]) => [
  Math.min(...pts.map((p) => p[0])),
  Math.min(...pts.map((p) => p[1])),
  Math.max(...pts.map((p) => p[0])),
  Math.max(...pts.map((p) => p[1])),
];
function insideEvenOdd([x, y]: Pt, rs: Pt[][]): boolean {
  let n = 0;
  for (const r of rs) {
    for (let i = 0; i < r.length; i++) {
      const [a, b] = [r[i], r[(i + 1) % r.length]];
      if (
        a[1] <= y !== b[1] <= y &&
        x < a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])
      ) {
        n++;
      }
    }
  }
  return n % 2 === 1;
}
/** Signed distance from p to the centreline triangle's edges (positive outside the nearest edge's line, inward negative). */
function edgeDist(p: Pt, tri: Pt[] = TRI): number {
  let out = -Infinity;
  for (let i = 0; i < 3; i++) {
    const [a, b] = [tri[i], tri[(i + 1) % 3]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; // outward (apex, then base corners: counter-clockwise on screen)
    out = Math.max(out, (p[0] - a[0]) * nx + (p[1] - a[1]) * ny);
  }
  return out;
}
/** Distance from p outside the centreline triangle to its boundary (a vertex or an edge). */
function outsideDist(p: Pt, tri: Pt[] = TRI): number {
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const [a, b] = [tri[i], tri[(i + 1) % 3]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
      )
    );
    best = Math.min(
      best,
      Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)
    );
  }
  return best;
}

/** The "!" as drawn: the bar (x0 y0 x1 y1) and the dot (centre, radius), from the status-bang path. */
function bangOf(d: string): { bar: number[] | null; dot: Pt; r: number } {
  const rs = rings(d);
  const isBar = (r: Pt[]) =>
    r.length === 4 ||
    (r.length === 5 && r[0][0] === r[4][0] && r[0][1] === r[4][1]);
  const barRing = rs.find(isBar);
  const dotPts = rs.filter((r) => !isBar(r)).flat();
  const [x0, y0, x1, y1] = bbox(dotPts);
  return {
    bar: barRing ? bbox(barRing) : null,
    dot: [(x0 + x1) / 2, (y0 + y1) / 2],
    r: (x1 - x0) / 2,
  };
}

// ── The design, restated ──────────────────────────────────────────────────────

/** Carbon's WarningAltFilled "!" at 10/25 (bar 2.25 × 9, gap 2, dot r 1.5, its foot 4 above the outer base), floors of a CSS pixel. */
function expectedBang(size: number) {
  const q = 32 / size;
  const bw = Math.max(0.9, q);
  const r = Math.max(0.6, (bw * 1.5) / 2.25);
  const gap = Math.max(0.8, q);
  const dotY = 30 - 1.6 - r;
  const y1 = dotY - r - gap;
  return {
    bar: [24 - bw / 2, y1 - 3.6, 24 + bw / 2, y1],
    dot: [24, dotY] as Pt,
    r,
    bw,
    gap,
  };
}

// ── Contrast (WCAG 2) ─────────────────────────────────────────────────────────

const lum = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const YELLOW = '#f1c21b'; // --cds-support-warning on every Carbon theme
const THEMES = {
  white: '#ffffff',
  g10: '#f4f4f4',
  g90: '#262626',
  g100: '#161616',
};

// ── Driving a controller ──────────────────────────────────────────────────────

const turn = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};
/** Every painted frame from `from` to `to` (and the cut frames, for growCheck). */
async function run(
  spec: StatusIconSpec,
  size: number,
  from: StatusInput,
  to: StatusInput,
  ms = 450
): Promise<{ painted: Shapes[]; cut: number[] }> {
  const clock = manualScheduler();
  setScheduler(clock);
  const painted: Shapes[] = [];
  const cut: number[] = [];
  const c = new StatusController(
    spec,
    (s) => painted.push(s),
    size,
    from,
    true
  );
  c.repaint();
  const take = () => {
    const e = (
      c as unknown as {
        engine: { frame: StatusFrame; placement: never } | null;
      }
    ).engine;
    if (!e) {
      return cut.push(0);
    }
    const geo = (spec as unknown as { geo: never }).geo;
    const f = cutFrame(geo, e.placement, e.frame, size);
    const raw = cutFrame(
      geo,
      { ...(e.placement as object), fix: undefined } as never,
      e.frame,
      size
    ).base;
    cut.push(changed(raw, f.cut));
  };
  take();
  c.set(to, true);
  for (let t = 0; t < ms; t += FRAME) {
    clock.advance(FRAME);
    await turn();
    take();
  }
  c.destroy();
  setScheduler(null);
  await new Promise<void>((r) => setTimeout(r, 0));
  return { painted, cut };
}
/** An action's hand-off to a warning (Save, Copy, Printer…: "then warning"), every painted frame, and the cut's ink. */
async function handOff(
  spec: StatusIconSpec,
  size: number,
  tone: boolean,
  ms = 700
): Promise<{ painted: Shapes[]; cut: number[] }> {
  const clock = manualScheduler();
  setScheduler(clock);
  const painted: Shapes[] = [];
  const cut: number[] = [];
  const c = new StatusController(
    spec,
    (s) => painted.push(s),
    size,
    { tone },
    true
  );
  c.repaint();
  void playAction(
    {
      target: c,
      setStatus: (s, tail) => c.set({ status: s, tone }, true, tail),
    },
    { then: { status: 'warning' } }
  );
  for (let t = 0; t <= ms; t += FRAME) {
    const e = (
      c as unknown as {
        engine: { frame: StatusFrame; placement: never } | null;
      }
    ).engine;
    if (e) {
      const geo = (spec as unknown as { geo: never }).geo;
      const f = cutFrame(geo, e.placement, e.frame, size);
      const raw = cutFrame(
        geo,
        { ...(e.placement as object), fix: undefined } as never,
        e.frame,
        size
      ).base;
      cut.push(changed(raw, f.cut));
    }
    clock.advance(FRAME);
    await turn();
  }
  c.destroy();
  setScheduler(null);
  return { painted, cut };
}

/** The warning transitions an icon takes (toned and not): in, out, and to and from each other status it has. */
function warningRuns(
  spec: StatusIconSpec
): [StatusInput, StatusInput, 'in' | 'out' | 'swap'][] {
  const others = (spec.statuses as readonly string[]).filter(
    (s) => s !== 'warning' && s !== 'notification'
  );
  return [
    [{}, { status: 'warning' }, 'in'],
    [{ status: 'warning' }, {}, 'out'],
    ...others.flatMap(
      (s) =>
        [
          [{ status: 'warning' }, { status: s }, 'swap'],
          [{ status: s }, { status: 'warning' }, 'swap'],
        ] as [StatusInput, StatusInput, 'swap'][]
    ),
  ];
}

// ── Rest ──────────────────────────────────────────────────────────────────────

describe.each(ICONS)('%s: the toned warning at rest', (name, spec) => {
  it.each(SIZES)(
    '@%i: a filled triangle in the support yellow, the "!" knocked out and painted dark; the cut is the untoned one',
    (size) => {
      const toned = stillShapes(spec, { status: 'warning', tone: true }, size);
      const plain = stillShapes(spec, { status: 'warning' }, size);
      const warn = toned['status-warn'];
      const bang = toned['status-bang'];
      expect(warn.fill).toBe(TONE.warning);
      expect(warn.fillRule).toBe('evenodd');
      expect(warn.stroke).toBe('none');
      expect(bang.fill).toBe(WARN_BANG);
      expect(String(bang.d)).not.toBe('');
      // The triangle: the untoned outline's outer edge (1 out from the centreline, round corners), so the same footprint.
      const [outer, ...holes] = rings(String(warn.d));
      for (const p of outer) {
        expect(outsideDist(p), `${name} @${size} outer ${p}`).toBeCloseTo(1, 1);
      }
      const [x0, y0, x1, y1] = bbox(outer);
      [x0, y0, x1, y1].forEach((v, i) =>
        expect(v, `${name} @${size} bbox`).toBeCloseTo([18, 18, 30, 30][i], 1)
      );
      // The "!": its hole in the fill is the dark path, exactly.
      expect(String(warn.d).endsWith(String(bang.d))).toBe(true);
      expect(holes.length).toBe(rings(String(bang.d)).length);
      // Carbon's glyph at 10/25, with its one-pixel floors.
      const want = expectedBang(size);
      const got = bangOf(String(bang.d));
      expect(got.bar!.map((v) => +v.toFixed(3))).toEqual(
        want.bar.map((v) => +v.toFixed(3))
      );
      expect(got.dot[0]).toBeCloseTo(want.dot[0], 3);
      expect(got.dot[1]).toBeCloseTo(want.dot[1], 3);
      expect(got.r).toBeCloseTo(want.r, 2);
      // Legible: the bar and gap at least a CSS pixel; the "!" clear of the triangle's edges by a quarter pixel or more.
      const px = 32 / size;
      expect(got.bar![2] - got.bar![0]).toBeGreaterThanOrEqual(px - 1e-6);
      expect(got.dot[1] - got.r - got.bar![3]).toBeGreaterThanOrEqual(
        px - 1e-3
      );
      for (const corner of [
        [got.bar![0], got.bar![1]],
        [got.bar![2], got.bar![1]],
      ] as Pt[]) {
        expect(
          -(edgeDist(corner) - 1),
          `${name} @${size} bar top`
        ).toBeGreaterThanOrEqual(0.25 * px);
      }
      expect(30 - (got.dot[1] + got.r)).toBeCloseTo(1.6, 2);
      // Everything but the mark is the untoned drawing: the cut round it hasn't moved.
      for (const k of Object.keys(plain)) {
        if (!k.startsWith('status-')) {
          expect(toned[k], `${name} @${size} ${k}`).toEqual(plain[k]);
        }
      }
      // Untoned: the outline in currentColor, and no "!".
      expect(plain['status-warn'].stroke).toBe('currentColor');
      expect(plain['status-warn'].fill).toBe('none');
      expect(plain['status-bang'].d).toBe('');
    }
  );
});

// ── Contrast ──────────────────────────────────────────────────────────────────

describe('contrast', () => {
  it('the dark "!" carries it: about 12.5:1 on the yellow; the yellow on the themes as Carbon has it', () => {
    const report = {
      bangOnYellow: contrast(WARN_BANG, YELLOW),
      ...Object.fromEntries(
        Object.entries(THEMES).map(([k, v]) => [
          `yellowOn_${k}`,
          contrast(YELLOW, v),
        ])
      ),
    };
    console.log(
      `toned warning contrast: ${Object.entries(report)
        .map(([k, v]) => `${k} ${v.toFixed(2)}:1`)
        .join(', ')}`
    );
    expect(report.bangOnYellow).toBeGreaterThanOrEqual(4.5); // well over 1.4.11's 3:1 (and text's 4.5:1)
    expect(report.bangOnYellow).toBeCloseTo(12.5, 0);
    // The yellow alone is under 3:1 on the light themes (why the "!" is dark), over it on the dark ones.
    expect(report.yellowOn_white).toBeLessThan(3);
    expect(report.yellowOn_g10).toBeLessThan(3);
    expect(report.yellowOn_g90).toBeGreaterThanOrEqual(3);
    expect(report.yellowOn_g100).toBeGreaterThanOrEqual(3);
  });
});

// ── Untoned: unchanged ───────────────────────────────────────────────────────

/**
 * Every untoned frame of every warning transition, at every size, for every process icon, and an action's hand-off
 * to a warning (Copy, Save, Printer): hashed without the "!" key (always empty untoned), 13,458 frames. Filling
 * the toned warning leaves every untoned frame as it was; a change to the motion tokens, the status clocks or the
 * pending mark moves frames, and the digest is taken again with it.
 */
const UNTONED_DIGEST =
  'c953b6166b7ae98520b602f06eeca075d87bd296d8e45c901b0a2589bd579845';

describe('untoned, nothing changed', () => {
  it('every frame of every warning transition and hand-off is byte-identical to before', async () => {
    const h = createHash('sha256');
    let frames = 0;
    const add = (s: Shapes) => {
      const { 'status-bang': bang, ...rest } = s;
      if (bang) {
        expect(bang.d).toBe('');
      }
      h.update(JSON.stringify(rest));
      frames++;
    };
    // The icons the digest was taken on: Activity took a status after, and its own checks cover it.
    for (const [, spec] of ICONS.filter(([n]) => n !== 'Activity')) {
      for (const size of SIZES) {
        for (const [from, to] of warningRuns(spec)) {
          (await run(spec, size, from, to)).painted.forEach(add);
        }
        add(stillShapes(spec, { status: 'warning' }, size));
      }
    }
    for (const n of ['Copy', 'Save', 'Printer'] as const) {
      for (const size of [16, 32]) {
        (
          await handOff(
            STATUS_ICONS[n] as unknown as StatusIconSpec,
            size,
            false
          )
        ).painted.forEach(add);
      }
    }
    const digest = h.digest('hex');
    console.log(`untoned warning frames: ${frames}, digest ${digest}`);
    expect(frames).toBeGreaterThan(5000);
    expect(digest).toBe(UNTONED_DIGEST);
  });
});

// ── Motion ────────────────────────────────────────────────────────────────────

/** Checks one toned frame against its untoned twin: one mark, on the same frames, inside the outline's footprint. */
function checkFrame(toned: Shapes, plain: Shapes, size: number, what: string) {
  // The plain icon (no status layer yet, or handed back): the same drawing.
  if (!plain['status-warn'] || !toned['status-warn']) {
    expect(toned, what).toEqual(plain);
    return;
  }
  const [w, b, pw] = [
    String(toned['status-warn'].d ?? ''),
    String(toned['status-bang'].d ?? ''),
    String(plain['status-warn'].d ?? ''),
  ];
  // One mark: the fill and the "!" show together, on exactly the untoned mark's frames.
  expect(!!w, `${what}: fill vs "!"`).toBe(!!b);
  expect(!!w, `${what}: toned vs untoned`).toBe(!!pw);
  // Everything else is the untoned frame (the cut, the other marks).
  for (const k of Object.keys(plain)) {
    if (
      k !== 'status-warn' &&
      k !== 'status-bang' &&
      !k.startsWith('status-')
    ) {
      expect(toned[k], `${what} ${k}`).toEqual(plain[k]);
    }
  }
  if (!w) {
    return;
  }
  expect(w.endsWith(b), `${what}: hole`).toBe(true);
  // The fill is the outline's outer edge at the same scale: 1 out from the untoned frame's centreline.
  const tri = rings(pw)[0].slice(0, 3);
  for (const p of rings(w)[0]) {
    expect(outsideDist(p, tri), `${what}: footprint`).toBeCloseTo(1, 1);
  }
  // The "!" keeps its weights (constant weight) and stays inside the triangle, never running together.
  const want = expectedBang(size);
  const got = bangOf(b);
  expect(got.r, `${what}: dot`).toBeCloseTo(want.r, 2);
  for (const [x, y] of rings(b).flat()) {
    expect(edgeDist([x, y], tri), `${what}: inside`).toBeLessThan(1);
  }
  if (got.bar) {
    expect(got.bar[2] - got.bar[0], `${what}: bar`).toBeCloseTo(want.bw, 3);
    expect(got.dot[1] - got.r - got.bar[3], `${what}: gap`).toBeCloseTo(
      want.gap,
      3
    );
  }
}

describe.each(ICONS)('%s: the toned warning in motion', (name, spec) => {
  it.each([16, 32])(
    '@%i: in, out and swaps: one mark on the untoned frames, inside its footprint; the cut still grows from nothing',
    async (size) => {
      for (const [from, to, dir] of warningRuns(spec)) {
        const what = `${name} ${from.status ?? 'none'}→${to.status ?? 'none'} @${size}`;
        const toned = await run(
          spec,
          size,
          { ...from, tone: true },
          { ...to, tone: true }
        );
        const plain = await run(spec, size, from, to);
        expect(toned.painted.length, what).toBe(plain.painted.length);
        toned.painted.forEach((s, i) =>
          checkFrame(s, plain.painted[i], size, `${what} #${i}`)
        );
        expect(toned.cut).toEqual(plain.cut);
        // The cut is the untoned one (above), so it grows as statusGrow.test.ts checks it: every entrance and exit, and
        // each swap that suite takes (a status to the next in the icon's list; the others it doesn't hold to STEP_MAX).
        const list = spec.statuses as readonly string[];
        const checked =
          dir !== 'swap' ||
          list.indexOf(String(to.status)) ===
            list.indexOf(String(from.status)) + 1;
        if (checked) {
          expect(growthProblems(toned.cut, dir, what).join('\n')).toBe('');
        }
        // The mark actually showed (and, leaving, went).
        const shows = toned.painted.map((s) => !!s['status-bang']?.d);
        expect(shows.some(Boolean), what).toBe(true);
        if (dir === 'in') {
          expect(shows.at(-1), what).toBe(true);
        }
        if (dir === 'out') {
          expect(shows.at(-1), what).toBe(false);
        }
      }
    }
  );
});

describe.each(['Copy', 'Save', 'Printer', 'Share'] as const)(
  '%s: an action handing off to a toned warning',
  (name) => {
    it.each([16, 32])(
      '@%i: the cut grows from nothing; the fill and the "!" arrive as one, on the untoned frames',
      async (size) => {
        const spec = STATUS_ICONS[name] as unknown as StatusIconSpec;
        const toned = await handOff(spec, size, true);
        const plain = await handOff(spec, size, false);
        expect(toned.painted.length).toBe(plain.painted.length);
        toned.painted.forEach((s, i) =>
          checkFrame(
            s,
            plain.painted[i],
            size,
            `${name} hand-off @${size} #${i}`
          )
        );
        expect(toned.painted.at(-1)!['status-bang'].d).not.toBe('');
        // The cut is the untoned one, frame for frame (so this change can't move it), and grows from nothing. Printer's
        // warning hand-off has one frame taking 49% of its cut (as on main: its tail's paper meets the zone), like Share's
        // hand-off to success (growCheck.ts KNOWN_GROWTH, 0.49).
        expect(toned.cut).toEqual(plain.cut);
        const limits = {
          stepMax: name === 'Printer' ? 0.5 : STEP_MAX,
          inSlack: IN_SLACK,
          outSlack: OUT_SLACK,
        };
        expect(
          growthProblems(
            toned.cut,
            'in',
            `${name} hand-off to warning @${size}`,
            limits
          ).join('\n')
        ).toBe('');
      }
    );
  }
);

// ── Forced colors ─────────────────────────────────────────────────────────────

describe('forced colors', () => {
  it('the yellow goes to currentColor and the "!" path goes, so its hole shows the page against the triangle', () => {
    expect(FORCED_COLORS_CSS).toMatch(
      /\[fill\^="var\("\] \{ fill: currentColor; \}/
    );
    expect(FORCED_COLORS_CSS).toContain('[data-k$="-bang"] { fill: none; }');
    for (const size of SIZES) {
      const s = stillShapes(
        STATUS_ICONS.Save as unknown as StatusIconSpec,
        { status: 'warning', tone: true },
        size
      );
      // The fill is caught by the var( rule; the "!" isn't a var( paint (it is hidden by key instead).
      expect(String(s['status-warn'].fill).startsWith('var(')).toBe(true);
      expect(String(s['status-bang'].fill).startsWith('var(')).toBe(false);
      // The fill paints round the "!", not under it: the bar's and dot's centres are holes (even-odd).
      const ink = inkOf(s['status-warn']);
      if (typeof ink === 'string') {
        throw new Error(ink);
      }
      expect(ink.evenodd).toBe(true);
      const b = bangOf(String(s['status-bang'].d));
      const barMid: Pt = [
        (b.bar![0] + b.bar![2]) / 2,
        (b.bar![1] + b.bar![3]) / 2,
      ];
      expect(insideEvenOdd(barMid, ink.rings)).toBe(false);
      expect(insideEvenOdd(b.dot, ink.rings)).toBe(false);
      // …and the triangle round them is ink.
      expect(
        insideEvenOdd(
          [barMid[0] - b.bar![2] + b.bar![0] - 0.5, barMid[1] + 1],
          ink.rings
        )
      ).toBe(true);
    }
    expect(STATUSES).toContain('warning');
  });
});
