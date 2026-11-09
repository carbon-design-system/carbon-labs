/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Edit and Magic wand hovers:
 *  - Edit: the underline grows 2px at each end about its resting centre
 *    (2–30 at rest, 0–32 at the peak) and the pencil slides 2px right. The
 *    Edit ⇄ Edit off toggle hovers through the same underline and pencil.
 *  - Magic wand (and Magic wand filled, and the toggle between them): the
 *    wand tips 5° in moderate-01 and moves 2px left and 1px up; the sparkles
 *    keep their reference timing (100ms apart) and land 1px further out, the
 *    top right one at (18, 1), 17px from the top left one centre to centre,
 *    as the left one is. The wand never touches a sparkle.
 * Checked: rest is Carbon's drawing, the peak geometry, every sampled frame
 * inside the 36 box (-2 to 34), the timings, and the underline's symmetry.
 */
import Edit32 from '@carbon/icons/es/edit/32.js';
import MagicWand32 from '@carbon/icons/es/magic-wand/32.js';
import MagicWandFilled32 from '@carbon/icons/es/magic-wand--filled/32.js';
import { describe, expect, it } from 'vitest';
import { HOVER, leaveOf, type Shapes } from '../src/engine';
import { cubicBezier } from '../src/ease';
import { motionTokens, toEasing } from '../src/tokens';
import { inkOf } from '../src/status';
import { EditSpec, PENCIL } from '../src/icons/formatting/Edit';
import {
  MagicWandFilledSpec,
  MagicWandSpec,
} from '../src/icons/formatting/fmtTools';
import {
  EditOffToggleSpec,
  MagicWandToggleSpec,
} from '../src/icons/toggle/editingToggles';

type Pt = [number, number];
type Art = { content: { elem: string; attrs: Record<string, string> }[] };
type HoverGeo = (f: { h: number; entering?: number }, size?: number) => Shapes;
type ToggleGeo = (
  f: { h: number; p: number; e: number; entering?: number },
  size?: number
) => Shapes;
const SIZES = [16, 20, 24, 32];
const BOX = [-2, 34] as const;

const ringsOf = (a: Shapes[string]): Pt[][] => {
  const r = inkOf(a);
  if (typeof r === 'string') {
    throw new Error(`unreadable shape ${r}`);
  }
  return r.rings as Pt[][];
};
const bbox = (pts: Pt[]) => [
  Math.min(...pts.map((p) => p[0])),
  Math.min(...pts.map((p) => p[1])),
  Math.max(...pts.map((p) => p[0])),
  Math.max(...pts.map((p) => p[1])),
];
/** Every painted shape's ink, as one box. */
const inkBox = (s: Shapes) =>
  bbox(
    Object.values(s).flatMap((a) =>
      String(a.d ?? 'x') === '' ? [] : ringsOf(a).flat()
    )
  );
const inBox = (b: number[]) =>
  b[0] >= BOX[0] - 1e-6 &&
  b[1] >= BOX[0] - 1e-6 &&
  b[2] <= BOX[1] + 1e-6 &&
  b[3] <= BOX[1] + 1e-6;
const close = (a: Pt[], b: Pt[], eps = 1e-3) =>
  a.length === b.length &&
  a.every((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1]) < eps);
/** A ring as a set of corners, wherever it starts. */
const sameRing = (a: Pt[], b: Pt[], eps = 1e-3) => {
  const strip = (r: Pt[]) =>
    r.length > 1 &&
    Math.hypot(r[0][0] - r[r.length - 1][0], r[0][1] - r[r.length - 1][1]) <
      1e-9
      ? r.slice(0, -1)
      : r;
  const [x, y] = [strip(a), strip(b)];
  return (
    x.length === y.length &&
    x.every((p) => y.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < eps))
  );
};
const centre = (r: Pt[]): Pt => {
  const [x0, y0, x1, y1] = bbox(r);
  return [(x0 + x1) / 2, (y0 + y1) / 2];
};
function segDist(p: Pt, a: Pt, b: Pt) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const u = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
}
/** The least distance between two outlines (neither inside the other). */
function gap(A: Pt[], B: Pt[]) {
  let m = Infinity;
  for (const p of A) {
    for (let i = 0; i < B.length; i++) {
      m = Math.min(m, segDist(p, B[i], B[(i + 1) % B.length]));
    }
  }
  for (const p of B) {
    for (let i = 0; i < A.length; i++) {
      m = Math.min(m, segDist(p, A[i], A[(i + 1) % A.length]));
    }
  }
  return m;
}

