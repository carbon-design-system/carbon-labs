/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Loops nobody can see hold still.
 *
 * A loader's infinite loops (a spinner's turn, an indeterminate bar, the
 * processing dots, a shimmer's pass, a skeleton's pulse) pause while their
 * element is off screen, under a closed (`display: none`) ancestor, or the
 * page is hidden, and play again when it comes back. One IntersectionObserver
 * and one `visibilitychange` listener serve every element.
 *
 * Only infinite animations that are running are held, so an element's
 * entrances and exits finish as they would. Each loop is put back on the
 * start time it had (the loaders lock their loops to the document timeline),
 * so it comes back on the phase it would have had if it had never stopped:
 * neighbours stay in step, and nothing restarts visibly. A loop the
 * component changes while it is held (a new start time, a seek, a cancel)
 * is the component's again and is left alone.
 */

interface Held {
  anim: Animation;
  startTime: CSSNumberish | null;
  /** Where the pause left it (undefined until the pause has taken). */
  currentTime: CSSNumberish | null | undefined;
}

interface Entry {
  /** On screen (the observer's last word; true until it has spoken). */
  seen: boolean;
  held: Held[];
  /** Whether it is hidden at the last apply (so a return can be told to the component). */
  wasHidden: boolean;
  /** Told when it comes back (`onShow`). */
  shown: Set<() => void>;
}

const entries = new Map<Element, Entry>();
let io: IntersectionObserver | null = null;
let listening = false;
/** Loops a component stopped itself while held, by any watcher: never played again here. */
const released = new WeakSet<Animation>();

// New blocks under a held root (a skeleton's) start loops that are held too: one observer serves
// every held root, and one timer rechecks the roots its records fall under.
const OBSERVE: MutationObserverInit = { childList: true, subtree: true };
const observed = new Set<Element>();
const touched = new Set<Node>();
let mo: MutationObserver | null = null;
let recheck: ReturnType<typeof setTimeout> | null = null;
let rebuild = false;

function onMutations(records: MutationRecord[]) {
  for (const r of records) {
    touched.add(r.target);
  }
  if (recheck || !touched.size) {
    return;
  }
  // After the observers that start the new loops (they run in the same checkpoint).
  recheck = setTimeout(() => {
    recheck = null;
    const roots = new Set<Element>();
    touched.forEach((n) => {
      for (let x: Node | null = n; x; x = x.parentNode) {
        if (observed.has(x as Element)) {
          roots.add(x as Element);
        }
      }
    });
    touched.clear();
    roots.forEach((el) => {
      const e = entries.get(el);
      if (e && hidden(e)) {
        hold(el, e);
      }
    });
  }, 0);
}

function observe(el: Element) {
  if (observed.has(el) || typeof MutationObserver !== 'function') {
    return;
  }
  observed.add(el);
  mo ??= new MutationObserver(onMutations);
  mo.observe(el, OBSERVE);
}

function unobserve(el: Element) {
  if (!observed.delete(el) || rebuild) {
    return;
  }
  // An observer can't drop one target: once per batch of releases, it takes its queue and re-observes the rest.
  rebuild = true;
  queueMicrotask(() => {
    rebuild = false;
    if (!mo) {
      return;
    }
    onMutations(mo.takeRecords());
    mo.disconnect();
    if (observed.size) {
      observed.forEach((r) => mo!.observe(r, OBSERVE));
    } else {
      mo = null;
      if (recheck) {
        clearTimeout(recheck);
      }
      recheck = null;
      touched.clear();
    }
  });
}

const pageHidden = () =>
  typeof document !== 'undefined' && document.visibilityState === 'hidden';

const isLoop = (a: Animation) => {
  const it = a.effect?.getTiming().iterations;
  return it === Infinity;
};

function hold(el: Element, e: Entry) {
  // Loops the component has since dropped (cancelled) are gone; those it re-timed (a start time set
  // un-pauses a loop) run again, and are held anew below on their new start time.
  e.held = e.held.filter((h) => h.anim.playState === 'paused');
  const held = new Set(e.held.map((h) => h.anim));
  for (const anim of el.getAnimations({ subtree: true })) {
    if (held.has(anim) || anim.playState !== 'running' || !isLoop(anim)) {
      continue;
    }
    const startTime = anim.startTime;
    // Running again (the component restarted it): a stop it made before is history.
    released.delete(anim);
    anim.pause();
    // Where it holds: known once the pause has taken (a pause is pending until the next frame).
    const h: Held = { anim, startTime, currentTime: undefined };
    e.held.push(h);
    void anim.ready.then(
      () => {
        if (h.currentTime === undefined) {
          h.currentTime = anim.currentTime;
        }
      },
      () => {}
    );
  }
  observe(el);
}

function release(el: Element, e: Entry) {
  unobserve(el);
  const held = e.held;
  e.held = [];
  for (const { anim, startTime, currentTime } of held) {
    // Changed while held (the component re-timed, sought, stopped or dropped it): it isn't ours to play.
    if (
      released.has(anim) ||
      anim.playState !== 'paused' ||
      (currentTime !== undefined && anim.currentTime !== currentTime)
    ) {
      continue;
    }
    // Back on its own clock: the phase it would have had, never a restart.
    if (startTime !== null) {
      anim.startTime = startTime;
    } else {
      anim.play();
    }
  }
}

