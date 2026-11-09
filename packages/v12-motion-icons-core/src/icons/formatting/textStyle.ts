/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TextBold32 from '@carbon/icons/es/text--bold/32.js';
import TextItalic32 from '@carbon/icons/es/text--italic/32.js';
import TextUnderline32 from '@carbon/icons/es/text--underline/32.js';
import Sql32 from '@carbon/icons/es/SQL/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { mapPath, rectPath, type Pt } from '../../geometry';
import { f } from '../../paint';

/**
 * Text style: Bold, Italic and Underline on the frame engine (for the
 * toolbar), and Sql (below). Carbon has one (32px) drawing of each, so one geometry
 * serves every size, and each rests on Carbon's drawing exactly. The
 * letters are filled outlines; on hover their points move, nothing is
 * transform-scaled, no masks or clip paths. One motion for the three, on
 * the standard hover (160ms moderate-01, entrance; leave 120ms fast-02,
 * exit): the letter grows STYLE_GROW (15%) at its own weight: positions
 * scale, the walls don't, so their thickness holds. (STYLE_GROW is these three's own constant, not the
 * text family's GLYPH_GROW: Text align mixed's letters and ListNumbered's
 * numbers keep GLYPH_GROW's 10%.)
 *
 *  - Bold: the "B"'s box grows 15% about its visual centre (the box's,
 *    16.25, 16): 9–23.5 × 7–25 to 7.91–24.59 × 5.65–26.35 (1.09 a side
 *    across, 1.35 up and down). The stem, bars and bowls hold Carbon's 3px
 *    weight: each bowl's outer and inner radii grow 0.675 together (5.25 →
 *    5.925 and 2.25 → 2.925), and the middle bar is the centre, so it holds.
 *  - Italic: the "I" grows 15% in its own slanted frame, about its centre
 *    (16, 16): the serifs move 1.35 up and down and lengthen 0.975 at each
 *    end, riding the stem (each stays centred on the stem's line, as Carbon
 *    draws it). The stem also leans ITALIC_LEAN (6°) further, from Carbon's
 *    17.3° to 23.3°, pivoting on the centre, at its 2px weight (its run
 *    across a row widens from 2.09 to 2.17 so the width across the stem
 *    holds); the serifs stay horizontal and 2px tall, riding the stem's
 *    ends. 6° so the lean reads at
 *    16px: the stem's top moves a whole screen pixel against its foot
 *    there (4° would be 0.65px). At full hover the top serif's right end
 *    and the bottom serif's left end move 2.51 out; the other two ends
 *    move 0.56 inward, riding the lean.
 *  - Underline: the "U" grows 15% about its box's centre (16, 14): 1.05 a
 *    side, 1.35 up and down (bowl radius 7 → 8.05), its 2px walls held.
 *    The rule moves rigidly 1.35 down with the U's bottom, so the 3px gap
 *    between them holds, and extends 1.05 at each end, as the U widens a
 *    side. So the group (U and rule) grows about its own centre (16, 16.5),
 *    which holds.
 *
 * Sql (for tool rails at 16px; scaled, with no added spacing): the word grows STYLE_GROW
 * (15%) about (16, 16), the letters' cap-height centre, at constant
 * weight, as Bold does: positions scale, walls don't. Each 2px wall's
 * centreline moves (x 3, 9 / 13, 16, 19 / 23 and y 10, 16, 22, 26 scale
 * about the centre) and its two edges stay 1px either side, so the r 2
 * corners keep their shape; the bar ends that aren't walls (the L's foot
 * end, x 30) scale. 0.05–32.1 across and 8.1–28.5 down at full hover.
 *
 * Frame: the hovered letters stay inside the 32×32 frame (Underline's rule
 * spans 2.95–29.05, Italic 4.49–27.51), so they don't rely on IconSvg's
 * overflow: visible.
 */

/** How much each letter grows at full hover (0.15 = 15%), at constant weight. Text style's own: GLYPH_GROW (10%) stays the text family's. */
export const STYLE_GROW = 0.15;
/** Italic's extra slant at full hover, in degrees (Carbon's 17.3° → 23.3°). */
export const ITALIC_LEAN = 6;

// ── Bold ─────────────────────────────────────────────────────────────────────

/** Carbon's text--bold, the rest drawing. */
const BOLD =
  'M18.25,25H9V7h8.5a5.25,5.25,0,0,1,4,8.65A5.25,5.25,0,0,1,18.25,25ZM12,22h6.23a2.25,2.25,0,1,0,0-4.5H12Zm0-7.5h5.5a2.25,2.25,0,1,0,0-4.5H12Z';
/** The B's weight: stem, bars and bowls. */
const BOLD_WEIGHT = 3;
/** The middle bar (its centre is the B's, 16.25, 16, so it holds). */
const [MID0, MID1] = [14.5, 17.5];

/** Where two circles meet, on the right of the line from the first centre to the second. */
function meet([x1, y1]: Pt, r1: number, [x2, y2]: Pt, r2: number): Pt {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const k = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const [ux, uy] = [(x2 - x1) / d, (y2 - y1) / d];
  return [x1 + a * ux + k * uy, y1 + a * uy - k * ux];
}

