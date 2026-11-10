/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  DURATION_FLOOR_MS,
  attachRollover,
  attachSelection,
  durationStepForDistance,
  motionTokens,
  type Selection,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  pitchAt,
  reachForLength,
  stretchForLength,
} from '@carbon-labs/v12-motion';
import {
  ProgressStep as ProgressStepIcon,
  type ProgressStepState,
} from '@carbon-labs/react-motion-icons';
import { useDirection } from '@carbon-labs/react-selection-kit';
import './progress-indicator.scss';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * ProgressIndicator: a task's steps on a line, drawn as line tabs.
 *
 *   marker   the selection's bar over the current step; it glides by travel,
 *            its leading edge ahead by the track's stretch (`stretchForLength`)
 *   reach    a press that will move it (a step, or Back and Next through
 *            `useProgressReach`) leans it toward that step; a press let go
 *            elsewhere reaches back
 *   line     one brand fill to the current step, on the marker's clock
 *   icons    one motion-icons `ProgressStep` per step, its value the state
 *   reduced  no travel or reach: the marker fades across, the rest at once
 *
 * API: Carbon's ProgressIndicator and ProgressStep, plus `reach`, `useProgressReach`.
 * ========================================================================== */

type TranslationKey =
  | 'carbon.progress-step.complete'
  | 'carbon.progress-step.incomplete'
  | 'carbon.progress-step.current'
  | 'carbon.progress-step.invalid';

const DEFAULT_TRANSLATIONS: Record<TranslationKey, string> = {
  'carbon.progress-step.complete': 'Complete',
  'carbon.progress-step.incomplete': 'Incomplete',
  'carbon.progress-step.current': 'Current',
  'carbon.progress-step.invalid': 'Invalid',
};

const defaultTranslateWithId = (id: TranslationKey) => DEFAULT_TRANSLATIONS[id];

/** A label's text for its held bold width: a string, or one element's string (a skeleton's bar). */
function plainText(label: ReactNode): string | undefined {
  if (typeof label === 'string') return label;
  const inner = isValidElement<{ children?: ReactNode }>(label)
    ? label.props.children
    : undefined;
  if (typeof inner === 'string') return inner;
  if (Array.isArray(inner) && typeof inner[0] === 'string') return inner[0];
  return undefined;
}

export interface ProgressStepProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children' | 'type'
> {
  /** The step's label. */
  label: ReactNode;
  /** The icon's accessible name (v11 draws it as the icon's title). */
  description?: string;
  /** Additional class names on the `<li>`. */
  className?: string;
  /** The step is complete. */
  complete?: boolean;
  /** The step is the current one (set by ProgressIndicator). */
  current?: boolean;
  /** The step is invalid: the Warning icon, in the error color. */
  invalid?: boolean;
  /** An optional second line under the label. */
  secondaryLabel?: string;
  /** The step can't be chosen. */
  disabled?: boolean;
  /** The step's index (set by ProgressIndicator). */
  index?: number;
  /** Called when the step is chosen (set by ProgressIndicator from `onChange`). */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accepted for v11 parity; the label shows in full in a native tooltip (`title`). */
  overflowTooltipProps?: object;
  /** Accepted for v11 parity. */
  tooltipId?: string;
  /** Translates the assistive text. */
  translateWithId?: (id: TranslationKey) => string;
}

/**
 * The icon's state, v11's order: invalid, then current, then complete, else
 * incomplete. A disabled step stays incomplete.
 */
function iconValueOf(p: {
  invalid?: boolean;
  current?: boolean;
  complete?: boolean;
  disabled?: boolean;
}): ProgressStepState {
  if (p.disabled) return 'incomplete';
  if (p.invalid) return 'invalid';
  if (p.current) return 'current';
  if (p.complete) return 'complete';
  return 'incomplete';
}

