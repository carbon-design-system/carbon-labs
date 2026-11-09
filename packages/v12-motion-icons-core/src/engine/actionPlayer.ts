/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The action's player: plays an ActionSpec's passes on a controller's frame
 * (`a`, 0 → 1 a pass), loops and stops them, and hands the icon back to the
 * hover when it ends. A periodic action (`cycle`, Renew) loops as a steady
 * turn instead of whole passes.
 *
 * It travels on the spec (`defineAction` attaches it), not in the
 * controller: FrameController only holds the hooks (whether it's acting,
 * the hover giving way and coming back).
 *
 * `playAction` below is one trigger: the motion, `loop` / `until`, and the
 * hand-off to a status when the host shows one. `HandOff` is what bindings
 * call: one icon's triggers in order (the latest wins).
 */
import type {
  ActionHost,
  ActionInput,
  ActionOptions,
  ActionSpec,
  ActionTail,
  ActionTarget,
} from './action';
import { easeFn, now, type Easing, type Playback } from './animate';
import { animate, onSkipChange, skipping } from './skip';
import { startTurn } from './turn';

/** An icon's action: its geometry and timing, with the player that runs it. */
/* @__NO_SIDE_EFFECTS__ */
export function defineAction(input: ActionInput): ActionSpec {
  const spec: ActionSpec = {
    ...input,
    player: (stage) => new ActionPlayer(spec, stage),
  };
  return spec;
}

/** What the player drives: a controller (FrameController): its frame, its repaint, and its hover. */
export interface ActionStage {
  readonly frame: { a?: number };
  repaint(): void;
  /** The pointer or focus is on the icon. */
  hoverWanted: boolean;
  /**
   * The pointer or focus on the icon at a trigger hasn't left since (cleared when it leaves): the action's end leaves
   * the hover at rest, as a toggle's `holdAfter`. One that arrives during the action gets the hover when it ends.
   */
  hoverHeld: boolean;
  hoverTo(to: 0 | 1): Promise<boolean>;
  /** Off screen: a loop holds where it is (FrameController.setVisible). */
  readonly hidden?: boolean;
  /** The icon's own `<svg>` (from its binding), which a steady cycle turns on the compositor (turn.ts). */
  turnBox?: () => Element | null | undefined;
}

/** A controller an action plays on. */
export interface ActionHolder extends ActionStage {
  player?: ActionPlayer;
  readonly spec: { action?: ActionSpec };
}

/** The player of `ctl`'s action (made on first use), or none when the icon has no action: what bindings trigger. */
export function actionPlayerOf(
  ctl: ActionHolder | undefined
): ActionPlayer | undefined {
  const a = ctl?.spec.action;
  return a && (ctl.player ??= a.player(ctl));
}

/** Quadratic ease-in and ease-out: half a period from rest to a cycle's steady speed, and back (the speed matches). */
const ACCEL = (x: number) => x * x;
const DECEL = (x: number) => 1 - (1 - x) * (1 - x);
/**
 * The settle: the last half of the action's last stretch, where its hand-off begins (the mark entering as it lands),
 * so the success hand-off starts early enough not to feel slow.
 */
export const SETTLE = 1 / 2;
/** A stopped cycle eases out to the next rest at least this far ahead (in periods), so it never stops dead. */
const MIN_RUN_OUT = 0.15;
let tails = 0;

/** One stretch of action time: `a` from → to over `ms`, eased. */
interface Segment {
  from: number;
  to: number;
  ms: number;
  ease: (u: number) => number;
  start: number;
  /** The action's last stretch (its settle is the hand-off). */
  final: boolean;
  kind: 'pass' | 'in' | 'steady' | 'out';
}

export class ActionPlayer implements ActionTarget {
  /** Whether an action is playing. */
  acting = false;
  private anim: Playback | null = null;
  private done?: (done: boolean) => void;
  private looping = false;
  private stopping = false;
  private idlers: (() => void)[] = [];
  private seg?: Segment;
  private onSettle?: (tail: ActionTail) => void;
  /** While acting: skip turning on (skip.ts) ends the action at rest. */
  private unskip?: () => void;

  constructor(
    private readonly act: ActionInput,
    private readonly stage: ActionStage
  ) {}

