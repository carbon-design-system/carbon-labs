/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * An action blocks the hover.
 *
 * While an action plays (one pass, a loop until it runs out, a re-trigger)
 * and through its hand-off's tail, hover enter / leave (pointer or focus:
 * the same calls) are noted and change no frame: each frame equals a twin's
 * that saw no hover events.
 *
 * After the action (a pointer still over the icon easing the hover back in
 * from rest would read as the hover replaying on release): the icon stays
 * at rest until the pointer or focus leaves and comes back, as a toggle's
 * `holdAfter`: only a pointer or focus already on the icon at the trigger is
 * held. One that arrived, or left and came back, during the action gets the
 * hover when it ends (from rest, no jump); one that left stays at rest. The
 * hand-off's status clearing under a pointer held from the trigger: at rest
 * too. A status the app set brings the hover back when it clears, as before.
 * A trigger while the action's hand-off status still shows gets the plain
 * icon back at once, even under the pointer.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  actionPlayerOf,
  FrameController,
  fromHover,
  manualScheduler,
  playAction,
  setScheduler,
  StatusController,
  type Shapes,
  type StatusIconSpec,
} from '../src/engine';
import { CopySpec } from '../src/icons/formatting/fmtTools';
import { DownloadSpec } from '../src/icons/operations/transfer';
import { RenewSpec } from '../src/icons/operations/opsRotate';
import {
  CopySpec as CopyStatus,
  SaveSpec as SaveStatus,
} from '../src/icons/statusIcons';
import type { HoverIconSpec } from '../src/engine';

afterEach(() => setScheduler(null));
const FRAME = 1000 / 60;
const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};

/** Two controllers on one clock: `a` sees the hover events, `b` (the twin) doesn't. */
function twins(spec: HoverIconSpec) {
  const clock = manualScheduler();
  setScheduler(clock);
  const pa: Shapes[] = [];
  const pb: Shapes[] = [];
  const a = new FrameController(fromHover(spec), (s) => pa.push(s), 32);
  const b = new FrameController(fromHover(spec), (s) => pb.push(s), 32);
  const step = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      clock.advance(FRAME);
      await flush();
    }
  };
  const draw = (c: FrameController<string>) => JSON.stringify(c.shapes());
  return { a, b, step, draw };
}

describe.each([
  ['Copy', CopySpec],
  ['Download', DownloadSpec],
] as const)('%s: hover during a pass', (_, spec) => {
  it('a pointer over the icon from the trigger to the end: at rest after it, until it leaves and comes back', async () => {
    const { a, step } = twins(spec);
    void a.hoverTo(1);
    await step(20);
    expect(a.frame.h).toBe(1);
    const ta = actionPlayerOf(a)!;
    void ta.trigger();
    while (ta.acting) {
      await step();
    }
    await step(30);
    expect(a.frame.h, 'held at rest: no replay').toBe(0);
    void a.hoverTo(0);
    await step(5);
    void a.hoverTo(1);
    await step(20);
    expect(a.frame.h, 'left and came back: it hovers').toBe(1);
  });

  it('enter and leave change no frame while it plays; after it, a pointer that left and came back hovers (from rest), one that left stays at rest', async () => {
    for (const lastIn of [true, false]) {
      const { a, b, step, draw } = twins(spec);
      const [ta, tb] = [actionPlayerOf(a)!, actionPlayerOf(b)!];
      void ta.trigger();
      void tb.trigger();
      for (let f = 0; ta.acting; f++) {
        if (f === 2) {
          void a.hoverTo(1);
        }
        if (f === 5) {
          void a.hoverTo(0);
        }
        if (f === 8 && lastIn) {
          void a.hoverTo(1);
        }
        await step();
        if (ta.acting) {
          expect(draw(a), `frame ${f}`).toBe(draw(b));
        }
      }
      // Over: the first frame after is the rest drawing (no jump), then it eases in (or stays).
      expect(a.frame.h).toBeLessThan(0.3);
      await step(20);
      expect(a.frame.h).toBe(lastIn ? 1 : 0);
      expect(b.frame.h).toBe(0);
    }
  });

  it('a re-trigger mid-play keeps the hover blocked', async () => {
    const { a, b, step, draw } = twins(spec);
    const [ta, tb] = [actionPlayerOf(a)!, actionPlayerOf(b)!];
    void ta.trigger();
    void tb.trigger();
    await step(4);
    void a.hoverTo(1);
    void ta.trigger();
    void tb.trigger();
    void a.hoverTo(0);
    void a.hoverTo(1);
    while (ta.acting) {
      await step();
      if (ta.acting) {
        expect(draw(a)).toBe(draw(b));
      }
    }
    await step(20);
    expect(a.frame.h).toBe(1);
  });
});

