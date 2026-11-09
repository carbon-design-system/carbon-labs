/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The few environment reads the engine makes, all lazy (nothing runs at
 * import, so every module here loads in Node / an SSR renderer).
 */

import { nextFrame } from './animate';

// ── Reduced motion: one store for both bindings ─────────────────────────────
// The web components read it directly; React's useReducedMotion is this store
// through useSyncExternalStore.

const QUERY = '(prefers-reduced-motion: reduce)';
function media(): MediaQueryList | null {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }
  // jsdom and some polyfills return undefined rather than a MediaQueryList.
  return window.matchMedia(QUERY) ?? null;
}

/**
 * A second say in the preference, from outside the icons: an animation
 * library's global switch (motion's `MotionGlobalConfig.skipAnimations`,
 * through the `/motion` entry). `get()` true holds every icon still, false
 * animates whatever the media query says, null leaves it to the media query.
 * `subscribe` tells the store the answer changed. One source at a time.
 */
export interface ReducedMotionSource {
  get(): boolean | null;
  subscribe?(onChange: () => void): () => void;
}
let source: ReducedMotionSource | null = null;
let unsource: (() => void) | undefined;
/** Set (or with null, clear) the outside source; every bound icon re-reads the preference at once. */
export function setReducedMotionSource(s: ReducedMotionSource | null): void {
  unsource?.();
  unsource = undefined;
  source = s;
  if (s?.subscribe) {
    unsource = s.subscribe(() => notify());
  }
  notify();
}

/** True while the user asks for reduced motion (or the outside source holds the icons still). */
export function prefersReducedMotion(): boolean {
  const forced = source?.get();
  if (forced === true || forced === false) {
    return forced;
  }
  return media()?.matches === true;
}

const listeners = new Set<() => void>();
let subscribed: MediaQueryList | null = null;
const notify = () => listeners.forEach((l) => l());
/**
 * Call `cb` whenever the reduced-motion preference changes; returns the
 * unsubscribe. One media-query listener is shared by every icon on the page,
 * whichever binding, and is removed when the last icon unsubscribes.
 */
export function onReducedMotionChange(cb: () => void): () => void {
  listeners.add(cb);
  if (!subscribed) {
    const m = media();
    if (m && typeof m.addEventListener === 'function') {
      m.addEventListener('change', notify);
      subscribed = m;
    }
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && subscribed) {
      subscribed.removeEventListener('change', notify);
      subscribed = null;
    }
  };
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The frame hover binds to: see the React package's useHover ("Interactive frame"). */
export const FRAME_SELECTOR = '[data-motion-icon-frame]';

/**
 * The controls an icon can sit inside, which are then the control (an
 * `as-button` icon drops its role inside one, and an icon inside one doesn't
 * press: the control has its own press, as the kit's rollover buttons
 * do). Carbon's buttons by tag, the rest by element or role.
 */
export const CONTROL_SELECTOR =
  'button, a[href], [role="button"], [role^="menuitem"], [role="tab"], cds-button, cds-icon-button';

/** Whether `el` sits inside a control (CONTROL_SELECTOR), crossing shadow roots; `el` itself doesn't count. */
export function insideControl(el: Element): boolean {
  let n: Element | null = el.parentElement ?? hostOf(el);
  while (n) {
    if (n.closest(CONTROL_SELECTOR)) {
      return true;
    }
    n = hostOf(n);
  }
  return false;
}

/** The shadow host of the root `el` is in, if any. */
function hostOf(el: Element): Element | null {
  const root = el.getRootNode() as Node & { host?: Element };
  return root && root !== el && 'host' in root ? (root.host ?? null) : null;
}

/**
 * The nearest ancestor marked `data-motion-icon-frame`, crossing shadow
 * roots (an icon in a component's shadow DOM still finds the button that
 * hosts it), else `el` itself.
 */
export function frameOf(el: Element): Element {
  let n: Element | null = el;
  while (n) {
    const hit: Element | null = n.closest(FRAME_SELECTOR);
    if (hit) {
      return hit;
    }
    const root = n.getRootNode() as Node & { host?: Element };
    n = root && root !== n && 'host' in root ? (root.host ?? null) : null;
  }
  return el;
}

export interface HoverHandlers {
  /**
   * Play the hover in. May return a promise for the end of the hover-in
   * (FrameController's and the status engines' do), so `play()` plays it
   * back out exactly when it lands; anything else (nothing played: a status
   * showing, a still drawing) ends the play at once.
   */
  enter(): unknown;
  leave(): void;
  /** Clicks in the frame's padding (outside the icon): toggles use this as the React package does. */
  frameClick?(): void;
}

