/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { Recycle } from '../../icons/commerce';
import { CheckmarkOutline, WarningAlt } from '../../icons/status';
import {
  DoubleChevronLeft,
  DoubleChevronRight,
  Play,
  Settings,
} from '../../icons/controls';
import { SETTINGS_HOVER } from '../../icons/controls/Settings';
import { Edit, Link } from '../../icons/formatting';
import { LINKS, linkPath } from '../../icons/formatting/Link';
import { ChartColumn, ChartLine } from '../../icons/data';
import { HOVER, leaveOf } from '../../utils/frameIcon';
import {
  centroid,
  filletPath,
  polyPath,
  ringPath,
  scalePts,
  type Pt,
} from '@carbon-labs/motion-icons-core/geometry';

/**
 * The ten pilot icons ported onto the frame engine from hand-written
 * components (their own refs and WAAPI / attrD tweens). Their ends are
 * pinned to the hand-written drawings, which morph linearly between them
 * (the port matches them frame by frame: identical geometry at every hover
 * progress, within 1e-4 user units).
 */
const d = (shapes: Record<string, Record<string, string | number>>) =>
  Object.fromEntries(Object.entries(shapes).map(([k, a]) => [k, a.d ?? a]));

describe('hand-written pilot icons on the frame engine', () => {
  it('hover on the entrance ease, moderate-01 in and the standard derived leave out (fast-02); Settings: its own moderate-02 curve both ways', () => {
    for (const Icon of [
      Recycle,
      CheckmarkOutline,
      WarningAlt,
      Play,
      DoubleChevronRight,
      DoubleChevronLeft,
      Edit,
      ChartColumn,
      ChartLine,
      Link,
    ]) {
      expect(Icon.hover).toEqual(HOVER);
      expect(Icon.leave).toBeUndefined();
      expect(leaveOf(Icon.hover!)).toEqual({
        duration: motionTokens.duration.fast02 / 1000,
        ease: HOVER.ease,
      });
    }
    expect(Settings.hover).toEqual(SETTINGS_HOVER);
    expect(Settings.leave).toEqual(SETTINGS_HOVER);
  });

  it('CheckmarkOutline: ring r 13 → 14, check grown 20% about (16.004, 16.148)', () => {
    const CHECK: Pt[] = [
      [9.7065, 15.7065],
      [14, 20],
      [22.2925, 11.7075],
    ];
    expect(d(CheckmarkOutline.geo({ h: 0 }))).toEqual({
      ring: ringPath([16, 16], 13, 2),
      check: polyPath(CHECK),
    });
    expect(d(CheckmarkOutline.geo({ h: 1 }))).toEqual({
      ring: ringPath([16, 16], 14, 2),
      check: polyPath(scalePts(CHECK, [16.004, 16.148], 1.2)),
    });
  });

  it("Play: the triangle grown 10% about its centroid (and Carbon's 16px drawing at 16)", () => {
    const T32: Pt[] = [
      [7, 5],
      [7, 27],
      [27, 16],
    ];
    const T16: Pt[] = [
      [3.5, 2.5026],
      [3.5, 13.5816],
      [13.0682, 8.0421],
    ];
    expect(Play.geo({ h: 1 }).tri.d).toBe(
      polyPath(scalePts(T32, centroid(T32), 1.1), true)
    );
    expect(Play.geo({ h: 1 }, 16).tri).toMatchObject({
      d: polyPath(scalePts(T16, centroid(T16), 1.1), true),
      strokeWidth: 1,
      transform: 'scale(2)',
    });
  });

  it('ChartColumn: the columns trade heights (tops 15 → 9 and 7 → 13)', () => {
    const column = (left: number, top: number) =>
      polyPath([
        [left, 29],
        [left, top],
        [left + 6, top],
        [left + 6, 29],
      ]);
    expect(ChartColumn.geo({ h: 1 }).column0.d).toBe(column(8, 9));
    expect(ChartColumn.geo({ h: 1 }).column1.d).toBe(column(20, 13));
  });

  it('ChartLine: the peak and trough slide 2px, the end reaches 4px', () => {
    expect(ChartLine.geo({ h: 1 }).line.d).toBe(
      filletPath(
        [
          [3.023, 29],
          [11.687, 12.6219],
          [20.9431, 20.8509],
          [27.8693, 6.8675],
        ],
        1
      )
    );
  });

  it('Link: the links pull apart 1px per axis, gaps sliding with them', () => {
    expect(d(Link.geo({ h: 0.5 }))).toEqual({
      a: linkPath(LINKS[0], 0.5),
      b: linkPath(LINKS[1], 0.5),
    });
  });

  it('Edit: the pencil writes 2px right, the underline widens 2px at each end at its 2px height', () => {
    expect(Edit.geo({ h: 1 })).toMatchObject({
      underline: { x: 0, y: 26, width: 32, height: 2 },
      pencil: { transform: 'translate(2 0)' },
    });
  });

  it('DoubleChevron: both chevrons nudge 3px in the seek direction', () => {
    expect(DoubleChevronRight.geo({ h: 1 }).lead.transform).toBe(
      'translate(3 0)'
    );
    expect(DoubleChevronLeft.geo({ h: 1 }).trail.transform).toBe(
      'translate(-3 0)'
    );
  });

  it('Recycle: each head and its dash window travel 3px forward', () => {
    const g = Recycle.geo({ h: 1 });
    expect(g.shaft0.strokeDashoffset).toBe(-3);
    expect(g.head0.d).toBe(
      polyPath([
        [17.7052, 22.7051],
        [13.4142, 27],
        [17.7052, 31.2949],
      ])
    );
  });

  it('WarningAlt: the triangle grows 14% about its centroid at constant weight', () => {
    const TRI: Pt[] = [
      [16, 4],
      [3, 29],
      [29, 29],
    ];
    expect(WarningAlt.geo({ h: 1 }).tri).toMatchObject({
      d: polyPath(scalePts(TRI, centroid(TRI), 1.14), true),
      strokeWidth: 2,
    });
  });
});
