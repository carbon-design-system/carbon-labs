/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The engine keeps the clock; the browser turns. A turn is a rigid rotation
 * the browser runs on its compositor (a Web Animation of `transform:
 * rotate()` on a CSS box: an `<svg>`), so it keeps moving while the page's
 * main thread is busy. It starts at engine time `t0` on the document
 * timeline, which in a browser is the engine's clock (`performance.now()`),
 * so at any time its angle is the one the engine's own frames would draw.
 * When the engine takes over again (a loop stopping, the spinner's turn
 * ending, a teardown), `turns()` says how far it got: the animation's
 * current time, read on the engine's clock (the one its next frames are
 * drawn on; `anim.currentTime` agrees within a few ms, even at the end of a
 * long task), and the engine draws there in the same task: no jump.
 *
 * Used by Renew's steady loop (both bindings: the icon's own svg) and the
 * pending spinner (the web components: an svg layer over the icon).
 */
export interface Turn {
  /** Whole turns since `t0`, at engine time `t` (time held off screen excluded). */
  turns(t: number): number;
  /** Off screen: hold where it is (at engine time `t`). */
  pause(t: number): void;
  resume(t: number): void;
  /** Cancels it: the box draws untransformed again. */
  stop(): void;
}

/**
 * Turns `el` a turn every `ms` (negative: anticlockwise) from engine time
 * `t0`, about a point `[dx, dy]` px from its box's centre. Undefined where the
 * browser can't (no element, no Web Animations): the engine keeps its frames.
 */
export function startTurn(
  el: Element | null | undefined,
  [dx, dy]: readonly [number, number],
  ms: number,
  t0: number
): Turn | undefined {
  if (!el || typeof (el as HTMLElement).animate !== 'function') {
    return undefined;
  }
  const at = (turn: number) => ({
    transform: `translate(${dx}px, ${dy}px) rotate(${turn}turn) translate(${-dx}px, ${-dy}px)`,
  });
  const period = Math.abs(ms);
  const anim = (el as HTMLElement).animate([at(0), at(Math.sign(ms) || 1)], {
    duration: period,
    iterations: Infinity,
  });
  anim.startTime = t0;
  /** Time held off screen, and since when (while held). */
  let held = 0;
  let since: number | undefined;
  const elapsed = (t: number) => (since ?? t) - t0 - held;
  return {
    // On the engine's clock, not `anim.currentTime`: the engine's next frame (a run-out, the arc's exit) is drawn on
    // this clock, so the angle read here is the one that frame continues from, with no step. `currentTime` (the
    // document timeline's) agreed within 0–4ms even at the end of a 400ms task (Chrome, WebKit), so the
    // two read the same; this one also works on a test's clock.
    turns: (t) => elapsed(t) / period,
    pause(t) {
      if (since !== undefined) {
        return;
      }
      since = t;
      anim.pause();
      anim.currentTime = elapsed(t);
    },
    resume(t) {
      if (since === undefined) {
        return;
      }
      held += t - since;
      since = undefined;
      anim.startTime = t0 + held;
    },
    stop: () => anim.cancel(),
  };
}
