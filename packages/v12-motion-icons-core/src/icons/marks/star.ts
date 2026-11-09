/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import LocationStar32 from '@carbon/icons/es/location--star/32.js';
import TaskStar32 from '@carbon/icons/es/task--star/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { carbonArt, withStatic } from '../../engine';
import { PIN_LIFT, pinArt, STAR_GROW } from '../toggle/stateFillToggles';

/**
 * The star badges: Carbon's `location--star` and `task--star`, on the
 * status-mark system (utils/statusMark.ts).
 *
 * One star motion, Star's own: the star (filled, in both) grows 12.5% about
 * its centre. The base plays its own hover where it has one, else holds.
 *
 *  - Task star: the board holds (the Task set's rule); its right wall's end
 *    draws up and its floor's end left.
 *  - Location star: the pin plays Location's hover (its head lifts 2px and
 *    grows 1px across, its point holding, the sides lengthening at 2px).
 *    The star sits in the head where Location's eye does, so it rides up
 *    2px with the head as it grows, as the eye does.
 */

/** Where a star sits: Carbon's star (its ten corners) and its centre. */
export interface StarPlace {
  pts: readonly Pt[];
  c: Pt;
  /** How far it moves at full hover (riding with its base). */
  drift?: Pt;
}
const starAt = (p: StarPlace, h: number): Pt[] => {
  const s = 1 + STAR_GROW * h;
  const [dx, dy] = p.drift ? [p.drift[0] * h, p.drift[1] * h] : [0, 0];
  return p.pts.map(
    ([x, y]) =>
      [p.c[0] + (x - p.c[0]) * s + dx, p.c[1] + (y - p.c[1]) * s + dy] as Pt
  );
};

/** The star mark: Star's hover, 12.5% about its centre. */
export const STAR_MARK: MarkType<StarPlace> = {
  d: (p, h) => loopD(starAt(p, h)),
  ink: (p, h) => [starAt(p, h)],
};

type Spec = StatusMarkSpec<StarPlace>;
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

export const TASK_STAR: Spec = {
  base: {
    d:
      'M25 5H22V4A2.0058 2.0058 0 0 0 20 2H12A2.0058 2.0058 0 0 0 10 4V5H7A2.0058 2.0058 0 0 0 5 7V28A2.0058 2.0058 0 0 0 7 30H14V28H7V7H10V10H22V7H25V14H27V7A2.0058 2.0058 0 0 0 25 5Z' +
      'M20 8H12V4H20Z',
    ends: [
      {
        at: [
          [25, 14],
          [27, 14],
        ],
        back: UP,
      },
      {
        at: [
          [14, 30],
          [14, 28],
        ],
        back: LEFT,
      },
    ],
  },
  mark: STAR_MARK,
  // The star's tips are equidistant (7.4) from (23, 24.4).
  place: {
    pts: [
      [23, 17],
      [25.23, 21.32],
      [30, 22],
      [26.5, 25.167],
      [28, 30],
      [23, 27.208],
      [18, 30],
      [19.5, 25.167],
      [16, 22],
      [20.9, 21.32],
    ],
    c: [23, 24.4],
  },
};
export const TaskStarSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskStar', TASK_STAR),
  /* @__PURE__ */ carbonArt(TaskStar32)
);

/** Location's pin at hover h, without its eye: the outer teardrop and the inner one (2px in). */
const pinD = (h: number) => {
  const { outer, inner } = pinArt(h);
  return outer + inner;
};
export const LOCATION_STAR: Spec = {
  // At rest, Carbon's pin; on hover, Location's (its rest within a pixel's anti-aliasing of Carbon's).
  base: {
    d:
      'M16 30L7.5645 20.0513C7.5166 19.9942 7.2163 19.5998 7.2163 19.5998A10.8888 10.8888 0 0 1 5 13A11 11 0 0 1 27 13A10.8844 10.8844 0 0 1 24.7852 19.5973L24.7837 19.5998S24.4837 19.9942 24.439 20.0472Z' +
      'M8.8125 18.395C8.8135 18.3957 9.0459 18.7032 9.0991 18.7694L16 26.9079L22.91 18.7579C22.9539 18.7027 23.1883 18.393 23.1888 18.3922A8.901 8.901 0 0 0 25 13A9 9 0 0 0 7 13A8.9054 8.9054 0 0 0 8.8125 18.395Z',
    at: pinD,
    evenodd: true,
  },
  mark: STAR_MARK,
  // The star sits in the head, about (16, 13.4); it rides up with the head.
  place: {
    pts: [
      [16, 7],
      [17.912, 10.667],
      [22, 11.173],
      [19, 13.926],
      [19.6, 18],
      [16, 15.708],
      [12.4, 18],
      [13, 13.926],
      [10, 11.173],
      [14.2, 10.667],
    ],
    c: [16, 13.4],
    drift: [0, -PIN_LIFT],
  },
};
export const LocationStarSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('LocationStar', LOCATION_STAR),
  /* @__PURE__ */ carbonArt(LocationStar32)
);
