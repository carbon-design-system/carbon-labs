/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motionTokens, playContentSwap } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { Button } from '@carbon-labs/react-button';
import {
  ProgressIndicator,
  ProgressStep,
  useProgressReach,
  type ProgressReach,
} from '@carbon-labs/react-progress-indicator';
import type { TearsheetAction } from '@carbon-labs/react-tearsheet';
import {
  completeSteps,
  stepAnnouncement,
  stepDirection,
  stepMove,
} from './steps';
import { inertProps } from '@carbon-labs/react-util';
import './step-flow.scss';

/* ============================================================================
 * StepFlow: a multi-step create flow.
 *
 *   swap     a step change is the content swap along x, out then in, the way
 *            the flow goes; the box's height glides with the in
 *   marker   the progress indicator's own glide, reaching on Back and Next
 *   blocked  Next on an invalid step stays: the step shows its errors, its
 *            indicator step turns invalid, focus goes to the first error
 *   reduced  a snap: the new step at once, no travel or fade
 *
 * API: IBM Products' create-flow words (`nextButtonText`, a step's `invalid`
 * and `disableSubmit`), as `useStepFlow` and its parts, or `StepFlow`.
 * ========================================================================== */

/** What a step's content is told: whether to show its errors (after a blocked Next). */
export interface StepFlowStepContext {
  showErrors: boolean;
}

export interface StepFlowStep {
  /** Unique within the flow. */
  id: string;
  /** The step's heading and its indicator label. */
  title: string;
  /** A line under the heading. */
  description?: ReactNode;
  /** A second line under the indicator label ("Optional"). */
  secondaryLabel?: string;
  /** Next holds on it and shows its errors. Default false. */
  invalid?: boolean;
  /** Next (or Submit) is disabled on it. Default false. */
  disableSubmit?: boolean;
  /** The step's fields, or a function given whether to show their errors. */
  content: ReactNode | ((context: StepFlowStepContext) => ReactNode);
}

export interface UseStepFlowOptions {
  steps: readonly StepFlowStep[];
  /** The step it opens on. Default 0. */
  initialIndex?: number;
  /** Called with the new step's index after each move. */
  onStepChange?: (index: number) => void;
  /** Called by Submit on the last step, once it is valid. */
  onSubmit?: () => void;
  /** Submit is busy and Back waits. */
  submitting?: boolean;
  /** Every invalid step shows its errors from the start (a saved draft). */
  showErrors?: boolean;
  /** Default "Back". */
  backButtonText?: string;
  /** Default "Next". */
  nextButtonText?: string;
  /** Default "Submit". */
  submitButtonText?: string;
  /** Default "Cancel". */
  cancelButtonText?: string;
  /** The words announced on a step change. Default "Step 2 of 3: Access". */
  announce?: (index: number, count: number, title: string) => string;
}

/** The flow, for its parts and for the app: where it is and its moves. */
export interface StepFlowController {
  steps: readonly StepFlowStep[];
  index: number;
  /** The furthest step shown so far. */
  reached: number;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
  /** Whether a step shows its errors. */
  showErrors(index: number): boolean;
  next(): void;
  back(): void;
  /** Go to a step: back always, forward only past valid steps. */
  goTo(index: number): void;
  /** Submit on the last step, once it is valid. */
  submit(): void;
  /** Back to the first step with nothing tried, at once (a new open). */
  reset(): void;
}

/** The last move's count (a new count is a new swap); a quiet one has no swap, focus or announcement. */
interface StepFlowMove {
  serial: number;
  quiet?: boolean;
}

/** What only the parts read. */
interface StepFlowInternal extends StepFlowController {
  complete: readonly boolean[];
  invalid: readonly boolean[];
  text: { back: string; next: string; submit: string; cancel: string };
  move: StepFlowMove | null;
  blocked: number;
  reach: ProgressReach;
  announcement(index: number): string;
  headingId(index: number): string;
}

const internal = (flow: StepFlowController) => flow as StepFlowInternal;

interface FlowState {
  index: number;
  reached: number;
  tried: readonly number[];
  move: StepFlowMove | null;
  blocked: number;
}

