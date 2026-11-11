/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Neutral demo data for every chart in the family, for stories and tests:
// each chart at both sizes, and one reading later for live updates. Not part
// of the package's entry.

import { area } from './area';
import {
  groupedBars,
  horizontalBars,
  horizontalStacked,
  rangeBars,
  singleBars,
  stackedBars,
} from './bars';
import { cones, dotMatrix } from './matrix';
import {
  capacityGauge,
  radialExpand,
  radialRings,
  radialSmall,
} from './radial';
import { statusCards } from './status';

export { STATUS_FRESHNESS, STATUS_STANDING, statusScene } from './status';
export type {
  AreaData,
  AreaRegion,
  BarData,
  CardContent,
  ChartFixture,
  ChartFixtureSet,
  ConeData,
  ConeMultiple,
  DotMatrixData,
  ForecastStanding,
  Freshness,
  RadialData,
  RadialRing,
  StatusData,
} from './types';

/** Every chart's demo data, by the package that draws it. */
export const CHART_FIXTURES = {
  bar: {
    single: singleBars,
    range: rangeBars,
    grouped: groupedBars,
    stacked: stackedBars,
    horizontal: horizontalBars,
    horizontalStacked,
  },
  radial: {
    gauge: capacityGauge,
    small: radialSmall,
    rings: radialRings,
    expand: radialExpand,
  },
  area: { area },
  dotMatrix: { dotMatrix },
  cone: { cones },
  status: { statusCards },
} as const;

export {
  area,
  capacityGauge,
  cones,
  dotMatrix,
  groupedBars,
  horizontalBars,
  horizontalStacked,
  radialExpand,
  radialRings,
  radialSmall,
  rangeBars,
  singleBars,
  stackedBars,
  statusCards,
};
