/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CaretDown32 from '@carbon/icons/es/caret--down/32.js';
import CaretLeft32 from '@carbon/icons/es/caret--left/32.js';
import CaretRight32 from '@carbon/icons/es/caret--right/32.js';
import CaretUp32 from '@carbon/icons/es/caret--up/32.js';
import ChevronDown16 from '@carbon/icons/es/chevron--down/16.js';
import ChevronDown32 from '@carbon/icons/es/chevron--down/32.js';
import ChevronLeft16 from '@carbon/icons/es/chevron--left/16.js';
import ChevronLeft32 from '@carbon/icons/es/chevron--left/32.js';
import ChevronRight16 from '@carbon/icons/es/chevron--right/16.js';
import ChevronRight32 from '@carbon/icons/es/chevron--right/32.js';
import ChevronUp16 from '@carbon/icons/es/chevron--up/16.js';
import ChevronUp32 from '@carbon/icons/es/chevron--up/32.js';
import {
  carbonArt,
  toggleIcon,
  TOGGLE_IN,
  type CarbonIcon,
  type Shapes,
} from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import { foldProgress } from '../../ease';
import { lerp } from '../../paint';

const CCaretDown = /* @__PURE__ */ carbonArt(CaretDown32);
const CCaretLeft = /* @__PURE__ */ carbonArt(CaretLeft32);
const CCaretRight = /* @__PURE__ */ carbonArt(CaretRight32);
const CCaretUp = /* @__PURE__ */ carbonArt(CaretUp32);
const CChevronDown = /* @__PURE__ */ carbonArt(ChevronDown16, ChevronDown32);
const CChevronLeft = /* @__PURE__ */ carbonArt(ChevronLeft16, ChevronLeft32);
const CChevronRight = /* @__PURE__ */ carbonArt(ChevronRight16, ChevronRight32);
const CChevronUp = /* @__PURE__ */ carbonArt(ChevronUp16, ChevronUp32);

/**
 * Direction toggles on the frame engine: Chevron and Caret, down ↔ up and
 * left ↔ right.
 *
 * Toggle: the glyph flips like the Chevron toggles (ChevronUpDownOutline):
 * it folds flat by 6/15 of the way on the exit ease, then opens the other
 * way on the entrance ease, 160ms both ways (both states are valid, so
 * neither is an exit). Not an in-plane rotation. The chevron folds to a
 * straight 2px line; the caret, as its reference animation, to a flat 16 × 2 bar.
 *
 * Hover: the glyph slides 2px the way it points (half the Chevron and Caret
 * hover icons' 4px): the slide follows the fold, so mid-flip (flat)
 * it doesn't move. Rest and both ends are Carbon's drawings.
 */

/** Points in the glyph's own axes: `a` along its pointing axis, `b` across it. */
type AB = readonly [number, number];

/**
 * One direction toggle. `off`, `mid`, `on`: the glyph's points at each end
 * and folded flat (in `a`, `b` axes); `vertical`: whether `a` is y; `dir`:
 * which way `off` points along `a` (+1 or −1; `on` points the other way).
 */
function dirToggle<S extends string>(
  name: string,
  states: readonly [S, S],
  statics: readonly [CarbonIcon, CarbonIcon],
  spec: {
    off: AB[];
    mid: AB[];
    on: AB[];
    vertical: boolean;
    dir: 1 | -1;
    draw: (pts: Pt[]) => Shapes;
  }
) {
  const geo = ({ h, p }: { h: number; p: number }): Shapes => {
    const q = foldProgress(p);
    const [from, to, t] =
      q <= 0.5 ? [spec.off, spec.mid, 2 * q] : [spec.mid, spec.on, 2 * q - 1];
    const slide = 2 * h * spec.dir * (1 - 2 * q); // half the hover icons' 4px
    const pts = from.map(([a, b], i): Pt => {
      const A = lerp(a, to[i][0], t) + slide;
      const B = lerp(b, to[i][1], t);
      return spec.vertical ? [B, A] : [A, B];
    });
    return spec.draw(pts);
  };
  return toggleIcon<S>(name, {
    states,
    statics,
    geo,
    // Linear: the geometry applies the fold's two-part easing itself.
    change: (turningOn, _fr, tween) =>
      tween('p', turningOn ? 1 : 0, {
        duration: TOGGLE_IN.duration,
        ease: [0, 0, 1, 1],
      }),
  });
}