/** What `bindHover` returns: call it to unbind; `play()` plays the hover once. */
export interface HoverBinding {
  (): void;
  /**
   * Play the hover once, in then out, as if a pointer passed over the icon
   * (hover-only icons on touch, or emphasis the app asks for). It doesn't
   * restart a hover already showing (a pointer, focus, or a play in
   * flight); a pointer or focus arriving mid-play keeps the icon hovered
   * until they end too. A binding that shouldn't animate (reduced motion)
   * is the caller's to skip: the web components and React's still drawings
   * never play.
   */
  play(): void;
}

/** Every live binding, for `playHover`. */
const live = new Set<{ el: Element; frame: Element; play(): void }>();

/** Whether `node` is `root` or inside it, crossing shadow roots. */
function within(root: Node, node: Node): boolean {
  for (let n: Node | null = node; n; ) {
    if (n === root) {
      return true;
    }
    n = n.parentNode ?? (n as Partial<ShadowRoot>).host ?? null;
  }
  return false;
}

/**
 * Play the hover once on every motion icon bound in `root`: the icon or its
 * frame is `root` or inside it (across shadow roots). Returns how many it
 * asked. React's `usePlayHover` and the web components' `el.play()` use it.
 */
export function playHover(root: Node): number {
  let n = 0;
  for (const b of [...live]) {
    if (!within(root, b.el) && !within(root, b.frame)) {
      continue;
    }
    b.play();
    n++;
  }
  return n;
}

/**
 * The icon's own button, when the icon is all of it: React's `asButton`
 * renders `<button aria-pressed><svg/></button>`. Keyboard focus on it is
 * focus on the icon. (A web component with `as-button` is itself the button.)
 */
export function ownButtonOf(el: Element): Element | null {
  const p = el.parentElement;
  return p &&
    p.localName === 'button' &&
    p.hasAttribute('aria-pressed') &&
    p.childNodes.length === 1
    ? p
    : null;
}

/**
 * Whether the frame is a disabled control, which gets no hover:
 * `:disabled` (a disabled `<button>`, or one in a disabled
 * fieldset), `aria-disabled="true"`, or a custom element carrying
 * `disabled` (Carbon's `cds-button` / `cds-icon-button`, under any prefix).
 */
export function isDisabledFrame(frame: Element): boolean {
  return (
    frame.getAttribute('aria-disabled') === 'true' ||
    (frame.localName.includes('-') && frame.hasAttribute('disabled')) ||
    is(frame, ':disabled', false)
  );
}

/** `el.matches(selector)`, or `otherwise` where the engine doesn't know the selector. */
function is(el: Element, selector: string, otherwise: boolean): boolean {
  try {
    return el.matches(selector);
  } catch {
    return otherwise;
  }
}

/** Focus handlers on a root (a document or shadow root), by the element whose focus they want. */
const focusDelegates = new WeakMap<
  Node,
  Map<EventTarget, Set<(e: Event) => void>>
>();

/**
 * Hear focusin / focusout for `targets` on `root` through one delegated pair
 * of listeners per root (a page of bare icons adds two listeners to its
 * document, not two per icon). Returns the unlisten.
 */
function listenFocus(
  root: Node,
  targets: EventTarget[],
  fn: (e: Event) => void
): () => void {
  let byTarget = focusDelegates.get(root);
  if (!byTarget) {
    const map = new Map<EventTarget, Set<(e: Event) => void>>();
    byTarget = map;
    focusDelegates.set(root, map);
    const relay = (e: Event) => {
      const fns = e.target && map.get(e.target);
      if (fns) {
        [...fns].forEach((f) => f(e));
      }
    };
    root.addEventListener('focusin', relay);
    root.addEventListener('focusout', relay);
  }
  const keys = [...new Set(targets)];
  for (const t of keys) {
    let fns = byTarget.get(t);
    if (!fns) {
      byTarget.set(t, (fns = new Set()));
    }
    fns.add(fn);
  }
  const map = byTarget;
  return () => {
    for (const t of keys) {
      const fns = map.get(t);
      fns?.delete(fn);
      if (fns && !fns.size) {
        map.delete(t);
      }
    }
  };
}

