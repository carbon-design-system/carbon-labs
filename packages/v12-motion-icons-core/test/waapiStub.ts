/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Web Animations for the unit tests (jsdom has none): `Element.animate` as
 * the engine's turns (turn.ts) use it, timed on the test's clock (in a
 * browser the document timeline is the engine's clock). Each animation keeps
 * its keyframes, its target and its state, so a test can read what turns,
 * whether it runs, and the angle it has reached (`turnsAt`). Used by the
 * core's, React's and the web components' turn tests.
 */
export interface FakeAnimation {
  target: Element | object;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  playState: 'running' | 'paused' | 'idle';
  startTime: number | null;
  currentTime: number | null;
  pause(): void;
  cancel(): void;
}

export interface Waapi {
  animate: (
    this: Element | object,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ) => FakeAnimation;
  all: FakeAnimation[];
  /** The animations not cancelled. */
  live(target?: Element | object): FakeAnimation[];
  /** An animation's turns at the clock's time (its keyframes' last rotate, times its progress). */
  turnsAt(a: FakeAnimation): number;
  /** Installs it on Element.prototype (jsdom); returns the undo. */
  install(): () => void;
}

export function waapi(time: () => number): Waapi {
  const all: FakeAnimation[] = [];
  const animate: Waapi['animate'] = function (keyframes, options) {
    let start: number | null = time();
    let hold: number | null = null;
    let state: FakeAnimation['playState'] = 'running';
    const a: FakeAnimation = {
      target: this,
      keyframes,
      options,
      get playState() {
        return state;
      },
      get startTime() {
        return state === 'paused' ? null : start;
      },
      set startTime(v) {
        start = v;
        hold = null;
        if (state !== 'idle') {
          state = 'running';
        }
      },
      get currentTime() {
        if (state === 'idle') {
          return null;
        }
        return state === 'paused' ? hold : time() - (start ?? time());
      },
      set currentTime(v) {
        if (state === 'paused') {
          hold = v;
        } else {
          start = time() - (v ?? 0);
        }
      },
      pause() {
        if (state !== 'running') {
          return;
        }
        hold = time() - (start ?? time());
        state = 'paused';
      },
      cancel() {
        state = 'idle';
      },
    };
    all.push(a);
    return a;
  };
  const turnsAt = (a: FakeAnimation) => {
    const last = String(a.keyframes.at(-1)?.transform ?? '');
    const per = Number(/rotate\((-?[\d.]+)turn\)/.exec(last)?.[1] ?? 0);
    return ((a.currentTime ?? 0) / Number(a.options.duration)) * per;
  };
  return {
    animate,
    all,
    live: (target) =>
      all.filter(
        (a) => a.playState !== 'idle' && (!target || a.target === target)
      ),
    turnsAt,
    install() {
      const proto = Element.prototype as unknown as { animate?: unknown };
      const before = proto.animate;
      proto.animate = animate;
      return () => {
        if (before === undefined) {
          delete proto.animate;
        } else {
          proto.animate = before;
        }
      };
    },
  };
}
