/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The compositor turn (turn.ts; branch icons/cleanup-turn): the engine keeps
 * the clock, the browser turns. With Web Animations stubbed on the test's
 * clock (waapiStub.ts), each check reads the turn as the browser would draw
 * it (the held drawing, turned by the animation's angle) against the
 * engine's own frames:
 *  - startTurn: its keyframes, its start on the engine's clock, pause and
 *    resume (the held time excluded), cancel; none without Web Animations;
 *  - Renew's loop: rAF frames through the ease-in, then one turn of the
 *    icon's svg with the drawing held (nothing repaints), at the steady
 *    speed; stopped, the `a` it reached is drawn in the same task and the
 *    run-out goes on from there at the same speed, to the rest drawing;
 *    off screen it holds and comes back where it was; a cut cancels it;
 *  - the spinner (the web components' layer): the arc drawn unturned in the
 *    layer and empty in the icon's drawing; one turn about the mark's
 *    centre at the engine frames' angle; it turns through pending → success
 *    and is cancelled only once the arc has gone; off screen it holds; a
 *    destroy puts the arc back at the angle it reached.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  FrameController,
  fromHover,
  manualScheduler,
  setScheduler,
  startTurn,
  StatusController,
  type Shapes,
  type SpinLayer,
  type StatusIconSpec,
} from '../src/engine';
import { RenewSpec as RenewHover } from '../src/icons/operations/opsRotate';
import { RenewSpec } from '../src/icons/statusIcons';
import { markCentre, SPIN_MS } from '../src/status';
import { waapi, type Waapi } from './waapiStub';

const FRAME = 1000 / 60;
/** Renew's period, half a turn: slow-02, 520ms. */
const PERIOD = RenewHover.action!.cycle! * 1000;
let clock: ReturnType<typeof manualScheduler>;
let w: Waapi;
beforeEach(() => {
  clock = manualScheduler();
  setScheduler(clock);
  w = waapi(() => clock.time());
});
afterEach(() => setScheduler(null));

const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};
const step = async (n = 1) => {
  for (let i = 0; i < n; i++) {
    clock.advance(FRAME);
    await flush();
  }
};
/** An svg the engine may turn (only `animate` is used). */
const box = () => ({ animate: w.animate });

describe('startTurn', () => {
  it('turns on the compositor from t0, about a point off the box centre; pause and resume exclude the held time', () => {
    const el = box();
    clock.advance(100);
    const t = startTurn(el as unknown as Element, [3, -2], -1000, 50)!;
    const [a] = w.live(el);
    expect(a.options).toMatchObject({ duration: 1000, iterations: Infinity });
    expect(a.keyframes.map((k) => k.transform)).toEqual([
      'translate(3px, -2px) rotate(0turn) translate(-3px, 2px)',
      'translate(3px, -2px) rotate(-1turn) translate(-3px, 2px)',
    ]);
    expect(a.startTime).toBe(50);
    expect(t.turns(300)).toBeCloseTo(0.25, 9);
    t.pause(300);
    expect(a.playState).toBe('paused');
    expect(a.currentTime).toBe(250);
    expect(t.turns(900)).toBeCloseTo(0.25, 9);
    t.resume(900);
    expect(a.playState).toBe('running');
    expect(a.startTime).toBe(650);
    expect(t.turns(1150)).toBeCloseTo(0.5, 9);
    t.stop();
    expect(a.playState).toBe('idle');
  });

  it('undefined without an element or Web Animations (the engine keeps its frames)', () => {
    expect(startTurn(null, [0, 0], 500, 0)).toBeUndefined();
    expect(startTurn({} as Element, [0, 0], 500, 0)).toBeUndefined();
  });
});