// ── Edit ──────────────────────────────────────────────────────────────────────

describe('Edit', () => {
  const geo = EditSpec.geo as HoverGeo;
  const art = Edit32 as unknown as Art;
  const underline = (s: Shapes) => {
    const [x0, y0, x1, y1] = bbox(ringsOf(s.underline).flat());
    return { x0, y0, x1, y1 };
  };
  const pencilBox = (s: Shapes) => bbox(ringsOf(s.pencil).flat());
  const HS = Array.from({ length: 101 }, (_, i) => i / 100);

  it("rests as Carbon's drawing, at every size", () => {
    const [line, pencil] = art.content.map((c) => c.attrs.d);
    for (const size of SIZES) {
      const s = geo({ h: 0 }, size);
      expect(ringsOf(s.underline)[0]).toSatisfy((r: Pt[]) =>
        sameRing(r, ringsOf({ d: line })[0])
      );
      expect(s.underline).toMatchObject({ x: 2, y: 26, width: 28, height: 2 });
      expect(s.pencil).toEqual({ d: PENCIL, transform: 'translate(0 0)' });
      expect(PENCIL.replace(/\s+/g, '')).toBe(pencil.replace(/\s+/g, ''));
    }
  });

  it('at its peak, the pencil 2px right and the underline 2px longer at each end: 0–32', () => {
    const s = geo({ h: 1 });
    expect(s.pencil.transform).toBe('translate(2 0)');
    expect(underline(s)).toEqual({ x0: 0, y0: 26, x1: 32, y1: 28 });
  });

  it('spreads evenly: at every frame the underline grows the same at both ends about its resting centre, as the pencil slides', () => {
    const [rest, restPencil] = [
      underline(geo({ h: 0 })),
      pencilBox(geo({ h: 0 })),
    ];
    for (const h of HS) {
      const s = geo({ h });
      const u = underline(s);
      expect(pencilBox(s)[0] - restPencil[0], `h ${h} slide`).toBeCloseTo(
        2 * h,
        3
      );
      expect((u.x0 + u.x1) / 2, `h ${h} centre`).toBeCloseTo(
        (rest.x0 + rest.x1) / 2,
        9
      );
      expect(rest.x0 - u.x0, `h ${h} left growth`).toBeCloseTo(
        u.x1 - rest.x1,
        9
      );
      expect(rest.x0 - u.x0, `h ${h} growth`).toBeCloseTo(2 * h, 3);
      // The line's height holds at 2px.
      expect([u.y0, u.y1]).toEqual([26, 28]);
    }
  });

  it('stays inside the 36 box at every frame (Edit, and Edit ⇄ Edit off hovering on and changing)', () => {
    for (const h of HS) {
      expect(inkBox(geo({ h })), `Edit h ${h}`).toSatisfy(inBox);
    }
    const toggle = EditOffToggleSpec.geo as ToggleGeo;
    for (const h of [0, 0.25, 0.5, 0.75, 1]) {
      for (const p of HS.filter((_, i) => i % 5 === 0)) {
        expect(
          inkBox(toggle({ h, p, e: 0 })),
          `toggle h ${h} p ${p}`
        ).toSatisfy(inBox);
        expect(
          inkBox(toggle({ h, p: 1, e: p })),
          `toggle h ${h} e ${p}`
        ).toSatisfy(inBox);
      }
    }
  });

  it("Edit ⇄ Edit off hovers through Edit's underline when on, and retracts it from the right as it turns off", () => {
    const toggle = EditOffToggleSpec.geo as ToggleGeo;
    for (const h of HS.filter((_, i) => i % 10 === 0)) {
      const on = toggle({ h, p: 0, e: 0 });
      const [got, want] = [
        bbox(ringsOf(on.underline).flat()),
        bbox(ringsOf(geo({ h }).underline).flat()),
      ];
      got.forEach((v, i) => expect(v, `h ${h}`).toBeCloseTo(want[i], 9));
      expect(on.pencil).toEqual(geo({ h }).pencil);
    }
    // Turning off from the hover's peak: the right end comes in.
    const turning = bbox(
      ringsOf(toggle({ h: 1, p: 0.25, e: 0 }).underline).flat()
    );
    expect(turning[2]).toBeLessThan(32);
  });

  it('keeps the standard hover: moderate-01 on the entrance curve, the derived fast-02 leave', () => {
    expect(EditSpec.hover).toEqual(HOVER);
    expect(EditSpec.hover!.duration).toBe(
      motionTokens.duration.moderate01 / 1000
    );
    expect(EditSpec.leave).toBeUndefined();
    expect(leaveOf(EditSpec.hover!).duration).toBeCloseTo(
      motionTokens.duration.fast02 / 1000,
      9
    );
  });
});

