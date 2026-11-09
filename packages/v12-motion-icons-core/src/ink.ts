/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Ink: make every part of an icon — strokes included — take the colour a
 * consumer sets as the SVG's `fill`.
 *
 * Carbon colours icons by setting `fill` on the `<svg>` (e.g. header actions:
 * `.cds--header__action svg { fill: $icon-secondary }`, `$icon-primary` on
 * hover). Carbon's own icons are all filled paths that inherit that fill. Ours
 * also have strokes, and CSS has no way for a stroke to reference a fill
 * (`context-fill` only works in markers/`<use>`), so a stroked icon would stay
 * `currentColor` — e.g. link-blue inside a ghost button.
 *
 * Structure: the root `<svg>` carries `fill="currentColor"` (Carbon's
 * convention) and all content sits in `<g data-mc-ink>`, which holds the
 * authored paint defaults. When the SVG's computed `fill` differs from its
 * `color`, something outside set it, so that value is written to the ink
 * group's `color` and every `currentColor` fill and stroke follows. The
 * consumer's own `color`/`style` on the SVG is never touched.
 *
 * Staying in sync: a `fill` change from any source (hover/focus/active
 * rules, class changes, theme custom properties, media queries) is observed
 * through `transitionrun`/`transitionend` on the SVG. If nothing already
 * transitions `fill`, an imperceptible 1ms transition is added so those
 * events fire; if something does (Carbon may fade fill), the ink is synced
 * every frame for the duration.
 *
 * When it first reads: once the browser has resolved the page's style for
 * the frame the icon appears in (see `whenStyled`). Reading at attach would
 * follow the writes of the icon attached before it, so a list mounting N
 * icons would resolve the page's style N times; read later, every new icon is
 * read first and then every ink is written, and nothing is resolved early.
 */
import { framePassed, nextFrame, onFrame } from './engine/animate';

export const INK_ATTR = 'data-mc-ink';

function isPaintColor(value: string): boolean {
  return value !== '' && value !== 'none' && !value.startsWith('url(');
}

function parseSeconds(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return value.trim().endsWith('ms') ? n / 1000 : n;
}

/** True when the element's computed transitions already cover `fill`. */
function transitionsFill(cs: CSSStyleDeclaration): boolean {
  const props = (cs.transitionProperty || '').split(',').map((p) => p.trim());
  const durations = (cs.transitionDuration || '')
    .split(',')
    .map((d) => d.trim());
  return props.some(
    (prop, i) =>
      (prop === 'fill' || prop === 'all') &&
      parseSeconds(durations[i % durations.length] ?? '0') > 0
  );
}

/** Svgs waiting for their first read: each one's read (which returns its writes), and the observer it waits on. */
const waiting = new Map<
  Element,
  { read: () => () => void; by?: ResizeObserver }
>();
/** Svgs attached since the last frame, observed on the next. */
let next: Element[] = [];

/**
 * Run `read` once the browser has resolved style and layout for the frame
 * `svg` first renders in, before that frame paints. The svgs attached since
 * the last frame are observed together at the start of the next, by a
 * ResizeObserver made then; its first notice comes after that frame's style
 * and layout, and after the page's older observers (a rollover measuring
 * the control just hovered) have read. Every svg is read before any is
 * written, so reading costs no style recalc of its own. An svg that isn't
 * rendered (inside `display: none`) is read when it first is. Returns the
 * cancel.
 *
 * At once instead (one read, then the writes, which may cost a style recalc
 * as it always did): without ResizeObserver (a test DOM), and for an svg
 * attached after this frame's pass of the shared loop has run (in a later
 * frame callback, a ResizeObserver callback, a render flushed inside one),
 * which the next frame's pass would ink a frame after it first paints.
 */
function whenStyled(svg: Element, read: () => () => void): () => void {
  if (typeof ResizeObserver !== 'function' || framePassed()) {
    read()();
    return () => {};
  }
  waiting.set(svg, { read });
  if (next.push(svg) === 1) {
    nextFrame(observeNext);
  }
  return () => stopWaiting(svg);
}

function observeNext() {
  const by = new ResizeObserver(onStyled);
  for (const svg of next) {
    const w = waiting.get(svg);
    if (!w || w.by) {
      continue;
    }
    w.by = by;
    by.observe(svg);
  }
  next = [];
}

function onStyled(entries: ResizeObserverEntry[]) {
  const writes = entries.map((e) => {
    const w = waiting.get(e.target);
    stopWaiting(e.target);
    return w?.read();
  });
  for (const write of writes) {
    write?.();
  }
}

function stopWaiting(el: Element) {
  const w = waiting.get(el);
  if (!w) {
    return;
  }
  waiting.delete(el);
  w.by?.unobserve(el);
}

export function attachInk(svg: SVGSVGElement): () => void {
  const ink = Array.from(svg.children).find((c) => c.hasAttribute(INK_ATTR)) as
    | SVGGElement
    | undefined;
  if (
    !ink ||
    typeof window === 'undefined' ||
    typeof window.getComputedStyle !== 'function'
  ) {
    return () => {};
  }

  // While the fill transitions, the ink follows it every frame, on the engine's shared loop (no frame loop of its own).
  let stop: (() => void) | null = null;

  // Reads the colours now; the returned write paints the ink (so a caller can read everything before it writes).
  const readInk = (cs: CSSStyleDeclaration) => {
    const fill = cs.fill;
    const color = isPaintColor(fill) && fill !== cs.color ? fill : '';
    return () => {
      if (color) {
        ink.style.color = color;
      } else {
        ink.style.removeProperty('color');
      }
    };
  };
  const sync = () => readInk(window.getComputedStyle(svg))();
  const isFillEvent = (e: Event) =>
    e.target === svg && (e as TransitionEvent).propertyName === 'fill';
  const onRun = (e: Event) => {
    if (!isFillEvent(e)) {
      return;
    }
    stop ??= onFrame(sync);
  };
  const onEnd = (e: Event) => {
    if (!isFillEvent(e)) {
      return;
    }
    stop?.();
    stop = null;
    sync();
  };
  svg.addEventListener('transitionrun', onRun);
  svg.addEventListener('transitionend', onEnd);
  svg.addEventListener('transitioncancel', onEnd);

  let previousTransition: string | null = null;
  // One style read, then the writes: the transition added here doesn't change the computed fill or color, so the
  // first sync reads them with the rest (reading after the write would resolve the style a second time).
  const cancel = whenStyled(svg, () => {
    const cs = window.getComputedStyle(svg);
    const writeInk = readInk(cs);
    let transition: string | null = null;
    if (!transitionsFill(cs)) {
      const existing = (cs.transitionDuration || '')
        .split(',')
        .some((d) => parseSeconds(d) > 0)
        ? cs.transition
        : '';
      transition = existing
        ? `${existing}, fill 1ms linear`
        : 'fill 1ms linear';
    }
    return () => {
      if (transition !== null) {
        previousTransition = svg.style.transition;
        svg.style.transition = transition;
      }
      writeInk();
    };
  });

  return () => {
    cancel();
    svg.removeEventListener('transitionrun', onRun);
    svg.removeEventListener('transitionend', onEnd);
    svg.removeEventListener('transitioncancel', onEnd);
    stop?.();
    if (previousTransition !== null) {
      svg.style.transition = previousTransition;
    }
  };
}