/** The B's visual centre: its box (9–23.5 × 7–25). */
const BOLD_C: Pt = [16.25, 16];

/** The B's parts with its box scaled s about its centre, at constant weight. */
function boldParts(s: number) {
  // How far the box's sides move across (gx) and up and down (gy).
  const [gx, gy] = [(BOLD_C[0] - 9) * (s - 1), (BOLD_C[1] - 7) * (s - 1)];
  const [L, T, B] = [9 - gx, 7 - gy, 25 + gy];
  // The upper bowl spans the top to the middle bar's foot, the lower one the middle bar's head to the bottom:
  // each grows gy/2 in radius and its centre moves gx − gy/2 right, so its right edge moves gx, with the box.
  const r1 = (MID1 - T) / 2;
  const r2 = (B - MID0) / 2;
  const dx = gx - gy / 2;
  const up: Pt = [17.5 + dx, T + r1];
  const low: Pt = [18.25 + dx, B - r2];
  return { L, T, B, r1, r2, up, low, lowIn: 18.23 + dx };
}
/** Carbon rounds the bowls' meeting point to (21.5, 15.65): the same offset at every scale keeps the motion continuous from rest. */
const MEET_FIX: Pt = /* @__PURE__ */ (() => {
  const p = boldParts(1);
  const [x, y] = meet(p.up, p.r1, p.low, p.r2);
  return [21.5 - x, 15.65 - y];
})();

/** The B with its box scaled s about its centre (1 = Carbon's, exactly). */
export function boldD(s: number): string {
  if (s === 1) {
    return BOLD;
  }
  const { L, T, B, r1, r2, up, low, lowIn } = boldParts(s);
  const [jx, jy] = meet(up, r1, low, r2);
  const [J, W] = [`${f(jx + MEET_FIX[0])} ${f(jy + MEET_FIX[1])}`, BOLD_WEIGHT];
  const [i1, i2] = [r1 - W, r2 - W];
  return (
    `M${f(low[0])} ${f(B)}H${f(L)}V${f(T)}H${f(up[0])}A${f(r1)} ${f(r1)} 0 0 1 ${J}A${f(r2)} ${f(r2)} 0 0 1 ${f(low[0])} ${f(B)}Z` +
    `M${f(L + W)} ${f(B - W)}H${f(lowIn)}A${f(i2)} ${f(i2)} 0 1 0 ${f(lowIn)} ${f(MID1)}H${f(L + W)}Z` +
    `M${f(L + W)} ${f(MID0)}H${f(up[0])}A${f(i1)} ${f(i1)} 0 1 0 ${f(up[0])} ${f(T + W)}H${f(L + W)}Z`
  );
}

export const TextBoldSpec = /* @__PURE__ */ hoverIcon('TextBold', {
  geo: ({ h }) => ({ letter: { d: boldD(1 + STYLE_GROW * h) } }),
  static: /* @__PURE__ */ carbonArt(TextBold32),
});

// ── Italic ───────────────────────────────────────────────────────────────────

/** Carbon's text--italic, the rest drawing. */
const ITALIC =
  'M25 9 25 7 12 7 12 9 17.14 9 12.77 23 7 23 7 25 20 25 20 23 14.86 23 19.23 9 25 9z';
/** Carbon's slant (x per unit up, 17.3°), and the stem's width across it: a 2.09 run across a row is Carbon's 2px weight. */
const SLANT = (17.14 - 12.77) / 14;
const STEM_W = (19.23 - 17.14) / Math.hypot(1, SLANT);

/**
 * The I scaled s in its own slanted frame, and its stem leaning `lean`
 * degrees past Carbon's slant, about its centre (16, 16) (1, 0 = Carbon's,
 * exactly). Serifs 2px tall and horizontal, riding the stem's ends; the
 * stem's width across its slant held.
 */
export function italicD(s: number, lean = 0): string {
  if (s === 1 && lean === 0) {
    return ITALIC;
  }
  const k = Math.tan(Math.atan(SLANT) + (lean * Math.PI) / 180);
  const run = STEM_W * Math.hypot(1, k); // the stem's width across a row at slant k
  // The serifs move gy up and down and lengthen gx at each end (half a serif, 6.5, scaled).
  const [gx, gy] = [6.5 * (s - 1), 9 * (s - 1)];
  const [T, B] = [7 - gy, 25 + gy];
  // The stem's centreline runs through the centre at slant k. Each serif keeps Carbon's place on it (so Carbon's
  // rounding rides along) as its mid-height (T + 1, B − 1) moves along the line: the top one shifts by `shift`,
  // the bottom one by its mirror.
  const at = (y: number) => 16 + (16 - y) * k;
  const shift = at(T + 1) - (16 + 8 * SLANT);
  const [top, foot] = [at(T + 2), at(B - 2)];
  // Point for point Carbon's outline (its last point repeats its first).
  const pts: Pt[] = [
    [25 + gx + shift, T + 2],
    [25 + gx + shift, T],
    [12 - gx + shift, T],
    [12 - gx + shift, T + 2],
    [top - run / 2, T + 2],
    [foot - run / 2, B - 2],
    [7 - gx - shift, B - 2],
    [7 - gx - shift, B],
    [20 + gx - shift, B],
    [20 + gx - shift, B - 2],
    [foot + run / 2, B - 2],
    [top + run / 2, T + 2],
    [25 + gx + shift, T + 2],
  ];
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
}

