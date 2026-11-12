/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Card, type CardOverflowAction } from '@carbon-labs/react-card';
import {
  SkeletonLines,
  SkeletonOf,
  SkeletonRun,
  StatusMark,
  type StatusMarkKind,
} from '@carbon-labs/react-feedback';
import { ArrowDownRight, ArrowUpRight } from '@carbon-labs/react-motion-icons';
import { RollText } from '@carbon-labs/react-roll-text';
import { ThemeZone } from '@carbon-labs/react-theme-zone';
import { cx } from '@carbon-labs/react-util';
import { chartCardVars, chartKindColor } from './card';
import { CHART_DESIGN } from './design';
import { formatDelta } from './format';
import type {
  ChartDelta,
  ChartFormat,
  ChartKind,
  ChartMetric,
  ChartSize,
  ChartState,
  ChartStatus,
} from './types';
import './card.scss';

/* ============================================================================
 * ChartCard: the card every chart in the family sits in, on the lane's Card.
 *
 *   header    the title, and the overflow menu at its end (Card's own)
 *   metric    the big number, its fraction and unit, and the delta: an arrow
 *             and the change, in the delta's kind color (warning: the ink
 *             and its mark). The delta sits at the row's end, or after the
 *             unit (`lg`)
 *   plot      the chart's slot, at the size's plot height; `md` runs it to
 *             the card's edges. The plot stays left to right
 *   foot      the headline, the description, the status line and a footer
 *             slot; then the actions as Card's buttons, the first primary
 *   sizes     `sm` 380, `md` the 405 summary card, `lg` 640: geometry, type
 *             and text colors from `chartCardVars`
 *   theme     the page's, or a theme of its own through ThemeZone
 *   states    `loading`: the lane's skeleton, the plot as a block;
 *             `empty` and `error`: a message in the plot's place, no metric
 *   motion    a new value rolls only the characters that changed (RollText),
 *             the number and the delta each on their own roll; a new status
 *             cues its mark (StatusMark). Reduced: both land at once
 *   a11y      a group named by its title; the metric and delta read as one
 *             line of text ("12.4K, up 8%"); the overflow menu has a name
 * ========================================================================== */

/** An item in the card's overflow menu: Card's (`isDelete`, a danger row). */
export type ChartCardOverflowAction = CardOverflowAction;

/** A button in the card's foot. */
export interface ChartCardAction {
  label: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** A link instead of a button. */
  href?: string;
  disabled?: boolean;
}

export interface ChartCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children' | 'onClick' | 'onKeyDown'
> {
  /** The card's title, at its top. It names the card. */
  title: string;
  /** The big number. */
  metric?: ChartMetric;
  /** The change beside the big number. */
  delta?: ChartDelta;
  /** How the metric is written, and in which locale. */
  format?: ChartFormat;
  /** A sentence under the plot that says what the data shows. */
  headline?: ReactNode;
  /** More about it, under the headline. */
  description?: ReactNode;
  /** The status line: a kind, a label and when the data was read. */
  status?: ChartStatus;
  /** After the status line. */
  footer?: ReactNode;
  /** Buttons in the card's foot: the first is the primary, the second the secondary. */
  actions?: readonly ChartCardAction[];
  /** The overflow menu's items; none, no menu. */
  overflowActions?: readonly ChartCardOverflowAction[];
  /** The overflow menu's name. Default "Options". */
  overflowAriaLabel?: string;
  /** `sm` 380, `md` the 405 summary card, `lg` 640. Default `sm`. */
  size?: ChartSize;
  /** What the card shows: its data, a skeleton, its empty state or its error. Default `ready`. */
  state?: ChartState;
  /** What the plot's place says when there is no data. */
  emptyText?: string;
  /** What the plot's place says when the data couldn't be read. */
  errorText?: string;
  /** The card's own theme: `page` (default), `light`, `dark` or `inverse`. */
  theme?: 'page' | 'light' | 'dark' | 'inverse';
  /** The plot. */
  children?: ReactNode;
}

/** The status mark each kind takes; `default` has none. */
const STATUS_MARK: Record<ChartKind, StatusMarkKind | null> = {
  success: 'success',
  warning: 'warning',
  danger: 'error',
  default: null,
};

/** The metric's text, split at its decimal point: the whole part, and the rest. */
interface MetricText {
  whole: string;
  fraction: string;
  /** The whole text. */
  text: string;
}

