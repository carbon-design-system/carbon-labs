/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The frame sampler, injected into the story's frame. Each animation frame
// it records the tracked elements' boxes (what shows of them: less an
// `inset()` clip), their opacity (with their ancestors'), transform,
// clip-path and mask, the scroll position, and the frame's time. It also takes the browser's long animation frames (or long
// tasks) while it runs. Actions queued with `act` run at the top of a
// frame, before that frame is read, so a mark's frame is the first that
// shows the change.

/**
 * Installs `window.__sampler` in the page. Runs in the browser: it must not
 * close over anything.
 */
export function installSampler() {
  if (window.__sampler) {
    return;
  }
  const state = {
    on: false,
    track: {},
    scroller: null,
    samples: [],
    marks: [],
    longFrames: [],
    queue: [],
    t0: 0,
    last: 0,
    observer: null,
  };

  /** The viewport, as a box. */
  const VIEWPORT = { viewport: true };

  /**
   * The element a track names: a selector, `viewport`, or `{ sel, nth,
   * shown, closest, holdTop }` (`shown`: the first match with a box and
   * opacity).
   */
  const find = (spec) => {
    if (!spec) {
      return null;
    }
    if (spec === 'viewport') {
      return VIEWPORT;
    }
    if (typeof spec === 'string') {
      return document.querySelector(spec);
    }
    let all = [...document.querySelectorAll(spec.sel)];
    if (spec.shown) {
      all = all.filter((e) => {
        const b = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return (
          b.width > 0 &&
          b.height > 0 &&
          s.visibility !== 'hidden' &&
          parseFloat(s.opacity) > 0
        );
      });
    }
    let el = all[spec.nth ?? 0] ?? null;
    if (el && spec.closest) {
      el = el.closest(spec.closest);
    }
    return el;
  };

  const r2 = (n) => Math.round(n * 100) / 100;

  /** One element's state, or null when it is not in the page. */
  const read = (el) => {
    if (el === VIEWPORT) {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      return {
        left: 0,
        top: 0,
        right: w,
        bottom: h,
        width: w,
        height: h,
        opacity: 1,
        transform: '',
        clip: '',
        mask: '',
        maskedBy: '',
      };
    }
    if (!el || !el.isConnected) {
      return null;
    }
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    let opacity = cs.visibility === 'hidden' ? 0 : 1;
    let maskedBy = '';
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = n === el ? cs : getComputedStyle(n);
      opacity *= parseFloat(s.opacity) || 0;
      if (!maskedBy && n !== el) {
        const m = s.maskImage || s.webkitMaskImage;
        if (m && m !== 'none') {
          maskedBy = n.className
            ? String(n.className).split(' ')[0]
            : n.tagName;
        }
      }
    }
    // What shows: the box less an `inset()` clip-path, as a collapse or a
    // reveal draws it.
    let { left, top, right, bottom } = b;
    const inset = /^inset\(([^)]*?)(?:\s+round[^)]*)?\)$/.exec(cs.clipPath);
    if (inset) {
      const v = inset[1].trim().split(/\s+/);
      const len = (x, of) =>
        x.endsWith('%') ? (parseFloat(x) / 100) * of : parseFloat(x) || 0;
      const [t = '0', r = t, bb = t, l = r] = v;
      top += len(t, b.height);
      right -= len(r, b.width);
      bottom -= len(bb, b.height);
      left += len(l, b.width);
      right = Math.max(left, right);
      bottom = Math.max(top, bottom);
    }
    return {
      left: r2(left),
      top: r2(top),
      right: r2(right),
      bottom: r2(bottom),
      width: r2(right - left),
      height: r2(bottom - top),
      opacity: Math.round(opacity * 1000) / 1000,
      transform: cs.transform === 'none' ? '' : cs.transform,
      clip: cs.clipPath === 'none' ? '' : cs.clipPath,
      mask:
        (cs.maskImage || cs.webkitMaskImage || 'none') === 'none' ? '' : 'mask',
      maskedBy,
    };
  };

  const scrollOf = () => {
    const s = state.scroller ? find(state.scroller) : null;
    if (s) {
      return { x: r2(s.scrollLeft), y: r2(s.scrollTop) };
    }
    return { x: r2(window.scrollX), y: r2(window.scrollY) };
  };

  const tick = (now) => {
    if (!state.on) {
      return;
    }
    const due = state.queue.splice(0);
    for (const { name, fn } of due) {
      state.marks.push({
        name,
        frame: state.samples.length,
        t: r2(now - state.t0),
      });
      try {
        fn();
      } catch (e) {
        state.marks[state.marks.length - 1].error = String(e);
      }
    }
    const el = {};
    for (const [name, spec] of Object.entries(state.track)) {
      const box = read(find(spec));
      // `holdTop`: the part of a box below where its top is with the
      // page at the top, as the line a docked element sticks under (a
      // workspace that scrolls with the page, its frame's edge holding).
      if (box && spec.holdTop) {
        const line = r2(box.top + window.scrollY);
        if (box.top < line) {
          box.top = line;
          box.height = r2(Math.max(0, box.bottom - box.top));
        }
      }
      el[name] = box;
    }
    state.samples.push({
      t: r2(now - state.t0),
      at: r2(now),
      wall: r2(performance.timeOrigin + now),
      dt: state.samples.length ? r2(now - state.last) : 0,
      scroll: scrollOf(),
      el,
    });
    state.last = now;
    requestAnimationFrame(tick);
  };

  window.__sampler = {
    /** Starts sampling `track` ({ name: selector }); `scroller` is a selector or null for the window. */
    start(track, scroller = null) {
      Object.assign(state, {
        on: true,
        track,
        scroller,
        samples: [],
        marks: [],
        longFrames: [],
        queue: [],
      });
      const types = PerformanceObserver.supportedEntryTypes ?? [];
      const type = types.includes('long-animation-frame')
        ? 'long-animation-frame'
        : types.includes('longtask')
          ? 'longtask'
          : null;
      state.longType = type;
      if (type) {
        state.observer = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            state.longFrames.push({
              start: r2(e.startTime),
              duration: r2(e.duration),
              blocking:
                e.blockingDuration != null ? r2(e.blockingDuration) : null,
            });
          }
        });
        state.observer.observe({ type, buffered: false });
      }
      requestAnimationFrame((now) => {
        state.t0 = now;
        state.last = now;
        tick(now);
      });
    },
    /** Runs `fn` at the top of the next frame, marking it `name`. */
    act(name, fn) {
      return new Promise((resolve) => {
        state.queue.push({
          name,
          fn: () => {
            fn?.();
            resolve(state.samples.length);
          },
        });
      });
    },
    /** Marks the next frame `name`, for an action the browser's input runs. */
    mark(name) {
      return this.act(name, null);
    },
    /** Waits until no tracked value has changed for `quiet` frames, then dates the last mark's end. */
    settle(quiet = 12, timeout = 4000) {
      const key = (s) => JSON.stringify([s.el, s.scroll]);
      const startAt = performance.now();
      return new Promise((resolve) => {
        const check = () => {
          const s = state.samples;
          const n = s.length;
          const mark = state.marks[state.marks.length - 1];
          let lastChange = mark ? mark.frame : 0;
          for (let i = Math.max(1, lastChange + 1); i < n; i++) {
            if (key(s[i]) !== key(s[i - 1])) {
              lastChange = i;
            }
          }
          const done = n - 1 - lastChange >= quiet;
          if (done || performance.now() - startAt > timeout) {
            if (mark) {
              mark.end = lastChange;
              mark.settled = done;
            }
            resolve(done);
            return;
          }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
    },
    /** How long the last action named `name` took to settle, ms, or null. */
    clock(name) {
      const m = [...state.marks].reverse().find((x) => x.name === name);
      if (!m || m.end == null || !state.samples[m.end]) {
        return null;
      }
      return state.samples[m.end].t - state.samples[m.frame].t;
    },
    /** Stops, and returns the run. */
    stop() {
      state.on = false;
      state.observer?.disconnect();
      return {
        samples: state.samples,
        marks: state.marks,
        longFrames: state.longType ? state.longFrames : null,
        longType: state.longType,
      };
    },
    /** The current box of a track (for the runner's own aiming). */
    box(name) {
      return read(find(state.track[name]));
    },
  };
}
