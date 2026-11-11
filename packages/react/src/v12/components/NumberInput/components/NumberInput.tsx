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
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Add, Subtract } from '@carbon-labs/react-motion-icons';
import { motionTokens, usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
  FIELD_TIMING,
} from '@carbon-labs/v12-motion';
import {
  IconButton,
  TooltipGroup,
  mergeRefs,
} from '@carbon-labs/react-tooltip';
import { RollText } from '@carbon-labs/react-roll-text';
import { FieldMessage } from '@carbon-labs/react-text-input';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import { formatNumber, parseNumber } from './numberFormat';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import './number-input.scss';
import {
  iconSizeFor,
  type FieldFrame,
  type FieldVariant,
} from '@carbon-labs/react-props';
import { FIELD_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import {
  filledish,
  useAiFill,
  type FieldAiProps,
} from '@carbon-labs/react-text-input';

/* ============================================================================
 * NumberInput — Carbon v11's NumberInput on the kit's text field.
 * ============================================================================
 *
 * v11's props and behaviour: `id`, `label`, `hideLabel`, `helperText`,
 * `size` (xs 24 · sm 32 · md 40 · lg 48), `min` / `max` / `step` (1) /
 * `stepStartValue` (0), `value` / `defaultValue` (0 for `type="number"`,
 * NaN for `"text"`), `allowEmpty`, `invalid` + `invalidText` (a value
 * outside min–max is invalid too), `warn` + `warnText`, `disabled`,
 * `readOnly`, `hideSteppers`, `iconDescription`, `translateWithId`
 * ("Increment number" / "Decrement number"), `disableWheel`, `type`
 * (`number`, or the experimental `text` with `locale`, `formatOptions`,
 * `pattern`, `inputMode` and `validate`: the text is parsed as you type and
 * formatted on blur), `onChange(event, { value, direction })`,
 * `onClick(event, state)`, `onBlur(event, value)`, `onStepperBlur`,
 * `onKeyUp`, `decorator` / `slug`, `light` (deprecated). Every other native
 * input attribute is on the `<input>`; `className` is the wrapper's, the ref
 * the `<input>`. A step adds `step` (or starts from `stepStartValue`, or
 * ±1, or `min`, as v11 does), rounds to the step's precision and clamps to
 * min–max. The steppers are not tab stops (v11).
 *
 * The kit adds:
 *
 *   field     the text input's: the quiet fill, the hairline's ladder, the
 *             focus edge, the error's border settling in once, the status
 *             mark and the one message line in the form's gap; an error
 *             (a value typed outside min–max) arrives late, after a pause in
 *             typing or on blur
 *   steppers  the selection family's IconButton (ghost), inset in the field
 *             as the password toggle is, with the rollover's press shrink and
 *             no hover expand, in a TooltipGroup (one tooltip between the
 *             two). Their icons are motion-icons' Subtract and Add; each
 *             button is its icon's frame, so the icon plays on its hover
 *   the value a step (a stepper, ↑ / ↓, or a value set from outside) rolls
 *             the number to its next value with the kit's RollText: up as it
 *             rises, down as it falls, only the digits that change. Typing
 *             never rolls. Under reduced motion the number changes at once
 * ========================================================================== */

export type NumberInputSize = 'xs' | 'sm' | 'md' | 'lg';
export type NumberInputTranslationKey = 'increment.number' | 'decrement.number';

const TRANSLATIONS: Record<NumberInputTranslationKey, string> = {
  'increment.number': 'Increment number',
  'decrement.number': 'Decrement number',
};

export interface NumberInputState {
  value: number | string;
  direction: string;
}

export interface NumberInputProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      | 'defaultValue'
      | 'id'
      | 'min'
      | 'max'
      | 'onChange'
      | 'onClick'
      | 'onBlur'
      | 'size'
      | 'step'
      | 'value'
      | 'type'
      | 'className'
    >,
    FieldAiProps {
  /** The input's id; the message ids derive from it (v11). */
  id: string;
  /** Checked before min / max: `false` fails, `true` passes on to them, `undefined` defers (v11). */
  validate?: (value: string, locale: string) => boolean | undefined;
  /** An empty field is valid (v11). */
  allowEmpty?: boolean;
  /** Classes on the wrapper (v11). */
  className?: string;
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. Accepted. */
  slug?: ReactNode;
  /** Default 0 for `type="number"`, NaN for `"text"` (v11). */
  defaultValue?: number | string;
  /** Hold the wheel while the field has focus (v11). */
  disableWheel?: boolean;
  disabled?: boolean;
  /** `type="text"` only: Intl.NumberFormat options for parsing and formatting. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Where a step begins when the field is empty. Default 0 (v11). */
  stepStartValue?: number;
  helperText?: ReactNode;
  hideLabel?: boolean;
  hideSteppers?: boolean;
  /** The steppers' name when `translateWithId` gives none (v11). */
  iconDescription?: string;
  /** Default `decimal` (v11). */
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  invalid?: boolean;
  invalidText?: ReactNode;
  /** The label (v11 names it `label`). */
  label?: ReactNode;
  /** @deprecated v11: `<Layer>` instead. `$field-02`. */
  light?: boolean;
  /** `type="text"` only: a BCP 47 locale. Default `en-US`. */
  locale?: string;
  max?: number;
  min?: number;
  onBlur?: (
    event: FocusEvent<HTMLInputElement>,
    value?: string | number
  ) => void;
  onStepperBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  /** `type="number"`: every change. `type="text"`: a step, and on blur once the text is parsed (v11). */
  onChange?: (
    event:
      | MouseEvent<HTMLButtonElement>
      | FocusEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement>
      | ChangeEvent<HTMLInputElement>,
    state: NumberInputState
  ) => void;
  /** A press on the input, or a stepper (with the step's state). */
  onClick?: (event: MouseEvent<HTMLElement>, state?: NumberInputState) => void;
  /** `type="text"` only. Default `[0-9]*` (v11). */
  pattern?: string;
  readOnly?: boolean;
  /** Default `md` (40px). */
  size?: NumberInputSize;
  /** Default 1. */
  step?: number;
  translateWithId?: (id: NumberInputTranslationKey) => string;
  /** Default `number`; `text` is v11's experimental, locale-aware mode. */
  type?: 'number' | 'text';
  value?: number | string;
  warn?: boolean;
  warnText?: ReactNode;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (8px, default), `full` or `square`, as the text input's. */
  corners?: 'full' | 'rounded' | 'square';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrame;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default): a greyscale selected edge. `hero`: blue, for expressive fields. */
  variant?: FieldVariant;
  /** Errors (and warnings) arrive late: while typing, after a pause or on blur. Default true. */
  lateErrors?: boolean;
  /** The typing pause a rising status waits for, ms. Default 1000. */
  typingPauseMs?: number;
  /** `gap` (default): the message line in the form's 32px gap; `flow`: in the layout. */
  messagePlacement?: 'gap' | 'flow';
  /** The status mark plays its motion-icon once as it arrives. Default false. */
  statusBeat?: boolean;
  /** Slow motion for the value's roll and the steppers. Default 1. */
  timeScale?: number;
}

