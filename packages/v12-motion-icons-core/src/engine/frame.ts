/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The frame engine without a framework: what the React package's
 * `makeHoverIcon` / `makeToggleIcon` / `makeStateIcon` run on (they are thin
 * adapters over this since refactor stage 1), and what the web components run on.
 *
 * A controller owns an icon's numbers (its frame), tweens them, and hands
 * each frame's geometry to a painter: the React adapters paint attributes
 * onto the elements React rendered (`paintKeyed`); a web component paints
 * into its own group (`paint`). The binding only forwards hover, state and
 * size, and destroys the controller.
 *
 * One controller covers hover icons, two-state toggles and n-state icons: a
 * two-state toggle is a state icon whose states rest at p = 0 and p = 1
 * (`fromToggle`), so there is one state machine.
 *
 * The animation-channel rule carries over from useToggleAnimation: hover
 * only touches hover tweens; a state change only touches change tweens.
 */
import type { ActionSpec } from './action';
import { DEV, warnOnce } from '../dev';
import type { ActionPlayer } from './actionPlayer';
import type { LoopRunner, LoopSpec } from './loop';
import { type Easing, type Playback } from './animate';
import { animate } from './skip';
import type { Shapes } from './shapes';
import {
  HOVER,
  HOVER_OUT,
  leaveOf,
  TOGGLE_IN,
  TOGGLE_OUT,
  type TweenTiming as TweenOpts,
} from './timing';

export type Frame = Record<string, number>;
/** Geometry for a frame; `size` picks the 16px drawings. */
export type Geo<F = Frame> = (f: F, size?: number) => Shapes;
/**
 * A toggle's frame as its geometry reads it (the React package's
 * ToggleFrameIn): `h`, `p`, `e`, which way the hover is going, and any extra
 * hover numbers by name.
 */
export type ToggleFrameIn = {
  h: number;
  p: number;
  e: number;
  entering?: number;
  [hover: string]: number | undefined;
};

/** Tweens one of the frame's numbers from where it is now; returns the running tween. */
export type TweenFn = (
  key: string,
  to: number,
  opts: TweenOpts,
  onComplete?: () => void
) => Playback;

/** A hover icon (makeHoverIcon's spec). */
export interface HoverSpec {
  geo: Geo<{ h: number; entering?: number }>;
  hover?: TweenOpts;
  /** The leave, when it isn't the hover's standard speed-up. */
  leave?: TweenOpts;
  viewBox?: string;
  /**
   * Carbon's exact drawing for `animated` off (a binding's: React passes a
   * component, the web components a descriptor). Absent: the rest geometry.
   */
  static?: unknown;
  /** The icon's action (engine/action.ts), if it has one. */
  action?: ActionSpec;
}

/** An icon with any number of states (makeStateIcon's spec, without the React statics). */
export interface StateSpec<S extends string = string> {
  /** Every state, in click order. */
  states: readonly S[];
  /** The icon's own numbers at rest in a state (not `h`). */
  rest: (state: S) => Frame;
  geo: Geo;
  /** How a change animates, from wherever the numbers are now; returns every tween it starts. */
  change: (
    prev: S,
    next: S,
    f: Frame,
    tween: TweenFn,
    repaint: () => void
  ) => Playback | Playback[] | void;
  hover?: TweenOpts;
  /** The leave, when it isn't the hover's standard speed-up. */
  leave?: TweenOpts;
  /** Extra hover numbers by name (toggles whose states hover differently). */
  hovers?: Record<string, { hover?: TweenOpts; holdAfter?: S }>;
  /** After a change into this state, `h` stays at rest until the pointer leaves and comes back. */
  holdAfter?: S;
  /** aria-pressed per state when the icon is its own button. */
  pressed?: (state: S) => boolean | 'mixed';
  /** The icon's action, if it has one (hover icons). */
  action?: ActionSpec;
  /** A state that loops while it shows (`loopState`), and its loop (loop.ts: only icons with one carry it). */
  loop?: LoopSpec;
  loopState?: S;
}

