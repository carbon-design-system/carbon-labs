/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status layer's engines without a framework (refactor stage 1):
 *
 *  - `StatusEngine`: a status-capable icon while a status shows (React's
 *    `makeStatusIcon` Engine, one to one: the cut and mark tweens, the
 *    spinner, the count roll, hold-still-on-hover, the hand-back);
 *  - `PipEngine`: StatusPip's count roll;
 *  - `StatusController`: the plain icon until a status arrives, then the
 *    engine, and back (what React's `Icon` does by switching components), for
 *    bindings that keep one element (the web components).
 *
 * Every decision about what a frame looks like, or how a change moves, is
 * the status layer's own functions (../status.ts: statusGeo, restFrame,
 * plan, applyPlan, pipShapes).
 */
import {
  applyPlan,
  COUNT_SIZE,
  countAt,
  defaultMax,
  markCentre,
  pillText,
  pipShapes,
  plan,
  restFrame,
  ROLL_MS,
  PENDING_SPINNER,
  SPIN_MS,
  spinPhase,
  STATUS_MS,
  statusGeo,
  SWING_MS,
  TONE,
  type BaseGeo,
  type CountPlacement,
  type Mark,
  type Placement,
  type Status,
  type StatusFrame,
  type Tone,
} from '../status';
import { DEV, warnOnce } from '../dev';
import { ENTRANCE, EXIT } from '../ease';
import { now, type Easing, type Playback } from './animate';
import { animate, onSkipChange, skipping } from './skip';
import {
  waitForAction,
  type ActionSpec,
  type ActionTail,
  type ActionTarget,
} from './action';
import { FrameController, fromHover, type Painter } from './frame';
import type { Shapes } from './shapes';
import { HOVER, HOVER_OUT, leaveOf, type TweenTiming } from './timing';
import { startTurn } from './turn';

export type FrameGeo = (f: StatusFrame, size?: number) => Shapes;

/** How an icon takes its statuses (the React package's StatusSpec). */
export interface StatusIconSpec<S extends Status = Status> {
  statuses: readonly S[];
  placement: Placement;
  count?: boolean;
  geo: BaseGeo;
  hover?: TweenTiming;
  leave?: TweenTiming;
  /** Why it takes no such status, for a status an icon refuses on purpose (CheckmarkOutline's success: it already says it). Shown in the warning. */
  refused?: Partial<Record<Status, string>>;
  /** The plain icon's action (default: the `base` spec's, when the spec carries one). */
  action?: ActionSpec;
}

/**
 * A status the icon doesn't take: the warning, once per icon and status
 * (TypeScript already refuses it). Development only: callers call it behind
 * `if (DEV)`, and in production it is a no-op whose text no bundle carries
 * (defined as `DEV ? … : noop`, which esbuild folds; a function declaration
 * reached only from dead code it keeps). Ignoring the status (the plain icon
 * draws) is `resolveStatus`'s and the bindings' own, and holds in production.
 */
export const refuseStatus: (
  name: string,
  spec: Pick<StatusIconSpec, 'statuses' | 'refused'>,
  status: string | null | undefined
) => void = DEV
  ? (name, spec, status) => {
      if (
        status == null ||
        status === 'none' ||
        (spec.statuses as readonly string[]).includes(status)
      ) {
        return;
      }
      const why = spec.refused?.[status as Status];
      warnOnce(
        `status|${name}|${status}`,
        `[motion-icons] ${name} takes no "${status}" status${why ? ` (${why})` : ''}; it draws the plain icon. It takes: ${spec.statuses.join(', ')}.`
      );
    }
  : () => undefined;

/** A status icon's action: its own, or its plain icon's. */
export const actionOf = (spec: StatusIconSpec): ActionSpec | undefined =>
  spec.action ?? (spec as { base?: { action?: ActionSpec } }).base?.action;

/** The base's hover timing on a status icon: its own, or the standard pair. */
export function statusTiming(spec: Pick<StatusIconSpec, 'hover' | 'leave'>): {
  enter: TweenTiming;
  leave: TweenTiming;
} {
  return {
    enter: spec.hover ?? HOVER,
    leave: spec.leave ?? (spec.hover ? leaveOf(spec.hover) : HOVER_OUT),
  };
}

/** A spec's placement for a count placement (the overhang is its own drawing). */
export function placementOf(
  spec: Pick<StatusIconSpec, 'placement'>,
  at?: CountPlacement
): Placement {
  return at === 'overhang'
    ? { ...spec.placement, countAt: 'overhang' }
    : spec.placement;
}

