/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Demo data for the radial charts: one ring against a limit, a small ring,
// and the rings that expand.

import { fixtureSet } from './bars';
import { HOUR, ORIGIN, clock, round } from './data';
import type { ChartFixture, RadialData, RadialRing } from './types';

type Size = 'sm' | 'lg';

const LIMIT = 90;

/** Load per resource, % of capacity: now, and projected an hour out. */
const RESOURCES = [
  { label: 'Compute', now: 72, next: 76, perHour: 6 },
  { label: 'Memory', now: 61, next: 63, perHour: 4 },
  { label: 'Storage', now: 44, next: 45, perHour: 1.5 },
  { label: 'Network', now: 37, next: 41, perHour: 3 },
];

/**
 * The rings for the first `count` resources.
 *
 * @param count How many rings.
 * @param step Readings past the first.
 * @returns The rings.
 */
function rings(count: number, step: number): RadialRing[] {
  return RESOURCES.slice(0, count).map((r) => {
    const value = step ? r.next : r.now;
    return {
      label: r.label,
      value,
      projected: round(Math.min(100, value + r.perHour * 2)),
      max: 100,
    };
  });
}

/**
 * A radial card.
 *
 * @param count How many rings.
 * @param eyebrow The card's eyebrow.
 * @returns The builder.
 */
function radial(count: number, eyebrow: string) {
  return (size: Size, step: number): ChartFixture<RadialData> => {
    const data = {
      rings: rings(count, step),
      threshold: { value: LIMIT, label: 'Limit' },
    };
    const lead = data.rings[0];
    const near = (lead.projected ?? lead.value) >= LIMIT - 5;
    return {
      data,
      format: {
        value: { style: 'unit', unit: 'percent', maximumFractionDigits: 0 },
        locale: 'en-US',
      },
      card: {
        eyebrow,
        metric: {
          value: lead.value,
          unit: `% ${lead.label.toLowerCase()} load`,
        },
        delta: {
          value: step ? 4 : 3,
          unit: 'pts',
          direction: 'up',
          kind: near ? 'warning' : 'default',
        },
        headline: near
          ? `${lead.label} nears its limit within two hours`
          : `${lead.label} stays under its limit`,
        body:
          size === 'lg'
            ? 'Each ring is load now, then load projected two hours out. The limit is the same for every resource.'
            : 'Load now, then two hours out.',
        status: {
          kind: near ? 'warning' : 'default',
          label: near ? 'Watch' : 'Steady',
          stamp: clock(ORIGIN + (2 + step) * HOUR),
        },
      },
    };
  };
}

export const capacityGauge = fixtureSet(
  'C8',
  'Compute load',
  radial(1, 'Cluster capacity')
);
export const radialSmall = fixtureSet(
  'C8s',
  'Compute load, small',
  radial(1, 'Compute')
);
export const radialRings = fixtureSet(
  'C8l',
  'Load by resource',
  radial(3, 'Cluster capacity')
);
export const radialExpand = fixtureSet(
  'C8e',
  'Load by resource, expandable',
  radial(4, 'Cluster capacity')
);
