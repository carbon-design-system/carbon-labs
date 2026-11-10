/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import {
  createArrivalGroup,
  screenfulCount,
  DURATION_FLOOR_MS,
  LOADING_MOTION,
  motionTokens,
  playSkeletonHandoff,
  type ArrivalGroup,
  type ScreenfulOptions,
  afterLayout,
  inLayout,
} from '@carbon-labs/v12-motion';

import {
  RELAYOUT,
  createReflow,
  reflowFadeTiming,
  reflowTiming,
  type ReflowEntry,
  type ReflowPiece,
  type ReflowTiming,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import './skeleton.scss';

/* ============================================================================
 * The structure tier — container placeholders, handed off by geometry
 * ============================================================================
 *
 * The containers and the page layout load on the same pattern as the
 * content: a second tier on the same wave.
 *
 * When WHICH containers exist (and their size) depends on data — a
 * configured dashboard, a grid of unknown length, search results — each
 * likely container is a placeholder (`StructureItem placeholder`): the
 * container's frame at its resolved size, pulsing as ONE block on the
 * page's wave, nothing guessed inside it. When the structure lands,
 * `useStructureReveal` commits the real containers as ONE reflow (the bento
 * engine, `layout/bento-reflow.ts`):
 *
 *   taken     a real container whose key is guessed IS its placeholder —
 *             the same node — and its window moves and resizes to its own
 *             box (nothing, when the guess is right): only its geometry
 *             changes; its pulse keeps running while it fades out on the
 *             move's clock
 *   extra     a real container with no placeholder arrives in its reserved
 *             place, fading: at once, unless it lands where a moving or
 *             leaving piece still is (then at 40% of the move)
 *   leftover  a placeholder nobody took fades where it is; its space closes
 *             in the same one move
 *   after     whatever follows moves from where it is, on the same clock
 *   far off   a batch whose guess is wrong — under half its containers
 *             found a placeholder, or over half of those it found would
 *             leave their own footprint — moves no container: they fade in
 *             place (whatever follows still moves). Decided per batch
 *   batches   containers that land within `fast-02` of each other are one
 *             reflow; a later batch is a new reflow from where things are
 *   reload    back to unknown: the containers on screen become the
 *             placeholders, where they are (their content dissolves into
 *             the pulse) — the best guess for what comes next is what's there
 *
 * Then each container's content loads by the data tier, which never
 * resizes or moves a container (`SkeletonReveal`, `DataTableReveal`).
 * ========================================================================== */

/** The DOM event a fading pulse fires when its fade is done (its container then drops it). */
const PULSE_DONE = 'structurepulsedone';

/** The structure tier's own fades (the data tier's are one step faster). */
export const STRUCTURE_MOTION = {
  // Getters, read when used, so a token draft reaches them.
  /** An extra's arrival, a far-off container's fade in, ms (`moderate-01`). */
  get enterMs(): number {
    return motionTokens.duration[RELAYOUT.enter];
  },
  /** A leftover's fade out, ms (`fast-02`). */
  get exitMs(): number {
    return motionTokens.duration[RELAYOUT.exit];
  },
  /** A far-off fade in place, both ways, ms (`moderate-01`). */
  get inPlaceMs(): number {
    return motionTokens.duration[RELAYOUT.inPlace];
  },
};

/** A container's attributes, keyed: the real container with its placeholder's key takes its box. */
export function structureSlot(key: string | number) {
  return {
    'data-flip': `structure-${key}`,
    'data-flip-kind': 'window',
    'data-flip-label': `container ${key}`,
    'data-presence': `structure-${key}`,
    'data-presence-kind': 'fade',
    // An extra arrives at once unless it lands where something still is.
    'data-presence-at': 'auto',
  } as const;
}

/** A real container's attributes: the same keys as its placeholder, and no wave entrance for what it holds. */
export function structureItem(key: string | number) {
  return { ...structureSlot(key), 'data-skeleton-enter': 'none' } as const;
}

export interface StructureRevealOptions {
  /** Multiplies every duration. Default the family's (`useFeedbackMotion`). */
  timeScale?: number;
  /** No travel: the change lands at once. Default the family's. */
  reduced?: boolean;
  /** A batch fades in place when fewer than this share of its containers found a placeholder (of those that could). Default 0.5. */
  threshold?: number;
  /** …or when more than this share of the containers that found one would travel further than their own longest side. Default 0.5. */
  travelThreshold?: number;
  /** Batches within this window are one reflow, ms. Default `LOADING_MOTION.groupMs` (fast-02, 120). */
  groupMs?: number;
  /** Each reflow's pieces, for a readout. */
  onReadout?: (
    entries: ReflowEntry[],
    ms: number,
    mode: 'takeover' | 'fade'
  ) => void;
}

export interface StructureEntry<K> {
  /** React key and `slotKey`. */
  key: string;
  /** The host's key: a placeholder's slot, or a real container's. */
  slot: K;
  placeholder: boolean;
  /** A placeholder standing where a real container stood (after a reload): draw it at that container's box. */
  held: boolean;
}

export interface StructureState<K> {
  /** ONE keyed list to render in one parent — real containers, then the placeholders still standing. */
  list: StructureEntry<K>[];
  /** The real containers committed so far (null: the structure isn't known). */
  items: K[] | null;
}

/** The takeover's timing: the duration from the largest edge travel (Carbon's steps), standard-expressive; the fades linear. */
export function structureTiming(travel: number, timeScale = 1): ReflowTiming {
  return reflowTiming(travel, timeScale);
}

/** The same, fading in place. */
export function structureFadeTiming(
  travel: number,
  timeScale = 1
): ReflowTiming {
  return reflowFadeTiming(travel, timeScale);
}

interface Committed<K> {
  /** The real containers (null: unknown). */
  items: K[] | null;
  done: boolean;
  /** Each real container's React key. */
  keys: Map<K, string>;
  /** Placeholders standing from the structure on screen before (a reload), or null for the host's guess. */
  held: { key: string; slot: K }[] | null;
}

/**
 * The structure tier's state. `guessed`: the placeholders' keys (a first
 * load's guess). `real`: the real containers' keys as they land (null until
 * known; a stream grows), `done`: whether more may come (until then, the
 * placeholders not yet taken stay). Each landing is one reflow in `rootRef`
 * (`position: relative`), batches within `groupMs` as one. Back to null (a
 * reload): the containers on screen become the placeholders, in place.
 */
export function useStructureReveal<K extends string | number>(
  rootRef: RefObject<HTMLElement | null>,
  {
    guessed,
    real,
    done = true,
  }: { guessed: readonly K[]; real: readonly K[] | null; done?: boolean },
  options: StructureRevealOptions = {}
): StructureState<K> {
  const family = useFeedbackMotion();
  const timeScale = options.timeScale ?? family.timeScale;
  const reduced = options.reduced ?? family.reduced;
  const threshold = options.threshold ?? 0.5;
  const travelThreshold = options.travelThreshold ?? 0.5;
  const groupMs = options.groupMs ?? LOADING_MOTION.groupMs;

  const [committed, setCommitted] = useState<Committed<K>>(() => ({
    items: real ? [...real] : null,
    done,
    keys: new Map((real ?? []).map((k) => [k, String(k)])),
    held: null,
  }));

  const reflow = useRef<ReturnType<typeof createReflow> | null>(null);
  // When the running reflow ends (performance.now()), so a resize can land it.
  const runningUntil = useRef(0);
  useEffect(() => {
    const r = createReflow(() => rootRef.current);
    reflow.current = r;
    return () => r.stop();
  }, [rootRef]);
  // A resize mid-reflow lands it at once: no animation fights a resize.
  // (Its width: the reflow's own commit changes its height.)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    let width = root.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      const w = root.getBoundingClientRect().width;
      if (Math.abs(w - width) < 0.5) return;
      width = w;
      // A parent's layout transaction resizing it isn't a resize to land on:
      // the reflow rides it.
      const tx = inLayout(root);
      if (tx && tx.root !== root) return;
      if (performance.now() < runningUntil.current) {
        reflow.current?.finish();
        root
          .querySelectorAll<HTMLElement>('[data-structure-pulse="out"]')
          .forEach((p) => p.getAnimations().forEach((a) => a.finish()));
        runningUntil.current = 0;
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [rootRef]);

  // What has landed, read when the window closes.
  const latest = useRef({
    guessed,
    real,
    done,
    timeScale,
    reduced,
    threshold,
    travelThreshold,
    onReadout: options.onReadout,
  });
  useEffect(() => {
    latest.current = {
      guessed,
      real,
      done,
      timeScale,
      reduced,
      threshold,
      travelThreshold,
      onReadout: options.onReadout,
    };
  });
  const committedRef = useRef(committed);
  useEffect(() => {
    committedRef.current = committed;
  });

  /** The placeholders standing now: the held structure, else the guess — less what's been taken. */
  const standingOf = (c: Committed<K>, g: readonly K[]) => {
    const all = c.held ?? g.map((k) => ({ key: String(k), slot: k }));
    if (!c.items) return all;
    const taken = new Set(c.keys.values());
    return c.done
      ? []
      : all.filter((p) => !taken.has(p.key) && !c.items!.includes(p.slot));
  };

  /** Land what has arrived as one reflow, from wherever things are. */
  const deferring = useRef(false);
  const commit = () => {
    const l = latest.current;
    if (!l.real) return;
    // Defer: under a parent's layout transaction the landing waits for its
    // lead to finish.
    const root0 = rootRef.current;
    const outer = root0 ? inLayout(root0) : null;
    if (root0 && outer && outer.root !== root0) {
      if (deferring.current) return;
      deferring.current = true;
      void afterLayout(root0).then(() => {
        deferring.current = false;
        commitRef.current();
      });
      return;
    }
    const prev = committedRef.current;
    const standing = standingOf(prev, l.guessed);
    const prevItems = prev.items ?? [];
    const fresh = l.real.filter((k) => !prevItems.includes(k));
    // This batch's guess: how many of its containers found a placeholder, of those that could.
    const bySlot = new Map(standing.map((p) => [p.slot, p.key]));
    const found = fresh.filter((k) => bySlot.has(k));
    const couldFind = Math.min(fresh.length, standing.length);
    const countOk = couldFind === 0 || found.length / couldFind >= l.threshold;
    const keys = new Map(prev.keys);
    for (const k of fresh)
      keys.set(k, countOk && bySlot.has(k) ? bySlot.get(k)! : `new-${k}`);
    const next: Committed<K> = {
      items: [...l.real],
      done: l.done,
      keys,
      held: l.done ? null : prev.held,
    };
    const takenKeys = new Set(
      found.filter(() => countOk).map((k) => `structure-${bySlot.get(k)}`)
    );
    const r = reflow.current;
    const root = rootRef.current;
    if (!r || !root) return setCommitted(next);
    let ms = 0;
    let mode: 'takeover' | 'fade' = countOk ? 'takeover' : 'fade';
    const entries = r.play(
      () => flushSync(() => setCommitted(next)),
      (travel: number, pieces: ReflowPiece[]) => {
        // …and how many of those would leave their own footprint (travel past their longest side).
        const mine = pieces.filter((p) => takenKeys.has(p.key));
        const far = mine.filter((p) => {
          const d = Math.max(
            Math.abs(p.from.x - p.to.x),
            Math.abs(p.from.y - p.to.y),
            Math.abs(p.from.x + p.from.w - p.to.x - p.to.w),
            Math.abs(p.from.y + p.from.h - p.to.y - p.to.h)
          );
          return d > Math.max(p.to.w, p.to.h);
        });
        if (
          mode === 'takeover' &&
          mine.length &&
          far.length / mine.length > l.travelThreshold
        )
          mode = 'fade';
        // What follows moves on the containers' clock either way: time it by the rest's travel when they fade.
        const t =
          mode === 'takeover'
            ? structureTiming(travel, l.timeScale)
            : structureFadeTiming(travel, l.timeScale);
        ms = mode === 'takeover' ? t.ms : t.enterMs;
        return t;
      },
      l.reduced
    );
    runningUntil.current =
      performance.now() +
      (l.reduced
        ? 0
        : Math.max(ms, STRUCTURE_MOTION.enterMs * l.timeScale) +
          STRUCTURE_MOTION.enterMs * l.timeScale);
    // A taken placeholder's pulse fades out on the move's clock, still pulsing underneath.
    const fadeMs = l.reduced
      ? DURATION_FLOOR_MS
      : Math.max(DURATION_FLOOR_MS, ms);
    root
      .querySelectorAll<HTMLElement>(
        '[data-structure-pulse="out"]:not([data-structure-fading])'
      )
      .forEach((el) => {
        el.dataset.structureFading = '';
        el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: fadeMs,
          easing: LOADING_MOTION.easing,
          fill: 'forwards',
        });
        // A task, not the animation's promise: a hidden tab never finishes it.
        window.setTimeout(
          () => el.dispatchEvent(new Event(PULSE_DONE)),
          fadeMs
        );
      });
    l.onReadout?.(entries, ms, mode);
  };
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  const group = useRef<ArrivalGroup<number> | null>(null);
  useEffect(() => {
    const g = createArrivalGroup<number>({
      windowMs: groupMs * timeScale,
      // A task: React refuses flushSync inside an effect.
      onReveal: () => commitRef.current(),
    });
    group.current = g;
    return () => g.clear();
  }, [groupMs, timeScale]);

  // By value: a host may pass a new array each render.
  const realKey = real ? real.join('\u0000') + (done ? '|done' : '') : null;

  // A reload: the containers on screen become the placeholders, where they
  // are (derived state, so this render already shows it).
  const [prevKey, setPrevKey] = useState(realKey);
  let view = committed;
  if (prevKey !== realKey) {
    setPrevKey(realKey);
    if (realKey === null && committed.items) {
      const standing = standingOf(committed, guessed);
      const held = [
        ...committed.items.map((k) => ({
          key: committed.keys.get(k) ?? String(k),
          slot: k,
        })),
        ...standing,
      ];
      view = { items: null, done, keys: new Map(), held };
      setCommitted(view);
    }
  }

  // Back to unknown mid-move: the move stops where it is, so the placeholders
  // start clean (a reflow's clip or offset would be read as their place).
  useLayoutEffect(() => {
    if (realKey === null) reflow.current?.stop();
  }, [realKey]);

  // Each landing (a batch) joins the window; the window lands them as one.
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    if (realKey === null) {
      g.clear();
      return;
    }
    const c = committedRef.current;
    const same =
      c.items && c.items.join('\u0000') + (c.done ? '|done' : '') === realKey;
    if (!same) g.land(0);
  }, [realKey]);

  const items = view.items;
  const heldKeys = new Set((view.held ?? []).map((p) => p.key));
  const list: StructureEntry<K>[] = [
    ...(items ?? []).map((k) => ({
      key: view.keys.get(k) ?? String(k),
      slot: k,
      placeholder: false,
      held: false,
    })),
    ...standingOf(view, guessed).map((p) => ({
      key: p.key,
      slot: p.slot,
      placeholder: true,
      held: heldKeys.has(p.key),
    })),
  ];
  return { list, items };
}

