/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What a chart card needs that doesn't draw the plot: its sizes, its
// geometry and type as custom properties, and its text colors.

import type { CSSProperties } from 'react';
import { chartColorVar } from './color';
import { CHART_DESIGN, type TrackingRole } from './design';
import type { ChartKind, ChartSize } from './types';

/** The card sizes, smallest first. */
export const CHART_SIZES: readonly ChartSize[] = ['sm', 'md', 'lg'];

/** The roles that take letter spacing. */
const TRACKING_ROLES = Object.keys(CHART_DESIGN.tracking) as TrackingRole[];

/**
 * A number as px.
 *
 * @param n The number.
 * @returns It, as a CSS length.
 */
const px = (n: number): string => `${n}px`;

/**
 * A card size's layout, type and text colors as `--cds-chart-*` custom
 * properties, for the card's stylesheet to read.
 *
 * @param size The card's size.
 * @returns The properties.
 */
export function chartCardVars(size: ChartSize): CSSProperties {
  const l = CHART_DESIGN.layout[size];
  const t = CHART_DESIGN.type[size];
  const c = CHART_DESIGN.color;
  const tip = CHART_DESIGN.tooltip;
  const tipType = tip.type[tip.size];
  const tracking = Object.fromEntries(
    TRACKING_ROLES.map((role) => [
      `--cds-chart-${role}-tracking`,
      `${CHART_DESIGN.tracking[role]}em`,
    ])
  );
  return {
    ...tracking,
    '--cds-chart-width': px(l.width),
    '--cds-chart-radius': px(l.radius),
    '--cds-chart-pad-x': px(l.padX),
    '--cds-chart-pad-top': px(l.padTop),
    '--cds-chart-pad-bottom': px(l.padBottom),
    '--cds-chart-eyebrow-gap': px(l.eyebrowGap),
    '--cds-chart-gap-above-plot': px(l.gapAbovePlot),
    '--cds-chart-gap-below-plot': px(l.gapBelowPlot),
    '--cds-chart-plot-height': px(l.plotHeight),
    '--cds-chart-foot-gap': px(l.footGap),
    '--cds-chart-text-gap': px(l.textGap),
    '--cds-chart-hero': px(t.hero),
    '--cds-chart-hero-line': px(t.heroLine),
    '--cds-chart-fraction': px(t.fraction),
    '--cds-chart-fraction-line': px(t.fractionLine),
    '--cds-chart-unit': px(t.unit),
    '--cds-chart-unit-line': px(t.unitLine),
    '--cds-chart-delta': px(t.delta),
    '--cds-chart-delta-line': px(t.deltaLine),
    '--cds-chart-metric-gap': px(t.metricGap),
    '--cds-chart-eyebrow': px(t.eyebrow),
    '--cds-chart-headline': px(t.headline),
    '--cds-chart-headline-line': px(t.headlineLine),
    '--cds-chart-headline-weight': String(t.headlineWeight),
    '--cds-chart-body': px(t.body),
    '--cds-chart-body-line': px(t.bodyLine),
    '--cds-chart-stamp': px(t.stamp),
    '--cds-chart-stamp-line': px(t.stampLine),
    '--cds-chart-status-icon': px(t.statusIcon),
    '--cds-chart-status-gap': px(t.statusGap),
    '--cds-chart-caption': px(t.caption),
    '--cds-chart-caption-line': px(t.captionLine),
    '--cds-chart-color-primary': chartColorVar(c.text.primary),
    '--cds-chart-color-unit': chartColorVar(
      t.unitInk === 'primary' ? c.text.primary : c.text.unit
    ),
    '--cds-chart-color-body': chartColorVar(c.text.body),
    '--cds-chart-color-stamp': chartColorVar(c.text.stamp),
    '--cds-chart-color-eyebrow': chartColorVar(c.text.eyebrow),
    '--cds-chart-color-caption': chartColorVar(c.text.caption),
    '--cds-chart-color-rule': chartColorVar(c.text.rule),
    '--cds-chart-tip-pad-y': px(tip.padding[0]),
    '--cds-chart-tip-pad-x': px(tip.padding[1]),
    '--cds-chart-tip-radius': px(tip.radius),
    '--cds-chart-tip-font': px(tipType.row.fontSize),
    '--cds-chart-tip-line': px(tipType.row.lineHeight),
    '--cds-chart-tip-tracking': px(tipType.row.tracking),
  } as CSSProperties;
}

/**
 * The color a status or a delta takes.
 *
 * @param kind Its kind.
 * @returns The CSS color.
 */
export function chartKindColor(kind: ChartKind = 'default'): string {
  const c = CHART_DESIGN.color;
  switch (kind) {
    case 'success':
      return chartColorVar(c.success);
    case 'danger':
      return chartColorVar(c.danger);
    case 'warning':
      return chartColorVar(c.warning);
    default:
      return chartColorVar(c.text.stamp);
  }
}
