/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The modal's backdrop — what happens to the page behind it
 * ============================================================================
 *
 * The dim (Carbon's $overlay) is always there; over it, by default both
 * (MODAL_BACKDROP_DEFAULT):
 *
 *   scale    the page draws back to 99% about the viewport's centre, on the
 *            overlay's clocks (a composited `scale`)
 *   blur     one backdrop-filter layer over the whole page: one pass,
 *            whatever the surface's size. Its radius is MODAL_BACKDROP.even,
 *            the one value every overlay's blur reads (`backdropBlur`)
 *
 * The blur layer fades with the overlay on its own opacity: an ancestor's
 * opacity would make it the backdrop root, and the blur would see nothing.
 * Reduced motion: the blur is there at once, and the page doesn't scale.
 *
 * THE FIRST USE. A first open pays what a repeat doesn't: the search for
 * the page's layers, their promotion and first raster, and a GPU pipeline
 * for each new kind of drawing (the blur, the dim over it, the surface's
 * rounded fill, hairline, text and pill button, the page drawn scaled, the
 * tearsheet's clipped frame and scrim). `prewarmBackdrop`, idle after a
 * closed modal mounts, finds the layers and draws the open at 0.5% for
 * WARM_MS, once per kind (at 0 nothing is built). The layers are promoted
 * (`will-change: scale`) only on intent (a launcher hovered or focused, for
 * INTENT_GRACE_MS after) and while the page is held scaled: a promoted layer
 * is a containing block, and would move what is positioned in it.
 *
 * THE PAGE. Scaling needs elements to scale, and no app should have to name
 * them. A transformed element becomes the containing block of the
 * `position: fixed` elements inside it, so scaling an app's root would move
 * its fixed chrome (a header, a side nav, a toast) on a scrolled page: it
 * would be placed against the root, not the viewport. So the scale finds
 * the page's layers itself (`modalPageLayers`): the body's elements, each
 * split round the fixed elements inside it — an element holding none is a
 * layer, one holding some is swapped for its children, split the same way,
 * and a fixed element is a layer of its own. Each is scaled about the
 * viewport's centre, which draws the same picture as scaling the page
 * whole, and none of them holds a fixed element, so nothing moves. A page
 * can still name its layers (`data-cds-modal-page`, as the kit's AppShell
 * does in the window); they are split the same way. A page that would take
 * more than MODAL_PAGE_MAX_LAYERS isn't scaled: the dim and the blur still
 * are.
 *
 * THE CHROME. The app's fixed chrome (the shell's header) dims and blurs
 * with the page but never scales: the bar is pinned to the viewport's edge,
 * and drawn back to 99% it comes off the edge and shows the page round it.
 * An element marked `data-cds-modal-chrome` (MODAL_CHROME_ATTR; AppShell's
 * header on the page, the prototypes' site header) is left out of the
 * layers, with all it holds, and the elements holding it are split round it
 * as round a fixed element, so nothing scales it from above. The modal's
 * layer sits over the chrome (modal.scss), so the dim and the blur cover it.
 * ========================================================================== */

export type ModalBlur = 'even';

/** The page behind the modal, over the dim. A field left out takes its default (MODAL_BACKDROP_DEFAULT). */
export interface ModalBackdrop {
  /** The page draws back to this scale (`true`: 0.99); `false` keeps it still. Default `true`. */
  scale?: boolean | number;
  /** `even`: one blur over the page; `false` none. Default `even`. */
  blur?: ModalBlur | false;
}

/** The backdrop a modal or tearsheet has when it isn't given one. */
export const MODAL_BACKDROP_DEFAULT = {
  scale: true,
  blur: 'even',
} as const satisfies ModalBackdrop;

/** A modal's `backdrop` prop, its defaults filled in: `false` is the dim alone. */
export function resolveBackdrop(b: ModalBackdrop | false | undefined): {
  scale: number | null;
  blur: ModalBlur | null;
} {
  if (b === false) {
    return { scale: null, blur: null };
  }
  const scale = b?.scale ?? MODAL_BACKDROP_DEFAULT.scale;
  const blur = b?.blur ?? MODAL_BACKDROP_DEFAULT.blur;
  return {
    scale: !scale ? null : scale === true ? MODAL_BACKDROP.scale : scale,
    blur: blur || null,
  };
}

/** The backdrop's values. */
export const MODAL_BACKDROP = {
  scale: 0.99,
  /** px, the blur's radius: every overlay's (`backdropBlur`). */
  even: 1.125,
} as const;

/** The backdrop's blur, as a `backdrop-filter` value: the one radius, MODAL_BACKDROP.even. */
export const backdropBlur = () => `blur(${MODAL_BACKDROP.even}px)`;

/** A blur layer's inline style: `backdropBlur`, with its prefixed twin. */
export const backdropBlurStyle = () => ({
  backdropFilter: backdropBlur(),
  WebkitBackdropFilter: backdropBlur(),
});

/** The page's scale for a `backdrop` prop (its default filled in), or null. */
export const backdropScale = (
  b: ModalBackdrop | false | undefined
): number | null => resolveBackdrop(b).scale;

/** At most this many layers are scaled; a page that would need more isn't scaled (the dim and the blur still are). */
export const MODAL_PAGE_MAX_LAYERS = 24;

/**
 * The mark for the app's fixed chrome (the shell's header): under a modal or
 * a tearsheet it dims and blurs with the page, but the page scale leaves it
 * where it is (see "The chrome" above).
 */
export const MODAL_CHROME_ATTR = 'data-cds-modal-chrome';
const CHROME = `[${MODAL_CHROME_ATTR}]`;

/** Marks a launcher besides `launcherButtonRef` and `aria-haspopup="dialog"`: hovered or
 *  focused, it promotes the page ahead of the open (see "The first use" above). */
export const MODAL_LAUNCHER_ATTR = 'data-cds-modal-launcher';
const LAUNCHER = `[aria-haspopup="dialog"], [${MODAL_LAUNCHER_ATTR}]`;

/** Never scaled, never searched: the modals themselves, and what draws no box. */
const NOT_PAGE =
  '.cds-modal-portal, .cds-tearsheet-portal, [data-cds-modal-prewarm], script, style, link, template, noscript, [hidden]';

/**
 * The layers that draw the page: `roots`, split round its fixed elements
 * (see "The page" above). A root holding none is one layer; a root holding
 * some is swapped for its children, each split the same way, so no layer is
 * an ancestor of a fixed element and none of them moves when scaled; a fixed
 * element holding none is a layer itself (it is scaled where it is, about
 * the same centre). `fixed` is the elements no layer may hold (the fixed
 * elements, placed against the viewport, and the chrome), `parentOf` an
 * element's parent below the roots (null at a root), `isBoxless` whether it
 * draws no box of its own (`display: contents`: it is always split), `skip`
 * what is neither a layer nor split (nothing drawn; and the chrome: in
 * `fixed` and `skip` both, its holders are split round it and it is left
 * out). Pure, so a test can run it on any tree; `null` when it would take
 * more than `max` layers.
 */
export function splitPageLayers<T extends { children: ArrayLike<T> }>(
  roots: readonly T[],
  fixed: ReadonlySet<T>,
  parentOf: (el: T) => T | null,
  isBoxless: (el: T) => boolean,
  skip: (el: T) => boolean = () => false,
  max = MODAL_PAGE_MAX_LAYERS
): T[] | null {
  // Every ancestor of a fixed element, up to the roots: those are split.
  const holds = new Set<T>();
  for (const f of fixed) {
    for (let p = parentOf(f); p && !holds.has(p); p = parentOf(p)) {
      holds.add(p);
    }
  }
  const out: T[] = [];
  const visit = (el: T): boolean => {
    if (skip(el)) {
      return true;
    }
    if (!holds.has(el) && !isBoxless(el)) {
      out.push(el);
      return out.length <= max;
    }
    for (const c of Array.from(el.children)) {
      if (!visit(c)) {
        return false;
      }
    }
    return true;
  };
  for (const r of roots) {
    if (!visit(r)) {
      return null;
    }
  }
  return out;
}

/**
 * The page layers the scale moves (see "The page" above): the marked layers
 * (`data-cds-modal-page`), else the body's elements, split round the fixed
 * elements inside them and round the chrome (`data-cds-modal-chrome`, left
 * out: see "The chrome"). Empty when none can be scaled safely (the page
 * then keeps still under the dim and the blur).
 */
export function modalPageLayers(): HTMLElement[] {
  if (typeof document === 'undefined') {
    return [];
  }
  // Found before and nothing the layers depend on has changed since: the same
  // layers (see "The search, kept" below).
  // Changes made in this task are still queued for the watch: read them now.
  if (kept && watch?.takeRecords().some(matters)) {
    forget();
  }
  if (kept && kept.every((el) => el.isConnected)) {
    return kept.slice();
  }
  const layers = findPageLayers();
  keep(layers);
  return layers.slice();
}

/* ── the search, kept ───────────────────────────────────────────────────
 * Finding the layers walks every element of the page (each one's
 * `offsetParent`, and a style read for the few that have none): on a page with
 * a large table, thousands of elements on the open's first frame. So the
 * layers found are kept, and the next open takes them as they are, until
 * something they depend on changes: an element added or removed anywhere in
 * the body, or an element's `class`, `hidden` or `style` changed (any of those
 * can make an element fixed, or take it out of the layout), or the window
 * resized (a media query can). The first such change forgets them and stops
 * watching, so the watch costs nothing after it. Not changes: the modals'
 * own (their portals and the warm-up), the chrome's (never searched),
 * the scale's and the promotion's own writes on the layers, and a style change that only sets
 * custom properties (the kit's rollovers and engines write those every
 * frame; a custom property doesn't place an element).
 * ──────────────────────────────────────────────────────────────────────── */

/** The modals' own elements, and Jump to's out-of-flow layer (sized to its content): what they add or change never touches the layers. */
const OWN =
  '.cds-modal-portal, .cds-tearsheet-portal, [data-cds-modal-prewarm], .cds-jump-to__layer';
let kept: HTMLElement[] | null = null;
let watch: MutationObserver | null = null;

// Forget the kept layers and stop watching. Demoted at once: a promoted layer would hold a fixed
// element added since. Searched again once the page is quiet (and promoted, if an open is still likely).
function forget() {
  kept = null;
  watch?.disconnect();
  window.removeEventListener('resize', forget);
  demotePage();
  queueSearch();
}

/**
 * A style attribute as the layers see it: its custom properties taken out,
 * and on a layer the scale moves, the scale's own `scale`,
 * `transform-origin` and `will-change` too.
 */
function placing(style: string | null, layer: boolean): string {
  return (style ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(
      (d) =>
        d &&
        !d.startsWith('--') &&
        !(layer && /^(scale|transform-origin|will-change)\s*:/.test(d))
    )
    .join(';');
}

/** Whether a mutation can change what the layers are. */
function matters(m: MutationRecord): boolean {
  const t = m.target;
  if (!(t instanceof Element)) {
    return m.type === 'childList';
  }
  if (t.closest(OWN) || t.closest(CHROME)) {
    return false;
  }
  // A launcher's own class or style (its hover) isn't one: it would demote what the hover promoted.
  if (
    (m.attributeName === 'class' || m.attributeName === 'style') &&
    isLauncher(t)
  ) {
    return false;
  }
  if (m.type === 'childList') {
    // A text change, or the modals' own portal coming and going in the body, isn't one.
    const nodes = [...Array.from(m.addedNodes), ...Array.from(m.removedNodes)];
    return nodes.some(
      (n) => n instanceof Element && !n.matches(OWN) && !n.closest(OWN)
    );
  }
  if (m.attributeName === 'style') {
    const layer =
      moved.includes(t as HTMLElement) || !!kept?.includes(t as HTMLElement);
    return (
      placing(m.oldValue, layer) !== placing(t.getAttribute('style'), layer)
    );
  }
  return true;
}

/** Keep `layers` until the page changes (see above). */
function keep(layers: HTMLElement[]) {
  forget();
  if (typeof MutationObserver === 'undefined') {
    return;
  }
  kept = layers;
  watch ??= new MutationObserver((records) => {
    if (records.some(matters)) {
      forget();
    }
  });
  watch.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class', 'hidden', 'style'],
  });
  window.addEventListener('resize', forget, { passive: true });
}

/** The search itself: see `modalPageLayers`. */
function findPageLayers(): HTMLElement[] {
  const marked = Array.from(
    document.querySelectorAll<HTMLElement>('[data-cds-modal-page]')
  );
  const roots = (
    marked.length ? marked : Array.from(document.body.children)
  ).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && !c.matches(NOT_PAGE)
  );
  // The elements no layer may hold: the fixed ones and the chrome.
  const fixed = new Set<Element>();
  const chrome = new Set<Element>();
  const boxless = new Set<Element>();
  for (const root of roots) {
    if (root.matches(CHROME)) {
      chrome.add(root);
      continue;
    }
    // A fixed element has no offsetParent (nor has an element with no box):
    // only those are styled, so the walk reads no style for the rest.
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) => {
        const el = n as Element;
        if (!(el instanceof HTMLElement)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (el.matches(NOT_PAGE)) {
          return NodeFilter.FILTER_REJECT;
        }
        // The chrome, with all it holds: never a layer, never searched.
        if (el.matches(CHROME)) {
          chrome.add(el);
          return NodeFilter.FILTER_REJECT;
        }
        if (el.offsetParent !== null) {
          return NodeFilter.FILTER_ACCEPT;
        }
        const cs = getComputedStyle(el);
        if (cs.display === 'none') {
          return NodeFilter.FILTER_REJECT;
        }
        if (cs.display === 'contents') {
          boxless.add(el);
        }
        if (cs.position === 'fixed') {
          fixed.add(el);
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    if (getComputedStyle(root).display === 'contents') {
      boxless.add(root);
    }
    if (getComputedStyle(root).position === 'fixed') {
      fixed.add(root);
    }
    while (walk.nextNode()) {
      // Each node is read by the filter above.
    }
  }
  const layers = splitPageLayers<Element>(
    roots,
    new Set([...fixed, ...chrome]),
    (el) => (roots.includes(el as HTMLElement) ? null : el.parentElement),
    (el) => boxless.has(el),
    // The chrome, and what draws nothing: not a layer (a boxless element draws its children).
    (el) =>
      chrome.has(el) ||
      !(el instanceof HTMLElement) ||
      el.matches(NOT_PAGE) ||
      (!boxless.has(el) && el.getClientRects().length === 0)
  );
  return (layers ?? []) as HTMLElement[];
}

/* ── the page's scale: one for the page, however many modals ask ───────── */

interface Held {
  token: object;
  scale: number;
}
const held: Held[] = [];
let applied = 1;
/** The layers the scale moved, found as it leaves 1 and kept until it is back (so a later change to the page can't strand one). */
let moved: HTMLElement[] = [];

/** Moves the page's layers to `to` over `ms` on `easing` (0 ms: at once), about the viewport's centre. */
function playPage(to: number, ms: number, easing: string) {
  const from = applied;
  applied = to;
  if (from === to) {
    return;
  }
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  // Found once per hold, when the page is still: none of it is scaled yet.
  if (from === 1 && !moved.some((el) => el.style.scale)) {
    moved = modalPageLayers();
  }
  // Every read first, then every write: a read after a write would restyle the page each time.
  const reads = moved.map((el) => {
    const live = el.getAnimations().filter((a) => a.id === 'cds-modal-page');
    // From where it is (a turn-round mid-way); the viewport's centre in its own box, read untransformed.
    const now = live.length ? getComputedStyle(el).scale : String(from);
    const r =
      to !== 1 && !el.style.transformOrigin ? el.getBoundingClientRect() : null;
    return { el, live, now, r };
  });
  for (const { el, live, now, r } of reads) {
    live.forEach((a) => a.cancel());
    if (to === 1) {
      el.style.removeProperty('scale');
    } else {
      if (r) {
        el.style.transformOrigin = `${vw / 2 - r.left}px ${vh / 2 - r.top}px`;
      }
      el.style.scale = String(to);
    }
    if (ms <= 0) {
      if (to === 1) {
        el.style.removeProperty('transform-origin');
      }
      continue;
    }
    const a = el.animate(
      [{ scale: now === 'none' ? '1' : now }, { scale: String(to) }],
      {
        duration: ms,
        easing,
        id: 'cds-modal-page',
      }
    );
    if (to === 1) {
      a.onfinish = () => el.style.removeProperty('transform-origin');
    }
  }
}

/** The page scaled for `token` (the topmost modal's ask wins while it is up). */
export function holdPageScale(
  token: object,
  scale: number,
  ms: number,
  easing: string
): void {
  if (held.some((h) => h.token === token)) {
    return;
  }
  held.push({ token, scale });
  window.clearTimeout(closeTimer);
  playPage(scale, ms, easing);
}

/** `token` lets go; the page goes back to the next ask, or to 1. */
export function releasePageScale(
  token: object,
  ms: number,
  easing: string
): void {
  const i = held.findIndex((h) => h.token === token);
  if (i < 0) {
    return;
  }
  held.splice(i, 1);
  playPage(held[held.length - 1]?.scale ?? 1, ms, easing);
  // Closed: demoted once the page is back, unless another open is likely by then.
  if (!held.length) {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(settle, ms);
  }
}

/* ── the first use: see "The first use" above ───────────────────────── */

export type BackdropKind = 'modal' | 'tearsheet';

/** The warm-up's strength: half a percent, for WARM_MS. Invisible. */
const WARM_ALPHA = 0.005;
/** ms the warm-up is drawn for (about a dozen frames, the overlay's fade). */
const WARM_MS = 200;
/** ms a changed page waits before it is promoted again, so a page that keeps changing isn't re-rasterised each time. */
const PROMOTE_QUIET_MS = 500;
const warmed = new Set<string>();
/** ms the promotion outlasts the pointer or the focus leaving a launcher (a pointer crossing back keeps it). */
const INTENT_GRACE_MS = 400;
/** The modals and tearsheets mounted that scale the page: the page is searched ahead, and promoted on intent, while any is. */
let promoters = 0;
let promoted: HTMLElement[] = [];
let searchQueued = false;
/** Their launchers (`launcherButtonRef`), besides the ones marked in the DOM. */
const launchers = new Set<() => HTMLElement | null | undefined>();
/** The launcher the pointer is over, and the one with the focus. */
let hovered: Element | null = null;
let focused: Element | null = null;
let graceTimer = 0;
let closeTimer = 0;

const idle = (cb: () => void) =>
  'requestIdleCallback' in window
    ? window.requestIdleCallback(cb, { timeout: 2000 })
    : setTimeout(cb, 200);

const reducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Whether an open is likely or under way: a launcher hovered or focused, or the page held scaled. */
const wanted = () =>
  promoters > 0 && (hovered != null || focused != null || held.length > 0);

/** The page's layers promoted (`will-change: scale`), unless already so. */
function promotePage() {
  if (!promoters || reducedMotion()) {
    return;
  }
  const layers = modalPageLayers();
  // Written after the search: the watch reads `will-change` on a kept layer as the scale's own.
  for (const el of layers) {
    if (!el.style.willChange) {
      el.style.willChange = 'scale';
    }
  }
  promoted = layers;
}

function demotePage() {
  for (const el of promoted) {
    if (el.style.willChange === 'scale') {
      el.style.removeProperty('will-change');
    }
  }
  promoted = [];
}

/** Demoted when no open is likely any more; kept otherwise. */
function settle() {
  if (!wanted()) {
    demotePage();
  }
}

/** Searches the page once it has been quiet for PROMOTE_QUIET_MS, then when idle (and promotes it, if an open is likely). */
function queueSearch() {
  if (searchQueued || !promoters) {
    return;
  }
  searchQueued = true;
  setTimeout(
    () =>
      idle(() => {
        searchQueued = false;
        if (!promoters) {
          return;
        }
        if (wanted()) {
          promotePage();
        } else if (!reducedMotion()) {
          modalPageLayers();
        }
      }),
    PROMOTE_QUIET_MS
  );
}

/** Whether `el` is a launcher itself: marked, or one passed to a modal. */
function isLauncher(el: Element): boolean {
  if (el.matches(LAUNCHER)) {
    return true;
  }
  for (const get of launchers) {
    if (get() === el) {
      return true;
    }
  }
  return false;
}

/** The launcher `target` is in, if it is in one. */
function launcherOf(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) {
    return null;
  }
  const marked = target.closest(LAUNCHER);
  if (marked) {
    return marked;
  }
  for (const get of launchers) {
    const el = get();
    if (el && el.contains(target)) {
      return el;
    }
  }
  return null;
}

function intentIn(e: Event) {
  const l = launcherOf(e.target);
  if (!l) {
    return;
  }
  if (e.type === 'focusin') {
    focused = l;
  } else {
    hovered = l;
  }
  window.clearTimeout(graceTimer);
  promotePage();
}

function intentOut(e: Event) {
  const was = e.type === 'focusout' ? focused : hovered;
  if (!was) {
    return;
  }
  const next = (e as FocusEvent | PointerEvent).relatedTarget;
  // Still inside the launcher (from its label to its icon): not a leave.
  if (next instanceof Node && was.contains(next)) {
    return;
  }
  if (e.type === 'focusout') {
    focused = null;
  } else {
    hovered = null;
  }
  window.clearTimeout(graceTimer);
  graceTimer = window.setTimeout(settle, INTENT_GRACE_MS);
}

const INTENT_EVENTS = [
  ['pointerover', intentIn],
  ['focusin', intentIn],
  ['pointerout', intentOut],
  ['focusout', intentOut],
] as const;

function listen(on: boolean) {
  for (const [type, fn] of INTENT_EVENTS) {
    if (on) {
      document.addEventListener(type, fn, { capture: true, passive: true });
    } else {
      document.removeEventListener(type, fn, { capture: true });
    }
  }
}

/** The first open's work, done while idle, and the promotion on intent from `launcher` and the
 *  marked launchers (see "The first use" above). Returns its release, for the unmount. */
export function prewarmBackdrop(
  kind: BackdropKind,
  backdrop: { blur: ModalBlur | null; scale: number | null },
  launcher?: () => HTMLElement | null | undefined
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const scales = backdrop.scale != null;
  if (scales) {
    if (!promoters) {
      listen(true);
    }
    promoters++;
    if (launcher) {
      launchers.add(launcher);
    }
    queueSearch();
  }
  const key = `${kind}:${backdrop.blur ?? 'none'}:${scales}`;
  if (!warmed.has(key)) {
    warmed.add(key);
    idle(() => drawWarmUp(kind, backdrop.blur, backdrop.scale));
  }
  let released = false;
  return () => {
    if (released || !scales) {
      return;
    }
    released = true;
    promoters--;
    if (launcher) {
      launchers.delete(launcher);
    }
    if (!promoters) {
      listen(false);
      hovered = focused = null;
      window.clearTimeout(graceTimer);
      demotePage();
    }
  };
}

/** A copy of the open, drawn at 0.5% for WARM_MS. */
function drawWarmUp(
  kind: BackdropKind,
  blur: ModalBlur | null,
  scale: number | null
) {
  // A hidden page draws nothing: wait to be shown.
  if (document.visibilityState === 'hidden') {
    document.addEventListener(
      'visibilitychange',
      () => drawWarmUp(kind, blur, scale),
      {
        once: true,
      }
    );
    return;
  }
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const el = (css: string, text = '') => {
    const e = document.createElement('div');
    e.style.cssText = css;
    if (text) {
      e.textContent = text;
    }
    return e;
  };
  const fade = (e: HTMLElement, from: Keyframe = {}, to: Keyframe = {}) =>
    e.animate(
      [
        { opacity: 0, ...from },
        { opacity: WARM_ALPHA, ...to },
      ],
      {
        duration: WARM_MS * 0.75,
        fill: 'forwards',
      }
    );
  const host = el(
    'position:fixed;inset:0;pointer-events:none;z-index:8000;overflow:hidden'
  );
  host.setAttribute('aria-hidden', 'true');
  host.inert = true;
  host.dataset.cdsModalPrewarm = kind;
  const text =
    'color:var(--cds-text-primary,#161616);font:400 14px/20px "IBM Plex Sans",system-ui,sans-serif';
  // The page, drawn back: a composited block of text going to its scale.
  if (scale != null) {
    const page = el(
      `position:absolute;inset:0;background:var(--cds-background,#fff);${text};will-change:scale`,
      'Page'
    );
    fade(page, { scale: '1' }, { scale: String(scale) });
    host.append(page);
  }
  if (blur) {
    const b = el(`position:absolute;inset:0;backdrop-filter:${backdropBlur()}`);
    b.style.setProperty('-webkit-backdrop-filter', backdropBlur());
    fade(b);
    host.append(b);
  }
  const dim = el(
    'position:absolute;inset:0;background:var(--cds-overlay,rgb(22 22 22 / 0.5))'
  );
  fade(dim);
  host.append(dim);
  const fill = 'background:var(--cds-layer-01,#f4f4f4)';
  const rule = 'var(--cds-border-subtle-01,#c6c6c6)';
  // The kit's own pill button (its rollover fill is drawn from gradients), as the footer's.
  const button = document.createElement('button');
  button.type = 'button';
  button.tabIndex = -1;
  button.className =
    'cds-btn cds-btn--lg cds-btn--primary cds-btn--full cds-btn--no-icon';
  button.textContent = 'Add';
  const foot = el('position:absolute;right:16px;bottom:16px');
  foot.append(button);
  const heading = el(
    `position:absolute;left:16px;top:16px;${text};font-size:20px;line-height:28px`,
    'Heading'
  );
  // The content: riding in under the snap's moving soft edge (two masks, intersected, moving).
  const body = el(`position:absolute;inset:56px 16px 16px;${text}`, 'Body');
  const edge = (to: string) =>
    `linear-gradient(${to}transparent 0,#000 16px,#000 calc(100% - 16px),transparent 100%)`;
  body.style.maskImage = `${edge('')},${edge('to right,')}`;
  body.style.maskRepeat = 'no-repeat';
  body.style.maskComposite = 'intersect';
  body.animate(
    [
      {
        translate: '0 16px',
        maskSize: '300% 120%, 120% 300%',
        maskPosition: '50% 0, 0 50%',
      },
      {
        translate: '0 0',
        maskSize: '300% 140%, 140% 300%',
        maskPosition: '50% 50%, 50% 50%',
      },
    ],
    { duration: WARM_MS * 0.75, fill: 'forwards' }
  );
  const ns = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(ns, 'svg');
  icon.setAttribute('viewBox', '0 0 32 32');
  icon.setAttribute(
    'style',
    'position:absolute;right:16px;top:16px;width:16px;height:16px;fill:currentColor'
  );
  const path = document.createElementNS(ns, 'path');
  path.setAttribute(
    'd',
    'M17.4 16 24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6z'
  );
  icon.append(path);
  // The frame's snap: a rounded clip growing.
  const clip = (e: HTMLElement, from: string) =>
    e.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0 round 16px)' }], {
      duration: WARM_MS * 0.75,
      fill: 'forwards',
    });
  if (kind === 'modal') {
    const w = Math.min(vw * 0.84, 672);
    const surface = el(
      `position:absolute;left:${(vw - w) / 2}px;top:${vh / 4}px;width:${w}px;height:${vh / 2}px;border-radius:16px;${fill};box-shadow:inset 0 0 0 1px ${rule};isolation:isolate`
    );
    surface.append(heading, body, icon, foot);
    fade(surface, { scale: '0.92' }, { scale: '1' });
    clip(surface, 'inset(8% 8% 8% 8% round 16px)');
    host.append(surface);
  } else {
    // The sheet: its frame grows under a clip from its bottom edge; the scrim dims a sheet below another.
    const sheet = el(
      `position:absolute;left:64px;right:64px;top:48px;bottom:0;isolation:isolate`
    );
    const frame = el(
      `position:absolute;inset:0;z-index:-1;border-radius:16px 16px 0 0;${fill};box-shadow:inset 0 1px 0 ${rule},inset 1px 0 0 ${rule},inset -1px 0 0 ${rule}`
    );
    clip(frame, 'inset(100% 20% 0 20% round 16px)');
    const scrim = el(
      'position:absolute;inset:0;z-index:3;border-radius:16px 16px 0 0;background:var(--cds-overlay,rgb(22 22 22 / 0.5))'
    );
    fade(scrim);
    sheet.append(frame, heading, body, icon, foot, scrim);
    fade(sheet, { translate: '0 16px' }, { translate: '0 0' });
    host.append(sheet);
  }
  document.body.append(host);
  setTimeout(() => host.remove(), WARM_MS);
}
