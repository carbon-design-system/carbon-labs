/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A state that loops while it shows (Microphone ⇄ voice mode: the bars
 * listening). The frame's `l` runs on by 1 every `cycle` seconds, round and
 * round (the geometry is periodic in it, so the loop is seamless), and `w`,
 * the loop's weight, eases 0 → 1 (over `ramp`, by default half a cycle: LOOP_IN) after the
 * change into the state (`delay`), and back to 0 in 120ms (TOGGLE_OUT) when
 * the state is left; at `w` 0 the state draws its still pose.
 *
 * It travels on the spec (`defineLoop`), not in the controller, so only an
 * icon with a loop carries it: FrameController only says when the state
 * shows, whether the icon moves (`setMoving`: not under reduced motion, not
 * drawn still) and whether it is on screen (`setVisible`: off screen it holds
 * where it is). The loop reshapes the drawing, so it runs on the engine's
 * frames (not a compositor turn, turn.ts).
 */
import { easeFn, type Playback } from './animate';
import { animate, onSkipChange, skipping } from './skip';
import { LOOP_IN, TOGGLE_OUT } from './timing';
import type { TweenFn } from './frame';

export interface LoopInput {
  /** Seconds a cycle of `l`. */
  cycle: number;
  /** Seconds the weight waits after a change into the state (the change's own length) before it eases in. */
  delay?: number;
  /** Seconds the weight takes to ease in (default half a cycle, LOOP_IN). */
  ramp?: number;
}

/** A loop, with the runner that plays it (only icons with a loop carry it). */
export interface LoopSpec extends LoopInput {
  readonly runner: (stage: LoopStage) => LoopRunner;
}

/** What a loop plays on: a controller (FrameController). */
export interface LoopStage {
  readonly frame: { l?: number; w?: number };
  repaint(): void;
  tween: TweenFn;
  readonly hidden?: boolean;
}

/* @__NO_SIDE_EFFECTS__ */
export function defineLoop(input: LoopInput): LoopSpec {
  const spec: LoopSpec = {
    ...input,
    runner: (stage) => new LoopRunner(spec, stage),
  };
  return spec;
}

export class LoopRunner {
  private anims: Playback[] = [];
  private on = false;
  /** While looping: skip turning on or off (skip.ts) stops the loop at its still pose, or starts it again. */
  private unskip?: () => void;

  constructor(
    private readonly loop: LoopInput,
    private readonly stage: LoopStage
  ) {}

  /** Loop (`on`) or stop: `animated` false drops the weight at once; `change`: the weight waits for the change (`delay`). */
  set(on: boolean, animated: boolean, change: boolean): void {
    if (on === this.on) {
      return;
    }
    this.on = on;
    this.stop();
    const { frame } = this.stage;
    if (!on) {
      // `l` holds where it is; the weight eases out alongside the change, or drops at once.
      if (animated) {
        this.anims = [this.stage.tween('w', 0, TOGGLE_OUT)];
      } else {
        frame.w = 0;
        this.stage.repaint();
      }
      return;
    }
    this.unskip = onSkipChange(() => {
      this.halt();
      this.start(false);
    });
    this.start(change);
  }

  /** The loop from where it is; under skip it doesn't loop: the state's still pose (weight 0), at once. */
  private start(change: boolean): void {
    const { frame } = this.stage;
    if (skipping()) {
      frame.w = 0;
      this.stage.repaint();
      return;
    }
    const wait = change ? (this.loop.delay ?? 0) : 0;
    const ramp = this.loop.ramp ?? this.loop.cycle * LOOP_IN.share;
    const k = wait / (wait + ramp);
    const ease = easeFn(LOOP_IN.ease);
    // The weight first, so the frame `l` paints has this frame's weight. `l` carries on from where it was.
    const l = frame.l ?? 0;
    this.anims = [
      animate(frame.w ?? 0, 1, {
        duration: wait + ramp,
        ease: (u) => (u <= k ? 0 : ease((u - k) / (1 - k))),
        onUpdate: (v) => (frame.w = v),
      }),
      animate(l, l + 1, {
        duration: this.loop.cycle,
        repeat: Infinity,
        onUpdate: (v) => {
          frame.l = v;
          this.stage.repaint();
        },
      }),
    ];
    this.visibility();
  }

  /** Off screen it holds where it is, and carries on from there. */
  visibility(): void {
    this.anims.forEach((a) => (this.stage.hidden ? a.pause?.() : a.resume?.()));
  }

  /** Everything in flight stops (a teardown, or before the next start). */
  stop(): void {
    this.unskip?.();
    this.unskip = undefined;
    this.halt();
  }

  private halt(): void {
    this.anims.forEach((a) => a.stop());
    this.anims = [];
  }
}
