/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion, watchTonal } from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  stretchForLength,
  useLatest,
  useSelectionEngine,
  type SelectionMotion,
} from '@carbon-labs/react-selection-kit';
import { useStepGesture } from '@carbon-labs/v12-motion';
import {
  resolveToggleLook,
  useWithTimeScale,
  type ToggleMark,
  type ToggleVariant,
} from '@carbon-labs/react-props';
import { useDisabledReason } from '@carbon-labs/react-tooltip';
import './toggle.scss';
import { useFormFieldState } from '@carbon-labs/react-util';

/* ============================================================================
 * Toggle — Carbon v11's Toggle (a switch), on the selection family's motion
 * (as in the chat input's footer). A two-stop track: the knob is the family's selector, the two
 * sides its stops (motion-core `attachSelection`).
 * ============================================================================
 *
 * v11's props: `id`, `labelText`, `labelA` / `labelB` (the state text, "Off"
 * / "On"), `hideLabel`, `size` (sm 32×16 · md 48×24), `toggled` /
 * `defaultToggled`, `onToggle(checked, id, event)`, `onClick`, `disabled`,
 * `readOnly`. `role="switch"`, `aria-checked`; Space and Enter flip it.
 *
 *   look     the track fully rounded (`corners`: full default, rounded,
 *            square); off, `$layer-accent` with the knob in `$icon-on-color`
 *            and a faint mark on the far side; on, `$background-inverse`
 *            with the knob in `$background` and a `$support-success` mark
 *            on the near side — the reference's status dot
 *   glide    the knob travels as the family's selector does: its leading
 *            edge ahead (the stretch, capped at half the travel), the
 *            duration from the distance (40 / 80 / 120 / 160ms)
 *   color    the on color is a fill that rides the knob's live place, and the
 *            knob's color follows its place across the travel, so the two ease
 *            together over the whole glide (a click, a key) or with the
 *            pointer (a drag, and back); the marks fade
 *   variant  the content switcher's looks for the neutral colors: `inverse`
 *            (default, the reference's), `tonal` (the layer, then the
 *            selected layer), `outlined` (a hairline, no fill); `hero` (the
 *            neutral off, a blue on track, a white knob); `status` (a red
 *            off, a green on track), each side taking a white knob
 *   press    anywhere on the track, the knob included: the knob reaches 2px
 *            toward the other side at once (the kit's reach), since there is
 *            only one way it can go; at `md` the track also shrinks 1px a side
 *            (none at `sm`)
 *   mark     the status dot at the step the knob isn't on, gray;
 *            `mark="status"` colors it, red off and green on;
 *            `mark={false}` hides it
 *   drag     the knob follows the pointer and stops at the walls with the
 *            kit's squash; it lands on the nearer side
 *   hover    none: the knob's reach on a press and its inset on a grab are the
 *            only feedback (a glow on the track would muddy it)
 *   reduced  the knob fades in place (the engine's)
 * ========================================================================== */

export interface ToggleProps {
  /** The switch's id (v11: required); the label points at it. */
  id: string;
  /** The label above the switch. */
  labelText?: ReactNode;
  /** The state text when off. Default "Off". */
  labelA?: string;
  /** The state text when on. Default "On". */
  labelB?: string;
  hideLabel?: boolean;
  /** Default `md` (48×24). */
  size?: 'sm' | 'md';
  toggled?: boolean;
  defaultToggled?: boolean;
  onToggle?: (
    checked: boolean,
    id: string,
    event: MouseEvent<HTMLButtonElement> | PointerEvent | null
  ) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Why it's disabled: it stays focusable and shows this in a tooltip on hover and focus. */
  disabledReason?: string;
  readOnly?: boolean;
  className?: string;
  /** `full` (default, a pill), `rounded` (8px), `square`. */
  corners?: 'full' | 'rounded' | 'square';
  /** The content switcher's looks for the neutral track; `hero`, the blue on track; `status`, a red off and a green on track. Default `inverse`. */
  variant?: ToggleVariant;
  /** The status dot on the track, at the step the knob isn't on. `true` (default) gray; `status` red off, green on; `false` hides it. A colored track (`hero`, `status`) never shows it. */
  mark?: ToggleMark;
  /** Motion dials; omitted keys take the kit's. */
  motion?: Partial<SelectionMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called as each glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
}

