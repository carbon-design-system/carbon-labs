/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { useSkeletonReveal } from '@carbon-labs/react-feedback';
import { SkeletonBar } from '@carbon-labs/react-feedback';
import { FieldMessage } from './FieldMessage';
import { FieldStatusMark } from './FieldStatusMark';
import {
  counterAnnouncement,
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
  FIELD_TIMING,
} from '@carbon-labs/v12-motion';
import type { FieldFrame, FieldVariant } from '@carbon-labs/react-props';
import { FIELD_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import './field.scss';
import './text-input.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { useAiFill, type FieldAiProps } from './aiFill';

/* ============================================================================
 * TextInput — Carbon v11's TextInput, re-implemented on the kit's look.
 * ============================================================================
 *
 * v11's props and behaviour: `id`, `labelText` (a node), `hideLabel`,
 * `helperText`, `placeholder` (also the `title`), `size` (xs 24 · sm 32 ·
 * md 40 · lg 48), `disabled`, `readOnly`, `invalid` + `invalidText`, `warn`
 * + `warnText` (read-only beats both, disabled beats both, invalid beats
 * warn), `type`, `value` / `defaultValue` / `onChange` / `onClick` and every
 * native input attribute (spread on the `<input>`; `className` is the
 * wrapper's, as in v11), `inline`, `enableCounter` / `maxCount` (with v11's
 * "n characters left" announcement), `decorator` / `slug`, `light`
 * (deprecated; `<Layer>` instead). The ref is the `<input>`.
 *
 * In the kit:
 *
 *   surface   `$field` (contextual, so it steps in `<Layer>`), 8px corners
 *             (or full / square), a `$border-subtle` hairline all round —
 *             no bottom line
 *   hover     the outline, not the fill: the hairline
 *             steps to `$border-strong`; a press shows the focus color at
 *             2px until release
 *   focus     where the caret is, always: the hairline turns `$focus` when
 *             the pointer puts the caret in; reached by the keyboard (Tab,
 *             or focus moved by the app) it is v11's 2px ring
 *   status    one message line in the form's gap, swapping helper → warning
 *             → error in place (FieldMessage); a mark at the trailing edge
 *             (FieldStatusMark); the error's 2px border settles in once, on
 *             moderate-02, and never shakes. Errors arrive late (a pause in
 *             typing, or blur) and leave on the keystroke that fixes them
 *   still     nothing moves while typing; fades only; under reduced motion
 *             the fades run at half the clock
 *   loading   the component loading standard: `loading`, and `TextInputSkeleton`. The label,
 *             helper, field frame and trailing controls are known and drawn
 *             for real; the value is the one data slot — a bar of the
 *             value's line box at the expected value's width
 *             (`skeletonValue`, printed unseen in the field's own type). It
 *             hands off through `useSkeletonReveal`: the bar dissolves in
 *             place as the value fades up. No hover, focus or status while
 *             loading; the root is `aria-busy`
 * ========================================================================== */

export type TextInputSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TextInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>,
    FieldAiProps {
  /** The `<input>`'s id; the message ids derive from it (v11). */
  id: string;
  /** The label. A node, without interactive content (v11). */
  labelText: ReactNode;
  /** Classes on the wrapper (v11). */
  className?: string;
  /** v11's experimental decorator (an AILabel …), at the field's trailing edge. */
  decorator?: ReactNode;
  /** v11: deprecated for `decorator`; accepted. */
  slug?: ReactNode;
  disabled?: boolean;
  /** Show `count/maxCount` in the label row (needs `maxCount`). */
  enableCounter?: boolean;
  helperText?: ReactNode;
  hideLabel?: boolean;
  /** Label, field and message in a row (v11). */
  inline?: boolean;
  invalid?: boolean;
  invalidText?: ReactNode;
  /** v11: deprecated for `<Layer>`; `$field-02`. */
  light?: boolean;
  /** The counter's limit; also the input's `maxLength` while the counter is on (v11). */
  maxCount?: number;
  placeholder?: string;
  readOnly?: boolean;
  /** Default `md` (40px). */
  size?: TextInputSize;
  /** Default `text`. */
  type?: string;
  warn?: boolean;
  warnText?: ReactNode;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  /** Errors (and warnings) arrive late: while typing, after a pause or on blur. Default true. */
  lateErrors?: boolean;
  /** The typing pause a rising status waits for, ms. Default 1000. */
  typingPauseMs?: number;
  /** Where the message line sits: `gap` (default) in the form's 32px gap, or `flow` in the layout. */
  messagePlacement?: 'gap' | 'flow';
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default): the selected edge is greyscale (`$border-inverse`). `hero`: the kit's brand (`--cds-hero`: IBM blue, `$border-interactive`, unless `KitDefaults brand` sets another hue), reserved for expressive fields. */
  variant?: FieldVariant;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `full` (half the field's height), `rounded` (8px, default) or `square`. */
  corners?: 'full' | 'rounded' | 'square';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrame;
  /** The status mark plays its motion-icon once as it arrives. Default false. */
  statusBeat?: boolean;
  /** The value is loading: the field is drawn with a bar where the value will be (the loading standard). */
  loading?: boolean;
  /** The expected value while loading: the bar is its width in the field's type. Default the current value (a reload), else a typical entry. */
  skeletonValue?: string;
}

/** A typical entry's width, when nothing better is known. */
const TYPICAL_VALUE = 'Typical entry';

/** The expected value as the field shows it: a password's as its dots. */
function expectedValue(text: string, type: string) {
  if (type === 'password') return '\u2022'.repeat(text.length || 10);
  return text || TYPICAL_VALUE;
}

/** What PasswordInput adds to the shared field. Internal. */
interface FieldCoreProps extends TextInputProps {
  /** A control at the field's trailing edge (the password toggle). */
  trailing?: ReactNode;
  /** Extra wrapper classes. */
  variantClass?: string;
  /** Extra classes on the field and its trail (a field skeleton in another field's markup). */
  fieldClass?: string;
  trailClass?: string;
}

export const FieldCore = forwardRef<HTMLInputElement, FieldCoreProps>(
  function FieldCore(
    {
      id,
      labelText,
      className,
      decorator,
      slug,
      disabled: ownDisabled = false,
      enableCounter = false,
      helperText,
      hideLabel = false,
      inline = false,
      invalid = false,
      invalidText,
      light = false,
      maxCount,
      placeholder,
      readOnly: ownReadOnly = false,
      size: sizeProp,
      type = 'text',
      warn = false,
      warnText,
      lateErrors = true,
      typingPauseMs = FIELD_TIMING.typingPauseMs,
      messagePlacement = 'gap',
      variant: variantProp,
      corners: cornersProp,
      frame = 'inset',
      statusBeat = false,
      loading = false,
      skeletonValue,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      trailing,
      variantClass,
      fieldClass,
      trailClass,
      onChange,
      onClick,
      onFocus,
      onBlur,
      'aria-describedby': describedBy,
      ...rest
    },
    ref
  ) {
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    // KitDefaults: the provider's size, corners and variant for the props not given.
    const {
      size = 'md',
      corners = 'rounded',
      variant,
    } = useKitProps(
      {
        size: sizeProp,
        corners: cornersProp,
        variant: variantProp,
      },
      FIELD_KIT
    );
    // Loading → loaded: the value's bar stays as the overlay and dissolves in
    // place while the input (only its text paints) fades up under it.
    const { phase, overlayRef, contentRef, overlayProps } =
      useSkeletonReveal(loading);
    const busy = phase === 'loading' || phase === 'unload';

    const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
    const late = useLateStatus(norm.status, {
      late: lateErrors,
      pauseMs: typingPauseMs,
    });
    // No status while the value is loading: the helper holds its line.
    const shown = busy ? 'none' : late.shown;

    const inputRef = useRef<HTMLInputElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);

    // The counter: controlled from `value`, otherwise counted on change (v11).
    const { value, defaultValue } = rest;
    const [typed, setTyped] = useState(
      () => String(value ?? defaultValue ?? '').length
    );
    const count = value !== undefined ? String(value ?? '').length : typed;
    const counterOn = enableCounter && !!maxCount;

    // v11's announcement: cleared, then written a second later, once it changes.
    const announcerRef = useRef<HTMLSpanElement>(null);
    const announcement = counterOn
      ? counterAnnouncement(count, maxCount)
      : null;
    const lastAnnounced = useRef('');
    useEffect(() => {
      const el = announcerRef.current;
      if (!el || !announcement || announcement === lastAnnounced.current)
        return;
      el.textContent = '';
      const t = window.setTimeout(() => {
        el.textContent = announcement;
        lastAnnounced.current = announcement;
      }, 1000);
      return () => window.clearTimeout(t);
    }, [announcement]);

    // Focus: by the pointer (the caret placed by a press) or not (Tab, or the app).
    const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
    const pointerDown = useRef(false);

    const ai = useAiFill({
      id,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      controlRef: inputRef,
      fieldRef,
      helperText,
      size,
      disabled: norm.disabled,
      readOnly,
    });

    const aria = fieldAria({
      shown,
      ids: norm,
      hasHelper: hasText(ai.helperText),
      hasWarnText: hasText(warnText),
      hasInvalidText: hasText(invalidText),
      describedBy:
        [describedBy, ai.describedBy].filter(Boolean).join(' ') || undefined,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (norm.disabled) return;
      late.onInput();
      setTyped(e.target.value.length);
      onChange?.(e);
    };
    const handleClick = (e: MouseEvent<HTMLInputElement>) => {
      if (!norm.disabled) onClick?.(e);
    };
    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setFocus(pointerDown.current ? 'pointer' : 'keyboard');
      pointerDown.current = false;
      late.onFocus();
      onFocus?.(e);
    };
    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setFocus(null);
      late.onBlur();
      onBlur?.(e);
    };
    const onFieldPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      // Only a press that will focus the input counts (one already focused stays as it is).
      if (
        e.target === inputRef.current &&
        document.activeElement !== inputRef.current
      )
        pointerDown.current = true;
      // A press on a field that already has focus holds the selected edge (the press step never lowers it).
      const field = fieldRef.current;
      if (field && document.activeElement === inputRef.current) {
        holdUntilRelease(field);
      }
    };
    // A press anywhere in the field that isn't on a control puts the caret in.
    const onFieldMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      const t = e.target as Element;
      if (
        t === inputRef.current ||
        t.closest('button, a, [tabindex]') ||
        norm.disabled
      )
        return;
      e.preventDefault();
      pointerDown.current = true;
      inputRef.current?.focus();
    };

    const hasLabel =
      labelText !== undefined && labelText !== null && labelText !== '';
    const label = !hasLabel ? (
      // A skeleton without a label: a bar of the label's line box.
      busy && !hideLabel ? (
        <SkeletonSlot className="cds-field-label" text="Label text" />
      ) : null
    ) : (
      <label
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
    );
    const counter =
      counterOn && busy ? (
        // The count is data: a bar the width of the longest count.
        <SkeletonSlot
          className="cds-field-counter"
          text={`${maxCount}/${maxCount}`}
        />
      ) : counterOn ? (
        <div
          className={[
            'cds-field-counter',
            disabled && 'cds-field-counter--disabled',
          ]
            .filter(Boolean)
            .join(' ')}>
          {count}/{maxCount}
        </div>
      ) : null;
    const labelRow = (
      <div
        className={[
          'cds-field-label-row',
          hideLabel && !counter && 'cds-field-label-row--hidden',
        ]
          .filter(Boolean)
          .join(' ')}>
        {label}
        {counter}
      </div>
    );
    const message = (
      <FieldMessage
        status={shown}
        helperText={ai.helperText}
        warnText={warnText}
        invalidText={invalidText}
        helperId={norm.helperId}
        warnId={norm.warnId}
        invalidId={norm.invalidId}
        disabled={norm.disabled}
        placement={messagePlacement}
        inline={inline}
      />
    );
    const deco = slug ?? decorator;

    const classes = [
      'cds-text-input',
      `cds-text-input--${size}`,
      inline && 'cds-text-input--inline',
      readOnly && 'cds-text-input--readonly',
      norm.disabled && 'cds-text-input--disabled',
      light && 'cds-text-input--light',
      corners === 'square' && 'cds-text-input--square',
      corners === 'full' && 'cds-text-input--full',
      frame === 'ghost' && 'cds-text-input--ghost',
      variant === 'hero' && 'cds-text-input--primary',
      deco && 'cds-text-input--decorated',
      ai.reserved && 'cds-text-input--revertible',
      busy && 'cds-text-input--loading',
      variantClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={classes}
        data-status={shown}
        data-ai-state={aiState}
        aria-busy={busy || undefined}>
        {inline ? (
          <div className="cds-text-input__inline-label">{labelRow}</div>
        ) : (
          labelRow
        )}
        <div className="cds-text-input__outer">
          <div
            ref={fieldRef}
            className={['cds-text-input__field', fieldClass]
              .filter(Boolean)
              .join(' ')}
            data-focus={focus ?? undefined}
            onPointerDown={onFieldPointerDown}
            onMouseDown={onFieldMouseDown}>
            {phase !== 'loading' && (
              <input
                title={placeholder}
                {...rest}
                {...aria}
                ref={mergeRefs<HTMLInputElement>(
                  inputRef,
                  contentRef as never,
                  ref as never
                )}
                id={id}
                className="cds-text-input__input"
                type={type}
                placeholder={placeholder}
                disabled={norm.disabled}
                readOnly={readOnly}
                maxLength={counterOn ? maxCount : rest.maxLength}
                onChange={handleChange}
                onClick={handleClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            )}
            {phase !== 'loaded' && (
              // ONE node from loading through the handoff: the value's line box
              // at the expected value's width, with its bar.
              <span
                ref={overlayRef as never}
                {...overlayProps}
                className="cds-text-input__skeleton"
                aria-hidden="true">
                <SkeletonSlot
                  text={expectedValue(
                    skeletonValue ?? String(value ?? defaultValue ?? ''),
                    type
                  )}
                />
              </span>
            )}
            <span
              className={['cds-text-input__trail', trailClass]
                .filter(Boolean)
                .join(' ')}>
              <span className="cds-text-input__mark-slot">
                <FieldStatusMark status={shown} beat={statusBeat} />
              </span>
              {ai.revert}
              {deco ? (
                <span className="cds-text-input__decorator">{deco}</span>
              ) : null}
              {trailing}
            </span>
            {ai.note}
            <span
              ref={announcerRef}
              className="cds-field-visually-hidden"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            />
          </div>
          {!inline && message}
        </div>
        {inline && (
          <div className="cds-text-input__inline-message">{message}</div>
        )}
      </div>
    );
  }
);
FieldCore.displayName = 'FieldCore';