export const TextItalicSpec = /* @__PURE__ */ hoverIcon('TextItalic', {
  geo: ({ h }) => ({
    letter: { d: italicD(1 + STYLE_GROW * h, ITALIC_LEAN * h) },
  }),
  static: /* @__PURE__ */ carbonArt(TextItalic32),
});

// ── Underline ────────────────────────────────────────────────────────────────

/** Carbon's text--underline, the rest drawing: the U, and the rule. */
const UNDER_U =
  'M16,23a7,7,0,0,1-7-7V5h2V16a5,5,0,0,0,10,0V5h2V16A7,7,0,0,1,16,23Z';
const UNDER_RULE = 'M4 26H28V28H4z';

/** The U scaled s about its box's centre (16, 14) (1 = Carbon's, exactly): 2px walls. */
export function underlineU(s: number): string {
  if (s === 1) {
    return UNDER_U;
  }
  const R = 7 * s; // the bowl's outer radius
  const [r, cy, top] = [R - 2, 14 + 2 * s, 14 - 9 * s];
  const bottom = cy + R;
  return (
    `M16 ${f(bottom)}A${f(R)} ${f(R)} 0 0 1 ${f(16 - R)} ${f(cy)}V${f(top)}H${f(16 - r)}V${f(cy)}` +
    `A${f(r)} ${f(r)} 0 0 0 ${f(16 + r)} ${f(cy)}V${f(top)}H${f(16 + R)}V${f(cy)}A${f(R)} ${f(R)} 0 0 1 16 ${f(bottom)}Z`
  );
}

/**
 * The rule as the U scales s: rigidly down with the U's bottom (9(s − 1), so
 * the 3px gap holds), and as much longer at each end as the U widens a side
 * (7(s − 1)).
 */
export function underlineRule(s: number): string {
  if (s === 1) {
    return UNDER_RULE;
  }
  const [ext, dy] = [7 * (s - 1), 9 * (s - 1)];
  return rectPath(4 - ext, 26 + dy, 28 + ext, 28 + dy);
}

export const TextUnderlineSpec = /* @__PURE__ */ hoverIcon('TextUnderline', {
  // Carbon's order: the rule, then the U. One group, no stagger.
  geo: ({ h }) => {
    const s = h <= 0 ? 1 : 1 + STYLE_GROW * h;
    return { rule: { d: underlineRule(s) }, letter: { d: underlineU(s) } };
  },
  static: /* @__PURE__ */ carbonArt(TextUnderline32),
});

// ── Sql ──────────────────────────────────────────────────────────────────────

/** Carbon's sql, letter by letter, absolute. */
const SQL_S =
  'M8 23H2V21H8V17H4A2 2 0 0 1 2 15V11A2 2 0 0 1 4 9H10V11H4V15H8A2 2 0 0 1 10 17V21A2 2 0 0 1 8 23Z';
const SQL_Q =
  'M18 9H14A2 2 0 0 0 12 11V21A2 2 0 0 0 14 23H15V25A2 2 0 0 0 17 27H19V25H17V23H18A2 2 0 0 0 20 21V11A2 2 0 0 0 18 9ZM14 21V11H18V21Z';
const SQL_L = 'M24 21L24 9L22 9L22 23L30 23L30 21Z';
/** The 2px walls' centrelines across (the S's two columns, the Q's sides and tail, the L's stem) and down (the bars). */
const SQL_WALLS_X = [3, 9, 13, 16, 19, 23];
const SQL_WALLS_Y = [10, 16, 22, 26];
/** A coordinate on the word scaled s about c: a wall's edge stays 1px off its scaled centreline; anything else scales. */
function sqlAxis(walls: number[], c: number, s: number) {
  return (v: number) => {
    const w = walls.find((x) => Math.abs(v - x) <= 1);
    return w === undefined ? c + (v - c) * s : c + (w - c) * s + (v - w);
  };
}
export const SqlSpec = /* @__PURE__ */ hoverIcon('Sql', {
  geo: ({ h }) => {
    const s = 1 + STYLE_GROW * h;
    const [mx, my] = [sqlAxis(SQL_WALLS_X, 16, s), sqlAxis(SQL_WALLS_Y, 16, s)];
    const grow = (d: string) => mapPath(d, ([x, y]) => [mx(x), my(y)]);
    return {
      s: { d: grow(SQL_S) },
      q: { d: grow(SQL_Q) },
      l: { d: grow(SQL_L) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Sql32),
});
