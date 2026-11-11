/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Demo data for the area chart: requests per minute in two regions, with a
// maintenance window.

import type { ChartPoint, ChartSeries } from '../components/types';
import { fixtureSet } from './bars';
import {
  MINUTE,
  ORIGIN,
  REGIONS,
  clock,
  percentChange,
  projected,
  range,
  round,
} from './data';
import type { AreaData, ChartFixture } from './types';

type Size = 'sm' | 'lg';

const SLOT = 10 * MINUTE;

/**
 * Requests per minute, thousands: a morning ramp with a ripple.
 *
 * @param i The slot.
 * @param scale The region's share.
 * @returns The value.
 */
function requestsAt(i: number, scale: number): number {
  return scale * (6 + 10 * (1 - Math.exp(-i / 9)) + 0.8 * Math.sin(i / 2));
}

/**
 * The area chart.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function requestsArea(size: Size, step: number): ChartFixture<AreaData> {
  const slots = size === 'sm' ? 18 : 36;
  const measuredCount = Math.round(slots * 0.66) + step;
  const scales = [1, 0.62];
  const series: ChartSeries[] = scales.map((scale, s) => ({
    id: `region-${s}`,
    label: REGIONS[s],
    points: range(slots).map((i): ChartPoint => {
      const x = ORIGIN + i * SLOT;
      const y = requestsAt(i, scale);
      return i < measuredCount
        ? { x, y: round(y, 1) }
        : projected(x, y, i - measuredCount + 1, 0.025, 1);
    }),
  }));
  const lead = series[0].points;
  const now = lead[measuredCount - 1];
  const gapAt = Math.round(slots * 0.3);
  return {
    data: {
      series,
      now: now.x,
      regions: [
        {
          from: ORIGIN + gapAt * SLOT,
          to: ORIGIN + (gapAt + 2) * SLOT,
          label: 'Maintenance',
        },
      ],
      domain: [0, 20],
      ticks: [0, 10, 20],
    },
    format: {
      value: { maximumFractionDigits: 1 },
      x: { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' },
      locale: 'en-US',
    },
    card: {
      eyebrow: 'Requests per minute',
      metric: { value: now.y, unit: `K, ${REGIONS[0]}`, decimals: 1 },
      delta: {
        value: percentChange(lead[measuredCount - 2].y, now.y),
        unit: '%',
        direction: now.y >= lead[measuredCount - 2].y ? 'up' : 'down',
        kind: 'default',
      },
      headline: 'Traffic levels off after the morning ramp',
      body: `${REGIONS[1]} follows the same curve at about two thirds of the volume.`,
      status: { kind: 'success', label: 'Live', stamp: clock(now.x) },
      actions: size === 'lg' ? ['View traffic'] : undefined,
    },
  };
}

export const area = fixtureSet('C9', 'Requests per minute', requestsArea);
