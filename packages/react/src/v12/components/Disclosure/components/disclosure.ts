/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  beginLayout,
  distanceTokens,
  durationStepForDistance,
  inLayout,
  motionTokens,
  stepDown,
  type LayoutTransaction,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { inertProps } from '@carbon-labs/react-util';
// Imported here, where the hooks are, not from the barrel: a production build
// drops a side-effect-free package's barrel, and its CSS with it (the
// accordion's bodies shipped unstyled, every item open).
import './disclosure.scss';

/* ============================================================================
 * Disclosure: a body that opens and shuts under what discloses it. The one
 * implementation of the kit's two expanding-motion standards
 * (duration follows travel; expanding content moves with the opening), used by
 * the Accordion's items, the data table's expandable rows, the
 * ExpandableTile and SideNav's groups (on its own markup and styles: the
 * clip and the content are found as the body's child and grandchild). The
 * contextual bar moves its own content under its snap on the same arrival
 * (`disclosureArrival`).
 * disclosure.scss has the look. Three elements:
 *
 *   body      a one-row grid, 0fr shut, 1fr open: its height moves, the rows
 *             inside never reflow
 *     clip    clips, under a soft bottom edge while it moves
 *       content   what's disclosed (its padding inside the clip, so a shut
 *                 body is 0px)
 *
 *   clock     the travel's step (the motion seam's `durationStepForDistance`:
 *             under 24px fast-02, under 120px moderate-01, under 480px
 *             moderate-02, under 900px moderate-03, else slow-01), opening on
 *             entrance-productive; shutting one step faster (`stepDown`) on
 *             exit-productive. Travel is from where the body is, its live
 *             height, so a turn mid-move takes the step of what's left
 *   one motion  every body that changes in one commit under one root is one
 *             motion on one clock: the step of the farthest anything in it
 *             travels. Each body travels its own distance, and what's below
 *             a body travels the sum of the bodies above it, so expand all
 *             takes the total travel's step and a swap (one opening as
 *             another shuts) the larger one's. A swap is on
 *             standard-productive (one thing grows as another shrinks, a
 *             move within the view) and doesn't step down
 *   cap       a motion of more than one body (expand all, collapse all, a
 *             swap) is never slower than `MULTI_BODY_CAP`, moderate-02
 *             (220ms), before the shut's step down: so expand all is at
 *             most 220ms and collapse all 160ms however long the table,
 *             so it feels snappy. One body alone
 *             keeps its travel's step
 *   edge      while it moves, the clip's bottom fades over
 *             `min(16px, h, H − h)` for a clip h tall of its open H
 *             (`--cds-motion-soft-edge`; the data table's): it grows over the
 *             first 16px of travel and closes over the last, so it's gone on
 *             the frame the body lands and nothing pops when the mask goes
 *   clip      clipped whenever it isn't open and landed: shutting, shut, and
 *             until it hides (an unclipped 0px body would paint its content
 *             over what's below for a frame)
 *   content   moves with the opening, along its long axis (y, the way the
 *             body grows; the axial rule): it waits 8px
 *             above (`distance-sm`) and comes down into place from the
 *             opening's first frame, over one duration token longer than the
 *             opening's clock (`disclosureContentMs`), entrance-productive.
 *             The body lands first; the content is the last thing to settle.
 *             On the way out it doesn't move: the edge closes over it where
 *             it is, and it goes back above only once the body has closed.
 *             A `data-hold-edge` body keeps its top edge still while a body
 *             above it in the motion moves it (`holdEdge`), by layout
 *   moves     one layout transaction on the root for the motion, so the
 *             selection, rollover and icon snap under it hold and settle once
 *             everything has landed (the content too)
 *   reduced   no travel: open or shut at once, no edge; the content fades in
 *             on the reduced clock (fast-02 x 0.5)
 *   still     `data-still` on an ancestor (or the body): no transitions (a
 *             first paint); `still` to `useDisclosureBody`: something else
 *             moves it (SideNav's rail), so it's open or shut at once
 *
 * The clocks are set as each move starts: the state change starts the CSS
 * transitions, and the moves of one commit are gathered (a microtask, once
 * every layout effect has run, before the frame paints), measured, and their
 * running transitions given the motion's clock (`getAnimations`,
 * `updateTiming`). The step's time is read from the token's CSS variable, so
 * a lab's slow motion comes with it.
 * ========================================================================== */

