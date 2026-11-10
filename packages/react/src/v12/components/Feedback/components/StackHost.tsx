/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  animateLayout,
  attachStack,
  durationStepForDistance,
  motionTokens,
  DURATION_FLOOR_MS,
  SNAP,
  SNAP_COMPONENTS,
  snapProfileFor,
  type SnapProfile,
  type Stack,
  type StackSource,
  type StackSwap,
  type StackSwipe,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import type { NodeRef } from '@carbon-labs/react-util';

/* ============================================================================
 * The stack host — where a feedback surface gets its motion-core
 * `attachStack`: a toast stack hosts many, a notification on its own hosts
 * itself (`Solo`). Items find their host through the DOM
 * (`[data-fb-stack]`), so the stack exists on the first layout effect —
 * a child's runs before its parent's — and an item snaps in before its first
 * paint.
 * ========================================================================== */

/**
 * The feedback family's snap, the default for cards coming in: the status
 * card's snap — 80% → 100% on `fast-02`, opaque, the hard ease-out — scaling
 * from the top center, with the content sliding on y only.
 *
 * Out, the floating-surface standard (as the Menu's exit): the far edge
 * folds back into the top center the toast grew from, the content still
 * under the clip, its last 30% fading, on exit-productive, not a mirror of
 * the entrance; the fold ends where the toast came from. Kept on the
 * stack's own clock, `fast-02` (the card's is `fast-01`), so an inline
 * notification's place closes with it.
 */
export const FEEDBACK_SNAP: SnapProfile = {
  ...SNAP.floating,
  ...SNAP_COMPONENTS.notification,
};
// What the stack snaps on is `snapProfileFor('notification')`: these values, plus the snap lab's tuning.

interface ItemHandlers {
  onSwipe?: () => void;
  onExpire?: () => void;
}

interface HostRecord {
  stack: Stack;
  handlers: Map<HTMLElement, ItemHandlers>;
  /** Items that have arrived: an item arrives once, even when React mounts it twice (StrictMode). */
  arrived: WeakSet<HTMLElement>;
}

const hosts = new WeakMap<HTMLElement, HostRecord>();

/**
 * Every item that has arrived, whatever host record it arrived on. A host on
 * its own (`Solo`) is torn down and attached again when React re-runs its
 * effects (StrictMode in development): the new record's own set is empty,
 * so without this set the item would arrive a second time and, inside the
 * transaction its first arrival opened, wait for it: an inline
 * notification's place would open empty, then snap in. An item arrives once
 * per element.
 */
const arrivedEver = new WeakSet<HTMLElement>();

interface HostConfig {
  swipe: StackSwipe | false;
  origin: 'top' | 'bottom' | 'center';
  /** In the page's flow: the host's height opens and closes with its item, so what's around it reflows. */
  flow: boolean;
  reduced: () => boolean;
  timeScale: () => number;
}

const HostContext = createContext<HostConfig | null>(null);

const sameProfile = (a: SnapProfile, b: SnapProfile) => {
  const ka = Object.keys(a) as (keyof SnapProfile)[];
  return (
    ka.length === Object.keys(b).length &&
    ka.every((k) => Object.is(a[k], b[k]))
  );
};

function recordFor(root: HTMLElement, cfg: HostConfig): HostRecord {
  let rec = hosts.get(root);
  if (rec) return rec;
  const handlers = new Map<HTMLElement, ItemHandlers>();
  const stack = attachStack(root, {
    itemSelector: '[data-stack-item]',
    origin: cfg.origin,
    profile: snapProfileFor('notification'),
    swipe: cfg.swipe,
    timeScale: cfg.timeScale(),
    reduced: cfg.reduced,
    onSwipe: (item) => handlers.get(item)?.onSwipe?.(),
    onExpire: (item) => handlers.get(item)?.onExpire?.(),
  });
  rec = { stack, handlers, arrived: new WeakSet() };
  hosts.set(root, rec);
  return rec;
}

export interface StackHostProps extends HTMLAttributes<HTMLDivElement> {
  swipe?: StackSwipe | false;
  origin?: 'top' | 'bottom' | 'center';
  flow?: boolean;
  hostRef?: NodeRef<HTMLDivElement>;
  children: ReactNode;
}

/** A positioned region whose `[data-stack-item]` descendants arrive and leave on one stack. */
export function StackHost({
  swipe = false,
  origin = 'top',
  flow = false,
  hostRef,
  children,
  ...rest
}: StackHostProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = hostRef ?? ownRef;
  const { reduced, timeScale } = useFeedbackMotion();
  const reducedRef = useRef(reduced);
  const scaleRef = useRef(timeScale);
  const applied = useRef<{
    stack: Stack;
    timeScale: number;
    swipe: StackSwipe | false;
    profile: SnapProfile;
  } | null>(null);
  useLayoutEffect(() => {
    reducedRef.current = reduced;
    scaleRef.current = timeScale;
    const root = ref.current;
    const rec = root ? hosts.get(root) : undefined;
    if (!rec) return;
    // The snap lab's tuning, as it is at this render; the stack is told only when something changed.
    const profile = snapProfileFor('notification');
    const last = applied.current;
    if (
      last &&
      last.stack === rec.stack &&
      last.timeScale === timeScale &&
      last.swipe === swipe &&
      sameProfile(last.profile, profile)
    )
      return;
    applied.current = { stack: rec.stack, timeScale, swipe, profile };
    rec.stack.configure({ timeScale, swipe, profile });
  });
  useLayoutEffect(() => {
    const root = ref.current;
    return () => {
      const rec = root ? hosts.get(root) : undefined;
      if (!root || !rec) return;
      rec.stack.destroy();
      hosts.delete(root);
    };
  }, [ref]);
  const cfg = useMemo<HostConfig>(
    () => ({
      swipe,
      origin,
      flow,
      reduced: () => reducedRef.current,
      timeScale: () => scaleRef.current,
    }),
    [swipe, origin, flow]
  );
  return (
    <HostContext.Provider value={cfg}>
      <div {...rest} ref={ref} data-fb-stack="">
        {children}
      </div>
    </HostContext.Provider>
  );
}