// ── Magic wand ────────────────────────────────────────────────────────────────

const WANDS = [
  ['MagicWand', MagicWandSpec.geo as HoverGeo, MagicWand32 as unknown as Art],
  [
    'MagicWandFilled',
    MagicWandFilledSpec.geo as HoverGeo,
    MagicWandFilled32 as unknown as Art,
  ],
] as const;
const HOVER_EASE = cubicBezier(...toEasing(motionTokens.easing.entrance));
/** The wand's tip (moderate-01), and the leave (the hover's 540ms sped up as the standard leave is), in ms. */
const TIP = motionTokens.duration.moderate01;
const LEAVE = Math.round(
  leaveOf(
    MagicWandSpec.hover as {
      duration: number;
      ease: [number, number, number, number];
    }
  ).duration * 1000
);
/** Hover progress at t ms into the 540ms hover (its entrance curve). */
const hAt = (t: number) => HOVER_EASE(Math.min(1, t / 540));
/** The wand's pose: [shift x, shift y, tilt°], from `translate(x y) rotate(a 22 22)`. */
const pose = (s: Shapes) => {
  const m =
    /^translate\(([-\d.e]+) ([-\d.e]+)\) rotate\(([-\d.e]+) 22 22\)$/.exec(
      String(s.wand.transform)
    )!;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const tilt = (s: Shapes) => pose(s)[2];
const sparkles = (s: Shapes) =>
  [0, 1, 2].map((i) => ringsOf(s[`sparkle${i}`])[0]);
/** A sparkle's half-diagonal (2 at rest: Carbon's 2.83px square at 45°). */
const reach = (r: Pt[]) => {
  const c = centre(r);
  return Math.max(...r.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
};
const TIMES = Array.from({ length: 541 }, (_, t) => t);

describe.each(WANDS)('%s', (name, geo, art) => {
  it("rests as Carbon's drawing, at every size", () => {
    const [wand, ...squares] = art.content.map((c) => c.attrs);
    for (const size of SIZES) {
      const s = geo({ h: 0, entering: 1 }, size);
      expect(s.wand.d).toBe(wand.d);
      expect(pose(s)).toEqual([0, 0, 0]);
      const got = sparkles(s);
      squares.forEach((sq, i) =>
        expect(got[i], `${name} sparkle ${i}`).toSatisfy((r: Pt[]) =>
          sameRing(r, ringsOf({ d: sq.d, transform: sq.transform })[0])
        )
      );
    }
    // Leaving ends there too.
    expect(geo({ h: 0, entering: 0 })).toEqual(geo({ h: 0, entering: 1 }));
  });

  it('at its peak: the wand tipped 5° about its handle end and moved 2px left and 1px up, the sparkles landed 1px further out at full size', () => {
    const s = geo({ h: 1, entering: 1 });
    expect(s.wand.transform).toBe('translate(-2 -1) rotate(5 22 22)');
    const got = sparkles(s);
    const want: Pt[] = [
      [1, 18],
      [18, 1],
      [1, 1],
    ]; // were (2, 18), (20, 2), (2, 2); rounds 1-2 put the top right at (22, 1)
    // Centre to centre, the top right sparkle is as far from the top left one as the left one is (17px).
    const d = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    expect(d(centre(got[1]), centre(got[2]))).toBeCloseTo(
      d(centre(got[0]), centre(got[2])),
      9
    );
    expect(d(centre(got[1]), centre(got[2]))).toBeCloseTo(17, 9);
    got.forEach((r, i) => {
      expect(centre(r)[0], `sparkle ${i} x`).toBeCloseTo(want[i][0], 6);
      expect(centre(r)[1], `sparkle ${i} y`).toBeCloseTo(want[i][1], 6);
      expect(reach(r)).toBeCloseTo(2, 6);
    });
  });

  it("at its peak the wand's outline is 7.27px from the left sparkle, 5.96 from the top right and 6.11 from the top left", () => {
    const s = geo({ h: 1, entering: 1 });
    const outline = ringsOf(s.wand)[0];
    const gaps = sparkles(s).map((r) => gap(r, outline));
    [7.266, 5.963, 6.109].forEach((want, i) =>
      expect(gaps[i], `sparkle ${i}`).toBeCloseTo(want, 2)
    );
  });

  it('never touches a sparkle: at every millisecond of the hover and every frame of the leave the wand stays at least 1.8px clear of each', () => {
    const least = [Infinity, Infinity, Infinity];
    const check = (s: Shapes) => {
      const outline = ringsOf(s.wand)[0];
      sparkles(s).forEach(
        (r, i) => (least[i] = Math.min(least[i], gap(r, outline)))
      );
    };
    for (const t of TIMES) {
      check(geo({ h: hAt(t), entering: 1 }));
    }
    for (let t = 0; t <= LEAVE; t += 4) {
      check(geo({ h: 1 - HOVER_EASE(t / LEAVE), entering: 0 }));
    }
    // Left: Carbon's own 3.24 at rest; top right 2.55 at 100ms; top left 1.87, as
    // the wand arrives before that sparkle starts.
    [3.243, 2.554, 1.867].forEach((want, i) =>
      expect(least[i], `sparkle ${i}`).toBeCloseTo(want, 2)
    );
  });

  it('stays inside the 36 box at every millisecond of the hover and every frame of the leave, the sparkles at least 0.4px in', () => {
    let least = Infinity;
    const check = (s: Shapes, what: string) => {
      expect(inkBox(s), `${name} ${what}`).toSatisfy(inBox);
      for (const r of sparkles(s)) {
        const [x0, y0, x1, y1] = bbox(r);
        least = Math.min(
          least,
          x0 - BOX[0],
          y0 - BOX[0],
          BOX[1] - x1,
          BOX[1] - y1
        );
      }
    };
    for (const t of TIMES) {
      check(geo({ h: hAt(t), entering: 1 }), `in ${t}ms`);
    }
    for (let t = 0; t <= LEAVE; t += 4) {
      check(geo({ h: 1 - HOVER_EASE(t / LEAVE), entering: 0 }), `out ${t}ms`);
    }
    // 0.41px: the sparkles move out while still swelling.
    expect(least).toBeGreaterThan(0.4);
    expect(least).toBeLessThan(0.55);
    // The wand itself keeps 4px clear of the box at its closest.
    let wand = Infinity;
    for (const t of TIMES) {
      const [x0, y0, x1, y1] = bbox(
        ringsOf(geo({ h: hAt(t), entering: 1 }).wand).flat()
      );
      wand = Math.min(wand, x0 - BOX[0], y0 - BOX[0], BOX[1] - x1, BOX[1] - y1);
    }
    expect(wand).toBeGreaterThan(3.9);
  });

  it('times: the hover still runs 540ms; the wand tips and shifts in moderate-01; the sparkles keep the reference timing, 100ms apart', () => {
    expect((MagicWandSpec.hover as { duration: number }).duration).toBe(0.54);
    // The wand: moving until moderate-01, still from then on; its shift on the tip's own progress.
    expect(tilt(geo({ h: hAt(TIP - 10), entering: 1 }))).toBeLessThan(5);
    expect(tilt(geo({ h: hAt(TIP - 10), entering: 1 }))).toBeGreaterThan(4.9);
    for (const t of [TIP + 1, 200, 300, 540]) {
      const [x, y, a] = pose(geo({ h: hAt(t), entering: 1 }));
      expect([x, y], `${t}ms`).toEqual([-2, -1]);
      expect(a, `${t}ms`).toBeCloseTo(5, 3);
    }
    let last = -1;
    for (let t = 0; t <= TIP; t++) {
      const [x, y, a] = pose(geo({ h: hAt(t), entering: 1 }));
      expect(a).toBeGreaterThanOrEqual(last);
      expect(x).toBeCloseTo((-2 * a) / 5, 2);
      expect(y).toBeCloseTo(-a / 5, 2);
      last = a;
    }
    // The sparkles: each starts at its delay, moves for 200ms and swells and turns for 340ms.
    const rest = sparkles(geo({ h: 0, entering: 1 })).map(centre);
    [0, 100, 200].forEach((delay, i) => {
      if (delay) {
        expect(
          centre(sparkles(geo({ h: hAt(delay - 1), entering: 1 }))[i]),
          `sparkle ${i} waits`
        ).toEqual(rest[i]);
      }
      expect(
        reach(sparkles(geo({ h: hAt(delay + 100), entering: 1 }))[i]),
        `sparkle ${i} swells`
      ).toBeGreaterThan(3.4);
      expect(
        reach(sparkles(geo({ h: hAt(delay + 300), entering: 1 }))[i]),
        `sparkle ${i} still settling`
      ).toBeGreaterThan(2.001);
      if (delay + 340 <= 540) {
        expect(
          reach(sparkles(geo({ h: hAt(delay + 341), entering: 1 }))[i]),
          `sparkle ${i} settled`
        ).toBeCloseTo(2, 3);
      }
    });
  });
});

describe('Magic wand ⇄ Magic wand filled', () => {
  const toggle = MagicWandToggleSpec.geo as ToggleGeo;

  it("rests as Carbon's two drawings", () => {
    const { fill: off, ...outline } = toggle({ h: 0, p: 0, e: 0 });
    expect(outline).toEqual(MagicWandSpec.geo({ h: 0, entering: 1 }));
    expect(off.d).toBe('');
    const { fill: on, ...filled } = toggle({ h: 0, p: 1, e: 0 });
    expect(filled).toEqual(MagicWandFilledSpec.geo({ h: 0, entering: 1 }));
    expect(on.d).toBe('');
  });

  it('hovers as the wand does, its disc fill turning with the wand at every frame, inside the 36 box', () => {
    for (const t of TIMES.filter((x) => x % 5 === 0)) {
      for (const p of [0, 0.5, 1]) {
        const s = toggle({ h: hAt(t), p, e: 0, entering: 1 });
        expect(s.fill.transform, `${t}ms p ${p}`).toBe(s.wand.transform);
        expect(inkBox(s), `${t}ms p ${p}`).toSatisfy(inBox);
      }
      expect(
        toggle({ h: hAt(t), p: 1, e: 0.5, entering: 1 }).fill.transform
      ).toBe(toggle({ h: hAt(t), p: 1, e: 0.5, entering: 1 }).wand.transform);
    }
    expect(toggle({ h: 1, p: 0.5, e: 0 }).wand.transform).toBe(
      'translate(-2 -1) rotate(5 22 22)'
    );
    expect(
      close(sparkles(toggle({ h: 1, p: 0.5, e: 0 })).map(centre), [
        [1, 18],
        [18, 1],
        [1, 1],
      ])
    ).toBe(true);
  });
});
