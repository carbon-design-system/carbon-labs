/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Every status cut grows from nothing, as React draws it (the core's
 * statusGrow.test.ts measures the cut itself; this, the DOM): for every
 * status icon, every status in and out at 16 and 32, and the counts (the pill
 * at 32, the pip at 16), the ink the drawing changes against the plain icon,
 * frame by frame on one clock, its status mark aside, held to growCheck.ts:
 * the cut starts at CUT_START, grows monotonically, no frame after the start
 * taking more than DOM_LIMITS' step (the bindings' frames fall at their own
 * phase in a four-frame transition); out, the mirror.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { STATUS_ICONS } from '../../icons/statusIcons';
import {
  changed,
  DOM_LIMITS,
  domShapes,
  growthProblems,
} from '../../../../../../../v12-motion-icons-core/test/growCheck';

afterEach(() => {
  cleanup();
  setScheduler(null);
});

type Props = Record<string, unknown>;
type Icon = React.ComponentType<Props> & {
  status?: { statuses: readonly string[]; count?: boolean };
};

/** The drawing's change against the plain icon, every frame for `ms`, from `from` to `to`. */
async function series(
  Icon: Icon,
  size: number,
  from: Props,
  to: Props,
  ms = 450
): Promise<number[]> {
  const clock = manualScheduler();
  setScheduler(clock);
  const plain = render(<Icon animated size={size} />);
  const reference = domShapes(plain.container);
  plain.unmount();
  const r = render(<Icon animated size={size} {...from} />);
  const frame = async () => {
    clock.advance(1000 / 60);
    await act(async () => {
      for (let i = 0; i < 4; i++) await Promise.resolve();
    });
  };
  for (let i = 0; i < 30; i++) await frame(); // at rest
  const out = [changed(reference, domShapes(r.container))];
  r.rerender(<Icon animated size={size} {...to} />);
  for (let t = 0; t < ms; t += 1000 / 60) {
    await frame();
    out.push(changed(reference, domShapes(r.container)));
  }
  r.unmount();
  setScheduler(null);
  // (A turn of the event loop between transitions: the worker's runner stays in touch.)
  await new Promise<void>((res) => setTimeout(res, 0));
  return out;
}

// The status checkmarks' drawing changes as a whole as a status arrives (their base settles into Carbon's status
// art), so against the plain icon their change isn't the cut's: core's statusGrow.test.ts measures their cut against
// the base of each frame.
const CHECKMARKS = new Set([
  'CheckmarkOutline',
  'CheckmarkFilled',
  'InProgress',
  'Incomplete',
]);
const ICONS = (
  Object.entries(STATUS_ICONS) as unknown as [string, Icon][]
).filter(([n]) => !CHECKMARKS.has(n));

describe.each(ICONS)('%s: the cut grows from nothing (React)', (name, Icon) => {
  const L = Icon.status!;
  const statuses = L.statuses.filter((s) => s !== 'notification' || !L.count);
  for (const size of [16, 32]) {
    it(`@${size}: every status in and out`, async () => {
      const problems: string[] = [];
      for (const s of statuses) {
        problems.push(
          ...growthProblems(
            await series(Icon, size, {}, { status: s }),
            'in',
            `${name} none→${s} @${size}`,
            DOM_LIMITS
          )
        );
        problems.push(
          ...growthProblems(
            await series(Icon, size, { status: s }, {}),
            'out',
            `${name} ${s}→none @${size}`,
            DOM_LIMITS
          )
        );
      }
      expect(problems.join('\n')).toBe('');
    });
  }
  if (L.count) {
    it('counts: the pill at 32, the pip at 16, in and out', async () => {
      const problems = [
        ...growthProblems(
          await series(Icon, 32, {}, { count: 3 }),
          'in',
          `${name} none→3 overhang @32`,
          DOM_LIMITS
        ),
        ...growthProblems(
          await series(Icon, 32, { count: 3 }, {}),
          'out',
          `${name} 3→none overhang @32`,
          DOM_LIMITS
        ),
        ...growthProblems(
          await series(Icon, 16, {}, { status: 'notification' }),
          'in',
          `${name} none→pip @16`,
          DOM_LIMITS
        ),
        ...growthProblems(
          await series(Icon, 16, { status: 'notification' }, {}),
          'out',
          `${name} pip→none @16`,
          DOM_LIMITS
        ),
      ];
      expect(problems.join('\n')).toBe('');
    });
  }
});