/** The status geometry per spec, placement and tone (statusGeo keeps its own cut cache, so this is shared). */
const geoCache = new WeakMap<object, Map<string, FrameGeo>>();
export function geoAt(
  spec: Pick<StatusIconSpec, 'geo'>,
  placement: Placement,
  tone: boolean | Tone = false
): FrameGeo {
  let m = geoCache.get(spec);
  if (!m) {
    geoCache.set(spec, (m = new Map()));
  }
  const key = `${placement.countAt ?? 'inside'}|${tone}`;
  let g = m.get(key);
  if (!g) {
    m.set(key, (g = statusGeo(spec.geo, placement, tone)));
  }
  return g;
}

export interface StatusInput {
  status?: string | null;
  count?: number | null;
  max?: 9 | 99 | null;
  countPlacement?: CountPlacement | null;
  tone?: boolean | Tone;
  /** The status aliases (Carbon's static status names): hover plays on the mark (it grows, the cut keeping its gap) while the base holds. */
  markHover?: boolean;
}

/**
 * What a status icon shows for its inputs at a size: the mark, the count's
 * text, the count, the placement. Both bindings resolve with it (React's
 * `makeStatusIcon`, the web components' StatusController). A status the
 * icon doesn't take warns once, under `name`.
 */
export function resolveStatus(
  spec: StatusIconSpec,
  i: StatusInput,
  size: number,
  name: string = (spec as { name?: string }).name ?? 'This icon'
): { mark: Mark; text: string; n: number; placement: Placement } {
  const n =
    spec.count && typeof i.count === 'number' && i.count > 0 ? i.count : 0;
  // Numbers only read at 32px: smaller, a count shows as the plain pip.
  const numbers = size === COUNT_SIZE;
  const allowed = spec.statuses as readonly string[];
  if (DEV) {
    refuseStatus(name, spec, i.status);
  }
  const mark: Mark =
    n > 0
      ? numbers
        ? 'count'
        : 'notification'
      : i.status != null && allowed.includes(i.status)
        ? (i.status as Mark)
        : 'none';
  const text = n > 0 && numbers ? pillText(n, i.max ?? 99) : '';
  const placement = placementOf(
    spec,
    spec.count
      ? countAt(spec.placement, i.countPlacement ?? undefined, text)
      : undefined
  );
  return { mark, text, n, placement };
}

/** The still drawing (reduced motion, `animated` off, server output): the plain icon at rest, or the status at rest with pending as dots. */
export function stillShapes(
  spec: StatusIconSpec,
  i: StatusInput,
  size: number
): Shapes {
  const { mark, text, placement } = resolveStatus(spec, i, size);
  if (mark === 'none') {
    return spec.geo({ h: 0, p: 0, e: 0 }, size);
  }
  return geoAt(
    spec,
    placement,
    i.tone ?? false
  )(restFrame(placement, mark, true, text), size);
}

// ── StatusEngine ─────────────────────────────────────────────────────────────

export interface StatusEngineOptions {
  geo: FrameGeo;
  placement: Placement;
  mark: Mark;
  text: string;
  count: number;
  size: number;
  /** 'rest': showing `mark` from the first frame; 'enter': from the plain icon, so `mark` animates in. */
  start: 'rest' | 'enter';
  enter: TweenTiming;
  leave: TweenTiming;
  painter: Painter;
  /** Called once the mark is gone, nothing moves and the pointer is off: the plain icon can take over. */
  onRest: () => void;
  /** Hover plays on the mark while one shows (the status aliases); else the icon holds still. */
  markHover?: boolean;
  /** An action's tail (its hand-off): the icon finishes the action under the entering mark. */
  tail?: ActionTail;
  /** Where the spinner turns on the compositor (the web components): an svg over the icon's, and its painter. */
  spinLayer?: SpinLayer;
}

/**
 * The web components' spinner layer: an `<svg>` stacked over the icon's, the
 * same size and viewBox. While the pending spinner shows, its arc is drawn
 * there, unturned, and the browser turns the layer about the mark's centre
 * (turn.ts); the icon's own drawing has the arc empty.
 */
export interface SpinLayer {
  svg(): Element | null | undefined;
  paint: Painter;
}

/** The arc's key, empty in the icon's own drawing while the layer has it. */
const NO_ARC = { d: '' };
/**
 * The spinner's frame tween's span (ms), about 11.6 days: a whole number of turns, and of swings while the swing's
 * clock divides it (2500ms: 400,000), so its repeat lands on the same phase.
 */
const TICK_MS = 1e9;

export class StatusEngine {
  readonly frame: StatusFrame;
  geo: FrameGeo;
  size: number;
  onRest: () => void;
  private readonly placement: Placement;
  private readonly enterT: TweenTiming;
  private readonly leaveT: TweenTiming;
  private readonly painter: Painter;
  private readonly spinLayer?: SpinLayer;
  /** Whether the spinner turns on the compositor now (its arc in the layer). */
  private turning = false;
  private anims: {
    hover?: Playback;
    change?: Playback;
    spin?: Playback;
    roll?: Playback;
    mark?: Playback;
    tail?: Playback;
  } = {};
  private readonly markHover: boolean;
  /** The mark shown or heading in; undefined after a destroy (the next update re-plans from the frame). */
  private shown: Mark | undefined;
  private busy = false;
  private hovering = false;
  private count: number;