describe('Renew’s loop', () => {
  function renew(withBox = true) {
    const svg = box();
    let paints = 0;
    const c = new FrameController(fromHover(RenewHover), () => paints++, 32);
    if (withBox) {
      c.turnBox = () => svg as unknown as Element;
    }
    return { c, svg, paints: () => paints };
  }
  /** The `a` drawn: the held drawing's, turned by the animation (a half turn is a + 1, anticlockwise). */
  const drawnA = (c: FrameController, svg: object) => {
    const [anim] = w.live(svg);
    return (c.frame.a ?? 0) + (anim ? -2 * w.turnsAt(anim) : 0);
  };

  it('eases in on rAF frames, then one turn of the svg (nothing repaints) at the steady speed', async () => {
    const { c, svg, paints } = renew();
    const player = c.spec.action!.player(c);
    c.player = player;
    void player.trigger({ loop: true });
    await step(20);
    expect(w.live(svg)).toHaveLength(0);
    await step(20);
    expect(w.live(svg)).toHaveLength(1);
    expect(c.frame.a).toBe(0.5);
    const p0 = paints();
    const a0 = drawnA(c, svg);
    await step(60);
    expect(paints()).toBe(p0);
    expect(w.live(svg)).toHaveLength(1);
    // A period (slow-02) a half turn: 60 frames are 1000ms.
    expect(drawnA(c, svg) - a0).toBeCloseTo(1000 / PERIOD, 6);
  });

  it('stopped: the `a` it reached is drawn in the same task, the run-out goes on at the same speed and lands at rest', async () => {
    const { c, svg } = renew();
    const player = (c.player = c.spec.action!.player(c));
    let done = false;
    void player.trigger({ loop: true }).then(() => (done = true));
    await step(100);
    const before = drawnA(c, svg);
    player.stop();
    expect(w.live(svg)).toHaveLength(0);
    // No jump: the drawing is where the turn was.
    expect(c.frame.a).toBeCloseTo(before, 9);
    const at = [c.frame.a!];
    while (player.acting) {
      await step();
      if (player.acting) {
        at.push(c.frame.a!);
      }
    }
    const steps = at.slice(1).map((x, i) => x - at[i]);
    const steady = FRAME / PERIOD;
    expect(Math.abs(steps[0] - steady)).toBeLessThan(steady * 0.2);
    expect(Math.min(...steps)).toBeGreaterThanOrEqual(0);
    await flush();
    expect(done).toBe(true);
    expect(c.frame.a).toBe(0);
  });

  it('the same `a` as the engine’s own frames: ease-in identical, then the steady speed with no lag', async () => {
    const turned = renew();
    const framed = renew(false);
    const pt = (turned.c.player = turned.c.spec.action!.player(turned.c));
    const pf = (framed.c.player = framed.c.spec.action!.player(framed.c));
    void pt.trigger({ loop: true });
    void pf.trigger({ loop: true });
    for (let i = 0; i < 90; i++) {
      await step();
      const [x, y] = [drawnA(turned.c, turned.svg), framed.c.frame.a ?? 0];
      // The engine's chained periods each start a frame late at most (a period ends on the frame past it): the turn
      // keeps time, so it can only be ahead, by under a frame a period.
      expect(x - y, `frame ${i}`).toBeGreaterThan(-1e-3);
      expect(x - y, `frame ${i}`).toBeLessThan((FRAME / PERIOD) * (1 + i / 32));
    }
  });

  it('off screen it holds and comes back where it was; a cut cancels it', async () => {
    const { c, svg } = renew();
    const player = (c.player = c.spec.action!.player(c));
    void player.trigger({ loop: true });
    await step(60);
    const held = drawnA(c, svg);
    c.setVisible(false);
    expect(w.live(svg)[0].playState).toBe('paused');
    await step(60);
    expect(drawnA(c, svg)).toBeCloseTo(held, 9);
    c.setVisible(true);
    expect(w.live(svg)[0].playState).toBe('running');
    await step(1);
    expect(drawnA(c, svg) - held).toBeCloseTo(FRAME / PERIOD, 6);
    c.destroy();
    expect(w.live(svg)).toHaveLength(0);
  });

  it('stop() while off screen: it resumes from where it held and runs out', async () => {
    const { c, svg } = renew();
    const player = (c.player = c.spec.action!.player(c));
    void player.trigger({ loop: true });
    await step(60);
    c.setVisible(false);
    const held = drawnA(c, svg);
    await step(30);
    player.stop();
    expect(c.frame.a).toBeCloseTo(held, 9);
    expect(w.live(svg)).toHaveLength(0);
  });
});

