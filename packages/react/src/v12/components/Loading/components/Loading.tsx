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
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type RefObject,
} from 'react';
import {
  DURATION_FLOOR_MS,
  motionTokens,
  reducedClock,
  type DurationToken,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  playSpinnerExit,
  Spinner,
  SPINNER_MOTION,
  type SpinnerVariant,
} from '@carbon-labs/react-feedback';
import { useLoadingGate } from './useLoadingGate';
import './loading.scss';

/* ============================================================================
 * Loading — Carbon v11's Loading, prop for prop, on the kit's motion.
 *
 * v11's API: `active` (default true), `description` (default "loading"),
 * `small`, `withOverlay` (default true), `className`, deprecated `id`, the
 * rest on the spinner's element. v11's markup: the spinner `aria-live`
 * assertive while active, its svg an image named by `description`; with an
 * overlay, a dialog named by `description` that holds focus while active and
 * gives it back after.
 *
 *   spinner   the kit's one Spinner (Spinner.tsx): 64px (v11's 88px), or
 *             16px small, its line size / 16 at most 2px (2px, 1px). A quiet
 *             base ring and a loud arc, half the circle, swinging between
 *             30% and 70% of it, turning once per loading period
 *             (`SPINNER_MOTION.periodMs`) in step with every other spinner
 *             on the page. Neutral (`$icon-primary`, the default), or
 *             `variant="hero"`: the kit's brand (v11's `$interactive` blue by
 *             default); `KitDefaults variant` when none is given
 *   start     the arc draws on, its tail lengthening back from its head, as
 *             it starts (`moderate-01`); the overlay fades up on that clock
 *   stop      `active={false}`: the tail catches up with the head
 *             (`fast-02`), the spinner shrinking to half and fading in its
 *             last frames; the overlay fades out on that clock
 *   reduced   nothing turns: three still dots stand in for the arc, there or
 *             gone at once; the overlay fades on the reduced clock. The words
 *             (the description, InlineLoading's text) carry the state
 *   slow      every clock, the turn included, times the feedback family's
 *             time scale (slow motion)
 *   gate      `delay` and `minDuration` (the loading gate, useLoadingGate):
 *             nothing for the first `delay` ms of `active`, then the
 *             spinner, kept at least `minDuration` ms once it shows. Both
 *             default to 0, v11's; patterns ask for 300 and 500
 *             (`LOADING_GATE`). The spinner's start and stop run on the
 *             gated state
 * ========================================================================== */

export interface LoadingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Whether the spinner is turning. Default true. False: the arc closes and, with an overlay, the overlay goes. */
  active?: boolean;
  /** How long `active` holds before the spinner shows (ms), so a short wait shows nothing. Default 0. Patterns: 300. */
  delay?: number;
  /** How long the spinner stays once it shows (ms), so it never flashes. Default 0. Patterns: 500. */
  minDuration?: number;
  /** Additional class names, on the spinner's element. */
  className?: string;
  /** What is loading, for assistive technology (the spinner's name, and the overlay's). Default "loading". */
  description?: string;
  /** @deprecated v11: no longer needed. */
  id?: string;
  /** The small spinner (16px), for inline use. Default false: the 64px spinner (v11's is 88px). */
  small?: boolean;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default, `$icon-primary`) or `hero` (the kit's brand, `$interactive` blue by default). Not given: `KitDefaults variant` (the Spinner reads it), else neutral. */
  variant?: SpinnerVariant;
  /** Cover the page with an overlay while active, and hold focus in it. Default true. */
  withOverlay?: boolean;
}

/* ── the overlay's focus (v11's trap) ─────────────────────────────────── */

const isModalDialog = (el: Element) => {
  if (el.matches('[aria-modal="true"]')) return true;
  if (!(el instanceof HTMLDialogElement) || !el.open) return false;
  try {
    return el.matches(':modal');
  } catch {
    return true;
  }
};

/** A target inside a modal dialog that sits over the overlay: focus may stay there. */
const isLayeredOnTop = (target: EventTarget | null, overlay: HTMLElement) => {
  if (!(target instanceof Element)) return false;
  for (let el: Element | null = target; el; el = el.parentElement) {
    if (isModalDialog(el)) return !el.contains(overlay);
  }
  return false;
};

