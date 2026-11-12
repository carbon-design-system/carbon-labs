/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * jsdom has no Web Animations: the triggers' rollover and the menu's snap
 * call `element.animate`, the busy spinner reads `document.timeline`.
 * Stand-ins that finish at once, for the tests' lifetime.
 */
export function stubAnimate() {
  const proto = Element.prototype as unknown as Record<string, unknown>;
  const had = 'animate' in proto;
  const doc = document as unknown as Record<string, unknown>;
  const hadTimeline = 'timeline' in doc;
  beforeAll(() => {
    if (!hadTimeline) {
      Object.defineProperty(doc, 'timeline', {
        configurable: true,
        value: {
          get currentTime() {
            return performance.now();
          },
        },
      });
    }
    if (had) {
      return;
    }
    proto.animate = function animate() {
      const done = Promise.resolve();
      const anim: Record<string, unknown> & {
        onfinish: null | (() => void);
      } = {
        playState: 'finished',
        currentTime: 0,
        effect: null,
        onfinish: null,
        oncancel: null,
        finished: done.then(() => anim),
        ready: done.then(() => anim),
        cancel() {},
        finish() {},
        play() {},
        pause() {},
        reverse() {},
        commitStyles() {},
        persist() {},
        updatePlaybackRate() {},
        addEventListener(type: string, fn: () => void) {
          if (type === 'finish') {
            queueMicrotask(fn);
          }
        },
        removeEventListener() {},
      };
      queueMicrotask(() => anim.onfinish?.());
      return anim;
    };
  });
  afterAll(() => {
    if (!hadTimeline) {
      delete doc.timeline;
    }
    if (!had) {
      delete proto.animate;
    }
  });
}