/** A two-state toggle (makeToggleIcon's spec, without the React statics). */
export interface ToggleSpec<S extends string = string> {
  /** [off, on]. */
  states: readonly [S, S];
  geo: (f: ToggleFrameIn, size?: number) => Shapes;
  change?: (
    turningOn: boolean,
    f: Frame,
    tween: TweenFn,
    repaint: () => void
  ) => Playback | void;
  hover?: TweenOpts;
  hovers?: Record<string, { hover?: TweenOpts; holdAfter?: S }>;
  holdAfter?: S;
  /** The on state loops while it shows (loop.ts, `defineLoop`). */
  loop?: LoopSpec;
}

/** A toggle as a state icon: off rests at p = 0, on at p = 1 (e, the second toggle number, at 0). */
export function fromToggle<S extends string>(t: ToggleSpec<S>): StateSpec<S> {
  const [off, on] = t.states;
  return {
    states: t.states,
    rest: (s) => ({ p: s === on ? 1 : 0, e: 0 }),
    // The engine's frame always carries h, p and e for a toggle (rest sets p and e).
    geo: t.geo as Geo,
    change: (prev, _next, f, tween, repaint) => {
      const turningOn = prev === off;
      return t.change
        ? t.change(turningOn, f, tween, repaint)
        : tween('p', turningOn ? 1 : 0, turningOn ? TOGGLE_IN : TOGGLE_OUT);
    },
    hover: t.hover,
    hovers: t.hovers,
    holdAfter: t.holdAfter,
    pressed: (s) => s === on,
    ...(t.loop && { loop: t.loop, loopState: on }),
  };
}

/** A hover icon as a one-state icon. */
export function fromHover(spec: HoverSpec): StateSpec<'rest'> {
  return {
    states: ['rest'],
    rest: () => ({}),
    geo: spec.geo as Geo,
    change: () => undefined,
    hover: spec.hover,
    leave: spec.leave,
    ...(spec.action && { action: spec.action }),
  };
}

/**
 * Fill toggles (§7.7): fill in by growing `p`; empty by growing `e` from
 * the same origin (a hole, or a clearing edge), then reset. Interrupting
 * either direction reverses whatever is in flight.
 */
export function fillThenClear(
  turningOn: boolean,
  fr: Frame,
  tween: TweenFn,
  repaint: () => void
): Playback {
  if (turningOn) {
    return fr.e > 0 ? tween('e', 0, TOGGLE_IN) : tween('p', 1, TOGGLE_IN);
  }
  if (fr.p < 1) {
    return tween('p', 0, TOGGLE_OUT);
  }
  return tween('e', 1, TOGGLE_OUT, () => {
    fr.p = 0;
    fr.e = 0;
    repaint();
  });
}

/**
 * Per-instance state for a spec (a ring's swing, a kick in flight): keyed by
 * the icon's frame object, so it lives exactly as long as the mounted icon.
 * A home for what specs keep in module-level WeakMaps today.
 */
const instance = new WeakMap<object, Map<string, unknown>>();
export function instanceState<T>(frame: object, key: string, init: () => T): T {
  let m = instance.get(frame);
  if (!m) {
    instance.set(frame, (m = new Map()));
  }
  if (!m.has(key)) {
    m.set(key, init());
  }
  return m.get(key) as T;
}

const stopAll = (a: (Playback | null | undefined)[]) =>
  a.forEach((p) => p?.stop());

/**
 * A state the icon doesn't have (`value="typo"`) is ignored: the icon keeps
 * its drawing, with a warning once per icon and value (as an unknown status)
 * in development builds. Returns `value` when it is one of `states`, else
 * undefined (the refusal holds in production; only the warning goes).
 */
export function knownState<S extends string>(
  name: string,
  states: readonly S[],
  value: string | null | undefined
): S | undefined {
  if (value == null) {
    return undefined;
  }
  if ((states as readonly string[]).includes(value)) {
    return value as S;
  }
  if (DEV) {
    warnOnce(
      `state|${name}|${value}`,
      `[motion-icons] ${name} has no "${value}" state; it keeps its drawing. Its states: ${states.join(', ')}.`
    );
  }
  return undefined;
}

/** Where a controller's frames go: the geometry of each frame, to paint. */
export type Painter = (shapes: Shapes) => void;

