/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The chart family's tuning values, in one frozen object. Charts read them;
// nothing sets them at run time, and none is a prop. Motion is token names,
// colors are theme roles, geometry is px. Keys like `C2` name the chart a
// value belongs to inside the family; no public name uses them.

import type {
  distanceTokens,
  DurationToken,
  staggerSteps,
  toEasing,
} from '@carbon-labs/v12-motion';
import type { ChartColorRole } from './color';
import type { ChartSize } from './types';

/** An easing token by name and mode, as the motion seam takes it. */
export type ChartEasing = Parameters<typeof toEasing>[0];
/** A distance token's name. */
export type ChartDistance = keyof typeof distanceTokens;
/** A stagger step's name. */
export type ChartStaggerStep = keyof typeof staggerSteps;

/* ── fill ─────────────────────────────────────────────────────────────── */

/** Whole-cell squares, whole-cell dots, or the grain dissolve. */
export type FillTexture = 'cells' | 'dots' | 'dissolve';
/** A soft edge round a filled shape, or none. */
export type FillEdge = 'none' | 'taper';
/** A projected shape's outline. */
export type FillStroke = 'none' | 'dashed' | 'dotted' | 'solid';
/** The size steps: four whole-cell sizes and three finer ones. */
export type FillSize = 1 | 0.75 | 0.5 | 0.25 | 0.1875 | 0.125 | 0.0625;
/** A line texture drawn in place of the marks. */
export type FillHatch = 'hatch' | 'crosshatch';

/** A whole-cell mark's size at each step, px: a square's side or a dot's diameter. */
export const FILL_MARK_PX: Readonly<Record<FillSize, number>> = {
  1: 4,
  0.75: 3,
  0.5: 2.5,
  0.25: 2,
  0.1875: 1.75,
  0.125: 1.5,
  0.0625: 1.25,
};

/** The textured fill of projected marks. */
export interface FillDesign {
  texture: FillTexture;
  size: FillSize;
  edge: FillEdge;
  /** The taper's width, px. */
  edgeSoftness: number;
  /** A left-to-right dissolve toward the far end, or an even fill. */
  falloff: 'dissolve' | 'none';
  /** The dissolve thins whole cells (`scatter`) or shrinks them (`smooth`). */
  falloffStyle: 'smooth' | 'scatter';
  /** The dissolve-in's width, as a multiple of its narrowest. */
  revealSpread: number;
  /** Ink share of a cell at the near and far ends. */
  coverageNear: number;
  coverageFar: number;
  randomness: number;
  seed: number;
  opacity: number;
  /** A wash of the mark color under the marks, 0 to 1. */
  tint: number;
  /** The hatch's geometry, when a chart draws one. */
  hatchStyle: {
    width: number;
    angle: number;
    render: 'snap' | 'aa';
    inset: number;
    weight: 'dots' | 'width';
  };
}

/** Rules every chart's fill takes before its own variant. */
export interface FillRules {
  /** Discrete projected marks fill evenly (`none`), or take `fill.falloff`. */
  discreteFalloff: 'none' | 'inherit';
  /** Marks whose size encodes value get no taper (`none`). */
  valueSizedEdge: 'none' | 'inherit';
  /** On the CPU fallback, a reveal of more projected marks than this steps each mark. */
  cpuSteppedAbove: number;
}

/** What one chart does differently from the family fill. */
export interface FillVariant extends Partial<Omit<FillDesign, 'hatchStyle'>> {
  /** The lattice's pitch, px, the mark size held. */
  pitch?: number;
  boundaryWidth?: number;
  stroke?: FillStroke;
  /** A solid fill in the grid's tone under the outline, in place of the texture. */
  solid?: boolean;
  /** Values for the dark card only. */
  dark?: Partial<FillDesign> & { pitch?: number };
}

