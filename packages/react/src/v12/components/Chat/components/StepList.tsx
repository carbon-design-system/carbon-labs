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
  DURATION_FLOOR_MS,
  SKELETON_WAVE,
  durationStepForDistance,
  motionTokens,
  stepDown,
} from '@carbon-labs/v12-motion';
import { FeedbackMotion, useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  ChevronDownUpToggle,
  CircleDash,
} from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import {
  disclosureTiming,
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { IconButton } from '@carbon-labs/react-tooltip';
import {
  playShimmerReveal,
  ShimmerText,
} from '@carbon-labs/react-shimmer-text';
import {
  resolveSpinnerMotion,
  SPINNER_MOTION,
  STATUS_HANDOFF,
  StatusMark,
  SwapSlot,
  type StatusMarkKind,
} from '@carbon-labs/react-feedback';
import { useGlide, usePartRollover, useWidthGlide } from './glide';
import { formatDuration } from './TurnStatus';
import './step-list.scss';

/* ============================================================================
 * StepList: the steps a reply takes, as they happen.
 *
 *   status   one StatusMark per row changing in place by the status hand-off;
 *            queued to running winds the dashed circle into the spinner
 *   words    labels and trailing words swap out, then in through the band
 *   arrival  a new step's space opens by travel, its content moving with it
 *   burst    a change while the list still moves lands at once
 *   collapse `collapsible`: a counter line that opens and shuts the rows
 *   one      `workingStep`: only that running step shows it's working
 *   reduced  rows and marks land at once; plain labels
 * ========================================================================== */

export type StepStatus =
  | 'queued'
  | 'running'
  | 'waiting'
  | 'done'
  | 'error'
  | 'cancelled';

export interface Step {
  id: string;
  /** The step's words while it is queued, runs or waits ("Searching the CRM"). */
  label: string;
  /** Its words once done, in the past tense ("Searched the CRM"). Default `label`. */
  doneLabel?: string;
  status: StepStatus;
  /** A tool call (counted in the summary as a tool). */
  tool?: boolean;
  /** A few trailing words: a result's size ("214 deals"), a waiting step's ask. */
  detail?: string;
  /** When it started and ended (`performance.now()`): the duration shown once done. */
  startedAt?: number;
  endedAt?: number;
  /** How many times it has run (a retried step: 2). */
  attempts?: number;
  /** The cause, when it failed. Default "Failed". */
  error?: string;
  /** Retry, when it failed. */
  onRetry?: () => void;
  /** The person's choices while it waits (Approve, Skip …). */
  actions?: ReactNode;
  /** A tool call's input and output: the row expands to show them. */
  input?: ReactNode;
  output?: ReactNode;
}

/** StepList's words, each a prop with an English default. */
export interface StepListWords {
  /** Each mark's name by status. Default "Queued", "Running", "Waiting", "Done", "Failed", "Cancelled". */
  queuedStatusLabel?: string;
  runningStatusLabel?: string;
  waitingStatusLabel?: string;
  doneStatusLabel?: string;
  failedStatusLabel?: string;
  cancelledStatusLabel?: string;
  /** A waiting step's words when it has no `detail`. Default "Needs approval". */
  needsApprovalLabel?: string;
  /** A failed step's retry. Default "Retry". */
  retryButtonText?: string;
  /** A call's expand button, shut and open. Default "Show the call", "Hide the call". */
  showCallButtonLabel?: string;
  hideCallButtonLabel?: string;
  /** A call's parts. Default "Input", "Output". */
  inputLabel?: string;
  outputLabel?: string;
  /** What a settled step adds to its words when announced. Default "done", "failed", "needs approval", "cancelled". */
  doneAnnouncement?: string;
  failedAnnouncement?: string;
  waitingAnnouncement?: string;
  cancelledAnnouncement?: string;
  /** A retried step's runs. Default "2 attempts". */
  formatAttempts?: (n: number) => string;
  /** The counter line's count. Default `countSteps`: "4 steps · 3 tools". */
  formatCount?: (steps: readonly Step[]) => string;
}

export interface StepListProps extends StepListWords {
  steps: Step[];
  /** The list's accessible name. Default "Steps". */
  label?: string;
  /** A counter line over the rows that opens and shuts them. Default false. */
  collapsible?: boolean;
  /** With `collapsible`: open at first. Default true. */
  defaultExpanded?: boolean;
  /** With `collapsible`: shut itself one loading period after every step has ended. Default true. */
  autoCollapse?: boolean;
  /** Multiplies every clock (a lab's slow motion). Default the feedback family's. */
  timeScale?: number;
  /** Overrides reduced motion. Default the feedback family's. */
  reduced?: boolean;
  /** The one running step that may show it's working. Null: none. Default every running step. */
  workingStep?: string | null;
  className?: string;
}

/** The list's motion: its clocks, read when used, and the dashed circle's wind-up. */
export const STEP_LIST_MOTION = {
  /** A change inside this long after the last one lands at once (the swap's out and in, 280ms). */
  get burstMs(): number {
    return (
      motionTokens.duration[CONTENT_SWAP.out.duration] +
      motionTokens.duration[CONTENT_SWAP.in.duration]
    );
  },
  /** A finished collapsible list shuts this long after its last step ends: one loading period. */
  get collapseAfterMs(): number {
    return SKELETON_WAVE.periodMs;
  },
  queuedOut: (sizePx: number, to: 'spinner' | 'status', timeScale = 1) =>
    queuedOut(sizePx, to, timeScale),
};

const curveOf = (name: 'exit-productive') => motionTokens.easing[name];

/** The dashed circle's wind-up out of queued: its scale, turn and clock, landing at the spinner's speed. */
function queuedOut(sizePx: number, to: 'spinner' | 'status', timeScale = 1) {
  // The spinner's entrance scale as it is drawn (a page's tuning included, kept as playSpinnerEnter keeps it).
  const enter = Math.min(1, Math.max(0.5, resolveSpinnerMotion().enterScale));
  const scale =
    to === 'spinner' ? enter : (sizePx - STATUS_HANDOFF.shrinkPx) / sizePx;
  const token = stepDown(durationStepForDistance((sizePx * (1 - scale)) / 2));
  const ms = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[token] * timeScale
  );
  // The curve's slope as it lands: from its second handle, or, where that sits on the end (exit-productive's
  // does), from its first.
  const [x1, y1, x2, y2] = curveOf('exit-productive');
  const endSlope = x2 < 1 ? (1 - y2) / (1 - x2) : (1 - y1) / (1 - x1);
  // Degrees: the spinner's turn speed (deg per ms, slowed with the clock) × the clock ÷ the curve's end slope.
  const turnDeg =
    to === 'spinner'
      ? ((360 / (SPINNER_MOTION.periodMs * timeScale)) * ms) / endSlope
      : 0;
  return { scale, token, ms, turnDeg };
}

