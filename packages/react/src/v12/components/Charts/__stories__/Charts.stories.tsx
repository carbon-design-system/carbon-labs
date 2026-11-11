/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  CHART_DESIGN,
  CHART_THEMES,
  PALETTE_NEUTRALS,
  chartCardVars,
  chartKindColor,
  chartRoleOklch,
  formatChartNumber,
  formatDelta,
  formatMetric,
  oklchToHex,
  paletteColor,
  paletteRatios,
  paletteSlots,
  paletteSmallSlot,
  type ChartColorRole,
  type ChartPoint,
  type ChartTheme,
  type PaletteColorName,
} from '../index';
import {
  CHART_FIXTURES,
  type ChartFixture,
  type ChartFixtureSet,
} from '../__fixtures__';
import mdx from './Charts.mdx';

/** Every dataset, by a name a control can show. */
const DATASETS = Object.fromEntries(
  Object.values(CHART_FIXTURES).flatMap((family) =>
    (Object.values(family) as ChartFixtureSet<unknown>[]).map((set) => [
      `${set.title} (${set.chart})`,
      set,
    ])
  )
) as Record<string, ChartFixtureSet<unknown>>;
const NAMES = Object.keys(DATASETS);

/**
 * Every point in a dataset.
 *
 * @param data The data.
 * @returns The points.
 */
function pointsOf(data: unknown): ChartPoint[] {
  if (Array.isArray(data)) {
    return data.flatMap(pointsOf);
  }
  if (data && typeof data === 'object') {
    return 'x' in data && 'y' in data
      ? [data as ChartPoint]
      : Object.values(data).flatMap(pointsOf);
  }
  return [];
}

interface PreviewArgs {
  dataset: string;
  size: 'sm' | 'lg';
  live: boolean;
}

/**
 * A card's text and its data's extent, at the card's size: what a chart
 * takes, before the plot is drawn.
 *
 * @param props The fixture.
 * @returns The preview.
 */
function FixturePreview({
  fixture,
  size,
}: {
  fixture: ChartFixture<unknown>;
  size: 'sm' | 'lg';
}) {
  const { card, format } = fixture;
  const points = pointsOf(fixture.data);
  const measured = points.filter((p) => p.basis !== 'projected');
  const projectedPoints = points.filter((p) => p.basis === 'projected');
  const ys = points.map((p) => p.y);
  const t = CHART_DESIGN.type[size];
  return (
    <article
      aria-label={card.eyebrow}
      style={{
        ...chartCardVars(size),
        boxSizing: 'border-box',
        width: 'var(--cds-chart-width)',
        maxWidth: '100%',
        padding:
          'var(--cds-chart-pad-top) var(--cds-chart-pad-x) var(--cds-chart-pad-bottom)',
        borderRadius: 'var(--cds-chart-radius)',
        background: 'var(--cds-surface, var(--cds-layer-01))',
        color: 'var(--cds-chart-color-primary)',
      }}>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--cds-chart-eyebrow)',
          color: 'var(--cds-chart-color-eyebrow)',
        }}>
        {card.eyebrow}
      </p>
      <p
        style={{
          margin: 'var(--cds-chart-eyebrow-gap) 0 0',
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--cds-chart-metric-gap)',
        }}>
        <span
          style={{
            fontSize: 'var(--cds-chart-hero)',
            lineHeight: 'var(--cds-chart-hero-line)',
            fontWeight: 600,
          }}>
          {formatMetric(card.metric, format)}
        </span>
        <span
          style={{
            fontSize: 'var(--cds-chart-unit)',
            color: 'var(--cds-chart-color-unit)',
          }}>
          {card.metric.unit}
        </span>
        {card.delta ? (
          <span
            style={{
              marginInlineStart: t.unitInk === 'primary' ? 0 : 'auto',
              color: chartKindColor(card.delta.kind),
            }}>
            {card.delta.direction === 'up' ? '↑' : '↓'}{' '}
            {formatDelta(card.delta, format.locale)}
          </span>
        ) : null}
      </p>
      <dl
        style={{
          margin:
            'var(--cds-chart-gap-above-plot) 0 var(--cds-chart-gap-below-plot)',
          minHeight: 'var(--cds-chart-plot-height)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignContent: 'center',
          gap: '4px 16px',
          fontSize: 'var(--cds-chart-stamp)',
          color: 'var(--cds-chart-color-stamp)',
          border: '1px dashed var(--cds-border-subtle-01)',
          paddingInline: 16,
        }}>
        <dt>Measured</dt>
        <dd style={{ margin: 0 }}>{measured.length} values</dd>
        <dt>Projected</dt>
        <dd style={{ margin: 0 }}>{projectedPoints.length} values</dd>
        <dt>From</dt>
        <dd style={{ margin: 0 }}>
          {formatChartNumber(Math.min(...ys), format.value, format.locale)}
        </dd>
        <dt>To</dt>
        <dd style={{ margin: 0 }}>
          {formatChartNumber(Math.max(...ys), format.value, format.locale)}
        </dd>
      </dl>
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--cds-chart-headline)',
          lineHeight: 'var(--cds-chart-headline-line)',
          fontWeight: t.headlineWeight,
        }}>
        {card.headline}
      </h3>
      <p
        style={{
          margin: 'var(--cds-chart-text-gap) 0 0',
          fontSize: 'var(--cds-chart-body)',
          lineHeight: 'var(--cds-chart-body-line)',
          color: 'var(--cds-chart-color-body)',
        }}>
        {card.body}
      </p>
      <p
        style={{
          margin: 'var(--cds-chart-foot-gap) 0 0',
          fontSize: 'var(--cds-chart-stamp)',
          color: chartKindColor(card.status.kind),
        }}>
        {card.status.label}
        {card.status.stamp ? ` · ${card.status.stamp}` : ''}
      </p>
    </article>
  );
}