/** The flow's state and moves. Render its parts with it, anywhere: a tearsheet, a side panel, a page. */
export function useStepFlow({
  steps,
  initialIndex = 0,
  onStepChange,
  onSubmit,
  submitting = false,
  showErrors = false,
  backButtonText = 'Back',
  nextButtonText = 'Next',
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  announce = stepAnnouncement,
}: UseStepFlowOptions): StepFlowController {
  const uid = useId();
  const reach = useProgressReach();
  const [state, setState] = useState<FlowState>(() => ({
    index: initialIndex,
    reached: initialIndex,
    tried: [],
    move: null,
    blocked: 0,
  }));
  // The moves read the latest state, so two presses before a render each count (a double Next).
  const latest = useRef(state);
  const apply = (next: FlowState) => {
    latest.current = next;
    setState(next);
  };
  // Committed state wins: a reset during render, or a discarded render, never leaves it ahead.
  useLayoutEffect(() => {
    latest.current = state;
  }, [state]);
  const count = steps.length;
  const index = Math.min(state.index, Math.max(0, count - 1));
  const valid = steps.map((s) => !s.invalid);
  const shows = (i: number) => showErrors || state.tried.includes(i);

  const block = (at: number, s: FlowState): FlowState => ({
    ...s,
    tried: s.tried.includes(at) ? s.tried : [...s.tried, at],
    blocked: s.blocked + 1,
  });

  const goTo = (to: number) => {
    if (submitting) return;
    const now = latest.current;
    const at = Math.min(now.index, Math.max(0, count - 1));
    const m = stepMove(at, to, valid);
    let next: FlowState = now;
    if (m.blockedAt != null) next = block(m.blockedAt, next);
    if (m.index !== at) {
      next = {
        ...next,
        index: m.index,
        reached: Math.max(next.reached, m.index),
        move: { serial: (next.move?.serial ?? 0) + 1 },
      };
    }
    if (next === now) return;
    apply(next);
    if (m.index !== at) onStepChange?.(m.index);
  };

  const current = () => Math.min(latest.current.index, Math.max(0, count - 1));
  const submit = () => {
    const at = current();
    if (submitting || steps[at]?.disableSubmit) return;
    if (!valid[at]) apply(block(at, latest.current));
    else onSubmit?.();
  };

  const flow: StepFlowInternal = {
    steps,
    index,
    reached: state.reached,
    count,
    isFirst: index === 0,
    isLast: index === count - 1,
    submitting,
    showErrors: shows,
    next: () => {
      const at = current();
      if (steps[at]?.disableSubmit) return;
      if (at === count - 1) submit();
      else goTo(at + 1);
    },
    back: () => goTo(current() - 1),
    goTo,
    submit,
    // Called in a render (a new open): only state, never the ref.
    reset: () =>
      setState((s) => ({
        index: initialIndex,
        reached: initialIndex,
        tried: [],
        move: { serial: (s.move?.serial ?? 0) + 1, quiet: true },
        blocked: s.blocked,
      })),
    complete: completeSteps(index, state.reached, valid),
    invalid: valid.map((ok, i) => !ok && shows(i)),
    text: {
      back: backButtonText,
      next: nextButtonText,
      submit: submitButtonText,
      cancel: cancelButtonText,
    },
    move: state.move,
    blocked: state.blocked,
    reach,
    announcement: (i) => announce(i, count, steps[i]?.title ?? ''),
    headingId: (i) => `${uid}-step-${i}`,
  };
  return flow;
}

export interface StepFlowProgressProps {
  flow: StepFlowController;
  /** Steps in a column (a tearsheet's influencer). */
  vertical?: boolean;
  spaceEqually?: boolean;
  className?: string;
}

/** The steps on a progress indicator: the current one, the complete ones, and any blocked one invalid. */
export function StepFlowProgress({
  flow: f,
  vertical,
  spaceEqually,
  className,
}: StepFlowProgressProps) {
  const flow = internal(f);
  return (
    <ProgressIndicator
      currentIndex={flow.index}
      vertical={vertical}
      spaceEqually={spaceEqually}
      reach={flow.reach}
      className={['cds-step-flow__progress', className]
        .filter(Boolean)
        .join(' ')}>
      {flow.steps.map((s, i) => (
        <ProgressStep
          key={s.id}
          label={s.title}
          secondaryLabel={s.secondaryLabel}
          complete={flow.complete[i]}
          invalid={flow.invalid[i]}
        />
      ))}
    </ProgressIndicator>
  );
}

export interface StepFlowBodyProps {
  flow: StepFlowController;
  /** The steps' heading level. Default 3 (under a sheet's h2). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  /** Slow motion. Default the page's (1). */
  timeScale?: number;
}

const STANDARD = `cubic-bezier(${motionTokens.easing['standard-productive'].join(', ')})`;
/** A field in error: one marked invalid, or a radio in an invalid group (the group carries the error). */
const FIRST_ERROR = '[aria-invalid="true"], .cds-radio--invalid input';