  constructor(o: StatusEngineOptions) {
    this.geo = o.geo;
    this.placement = o.placement;
    this.size = o.size;
    this.enterT = o.enter;
    this.leaveT = o.leave;
    this.painter = o.painter;
    this.spinLayer = o.spinLayer;
    this.onRest = o.onRest;
    this.count = o.count;
    this.markHover = !!o.markHover;
    this.frame = restFrame(
      o.placement,
      o.start === 'rest' ? o.mark : 'none',
      false,
      o.text
    );
    this.shown = o.start === 'rest' ? o.mark : 'none';
    this.held = !!o.tail?.held;
    // An action's tail, still running (a binding may take it over a frame or two after the hand-off), finishes under
    // the entering mark.
    if (o.tail && now() < o.tail.start + o.tail.ms) {
      this.tail = o.tail;
      this.frame.tail = o.tail;
      this.frame.ta = (now() - o.tail.start) / o.tail.ms;
    }
  }

  private tail?: ActionTail;
  /**
   * An action's hand-off whose trigger had the pointer or focus on the icon (ActionTail.held): the
   * hover stays at rest once the status clears, until they leave and come back, as after the action itself. A status
   * the app set (or a hover that arrived during the action) brings the hover back as before.
   */
  private held = false;

  shapes(): Shapes {
    return this.geo(this.frame, this.size);
  }

  repaint = (): void => {
    const s = this.shapes();
    if (!this.turning) {
      return this.painter(s);
    }
    // The arc is the spinner layer's while it turns there.
    this.painter({ ...s, 'status-spin': NO_ARC });
    this.spinLayer!.paint({ 'status-spin': s['status-spin'] });
  };

  /** A new geometry (tone): repaint with it. */
  setGeo(geo: FrameGeo): void {
    if (geo === this.geo) {
      return;
    }
    this.geo = geo;
    this.repaint();
  }

  /**
   * Mounted: taking over from the plain icon under a resting pointer, it
   * is hovered, so start there (it eases out as the mark arrives); a
   * pending mark starts turning. Taking over an action's hand-off (a tail),
   * the hover is only noted: an action blocks the hover,
   * so the base stays where the action has it, with no jump to the hovered
   * drawing and no hover easing out under the tail.
   */
  mount(hovered: boolean): void {
    if (this.tail || this.held) {
      this.hovering = hovered;
    } else if (
      hovered &&
      this.markHover &&
      (this.shown ?? this.last?.mark ?? 'none') !== 'none'
    ) {
      this.hovering = true;
      this.frame.mh = 1;
      this.repaint();
    } else if (hovered) {
      this.hovering = true;
      this.frame.h = 1;
      this.repaint();
    }
    if (this.frame.sp > 0) {
      this.spin(true);
    }
    // Mounted again after a destroy (React's StrictMode, <Activity> hidden and shown): the change it was making plays on.
    const last = this.destroyed ? this.last : undefined;
    this.destroyed = false;
    if (last) {
      this.update(last.mark, last.text, last.count);
    }
    // The action's tail finishes under the entering mark, then the base is the plain icon again.
    const tail = this.tail;
    if (tail && !this.anims.tail) {
      // From where it has got to since the hand-off.
      const u0 = Math.min(1, Math.max(0, (now() - tail.start) / tail.ms));
      this.anims.tail = animate(u0, 1, {
        duration: ((1 - u0) * tail.ms) / 1000,
        ease: 'linear',
        onUpdate: (u) => {
          this.frame.ta = u;
          this.repaint();
        },
        onComplete: () => {
          delete this.frame.tail;
          delete this.frame.ta;
          this.tail = undefined;
          this.repaint();
          // The action is over: a status cleared meanwhile lets the hover (or the plain icon) back now.
          this.settle();
        },
      });
    }
  }

  /** The base's hover toward `to`, on its own timing. Resolves as FrameController.hoverTo: true when it lands, false if stopped first. */
  private hoverTo(
    to: 0 | 1,
    t: TweenTiming = to ? this.enterT : this.leaveT
  ): Promise<boolean> {
    this.anims.hover?.stop();
    this.hoverSettled(false);
    this.frame.entering = to;
    let landed!: (done: boolean) => void;
    const done = new Promise<boolean>((r) => (landed = r));
    this.onHoverSettled = landed;
    this.anims.hover = animate(this.frame.h, to, {
      duration: t.duration,
      ease: t.ease as Easing,
      onUpdate: (v) => {
        this.frame.h = v;
        this.repaint();
      },
      onComplete: () => {
        if (this.onHoverSettled === landed) {
          this.hoverSettled(true);
        }
        if (!to) {
          this.settle();
        }
      },
    });
    return done;
  }

