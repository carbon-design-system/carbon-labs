/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  box,
  closed,
  HiddenLines,
  isoAt,
  keyhole,
  type Layer,
  prism,
  type Pt,
  ring,
} from '@carbon-labs/react-illustrations';

/* ============================================================================
 * EmptyState's illustrations, one per kind: line drawings on the shared
 * isometric construction (illustrations/tiles.tsx). Rules:
 *
 *   line      one weight, no fills; lines behind a shape are removed
 *   stage     every kind on the same plinth, its top's centre at (40, 53)
 *   accent    one role, on the one part the state is about
 *
 * Inline SVG, coloured by empty-state.scss from the theme's tokens.
 * Decorative: `aria-hidden`, no name of its own. No motion.
 * ========================================================================== */

/** The ground point: the plinth top's centre. */
const iso = isoAt(40, 53);

const C = 'cds-empty-state-art';
const ACCENT = `${C}__accent`;

/** The plinth every kind stands on, 30 units square and 5 thick. */
const plinth = (): Layer => box(iso, [-15, 15], [-15, 15], [-5, 0]);

/** A flat circle facing us, as a closed polyline. */
const circle = (cx: number, cy: number, r: number): Pt[] =>
  ring(48, (t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)]);

/* ── no-data: an open carton, empty ──────────────────────────────────────── */
function noData(): Layer[] {
  const [a0, a1, b0, b1] = [-10, 10, -10, 10];
  const H = 17;
  const [fa, fz] = [6, 5]; // the back flaps' reach, out and up
  const q = (p: [number, number, number][]) =>
    p.map(([a, b, z]) => iso(a, b, z));
  const flap = (p: [number, number, number][]): Layer => ({
    lines: [closed(q(p))],
    hides: [q(p)],
  });
  return [
    plinth(),
    flap([
      [a0, b0, H],
      [a0, b1, H],
      [a0 - fa, b1, H + fz],
      [a0 - fa, b0, H + fz],
    ]),
    flap([
      [a0, b1, H],
      [a1, b1, H],
      [a1, b1 + fa, H + fz],
      [a0, b1 + fa, H + fz],
    ]),
    // Inside: the back corner and the floor's back edges; the whole carton hides the plinth.
    {
      lines: [
        q([
          [a0, b1, H],
          [a0, b1, 0],
        ]),
        q([
          [a0, b0, 0],
          [a0, b1, 0],
          [a1, b1, 0],
        ]),
      ],
      hides: [
        q([
          [a0, b0, H],
          [a0, b1, H],
          [a1, b1, H],
          [a1, b1, 0],
          [a1, b0, 0],
          [a0, b0, 0],
        ]),
      ],
    },
    // The two front walls.
    {
      lines: [
        q([
          [a0, b0, H],
          [a0, b0, 0],
          [a1, b0, 0],
          [a1, b1, 0],
          [a1, b1, H],
        ]),
        q([
          [a1, b0, H],
          [a1, b0, 0],
        ]),
      ],
      hides: [
        q([
          [a0, b0, H],
          [a1, b0, H],
          [a1, b1, H],
          [a1, b1, 0],
          [a1, b0, 0],
          [a0, b0, 0],
        ]),
      ],
    },
    // The rim: the opening, nothing in it.
    {
      lines: [
        closed(
          q([
            [a0, b0, H],
            [a1, b0, H],
            [a1, b1, H],
            [a0, b1, H],
          ])
        ),
      ],
      className: ACCENT,
    },
  ];
}

/* ── not-found: a magnifier over the empty plinth ────────────────────────── */
function notFound(): Layer[] {
  const [cx, cy, r, ri] = [36, 21, 12, 9.5]; // the lens: its rim's outer and inner circles
  const d = Math.SQRT1_2;
  const w = 2.25; // the handle's half width
  const [s, e] = [ri + 1, r + 12]; // the handle, from inside the rim to its end
  const along = (k: number, side: number): Pt => [
    cx + d * k - d * side,
    cy + d * k + d * side,
  ];
  const end = ring(
    12,
    (t) => [cx + d * e + w * Math.cos(t), cy + d * e + w * Math.sin(t)],
    -Math.PI / 4,
    (3 * Math.PI) / 4
  );
  const handle = [along(s, -w), ...end, along(s, w)];
  return [
    plinth(),
    { lines: [handle], hides: [closed(handle)] },
    {
      lines: [circle(cx, cy, r), circle(cx, cy, ri)],
      className: ACCENT,
      hides: [circle(cx, cy, r), circle(cx, cy, ri)],
    },
    // A glint on the glass.
    {
      lines: [
        ring(
          8,
          (t) => [cx + 5 * Math.cos(t), cy + 5 * Math.sin(t)],
          Math.PI * 1.05,
          Math.PI * 1.45
        ),
      ],
    },
  ];
}

