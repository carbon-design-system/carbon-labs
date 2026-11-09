/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CheckmarkFilled16 from '@carbon/icons/es/checkmark--filled/16.js';
import CheckmarkFilled20 from '@carbon/icons/es/checkmark--filled/20.js';
import CheckmarkFilled24 from '@carbon/icons/es/checkmark--filled/24.js';
import CheckmarkFilled32 from '@carbon/icons/es/checkmark--filled/32.js';
import CheckmarkOutline32 from '@carbon/icons/es/checkmark--outline/32.js';
import RadioButton32 from '@carbon/icons/es/radio-button/32.js';
import {
  carbonArt,
  toggleIcon,
  type Shapes,
  type ToggleFrame,
} from '../../engine';
import { motionTokens, toEasing } from '../../tokens';
import {
  circlePts,
  clipConvex,
  polyPath,
  ringPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { f } from '../../paint';

const CCheckmarkFilled = /* @__PURE__ */ carbonArt(
  CheckmarkFilled16,
  CheckmarkFilled20,
  CheckmarkFilled24,
  CheckmarkFilled32
);
const CCheckmarkOutline = /* @__PURE__ */ carbonArt(CheckmarkOutline32);
const CRadioButton = /* @__PURE__ */ carbonArt(RadioButton32);

/**
 * Two checkmark toggles (no reference animation), on the frame engine.
 *
 * - `CheckmarkOutlineToggle`: empty circle ↔ `checkmark--outline`. Checking
 *   draws the check in from its short arm with a strong ease-out;
 *   unchecking wipes it away from the same (left) end, so it leaves the way
 *   it came rather than rewinding.
 * - `CheckmarkToggle`: `checkmark--outline` ↔ `checkmark--filled`. The
 *   fill grows out from the centre and the check becomes a knockout in it as
 *   the fill passes; un-filling punches the fill out from the centre (§7.7)
 *   and the stroked check reappears behind the hole.
 *
 * Hover (both, any state): the ring grows r 13 → 14 and the check grows 20%
 * about (16.004, 16.148), at constant line weight, same as
 * `CheckmarkOutline` (as its reference animation).
 *
 * Frame: `h` hover; `p` the check's drawn end (outline) or fill radius
 * (filled); `e` the check's wiped start (outline) or the hole's radius
 * (filled).
 *
 * No masks: the outline check draws with a dash along its own length. In the
 * filled toggle the fill, its hole and the knocked-out check are one even-odd
 * path, as is the stroked check with the fill's and the hole's discs (so it
 * shows only outside the fill, or inside the hole).
 *
 * Carbon draws `checkmark--filled` separately at 16, 20 and 24px (a
 * slightly larger disc and a heavier check than the 32px scaled down), so
 * the filled state uses that size's disc radius and check, converted to the
 * 32-unit grid. `checkmark--outline` has only the 32px drawing.
 *
 * At rest in the filled state the ring is hidden: its outer edge sits
 * exactly on the disc's, and two anti-aliased edges on top of each other
 * would darken the rim.
 */

type Ease = ReturnType<typeof toEasing>;
// Much stronger than the entrance token: most of the stroke lands
// in the first third, then it settles. No motion token is this steep yet.
const STRONG_OUT = [0.16, 1, 0.3, 1] as unknown as Ease;
export const DRAW_IN = {
  duration: motionTokens.duration.moderate01 / 1000,
  ease: STRONG_OUT,
};
export const DRAW_OUT = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.exit),
};
const FILL = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.entrance),
};

const CENTRE: Pt = [16, 16];
const GROW = 0.2;
export const CHECK_PIVOT: Pt = [16.004, 16.148];
// Centrelines of Carbon's checks: 2px on the outline icon, a knockout on the filled one.
export const CHECK_OUTLINE: Pt[] = [
  [9.7065, 15.7065],
  [14, 20],
  [22.2925, 11.7075],
];
// Carbon's filled art per size, in 32-unit coordinates: disc radius, check
// centreline and check weight.
const FILLED_ART: Record<
  16 | 20 | 24 | 32,
  { r: number; check: Pt[]; w: number }
> = {
  16: {
    r: 14,
    check: [
      [9.5, 15.8],
      [14, 20.3],
      [22.9, 11.6],
    ],
    w: 2.408,
  },
  20: {
    r: 14.4,
    check: [
      [9.6, 15.68],
      [13.92, 20],
      [22.4, 11.52],
    ],
    w: 2.263,
  },
  24: {
    r: 14.6667,
    check: [
      [9.5333, 15.7333],
      [13.9333, 20.1333],
      [22.6, 11.6667],
    ],
    w: 2.36,
  },
  32: {
    r: 14,
    check: [
      [9.7953, 15.7954],
      [14, 20],
      [22.2079, 11.793],
    ],
    w: 2.25,
  },
};

