/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * One theme watcher for the kit
 * ============================================================================
 *
 * A component that solves colours against what it sits on re-reads them when
 * a theme changes round it: a class or `data-carbon-theme` change on one of
 * its ancestors (the page's, a zone's, a lab stage's). One observer of the
 * document serves every listener; each is called in the observer's own
 * callback, before the next paint, at most once per batch of changes, and
 * coalesces as it needs. With `backgrounds`, an ancestor's background-color
 * transition ending calls it too (a surface that eased to its new colour).
 * ========================================================================== */

interface Watch {
  el: Element;
  cb: () => void;
  backgrounds: boolean;
}

const watches = new Set<Watch>();
let observer: MutationObserver | null = null;
let backgroundWatches = 0;

const round = (t: Node, el: Element) => t !== el && t.contains(el);

const onMutations = (records: MutationRecord[]) => {
  for (const w of watches) {
    if (records.some((r) => round(r.target, w.el))) {
      w.cb();
    }
  }
};

const onTransitionEnd = (e: TransitionEvent) => {
  if (e.propertyName !== 'background-color' || !(e.target instanceof Node)) {
    return;
  }
  for (const w of watches) {
    if (w.backgrounds && round(e.target, w.el)) {
      w.cb();
    }
  }
};

/** Calls `cb` when a theme changes round `el`; returns the stop. */
export function onThemeChange(
  el: Element,
  cb: () => void,
  { backgrounds = false }: { backgrounds?: boolean } = {}
): () => void {
  if (typeof MutationObserver === 'undefined') {
    return () => undefined;
  }
  const w: Watch = { el, cb, backgrounds };
  watches.add(w);
  if (!observer) {
    observer = new MutationObserver(onMutations);
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-carbon-theme'],
    });
  }
  if (backgrounds && !backgroundWatches++) {
    document.addEventListener('transitionend', onTransitionEnd, true);
  }
  return () => {
    if (!watches.delete(w)) {
      return;
    }
    if (backgrounds && !--backgroundWatches) {
      document.removeEventListener('transitionend', onTransitionEnd, true);
    }
    if (watches.size) {
      return;
    }
    observer?.disconnect();
    observer = null;
  };
}
