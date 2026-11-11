/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  createElement,
  forwardRef,
  isValidElement,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { ChevronDown } from '@carbon-labs/react-motion-icons';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { Scroller } from '@carbon-labs/react-scroller';
import { FieldMessage } from '@carbon-labs/react-text-input';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import './select.scss';
import {
  iconSizeFor,
  type FieldFrame,
  type FieldVariant,
} from '@carbon-labs/react-props';
import { exitPullbackStyle } from '@carbon-labs/react-snap';
import { FIELD_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { useAiFill, type FieldAiProps } from '@carbon-labs/react-text-input';

/* ============================================================================
 * Select — Carbon v11's Select (a native `<select>`, styled) on the kit's
 * text field.
 * ============================================================================
 *
 * v11's props: `id`, `labelText` (default "Select"), `hideLabel`, `noLabel`,
 * `helperText`, `inline`, `size` (xs 24 · sm 32 · md 40 · lg 48), `disabled`,
 * `readOnly`, `invalid` + `invalidText`, `warn` + `warnText` (v11's
 * normalization: read-only beats both, disabled beats both, invalid beats
 * warn), `decorator` / `slug`, `light` (deprecated), `onChange`, and every
 * native select attribute on the `<select>` (`value`, `defaultValue`,
 * `name`, `required` …); `className` is on the wrapper, the ref is the
 * `<select>`. The `title` follows the chosen option's text, as in v11.
 * Read-only takes focus but never opens: the press and ↑ ↓ Space are held
 * (v11). The options are `SelectItem` and `SelectItemGroup` (v11's).
 *
 * The kit adds:
 *
 *   field     the text input's: the quiet fill, the hairline's ladder
 *             (hover a step, press 2px, focus the accent at 2px), the
 *             error's border settling in once, the status mark and the one
 *             message line in the form's gap. The native select fills the
 *             field, so a press anywhere on it opens the list
 *   chevron   motion-icons' ChevronDown; the field is its
 *             `data-motion-icon-frame`, so it plays on the field's hover
 *   list      where the browser lets the page style it (customizable
 *             select), the Dropdown's list, snapping open on the floating
 *             surface's clocks in CSS; elsewhere the platform's own
 *   inline    the label beside a quiet field (no fill and no hairline until
 *             hover), the message beside it, as v11's inline Select
 *   status    a choice is a single act, not typing, so a status shows at once
 * ========================================================================== */

export type SelectSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, FieldAiProps {
  /** The `<select>`'s id; the message ids derive from it (v11). */
  id: string;
  children?: ReactNode;
  /** Classes on the wrapper (v11). */
  className?: string;
  /** v11's experimental decorator (an AILabel …), at the field's trailing edge. */
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. Accepted. */
  slug?: ReactNode;
  disabled?: boolean;
  helperText?: ReactNode;
  hideLabel?: boolean;
  /** The label beside a quiet field (v11). */
  inline?: boolean;
  invalid?: boolean;
  invalidText?: ReactNode;
  /** The label. Default "Select" (v11). */
  labelText?: ReactNode;
  /** @deprecated v11: `<Layer>` instead. `$field-02`. */
  light?: boolean;
  /** No label at all (v11: for Pagination, which renders its own). */
  noLabel?: boolean;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  readOnly?: boolean;
  /** Default `md` (40px). */
  size?: SelectSize;
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
  /** Where the message line sits: `gap` (default) in the form's 32px gap, or `flow` in the layout. */
  messagePlacement?: 'gap' | 'flow';
  /** The status mark plays its motion-icon once as it arrives. Default false. */
  statusBeat?: boolean;
}

type ItemElement = ReactElement<{ value?: unknown; text?: unknown }>;

/**
 * Customizable select (`appearance: base-select`): the browser draws the list
 * in the page, and select.scss gives it the Dropdown's look. Where it's
 * supported, the select also carries its own in-page button, whose
 * `<selectedcontent>` (the chosen option's text) ellipsizes at the field's
 * trailing edge; elsewhere nothing extra is rendered and the platform's
 * list opens.
 */
const CUSTOMIZABLE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('appearance', 'base-select');

/** The shown option's text: what the AI fill's swap moves. */
const optionText = (el: HTMLElement) => {
  const s = el as HTMLSelectElement;
  return s.options[s.selectedIndex]?.text ?? '';
};

/** v11: the title starts as the chosen item's text (by `value` / `defaultValue`), else the first item's. */
function initialTitle(
  children: ReactNode,
  title: unknown,
  selected: unknown
): string {
  if (typeof title === 'string' && title) return title;
  const items = Children.toArray(children).filter(
    isValidElement
  ) as ItemElement[];
  const chosen = items.find((c) => c.props?.value === selected);
  const text = chosen?.props?.text ?? items[0]?.props?.text;
  return typeof text === 'string' ? text : '';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      children,
      className,
      decorator,
      slug,
      disabled: ownDisabled = false,
      helperText,
      hideLabel = false,
      inline = false,
      invalid = false,
      invalidText = '',
      labelText = 'Select',
      light = false,
      noLabel = false,
      onChange,
      readOnly: ownReadOnly = false,
      size: sizeProp,
      warn = false,
      warnText,
      corners: cornersProp,
      frame = 'inset',
      variant: variantProp,
      messagePlacement = 'gap',
      statusBeat = false,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      onFocus,
      onBlur,
      onMouseDown,
      onKeyDown,
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
      { size: sizeProp, corners: cornersProp, variant: variantProp },
      FIELD_KIT
    );
    const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
    // A choice is one act, not typing: a status shows at once.
    const late = useLateStatus(norm.status, { late: false });
    const shown = late.shown;

    const selectRef = useRef<HTMLSelectElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(() =>
      initialTitle(children, rest.title, rest.value ?? rest.defaultValue)
    );

    // Focus: by the pointer (a press on the field) or not (Tab, or the app).
    const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
    const pointerDown = useRef(false);

    // The AI fill: the swap runs over the shown option's text.
    const ai = useAiFill({
      id,
      aiState,
      aiSuggestion,
      onRevert,
      aiText,
      controlRef: selectRef,
      fieldRef,
      readValue: optionText,
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

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
      setTitle(e.target.options[e.target.selectedIndex]?.text ?? '');
    };
    // Where the browser draws the list in the page (customizable select), focus
    // moves into its options while it's open and back to the select as it
    // closes: a move inside the select is no change of the field's focus.
    const within = (e: FocusEvent<HTMLSelectElement>) =>
      e.relatedTarget instanceof Node &&
      e.currentTarget.contains(e.relatedTarget);
    const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
      if (within(e)) return;
      setFocus(pointerDown.current ? 'pointer' : 'keyboard');
      pointerDown.current = false;
      late.onFocus();
      onFocus?.(e);
    };
    const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
      if (within(e)) return;
      setFocus(null);
      late.onBlur();
      onBlur?.(e);
    };
    // v11: read-only takes focus but never opens.
    const handleMouseDown = (e: MouseEvent<HTMLSelectElement>) => {
      if (readOnly) {
        e.preventDefault();
        e.currentTarget.focus();
      }
      onMouseDown?.(e);
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLSelectElement>) => {
      if (readOnly && ['ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(e.key))
        e.preventDefault();
      onKeyDown?.(e);
    };
    const onFieldPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      const sel = selectRef.current;
      if (!sel) return;
      // The revert is a button of its own: a press on it is no press on the field.
      if ((e.target as Element).closest('.cds-field-ai-revert')) return;
      // A press on an option in the open list is a pick, not a press on the field.
      if (e.target !== sel && sel.contains(e.target as Node)) return;
      if (document.activeElement !== sel) pointerDown.current = true;
      else {
        // A press on the focused field holds its selected edge (the press never steps it down).
        const field = e.currentTarget;
        holdUntilRelease(field);
      }
    };

    const label =
      noLabel ||
      labelText === undefined ||
      labelText === null ||
      labelText === '' ? null : (
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
            {labelText}
          </label>
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
    const iconPx = iconSizeFor(size);

    const classes = [
      'cds-text-input',
      `cds-text-input--${size}`,
      'cds-select',
      inline && 'cds-select--inline',
      readOnly && 'cds-text-input--readonly',
      norm.disabled && 'cds-text-input--disabled',
      light && 'cds-text-input--light',
      corners === 'square' && 'cds-text-input--square',
      corners === 'full' && 'cds-text-input--full',
      frame === 'ghost' && 'cds-text-input--ghost',
      variant === 'hero' && 'cds-text-input--primary',
      deco && 'cds-select--decorated',
      ai.reserved && 'cds-select--revertible',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={classes}
        style={exitPullbackStyle}
        data-status={shown}
        data-ai-state={aiState}>
        {inline && label ? (
          <div className="cds-text-input__inline-label">{label}</div>
        ) : (
          label
        )}
        <div className="cds-text-input__outer">
          <div
            ref={fieldRef}
            className="cds-text-input__field cds-select__field"
            data-focus={focus ?? undefined}
            data-motion-icon-frame=""
            onPointerDown={onFieldPointerDown}>
            <select
              {...rest}
              {...aria}
              ref={mergeRefs<HTMLSelectElement>(selectRef, ref as never)}
              id={id}
              className="cds-select__input"
              disabled={norm.disabled || undefined}
              aria-readonly={readOnly || undefined}
              title={title}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onMouseDown={handleMouseDown}
              onKeyDown={handleKeyDown}>
              {CUSTOMIZABLE && (
                <button type="button" className="cds-select__value">
                  {createElement('selectedcontent')}
                </button>
              )}
              {CUSTOMIZABLE ? (
                /* The list scrolls in the kit's Scroller, not the picker: its
                 pill, and the soft edge content leaves into as it scrolls
                 (the picker never scrolls itself: a mask on it would take
                 its frame too). Customizable
                 select keeps options inside a `<div>` as the select's own;
                 the keys still move through them and scroll this. Not a tab
                 stop: focus is on the options. */
                <Scroller
                  className="cds-select__scroller"
                  viewportClassName="cds-select__list"
                  focusable={false}>
                  {children}
                </Scroller>
              ) : (
                children
              )}
            </select>
            <span className="cds-text-input__trail cds-select__trail">
              <span className="cds-text-input__mark-slot">
                <FieldStatusMark status={shown} beat={statusBeat} />
              </span>
              {ai.revert}
              {deco ? (
                <span className="cds-text-input__decorator cds-select__decorator">
                  {deco}
                </span>
              ) : null}
              <span className="cds-select__chevron" aria-hidden="true">
                <ChevronDown size={iconPx} />
              </span>
            </span>
            {ai.note}
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
Select.displayName = 'Select';

export interface SelectItemProps extends OptionHTMLAttributes<HTMLOptionElement> {
  /** The option's value. Default "" (v11). */
  value?: string | number;
  /** The option's text. Default "" (v11). */
  text?: string;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

/** v11's SelectItem: one `<option>`. */
export function SelectItem({
  className,
  value = '',
  disabled = false,
  hidden = false,
  text = '',
  ...rest
}: SelectItemProps) {
  return (
    <option
      {...rest}
      className={['cds-select__option', className].filter(Boolean).join(' ')}
      value={value}
      disabled={disabled}
      hidden={hidden}>
      {text}
    </option>
  );
}

export interface SelectItemGroupProps extends OptgroupHTMLAttributes<HTMLOptGroupElement> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /** The group's heading. */
  label: string;
}

/** v11's SelectItemGroup: one `<optgroup>`. */
export function SelectItemGroup({
  children,
  className,
  disabled = false,
  label,
  ...rest
}: SelectItemGroupProps) {
  return (
    <optgroup
      className={['cds-select__optgroup', className].filter(Boolean).join(' ')}
      label={label}
      disabled={disabled}
      {...rest}>
      {children}
    </optgroup>
  );
}