  /**
   * Play the action once (or, with `loop`, until `stop()`): the hover eases
   * out as it takes over, and stays at rest after it until the pointer or
   * focus leaves and comes back (easing back in reads as the hover replaying
   * on release). A trigger mid-action restarts it. Resolves true when it
   * ends, false when a later trigger or the controller's `destroy()` cut it.
   */
  trigger({
    loop = false,
    onSettle,
  }: {
    loop?: boolean;
    onSettle?: (tail: ActionTail) => void;
  } = {}): Promise<boolean> {
    this.cut();
    this.onSettle = onSettle;
    // The hover gives way: back to rest on its leave timing (the action draws with it as it goes).
    const s = this.stage;
    const wanted = s.hoverWanted;
    void s.hoverTo(0);
    s.hoverWanted = wanted;
    // A pointer or focus already here is held at rest after the action until it leaves (hoverTo(0) clears it).
    s.hoverHeld = wanted;
    this.acting = true;
    // An action that does not loop (`loops: false`) plays one pass whatever `loop` says.
    this.looping = loop && this.act.loops !== false;
    this.stopping = false;
    this.stage.frame.a = 0;
    const done = new Promise<boolean>((r) => (this.done = r));
    this.unskip = onSkipChange(() => skipping() && this.skipToEnd());
    this.pass(true);
    return done;
  }

  /**
   * Ends a loop. Whole passes: the pass in flight finishes. A cycle (turning
   * at a steady speed): it eases out from where it is to the next rest (at
   * least MIN_RUN_OUT of a period ahead), its speed matched, so it lands
   * soon; one still easing in reaches its speed first.
   */
  stop(): void {
    if (!this.acting || this.stopping) {
      return;
    }
    this.stopping = true;
    // Held off screen: it finishes from where it is (its hand-off shouldn't wait to be seen).
    this.anim?.resume?.();
    if (this.looping && this.act.cycle && this.seg?.kind === 'steady') {
      this.anim?.stop();
      this.runOut();
    }
  }

  /** The rest of the action from now, for the status layer to finish under its mark (the hand-off). */
  tail(): ActionTail {
    const s = this.seg!;
    const u0 = Math.min(1, Math.max(0, (now() - s.start) / s.ms));
    return {
      geo: this.act.geo,
      ms: (1 - u0) * s.ms,
      at: (u) => s.from + (s.to - s.from) * s.ease(u0 + (1 - u0) * u),
      id: ++tails,
      start: now(),
      held: this.stage.hoverHeld,
    };
  }

  /** Resolves when no action plays (at once if none does). */
  idle(): Promise<void> {
    if (!this.acting) {
      return Promise.resolve();
    }
    return new Promise((r) => this.idlers.push(r));
  }

  /** The stage went on or off screen: a loop holds where it is while it can't be seen, and carries on from there. */
  visibility(): void {
    if (this.stage.hidden && this.looping && !this.stopping) {
      this.anim?.pause?.();
    } else {
      this.anim?.resume?.();
    }
  }

  /** Cuts an action in flight (a new trigger, destroy): its promise resolves false. */
  cut(): void {
    if (!this.acting) {
      return;
    }
    this.anim?.stop();
    this.end(false);
  }

  /** A stretch of action time; its settle (on the last stretch) starts the hand-off. */
  private go(
    kind: Segment['kind'],
    from: number,
    to: number,
    seconds: number,
    ease: Easing,
    final: boolean,
    then: () => void
  ): void {
    const stage = this.stage;
    const seg: Segment = {
      from,
      to,
      ms: seconds * 1000,
      ease: easeFn(ease),
      start: now(),
      final,
      kind,
    };
    this.seg = seg;
    this.anim = animate(from, to, {
      duration: seconds,
      ease,
      onUpdate: (v) => {
        stage.frame.a = v;
        stage.repaint();
        if (
          (seg.final || (this.stopping && seg.kind === 'pass')) &&
          this.onSettle &&
          now() - seg.start >= SETTLE * seg.ms
        ) {
          const settle = this.onSettle;
          this.onSettle = undefined;
          settle(this.tail());
        }
      },
      onComplete: then,
    });
    if (stage.hidden && this.looping && !this.stopping) {
      this.anim.pause?.();
    }
  }

  /**
   * Skip turned on mid-action: it jumps to its end, at rest; a hand-off waiting on the settle gets the action's tail
   * with nothing left of it, so its status applies at once.
   */
  private skipToEnd(): void {
    const settle = this.onSettle;
    this.onSettle = undefined;
    const tail = this.seg ? { ...this.tail(), ms: 0 } : undefined;
    this.anim?.stop();
    this.anim = null;
    if (settle && tail) {
      settle(tail);
    }
    this.end(true);
  }