describe('the spinner on its layer (web components)', () => {
  function pending(withLayer = true, size = 32) {
    const layerSvg = box();
    let main: Shapes = {};
    let layer: Shapes = {};
    const spinLayer: SpinLayer = {
      svg: () => layerSvg as unknown as Element,
      paint: (s) => (layer = s),
    };
    const c = new StatusController(
      RenewSpec as unknown as StatusIconSpec,
      (s) => (main = s),
      size,
      { status: 'pending' },
      true,
      withLayer ? { spinLayer } : {}
    );
    c.repaint();
    const engine = () =>
      (c as unknown as { engine: { frame: { sa: number; sp: number } } | null })
        .engine;
    return { c, layerSvg, main: () => main, layer: () => layer, engine };
  }

  it('the arc in the layer, unturned; the icon’s drawing has it empty; one turn about the mark at the engine frames’ angle', async () => {
    const turned = pending();
    const framed = pending(false);
    await step(2);
    expect(w.live(turned.layerSvg)).toHaveLength(1);
    expect(turned.main()['status-spin'].d).toBe('');
    expect(String(turned.layer()['status-spin'].d)).not.toBe('');
    expect(turned.engine()!.frame.sa).toBe(0);
    // The layer turns about the mark's centre (px from the box's centre).
    const [cx, cy] = markCentre(
      (RenewSpec as unknown as StatusIconSpec).placement,
      'pending'
    );
    expect(w.live(turned.layerSvg)[0].keyframes[0].transform).toBe(
      `translate(${cx - 16}px, ${cy - 16}px) rotate(0turn) translate(${16 - cx}px, ${16 - cy}px)`
    );
    expect(w.live(turned.layerSvg)[0].options.duration).toBe(SPIN_MS);
    // The layer's angle is the engine frames' sa, frame for frame.
    for (let i = 0; i < 40; i++) {
      await step();
      const turns = w.turnsAt(w.live(turned.layerSvg)[0]) % 1;
      const sa = framed.engine()!.frame.sa;
      const d = Math.abs(turns - sa);
      expect(Math.min(d, 1 - d), `frame ${i}`).toBeLessThan(1.5 / SPIN_MS);
    }
  });

  it('pending → success: it turns through the arc’s exit and is cancelled only once the arc has gone', async () => {
    const x = pending();
    await step(10);
    x.c.set({ status: 'success' }, true);
    let cancelledWith: string | undefined;
    for (let i = 0; i < 40 && cancelledWith === undefined; i++) {
      await step();
      const live = w.live(x.layerSvg).length;
      const arc = String(x.layer()['status-spin']?.d ?? '');
      if (live) {
        expect(x.main()['status-spin'].d).toBe('');
      }
      if (!live) {
        cancelledWith = String(x.main()['status-spin'].d);
      } else if (i > 0) {
        expect(arc === '' || x.engine()!.frame.sp > 0).toBe(true);
      }
    }
    expect(cancelledWith).toBe('');
    expect(x.layer()).toEqual({});
  });

  it('off screen it holds; a destroy cancels it and puts the arc back in the icon’s drawing at the angle it reached', async () => {
    const x = pending();
    await step(30);
    x.c.setVisible(false);
    expect(w.live(x.layerSvg)[0].playState).toBe('paused');
    const held = w.turnsAt(w.live(x.layerSvg)[0]);
    await step(30);
    expect(w.turnsAt(w.live(x.layerSvg)[0])).toBeCloseTo(held, 9);
    x.c.setVisible(true);
    await step(5);
    const reached = w.turnsAt(w.live(x.layerSvg)[0]) % 1;
    x.c.destroy();
    expect(w.live(x.layerSvg)).toHaveLength(0);
    expect(x.engine()?.frame.sa ?? reached).toBeCloseTo(reached, 6);
  });

  it('at 16px the centre scales with the size', async () => {
    const x = pending(true, 16);
    await step(2);
    const [cx, cy] = markCentre(
      (RenewSpec as unknown as StatusIconSpec).placement,
      'pending'
    );
    expect(w.live(x.layerSvg)[0].keyframes[0].transform).toBe(
      `translate(${(cx - 16) / 2}px, ${(cy - 16) / 2}px) rotate(0turn) translate(${(16 - cx) / 2}px, ${(16 - cy) / 2}px)`
    );
  });

  it('still (reduced motion): no turn, the dots', async () => {
    const x = pending();
    await step(5);
    x.c.set({ status: 'pending' }, false);
    expect(w.live(x.layerSvg)).toHaveLength(0);
    expect(String(x.main()['status-dots'].d)).not.toBe('');
    x.c.set({ status: 'pending' }, true);
    await step(2);
    expect(w.live(x.layerSvg)).toHaveLength(1);
  });
});
