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
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  afterLayout,
  inLayout,
  playSkeletonHandoff,
  useLayoutTransaction,
  type SkeletonHandoff,
} from '@carbon-labs/v12-motion';

import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { useSkeletonWaveContext } from './SkeletonWave';
import type { NodeRef } from '@carbon-labs/react-util';
import './skeleton.scss';

/* ============================================================================
 * SkeletonReveal — content arrives out of its skeleton
 * ============================================================================
 *
 * The loading pattern's handoff: a part shows
 * its skeleton while `loading`; when its data lands it waits for the page's
 * reveal window (a `SkeletonWave` above it groups arrivals within `fast-02`
 * into one frame; alone, it reveals at once), then its content mounts
 * under the skeleton, which stays as an overlay — the same nodes, still on
 * the wave — and dissolves in place (`fast-01`) while the content fades in
 * place as one (`fast-02`), or its `[data-reveal]` rows 30ms apart
 * with `stagger`. Every fade is linear. Nothing slides.
 *
 * A loaded part that loads again returns into its skeleton — the handoff
 * reversed (`unload`): the skeleton fades up over the content, which
 * dissolves into it in place, then the skeleton holds alone. Either one,
 * interrupted, turns round from where it is.
 *
 * Content arrives its own way: `revealKey` steps at each reveal, on the
 * frame the content mounts, so a number counts from nothing
 * (`<BigNumberCounter waitForPlay playKey={revealKey} />`) and a chart plays
 * its entrance (`play={revealKey > 0}`). Text fades.
 *
 * `useSkeletonReveal` is the same, for a component that lays out its own
 * skeleton and content (a big number counter's figure).
 * ========================================================================== */

export type RevealPhase = 'loading' | 'handoff' | 'loaded' | 'unload';

export interface SkeletonRevealOptions {
  /** How the content arrives when it marks no `[data-reveal]` pieces: `fade` (default) fades it whole; `own` leaves it to arrive its own way. */
  arrive?: 'fade' | 'own';
  /** Rows of `[data-reveal]` pieces fade this far apart, ms (30 for a table's rows). Default 0. */
  stagger?: number;
  /** The stagger stops growing here, ms. Default `LOADING_MOTION.staggerCapMs` (moderate-02, 220); Infinity for none. */
  staggerCap?: number;
  /** Which pieces fade. Default `[data-reveal]`. */
  reveal?: string;
  /** Called on the frame the content mounts (a readout). */
  onReveal?: () => void;
}

export interface SkeletonRevealState {
  /**
   * `loading` — the skeleton alone; `handoff` — content under the dissolving
   * skeleton; `loaded` — content alone; `unload` — loading again, the
   * skeleton fading up over the content.
   */
  phase: RevealPhase;
  /** The skeleton sits over the content (`handoff` or `unload`): position it as the overlay. */
  overlaid: boolean;
  /** Steps on the frame the content mounts, at each reveal: the content's own cue (a count, a chart's entrance). 0 until the first. */
  revealKey: number;
  /** The skeleton, kept in place as the overlay through the handoff. */
  overlayRef: NodeRef<HTMLElement>;
  /** The content. */
  contentRef: NodeRef<HTMLElement>;
  /** Spread on the skeleton: `aria-hidden` while it is the overlay, and no wave entrance when it mounts over the content (the return fades it up). */
  overlayProps: { 'aria-hidden'?: true; 'data-skeleton-enter'?: 'none' };
}

/**
 * The handoff's state for a component that draws its own skeleton and
 * content: render the skeleton while `phase !== 'loaded'` (in the same tree
 * position throughout, so its nodes and their pulse carry over) on
 * `overlayRef` with `overlayProps`, positioned over the content while
 * `overlaid`; render the content while `phase !== 'loading'` on
 * `contentRef`, and don't re-render it with missing data during `unload`.
 */