  private onHoverSettled?: (done: boolean) => void;
  private hoverSettled(done: boolean) {
    const r = this.onHoverSettled;
    this.onHoverSettled = undefined;
    r?.(done);
  }

  /**
   * Plain again (no mark, nothing moving): the hover comes back; at rest and off, the plain icon can take over. Released (an
   * action waits to play: `release`), it hands back at rest even under the pointer, the action blocking the hover.
   */
  private settle(): void {
    if (this.shown !== 'none' || this.busy || this.tail) {
      return;
    }
    if (this.releasing) {
      if (this.frame.h <= 1e-6) {
        this.onRest();
      } else {
        this.hoverTo(0, HOVER_OUT);
      }
      return;
    }
    if (this.hovering && !this.held && this.frame.h < 1 - 1e-6) {
      this.hoverTo(1);
    } else if (!this.hovering && this.frame.h <= 1e-6) {
      this.onRest();
    }
  }

  /** An action waits to play (a trigger while this status shows): once the status has cleared, hand back to the plain icon. */
  release(): void {
    this.releasing = true;
    this.settle();
  }
  private releasing = false;

  /** While an action's tail plays, or once one waits (released), hover is noted, not played: the action blocks it. */
  private get blocked(): boolean {
    return !!this.tail || this.releasing;
  }

  /** Hover only moves the plain icon: while a mark shows (or is leaving) it's noted, not played. Returns the hover-in when it plays. */
  enter(): Promise<boolean> | undefined {
    this.hovering = true;
    if (this.blocked) {
      return undefined;
    }
    if (this.markHover && this.shown !== 'none') {
      return this.markTo(1);
    }
    return this.shown === 'none' && !this.busy ? this.hoverTo(1) : undefined;
  }

  /** Returns the hover-out when it plays (a binding's play() waits for it to land). */
  leave(): Promise<boolean> | undefined {
    this.hovering = false;
    this.held = false;
    if (this.blocked) {
      return undefined;
    }
    if (this.markHover && (this.frame.mh ?? 0) > 0) {
      return this.markTo(0);
    }
    return this.shown === 'none' && !this.busy ? this.hoverTo(0) : undefined;
  }

  /** The mark's hover (the status aliases), on the standard hover timing. Resolves true when it lands, false if stopped first. */
  private markTo(to: 0 | 1): Promise<boolean> {
    this.anims.mark?.stop();
    this.markSettled?.(false);
    const t = to ? HOVER : HOVER_OUT;
    return new Promise<boolean>((resolve) => {
      const settled = (done: boolean) => {
        if (this.markSettled === settled) {
          this.markSettled = undefined;
        }
        resolve(done);
      };
      this.markSettled = settled;
      this.anims.mark = animate(this.frame.mh ?? 0, to, {
        duration: t.duration,
        ease: t.ease as Easing,
        onUpdate: (v) => {
          this.frame.mh = v;
          this.repaint();
        },
        onComplete: () => settled(true),
      });
    });
  }
  private markSettled?: (done: boolean) => void;

  /** Off screen: the spinner holds where it is. */
  private hidden = false;

  /** On or off screen: the pending spinner holds while it can't be seen, and comes back in step with the page's spinners. */
  setVisible(visible: boolean): void {
    this.hidden = !visible;
    if (this.hidden) {
      this.anims.spin?.pause?.();
    } else {
      this.anims.spin?.resume?.();
    }
  }

  /** While the spinner is wanted: skip turning on (skip.ts) holds it at rest; turning off, it turns again. */
  private unskipSpin?: () => void;

  private spin(on: boolean): void {
    if (on && !this.unskipSpin) {
      this.unskipSpin = onSkipChange(() => {
        this.anims.spin?.stop();
        this.anims.spin = undefined;
        if (!skipping()) {
          return this.spin(true);
        }
        this.frame.sa = 0;
        this.frame.sw = 0;
        this.repaint();
      });
    }
    if (!on) {
      this.unskipSpin?.();
      this.unskipSpin = undefined;
    }
    // Under skip the pending arc holds at rest: no turn, no frames.
    if (on && skipping()) {
      return;
    }
    if (on && !this.anims.spin) {
      // (The arc joins the shared phase on its first frame: a pending mark shown at rest paints its first drawing,
      // as React renders it, at phase 0: the arc at its middle share, centred on 3 o'clock.)
      this.anims.spin = this.turnSpin() ?? this.frameSpin();
      if (this.hidden) {
        this.anims.spin.pause?.();
      }
    } else if (!on && this.anims.spin) {
      this.anims.spin.stop();
      this.anims.spin = undefined;
    }
  }

