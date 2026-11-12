/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The chart family's base: the shared types, the tuning values, the motion,
// the color roles on the v12 tokens, the palette and its color math, the
// line constants, the series key, the card's sizes and the card itself.
// Nothing here loads the plot's runtime; the plot's
// shared pieces are at `./plot`.

export { CHART_SIZES, chartCardVars, chartKindColor } from './components/card';
export {
  ChartCard,
  type ChartCardAction,
  type ChartCardOverflowAction,
  type ChartCardProps,
} from './components/ChartCard';
export {
  CHART_COLOR_READS,
  CHART_COLOR_ROLE_NAMES,
  CHART_COLOR_ROLES,
  CHART_THEMES,
  CHART_TOKEN_VALUES,
  V12_NEUTRAL,
  chartColorVar,
  chartRoleOklch,
  resolveChartSkin,
  roleColor,
  skinFieldOf,
  v12Neutral,
  type ChartColorRead,
  type ChartColorRole,
  type ChartColorSource,
  type ChartColorToken,
  type ChartSkin,
  type ChartSkinField,
  type ChartTheme,
} from './components/color';
export {
  contrastRatio,
  cssColorToHex,
  formatOklch,
  hexToOklch,
  oklchToHex,
  oklchToSrgb,
  relativeLuminance,
  type Oklch,
} from './components/color-space';
export {
  CHART_DESIGN,
  CHART_MARKS,
  FILL_MARK_PX,
  chartFill,
  hoverStyleOf,
  type ChartDesign,
  type ChartEasing,
  type ChartFamilyId,
  type ChartFill,
  type ChartLayout,
  type ChartType,
  type FillDesign,
  type FillEdge,
  type FillSize,
  type FillStroke,
  type FillTexture,
  type FillVariant,
  type HoverStyle,
} from './components/design';
export {
  formatChartNumber,
  formatChartX,
  formatDelta,
  formatMetric,
} from './components/format';
export {
  CHART_SANS,
  CURVE_SMOOTH,
  DEFAULT_LINE_SHAPE,
  LINE_WIDTH,
  REFERENCE_LINE_WIDTH,
  SOLID_BACKING,
  SOLID_BACKING_BY_SIZE,
  smoothFor,
  type LineShape,
} from './components/lines';
export {
  chartCurve,
  resolveChartMotion,
  type ChartCurve,
  type ChartEaseFn,
  type ChartMotion,
  type ChartPhaseTiming,
} from './components/motion';
export {
  LARGE_MARK_MIN,
  PALETTE_HUE_VALUES,
  PALETTE_HUES,
  PALETTE_NEUTRAL_LIGHTNESS,
  PALETTE_NEUTRALS,
  PALETTE_STEP_RANGE,
  PALETTE_STEPS,
  SMALL_MARK_MIN,
  measuredRamp,
  paletteColor,
  paletteOklch,
  paletteRatios,
  paletteSeries,
  paletteSeriesByMark,
  paletteSlot,
  paletteSlots,
  paletteSmallSlot,
  paletteStepAway,
  paletteSurfaces,
  paletteThemeOf,
  paletteTierFor,
  type PaletteColorName,
  type PaletteHue,
  type PaletteNeutral,
  type PaletteNeutralStep,
  type PaletteNeutrals,
  type PaletteSeriesOptions,
  type PaletteSlot,
  type PaletteStep,
  type PaletteTheme,
  type PaletteTier,
} from './components/palette';
export {
  swatchSvg,
  type SwatchKind,
  type SwatchOptions,
} from './components/swatch';
export type {
  ChartBasis,
  ChartDelta,
  ChartFormat,
  ChartKind,
  ChartMetric,
  ChartNumberFormat,
  ChartPoint,
  ChartReference,
  ChartSeries,
  ChartSize,
  ChartState,
  ChartStatus,
} from './components/types';
