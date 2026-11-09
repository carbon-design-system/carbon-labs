/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Every status cut grows from nothing, rather than knocking out most of its
 * final area at once. For every
 * status-capable icon, every status it takes, at 16 and 32, on the
 * StatusController's clock frame by frame (the ink the cut changes, hand
 * fixes included, against the base before them), the checks of growCheck.ts:
 * each status in and out, each status to the next, and the counts (32: the
 * pill, overhang and inside; 16: the pip). (The aliases, Carbon's static
 * status names, show their status from the start, at rest: no entrance.)
 */
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import {
  manualScheduler,
  setScheduler,
  StatusController,
  type StatusIconSpec,
  type StatusInput,
} from '../src/engine';
import { cutFrame, type StatusFrame } from '../src/status';
import { STATUS_ICONS } from '../src/icons/statusIcons';
import { changed, growthProblems, measure, STEP_MAX } from './growCheck';

afterEach(() => setScheduler(null));

/** The cut's ink, frame by frame, from `from` to `to` (every frame for `ms`). */
export async function cutInk(
  spec: StatusIconSpec,
  size: number,
  from: StatusInput,
  to: StatusInput,
  ms = 450
): Promise<number[]> {
  const clock = manualScheduler();
  setScheduler(clock);
  const c = new StatusController(spec, () => undefined, size, from, true);
  const geo = (spec as unknown as { geo: never }).geo;
  const take = () => {
    const e = (
      c as unknown as {
        engine: { frame: StatusFrame; placement: never } | null;
      }
    ).engine;
    if (!e) {
      return 0;
    }
    const f = cutFrame(geo, e.placement, e.frame, size);
    const raw = cutFrame(
      geo,
      { ...(e.placement as object), fix: undefined } as never,
      e.frame,
      size
    ).base;
    return changed(raw, f.cut);
  };
  const out = [take()];
  c.set(to, true);
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    for (let i = 0; i < 6; i++) {
      await Promise.resolve();
    }
    out.push(take());
  }
  c.destroy();
  setScheduler(null);
  // (A turn of the event loop between transitions: the worker's runner stays in touch.)
  await new Promise<void>((r) => setTimeout(r, 0));
  return out;
}

const ENV =
  (globalThis as { process?: { env: Record<string, string | undefined> } })
    .process?.env ?? {};
const SURVEY = !!ENV.GROW_SURVEY;
const survey: string[] = [];
function check(xs: number[], dir: 'in' | 'out' | 'swap', what: string) {
  const problems = growthProblems(xs, dir, what);
  if (SURVEY && dir !== 'swap') {
    const m = measure(xs, dir);
    if (m.full >= 0.5) {
      [stats.first, stats.step, stats.n] = [
        Math.max(stats.first, m.first),
        Math.max(stats.step, m.step),
        stats.n + 1,
      ];
    }
  }
  if (SURVEY) {
    if (problems.length) {
      const m = measure(xs, dir);
      const up = (v: number) => Math.ceil((v + 0.01) * 100) / 100;
      survey.push(
        `  '${what}': { first: ${up(m.first)}, step: ${up(Math.max(STEP_MAX, m.step))} },`
      );
    }
  } else {
    expect(problems.join('\n')).toBe('');
  }
}
const stats = { first: 0, step: 0, n: 0 };
if (SURVEY) {
  afterAll(() =>
    console.log(
      `KNOWN\n${survey.sort().join('\n')}\nSTATS first<=${stats.first.toFixed(3)} step<=${stats.step.toFixed(3)} n=${stats.n}`
    )
  );
}

const ICONS = Object.entries(STATUS_ICONS) as [
  string,
  StatusIconSpec & { count?: boolean },
][];

describe.each(ICONS)('%s: the cut grows from nothing', (name, spec) => {
  const statuses = (spec.statuses as readonly string[]).filter(
    (s) => s !== 'notification' || !spec.count
  );
  for (const size of [16, 32]) {
    it(`@${size}: every status in and out, and each status to the next`, async () => {
      for (const s of statuses) {
        check(
          await cutInk(spec, size, {}, { status: s }),
          'in',
          `${name} none→${s} @${size}`
        );
        check(
          await cutInk(spec, size, { status: s }, {}),
          'out',
          `${name} ${s}→none @${size}`
        );
      }
      for (let i = 0; i + 1 < statuses.length; i++) {
        check(
          await cutInk(
            spec,
            size,
            { status: statuses[i] },
            { status: statuses[i + 1] }
          ),
          'swap',
          `${name} ${statuses[i]}→${statuses[i + 1]} @${size}`
        );
      }
    });
  }
  if (spec.count) {
    it('counts: the pip at 16, the pill at 32 (overhang and asked inside), in and out', async () => {
      for (const countPlacement of ['overhang', 'inside'] as const) {
        for (const count of [3, 12, 120]) {
          check(
            await cutInk(
              spec,
              32,
              { countPlacement },
              { count, countPlacement }
            ),
            'in',
            `${name} none→${count} ${countPlacement} @32`
          );
          check(
            await cutInk(
              spec,
              32,
              { count, countPlacement },
              { countPlacement }
            ),
            'out',
            `${name} ${count}→none ${countPlacement} @32`
          );
        }
      }
      check(
        await cutInk(spec, 16, {}, { status: 'notification' }),
        'in',
        `${name} none→pip @16`
      );
      check(
        await cutInk(spec, 16, { status: 'notification' }, {}),
        'out',
        `${name} pip→none @16`
      );
    });
  }
});
