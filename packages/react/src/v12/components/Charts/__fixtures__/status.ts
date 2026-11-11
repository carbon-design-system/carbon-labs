/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Demo data for the status cards: a reading every 10 minutes, how fresh it
// is, and where its projection stands against a limit.

import type { ChartPoint } from '../components/types';
import { fixtureSet } from './bars';
import { MINUTE, ORIGIN, clock, percentChange, range, round } from './data';
import type {
  CardContent,
  ChartFixture,
  ForecastStanding,
  Freshness,
  StatusData,
} from './types';

type Size = 'sm' | 'lg';

const CADENCE = 10 * MINUTE;
const LIMIT = 85;
/** The rate's climb per reading, which the projection follows. */
const TREND = 1.8;

/**
 * Error rate per thousand requests at reading `i`: a slow climb.
 *
 * @param i The reading.
 * @returns The rate.
 */
const rateAt = (i: number): number =>
  round(52 + i * TREND + Math.sin(i) * 1.2, 1);

/**
 * The readings up to reading `count`.
 *
 * @param count How many.
 * @returns The readings.
 */
function readings(count: number): ChartPoint[] {
  return range(count).map((i) => ({ x: ORIGIN + i * CADENCE, y: rateAt(i) }));
}

/** What each freshness says on the card. */
const FRESHNESS: Record<
  Freshness,
  Pick<CardContent, 'headline' | 'status'> & { body: string }
> = {
  live: {
    headline: 'Errors are climbing slowly',
    body: 'A reading arrives every 10 minutes.',
    status: { kind: 'success', label: 'Live' },
  },
  stale: {
    headline: 'The latest reading is late',
    body: 'The last reading arrived 25 minutes ago. The card shows it until a new one comes in.',
    status: { kind: 'warning', label: 'Stale' },
  },
  failed: {
    headline: 'Readings stopped arriving',
    body: 'The source hasn’t answered for 40 minutes. The value shown is the last one received.',
    status: { kind: 'danger', label: 'No data' },
  },
  recovered: {
    headline: 'Readings are back',
    body: 'The missing readings were filled in when the source answered again.',
    status: { kind: 'success', label: 'Live' },
  },
};

/** What each forecast standing says on the card. */
const STANDING: Record<ForecastStanding, string> = {
  good: 'The projection stays under the limit for the next two hours.',
  warning: 'The projection reaches the limit within the hour.',
  critical: 'The rate is over the limit.',
};

/**
 * One status card.
 *
 * @param freshness How fresh its reading is.
 * @param count How many readings it has.
 * @param withForecast Whether it shows where the projection stands.
 * @returns The fixture.
 */
export function statusScene(
  freshness: Freshness,
  count: number,
  withForecast: boolean
): ChartFixture<StatusData> {
  const rs = readings(
    freshness === 'stale' || freshness === 'failed' ? count - 2 : count
  );
  const last = rs[rs.length - 1];
  const before = rs[rs.length - 2];
  const stepsToLimit = (LIMIT - last.y) / TREND;
  const standing: ForecastStanding =
    last.y >= LIMIT ? 'critical' : stepsToLimit <= 6 ? 'warning' : 'good';
  const words = FRESHNESS[freshness];
  return {
    data: {
      freshness,
      readings: rs,
      forecast: withForecast
        ? {
            standing,
            limit: { value: LIMIT, label: 'Limit' },
            reachesAt:
              last.y >= LIMIT ? null : round(last.x + stepsToLimit * CADENCE),
          }
        : undefined,
    },
    format: { value: { maximumFractionDigits: 1 }, locale: 'en-US' },
    card: {
      eyebrow: 'Error rate',
      metric: { value: last.y, unit: 'per 1,000 requests', decimals: 1 },
      delta: {
        value: percentChange(before.y, last.y),
        unit: '%',
        direction: last.y >= before.y ? 'up' : 'down',
        kind: standing === 'good' ? 'default' : 'danger',
      },
      headline: words.headline,
      body: withForecast ? `${words.body} ${STANDING[standing]}` : words.body,
      status: { ...words.status, stamp: clock(last.x) },
    },
  };
}

/**
 * The status card: a live reading, the larger card with its forecast.
 *
 * @param size The size.
 * @param step Readings past the first.
 * @returns The fixture.
 */
function status(size: Size, step: number): ChartFixture<StatusData> {
  return statusScene('live', 12 + step, size === 'lg');
}

export const statusCards = fixtureSet('status', 'Error rate', status);

/** A status card in each freshness, for state stories. */
export const STATUS_FRESHNESS: Record<Freshness, ChartFixture<StatusData>> = {
  live: statusScene('live', 12, false),
  stale: statusScene('stale', 12, false),
  failed: statusScene('failed', 12, false),
  recovered: statusScene('recovered', 14, false),
};

/** A status card at each forecast standing, for state stories. */
export const STATUS_STANDING: Record<
  ForecastStanding,
  ChartFixture<StatusData>
> = {
  good: statusScene('live', 6, true),
  warning: statusScene('live', 16, true),
  critical: statusScene('live', 20, true),
};