/** The charts a value can belong to. */
export type ChartFamilyId =
  | 'C1'
  | 'C1c'
  | 'C1xs'
  | 'C2'
  | 'C3'
  | 'C4'
  | 'C5'
  | 'C6'
  | 'C7'
  | 'C8'
  | 'C8L'
  | 'C9'
  | 'C10'
  | 'C10s';

/** Whether a chart's marks are discrete, and whether their size encodes value. */
export const CHART_MARKS: Readonly<
  Record<ChartFamilyId, { discrete: boolean; valueSized: boolean }>
> = {
  C1: { discrete: false, valueSized: false },
  C1c: { discrete: false, valueSized: false },
  C1xs: { discrete: false, valueSized: false },
  C2: { discrete: true, valueSized: false },
  C3: { discrete: true, valueSized: true },
  C4: { discrete: true, valueSized: true },
  C5: { discrete: false, valueSized: true },
  C6: { discrete: true, valueSized: false },
  C7: { discrete: true, valueSized: false },
  C8: { discrete: true, valueSized: false },
  C8L: { discrete: true, valueSized: false },
  C9: { discrete: false, valueSized: true },
  C10: { discrete: true, valueSized: false },
  C10s: { discrete: true, valueSized: false },
};

/* ── lines ────────────────────────────────────────────────────────────── */

/** The outline of a projected shape, and the rules across the plot. */
export interface BoundaryDesign {
  /** Projected shapes take an outline by default; a variant opts in. */
  projected: boolean;
  style: Exclude<FillStroke, 'none'>;
  dash: [number, number];
  width: number;
  ruleDash: [number, number];
  ruleWidth: number;
  /** Every dotted line: the fill's dot plus `dotOffset` px, with `gap` px clear. */
  dotted: { dotOffset: number; gap: number };
  /** The forecast line: round dots, a knock-out halo where it crosses a mark. */
  forecast: {
    width: number;
    dash: [number, number];
    cap: 'round' | 'butt';
    halo: number;
    /** The dot follows the fill's dot size. */
    fromFill: boolean;
  };
}

/* ── color ────────────────────────────────────────────────────────────── */

/**
 * The roles each part of a chart draws in. Text takes `text-primary` or
 * `text-secondary`, the two that hold 4.5:1 on the page and the card. A
 * measured series' data colors are the palette's neutrals
 * (`PALETTE_NEUTRALS`), not roles.
 */
export interface ColorDesign {
  measured: ChartColorRole;
  projected: ChartColorRole;
  danger: ChartColorRole;
  success: ChartColorRole;
  warning: ChartColorRole;
  grid: ChartColorRole;
  rule: ChartColorRole;
  axisLabel: ChartColorRole;
  reference: ChartColorRole;
  axisLabelFaint: ChartColorRole;
  axisEnd: ChartColorRole;
  text: {
    primary: ChartColorRole;
    unit: ChartColorRole;
    body: ChartColorRole;
    stamp: ChartColorRole;
    eyebrow: ChartColorRole;
    caption: ChartColorRole;
    rule: ChartColorRole;
  };
  /**
   * The tooltip: its fill, text and edge, in the card's own theme (`match`)
   * or the opposite one (`inverse`).
   */
  tooltip: {
    surface: ChartColorRole;
    text: ChartColorRole;
    note: ChartColorRole;
    edge: ChartColorRole;
  };
}

/** A line over a solid fill reaches `min` against the card and the marks it crosses. */
export interface ContrastDesign {
  /** WCAG 2.x non-text contrast. */
  min: number;
  /** Palette steps a failing pair's fill takes on each card (positive is lighter). */
  fillUnderLine: { light: number; dark: number };
}

/** How strong the solid in the solid and dotted look is. */
export interface SolidTone {
  rule: 'oklch' | 'mix' | 'grid';
  /** The lightness share of the way from the card to the ink. */
  strength: number;
  /** The chroma share of the ink's. */
  chroma: number;
  /** The coverage multiplier, for the `grid` rule. */
  scale: number;
}

/* ── hover and tooltip ────────────────────────────────────────────────── */