type DurationName = keyof typeof motionTokens.duration;

/** The CSS easing of a curve token where `el` is: its variable, else the token. */
function easingOf(el: Element, name: keyof typeof motionTokens.easing): string {
  const v = getComputedStyle(el)
    .getPropertyValue(`--cds-motion-easing-${name}`)
    .trim();
  return v || easingCss(name);
}

/** A duration token's time where `el` is, ms: its CSS variable (a lab's slow motion), else the token. */
export function tokenMs(el: Element, token: DurationName): number {
  const v = getComputedStyle(el)
    .getPropertyValue(`--cds-motion-duration-${token}`)
    .trim();
  const n = parseFloat(v);
  if (!v || Number.isNaN(n)) {
    return motionTokens.duration[token];
  }
  return /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n;
}

/** The CSS transition of `property` running on `el` itself (started by the change just committed). */
export function transitionOf(
  el: Element,
  property: string
): CSSTransition | undefined {
  return el
    .getAnimations()
    .find(
      (a): a is CSSTransition =>
        a instanceof CSSTransition && a.transitionProperty === property
    );
}

/**
 * When the content starts moving in, as a share of the opening's clock: at
 * once, on the opening's first frame, so it moves from the start and runs
 * past the opening.
 */
export const ARRIVAL_AT = 0;

/** The duration steps in order, shortest first (the ones a content clock can take). */
const CONTENT_STEPS: readonly DurationName[] = [
  'fast-01',
  'fast-02',
  'moderate-01',
  'moderate-02',
  'moderate-03',
  'slow-01',
  'slow-02',
  'slow-03',
];

/**
 * The content's clock under an opening `clock` ms long: the shortest duration
 * token longer than it (a 120ms opening: 160ms; 160ms: 220ms; 220ms: 300ms;
 * 300ms: 400ms; 400ms: 520ms), so the content starts with the opening and
 * runs one token past it. Past the longest token, `clock` itself. The tokens'
 * times are their CSS variables where `el` is (a lab's slowed tokens), or the
 * tokens times `timeScale` when given. The disclosure's twin of the snap
 * entrance's `snapEntranceContentMs` (one rule: content from the start, one
 * token longer than the longest clock).
 */
export function disclosureContentMs(
  el: Element,
  clock: number,
  timeScale?: number
): number {
  for (const t of CONTENT_STEPS) {
    const ms =
      timeScale != null ? motionTokens.duration[t] * timeScale : tokenMs(el, t);
    if (ms > clock + 0.5) {
      return ms;
    }
  }
  return clock;
}

export interface DisclosureArrival {
  /** How far back it waits, px (`distance-sm`), against the direction of growth. */
  distance: number;
  /** When it starts, ms after the opening does: 0, with the opening. */
  delay: number;
  /** Its move into place, ms: one duration token longer than the opening's clock (`disclosureContentMs`). */
  duration: number;
  /** Its curve: entrance-productive. */
  easing: string;
}

/**
 * The content's arrival under an opening `clock` ms long ("Expanding content
 * moves with the opening", the axial rule): it waits 8px back along the
 * opening's axis, starts with the opening and moves into place over one
 * duration token longer than the clock (`disclosureContentMs`) on
 * entrance-productive, so it settles just after the opening lands. For a
 * component that moves its own content (the page header's details, a
 * notification arriving in the panel); a disclosure body's is in
 * disclosure.scss, timed by `retimeDisclosure`.
 * `timeScale`: slow motion as a multiplier, else the tokens' CSS variables
 * where `el` is.
 */
export function disclosureArrival(
  el: Element,
  clock: number,
  { timeScale }: { timeScale?: number } = {}
): DisclosureArrival {
  return {
    distance: distanceTokens.sm,
    delay: clock * ARRIVAL_AT,
    duration: disclosureContentMs(el, clock, timeScale),
    easing: easingOf(el, 'entrance-productive'),
  };
}