export interface StackItemOptions {
  /** Snap in on mount (default true). False: it is simply there (part of the page from the start). */
  arrive?: boolean;
  /** The cause it grows from. */
  from?: StackSource;
  /** A timeout, ms (0 / undefined: none). */
  timeout?: number;
  /** Read on mount: take over another item's place instead of snapping (a deck's front). */
  swapIn?: () => StackSwap | null;
  /** Read on mount: no arrival of its own — it is simply there, and its host shows it (a deck's card behind a newer one from the same commit). */
  quiet?: (el: HTMLElement) => boolean;
  /** Called once it has arrived (after its snap or swap has started). */
  arrived?: (el: HTMLElement) => void;
  onSwipe?: () => void;
  onExpire?: () => void;
}

/** The host's stack, for a host that lays its items out itself (a deck). */
export function stackOf(root: HTMLElement | null): Stack | null {
  return root ? (hosts.get(root)?.stack ?? null) : null;
}

export interface StackItem {
  /** Snap out toward `toward`, or into a target; resolves when it is gone. */
  leave: (opts?: {
    toward?: StackSource;
    into?: { target: Element; carry?: Element | null };
    swap?: StackSwap;
  }) => Promise<void>;
  /** Restart the timeout (an update in place). */
  restartTimer: (ms?: number) => void;
}

/** Makes `ref`'s element an item of its host's stack. */
export function useStackItem(
  ref: RefObject<HTMLElement | null>,
  opts: StackItemOptions
): StackItem {
  const cfg = useContext(HostContext);
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });

  const rec = () => {
    const el = ref.current;
    const root = el?.closest<HTMLElement>('[data-fb-stack]');
    return el && root && cfg ? { el, root, ...recordFor(root, cfg) } : null;
  };

  useLayoutEffect(() => {
    const r = rec();
    if (!r || !cfg) return;
    r.handlers.set(r.el, {
      onSwipe: () => optsRef.current.onSwipe?.(),
      onExpire: () => optsRef.current.onExpire?.(),
    });
    const o = optsRef.current;
    const el = r.el;
    const handlers = r.handlers;
    const cleanup = () => {
      handlers.delete(el);
    };
    if (r.arrived.has(el)) return cleanup;
    r.arrived.add(el);
    // A host attached again (above) only learns where the item is, and runs its timer.
    const first = !arrivedEver.has(el);
    arrivedEver.add(el);
    if (first && (o.arrive ?? true) && !o.quiet?.(r.el)) {
      r.stack.arrive(r.el, { from: o.from, swap: o.swapIn?.() ?? undefined });
      o.arrived?.(r.el);
      if (cfg.flow) openFlow(r.root, r.el, cfg, 'open');
    } else r.stack.measure();
    if (o.timeout) r.stack.startTimer(r.el, o.timeout);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on mount: an item arrives once
  }, []);

  return {
    // The arrival in reverse: in the page's flow, the place closes on the
    // same clock as the snap out, as it opened with the snap in.
    leave: async (o) => {
      const r = rec();
      if (!r || !cfg) return;
      await Promise.all([
        r.stack.leave(r.el, o),
        cfg.flow ? openFlow(r.root, r.el, cfg, 'close') : undefined,
      ]);
    },
    restartTimer: (ms) => {
      const r = rec();
      const t = ms ?? optsRef.current.timeout;
      if (r && t) r.stack.startTimer(r.el, t);
    },
  };
}

/**
 * A host in the page's flow opens to its item's height (and closes), timed
 * by the distance. It is a layout change, so it runs as a layout transaction
 * on the host's container: what is below it
 * follows on its clock, and one already open is joined.
 */
function openFlow(
  root: HTMLElement,
  item: HTMLElement,
  cfg: HostConfig,
  dir: 'open' | 'close'
): Promise<void> {
  if (cfg.reduced()) return Promise.resolve();
  const h = item.offsetHeight;
  const token = durationStepForDistance(h);
  const ms = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[token] * cfg.timeScale()
  );
  const frames = [{ height: '0px' }, { height: `${h}px` }];
  const { animation } = animateLayout(
    root.parentElement ?? root,
    root,
    dir === 'open' ? frames : frames.reverse(),
    {
      ms,
      easing: easingCss('standard-productive'),
      reason: dir === 'open' ? 'notification-open' : 'notification-close',
    }
  );
  return animation.finished.then(
    // Closed, it stays closed until it is removed.
    () => {
      if (dir === 'close') root.style.height = '0px';
    },
    () => undefined
  );
}
