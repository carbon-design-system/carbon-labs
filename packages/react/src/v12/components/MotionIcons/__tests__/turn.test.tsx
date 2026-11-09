/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The compositor turn in React (branch icons/cleanup-turn), with Web
 * Animations stubbed on the engine's clock (jsdom has none; real browsers:
 * apps/wc-harness/tests/turn.spec.ts):
 *  - Renew's loop turns its own svg in the steady stretch (the drawing
 *    held), one turn; stop() cancels it and it lands on the rest drawing;
 *  - under StrictMode a `loop` leaves exactly one turn;
 *  - the pending spinner stays on the engine's frames: no Web Animation,
 *    and React's DOM is as before (one svg).
 */
import { createRef, StrictMode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { waapi } from '../../../../../../v12-motion-icons-core/test/waapiStub';
import { Renew, type MotionIconHandle } from '../index';

let clock = manualScheduler();
const w = waapi(() => clock.time());
let uninstall: () => void;
beforeAll(() => {
  uninstall = w.install();
});
afterAll(() => uninstall());
afterEach(() => {
  cleanup();
  setScheduler(null);
});

function start() {
  clock = manualScheduler();
  setScheduler(clock);
  return async (ms: number) => {
    for (let t = 0; t < ms; t += 1000 / 60) {
      await act(async () => {
        clock.advance(1000 / 60);
        await Promise.resolve();
      });
    }
  };
}
const ink = (c: HTMLElement) => c.querySelector('[data-mc-ink]')!.innerHTML;

describe('Renew’s loop', () => {
  it('turns its own svg in the steady stretch, the drawing held; stop() cancels it and it lands at rest', async () => {
    const run = start();
    const rest = ink(render(<Renew animated />).container);
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Renew animated ref={ref} />);
    act(() => void ref.current!.trigger({ loop: true }));
    await run(300);
    expect(w.live(ref.current!.svg!)).toHaveLength(0);
    await run(400);
    const svg = container.querySelector('svg')!;
    expect(w.live(svg)).toHaveLength(1);
    const held = ink(container);
    await run(500);
    expect(ink(container)).toBe(held);
    act(() => ref.current!.stop());
    expect(w.live(svg)).toHaveLength(0);
    await run(1500);
    expect(ink(container)).toBe(rest);
  });

  it('StrictMode: a `loop` leaves exactly one turn', async () => {
    const run = start();
    const { container } = render(
      <StrictMode>
        <Renew animated loop />
      </StrictMode>
    );
    await run(900);
    const svg = container.querySelector('svg')!;
    expect(w.live(svg)).toHaveLength(1);
    expect(
      w.live().filter((a) => container.contains(a.target as Node))
    ).toHaveLength(1);
  });
});

describe('the pending spinner', () => {
  it('stays on the engine’s frames: no Web Animation, one svg', async () => {
    const run = start();
    const before = w.all.length;
    const { container } = render(<Renew animated status="pending" />);
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      await run(1000 / 60);
      seen.add(ink(container));
    }
    expect(w.all.length).toBe(before);
    expect(seen.size).toBeGreaterThan(5);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });
});