export function ProgressStep({
  label,
  description,
  className,
  current,
  complete,
  invalid,
  secondaryLabel,
  disabled,
  index,
  onClick,
  overflowTooltipProps: _overflowTooltipProps,
  tooltipId: _tooltipId,
  translateWithId: t = defaultTranslateWithId,
  ...rest
}: ProgressStepProps) {
  const { reduced } = useFeedbackMotion();
  const value = iconValueOf({ invalid, current, complete, disabled });
  const clickable = !!onClick && !current && !disabled;

  let message = t('carbon.progress-step.incomplete');
  if (current) message = t('carbon.progress-step.current');
  if (complete) message = t('carbon.progress-step.complete');
  if (invalid) message = t('carbon.progress-step.invalid');

  const classes = [
    'cds-progress-step',
    current && 'cds-progress-step--current',
    complete && 'cds-progress-step--complete',
    !complete && !current && 'cds-progress-step--incomplete',
    invalid && 'cds-progress-step--invalid',
    disabled && 'cds-progress-step--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <button
        type="button"
        className={[
          'cds-progress-step__button',
          clickable
            ? 'cds-progress-step__button--clickable'
            : 'cds-progress-step__button--unclickable',
        ].join(' ')}
        disabled={disabled}
        aria-disabled={disabled}
        aria-current={current ? 'step' : undefined}
        // A step that can't be chosen is no tab stop: in a flow without onChange it would do nothing.
        tabIndex={clickable ? 0 : -1}
        onClick={!current ? onClick : undefined}
        title={typeof label === 'string' ? label : undefined}
        data-index={index}
        {...(clickable ? { 'data-motion-icon-frame': '' } : null)}
        {...rest}>
        {/* The icon names nothing itself; `description`, when given, names its place (v11's icon title). */}
        <span
          className="cds-progress-step__icon"
          data-progress-icon={value}
          {...(description
            ? { role: 'img', 'aria-label': description }
            : { 'aria-hidden': true })}>
          <ProgressStepIcon
            size={16}
            value={value}
            animated={!reduced}
            disabled={disabled}
          />
        </span>
        <span className="cds-progress-step__text">
          <span
            className="cds-progress-step__label"
            data-text={plainText(label)}>
            {label}
          </span>
          {secondaryLabel != null ? (
            <span className="cds-progress-step__optional">
              {secondaryLabel}
            </span>
          ) : null}
        </span>
        <span className="cds-progress__assistive">{message}</span>
      </button>
    </li>
  );
}
ProgressStep.displayName = 'ProgressStep';

/** What a press tells the indicator: reach toward `index`, let go, or call it off. */
interface ReachHandle {
  reach(index: number): void;
  release(): void;
  cancel(): void;
}

const reachHandles = new WeakMap<ProgressReach, ReachHandle>();

type PressProps = Pick<
  HTMLAttributes<HTMLElement>,
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onPointerLeave'
  | 'onPointerCancel'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onBlur'
>;

/** Links an indicator (its `reach` prop) to the controls that move it (Back, Next). */
export interface ProgressReach {
  /** Props for a control that goes to step `index`: its press reaches the marker toward that step.
   *  The control's own press handlers go in `own`: both run, its own first, unless it prevents the event. */
  press(index: number, own?: PressProps): PressProps;
}

const isActivation = (key: string) => key === 'Enter' || key === ' ';

/** Pass to ProgressIndicator's `reach`; spread `press(index)` on Back and Next, or
 *  `press(index, own)` to keep the control's own press handlers. */
export function useProgressReach(): ProgressReach {
  const [reach] = useState<ProgressReach>(() => {
    const r: ProgressReach = {
      press: (index, own = {}) => {
        const reachProps: Required<PressProps> = {
          onPointerDown: (e) => {
            if (e.button === 0) reachHandles.get(r)?.reach(index);
          },
          onPointerUp: () => reachHandles.get(r)?.release(),
          onPointerLeave: () => reachHandles.get(r)?.cancel(),
          onPointerCancel: () => reachHandles.get(r)?.cancel(),
          onKeyDown: (e) => {
            if (isActivation(e.key) && !e.repeat)
              reachHandles.get(r)?.reach(index);
          },
          onKeyUp: (e) => {
            if (isActivation(e.key)) reachHandles.get(r)?.release();
          },
          onBlur: () => reachHandles.get(r)?.cancel(),
        };
        return composePress(own, reachProps);
      },
    };
    return r;
  });
  return reach;
}

