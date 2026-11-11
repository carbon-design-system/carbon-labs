/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { FieldMessage } from '@carbon-labs/react-text-input';
import { joinHandlers, useDisabledReason } from '@carbon-labs/react-tooltip';
import './checkbox.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { assignRef, useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Checkbox — Carbon v11's Checkbox on the selection family's look, with
 * every state styled as the rest of the kit.
 *
 *   box        16px, 2px corners (the ladder's mark, v11's); off, a 1px
 *              `$border-strong` stroke and no
 *              fill; on (checked or indeterminate), the family's inverse
 *              selector fill (`$layer-selected-inverse`) with the mark in
 *              `$icon-inverse` — the SelectableTag's on
 *   hover      the rollover on the box: off, a wash of the text color (8%);
 *              on, a toned step of the inverse fill (86% into the page); no
 *              press colour of its own. The box grows 1px
 *              on hover and presses 1px in, as every rollover control.
 *              Hovering and pressing the label plays it too (the label
 *              passes both on to its input), however the label wraps
 *   hit area   4px round the box (24px), so a near miss still takes it
 *   mark       the check draws itself on (its stroke, fast-02, productive
 *              standard) and fades out (fast-01); indeterminate's dash grows
 *              from its middle. The fill changes at once and the mark starts
 *              40ms after it, so the state reads first. Reduced motion: at
 *              once
 *   focus      the family's keyboard ring: 2px `$text-primary`, 2px outside
 *              the box (keyboard only); 3px while a status shows, so the
 *              status ring, grown 1px on hover, never touches it
 *   disabled   off, a `$border-disabled` stroke; on, a muted fill (the
 *              inverse half mixed into the page, as the SelectableTag's
 *              disabled-and-on); the label `$text-disabled`; no hover
 *   read-only  v11's: the stroke `$border-disabled`, no fill, the mark in
 *              `$icon-primary`; focusable, no hover, a click changes nothing
 *   mixed      drawn from the DOM's `:indeterminate`, so a click that clears
 *              it shows at once; the prop sets it when it changes (and, when
 *              `checked` is controlled, holds it as React holds `checked`).
 *              Assistive tech hears "mixed" from the DOM property
 *   invalid    the box's 1px stroke in `$support-error` and 1px more outside
 *              it, so the box's shape never changes; the message below (the
 *              text input's FieldMessage). The ring is the rollover surface's,
 *              so it grows out with the hover at the same 2px
 *   warn       error's ring all in `$support-warning`: the box's stroke
 *              yellow too, and 1px more outside it, accepting yellow's
 *              ~1.6:1 edge on a light page; the message below
 *
 * v11's props: `id` (required), `labelText` (required), `checked` /
 * `defaultChecked`, `indeterminate`, `disabled`, `readOnly`, `hideLabel`,
 * `helperText`, `invalid` / `invalidText`, `warn` / `warnText`,
 * `onChange(event, { checked, id })`, `onClick`, `title`, `className`; other
 * input attributes go to the input. The group is CheckboxGroup.tsx. Not taken:
 * `decorator` / `slug` (the kit has no AI label).
 * ========================================================================== */

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'size' | 'id'
> {
  id: string;
  labelText: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  /** The mixed state (a parent of partly checked children). */
  indeterminate?: boolean;
  disabled?: boolean;
  /** Why it's disabled: it stays focusable and shows this in a tooltip on hover and focus. */
  disabledReason?: string;
  readOnly?: boolean;
  /** Keep the label for assistive technology only. */
  hideLabel?: boolean;
  helperText?: ReactNode;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** v11: the event, then `{ checked, id }`. */
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ) => void;
  title?: string;
  className?: string;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