/**
 * The metric as text, split into the big number and its fraction: `82.4`
 * is `82` and `.4`, `12.4K` is `12` and `.4K`. A format function's text
 * isn't split.
 *
 * @param metric The metric.
 * @param format The card's format.
 * @returns The parts.
 */
export function metricText(
  metric: ChartMetric,
  format: ChartFormat = {}
): MetricText {
  if (typeof format.value === 'function') {
    const text = format.value(metric.value);
    return { whole: text, fraction: '', text };
  }
  const options: Intl.NumberFormatOptions =
    metric.decimals == null
      ? { ...format.value }
      : {
          ...format.value,
          minimumFractionDigits: metric.decimals,
          maximumFractionDigits: metric.decimals,
        };
  const parts = new Intl.NumberFormat(format.locale, options).formatToParts(
    metric.value
  );
  const point = parts.findIndex((p) => p.type === 'decimal');
  const join = (list: Intl.NumberFormatPart[]) =>
    list.map((p) => p.value).join('');
  const text = join(parts);
  return point < 0
    ? { whole: text, fraction: '', text }
    : {
        whole: join(parts.slice(0, point)),
        fraction: join(parts.slice(point)),
        text,
      };
}

/**
 * The metric and delta as one line of text, for assistive technology:
 * "12.4K requests, up 8%".
 *
 * @param metric The metric, as text, and its unit.
 * @param delta The change.
 * @param locale The locale.
 * @returns The line.
 */
export function spokenMetric(
  metric: { text: string; unit?: string } | null,
  delta: ChartDelta | undefined,
  locale?: string
): string {
  const parts: string[] = [];
  if (metric) {
    parts.push(metric.unit ? `${metric.text} ${metric.unit}` : metric.text);
  }
  if (delta) {
    parts.push(`${delta.direction} ${formatDelta(delta, locale)}`);
  }
  return parts.join(', ');
}

/** The metric row: the number, its fraction and unit, and the delta. */
function MetricRow({
  metric,
  delta,
  format,
  size,
  loading,
}: {
  metric?: ChartMetric;
  delta?: ChartDelta;
  format?: ChartFormat;
  size: ChartSize;
  loading: boolean;
}) {
  const text = metric ? metricText(metric, format) : null;
  const locale = format?.locale;
  const end = CHART_DESIGN.layout[size].deltaAlign === 'end';
  const deltaText = delta ? formatDelta(delta, locale) : '';
  const up = delta?.direction === 'up';
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  const spoken = spokenMetric(
    text ? { text: text.text, unit: metric?.unit } : null,
    delta,
    locale
  );

  if (loading) {
    return (
      <p className="cds-chart-card__metric">
        <SkeletonRun>
          <span className="cds-chart-card__value">{text?.text ?? '000'}</span>
        </SkeletonRun>
      </p>
    );
  }

  return (
    <p
      className={cx(
        'cds-chart-card__metric',
        end && 'cds-chart-card__metric--end'
      )}>
      <span className="cds-chart-card__spoken">{spoken}</span>
      {text ? (
        <>
          {/* One number: its parts keep their order in right to left. */}
          <span className="cds-chart-card__number" dir="ltr">
            <span className="cds-chart-card__value" aria-hidden="true">
              <RollText text={text.whole} order={metric!.value} />
            </span>
            {text.fraction ? (
              <span className="cds-chart-card__fraction" aria-hidden="true">
                <RollText text={text.fraction} order={metric!.value} />
              </span>
            ) : null}
          </span>
          {metric?.unit ? (
            <span className="cds-chart-card__unit" aria-hidden="true">
              {metric.unit}
            </span>
          ) : null}
        </>
      ) : null}
      {delta ? (
        <span
          className="cds-chart-card__delta"
          data-kind={delta.kind ?? 'default'}
          // Warning's color is too light for text: the text takes the ink
          // and the warning mark says the kind, as the status line does.
          style={{
            color:
              delta.kind === 'warning'
                ? chartKindColor('default')
                : chartKindColor(delta.kind),
          }}
          aria-hidden="true"
          data-motion-icon-frame="">
          {delta.kind === 'warning' ? (
            <span className="cds-chart-card__delta-mark">
              <StatusMark kind="warning" size={16} arriveAfter={null} />
            </span>
          ) : null}
          <Arrow size={16} className="cds-chart-card__arrow" />
          <RollText text={deltaText} order={up ? delta.value : -delta.value} />
        </span>
      ) : null}
    </p>
  );
}