  /**
   * `draw(t)` on every frame while the spinner shows (t: the frame's time on the engine's clock), held off screen. A
   * tween whose value is the time since it started (so it runs on whichever clock the engine's tweens do); what it
   * draws comes from the time, never from how long it has run, and on screen again it starts afresh, back on the
   * shared phase. (It repeats every TICK_MS.)
   */
  private ticker(draw: (t: number) => void): Playback {
    const start = () => {
      const t0 = now();
      return animate(0, TICK_MS, {
        duration: TICK_MS / 1000,
        ease: 'linear',
        repeat: Infinity,
        onUpdate: (ms) => draw(t0 + ms),
      });
    };
    let run = start();
    let held = false;
    return {
      stop: () => run.stop(),
      pause: () => {
        held = true;
        run.pause?.();
      },
      resume: () => {
        if (!held) {
          return;
        }
        held = false;
        run.stop();
        run = start();
      },
    };
  }

  /**
   * The spinner on the engine's frames (React, or no Web Animations): each
   * frame, the turn and the swing where the shared phase has them now (a
   * turn every SPIN_MS, a swing every SWING_MS).
   */
  private frameSpin(): Playback {
    return this.ticker((t) => {
      this.frame.sa = spinPhase(t);
      this.frame.sw = spinPhase(t, SWING_MS);
      this.repaint();
    });
  }

  /**
   * The spinner on the compositor (the web components' layer, turn.ts): its
   * arc is drawn unturned in the layer, which the browser turns
   * about the mark's centre, a turn every SPIN_MS on the shared phase (its
   * start put on a whole turn of the document timeline, so its angle is the
   * one the engine's frames would draw, and every spinner's). The swing
   * changes the drawing, so it is drawn on the engine's frames, on the same
   * timeline (it holds while the main thread is busy; the turn doesn't). It
   * turns through the arc's exit, and stops once the arc is gone
   * (`spin(false)` when the change finishes) or on a destroy, where the arc
   * goes back to the icon's drawing at the angle it reached. Back on screen,
   * it starts again on the shared phase. Undefined without the layer or Web
   * Animations: the engine's frames turn it.
   */
  private turnSpin(): Playback | undefined {
    const layer = this.spinLayer;
    if (!layer) {
      return undefined;
    }
    const [cx, cy] = markCentre(this.placement, 'pending');
    const k = this.size / 32;
    const start = () => {
      const t = now();
      return startTurn(
        layer.svg(),
        [(cx - 16) * k, (cy - 16) * k],
        SPIN_MS,
        t - spinPhase(t) * SPIN_MS
      );
    };
    const first = start();
    if (!first) {
      return undefined;
    }
    let turn = first;
    let held = false;
    this.frame.sa = 0;
    this.frame.sw = spinPhase(now(), SWING_MS);
    this.turning = true;
    this.repaint();
    const swing =
      PENDING_SPINNER.swing > 0
        ? this.ticker((t) => {
            this.frame.sw = spinPhase(t, SWING_MS);
            this.repaint();
          })
        : undefined;
    return {
      stop: () => {
        swing?.stop();
        turn.stop();
        this.turning = false;
        this.frame.sa = turn.turns(now()) % 1;
        layer.paint({});
        this.repaint();
      },
      pause: () => {
        held = true;
        swing?.pause?.();
        turn.pause(now());
      },
      resume: () => {
        if (!held) {
          return;
        }
        held = false;
        swing?.resume?.();
        const next = start();
        if (!next) {
          return turn.resume(now());
        }
        turn.stop();
        turn = next;
      },
    };
  }

  private roll(to: string, dir: number): void {
    const f = this.frame;
    this.anims.roll?.stop();
    // A roll in flight lands where it was going; the new one starts from there.
    [f.nFrom, f.nTo, f.nDir, f.nt] = [f.nTo, to, dir, 0];
    this.anims.roll = animate(0, 1, {
      duration: ROLL_MS / 1000,
      ease: 'linear',
      onUpdate: (u) => {
        f.nt = ENTRANCE(u);
        this.repaint();
      },
      onComplete: () => {
        f.nFrom = f.nTo;
        f.nt = 1;
        this.repaint();
      },
    });
  }