/** A body's hold (`holdEdge`), found again on a turn. */
export const HOLD_ID = 'cds-disclosure-hold';

// Where a stylesheet's `@property` isn't applied, the hold still interpolates as a length.
try {
  CSS.registerProperty({
    name: '--cds-disclosure-hold',
    syntax: '<length>',
    inherits: false,
    initialValue: '0px',
  });
} catch {
  // Registered already, or no CSS Properties API (a test DOM): the stylesheet's rule stands.
}

/** The held offset where the body is now, px (disclosure.scss). */
const holdOf = (body: Element) =>
  parseFloat(
    getComputedStyle(body).getPropertyValue('--cds-disclosure-hold')
  ) || 0;

/** A `data-hold-edge` body keeps its top edge still while bodies above it move it `push` px: by layout
 *  (`--cds-disclosure-hold` on `top`), on the frame of the rows it cancels; a transform drifted under load. */
function holdEdge(
  body: HTMLElement,
  push: number,
  open: boolean,
  t: DisclosureRetimed
) {
  const prev = body.getAnimations().find((a) => a.id === HOLD_ID);
  const cur = holdOf(body);
  prev?.cancel();
  // Opening: held where it lands. Shutting: held where it is now.
  const [from, to] = open ? [push, 0] : [cur, cur - push];
  const hold = body.animate(
    [
      { '--cds-disclosure-hold': `${from}px` },
      { '--cds-disclosure-hold': `${to}px` },
    ],
    { duration: t.clock, easing: t.easing, fill: 'forwards', id: HOLD_ID }
  );
  t.finished.then(
    () => hold.cancel(),
    () => {}
  );
}

/** The signed travel of the moving bodies before `body` (not its ancestors): how far its top edge goes. */
function pushOn(
  body: HTMLElement,
  moving: readonly { body: HTMLElement; travel: number }[]
): number {
  let push = 0;
  for (const m of moving) {
    if (m.body === body || m.body.contains(body)) {
      continue;
    }
    if (
      m.body.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      push += m.travel;
    }
  }
  return push;
}

/** The body's clip and its content: body > clip > content. */
const contentOf = (body: Element) =>
  body.firstElementChild?.firstElementChild as HTMLElement | null;

export type DisclosureKind = 'open' | 'shut' | 'swap';

export interface DisclosureTiming {
  /** The motion's duration step. */
  token: DurationName;
  /** All opening, all shutting, or both (a swap). */
  kind: DisclosureKind;
  /** The farthest anything in the motion travels, px. */
  travel: number;
  /** The travel's step is slower than `MULTI_BODY_CAP`, so the cap sets the clock. */
  capped: boolean;
}

/**
 * The slowest step a motion of more than one body takes (expand all,
 * collapse all, a swap), before a shut's step down: moderate-02, 220ms, the
 * step of one ordinary body (120-480px). Each body only grows its own
 * height; the long travel is the push of what's below the last one, so the
 * one command lands on one body's clock (the multi-body cap), so it feels snappy.
 */
export const MULTI_BODY_CAP: DurationName = 'moderate-02';

/** `token`, or `cap` when `token` is slower. */
function capStep(token: DurationName, cap: DurationName): DurationName {
  return motionTokens.duration[token] > motionTokens.duration[cap]
    ? cap
    : token;
}

/**
 * One motion's clock, from its bodies' travels in document order (px,
 * opening positive, shutting negative): the step of the farthest travel,
 * each body's own or what's below it (the sum above), capped at
 * `MULTI_BODY_CAP` when more than one body moves, shutting one step faster.
 * A swap (both ways) takes its step without the step down.
 */
export function disclosureTiming(travels: readonly number[]): DisclosureTiming {
  let sum = 0;
  let far = 0;
  for (const t of travels) {
    sum += t;
    far = Math.max(far, Math.abs(t), Math.abs(sum));
  }
  const opens = travels.some((t) => t > 0);
  const shuts = travels.some((t) => t < 0);
  const kind: DisclosureKind =
    opens && shuts ? 'swap' : shuts ? 'shut' : 'open';
  const bySteps = durationStepForDistance(far) as DurationName;
  const step = travels.length > 1 ? capStep(bySteps, MULTI_BODY_CAP) : bySteps;
  return {
    token: kind === 'shut' ? (stepDown(step) as DurationName) : step,
    kind,
    travel: far,
    capped: step !== bySteps,
  };
}