/**
 * Bind hover to `el`, or to its interactive frame when one is marked.
 * Returns the unbind. The one implementation: the React package's useHover
 * and the web components both use it.
 *
 * What holds the hover. It plays in when the first starts and out when the
 * last ends, so two at once never play it twice:
 *  - a mouse or pen over the frame (never a touch: see below);
 *  - keyboard focus: `:focus-visible` on the frame, on
 *    the icon when it is focusable (`as-button`), or on its own button
 *    (React's `asButton`). A mouse click that focuses the frame isn't
 *    keyboard focus, so it adds nothing to the pointer's hover. Blur ends it.
 *    No focus listener goes on an svg (that makes it focusable in Chrome).
 *  - `play()` (see HoverBinding).
 * None of them plays while the frame is disabled (`isDisabledFrame`); a
 * frame disabled mid-hover plays out, and one enabled again plays in if a
 * pointer or focus still holds it.
 *
 * Touch doesn't hover, decided per pointer event, not by
 * a media query (a laptop with a touchscreen hovers with its mouse and taps
 * with a finger). The wc-harness's rule:
 *  - hover starts on `pointerenter` with pointerType "mouse" or "pen" and
 *    ends on `pointerleave`; a "touch" pointer never starts it. A binding
 *    made with a mouse or pen already over its frame starts hovered (there
 *    is no enter to hear);
 *  - after a tap, browsers fire compatibility mouse events (mouseover,
 *    mouseenter, mousemove, mousedown, mouseup, click). They must not start
 *    a hover (a finger never "leaves", so the icon would rest hovered), so
 *    `mouseenter` only starts one when no pointer event has been seen on the
 *    frame at all (an engine without Pointer Events, or a test firing bare
 *    mouse events). Once pointer events are seen, they alone start hovers;
 *  - the last pointerType is remembered from pointerover / pointerenter /
 *    pointerdown, because WebKit reports "mouse" on the click after a tap;
 *  - leaving is always honoured, from either event family; enter and leave
 *    are idempotent across the two.
 * Toggles still play on tap: that is the click, not the hover.
 */
