/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// After each story renders, Storybook waits on every running animation's
// `finished` (`Promise.all`, no catch). An animation the story then cancels
// (a skeleton wave stopping as its rows arrive) rejects that wait, and the
// rejection surfaces as an unhandled AbortError that no component raised.
// This quiets those, and only those: an AbortError within a moment of a
// running animation's cancel.

/** How long after a cancel its AbortError counts as that cancel's (ms). */
export const CANCEL_WINDOW = 100;

/**
 * An AbortError that a running animation's cancel just caused.
 *
 * @param reason the rejection's reason
 * @param now the time now (ms)
 * @param lastCancel when a running animation was last cancelled (ms)
 */
export function isCancelAbort(
  reason: unknown,
  now: number,
  lastCancel: number
): boolean {
  return (
    typeof DOMException !== 'undefined' &&
    reason instanceof DOMException &&
    reason.name === 'AbortError' &&
    now - lastCancel <= CANCEL_WINDOW
  );
}

/**
 * Installs the guard once on this window.
 *
 * @param win the preview's window
 */
export function quietCancelledAnimationWaits(win: Window = window): void {
  const proto = (win as Window & { Animation?: typeof Animation }).Animation
    ?.prototype;
  const flag = win as Window & { __v12CancelQuiet?: boolean };
  if (!proto || flag.__v12CancelQuiet) {
    return;
  }
  flag.__v12CancelQuiet = true;
  let lastCancel = -Infinity;
  const cancel = proto.cancel;
  proto.cancel = function (this: Animation) {
    if (this.playState === 'running') {
      lastCancel = win.performance.now();
    }
    return cancel.call(this);
  };
  win.addEventListener('unhandledrejection', (e) => {
    if (isCancelAbort(e.reason, win.performance.now(), lastCancel)) {
      e.preventDefault();
    }
  });
}
