/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status-mark suite for the second batch (icons/marks/*.ts on the
 * status-mark system, utils/statusMark.ts; one mark motion per mark type),
 * shared by the family tests (marks.<family>.test.tsx).
 *
 * For every icon: keys and NaNs across the hover at every size; rest parity
 * with Carbon at 16 / 20 / 24 / 32 by coverage (Δ < 0.5%, as the parity
 * story measures); constant line weight (the base's points move only along
 * their open end's wall, or round its ring, and the mark keeps its own
 * weight, checked per mark type by the family); the space between the mark
 * and the base held through the hover (each open end at its resting width,
 * the mark never within 2px of the base, no shared ink); everything inside
 * the 36×36 hover box; no masks, clip paths, transforms or strokes; Carbon's
 * art when `animated={false}`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as CI from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, Shapes } from '../../utils/frameIcon';
import { mapPath, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  gapBetween,
  statusMarkParts,
  type OpenEnd,
  type StatusMarkIcon as StatusMarkIconSpec,
  type StatusMarkSpec,
} from '@carbon-labs/motion-icons-core/utils/statusMark';
import type { ReactIcon } from '../../runtime';
import {
  cover,
  coverCarbon,
  delta,
  flatten,
  grid,
  inkGap,
  runs,
} from './markRaster';

type StatusMarkIcon = ReactIcon<StatusMarkIconSpec>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySpec = StatusMarkSpec<any>;
export interface Case {
  name: string;
  icon: StatusMarkIcon;
  spec: AnySpec;
  carbon: CarbonIcon;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const any = (x: unknown) => x as any;
export type Descriptor = {
  content: { elem: string; attrs: Record<string, string> }[];
};
/** Carbon's icon drawn from its @carbon/icons descriptor, for an icon @carbon/icons-react doesn't have yet. */
export const fromDescriptor = (desc: Descriptor): CarbonIcon => {
  const Icon = ({ size = 32 }: { size?: number }) => (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      {desc.content.map(({ elem, attrs }, i) => {
        const El = elem as 'path';
        return <El key={i} {...attrs} />;
      })}
    </svg>
  );
  return Icon as unknown as CarbonIcon;
};
/**
 * Icons newer than @carbon/icons-react 11.88 (in @carbon/icons 11.89), by
 * name: the reference is Carbon's descriptor, which is also what
 * `animated={false}` draws. A family's test registers its own.
 */
export const NOT_IN_REACT: Record<string, CarbonIcon> = {};
/** The cases of a family module: every `<NAME>` spec whose icon `<Name>` it exports. */
export function casesOf(
  mod: Record<string, unknown>,
  specs: Record<string, AnySpec>
): Case[] {
  return Object.entries(specs).map(([name, spec]) => ({
    name,
    spec,
    icon: any(mod)[name],
    carbon: any(CI)[name] ?? NOT_IN_REACT[name],
  }));
}

export const SIZES = [16, 20, 24, 32] as const;
export const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];
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
export const pointsOf = (d: string): Pt[] => {
  const out: Pt[] = [];
  mapPath(d, (p) => (out.push(p), p));
  return out;
};
const polysOf = (d: string): Pt[][] => flatten(d).map(({ pts }) => pts);
const isTranslate = (b: OpenEnd['back']): b is Pt => Array.isArray(b);
const MARK_KEYS = new Set(['mark', 'ring', 'pupil']);
export const near = (a: Pt[], b: Pt[], where: string) => {
  expect(a.length, where).toBe(b.length);
  a.forEach((p, i) =>
    expect(
      Math.hypot(p[0] - b[i][0], p[1] - b[i][1]),
      `${where} point ${i}`
    ).toBeLessThan(2e-3)
  );
};
/** A bar's width across it (one run), from a to b. */
export const across = (
  attrs: Shapes[string],
  a: Pt,
  b: Pt,
  w: number,
  where: string
) => {
  const r = runs(attrs, a, b);
  expect(r.length, where).toBe(1);
  expect(Math.abs(r[0] - w), `${where}: ${r[0]}`).toBeLessThan(0.02);
};

/** A mark type's own check: it keeps its weight, and moves as its type moves, at hover h. */
export type MarkCheck = (spec: AnySpec, shapes: Shapes, h: number) => void;

