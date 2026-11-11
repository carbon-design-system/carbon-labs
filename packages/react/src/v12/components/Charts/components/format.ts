/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Numbers and axis labels as a chart writes them, through `Intl` in the
// chart's locale.

import type {
  ChartDelta,
  ChartFormat,
  ChartMetric,
  ChartNumberFormat,
} from './types';

/**
 * A number in a format.
 *
 * @param value The number.
 * @param format The format: `Intl.NumberFormat` options or a function.
 * @param locale The locale.
 * @returns The text.
 */
export function formatChartNumber(
  value: number,
  format?: ChartNumberFormat,
  locale?: string
): string {
  if (typeof format === 'function') {
    return format(value);
  }
  return new Intl.NumberFormat(locale, format).format(value);
}

/**
 * A position on the x axis: a time through `Intl.DateTimeFormat`, or the
 * format's function for a category.
 *
 * @param x The position.
 * @param format The chart's format.
 * @returns The text.
 */
export function formatChartX(x: number, format: ChartFormat = {}): string {
  if (typeof format.x === 'function') {
    return format.x(x);
  }
  return new Intl.DateTimeFormat(
    format.locale,
    format.x ?? { hour: 'numeric', minute: '2-digit' }
  ).format(x);
}

/**
 * The card's big number, its decimals fixed when the metric sets them.
 *
 * @param metric The metric.
 * @param format The chart's format.
 * @returns The number as text, without its unit.
 */
export function formatMetric(
  metric: ChartMetric,
  format: ChartFormat = {}
): string {
  const options =
    metric.decimals == null || typeof format.value === 'function'
      ? format.value
      : {
          ...format.value,
          minimumFractionDigits: metric.decimals,
          maximumFractionDigits: metric.decimals,
        };
  return formatChartNumber(metric.value, options, format.locale);
}

/**
 * The change beside the big number, unsigned: its arrow carries the direction.
 *
 * @param delta The change.
 * @param locale The locale.
 * @returns The text, with its unit.
 */
export function formatDelta(delta: ChartDelta, locale?: string): string {
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
    Math.abs(delta.value)
  );
  if (!delta.unit) {
    return n;
  }
  return delta.unit === '%' ? `${n}%` : `${n} ${delta.unit}`;
}
