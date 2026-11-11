/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The skin and the palette against the v12 themes: each value matches the
// theme it comes from, and every pair a chart draws holds its contrast on
// both themes' page and card. A theme change that breaks a pair fails here.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CHART_COLOR_READS,
  CHART_COLOR_ROLE_NAMES,
  CHART_DESIGN,
  CHART_THEMES,
  CHART_TOKEN_VALUES,
  LARGE_MARK_MIN,
  PALETTE_HUE_VALUES,
  PALETTE_HUES,
  PALETTE_NEUTRAL_LIGHTNESS,
  PALETTE_NEUTRALS,
  SMALL_MARK_MIN,
  chartRoleOklch,
  contrastRatio,
  cssColorToHex,
  formatOklch,
  hexToOklch,
  measuredRamp,
  oklchToHex,
  oklchToSrgb,
  paletteColor,
  paletteOklch,
  paletteRatios,
  paletteSeries,
  paletteSeriesByMark,
  paletteSlots,
  paletteSmallSlot,
  resolveChartSkin,
  type ChartColorRole,
  type ChartColorToken,
  type ChartTheme,
  type PaletteNeutralStep,
  type PaletteStep,
} from '../index';

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

/** The v12 themes, as the lane's Storybook generates them. */
const THEMES: Record<ChartTheme, Record<string, string>> = (() => {
  const { themes } = JSON.parse(
    read('../../../../../.storybook/v12-themes/themes.json')
  );
  const flat = (node: object, path: string[] = []): [string, string][] =>
    '$value' in node
      ? [[path.join('-'), (node as { $value: { hex: string } }).$value.hex]]
      : Object.entries(node)
          .filter(([key]) => !key.startsWith('$'))
          .flatMap(([key, child]) => flat(child, [...path, key]));
  return {
    light: Object.fromEntries(flat(themes.light)),
    dark: Object.fromEntries(flat(themes.dark)),
  };
})();

/** The lane Card's fill on each v12 theme, from the shared surface styles. */
const SURFACE: Record<ChartTheme, string> = (() => {
  const scss = read('../../../../../../v12-styles/src/styles/_surface.scss');
  const fill = (theme: ChartTheme) =>
    new RegExp(
      String.raw`\.cds--v12-${theme} \{\s*--cds-surface: (#[0-9a-f]{6});`
    ).exec(scss)?.[1];
  return { light: fill('light') ?? '', dark: fill('dark') ?? '' };
})();

/** The v12 page bases, and Carbon's hues the v12 themes carry. */
const CARRIED: Record<ChartTheme, Partial<Record<ChartColorToken, string>>> = {
  light: {
    background: '#f9fafd',
    interactive: '#0f62fe',
    'support-success': '#24a148',
    'support-error': '#da1e28',
    'support-warning': '#f1c21b',
  },
  dark: {
    background: '#0a0b0d',
    interactive: '#4589ff',
    'support-success': '#42be65',
    'support-error': '#fa4d56',
    'support-warning': '#f1c21b',
  },
};

/** Carbon's color steps, 20 to 80. */
const CARBON_STEPS: Record<string, string[]> = {
  blue: [
    '#d0e2ff',
    '#a6c8ff',
    '#78a9ff',
    '#4589ff',
    '#0f62fe',
    '#0043ce',
    '#002d9c',
  ],
  teal: [
    '#9ef0f0',
    '#3ddbd9',
    '#08bdba',
    '#009d9a',
    '#007d79',
    '#005d5d',
    '#004144',
  ],
  purple: [
    '#e8daff',
    '#d4bbff',
    '#be95ff',
    '#a56eff',
    '#8a3ffc',
    '#6929c4',
    '#491d8b',
  ],
  magenta: [
    '#ffd6e8',
    '#ffafd2',
    '#ff7eb6',
    '#ee5396',
    '#d02670',
    '#9f1853',
    '#740937',
  ],
  cyan: [
    '#bae6ff',
    '#82cfff',
    '#33b1ff',
    '#1192e8',
    '#0072c3',
    '#00539a',
    '#003a6d',
  ],
};

/** Carbon's grays, 10 to 100: the neutral ladder takes their lightness. */
const CARBON_GRAYS = [
  '#f4f4f4',
  '#e0e0e0',
  '#c6c6c6',
  '#a8a8a8',
  '#8d8d8d',
  '#6f6f6f',
  '#525252',
  '#393939',
  '#262626',
  '#161616',
];

const other = (theme: ChartTheme): ChartTheme =>
  theme === 'light' ? 'dark' : 'light';
const role = (r: ChartColorRole, theme: ChartTheme) => chartRoleOklch(r, theme);

