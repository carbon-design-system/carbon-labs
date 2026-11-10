/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  CONTENT_SWAP,
  SKELETON_WAVE,
  motionTokens,
} from '@carbon-labs/v12-motion';
import { FeedbackMotion, useFeedbackMotion } from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import {
  disclosureTiming,
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import {
  PROCESSING_MOTION,
  Processing,
  type ProcessingHandle,
  type ProcessingMode,
  type ProcessingSize,
} from '@carbon-labs/react-processing-v2';
import {
  playShimmerReveal,
  ShimmerText,
} from '@carbon-labs/react-shimmer-text';
import { StatusMark, SwapSlot } from '@carbon-labs/react-feedback';
import { useGlide, usePartRollover } from './glide';
import './turn-status.scss';

/* ============================================================================
 * TurnStatus: a reply's live status row, then its summary.
 *
 *   at once  Processing loads in as the turn starts, the row arriving through
 *            the shimmer's band; the label after one period, the seconds after
 *            three
 *   summary  out, then in: the mark and label leave, the details shut, then
 *            the summary arrives and `onCollapse` releases the reply's words
 *   error    the error mark through the status hand-off; the cause and Retry
 *   one      `working` false: the mark shrinks out in place, the label stills
 *   reduced  the mark still, the label plain, swaps on the reduced clock
 * ========================================================================== */

/** The turn's status, as StepList's `status`. */
export type TurnStatusValue =
  | 'thinking'
  | 'acting'
  | 'waiting'
  | 'streaming'
  | 'done'
  | 'stopped'
  | 'error';

export interface TurnStatusProps {
  status: TurnStatusValue;
  /** The machine's real stage, while it works. Default "Thinking…". */
  label?: string;
  /** When the turn started (`performance.now()`). */
  startedAt: number;
  /** When it stopped working: the first words, the stop, the error (`performance.now()`). */
  endedAt?: number;
  /** The summary's words. Default "Worked for Ns", or "Stopped after Ns". */
  summary?: string;
  /** The cause, in the error state. Default "Something went wrong". */
  error?: string;
  /** Retry, in the error state. */
  onRetry?: () => void;
  /** Retry's words. Default "Retry". */
  retryButtonText?: string;
  /** The default summary's words from the time taken: done, and stopped. Default "Worked for 6s", "Stopped after 6s". */
  formatSummary?: (took: string, stopped: boolean) => string;
  /** The working state has fully left and the summary is arriving: the reply's words may start. */
  onCollapse?: () => void;
  /** The turn's steps (`StepList`) under the row: open while it works, then opened from the summary. */
  children?: ReactNode;
  /** The row may show it's working; false while a running step holds it. Default true. */
  working?: boolean;
  /** Open the details at first. Default: while the turn works (an earlier turn's are shut). */
  defaultExpanded?: boolean;
  /** Words added after the summary, after a "·": the details' count ("4 steps · 3 tools"). */
  detail?: string;
  /** Multiplies every clock (a lab's slow motion). Default the feedback family's. */
  timeScale?: number;
  /** Overrides reduced motion. Default the feedback family's. */
  reduced?: boolean;
  /** The working mark's size, px: 32 (default), which the 24px row holds; 16 only for a row under 24px. */
  size?: ProcessingSize;
  className?: string;
}

/** The row's clocks: the loading period, read when used, and its multiples. */
export const TURN_STATUS = {
  /** The label waits one loading period; each label holds at least one. */
  get periodMs(): number {
    return SKELETON_WAVE.periodMs;
  },
  /** The elapsed time shows after this many periods. */
  elapsedAfterPeriods: 3,
};

const LIVE: readonly TurnStatusValue[] = ['thinking', 'acting', 'waiting'];
const MODE: Partial<Record<TurnStatusValue, ProcessingMode>> = {
  thinking: 'loading',
  acting: 'triangle',
  waiting: 'square',
};

const summaryWords = (took: string, stopped: boolean) =>
  stopped ? `Stopped after ${took}` : `Worked for ${took}`;

/** A duration in words: under 10s one decimal, under a minute whole seconds, then minutes and seconds. */
export function formatDuration(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  if (s < 60) return `${Math.floor(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
}

/** The label on screen: a new one waits until the shown one has held `holdMs`; a burst lands on the latest. */
function useHeldLabel(label: string, holdMs: number) {
  const [held, setHeld] = useState(label);
  const since = useRef(0);
  useEffect(() => {
    if (since.current === 0) since.current = performance.now();
    if (label === held) return;
    const wait = Math.max(0, since.current + holdMs - performance.now());
    const t = window.setTimeout(() => {
      since.current = performance.now();
      setHeld(label);
    }, wait);
    return () => window.clearTimeout(t);
  }, [label, held, holdMs]);
  return held;
}

function Row({
  status,
  label = 'Thinking…',
  startedAt,
  endedAt,
  summary,
  error = 'Something went wrong',
  onRetry,
  retryButtonText = 'Retry',
  formatSummary = summaryWords,
  onCollapse,
  children,
  defaultExpanded,
  detail,
  size = 32,
  working = true,
  className,
}: TurnStatusProps) {
  const { timeScale, reduced } = useFeedbackMotion();
  const period = TURN_STATUS.periodMs * timeScale;
  const live = LIVE.includes(status);
  const settled =
    status === 'streaming' || status === 'done' || status === 'stopped';
  // The mark shrinking out: each dot's shrink, after the last one's stagger (four dots at most).
  const markOutBase =
    motionTokens.duration[PROCESSING_MOTION.out] +
    3 * motionTokens.duration[PROCESSING_MOTION.outStagger];
  const markOutMs = markOutBase * timeScale;
  // A turn first seen settled (an earlier turn) shows its summary, still.
  const [bornLive] = useState(live);

  // The details: open while the turn works; shut as it stops working (part of
  // the out), open on an error. The shut's clock is its travel's step.
  const hasDetails = children != null && children !== false;
  const [open, setOpen] = useState(
    () => hasDetails && (defaultExpanded ?? (bornLive || status === 'error'))
  );
  // Details that arrive while the turn works (its first step joins after
  // the row) open as they come, as they would had they been there at first.
  const [hadDetails, setHadDetails] = useState(hasDetails);
  if (hadDetails !== hasDetails) {
    setHadDetails(hasDetails);
    if (hasDetails && live && defaultExpanded == null) {
      setOpen(true);
    }
  }
  const [detailsH, setDetailsH] = useState(0);
  const [detailsOut, setDetailsOut] = useState(0);
  const [wasLive, setWasLive] = useState(live);
  if (wasLive !== live) {
    setWasLive(live);
    if (!live && hasDetails) {
      setDetailsOut(
        open && !reduced && detailsH > 0.5
          ? motionTokens.duration[disclosureTiming([-detailsH]).token]
          : 0
      );
      setOpen(status === 'error');
    }
  }
  const detailsRef = useRef<HTMLDivElement>(null);
  const detailsContentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = detailsContentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setDetailsH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasDetails]);
  const moves = useDisclosureMoves((body) => body.parentElement, {
    reason: 'turn-details',
    timeScale,
  });
  const details = useDisclosureBody(detailsRef, open, moves, reduced);
  const detailsId = useId();

  // The out phase: the swap's out, the mark's shrink or the details' shut, whichever is longest.
  // Reduced: the mark and the details go at once, and the swap runs on the reduced clock.
  const swapOut = motionTokens.duration[CONTENT_SWAP.out.duration];
  const outBase = reduced
    ? swapOut * CONTENT_SWAP.reducedScale
    : Math.max(swapOut, markOutBase, detailsOut);
  const age = () => (performance.now() - startedAt) / timeScale;

  // The label after one period; the elapsed time after three.
  const [labelReady, setLabelReady] = useState(
    () => age() >= TURN_STATUS.periodMs
  );
  const [seconds, setSeconds] = useState(() => Math.floor(age() / 1000));
  useEffect(() => {
    if (!live) return;
    const timers: number[] = [];
    if (!labelReady)
      timers.push(
        window.setTimeout(
          () => setLabelReady(true),
          Math.max(0, period - age() * timeScale)
        )
      );
    const tick = () => {
      setSeconds(Math.floor(age() / 1000));
      timers.push(
        window.setTimeout(
          tick,
          1000 * timeScale - ((age() * timeScale) % (1000 * timeScale))
        )
      );
    };
    tick();
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, timeScale]);
  const elapsedShown =
    live &&
    seconds * 1000 >= TURN_STATUS.elapsedAfterPeriods * TURN_STATUS.periodMs;

  // The mark's place: Processing while it works; once it has shrunk out, nothing
  // (settled) or the error mark.
  const [markGone, setMarkGone] = useState(!bornLive);
  const onCollapseRef = useRef(onCollapse);
  useEffect(() => {
    onCollapseRef.current = onCollapse;
  });
  useEffect(() => {
    if (live) return;
    if (!bornLive && markGone) {
      onCollapseRef.current?.();
      return;
    }
    const gone = window.setTimeout(
      () => setMarkGone(true),
      reduced ? 0 : markOutMs
    );
    const collapsed = window.setTimeout(
      () => onCollapseRef.current?.(),
      outBase * timeScale
    );
    return () => {
      window.clearTimeout(gone);
      window.clearTimeout(collapsed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  // Acting → thinking: a tool returned, and the mark acknowledges it once.
  const mark = useRef<ProcessingHandle>(null);
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === 'acting' && status === 'thinking')
      void mark.current?.triggerWiggle();
    prevStatus.current = status;
  }, [status]);

  // The row arrives through the shimmer's band (a turn that starts live; an earlier turn is simply there).
  const rowRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!bornLive || !rowRef.current) return;
    const anim = playShimmerReveal(rowRef.current, { timeScale, reduced });
    return () => anim?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as it arrives
  }, []);
  // The elapsed seconds glide to their place when the words before them change width.
  const slotRef = useRef<HTMLSpanElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  // Once the turn stops working they are leaving: they hold where they show while the summary waits to come in.
  useGlide(elapsedRef, slotRef, { timeScale, reduced, hold: !live });
  // The summary toggle's hover, press and release.
  usePartRollover(rowRef, '.cds-turn-status__toggle', { timeScale, reduced });

  const held = useHeldLabel(label, period);
  const took = formatDuration(
    endedAt != null ? (endedAt - startedAt) / timeScale : seconds * 1000
  );
  const summaryLine = summary ?? formatSummary(took, status === 'stopped');
  const summaryText = detail ? `${summaryLine} · ${detail}` : summaryLine;

  const face = live
    ? labelReady
      ? {
          key: `label:${held}`,
          node: (
            <ShimmerText active={working} className="cds-turn-status__label">
              {held}
            </ShimmerText>
          ),
        }
      : { key: 'none', node: null }
    : settled
      ? {
          key: `summary:${summaryText}`,
          node: hasDetails ? (
            // The summary opens the details: its words and a chevron, down shut, up open.
            <button
              type="button"
              className="cds-turn-status__toggle"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((o) => !o)}
              data-motion-icon-frame="">
              <ShimmerText active={false} className="cds-turn-status__summary">
                {summaryText}
              </ShimmerText>
              <ChevronDownUpToggle
                size={16}
                toggled={open}
                disableToggle
                aria-hidden="true"
              />
            </button>
          ) : (
            <ShimmerText active={false} className="cds-turn-status__summary">
              {summaryText}
            </ShimmerText>
          ),
        }
      : {
          key: 'error',
          node: (
            <span className="cds-turn-status__error">
              <span className="cds-turn-status__cause">{error}</span>
              {onRetry && (
                <Button
                  frame="ghost"
                  size="xs"
                  onClick={onRetry}
                  timeScale={timeScale}>
                  {retryButtonText}
                </Button>
              )}
            </span>
          ),
        };
  const announced = live
    ? labelReady
      ? held
      : ''
    : settled
      ? summaryText
      : error;

  const row = (
    <div
      ref={rowRef}
      className={['cds-turn-status', `cds-turn-status--${status}`, className]
        .filter(Boolean)
        .join(' ')}
      data-status={status}
      data-working={(live && working) || undefined}>
      {!(settled && markGone) && (
        <span
          className={[
            'cds-turn-status__mark',
            `cds-turn-status__mark--${size}`,
          ].join(' ')}
          aria-hidden="true">
          {status === 'error' && markGone ? (
            <StatusMark kind="error" size={16} from="pending" />
          ) : (
            <Processing
              ref={mark}
              size={size}
              mode={(working && MODE[status]) || 'out'}
            />
          )}
        </span>
      )}
      <span ref={slotRef} className="cds-turn-status__place">
        <SwapSlot
          swapKey={face.key}
          empty={face.node == null}
          inDelay={live ? 0 : outBase}
          enter="reveal"
          className="cds-turn-status__slot">
          {face.node}
        </SwapSlot>
      </span>
      <span ref={elapsedRef} className="cds-turn-status__elapsed-place">
        <SwapSlot
          swapKey={elapsedShown ? 'elapsed' : 'none'}
          empty={!elapsedShown}
          enter="reveal"
          className="cds-turn-status__elapsed">
          {/* The seconds change at once: no counting. */}
          {elapsedShown ? (
            <ShimmerText
              active={false}
              aria-hidden="true">{`${seconds}s`}</ShimmerText>
          ) : null}
        </SwapSlot>
      </span>
      <span
        className="cds-turn-status__announce"
        role="status"
        aria-live="polite">
        {announced}
      </span>
    </div>
  );
  if (!hasDetails) return row;
  return (
    <>
      {row}
      <div
        ref={detailsRef}
        id={detailsId}
        className="cds-disclosure__body cds-turn-status__details"
        {...details.bodyProps}>
        <div className="cds-disclosure__clip">
          <div
            ref={detailsContentRef}
            className="cds-disclosure__content cds-turn-status__details-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

/** For the row's host: holds the reply's text until the row has collapsed, per run (`startedAt`). */
export function useTurnRelease(startedAt: number | undefined) {
  const [releasedFor, setReleasedFor] = useState<number | null>(null);
  return {
    released: startedAt === undefined || releasedFor === startedAt,
    onCollapse: () => setReleasedFor(startedAt ?? null),
  };
}

/** The turn's status row. `timeScale` and `reduced` override the feedback family's motion for the row. */
export function TurnStatus(props: TurnStatusProps): ReactNode {
  const outer = useFeedbackMotion();
  const timeScale = props.timeScale ?? outer.timeScale;
  const reduced = props.reduced ?? outer.reduced;
  return (
    <FeedbackMotion timeScale={timeScale} reduced={reduced}>
      {/* A new run (a retry) starts the row afresh. */}
      <Row key={props.startedAt} {...props} />
    </FeedbackMotion>
  );
}
TurnStatus.displayName = 'TurnStatus';