const hidden = (e: Entry) => pageHidden() || !e.seen;

function apply(el: Element, e: Entry) {
  const now = hidden(e);
  if (now) {
    hold(el, e);
  } else if (e.held.length || observed.has(el)) {
    release(el, e);
  }
  const back = e.wasHidden && !now;
  e.wasHidden = now;
  if (back) {
    e.shown.forEach((f) => f());
  }
}

function onVisibility() {
  entries.forEach((e, el) => apply(el, e));
}

function observer(): IntersectionObserver | null {
  if (io || typeof IntersectionObserver !== 'function') {
    return io;
  }
  io = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        const e = entries.get(r.target);
        if (!e) {
          continue;
        }
        e.seen = r.isIntersecting;
        apply(r.target, e);
      }
    },
    // A little early, so a loop is back on its phase before its first visible frame.
    { rootMargin: '64px' }
  );
  return io;
}

function watch(el: Element, shown: Set<() => void>): Entry {
  const e: Entry = { seen: true, held: [], wasHidden: false, shown };
  entries.set(el, e);
  observer()?.observe(el);
  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
    listening = true;
  }
  if (pageHidden()) {
    hold(el, e);
    e.wasHidden = true;
  }
  return e;
}

function unwatch(el: Element, e: Entry) {
  release(el, e);
  entries.delete(el);
  io?.unobserve(el);
  if (!entries.size) {
    io?.disconnect();
    io = null;
    if (listening) {
      document.removeEventListener('visibilitychange', onVisibility);
    }
    listening = false;
  }
}

export interface LoopVisibility {
  /**
   * Re-apply the element's visibility to its loops: call it after starting
   * or re-timing a loop outside a render (a promise, a timer, an engine).
   * Renders apply it on their own.
   */
  refresh(): void;
  /** The component paused these itself (a stop): don't play them when the element comes back. */
  release(anims: Iterable<Animation>): void;
  /** Off screen or the page hidden: its loops are held. */
  hidden(): boolean;
  /** Call `f` each time the element comes back on screen (or the page shows again). Returns the unsubscribe. */
  onShow(f: () => void): () => void;
  /** A loop's start time on its own clock, while it is held: the one it had before. */
  startTime(anim: Animation): CSSNumberish | null;
}

/** A watch without React: the hook's, for an element a component owns outside a render. */
export interface LoopVisibilityHandle extends LoopVisibility {
  /** Hold what it runs now, if it is hidden (the hook's per-render pass). */
  sync(): void;
  /** Stop watching: its loops play again. */
  detach(): void;
}

/** Watch `el`'s loops (see `useLoopVisibility`). */
export function attachLoopVisibility(el: Element): LoopVisibilityHandle {
  const shown = new Set<() => void>();
  const e = watch(el, shown);
  return {
    refresh: () => apply(el, e),
    release(anims) {
      for (const a of anims) {
        released.add(a);
      }
    },
    onShow(f) {
      shown.add(f);
      return () => shown.delete(f);
    },
    hidden: () => hidden(e),
    startTime(anim) {
      const h = e.held.find((x) => x.anim === anim);
      return h &&
        anim.playState === 'paused' &&
        (h.currentTime === undefined || anim.currentTime === h.currentTime)
        ? h.startTime
        : anim.startTime;
    },
    sync() {
      if (entries.get(el) === e && hidden(e)) {
        hold(el, e);
      }
    },
    detach() {
      if (entries.get(el) === e) {
        unwatch(el, e);
      }
    },
  };
}

/**
 * Pause the infinite loops under `ref`'s element while it is off screen,
 * closed or the page is hidden; play them on their own phase when it comes
 * back. Each render (and so each re-dial of the loops in its layout effects)
 * re-applies the element's visibility once the commit's layout effects have
 * run, so it can be called anywhere in the component.
 */
export function useLoopVisibility(
  ref: RefObject<Element | null>
): LoopVisibility {
  const current = useRef<{ el: Element; h: LoopVisibilityHandle } | null>(null);
  const [shown] = useState(() => new Set<() => void>());
  useLayoutEffect(() => {
    const el = ref.current;
    const c = current.current;
    if (c?.el === el) {
      // The same element: loops this render started or re-timed while it is hidden are held too, once
      // the commit's other layout effects (the component's own, wherever it calls this) have run.
      if (c && c.h.hidden()) {
        queueMicrotask(() => current.current === c && c.h.sync());
      }
      return;
    }
    c?.h.detach();
    if (!el) {
      current.current = null;
      return;
    }
    const h = attachLoopVisibility(el);
    // The component's subscriptions follow it to a new element.
    h.onShow(() => shown.forEach((f) => f()));
    current.current = { el, h };
  });
  useLayoutEffect(
    () => () => {
      current.current?.h.detach();
      current.current = null;
    },
    []
  );
  const [api] = useState<LoopVisibility>(() => ({
    refresh: () => current.current?.h.refresh(),
    release: (anims) => current.current?.h.release(anims),
    onShow(f) {
      shown.add(f);
      return () => shown.delete(f);
    },
    hidden: () => !!current.current?.h.hidden(),
    startTime: (anim) =>
      current.current ? current.current.h.startTime(anim) : anim.startTime,
  }));
  return api;
}
