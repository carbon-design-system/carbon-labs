/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
  FIELD_TIMING,
  type FieldStatus,
} from '@carbon-labs/v12-motion';
import { FieldMessage } from './FieldMessage';
import { FieldStatusMark } from './FieldStatusMark';
import type { TextInputSize } from './TextInput';
import type { FieldVariant } from '@carbon-labs/react-props';
import './field.scss';
import './text-input.scss';
import './multi-field-input.scss';
import { holdUntilRelease, inlineKey } from '@carbon-labs/react-util';

/* ============================================================================
 * MultiFieldInput — one text field in N segments: a value that is several
 * numbers (a cubic-bezier's four, a size's width and height, a time's hours
 * and minutes): one field, its sections divided by lines or knockouts, so
 * only the far left and right edges are rounded.
 * ============================================================================
 *
 *   shell     the TextInput's field: `$field`, a `$border-subtle` hairline,
 *             its sizes and `corners` (8px, full or square), rounded only at
 *             its two outer ends
 *   seams     the kit's rule for a divided control:
 *             the field has a hairline outline, so its seams are that
 *             hairline cut through it, no gap, as the neutral SplitButton's;
 *             disabled (the fill alone, no outline), 2px knockouts, as the
 *             filled buttons. A segment's state
 *             outline covers the seam beside it; a selected one, whole
 *   segments  each its own input, value and validation; its name shown
 *             before its value (`hideSegmentLabels` to hide it) and given to
 *             assistive tech
 *   states    the TextInput's ladder, per segment: hover steps its outline
 *             halfway to `$border-strong`, a press is `$border-strong` at
 *             2px, focus the accent at 2px, an error `$support-error` at 2px
 *             with its mark at the segment's end
 *   status    one label, one message line: the field shows its worst status
 *             (error > warn), with the group's text for it or the first
 *             segment's that has one; errors arrive late, as TextInput's
 *   keys      Tab and Shift+Tab move between segments; ← at a segment's start
 *             and → at its end move to the next one
 *   narrow    every value stays whole: once a row would cut one, four or
 *             six segments wrap into rows of two (not `cds-multi-field--one-row`),
 *             seams between the rows too, and a segment still too narrow drops
 *             its name, then its mark (multi-field-input.scss, "narrow").
 *             `grow` holds in one row only
 * ========================================================================== */

export interface MultiFieldSegment {
  /** The segment's name: shown before its value, and its accessible name. */
  label: string;
  value: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  placeholder?: string;
  /** Its share of the field's width, in one row. Default 1. */
  grow?: number;
  /** Native input attributes (`inputMode`, `maxLength`, `onBlur` …). */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'value' | 'onChange' | 'disabled' | 'readOnly' | 'size'
  >;
}