/** The current step: its heading, its content, the swap between steps and the announcement. */
export function StepFlowBody({
  flow: f,
  headingLevel = 3,
  className,
  timeScale,
}: StepFlowBodyProps) {
  const flow = internal(f);
  const motion = useFeedbackMotion();
  const scale = timeScale ?? motion.timeScale;
  const reduced = motion.reduced;
  const box = useRef<HTMLDivElement>(null);
  const panes = useRef<(HTMLElement | null)[]>([]);
  const lastH = useRef<number | null>(null);
  const [live, setLive] = useState('');

  // The step leaving: the one shown before (moves between renders count once), kept while it goes.
  const serial = flow.move?.serial ?? 0;
  const [swap, setSwap] = useState({
    serial,
    leaving: null as number | null,
    from: flow.index,
    shown: flow.index,
  });
  if (swap.serial !== serial && flow.move) {
    const from = swap.shown;
    setSwap({
      serial,
      leaving: flow.move.quiet || from === flow.index ? null : from,
      from,
      shown: flow.index,
    });
    // A reset says nothing, and empties the live region.
    if (flow.move.quiet) setLive('');
  }
  // The move it mounted on is past: a tearsheet remounts its content on each open.
  const mountSerial = useRef(serial);
  // A blocked Next after the last move: its focus on the error wins over the arrival's.
  const blockedSinceMove = useRef(false);

  const H = `h${headingLevel}` as 'h3';
  const heading = (i: number) =>
    panes.current[i]?.querySelector<HTMLElement>('.cds-step-flow__title') ??
    null;

  // Its height at rest, kept current: what the next swap glides from.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const note = () => {
      if (!('swapping' in el.dataset)) lastH.current = el.offsetHeight;
    };
    note();
    const ro = new ResizeObserver(note);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    const inEl = panes.current[flow.index];
    if (!el || !inEl || swap.serial === mountSerial.current) return;
    blockedSinceMove.current = false;
    if (flow.move?.quiet || swap.from === flow.index) {
      // An earlier out may still hold this step at its end: shown as it is.
      inEl.getAnimations().forEach((a) => a.cancel());
      return;
    }
    const outEl =
      swap.leaving != null && swap.leaving !== flow.index
        ? (panes.current[swap.leaving] ?? null)
        : null;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const dir = stepDirection(swap.from, flow.index);
    const s = playContentSwap({
      out: outEl,
      in: inEl,
      axis: 'x',
      direction: rtl ? -dir : dir,
      timeScale: scale,
      reduced,
    });

    let alive = true;
    let arrived = false;
    // Once the old step has gone: it drops out, and focus and the announcement come with the in.
    const arrive = () => {
      if (!alive || arrived) return;
      arrived = true;
      setSwap((v) => (v.serial === swap.serial ? { ...v, leaving: null } : v));
      if (!blockedSinceMove.current) heading(flow.index)?.focus();
      setLive(flow.announcement(flow.index));
    };
    if (s.outAnimation)
      void s.outAnimation.finished.then(arrive, () => undefined);
    else arrive();
    // A hidden tab never finishes an animation: the clock is the fallback, never ahead of a running out.
    let timer = 0;
    const fallback = () => {
      if (s.outAnimation?.playState === 'running' && !document.hidden)
        timer = window.setTimeout(fallback, s.wait + s.inMs);
      else arrive();
    };
    timer = window.setTimeout(fallback, s.wait + s.inMs);

    // The height: held through the out, gliding to the new step's with the in.
    el.dataset.swapping = '';
    const running = el.getAnimations();
    const h0 = running.length
      ? el.getBoundingClientRect().height
      : (lastH.current ?? el.offsetHeight);
    running.forEach((a) => a.cancel());
    const h1 = el.offsetHeight;
    lastH.current = h1;
    const settle = () => {
      if (!el.getAnimations().length && !inEl.getAnimations().length)
        delete el.dataset.swapping;
    };
    void s.inAnimation.finished.then(settle, () => undefined);
    if (!reduced && Math.abs(h1 - h0) >= 0.5) {
      const glide = el.animate([{ height: `${h0}px` }, { height: `${h1}px` }], {
        duration: s.inMs,
        delay: s.wait,
        easing: STANDARD,
        fill: 'backwards',
      });
      void glide.finished.then(settle, () => undefined);
    } else if (reduced) settle();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per move
  }, [swap.serial]);

  // A blocked Next: focus goes to the step's first error, else its heading.
  const blockedSeen = useRef(flow.blocked);
  useLayoutEffect(() => {
    if (flow.blocked === blockedSeen.current) return;
    blockedSeen.current = flow.blocked;
    blockedSinceMove.current = true;
    const pane = panes.current[flow.index];
    // A field shows its error a render later (its own effect): look for a few frames.
    let frame = 0;
    let tries = 3;
    const look = () => {
      const error = pane?.querySelector<HTMLElement>(FIRST_ERROR);
      if (error || --tries <= 0) (error ?? heading(flow.index))?.focus();
      else frame = requestAnimationFrame(look);
    };
    frame = requestAnimationFrame(look);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per blocked press
  }, [flow.blocked]);

  return (
    <div
      ref={box}
      className={['cds-step-flow__body', className].filter(Boolean).join(' ')}>
      {flow.steps.map((step, i) => {
        const current = i === flow.index;
        const leaving = !current && i === swap.leaving;
        const content =
          typeof step.content === 'function'
            ? step.content({ showErrors: flow.showErrors(i) })
            : step.content;
        return (
          <section
            key={step.id}
            ref={(el) => {
              panes.current[i] = el;
            }}
            className={[
              'cds-step-flow__step',
              leaving && 'cds-step-flow__step--leaving',
            ]
              .filter(Boolean)
              .join(' ')}
            data-step={step.id}
            hidden={!current && !leaving}
            aria-hidden={leaving || undefined}
            {...inertProps(leaving)}
            aria-labelledby={flow.headingId(i)}>
            <div className="cds-step-flow__header">
              <H
                id={flow.headingId(i)}
                className="cds-step-flow__title"
                tabIndex={-1}>
                {step.title}
              </H>
              {step.description != null && (
                <p className="cds-step-flow__description">{step.description}</p>
              )}
            </div>
            {content}
          </section>
        );
      })}
      <p className="cds-step-flow__live" role="status" aria-live="polite">
        {live}
      </p>
    </div>
  );
}

