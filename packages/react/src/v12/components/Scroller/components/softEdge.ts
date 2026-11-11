/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The scroll soft edge: content leaves into a soft edge as it scrolls
 * ============================================================================
 *
 * Every Scroller viewport masks a side
 * only while there is content past it: the top once it's scrolled, the
 * bottom while more remains (and the inline sides likewise on x). Each edge
 * is the disclosure's `min(16px, h, H − h)` read for a scroll:
 *
 *   16px    the soft-edge token (`--cds-motion-soft-edge`)
 *   h       half the viewport on that axis (two edges never overlap)
 *   H − h   how much content is past that side (the scrolled amount, or
 *           what remains), so an edge grows over the first 16px scrolled
 *           and closes over the last 16px: nothing pops in at the ends
 *
 * The script writes only the amounts past each side (clamped to the token,
 * so the writes stop once it's past the first 16px), as non-inheriting
 * registered properties on the viewport; the mask is scroller.scss's. At
 * rest at the top, or when nothing overflows, there is no mask at all.
 *
 * A side where something is stuck to it (a `position: sticky` or `fixed`
 * element at that edge, or within the edge's depth of it: a page header, a
 * filter field, a contextual bar docked 8px clear of the top) has no edge:
 * the content scrolls under that element, not under the viewport's edge,
 * and the stuck element must stay whole.
 *
 * A component that masks the viewport for its own reason keeps these edges
 * by composing `--cds-scroll-edge-mask` into its mask (scroller.scss; the
 * contextual bar's).
 * ========================================================================== */

export type SoftEdgeSides = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Each side's amount of content past it, px, clamped to `cap`. Physical sides; `rtl` maps a negative scrollLeft. */
export function scrolledPast(
  m: {
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
  },
  axis: { x: boolean; y: boolean },
  cap: number,
  rtl = false
): SoftEdgeSides {
  const c = (v: number) =>
    Math.max(0, Math.min(cap, Math.round(v * 100) / 100));
  const maxY = Math.max(0, m.scrollHeight - m.clientHeight);
  const maxX = Math.max(0, m.scrollWidth - m.clientWidth);
  // Below 1px of overflow is rounding, not content.
  const y = axis.y && maxY >= 1;
  const x = axis.x && maxX >= 1;
  // RTL: scrollLeft runs 0 → −max, the start (right) side hiding −scrollLeft.
  const leftHidden = rtl ? maxX + m.scrollLeft : m.scrollLeft;
  return {
    top: y ? c(m.scrollTop) : 0,
    bottom: y ? c(maxY - m.scrollTop) : 0,
    left: x ? c(leftHidden) : 0,
    right: x ? c(maxX - leftHidden) : 0,
  };
}

/*
 * The stuck check, cheaply: never a hit test of six points
 * (`elementsFromPoint`) and a walk of each hit's styles on every scroll frame
 * of every Scroller. Instead:
 *
 *   candidates  the viewport's sticky and fixed descendants, found by a
 *               style scan when it attaches, again once a resize settles or
 *               the theme or direction changes, and, for what is added or
 *               has its class changed later (a MutationObserver), in one
 *               coalesced scan when the page is idle (at once when content
 *               changes size: a bar docking). SVG (icons) is never scanned,
 *               and a removal counts only when it takes a stuck element with
 *               it (the side nav's icon swaps on hover would each cost a
 *               scan and a layout read). Never during a scroll.
 *   per frame   a side is probed only where a candidate's box covers one of
 *               its probe points (getBoundingClientRect, no style reads); a
 *               side with none has nothing stuck to it (most Scrollers).
 *   verdict     the full hit test (so overlap and pointer-events still
 *               count) runs only when the candidates over a side
 *               change, and is kept until they do: a header stuck at the
 *               top stays stuck through the whole scroll.
 *
 * The direction and the edge's depth are read when it attaches, on a resize
 * and on a theme or direction change, not per frame.
 */

/** The probe depths along a side's edge, px in from it. */
const depths = (depth: number) =>
  [1, depth / 2, depth - 1].filter((d) => d >= 1);

/**
 * Is something stuck to the viewport within an edge's depth of a side (a sticky or fixed element
 * inside it)? Probed along the edge's depth, `depth` px in from the side: a stuck element held a
 * little clear of the side (a contextual bar docked 8px down) would otherwise be cut by the edge.
 */
function stuckNear(
  vp: HTMLElement,
  stuck: Set<Element>,
  x: number,
  y: number,
  dx: number,
  dy: number,
  depth: number
): boolean {
  for (const d of depths(depth)) {
    if (stuckAt(vp, stuck, x + dx * d, y + dy * d)) {
      return true;
    }
  }
  return false;
}

/** Is something stuck to the viewport at this client point (one of its sticky or fixed elements, or inside one)? */
function stuckAt(
  vp: HTMLElement,
  stuck: Set<Element>,
  x: number,
  y: number
): boolean {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el === vp) {
      return false;
    }
    if (!vp.contains(el)) {
      continue;
    }
    for (let n: Element | null = el; n && n !== vp; n = n.parentElement) {
      if (stuck.has(n)) {
        return true;
      }
    }
    return false;
  }
  return false;
}

