/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The pending mark, the icons' loading spinner:
 *  - its numbers: a turn per loading period (1000ms, the skeleton wave's), an arc of half the ring swinging ±10% on a
 *    2.5-turn sine, the mark's 2px line;
 *  - the arc swings about its middle, at 3 o'clock at phase 0, butt ends, nothing else drawn on the ring;
 *  - the shared phase: the turn and the swing both run on the page's timeline, so two marks started at different
 *    times point the same way with the same arc, on the engine's frames (React) and on the compositor (the web
 *    components' layer), and one held off screen comes back in step;
 *  - reduced motion: the three still dots, no arc, nothing turns.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SKELETON_WAVE } from '@carbon-labs/motion-core/primitives/skeleton';
import {
  manualScheduler,
  setScheduler,
  stillShapes,
  StatusController,
  type Shapes,
  type SpinLayer,
  type StatusIconSpec,
} from '../src/engine';
import { CopySpec, SaveSpec } from '../src/icons/statusIcons';
import {
  markCentre,
  markShapes,
  PENDING_SPINNER,
  plan,
  restFrame,
  SPIN_MS,
  spinPhase,
  spinShare,
  STATUS_MS,
  SWING_MS,
  type StatusFrame,
} from '../src/status';
import { motionTokens } from '../src/tokens';
import { waapi, type Waapi } from './waapiStub';

const FRAME = 1000 / 60;
const TAU = 2 * Math.PI;
const SIZES = [16, 20, 24, 32] as const;
const SPECS = { Copy: CopySpec, Save: SaveSpec } as unknown as Record<
  string,
  StatusIconSpec
>;
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
/** The shortest distance between two phases (a turn wraps). */
const apart = (a: number, b: number) => {
  const d = Math.abs((((a - b) % 1) + 1) % 1);
  return Math.min(d, 1 - d);
};
const wrap = (a: number) => ((a % TAU) + TAU) % TAU;
type C = readonly [number, number];

/** A ring arc's path (`M… A5 5 0 f 1 …`) as its start angle, its length (radians, clockwise) and its radius, about c. */
function ringArc(d: string, [cx, cy]: C) {
  const m =
    /^M([\d.-]+) ([\d.-]+)A([\d.]+) [\d.]+ 0 ([01]) 1 ([\d.-]+) ([\d.-]+)$/.exec(
      d
    );
  expect(m, d).not.toBeNull();
  const [x0, y0, r, large, x1, y1] = m!.slice(1).map(Number);
  const a0 = Math.atan2(y0 - cy, x0 - cx);
  const len = wrap(Math.atan2(y1 - cy, x1 - cx) - a0);
  expect(len > Math.PI, `large-arc flag of ${d}`).toBe(large === 1);
  return { a0, len, a1: a0 + len, r };
}

/** The pending mark drawn at a turn (`sa`), a swing (`sw`) and how far it's drawn. */
function mark(spec: StatusIconSpec, sa: number, sw: number, drawn = 1) {
  const f = { ...restFrame(spec.placement, 'pending'), sa, sw, sp: drawn };
  const s = markShapes(spec.placement, f);
  const c = markCentre(spec.placement, 'pending') as C;
  return { s, c, arc: ringArc(String(s['status-spin'].d), c) };
}

function pending(spec: StatusIconSpec, layered: boolean, size = 32) {
  const layerSvg = { animate: w.animate };
  let main: Shapes = {};
  let layer: Shapes = {};
  const spinLayer: SpinLayer = {
    svg: () => layerSvg as unknown as Element,
    paint: (s) => (layer = s),
  };
  const c = new StatusController(
    spec,
    (s) => (main = s),
    size,
    { status: 'pending' },
    true,
    layered ? { spinLayer } : {}
  );
  c.repaint();
  const engine = () =>
    (c as unknown as { engine: { frame: StatusFrame } | null }).engine;
  /** The angle it draws now, as a share of a turn: the layer's turn, or the engine frames' `sa`. */
  const phase = () =>
    layered ? w.turnsAt(w.live(layerSvg)[0]) % 1 : engine()!.frame.sa;
  /** The arc's share of the ring as drawn now (in the layer, while it turns there). */
  const share = () =>
    ringArc(
      String((layered ? layer : main)['status-spin'].d),
      markCentre(spec.placement, 'pending') as C
    ).len / TAU;
  return {
    c,
    layerSvg,
    main: () => main,
    layer: () => layer,
    engine,
    phase,
    share,
  };
}