// ── Chevrons ─────────────────────────────────────────────────────────────────
//
// Carbon's chevron as its centreline: arms 1.98px wide (1.4 × √2), mitred at
// the apex, butt ends, so the stroke lands exactly on Carbon's outline.
const W = 1.4 * Math.SQRT2;
const chevron = (pts: Pt[]): Shapes => ({
  chevron: {
    d: polyPath(pts),
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: W,
    strokeLinejoin: 'miter',
  },
});
// Down: ends at 11.3, apex at 20.6; up: ends at 20.7, apex at 11.4 (across: 6.7, 16, 25.3).
const CHEV_DOWN: AB[] = [
  [11.3, 6.7],
  [20.6, 16],
  [11.3, 25.3],
];
const CHEV_UP: AB[] = [
  [20.7, 6.7],
  [11.4, 16],
  [20.7, 25.3],
];
const flat = (a: AB[], b: AB[]): AB[] => {
  const m = (a[0][0] + a[1][0] + b[0][0] + b[1][0]) / 4;
  return a.map(([, x]) => [m, x] as AB);
};

export const ChevronDownToggleSpec = /* @__PURE__ */ makeChevron(
  'ChevronDownToggle',
  ['down', 'up'] as const,
  [CChevronDown, CChevronUp],
  CHEV_DOWN,
  CHEV_UP,
  true,
  1
);
// Left: apex at 11.4, ends at 20.7; right: apex at 20.6, ends at 11.3.
const CHEV_LEFT: AB[] = [
  [20.7, 6.7],
  [11.4, 16],
  [20.7, 25.3],
];
const CHEV_RIGHT: AB[] = [
  [11.3, 6.7],
  [20.6, 16],
  [11.3, 25.3],
];
export const ChevronLeftToggleSpec = /* @__PURE__ */ makeChevron(
  'ChevronLeftToggle',
  ['left', 'right'] as const,
  [CChevronLeft, CChevronRight],
  CHEV_LEFT,
  CHEV_RIGHT,
  false,
  -1
);

function makeChevron<S extends string>(
  name: string,
  states: readonly [S, S],
  statics: readonly [CarbonIcon, CarbonIcon],
  off: AB[],
  on: AB[],
  vertical: boolean,
  dir: 1 | -1
) {
  return dirToggle(name, states, statics, {
    off,
    on,
    mid: flat(off, on),
    vertical,
    dir,
    draw: chevron,
  });
}

// ── Carets ───────────────────────────────────────────────────────────────────
//
// Carbon's caret, as its reference animation: six points so the flat bar between
// the two ends matches point for point (base corners, base middle, tip).
const caret = (pts: Pt[]): Shapes => ({ caret: { d: polyPath(pts, true) } });
// [a, b] per point: base left, base middle, base right, base right, tip, base left.
const CARET_DOWN: AB[] = [
  [12, 8],
  [12, 16],
  [12, 24],
  [12, 24],
  [22, 16],
  [12, 8],
];
// Folded flat: the 2px bar across the middle (the base's edge first, then the tip's).
const CARET_MID: AB[] = [
  [15, 8],
  [15, 16],
  [15, 24],
  [17, 24],
  [17, 16],
  [17, 8],
];
const CARET_UP: AB[] = [
  [20, 8],
  [10, 16],
  [20, 24],
  [20, 24],
  [20, 16],
  [20, 8],
];
export const CaretDownToggleSpec = dirToggle(
  'CaretDownToggle',
  ['down', 'up'] as const,
  [CCaretDown, CCaretUp],
  {
    off: CARET_DOWN,
    mid: CARET_MID,
    on: CARET_UP,
    vertical: true,
    dir: 1,
    draw: caret,
  }
);
// Left: base at x 20, tip at 10; right: base at 12, tip at 22. Mid: the bar x 15–17,
// its base edge (17) and tip edge (15) the other way round from the vertical bar.
const CARET_MID_X: AB[] = [
  [17, 8],
  [17, 16],
  [17, 24],
  [15, 24],
  [15, 16],
  [15, 8],
];
const CARET_LEFT: AB[] = [
  [20, 8],
  [20, 16],
  [20, 24],
  [20, 24],
  [10, 16],
  [20, 8],
];
const CARET_RIGHT: AB[] = [
  [12, 8],
  [22, 16],
  [12, 24],
  [12, 24],
  [12, 16],
  [12, 8],
];
export const CaretLeftToggleSpec = dirToggle(
  'CaretLeftToggle',
  ['left', 'right'] as const,
  [CCaretLeft, CCaretRight],
  {
    off: CARET_LEFT,
    mid: CARET_MID_X,
    on: CARET_RIGHT,
    vertical: false,
    dir: -1,
    draw: caret,
  }
);
