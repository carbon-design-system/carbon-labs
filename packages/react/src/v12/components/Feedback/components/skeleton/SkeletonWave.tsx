/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useMemo,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  attachSkeletonFallback,
  attachSkeletonWaveRoot,
  createArrivalGroup,
  LOADING_MOTION,
  SKELETON_WAVE,
  SKELETON_WAVE_ATTR,
  motionTokens,
  type ArrivalGroup,
  type SkeletonContrast,
  type SkeletonWaveOptions,
} from '@carbon-labs/v12-motion';

import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { useLoopVisibility } from '@carbon-labs/react-util';

/* ============================================================================
 * SkeletonWave — who owns the pulse
 * ============================================================================
 *
 * One wave per layout. The root
 * renders `data-skeleton-wave` in its markup — so a descendant's effect,
 * which runs before the root's, already sees it — and attaches one
 * motion-core `attachSkeletonWave` for its whole subtree. Every block under
 * it pulses on its sweep, whenever it mounted: a part that starts loading
 * later joins the wave in step.
 *
 * Roots nest: the outermost owns the pulse and the window.
 *
 * It owns the page's loading state for assistive tech too: `aria-busy` while
 * any `SkeletonReveal` under it is loading, and one polite announcement
 * (`announce`, a visually hidden `role="status"`) when the page has
 * finished — never one per part.
 *
 * It also owns the page's reveal window: `SkeletonReveal`s under it land in
 * one `createArrivalGroup`, so parts whose data lands within `fast-02` of
 * each other reveal in one frame.
 *
 * A skeleton with no root above it (`useSkeletonBlocks`) attaches its own
 * wave, measured from the document's corner, so a lone skeleton still
 * pulses, in step with any other lone one.
 * ========================================================================== */

interface WaveContext {
  /** The page's reveal window; null outside a root (a lone part reveals at once). */
  group: ArrivalGroup<() => void> | null;
  /** A part reports whether it is loading (the root's `aria-busy` and its one announcement); null outside a root. */
  busy: ((part: object, loading: boolean) => void) | null;
}

const SkeletonWaveContext = createContext<WaveContext>({
  group: null,
  busy: null,
});

export function useSkeletonWaveContext(): WaveContext {
  return useContext(SkeletonWaveContext);
}

/** The wave's options at the family's motion settings (slow motion stretches the pulse and the sweep). */
export function waveOptions(
  timeScale: number,
  reduced: boolean,
  own: Partial<SkeletonWaveOptions> = {}
): SkeletonWaveOptions {
  // The defaults are the wave's pattern token (core SKELETON_WAVE), read when used.
  const {
    periodMs = SKELETON_WAVE.periodMs,
    sweepPxPerMs = SKELETON_WAVE.sweepPxPerMs,
    entranceMs = motionTokens.duration[SKELETON_WAVE.entrance],
    ...rest
  } = own;
  // `contrast: undefined` would override the wave's default.
  if (rest.contrast === undefined) delete rest.contrast;
  return {
    ...rest,
    periodMs: Math.max(1, periodMs * timeScale),
    sweepPxPerMs: sweepPxPerMs / timeScale,
    entranceMs: Math.max(1, entranceMs * timeScale),
    reduced: () => reduced,
  };
}

export interface SkeletonWaveProps extends HTMLAttributes<HTMLElement> {
  /** The root's element. Default `div`. */
  as?: ElementType;
  /** One pulse, peak → trough → peak, ms. Default 1000. */
  periodMs?: number;
  /** The sweep's speed across the layout, px per ms. Default 2. */
  sweepPxPerMs?: number;
  /** The sweep's direction, degrees (0 = left → right). Default 45. */
  angleDeg?: number;
  /** The reveal window, ms. Default `fast-02` (120). */
  groupMs?: number;
  /**
   * A new page load: re-arms the announcement. (It doesn't re-attach the
   * wave: blocks already on it keep their pulse, and those that come back
   * with the reload join it in step.)
   */
  waveKey?: number;
  /** Each block's L* difference from its backdrop at the peak and trough. Default `SKELETON_CONTRAST` (6 / 3); false keeps the CSS's fixed opacities. */
  contrast?: SkeletonContrast | false;
  /**
   * Said once, politely, when the page has finished loading (every part
   * under the root revealed). Default "Content loaded"; false for none. A
   * part that reloads later announces nothing; a new `waveKey` re-arms it.
   */
  announce?: string | false;
  children?: ReactNode;
}

/**
 * The layout's wave root: one pulse for every skeleton block under it, and
 * one reveal window for every `SkeletonReveal` under it.
 */