describe('the numbers', () => {
  it('a turn per loading period, the skeleton wave’s (1000ms); half the ring, ±10%, over 2.5 turns (2500ms)', () => {
    expect(SPIN_MS).toBe(1000);
    expect(SPIN_MS).toBe(SKELETON_WAVE.periodMs);
    expect(PENDING_SPINNER).toEqual({
      arc: 0.5,
      swing: 0.1,
      swingPeriods: 2.5,
    });
    expect(SWING_MS).toBe(2500);
  });

  it('the mark’s 2px line, butt ends, on the r 5 centreline, and nothing else on the ring', () => {
    const { s, arc } = mark(SPECS.Copy, 0, 0);
    expect(s['status-spin'].strokeWidth).toBe(2);
    expect(s['status-spin'].strokeLinecap).toBeUndefined();
    expect(arc.r).toBe(5);
    expect(Object.keys(s).filter((k) => k.startsWith('status-spin'))).toEqual([
      'status-spin',
    ]);
  });
});

describe('the arc', () => {
  it('is half the ring at phase 0, its middle at 3 o’clock, its head (the path’s end) a quarter turn on, clockwise', () => {
    for (const spec of Object.values(SPECS)) {
      const { arc } = mark(spec, 0, 0);
      expect(arc.r).toBe(5);
      expect(arc.len / TAU).toBeCloseTo(0.5, 3);
      expect(wrap(arc.a0 + arc.len / 2 + 0.1) - 0.1).toBeCloseTo(0, 3);
      expect(wrap(arc.a1)).toBeCloseTo(Math.PI / 2, 3);
    }
  });

  it('swings ±10% about its middle: 60% a quarter of the way through a swing, 40% at three quarters, the middle still', () => {
    expect(spinShare(0)).toBeCloseTo(0.5, 9);
    expect(spinShare(0.25)).toBeCloseTo(0.6, 9);
    expect(spinShare(0.75)).toBeCloseTo(0.4, 9);
    for (const spec of Object.values(SPECS)) {
      for (const [sw, share] of [
        [0, 0.5],
        [0.25, 0.6],
        [0.5, 0.5],
        [0.75, 0.4],
      ]) {
        const { arc } = mark(spec, 0.3, sw);
        expect(arc.len / TAU, `swing ${sw}`).toBeCloseTo(share, 3);
        // Head and tail move apart about the middle, which only the turn moves.
        expect(wrap(arc.a0 + arc.len / 2), `swing ${sw}`).toBeCloseTo(
          wrap(0.3 * TAU),
          3
        );
      }
    }
  });

  it('the swing is a sine on its own clock (SWING_MS): the share at a time is spinShare of the swing’s phase', () => {
    for (const t of [0, 625, 1250, 1875, 2500, 4321]) {
      expect(spinShare(spinPhase(t, SWING_MS))).toBeCloseTo(
        PENDING_SPINNER.arc +
          PENDING_SPINNER.swing * Math.sin((TAU * t) / SWING_MS),
        9
      );
    }
  });
});

