/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { animateLayout, toEasing, cubicBezier } from '@carbon-labs/v12-motion';
import {
  SkeletonRun,
  structureSlot,
  structureTiming,
  useStructureReveal,
} from '@carbon-labs/react-feedback';
import type { StructureEntry } from '@carbon-labs/react-feedback';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';

/* ============================================================================
 * Loading options — the selection family on the loading standard
 * ============================================================================
 *
 * A switcher, list, tab list or menu whose options load is the loading
 * standard's STRUCTURE tier (which rows exist depends on data), on the feedback
 * family's `useStructureReveal`:
 *
 *   known      the track (its fill, edge, corners), the component's label,
 *              and anything the host passes as props, drawn for real
 *   rows       each placeholder is a row in the row's own markup and box —
 *              the size's row height, its padding and icon slot — with only
 *              the label a block: an expected label (`skeletonLabels`)
 *              printed unseen in the row's own type, a skeleton bar over it,
 *              so a hug list is the width it will be. `skeletonIcon` keeps the
 *              icon slot, and the label's bar runs over it: an icon in line
 *              with its label is one bar (the skeleton's merge rule); an
 *              icon-only row's slot is the block
 *   count      `skeletonCount`; default the rows on screen when it loads
 *              again (rule 26: what's there is the best guess), else the
 *              component's typical count
 *   handoff    rows take the placeholders in order (a list's keys are its
 *              indices, rule 19), as ONE reflow: a taken row keeps its box —
 *              its bar dissolves on the move's clock while its label fades up
 *              in place (fast-02, linear); extras arrive at the end, fading;
 *              leftovers fade where they are; the track's size follows on the
 *              same clock (the structure tier decides a container's size once,
 *              rule 24). A guess far off fades in place (rule 21)
 *   selection  a value known before its row exists marks nothing until the
 *              row lands; then the selector arrives on it with the family's
 *              arrival (from 90%)
 *   a11y       placeholders are `aria-hidden`, disabled, out of the tab
 *              order; the track is `aria-busy` while loading
 *
 * A component that never loads never mounts any of this: its rows render as
 * before (`active` stays false).
 * ========================================================================== */

/** The props every selection component takes for loading options. */
export interface SelectionLoadingProps {
  /** The options are loading: placeholder rows where they'll be (the loading standard's structure tier). */
  loading?: boolean;
  /** How many placeholder rows. Default the rows on screen when it loads again, else the component's typical count. */
  skeletonCount?: number;
  /** The expected labels, for the placeholders' widths in the rows' own type (cycled). Default typical labels. */
  skeletonLabels?: readonly string[];
  /** The rows will have a leading icon: its slot, under the label's one bar (an icon-only row: a block). */
  skeletonIcon?: boolean;
}

/** Typical labels: four widths, cycled, so a column of placeholders reads as a list. */
export const SELECTION_SKELETON_LABELS: readonly string[] = [
  'Option label',
  'Another option',
  'Option',
  'A longer option',
];

const range = (n: number) =>
  Array.from({ length: Math.max(0, n) }, (_, i) => i);

export interface SelectionLoadingState {
  /** The structure path is on (the component has loaded at least once): render rows from `rowEntry` and `standing`. */
  active: boolean;
  /** Loading, or the structure not yet known: `aria-busy` on the track. */
  busy: boolean;
  /** A real row's entry (its React key and structure attributes), by index. */
  rowEntry: (index: number) => StructureEntry<number> | undefined;
  /** The placeholders still standing, after the real rows. */
  standing: StructureEntry<number>[];
  /** For a real row that took a placeholder: the takeover's number (the out-bar's key), else undefined. */
  took: (key: string) => number | undefined;
  /** The expected label for a placeholder. */
  labelFor: (slot: number) => string;
  /** Changes with the rows (each structure commit): a host that resizes with them keys an effect on it. */
  sig: string;
  /**
   * The track's last length change, set in the commit's layout effect (read
   * it in a later layout effect of the same commit): from / to px along the
   * axis, and its clock — for a surface around the track to follow.
   */
  resize: RefObject<SelectionLoadingResize | null>;
}

export interface SelectionLoadingResize {
  from: number;
  to: number;
  ms: number;
  easing: string;
}

/** No stage: a list that has never loaded has nothing to reveal. */
const NO_STAGE: RefObject<HTMLElement | null> = { current: null };

/**
 * The structure tier for a selection track. `rootRef` is the track (the
 * reflow's stage); `count` the real rows; `typical` the component's default
 * guess. Render real rows with `rowEntry(i)` (their key and
 * `structureSlot` attributes) and then `standing` as placeholders
 * (`skeletonRowProps` + `SelectionSkeletonFace`).
 */