/** The flow's buttons, for a tearsheet's `actions` or StepFlowActions: Cancel, Back, then Next or Submit, reaching the marker. */
export function stepFlowActions(
  f: StepFlowController,
  { onCancel }: { onCancel?: () => void } = {}
): TearsheetAction[] {
  const flow = internal(f);
  const { text } = flow;
  return [
    ...(onCancel
      ? [{ label: text.cancel, frame: 'ghost' as const, onClick: onCancel }]
      : []),
    {
      label: text.back,
      kind: 'secondary' as const,
      disabled: flow.isFirst || flow.submitting,
      ...flow.reach.press(flow.index - 1),
      onClick: flow.back,
    },
    {
      label: flow.isLast ? text.submit : text.next,
      kind: 'primary' as const,
      disabled: !!flow.steps[flow.index]?.disableSubmit,
      loading: flow.isLast && flow.submitting,
      ...(flow.isLast ? null : flow.reach.press(flow.index + 1)),
      onClick: flow.next,
    },
  ];
}

export interface StepFlowActionsProps {
  flow: StepFlowController;
  /** Adds Cancel before Back. */
  onCancel?: () => void;
  className?: string;
  timeScale?: number;
}

/** The flow's buttons on an action set, in place: `stepFlowActions`, drawn. */
export function StepFlowActions({
  flow,
  onCancel,
  className,
  timeScale,
}: StepFlowActionsProps) {
  const motion = useFeedbackMotion();
  const scale = timeScale ?? motion.timeScale;
  return (
    <div
      className={['cds-step-flow__actions', className]
        .filter(Boolean)
        .join(' ')}>
      {stepFlowActions(flow, { onCancel }).map(
        ({ label, loading, ...a }, i) => (
          <Button key={i} {...a} busy={loading} timeScale={scale}>
            {label}
          </Button>
        )
      )}
    </div>
  );
}

export interface StepFlowProps extends UseStepFlowOptions {
  /** The indicator in a column beside the steps. Default above them. */
  vertical?: boolean;
  /** Adds Cancel before Back. */
  onCancel?: () => void;
  headingLevel?: 2 | 3 | 4;
  className?: string;
  timeScale?: number;
}

/** The whole flow in place: the indicator, the current step, and Back and Next under it. */
export function StepFlow({
  vertical,
  onCancel,
  headingLevel,
  className,
  timeScale,
  ...options
}: StepFlowProps) {
  const flow = useStepFlow(options);
  return (
    <div
      className={[
        'cds-step-flow',
        vertical && 'cds-step-flow--vertical',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-step-index={flow.index}>
      <StepFlowProgress flow={flow} vertical={vertical} />
      <div className="cds-step-flow__main">
        <StepFlowBody
          flow={flow}
          headingLevel={headingLevel}
          timeScale={timeScale}
        />
        <StepFlowActions
          flow={flow}
          onCancel={onCancel}
          timeScale={timeScale}
        />
      </div>
    </div>
  );
}