export function bindHover(el: Element, h: HoverHandlers): HoverBinding {
  trackPointerType();
  const frame = frameOf(el);
  const ownButton = ownButtonOf(el);
  // Focus is for the frame, or for the icon's own button when the icon is its own frame (the button wraps it).
  const focusRoot = frame === el && ownButton ? ownButton : frame;
  // Heard there, except on an svg (a bare icon is its own frame): Chrome makes an svg with a focus listener focusable
  // (SVGElement::HasFocusEventListeners), so a click would focus a bare icon and draw the UA's :focus outline. Its
  // tree (the document or shadow root it is in) hears it instead, with the same retargeted target, relatedTarget
  // and composedPath() (a bare svg isn't reachable by Tab anyway; this keeps one given a tabindex working).
  const focusAt: Node =
    focusRoot.namespaceURI !== SVG_NS
      ? focusRoot
      : focusRoot.isConnected
        ? focusRoot.getRootNode()
        : focusRoot.ownerDocument;
  const focusable = (t: EventTarget | null) =>
    t !== null && (t === frame || t === el || t === ownButton);
  // What holds the hover now, and whether it is played in. `playing` is the play() in flight (its hover-in).
  let pointer = false;
  let focused = false;
  let playing: object | null = null;
  let active = false;
  let bound = true;
  // The last pointerType seen on the frame; null: no pointer event yet.
  let lastType: string | null = null;
  /** Play in or out to match what holds the hover; returns the enter's result when it plays in. */
  const sync = (): unknown => {
    const disabled = isDisabledFrame(frame);
    // A disabled frame ends a play outright (it doesn't resume when enabled again).
    if (disabled) {
      playing = null;
    }
    const want = (pointer || focused || playing !== null) && !disabled;
    if (want === active) {
      return undefined;
    }
    active = want;
    if (want) {
      return h.enter();
    }
    h.leave();
    return undefined;
  };
  const play = () => {
    if (!bound || active || playing || isDisabledFrame(frame)) {
      return;
    }
    const run = {};
    playing = run;
    // Out once the hover-in has landed (or is cut short), unless a pointer or focus holds it by then.
    const end = () => {
      if (playing !== run) {
        return;
      }
      playing = null;
      sync();
    };
    Promise.resolve(sync()).then(end, end);
  };
  const setPointer = (on: boolean) => {
    pointer = on;
    sync();
  };
  const notePointer = (e: Event) => {
    lastType = (e as PointerEvent).pointerType ?? '';
  };
  const pointerEnter = (e: Event) => {
    notePointer(e);
    if (lastType !== 'touch') {
      setPointer(true);
    }
  };
  // Only without pointer events: after a tap this is a compatibility event, and for a real mouse pointerenter already ran.
  const mouseEnter = () => {
    if (lastType === null) {
      setPointer(true);
    }
  };
  const pointerLeave = () => setPointer(false);
  const focusIn = (e: Event) => {
    if (!focusable(e.target)) {
      return;
    }
    // Keyboard focus: :focus-visible (a mouse click that focuses a button isn't) on the element focus landed on,
    // inside open shadow roots. An engine without the selector doesn't play on focus.
    focused = is(e.composedPath()[0] as Element, ':focus-visible', false);
    sync();
  };
  const focusOut = (e: Event) => {
    if (!focusable(e.target)) {
      return;
    }
    // Moving between the frame and the icon's own button: the focusin that follows decides.
    if (focusable((e as FocusEvent).relatedTarget)) {
      return;
    }
    focused = false;
    sync();
  };
  const listeners: [string, (e: Event) => void][] = [
    ['pointerover', notePointer],
    ['pointerdown', notePointer],
    ['pointerenter', pointerEnter],
    ['pointerleave', pointerLeave],
    ['mouseenter', mouseEnter],
    ['mouseleave', pointerLeave],
  ];
  for (const [type, fn] of listeners) {
    frame.addEventListener(type, fn);
  }
  // On a frame, its own listeners; on a root (a bare svg's), the root's one delegated pair, by target.
  const delegated = focusAt !== focusRoot;
  const onFocus = (e: Event) =>
    e.type === 'focusin' ? focusIn(e) : focusOut(e);
  const unFocus = delegated
    ? listenFocus(
        focusAt,
        [frame, el, ...(ownButton ? [ownButton] : [])],
        onFocus
      )
    : undefined;
  if (!delegated) {
    focusAt.addEventListener('focusin', focusIn);
    focusAt.addEventListener('focusout', focusOut);
  }
  const click = (e: Event) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (
      path.includes(el) ||
      (e.target instanceof Node && el.contains(e.target))
    ) {
      return;
    }
    h.frameClick?.();
  };
  const attachClick = frame !== el && !!h.frameClick;
  if (attachClick) {
    frame.addEventListener('click', click);
  }
  // The frame turning disabled (or back) mid-hover: settle to match. A disabled control may not report the pointer
  // leaving, so on re-enabling the pointer counts only if it is still over the frame. (A bare svg icon is never a control.)
  const unwatch =
    frame.namespaceURI !== SVG_NS
      ? watchDisabled(frame, () => {
          if (pointer && !isDisabledFrame(frame)) {
            pointer = is(frame, ':hover', true);
          }
          sync();
        })
      : undefined;
  const entry = { el, frame, play };
  live.add(entry);
  // Bound under a pointer already over the frame (an icon mounted late: a selection row turned animated as the
  // selector reaches it, a toggle's svg swapped): a browser may send no pointerenter, so start hovered. Checked once,
  // on the next frame (browsers update :hover for a still pointer when they next lay out), and not after a touch
  // (isHovered: mobile keeps :hover on the last tapped element). An enter that does come is the same hover.
  const settle = () => {
    if (bound && !pointer && isHovered(el)) {
      setPointer(true);
    }
  };
  // On the shared loop's next frame (one frame request for a page of icons binding at once, not one each).
  nextFrame(settle);
  const unbind = () => {
    for (const [type, fn] of listeners) {
      frame.removeEventListener(type, fn);
    }
    if (unFocus) {
      unFocus();
    } else {
      focusAt.removeEventListener('focusin', focusIn);
      focusAt.removeEventListener('focusout', focusOut);
    }
    if (attachClick) {
      frame.removeEventListener('click', click);
    }
    live.delete(entry);
    unwatch?.();
    playing = null;
    bound = false;
  };
  return Object.assign(unbind, { play });
}

/** Per document: one MutationObserver for every frame's disabled state, and each frame's listeners. */
const disabledWatch = new WeakMap<
  Document,
  { mo: MutationObserver; of: Map<Element, Set<() => void>> }
>();

/**
 * Call `cb` when `frame`'s `disabled` or `aria-disabled` changes. One
 * MutationObserver per document serves every frame in it (not one per
 * icon: a nav of 200 icons kept 200), and a frame two icons share (a
 * selection row's two faces) is observed once. Returns the unwatch; a no-op
 * where there is no MutationObserver.
 */