export function SkeletonWave({
  as: As = 'div',
  periodMs,
  sweepPxPerMs,
  angleDeg,
  groupMs = LOADING_MOTION.groupMs,
  waveKey = 0,
  contrast,
  announce = 'Content loaded',
  children,
  ...rest
}: SkeletonWaveProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { timeScale, reduced } = useFeedbackMotion();

  // `contrast` by value: an inline object is a new one each render.
  const contrastOff = contrast === false;
  const contrastPeak = contrast === false ? undefined : contrast?.peak;
  const contrastTrough = contrast === false ? undefined : contrast?.trough;
  // Before the first paint: the blocks' entrance (from 0) starts on the frame they first show, never
  // after a frame of them whole.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachSkeletonWaveRoot(
      el,
      waveOptions(timeScale, reduced, {
        periodMs,
        sweepPxPerMs,
        angleDeg,
        contrast: contrastOff
          ? false
          : contrastPeak === undefined || contrastTrough === undefined
            ? undefined
            : { peak: contrastPeak, trough: contrastTrough },
      })
    );
  }, [
    timeScale,
    reduced,
    periodMs,
    sweepPxPerMs,
    angleDeg,
    contrastOff,
    contrastPeak,
    contrastTrough,
  ]);
  // Off screen, closed or the page hidden: the pulse holds, and comes back on the wave's phase.
  useLoopVisibility(ref);

  // Slow motion stretches the window too. Nested in another root, the
  // outermost's window is the page's.
  const outer = useContext(SkeletonWaveContext).group;
  const own = useMemo(
    () =>
      outer
        ? null
        : createArrivalGroup<() => void>({
            windowMs: groupMs * timeScale,
            onReveal: (reveals) => reveals.forEach((r) => r()),
          }),
    [outer, groupMs, timeScale]
  );
  useEffect(() => () => own?.clear(), [own]);
  const group = outer ?? own;

  // Busy while any part under it is loading; one polite announcement when
  // the page has finished, never one per part. Nested, the outermost root
  // owns both.
  const outerBusy = useContext(SkeletonWaveContext).busy;
  const parts = useRef(new Set<object>());
  const load = useRef<'idle' | 'loading' | 'done'>('idle');
  const announceRef = useRef(announce);
  useLayoutEffect(() => {
    announceRef.current = announce;
  });
  const [busyCount, setBusyCount] = useState(0);
  const [message, setMessage] = useState('');
  const ownBusy = useCallback((part: object, loading: boolean) => {
    if (loading) parts.current.add(part);
    else parts.current.delete(part);
    const n = parts.current.size;
    setBusyCount(n);
    if (n > 0 && load.current === 'idle') {
      load.current = 'loading';
      setMessage('');
    } else if (n === 0 && load.current === 'loading') {
      load.current = 'done';
      if (announceRef.current) setMessage(announceRef.current);
    }
  }, []);
  // A new waveKey is a new page load: the announcement re-arms (the next
  // report clears the old message, so the same words are said again).
  useLayoutEffect(() => {
    load.current = 'idle';
  }, [waveKey]);
  const busy = outerBusy ?? ownBusy;
  const ctx = useMemo(() => ({ group, busy }), [group, busy]);

  return (
    <SkeletonWaveContext.Provider value={ctx}>
      <As
        ref={ref}
        {...{ [SKELETON_WAVE_ATTR]: '' }}
        aria-busy={outerBusy ? undefined : busyCount > 0 ? 'true' : 'false'}
        {...rest}>
        {children}
        {!outerBusy && announce !== false && (
          <span role="status" className="cds--visually-hidden">
            {message}
          </span>
        )}
      </As>
    </SkeletonWaveContext.Provider>
  );
}

/**
 * A skeleton's own wave when no `SkeletonWave` (no `[data-skeleton-wave]`
 * ancestor) owns it — `el` and the blocks under it. Under a root it does
 * nothing: the root already pulses them. Every Skeleton component calls it;
 * so can any component that draws its own blocks (a big number counter's).
 * `shape` re-attaches when the element `ref` points at changes.
 */
export function useSkeletonBlocks(
  ref: RefObject<HTMLElement | null>,
  shape?: string | number | boolean
) {
  const { timeScale, reduced } = useFeedbackMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachSkeletonFallback(el, waveOptions(timeScale, reduced));
    // `shape`: the element `ref` points at changed (a one-line skeleton became a paragraph).
  }, [ref, timeScale, reduced, shape]);
  // Each skeleton holds its own blocks' pulse off screen, its own wave's or a root's: a long page's
  // blocks below the fold hold while the root's on screen. They come back on the wave's phase.
  useLoopVisibility(ref);
}