describe('the skin’s values', () => {
  it('match the v12 themes, token for token', () => {
    for (const theme of CHART_THEMES) {
      for (const [token, value] of Object.entries(CHART_TOKEN_VALUES[theme])) {
        const expected =
          token === 'surface'
            ? SURFACE[theme]
            : (CARRIED[theme][token as ChartColorToken] ??
              THEMES[theme][token]);
        expect(expected, `${theme} ${token}`).toMatch(/^#[0-9a-f]{6}$/);
        expect(oklchToHex(value), `${theme} ${token}`).toBe(expected);
      }
    }
  });

  it('reads a v12 token for every role, and no v11 gray', () => {
    for (const r of CHART_COLOR_ROLE_NAMES) {
      const { token, source } = CHART_COLOR_READS[r];
      if (source === 'v12') {
        expect(THEMES.light[token], r).toBeDefined();
        expect(THEMES.dark[token], r).toBeDefined();
      }
      for (const theme of CHART_THEMES) {
        const { c } = role(r, theme);
        // Grays are the v12 neutral; only the status and interactive hues
        // carry chroma.
        expect(c > 0.003, `${theme} ${r}`).toBe(true);
      }
    }
  });

  it('resolves the skin from the card’s tokens, as sRGB', () => {
    const light = resolveChartSkin('light');
    expect(light.ink).toBe('#1e1f21');
    expect(light.layer).toBe('#f4f5f8');
    expect(light.focus).toBe(light.ink);
    expect(light.textInverse).toBe(light.background);
    const served: Record<string, string> = {
      '--cds-text-primary': 'oklch(94% 0.004 262deg)',
      '--cds-layer-01': 'oklch(20% 0.004 262deg)',
      '--cds-interactive': '#4589ff',
    };
    const dark = resolveChartSkin('dark', (p) => served[p] ?? '');
    expect(dark.ink).toBe('#eaebee');
    // No quiet surface on the page: the card falls back to `layer-01`.
    expect(dark.layer).toBe('#151618');
    expect(dark.accent).toBe('#4589ff');
    expect(dark.grid).toBe(
      oklchToHex(CHART_TOKEN_VALUES.dark['border-subtle-02'])
    );
  });
});

describe('the color math', () => {
  it('reads every form a theme serves', () => {
    expect(cssColorToHex('#ABC')).toBe('#aabbcc');
    expect(cssColorToHex('oklch(55.65% 0.243 261.95deg)')).toBe('#0f62fe');
    expect(cssColorToHex('oklch(0.24 0.004 262)')).toBe('#1e1f21');
    expect(cssColorToHex('rgb(15 98 254 / 0.5)')).toBe('#0f62fe');
    expect(cssColorToHex('rgba(15, 98, 254, 1)')).toBe('#0f62fe');
    expect(cssColorToHex('color(srgb 1 1 1)')).toBe('#ffffff');
    expect(cssColorToHex('var(--x)')).toBeNull();
  });

  it('round-trips hex through OKLCH', () => {
    const blue = hexToOklch('#0f62fe');
    expect(blue && oklchToHex(blue)).toBe('#0f62fe');
    expect(hexToOklch('oklch(0.5 0 0)')).toBeNull();
    expect(formatOklch(PALETTE_HUE_VALUES.blue[60])).toBe(
      'oklch(55.65% 0.243 261.95deg)'
    );
  });

  it('brings a color outside sRGB in by chroma alone', () => {
    const rgb = oklchToSrgb({ l: 0.7, c: 0.4, h: 145 });
    for (const v of rgb) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    const back = hexToOklch(oklchToHex({ l: 0.7, c: 0.4, h: 145 }));
    expect(back?.l).toBeCloseTo(0.7, 2);
    expect(Math.abs((back?.h ?? 0) - 145)).toBeLessThan(3);
  });

  it('measures WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });
});

describe('the palette’s values', () => {
  it('are Carbon’s steps, written in OKLCH', () => {
    for (const hue of PALETTE_HUES) {
      ([20, 30, 40, 50, 60, 70, 80] as PaletteStep[]).forEach((step, i) => {
        expect(paletteColor(`${hue}-${step}`), `${hue}-${step}`).toBe(
          CARBON_STEPS[hue][i]
        );
      });
    }
  });

  it('puts the neutrals on the v12 neutral, at Carbon’s gray lightness', () => {
    CARBON_GRAYS.forEach((gray, i) => {
      const step = ((i + 1) * 10) as PaletteNeutralStep;
      expect(PALETTE_NEUTRAL_LIGHTNESS[step]).toBeCloseTo(
        hexToOklch(gray)?.l ?? 0,
        4
      );
      const n = paletteOklch(`neutral-${step}`);
      expect([n.c, n.h]).toEqual([0.004, 262]);
    });
  });

  it('serves the series as sRGB, small marks stepped to 4.5:1', () => {
    expect(paletteSeries('light', 3)).toEqual([
      '#0f62fe',
      '#009d9a',
      '#6929c4',
    ]);
    expect(paletteSeriesByMark('light', 2).small).toEqual([
      '#0f62fe',
      '#007d79',
    ]);
    expect(paletteSeriesByMark('dark', 5).small[4]).toBe('#1192e8');
    expect(measuredRamp('light')).toHaveLength(3);
  });
});

/** Both surfaces a theme's marks sit on, by name. */
const SURFACES = ['page', 'card'] as const;

/**
 * Asserts a color's contrast on both surfaces of a theme.
 *
 * @param label What it is.
 * @param color The color.
 * @param theme The theme.
 * @param min The ratio it needs.
 */
function holds(
  label: string,
  color: string | ReturnType<typeof paletteOklch>,
  theme: ChartTheme,
  min: number
) {
  const ratios = paletteRatios(color, theme);
  for (const s of SURFACES) {
    expect(
      ratios[s],
      `${label} on the ${theme} ${s}: ${ratios[s].toFixed(2)}`
    ).toBeGreaterThanOrEqual(min);
  }
}

describe('contrast on the v12 page and card', () => {
  it('holds 3:1 for every series step as a large mark', () => {
    for (const theme of CHART_THEMES) {
      for (const slot of paletteSlots(theme, 10)) {
        holds(slot.token, paletteOklch(slot.token), theme, LARGE_MARK_MIN);
      }
    }
  });

  it('holds 4.5:1 for every series step as a small mark', () => {
    for (const theme of CHART_THEMES) {
      for (const slot of paletteSlots(theme, 10)) {
        const small = paletteSmallSlot(slot, theme);
        holds(small.token, paletteOklch(small.token), theme, SMALL_MARK_MIN);
      }
    }
  });

  it('holds 4.5:1 for the small neutrals and 3:1 for the rest of the data neutrals', () => {
    for (const theme of CHART_THEMES) {
      const n = PALETTE_NEUTRALS[theme];
      for (const name of n.small) {
        holds(name, paletteOklch(name), theme, SMALL_MARK_MIN);
      }
      for (const name of [n.large, ...n.measured]) {
        holds(name, paletteOklch(name), theme, LARGE_MARK_MIN);
      }
      // Background-only neutrals are never data: each is under 3:1.
      for (const name of n.backgroundOnly) {
        expect(
          paletteRatios(paletteOklch(name), theme).min,
          `${theme} ${name}`
        ).toBeLessThan(LARGE_MARK_MIN);
      }
    }
  });

  it('moves the measured ramp’s lightest step in to the first that holds 3:1', () => {
    for (const theme of CHART_THEMES) {
      const { measured, large } = PALETTE_NEUTRALS[theme];
      const lightest = measured[measured.length - 1];
      expect(lightest).toBe(large);
      // One step further out is under 3:1.
      const step = Number(lightest.split('-')[1]);
      const out = (step + (theme === 'light' ? -10 : 10)) as PaletteNeutralStep;
      expect(
        paletteRatios(paletteOklch(`neutral-${out}`), theme).min
      ).toBeLessThan(LARGE_MARK_MIN);
    }
  });

  it('holds 3:1 for the single-series and status marks', () => {
    const c = CHART_DESIGN.color;
    for (const theme of CHART_THEMES) {
      for (const r of [c.measured, c.projected, c.danger, c.success]) {
        holds(r, role(r, theme), theme, LARGE_MARK_MIN);
      }
      // The projected blue draws 2px dots, so it holds 4.5:1 too.
      holds(c.projected, role(c.projected, theme), theme, SMALL_MARK_MIN);
      holds('focus', role('focus', theme), theme, LARGE_MARK_MIN);
    }
  });

  it('holds 4.5:1 for axis, label and card text', () => {
    const c = CHART_DESIGN.color;
    const text = [
      c.axisLabel,
      c.axisLabelFaint,
      c.axisEnd,
      c.reference,
      c.text.primary,
      c.text.unit,
      c.text.body,
      c.text.stamp,
      c.text.eyebrow,
      c.text.caption,
    ];
    expect(c.axisLabel).toBe('text-secondary');
    for (const theme of CHART_THEMES) {
      for (const r of text) {
        holds(r, role(r, theme), theme, SMALL_MARK_MIN);
      }
    }
  });

  it('holds 4.5:1 for the tooltip’s text, on its own theme or the other', () => {
    const t = CHART_DESIGN.color.tooltip;
    for (const card of CHART_THEMES) {
      for (const theme of [card, other(card)]) {
        for (const ink of [t.text, t.note]) {
          const ratio = contrastRatio(role(ink, theme), role(t.surface, theme));
          expect(
            ratio,
            `${ink} on a ${theme} tooltip: ${ratio.toFixed(2)}`
          ).toBeGreaterThanOrEqual(SMALL_MARK_MIN);
        }
      }
    }
  });

  it('holds 4.5:1 for the hover tag’s text on its fill', () => {
    const { tagFill, tagInk } = CHART_DESIGN.hover.figma;
    for (const theme of CHART_THEMES) {
      expect(
        contrastRatio(role(tagInk, theme), role(tagFill, theme))
      ).toBeGreaterThanOrEqual(SMALL_MARK_MIN);
    }
  });
});