/** The suite for a family's icons; `checks` holds its mark types' own checks. */
export function suite(cases: Case[], checks: Map<unknown, MarkCheck>) {
  describe.each(cases)('$name', ({ name, icon, spec, carbon }) => {
    const parts = statusMarkParts(spec);

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

    it("rests on Carbon's icon at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)", () => {
      for (const size of SIZES) {
        grid(size);
        const d = delta(
          cover(icon.geo({ h: 0 }, size)),
          coverCarbon(carbon, size)
        );
        expect(d, `@${size}`).toBeLessThan(GATE);
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
              if (!end.follow)
                expect(along, `point ${i} draws back h=${h}`).toBeGreaterThan(
                  -1e-3
                );
              expect(
                Math.abs(along - parts(h).drawn[ends.indexOf(end)]),
                `point ${i} by the end's draw-back`
              ).toBeLessThan(2e-3);
            } else {
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

    it('keeps the mark at its weight through the hover, moving as its type moves', () => {
      const check = checks.get(spec.mark);
      expect(check, 'a check for the mark type').toBeTruthy();
      for (const h of [0, 0.5, 1]) check!(spec, parts(h).shapes, h);
    });

    it('holds the space between the mark and the base: each open end at its resting width, the mark never within 2px', () => {
      const others = (h: number) => {
        const p = parts(h);
        return Object.entries(p.shapes)
          .filter(([k]) => !MARK_KEYS.has(k))
          .flatMap(([, a]) => polysOf(String(a.d)));
      };
      // A base cut by a window (Settings' gear) is measured by its painted pixels.
      const baseGap = (h: number) => {
        const p = parts(h);
        return spec.base.at
          ? inkGap(
              p.ink,
              Object.fromEntries(
                Object.entries(p.shapes).filter(([k]) => !MARK_KEYS.has(k))
              )
            )
          : gapBetween(p.ink, others(h));
      };
      const restGap = baseGap(0);
      // Each end keeps its resting width; a spec's numeric `gap` floors it there instead (an end may close to it, never past).
      const restEnds = parts(0).gaps.map((g) =>
        typeof spec.gap === 'number' ? Math.min(g, spec.gap) : g
      );
      for (const h of STEPS) {
        const p = parts(h);
        p.gaps.forEach((g, i) =>
          expect(g, `end ${i} h=${h}`).toBeGreaterThan(restEnds[i] - 1e-3)
        );
        const g = baseGap(h);
        expect(
          g,
          `whole base h=${h} (rest ${restGap.toFixed(2)})`
        ).toBeGreaterThan(Math.min(restGap, 2) - 0.02);
        grid(32);
        const mine = Object.fromEntries(
          Object.entries(p.shapes).filter(([k]) => MARK_KEYS.has(k))
        );
        const theirs = Object.fromEntries(
          Object.entries(p.shapes).filter(([k]) => !MARK_KEYS.has(k))
        );
        const [im, ib] = [cover(mine), cover(theirs)];
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

    it("renders animated with no masks, clip paths, transforms or strokes, and Carbon's art with animated={false}", () => {
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
      // Decision 5: Carbon's exact art.
      expect((Icon as { static?: unknown }).static).toBeTruthy();
      const still = render(<Icon animated={false} aria-label="t" />).container;
      expect(still.querySelector('svg')).not.toBeNull();
      expect(still.querySelector('[data-k]')).toBeNull();
      const Carbon = carbon;
      for (const size of SIZES) {
        const ours = render(
          <Icon animated={false} size={size} />
        ).container.querySelector('svg')!;
        if (NOT_IN_REACT[name]) {
          // No icons-react component to compare markup with: the same drawing, by coverage.
          grid(size);
          const still = ((props: { size?: number }) => (
            <svg
              viewBox="0 0 32 32"
              width={props.size}
              dangerouslySetInnerHTML={{ __html: ours.innerHTML }}
            />
          )) as unknown as CarbonIcon;
          expect(
            delta(coverCarbon(still, size), coverCarbon(Carbon, size)),
            `@${size}`
          ).toBe(0);
          continue;
        }
        const theirs = render(<Carbon size={size} />).container.querySelector(
          'svg'
        )!.innerHTML;
        expect(ours.innerHTML, `@${size}`).toBe(theirs);
      }
    });
  });
}