export function useSelectionLoading(
  rootRef: RefObject<HTMLElement | null>,
  {
    loading = false,
    skeletonCount,
    skeletonLabels = SELECTION_SKELETON_LABELS,
  }: SelectionLoadingProps,
  count: number,
  typical: number,
  {
    timeScale,
    axis = 'block',
    labels,
  }: {
    timeScale?: number;
    axis?: 'block' | 'inline';
    /** The rows' labels as text: loading again, the placeholders keep them (their widths), as the rows on screen are the guess. */
    labels?: readonly string[];
  } = {}
): SelectionLoadingState {
  const family = useFeedbackMotion();
  const scale = timeScale ?? family.timeScale;

  // The structure path, from the first time it loads.
  const [active, setActive] = useState(loading);
  // The guess, decided as loading begins (the rows on screen, else typical).
  const [guess, setGuess] = useState(() => skeletonCount ?? typical);
  // Loading again: the rows on screen are the guess — their count, and their labels for the widths (rule 26).
  const [held, setHeld] = useState<readonly string[] | null>(null);
  const [wasLoading, setWasLoading] = useState(loading);
  if (wasLoading !== loading) {
    setWasLoading(loading);
    if (loading) {
      setActive(true);
      setGuess(skeletonCount ?? (count > 0 ? count : typical));
      setHeld(count > 0 && labels ? [...labels] : null);
    }
  }

  const guessed = useMemo(() => range(active ? guess : 0), [active, guess]);
  const real = useMemo(
    () => (!active || loading ? null : range(count)),
    [active, loading, count]
  );
  // The reveal's stage only once the list has loaded: until then there is
  // nothing to reveal, and a list that never loads (most of them) attaches
  // no reflow and no ResizeObserver, and reads no box on mount
  // (one observer per surface). `active` is sticky, so
  // the stage, once set, stays for the reflows that follow.
  const stageRef = active ? rootRef : NO_STAGE;
  const s = useStructureReveal(
    stageRef,
    { guessed, real },
    { timeScale: scale, reduced: family.reduced }
  );

  // Each key's takeover number: it steps each time the key stands as a
  // placeholder again (derived state, so the render a row takes over in
  // already knows it took one).
  const nowKeys = s.list
    .filter((e) => e.placeholder)
    .map((e) => e.key)
    .join(',');
  const [placeholderKeys, setPlaceholderKeys] = useState('');
  const [gens, setGens] = useState<ReadonlyMap<string, number>>(
    () => new Map()
  );
  if (placeholderKeys !== nowKeys) {
    const before = new Set(placeholderKeys ? placeholderKeys.split(',') : []);
    const next = new Map(gens);
    for (const k of nowKeys ? nowKeys.split(',') : [])
      if (!before.has(k)) next.set(k, (next.get(k) ?? 0) + 1);
    setPlaceholderKeys(nowKeys);
    setGens(next);
  }

  // The track's length follows the rows on the structure clock: measured
  // before and after each change of the rows (a commit inside the reflow's
  // flushSync, so the engine reads every row at its new box). Only along
  // the rows (`axis`): the rows stretch across the track, so animating the
  // cross size would reflow them under the selector measured on them — the
  // cross size (a hug list's width) lands at once.
  const sig = s.list
    .map((e) => `${e.key}${e.placeholder ? '~' : ''}`)
    .join(',');
  const lastSize = useRef<{ w: number; h: number } | null>(null);
  const lastSig = useRef(sig);
  const resize = useRef<SelectionLoadingResize | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const box = { w: root.offsetWidth, h: root.offsetHeight };
    const before = lastSize.current;
    const changed = lastSig.current !== sig;
    lastSig.current = sig;
    lastSize.current = box;
    if (changed) resize.current = null;
    if (!active || !changed || !before || family.reduced) return;
    const prop = axis === 'block' ? 'blockSize' : 'inlineSize';
    const from = axis === 'block' ? before.h : before.w;
    const to = axis === 'block' ? box.h : box.w;
    if (Math.abs(to - from) < 0.5) return;
    const t = structureTiming(Math.abs(to - from), scale);
    const easing = cubicBezier(
      toEasing({ name: 'standard', mode: 'expressive' })
    );
    resize.current = { from, to, ms: t.ms, easing };
    const prevOverflow = root.style.overflow;
    // Clipped while it resizes: an extra fading in past the old edge, or a
    // leftover fading out past the new one, stays inside the track.
    root.style.overflow = 'clip';
    // A layout transaction on the track:
    // inside it the selector holds, cues defer, and inside an outer
    // transaction it joins that clock.
    const { animation: anim } = animateLayout(
      root,
      root,
      [{ [prop]: `${from}px` }, { [prop]: `${to}px` }],
      {
        ms: t.ms,
        easing,
        reason: 'selection-structure',
      }
    );
    // A task, not the animation's promise: a hidden tab never finishes it.
    const timer = window.setTimeout(() => {
      anim.cancel();
      root.style.overflow = prevOverflow;
    }, t.ms);
    return () => {
      window.clearTimeout(timer);
      anim.cancel();
      root.style.overflow = prevOverflow;
    };
  }, [sig, active, rootRef, scale, family.reduced, axis]);

  const byIndex = new Map(
    s.list.filter((e) => !e.placeholder).map((e) => [e.slot, e])
  );
  return {
    active,
    busy: active && (loading || s.items === null),
    rowEntry: (i) => byIndex.get(i),
    standing: s.list.filter((e) => e.placeholder),
    // Read for real rows only: a key that has stood as a placeholder took one.
    took: (key) => gens.get(key),
    sig,
    resize,
    labelFor: (slot) =>
      held?.[slot] ??
      skeletonLabels[slot % Math.max(1, skeletonLabels.length)] ??
      SELECTION_SKELETON_LABELS[0]!,
  };
}

