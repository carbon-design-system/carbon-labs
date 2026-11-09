/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TextAlignLeft32 from '@carbon/icons/es/text--align--left/32.js';
import TextAlignRight32 from '@carbon/icons/es/text--align--right/32.js';
import TextAlignCenter32 from '@carbon/icons/es/text--align--center/32.js';
import TextAlignJustify32 from '@carbon/icons/es/text--align--justify/32.js';
import TextAlignMixed32 from '@carbon/icons/es/text--align--mixed/32.js';
import AlignBoxTopLeft32 from '@carbon/icons/es/align-box--top-left/32.js';
import AlignBoxTopCenter32 from '@carbon/icons/es/align-box--top-center/32.js';
import AlignBoxTopRight32 from '@carbon/icons/es/align-box--top-right/32.js';
import AlignBoxMiddleLeft32 from '@carbon/icons/es/align-box--middle-left/32.js';
import AlignBoxMiddleCenter32 from '@carbon/icons/es/align-box--middle-center/32.js';
import AlignBoxMiddleRight32 from '@carbon/icons/es/align-box--middle-right/32.js';
import AlignBoxBottomLeft32 from '@carbon/icons/es/align-box--bottom-left/32.js';
import AlignBoxBottomCenter32 from '@carbon/icons/es/align-box--bottom-center/32.js';
import AlignBoxBottomRight32 from '@carbon/icons/es/align-box--bottom-right/32.js';
import BorderTop32 from '@carbon/icons/es/border--top/32.js';
import BorderBottom32 from '@carbon/icons/es/border--bottom/32.js';
import BorderLeft32 from '@carbon/icons/es/border--left/32.js';
import BorderRight32 from '@carbon/icons/es/border--right/32.js';
import BorderFull32 from '@carbon/icons/es/border--full/32.js';
import BorderNone32 from '@carbon/icons/es/border--none/32.js';
import TextIndent32 from '@carbon/icons/es/text--indent/32.js';
import TextIndentMore32 from '@carbon/icons/es/text--indent--more/32.js';
import TextIndentLess32 from '@carbon/icons/es/text--indent--less/32.js';
import {
  hoverIcon,
  type HoverIconSpec,
  type Shapes,
  carbonArt,
  withStatic,
} from '../../engine';
import { framePath, rectPath, type Pt } from '../../geometry';
import { together } from '../../ease';
import { EVENODD, f } from '../../paint';

/**
 * Alignment and layout families on the frame engine: Text align (5), Align
 * box (9), Border (6) and Text indent (3). Carbon has one (32px) drawing of
 * each, so one geometry serves every size, and each rests on Carbon's
 * outline. Every part is a filled outline at Carbon's 2px weight; on hover
 * points move, nothing is transform-scaled, no masks or clip paths. Each
 * family shares one motion:
 *
 *  - Text align: every line gains 2px of length away from the edge it's
 *    aligned to. Left: 2px right. Right: 2px left. Centre and justify: 1px
 *    at each end (the centre holds). All together (no stagger,
 *    as Arrange and List). The edge rule (left, right) holds, so
 *    the lines' 4px gap to it holds. Mixed has glyphs, not lines: the "a"
 *    and the "1" each grow 10% (ListNumbered's numbers) at constant 2px
 *    weight, anchored on their aligned edge (the "a" on its left side, the
 *    "1" on its right), so each reaches 0.8 / 0.6px further from its rule;
 *    two parts, so they move together. The rules hold.
 *  - Align box: the frame grows 1px a side (it fills the frame's height, as
 *    AI label's container: 1px). The block of two bars rides 1px with the
 *    walls it's aligned to, so its 3px gaps to them hold: left/right/top/
 *    bottom 1px toward its corner or edge. On a centred axis it doesn't
 *    move: horizontally centred bars grow 1px at each end instead (their
 *    4px gaps to the side walls hold, as Text align centre's lines grow);
 *    vertically centred ones hold, so Middle centre grows in place.
 *  - Border: the solid (highlighted) side pushes out 1px; its length
 *    holds. The dots on the two sides beside it spread evenly over the 1px
 *    it opens (gaps 2 → 2.17px), so every gap along a dotted side stays
 *    even, the gap to the bar included; the far side holds. The text lines
 *    slide 1px with the solid side, following it (Top up, Bottom
 *    down, Left left, Right right), so their gap to it holds. Full: all
 *    four sides push out (the frame grows 1px a side), the text holds.
 *    None has no solid side, so its whole dotted border pushes out 1px a
 *    side, Full's motion (dots spread 2 → 2.33px).
 *  - Indent: the arrow pushes 2px in its direction. Text indent: the
 *    indented lines' left ends and the arrow move 2px right (the indent
 *    deepens; the lines' right edge holds, so they shorten 14 → 12px), the
 *    arrow's 4.44px gap to them held. Indent more / less: the
 *    arrow and the margin bar move 2px as one in the arrow's direction
 *    (right / left), eating into the lines: the lines hold, their ends by
 *    the bar cut back 2px, so the bar's 4px gap to them holds.
 */