export default {
  title: 'V12/Charts',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [],
      reduced: {},
      states: ['rest', 'live-update'],
    },
  },
  argTypes: {
    dataset: { control: 'select', options: NAMES },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    live: { control: 'boolean', name: 'live update' },
  },
};

/** A dataset's card text and the extent of its data, at one size; "live update" swaps in the next reading. */
export const Fixtures = {
  args: { dataset: NAMES[0], size: 'sm', live: false },
  render: function FixturesStory(args: PreviewArgs) {
    const set = DATASETS[args.dataset] ?? DATASETS[NAMES[0]];
    const fixture = (args.live ? set.next : set.sizes)[args.size];
    return <FixturePreview fixture={fixture} size={args.size} />;
  },
};

/** One swatch: its color, name and contrast against the page and the card. */
interface Swatch {
  name: string;
  color: string;
}

/**
 * A row of swatches, each with its ratio on the page and on the card.
 *
 * @param props The row's label, its swatches, the theme and the ratio they need.
 * @returns The row.
 */
function SwatchRow({
  label,
  swatches,
  theme,
  min,
}: {
  label: string;
  swatches: Swatch[];
  theme: ChartTheme;
  min: number;
}) {
  return (
    <section style={{ marginBlockEnd: 16 }}>
      <h4
        style={{
          margin: '0 0 8px',
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--cds-text-secondary)',
        }}>
        {label} ({min}:1)
      </h4>
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}>
        {swatches.map(({ name, color }) => {
          const r = paletteRatios(color, theme);
          return (
            <li key={name} style={{ inlineSize: 88, fontSize: 11 }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  blockSize: 32,
                  borderRadius: 4,
                  background: color,
                }}
              />
              <span style={{ display: 'block', marginBlockStart: 4 }}>
                {name}
              </span>
              <span
                style={{
                  display: 'block',
                  color: 'var(--cds-text-secondary)',
                }}>
                {color}
              </span>
              <span
                style={{
                  display: 'block',
                  color:
                    r.min >= min
                      ? 'var(--cds-text-secondary)'
                      : 'var(--cds-support-error)',
                }}>
                {r.page.toFixed(2)} · {r.card.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const named = (names: readonly PaletteColorName[]): Swatch[] =>
  names.map((name) => ({ name, color: paletteColor(name) }));

const roles = (list: ChartColorRole[], theme: ChartTheme): Swatch[] =>
  list.map((name) => ({
    name,
    color: oklchToHex(chartRoleOklch(name, theme)),
  }));

/**
 * A theme's palette on its page, inside a card.
 *
 * @param props The theme.
 * @returns The panel.
 */
function PalettePanel({ theme }: { theme: ChartTheme }) {
  const slots = paletteSlots(theme, 10);
  const c = CHART_DESIGN.color;
  return (
    <div
      className={`cds--v12-${theme}`}
      style={{
        padding: 24,
        background: oklchToHex(chartRoleOklch('background', theme)),
        color: 'var(--cds-text-primary)',
      }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>
        {theme === 'light' ? 'Light' : 'Dark'}: page · card
      </h3>
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: oklchToHex(chartRoleOklch('surface', theme)),
        }}>
        <SwatchRow
          label="Series, large marks"
          swatches={named(slots.map((s) => s.token))}
          theme={theme}
          min={3}
        />
        <SwatchRow
          label="Series, small marks"
          swatches={named(slots.map((s) => paletteSmallSlot(s, theme).token))}
          theme={theme}
          min={4.5}
        />
        <SwatchRow
          label="Measured ramp"
          swatches={named(PALETTE_NEUTRALS[theme].measured)}
          theme={theme}
          min={3}
        />
        <SwatchRow
          label="Single series and status"
          swatches={roles(
            [c.measured, c.projected, c.danger, c.success, c.warning],
            theme
          )}
          theme={theme}
          min={3}
        />
        <SwatchRow
          label="Text"
          swatches={roles(['text-primary', 'text-secondary'], theme)}
          theme={theme}
          min={4.5}
        />
      </div>
    </div>
  );
}

/** The series palette, the measured ramp and the text on both v12 themes, each swatch with its ratio on the page and on the card. */
export const Palette = {
  argTypes: {
    dataset: { table: { disable: true } },
    size: { table: { disable: true } },
    live: { table: { disable: true } },
  },
  render: function PaletteStory() {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {CHART_THEMES.map((theme) => (
          <PalettePanel key={theme} theme={theme} />
        ))}
      </div>
    );
  },
};
