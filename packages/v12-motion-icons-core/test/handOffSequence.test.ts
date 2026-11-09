/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The hand-off's sequencing, one helper for both bindings (branch
 * icons/cleanup-turn):
 *  - `HandOff`: the latest trigger wins (an earlier one's status isn't
 *    applied, its clearing timer goes), and a trigger while its own hand-off
 *    status still shows releases it and plays once the plain icon is back;
 *  - `waitForAction`: a status arriving mid-action waits for it, also when
 *    a new trigger restarts the action meanwhile, and a destroyed
 *    controller starts nothing when the wait ends.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  HandOff,
  manualScheduler,
  setScheduler,
  StatusController,
  type ActionTail,
  type Shapes,
  type StatusIconSpec,
} from '../src/engine';
import { CopySpec, RenewSpec } from '../src/icons/statusIcons';

afterEach(() => setScheduler(null));

const FRAME = 1000 / 60;

function rig(spec: StatusIconSpec) {
  const clock = manualScheduler();
  setScheduler(clock);
  let painted: Shapes = {};
  const c = new StatusController(spec, (s) => (painted = s), 32, {}, true);
  c.repaint();
  const step = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      clock.advance(FRAME);
      for (let k = 0; k < 6; k++) {
        await Promise.resolve();
      }
    }
  };
  const mode = () => c.mode;
  return { c, step, mode, drawn: () => painted };
}

describe('HandOff', () => {
  it('the latest trigger wins: the earlier one hands nothing off', async () => {
    const x = rig(CopySpec as unknown as StatusIconSpec);
    const shown: (string | undefined)[] = [];
    const h = new HandOff({
      target: () => x.c,
      setStatus: (s, tail) => (
        shown.push(s),
        x.c.set({ status: s }, true, tail)
      ),
    });
    void h.trigger({ then: { status: 'error' } });
    await x.step(3);
    void h.trigger({ then: { status: 'success' } });
    await x.step(60);
    expect(shown).toEqual(['success']);
  });

  it('a later trigger cancels the clearing timer; cancel() makes the one in flight stale', async () => {
    const x = rig(CopySpec as unknown as StatusIconSpec);
    const shown: (string | undefined)[] = [];
    const h = new HandOff({
      target: () => x.c,
      setStatus: (s) => shown.push(s),
    });
    const first = h.trigger({ then: { status: 'success', for: 30 } });
    await x.step(60);
    await first;
    expect(shown).toEqual(['success']);
    // The clearing timer (real time) is cancelled: nothing clears the status.
    expect(h.clearTimers()).toBe(true);
    await new Promise((r) => setTimeout(r, 60));
    expect(shown).toEqual(['success']);
    const second = h.trigger({ then: { status: 'error' } });
    h.cancel();
    await x.step(60);
    await second;
    expect(shown).toEqual(['success']);
  });

  it('a trigger while its own hand-off status shows: released, then it plays once the plain icon is back', async () => {
    const x = rig(CopySpec as unknown as StatusIconSpec);
    let own: string | undefined;
    const log: string[] = [];
    const h = new HandOff({
      target: () => (x.c.mode === 'plain' ? x.c : undefined),
      setStatus: (s, tail?: ActionTail) => {
        own = s;
        log.push(`status ${s}`);
        x.c.set({ status: s }, true, tail);
      },
      handedOff: () => own !== undefined,
      release: () => {
        own = undefined;
        log.push('release');
        x.c.set({}, true);
        return x.c.whenPlain();
      },
    });
    void h.trigger({ then: { status: 'success' } });
    await x.step(60);
    expect(x.mode()).toBe('engine');
    void h.trigger({ then: { status: 'success' } });
    expect(log).toEqual(['status success', 'release']);
    // The plain icon comes back, then the action plays (acting on the plain icon) before handing off again.
    let sawActing = false;
    for (let i = 0; i < 80; i++) {
      await x.step();
      if (x.c.acting) {
        sawActing = true;
      }
    }
    expect(sawActing).toBe(true);
    expect(log).toEqual(['status success', 'release', 'status success']);
    expect(x.mode()).toBe('engine');
  });
});

describe('waitForAction (a status arriving mid-action)', () => {
  it('Renew looping, pending set: the loop runs out first, then the mark enters', async () => {
    const x = rig(RenewSpec as unknown as StatusIconSpec);
    void x.c.trigger({ loop: true });
    await x.step(40);
    x.c.set({ status: 'pending' }, true);
    expect(x.mode()).toBe('plain');
    let ran = 0;
    while (x.c.acting && ran < 200) {
      await x.step();
      ran++;
    }
    expect(ran).toBeGreaterThan(2);
    await x.step();
    expect(x.mode()).toBe('engine');
  });

  it('a new trigger restarting the action meanwhile: the status still enters after it', async () => {
    const x = rig(CopySpec as unknown as StatusIconSpec);
    void x.c.trigger();
    await x.step(5);
    x.c.set({ status: 'success' }, true);
    await x.step(2);
    void x.c.trigger();
    for (let i = 0; i < 120 && x.mode() !== 'engine'; i++) {
      await x.step();
    }
    expect(x.mode()).toBe('engine');
  });

  it('destroyed while the status waits: nothing starts on the dead controller', async () => {
    const x = rig(RenewSpec as unknown as StatusIconSpec);
    void x.c.trigger({ loop: true });
    await x.step(40);
    x.c.set({ status: 'pending' }, true);
    x.c.destroy();
    const before = JSON.stringify(x.drawn());
    await x.step(120);
    expect(x.mode()).toBe('plain');
    expect(JSON.stringify(x.drawn())).toBe(before);
  });
});