/** The hover styles still on trial; one stays. */
export type HoverStyle = 'family' | 'l1q' | 'figma';

/** The hover: the band, the highlight, the dot field. */
export interface HoverDesign {
  /** The family style: a wash behind the hovered column, or every other mark dimmed. */
  mode: 'wash' | 'dim';
  washRole: ChartColorRole;
  wash: number;
  dim: number;
  /** The band's slide from the last hovered column to the next. */
  slide: DurationToken;
  slideEasing: ChartEasing;
  /** The hovered projected mark takes the hover step of its color. */
  highlightProjected: boolean;
  /** The hovered mark's lightness step away from the card, L*. */
  lightness: number;
  /** The shadow style: a wash over the bars. */
  l1q: {
    washRole: ChartColorRole;
    wash: number;
    highlight: DurationToken;
    highlightEasing: ChartEasing;
  };
  /** Each chart's style, where it isn't `defaultStyle`. */
  style: Partial<Record<ChartFamilyId, HoverStyle>>;
  defaultStyle: HoverStyle;
  /** The band and tag style: an opaque band, the rest dimmed, a value tag. */
  figma: {
    bandRole: ChartColorRole;
    band: number;
    dim: number;
    fade: DurationToken;
    fadeEasing: ChartEasing;
    tagFill: ChartColorRole;
    tagInk: ChartColorRole;
    tagGap: number;
    tagRadius: number;
    tagPadding: [number, number];
    tagValueSize: number;
    tagBasisSize: number;
  };
  /** The dot matrix: a halo behind the hovered circle, px across. */
  c3: { haloRole: ChartColorRole; halo: number };
  /** The hover rule. */
  rule: { role: ChartColorRole; alpha: number; width: number };
  /** A ring that pushes the dots out from the pointer. Off. */
  pulse: {
    on: boolean;
    push: number;
    radius: number;
    width: number;
    duration: DurationToken;
    easing: ChartEasing;
  };
  /** The dots near the pointer ease away from it. */
  field: {
    on: boolean;
    push: number;
    radius: number;
    /** The radius as a multiple of the mark's size, at most `radius`. */
    scale: number;
    /** The share of the radius at full push. */
    flat: number;
    enter: DurationToken;
    enterEasing: ChartEasing;
    leave: DurationToken;
    leaveEasing: ChartEasing;
    trail: DurationToken;
  };
}

/** A type style the tooltip takes from the theme's type set. */
export interface TooltipType {
  token: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: 400 | 600;
  /** Letter spacing, px. */
  tracking: number;
}

/** The tooltip box. */
export interface TooltipDesign {
  padding: [number, number];
  radius: number;
  /** The surface: the card's own (`match`) or the opposite theme's (`inverse`). */
  contrast: 'match' | 'inverse';
  /** It comes in from the pointer. */
  snap: boolean;
  snapProfile: 'none' | 'card' | 'surface';
  size: 'sm' | 'md';
  type: Record<
    'sm' | 'md',
    { head: TooltipType; row: TooltipType; note: TooltipType }
  >;
}

/* ── motion ───────────────────────────────────────────────────────────── */