// ── Text align ───────────────────────────────────────────────────────────────

const ROWS = [6, 12, 18, 24]; // each line's top edge (lines are 2px tall)
/** How much length each line gains on hover. */
export const LINE_REACH = 2;
/** Four lines together (no stagger), as Arrange's and List's. */
const ROW_HOVER = /* @__PURE__ */ together();

type Align = 'left' | 'right' | 'centre';
/** Lines as [x0, x1] at rest, top to bottom. */
function textLines(
  spans: readonly [number, number][],
  align: Align,
  h: number
): Shapes {
  const out: Shapes = {};
  spans.forEach(([x0, x1], i) => {
    const k = ROW_HOVER.at(h, i) * LINE_REACH;
    const [a, b] =
      align === 'left'
        ? [x0, x1 + k]
        : align === 'right'
          ? [x0 - k, x1]
          : [x0 - k / 2, x1 + k / 2];
    out[`line${i}`] = { d: rectPath(a, ROWS[i], b, ROWS[i] + 2) };
  });
  return out;
}

/* @__NO_SIDE_EFFECTS__ */
const textAlign = (
  name: string,
  spans: [number, number][],
  align: Align,
  rule?: [number, number]
): HoverIconSpec =>
  hoverIcon(name, {
    hover: ROW_HOVER.hover,
    geo: ({ h }) => ({
      ...textLines(spans, align, h),
      ...(rule ? { rule: { d: rectPath(rule[0], 4, rule[1], 28) } } : {}),
    }),
  });

export const TextAlignLeftSpec = /* @__PURE__ */ withStatic(
  textAlign(
    'TextAlignLeft',
    [
      [12, 26],
      [12, 22],
      [12, 26],
      [12, 22],
    ],
    'left',
    [6, 8]
  ),
  /* @__PURE__ */ carbonArt(TextAlignLeft32)
);
export const TextAlignRightSpec = /* @__PURE__ */ withStatic(
  textAlign(
    'TextAlignRight',
    [
      [6, 20],
      [10, 20],
      [6, 20],
      [10, 20],
    ],
    'right',
    [24, 26]
  ),
  /* @__PURE__ */ carbonArt(TextAlignRight32)
);
export const TextAlignCenterSpec = /* @__PURE__ */ withStatic(
  textAlign(
    'TextAlignCenter',
    [
      [6, 26],
      [10, 22],
      [6, 26],
      [10, 22],
    ],
    'centre'
  ),
  /* @__PURE__ */ carbonArt(TextAlignCenter32)
);
export const TextAlignJustifySpec = /* @__PURE__ */ withStatic(
  textAlign(
    'TextAlignJustify',
    [
      [6, 26],
      [6, 26],
      [6, 26],
      [6, 26],
    ],
    'centre'
  ),
  /* @__PURE__ */ carbonArt(TextAlignJustify32)
);

/** Mixed's glyphs grow this much (ListNumbered's numbers grow 10%). */
export const GLYPH_GROW = 0.1;

/**
 * Carbon's "a" (outer box 8–16 × 4–14 at rest) at scale s about (8, 9): its
 * left edge holds, it grows right and evenly up and down. Positions scale,
 * the 2px walls and the r=2 outer corners don't.
 */