export class FrameController<S extends string = string> {
  /** The icon's numbers: `h`, `entering`, the extra hovers, and the state's own. */
  readonly frame: Frame;
  /** The state the numbers are at, or heading to. */
  state: S;
  /** Rendered size (16 picks the 16px drawings); a binding may change it. */
  size: number;
  private hoverAnims: (Playback | null)[] = [];
  private changeAnims: Playback[] = [];
  private readonly extra: [string, { hover?: TweenOpts; holdAfter?: S }][];

  constructor(
    readonly spec: StateSpec<S>,
    private readonly painter: Painter,
    size = 32,
    initial: S = spec.states[0]
  ) {
    // A state the icon doesn't have draws the first (bindings warn: knownState).
    if (!spec.states.includes(initial)) {
      initial = spec.states[0];
    }
    this.state = initial;
    this.size = size;
    this.extra = Object.entries(spec.hovers ?? {});
    this.frame = {
      h: 0,
      entering: 1,
      ...Object.fromEntries(this.extra.map(([k]) => [k, 0])),
      ...spec.rest(initial),
    };
  }

  /** The current drawing (the action's while it plays). */
  shapes(): Shapes {
    const act = this.spec.action;
    if (act && this.player?.acting) {
      return act.geo(
        {
          h: this.frame.h,
          a: this.frame.a ?? 0,
          entering: this.frame.entering,
        },
        this.size
      );
    }
    return this.spec.geo(this.frame, this.size);
  }

  repaint = (): void => this.painter(this.shapes());

  tween: TweenFn = (key, to, opts, onComplete) =>
    animate(this.frame[key] ?? 0, to, {
      duration: opts.duration,
      ease: opts.ease as Easing,
      onUpdate: (v) => {
        this.frame[key] = v;
        this.repaint();
      },
      onComplete,
    });

  enter(): Promise<boolean> {
    return this.hoverTo(1);
  }

  leave(): Promise<boolean> {
    return this.hoverTo(0);
  }

  /**
   * Hover toward 1 (in) or 0 (out): `h` on the spec's timing (standard by
   * default), each extra hover on its own. Resolves when `h` lands (true),
   * or is stopped first by another hover, a hold or destroy (false): what
   * a binding's `play()` waits on before it plays the hover back out.
   */
  hoverTo(to: 0 | 1): Promise<boolean> {
    this.hoverWanted = to === 1;
    // The pointer or focus leaving ends an action's hold: an enter after it plays (when the action is over).
    if (!to) {
      this.hoverHeld = false;
    }
    // An action has the icon: the hover is noted, and plays when the action ends unless it is held (hoverHeld).
    if (this.player?.acting) {
      return Promise.resolve(false);
    }
    stopAll(this.hoverAnims);
    this.hoverSettled(false);
    this.frame.entering = to;
    const timing = (t?: TweenOpts) =>
      to ? (t ?? HOVER) : t ? leaveOf(t) : HOVER_OUT;
    let landed!: (done: boolean) => void;
    const done = new Promise<boolean>((r) => (landed = r));
    this.onHoverSettled = landed;
    this.hoverAnims[0] = this.tween(
      'h',
      to,
      !to && this.spec.leave ? this.spec.leave : timing(this.spec.hover),
      () => {
        if (this.onHoverSettled === landed) {
          this.hoverSettled(true);
        }
      }
    );
    this.extra.forEach(([k, c], i) => {
      this.hoverAnims[i + 1] = this.tween(
        k,
        to,
        timing(c.hover ?? this.spec.hover)
      );
    });
    return done;
  }

  /** Resolves the hover in flight's promise (see hoverTo). */
  private onHoverSettled?: (done: boolean) => void;
  private hoverSettled(done: boolean) {
    const r = this.onHoverSettled;
    this.onHoverSettled = undefined;
    r?.(done);
  }

