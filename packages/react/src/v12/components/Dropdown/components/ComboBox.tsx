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
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDownToggle, Close } from '@carbon-labs/react-motion-icons';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
  FIELD_TIMING,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { rovingKey } from '@carbon-labs/react-selection-kit';
import { IconButton, mergeRefs } from '@carbon-labs/react-tooltip';
import { CONTROL_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import {
  iconSizeFor,
  type FieldFrame as FieldFrameKind,
} from '@carbon-labs/react-props';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import {
  FieldFrame,
  defaultItemToString,
  indexOfItem,
  isItemDisabled,
  type ListboxSize,
} from './FieldFrame';
import {
  ListboxSurface,
  optionId,
  useTypingBurst,
  type ListboxActive,
  type ListboxOption,
} from './ListboxSurface';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { useAiFill, type FieldAiProps } from '@carbon-labs/react-text-input';

/* ============================================================================
 * ComboBox — Carbon v11's ComboBox: a Dropdown you can type into, the list
 * filtered as you type.
 * ============================================================================
 *
 * v11's props: the Dropdown's (`id`, `items`, `itemToString`,
 * `itemToElement`, `selectedItem` / `initialSelectedItem`, `onChange`,
 * `titleText`, `helperText`, `invalid`, `warn`, `size`, `disabled`,
 * `readOnly`, `direction`, `aria-label`), and `placeholder`,
 * `shouldFilterItem`, `allowCustomValue`, `onInputChange`, `onToggleClick`,
 * `inputProps`, `typeahead` (prefix filtering); native input attributes go
 * on the `<input>` (the ref). `light`, `autoAlign`, `downshiftProps`,
 * `downshiftActions`, `translateWithId`, `decorator` / `slug` are accepted.
 *
 * ARIA: the WAI-ARIA combobox with a listbox popup and list autocomplete —
 * the `input` is the `combobox` (`aria-autocomplete="list"`,
 * `aria-expanded`, `aria-controls`, `aria-activedescendant`); focus stays in
 * it. The clear button and the chevron are off the tab order (v11).
 *
 * Keys: typing opens and filters, the first match active; ↓ / ↑ open, then
 * move (no wrap); Alt ↓ opens with nothing active, Alt ↑ closes; Enter
 * chooses (with `allowCustomValue` and nothing active, it keeps what was
 * typed); Escape closes, and on a closed field clears it; Home / End stay
 * the caret's. Leaving the field settles it: an exact match is chosen, a
 * custom value kept when allowed, otherwise the text goes back to the choice.
 *
 * The kit adds the Dropdown's field and list; the list's content changes as
 * you type out then in (ListboxSurface); `emptyText` when nothing matches;
 * a filter by default (below); errors arrive late, as the text input's.
 * ========================================================================== */

export interface ComboBoxProps<Item>
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'id' | 'onChange' | 'onClick' | 'type' | 'size' | 'placeholder'
    >,
    FieldAiProps {
  id: string;
  items: Item[];
  itemToString?: (item: Item | null) => string;
  itemToElement?: ((item: Item) => ReactNode) | null;
  /** Controlled (`null`: nothing chosen). */
  selectedItem?: Item | null;
  initialSelectedItem?: Item | null;
  /** A choice, a clear, or (with `allowCustomValue`) a typed value: `{ selectedItem: null, inputValue }`. */
  onChange?: (data: {
    selectedItem: Item | null;
    inputValue?: string | null;
  }) => void;
  /** Every change of the input's text. */
  onInputChange?: (inputText: string) => void;
  /** The chevron was clicked. */
  onToggleClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Whether an item stays in the list for the typed text. Default: its string
   * contains the text, ignoring case (v11's default keeps every item; pass
   * `() => true` for that).
   */
  shouldFilterItem?: (input: {
    item: Item;
    itemToString?: (item: Item | null) => string;
    inputValue: string | null;
  }) => boolean;
  /** Keep text that matches no item (`onChange({ selectedItem: null, inputValue })`). */
  allowCustomValue?: boolean;
  placeholder?: string;
  titleText?: ReactNode;
  hideLabel?: boolean;
  helperText?: ReactNode;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** Default `md` (40px). */
  size?: ListboxSize;
  disabled?: boolean;
  readOnly?: boolean;
  /** Default `bottom`; it flips when there's no room. */
  direction?: 'top' | 'bottom';
  /** The input's name when there's no `titleText`. v11's default: "Choose an item". */
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  /** Attributes for the `<input>`, over the component's own (v11). */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /** v11 (experimental): items filter by prefix. */
  typeahead?: boolean;
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  /** v11: accepted; the list always flips and stays in the viewport. */
  autoAlign?: boolean;
  /** v11: accepted, ignored (there's no Downshift here). */
  downshiftProps?: unknown;
  /** v11: accepted, ignored. */
  downshiftActions?: unknown;
  /** v11: the clear button's name ('clear.selection') and the chevron's ('open.menu' / 'close.menu'). */
  translateWithId?: (id: string) => string;
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. */
  slug?: ReactNode;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

  /** Shown in the list when nothing matches. Default "No results found"; `null` for an empty list. */
  emptyText?: ReactNode;
  /** Errors arrive late while typing (the text input's rule). Default true. */
  lateErrors?: boolean;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  corners?: 'full' | 'rounded' | 'square';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrameKind;
  /** The list's cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion for the list (a lab dial). Default 1. */
  timeScale?: number;
}

const TRANSLATIONS: Record<string, string> = {
  'clear.selection': 'Clear selected item',
  'open.menu': 'Open',
  'close.menu': 'Close',
};

const PAGE = 10;

function ComboBoxInner<Item>(
  {
    id,
    items,
    itemToString = defaultItemToString as (item: Item | null) => string,
    itemToElement = null,
    selectedItem: selectedItemProp,
    initialSelectedItem,
    onChange,
    onInputChange,
    onToggleClick,
    shouldFilterItem,
    allowCustomValue = false,
    placeholder,
    titleText,
    hideLabel = false,
    helperText,
    invalid = false,
    invalidText,
    warn = false,
    warnText,
    size: sizeProp,
    disabled: ownDisabled = false,
    readOnly: ownReadOnly = false,
    direction = 'bottom',
    'aria-label': ariaLabelProp = 'Choose an item',
    ariaLabel: deprecatedAriaLabel,
    inputProps,
    typeahead = false,
    light: _light,
    autoAlign: _autoAlign,
    downshiftProps: _downshiftProps,
    downshiftActions: _downshiftActions,
    translateWithId,
    decorator,
    slug,
    emptyText = 'No results found',
    lateErrors = true,
    corners: cornersProp,
    frame = 'inset',
    shadow,
    timeScale,
    aiState,
    aiSuggestion,
    onRevert,
    aiText,
    className,
    style,
    ...inputRest
  }: ComboBoxProps<Item>,
  ref: Ref<HTMLInputElement>
) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  // KitDefaults: the provider's size and corners for the props not given.
  const { size = 'md', corners } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const t = (key: string) => translateWithId?.(key) ?? TRANSLATIONS[key]!;
  const listId = `${id}__menu`;
  const labelId = `${id}-label`;
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMemo(
    () => mergeRefs<HTMLInputElement>(inputRef, ref),
    [ref]
  );
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useMemo(
    () => mergeRefs<HTMLDivElement>(setField, fieldRef),
    []
  );

  /* ── the choice and the text ───────────────────────────────────────── */

  const controlled = selectedItemProp !== undefined;
  const [own, setOwn] = useState<Item | null>(initialSelectedItem ?? null);
  const selected = controlled ? selectedItemProp : own;
  const chosen = indexOfItem(items, selected, itemToString);
  const textOf = (i: number) =>
    i >= 0 && items[i] !== undefined ? itemToString(items[i]!) : '';

  const [inputValue, setInputValue] = useState(() =>
    selected != null ? itemToString(selected) : ''
  );
  /** The text was typed since the last settle: the list is filtered by it. */
  const [typed, setTyped] = useState(false);
  // A new controlled choice from outside: the text follows it.
  const [seen, setSeen] = useState(selectedItemProp);
  if (controlled && seen !== selectedItemProp) {
    setSeen(selectedItemProp);
    setInputValue(
      selectedItemProp != null ? itemToString(selectedItemProp) : ''
    );
    setTyped(false);
  }
  const lastInput = useRef(inputValue);
  useEffect(() => {
    if (lastInput.current === inputValue) return;
    lastInput.current = inputValue;
    onInputChange?.(inputValue);
  }, [inputValue, onInputChange]);

  const filterItem =
    shouldFilterItem ??
    (({ item, inputValue: v }: { item: Item; inputValue: string | null }) =>
      !v || itemToString(item).toLowerCase().includes(v.toLowerCase()));
  const keepFor = (value: string, filtering: boolean) =>
    items
      .map((item, i) => [item, i] as const)
      .filter(
        ([item]) =>
          !filtering ||
          (typeahead
            ? !value ||
              itemToString(item).toLowerCase().startsWith(value.toLowerCase())
            : filterItem({ item, itemToString, inputValue: value || null }))
      )
      .map(([, i]) => i);
  const shownIdx = keepFor(inputValue, typed);
  const options: ListboxOption[] = shownIdx.map((i) => ({
    key: String(i),
    label: itemToString(items[i]!),
    content: itemToElement ? itemToElement(items[i]!) : undefined,
    disabled: isItemDisabled(items[i]),
    selected: i === chosen,
  }));
  const isDisabled = (j: number) => !!options[j]?.disabled;
  const step = (key: string, from: number) =>
    rovingKey(key, from, {
      orientation: 'vertical',
      wrap: false,
      count: options.length,
      isDisabled,
    });
  const first = () => step('Home', -1) ?? -1;
  const last = () => step('End', -1) ?? -1;

  /* ── open / closed ─────────────────────────────────────────────────── */

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ListboxActive>({
    index: -1,
    how: 'open',
  });
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const press = useRef<{ x: number; y: number } | null>(null);

  const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
  const interactive = !norm.disabled && !readOnly;
  const late = useLateStatus(norm.status, {
    late: lateErrors,
    pauseMs: FIELD_TIMING.typingPauseMs,
  });
  const shown = late.shown;

  /** The chosen option's place in the list (else -1). */
  const chosenAt = () => options.findIndex((o) => o.key === String(chosen));
  const show = (index: number, from: { x: number; y: number } | null) => {
    setOrigin(from);
    setActive({ index, how: 'open' });
    setOpen(true);
  };

  const commit = (i: number) => {
    setInputValue(textOf(i));
    setTyped(false);
    const item = i >= 0 ? items[i]! : null;
    if (i === chosen) return;
    if (!controlled) setOwn(item);
    onChange?.({ selectedItem: item });
  };
  const lastCustom = useRef('');
  const commitCustom = (text: string) => {
    setTyped(false);
    if (chosen < 0 && lastCustom.current === text) return;
    lastCustom.current = text;
    if (!controlled) setOwn(null);
    onChange?.({ selectedItem: null, inputValue: text });
  };
  /** Leaving the field (blur, Escape, the chevron): an exact match is chosen, else the text is kept or put back. */
  const settle = () => {
    if (!typed) return;
    const text = inputValue.trim().toLowerCase();
    const exact = items.findIndex(
      (item) =>
        !isItemDisabled(item) && itemToString(item).toLowerCase() === text
    );
    if (exact >= 0) commit(exact);
    else if (!inputValue) commit(-1);
    else if (allowCustomValue) commitCustom(inputValue);
    else {
      setInputValue(textOf(chosen));
      setTyped(false);
    }
  };
  const close = () => {
    setOpen(false);
    settle();
  };
  const choose = (j: number) => {
    const o = options[j];
    if (!o || o.disabled) return;
    setOpen(false);
    commit(Number(o.key));
  };

  /* ── typing ────────────────────────────────────────────────────────── */

  // Keys in a burst change the list at once (ListboxSurface, `typing`).
  const burst = useTypingBurst();
  const onType = (value: string, at: number) => {
    if (!interactive) return;
    late.onInput();
    burst.typed(at);
    setInputValue(value);
    setTyped(true);
    // The first match is active, so Enter takes it (v11's findHighlightedIndex);
    // with custom values allowed nothing is, so Enter keeps what was typed.
    const keep = keepFor(value, true);
    const q = value.toLowerCase();
    const match =
      !value || allowCustomValue
        ? -1
        : keep.findIndex(
            (i) =>
              !isItemDisabled(items[i]) &&
              itemToString(items[i]!).toLowerCase().includes(q)
          );
    if (!open) show(match, null);
    else setActive({ index: match, how: 'filter' });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    inputProps?.onKeyDown?.(e);
    inputRest.onKeyDown?.(e);
    // Every key of an input method's composition is its own: none picks or moves.
    if (!interactive || e.defaultPrevented || isComposing(e)) return;
    const cur = active.index;
    const move = (index: number) =>
      setActive({ index, how: e.repeat ? 'repeat' : 'key' });
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          const at = chosenAt();
          show(e.altKey ? -1 : at >= 0 ? at : first(), null);
        } else if (!e.altKey) {
          const n = cur < 0 ? first() : step('ArrowDown', cur);
          if (n != null && n >= 0) move(n);
        }
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) {
          if (open) close();
          return;
        }
        if (!open) {
          const at = chosenAt();
          show(at >= 0 ? at : last(), null);
        } else {
          const n = cur < 0 ? last() : step('ArrowUp', cur);
          if (n != null && n >= 0) move(n);
        }
        return;
      case 'PageDown':
      case 'PageUp': {
        if (!open) return;
        e.preventDefault();
        const dir = e.key === 'PageDown' ? 1 : -1;
        let i = cur < 0 ? (dir === 1 ? -1 : options.length) : cur;
        for (let k = 0; k < PAGE; k++) {
          const n = step(dir === 1 ? 'ArrowDown' : 'ArrowUp', i);
          if (n == null || n === i) break;
          i = n;
        }
        if (i >= 0 && i < options.length) move(i);
        return;
      }
      case 'Enter':
        if (open) {
          e.preventDefault();
          if (cur >= 0) choose(cur);
          else if (allowCustomValue) {
            setOpen(false);
            if (inputValue) commitCustom(inputValue);
            else commit(-1);
          }
        } else if (!inputValue) {
          e.preventDefault();
          show(chosenAt(), null);
        }
        return;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        } else if (inputValue || chosen >= 0) {
          e.preventDefault();
          e.stopPropagation();
          lastCustom.current = '';
          commit(-1);
        }
        return;
    }
  };

  /* ── render ────────────────────────────────────────────────────────── */

  const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
  const pointerDown = useRef(false);
  // The AI fill, over the input's text.
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
      [inputRest['aria-describedby'], ai.describedBy]
        .filter(Boolean)
        .join(' ') || undefined,
  });
  const hasTitle =
    titleText !== undefined && titleText !== null && titleText !== '';
  const deco = slug ?? decorator;
  const iconPx = iconSizeFor(size);
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    onToggleClick?.(e);
    if (!interactive) return;
    inputRef.current?.focus();
    if (open) close();
    else show(chosenAt(), { x: e.clientX, y: e.clientY });
  };

  return (
    <FieldFrame
      id={id}
      labelId={labelId}
      labelFor
      titleText={titleText}
      hideLabel={hideLabel}
      helperText={ai.helperText}
      warnText={warnText}
      invalidText={invalidText}
      shown={shown}
      norm={norm}
      size={size}
      readOnly={readOnly}
      corners={corners}
      frame={frame}
      className={className}
      variantClass="cds-combo-box"
      rest={{ style, 'data-ai-state': aiState }}>
      <div
        ref={fieldRefs}
        className="cds-text-input__field"
        data-focus={focus ?? undefined}
        onPointerDown={(e) => {
          press.current = { x: e.clientX, y: e.clientY };
          if (
            e.target === inputRef.current &&
            document.activeElement !== inputRef.current
          )
            pointerDown.current = true;
          const el = e.currentTarget;
          if (document.activeElement === inputRef.current) {
            holdUntilRelease(el);
          }
        }}
        onMouseDown={(e) => {
          // A press in the field off the input (its padding, the mark, the
          // buttons) keeps or puts the caret in it.
          const t = e.target as Element;
          if (t === inputRef.current || norm.disabled) return;
          e.preventDefault();
          if (document.activeElement !== inputRef.current) {
            pointerDown.current = true;
            inputRef.current?.focus();
          }
        }}>
        <input
          title={inputValue || placeholder}
          {...inputRest}
          {...aria}
          ref={mergedRef}
          id={id}
          type="text"
          className="cds-text-input__input"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            open && options[active.index]
              ? optionId(listId, options[active.index]!.key)
              : undefined
          }
          aria-label={
            hasTitle ? undefined : (deprecatedAriaLabel ?? ariaLabelProp)
          }
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          disabled={norm.disabled}
          readOnly={readOnly}
          {...inputProps}
          onChange={(e) => {
            inputProps?.onChange?.(e);
            onType(e.target.value, e.timeStamp);
          }}
          onClick={(e) => {
            inputProps?.onClick?.(e);
            if (!interactive) return;
            // v11: a click in the input toggles the list.
            if (open) close();
            else
              show(chosenAt(), press.current ?? { x: e.clientX, y: e.clientY });
          }}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            setFocus(pointerDown.current ? 'pointer' : 'keyboard');
            pointerDown.current = false;
            late.onFocus();
            inputRest.onFocus?.(e);
            inputProps?.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(null);
            close();
            late.onBlur();
            inputRest.onBlur?.(e);
            inputProps?.onBlur?.(e);
          }}
        />
        <span className="cds-text-input__trail">
          <span className="cds-text-input__mark-slot">
            <FieldStatusMark status={shown} />
          </span>
          {ai.revert}
          {deco ? (
            <span className="cds-text-input__decorator">{deco}</span>
          ) : null}
          {inputValue && interactive ? (
            <IconButton
              className="cds-text-input__toggle cds-combo-box__clear"
              frame="ghost"
              size={size === 'lg' ? 'lg' : 'md'}
              label={t('clear.selection')}
              align="top"
              tabIndex={-1}
              onClick={() => {
                lastCustom.current = '';
                setOpen(false);
                commit(-1);
                inputRef.current?.focus();
              }}>
              <Close size={iconPx} />
            </IconButton>
          ) : null}
          <button
            type="button"
            className="cds-combo-box__toggle"
            tabIndex={-1}
            aria-label={open ? t('close.menu') : t('open.menu')}
            disabled={norm.disabled}
            onClick={toggle}
            data-motion-icon-frame="">
            <ChevronDownToggle
              size={iconPx}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </button>
        </span>
        {ai.note}
      </div>
      <ListboxSurface
        corners={corners === 'full' ? 'full' : undefined}
        id={listId}
        open={open}
        anchor={field}
        labelledBy={hasTitle ? labelId : undefined}
        label={deprecatedAriaLabel ?? ariaLabelProp}
        options={options}
        active={active}
        onHover={(index) => setActive({ index, how: 'pointer' })}
        onPick={choose}
        size={size}
        direction={direction}
        origin={origin}
        emptyText={emptyText}
        shadow={shadow}
        typing={burst.burst}
        timeScale={timeScale}
      />
    </FieldFrame>
  );
}

/** v11's ComboBox, on the kit's text field and the selection family's list. The ref is the input. */
export const ComboBox = forwardRef(ComboBoxInner) as <Item>(
  props: ComboBoxProps<Item> & { ref?: Ref<HTMLInputElement> }
) => ReactElement | null;
(ComboBox as { displayName?: string }).displayName = 'ComboBox';