  /** A stopped cycle: ease out from here to the next rest, the speed matched (a quadratic ease-out covers D in 2D / v). */
  private runOut(): void {
    const c = this.act.cycle!;
    const a = this.stage.frame.a ?? 0;
    const to = Math.ceil(a + MIN_RUN_OUT);
    this.go('out', a, to, 2 * (to - a) * c, DECEL, true, () => this.end(true));
  }

  /** The next stretch of action time: a whole pass, or, for a looping cycle, its ease-in (`first`) and then steady turns. */
  private pass(first: boolean): void {
    const act = this.act;
    // Under skip a loop doesn't loop: one pass, which lands at once (skip.ts), then the end.
    if (skipping()) {
      this.looping = false;
    }
    if (this.looping && act.cycle) {
      // A periodic action looping: ease in over half a period, turn at a steady speed; stop() eases it out.
      const c = act.cycle;
      if (first) {
        return this.go('in', 0, 0.5, c, ACCEL, false, () =>
          this.stopping ? this.runOut() : this.pass(false)
        );
      }
      const a0 = this.stage.frame.a ?? 0;
      if (this.turn(a0, c)) {
        return;
      }
      return this.go('steady', a0, a0 + 1, c, 'linear', false, () =>
        this.pass(false)
      );
    }
    this.stage.frame.a = 0;
    this.go(
      'pass',
      0,
      1,
      act.duration,
      act.ease ?? 'linear',
      !this.looping,
      () => (this.looping && !this.stopping ? this.pass(false) : this.end(true))
    );
  }

  /**
   * The steady stretch on the compositor (turn.ts): the drawing holds at `a0`
   * and the browser turns the icon's svg, half a turn (`a` + 1) a period,
   * anticlockwise, from now, until it is stopped (`stop()`, a cut). Stopped,
   * the `a` it reached is drawn in the same task, so the run-out starts there
   * at the same speed. False where the browser can't turn it (no svg, no Web
   * Animations): the steady stretch runs on the engine's frames.
   */
  private turn(a0: number, c: number): boolean {
    const stage = this.stage;
    const t0 = now();
    const turn = startTurn(stage.turnBox?.(), [0, 0], -2 * c * 1000, t0);
    if (!turn) {
      return false;
    }
    stage.frame.a = a0;
    stage.repaint();
    this.seg = {
      from: a0,
      to: a0 + 1,
      ms: c * 1000,
      ease: (u) => u,
      start: t0,
      final: false,
      kind: 'steady',
    };
    this.anim = {
      stop: () => {
        turn.stop();
        stage.frame.a = a0 + 2 * turn.turns(now());
        stage.repaint();
      },
      pause: () => turn.pause(now()),
      resume: () => turn.resume(now()),
    };
    if (stage.hidden) {
      this.anim.pause!();
    }
    return true;
  }

  /** The action is over (or cut): rest; the hover back only for a pointer or focus that left and came back meanwhile. */
  private end(done: boolean): void {
    if (!this.acting) {
      return;
    }
    this.acting = false;
    this.unskip?.();
    this.unskip = undefined;
    this.looping = false;
    this.stopping = false;
    this.anim = null;
    this.seg = undefined;
    this.onSettle = undefined;
    this.stage.frame.a = 0;
    const r = this.done;
    this.done = undefined;
    const idlers = this.idlers;
    this.idlers = [];
    idlers.forEach((i) => i());
    if (done) {
      this.stage.repaint();
      if (this.stage.hoverWanted && !this.stage.hoverHeld) {
        void this.stage.hoverTo(1);
      }
    }
    r?.(done);
  }
}

// ── Bindings: the targets they register, and one trigger start to hand-off ──

const targets = new WeakMap<Element, ActionTarget>();

/** A binding registers the controller drawing `el` (a React adapter's svg, or an element). */
export function registerActionTarget(
  el: Element,
  target: ActionTarget | null
): void {
  if (target) {
    targets.set(el, target);
  } else {
    targets.delete(el);
  }
}

/** The controller drawing `el`, while it animates (none while a still drawing shows). */
export function actionTarget(
  el: Element | null | undefined
): ActionTarget | undefined {
  return el ? targets.get(el) : undefined;
}

/**
 * One trigger, start to hand-off: plays the action (looping while `loop`, or
 * until `until` settles), then shows `then` (or `failed`) for `for` ms. A
 * host with no `setStatus` (a hover icon) just plays the motion.
 *
 * The hand-off starts as the action settles (its last half: SETTLE), not
 * after it: the status layer takes the rest of the motion (the tail) and
 * finishes it under the entering mark, so the status follows the action
 * without a pause. With no motion (reduced motion, still drawings) nothing
 * plays and the status applies as soon as there is one to apply. Resolves
 * when the motion is over or handed off (not when the status clears). A
 * later trigger cuts this one: its status isn't applied.
 */
