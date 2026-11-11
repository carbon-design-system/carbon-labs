/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  durationStepForDistance,
  motionTokens,
  snapEaseAt,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * The JumpTo engine, framework-free.
 *
 *   watch    IntersectionObservers on the target (or a sentinel at the
 *            content's start or end): no scroll listener, no layout reads
 *   layer    one out-of-flow layer per container, as tall as its content,
 *            holds the sentinels and the sticky hosts: no gap, cell or room
 *   stick    at the end, content growing keeps it there (a ResizeObserver);
 *            a reader's own scroll toward the start lets go, once it settles
 *   jump     a scroll glide by distance; past two views, a jump to one view
 *            short of the target first; reduced motion lands at once
 *   window   a container that is the document (`document.scrollingElement`)
 *            is the window: the viewport observes, the layer is the body's
 *   one      a jump is one event: while it glides, the scroll box carries
 *            `data-jump-to-gliding`, and `jumpRemaining` gives what is left
 *            of its clock, so what reacts to the scroll it causes (a page
 *            header collapsing or expanding) runs on that clock, or lands
 *            with it, rather than playing after it
 * ========================================================================== */

/** Where the target is from the view. */
export type JumpDirection = 'up' | 'down';
/** Where the pill sits: the top or the bottom of the view. */
export type JumpPlace = 'top' | 'bottom';
/** Where an element target lands in the view. */
export type JumpBlock = 'start' | 'center' | 'end';

/** The live edge, the content's start, or an element in the container. */
export type JumpTargetValue = 'end' | 'start' | Element | null;

export interface JumpWatch {
  /** The target is out of view past the threshold. */
  away: boolean;
  direction: JumpDirection;
  /** The live edge is in view. */
  atEnd: boolean;
}

export interface JumpEngineOptions {
  /** Px past the view before the target counts as away. */
  threshold: number;
  /** At the end, growing content keeps the view at the end. */
  stick: boolean;
  block: JumpBlock;
  reduced: boolean;
  timeScale: number;
  onChange: (w: JumpWatch) => void;
  /** What takes focus after a keyboard jump. Default: the target element, else the container. */
  focusTarget?: () => HTMLElement | null;
}

export interface JumpEngine {
  setTarget(t: JumpTargetValue): void;
  /** The pill's host in the container, made on first call. */
  host(): HTMLElement;
  /** Moves the host to the top or the bottom of the view. */
  setPlace(p: JumpPlace): void;
  /** Resolves true once it lands, false if a reader's input or another jump cuts it short. */
  jump(how?: { keyboard?: boolean }): Promise<boolean>;
  /** A glide is under way. */
  gliding(): boolean;
  destroy(): void;
}

/** Within this many px of the end is at the end (a fractional scroll position). */
export const JUMP_END_SLOP = 2;
/** The padding a target lands with at the view's edge: the scroll soft edge's depth. */
export const JUMP_EDGE_PAD = 16;
/** Past this many views, the jump moves to one view short first, then glides. */
export const JUMP_FAR_VIEWS = 2;

const SENTINEL = 'data-jump-to-sentinel';
/** How far above the view the direction observer reaches, px: any content. */
const ABOVE = 1e6;

/** The first move of a jump: none, or straight to one view short of the target; then the glide. */
export function jumpPlan(
  from: number,
  to: number,
  view: number
): { first: number | null; glide: number } {
  const d = to - from;
  if (Math.abs(d) <= JUMP_FAR_VIEWS * view) {
    return { first: null, glide: d };
  }
  const first = to - Math.sign(d) * view;
  return { first, glide: to - first };
}

/** The glide's clock for a travel, ms: carbon-motion's distance steps. */
export function glideMs(px: number, timeScale = 1): number {
  return motionTokens.duration[durationStepForDistance(px)] * timeScale;
}

/** The scroll position that lands `top`–`bottom` (content px) at `block` in a view of `view` px. */
export function landingTop(
  top: number,
  bottom: number,
  view: number,
  block: JumpBlock
): number {
  if (block === 'center') {
    return (top + bottom) / 2 - view / 2;
  }
  if (block === 'end') {
    return bottom - view + JUMP_EDGE_PAD;
  }
  return top - JUMP_EDGE_PAD;
}

/** The scroll box of a jump under way. */
export const JUMP_GLIDE_ATTR = 'data-jump-to-gliding';
/** When each gliding box's jump lands (`performance.now()` ms). */
const glides = new WeakMap<Element, number>();

/**
 * A jump under way over `el` (in its scroll box, or the box itself): the ms
 * left until it lands, 0 on its landing frame, or null when no jump moves it.
 * What reacts to the scroll reads it: a change the jump causes runs on the
 * jump's clock, or lands with it.
 */
export function jumpRemaining(
  el: Pick<Element, 'closest'> | null | undefined,
  now = performance.now()
): number | null {
  const box = el?.closest(`[${JUMP_GLIDE_ATTR}]`);
  const ends = box ? glides.get(box) : undefined;
  return ends === undefined ? null : Math.max(0, ends - now);
}

type GlideBox = Pick<Element, 'setAttribute' | 'removeAttribute'>;

/** Marks `box` as gliding until `ends` (`performance.now()` ms). */
export function markJumpGlide(box: GlideBox, ends: number) {
  glides.set(box as Element, ends);
  box.setAttribute(JUMP_GLIDE_ATTR, '');
}

/** `box` glides no more. */
export function clearJumpGlide(box: GlideBox) {
  glides.delete(box as Element);
  box.removeAttribute(JUMP_GLIDE_ATTR);
}

/** A reader's own move settles this long after its last input or scroll, ms. */
const SETTLE_MS = 150;

const mark = (el: HTMLElement, css: string) => {
  el.setAttribute(SENTINEL, '');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = css;
  return el;
};

// The layer, one per container: out of flow (no gap, cell or room) and as tall as the content,
// so the sticky hosts in it ride the whole scroll range.
interface Layer {
  el: HTMLElement;
  /** Top hosts go before it, bottom hosts after: it fills the layer. */
  spacer: HTMLElement;
  users: number;
  position: string | null;
  measure(): void;
}
const layers = new WeakMap<HTMLElement, Layer>();

function layerFor(box: HTMLElement, keepPosition = false): Layer {
  const had = layers.get(box);
  if (had) {
    had.users++;
    return had;
  }
  // A static container is made the layer's containing block.
  // The window's (the body) stays as it is: the layer's top is the document's either way.
  const position =
    !keepPosition && getComputedStyle(box).position === 'static'
      ? box.style.position
      : null;
  if (position !== null) {
    box.style.position = 'relative';
  }
  const el = mark(
    document.createElement('div'),
    'position:absolute;inset-block-start:0;inset-inline:0;block-size:0;margin:0;padding:0;pointer-events:none'
  );
  // It holds the pills: only the sentinels are hidden from assistive tech.
  el.removeAttribute('aria-hidden');
  el.className = 'cds-jump-to__layer';
  const spacer = mark(document.createElement('div'), 'block-size:100%');
  el.append(spacer);
  box.append(el);
  const layer: Layer = {
    el,
    spacer,
    users: 1,
    position,
    measure() {
      // Collapsed, the layer adds nothing: the content's own height, less the 1px a fraction rounds up.
      el.style.blockSize = '0px';
      el.style.blockSize = `${Math.max(0, box.scrollHeight - 1)}px`;
    },
  };
  layers.set(box, layer);
  return layer;
}

function releaseLayer(box: HTMLElement) {
  const l = layers.get(box);
  if (!l || --l.users > 0) {
    return;
  }
  l.el.remove();
  if (l.position !== null) {
    box.style.position = l.position;
  }
  layers.delete(box);
}

/** Keys that move a scroll view toward its start. */
const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

/** The document's scroller: the window, observed through the viewport. */
const isDocument = (el: HTMLElement) =>
  el === document.scrollingElement ||
  el === document.documentElement ||
  el === document.body;

export function attachJumpTo(
  container: HTMLElement,
  opts: () => JumpEngineOptions
): JumpEngine {
  const doc = isDocument(container);
  // Where the scroll is, what holds the layer, the observers' root and where the reader's input lands.
  const box = doc
    ? ((document.scrollingElement as HTMLElement | null) ??
      document.documentElement)
    : container;
  const layerBox = doc ? document.body : box;
  const root = doc ? null : box;
  const input: HTMLElement | Window = doc ? window : box;
  const layer = layerFor(layerBox, doc);
  const start = mark(
    document.createElement('span'),
    'position:absolute;inset-block-start:0;block-size:0'
  );
  const end = mark(
    document.createElement('span'),
    'position:absolute;inset-block-start:100%;block-size:0'
  );
  layer.el.append(start, end);
  let target: JumpTargetValue = null;
  let threshold = -1;
  let watch: JumpWatch = { away: false, direction: 'down', atEnd: true };
  // Set by the first observation: a container that opens away from its end isn't pulled there.
  let pinned = false;
  let told = false;
  let glide = 0;
  let stopGlide: (() => void) | null = null;
  let host: HTMLElement | null = null;
  let place: JumpPlace = 'bottom';

  const set = (patch: Partial<JumpWatch>) => {
    const next = { ...watch, ...patch };
    const same =
      next.away === watch.away &&
      next.direction === watch.direction &&
      next.atEnd === watch.atEnd;
    // The first observation always reports: a host may hold a state from an engine before this one.
    if (same && told) {
      return;
    }
    told = true;
    watch = next;
    opts().onChange(watch);
  };

  // A reader's own move while pinned: held, the view keeps its distance from the growing end;
  // settled, it lets go only if the reader moved away from the end.
  let held = false;
  let anchor = 0;
  let carried = 0;
  let settle = 0;
  let pressing = false;
  // Pressed (a scrollbar drag), it stays held until the press ends.
  const settleSoon = () => {
    clearTimeout(settle);
    if (!pressing) {
      settle = window.setTimeout(release, SETTLE_MS);
    }
  };
  const hold = () => {
    if (!held) {
      if (!pinned || !opts().stick) {
        return;
      }
      held = true;
      anchor = box.scrollTop;
      carried = 0;
      input.addEventListener('scroll', settleSoon, { passive: true });
    }
    settleSoon();
  };
  const release = () => {
    if (!held) {
      return;
    }
    held = false;
    input.removeEventListener('scroll', settleSoon);
    const moved = anchor + carried - box.scrollTop;
    pinned = moved <= JUMP_END_SLOP;
    if (pinned) {
      box.scrollTop = box.scrollHeight;
    }
  };

  // The live edge: in view within the slop. While held, only reaching it changes the pin.
  const endIO = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1]!;
      if (e.isIntersecting || !held) {
        pinned = e.isIntersecting;
      }
      set({ atEnd: e.isIntersecting });
    },
    { root, rootMargin: `0px 0px ${JUMP_END_SLOP}px 0px` }
  );
  endIO.observe(end);

  // Away: out of the view widened by the threshold. Direction: in the region above the view's top
  // edge, which a target crosses even when one scroll carries it from below the view to above it.
  let awayIO: IntersectionObserver | null = null;
  let aboveIO: IntersectionObserver | null = null;
  const observeTarget = () => {
    awayIO?.disconnect();
    aboveIO?.disconnect();
    awayIO = aboveIO = null;
    threshold = opts().threshold;
    const el = target === 'end' ? end : target === 'start' ? start : target;
    if (!el) {
      set({ away: false });
      return;
    }
    const last = (es: IntersectionObserverEntry[]) => es[es.length - 1]!;
    awayIO = new IntersectionObserver(
      (es) => set({ away: !last(es).isIntersecting }),
      {
        root,
        rootMargin: `${threshold}px 0px ${threshold}px 0px`,
      }
    );
    aboveIO = new IntersectionObserver(
      (es) => set({ direction: last(es).isIntersecting ? 'up' : 'down' }),
      { root, rootMargin: `${ABOVE}px 0px -100% 0px` }
    );
    aboveIO.observe(el);
    awayIO.observe(el);
  };

  // Content resized: the layer follows it, and a pinned view stays at the end (held: its distance).
  let height = box.scrollHeight;
  const ro = new ResizeObserver(() => {
    layer.measure();
    const h = box.scrollHeight;
    const grew = h - height;
    height = h;
    if (!opts().stick || !pinned || glide) {
      return;
    }
    if (held) {
      carried += grew;
      box.scrollTop += grew;
    } else {
      box.scrollTop = h;
    }
  });
  const ours = (n: Node) => n instanceof Element && n.hasAttribute(SENTINEL);
  ro.observe(layerBox);
  for (const c of layerBox.children) {
    if (!ours(c)) {
      ro.observe(c);
    }
  }
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach(
        (n) => n instanceof Element && !ours(n) && ro.observe(n)
      );
      r.removedNodes.forEach(
        (n) => n instanceof Element && !ours(n) && ro.unobserve(n)
      );
    }
  });
  mo.observe(layerBox, { childList: true });

  // A reader's own moves toward the start: a wheel, a key, a touch, a press on a scrollbar or beside
  // the view (a scroller's pill).
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      hold();
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (UP_KEYS.has(e.key) || (e.key === ' ' && e.shiftKey)) {
      hold();
    }
  };
  const frame: HTMLElement | Document = doc
    ? document
    : (box.parentElement ?? box);
  const onPress = (e: PointerEvent) => {
    // The window: only a press on its scroller's pill.
    if (
      doc
        ? !(e.target as Element | null)?.closest?.('.cds-scroller-window')
        : e.target !== box && box.contains(e.target as Node)
    ) {
      return;
    }
    pressing = true;
    hold();
  };
  const onUp = () => {
    if (!pressing) {
      return;
    }
    pressing = false;
    if (held) {
      settleSoon();
    }
  };
  input.addEventListener('wheel', onWheel as EventListener, { passive: true });
  input.addEventListener('keydown', onKey as EventListener);
  input.addEventListener('touchstart', hold, { passive: true });
  frame.addEventListener('pointerdown', onPress as EventListener);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  /** The target's landing, content px, clamped to the scroll range. */
  const landing = (): number => {
    const max = box.scrollHeight - box.clientHeight;
    if (target === 'end') {
      return max;
    }
    if (target === 'start' || !target) {
      return 0;
    }
    const r = target.getBoundingClientRect();
    // The view's top: the viewport's for the window.
    const viewTop = doc ? 0 : box.getBoundingClientRect().top + box.clientTop;
    const top = r.top - viewTop + box.scrollTop;
    return Math.max(
      0,
      Math.min(
        max,
        landingTop(top, top + r.height, box.clientHeight, opts().block)
      )
    );
  };

  const scrollTo = (top: number) => box.scrollTo({ top, behavior: 'instant' });

  // The jump's clock on the box (`jumpRemaining`). Landed, it reads 0 until
  // the next frame, which is when the landing's scroll event arrives.
  let marks = 0;
  const unmark = () => {
    marks++;
    clearJumpGlide(box);
  };
  const markGlide = (ms: number) => {
    marks++;
    markJumpGlide(box, performance.now() + ms);
  };
  const markLanded = () => {
    markGlide(0);
    const mine = marks;
    requestAnimationFrame(() => {
      if (marks === mine) {
        unmark();
      }
    });
  };

  // A tab stop added for the jump goes again once focus leaves.
  const focusAfter = () => {
    const o = opts();
    const el =
      o.focusTarget?.() ??
      (target instanceof HTMLElement ? target : doc ? document.body : box);
    if (!el) {
      return;
    }
    if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), {
        once: true,
      });
    }
    el.focus({ preventScroll: true });
  };

  // The glide under way's promise: false when cut short.
  let settleJump: ((landed: boolean) => void) | null = null;
  const cancel = () => {
    if (glide) {
      cancelAnimationFrame(glide);
    }
    glide = 0;
    stopGlide?.();
    stopGlide = null;
    settleJump?.(false);
    settleJump = null;
    if (glides.has(box)) {
      unmark();
    }
  };

  const placeHost = () => {
    if (!host) {
      return;
    }
    host.dataset.place = place;
    if (place === 'top') {
      layer.spacer.before(host);
    } else {
      layer.el.append(host);
    }
  };

  return {
    setTarget(t) {
      if (t === target && opts().threshold === threshold) {
        return;
      }
      target = t;
      observeTarget();
    },
    host() {
      if (!host) {
        host = mark(document.createElement('div'), '');
        host.removeAttribute('aria-hidden');
        host.className = 'cds-jump-to__host';
        placeHost();
        layer.measure();
      }
      return host;
    },
    setPlace(p) {
      if (p === place) {
        return;
      }
      place = p;
      placeHost();
    },
    gliding: () => glide !== 0,
    jump(how = {}) {
      cancel();
      if (how.keyboard) {
        focusAfter();
      }
      const o = opts();
      const live = target === 'end';
      if (o.reduced) {
        scrollTo(landing());
        markLanded();
        if (live) {
          pinned = true;
        }
        return Promise.resolve(true);
      }
      const plan = jumpPlan(box.scrollTop, landing(), box.clientHeight);
      if (plan.first != null) {
        scrollTo(plan.first);
      }
      const from = box.scrollTop;
      const ms = Math.max(1, glideMs(plan.glide, o.timeScale));
      const fixed = landing();
      const t0 = performance.now();
      markGlide(ms);
      // A reader's own wheel, touch, key or press stops the glide where it is.
      const stop = () => cancel();
      input.addEventListener('wheel', stop, { passive: true });
      input.addEventListener('touchstart', stop, { passive: true });
      input.addEventListener('keydown', stop);
      input.addEventListener('pointerdown', stop);
      stopGlide = () => {
        input.removeEventListener('wheel', stop);
        input.removeEventListener('touchstart', stop);
        input.removeEventListener('keydown', stop);
        input.removeEventListener('pointerdown', stop);
      };
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        // The live edge moves while content streams in: aimed at it each frame.
        const to = live ? landing() : fixed;
        scrollTo(from + (to - from) * snapEaseAt('standard-productive', p));
        if (p < 1) {
          glide = requestAnimationFrame(step);
          return;
        }
        glide = 0;
        stopGlide?.();
        stopGlide = null;
        markLanded();
        if (live) {
          pinned = true;
        }
        settleJump?.(true);
        settleJump = null;
      };
      glide = requestAnimationFrame(step);
      return new Promise<boolean>((resolve) => {
        settleJump = resolve;
      });
    },
    destroy() {
      cancel();
      clearTimeout(settle);
      endIO.disconnect();
      awayIO?.disconnect();
      aboveIO?.disconnect();
      ro.disconnect();
      mo.disconnect();
      input.removeEventListener('wheel', onWheel as EventListener);
      input.removeEventListener('keydown', onKey as EventListener);
      input.removeEventListener('touchstart', hold);
      input.removeEventListener('scroll', settleSoon);
      frame.removeEventListener('pointerdown', onPress as EventListener);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      start.remove();
      end.remove();
      host?.remove();
      releaseLayer(layerBox);
    },
  };
}