/** The status line: its kind's mark, its label and its stamp. */
function StatusLine({
  status,
  loading,
}: {
  status: ChartStatus;
  loading: boolean;
}) {
  const mark = STATUS_MARK[status.kind ?? 'default'];
  const words = [status.label, status.stamp].filter(Boolean).join(' · ');
  if (loading) {
    return (
      <p className="cds-chart-card__status">
        <SkeletonRun>{words}</SkeletonRun>
      </p>
    );
  }
  return (
    <p className="cds-chart-card__status">
      {mark ? (
        <span className="cds-chart-card__status-mark" aria-hidden="true">
          <StatusMark kind={mark} size={16} arriveAfter={null} />
        </span>
      ) : null}
      <span className="cds-chart-card__status-label">{status.label}</span>
      {status.stamp ? (
        <span className="cds-chart-card__stamp">{status.stamp}</span>
      ) : null}
    </p>
  );
}

/** A card for any chart: its title, its metric and delta, the plot, and what the data says. */
export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(
  function ChartCard(
    {
      title,
      metric,
      delta,
      format,
      headline,
      description,
      status,
      footer,
      actions = [],
      overflowActions,
      overflowAriaLabel,
      size = 'sm',
      state = 'ready',
      emptyText = 'No data to show',
      errorText = 'The data couldn’t be loaded',
      theme = 'page',
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const titleId = `cds-chart-card-title-${useId().replace(/:/g, '')}`;
    const loading = state === 'loading';
    const message =
      state === 'empty' ? emptyText : state === 'error' ? errorText : null;
    const [primary, secondary] = actions;
    const layout = CHART_DESIGN.layout[size];
    const hasMetric = !message && (metric != null || delta != null);

    const card = (
      <Card
        {...rest}
        ref={ref}
        role="group"
        // Loading, the title is a skeleton: the group keeps its name.
        aria-labelledby={loading ? undefined : titleId}
        aria-label={loading ? title : undefined}
        aria-busy={loading || undefined}
        className={cx(
          'cds-chart-card',
          `cds-chart-card--${size}`,
          layout.plotBleed && 'cds-chart-card--bleed',
          className
        )}
        style={{ ...chartCardVars(size), ...style } as CSSProperties}
        title={
          <span id={titleId}>
            {loading ? <SkeletonRun>{title}</SkeletonRun> : title}
          </span>
        }
        actionsPlacement="top"
        overflowActions={overflowActions}
        overflowAriaLabel={overflowAriaLabel}
        primaryButtonText={primary?.label}
        primaryButtonHref={primary?.href}
        primaryButtonDisabled={primary?.disabled}
        onPrimaryButtonClick={primary?.onClick}
        secondaryButtonText={secondary?.label}
        secondaryButtonHref={secondary?.href}
        secondaryButtonDisabled={secondary?.disabled}
        onSecondaryButtonClick={secondary?.onClick}>
        {hasMetric ? (
          <MetricRow
            metric={metric}
            delta={delta}
            format={format}
            size={size}
            loading={loading}
          />
        ) : null}
        {message ? (
          <div
            className="cds-chart-card__plot cds-chart-card__plot--message"
            data-state={state}>
            <p className="cds-chart-card__message">{message}</p>
          </div>
        ) : (
          // The plot keeps its axes left to right in either direction.
          <div className="cds-chart-card__plot" dir="ltr">
            {loading ? null : children}
          </div>
        )}
        {headline != null ||
        description != null ||
        status != null ||
        footer != null ? (
          <div className="cds-chart-card__foot">
            {headline != null || description != null ? (
              <div className="cds-chart-card__text">
                {headline != null ? (
                  <p className="cds-chart-card__headline">
                    {loading ? <SkeletonRun>{headline}</SkeletonRun> : headline}
                  </p>
                ) : null}
                {description != null ? (
                  <p className="cds-chart-card__description">
                    {loading ? (
                      <SkeletonLines>{description}</SkeletonLines>
                    ) : (
                      description
                    )}
                  </p>
                ) : null}
              </div>
            ) : null}
            {status ? <StatusLine status={status} loading={loading} /> : null}
            {footer}
          </div>
        ) : null}
      </Card>
    );

    const body = loading ? (
      <SkeletonOf blocks=".cds-chart-card__plot">{card}</SkeletonOf>
    ) : (
      card
    );
    return theme === 'page' ? (
      body
    ) : (
      <ThemeZone theme={theme} className="cds-chart-card-zone">
        {body}
      </ThemeZone>
    );
  }
);
ChartCard.displayName = 'ChartCard';