export function watchDisabled(frame: Element, cb: () => void): () => void {
  const doc = frame.ownerDocument;
  const MO =
    doc?.defaultView?.MutationObserver ??
    (typeof MutationObserver === 'function' ? MutationObserver : undefined);
  if (!doc || !MO) {
    return () => undefined;
  }
  let w = disabledWatch.get(doc);
  if (!w) {
    const of = new Map<Element, Set<() => void>>();
    const mo = new MO((records) => {
      // One call per frame per batch, however many of its attributes changed.
      const seen = new Set<Node>();
      for (const r of records) {
        if (seen.has(r.target)) {
          continue;
        }
        seen.add(r.target);
        of.get(r.target as Element)?.forEach((f) => f());
      }
    });
    disabledWatch.set(doc, (w = { mo, of }));
  }
  const watch = w;
  let cbs = watch.of.get(frame);
  if (!cbs) {
    watch.of.set(frame, (cbs = new Set()));
    watch.mo.observe(frame, {
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'],
    });
  }
  const mine = cbs;
  mine.add(cb);
  return () => {
    mine.delete(cb);
    if (mine.size || watch.of.get(frame) !== mine) {
      return;
    }
    // A MutationObserver can't unobserve one target. It needn't: the registration lives on the frame (it goes when the
    // frame does), and a record for a frame no longer listed is skipped. Watched again, observe() just renews it.
    watch.of.delete(frame);
  };
}

/** Per document: one IntersectionObserver for every icon in it, and each icon's listeners. */
const seers = new WeakMap<
  Document,
  {
    io: IntersectionObserver;
    of: Map<Element, Set<(visible: boolean) => void>>;
  }
>();

/**
 * Call `cb` with whether `el` is on screen (within 64px of the viewport) as
 * that changes: what pauses a loop or a pending spinner while it can't be
 * seen. One IntersectionObserver per document serves every icon in it (not
 * one per icon). Returns the unobserve; a no-op where there is no
 * IntersectionObserver (an icon then counts as visible).
 */
export function observeVisibility(
  el: Element,
  cb: (visible: boolean) => void
): () => void {
  const doc = el.ownerDocument;
  const IO =
    doc?.defaultView?.IntersectionObserver ??
    (typeof IntersectionObserver === 'function'
      ? IntersectionObserver
      : undefined);
  if (!doc || !IO) {
    return () => undefined;
  }
  let s = seers.get(doc);
  if (!s) {
    const of = new Map<Element, Set<(visible: boolean) => void>>();
    const io = new IO(
      (entries) => {
        for (const e of entries) {
          of.get(e.target)?.forEach((f) => f(e.isIntersecting));
        }
      },
      { rootMargin: '64px' }
    );
    seers.set(doc, (s = { io, of }));
  }
  const seer = s;
  let cbs = seer.of.get(el);
  if (!cbs) {
    seer.of.set(el, (cbs = new Set()));
    seer.io.observe(el);
  }
  const mine = cbs;
  mine.add(cb);
  return () => {
    mine.delete(cb);
    if (mine.size || seer.of.get(el) !== mine) {
      return;
    }
    seer.of.delete(el);
    seer.io.unobserve(el);
  };
}

/** The type of the last pointer that entered or pressed (WebKit's post-tap click says 'mouse'). */
let lastPointerType = '';
let tracking = false;
/** Watch every pointer's type, page-wide (lazily: nothing runs at import). */
function trackPointerType() {
  if (
    tracking ||
    typeof document === 'undefined' ||
    typeof PointerEvent === 'undefined'
  ) {
    return;
  }
  tracking = true;
  const record = (e: Event) => {
    lastPointerType = (e as PointerEvent).pointerType || lastPointerType;
  };
  for (const type of ['pointerover', 'pointerdown']) {
    document.addEventListener(type, record, { capture: true, passive: true });
  }
}
/**
 * Whether a mouse or pen is over `el`'s frame right now (a status engine
 * taking over mid-hover). Not `:hover` alone: mobile browsers keep `:hover`
 * on the last tapped element, so after a tap this is false.
 */
export function isHovered(el: Element): boolean {
  trackPointerType();
  if (lastPointerType === 'touch') {
    return false;
  }
  try {
    return frameOf(el).matches(':hover');
  } catch {
    return false;
  }
}