/**
 * A data slot while loading: `text` printed unseen in the slot's own type
 * (its width and line box), with a skeleton bar over it — the bar's box is
 * exactly the text's.
 */
function SkeletonSlot({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={['cds-field-skeleton-slot', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true">
      {text}
      <SkeletonBar lineHeight="100%" className="cds-field-skeleton-slot__bar" />
    </span>
  );
}

/** v11's TextInput, on the kit's text field. `TextInput.PasswordInput` is attached in `./index.ts`. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, ref) {
    return <FieldCore {...props} ref={ref} />;
  }
);
TextInput.displayName = 'TextInput';

export type TextInputSkeletonProps = Omit<
  TextInputProps,
  'id' | 'labelText' | 'loading'
> & {
  /** Default a generated id. */
  id?: string;
  /** Known while the value loads: drawn for real. Without it, a bar. */
  labelText?: ReactNode;
};

/**
 * v11's TextInputSkeleton: the same field, loading — the label (or a bar),
 * the frame, and a bar where the value will be. Takes TextInput's layout
 * props (`size`, `hideLabel`, `inline`, `helperText`, `corners`,
 * `enableCounter` / `maxCount`, `skeletonValue`).
 */
export function TextInputSkeleton({
  id,
  labelText,
  ...rest
}: TextInputSkeletonProps) {
  const auto = useId();
  return (
    <FieldCore {...rest} id={id ?? auto} labelText={labelText ?? ''} loading />
  );
}