export function useSkeletonReveal(
  loading: boolean,
  {
    arrive = 'fade',
    stagger = 0,
    staggerCap,
    reveal = '[data-reveal]',
    onReveal,
  }: SkeletonRevealOptions = {}
): SkeletonRevealState {
  const { group, busy } = useSkeletonWaveContext();
  const { timeScale, reduced } = useFeedbackMotion();
  // Loaded at mount is already there: no handoff.
  const [phase, setPhase] = useState<RevealPhase>(
    loading ? 'loading' : 'loaded'
  );
  // The next handoff starts from nothing (the content or skeleton just mounted), or turns round from where it is.
  const [fromStart, setFromStart] = useState(true);
  const [revealKey, setRevealKey] = useState(0);
  const overlayRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const handoff = useRef<SkeletonHandoff | null>(null);

  // Noticed in render (derived state), so the first frame of each phase is
  // already right: loading again returns into the skeleton; data back
  // mid-return turns round; alone (no window to wait for), straight into
  // the handoff.
  // Defer: a reveal waits for the lead of a layout transaction covering it
  // to finish, then plays.
  const layoutTx = useLayoutTransaction(overlayRef);
  const deferToken = useRef<object | null>(null);

  const [prevLoading, setPrevLoading] = useState(loading);
  if (prevLoading !== loading) {
    setPrevLoading(loading);
    if (loading) {
      if (phase === 'handoff' || phase === 'loaded') {
        setPhase('unload');
        setFromStart(phase === 'loaded');
      }
    } else if (phase === 'unload' && !layoutTx) {
      // Data back mid-return turns round — unless a layout transaction covers
      // it: then the return keeps going, and turns round at the end (below).
      setPhase('handoff');
      setFromStart(false);
    } else if (!group && phase === 'loading' && !layoutTx) {
      setPhase('handoff');
      setFromStart(true);
      setRevealKey((k) => k + 1);
    }
  }
  // The end of a transaction that covered a return with the data back
  // turns it round: the return turns round
  // from where it is, its live opacities, into the reveal — it doesn't
  // finish first. A return that finished during the transaction waits as
  // the skeleton and reveals from there (the effect below).
  const [prevLayoutTx, setPrevLayoutTx] = useState(layoutTx);
  if (prevLayoutTx !== layoutTx) {
    setPrevLayoutTx(layoutTx);
    if (!layoutTx && !loading && phase === 'unload') {
      setPhase('handoff');
      setFromStart(false);
    }
  }
  const phaseRef = useRef(phase);
  useLayoutEffect(() => {
    phaseRef.current = phase;
  });

  useLayoutEffect(() => {
    if (loading) {
      if (pending.current) group?.cancel(pending.current);
      pending.current = null;
      deferToken.current = null;
      return;
    }
    if (phaseRef.current !== 'loading' || pending.current) return;
    const go = () => {
      pending.current = null;
      setPhase('handoff');
      setFromStart(true);
      setRevealKey((k) => k + 1);
    };
    // Alone: as soon as no layout transaction covers it (this runs again when one ends).
    if (!group) {
      if (!layoutTx) go();
      return;
    }
    // Under a wave root: with the page's window — and after the lead of any layout change.
    const landed = () => {
      const el = overlayRef.current;
      if (el && inLayout(el)) {
        const token = {};
        deferToken.current = token;
        void afterLayout(el).then(() => {
          if (deferToken.current !== token) return;
          deferToken.current = null;
          go();
        });
      } else go();
    };
    pending.current = landed;
    group.land(landed);
    // `phase`: a return that finishes after the data landed hands off then.
  }, [loading, group, layoutTx, phase]);

  useEffect(
    () => () => {
      if (pending.current) group?.cancel(pending.current);
    },
    [group]
  );

  // The page's busy state: loading until the content is on its way.
  const isBusy = phase === 'loading' || phase === 'unload';
  const self = useRef({});
  useLayoutEffect(() => {
    busy?.(self.current, isBusy);
  }, [busy, isBusy]);
  useEffect(() => {
    const part = self.current;
    return () => busy?.(part, false);
  }, [busy]);

  // The handoff, or its return, on the frame the phase begins.
  useLayoutEffect(() => {
    if (phase !== 'handoff' && phase !== 'unload') return;
    const h = playSkeletonHandoff({
      overlay: overlayRef.current,
      content: contentRef.current,
      direction: phase === 'unload' ? 'return' : 'reveal',
      fromStart,
      reveal,
      fadeContent: arrive === 'fade',
      staggerMs: stagger,
      staggerCapMs: staggerCap,
      timeScale,
      reduced,
    });
    handoff.current = h;
    if (phase === 'handoff' && fromStart) onReveal?.();
    // A task, not the animation's promise: a hidden tab never finishes it.
    const t = window.setTimeout(
      () => {
        h.finish();
        handoff.current = null;
        setPhase(phase === 'unload' ? 'loading' : 'loaded');
      },
      // Every fade done: the overlay (or the old content) goes then.
      h.ms
    );
    return () => window.clearTimeout(t);
    // The settings are read at the handoff, not a reason to replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const overlaid = phase === 'handoff' || phase === 'unload';
  const overlayProps: SkeletonRevealState['overlayProps'] = {};
  if (overlaid) overlayProps['aria-hidden'] = true;
  if (phase === 'unload') overlayProps['data-skeleton-enter'] = 'none';
  return { phase, overlaid, revealKey, overlayRef, contentRef, overlayProps };
}

export interface SkeletonRevealProps
  extends SkeletonRevealOptions, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The part's data is on its way. */
  loading: boolean;
  /** What stands in for the content, shaped like it: Skeleton components or `[data-skeleton]` blocks. */
  skeleton: ReactNode;
  /** The content, or a function of the reveal (`revealKey` cues a count or a chart). Not called again while it returns into the skeleton. */
  children: ReactNode | ((state: { revealKey: number }) => ReactNode);
  /** The root's element. Default `div`. */
  as?: ElementType;
}

/** The content as last shown: while it returns into the skeleton it isn't rendered again (its data may be gone). */
const Held = memo(
  function Held({
    content,
    revealKey,
  }: {
    content: SkeletonRevealProps['children'];
    revealKey: number;
    hold: boolean;
  }) {
    return (
      <>{typeof content === 'function' ? content({ revealKey }) : content}</>
    );
  },
  (_prev, next) => next.hold
);

/**
 * A part of a page that loads: its skeleton while `loading`, then its content
 * arriving out of it, and back into it when it loads again. `aria-busy`
 * while it is loading.
 */
export function SkeletonReveal({
  loading,
  skeleton,
  children,
  as: As = 'div',
  arrive,
  stagger,
  staggerCap,
  reveal,
  onReveal,
  className,
  ...rest
}: SkeletonRevealProps) {
  const { phase, overlaid, revealKey, overlayRef, contentRef, overlayProps } =
    useSkeletonReveal(loading, {
      arrive,
      stagger,
      staggerCap,
      reveal,
      onReveal,
    });
  return (
    <As
      {...rest}
      className={['fb-skeleton-reveal', className].filter(Boolean).join(' ')}
      data-phase={phase}
      data-overlaid={overlaid ? '' : undefined}
      aria-busy={phase === 'loading' || phase === 'unload' || undefined}>
      {phase !== 'loading' && (
        <div
          ref={contentRef as NodeRef<HTMLDivElement>}
          className="fb-skeleton-reveal__content">
          <Held
            content={children}
            revealKey={revealKey}
            hold={phase === 'unload'}
          />
        </div>
      )}
      {phase !== 'loaded' && (
        <div
          ref={overlayRef as NodeRef<HTMLDivElement>}
          className="fb-skeleton-reveal__skeleton"
          {...overlayProps}>
          {skeleton}
        </div>
      )}
    </As>
  );
}