/** A placeholder row's attributes: a disabled, hidden row with its structure key. Spread on the row's own element (`div` rows take `aria-disabled`). */
export function skeletonRowProps(
  key: string,
  element: 'button' | 'div' = 'button'
) {
  return {
    ...structureSlot(key),
    ...(element === 'button' ? { disabled: true } : { 'aria-disabled': true }),
    tabIndex: -1,
    'aria-hidden': true,
    'data-selection-skeleton': '',
  } as const;
}

/** A real row's structure attributes (its placeholder's key: it takes that box). */
export function rowStructureProps(
  entry: StructureEntry<number> | string | undefined,
  took: number | undefined
) {
  if (entry === undefined) return {};
  return {
    ...structureSlot(typeof entry === 'string' ? entry : entry.key),
    'data-skeleton-enter': 'none',
    ...(took !== undefined ? { 'data-selection-took': '' } : null),
  } as const;
}

/**
 * The leading slot's room, for a label bar that also covers it: the icon and
 * the face's gap (the row's own variables), so an icon in line with its label
 * is one bar (the skeleton's merge rule).
 */
export const SELECTION_SKELETON_LEAD =
  'calc(var(--sel-icon) + var(--sel-icon-gap))';

/**
 * A data slot in a placeholder: `text` printed unseen in the slot's own class
 * (its type and line box), a skeleton bar over it. `lead`: a leading icon
 * slot sits just before it on the line, and the bar covers that too.
 */
export function SelectionSkeletonText({
  text,
  className,
  lead = false,
}: {
  text: string;
  className?: string;
  lead?: boolean;
}) {
  return (
    <SkeletonRun
      className={['sel__skeleton-label', className].filter(Boolean).join(' ')}
      lead={lead ? SELECTION_SKELETON_LEAD : undefined}>
      {text}
    </SkeletonRun>
  );
}

/**
 * The icon slot in a placeholder. Beside a label it's room only, unseen: the
 * label's bar covers it (`lead`). Alone (an icon-only row) it's the block.
 */
export function SelectionSkeletonIcon({ alone = false }: { alone?: boolean }) {
  return alone ? (
    <span
      className="sel__skeleton-icon fb-skeleton"
      data-skeleton=""
      aria-hidden="true"
    />
  ) : (
    <span className="sel__skeleton-icon" aria-hidden="true" />
  );
}

export interface SelectionSkeletonFaceProps {
  /** The expected label (its width, in the row's type). */
  label: string;
  /** The row has a leading icon: its slot, covered by the label's bar (one bar for the line). */
  icon?: boolean;
  /** An icon-only row: the icon slot's block, no label. */
  iconOnly?: boolean;
  /**
   * The row's own label markup with `SelectionSkeletonText` slots, in place
   * of the one label (a second line). With `icon`, the first line's slot
   * takes `lead`, so its bar covers the icon.
   */
  children?: ReactNode;
}

/** The placeholder's face: the icon slot and the expected label, unseen, one bar over both. */
export function SelectionSkeletonFace({
  label,
  icon = false,
  iconOnly = false,
  children,
}: SelectionSkeletonFaceProps) {
  return (
    <span className="sel__face sel__face--skeleton" aria-hidden="true">
      {(icon || iconOnly) && <SelectionSkeletonIcon alone={iconOnly} />}
      {iconOnly
        ? null
        : (children ?? (
            <SelectionSkeletonText
              text={label}
              className="sel__text"
              lead={icon}
            />
          ))}
    </span>
  );
}

/**
 * A row that just took its placeholder: the placeholder's face, kept over
 * the row while its pulse fades out on the move's clock (the structure
 * tier's `[data-structure-pulse="out"]`), then gone.
 */
export function SelectionTakenFace(props: SelectionSkeletonFaceProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const end = () => setDone(true);
    el.addEventListener('structurepulsedone', end);
    // If no reflow fades it (a commit outside the engine), it goes with the label's fade.
    const t = window.setTimeout(end, 1000);
    return () => {
      el.removeEventListener('structurepulsedone', end);
      window.clearTimeout(t);
    };
  }, []);
  if (done) return null;
  return (
    <span
      ref={ref}
      className="sel__taken"
      data-structure-pulse="out"
      aria-hidden="true">
      <SelectionSkeletonFace {...props} />
    </span>
  );
}