/* ── error: a block cracked across its top and down its side ─────────────── */
function errorArt(): Layer[] {
  const [a0, a1, b0, b1] = [-10, 10, -10, 10];
  const H = 26;
  const crack: [number, number, number][] = [
    [a0, 5.5, H],
    [-4.5, 6, H],
    [-2, 0, H],
    [2.5, 1.5, H],
    [0.5, b0, H],
    [4, b0, 18],
    [-0.5, b0, 12],
    [2.5, b0, 6],
    [0.5, b0, 0],
  ];
  return [
    plinth(),
    box(iso, [a0, a1], [b0, b1], [0, H]),
    { lines: [crack.map(([a, b, z]) => iso(a, b, z))], className: ACCENT },
  ];
}

/* ── unauthorized: a padlock, shut ───────────────────────────────────────── */
function unauthorized(): Layer[] {
  const [a0, a1, b0, b1] = [-10, 10, -5, 5];
  const H = 20;
  // The shackle: a round-topped U in the plane b = 0, both legs into the body's top.
  const [R, w, leg] = [6, 1.75, 6];
  const u = (rad: number) =>
    ring(
      20,
      (t) => iso(rad * Math.cos(t), 0, H + leg + rad * Math.sin(t)),
      Math.PI,
      0
    );
  const outer = [iso(-(R + w), 0, H), ...u(R + w), iso(R + w, 0, H)];
  const inner = [iso(-(R - w), 0, H), ...u(R - w), iso(R - w, 0, H)];
  return [
    plinth(),
    box(iso, [a0, a1], [b0, b1], [0, H]),
    { lines: [outer, inner], hides: [[...outer, ...[...inner].reverse()]] },
    {
      lines: [keyhole((x, z) => iso(x, b0, z), 12, 3, 8, 1.2, 2)],
      className: ACCENT,
    },
  ];
}

/* ── notifications: a bell, on the notification icon's proportions ───────── */
function notifications(): Layer[] {
  // The icon's 32-unit grid, its centre lines, scaled 1.5 and hung over the plinth.
  const k = 1.5;
  const at = (x: number, y: number): Pt => [40 + (x - 16) * k, 6.5 + y * k];
  const dome = ring(
    24,
    (t) => at(16 + 9 * Math.cos(t), 13 + 9 * Math.sin(t)),
    Math.PI,
    Math.PI * 2
  );
  const body = closed([
    at(4, 20),
    at(7, 17),
    ...dome,
    at(25, 17),
    at(28, 20),
    at(28, 23),
    at(4, 23),
  ]);
  const clapper = [
    at(12, 23),
    ...ring(
      16,
      (t) => at(16 + 4 * Math.cos(t), 25 + 4 * Math.sin(t)),
      Math.PI,
      0
    ),
    at(20, 23),
  ];
  return [
    plinth(),
    {
      lines: [body, [at(4, 20), at(28, 20)], [at(16, 2), at(16, 4)]],
      hides: [body],
    },
    { lines: [clapper], className: ACCENT, hides: [clapper] },
  ];
}

/* ── no-tags: one tag, lying on the plinth, its hole at the pointed end ──── */
function noTags(): Layer[] {
  const T = 2.5;
  const shape: Pt[] = [
    [-12.5, -10],
    [2.5, -10],
    [12.5, 0],
    [2.5, 10],
    [-12.5, 10],
  ];
  const hole = ring(32, (t) => iso(6 + 3 * Math.cos(t), 3 * Math.sin(t), T));
  return [
    plinth(),
    ...prism(iso, shape, [0, T], undefined, ACCENT),
    { lines: [hole] },
  ];
}

const ART = {
  error: errorArt,
  'no-data': noData,
  'no-tags': noTags,
  'not-found': notFound,
  notifications,
  unauthorized,
} as const;

/** The kinds that have an illustration. */
export type EmptyStateArtKind = keyof typeof ART;

const drawArt = (kind: EmptyStateArtKind) => ART[kind]();

/** A kind's illustration: an inline SVG of lines, coloured by the theme's tokens, decorative. */
export function EmptyStateArt({
  kind,
  className,
}: {
  kind: EmptyStateArtKind;
  className?: string;
}) {
  return (
    <svg
      className={[C, `${C}--${kind}`, className].filter(Boolean).join(' ')}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false">
      {/* The pixel nudge (empty-state.scss): half a line onto the pixel grid at the drawn size. */}
      <g className={`${C}__px`}>
        <HiddenLines draw={drawArt} kind={kind} />
      </g>
    </svg>
  );
}