  /**
   * The mark or the count's text changed (or the engine just mounted):
   * animate there from wherever things are. `count` is the count behind the
   * text (its direction picks which way the figures roll).
   */
  update(mark: Mark, text: string, count: number): void {
    this.last = { mark, text, count };
    const f = this.frame;
    const dir = count >= this.count ? 1 : -1;
    this.count = count;
    if (mark === this.shown) {
      if (mark === 'count' && text !== f.nTo) {
        this.roll(text, dir);
      }
      if (mark === 'none') {
        this.settle();
      }
      return;
    }
    this.shown = mark;
    this.anims.change?.stop();
    // A status holds the icon still: a hover in flight (or held) eases back to rest as the cut opens.
    if (mark !== 'none' && f.h > 1e-6) {
      this.hoverTo(0, HOVER_OUT);
    }
    if (mark === 'count') {
      if (f.np <= 1e-3) {
        this.anims.roll?.stop();
        [f.nFrom, f.nTo, f.nt] = [text, text, 1];
      } else if (text !== f.nTo) {
        this.roll(text, dir);
      }
    }
    const { channels, total, done } = plan(this.placement, f, mark);
    if (mark === 'pending') {
      this.spin(true);
    }
    const finish = () => {
      Object.assign(f, done);
      if (f.sp <= 0) {
        this.spin(false);
      }
      this.busy = false;
      this.repaint();
      this.settle();
    };
    this.busy = true;
    if (!channels.length) {
      finish();
      return;
    }
    this.anims.change = animate(0, total, {
      duration: total / 1000,
      ease: 'linear',
      onUpdate: (t) => {
        applyPlan(f, channels, t);
        this.repaint();
      },
      onComplete: finish,
    });
  }

  /** The last update asked for, and whether the engine was destroyed since (a mount after destroy picks up from there). */
  private last?: { mark: Mark; text: string; count: number };
  private destroyed = false;

  /**
   * Stop everything. Reversible: a later `mount()` resumes (React's StrictMode
   * mounts, destroys and mounts again; `<Activity>` hides and shows), so it
   * forgets what it was running and which mark it showed, and mount re-runs
   * the last update from wherever the frame stopped.
   */
  destroy(): void {
    const a = this.anims;
    a.hover?.stop();
    this.hoverSettled(false);
    a.change?.stop();
    a.spin?.stop();
    this.unskipSpin?.();
    this.unskipSpin = undefined;
    a.roll?.stop();
    a.mark?.stop();
    a.tail?.stop();
    this.markSettled?.(false);
    this.anims = {};
    this.busy = false;
    // Not the mark: what the frame shows is wherever its tweens stopped (`update` plans from there).
    this.shown = undefined;
    this.destroyed = true;
  }
}

// ── PipEngine (StatusPip) ────────────────────────────────────────────────────

export interface PipInput {
  count: number;
  max?: 9 | 99 | null;
  tone?: Tone | null;
}

/** StatusPip's state and roll: a count in a pill; changes roll (fast-02 entrance, fast-01 exit) both ways. */
export class PipEngine {
  private st: {
    from: string;
    to: string;
    t: number;
    dir: 1 | -1;
    s: number;
    last: number;
  };
  private anim: Playback | null = null;
  private input: PipInput;

  constructor(
    private readonly painter: Painter,
    public size: number,
    input: PipInput
  ) {
    this.input = input;
    const text = this.text(input.count);
    this.st = {
      from: text,
      to: text,
      t: 1,
      dir: 1,
      s: input.count > 0 ? 1 : 0,
      last: input.count,
    };
  }

  private text(n: number): string {
    return pillText(n, this.input.max ?? defaultMax(this.size));
  }

  shapes(): Shapes {
    const S = this.st;
    return pipShapes(
      S.from,
      S.to,
      S.t,
      S.dir,
      S.s,
      this.input.tone ? TONE[this.input.tone] : 'currentColor'
    );
  }

  repaint = (): void => this.painter(this.shapes());

  /** The cap, colour and size without a count change (each render: a new tone or cap draws on the next paint, as it always has). */
  configure(style: Omit<PipInput, 'count'>, size: number = this.size): void {
    this.input = { ...this.input, max: style.max, tone: style.tone };
    this.size = size;
    this.retext();
  }

  /** A new size (the web components): the count drawn there, at rest. */
  setSize(size: number): void {
    this.configure(this.input, size);
    this.repaint();
  }

  /** At rest, the count's text for the current cap: a new cap, or a size that picks another default ("99+" at 32 is "9+" at 16). */
  private retext(): void {
    const S = this.st;
    if (S.last > 0 && S.t >= 1) {
      S.from = S.to = this.text(S.last);
    }
  }

