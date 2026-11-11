/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motionTokens, toEasing } from '@carbon-labs/v12-motion';
import { describe, expect, it } from 'vitest';
import {
  CHART_COLOR_ROLES,
  CHART_DESIGN,
  CHART_MARKS,
  CHART_SIZES,
  chartCardVars,
  chartFill,
  hoverStyleOf,
  type ChartFamilyId,
} from '../index';

/**
 * Every leaf under a value, with its path.
 *
 * @param value The value.
 * @param path Its path.
 * @returns The leaves.
 */
function leaves(value: unknown, path: string[] = []): [string[], unknown][] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, [...path, k]));
  }
  return [[path, value]];
}

/**
 * Every object under a value, the value included.
 *
 * @param value The value.
 * @returns The objects.
 */
function objects(value: unknown): object[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  return [value, ...Object.values(value).flatMap(objects)];
}

const DURATION_KEYS =
  /^(front|grow|stagger|after|dissolve|duration|fade|roll|max|sweep|enter|projectedAfter|reveal|move|projected|overlap|cap|capFade|home|step|fadeOut|fadeInAfter|fadeIn|friction|follow|edgeScroll|wheelGap|wheelSettle|slide|highlight|leave|trail)$/;

describe('CHART_DESIGN', () => {
  it('is frozen all the way down', () => {
    for (const o of objects(CHART_DESIGN)) {
      expect(Object.isFrozen(o)).toBe(true);
    }
  });

  it('names motion only by duration token', () => {
    const motion = [
      ...leaves(CHART_DESIGN.motion, ['motion']),
      ...leaves(CHART_DESIGN.range, ['range']),
      ...leaves(CHART_DESIGN.stage, ['stage']),
      ...leaves(CHART_DESIGN.hover, ['hover']),
    ];
    const durations = motion.filter(
      ([path, v]) =>
        typeof v === 'string' && DURATION_KEYS.test(path[path.length - 1])
    );
    expect(durations.length).toBeGreaterThan(40);
    for (const [path, v] of durations) {
      expect(Object.keys(motionTokens.duration), path.join('.')).toContain(v);
    }
  });

  it('names every easing as the seam takes it', () => {
    const refs = objects(CHART_DESIGN).filter(
      (o): o is { name: 'standard'; mode: 'productive' } =>
        'name' in o && 'mode' in o
    );
    expect(refs.length).toBeGreaterThan(20);
    for (const ref of refs) {
      expect(toEasing(ref)).toHaveLength(4);
    }
  });

  it('draws only roles the color lookup knows', () => {
    const roles = [
      ...leaves(CHART_DESIGN.color),
      ...leaves(CHART_DESIGN.hover).filter(([p]) =>
        /Role$|^tag(Fill|Ink)$|^role$/.test(p[p.length - 1])
      ),
    ].flatMap(([, v]) => (Array.isArray(v) ? v : [v]));
    for (const role of roles) {
      expect(Object.keys(CHART_COLOR_ROLES)).toContain(role);
    }
  });

  it('holds about two hundred tuning values', () => {
    expect(leaves(CHART_DESIGN).length).toBeGreaterThan(180);
  });

  it('lays the three card sizes out at their widths', () => {
    expect(CHART_SIZES.map((s) => CHART_DESIGN.layout[s].width)).toEqual([
      380, 405, 640,
    ]);
    const vars = chartCardVars('lg') as Record<string, string>;
    expect(vars['--cds-chart-width']).toBe('640px');
    expect(vars['--cds-chart-color-unit']).toBe('var(--cds-text-primary)');
    expect(vars['--cds-chart-hero-tracking']).toMatch(/em$/);
  });
});

describe('chartFill', () => {
  it('gives every chart a fill', () => {
    for (const chart of Object.keys(CHART_MARKS) as ChartFamilyId[]) {
      const { fill } = chartFill(chart);
      expect(fill.texture).toBeDefined();
    }
  });

  it('takes the solid and dotted look where the variant asks for it', () => {
    const c3 = chartFill('C3');
    expect(c3.solid).toBe(true);
    expect(c3.boundary.projected).toBe(true);
    expect(c3.boundary.style).toBe('dotted');
    expect(c3.fill.coverageNear).toBe(0.5);
    expect(chartFill('C2').solid).toBe(false);
    expect(chartFill('C2').boundary.projected).toBe(false);
  });

  it('applies the dark card values on a dark card only', () => {
    expect(chartFill('C8').fill.tint).toBe(0);
    expect(chartFill('C8', true).fill.tint).toBe(0.12);
  });

  it('leaves value-sized marks without a taper', () => {
    expect(chartFill('C5').fill.edge).toBe('none');
    expect(chartFill('C5').boundary.width).toBe(1);
  });

  it('never changes the shared values', () => {
    const before = JSON.stringify(CHART_DESIGN);
    chartFill('C8', true);
    expect(JSON.stringify(CHART_DESIGN)).toBe(before);
  });
});

describe('hoverStyleOf', () => {
  it('falls back to the family style', () => {
    expect(hoverStyleOf('C2')).toBe('l1q');
    expect(hoverStyleOf('C6')).toBe('family');
  });
});