/** Every motion in the family, as token names. */
export interface MotionDesign {
  measured: {
    /** The window every measured mark departs and lands in. */
    front: DurationToken;
    /** Each mark's own grow. */
    grow: DurationToken;
    /** Between one series and the next. */
    stagger: DurationToken;
    /** Spread the starts across the front, or step them. */
    markStagger: 'spread' | ChartStaggerStep;
    easing: ChartEasing;
    /** How far below its value a mark starts, and its soft leading edge. */
    rise: ChartDistance;
    soften: ChartDistance;
  };
  projected: {
    /** After the measured marks land. */
    after: DurationToken;
    front: DurationToken;
    grow: DurationToken;
    dissolve: DurationToken;
    easing: ChartEasing;
  };
  nowRule: {
    after: DurationToken;
    duration: DurationToken;
    easing: ChartEasing;
  };
  /** Projected lines and their labels fade in, or draw in with their chart. */
  projectedLine: {
    entry: 'fade' | 'draw';
    fade: DurationToken;
    easing: ChartEasing;
  };
  /** The big number counts with the reveal. */
  hero: {
    duration: DurationToken;
    stagger: DurationToken;
    easing: ChartEasing;
    mode: 'expressive' | 'productive';
  };
  delta: { mode: 'expressive' | 'productive' };
  /** A productive counter: each digit rolls from old to new. */
  productive: {
    roll: DurationToken;
    stagger: DurationToken;
    /** The longest change, stagger and width included. */
    max: DurationToken;
    easing: ChartEasing;
  };
  /** At the reduced level every change fades in place. */
  reduced: { fade: DurationToken; easing: ChartEasing | 'linear' };
  /** The dot matrix's diagonal sweep. */
  c3: {
    sweep: DurationToken;
    enter: DurationToken;
    sweepEasing: ChartEasing;
    enterEasing: ChartEasing;
    projectedAfter: DurationToken;
  };
  /** The small multiples: one timeline each, started a stagger apart. */
  c5: { stagger: DurationToken; reveal: DurationToken; easing: ChartEasing };
  /** The stacked bars' build. */
  c7: { stagger: DurationToken; move: DurationToken; projected: DurationToken };
  /** The radials: track, then arc, then the limit. */
  c8: {
    sweep: DurationToken;
    overlap: DurationToken;
    cap: DurationToken;
    capFade: DurationToken;
    easing: ChartEasing;
  };
  /** A traveling mark's own move. */
  travel: { easing: ChartEasing };
}

/** The card's start, grown, lit and rest beats. Off. */
export interface StageDesign {
  mode: 'off' | 'figma';
  fade: DurationToken;
  easing: ChartEasing;
}

/** The range selector. */
export interface RangeDesign {
  mode: 'brush' | 'scrubber' | 'off';
  move: DurationToken;
  moveEasing: ChartEasing;
  home: DurationToken;
  step: DurationToken;
  stepEasing: ChartEasing;
  fadeOut: DurationToken;
  fadeOutEasing: ChartEasing;
  fadeInAfter: DurationToken;
  fadeIn: DurationToken;
  fadeInEasing: ChartEasing;
  friction: DurationToken;
  follow: DurationToken;
  edgeScroll: DurationToken;
  wheelGap: DurationToken;
  wheelSettle: DurationToken;
}

/** Area charts: the fill, the projected solid and the load. */
export interface AreaDesign {
  fill: 'solid' | 'gradient';
  /** The gradient's alpha at the top and the bottom, as multiples of the fill's. */
  gradient: { top: number; bottom: number };
  projectedSolid: 'translucent' | 'opaque';
  load: 'rise' | 'clean';
}

/* ── the card ─────────────────────────────────────────────────────────── */

/** A card size's geometry, px. */
export interface ChartLayout {
  width: number;
  radius: number;
  padX: number;
  padTop: number;
  padBottom: number;
  eyebrowGap: number;
  gapAbovePlot: number;
  gapBelowPlot: number;
  plotHeight: number;
  /** The plot runs to the card's edges. */
  plotBleed: boolean;
  footGap: number;
  textGap: number;
  /** The delta sits at the row's end, or after the number. */
  deltaAlign: 'end' | 'inline';
}

/** A card size's type, px. */
export interface ChartType {
  hero: number;
  heroLine: number;
  fraction: number;
  fractionLine: number;
  unit: number;
  unitLine: number;
  unitInk: 'quiet' | 'primary';
  delta: number;
  deltaLine: number;
  metricGap: number;
  eyebrow: number;
  headline: number;
  headlineLine: number;
  headlineWeight: 400 | 600;
  body: number;
  bodyLine: number;
  stamp: number;
  stampLine: number;
  statusIcon: number;
  statusGap: number;
  caption: number;
  captionLine: number;
}