/** `disableWheel`: the wheel is held while the field has focus (one function, so it can be removed). */
const preventWheel = (e: WheelEvent) => e.preventDefault();

const decimalPlaces = (n: number) => n.toString().split('.')[1]?.length ?? 0;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(Math.max(n, lo), hi);

/** v11's `getInputValidity`. */
function isValid(o: {
  allowEmpty: boolean;
  invalid: boolean;
  value: number | string;
  max?: number;
  min?: number;
  validate?: NumberInputProps['validate'];
  locale: string;
}) {
  if (o.invalid) return false;
  if (o.value === '') return o.allowEmpty;
  const n =
    typeof o.value === 'string' ? parseNumber(o.value, o.locale) : o.value;
  if (
    o.validate &&
    typeof o.value === 'string' &&
    o.validate(o.value, o.locale) === false
  )
    return false;
  if (o.max !== undefined && n > o.max) return false;
  if (o.min !== undefined && n < o.min) return false;
  return true;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(props, forwardedRef) {
    const {
      allowEmpty = false,
      className,
      decorator,
      disabled: ownDisabled = false,
      disableWheel: disableWheelProp = false,
      formatOptions,
      helperText = '',
      hideLabel = false,
      hideSteppers,
      iconDescription,
      id,
      inputMode = 'decimal',
      invalid = false,
      invalidText,
      label,
      light = false,
      locale = 'en-US',
      max,
      min,
      onBlur,
      onStepperBlur,
      onChange,
      onClick,
      onKeyUp,
      pattern = '[0-9]*',
      readOnly: ownReadOnly = false,
      size: sizeProp,
      slug,
      step = 1,
      translateWithId: t = (key: NumberInputTranslationKey) =>
        TRANSLATIONS[key],
      type = 'number',
      defaultValue = type === 'number' ? 0 : NaN,
      validate,
      warn = false,
      warnText = '',
      stepStartValue = 0,
      value: controlledValue,
      corners: cornersProp,
      frame = 'inset',
      variant: variantProp,
      lateErrors = true,
      typingPauseMs = FIELD_TIMING.typingPauseMs,
      messagePlacement = 'gap',
      statusBeat = false,
      timeScale = 1,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      onKeyDown,
      onFocus,
      'aria-describedby': describedBy,
      ...rest
    } = props;
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    // KitDefaults: the provider's size, corners and variant for the props not given.
    const {
      size = 'md',
      corners = 'rounded',
      variant,
    } = useKitProps(
      { size: sizeProp, corners: cornersProp, variant: variantProp },
      FIELD_KIT
    );

    const isControlled = controlledValue !== undefined;
    const parse = (s: string) => parseNumber(s, locale, formatOptions);
    const format = (n: number) => formatNumber(n, locale, formatOptions);

    /* ── the value ─────────────────────────────────────────────────────── */

    // type="number": the input's value.
    const [value, setValue] = useState<number | string>(() =>
      controlledValue !== undefined ? controlledValue : defaultValue
    );
    // type="text": the parsed number, and the text as typed (formatted on blur).
    const [ownNumber, setOwnNumber] = useState<number>(() =>
      typeof defaultValue === 'string' ? parse(defaultValue) : defaultValue
    );
    const numberValue: number = isControlled
      ? typeof controlledValue === 'string'
        ? parse(controlledValue)
        : controlledValue
      : ownNumber;
    const setNumberValue = (n: number) => {
      if (!isControlled) setOwnNumber(n);
    };
    const previousNumberValue = useRef(numberValue);
    const [inputValue, setInputValue] = useState(() =>
      Number.isNaN(numberValue) ? '' : format(numberValue)
    );

    /* ── the roll ──────────────────────────────────────────────────────── */

    // A step rolls the number; typing never does. A value the parent sets that
    // isn't the one this field just reported (a reset, say) rolls too.
    const reduced = usePrefersReducedMotion();
    const [roll, setRoll] = useState(0);
    const [rolling, setRolling] = useState(false);
    const startRoll = () => {
      if (reduced) return;
      setRolling(true);
      setRoll((n) => n + 1);
    };
    const stopRoll = () => setRolling(false);
    useEffect(() => {
      if (!rolling) return;
      // RollText's clock (moderate-01), slowed with `timeScale`.
      const ms = motionTokens.duration['moderate-01'] * timeScale + 40;
      const id = window.setTimeout(() => setRolling(false), ms);
      return () => window.clearTimeout(id);
    }, [roll, rolling, timeScale]);

    // The controlled value: v11 syncs it in an effect; here, as it renders.
    const [seenControlled, setSeenControlled] = useState(controlledValue);
    const [reported, setReported] = useState<number | string | undefined>(
      controlledValue
    );
    // A fill (or a new value while filled) and a revert are the AI fill's swap, never a roll.
    const [seenAi, setSeenAi] = useState(aiState);
    const aiSwap =
      aiState === 'filled' || (filledish(seenAi) && !filledish(aiState));
    if (seenAi !== aiState) setSeenAi(aiState);
    if (controlledValue !== seenControlled) {
      setSeenControlled(controlledValue);
      if (type === 'number' && controlledValue !== undefined)
        setValue(allowEmpty && controlledValue === '' ? '' : controlledValue);
      if (type === 'text' && controlledValue !== undefined) {
        const n =
          typeof controlledValue === 'string'
            ? parse(controlledValue)
            : controlledValue;
        if (
          !(Number.isNaN(n) && Number.isNaN(parse(inputValue))) &&
          n !== parse(inputValue)
        )
          setInputValue(format(n));
      }
      // Not what this field just reported: from outside, so it rolls.
      if (
        !aiSwap &&
        controlledValue !== undefined &&
        reported !== controlledValue &&
        String(reported) !== String(controlledValue)
      ) {
        if (!reduced) {
          setRolling(true);
          setRoll((n) => n + 1);
        }
      }
    }
    const report = (state: NumberInputState) => setReported(state.value);

    const shownText = type === 'number' ? String(value ?? '') : inputValue;
    const shownNumber = type === 'number' ? Number(value) : numberValue;

    /* ── status ────────────────────────────────────────────────────────── */

    const norm = normalizeFieldProps({
      id,
      readOnly,
      disabled,
      invalid: !isValid({
        allowEmpty,
        invalid,
        value: validate ? inputValue : type === 'number' ? value : numberValue,
        max,
        min,
        validate,
        locale,
      }),
      warn,
    });
    const late = useLateStatus(norm.status, {
      late: lateErrors,
      pauseMs: typingPauseMs,
    });
    const shown = late.shown;
    const inputRef = useRef<HTMLInputElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    // The AI fill: its revert sits before the steppers.
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

    const ref = useMemo(
      () => mergeRefs<HTMLInputElement>(inputRef, forwardedRef as never),
      [forwardedRef]
    );

    // Focus: by the pointer (the caret placed by a press) or not (Tab, or the app).
    const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
    const pointerDown = useRef(false);

    /* ── handlers ──────────────────────────────────────────────────────── */

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      late.onInput();
      stopRoll();
      if (type === 'number') {
        const state = {
          value:
            allowEmpty && e.target.value === '' ? '' : Number(e.target.value),
          direction: Number(value) < Number(e.target.value) ? 'up' : 'down',
        };
        if (!isControlled) setValue(state.value);
        report(state);
        onChange?.(e, state);
        return;
      }
      const typed = allowEmpty && e.target.value === '' ? '' : e.target.value;
      setNumberValue(parse(typed));
      setInputValue(typed);
    };

    const handleStep = (
      event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>,
      direction: 'up' | 'down'
    ): NumberInputState | undefined => {
      const input = inputRef.current;
      if (!input) return;
      const current = type === 'number' ? Number(input.value) : numberValue;
      let raw = 0;
      if (Number.isNaN(current) || !current) {
        // v11's start: stepStartValue, else ±1 (a range across zero, or no bounds, or a max), else min.
        if (typeof stepStartValue === 'number' && stepStartValue)
          raw = stepStartValue;
        else if ((min && min < 0 && max && max > 0) || (!max && !min) || max)
          raw = direction === 'up' ? 1 : -1;
        else if ((min && min > 0 && max && max > 0) || min) raw = min!;
      } else raw = direction === 'up' ? current + step : current - step;
      const precision = Math.max(
        decimalPlaces(Number.isNaN(current) ? 0 : current),
        decimalPlaces(step)
      );
      const next = clamp(
        parseFloat(Number(raw).toFixed(precision)),
        min ?? -Infinity,
        max ?? Infinity
      );
      const state = { value: next, direction };
      if (type === 'number' && !isControlled) setValue(next);
      if (type === 'text') {
        const formatted = format(next);
        const parsed = parse(formatted);
        setNumberValue(parsed);
        setInputValue(formatted);
        previousNumberValue.current = parsed;
      }
      if (String(next) !== String(current)) startRoll();
      report(state);
      onChange?.(event, state);
      return state;
    };

    const handleStepperClick = (
      e: MouseEvent<HTMLButtonElement>,
      direction: 'up' | 'down'
    ) => {
      const state = handleStep(e, direction);
      onClick?.(e, state);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // ↑ / ↓ step (v11 does this for type="text"; here for both, so the step rolls).
      if (
        !readOnly &&
        !disabled &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown')
      ) {
        e.preventDefault();
        handleStep(e, e.key === 'ArrowUp' ? 'up' : 'down');
      }
      onKeyDown?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      // Always: `disableWheel` may have turned off while the field had focus. A no-op when
      // it is not added (one function).
      e.target.removeEventListener('wheel', preventWheel);
      setFocus(null);
      late.onBlur();
      let parsedForBlur: number | undefined;
      if (type === 'text') {
        const current = isControlled ? parse(inputValue) : numberValue;
        const formatted = Number.isNaN(current) ? '' : format(current);
        const raw = e.target.value;
        const ok = validate ? validate(raw, locale) : true;
        setInputValue(ok ? formatted : raw);
        const parsed = parse(formatted);
        parsedForBlur = parsed;
        if (onChange && ok) {
          const state = {
            value: parsed,
            direction: previousNumberValue.current < parsed ? 'up' : 'down',
          };
          if (
            !(Number.isNaN(previousNumberValue.current) && Number.isNaN(parsed))
          ) {
            report(state);
            onChange(e, state);
          }
        }
        if (
          !(
            Number.isNaN(previousNumberValue.current) &&
            Number.isNaN(numberValue)
          )
        )
          previousNumberValue.current = numberValue;
        if (!(Number.isNaN(numberValue) && Number.isNaN(parsed)))
          setNumberValue(parsed);
      }
      if (onBlur) {
        if (type === 'number') onBlur(e, value);
        else
          onBlur(
            e,
            parsedForBlur ?? (isControlled ? parse(inputValue) : numberValue)
          );
      }
    };

    /* ── the field's focus (the text input's) ──────────────────────────── */

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      if (disableWheelProp)
        e.target.addEventListener('wheel', preventWheel, { passive: false });
      setFocus(pointerDown.current ? 'pointer' : 'keyboard');
      pointerDown.current = false;
      late.onFocus();
      onFocus?.(e);
    };
    const onFieldPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (e.target === input && document.activeElement !== input)
        pointerDown.current = true;
      const field = e.currentTarget;
      if (document.activeElement === input) {
        holdUntilRelease(field);
      }
    };
    // A press in the field that isn't on a control puts the caret in.
    const onFieldMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      const target = e.target as Element;
      if (
        target === inputRef.current ||
        target.closest('button, a, [tabindex]') ||
        norm.disabled
      )
        return;
      e.preventDefault();
      pointerDown.current = true;
      inputRef.current?.focus();
    };

    /* ── render ────────────────────────────────────────────────────────── */

    const hasLabel = label !== undefined && label !== null && label !== '';
    const labelRow = hasLabel ? (
      <div
        className={[
          'cds-field-label-row',
          hideLabel && 'cds-field-label-row--hidden',
        ]
          .filter(Boolean)
          .join(' ')}>
        <label
          htmlFor={id}
          className={[
            'cds-field-label',
            hideLabel && 'cds-field-visually-hidden',
            norm.disabled && 'cds-field-label--disabled',
          ]
            .filter(Boolean)
            .join(' ')}>
          {label}
        </label>
      </div>
    ) : null;
    const deco = slug ?? decorator;
    const iconPx = iconSizeFor(size);
    const btnSize = size === 'lg' ? 'lg' : 'md';
    const steppersOff = disabled || readOnly;
    const [incLabel, decLabel] = [t('increment.number'), t('decrement.number')];

    const classes = [
      'cds-text-input',
      `cds-text-input--${size}`,
      'cds-number-input',
      hideSteppers && 'cds-number-input--nosteppers',
      readOnly && 'cds-text-input--readonly',
      norm.disabled && 'cds-text-input--disabled',
      light && 'cds-text-input--light',
      corners === 'square' && 'cds-text-input--square',
      corners === 'full' && 'cds-text-input--full',
      frame === 'ghost' && 'cds-text-input--ghost',
      variant === 'hero' && 'cds-text-input--primary',
      ai.reserved && 'cds-number-input--revertible',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={classes}
        data-status={shown}
        data-rolling={rolling || undefined}
        data-ai-state={aiState}>
        {labelRow}
        <div className="cds-text-input__outer">
          <div
            ref={fieldRef}
            className="cds-text-input__field"
            data-focus={focus ?? undefined}
            onPointerDown={onFieldPointerDown}
            onMouseDown={onFieldMouseDown}>
            <input
              {...rest}
              {...aria}
              ref={ref}
              id={id}
              className="cds-text-input__input cds-number-input__input"
              aria-readonly={readOnly || undefined}
              disabled={norm.disabled}
              max={max}
              min={min}
              onClick={onClick}
              onChange={handleOnChange}
              onKeyUp={onKeyUp}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              pattern={pattern}
              inputMode={inputMode}
              readOnly={readOnly}
              step={step}
              type={type}
              value={type === 'number' ? value : inputValue}
            />
            {/* The number as it rolls, over the input's own text (hidden while it rolls). */}
            <span
              className="cds-number-input__roll"
              aria-hidden="true"
              data-on={rolling || undefined}>
              <RollText
                text={shownText}
                order={Number.isNaN(shownNumber) ? 0 : shownNumber}
                timeScale={timeScale}
              />
            </span>
            <span className="cds-text-input__trail">
              <span className="cds-text-input__mark-slot">
                <FieldStatusMark status={shown} beat={statusBeat} />
              </span>
              {ai.revert}
              {deco ? (
                <span className="cds-text-input__decorator">{deco}</span>
              ) : null}
              {!hideSteppers && (
                <span className="cds-number-input__steppers">
                  <TooltipGroup align="bottom">
                    <IconButton
                      className="cds-text-input__toggle cds-number-input__stepper"
                      frame="ghost"
                      size={btnSize}
                      label={decLabel || iconDescription}
                      disabled={steppersOff}
                      tabIndex={-1}
                      onClick={(e) =>
                        handleStepperClick(
                          e as MouseEvent<HTMLButtonElement>,
                          'down'
                        )
                      }
                      onBlur={(e) =>
                        onStepperBlur?.(e as FocusEvent<HTMLButtonElement>)
                      }>
                      <Subtract size={iconPx} />
                    </IconButton>
                    <IconButton
                      className="cds-text-input__toggle cds-number-input__stepper"
                      frame="ghost"
                      size={btnSize}
                      label={incLabel || iconDescription}
                      disabled={steppersOff}
                      tabIndex={-1}
                      onClick={(e) =>
                        handleStepperClick(
                          e as MouseEvent<HTMLButtonElement>,
                          'up'
                        )
                      }
                      onBlur={(e) =>
                        onStepperBlur?.(e as FocusEvent<HTMLButtonElement>)
                      }>
                      <Add size={iconPx} />
                    </IconButton>
                  </TooltipGroup>
                </span>
              )}
            </span>
            {ai.note}
          </div>
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
          />
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';