/** Each handler of `own` and `reach` both, `own` first; an event `own` prevents doesn't reach. */
export function composePress(
  own: PressProps,
  reach: Required<PressProps>
): PressProps {
  const out: Record<string, (e: { defaultPrevented?: boolean }) => void> = {};
  for (const [key, fn] of Object.entries(reach) as [
    keyof PressProps,
    (e: { defaultPrevented?: boolean }) => void,
  ][]) {
    const mine = own[key] as
      | ((e: { defaultPrevented?: boolean }) => void)
      | undefined;
    out[key] = mine
      ? (e) => {
          mine(e);
          if (!e.defaultPrevented) fn(e);
        }
      : fn;
  }
  return out as PressProps;
}

export interface ProgressIndicatorProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'onChange'
> {
  /** `ProgressStep` elements. */
  children?: ReactNode;
  className?: string;
  /** The current step's index. Default 0. */
  currentIndex?: number;
  /** Called with a step's index when it is chosen. Without it, steps can't be chosen. */
  onChange?: (index: number) => void;
  /** The steps share the width equally (horizontal only). */
  spaceEqually?: boolean;
  /** Steps in a column. */
  vertical?: boolean;
  /** From `useProgressReach`: Back and Next reach the marker toward their step on press. */
  reach?: ProgressReach;
}

const STANDARD = `cubic-bezier(${motionTokens.easing['standard-productive'].join(', ')})`;

/** The side the fill is cut from: the right (left in RTL), or the bottom. */
type CutSide = 'right' | 'left' | 'bottom';

const cutSide = (vertical: boolean, rtl: boolean): CutSide =>
  vertical ? 'bottom' : rtl ? 'left' : 'right';

/** The fill's cut from its far end, px, mid-animation included. */
function liveCut(fill: HTMLElement, side: CutSide): number | null {
  const raw = getComputedStyle(fill).clipPath;
  if (!raw.startsWith('inset')) return null;
  const nums = (raw.match(/-?[\d.]+/g) ?? []).map(Number);
  // inset(top right bottom left), CSS shorthand rules.
  const right = nums[1] ?? nums[0];
  const v =
    side === 'bottom'
      ? (nums[2] ?? nums[0])
      : side === 'left'
        ? (nums[3] ?? right)
        : right;
  return v == null || Number.isNaN(v) ? null : v;
}

const clipFor = (cut: number, side: CutSide) =>
  side === 'bottom'
    ? `inset(0 0 ${cut}px 0)`
    : side === 'left'
      ? `inset(0 0 0 ${cut}px)`
      : `inset(0 ${cut}px 0 0)`;