  /** New inputs (the React component's count effect): animated, or straight there. */
  set(input: PipInput, animated = true): void {
    this.input = input;
    const { count } = input;
    const S = this.st;
    if (count === S.last) {
      // The same count, a new cap: drawn there, at rest.
      this.retext();
      this.repaint();
      return;
    }
    // At or above the cap the pip reads the same ("9+"): nothing to animate.
    if (count > 0 && S.last > 0 && this.text(count) === this.text(S.last)) {
      S.last = count;
      return;
    }
    this.anim?.stop();
    const [prevS, nextS] = [S.s, count > 0 ? 1 : 0];
    // A roll in flight lands where it was going; the new change starts from there.
    if (count > 0 && S.last > 0) {
      [S.from, S.to, S.t, S.dir] = [
        S.to,
        this.text(count),
        0,
        count > S.last ? 1 : -1,
      ];
    } else if (count > 0) {
      [S.from, S.to, S.t] = [this.text(count), this.text(count), 1];
    }
    S.last = count;
    if (!animated) {
      [S.from, S.t, S.s] = [S.to, 1, nextS];
      this.repaint();
      return;
    }
    const opts =
      nextS < prevS
        ? { duration: STATUS_MS.out / 1000, ease: EXIT }
        : { duration: STATUS_MS.in / 1000, ease: ENTRANCE };
    const [t0, s0] = [S.t, S.s];
    this.anim = animate(0, 1, {
      duration: opts.duration,
      ease: 'linear',
      onUpdate: (u) => {
        const e = opts.ease(u);
        S.t = t0 + (1 - t0) * e;
        S.s = s0 + (nextS - s0) * e;
        this.repaint();
      },
      onComplete: () => {
        S.from = S.to;
      },
    });
  }

  destroy(): void {
    this.anim?.stop();
  }
}

// ── StatusController (one element, plain ⇄ status) ──────────────────────────

/**
 * A status-capable icon as one long-lived object: the plain icon (a
 * FrameController on the base geometry) until a status arrives, then a
 * StatusEngine, and back once it hands back. The same switch React's `Icon`
 * makes between its Base and Engine components, for bindings that keep one
 * element (the web components). Still mode draws `stillShapes`.
 */
export class StatusController implements ActionTarget {
  size: number;
  private plain: FrameController<'rest'>;
  private engine: StatusEngine | null = null;
  private engineKey = '';
  private input: StatusInput;
  private hovering = false;
  private still: boolean;

  constructor(
    private readonly spec: StatusIconSpec,
    private readonly painter: Painter,
    size: number,
    input: StatusInput,
    animated = true,
    /** What the browser may turn (turn.ts): the icon's svg (a looping cycle), and the spinner's layer. */
    private readonly turns: {
      svg?: () => Element | null | undefined;
      spinLayer?: SpinLayer;
    } = {}
  ) {
    this.size = size;
    this.input = input;
    this.still = !animated;
    const t = statusTiming(spec);
    // The plain icon: the base geometry at p = e = 0 (what the status layer cuts), on the base's own hover timing.
    this.plain = new FrameController(
      fromHover({
        geo: (f, sz) =>
          spec.geo({ h: f.h, p: 0, e: 0, entering: f.entering }, sz),
        hover: t.enter,
        leave: t.leave,
        action: actionOf(spec),
      }),
      painter,
      size
    );
    this.plain.turnBox = turns.svg;
    if (!this.still) {
      this.startEngine('rest');
    }
  }

  get mode(): 'still' | 'plain' | 'engine' {
    return this.still ? 'still' : this.engine ? 'engine' : 'plain';
  }

  shapes(): Shapes {
    if (this.still) {
      return stillShapes(this.spec, this.input, this.size);
    }
    if (this.engine) {
      return this.engine.shapes();
    }
    return this.plain.shapes();
  }

  repaint = (): void =>
    this.engine && !this.still
      ? this.engine.repaint()
      : this.painter(this.shapes());

  /** Start the engine for the current inputs, if they show a mark ('rest': at rest; 'enter': animating in from the plain icon). */
  private startEngine(start: 'rest' | 'enter', tail?: ActionTail): void {
    const { mark, text, n, placement } = resolveStatus(
      this.spec,
      this.input,
      this.size
    );
    if (mark === 'none') {
      return;
    }
    const t = statusTiming(this.spec);
    this.plain.destroy();
    this.engineKey = `${placement.countAt ?? 'inside'}|${this.size}`;
    const engine = new StatusEngine({
      geo: geoAt(this.spec, placement, this.input.tone ?? false),
      placement,
      mark,
      text,
      count: n,
      size: this.size,
      start,
      enter: t.enter,
      leave: t.leave,
      painter: this.painter,
      markHover: !!this.input.markHover,
      ...(tail && { tail }),
      ...(this.turns.spinLayer && { spinLayer: this.turns.spinLayer }),
      onRest: () => {
        if (this.engine !== engine) {
          return;
        }
        engine.destroy();
        this.engine = null;
        this.plain.frame.h = 0;
        this.plain.frame.entering = 1;
        // Back at rest: the plain icon's hover comes back with the next enter (as a remounted React icon's does).
        this.plain.hoverWanted = false;
        this.repaint();
        this.flushPlain();
      },
    });
    this.engine = engine;
    if (this.hidden) {
      engine.setVisible(false);
    }
    engine.mount(this.hovering);
    engine.update(mark, text, n);
  }