  /**
   * Move to `next`: animated from wherever the numbers are now (the change
   * in flight is stopped first), or, with `animated` false, straight to its
   * rest. A change into a hold state drops that hover to rest.
   */
  setState(next: S, animated = true): void {
    const prev = this.state;
    if (prev === next || !this.spec.states.includes(next)) {
      return;
    }
    this.state = next;
    this.hold(next);
    stopAll(this.changeAnims);
    this.changeAnims = [];
    this.syncLoop(animated, true);
    if (!animated) {
      Object.assign(this.frame, this.spec.rest(next));
      this.repaint();
      return;
    }
    const run = this.spec.change(
      prev,
      next,
      this.frame,
      this.tween,
      this.repaint
    );
    this.changeAnims = run ? (Array.isArray(run) ? run : [run]) : [];
  }

  /** The next state in click order (wrapping round). */
  nextState(): S {
    const { states } = this.spec;
    return states[(states.indexOf(this.state) + 1) % states.length];
  }

  /** aria-pressed for the current state. */
  pressed(): boolean | 'mixed' {
    return this.spec.pressed
      ? this.spec.pressed(this.state)
      : this.state !== this.spec.states[0];
  }

  private hold(next: S) {
    [
      ['h', this.spec.holdAfter] as const,
      ...this.extra.map(([k, c]) => [k, c.holdAfter] as const),
    ].forEach(([k, s], i) => {
      if (s !== next) {
        return;
      }
      this.hoverAnims[i]?.stop();
      this.hoverAnims[i] = null;
      this.frame[k] = 0;
      if (k === 'h') {
        this.hoverSettled(false);
      }
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  // The action's player (actionPlayer.ts, loaded only by icons with an action) plays it on this controller
  // (`actionPlayerOf`). The controller only draws it while it plays, and notes the hover: an action holds it at rest
  // until the pointer or focus leaves and comes back (hoverHeld), as a toggle's `holdAfter` does.

  /** The action's player, once something has played the action (actionPlayerOf). */
  player?: ActionPlayer;
  /** The pointer or focus is on the icon (as the binding last said). */
  hoverWanted = false;
  /**
   * The pointer or focus on the icon at an action's trigger hasn't left since: when the action ends the icon
   * stays at rest, not easing back into the hover it had (that reads as the hover replaying on release).
   * An enter after a leave plays as usual.
   */
  hoverHeld = false;

  /** Off screen (a binding's observeVisibility): a looping action holds where it is. */
  hidden = false;

  /** The svg the binding draws into: a steady cycle (Renew's loop) turns it on the compositor (turn.ts). */
  turnBox?: () => Element | null | undefined;

  /** On or off screen: a looping action holds while it can't be seen, and carries on from where it was. */
  setVisible(visible: boolean): void {
    if (this.hidden === !visible) {
      return;
    }
    this.hidden = !visible;
    this.player?.visibility();
    this.looper?.visibility();
  }

  // A state that loops while it shows: its runner (loop.ts, carried by the spec) plays it on this controller.

  private looper?: LoopRunner;
  /** Whether the icon moves (the binding's: not under reduced motion, not drawn still): a state loops only while it does. */
  private moving = false;

  /** The binding says whether the icon moves (off: a loop drops to its still pose at once). */
  setMoving(moving: boolean): void {
    this.moving = moving;
    this.syncLoop(moving, false);
  }

  /** The live level a loop with `level` follows (loop.ts): read each frame. */
  level?: () => number;

  /** The binding's `level`: a number, or a function read each frame; unset for none. */
  setLevel(level: number | (() => number) | undefined): void {
    this.level =
      typeof level === 'function'
        ? level
        : level === undefined
          ? undefined
          : () => level;
  }

  /** The state's loop on or off to match the state and `moving`; `animated` false ends it at once; `change`: it starts after the change. */
  private syncLoop(animated: boolean, change: boolean): void {
    const loop = this.spec.loop;
    if (loop) {
      (this.looper ??= loop.runner(this)).set(
        this.moving && this.state === this.spec.loopState,
        animated,
        change
      );
    }
  }

  /** Stop every tween (unmount / disconnect). */
  destroy(): void {
    this.looper?.stop();
    this.player?.cut();
    stopAll(this.hoverAnims);
    this.hoverSettled(false);
    stopAll(this.changeAnims);
    this.hoverAnims = [];
    this.changeAnims = [];
  }
}
