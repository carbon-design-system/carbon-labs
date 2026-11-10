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
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { rovingKey, useLatest } from '@carbon-labs/react-selection-kit';
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
  type ListboxSize,
} from './FieldFrame';
import {
  ListboxSurface,
  optionId,
  useTypingBurst,
  type ListboxActive,
} from './ListboxSurface';
import {
  CountTag,
  MULTI_TRANSLATIONS,
  defaultCompareItems,
  defaultSortItems,
  isSelectAllItem,
  sortedOptions,
  useMultiSelection,
  type CompareItems,
  type SelectionFeedback,
  type SortItemsOptions,
  useFeedbackOrder,
} from './multiSelection';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * FilterableMultiSelect — Carbon v11's FilterableMultiSelect: the
 * MultiSelect's list under the ComboBox's field, filtered as you type.
 * ============================================================================
 *
 * v11's props: the MultiSelect's (`id`, `items`, `itemToString`,
 * `itemToElement`, `selectedItems` / `initialSelectedItems`, `onChange`,
 * `onMenuChange`, `open`, `selectionFeedback`, `sortItems`,
 * `compareItems`, `locale`, a select-all item, `titleText`, `hideLabel`,
 * `helperText`, `invalid`, `warn`, `size`, `disabled`, `readOnly`,
 * `direction`, `clearSelectionText`, `clearSelectionDescription`,
 * `translateWithId`), and `placeholder`, `filterItems`,
 * `onInputValueChange`, `inputProps`, `aria-label`. The `id` and the ref
 * are the input's.
 *
 * ARIA: the ComboBox's (`aria-autocomplete="list"`, focus stays in the
 * input), its listbox `aria-multiselectable`.
 *
 * Keys: typing opens and filters, the first match active; ↓ / ↑ open, then
 * move; Enter toggles the active option (the list stays open), and on a
 * closed field opens it; Escape closes the list and clears the text, and on
 * a closed field clears the choice too (so does Delete in an empty field);
 * Tab closes; Home / End stay the caret's. Leaving the field closes the list
 * and clears the text (v11).
 *
 * The kit adds the ComboBox's field and filter (out, one layout move, in; a
 * burst of keys lands at once); the MultiSelect's check column, count tag
 * and reorders; "No results found" when nothing matches.
 * ========================================================================== */

export interface FilterableMultiSelectProps<Item> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'onChange' | 'type' | 'size' | 'placeholder'
> {
  id: string;
  items: Item[];
  itemToString?: (item: Item | null) => string;
  itemToElement?: ((item: Item) => ReactNode) | null;
  /** Controlled. */
  selectedItems?: Item[];
  initialSelectedItems?: Item[];
  onChange?: (data: { selectedItems: Item[] }) => void;
  onMenuChange?: (open: boolean) => void;
  open?: boolean;
  /** Default `top-after-reopen`. */
  selectionFeedback?: SelectionFeedback;
  sortItems?: (
    items: readonly Item[],
    options: SortItemsOptions<Item>
  ) => Item[];
  compareItems?: CompareItems;
  locale?: string;
  /** The items shown for the typed text (v11). Default: the item's string contains it, ignoring case. */
  filterItems?: (
    items: readonly Item[],
    extra: {
      inputValue: string | null;
      itemToString: (item: Item | null) => string;
    }
  ) => Item[];
  /** Every change of the input's text (v11: Downshift's `{ inputValue }`). */
  onInputValueChange?: (changes: { inputValue: string }) => void;
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
  direction?: 'top' | 'bottom';
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  clearSelectionText?: string;
  clearSelectionDescription?: string;
  /** Announced when the choice is cleared. Default "all items have been cleared". */
  clearAnnouncement?: string;
  translateWithId?: (id: string) => string;
  /** Attributes for the `<input>`, over the component's own (v11). */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /** v11: accepted (an inline FilterableMultiSelect isn't drawn differently). */
  type?: 'default' | 'inline';
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  autoAlign?: boolean;
  downshiftProps?: unknown;
  useTitleInItem?: boolean;
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. */
  slug?: ReactNode;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

  /** Shown in the list when nothing matches. Default "No results found"; `null` for an empty list. */
  emptyText?: ReactNode;
  corners?: 'full' | 'rounded' | 'square';
  /** `inset` (default) its fill and hairline; `ghost` neither at rest, for a field a header or toolbar frames. */
  frame?: FieldFrameKind;
  shadow?: SurfaceShadowOption;
  timeScale?: number;
}

const PAGE = 10;

/** v11's `defaultFilterItems`. */
function defaultFilterItems<Item>(
  items: readonly Item[],
  {
    inputValue,
    itemToString,
  }: { inputValue: string | null; itemToString: (item: Item | null) => string }
): Item[] {
  if (!inputValue) return [...items];
  const q = inputValue.toLowerCase();
  return items.filter((item) => itemToString(item).toLowerCase().includes(q));
}