/** The type roles that take letter spacing. */
export type TrackingRole =
  | 'hero'
  | 'fraction'
  | 'unit'
  | 'delta'
  | 'eyebrow'
  | 'headline'
  | 'body'
  | 'stamp'
  | 'caption';

/** Every tuning value in the family. */
export interface ChartDesign {
  fill: FillDesign;
  fillRules: FillRules;
  fillVariants: Record<ChartFamilyId, FillVariant>;
  boundary: BoundaryDesign;
  color: ColorDesign;
  contrast: ContrastDesign;
  solidTone: SolidTone;
  hover: HoverDesign;
  tooltip: TooltipDesign;
  motion: MotionDesign;
  stage: StageDesign;
  range: RangeDesign;
  /** The legend: static rows, or series chips that show and hide a series. */
  legend: { mode: 'static' | 'chips' };
  /** The radials' base track, thinner than the arcs or as wide. */
  radial: { baseThin: boolean };
  area: AreaDesign;
  /** Pop-up cards: their surface, and whether an insight opens on hover or click. */
  cards: { style: 'contrast' | 'figma'; insight: 'hover' | 'click' };
  /** Letter spacing, em per role, the same at every size. */
  tracking: Record<TrackingRole, number>;
  type: Record<ChartSize, ChartType>;
  layout: Record<ChartSize, ChartLayout>;
}

/* ── the values ───────────────────────────────────────────────────────── */

const STANDARD: ChartEasing = { name: 'standard', mode: 'productive' };
const ENTRANCE: ChartEasing = { name: 'entrance', mode: 'productive' };
// body-01 and label-01 letter spacing, as em.
const BODY_EM = 0.16 / 14;
const LABEL_EM = 0.32 / 12;
const LABEL_01: TooltipType = {
  token: 'label-01',
  fontSize: 12,
  lineHeight: 16,
  fontWeight: 400,
  tracking: 0.32,
};
const BODY_COMPACT_01: TooltipType = {
  token: 'body-compact-01',
  fontSize: 14,
  lineHeight: 18,
  fontWeight: 400,
  tracking: 0.16,
};

/**
 * Deep-freezes an object, so no reader can change a shared value.
 *
 * @param value The object.
 * @returns The same object, frozen.
 */
function frozen<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) {
      frozen(v);
    }
    Object.freeze(value);
  }
  return value;
}