/** A body's height in layout pixels, as its content's offsetHeight is: on a scaled stage the box on screen is smaller. */
function layoutHeight(body: Element): number {
  return parseFloat(getComputedStyle(body).height) || 0;
}

/**
 * How far a body's height has to travel, signed: from where it is to open
 * (its content's height) or shut (0, or `--cds-disclosure-shut` for a body
 * that rests partly open: a collapsed multi-line CodeSnippet).
 */
export function travelOf(body: Element, open: boolean): number {
  const content = contentOf(body);
  const h = layoutHeight(body);
  const shut =
    parseFloat(
      getComputedStyle(body).getPropertyValue('--cds-disclosure-shut')
    ) || 0;
  const to = open && content ? content.offsetHeight : shut;
  return to - h;
}

export interface DisclosureRetimed {
  /** The body's clock, ms. */
  clock: number;
  /** Its curve. */
  easing: string;
  /** When everything has landed, ms from now: the body, or the content's arrival when that's later. */
  land: number;
  /** Settles when the body and its content's arrival have finished; rejects when a turn cancels either. */
  finished: Promise<unknown>;
}

/**
 * Gives one body's running transitions the motion's clock and curve, and
 * its content's arrival: opening, it starts with the body and runs
 * `contentMs` (default one duration token longer than the clock,
 * `disclosureContentMs`), its slide and any fade it has (a summary line's);
 * shutting, its reset back above waits to the body's end, then runs at once. Writes the open height the soft edge reads
 * (`--cds-disclosure-open`). Null when the body isn't moving.
 */
export function retimeDisclosure(
  body: HTMLElement,
  open: boolean,
  clock: number,
  easing: string | null,
  property = 'grid-template-rows',
  contentMs?: number
): DisclosureRetimed | null {
  const t = transitionOf(body, property);
  if (!t) {
    return null;
  }
  t.effect?.updateTiming(
    easing ? { duration: clock, easing } : { duration: clock }
  );
  const content = contentOf(body);
  if (content) {
    body.style.setProperty(
      '--cds-disclosure-open',
      `${content.offsetHeight}px`
    );
  }
  const slide = content ? transitionOf(content, 'translate') : undefined;
  let land = clock;
  const done: Promise<unknown>[] = [t.finished];
  if (open && content) {
    // From the opening's first frame, one token past it (the axial rule).
    const ms = contentMs ?? disclosureContentMs(body, clock);
    for (const arrive of [slide, transitionOf(content, 'opacity')]) {
      if (!arrive) {
        continue;
      }
      arrive.effect?.updateTiming({ delay: clock * ARRIVAL_AT, duration: ms });
      const timing = arrive.effect?.getComputedTiming();
      land = Math.max(
        land,
        Number(timing?.delay ?? 0) + Number(timing?.duration ?? 0)
      );
      done.push(arrive.finished);
    }
  } else if (slide && !open) {
    // Held where it is until the body has closed over it, then back above at once. The hold
    // is the slide's own timing (to the body's end), so a frame audit that seeks it sees it.
    const end = Number(t.effect?.getComputedTiming().endTime);
    slide.effect?.updateTiming({
      delay: Number.isFinite(end) ? end : clock,
      duration: 0,
    });
  }
  return {
    clock,
    easing: easing ?? getComputedStyle(body).transitionTimingFunction,
    land,
    finished: Promise.all(done),
  };
}

export interface DisclosureMoves {
  /**
   * A body's state changed (from a layout effect): its move joins every
   * other body under the same root changing in this commit as one motion.
   * `landed` hears it land.
   */
  move: (body: HTMLElement, open: boolean, landed: () => void) => void;
}

interface Queued {
  body: HTMLElement;
  open: boolean;
  landed: () => void;
  gen: number;
}

