/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  arriveTogether,
  check,
  continuous,
  gapHolds,
  matchingRows,
  noLongFrames,
  notCollapsed,
  nothingAbove,
  outlierShare,
  physicalEdge,
  reducedPath,
  settleFrame,
  staysInside,
  still,
  wholePixels,
} from '../src/invariants.js';

/** A box from its left, top, width and height. */
const box = (left, top, width, height, opacity = 1) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  opacity,
});

/** A run from per-frame element maps, 60 Hz. */
const runOf = (frames, extra = {}) => ({
  dir: 'ltr',
  dpr: 2,
  marks: [],
  samples: frames.map((el, i) => ({
    t: i * 16.7,
    at: i * 16.7,
    dt: 16.7,
    scroll: { x: 0, y: el.scrollY ?? 0 },
    el,
  })),
  ...extra,
});

/** A solid RGBA region, optionally with rows of another color. */
const region = (width, height, rgb, rows = {}) => {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const c = rows[y] ?? rgb;
    for (let x = 0; x < width; x++) {
      data.set([...c, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
};

describe('physicalEdge', () => {
  it('resolves start and end by direction', () => {
    expect(physicalEdge('start')).toBe('left');
    expect(physicalEdge('end', 'rtl')).toBe('left');
    expect(physicalEdge('top', 'rtl')).toBe('top');
    expect(() => physicalEdge('middle')).toThrow();
  });
});

describe('gapHolds', () => {
  // A page ending where a panel starts, less a 16px gap.
  const frames = (gaps) =>
    gaps.map((g, i) => ({
      page: box(0, 0, 1000 - i * 10, 800),
      panel: box(1000 - i * 10 + g, 0, 400, 800),
    }));

  it('passes a gap that holds', () => {
    expect(
      gapHolds(runOf(frames([16, 16, 16])), {
        a: 'page',
        aEdge: 'end',
        b: 'panel',
        bEdge: 'start',
        gap: 16,
      })
    ).toEqual([]);
  });

  it('reports each frame a gap grows instead of holding', () => {
    const v = gapHolds(runOf(frames([0, 8, 16])), {
      a: 'page',
      aEdge: 'end',
      b: 'panel',
      bEdge: 'start',
      gap: 16,
    });
    expect(v.map((x) => x.frame)).toEqual([0, 1]);
    expect(v[0].detail).toContain('0px, not 16px');
  });

  it('reads the gap along the reading direction right to left', () => {
    const run = runOf([
      { page: box(416, 0, 1000, 800), panel: box(0, 0, 400, 800) },
    ]);
    run.dir = 'rtl';
    expect(
      gapHolds(run, {
        a: 'page',
        aEdge: 'end',
        b: 'panel',
        bEdge: 'start',
        gap: 16,
      })
    ).toEqual([]);
  });

  it('skips frames where either box is missing, hidden or too small', () => {
    const run = runOf([
      { page: box(0, 0, 1000, 800), panel: null },
      { page: box(0, 0, 1000, 800), panel: box(1100, 0, 400, 800, 0) },
      { page: box(0, 0, 1000, 800), panel: box(1100, 0, 10, 800) },
    ]);
    expect(
      gapHolds(run, {
        a: 'page',
        aEdge: 'end',
        b: 'panel',
        bEdge: 'start',
        gap: 16,
        minSize: 24,
      })
    ).toEqual([]);
  });
});

describe('continuous', () => {
  const tops = (ys, scrolls = []) =>
    runOf(ys.map((y, i) => ({ bar: box(0, y, 100, 34), scrollY: scrolls[i] })));

  it('passes a steady glide', () => {
    expect(
      continuous(tops([100, 90, 80, 70]), {
        el: 'bar',
        edge: 'top',
        maxStep: 12,
      })
    ).toEqual([]);
  });

  it('reports a jump past the per-frame travel', () => {
    const v = continuous(tops([100, 90, 40, 30]), {
      el: 'bar',
      edge: 'top',
      maxStep: 12,
    });
    expect(v).toHaveLength(1);
    expect(v[0].frame).toBe(2);
  });

  it('allows the scroll’s own step for a box that rides it', () => {
    expect(
      continuous(tops([100, 40, 40], [0, 60, 60]), {
        el: 'bar',
        edge: 'top',
        maxStep: 4,
        withScroll: true,
      })
    ).toEqual([]);
  });

  it('reports a jump that comes straight back, the tell of a lagging frame', () => {
    const v = continuous(tops([72, 72, 104, 72, 72]), {
      el: 'bar',
      edge: 'top',
      maxStep: 100,
    });
    expect(v.map((x) => x.detail)).toEqual(['bar.top jumped 32px and back']);
  });

  it('scales the allowance with a long frame', () => {
    const run = tops([100, 76]);
    run.samples[1].dt = 33.4;
    expect(continuous(run, { el: 'bar', edge: 'top', maxStep: 12 })).toEqual(
      []
    );
  });
});

describe('outlierShare and matchingRows', () => {
  it('counts the pixels off the commonest color', () => {
    expect(outlierShare(region(10, 10, [240, 240, 240]))).toBe(0);
    expect(
      outlierShare(region(10, 10, [240, 240, 240], { 3: [20, 20, 20] }))
    ).toBeCloseTo(0.1);
    expect(outlierShare({ width: 0, height: 0, data: [] })).toBe(0);
  });

  it('counts the rows that match a reference', () => {
    const ref = region(4, 6, [10, 10, 10], { 0: [200, 0, 0] });
    expect(matchingRows(ref, ref)).toBe(6);
    expect(matchingRows(region(4, 6, [240, 240, 240]), ref)).toBe(0);
  });
});

describe('nothingAbove', () => {
  it('passes a band of one color and reports content showing in it', () => {
    const clean = region(100, 8, [244, 244, 244]);
    const text = region(100, 8, [244, 244, 244], { 4: [22, 22, 22] });
    const v = nothingAbove(
      {
        paint: [
          { band: clean, scrollY: 60 },
          { band: text, scrollY: 90 },
        ],
      },
      { docked: 'bar' }
    );
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ invariant: 'nothingAbove', frame: 1 });
    expect(v[0].detail).toContain('scroll 90');
  });
});

describe('notCollapsed', () => {
  it('reports a box thinning mid-motion, outside its own enter and exit', () => {
    const run = runOf(
      [34, 34, 2, 34, 10, 34].map((h) => ({ bar: box(0, 72, 600, h) }))
    );
    run.marks = [{ name: 'open', frame: 3, end: 4 }];
    const v = notCollapsed(run, { el: 'bar', except: ['open'] });
    expect(v.map((x) => x.frame)).toEqual([2]);
  });

  it('reads the painted size from compositor frames', () => {
    const ref = region(20, 10, [30, 30, 30], { 0: [200, 200, 200] });
    const thin = region(20, 10, [244, 244, 244], { 0: [200, 200, 200] });
    const v = notCollapsed(
      {
        paint: [
          { box: ref, ref },
          { box: thin, ref },
        ],
      },
      { el: 'bar', painted: true }
    );
    expect(v.map((x) => x.frame)).toEqual([1]);
    expect(v[0].detail).toContain('1 of its 10 rows');
  });
});

describe('settleFrame and arriveTogether', () => {
  const run = (a, b) =>
    runOf(
      a.map((x, i) => ({
        panel: box(x, 0, 400, 800),
        page: box(0, 0, b[i], 800),
      }))
    );

  it('finds the last frame a value changed on', () => {
    expect(settleFrame([{ v: 1 }, { v: 2 }, { v: 2 }], (s) => s.v)).toBe(1);
    expect(settleFrame([{ v: 1 }, { v: 1 }], (s) => s.v)).toBe(null);
  });

  it('passes two motions that land on the same frame', () => {
    expect(
      arriveTogether(run([1400, 1200, 1040, 1040], [1440, 1240, 1024, 1024]), {
        a: 'panel',
        aEdge: 'start',
        b: 'page',
        bEdge: 'end',
      })
    ).toEqual([]);
  });

  it('reports a page that lands frames before its panel', () => {
    const v = arriveTogether(
      run(
        [1400, 1300, 1200, 1100, 1040],
        [1024, 1024, 1024, 1024, 1024].map((w, i) => (i ? w : 1440))
      ),
      { a: 'panel', aEdge: 'start', b: 'page', bEdge: 'end' }
    );
    expect(v).toHaveLength(1);
    expect(v[0].detail).toContain('3 frames apart');
  });
});

describe('staysInside', () => {
  it('reports the sides a box crosses, logical sides resolved', () => {
    const run = runOf([
      { bar: box(40, 56, 600, 34), ws: box(16, 64, 1000, 800) },
      { bar: box(40, 72, 600, 34), ws: box(16, 64, 1000, 800) },
    ]);
    const v = staysInside(run, { el: 'bar', container: 'ws' });
    expect(v).toHaveLength(1);
    expect(v[0].detail).toBe('bar outside ws: top by 8px');
    expect(
      staysInside(run, { el: 'bar', container: 'ws', sides: ['start', 'end'] })
    ).toEqual([]);
  });
});

describe('wholePixels', () => {
  it('checks the rest frames on the device grid', () => {
    const run = runOf([
      { bar: box(10.25, 0, 100, 34) },
      { bar: box(10.5, 72, 100, 34) },
      { bar: box(10.3, 72, 100, 34) },
    ]);
    run.marks = [{ name: 'open', frame: 0, end: 1 }];
    const v = wholePixels(run, { el: 'bar' });
    expect(v.map((x) => x.frame)).toEqual([2]);
    expect(v[0].detail).toContain('left 10.3');
  });
});

describe('noLongFrames', () => {
  it('reads the browser’s long frames when it reports them', () => {
    const run = runOf([{}, {}, {}]);
    run.longFrames = [{ start: 20, duration: 80, blocking: 30 }];
    const v = noLongFrames(run, { maxMs: 50 });
    expect(v).toEqual([
      {
        invariant: 'noLongFrames',
        frame: 2,
        detail: 'a 80ms frame (30ms blocking)',
      },
    ]);
  });

  it('falls back to the gaps between frames', () => {
    const run = runOf([{}, {}, {}]);
    run.samples[2].dt = 70;
    expect(noLongFrames(run).map((x) => x.frame)).toEqual([2]);
  });
});

describe('reducedPath', () => {
  const run = (frames) => {
    const r = runOf(frames.map((f) => ({ panel: f })));
    r.marks = [{ name: 'open', frame: 0 }];
    return r;
  };

  it('passes a change that lands at once', () => {
    expect(
      reducedPath(run([null, box(1040, 0, 400, 800), box(1040, 0, 400, 800)]), {
        el: 'panel',
      })
    ).toEqual([]);
  });

  it('passes a fade in place on the reduced clock', () => {
    const f = [0, 0.3, 0.6, 1, 1].map((o) => box(1040, 0, 400, 800, o));
    expect(reducedPath(run(f), { el: 'panel' })).toEqual([]);
  });

  it('reports a slide', () => {
    const f = [1440, 1340, 1240, 1140, 1040].map((x) => box(x, 0, 400, 800));
    const v = reducedPath(run(f), { el: 'panel' });
    expect(v[0].detail).toContain('over 4 frames');
  });

  it('reports a fade past the reduced clock', () => {
    const f = Array.from({ length: 20 }, (_, i) =>
      box(1040, 0, 400, 800, Math.min(1, i / 18))
    );
    const v = reducedPath(run(f), { el: 'panel', clockMs: 150 });
    expect(v).toHaveLength(1);
    expect(v[0].detail).toContain('reduced clock 150ms');
  });
});

describe('check', () => {
  it('runs named checks and refuses an unknown one', () => {
    const run = runOf([{ bar: box(0, 0, 10, 10) }]);
    expect(
      check(run, [['staysInside', { el: 'bar', container: 'x' }]])
    ).toEqual([]);
    expect(() => check(run, [['nope', {}]])).toThrow();
  });
});

describe('check bounds and known', () => {
  const run = runOf([0, 1, 2, 3].map((i) => ({ bar: box(0, i * 30, 10, 10) })));
  run.marks = [
    { name: 'a', frame: 0, end: 1 },
    { name: 'b', frame: 2, end: 3 },
  ];

  it('bounds a check to part of the run by its marks', () => {
    const all = check(run, [
      ['continuous', { el: 'bar', edge: 'top', maxStep: 5 }],
    ]);
    expect(all.map((v) => v.frame)).toEqual([1, 2, 3]);
    const before = check(run, [
      ['continuous', { el: 'bar', edge: 'top', maxStep: 5, until: 'b' }],
    ]);
    expect(before.map((v) => v.frame)).toEqual([1]);
  });

  it('marks a known check’s violations', () => {
    const v = check(run, [
      [
        'continuous',
        { el: 'bar', edge: 'top', maxStep: 5, from: 'b', known: 'why' },
      ],
    ]);
    expect(v.map((x) => [x.frame, x.known])).toEqual([
      [2, 'why'],
      [3, 'why'],
    ]);
  });
});

describe('continuous, auto and turns', () => {
  it('lets an eased glide through and catches a skip in it', () => {
    const run = runOf(
      [0, 0, 20, 34, 44, 51, 90, 93, 94, 94].map((y) => ({
        bar: box(0, y, 10, 10),
      }))
    );
    const v = continuous(run, { el: 'bar', edge: 'top', maxStep: 'auto' });
    expect(v.map((x) => x.frame)).toEqual([6]);
  });

  it('lets a turn the run asked for reverse', () => {
    const run = runOf(
      [0, 10, 20, 12, 4].map((y) => ({ bar: box(0, y, 10, 10) }))
    );
    run.marks = [{ name: 'back', frame: 2 }];
    expect(continuous(run, { el: 'bar', edge: 'top', maxStep: 20 })).toEqual(
      []
    );
  });
});

describe('still', () => {
  it('reports a box that moves, fades or reclips during an action', () => {
    const run = runOf(
      [1, 1, 0, 1].map((o) => ({ panel: box(0, 0, 10, 10, o) }))
    );
    run.marks = [{ name: 'theme', frame: 1 }];
    const v = still(run, { el: 'panel', during: ['theme'] });
    expect(v).toHaveLength(1);
    expect(v[0].detail).toBe('panel faded to 0 during theme');
  });
});

describe('reducedPath, paired with the full run', () => {
  it('takes half the full run’s clock for the same action', () => {
    const f = Array.from({ length: 12 }, (_, i) =>
      box(1040, 0, 400, 800, Math.min(1, i / 10))
    );
    const r = runOf(f.map((b) => ({ panel: b })));
    r.marks = [{ name: 'open', frame: 0 }];
    r.fullClocks = { open: 400 };
    expect(reducedPath(r, { el: 'panel' })).toEqual([]);
    r.fullClocks = { open: 200 };
    expect(reducedPath(r, { el: 'panel' })).toHaveLength(1);
  });
});