export function glyphA(s: number): string {
  const [L, R, T, B] = [8, 8 + 8 * s, 9 - 5 * s, 9 + 5 * s];
  const [bowl, start] = [9 - s, 8 + s]; // the bowl's top edge; the top bar's left end
  const [l, r] = [f(L), f(R)];
  return (
    `M${f(R - 2)} ${f(T)}H${f(start)}V${f(T + 2)}H${f(R - 2)}V${f(bowl)}H${f(L + 2)}A2 2 0 0 0 ${l} ${f(bowl + 2)}` +
    `V${f(B - 2)}A2 2 0 0 0 ${f(L + 2)} ${f(B)}H${r}V${f(T + 2)}A2 2 0 0 0 ${f(R - 2)} ${f(T)}Z` +
    `M${f(R - 2)} ${f(B - 2)}H${f(L + 2)}V${f(bowl + 2)}H${f(R - 2)}Z`
  );
}
/** Carbon's "1" (18–24 × 18–28 at rest) at scale s about (24, 23): its right edge holds. 2px strokes. */
export function glyphOne(s: number): string {
  const [cs, top, base, left, flag] = [
    24 - 3 * s,
    23 - 5 * s,
    23 + 4 * s,
    24 - 6 * s,
    23 - 3 * s,
  ];
  const pts: Pt[] = [
    [cs + 1, base - 1],
    [cs + 1, top],
    [cs - 1, top],
    [cs - 1, flag - 1],
    [left, flag - 1],
    [left, flag + 1],
    [cs - 1, flag + 1],
    [cs - 1, base - 1],
    [left, base - 1],
    [left, base + 1],
    [24, base + 1],
    [24, base - 1],
  ];
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
}
export const TextAlignMixedSpec = /* @__PURE__ */ hoverIcon('TextAlignMixed', {
  geo: ({ h }) => {
    const s = 1 + GLYPH_GROW * h;
    return {
      a: { d: glyphA(s), ...EVENODD },
      one: { d: glyphOne(s) },
      ruleA: { d: rectPath(2, 2, 4, 16) },
      ruleOne: { d: rectPath(28, 16, 30, 30) },
    };
  },
  static: /* @__PURE__ */ carbonArt(TextAlignMixed32),
});

// ── Align box ────────────────────────────────────────────────────────────────

/** How far the frame grows a side, and the block rides (or, centred, grows) with it. */
export const BOX_GROW = 1;

type H = 'left' | 'centre' | 'right';
type V = 'top' | 'middle' | 'bottom';
/** Each bar's resting [x0, x1] by horizontal alignment (long bar, short bar). */
const BOX_SPANS: Record<H, [number, number][]> = {
  left: [
    [9, 20],
    [9, 16],
  ],
  centre: [
    [10, 22],
    [12, 20],
  ],
  right: [
    [12, 23],
    [16, 23],
  ],
};
/** The bars' resting top edges by vertical alignment. */
const BOX_ROWS: Record<V, [number, number]> = {
  top: [7, 12],
  middle: [13, 18],
  bottom: [18, 23],
};

function alignBoxShapes(hz: H, vt: V, h: number): Shapes {
  const g = BOX_GROW * h;
  const dx = hz === 'left' ? -g : hz === 'right' ? g : 0;
  const grow = hz === 'centre' ? g : 0;
  const dy = vt === 'top' ? -g : vt === 'bottom' ? g : 0;
  const block = BOX_SPANS[hz]
    .map(([x0, x1], i) =>
      rectPath(
        x0 + dx - grow,
        BOX_ROWS[vt][i] + dy,
        x1 + dx + grow,
        BOX_ROWS[vt][i] + dy + 2
      )
    )
    .join('');
  return {
    frame: { d: framePath(4 - g, 2 - g, 28 + g, 30 + g) },
    block: { d: block },
  };
}
/* @__NO_SIDE_EFFECTS__ */
const alignBox = (name: string, hz: H, vt: V) =>
  hoverIcon(name, { geo: ({ h }) => alignBoxShapes(hz, vt, h) });

export const AlignBoxTopLeftSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxTopLeft', 'left', 'top'),
  /* @__PURE__ */ carbonArt(AlignBoxTopLeft32)
);
export const AlignBoxTopCenterSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxTopCenter', 'centre', 'top'),
  /* @__PURE__ */ carbonArt(AlignBoxTopCenter32)
);
export const AlignBoxTopRightSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxTopRight', 'right', 'top'),
  /* @__PURE__ */ carbonArt(AlignBoxTopRight32)
);
export const AlignBoxMiddleLeftSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxMiddleLeft', 'left', 'middle'),
  /* @__PURE__ */ carbonArt(AlignBoxMiddleLeft32)
);
export const AlignBoxMiddleCenterSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxMiddleCenter', 'centre', 'middle'),
  /* @__PURE__ */ carbonArt(AlignBoxMiddleCenter32)
);
export const AlignBoxMiddleRightSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxMiddleRight', 'right', 'middle'),
  /* @__PURE__ */ carbonArt(AlignBoxMiddleRight32)
);
export const AlignBoxBottomLeftSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxBottomLeft', 'left', 'bottom'),
  /* @__PURE__ */ carbonArt(AlignBoxBottomLeft32)
);
export const AlignBoxBottomCenterSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxBottomCenter', 'centre', 'bottom'),
  /* @__PURE__ */ carbonArt(AlignBoxBottomCenter32)
);
export const AlignBoxBottomRightSpec = /* @__PURE__ */ withStatic(
  alignBox('AlignBoxBottomRight', 'right', 'bottom'),
  /* @__PURE__ */ carbonArt(AlignBoxBottomRight32)
);