const ringD = (h: number) => ringPath(CENTRE, 13 + h, 2);
const checkPts = (h: number) =>
  scalePts(CHECK_OUTLINE, CHECK_PIVOT, 1 + GROW * h);
const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'miter',
} as const;

/** A circle as two exact arcs; nothing at r ≤ 0. */
const circleD = ([cx, cy]: Pt, r: number) =>
  r > 1e-4
    ? `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`
    : '';

/** The outline of a three-point polyline stroked `w` wide: miter join, butt ends. */
export function strokePoly([a, b, c]: readonly Pt[], w: number): Pt[] {
  const normal = (p: Pt, q: Pt): Pt => {
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [(-(q[1] - p[1]) * w) / 2 / l, ((q[0] - p[0]) * w) / 2 / l];
  };
  const [n1, n2] = [normal(a, b), normal(b, c)];
  const side = (s: 1 | -1): Pt[] => {
    const [p1, p2]: Pt[] = [
      [a[0] + s * n1[0], a[1] + s * n1[1]],
      [b[0] + s * n1[0], b[1] + s * n1[1]],
    ];
    const [p3, p4]: Pt[] = [
      [b[0] + s * n2[0], b[1] + s * n2[1]],
      [c[0] + s * n2[0], c[1] + s * n2[1]],
    ];
    const den =
      (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
    const t =
      ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) /
      den;
    return [p1, [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])], p4];
  };
  return [...side(1), ...side(-1).reverse()];
}

/** `poly` inside the disc of radius r about the centre (empty at r ≤ 0). */
function inDisc(poly: readonly Pt[], r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const part = clipConvex(poly, circlePts(CENTRE, r, 128));
  return part.length > 2 ? polyPath(part, true) : '';
}

// ── Outline: empty circle ↔ checkmark--outline ───────────────────────────────

function outlineGeo({ h, p, e }: ToggleFrame): Shapes {
  return {
    ring: { d: ringD(h) },
    // The visible stretch of the check, from `e` to `p` along it (pathLength 1).
    check: {
      d: polyPath(checkPts(h)),
      ...LINE,
      pathLength: 1,
      strokeDasharray: `${Math.max(p - e, 0)} 2`,
      strokeDashoffset: -e || 0,
    },
  };
}

export const CheckmarkOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'unchecked' | 'checked'
>('CheckmarkOutlineToggle', {
  states: ['unchecked', 'checked'],
  statics: [CRadioButton, CCheckmarkOutline],
  geo: outlineGeo,
  change: (turningOn, fr, tween, repaint) => {
    // Mid-wipe: bring the wiped part back. Otherwise draw in.
    if (turningOn) {
      return fr.e > 0 ? tween('e', 0, DRAW_IN) : tween('p', 1, DRAW_IN);
    }
    return tween('e', fr.p, DRAW_OUT, () => {
      fr.p = 0;
      fr.e = 0;
      repaint();
    });
  },
});

// ── Filled: checkmark--outline ↔ checkmark--filled ───────────────────────────

function filledGeo({ h, p, e }: ToggleFrame, size?: number): Shapes {
  const art = FILLED_ART[size as 16 | 20 | 24 | 32] ?? FILLED_ART[32];
  const r = art.r + h;
  const [fillR, holeR] = [p * r, e * r];
  const check = strokePoly(checkPts(h), 2);
  const knock = strokePoly(
    scalePts(art.check, CHECK_PIVOT, 1 + GROW * h),
    art.w
  );
  return {
    ring: { d: ringD(h), opacity: p >= 1 && e <= 0 ? 0 : 1 },
    // The 2px check: shown outside the fill and inside the hole.
    check: {
      d: polyPath(check, true) + inDisc(check, fillR) + inDisc(check, holeR),
      fillRule: 'evenodd',
    },
    // The fill, less the hole, with the check knocked out of it.
    fill: {
      d:
        circleD(CENTRE, fillR) +
        circleD(CENTRE, holeR) +
        inDisc(knock, fillR) +
        inDisc(knock, holeR),
      fillRule: 'evenodd',
    },
  };
}

export const CheckmarkToggleSpec = /* @__PURE__ */ toggleIcon<
  'outline' | 'filled'
>('CheckmarkToggle', {
  states: ['outline', 'filled'],
  statics: [CCheckmarkOutline, CCheckmarkFilled],
  geo: filledGeo,
  change: (turningOn, fr, tween, repaint) => {
    // Mid-erase: close the hole back up. Otherwise grow the fill from the centre.
    if (turningOn) {
      return fr.e > 0 ? tween('e', 0, FILL) : tween('p', 1, FILL);
    }
    if (fr.p < 1) {
      return tween('p', 0, FILL);
    }
    return tween('e', 1, FILL, () => {
      fr.p = 0;
      fr.e = 0;
      repaint();
    });
  },
});