it('Renew looping: hover changes no frame until stop() has run out; then it settles to the pointer', async () => {
  const { a, b, step, draw } = twins(RenewSpec);
  const [ta, tb] = [actionPlayerOf(a)!, actionPlayerOf(b)!];
  void ta.trigger({ loop: true });
  void tb.trigger({ loop: true });
  for (let f = 0; f < 80; f++) {
    if (f % 9 === 0) {
      void a.hoverTo(f % 18 === 0 ? 1 : 0);
    }
    await step();
    expect(draw(a), `loop frame ${f}`).toBe(draw(b));
  }
  void a.hoverTo(1);
  ta.stop();
  tb.stop();
  while (ta.acting) {
    await step();
    if (ta.acting) {
      expect(draw(a)).toBe(draw(b));
    }
  }
  await step(20);
  expect(a.frame.h).toBe(1);
});

describe('a status icon’s hand-off', () => {
  /** A status controller on its own clock, with its hand-off wired as the bindings wire it. */
  function status(spec: StatusIconSpec) {
    const clock = manualScheduler();
    setScheduler(clock);
    let painted: Shapes = {};
    const c = new StatusController(spec, (s) => (painted = s), 32, {}, true);
    c.repaint();
    const step = async (n = 1) => {
      for (let i = 0; i < n; i++) {
        clock.advance(FRAME);
        await flush();
      }
    };
    const play = () =>
      playAction(
        { target: c, setStatus: (s, tail) => c.set({ status: s }, true, tail) },
        { then: { status: 'success' } }
      );
    const engineH = () =>
      (c as unknown as { engine: { frame: { h: number } } | null }).engine
        ?.frame.h;
    return { c, step, play, engineH, drawn: () => JSON.stringify(painted) };
  }

  it.each([
    ['Copy', CopyStatus],
    ['Save', SaveStatus],
  ] as const)(
    '%s: hovered through the hand-off, the base doesn’t jump to the hover and nothing eases under the tail; frames as a twin’s with no hover',
    async (_, spec) => {
      const x = status(spec as unknown as StatusIconSpec);
      const seenX: string[] = [];
      void x.play();
      let f = 0;
      for (; f < 50; f++) {
        if (f === 3) {
          x.c.enter();
        }
        await x.step();
        seenX.push(x.drawn());
        const h = x.engineH();
        if (h !== undefined) {
          expect(h, `engine hover, frame ${f}`).toBe(0);
        }
      }
      setScheduler(null);
      const y = status(spec as unknown as StatusIconSpec);
      const seenY: string[] = [];
      void y.play();
      for (let g = 0; g < 50; g++) {
        await y.step();
        seenY.push(y.drawn());
      }
      expect(seenX).toEqual(seenY);
    }
  );

  it('a trigger while the hand-off status shows, under the pointer: the plain icon comes back at once (it waited for the pointer to leave)', async () => {
    const x = status(CopyStatus as unknown as StatusIconSpec);
    x.c.enter();
    await x.step(20);
    void x.play();
    await x.step(40);
    expect(x.engineH()).toBe(0); // the status shows, the hover held
    // The binding's re-trigger: clear its status, wait for the plain icon.
    x.c.set({ status: undefined }, true);
    let back = false;
    void x.c.whenPlain().then(() => (back = true));
    await x.step(30);
    expect(back).toBe(true);
    expect(x.engineH()).toBeUndefined();
  });

  it('the hand-off status clearing under a pointer that never left: at rest (no replay); left and back, the plain icon hovers', async () => {
    const x = status(CopyStatus as unknown as StatusIconSpec);
    x.c.enter();
    await x.step(20);
    void x.play();
    await x.step(40);
    x.c.set({ status: undefined }, true);
    await x.step(40);
    expect(x.engineH()).toBe(0);
    x.c.leave();
    await x.step(20);
    expect(x.engineH(), 'handed back to the plain icon').toBeUndefined();
    x.c.enter();
    await x.step(20);
    expect(
      (x.c as unknown as { plain: { frame: { h: number } } }).plain.frame.h
    ).toBe(1);
  });

  it('a status the app set (no action) clearing while hovered: the hover eases back in (unchanged)', async () => {
    const x = status(CopyStatus as unknown as StatusIconSpec);
    x.c.enter();
    await x.step(20);
    x.c.set({ status: 'success' }, true);
    await x.step(40);
    x.c.set({ status: undefined }, true);
    await x.step(40);
    expect(x.engineH()).toBe(1);
  });
});
