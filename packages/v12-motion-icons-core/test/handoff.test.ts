/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The hand-off's cut grows smoothly from nothing. An action handing off to
 * a status (Copy → success; Renew's loop stopped → success), sampled frame by
 * frame on the controller's clock:
 *  - the cut zone's size starts at 0 and grows monotonically to full;
 *  - the ink the cut changes in the base (each frame's own base: the
 *    action's tail while it runs) grows as every status cut does
 *    (growCheck.ts: it starts at CUT_START, then grows monotonically, no
 *    frame taking more than STEP_MAX of it), and doesn't step back when the
 *    tail ends (the cut tracks the moving base).
 * The frames are exported for the bindings' suites, which paint the same.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  manualScheduler,
  playAction,
  setScheduler,
  StatusController,
  type Shapes,
  type StatusIconSpec,
} from '../src/engine';
import { cutFrame, frameZone, type StatusFrame } from '../src/status';
import {
  CopySpec,
  PrinterSpec,
  RenewSpec,
  SaveSpec,
  ShareSpec,
} from '../src/icons/statusIcons';
import { changed, growthProblems } from './growCheck';

afterEach(() => setScheduler(null));

const shoelace = (p: readonly (readonly [number, number])[]) => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    a +=
      p[i][0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * p[i][1];
  }
  return a / 2;
};
type Sample = { t: number; zone: number; removed: number; painted: Shapes };

/** Runs an action's hand-off on a StatusController, every frame for `ms`; `stopAt` resolves a loop's `until`. */
async function handOff(
  spec: StatusIconSpec,
  ms: number,
  loopUntil?: number
): Promise<Sample[]> {
  const clock = manualScheduler();
  setScheduler(clock);
  let painted: Shapes = {};
  const c = new StatusController(spec, (s) => (painted = s), 32, {}, true);
  c.repaint();
  let end: (() => void) | undefined;
  const until =
    loopUntil !== undefined ? new Promise<void>((r) => (end = r)) : undefined;
  void playAction(
    { target: c, setStatus: (s, tail) => c.set({ status: s }, true, tail) },
    { ...(until && { until }), then: { status: 'success' } }
  );
  const out: Sample[] = [];
  for (let t = 0; t <= ms + 1e-6; t += 1000 / 60) {
    if (end && loopUntil !== undefined && t >= loopUntil) {
      end();
      end = undefined;
    }
    const e = (
      c as unknown as {
        engine: { frame: StatusFrame; placement: never } | null;
      }
    ).engine;
    if (e) {
      const zone = frameZone(e.placement, e.frame);
      const geo = (spec as unknown as { geo: never }).geo;
      const f = cutFrame(geo, e.placement, e.frame, 32);
      // Against the base before any hand fix (a fix's own removal is part of the cut).
      const raw = cutFrame(
        geo,
        { ...(e.placement as object), fix: undefined } as never,
        e.frame,
        32
      ).base;
      out.push({
        t,
        zone: zone ? Math.abs(shoelace(zone)) : 0,
        removed: changed(raw, f.cut),
        painted,
      });
    }
    clock.advance(1000 / 60);
    for (let i = 0; i < 6; i++) {
      await Promise.resolve();
    }
  }
  c.destroy();
  return out;
}

describe.each([
  ['Copy', CopySpec as unknown as StatusIconSpec, 600, undefined],
  ['Renew', RenewSpec as unknown as StatusIconSpec, 1700, 600],
  // The status icons with an action.
  ['Save', SaveSpec as unknown as StatusIconSpec, 600, undefined],
  ['Printer', PrinterSpec as unknown as StatusIconSpec, 600, undefined],
  ['Share', ShareSpec as unknown as StatusIconSpec, 600, undefined],
] as const)(
  '%s: the hand-off’s cut grows from nothing',
  (name, spec, ms, loopUntil) => {
    it('the zone starts at 0 and grows monotonically; the cut grows as every status cut does', async () => {
      const s = await handOff(spec, ms, loopUntil);
      expect(s.length, name).toBeGreaterThan(10);
      expect(s[0].zone, name).toBe(0);
      expect(s[0].removed, name).toBeCloseTo(0, 1);
      const fullZone = s.at(-1)!.zone;
      const full = s.at(-1)!.removed;
      expect(full, name).toBeGreaterThan(1);
      for (let i = 1; i < s.length; i++) {
        expect(
          s[i].zone,
          `${name} zone t=${s[i].t.toFixed(0)}`
        ).toBeGreaterThanOrEqual(s[i - 1].zone - 1e-6);
      }
      expect(
        growthProblems(
          s.map((x) => x.removed),
          'in',
          `${name} hand-off`
        ).join('\n')
      ).toBe('');
      expect(s.at(-1)!.zone).toBeCloseTo(fullZone, 6);
    });
  }
);