export interface MultiFieldInputProps {
  /** The first segment's id; the others derive from it. */
  id: string;
  labelText: ReactNode;
  hideLabel?: boolean;
  helperText?: ReactNode;
  segments: MultiFieldSegment[];
  /** xs 24 · sm 32 · md 40 (default) · lg 48, as TextInput. */
  size?: TextInputSize;
  /** The outer ends: `rounded` (8px, default), `full`, `square`. */
  corners?: 'full' | 'rounded' | 'square';
  /** Hide the segments' names (they still name the inputs). */
  hideSegmentLabels?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** The whole value is invalid (beyond any one segment). */
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** Errors wait for a pause in typing, or blur (TextInput's). Default true. */
  lateErrors?: boolean;
  typingPauseMs?: number;
  /** The message line: in the form's gap (default) or in the layout. */
  messagePlacement?: 'gap' | 'flow';
  /** `hero`: the blue accent for focus (expressive fields). Default `neutral`. */
  variant?: FieldVariant;
  className?: string;
}

export function MultiFieldInput({
  id,
  labelText,
  hideLabel = false,
  helperText,
  segments,
  size = 'md',
  corners = 'rounded',
  hideSegmentLabels = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  invalidText,
  warn = false,
  warnText,
  lateErrors = true,
  typingPauseMs = FIELD_TIMING.typingPauseMs,
  messagePlacement = 'gap',
  variant,
  className,
}: MultiFieldInputProps) {
  const anyInvalid = invalid || segments.some((s) => s.invalid);
  const anyWarn = warn || segments.some((s) => s.warn);
  const norm = normalizeFieldProps({
    id,
    readOnly,
    disabled,
    invalid: anyInvalid,
    warn: anyWarn,
  });
  const late = useLateStatus(norm.status, {
    late: lateErrors,
    pauseMs: typingPauseMs,
  });
  const shown = late.shown;

  // The message: the group's text for the status, or the first segment's that has one.
  const errText =
    invalidText ??
    segments.find((s) => s.invalid && hasText(s.invalidText))?.invalidText;
  const warnMsg =
    warnText ?? segments.find((s) => s.warn && hasText(s.warnText))?.warnText;
  const aria = fieldAria({
    shown,
    ids: norm,
    hasHelper: hasText(helperText),
    hasWarnText: hasText(warnMsg),
    hasInvalidText: hasText(errText),
  });

  /** A segment's own status, as the field shows it (a group-level status marks the last). */
  const statusOf = (s: MultiFieldSegment, i: number): FieldStatus => {
    const last = i === segments.length - 1;
    if (shown === 'error' && (s.invalid || (invalid && last))) return 'error';
    if (shown !== 'none' && !s.invalid && (s.warn || (warn && last)))
      return 'warn';
    return 'none';
  };

  // Focus: which segment, and by the pointer (the caret placed by a press) or not.
  const [focus, setFocus] = useState<{
    i: number;
    by: 'pointer' | 'keyboard';
  } | null>(null);
  const pointerDown = useRef(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const idOf = (i: number) => (i === 0 ? id : `${id}-${i}`);
  const labelId = `${id}-label`;

  const moveTo = (i: number, at: 'start' | 'end') => {
    const el = inputs.current[i];
    if (!el) return;
    el.focus();
    const n = at === 'start' ? 0 : el.value.length;
    try {
      el.setSelectionRange(n, n);
    } catch {
      // Inputs whose type has no selection (number) keep their own caret.
    }
  };
  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    segments[i]!.inputProps?.onKeyDown?.(e);
    if (e.defaultPrevented || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
      return;
    const el = e.currentTarget;
    const caret =
      el.selectionStart === el.selectionEnd ? el.selectionStart : null;
    // Right to left the next segment is to the left: ← at a value's end goes on.
    const key = inlineKey(e.key, el);
    if (
      key === 'ArrowRight' &&
      caret === el.value.length &&
      i < segments.length - 1
    ) {
      e.preventDefault();
      moveTo(i + 1, 'start');
    } else if (key === 'ArrowLeft' && caret === 0 && i > 0) {
      e.preventDefault();
      moveTo(i - 1, 'end');
    }
  };
  // A press anywhere in a segment that isn't its input puts the caret in.
  const onSegmentMouseDown = (i: number) => (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === inputs.current[i] || norm.disabled) return;
    e.preventDefault();
    pointerDown.current = true;
    moveTo(i, 'end');
  };
  const onSegmentPointerDown =
    (i: number) => (e: PointerEvent<HTMLDivElement>) => {
      const el = inputs.current[i];
      if (e.target === el && document.activeElement !== el)
        pointerDown.current = true;
      // A press on the segment that already has focus holds its selected edge.
      if (el && document.activeElement === el) {
        const seg = e.currentTarget;
        holdUntilRelease(seg);
      }
    };

  const hasLabel =
    labelText !== undefined && labelText !== null && labelText !== '';

  return (
    <div
      className={[
        'cds-text-input',
        `cds-text-input--${size}`,
        'cds-multi-field',
        // The seams (multi-field-input.scss): a hairline outline is cut by its own hairline; the
        // fill alone (disabled: no outline), by knockouts.
        norm.disabled
          ? 'cds-multi-field--knockout'
          : 'cds-multi-field--hairline',
        readOnly && 'cds-text-input--readonly',
        norm.disabled && 'cds-text-input--disabled',
        corners === 'square' && 'cds-text-input--square',
        corners === 'full' && 'cds-text-input--full',
        variant === 'hero' && 'cds-text-input--primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-status={shown}>
      <div
        className={[
          'cds-field-label-row',
          hideLabel && 'cds-field-label-row--hidden',
        ]
          .filter(Boolean)
          .join(' ')}>
        {hasLabel && (
          <label
            id={labelId}
            htmlFor={id}
            className={[
              'cds-field-label',
              hideLabel && 'cds-field-visually-hidden',
              norm.disabled && 'cds-field-label--disabled',
            ]
              .filter(Boolean)
              .join(' ')}>
            {labelText}
          </label>
        )}
      </div>
      <div className="cds-text-input__outer">
        <div
          className="cds-multi-field__shell"
          role="group"
          aria-labelledby={hasLabel ? labelId : undefined}>
          {segments.map((s, i) => {
            const st = statusOf(s, i);
            return (
              <div
                key={i}
                className="cds-multi-field__segment"
                style={
                  s.grow && s.grow !== 1 ? { flexGrow: s.grow } : undefined
                }
                data-focus={focus?.i === i ? focus.by : undefined}
                data-status={st === 'none' ? undefined : st}
                onPointerDown={onSegmentPointerDown(i)}
                onMouseDown={onSegmentMouseDown(i)}>
                {!hideSegmentLabels && (
                  <span className="cds-multi-field__name" aria-hidden="true">
                    {s.label}
                  </span>
                )}
                <input
                  {...s.inputProps}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  id={idOf(i)}
                  className="cds-text-input__input cds-multi-field__input"
                  aria-label={s.label}
                  aria-describedby={aria['aria-describedby']}
                  aria-invalid={st === 'error' || undefined}
                  aria-errormessage={
                    st === 'error' ? aria['aria-errormessage'] : undefined
                  }
                  value={s.value}
                  placeholder={s.placeholder}
                  disabled={norm.disabled}
                  readOnly={readOnly}
                  onChange={(e) => {
                    if (norm.disabled) return;
                    late.onInput();
                    s.onChange?.(e.target.value, e);
                  }}
                  onFocus={(e) => {
                    setFocus({
                      i,
                      by: pointerDown.current ? 'pointer' : 'keyboard',
                    });
                    pointerDown.current = false;
                    late.onFocus();
                    s.inputProps?.onFocus?.(e);
                  }}
                  onBlur={(e) => {
                    setFocus((f) => (f?.i === i ? null : f));
                    late.onBlur();
                    s.inputProps?.onBlur?.(e);
                  }}
                  onKeyDown={onKeyDown(i)}
                />
                <span className="cds-multi-field__mark-slot">
                  <FieldStatusMark status={st} />
                </span>
              </div>
            );
          })}
        </div>
        <FieldMessage
          status={shown}
          helperText={helperText}
          warnText={warnMsg}
          invalidText={errText}
          helperId={norm.helperId}
          warnId={norm.warnId}
          invalidId={norm.invalidId}
          disabled={norm.disabled}
          placement={messagePlacement}
        />
      </div>
    </div>
  );
}
MultiFieldInput.displayName = 'MultiFieldInput';