export interface DisclosureMoveOptions {
  /** The transaction's reason, or one from how many bodies move together. Default `disclosure`. */
  reason?: string | ((bodies: number) => string);
  /** The motion's transaction ended: everything has landed. */
  onEnd?: () => void;
  /**
   * The motion's clock is set (its bodies retimed), before the frame paints: for a container
   * to retime what moves with its bodies (SideNav's ghost containers).
   */
  onTimed?: (clock: number, timing: DisclosureTiming) => void;
  /**
   * Slow motion: the clock is the duration token times this. Without it, the
   * token's CSS variable where the root is (a page's slowed token variables).
   */
  timeScale?: number;
}

/** One root's moves: this commit's queue, the bodies in flight, its transaction. */
interface RootMoves {
  queue: Queued[];
  gens: Map<HTMLElement, number>;
  timers: Map<HTMLElement, number>;
  tx: LayoutTransaction | null;
  endAt: number;
  options: DisclosureMoveOptions;
}

const roots = new WeakMap<HTMLElement, RootMoves>();

function rootMoves(root: HTMLElement): RootMoves {
  let r = roots.get(root);
  if (!r) {
    r = {
      queue: [],
      gens: new Map(),
      timers: new Map(),
      tx: null,
      endAt: 0,
      options: {},
    };
    roots.set(root, r);
  }
  return r;
}

function land(r: RootMoves, item: Queued) {
  if (r.gens.get(item.body) !== item.gen) {
    return;
  }
  r.gens.delete(item.body);
  window.clearTimeout(r.timers.get(item.body));
  r.timers.delete(item.body);
  item.body
    .getAnimations()
    .find((a) => a.id === HOLD_ID)
    ?.cancel();
  item.landed();
  if (r.gens.size) {
    return;
  }
  r.tx?.end();
  r.tx = null;
  r.options.onEnd?.();
}

/** This commit's moves under `root`, as one motion (a microtask, once every layout effect has run). */
function runMoves(root: HTMLElement, r: RootMoves) {
  const items = r.queue.splice(0);
  const moving: (Queued & { travel: number })[] = [];
  for (const item of items) {
    const travel = transitionOf(item.body, 'grid-template-rows')
      ? travelOf(item.body, item.open)
      : 0;
    if (root.isConnected && Math.abs(travel) >= 0.5) {
      moving.push({ ...item, travel });
    } else {
      land(r, item);
    }
  }
  if (!moving.length) {
    return;
  }
  moving.sort((a, b) =>
    a.body.compareDocumentPosition(b.body) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1
  );
  const timing = disclosureTiming(moving.map((m) => m.travel));
  const scale = r.options.timeScale;
  let clock =
    scale != null
      ? motionTokens.duration[timing.token] * scale
      : tokenMs(root, timing.token);
  let easing =
    timing.kind === 'swap' ? easingOf(root, 'standard-productive') : null;
  // Inside an outer transaction (a reflow round it): its clock, so it lands with it.
  const outer = inLayout(root);
  if (outer && outer.root !== root) {
    clock = Math.max(1, outer.remaining());
    easing = outer.easing;
  }
  // The content's clock: one token past the opening's (the axial rule).
  const contentMs = disclosureContentMs(root, clock, scale);
  let last = 0;
  let curve = '';
  const landing: [Queued, DisclosureRetimed][] = [];
  for (const m of moving) {
    const t = retimeDisclosure(
      m.body,
      m.open,
      clock,
      easing,
      undefined,
      contentMs
    );
    if (!t) {
      land(r, m);
    } else {
      landing.push([m, t]);
      last = Math.max(last, t.land);
      curve ||= t.easing;
    }
  }
  if (!landing.length) {
    return;
  }
  r.options.onTimed?.(clock, timing);
  const now = performance.now();
  const running = r.tx?.state() === 'running';
  r.endAt = Math.max(now + last, running ? r.endAt : 0);
  r.tx = beginLayout(root, {
    ms: r.endAt - now,
    easing: curve,
    lead: landing[0]![0].body,
    reason:
      typeof r.options.reason === 'function'
        ? r.options.reason(landing.length)
        : (r.options.reason ?? 'disclosure'),
    reduced: false,
  });
  for (const [m, t] of landing) {
    if (m.body.hasAttribute('data-hold-edge')) {
      const push = pushOn(m.body, moving);
      if (Math.abs(push) >= 0.5) {
        holdEdge(m.body, push, m.open, t);
      }
    }
    t.finished.then(
      () => land(r, m),
      () => {}
    );
    // At the latest well after its clock (a transition that never ends: hidden).
    window.clearTimeout(r.timers.get(m.body));
    r.timers.set(
      m.body,
      window.setTimeout(() => land(r, m), t.land * 2 + 250)
    );
  }
}