export async function playAction(
  host: ActionHost,
  o: ActionOptions = {},
  isCurrent: () => boolean = () => true
): Promise<void> {
  const loop = o.loop ?? !!o.until;
  const outcome = { failed: false, settled: !o.until };
  const settled = o.until
    ? Promise.resolve(o.until).then(
        () => {
          outcome.settled = true;
        },
        () => {
          outcome.failed = true;
          outcome.settled = true;
        }
      )
    : undefined;
  let handed = false;
  const handOff = (tail?: ActionTail) => {
    if (handed || !isCurrent()) {
      return;
    }
    const next = outcome.failed ? o.failed : o.then;
    if (!next || !host.setStatus) {
      return;
    }
    handed = true;
    const set = host.setStatus;
    set(next.status, tail);
    // Cleared after `for`, unless a later trigger has taken over (it clears or sets its own).
    if (next.for !== undefined) {
      const timer = setTimeout(() => isCurrent() && set(undefined), next.for);
      host.track?.(() => clearTimeout(timer));
    }
  };
  // Under skip nothing plays (the action is at its end, at rest) and the status applies at once, as with no motion.
  const t = skipping() ? undefined : host.target;
  if (t) {
    // Early only when the outcome is known (a loop stopped by hand while `until` is pending hands off after it settles).
    const early = !!host.setStatus && !!(o.then || o.failed);
    const run = t.trigger({
      loop,
      ...(early && {
        onSettle: (tail: ActionTail) => outcome.settled && handOff(tail),
      }),
    });
    if (settled) {
      void settled.then(() => isCurrent() && t.acting && t.stop());
    }
    const done = await run;
    if (handed || !done) {
      return;
    }
    if (settled) {
      await settled;
    }
  } else if (settled) {
    await settled;
  }
  handOff();
}

/** What a binding gives its HandOff: the icon's action and, on a status icon, how it shows the hand-off status. */
export interface HandOffHost {
  /** The controller playing the action, while the icon moves (none while a status shows, under reduced motion, or still). */
  target(): ActionTarget | undefined;
  /** Status icons: shows the hand-off status (`undefined` clears it), with the action's tail. Absent: the motion only. */
  setStatus?(status: string | undefined, tail?: ActionTail): void;
  /** Status icons: whether the last hand-off's status still shows (no author status over it). */
  handedOff?(): boolean;
  /** Status icons: clears that status, and resolves once the plain icon is back (it hands back at rest even under the pointer: an action blocks the hover). */
  release?(): Promise<void> | undefined;
}

/**
 * One icon's triggers, in order, for both bindings (the web components'
 * ActionDriver, React's action kit): each trigger is `playAction` with its
 * hand-off, and the latest one wins. A later trigger (or `cancel()`) makes an
 * earlier one's hand-off stale and cancels its clearing timer (`for`). A
 * trigger while its own hand-off status still shows clears it first, and
 * plays once the plain icon is back. (The other half of the sequencing, a
 * status arriving mid-action, is `waitForAction`.)
 */
export class HandOff {
  private id = 0;
  /** The cancels of the hand-off's clearing timers in flight. */
  private timers: (() => void)[] = [];

  constructor(private readonly host: HandOffHost) {}

  /** Plays the action and hands off (see `playAction`). `ready`: what to wait for first (an element not yet painted). */
  async trigger(
    o: ActionOptions = {},
    ready?: Promise<unknown>
  ): Promise<void> {
    const id = ++this.id;
    this.clearTimers();
    const h = this.host;
    if (ready) {
      await ready;
    }
    // Its own hand-off status still showing clears first: the action plays once the plain icon is back.
    if (h.handedOff?.()) {
      await h.release?.();
    }
    if (id !== this.id) {
      return;
    }
    // Starts in this task when nothing was waited for (the same frame in both bindings).
    await playAction(
      {
        target: h.target(),
        setStatus: h.setStatus,
        track: (cancel) => this.timers.push(cancel),
      },
      o,
      () => id === this.id
    );
  }

  /** The clearing timers in flight go; returns whether there were any (the status they would have cleared is the binding's to drop). */
  clearTimers(): boolean {
    const had = this.timers.length > 0;
    this.timers.splice(0).forEach((cancel) => cancel());
    return had;
  }

  /** Nothing in flight stays current (a disconnected element): no hand-off is applied, and the clearing timers go. */
  cancel(): void {
    this.id++;
    this.clearTimers();
  }
}