function FilterableMultiSelectInner<Item>(
  {
    id,
    items,
    itemToString = defaultItemToString as (item: Item | null) => string,
    itemToElement = null,
    selectedItems,
    initialSelectedItems,
    onChange,
    onMenuChange,
    open: openProp,
    selectionFeedback = 'top-after-reopen',
    sortItems = defaultSortItems,
    compareItems = defaultCompareItems,
    locale = 'en',
    filterItems = defaultFilterItems,
    onInputValueChange,
    placeholder,
    titleText,
    hideLabel = false,
    helperText,
    invalid = false,
    invalidText,
    warn = false,
    warnText,
    size: sizeProp,
    disabled = false,
    readOnly = false,
    direction = 'bottom',
    'aria-label': ariaLabelProp = 'Choose an item',
    ariaLabel: deprecatedAriaLabel,
    clearSelectionText = 'To clear selection, press Delete or Backspace',
    clearSelectionDescription = 'Total items selected: ',
    clearAnnouncement = 'all items have been cleared',
    translateWithId,
    inputProps,
    type: _type,
    light: _light,
    autoAlign: _autoAlign,
    downshiftProps: _downshiftProps,
    useTitleInItem: _useTitleInItem,
    decorator,
    slug,
    emptyText = 'No results found',
    corners: cornersProp,
    frame = 'inset',
    shadow,
    timeScale,
    className,
    style,
    ...inputRest
  }: FilterableMultiSelectProps<Item>,
  ref: Ref<HTMLInputElement>
) {
  // KitDefaults: the provider's size and corners for the props not given.
  const { size = 'md', corners } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const t = (key: string) => translateWithId?.(key) ?? MULTI_TRANSLATIONS[key]!;
  const listId = `${id}__menu`;
  const labelId = `${id}-label`;
  const countId = `${id}-selection`;
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMemo(
    () => mergeRefs<HTMLInputElement>(inputRef, ref),
    [ref]
  );
  const [field, setField] = useState<HTMLDivElement | null>(null);

  /* ── the choice, the text and the order ────────────────────────────── */

  const sel = useMultiSelection({
    items,
    itemToString,
    selectedItems,
    initialSelectedItems,
    onChange,
  });
  const [inputValue, setInputValue] = useState('');
  const textChange = useLatest(onInputValueChange);
  const lastInput = useRef(inputValue);
  useEffect(() => {
    if (lastInput.current === inputValue) return;
    lastInput.current = inputValue;
    textChange.current?.({ inputValue });
  }, [inputValue, textChange]);

  const [open, setOpen] = useState(!!openProp);
  // What sorts on top: `top-after-reopen` holds the order taken as the list
  // opened; `top` holds a pointer's pick in place until the pointer leaves it.
  const placing = useFeedbackOrder(selectionFeedback, open, sel.selected);
  const { top } = placing;
  const sortWith = (value: string, onTop = top) =>
    sortedOptions(
      filterItems(items, { inputValue: value || null, itemToString }),
      {
        items,
        itemToString,
        itemToElement,
        sortItems,
        compareItems,
        locale,
        top: onTop,
        isSelected: sel.isSelected,
      }
    );
  const { list, options, scope } = sortWith(inputValue);
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

  const [active, setActive] = useState<ListboxActive>({
    index: -1,
    how: 'open',
  });
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const [cleared, setCleared] = useState(false);
  const burst = useTypingBurst();

  const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
  const interactive = !norm.disabled && !readOnly;
  const late = useLateStatus(norm.status, { late: false });
  const shown = late.shown;

  const [seenOpen, setSeenOpen] = useState(openProp);
  if (openProp !== seenOpen) {
    setSeenOpen(openProp);
    if (!!openProp !== open) {
      if (openProp) placing.opened();
      setOpen(!!openProp);
    }
  }
  const menuChange = useLatest(onMenuChange);
  const firstOpen = useRef(true);
  useEffect(() => {
    if (firstOpen.current) {
      firstOpen.current = false;
      if (!open) return;
    }
    menuChange.current?.(open);
  }, [open, menuChange]);

  const show = (index: number, from: { x: number; y: number } | null) => {
    placing.opened();
    setOrigin(from);
    setActive({ index, how: 'open' });
    setCleared(false);
    setOpen(true);
  };
  /** Closing (Escape, Tab, a blur, the chevron) clears the text (v11). */
  const close = () => {
    setOpen(false);
    setInputValue('');
  };
  /** How the last toggle came: a key's reorder keeps the active option in view. */
  const [by, setBy] = useState<'key' | 'pointer'>('pointer');
  const toggle = (j: number, from: 'key' | 'pointer' = 'pointer') => {
    const item = list[j];
    if (item === undefined || isDisabled(j) || !interactive) return;
    setBy(from);
    placing.toggling(isSelectAllItem(item) ? null : options[j]!.key, from);
    // A pick isn't typing: its reorder plays out.
    burst.settle();
    if (isSelectAllItem(item)) sel.toggleAll(scope);
    else sel.toggle(item);
  };
  const clearAll = () => {
    if (!interactive || !sel.selected.length) return;
    sel.clear();
    setCleared(true);
  };

  /* ── typing ────────────────────────────────────────────────────────── */

  const onType = (value: string, at: number) => {
    if (!interactive) return;
    burst.typed(at);
    placing.release();
    setInputValue(value);
    // The first match is active (not a select-all), so Enter toggles it.
    const next = sortWith(value, placing.released);
    const match = value
      ? next.options.findIndex(
          (o, j) => !o.disabled && !isSelectAllItem(next.list[j])
        )
      : -1;
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
        if (!open) show(e.altKey ? -1 : first(), null);
        else if (!e.altKey) {
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
        if (!open) show(last(), null);
        else {
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
        e.preventDefault();
        if (!open) show(first(), null);
        else if (cur >= 0) toggle(cur, 'key');
        return;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        } else if (inputValue || sel.selected.length) {
          e.preventDefault();
          e.stopPropagation();
          setInputValue('');
          clearAll();
        }
        return;
      case 'Delete':
        if (!open && !inputValue && sel.selected.length) {
          e.preventDefault();
          clearAll();
        }
        return;
      case 'Tab':
        if (open) close();
        return;
    }
  };

  // The active option follows its item through a reorder.
  const [seenOrder, setSeenOrder] = useState(() =>
    options.map((o) => o.key).join('|')
  );
  const order = options.map((o) => o.key).join('|');
  if (order !== seenOrder) {
    setSeenOrder(order);
    const prevKey = seenOrder.split('|')[active.index];
    const at =
      prevKey === undefined ? -1 : options.findIndex((o) => o.key === prevKey);
    if (at >= 0 && at !== active.index)
      setActive({ index: at, how: by === 'key' ? 'key' : 'filter' });
  }

  /* ── render ────────────────────────────────────────────────────────── */

  const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
  const pointerDown = useRef(false);
  const aria = fieldAria({
    shown,
    ids: norm,
    hasHelper: hasText(helperText),
    hasWarnText: hasText(warnText),
    hasInvalidText: hasText(invalidText),
    describedBy:
      [inputRest['aria-describedby'], sel.count ? countId : undefined]
        .filter(Boolean)
        .join(' ') || undefined,
  });
  const hasTitle =
    titleText !== undefined && titleText !== null && titleText !== '';
  const deco = slug ?? decorator;
  const iconPx = iconSizeFor(size);
  const toggleOpen = (from: { x: number; y: number }) => {
    if (!interactive) return;
    if (open) close();
    else show(-1, from);
  };

  return (
    <FieldFrame
      id={id}
      labelId={labelId}
      labelFor
      titleText={titleText}
      hideLabel={hideLabel}
      helperText={helperText}
      warnText={warnText}
      invalidText={invalidText}
      shown={shown}
      norm={norm}
      size={size}
      readOnly={readOnly}
      corners={corners}
      frame={frame}
      className={className}
      variantClass="cds-multi-select cds-combo-box"
      rest={style ? { style } : undefined}>
      <div
        ref={setField}
        className="cds-text-input__field cds-multi-select__field"
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
          // A press in the field off the input (the tag, the padding, the
          // buttons) keeps or puts the caret in it.
          const target = e.target as Element;
          if (target === inputRef.current || norm.disabled) return;
          e.preventDefault();
          if (document.activeElement !== inputRef.current) {
            pointerDown.current = true;
            inputRef.current?.focus();
          }
        }}>
        <CountTag
          count={sel.count}
          size={size}
          label={sel.count > 1 ? t('clear.all') : t('clear.selection')}
          disabled={norm.disabled}
          readOnly={readOnly}
          onClear={() => {
            clearAll();
            inputRef.current?.focus();
          }}
          timeScale={timeScale}
        />
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
            toggleOpen(press.current ?? { x: e.clientX, y: e.clientY });
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
                setInputValue('');
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
            onClick={(e) => {
              inputRef.current?.focus();
              toggleOpen({ x: e.clientX, y: e.clientY });
            }}
            data-motion-icon-frame="">
            <ChevronDownToggle
              size={iconPx}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </button>
        </span>
      </div>
      {sel.count > 0 && (
        <span id={countId} className="cds-field-visually-hidden">
          {`${clearSelectionDescription}${sel.count}. ${clearSelectionText}.`}
        </span>
      )}
      <span className="cds-field-visually-hidden" aria-live="assertive">
        {cleared ? clearAnnouncement : ''}
      </span>
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
        onPick={(i) => toggle(i)}
        onRowLeave={placing.left}
        followPointer={placing.follow}
        size={size}
        direction={direction}
        origin={origin}
        emptyText={emptyText}
        multiple
        typing={burst.burst}
        shadow={shadow}
        timeScale={timeScale}
      />
    </FieldFrame>
  );
}

/** v11's FilterableMultiSelect, on the kit's text field and the selection family's list. The ref is the input. */
export const FilterableMultiSelect = forwardRef(FilterableMultiSelectInner) as <
  Item,
>(
  props: FilterableMultiSelectProps<Item> & { ref?: Ref<HTMLInputElement> }
) => ReactElement | null;
(FilterableMultiSelect as { displayName?: string }).displayName =
  'FilterableMultiSelect';
