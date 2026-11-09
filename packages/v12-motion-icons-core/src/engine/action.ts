/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions: the icon acts as it's designed. An action is
 * a one-shot motion an icon plays when the thing it stands for happens:
 * copied, sent, deleted, a new notification, renewed. It plays once and
 * returns to rest, leaving no state. Hover previews on pointer or focus;
 * a toggle changes the icon; a status is a mark from a process; an action
 * often hands off to one (Copy → success; Renew loops while syncing, then
 * success).
 *
 * The house rules hold through an action: nothing leaves the 36×36 box
 * (2px past the 32 frame on each side; anything flying out is cut as
 * geometry at its edge, no masks or clip paths), lines keep their 2px
 * weight, gaps hold. Timing is Carbon's durations and productive easings,
 * chosen per icon.
 *
 * The geometry is the spec's own: `action.geo` draws the icon at action
 * time `a` (0 → 1 over a pass; rest at both ends) and hover `h`, with the
 * same shape keys as the hover geometry. A periodic action (`cycle`) can
 * loop at a steady speed.
 *
 * This module has only the types, the warning an icon without an action
 * gives when triggered, and `waitForAction` (a status arriving mid-action),
 * so every binding can name them for free. What runs an action (the
 * player, the targets bindings register, `playAction`, `HandOff`) is in
 * actionPlayer.ts, which only icons with an action import: an icon without
 * one carries none of it.
 */
import { DEV, warnOnce } from '../dev';
import type { ActionPlayer, ActionStage } from './actionPlayer';
import { now, type Easing } from './animate';
import type { Shapes } from './shapes';

/** An icon's action as an icon module writes it: one pass of geometry over action time (`defineAction` makes it an ActionSpec). */
export interface ActionInput {
  /** One pass, in seconds. */
  duration: number;
  /** How `a` runs over a pass (default linear: the geometry times its own phases). */
  ease?: Easing;
  /**
   * The drawing at action time `a` (0 → 1, the rest drawing at both ends)
   * and hover `h` (eased to 0 as the action takes over). Same keys as the
   * hover geometry.
   */
  geo: (
    f: { h: number; a: number; entering?: number },
    size?: number
  ) => Shapes;
  /**
   * Periodic geometry (period 1 in `a`, a turn): looping runs at a steady
   * `cycle` seconds a period, easing in and out over half a period. Without
   * it, looping plays whole passes back to back.
   */
  cycle?: number;
  /**
   * `false`: the action does not loop. `loop` (and `until`) play one pass, as a plain trigger
   * does; `until` then hands off when it settles.
   */
  loops?: false;
  /**
   * What the icon acts out, in one or two plain sentences: what moves, and whether it loops or
   * hands off. Shown in the gallery, custom-elements.json and the web components' reference. Leave out
   * timings and curve names (the gallery shows the duration) and how the motion is made.
   */
  description: string;
}

/** An icon's action, with the player that runs it (engine/actionPlayer.ts: only icons with an action carry it). */
export interface ActionSpec extends ActionInput {
  readonly player: (stage: ActionStage) => ActionPlayer;
}

/** A status to show after an action (the hand-off): `for` ms, or until the next trigger. */
export interface ActionThen {
  status: string;
  /** Milliseconds the status shows before it clears (absent: it stays until the next trigger or a status prop). */
  for?: number;
}

/**
 * The rest of an action at its hand-off. The hand-off starts as the action
 * settles (its last half), so the status's mark enters while the icon
 * finishes moving under it: the status layer draws `geo` at action time
 * `at(u)`, u running 0 → 1 over `ms`.
 */
export interface ActionTail {
  geo: ActionInput['geo'];
  ms: number;
  at(u: number): number;
  /** Unique per hand-off (the status layer's cut cache keys on it). */
  readonly id: number;
  /** The engine clock (ms) at the hand-off: a status layer that takes it over later picks it up where it has got to. */
  readonly start: number;
  /** The pointer or focus on the icon at the trigger hasn't left (ActionStage.hoverHeld): the status keeps the hover at rest. */
  readonly held?: boolean;
}

export interface ActionOptions {
  /** Repeat until `stop()` (or `until` settles). */
  loop?: boolean;
  /** Loop until this settles (then `then`, or `failed` if it rejects). */
  until?: PromiseLike<unknown>;
  /** The status the action hands off to. */
  then?: ActionThen;
  /** With `until`: the status when it rejects. */
  failed?: ActionThen;
}

/** What drives an action: a controller (FrameController, StatusController). */
export interface ActionTarget {
  /** Plays the action; resolves true when it ends, false when another trigger or a teardown cut it. */
  trigger(o?: {
    loop?: boolean;
    onSettle?: (tail: ActionTail) => void;
  }): Promise<boolean>;
  /** Ends a loop: the pass in flight finishes (a cycle eases to rest), then the action ends. */
  stop(): void;
  readonly acting: boolean;
  /** Resolves when no action plays (at once if none does). */
  idle(): Promise<void>;
}

/**
 * `trigger()` on an icon without an action: nothing plays (the API is the
 * same on every icon; the code that plays one isn't in this icon's bundle).
 * Warns once per icon in development builds.
 */
export function noAction(name: string | undefined): Promise<void> {
  // One statement, no declarations: esbuild drops it in production (it keeps a block that declares).
  if (DEV) {
    warnOnce(
      `action|${name ?? 'This icon'}`,
      `[motion-icons] ${name ?? 'This icon'} has no action: trigger() plays nothing.`
    );
  }
  return Promise.resolve();
}

/** Whether an action's own hand-off is still finishing: its tail runs under the entering mark. */
export const handingOff = (tail: ActionTail | undefined): boolean =>
  !!tail && now() < tail.start + tail.ms;

/**
 * A status arriving while the plain icon acts waits for the action: it stops
 * (a loop finishes its pass and eases out), and the promise resolves once it
 * is over. Undefined when there is nothing to wait for: no action plays, or
 * this is the action's own hand-off (`tail`), which finishes under the
 * entering mark. Both bindings wait here (the core's StatusController for
 * the web components, React's action kit).
 */
export function waitForAction(
  t: ActionTarget | undefined,
  tail?: ActionTail
): Promise<void> | undefined {
  if (!t?.acting || handingOff(tail)) {
    return undefined;
  }
  t.stop();
  return t.idle();
}

/** How a binding shows a hand-off status (status icons; others ignore it). */
export interface ActionHost {
  /** The motion: absent under reduced motion, `animated` off, or with no action. */
  target?: ActionTarget;
  /** Shows a status (`undefined` clears it). */
  setStatus?(status: string | undefined, tail?: ActionTail): void;
  /** Takes the cancel for the hand-off's clearing timer (`for`), so a teardown can clear it. */
  track?(cancel: () => void): void;
}