/**
 * One screen's worth of placeholders for `ref`'s container, following its
 * size while the structure is unresolved (`active`): a ResizeObserver
 * re-computes `screenfulCount`. Once resolved it stops — a resize is then
 * ordinary layout, not loading. The hook's list adds or drops placeholders
 * at the END only (a list's keys are indices), so the ones on screen never
 * move in order or re-key; placeholders held from a reload are real
 * geometry and don't follow it.
 */
export function useScreenfulCount(
  ref: RefObject<HTMLElement | null>,
  options: ScreenfulOptions,
  active = true
): number {
  const [count, setCount] = useState(0);
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const measure = () => setCount(screenfulCount(el, opts.current));
    // At once (a task: a resize observer only reports on a rendered frame), then on every resize.
    queueMicrotask(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, active]);
  return count;
}

/** The content as last shown: while it returns into the pulse it isn't rendered again (its data may be gone). */
const HeldContent = memo(
  function HeldContent({ children }: { children: ReactNode; hold: boolean }) {
    return <>{children}</>;
  },
  (_prev, next) => next.hold
);

export interface StructureItemProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Its key (`list`'s `key`): a real container with its placeholder's key takes it over. */
  slotKey: string | number;
  /** A placeholder: one pulsing block over the surface, nothing inside. */
  placeholder?: boolean;
  as?: ElementType;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * A container of the structure tier: a placeholder while `placeholder`, the
 * real container after — the SAME node, so a takeover is only a change of
 * geometry. Taking over, it keeps its pulse, still on the wave, while the
 * pulse fades out; then drops it. Becoming a placeholder again (a reload),
 * its content dissolves in place, then the pulse fades up where it is.
 * Its surface is `--fb-structure-surface` (default `$layer-01`), its
 * corners `--fb-structure-radius` (default 8px).
 */
export function StructureItem({
  slotKey,
  placeholder = false,
  as: As = 'div',
  className,
  children,
  ...rest
}: StructureItemProps) {
  const { timeScale, reduced } = useFeedbackMotion();
  // The pulse outlives the placeholder by its fade; the content outlives the container by its dissolve.
  const [pulse, setPulse] = useState(placeholder);
  const [content, setContent] = useState(!placeholder);
  const [gen, setGen] = useState(0);
  const [wasPlaceholder, setWasPlaceholder] = useState(placeholder);
  if (wasPlaceholder !== placeholder) {
    setWasPlaceholder(placeholder);
    if (placeholder) {
      setPulse(true);
      setGen((g) => g + 1);
    } else setContent(true);
  }
  const pulseRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pulseRef.current;
    if (!el || placeholder) return;
    const done = () => setPulse(false);
    el.addEventListener(PULSE_DONE, done);
    return () => el.removeEventListener(PULSE_DONE, done);
  }, [placeholder, pulse]);
  // A container again: its content layer comes back to its own style (a
  // return leaves it faded out, held by its animation).
  useLayoutEffect(() => {
    if (placeholder) return;
    contentRef.current?.getAnimations().forEach((a) => a.cancel());
  }, [placeholder]);
  // A placeholder again: the content dissolves, then the pulse fades up.
  useLayoutEffect(() => {
    if (!placeholder || gen === 0) return;
    const h = playSkeletonHandoff({
      overlay: pulseRef.current,
      content: contentRef.current,
      direction: 'return',
      timeScale,
      reduced,
    });
    const t = window.setTimeout(() => {
      h.finish();
      setContent(false);
    }, h.ms);
    return () => window.clearTimeout(t);
    // The settings are read at the change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder, gen]);

  const attrs = placeholder ? structureSlot(slotKey) : structureItem(slotKey);
  return (
    <As
      {...rest}
      {...attrs}
      className={[
        'fb-structure',
        placeholder && 'fb-structure--placeholder',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={placeholder || undefined}>
      <span className="fb-structure__surface" data-flip-surface="">
        {pulse && (
          <span
            key={gen}
            ref={pulseRef}
            className="fb-skeleton fb-structure__pulse"
            data-skeleton=""
            aria-hidden="true"
            data-structure-pulse={placeholder ? 'on' : 'out'}
            // A pulse that comes back over content fades up itself (no wave entrance).
            data-skeleton-enter={gen > 0 ? 'none' : undefined}
          />
        )}
      </span>
      <div
        ref={contentRef}
        className="fb-structure__content"
        data-flip-content="">
        {content ? (
          <HeldContent hold={placeholder}>{children}</HeldContent>
        ) : null}
      </div>
    </As>
  );
}

export type SkeletonContainerProps = Omit<
  StructureItemProps,
  'placeholder' | 'children'
>;

/** A container placeholder on its own: `StructureItem placeholder`. Render the real container as a `StructureItem` with the same key, in the same place, to take it over. */
export function SkeletonContainer(props: SkeletonContainerProps) {
  return <StructureItem {...props} placeholder />;
}