/** The family's tuning values. */
export const CHART_DESIGN: ChartDesign = frozen<ChartDesign>({
  // 2px whole-cell dots, no taper, an even fill: what every chart draws
  // unless its variant says otherwise.
  fill: {
    texture: 'dots',
    size: 0.25,
    edge: 'none',
    edgeSoftness: 2,
    falloff: 'none',
    falloffStyle: 'smooth',
    revealSpread: 2,
    coverageNear: 0.32,
    coverageFar: 0.04,
    randomness: 0.5,
    seed: 1729,
    opacity: 1,
    tint: 0,
    hatchStyle: {
      width: 1,
      angle: 45,
      render: 'snap',
      inset: 0,
      weight: 'dots',
    },
  },
  fillRules: {
    discreteFalloff: 'none',
    valueSizedEdge: 'none',
    cpuSteppedAbove: 1200,
  },
  fillVariants: {
    C1: {},
    C1c: { size: 0.125, coverageNear: 0.36 },
    C1xs: { size: 0.125, coverageNear: 0.36 },
    C2: {},
    // The solid and dotted look: a solid in the grid's tone under a dotted outline.
    C3: { stroke: 'dotted', solid: true, coverageNear: 0.5 },
    C4: { stroke: 'dotted', solid: true, coverageNear: 0.5 },
    C5: { falloff: 'none', boundaryWidth: 1, stroke: 'dotted', solid: true },
    C6: {},
    C7: {},
    // Provisional: a tint so the arc reads as strongly on the dark card.
    C8: { coverageNear: 0.5, dark: { tint: 0.12 } },
    C8L: { coverageNear: 0.5, stroke: 'dotted', solid: true },
    C9: {},
    C10: {},
    C10s: {},
  },
  boundary: {
    projected: false,
    style: 'dashed',
    dash: [2, 3],
    width: 2,
    ruleDash: [2, 2],
    ruleWidth: 1,
    dotted: { dotOffset: 1, gap: 3 },
    forecast: { width: 3, dash: [0, 7], cap: 'round', halo: 1, fromFill: true },
  },
  color: {
    measured: 'text-primary',
    projected: 'interactive',
    danger: 'support-error',
    success: 'support-success',
    warning: 'support-warning',
    grid: 'border-subtle-02',
    rule: 'border-strong-01',
    axisLabel: 'text-secondary',
    reference: 'text-secondary',
    axisLabelFaint: 'text-secondary',
    axisEnd: 'text-secondary',
    text: {
      primary: 'text-primary',
      unit: 'text-secondary',
      body: 'text-secondary',
      stamp: 'text-secondary',
      eyebrow: 'text-secondary',
      caption: 'text-secondary',
      rule: 'border-subtle-02',
    },
    tooltip: {
      surface: 'background',
      text: 'text-primary',
      note: 'text-secondary',
      edge: 'border-strong-01',
    },
  },
  contrast: { min: 3, fillUnderLine: { light: 0, dark: -1 } },
  solidTone: { rule: 'oklch', strength: 0.45, chroma: 0.65, scale: 1 },
  hover: {
    mode: 'wash',
    washRole: 'border-subtle-02',
    wash: 0.6,
    dim: 0.45,
    slide: 'moderate-02',
    slideEasing: STANDARD,
    highlightProjected: true,
    lightness: 7,
    l1q: {
      washRole: 'text-primary',
      wash: 0.06,
      highlight: 'moderate-01',
      highlightEasing: ENTRANCE,
    },
    style: { C2: 'l1q' },
    defaultStyle: 'family',
    figma: {
      bandRole: 'border-subtle-02',
      band: 1,
      dim: 0.28,
      fade: 'moderate-01',
      fadeEasing: ENTRANCE,
      tagFill: 'layer-selected-inverse',
      tagInk: 'text-inverse',
      tagGap: 10,
      tagRadius: 8,
      tagPadding: [6, 8],
      tagValueSize: 14,
      tagBasisSize: 11,
    },
    c3: { haloRole: 'state-hover', halo: 28 },
    rule: { role: 'border-subtle-02', alpha: 0.75, width: 1 },
    pulse: {
      on: false,
      push: 4,
      radius: 48,
      width: 15,
      duration: 'slow-03',
      easing: { name: 'entrance', mode: 'expressive' },
    },
    field: {
      on: true,
      push: 1.5,
      radius: 64,
      scale: 1.5,
      flat: 0.25,
      enter: 'moderate-01',
      enterEasing: STANDARD,
      leave: 'fast-02',
      leaveEasing: STANDARD,
      trail: 'fast-02',
    },
  },
  tooltip: {
    padding: [8, 12],
    radius: 8,
    contrast: 'match',
    snap: true,
    snapProfile: 'card',
    size: 'sm',
    type: {
      sm: {
        head: { ...LABEL_01, fontWeight: 600 },
        row: LABEL_01,
        note: LABEL_01,
      },
      md: {
        head: {
          ...BODY_COMPACT_01,
          token: 'heading-compact-01',
          fontWeight: 600,
        },
        row: BODY_COMPACT_01,
        note: LABEL_01,
      },
    },
  },
  motion: {
    measured: {
      front: 'slow-03',
      grow: 'moderate-02',
      stagger: 'moderate-01',
      markStagger: 'spread',
      easing: STANDARD,
      rise: 'md',
      soften: 'lg',
    },
    projected: {
      after: 'moderate-01',
      front: 'slow-03',
      grow: 'moderate-02',
      dissolve: 'moderate-02',
      easing: STANDARD,
    },
    nowRule: { after: 'instant', duration: 'moderate-01', easing: ENTRANCE },
    projectedLine: { entry: 'fade', fade: 'moderate-02', easing: ENTRANCE },
    hero: {
      duration: 'slow-03',
      stagger: 'moderate-01',
      easing: STANDARD,
      mode: 'expressive',
    },
    delta: { mode: 'productive' },
    productive: {
      roll: 'moderate-01',
      stagger: 'fast-01',
      max: 'moderate-03',
      easing: STANDARD,
    },
    reduced: { fade: 'moderate-01', easing: 'linear' },
    c3: {
      sweep: 'slow-01',
      enter: 'moderate-01',
      sweepEasing: STANDARD,
      enterEasing: ENTRANCE,
      projectedAfter: 'moderate-02',
    },
    c5: { stagger: 'fast-01', reveal: 'slow-01', easing: STANDARD },
    c7: { stagger: 'fast-01', move: 'moderate-01', projected: 'slow-01' },
    c8: {
      sweep: 'slow-01',
      overlap: 'moderate-02',
      cap: 'slow-01',
      capFade: 'moderate-02',
      easing: STANDARD,
    },
    travel: { easing: { name: 'entrance', mode: 'expressive' } },
  },
  stage: { mode: 'off', fade: 'moderate-02', easing: ENTRANCE },
  range: {
    mode: 'brush',
    move: 'slow-01',
    moveEasing: { name: 'standard', mode: 'expressive' },
    home: 'slow-02',
    step: 'moderate-02',
    stepEasing: STANDARD,
    fadeOut: 'moderate-02',
    fadeOutEasing: { name: 'exit', mode: 'productive' },
    fadeInAfter: 'fast-02',
    fadeIn: 'moderate-02',
    fadeInEasing: ENTRANCE,
    friction: 'moderate-02',
    follow: 'fast-02',
    edgeScroll: 'slow-03',
    wheelGap: 'moderate-02',
    wheelSettle: 'moderate-01',
  },
  legend: { mode: 'chips' },
  radial: { baseThin: false },
  area: {
    fill: 'gradient',
    gradient: { top: 1.75, bottom: 0.25 },
    projectedSolid: 'translucent',
    load: 'rise',
  },
  cards: { style: 'contrast', insight: 'hover' },
  tracking: {
    hero: -0.8 / 34,
    fraction: 0,
    unit: BODY_EM,
    delta: 0,
    eyebrow: BODY_EM,
    headline: -0.4 / 27,
    body: BODY_EM,
    stamp: LABEL_EM,
    caption: 0.72 / 9,
  },
  type: {
    sm: {
      hero: 34,
      heroLine: 48,
      fraction: 20,
      fractionLine: 28,
      unit: 13,
      unitLine: 18,
      unitInk: 'quiet',
      delta: 24,
      deltaLine: 21,
      metricGap: 8,
      eyebrow: 13,
      headline: 21,
      headlineLine: 25,
      headlineWeight: 600,
      body: 13,
      bodyLine: 20,
      stamp: 12,
      stampLine: 17,
      statusIcon: 14,
      statusGap: 9,
      caption: 9,
      captionLine: 11,
    },
    md: {
      hero: 30,
      heroLine: 41,
      fraction: 18,
      fractionLine: 24,
      unit: 13,
      unitLine: 18,
      unitInk: 'quiet',
      delta: 22,
      deltaLine: 26,
      metricGap: 8,
      eyebrow: 13,
      headline: 20,
      headlineLine: 32,
      headlineWeight: 400,
      body: 14,
      bodyLine: 19,
      stamp: 12,
      stampLine: 16,
      statusIcon: 14,
      statusGap: 8,
      caption: 9,
      captionLine: 11,
    },
    lg: {
      hero: 34,
      heroLine: 44,
      fraction: 21,
      fractionLine: 28,
      unit: 21,
      unitLine: 28,
      unitInk: 'primary',
      delta: 22,
      deltaLine: 28,
      metricGap: 8,
      eyebrow: 13,
      headline: 27,
      headlineLine: 34,
      headlineWeight: 400,
      body: 13.5,
      bodyLine: 20,
      stamp: 12.5,
      stampLine: 16,
      statusIcon: 14,
      statusGap: 8,
      caption: 9,
      captionLine: 11,
    },
  },
  layout: {
    sm: {
      width: 380,
      radius: 10,
      padX: 26,
      padTop: 26,
      padBottom: 26,
      eyebrowGap: 8,
      gapAbovePlot: 18,
      gapBelowPlot: 18,
      plotHeight: 182,
      plotBleed: false,
      footGap: 18,
      textGap: 8,
      deltaAlign: 'end',
    },
    md: {
      width: 405,
      radius: 12,
      padX: 26,
      padTop: 26,
      padBottom: 22,
      eyebrowGap: 8,
      gapAbovePlot: 20,
      gapBelowPlot: 22,
      plotHeight: 186,
      plotBleed: true,
      footGap: 16,
      textGap: 16,
      deltaAlign: 'end',
    },
    lg: {
      width: 640,
      radius: 12,
      padX: 24,
      padTop: 22,
      padBottom: 22,
      eyebrowGap: 8,
      gapAbovePlot: 20,
      gapBelowPlot: 20,
      plotHeight: 186,
      plotBleed: false,
      footGap: 14,
      textGap: 14,
      deltaAlign: 'inline',
    },
  },
});

