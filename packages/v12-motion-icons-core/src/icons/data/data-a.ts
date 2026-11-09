/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Activity32 from '@carbon/icons/es/activity/32.js';
import Archive32 from '@carbon/icons/es/archive/32.js';
import Calculation32 from '@carbon/icons/es/calculation/32.js';
import DataBase32 from '@carbon/icons/es/data--base/32.js';
import DataCategorical32 from '@carbon/icons/es/data--categorical/32.js';
import DataConnected32 from '@carbon/icons/es/data--connected/32.js';
import DataSet32 from '@carbon/icons/es/data--set/32.js';
import DataAnalytics32 from '@carbon/icons/es/data-analytics/32.js';
import Boolean32 from '@carbon/icons/es/boolean/32.js';
import SkillLevel32 from '@carbon/icons/es/skill-level/32.js';
import SkillLevelAdvanced32 from '@carbon/icons/es/skill-level--advanced/32.js';
import SkillLevelBasic32 from '@carbon/icons/es/skill-level--basic/32.js';
import SkillLevelIntermediate32 from '@carbon/icons/es/skill-level--intermediate/32.js';
import {
  carbonArt,
  hoverIcon,
  mirrored,
  stateIcon,
  toggleIcon,
  TOGGLE_IN,
  TOGGLE_OUT,
  type CarbonIcon,
  type Shapes,
  type StateIconProps,
  withStatic,
} from '../../engine';
import {
  circlePts,
  discFillPath,
  insetPoly,
  polyPath,
  rectPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { ENTRANCE, together } from '../../ease';
import { EVENODD, f, LINE } from '../../paint';

const CBoolean = /* @__PURE__ */ carbonArt(Boolean32);
const CSkillLevel = /* @__PURE__ */ carbonArt(SkillLevel32);
const CSkillLevelAdvanced = /* @__PURE__ */ carbonArt(SkillLevelAdvanced32);
const CSkillLevelBasic = /* @__PURE__ */ carbonArt(SkillLevelBasic32);
const CSkillLevelIntermediate = /* @__PURE__ */ carbonArt(
  SkillLevelIntermediate32
);

const three = /* @__PURE__ */ together();
/** An outlined bar (2px walls, square corners) from x0 to x1, top to the baseline at 30. */
const outlineBar = (x0: number, x1: number, top: number) =>
  rectPath(x0, top, x1, 30) + rectPath(x0 + 2, top + 2, x1 - 2, 28);

// ── Skill levels ─────────────────────────────────────────────────────────────

// Each bar rises 2px, together (no stagger). `filled` bars are solid.
const SKILL: Array<[x0: number, x1: number, top: number]> = [
  [2, 10, 18],
  [12, 20, 12],
  [22, 30, 4],
];
const skill = (name: string, filled: number) =>
  hoverIcon(name, {
    hover: three.hover,
    geo: ({ h }) => {
      const s: Shapes = {};
      SKILL.forEach(([x0, x1, top], i) => {
        const t = top - 2 * three.at(h, i);
        s[`b${i}`] =
          i < filled
            ? { d: rectPath(x0, t, x1, 30) }
            : { d: outlineBar(x0, x1, t), ...EVENODD };
      });
      return s;
    },
  });
export const SkillLevelSpec = /* @__PURE__ */ withStatic(
  skill('SkillLevel', 0),
  /* @__PURE__ */ carbonArt(SkillLevel32)
);
export const SkillLevelBasicSpec = /* @__PURE__ */ withStatic(
  skill('SkillLevelBasic', 1),
  /* @__PURE__ */ carbonArt(SkillLevelBasic32)
);
export const SkillLevelIntermediateSpec = /* @__PURE__ */ withStatic(
  skill('SkillLevelIntermediate', 2),
  /* @__PURE__ */ carbonArt(SkillLevelIntermediate32)
);
export const SkillLevelAdvancedSpec = /* @__PURE__ */ withStatic(
  skill('SkillLevelAdvanced', 3),
  /* @__PURE__ */ carbonArt(SkillLevelAdvanced32)
);

// Skill level toggle: each click fills the next bar, none → basic →
// intermediate → advanced, and a click on advanced empties all three back
// to none. A bar fills with the house disc fill (a disc grows from the
// centre of its inside); emptying grows a hole from each bar's centre, all
// three together, on the faster exit timing. Hover: the bars rise 2px, as
// the static icons'.
//
// A state icon (makeStateIcon, as the checkbox and volume levels): `p` is
// the level (0 none … 3 advanced), each step tweens it one level up from
// wherever it is, and the geometry is periodic, so level 4 (the end of the
// emptying) is level 0 again and `p` is wrapped back once it lands. A
// controlled jump (`value`) runs forward round the cycle to its level.
export type SkillLevelState = 'none' | 'basic' | 'intermediate' | 'advanced';
const SKILL_STATES: readonly SkillLevelState[] = [
  'none',
  'basic',
  'intermediate',
  'advanced',
];
const SKILL_STATICS: Record<SkillLevelState, CarbonIcon> = {
  none: CSkillLevel,
  basic: CSkillLevelBasic,
  intermediate: CSkillLevelIntermediate,
  advanced: CSkillLevelAdvanced,
};
function skillLevelShapes(h: number, level: number): Shapes {
  const L = ((level % 4) + 4) % 4;
  const s: Shapes = {};
  SKILL.forEach(([x0, x1, top], i) => {
    const t = top - 2 * three.at(h, i);
    const [fill, hole] =
      L <= 3 ? [Math.min(1, Math.max(0, L - i)), 0] : [1, L - 3];
    // The fill reaches 0.5px into the walls, so no seam shows when full.
    const inside: Pt[] = [
      [x0 + 1.5, t + 1.5],
      [x1 - 1.5, t + 1.5],
      [x1 - 1.5, 28.5],
      [x0 + 1.5, 28.5],
    ];
    s[`b${i}`] = { d: outlineBar(x0, x1, t), ...EVENODD };
    s[`f${i}`] = {
      d: discFillPath(inside, [(x0 + x1) / 2, (t + 30) / 2], fill, hole),
      ...EVENODD,
    };
  });
  return s;
}
/**
 * Skill level, clicking through none → basic → intermediate → advanced →
 * none. `value` / `onChange` (controlled) or `initial`; the deprecated
 * boolean `toggled` / `onToggle` still work (`false` is none, `true` basic).
 */
export const SkillLevelToggleSpec = /* @__PURE__ */ stateIcon<SkillLevelState>(
  'SkillLevelToggle',
  {
    toggledState: 'basic',
    states: SKILL_STATES,
    statics: SKILL_STATICS,
    rest: (s) => ({ p: SKILL_STATES.indexOf(s) }),
    geo: ({ h = 0, p = 0 }) => skillLevelShapes(h, p),
    change: (prev, next, fr, tween, repaint) => {
      const from = Math.ceil(fr.p - 1e-6); // the level it's at, or heading for
      const i = SKILL_STATES.indexOf(next);
      // A click is one step: the next level up from wherever it is. A jump runs forward to its level.
      const to =
        (i - SKILL_STATES.indexOf(prev) + 4) % 4 === 1
          ? from + 1
          : from + ((((i - from) % 4) + 4) % 4);
      return tween('p', to, to % 4 === 0 ? TOGGLE_OUT : TOGGLE_IN, () => {
        if (fr.p >= 4) {
          fr.p -= 4;
          repaint();
        }
      });
    },
  }
);

/** SkillLevelToggle's props: the state icons' `value` / `onChange`, plus the old boolean shorthand. */
export type SkillLevelToggleProps = StateIconProps<SkillLevelState> & {
  /** @deprecated Use `value`. `false` is none, `true` basic. */
  toggled?: boolean;
  /** @deprecated Use `onChange`. The boolean is `next === 'basic'`. */
  onToggle?: (next: SkillLevelState, toggled: boolean) => void;
};

// ── Activity ─────────────────────────────────────────────────────────────────

// The pulse's peak rises 2px and its trough dips 2px (its 2px centreline,
// fitted to Carbon, round joins).
export const ActivitySpec = /* @__PURE__ */ hoverIcon('Activity', {
  geo: ({ h }) => ({
    pulse: {
      d: `M2 16H7.04L12 ${f(28.03 + 2 * h)}L21 ${f(4.08 - 2 * h)}L24.98 16H30`,
      ...LINE,
      strokeLinejoin: 'round',
    },
  }),
  static: /* @__PURE__ */ carbonArt(Activity32),
});

// ── Archive ──────────────────────────────────────────────────────────────────

// The bottom drawer widens 2px each side (walls hold 2px) and its handle
// lengthens 1px at each end; the cabinet holds.
export const ArchiveSpec = /* @__PURE__ */ hoverIcon('Archive', {
  geo: ({ h }) => {
    const w = 2 * h;
    return {
      cabinet: {
        d:
          rectPath(6, 2, 26, 16) +
          rectPath(8, 4, 24, 8) +
          rectPath(8, 10, 24, 14),
        ...EVENODD,
      },
      drawer: {
        d: `M${f(6 - w)} 14V28A2 2 0 0 0 ${f(8 - w)} 30H${f(24 + w)}A2 2 0 0 0 ${f(26 + w)} 28V14Z${rectPath(8 - w, 16, 24 + w, 28)}${rectPath(14 - h, 19, 18 + h, 21)}`,
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Archive32),
});

// ── Boolean ──────────────────────────────────────────────────────────────────

// Hover: both circles grow 1px. Toggle (true ↔ false): the fills swap with
// the house disc fill — the hollow circle fills from its centre while the
// filled one empties through a hole from its centre; back again, the other
// way round.
function booleanShapes(h: number, p: number, e: number): Shapes {
  const [l, r]: Pt[] = [
    [9, 16],
    [23, 16],
  ];
  const R = 6 + h; // ring centre radius (outer edge 7 at rest)
  // p: true → false (left empties, right fills); e: false → true (left fills, right empties).
  const [lFill, lHole, rFill, rHole] = e > 0 ? [e, 0, 1, e] : [1, p, p, 0];
  return {
    rings: { d: ringPath(l, R, 2) + ringPath(r, R, 2) },
    left: {
      d: discFillPath(circlePts(l, R - 0.5), l, lFill, lHole),
      ...EVENODD,
    },
    right: {
      d: discFillPath(circlePts(r, R - 0.5), r, rFill, rHole),
      ...EVENODD,
    },
  };
}
export const BooleanSpec = /* @__PURE__ */ hoverIcon('Boolean', {
  geo: ({ h }) => booleanShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(Boolean32),
});
/** Carbon's `boolean` mirrored: the false state (hollow left, filled right). Mirroring keeps line weight. */
const CBooleanFalse = mirrored(CBoolean);
export const BooleanToggleSpec = /* @__PURE__ */ toggleIcon<'true' | 'false'>(
  'BooleanToggle',
  {
    states: ['true', 'false'],
    statics: [CBoolean, CBooleanFalse],
    geo: ({ h, p, e }) => booleanShapes(h, p, e),
    change: (toFalse, fr, tween, repaint) => {
      if (toFalse) {
        return tween('p', 1, TOGGLE_IN);
      }
      return tween('e', 1, TOGGLE_OUT, () => {
        fr.p = 0;
        fr.e = 0;
        repaint();
      });
    },
  }
);

// ── Calculation ──────────────────────────────────────────────────────────────

// Every sign's lines extend 1px at each end, and each sign steps 1px out
// towards its own corner: plus up-left, minus up-right, times down-right,
// equals down-left. Nothing rotates.
const CALC_TIMES = 6.07;
export const CalculationSpec = /* @__PURE__ */ hoverIcon('Calculation', {
  geo: ({ h }) => {
    const t = (CALC_TIMES + h) * Math.SQRT1_2;
    const [x0, x1] = [4 - h, 14 + h];
    return {
      plus: {
        d: `M${f(x0)} 9H${f(x1)}M9 ${f(x0)}V${f(x1)}`,
        ...LINE,
        transform: `translate(${f(-h)} ${f(-h)})`,
      },
      times: {
        d: `M${f(23 - t)} ${f(22 - t)}L${f(23 + t)} ${f(22 + t)}M${f(23 - t)} ${f(22 + t)}L${f(23 + t)} ${f(22 - t)}`,
        ...LINE,
        transform: `translate(${f(h)} ${f(h)})`,
      },
      minus: {
        d: rectPath(18 - h, 8, 28 + h, 10),
        transform: `translate(${f(h)} ${f(-h)})`,
      },
      equals: {
        d: rectPath(x0, 19, x1, 21) + rectPath(x0, 24, x1, 26),
        transform: `translate(${f(-h)} ${f(h)})`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Calculation32),
});

// ── Data base, categorical, connected, set ───────────────────────────────────

// Data base: each server section widens 1px each side (walls hold 2px) as
// its indicator dot grows, all together (a stagger
// doesn't read at small sizes). Sections share their
// divider walls, so the overlap reads as one wall at rest.
const DB_SECTIONS: Array<[y0: number, y1: number]> = [
  [3, 13],
  [11, 21],
  [19, 29],
];
export const DataBaseSpec = /* @__PURE__ */ hoverIcon('DataBase', {
  hover: three.hover,
  geo: ({ h }) => {
    const s: Shapes = {};
    DB_SECTIONS.forEach(([y0, y1], i) => {
      const k = three.at(h, i);
      const [x0, x1] = [6 - k, 26 + k];
      const top =
        i === 0
          ? `V${y0 + 2}A2 2 0 0 1 ${f(x0 + 2)} ${y0}H${f(x1 - 2)}A2 2 0 0 1 ${f(x1)} ${y0 + 2}`
          : `V${y0}H${f(x1)}`;
      const bottom =
        i === 2
          ? `V${y1 - 2}A2 2 0 0 1 ${f(x1 - 2)} ${y1}H${f(x0 + 2)}A2 2 0 0 1 ${f(x0)} ${y1 - 2}Z`
          : `V${y1}H${f(x0)}Z`;
      s[`s${i}`] = {
        d: `M${f(x0)} ${i === 2 ? y1 - 2 : y1}${top}${bottom}${rectPath(x0 + 2, y0 + 2, x1 - 2, y1 - 2)}`,
        ...EVENODD,
      };
      s[`d${i}`] = { tag: 'circle', cx: 11, cy: 8 + 8 * i, r: f(1 + 0.5 * k) };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(DataBase32),
});

// Data categorical: the triangle, circle and square each grow 1px out, in
// together (no stagger) (all 2px centrelines, round joins as Carbon's).
const CAT_TRI: Pt[] = [
  [10, 13],
  [22, 13],
  [16, 3],
];
const CAT_SQUARE: Pt[] = [
  [19, 19],
  [29, 19],
  [29, 29],
  [19, 29],
];
export const DataCategoricalSpec = /* @__PURE__ */ hoverIcon(
  'DataCategorical',
  {
    hover: three.hover,
    geo: ({ h }) => {
      const [a, b, c] = [0, 1, 2].map((i) => three.at(h, i));
      return {
        triangle: {
          d: polyPath(a ? insetPoly(CAT_TRI, -a) : CAT_TRI, true),
          ...LINE,
          strokeLinejoin: 'round',
        },
        circle: { d: ringPath([8, 24], 5 + b, 2) },
        square: {
          d: polyPath(c ? insetPoly(CAT_SQUARE, -c) : CAT_SQUARE, true),
          ...LINE,
          strokeLinejoin: 'round',
        },
      };
    },
    static: /* @__PURE__ */ carbonArt(DataCategorical32),
  }
);

// Data connected: the brackets open 1px each way and the two nodes slide
// 1px apart along their link, which stretches to follow.
export const DataConnectedSpec = /* @__PURE__ */ hoverIcon('DataConnected', {
  geo: ({ h }) => {
    const k = h * Math.SQRT1_2;
    const [a, b]: Pt[] = [
      [11.5 - k, 11.5 - k],
      [20.5 + k, 20.5 + k],
    ];
    return {
      brackets: {
        d: 'M30 30 24 30 24 28 28 28 28 4 24 4 24 2 30 2 30 30z',
        transform: `translate(${f(h)} 0)`,
      },
      left: {
        d: 'M8 30 2 30 2 2 8 2 8 4 4 4 4 28 8 28 8 30z',
        transform: `translate(${f(-h)} 0)`,
      },
      nodes: {
        d:
          ringPath(a, 3.53, 2) +
          `M${f(b[0] - 4.5)} ${f(b[1])}A4.5 4.5 0 1 0 ${f(b[0] + 4.5)} ${f(b[1])}A4.5 4.5 0 1 0 ${f(b[0] - 4.5)} ${f(b[1])}Z`,
        ...EVENODD,
      },
      link: {
        d: `M${f(a[0] + 3.3)} ${f(a[1] + 3.3)}L${f(b[0] - 2.5)} ${f(b[1] - 2.5)}`,
        ...LINE,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(DataConnected32),
});

// Data set: every digit grows 1px out on each side, together (no stagger),
// at constant 2px line weight: the 0s' rings widen 1px, and the 1's
// stem, flag and base stretch 1px at their outer ends (the flag rises 0.5px
// to keep its place on the taller stem).
const four = /* @__PURE__ */ together();
const dataOne = (k: number) =>
  rectPath(23, 3 - k, 25, 14 + k) +
  rectPath(20 - k, 5 - 0.5 * k, 23, 7 - 0.5 * k) +
  rectPath(20 - k, 12 + k, 28 + k, 14 + k);
export const DataSetSpec = /* @__PURE__ */ hoverIcon('DataSet', {
  hover: four.hover,
  geo: ({ h }) => {
    const s: Shapes = { one: { d: dataOne(four.at(h, 1)) } };
    // Radius 4.495 matches Carbon's Bézier circles at every size.
    (
      [
        [8.5, 8.5],
        [8.5, 23.5],
        [23.5, 23.5],
      ] as Pt[]
    ).forEach((c, i) => {
      s[`z${i}`] = { d: ringPath(c, 4.495 + four.at(h, i ? i + 1 : 0), 2) };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(DataSet32),
});

// Data analytics: the magnifier turns 15° counter-clockwise about its lens
// centre (as ImageSearch's does) while the three bars rise 2px, together
// (no stagger). The lens is rebuilt as a 2px centreline arc whose open
// ends stay on Carbon's radial cuts (233.13° and 143.13°), so the negative
// space to the bars holds; the ring is round, so only the handle shows the
// turn.
const LENS_C: Pt = [14, 14];
const LENS_R = 10;
const LENS_CUTS = [233.13, 143.13 + 360];
const HANDLE_END = 15.2929 * Math.SQRT2;
const polar = (deg: number, r: number): Pt => [
  LENS_C[0] + r * Math.cos((deg * Math.PI) / 180),
  LENS_C[1] + r * Math.sin((deg * Math.PI) / 180),
];
const [LENS_A, LENS_B] = LENS_CUTS.map((a) => polar(a, LENS_R));
const LENS_ARC = /* @__PURE__ */ (() =>
  `M${f(LENS_A[0])} ${f(LENS_A[1])}A${LENS_R} ${LENS_R} 0 1 1 ${f(LENS_B[0])} ${f(LENS_B[1])}`)();
const DA_BARS: Array<[x: number, top: number]> = [
  [2, 7],
  [7, 13],
  [12, 11],
];
export const DataAnalyticsSpec = /* @__PURE__ */ hoverIcon('DataAnalytics', {
  hover: three.hover,
  geo: ({ h }) => {
    const a = 45 - 15 * ENTRANCE(h);
    const [p, q] = [polar(a, LENS_R), polar(a, HANDLE_END)];
    const s: Shapes = {
      lens: { d: LENS_ARC, ...LINE },
      handle: { d: `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`, ...LINE },
    };
    DA_BARS.forEach(([x, top], i) => {
      s[`b${i}`] = { d: rectPath(x, top - 2 * three.at(h, i), x + 2, 17) };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(DataAnalytics32),
});
