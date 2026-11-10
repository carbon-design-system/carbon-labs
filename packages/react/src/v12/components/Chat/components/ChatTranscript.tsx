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
import {
  animateLayout,
  DURATION_FLOOR_MS,
  durationStepForDistance,
  LOADING_MOTION,
  motionTokens,
  toEasing,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { AITextAtRest } from '@carbon-labs/react-feedback';
import { JumpTo } from '@carbon-labs/react-jump-to';
import { Scroller } from '@carbon-labs/react-scroller';
import {
  ChatActions,
  ChatMessage,
  type ChatActionsWords,
  type ChatRating,
  type ChatRole,
} from './ChatMessage';
import {
  StepList,
  countSteps,
  type Step,
  type StepListWords,
} from './StepList';
import { TurnStatus, useTurnRelease, type TurnStatusValue } from './TurnStatus';
import { firstLine, useChatTurns } from './turns';
import './chat-surface.scss';

/* ============================================================================
 * ChatTranscript: the conversation, a column of turns in the Scroller.
 *
 *   pinned   a reader at the bottom stays there; one who scrolled up never moves
 *   arrival  new turns are one move: the column slides up by what they push it,
 *            by travel, standard-productive; a user turn fades up in place
 *   history  replies done as it mounts are there, still: no stream, no summary's wait
 *   steps    a reply's steps are its status row's details (a StepList)
 *   one      one working element per reply, passed between the row and a
 *            running step: out, then in (`useNarrator`)
 *   jump     JumpTo: Latest, and back to the start of a long streaming reply
 *   turns    its questions and viewport go to the shell's ChatTurnNavigator
 *   reduced  no slide; the hand-offs are at once
 * ========================================================================== */

export interface ChatTurn {
  id: string;
  role: ChatRole;
  /** A user turn's text. */
  text?: string;
  /** A user turn: its send time, epoch ms; the turn navigator shows it as a relative time. */
  time?: number;
  /** An assistant turn: what has been generated so far (sentences). */
  chunks?: string[];
  /** An assistant turn: generation has finished. */
  done?: boolean;
  /** An assistant turn: the reader's rating. */
  rating?: ChatRating;
  /** An assistant turn: its live status, then its summary (`TurnStatus`). None: the reply's skeleton stands in until the first words. */
  status?: ChatTurnStatus;
  /** An assistant turn: the steps it has taken (tool calls, approvals), as they happen: its status row's details. */
  steps?: ChatStep[];
}

/** A reply's step: the StepList's, as data (the transcript wires Retry and the actions). */
export type ChatStep = Omit<Step, 'onRetry' | 'actions'>;

/** A turn's status: the machine's real status and stage, and real times (`performance.now()`). */
export interface ChatTurnStatus {
  status: TurnStatusValue;
  /** The stage's words while it works. */
  label?: string;
  startedAt: number;
  /** When it stopped working: the first words, the stop or the error. */
  endedAt?: number;
  /** The summary's words, when the host has its own. */
  summary?: string;
  /** The cause, in the error state. */
  error?: string;
}

export interface ChatTranscriptProps {
  turns: ChatTurn[];
  /** The scroll region's name. Default "Conversation". */
  label?: string;
  /** The pill back to a long reply's start. Default "Start of this reply". */
  jumpToReplyStartLabel?: string;
  /** Each reply's status row Retry. Default "Retry". */
  retryButtonText?: string;
  /** Each reply's action words (ChatActions'). */
  actionsProps?: ChatActionsWords;
  /** Each reply's step words (StepList's). */
  stepListProps?: StepListWords;
  /** Retry on a reply (no Retry button without it). */
  onRetry?: (turn: ChatTurn) => void;
  /** Continue a stopped reply (a Continue button on stopped replies). */
  onContinue?: (turn: ChatTurn) => void;
  /** Rate a reply (no rating buttons without it). */
  onRate?: (turn: ChatTurn, rating: ChatRating) => void;
  onCopy?: (turn: ChatTurn) => void;
  /** Retry a reply's failed step (a Retry button on failed steps). */
  onRetryStep?: (turn: ChatTurn, step: ChatStep) => void;
  /** A waiting step's choices (Approve, Skip …). */
  stepActions?: (turn: ChatTurn, step: ChatStep) => ReactNode;
  /** The lines a reply holds before its text arrives. Default 3. */
  lineCount?: number;
  /** Shown while there are no turns. */
  empty?: ReactNode;
  /** Multiplies every duration (a lab's slow motion). Default 1. */
  timeScale?: number;
  /** Overrides `prefers-reduced-motion`. */
  reduced?: boolean;
  /** Whether any of the latest reply is in view; a host shows its own working element only while it isn't. */
  onReplyInView?: (inView: boolean) => void;
  className?: string;
}

const STANDARD = `cubic-bezier(${toEasing({ name: 'standard', mode: 'productive' }).join(', ')})`;
/** Within this many px of the bottom is at the bottom (a fractional scroll position). */
const PIN_SLOP = 2;

const textOf = (t: ChatTurn) =>
  t.role === 'user' ? (t.text ?? '') : (t.chunks ?? []).join(' ');

export function ChatTranscript({
  turns,
  label = 'Conversation',
  jumpToReplyStartLabel = 'Start of this reply',
  retryButtonText,
  actionsProps,
  stepListProps,
  onRetry,
  onContinue,
  onRate,
  onCopy,
  onRetryStep,
  stepActions,
  lineCount,
  empty,
  timeScale = 1,
  reduced: reducedProp,
  onReplyInView,
  className,
}: ChatTranscriptProps) {
  const { reduced: systemReduced } = useFeedbackMotion();
  const reduced = reducedProp ?? systemReduced;
  const replyLineCount = lineCount ?? 3;
  const rootRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);
  // The turns already on screen (on mount: there, no arrival).
  const seen = useRef<Set<string> | null>(null);
  // Replies done as it mounts, by the run they finished: shown still, not streamed again.
  const [history] = useState(
    () =>
      new Map(
        turns
          .filter((t) => t.role === 'assistant' && t.done)
          .map((t) => [t.id, t.status?.startedAt])
      )
  );

  // Only the reader scrolling up unpins; reaching the bottom pins. Growth, resizes and our own
  // scrolls never unpin: their scroll events land a frame late.
  useLayoutEffect(() => {
    const vp = vpRef.current;
    const list = listRef.current;
    if (!vp || !list) return;
    // Mid-slide the column's offset adds to the scroll area: the bottom is that much higher.
    const slide = () =>
      list.getAnimations().length
        ? new DOMMatrixReadOnly(getComputedStyle(list).transform).m42
        : 0;
    const bottom = () =>
      vp.scrollHeight - vp.clientHeight - Math.max(0, slide());
    let lastTop = vp.scrollTop;
    let ours = -1;
    const onScroll = () => {
      const top = vp.scrollTop;
      if (top >= bottom() - PIN_SLOP) pinned.current = true;
      else if (top < lastTop - 0.5 && Math.abs(top - ours) > 0.5)
        pinned.current = false;
      lastTop = top;
    };
    // A reply growing, the viewport resizing under the dock's move: keep a
    // pinned reader at the bottom, every frame of it.
    const keep = () => {
      if (!pinned.current) return;
      vp.scrollTop = bottom();
      ours = vp.scrollTop;
      lastTop = ours;
    };
    const ro =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(keep);
    ro?.observe(vp);
    ro?.observe(list);
    vp.addEventListener('scroll', onScroll, { passive: true });
    keep();
    return () => {
      ro?.disconnect();
      vp.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Turns arriving: one move, the column sliding up by what they push it.
  const ids = turns.map((t) => t.id).join('|');
  useLayoutEffect(() => {
    const vp = vpRef.current;
    const list = listRef.current;
    const root = rootRef.current;
    if (!vp || !list || !root) return;
    if (!seen.current) {
      seen.current = new Set(turns.map((t) => t.id));
      vp.scrollTop = vp.scrollHeight;
      return;
    }
    const fresh = turns.filter((t) => !seen.current!.has(t.id));
    seen.current = new Set(turns.map((t) => t.id));
    if (!fresh.length) return;

    // A user turn fades up in place; a reply is its skeleton (the wave's).
    for (const t of fresh) {
      if (t.role !== 'user') continue;
      list
        .querySelector<HTMLElement>(`[data-turn="${CSS.escape(t.id)}"]`)
        ?.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: Math.max(
            DURATION_FLOOR_MS,
            LOADING_MOTION.contentMs * timeScale * (reduced ? 0.5 : 1)
          ),
          easing: LOADING_MOTION.easing,
          fill: 'backwards',
        });
    }

    if (!pinned.current) return;
    // A slide still under way: the next one starts from where the column is.
    const under = list.getAnimations().length
      ? new DOMMatrixReadOnly(getComputedStyle(list).transform).m42
      : 0;
    list.getAnimations().forEach((a) => a.cancel());
    const before = vp.scrollTop;
    vp.scrollTop = vp.scrollHeight;
    const shift = vp.scrollTop - before + under;
    if (shift < 0.5 || reduced) return;
    animateLayout(
      root,
      list,
      [{ transform: `translateY(${shift}px)` }, { transform: 'none' }],
      {
        ms: Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[durationStepForDistance(shift)] * timeScale
        ),
        easing: STANDARD,
        reason: 'chat-turn',
        reduced,
      }
    );
    // Once per new set of turns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  let latestReply = -1;
  turns.forEach((t, i) => {
    if (t.role === 'assistant') latestReply = i;
  });

  // The questions, for the shell's turn navigator: published only when a question changes, never per chunk.
  const turnsStore = useChatTurns();
  const questionsKey = turns
    .map((t) =>
      t.role === 'user'
        ? `${t.id}\u0000${t.text ?? ''}\u0000${t.time ?? ''}`
        : ''
    )
    .join('\u0001');
  const questions = useMemo(
    () =>
      turns
        .filter((t) => t.role === 'user')
        .map((t) => ({
          id: t.id,
          text: firstLine(t.text ?? ''),
          time: t.time,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- by the questions' own key
    [questionsKey]
  );
  useLayoutEffect(() => {
    turnsStore?.set({ viewport: vpRef.current, questions, reduced, timeScale });
  }, [turnsStore, questions, reduced, timeScale]);
  useEffect(
    () => () => turnsStore?.set({ viewport: null, questions: [] }),
    [turnsStore]
  );

  // The latest reply in sight, for the host (`onReplyInView`).
  const latestId = latestReply < 0 ? null : turns[latestReply]!.id;
  const streaming = latestReply >= 0 && !turns[latestReply]!.done;
  const onInView = useRef(onReplyInView);
  useEffect(() => {
    onInView.current = onReplyInView;
  });
  useEffect(() => {
    const vp = vpRef.current;
    const el = latestId
      ? listRef.current?.querySelector(`[data-turn="${CSS.escape(latestId)}"]`)
      : null;
    if (!vp || !el || typeof IntersectionObserver === 'undefined') {
      onInView.current?.(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => onInView.current?.(e!.isIntersecting),
      { root: vp }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [latestId]);

  return (
    <div
      ref={rootRef}
      className={['cds-chat-transcript', className].filter(Boolean).join(' ')}>
      <Scroller
        className="cds-chat-transcript__scroller"
        viewportRef={vpRef}
        aria-label={label}
        timeScale={timeScale}
        reduced={reducedProp}>
        {turns.length === 0 && empty != null && (
          <div className="cds-chat-transcript__empty">{empty}</div>
        )}
        <ol ref={listRef} className="cds-chat-transcript__turns">
          {turns.map((t, i) => (
            <li
              key={t.id}
              className={`cds-chat-transcript__turn cds-chat-transcript__turn--${t.role}`}
              data-turn={t.id}>
              {t.role === 'user' ? (
                <ChatMessage role="user">{t.text}</ChatMessage>
              ) : (
                <AssistantTurn
                  turn={t}
                  atRest={
                    history.has(t.id) &&
                    history.get(t.id) === t.status?.startedAt
                  }
                  lineCount={replyLineCount}
                  latest={i === latestReply}
                  onRetry={onRetry}
                  onContinue={onContinue}
                  onRate={onRate}
                  onCopy={onCopy}
                  onRetryStep={onRetryStep}
                  stepActions={stepActions}
                  retryButtonText={retryButtonText}
                  actionsProps={actionsProps}
                  stepListProps={stepListProps}
                  timeScale={timeScale}
                  reduced={reducedProp}
                />
              )}
            </li>
          ))}
        </ol>
        <JumpTo
          container={vpRef}
          preset="latest"
          items={turns.length}
          stick={false}
          shadow
          shadowTone="backdrop"
          timeScale={timeScale}
          reduced={reducedProp}
        />
        <JumpTo
          container={vpRef}
          preset="current"
          label={jumpToReplyStartLabel}
          target={() => {
            // Its first line, the status row: the whole reply is in view while any of it is.
            const li = latestId
              ? listRef.current?.querySelector(
                  `[data-turn="${CSS.escape(latestId)}"]`
                )
              : null;
            return li?.querySelector('.cds-turn-status') ?? li ?? null;
          }}
          block="start"
          directions="up"
          disabled={!streaming}
          shadow
          shadowTone="backdrop"
          timeScale={timeScale}
          reduced={reducedProp}
        />
      </Scroller>
    </div>
  );
}
ChatTranscript.displayName = 'ChatTranscript';

/** One reply: its status row, then its text, which waits until the row's label and mark have left. */
function AssistantTurn({
  turn: t,
  atRest,
  lineCount,
  latest,
  onRetry,
  onContinue,
  onRate,
  onCopy,
  onRetryStep,
  stepActions,
  retryButtonText,
  actionsProps,
  stepListProps,
  timeScale,
  reduced,
}: {
  turn: ChatTurn;
  /** Done as the transcript mounted: its words are there at once. */
  atRest: boolean;
  lineCount: number;
  latest: boolean;
  onRetry?: (turn: ChatTurn) => void;
  onContinue?: (turn: ChatTurn) => void;
  onRate?: (turn: ChatTurn, rating: ChatRating) => void;
  onCopy?: (turn: ChatTurn) => void;
  onRetryStep?: (turn: ChatTurn, step: ChatStep) => void;
  stepActions?: (turn: ChatTurn, step: ChatStep) => ReactNode;
  retryButtonText?: string;
  actionsProps?: ChatActionsWords;
  stepListProps?: StepListWords;
  timeScale: number;
  reduced?: boolean;
}) {
  const release = useTurnRelease(t.status?.startedAt);
  const released = atRest || release.released;
  const onCollapse = release.onCollapse;
  // The one working element: the row while the turn thinks or waits, the running step while it runs.
  const { reduced: familyReduced } = useFeedbackMotion();
  const live = t.status != null && LIVE.includes(t.status.status);
  const runningStep = live
    ? t.steps?.find((s) => s.status === 'running')?.id
    : undefined;
  const turnRef = useRef<HTMLDivElement>(null);
  const holder = useNarrator(
    live ? (runningStep != null ? `step:${runningStep}` : 'row') : null,
    turnRef,
    reduced ?? familyReduced
  );
  const steps = t.steps?.map(
    (s): Step => ({
      ...s,
      onRetry:
        s.status === 'error' && onRetryStep
          ? () => onRetryStep(t, s)
          : undefined,
      actions: s.status === 'waiting' ? stepActions?.(t, s) : undefined,
    })
  );
  return (
    <div
      ref={turnRef}
      className="cds-chat-transcript__reply"
      data-holder={holder ?? 'none'}>
      <AITextAtRest.Provider value={atRest}>
        <ChatMessage
          role="assistant"
          chunks={released ? t.chunks : []}
          done={released ? t.done : false}
          lineCount={lineCount}
          actionsShown={latest ? 'latest' : 'hover'}
          status={
            t.status && (
              <TurnStatus
                {...t.status}
                detail={
                  steps?.length
                    ? (stepListProps?.formatCount ?? countSteps)(steps)
                    : undefined
                }
                onRetry={onRetry && (() => onRetry(t))}
                onCollapse={onCollapse}
                retryButtonText={retryButtonText}
                working={holder === 'row'}
                timeScale={timeScale}
                reduced={reduced}>
                {steps && (
                  <StepList
                    {...stepListProps}
                    steps={steps}
                    workingStep={
                      holder?.startsWith('step:') ? holder.slice(5) : null
                    }
                  />
                )}
              </TurnStatus>
            )
          }
          actions={
            <ChatActions
              text={textOf(t)}
              rating={t.rating ?? null}
              onCopy={onCopy && (() => onCopy(t))}
              onRetry={onRetry && (() => onRetry(t))}
              onContinue={
                t.status?.status === 'stopped' && onContinue
                  ? () => onContinue(t)
                  : undefined
              }
              onRate={onRate && ((r) => onRate(t, r))}
              {...actionsProps}
            />
          }
        />
      </AITextAtRest.Provider>
    </div>
  );
}

const LIVE: readonly TurnStatusValue[] = ['thinking', 'acting', 'waiting'];

/** The longest the next holder waits for the last one's marks to leave, ms. */
const STILL_GUARD_MS = 2000;

/** Whether anything in `root` still shows working: a Processing dot, a spinner or a shimmering label. */
function showsWorking(root: Element | null): boolean {
  if (!root) return false;
  return [
    ...root.querySelectorAll(
      '.cds-processing circle, .cds-spinner, .cds-shimmer-text--active'
    ),
  ].some((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0.01 && r.height > 0.01;
  });
}

/** Calls `onStill` once nothing in `root()` shows working: read as its animations end and its marks change,
 *  not every frame, with a guard against a mark that never leaves. Returns the cancel. */
function whenStill(
  root: () => HTMLElement | null,
  onStill: () => void
): () => void {
  let done = false;
  const still = () => {
    if (done) return;
    done = true;
    onStill();
  };
  const watched = new WeakSet<Animation>();
  const check = () => {
    if (done) return;
    const el = root();
    if (!showsWorking(el)) return still();
    // What is still leaving: read again as each of its finite animations ends.
    for (const a of el?.getAnimations({ subtree: true }) ?? []) {
      if (
        watched.has(a) ||
        a.playState !== 'running' ||
        a.effect?.getTiming().iterations === Infinity
      )
        continue;
      watched.add(a);
      a.finished.then(check, check);
    }
  };
  let raf = 0;
  const later = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        check();
      });
  };
  const el = root();
  // A Processing mark's dots shrink in its own frame loop (r, transform, style): read in that frame, as they write.
  const mo =
    el && typeof MutationObserver !== 'undefined'
      ? new MutationObserver((records) => {
          const own = (r: MutationRecord) =>
            r.attributeName === 'class' ||
            r.attributeName === 'hidden' ||
            r.type === 'childList';
          if (
            records.some(
              (r) =>
                !own(r) && (r.target as Element).closest?.('.cds-processing')
            )
          )
            check();
          else if (records.some(own)) later();
        })
      : null;
  if (el)
    mo?.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'r', 'transform', 'style'],
    });
  const guard = window.setTimeout(still, STILL_GUARD_MS);
  later();
  return () => {
    done = true;
    mo?.disconnect();
    cancelAnimationFrame(raf);
    window.clearTimeout(guard);
  };
}

// Who holds a reply's one working element. A change is out, then in: the holder lets go at once and the
// next takes it once nothing in `rootRef` shows working (`whenStill`); reduced, at once.
function useNarrator<H extends string>(
  want: H | null,
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean
): H | null {
  const [holder, setHolder] = useState<H | null>(want);
  useEffect(() => {
    if (want === holder) return;
    // Out: nobody holds it while the last holder leaves.
    if (holder !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the out, one step of the hand-off
      setHolder(null);
      return;
    }
    if (reduced) {
      setHolder(want);
      return;
    }
    // In: once the reply shows nothing working.
    return whenStill(
      () => rootRef.current,
      () => setHolder(want)
    );
  }, [want, holder, reduced, rootRef]);
  return holder;
}