/** Is `el` sticky or fixed? */
const isStuck = (el: Element) => {
  const p = getComputedStyle(el).position;
  return p === 'sticky' || p === 'fixed';
};

/** SVG content (icons) is never what sticks: not scanned. */
const NOT_SVG = '*:not(svg):not(svg *)';

/** Adds the sticky and fixed elements in `root`'s subtree (and `root` itself when `self`) to `into`. */
function scanStuck(root: Element, into: Set<Element>, self: boolean) {
  if (root instanceof SVGElement) {
    return;
  }
  if (self && isStuck(root)) {
    into.add(root);
  }
  for (const el of root.querySelectorAll(NOT_SVG)) {
    if (isStuck(el)) {
      into.add(el);
    }
  }
}

/** When the page is idle (or soon, without requestIdleCallback). Returns a cancel. */
const whenIdle = (fn: () => void): (() => void) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(fn, { timeout: 250 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 120);
  return () => clearTimeout(id);
};

/** Does the box hold any of the points? */
const covers = (r: DOMRect, pts: [number, number][]) =>
  pts.some(
    ([x, y]) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  );

/*
 * One observer of the document's theme and direction for every soft edge
 * (each re-reads its direction and depth, and rescans, on a change).
 */
const docListeners = new Set<() => void>();
let docObserver: MutationObserver | null = null;
// A class on the root or the body counts only when it changes a Carbon theme class (not a modal's open class).
const THEME_CLASS = /(?:^|\s)cds--(?:white|g100|v12-light|v12-dark)(?=\s|$)/g;
const themeClasses = (cls: string | null) =>
  (cls?.match(THEME_CLASS) ?? [])
    .map((c) => c.trim())
    .sort()
    .join(' ');
const themeChanged = (r: MutationRecord) =>
  r.attributeName !== 'class' ||
  themeClasses(r.oldValue) !==
    themeClasses((r.target as Element).getAttribute('class'));
function onDocChange(fn: () => void): () => void {
  docListeners.add(fn);
  if (!docObserver && typeof MutationObserver !== 'undefined') {
    docObserver = new MutationObserver((records) => {
      if (records.some(themeChanged)) {
        docListeners.forEach((f) => f());
      }
    });
    const opts = {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', 'dir', 'data-carbon-theme'],
    };
    docObserver.observe(document.documentElement, opts);
    if (document.body) {
      docObserver.observe(document.body, opts);
    }
  }
  return () => {
    docListeners.delete(fn);
    if (!docListeners.size) {
      docObserver?.disconnect();
      docObserver = null;
    }
  };
}

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
type Side = (typeof SIDES)[number];

/**
 * Keeps `vp`'s soft-edge properties in step with its scroll. Returns a stop
 * (which clears them).
 */
