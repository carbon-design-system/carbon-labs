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
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  CONTENT_SWAP,
  motionTokens,
  reducedClock,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { LOADER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { StatusMark, type StatusMarkKind } from '@carbon-labs/react-feedback';
import type { SpinnerVariant } from '@carbon-labs/react-feedback';
import { SwapSlot } from '@carbon-labs/react-feedback';
import { playSpinnerExit, spinnerMs } from '@carbon-labs/react-feedback';
import './loading.scss';

/* ============================================================================
 * InlineLoading — Carbon v11's InlineLoading, prop for prop, on the kit's
 * motion.
 *
 * v11's API: `status` ('inactive' | 'active' | 'finished' | 'error',
 * default 'active'), `description` (the text), `iconDescription` (the mark's
 * name; default the status, "loading" while active), `onSuccess`, called
 * `successDelay` ms (default 1500) after finishing, `className`, the rest on
 * the row. `aria-live` assertive unless inactive (or as given).
 *
 *   one mark  one StatusMark whose kind follows the status: active is
 *             pending (the kit's one Spinner), finished is success, error is
 *             error. A change between them is the mark changing in place
 *             (feedback rule 2), by the status hand-off (feedback/
 *             statusHandoff.ts): the spinner shrinks 4px (`fast-01`), then
 *             the disc grows from 4px under its size (`fast-02`), then the
 *             check or the slash draws on (`fast-02`). No fades, and never
 *             two marks at once
 *   text      swaps out, then in, on the same event and the same clocks
 *             (`fast-01`, then `fast-02`)
 *   inactive  no mark, so no room: the mark fades out (`fast-01`; a spinner
 *             shrinks to half over the whole of it), its room going unseen. A
 *             mark arriving from inactive: the spinner draws on, a check or
 *             an error mark fades in and plays its beat once it lands
 *   reduced   the mark changes at once and doesn't beat; the spinner is
 *             three still dots; the text snaps. The text
 *             carries the state
 *   slow      `successDelay` runs on the time scale too, so the hand-off
 *             lands before `onSuccess` at any slow motion
 * ========================================================================== */

export type InlineLoadingStatus = 'inactive' | 'active' | 'finished' | 'error';

export interface InlineLoadingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Additional class names. */
  className?: string;
  /** The text beside the mark. */
  description?: ReactNode;
  /** The mark's name for assistive technology. Default: the status ("loading" while active). */
  iconDescription?: string;
  /** Called `successDelay` ms after the status becomes `finished`. */
  onSuccess?: () => void;
  /** 'inactive', 'active' (default), 'finished' or 'error'. */
  status?: InlineLoadingStatus;
  /** How long `finished` holds before `onSuccess`, ms. Default 1500. */
  successDelay?: number;
  /** The spinner's `neutral` (default, `$icon-primary`) or `hero` (the kit's brand, IBM blue by default). Not given: `KitDefaults variant`, else neutral. */
  variant?: SpinnerVariant;
}

/** A mark arriving from inactive fades in on the swap's in clock, then beats. */
const IN_MS = motionTokens.duration[CONTENT_SWAP.in.duration];

const KIND: Record<InlineLoadingStatus, StatusMarkKind | null> = {
  inactive: null,
  active: 'pending',
  finished: 'success',
  error: 'error',
};

/** The text's swap key: a new string is new content; other nodes change with the status. */
const textKey = (status: InlineLoadingStatus, description: ReactNode) =>
  typeof description === 'string' || typeof description === 'number'
    ? `${status}|${description}`
    : status;

export function InlineLoading({
  className,
  status = 'active',
  iconDescription,
  description,
  onSuccess,
  successDelay = 1500,
  variant: variantProp,
  ...rest
}: InlineLoadingProps) {
  const { reduced, timeScale } = useFeedbackMotion();
  // KitDefaults: the provider's variant when none is given; every loader is neutral by default.
  const { variant = 'neutral' } = useKitProps(
    { variant: variantProp },
    LOADER_KIT
  );

  // v11: onSuccess once finished has held for successDelay.
  useEffect(() => {
    if (status !== 'finished') return;
    const t = setTimeout(() => onSuccess?.(), successDelay * timeScale);
    return () => clearTimeout(t);
  }, [status, onSuccess, successDelay, timeScale]);

  // The mark: its kind, kept while it fades out to inactive; `fresh` once it arrives from inactive.
  const kind = KIND[status];
  const [mark, setMark] = useState<{
    kind: StatusMarkKind;
    label: string;
    fresh: boolean;
    leaving: boolean;
  } | null>(() =>
    kind
      ? {
          kind,
          label: iconDescription ?? (status === 'active' ? 'loading' : status),
          fresh: false,
          leaving: false,
        }
      : null
  );
  const label = iconDescription ?? (status === 'active' ? 'loading' : status);
  if (
    kind &&
    (!mark || mark.kind !== kind || mark.leaving || mark.label !== label)
  ) {
    setMark({ kind, label, fresh: mark ? mark.fresh : true, leaving: false });
  } else if (!kind && mark && !mark.leaving)
    setMark({ ...mark, leaving: true });

  const markRef = useRef<HTMLSpanElement>(null);
  const fresh = mark?.fresh ?? false;
  const leaving = mark?.leaving ?? false;
  const leavingKind = mark?.kind;
  // Leaving for inactive: the mark fades out (the spinner shrinks away over the whole out), then its room goes.
  useLayoutEffect(() => {
    const el = markRef.current;
    if (!leaving || !el) return;
    const duration = spinnerMs(
      CONTENT_SWAP.out.duration,
      timeScale * reducedClock(reduced)
    );
    const svg =
      leavingKind === 'pending' && !reduced
        ? el.querySelector<SVGSVGElement>('.cds-spinner')
        : null;
    const anims = svg
      ? playSpinnerExit(svg, timeScale, duration, { fill: true })
      : [
          el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration,
            easing: 'linear',
            fill: 'forwards',
          }),
        ];
    let live = true;
    Promise.all(anims.map((a) => a.finished)).then(
      () => live && setMark((m) => (m && m.leaving ? null : m)),
      () => {}
    );
    return () => {
      live = false;
      anims.forEach((a) => a.cancel());
    };
  }, [leaving, leavingKind, reduced, timeScale]);
  // Arriving from inactive: a check or an error mark fades in (the spinner draws itself on).
  useLayoutEffect(() => {
    const el = markRef.current;
    if (!fresh || !el || !mark || mark.kind === 'pending' || reduced) return;
    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: spinnerMs(CONTENT_SWAP.in.duration, timeScale),
      easing: 'linear',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as it arrives
  }, [fresh]);

  return (
    <div
      className={['cds-inline-loading', className].filter(Boolean).join(' ')}
      {...rest}
      aria-live={
        rest['aria-live'] ?? (status === 'inactive' ? 'off' : 'assertive')
      }
      data-status={status}>
      <span className="cds-inline-loading__animation">
        {mark && (
          <span ref={markRef} className="cds-inline-loading__mark">
            <StatusMark
              kind={mark.kind}
              size={16}
              variant={variant}
              description={mark.label}
              arriveAfter={fresh && mark.kind !== 'pending' ? IN_MS : null}
              className="cds-inline-loading__status"
            />
          </span>
        )}
      </span>
      <SwapSlot
        swapKey={textKey(status, description)}
        className="cds-inline-loading__text"
        empty={!description}>
        {description}
      </SwapSlot>
    </div>
  );
}
InlineLoading.displayName = 'InlineLoading';