// A row's mark: the dashed circle while queued, else the StatusMark. Out of queued it winds up, then
// cuts; any other change of face is the SwapSlot's around it.
function StepMark({
  queued,
  kind,
  name,
  timeScale,
  reduced,
}: {
  queued: boolean;
  kind: StatusMarkKind;
  name: string;
  timeScale: number;
  reduced: boolean;
}) {
  const [shown, setShown] = useState<'queued' | 'status'>(
    queued ? 'queued' : 'status'
  );
  // The status a wind-up hands to: a disc arriving from pending grows and draws its glyph (not the spinner's own entrance).
  const [from, setFrom] = useState<StatusMarkKind | undefined>(undefined);
  const dashRef = useRef<HTMLSpanElement>(null);
  const want = queued ? 'queued' : 'status';
  useLayoutEffect(() => {
    if (shown === want) return;
    const svg = dashRef.current?.querySelector('svg');
    if (
      want === 'queued' ||
      reduced ||
      !svg ||
      typeof svg.animate !== 'function'
    ) {
      setFrom(undefined);
      setShown(want);
      return;
    }
    const to = kind === 'pending' ? 'spinner' : 'status';
    const out = queuedOut(
      svg.getBoundingClientRect().width || 16,
      to,
      timeScale
    );
    const [x1, y1, x2, y2] = curveOf('exit-productive');
    const anim = svg.animate(
      [
        { scale: '1', rotate: '0deg' },
        { scale: `${out.scale}`, rotate: `${out.turnDeg}deg` },
      ],
      {
        duration: out.ms,
        easing: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
        fill: 'forwards',
      }
    );
    let live = true;
    anim.finished.then(
      () => {
        if (!live) return;
        // The cut: the spinner (or the disc) takes the dashes' place on the frame they land.
        setFrom(to === 'status' ? 'pending' : undefined);
        setShown('status');
      },
      () => {}
    );
    return () => {
      live = false;
      anim.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of face
  }, [want]);
  return shown === 'queued' ? (
    <span ref={dashRef} className="cds-step-list__queued" data-mark="queued">
      <CircleDash size={16} aria-label={name} />
    </span>
  ) : (
    <StatusMark
      key={from ?? 'live'}
      kind={kind}
      size={16}
      from={from}
      description={name}
      variant="hero"
    />
  );
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** The steps that happened, counted: "4 steps · 3 tools", plus any failed or cancelled. */
export function countSteps(steps: readonly Step[]): string {
  const happened = steps.filter((s) => s.status !== 'queued');
  const tools = happened.filter((s) => s.tool).length;
  const failed = happened.filter((s) => s.status === 'error').length;
  const cancelled = happened.filter((s) => s.status === 'cancelled').length;
  return [
    plural(happened.length, 'step'),
    tools > 0 && plural(tools, 'tool'),
    failed > 0 && `${failed} failed`,
    cancelled > 0 && `${cancelled} cancelled`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** The finished list in one line: the count, then the real time of the run ("4 steps · 3 tools · 9.2s"). */
export function summarizeSteps(
  steps: readonly Step[],
  timeScale = 1,
  count: (steps: readonly Step[]) => string = countSteps
): string {
  const timed = steps.filter((s) => s.startedAt != null && s.endedAt != null);
  if (!timed.length) return count(steps);
  const from = Math.min(...timed.map((s) => s.startedAt!));
  const to = Math.max(...timed.map((s) => s.endedAt!));
  return `${count(steps)} · ${formatDuration((to - from) / timeScale)}`;
}

const MARK: Record<StepStatus, StatusMarkKind | 'queued' | null> = {
  queued: 'queued',
  running: 'pending',
  waiting: 'warning-alt',
  done: 'success',
  error: 'error',
  cancelled: null,
};
type Words = Required<StepListWords>;

const WORDS: Words = {
  queuedStatusLabel: 'Queued',
  runningStatusLabel: 'Running',
  waitingStatusLabel: 'Waiting',
  doneStatusLabel: 'Done',
  failedStatusLabel: 'Failed',
  cancelledStatusLabel: 'Cancelled',
  needsApprovalLabel: 'Needs approval',
  retryButtonText: 'Retry',
  showCallButtonLabel: 'Show the call',
  hideCallButtonLabel: 'Hide the call',
  inputLabel: 'Input',
  outputLabel: 'Output',
  doneAnnouncement: 'done',
  failedAnnouncement: 'failed',
  waitingAnnouncement: 'needs approval',
  cancelledAnnouncement: 'cancelled',
  formatAttempts: (n) => `${n} attempts`,
  formatCount: countSteps,
};

/** The props' words over the defaults (an `undefined` prop keeps its default). */
function wordsFrom(props: StepListWords): Words {
  const w = { ...WORDS };
  for (const k of Object.keys(WORDS) as (keyof Words)[])
    if (props[k] !== undefined) (w as Record<string, unknown>)[k] = props[k];
  return w;
}

const statusName = (w: Words, s: StepStatus) =>
  ({
    queued: w.queuedStatusLabel,
    running: w.runningStatusLabel,
    waiting: w.waitingStatusLabel,
    done: w.doneStatusLabel,
    error: w.failedStatusLabel,
    cancelled: w.cancelledStatusLabel,
  })[s];

const wordsOf = (s: Step) =>
  s.status === 'done' ? (s.doneLabel ?? s.label) : s.label;

/** What a settled step says to assistive technology, once. */
function announcement(s: Step, w: Words): string | null {
  if (s.status === 'done') return `${wordsOf(s)}, ${w.doneAnnouncement}`;
  if (s.status === 'error')
    return `${s.label}: ${s.error ?? w.failedAnnouncement}`;
  if (s.status === 'waiting')
    return `${s.label}: ${s.detail ?? w.waitingAnnouncement}`;
  if (s.status === 'cancelled') return `${s.label}: ${w.cancelledAnnouncement}`;
  return null;
}

interface Track {
  /** Each step's status as last seen. */
  statuses: Map<string, StepStatus>;
  /** A step's snap generation: a change inside a burst remounts its mark and words, so they land at once. */
  gens: Map<string, number>;
  /** The steps whose arrival moves (the first of a burst, after the first paint). */
  arrive: Set<string>;
  /** The steps arriving, moving, in this change. */
  fresh: string[];
  /** When the list last changed. */
  lastAt: number;
  /** The latest settled step's words, for the live region. */
  said: string;
  sig: string;
}

const sigOf = (steps: readonly Step[]) =>
  steps.map((s) => `${s.id}:${s.status}`).join('|');

function List(props: StepListProps) {
  const {
    steps,
    label = 'Steps',
    collapsible = false,
    defaultExpanded = true,
    autoCollapse = true,
    workingStep,
    className,
  } = props;
  const { timeScale, reduced } = useFeedbackMotion();
  const words = wordsFrom(props);
  const rootRef = useRef<HTMLDivElement>(null);
  const moves = useDisclosureMoves(rootRef, { reason: 'step-list', timeScale });

  // Arrivals and changes, with the stillness rule: inside a burst, at once.
  const [track, setTrack] = useState<Track>(() => ({
    statuses: new Map(steps.map((s) => [s.id, s.status])),
    gens: new Map(),
    arrive: new Set(),
    fresh: [],
    lastAt: -Infinity,
    said: '',
    sig: sigOf(steps),
  }));
  const sig = sigOf(steps);
  if (sig !== track.sig) {
    // eslint-disable-next-line react-hooks/purity -- read once per change of steps, to time the burst
    const now = performance.now();
    // Warm: the list is still moving from its last change.
    const warm = now - track.lastAt < STEP_LIST_MOTION.burstMs * timeScale;
    const arrivals = steps.filter((s) => !track.statuses.has(s.id));
    const changes = steps.filter(
      (s) => track.statuses.has(s.id) && track.statuses.get(s.id) !== s.status
    );
    // Rows arriving together are one layout move; a status change morphs alone.
    // Several changing at once, or anything inside a burst, lands at once.
    const arrivalsMove = !warm && !reduced;
    const changeMoves = !warm && changes.length === 1;
    const gens = new Map(track.gens);
    const arrive = new Set(track.arrive);
    arrivals.forEach((s) =>
      arrivalsMove ? arrive.add(s.id) : arrive.delete(s.id)
    );
    if (!changeMoves)
      changes.forEach((s) => gens.set(s.id, (gens.get(s.id) ?? 0) + 1));
    let said = track.said;
    for (const s of [...changes, ...arrivals])
      said = announcement(s, words) ?? said;
    const changed = arrivals.length + changes.length > 0;
    const fresh = arrivalsMove ? arrivals.map((s) => s.id) : [];
    setTrack({
      statuses: new Map(steps.map((s) => [s.id, s.status])),
      gens,
      arrive,
      fresh,
      lastAt: changed ? now : track.lastAt,
      said,
      sig,
    });
  }

  // The counter line: open at first; shut once every step has ended; open again for a failure or a wait.
  const [open, setOpen] = useState(defaultExpanded);
  const used = useRef(false);
  const allEnded =
    steps.length > 0 &&
    steps.every((s) => s.status === 'done' || s.status === 'cancelled');
  const needsYou = steps.some(
    (s) => s.status === 'error' || s.status === 'waiting'
  );
  const [wasNeeding, setWasNeeding] = useState(needsYou);
  if (wasNeeding !== needsYou) {
    setWasNeeding(needsYou);
    if (needsYou && collapsible) setOpen(true);
  }
  useEffect(() => {
    if (!collapsible || !autoCollapse || !allEnded || used.current) return;
    const t = window.setTimeout(
      () => setOpen(false),
      STEP_LIST_MOTION.collapseAfterMs * timeScale
    );
    return () => window.clearTimeout(t);
  }, [collapsible, autoCollapse, allEnded, timeScale]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const body = useDisclosureBody(bodyRef, !collapsible || open, moves, reduced);
  const bodyId = useId();
  const counter = allEnded
    ? summarizeSteps(steps, timeScale, words.formatCount)
    : words.formatCount(steps);
  // The counter's chevron glides when its words change width; the toggle has the rollover.
  const counterRef = useRef<HTMLSpanElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  useGlide(chevronRef, counterRef, { timeScale, reduced });
  usePartRollover(rootRef, '.cds-step-list__toggle', { timeScale, reduced });
  // A list that starts empty (its run is starting) brings its counter line in through the shimmer's band.
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [bornEmpty] = useState(steps.length === 0);
  useLayoutEffect(() => {
    if (!bornEmpty || !toggleRef.current) return;
    const anim = playShimmerReveal(toggleRef.current, { timeScale, reduced });
    return () => anim?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as it arrives
  }, []);

  // The rule's tail above new rows grows down into them on the opening's clock; reduced, or inside a
  // burst, it's there at once.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || !track.fresh.length) return;
    const items = track.fresh.map((id) =>
      root.querySelector<HTMLElement>(
        `.cds-step-list__item[data-step-id="${CSS.escape(id)}"]`
      )
    );
    const above = items[0]?.previousElementSibling?.querySelector<HTMLElement>(
      ':scope > .cds-step-list__arrival .cds-step-list__step'
    );
    if (!above) return;
    const travels = items.map(
      (li) =>
        li?.querySelector<HTMLElement>('.cds-step-list__step')?.offsetHeight ??
        0
    );
    const ms =
      motionTokens.duration[disclosureTiming(travels).token] * timeScale;
    above.animate(
      { scale: ['1 0', '1 1'] },
      {
        duration: ms,
        easing: `cubic-bezier(${motionTokens.easing['entrance-productive'].join(', ')})`,
        pseudoElement: '::after',
      }
    );
    // On a change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const rows = (
    <ol className="cds-step-list__steps" aria-label={label}>
      {steps.map((s) => (
        <Row
          key={s.id}
          step={s}
          gen={track.gens.get(s.id) ?? 0}
          arrive={track.arrive.has(s.id)}
          moves={moves}
          words={words}
          working={
            s.status === 'running' &&
            (workingStep === undefined || workingStep === s.id)
          }
        />
      ))}
    </ol>
  );

  return (
    <div
      ref={rootRef}
      className={[
        'cds-step-list',
        collapsible && 'cds-step-list--collapsible',
        steps.some((s) => s.input != null || s.output != null) &&
          'cds-step-list--calls',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      {collapsible && (
        <button
          ref={toggleRef}
          type="button"
          className="cds-step-list__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            used.current = true;
            setOpen((o) => !o);
          }}
          data-motion-icon-frame="">
          {/* The count changes at once: no counting. */}
          <span ref={counterRef} className="cds-step-list__count">
            {/* Still words, carrying the band for the reveal. */}
            <ShimmerText active={false}>{counter}</ShimmerText>
          </span>
          <span ref={chevronRef} className="cds-step-list__chevron">
            <ChevronDownUpToggle
              size={16}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </span>
        </button>
      )}
      {collapsible ? (
        <div
          ref={bodyRef}
          id={bodyId}
          className="cds-disclosure__body cds-step-list__body"
          {...body.bodyProps}>
          <div className="cds-disclosure__clip">
            <div className="cds-disclosure__content">{rows}</div>
          </div>
        </div>
      ) : (
        rows
      )}
      <span
        className="cds-step-list__announce"
        role="status"
        aria-live="polite">
        {track.said}
      </span>
    </div>
  );
}

function Row({
  step: s,
  gen,
  arrive,
  moves,
  words: w,
  working,
}: {
  step: Step;
  gen: number;
  arrive: boolean;
  moves: DisclosureMoves;
  words: Words;
  working: boolean;
}) {
  const { timeScale, reduced } = useFeedbackMotion();

  // The arrival: the row's space opens from shut, its content moving with the opening.
  const arrivalRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(!arrive);
  useLayoutEffect(() => {
    if (placed) return;
    // The shut state is resolved before the change, so the opening runs as a transition.
    if (arrivalRef.current)
      void getComputedStyle(arrivalRef.current).gridTemplateRows;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the opening must start after the shut state has been laid out
    setPlaced(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as it arrives
  }, []);
  const arrival = useDisclosureBody(arrivalRef, placed, moves, reduced);

  // A tool call's input and output.
  const [ioOpen, setIoOpen] = useState(false);
  const ioRef = useRef<HTMLDivElement>(null);
  const io = useDisclosureBody(ioRef, ioOpen, moves, reduced);
  const ioId = useId();
  const hasIo = s.input != null || s.output != null;

  // A running step without the baton keeps the dashed circle, still, until the baton reaches it.
  const mark = s.status === 'running' && !working ? 'queued' : MARK[s.status];
  // The mark's place swaps only to and from nothing (cancelled); queued → a status is StepMark's hand-off.
  const markFace = mark === null ? 'none' : 'mark';
  const words = wordsOf(s);
  const took =
    s.status === 'done' && s.startedAt != null && s.endedAt != null
      ? formatDuration((s.endedAt - s.startedAt) / timeScale)
      : null;

  let trailText: string | null = null;
  let trailExtra: ReactNode = null;
  if (s.status === 'running') trailText = s.detail ?? null;
  else if (s.status === 'waiting') {
    trailText = s.detail ?? w.needsApprovalLabel;
    trailExtra = s.actions;
  } else if (s.status === 'done') {
    trailText =
      [s.detail, (s.attempts ?? 1) > 1 && w.formatAttempts(s.attempts!), took]
        .filter(Boolean)
        .join(' · ') || null;
  } else if (s.status === 'error') {
    trailText = s.error ?? w.failedStatusLabel;
    trailExtra = s.onRetry && (
      <Button frame="ghost" size="xs" onClick={s.onRetry} timeScale={timeScale}>
        {w.retryButtonText}
      </Button>
    );
  } else if (s.status === 'cancelled')
    trailText = s.detail ?? w.cancelledStatusLabel;
  const trailKey = `${s.status}|${trailText ?? ''}`;
  // The trailing words' place glides to their width, so the label gives way smoothly.
  const trailRef = useRef<HTMLSpanElement>(null);
  useWidthGlide(trailRef, { timeScale, reduced });

  return (
    <li
      className="cds-step-list__item"
      data-status={s.status}
      data-step-id={s.id}
      data-working={working || undefined}>
      <div
        ref={arrivalRef}
        className="cds-disclosure__body cds-step-list__arrival"
        {...arrival.bodyProps}>
        <div className="cds-disclosure__clip">
          <div className="cds-disclosure__content cds-step-list__step">
            <div className="cds-step-list__row">
              {/* A burst's change remounts the mark and the words (`gen`): they land at once. */}
              <span className="cds-step-list__mark">
                <SwapSlot
                  key={gen}
                  swapKey={markFace}
                  empty={markFace === 'none'}>
                  {mark === null ? null : (
                    <StepMark
                      queued={mark === 'queued'}
                      kind={mark === 'queued' ? 'pending' : mark}
                      name={statusName(w, s.status)}
                      timeScale={timeScale}
                      reduced={reduced}
                    />
                  )}
                </SwapSlot>
              </span>
              <SwapSlot
                key={`w${gen}`}
                swapKey={words}
                enter="reveal"
                className="cds-step-list__words">
                <ShimmerText active={working} className="cds-step-list__label">
                  {words}
                </ShimmerText>
              </SwapSlot>
              {/* The trailing words arrive with the new mark: after the out, even from nothing. */}
              <span ref={trailRef} className="cds-step-list__trail-place">
                <SwapSlot
                  key={`t${gen}`}
                  swapKey={trailKey}
                  empty={trailText == null && trailExtra == null}
                  inDelay={motionTokens.duration[CONTENT_SWAP.out.duration]}
                  enter="reveal"
                  className="cds-step-list__trail">
                  {(trailText != null || trailExtra != null) && (
                    <span className="cds-step-list__trail-face">
                      {trailText != null && (
                        <ShimmerText
                          active={false}
                          className="cds-step-list__detail">
                          {trailText}
                        </ShimmerText>
                      )}
                      {trailExtra}
                    </span>
                  )}
                </SwapSlot>
              </span>
              {hasIo && (
                <IconButton
                  label={ioOpen ? w.hideCallButtonLabel : w.showCallButtonLabel}
                  frame="ghost"
                  size="xs"
                  aria-expanded={ioOpen}
                  aria-controls={ioId}
                  onClick={() => setIoOpen((o) => !o)}
                  className="cds-step-list__expand">
                  <ChevronDownUpToggle
                    size={16}
                    toggled={ioOpen}
                    disableToggle
                    aria-hidden="true"
                  />
                </IconButton>
              )}
            </div>
            {hasIo && (
              <div
                ref={ioRef}
                id={ioId}
                className="cds-disclosure__body cds-step-list__io-body"
                {...io.bodyProps}>
                <div className="cds-disclosure__clip">
                  <div className="cds-disclosure__content cds-step-list__io">
                    {s.input != null && (
                      <div className="cds-step-list__io-part">
                        <span className="cds-step-list__io-name">
                          {w.inputLabel}
                        </span>
                        <div className="cds-step-list__io-value">{s.input}</div>
                      </div>
                    )}
                    {s.output != null && (
                      <div className="cds-step-list__io-part">
                        <span className="cds-step-list__io-name">
                          {w.outputLabel}
                        </span>
                        <div className="cds-step-list__io-value">
                          {s.output}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/** The steps. `timeScale` and `reduced` override the feedback family's motion for the list. */
export function StepList(props: StepListProps): ReactNode {
  const outer = useFeedbackMotion();
  const timeScale = props.timeScale ?? outer.timeScale;
  const reduced = props.reduced ?? outer.reduced;
  return (
    <FeedbackMotion timeScale={timeScale} reduced={reduced}>
      <List {...props} />
    </FeedbackMotion>
  );
}
StepList.displayName = 'StepList';
