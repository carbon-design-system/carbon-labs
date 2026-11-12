/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Calendar as CalendarIcon } from '@carbon-labs/react-motion-icons';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import { FieldFrame } from '@carbon-labs/react-dropdown';
import { PICKER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { iconSizeFor } from '@carbon-labs/react-props';
import './date-picker.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';

/* ============================================================================
 * DatePickerInput — Carbon v11's DatePickerInput on the kit's text field
 * (the text input's: fill, hairline ladder, focus edge, status mark and the
 * one message line). Inside a DatePicker it is the picker's start (first
 * child) or end (second); on its own it is a plain date field.
 * ============================================================================
 *
 * v11's props: `id`, `labelText`, `hideLabel`, `helperText`, `placeholder`,
 * `pattern` (default `\d{1,2}\/\d{1,2}\/\d{4}`), `size` (xs · sm · md · lg),
 * `type`, `disabled`, `readOnly`, `invalid` / `invalidText`, `warn` /
 * `warnText`, `datePickerType` (set by the DatePicker), `onChange`,
 * `onClick`, `decorator` / `slug`; the rest goes on the `<input>`. The ref
 * is the `<input>` (v11 types it as the div; it is the input there too).
 *
 * The calendar icon (motion-icons' Calendar, hovering with the field) shows
 * for `single` and `range`; `simple` has none.
 * ========================================================================== */

/** What the DatePicker hands each of its inputs. Internal. */
export interface DatePickerInputHost {
  /** The text the input shows (a draft while typing, else the date). */
  text: (slot: number) => string;
  onChange: (slot: number, e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (slot: number, e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (slot: number, e: FocusEvent<HTMLInputElement>) => void;
  onBlur: (slot: number, e: FocusEvent<HTMLInputElement>) => void;
  onClick: (slot: number, e: MouseEvent<HTMLInputElement>) => void;
  register: (slot: number, el: HTMLInputElement | null) => void;
  /** The calendar is open (the field's `aria-expanded`). */
  open: boolean;
  /** The calendar's id (the field's `aria-controls`). */
  calendarId: string;
  /** v11's `allowInput`: false, the field takes no typing (the calendar only). */
  allowInput: boolean;
}

export const DatePickerHostContext = createContext<DatePickerInputHost | null>(
  null
);
/** Which of the picker's inputs this is: 0 the start, 1 the end. */
export const DatePickerSlotContext = createContext(0);

export type DatePickerInputSize = 'xs' | 'sm' | 'md' | 'lg';

export interface DatePickerInputProps extends Omit<
  HTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'children'
> {
  /** Set by the DatePicker. */
  datePickerType?: 'simple' | 'single' | 'range';
  /** v11's decorator (an AILabel …), at the field's trailing edge. */
  decorator?: ReactNode;
  disabled?: boolean;
  helperText?: ReactNode;
  hideLabel?: boolean;
  id: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  labelText: ReactNode;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  /** Default v11's `\d{1,2}\/\d{1,2}\/\d{4}`. */
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  /** Default `md` (40px), or a `KitDefaults` density's (the fields' map: compact sm, default md, spacious lg). */
  size?: DatePickerInputSize;
  /** @deprecated v11: `decorator`. */
  slug?: ReactNode;
  /** Default `text`. */
  type?: string;
  warn?: boolean;
  warnText?: ReactNode;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (8px, default), `full` or `square`, as the text input's. */
  corners?: 'full' | 'rounded' | 'square';
}

export const DatePickerInput = forwardRef<
  HTMLInputElement,
  DatePickerInputProps
>(function DatePickerInput(
  {
    datePickerType,
    decorator,
    slug,
    disabled: ownDisabled = false,
    helperText,
    hideLabel = false,
    id,
    invalid = false,
    invalidText,
    labelText,
    onChange,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    pattern = '\\d{1,2}\\/\\d{1,2}\\/\\d{4}',
    placeholder,
    readOnly: ownReadOnly = false,
    size: sizeProp,
    type = 'text',
    warn = false,
    warnText,
    corners: cornersProp,
    className,
    'aria-describedby': describedBy,
    ...rest
  },
  ref
) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  // KitDefaults: the provider's density through the fields' map and its corners, for the props not given.
  const { size = 'md', corners } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    PICKER_KIT
  );
  const host = useContext(DatePickerHostContext);
  const slot = useContext(DatePickerSlotContext);
  const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
  const late = useLateStatus(norm.status, { late: false });
  const shown = late.shown;
  const aria = fieldAria({
    shown,
    ids: norm,
    hasHelper: hasText(helperText),
    hasWarnText: hasText(warnText),
    hasInvalidText: hasText(invalidText),
    describedBy,
  });

  // Standalone: its own text.
  const [own, setOwn] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const merged = useMemo(
    () =>
      mergeRefs<HTMLInputElement>(
        inputRef,
        ref as never,
        (el: HTMLInputElement | null) => host?.register(slot, el)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the host's register is stable
    [ref, slot, !!host]
  );

  // Focus: by the pointer (the caret placed by a press) or not (Tab, or the app).
  const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
  const pointerDown = useRef(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const calendar = datePickerType === 'single' || datePickerType === 'range';
  const deco = slug ?? decorator;
  const iconPx = iconSizeFor(size);
  const hasLabel =
    labelText !== undefined && labelText !== null && labelText !== '';

  return (
    <FieldFrame
      id={id}
      labelId={`${id}-label`}
      labelFor
      titleText={hasLabel ? labelText : undefined}
      hideLabel={hideLabel}
      helperText={helperText}
      warnText={warnText}
      invalidText={invalidText}
      shown={shown}
      norm={norm}
      size={size}
      readOnly={readOnly}
      corners={corners}
      className={className}
      variantClass="cds-date-picker-input">
      <div
        ref={fieldRef}
        className="cds-text-input__field"
        data-focus={focus ?? undefined}
        data-motion-icon-frame=""
        onPointerDown={(e) => {
          if (
            e.target === inputRef.current &&
            document.activeElement !== inputRef.current
          )
            pointerDown.current = true;
          const field = fieldRef.current;
          if (field && document.activeElement === inputRef.current) {
            holdUntilRelease(field);
          }
        }}
        onMouseDown={(e) => {
          // A press on the field outside the input (the icon) puts the caret in.
          const t = e.target as Element;
          if (t === inputRef.current || t.closest('button, a') || norm.disabled)
            return;
          e.preventDefault();
          pointerDown.current = true;
          inputRef.current?.focus();
          if (host && inputRef.current)
            host.onClick(slot, e as unknown as MouseEvent<HTMLInputElement>);
        }}>
        <input
          {...rest}
          {...aria}
          ref={merged}
          id={id}
          className="cds-text-input__input"
          type={type}
          pattern={pattern}
          placeholder={placeholder}
          title={placeholder}
          autoComplete="off"
          disabled={norm.disabled}
          readOnly={readOnly || (host ? !host.allowInput : false)}
          aria-readonly={readOnly || undefined}
          aria-haspopup={host && calendar ? 'dialog' : undefined}
          aria-expanded={host && calendar ? host.open : undefined}
          // The open calendar's dialog: the surface takes the calendar's id with this suffix.
          aria-controls={
            host && calendar && host.open
              ? `${host.calendarId}-dialog`
              : undefined
          }
          value={host ? host.text(slot) : own}
          onChange={(e) => {
            if (norm.disabled || readOnly) return;
            if (host) host.onChange(slot, e);
            else setOwn(e.target.value);
            onChange?.(e);
          }}
          onClick={(e) => {
            if (norm.disabled) return;
            host?.onClick(slot, e);
            onClick?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (!e.defaultPrevented) host?.onKeyDown(slot, e);
          }}
          onFocus={(e) => {
            setFocus(pointerDown.current ? 'pointer' : 'keyboard');
            pointerDown.current = false;
            late.onFocus();
            onFocus?.(e);
            host?.onFocus(slot, e);
          }}
          onBlur={(e) => {
            setFocus(null);
            late.onBlur();
            onBlur?.(e);
            host?.onBlur(slot, e);
          }}
        />
        <span className="cds-text-input__trail">
          <span className="cds-text-input__mark-slot">
            <FieldStatusMark status={shown} />
          </span>
          {deco ? (
            <span className="cds-text-input__decorator">{deco}</span>
          ) : null}
          {calendar && (
            <span className="cds-date-picker-input__icon">
              <CalendarIcon size={iconPx} aria-hidden="true" />
            </span>
          )}
        </span>
      </div>
    </FieldFrame>
  );
});
DatePickerInput.displayName = 'DatePickerInput';