describe('the shared phase', () => {
  it('spinPhase is the timeline’s time modulo the period', () => {
    expect(spinPhase(0)).toBe(0);
    expect(spinPhase(250)).toBeCloseTo(0.25, 9);
    expect(spinPhase(12_345)).toBeCloseTo(0.345, 9);
    expect(spinPhase(-250)).toBeCloseTo(0.75, 9);
    expect(spinPhase(3_750, SWING_MS)).toBeCloseTo(0.5, 9);
  });

  for (const layered of [false, true]) {
    const how = layered
      ? 'on the compositor (web components)'
      : 'on the engine’s frames (React)';
    // The engine's tweens sample whole milliseconds (as motion does), so its frames are within a millisecond.
    const tol = layered ? 1e-6 : 1.5 / SPIN_MS;
    it(`one turn per SPIN_MS and one swing per SWING_MS, ${how}`, async () => {
      const x = pending(SPECS.Copy, layered);
      await step(2);
      if (layered) {
        expect(w.live(x.layerSvg)[0].options.duration).toBe(SPIN_MS);
      }
      const a0 = x.phase();
      clock.advance(SPIN_MS / 4);
      await flush();
      expect(apart(x.phase(), a0 + 0.25)).toBeLessThan(tol);
      expect(
        apart(x.engine()!.frame.sw, spinPhase(clock.time(), SWING_MS))
      ).toBeLessThan(1.5 / SWING_MS);
      clock.advance(SWING_MS);
      await flush();
      expect(
        apart(x.engine()!.frame.sw, spinPhase(clock.time(), SWING_MS))
      ).toBeLessThan(1.5 / SWING_MS);
    });

    it(`two marks started at different times turn and swing in step, ${how}; Copy and Save, 16 and 32`, async () => {
      clock.advance(123);
      const a = pending(SPECS.Copy, layered, 16);
      await step(7);
      clock.advance(337);
      const b = pending(SPECS.Save, layered, 32);
      for (let i = 0; i < 90; i++) {
        await step();
        const t = clock.time();
        expect(apart(a.phase(), b.phase()), `frame ${i}`).toBeLessThan(tol);
        expect(apart(a.phase(), spinPhase(t)), `frame ${i}`).toBeLessThan(tol);
        expect(a.share(), `frame ${i}`).toBeCloseTo(b.share(), 3);
        expect(a.share(), `frame ${i}`).toBeCloseTo(
          spinShare(spinPhase(t, SWING_MS)),
          3
        );
      }
    });

    it(`held off screen, it comes back in step, ${how}`, async () => {
      const a = pending(SPECS.Copy, layered);
      const b = pending(SPECS.Save, layered);
      await step(10);
      a.c.setVisible(false);
      const [held, heldShare] = [a.phase(), a.share()];
      await step(23);
      expect(apart(a.phase(), held)).toBeLessThan(tol);
      expect(a.share()).toBe(heldShare);
      a.c.setVisible(true);
      await step(2);
      expect(apart(a.phase(), b.phase())).toBeLessThan(tol);
      expect(apart(a.phase(), spinPhase(clock.time()))).toBeLessThan(tol);
      expect(a.share()).toBeCloseTo(b.share(), 3);
    });
  }
});

describe('the status clocks', () => {
  it('in on moderate-01, out on fast-02, read from the tokens', () => {
    expect(STATUS_MS.in).toBe(motionTokens.duration.moderate01);
    expect(STATUS_MS.out).toBe(motionTokens.duration.fast02);
    expect([STATUS_MS.out, STATUS_MS.in]).toEqual([120, 160]);
  });

  it('pending draws on over moderate-01 and its tail catches the head over fast-02', () => {
    const p = SPECS.Copy.placement;
    const enter = plan(p, restFrame(p, 'none'), 'pending').channels.find(
      (c) => c.key === 'sp'
    )!;
    expect(enter.ms).toBe(motionTokens.duration.moderate01);
    const leave = plan(p, restFrame(p, 'pending'), 'success').channels.find(
      (c) => c.key === 'se'
    )!;
    expect(leave.ms).toBe(motionTokens.duration.fast02);
    expect(leave.at).toBe(0);
  });
});

describe('reduced motion', () => {
  it('pending is the three still dots: no arc, nothing turns', async () => {
    for (const spec of Object.values(SPECS)) {
      for (const size of SIZES) {
        const s = stillShapes(spec, { status: 'pending' }, size);
        expect(String(s['status-dots'].d)).not.toBe('');
        expect(String(s['status-spin'].d)).toBe('');
      }
      const x = pending(spec, true);
      x.c.set({ status: 'pending' }, false);
      await step(5);
      expect(w.live(x.layerSvg)).toHaveLength(0);
      expect(String(x.main()['status-dots'].d)).not.toBe('');
      expect(String(x.main()['status-spin'].d)).toBe('');
    }
  });
});