  /** Off screen: a pending spinner and a looping action hold where they are. */
  private hidden = false;

  /** On or off screen (a binding's observeVisibility). */
  setVisible(visible: boolean): void {
    this.hidden = !visible;
    this.engine?.setVisible(visible);
    this.plain.setVisible(visible);
  }

  /** Returns the hover-in when one plays (see FrameController.hoverTo). */
  enter(): Promise<boolean> | undefined {
    this.hovering = true;
    if (this.still) {
      return undefined;
    }
    return this.engine ? this.engine.enter() : this.plain.enter();
  }

  /** Returns the hover-out when one plays. */
  leave(): Promise<boolean> | undefined {
    this.hovering = false;
    if (this.still) {
      return undefined;
    }
    return this.engine ? this.engine.leave() : this.plain.leave();
  }

  /** New inputs: animated from wherever things are (as React re-rendering with new props), or still. */
  /** `tail`: a hand-off from the plain icon's action, which finishes under the entering mark (no wait). */
  set(input: StatusInput, animated = true, tail?: ActionTail): void {
    const wasStill = this.still;
    this.input = input;
    this.still = !animated;
    if (this.still) {
      this.engine?.destroy();
      this.engine = null;
      this.plain.destroy();
      this.repaint();
      this.flushPlain();
      return;
    }
    if (wasStill) {
      this.plain.frame.h = 0;
      this.startEngine('rest');
      this.repaint();
      return;
    }
    const { mark, text, n, placement } = resolveStatus(
      this.spec,
      input,
      this.size
    );
    if (!this.engine) {
      if (mark === 'none') {
        return;
      }
      // A status arriving mid-action waits for it (a loop finishes its pass and eases out), then the mark enters. The
      // action's own hand-off (`tail`) doesn't wait: the mark enters now, the action settling under it.
      const wait = waitForAction(this.plain.player, tail);
      if (wait) {
        void wait.then(
          () => this.engine || this.still || this.dead || this.set(this.input)
        );
        return;
      }
      this.startEngine('enter', tail);
      this.repaint();
      return;
    }
    // A different count placement or size is a different drawing: it redraws there, at rest. Not on the way out: a
    // count too wide for inside overhangs, and clearing it leaves no count to place (inside again), but its cut
    // still shrinks away where it is.
    const same =
      `${placement.countAt ?? 'inside'}|${this.size}` === this.engineKey;
    if (!same && mark !== 'none') {
      this.engine.destroy();
      this.engine = null;
      this.startEngine('rest');
      this.repaint();
      return;
    }
    if (same) {
      this.engine.setGeo(geoAt(this.spec, placement, input.tone ?? false));
    }
    this.engine.update(mark, text, n);
  }

  /** A new size is a new drawing: plain or at rest there. */
  setSize(size: number): void {
    if (size === this.size) {
      return;
    }
    this.size = size;
    this.plain.size = size;
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
      this.startEngine('rest');
    }
    this.repaint();
  }

  // ── Actions: the plain icon's, while no status shows ─────────────────────────

  private plainWaiters: (() => void)[] = [];

  get acting(): boolean {
    return !this.engine && !!this.plain.player?.acting;
  }

  /** Plays the plain icon's action; nothing (false) while a status shows or the icon is still. */
  trigger(
    o: { loop?: boolean; onSettle?: (tail: ActionTail) => void } = {}
  ): Promise<boolean> {
    if (this.still || this.engine) {
      return Promise.resolve(false);
    }
    const act = this.plain.spec.action;
    if (!act) {
      return Promise.resolve(false);
    }
    return (this.plain.player ??= act.player(this.plain)).trigger(o);
  }

  stop(): void {
    this.plain.player?.stop();
  }

  idle(): Promise<void> {
    return this.plain.player ? this.plain.player.idle() : Promise.resolve();
  }

  /** Resolves once no status shows (at once if none does): a binding clearing its hand-off status waits here to play. */
  whenPlain(): Promise<void> {
    if (!this.engine) {
      return Promise.resolve();
    }
    const done = new Promise<void>((r) => this.plainWaiters.push(r));
    // A trigger waits for the plain icon: the status hands back at rest even under the pointer (an action blocks the hover).
    this.engine.release();
    return done;
  }

  private flushPlain(): void {
    const w = this.plainWaiters;
    this.plainWaiters = [];
    w.forEach((r) => r());
  }

  /** Destroyed (an element disconnected; it builds a new controller if it comes back): a status still waiting for an action doesn't enter. */
  private dead = false;

  destroy(): void {
    this.dead = true;
    this.engine?.destroy();
    this.plain.destroy();
    this.flushPlain();
  }
}