export function ProgressIndicator({
  children,
  className,
  currentIndex = 0,
  onChange,
  spaceEqually,
  vertical,
  reach,
  ...rest
}: ProgressIndicatorProps) {
  const { timeScale, reduced } = useFeedbackMotion();
  const rootRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const selRef = useRef<Selection | null>(null);
  const reducedRef = useRef(reduced);
  const rolloverReduced = useReducedGetter(reduced);
  const verticalRef = useRef(vertical);
  const placedIndex = useRef<number | null>(null);
  // The direction the marker is placed in: a switch (a `dir` set once the
  // list is up) moves the steps without resizing one, so it re-places it.
  const dir = useDirection(rootRef);
  const placedDir = useRef(dir);
  const hasCurrentRef = useRef(true);
  useLayoutEffect(() => {
    reducedRef.current = reduced;
    verticalRef.current = vertical;
  });

  // v11's cloning: before the current index complete, at it current (unless
  // it is complete), after it as given.
  const hasCurrent = (
    Children.map(
      children,
      (child, index) =>
        index === currentIndex &&
        isValidElement(child) &&
        !(child.props as ProgressStepProps).complete
    ) ?? []
  ).some(Boolean);
  const steps = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return null;
    const props = child.props as ProgressStepProps;
    const onClick = onChange ? () => onChange(index) : undefined;
    if (index === currentIndex) {
      return cloneElement(child as ReactElement<ProgressStepProps>, {
        complete: props.complete,
        current: !props.complete,
        index,
        onClick,
      });
    }
    if (index < currentIndex)
      return cloneElement(child as ReactElement<ProgressStepProps>, {
        complete: true,
        index,
        onClick,
      });
    // Complete ahead of the current step: it fills its own line (the one fill ends at the current step).
    const ahead = props.complete
      ? [props.className, 'cds-progress-step--ahead-complete']
          .filter(Boolean)
          .join(' ')
      : props.className;
    return cloneElement(child as ReactElement<ProgressStepProps>, {
      complete: props.complete || false,
      index,
      onClick,
      className: ahead,
    });
  });
  const count = Children.count(children);
  useLayoutEffect(() => {
    hasCurrentRef.current = hasCurrent;
  });

  /* ── the marker: the selection engine ─────────────────────────────────── */

  /** A press leaning the marker, and the step the marker rests on. */
  const pressing = useRef<{ from: number } | null>(null);
  const releaseFrame = useRef(0);
  const buttonAt = (index: number) =>
    rootRef.current?.querySelector<HTMLButtonElement>(
      `.cds-progress-step__button[data-index="${index}"]`
    ) ?? null;

  const handle = useRef<ReachHandle>({
    reach(index) {
      const sel = selRef.current;
      const el = buttonAt(index);
      const at = placedIndex.current;
      // Reduced motion has no reach; the move on release fades in place.
      if (
        !sel ||
        !el ||
        el.disabled ||
        at == null ||
        index === at ||
        !hasCurrentRef.current ||
        reducedRef.current
      )
        return;
      cancelAnimationFrame(releaseFrame.current);
      const buttons = Array.from(
        rootRef.current!.querySelectorAll<HTMLElement>(
          '.cds-progress-step__button'
        )
      );
      const centres = buttons.map((b) => {
        const r = sel.rectOf(b);
        return verticalRef.current ? (r.t + r.b) / 2 : (r.l + r.r) / 2;
      });
      pressing.current = { from: at };
      sel.reach(el, reachForLength(pitchAt(centres, index)));
    },
    release() {
      if (!pressing.current) return;
      // The click lands first; a press that moved nothing reaches back.
      cancelAnimationFrame(releaseFrame.current);
      releaseFrame.current = requestAnimationFrame(() =>
        handle.current.cancel()
      );
    },
    cancel() {
      const p = pressing.current;
      pressing.current = null;
      if (!p || placedIndex.current !== p.from) return;
      const home = buttonAt(p.from);
      if (home) selRef.current?.moveTo(home);
    },
  });
  useEffect(() => () => cancelAnimationFrame(releaseFrame.current), []);

  // A press on a step you can go to reaches toward it, as on Back and Next.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const h = handle.current;
    const stepOf = (t: EventTarget | null) =>
      t instanceof Element
        ? t.closest<HTMLElement>('.cds-progress-step__button--clickable')
        : null;
    let press: AbortController | null = null;
    // A key press: losing focus calls it off (a pointer press moves focus itself).
    let keyed = false;
    const down = (e: PointerEvent) => {
      const step = e.button === 0 ? stepOf(e.target) : null;
      if (!step) return;
      press?.abort();
      press = new AbortController();
      step.addEventListener('pointerleave', () => h.cancel(), {
        once: true,
        signal: press.signal,
      });
      h.reach(Number(step.dataset.index));
    };
    const up = () => {
      press?.abort();
      h.release();
    };
    const keyDown = (e: KeyboardEvent) => {
      const step = isActivation(e.key) && !e.repeat ? stepOf(e.target) : null;
      if (!step) return;
      keyed = true;
      h.reach(Number(step.dataset.index));
    };
    const keyUp = (e: KeyboardEvent) => {
      if (!isActivation(e.key)) return;
      keyed = false;
      h.release();
    };
    const off = () => h.cancel();
    const blur = () => {
      if (!keyed) return;
      keyed = false;
      h.cancel();
    };
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', off);
    root.addEventListener('keydown', keyDown);
    root.addEventListener('keyup', keyUp);
    root.addEventListener('focusout', blur);
    return () => {
      press?.abort();
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointerup', up);
      root.removeEventListener('pointercancel', off);
      root.removeEventListener('keydown', keyDown);
      root.removeEventListener('keyup', keyUp);
      root.removeEventListener('focusout', blur);
    };
  }, []);

  useLayoutEffect(() => {
    if (!reach) return;
    const h = handle.current;
    reachHandles.set(reach, h);
    return () => {
      if (reachHandles.get(reach) === h) reachHandles.delete(reach);
    };
  }, [reach]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sel = attachSelection(root, {
      itemSelector: '.cds-progress-step__button',
      timeScale,
      reduced: () => reducedRef.current,
    });
    selRef.current = sel;
    return () => {
      sel.destroy();
      selRef.current = null;
    };
    // Attached once; the clock is reconfigured below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    selRef.current?.configure({ timeScale });
  }, [timeScale]);

  /* ── the line: one fill to the end of the current step's line ─────────── */

  /**
   * The fill's cut from the far end for `index`, px: the fill ends where the
   * current step starts (the marker's bar takes the step), or, with no
   * current step, at the end of the step marked complete (its left in RTL).
   */
  const rtl = dir === 'rtl';
  const side = cutSide(!!vertical, rtl);
  const cutFor = useCallback(
    (index: number, current: boolean): number => {
      const root = rootRef.current;
      if (!root) return 0;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(':scope > .cds-progress-step')
      );
      const size = vertical ? root.clientHeight : root.clientWidth;
      const last = current ? index - 1 : index;
      if (last < 0 || items.length === 0) return size;
      const step = items[Math.min(last, items.length - 1)]!;
      if (vertical)
        return Math.max(0, size - (step.offsetTop + step.offsetHeight));
      if (rtl) return Math.max(0, step.offsetLeft);
      return Math.max(0, size - (step.offsetLeft + step.offsetWidth));
    },
    [vertical, rtl]
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const sel = selRef.current;
    if (!root || !fill) return;
    const first = placedIndex.current === null;
    const moved = !first && placedIndex.current !== currentIndex;
    placedIndex.current = currentIndex;
    if (moved) pressing.current = null;
    // The head start scales with the track, as the selection family's.
    sel?.configure({
      stretch: Math.round(
        stretchForLength(vertical ? root.clientHeight : root.clientWidth)
      ),
    });

    // The marker: glide to the current step (at once on the first paint).
    let markerMs = 0;
    const el = root.querySelector<HTMLElement>(
      `.cds-progress-step__button[data-index="${currentIndex}"]`
    );
    if (sel && el && hasCurrent) {
      if (first) sel.moveTo(el, { instant: true });
      else if (placedDir.current !== dir) {
        // The direction switched: at once, as any layout change.
        sel.measure();
        sel.moveTo(el, { instant: true });
      } else if (sel.target() !== el) markerMs = sel.moveTo(el);
    }
    placedDir.current = dir;

    // The line: from its live cut to the new one, on the marker's clock.
    const from = liveCut(fill, side);
    fill.getAnimations().forEach((a) => a.cancel());
    const to = cutFor(currentIndex, hasCurrent);
    fill.style.clipPath = clipFor(to, side);
    if (!moved || reduced || from === null) return;
    const travel = Math.abs(from - to);
    if (travel < 0.5) return;
    const ms =
      markerMs > 0
        ? markerMs
        : Math.max(
            DURATION_FLOOR_MS,
            motionTokens.duration[durationStepForDistance(travel)] * timeScale
          );
    fill.animate(
      [{ clipPath: clipFor(from, side) }, { clipPath: clipFor(to, side) }],
      {
        duration: ms,
        easing: STANDARD,
      }
    );
  }, [
    currentIndex,
    hasCurrent,
    vertical,
    spaceEqually,
    count,
    reduced,
    timeScale,
    cutFor,
    dir,
    side,
  ]);

  // A resize (the page's width, spaceEqually's steps): the line follows at once.
  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (fill.getAnimations().length) return;
      fill.style.clipPath = clipFor(
        cutFor(placedIndex.current ?? 0, hasCurrentRef.current),
        side
      );
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [cutFor, side]);

  /* ── hover and press: the rollover on steps you can go to ─────────────── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachRollover(root, {
      selector: '.cds-progress-step__button--clickable',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  const classes = [
    'cds-progress',
    vertical && 'cds-progress--vertical',
    spaceEqually && !vertical && 'cds-progress--space-equal',
    !hasCurrent && 'cds-progress--no-current',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ul {...rest} ref={rootRef} className={classes}>
      {steps}
      <li
        className="cds-progress__overlay"
        role="presentation"
        aria-hidden="true">
        <span className="cds-progress__ghost" data-selection-ghost="" />
        <span className="cds-progress__marker" data-selection-indicator="" />
        <span className="cds-progress__fill" ref={fillRef} />
      </li>
    </ul>
  );
}
ProgressIndicator.displayName = 'ProgressIndicator';