/** A checkbox; its ref is the input, as Carbon's. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      labelText,
      checked,
      defaultChecked,
      indeterminate = false,
      disabled: ownDisabled = false,
      disabledReason,
      readOnly: ownReadOnly = false,
      hideLabel = false,
      helperText,
      invalid = false,
      invalidText,
      warn = false,
      warnText,
      onChange,
      onClick,
      title,
      className,
      timeScale,
      ...rest
    }: CheckboxProps,
    ref
  ) {
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    const input = useRef<HTMLInputElement | null>(null);
    const inputRef = useCallback(
      (el: HTMLInputElement | null) => {
        input.current = el;
        assignRef(ref, el);
      },
      [ref]
    );
    const box = useRef<HTMLSpanElement>(null);
    const rolloverReduced = useReducedGetter();
    const uid = useId();
    const ids = {
      helper: `${id}-helper-${uid}`,
      warn: `${id}-warn-${uid}`,
      invalid: `${id}-invalid-${uid}`,
    };
    // v11: invalid wins over warn; both off when disabled or read-only.
    const status =
      disabled || readOnly
        ? 'none'
        : invalid
          ? 'error'
          : warn
            ? 'warn'
            : 'none';
    // The message shown: a status's text, else the helper (FieldMessage's rule).
    const described =
      status === 'error' && invalidText
        ? ids.invalid
        : status === 'warn' && warnText
          ? ids.warn
          : helperText
            ? ids.helper
            : undefined;
    const inert = disabled || readOnly;
    const reason = useDisabledReason(disabled, disabledReason);
    const rc = reason.controlProps;

    // The mixed state is a DOM property, not an attribute, and the box draws
    // it from the DOM (`:indeterminate`). A click clears it, as a click flips
    // `checked`; so, as React does for `checked`: set from the prop when the
    // prop changes, and, when the checkbox is controlled, put back after a
    // click the owner didn't take (the `onChange` below). Uncontrolled, the
    // click stands: setting it back on every render would redraw the mixed
    // state over a click the moment anything else re-rendered.
    const controlled = checked !== undefined;
    const indeterminateRef = useLatest(indeterminate);
    useLayoutEffect(() => {
      if (input.current) input.current.indeterminate = indeterminate;
    }, [indeterminate]);

    useEffect(() => {
      const node = box.current;
      if (!node || inert) return;
      return attachRollover(node, {
        selector: '.cds-checkbox__box',
        // Its own steps (checkbox.scss): matched lightness from a transparent
        // rest would be the page's gray.
        colors: 'tokens',
        timeScale,
        reduced: rolloverReduced,
      });
    }, [inert, timeScale, rolloverReduced]);

    return (
      <div
        className={[
          'cds-checkbox',
          disabled && 'cds-checkbox--disabled',
          readOnly && 'cds-checkbox--readonly',
          status === 'error' && 'cds-checkbox--invalid',
          status === 'warn' && 'cds-checkbox--warn',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        <label
          className="cds-checkbox__row"
          htmlFor={id}
          title={title}
          {...reason.anchorProps}>
          <span
            ref={box}
            className="cds-checkbox__box"
            aria-disabled={inert || undefined}>
            <input
              {...rest}
              // With a reason it is disabled in a form too: its value isn't submitted.
              name={reason.active ? undefined : rest.name}
              ref={inputRef}
              id={id}
              type="checkbox"
              className="cds-checkbox__input"
              checked={checked}
              defaultChecked={defaultChecked}
              // With a reason it stays focusable: aria-disabled, never the attribute.
              disabled={disabled && !reason.active}
              aria-disabled={rc['aria-disabled']}
              aria-readonly={readOnly || undefined}
              aria-invalid={status === 'error' || undefined}
              // Its own message, and any description it's given (a tile's).
              aria-describedby={reason.describedBy(
                [described, rest['aria-describedby']]
                  .filter(Boolean)
                  .join(' ') || undefined
              )}
              onFocus={joinHandlers(rc.onFocus, rest.onFocus as never)}
              onBlur={joinHandlers(rc.onBlur, rest.onBlur as never)}
              onClick={(e) => {
                // Read-only: focusable, but a click changes nothing (v11).
                if (readOnly || reason.active) {
                  e.preventDefault();
                  return;
                }
                onClick?.(e);
              }}
              onChange={(e) => {
                if (readOnly || reason.active) return;
                onChange?.(e, { checked: e.target.checked, id });
                // Controlled: the prop holds until the owner re-renders with a
                // new one (the effect above), as React holds `checked`.
                if (controlled)
                  e.target.indeterminate = indeterminateRef.current;
              }}
            />
            <svg
              className="cds-checkbox__mark"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false">
              <path
                className="cds-checkbox__check"
                d="M4.5 8.25 7 10.75l4.5-5"
                pathLength={1}
              />
              <path className="cds-checkbox__dash" d="M4.5 8h7" />
            </svg>
          </span>
          <span
            className={
              hideLabel
                ? 'cds-checkbox__label cds-checkbox__label--hidden'
                : 'cds-checkbox__label'
            }>
            {labelText}
          </span>
        </label>
        {reason.tooltip}
        {(helperText || invalidText || warnText) && (
          <FieldMessage
            status={status}
            helperText={helperText}
            warnText={warnText}
            invalidText={invalidText}
            helperId={ids.helper}
            warnId={ids.warn}
            invalidId={ids.invalid}
            disabled={disabled}
            placement="flow"
            className="cds-checkbox__message"
          />
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