/** While active, focus stays in the overlay; after, it goes back to where it came from. */
function useFocusTrap(ref: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const overlay = ref.current;
    if (!active || !overlay) return;
    const before =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (
      document.activeElement === document.body &&
      !isLayeredOnTop(before, overlay)
    )
      overlay.focus();
    const reclaim = () => overlay.focus();
    const onFocusIn = (e: FocusEvent) => {
      if (
        !(e.target instanceof Node) ||
        overlay.contains(e.target) ||
        isLayeredOnTop(e.target, overlay)
      )
        return;
      reclaim();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || isLayeredOnTop(e.target, overlay)) return;
      e.preventDefault();
      reclaim();
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('keydown', onKeyDown, true);
      const now = document.activeElement;
      const lost = !now || now === document.body || overlay.contains(now);
      if (lost && before?.isConnected) before.focus();
    };
  }, [ref, active]);
}

export function Loading({
  active: activeProp = true,
  className,
  delay = 0,
  minDuration = 0,
  description = 'loading',
  id: _id,
  small = false,
  variant,
  withOverlay = true,
  style,
  ...rest
}: LoadingProps) {
  void _id;
  const { reduced, timeScale } = useFeedbackMotion();
  // The gate: with no delay and no minimum (the defaults), `active` as given.
  const { show: active } = useLoadingGate(activeProp, {
    showAfter: delay,
    minVisible: minDuration,
    timeScale,
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap(overlayRef, withOverlay && active);

  // Stopping, it shrinks away in the stop's last frames (`playSpinnerExit`); started again, a shrink under way turns
  // round and a finished one makes way for the entrance. Reduced motion: the dots go at once.
  const rootRef = useRef<HTMLDivElement>(null);
  const exit = useRef<Animation[]>([]);
  const was = useRef(active);
  useLayoutEffect(() => {
    const stopping = was.current && !active;
    was.current = active;
    if (active) {
      exit.current.forEach((a) => {
        if (a.playState === 'finished') return a.cancel();
        a.reverse();
        a.finished.then(
          () => a.cancel(),
          () => {}
        );
      });
      exit.current = [];
      return;
    }
    const svg = rootRef.current?.querySelector<SVGSVGElement>('.cds-spinner');
    if (stopping && svg && !reduced)
      exit.current = playSpinnerExit(svg, timeScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per start or stop
  }, [active]);

  const ms = (token: DurationToken) =>
    Math.max(
      DURATION_FLOOR_MS,
      motionTokens.duration[token] * timeScale * reducedClock(reduced)
    );
  // The overlay's fades, on the spinner's start and stop clocks (the reduced clock under reduced motion).
  const vars = {
    '--cds-loading-start': `${ms(SPINNER_MOTION.start)}ms`,
    '--cds-loading-stop': `${ms(SPINNER_MOTION.stop)}ms`,
  } as CSSProperties;

  const spinner = (
    <div
      {...rest}
      ref={rootRef}
      aria-atomic="true"
      aria-live={active ? 'assertive' : 'off'}
      className={[
        'cds-loading',
        small && 'cds-loading--small',
        !active && 'cds-loading--stop',
        reduced && 'cds-loading--reduced',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={withOverlay ? style : { ...vars, ...style }}>
      <Spinner
        className="cds-loading__svg"
        size={small ? 16 : 64}
        variant={variant}
        active={active}
        description={description}
      />
    </div>
  );

  if (!withOverlay) return spinner;
  return (
    <div
      className={['cds-loading-overlay', !active && 'cds-loading-overlay--stop']
        .filter(Boolean)
        .join(' ')}
      role="presentation"
      style={vars}>
      <div
        ref={overlayRef}
        className="cds-loading-overlay__dialog"
        role={active ? 'dialog' : undefined}
        // It traps focus: modal to assistive tech too.
        aria-modal={active ? true : undefined}
        aria-label={active ? description : undefined}
        tabIndex={active ? -1 : undefined}>
        {spinner}
      </div>
    </div>
  );
}
Loading.displayName = 'Loading';