export function Toggle({
  id,
  labelText,
  labelA = 'Off',
  labelB = 'On',
  hideLabel = false,
  size = 'md',
  toggled,
  defaultToggled = false,
  onToggle,
  onClick,
  disabled: ownDisabled = false,
  disabledReason,
  readOnly: ownReadOnly = false,
  className,
  corners = 'full',
  variant: variantProp,
  mark: markProp,
  motion: motionProp,
  timeScale,
  onMove,
}: ToggleProps) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  const motion = useWithTimeScale(motionProp, timeScale);
  // A colored track (hero, status) has its own colors: the neutral looks are for the neutral track.
  const {
    variant: variantOf,
    track,
    mark,
  } = resolveToggleLook({ variant: variantProp, mark: markProp });
  // A tonal track takes its hue from where it sits (the core's tonal watcher, for the tonal look only).
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => (variantOf === 'tonal' ? watchTonal(rootRef.current) : undefined),
    [variantOf]
  );
  const [own, setOwn] = useState(defaultToggled);
  const on = toggled ?? own;
  // The stretch comes from its length (a toggle's track is 32 or 48px: the minimum, 6px), and
  // the reach from its knob's (18 or 12px: under 32, 2px), both by the kit's `lengthMotion`.
  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    stretch: stretchForLength(size === 'sm' ? 32 : 48),
    ...motion,
  };
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLButtonElement>(null);
  const stopRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const onRef = useLatest(on);
  const mRef = useLatest(m);

  const selRef = useSelectionEngine({
    rootRef: trackRef,
    itemSelector: '.cds-toggle__stop',
    motion: m,
    reduced,
    onMove,
    getRest: () => stopRefs.current[onRef.current ? 1 : 0] ?? null,
    layoutKey: size,
  });

  // A change from anywhere (a click, a key, the prop) glides there.
  useLayoutEffect(() => {
    const sel = selRef.current;
    const el = stopRefs.current[on ? 1 : 0];
    if (sel && el && sel.target() !== el) sel.moveTo(el);
  }, [on, selRef]);

  const inert = disabled || readOnly;
  const reason = useDisabledReason(disabled, disabledReason);
  const rc = reason.controlProps;
  const set = (
    next: boolean,
    e: MouseEvent<HTMLButtonElement> | PointerEvent | null
  ) => {
    if (inert) return;
    const sel = selRef.current;
    const el = stopRefs.current[next ? 1 : 0];
    if (sel && el) sel.moveTo(el);
    if (next === onRef.current) return;
    if (toggled === undefined) setOwn(next);
    onToggle?.(next, id, e);
  };

  const { onPointerDown } = useStepGesture({
    trackRef,
    selRef,
    stops: () => stopRefs.current,
    current: () => (onRef.current ? 1 : 0),
    // A press anywhere reaches toward the other side.
    pressTarget: () => (onRef.current ? 0 : 1),
    motion: () => mRef.current,
    disabled: () => inert,
    // There is only one way it can go: a press on the knob reaches too.
    reachOnKnob: true,
    commit: (i) => set(i === 1, null),
    onKnobClick: () => set(!onRef.current, null),
  });

  const labelId = `${id}-label`;
  return (
    <div
      ref={rootRef}
      className={[
        'cds-toggle',
        `cds-toggle--${size}`,
        corners !== 'full' && `cds-toggle--${corners}`,
        variantOf !== 'inverse' && `cds-toggle--${variantOf}`,
        track !== 'neutral' && `cds-toggle--${track}`,
        mark === 'status' && 'cds-toggle--status-mark',
        disabled && 'cds-toggle--disabled',
        readOnly && 'cds-toggle--readonly',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      {labelText != null && (
        <label
          id={labelId}
          htmlFor={id}
          className={[
            'cds-toggle__label',
            hideLabel && 'cds-toggle__visually-hidden',
          ]
            .filter(Boolean)
            .join(' ')}>
          {labelText}
        </label>
      )}
      <div className="cds-toggle__row" {...reason.anchorProps}>
        <button
          ref={trackRef}
          id={id}
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby={labelText != null ? labelId : undefined}
          aria-readonly={readOnly || undefined}
          // With a reason it stays focusable: aria-disabled, never the attribute.
          disabled={disabled && !reason.active}
          aria-disabled={rc['aria-disabled']}
          aria-describedby={reason.describedBy()}
          onFocus={rc.onFocus}
          onBlur={rc.onBlur}
          onKeyDown={rc.onKeyDown}
          data-on={on || undefined}
          // The track's own fill reads the knob's live edges (motion-core writes them here too).
          data-selection-edges=""
          className="cds-toggle__track"
          onPointerDown={onPointerDown}
          // The pointer's own release commits (it can drag); a click with no
          // pointer behind it — Space, Enter, assistive tech — flips here.
          onClick={(e) => {
            if (reason.active) return rc.onClick?.(e);
            onClick?.(e);
            if (e.detail === 0) set(!onRef.current, e);
          }}>
          <span className="cds-toggle__fill" aria-hidden="true" />
          {mark !== 'none' && (
            <span
              className="cds-toggle__mark cds-toggle__mark--off"
              aria-hidden="true"
            />
          )}
          {mark !== 'none' && (
            <span
              className="cds-toggle__mark cds-toggle__mark--on"
              aria-hidden="true"
            />
          )}
          {[0, 1].map((i) => (
            <span
              key={i}
              ref={(el) => {
                stopRefs.current[i] = el;
              }}
              className={`cds-toggle__stop cds-toggle__stop--${i ? 'on' : 'off'}`}
              aria-hidden="true"
            />
          ))}
          <span
            className="cds-toggle__knob"
            data-selection-indicator=""
            aria-hidden="true"
          />
        </button>
        {(labelA || labelB) && (
          // Both labels share one cell (the inactive one hidden), so the row is as wide as the
          // wider of them and never changes width when the toggle flips.
          <span className="cds-toggle__state" aria-hidden="true">
            <span
              className="cds-toggle__state-text"
              data-active={!on || undefined}>
              {labelA}
            </span>
            <span
              className="cds-toggle__state-text"
              data-active={on || undefined}>
              {labelB}
            </span>
          </span>
        )}
      </div>
      {reason.tooltip}
    </div>
  );
}
Toggle.displayName = 'Toggle';