export function attachScrollSoftEdge(
  vp: HTMLElement,
  axis: { x: boolean; y: boolean }
): () => void {
  let raf = 0;
  let cap = 16;
  let rtl = false;
  const last: SoftEdgeSides = { top: 0, right: 0, bottom: 0, left: 0 };
  /** Its sticky and fixed descendants. */
  const stuck = new Set<Element>();
  /** Per side: the candidates over it when it was last hit-tested, and what the hit test found. */
  const verdict: Record<Side, { over: Element[]; stuck: boolean } | null> = {
    top: null,
    right: null,
    bottom: null,
    left: null,
  };
  const forget = () => {
    for (const s of SIDES) {
      verdict[s] = null;
    }
  };
  const readCap = () => {
    const cs = getComputedStyle(vp);
    cap = parseFloat(cs.getPropertyValue('--cds-motion-soft-edge')) || 16;
    rtl = cs.direction === 'rtl';
  };
  /** Added subtrees, and elements whose class changed, not scanned yet. */
  const pending = new Set<Element>();
  const pendingSelf = new Set<Element>();
  let cancelIdle: (() => void) | null = null;
  const rescan = () => {
    stuck.clear();
    pending.clear();
    pendingSelf.clear();
    scanStuck(vp, stuck, false);
    forget();
  };
  /** Scans what's pending; true when the candidates changed. */
  const flush = (): boolean => {
    cancelIdle?.();
    cancelIdle = null;
    if (!pending.size && !pendingSelf.size) {
      return false;
    }
    const had = new Set(stuck);
    for (const el of pending) {
      if (el.isConnected && vp.contains(el)) {
        scanStuck(el, stuck, true);
      }
    }
    for (const el of pendingSelf) {
      if (!el.isConnected) {
        continue;
      }
      if (isStuck(el)) {
        stuck.add(el);
      } else {
        stuck.delete(el);
      }
    }
    pending.clear();
    pendingSelf.clear();
    const changed =
      stuck.size !== had.size || [...stuck].some((el) => !had.has(el));
    if (changed) {
      forget();
    }
    return changed;
  };
  const flushLater = () => {
    if (cancelIdle) {
      return;
    }
    cancelIdle = whenIdle(() => {
      cancelIdle = null;
      if (flush()) {
        schedule();
      }
    });
  };
  /** Is `side` held by something stuck to it? Hit-tests only when the candidates over it changed. */
  const held = (side: Side, r: DOMRect): boolean => {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const [x, y, dx, dy] =
      side === 'top'
        ? [cx, r.top, 0, 1]
        : side === 'bottom'
          ? [cx, r.bottom, 0, -1]
          : side === 'left'
            ? [r.left, cy, 1, 0]
            : [r.right, cy, -1, 0];
    const pts = depths(cap).map((d): [number, number] => [
      x + dx * d,
      y + dy * d,
    ]);
    const over: Element[] = [];
    for (const el of stuck) {
      if (covers(el.getBoundingClientRect(), pts)) {
        over.push(el);
      }
    }
    if (!over.length) {
      verdict[side] = null;
      return false;
    }
    const was = verdict[side];
    if (
      was &&
      was.over.length === over.length &&
      was.over.every((el, i) => el === over[i])
    ) {
      return was.stuck;
    }
    const now = stuckNear(vp, stuck, x, y, dx, dy, cap);
    verdict[side] = { over, stuck: now };
    return now;
  };
  const update = () => {
    raf = 0;
    if (!vp.isConnected) {
      return;
    }
    const e = scrolledPast(vp, axis, cap, rtl);
    if (stuck.size && (e.top || e.bottom || e.left || e.right)) {
      for (const el of stuck) {
        if (!el.isConnected) {
          stuck.delete(el);
        }
      }
      const r = vp.getBoundingClientRect();
      for (const s of SIDES) {
        if (e[s] && held(s, r)) {
          e[s] = 0;
        }
      }
    }
    let any = false;
    for (const s of SIDES) {
      if (e[s] !== last[s]) {
        last[s] = e[s];
        vp.style.setProperty(`--scroller-past-${s}`, `${e[s]}px`);
      }
      if (e[s]) {
        any = true;
      }
    }
    if (any) {
      vp.dataset.softEdge = '';
    } else {
      delete vp.dataset.softEdge;
    }
  };
  const schedule = () => {
    if (!raf) {
      raf = requestAnimationFrame(update);
    }
  };
  readCap();
  rescan();
  update();
  vp.addEventListener('scroll', schedule, { passive: true });
  // A resize can cross a breakpoint that makes something sticky or not: one
  // rescan once the resize settles, not one per frame of a drag.
  let settle = 0;
  let size = { w: -1, h: -1 };
  const rescanLater = () => {
    clearTimeout(settle);
    settle = window.setTimeout(() => {
      rescan();
      schedule();
    }, 150);
  };
  // The viewport or its content changing size (rows arriving, a filter, a resize).
  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => {
          // Its own size, changed (not the observer's first report).
          const own = entries.find((en) => en.target === vp)?.contentRect;
          if (own && (own.width !== size.w || own.height !== size.h)) {
            const first = size.w < 0;
            size = { w: own.width, h: own.height };
            if (!first) {
              readCap();
              rescanLater();
            }
          }
          // Content changed size: what was added may be what sticks now.
          flush();
          forget();
          schedule();
        })
      : null;
  ro?.observe(vp);
  const observeKids = () => {
    for (const k of Array.from(vp.children)) {
      ro?.observe(k);
    }
  };
  observeKids();
  // Content added anywhere inside, or a class changed: scanned later (a
  // contextual bar docking, a page's header, a class that makes something
  // sticky). Its own children are observed for size too.
  const mo =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver((records) => {
          let kids = false;
          let removed = false;
          for (const rec of records) {
            if (rec.type === 'attributes') {
              if (!(rec.target instanceof SVGElement)) {
                pendingSelf.add(rec.target as Element);
              }
              continue;
            }
            if (rec.target === vp) {
              kids = true;
            }
            for (const n of rec.addedNodes) {
              if (n.nodeType === 1 && !(n instanceof SVGElement)) {
                pending.add(n as Element);
              }
            }
            if (rec.removedNodes.length) {
              removed = true;
            }
          }
          if (pending.size || pendingSelf.size) {
            flushLater();
          }
          // Only a stuck element leaving changes what holds a side.
          let changed = false;
          if (removed && stuck.size) {
            for (const el of stuck) {
              if (!el.isConnected) {
                stuck.delete(el);
                changed = true;
              }
            }
          }
          if (kids) {
            observeKids();
          }
          if (changed) {
            forget();
          }
          if (kids || changed) {
            schedule();
          }
        })
      : null;
  mo?.observe(vp, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  const offDoc = onDocChange(() => {
    readCap();
    rescan();
    schedule();
  });
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(settle);
    cancelIdle?.();
    vp.removeEventListener('scroll', schedule);
    ro?.disconnect();
    mo?.disconnect();
    offDoc();
    stuck.clear();
    for (const s of SIDES) {
      vp.style.removeProperty(`--scroller-past-${s}`);
    }
    delete vp.dataset.softEdge;
  };
}