/** One chart's resolved fill: the texture, the pitch, the outline, and whether it is solid. */
export interface ChartFill {
  fill: FillDesign;
  /** The lattice's pitch, px, when the variant sets one. */
  pitch?: number;
  boundary: BoundaryDesign;
  solid: boolean;
}

/** The size steps the grain offers. */
const GRAIN_SIZES: readonly FillSize[] = [1, 0.75, 0.5];

/**
 * One chart's fill: the family fill, the rules its marks fall under, the
 * chart's variant, then its dark-card values on a dark card.
 *
 * @param chart The chart.
 * @param dark Whether the card is dark.
 * @returns The resolved fill.
 */
export function chartFill(chart: ChartFamilyId, dark = false): ChartFill {
  const {
    fill: family,
    fillRules,
    fillVariants,
    boundary: line,
  } = CHART_DESIGN;
  const marks = CHART_MARKS[chart];
  const {
    dark: darkValues,
    pitch: variantPitch,
    boundaryWidth,
    stroke,
    solid = false,
    ...variant
  } = fillVariants[chart];
  const fill: FillDesign = { ...family };
  if (marks.discrete && fillRules.discreteFalloff === 'none') {
    fill.falloff = 'none';
  }
  if (marks.valueSized && fillRules.valueSizedEdge === 'none') {
    fill.edge = 'none';
  }
  Object.assign(fill, variant);
  let pitch = variantPitch;
  if (dark && darkValues) {
    const { pitch: darkPitch, ...rest } = darkValues;
    Object.assign(fill, rest);
    pitch = darkPitch ?? pitch;
  }
  // The grain has no step under 50%.
  if (fill.texture === 'dissolve' && !GRAIN_SIZES.includes(fill.size)) {
    fill.size = 0.5;
  }
  const boundary: BoundaryDesign = {
    ...line,
    ...(stroke
      ? stroke === 'none'
        ? { projected: false }
        : { projected: true, style: stroke }
      : null),
    ...(boundaryWidth != null ? { width: boundaryWidth } : null),
  };
  return {
    fill,
    pitch:
      pitch && pitch > 0 && fill.texture !== 'dissolve' ? pitch : undefined,
    boundary,
    solid,
  };
}

/**
 * A chart's hover style.
 *
 * @param chart The chart.
 * @returns Its style.
 */
export function hoverStyleOf(chart: ChartFamilyId): HoverStyle {
  return CHART_DESIGN.hover.style[chart] ?? CHART_DESIGN.hover.defaultStyle;
}