// ── Border ───────────────────────────────────────────────────────────────────

/** How far a solid side (or, for None, every side) pushes out. */
export const BORDER_PUSH = 1;
type Side = 'top' | 'right' | 'bottom' | 'left';
const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];
/** n 2px dots evenly spread from a to b, the first starting `lead` in and the last ending `tail` short of b, with equal gaps (also before the first when lead, after the last when tail). */
function spread(
  a: number,
  b: number,
  n: number,
  lead: boolean,
  tail: boolean
): number[] {
  const gaps = n - 1 + (lead ? 1 : 0) + (tail ? 1 : 0);
  const g = (b - a - 2 * n) / gaps;
  return Array.from({ length: n }, (_, i) => a + (lead ? g : 0) + i * (2 + g));
}

/**
 * The border: `solid` sides are 2px bars (all four: Carbon's square frame),
 * the rest 2×2 dots on a 4px pitch; `pushed` sides move out `h` px. Corner
 * dots belong to the top and bottom rows; a column's dots spread evenly
 * between the rows' corner dots or bars at its ends.
 */
function borderShapes(solid: Side[], pushed: Side[], h: number): Shapes {
  const out = (s: Side) => (pushed.includes(s) ? BORDER_PUSH * h : 0);
  const [T, R, B, L] = [
    3 - out('top'),
    29 + out('right'),
    29 + out('bottom'),
    3 - out('left'),
  ];
  const is = (s: Side) => solid.includes(s);
  const dot = (x: number, y: number) => rectPath(x, y, x + 2, y + 2);
  const shapes: Shapes = {};
  if (solid.length === 4) {
    shapes.border = {
      d: `M${f(L)} ${f(T)}H${f(R)}V${f(B)}H${f(L)}ZM${f(L + 2)} ${f(T + 2)}V${f(B - 2)}H${f(R - 2)}V${f(T + 2)}Z`,
    };
  } else if (solid.length) {
    const bar: Record<Side, string> = {
      top: rectPath(L, T, R, T + 2),
      bottom: rectPath(L, B - 2, R, B),
      left: rectPath(L, T, L + 2, B),
      right: rectPath(R - 2, T, R, B),
    };
    shapes.border = { d: solid.map((s) => bar[s]).join('') };
  }
  const dots: string[] = [];
  // Rows (with their corner dots, unless a solid column covers the corner).
  for (const [s, y] of [
    ['top', T],
    ['bottom', B - 2],
  ] as const) {
    if (is(s)) {
      continue;
    }
    const [lead, tail] = [is('left'), is('right')];
    spread(
      L + (lead ? 2 : 0),
      R - (tail ? 2 : 0),
      7 - (lead ? 1 : 0) - (tail ? 1 : 0),
      lead,
      tail
    ).forEach((x) => dots.push(dot(x, y)));
  }
  // Columns: the five dots between the rows' ends (a corner dot or a bar, both 2px).
  for (const [s, x] of [
    ['left', L],
    ['right', R - 2],
  ] as const) {
    if (is(s)) {
      continue;
    }
    spread(T + 2, B - 2, 5, true, true).forEach((y) => dots.push(dot(x, y)));
  }
  if (dots.length) {
    shapes.dots = { d: dots.join('') };
  }
  // With one solid side, the text follows it out: 1px toward it.
  const [tx, ty] =
    solid.length === 1
      ? { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[
          solid[0]
        ].map((v) => v * BORDER_PUSH * h)
      : [0, 0];
  shapes.text = {
    d:
      rectPath(8 + tx, 10 + ty, 18 + tx, 12 + ty) +
      rectPath(8 + tx, 15 + ty, 14 + tx, 17 + ty),
  };
  return shapes;
}
/* @__NO_SIDE_EFFECTS__ */
const border = (name: string, solid: Side[], pushed: Side[] = solid) =>
  hoverIcon(name, { geo: ({ h }) => borderShapes(solid, pushed, h) });

export const BorderTopSpec = /* @__PURE__ */ withStatic(
  border('BorderTop', ['top']),
  /* @__PURE__ */ carbonArt(BorderTop32)
);
export const BorderBottomSpec = /* @__PURE__ */ withStatic(
  border('BorderBottom', ['bottom']),
  /* @__PURE__ */ carbonArt(BorderBottom32)
);
export const BorderLeftSpec = /* @__PURE__ */ withStatic(
  border('BorderLeft', ['left']),
  /* @__PURE__ */ carbonArt(BorderLeft32)
);
export const BorderRightSpec = /* @__PURE__ */ withStatic(
  border('BorderRight', ['right']),
  /* @__PURE__ */ carbonArt(BorderRight32)
);
export const BorderFullSpec = /* @__PURE__ */ withStatic(
  border('BorderFull', SIDES),
  /* @__PURE__ */ carbonArt(BorderFull32)
);
export const BorderNoneSpec = /* @__PURE__ */ withStatic(
  border('BorderNone', [], SIDES),
  /* @__PURE__ */ carbonArt(BorderNone32)
);

// ── Indent ───────────────────────────────────────────────────────────────────

/** How far the arrow (with Text indent's lines' ends, or Indent more / less's bar) moves. */
export const INDENT_MOVE = 2;
const chevron = (pts: Pt[], dx: number) =>
  `M${pts.map(([x, y]) => `${f(x + dx)} ${f(y)}`).join('L')}Z`;
const TEXT_INDENT_ARROW: Pt[] = [
  [4, 13.59],
  [7.29, 10],
  [4, 6.41],
  [5.42, 5],
  [10.04, 10],
  [5.42, 15],
];
const MORE_ARROW: Pt[] = [
  [3.85, 22.5],
  [2.44, 21.12],
  [8.73, 15],
  [2.44, 8.88],
  [3.85, 7.5],
  [11.56, 15],
];
const LESS_ARROW: Pt[] = [
  [28.15, 23.5],
  [29.56, 22.12],
  [23.27, 16],
  [29.56, 9.88],
  [28.15, 8.5],
  [20.44, 16],
];

// Text indent: the two indented lines' left ends and the arrow move 2px right; the rest holds.
export const TextIndentSpec = /* @__PURE__ */ hoverIcon('TextIndent', {
  geo: ({ h }) => {
    const d = INDENT_MOVE * h;
    return {
      arrow: { d: chevron(TEXT_INDENT_ARROW, d) },
      indented: {
        d: rectPath(14 + d, 6, 28, 8) + rectPath(14 + d, 12, 28, 14),
      },
      lines: { d: rectPath(7, 18, 28, 20) + rectPath(7, 24, 28, 26) },
    };
  },
  static: /* @__PURE__ */ carbonArt(TextIndent32),
});
/** Lines [x0, x1] by the margin bar; the end at `side` ('left' / 'right') is cut back by `cut`. */
const trimmed = (
  spans: [number, number][],
  side: 'left' | 'right',
  cut: number
) =>
  spans
    .map(([x0, x1], i) =>
      rectPath(
        side === 'left' ? x0 + cut : x0,
        ROWS[i],
        side === 'right' ? x1 - cut : x1,
        ROWS[i] + 2
      )
    )
    .join('');

// Indent more: the arrow and the margin bar move 2px right as one, eating into the lines:
// the lines hold, their left ends cut back 2px so the bar's 4px gap to them holds.
export const TextIndentMoreSpec = /* @__PURE__ */ hoverIcon('TextIndentMore', {
  geo: ({ h }) => {
    const d = INDENT_MOVE * h;
    return {
      arrow: { d: chevron(MORE_ARROW, d) },
      bar: { d: rectPath(14 + d, 4, 16 + d, 28) },
      lines: {
        d: trimmed(
          [
            [20, 30],
            [20, 27],
            [20, 30],
            [20, 27],
          ],
          'left',
          d
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(TextIndentMore32),
});
// Indent less: the mirror. The arrow and bar move 2px left into the lines (which sit left of the
// bar, right-aligned to it); the lines hold, their right ends cut back 2px.
export const TextIndentLessSpec = /* @__PURE__ */ hoverIcon('TextIndentLess', {
  geo: ({ h }) => {
    const d = INDENT_MOVE * h;
    return {
      arrow: { d: chevron(LESS_ARROW, -d) },
      bar: { d: rectPath(16 - d, 4, 18 - d, 28) },
      lines: {
        d: trimmed(
          [
            [2, 12],
            [5, 12],
            [2, 12],
            [5, 12],
          ],
          'right',
          d
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(TextIndentLess32),
});