/**
 * Queue a body's move under `root`: every body under one root that changes
 * in one commit is one motion on one clock (`disclosureTiming`), and one
 * layout transaction on `root` covers the motion, so the selection, rollover
 * and icon snap under it hold and settle once everything has landed. A move
 * that starts while one runs turns it, on the clock that lands last; it ends
 * when the last body lands (`onEnd`).
 */
export function moveDisclosure(
  root: HTMLElement,
  body: HTMLElement,
  open: boolean,
  landed: () => void,
  options: DisclosureMoveOptions = {}
): void {
  const r = rootMoves(root);
  r.options = options;
  const gen = (r.gens.get(body) ?? 0) + 1;
  r.gens.set(body, gen);
  r.queue.push({ body, open, landed, gen });
  if (r.queue.length === 1) {
    queueMicrotask(() => runMoves(root, r));
  }
}

/**
 * The moves of bodies under a root (`rootRef`, or a body's root found from
 * it: a table row's table), for `useDisclosureBody`, with `options` (read
 * as each move is queued).
 */
export function useDisclosureMoves(
  root:
    | RefObject<HTMLElement | null>
    | ((body: HTMLElement) => HTMLElement | null),
  options: DisclosureMoveOptions = {}
): DisclosureMoves {
  const rootLatest = useLatest(root);
  const optionsRef = useLatest(options);
  const move = useCallback(
    (body: HTMLElement, open: boolean, landed: () => void) => {
      const r = rootLatest.current;
      const el = typeof r === 'function' ? r(body) : r.current;
      if (!el) {
        return landed();
      }
      moveDisclosure(el, body, open, landed, optionsRef.current);
    },
    [rootLatest, optionsRef]
  );
  return useMemo(() => ({ move }), [move]);
}

export interface DisclosureBody {
  /** At rest in its state: open and landed (the content too), or shut and closed. */
  landed: boolean;
  /** Open, or still closing: what hides a shut body (a table row) waits for this to go false. */
  present: boolean;
  /** For the body (`.cds-disclosure__body`). */
  bodyProps: {
    'data-open'?: true;
    'data-unclipped'?: true;
    'data-reduced'?: true;
    /** Shut: inert (`inertProps`, React 18 and 19 alike). */
    inert?: boolean;
  };
}

/**
 * One body's state (`ref` is the body). Its open and shut are a move
 * (`moves`). Not under reduced motion, nor `still` (something else moves
 * it: SideNav's rail), nor inside `data-still`: there it's open or shut at
 * once.
 */
export function useDisclosureBody(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  moves: DisclosureMoves,
  reduced: boolean,
  still = false
): DisclosureBody {
  // The state it last came to rest in (null: moving). Landed is resting in
  // the state it's in, so a change of `open` is unlanded in the same render,
  // with no update of its own (a render-phase update re-ran the component
  // and gave a container's context a new identity: SideNav's links rendered
  // twice per open).
  const [rest, setRest] = useState<boolean | null>(open);
  const landed = rest === open;

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    if (wasOpen.current === open) {
      return;
    }
    wasOpen.current = open;
    const body = ref.current;
    if (!body || reduced || still || body.closest('[data-still]')) {
      setRest(open);
      return;
    }
    // Turned back to where it last rested before it got there: it's moving.
    setRest((r) => (r === open ? null : r));
    moves.move(body, open, () => setRest(open));
  }, [ref, open, reduced, still, moves]);

  return {
    landed,
    present: open || !landed,
    bodyProps: {
      'data-open': open || undefined,
      'data-unclipped': (open && landed) || undefined,
      'data-reduced': reduced || undefined,
      ...inertProps(!open),
    },
  };
}
