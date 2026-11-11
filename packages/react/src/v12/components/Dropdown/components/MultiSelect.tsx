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
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDownToggle } from '@carbon-labs/react-motion-icons';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import {
  createTypeahead,
  rovingKey,
  useLatest,
} from '@carbon-labs/react-selection-kit';
import { mergeRefs } from '@carbon-labs/react-tooltip';
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
import { ListboxSurface, optionId, type ListboxActive } from './ListboxSurface';
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
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * MultiSelect — Carbon v11's MultiSelect: the Dropdown's field and list, for
 * choosing many.
 * ============================================================================
 *
 * v11's props: `id`, `items`, `itemToString`, `itemToElement`, `label`
 * (always in the field), `titleText`, `hideLabel`, `helperText`,
 * `selectedItems` (controlled) / `initialSelectedItems`,
 * `onChange({ selectedItems })`, `onMenuChange(open)`, `open`,
 * `selectionFeedback` (`top` / `fixed` / `top-after-reopen`, default),
 * `sortItems`, `compareItems`, `locale`, a select-all item
 * (`isSelectAll: true`), `invalid` / `invalidText`, `warn` / `warnText`,
 * `size`, `type` (`default` / `inline`), `disabled`, `readOnly`,
 * `direction`, `clearSelectionText`, `clearSelectionDescription`,
 * `clearAnnouncement`, `translateWithId`; the ref is the trigger button.
 * `light`, `autoAlign`, `downshiftProps`, `useTitleInItem` (every row has
 * its title), `decorator` / `slug` are accepted.
 *
 * ARIA: the select-only combobox of the Dropdown, its listbox
 * `aria-multiselectable`; each option's `aria-selected` is its check, a
 * select-all's mixed state is `aria-checked="mixed"`.
 *
 * Keys — closed: ↓ / Enter / Space open on the first option, ↑ on the last,
 * Home / End on the first / last, a letter on its match; Delete or Escape
 * clears the choice. Open: ↑ / ↓ (no wrap), Home / End, Page Up / Down,
 * typeahead; Enter and Space toggle the active option and the list stays
 * open; Escape, Tab and Alt ↑ close it.
 *
 * The kit adds the Dropdown's field (the text input's) and list (the Menu's
 * surface, the kit's highlight); a check column of the kit's Checkbox; the
 * count tag snaps in and its number rolls; with `selectionFeedback="top"`,
 * an item chosen while open goes out, the list closes up and opens room at
 * the top in one layout move, and it comes back in there — at once for a
 * key, and for the pointer once it leaves the row. Read-only, the
 * tag has no clear.
 * ========================================================================== */

export interface MultiSelectProps<Item> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'id' | 'onChange'
> {
  id: string;
  items: Item[];
  /** Default: the string, the number, or the object's `label` (v11). */
  itemToString?: (item: Item | null) => string;
  /** An option as a node, not its string. */
  itemToElement?: ((item: Item) => NonNullable<ReactNode>) | null;
  /** Controlled. */
  selectedItems?: Item[];
  initialSelectedItems?: Item[];
  onChange?: (data: { selectedItems: Item[] }) => void;
  /** The list opened (`true`) or closed (`false`). */
  onMenuChange?: (open: boolean) => void;
  /** Open the list (v11: on mount, and when it changes). */
  open?: boolean;
  /** Where chosen items sort while the list is open. Default `top-after-reopen`. */
  selectionFeedback?: SelectionFeedback;
  /** The list's order (v11). Default: chosen first, then by `compareItems`. */
  sortItems?: (
    items: readonly Item[],
    options: SortItemsOptions<Item>
  ) => Item[];
  /** Two items' strings, compared. Default: `localeCompare`, numeric. */
  compareItems?: CompareItems;
  /** For the default `compareItems`. Default `en`. */
  locale?: string;
  /** Always in the field, after the count. */
  label: NonNullable<ReactNode>;
  titleText?: ReactNode;
  hideLabel?: boolean;
  helperText?: ReactNode;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** Default `md` (40px). */
  size?: ListboxSize;
  /** `default`, or `inline`: the label beside a quiet field. */
  type?: 'default' | 'inline';
  disabled?: boolean;
  readOnly?: boolean;
  /** The side the list opens on. Default `bottom`; it flips when there's no room. */
  direction?: 'top' | 'bottom';
  /** The trigger's name when there's no `titleText`. */
  'aria-label'?: string;
  /** Read after the count. Default "To clear selection, press Delete or Backspace". */
  clearSelectionText?: string;
  /** Read before the count. Default "Total items selected: ". */
  clearSelectionDescription?: string;
  /** Announced when the choice is cleared. Default "all items have been cleared". */
  clearAnnouncement?: string;
  /** The tag's clear ('clear.all' / 'clear.selection'). */
  translateWithId?: (id: string) => string;
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  /** v11: accepted; the list always flips and stays in the viewport. */
  autoAlign?: boolean;
  /** v11: accepted, ignored (there's no Downshift here). */
  downshiftProps?: unknown;
  /** v11: accepted; every row has its title. */
  useTitleInItem?: boolean;
  decorator?: ReactNode;
  /** @deprecated v11: `decorator`. */
  slug?: ReactNode;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

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

const PAGE = 10;

function MultiSelectInner<Item>(
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
    label,
    titleText,
    hideLabel = false,
    helperText,
    invalid = false,
    invalidText,
    warn = false,
    warnText,
    size: sizeProp,
    type = 'default',
    disabled: ownDisabled = false,
    readOnly: ownReadOnly = false,
    direction = 'bottom',
    'aria-label': ariaLabelProp,
    clearSelectionText = 'To clear selection, press Delete or Backspace',
    clearSelectionDescription = 'Total items selected: ',
    clearAnnouncement = 'all items have been cleared',
    translateWithId,
    light: _light,
    autoAlign: _autoAlign,
    downshiftProps: _downshiftProps,
    useTitleInItem: _useTitleInItem,
    decorator,
    slug,
    corners: cornersProp,
    frame = 'inset',
    shadow,
    timeScale,
    className,
    ...rest
  }: MultiSelectProps<Item>,
  ref: Ref<HTMLButtonElement>
) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  // KitDefaults: the provider's size and corners for the props not given.
  const { size = 'md', corners } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const t = (key: string) => translateWithId?.(key) ?? MULTI_TRANSLATIONS[key]!;
  const inline = type === 'inline';
  const listId = `${id}__menu`;
  const labelId = `${id}-label`;
  const countId = `${id}-selection`;

  /* ── the choice and the order ──────────────────────────────────────── */

  const sel = useMultiSelection({
    items,
    itemToString,
    selectedItems,
    initialSelectedItems,
    onChange,
  });
  const [open, setOpen] = useState(!!openProp);
  // What sorts on top: `top-after-reopen` holds the order taken as the list
  // opened; `top` holds a pointer's pick in place until the pointer leaves it.
  const placing = useFeedbackOrder(selectionFeedback, open, sel.selected);
  const { top } = placing;
  const { list, options, scope } = sortedOptions(items, {
    items,
    itemToString,
    itemToElement,
    sortItems,
    compareItems,
    locale,
    top,
    isSelected: sel.isSelected,
  });
  const isDisabled = (i: number) => !!options[i]?.disabled;
  const step = (key: string, from: number) =>
    rovingKey(key, from, {
      orientation: 'vertical',
      wrap: false,
      count: options.length,
      isDisabled,
    });
  const first = () => step('Home', -1) ?? -1;
  const last = () => step('End', -1) ?? -1;
  const page = (from: number, dir: 1 | -1) => {
    let i = from;
    for (let k = 0; k < PAGE; k++) {
      const n = step(dir === 1 ? 'ArrowDown' : 'ArrowUp', i);
      if (n == null || n === i) break;
      i = n;
    }
    return i;
  };

  /* ── open / closed ─────────────────────────────────────────────────── */

  const [active, setActive] = useState<ListboxActive>({
    index: -1,
    how: 'open',
  });
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mergedRef = useMemo(
    () => mergeRefs<HTMLButtonElement>(triggerRef, ref),
    [ref]
  );
  const press = useRef<{ x: number; y: number } | null>(null);
  const typeahead = useMemo(() => createTypeahead(), []);
  const typedAt = useRef(-Infinity);
  const [cleared, setCleared] = useState(false);

  const norm = normalizeFieldProps({ id, readOnly, disabled, invalid, warn });
  const interactive = !norm.disabled && !readOnly;

  // v11's `open`: followed when it changes.
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
  /** Toggle an option; the list stays open (v11). */
  /** How the last toggle came: a key's reorder keeps the active option in view. */
  const [by, setBy] = useState<'key' | 'pointer'>('pointer');
  const toggle = (i: number, from: 'key' | 'pointer' = 'pointer') => {
    const item = list[i];
    if (item === undefined || isDisabled(i) || !interactive) return;
    setBy(from);
    placing.toggling(isSelectAllItem(item) ? null : options[i]!.key, from);
    if (isSelectAllItem(item)) sel.toggleAll(scope);
    else sel.toggle(item);
  };
  const clearAll = () => {
    if (!interactive || !sel.selected.length) return;
    sel.clear();
    setCleared(true);
  };

  /* ── the field's states ────────────────────────────────────────────── */

  const late = useLateStatus(norm.status, { late: false });
  const shown = late.shown;
  const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
  const pointerDown = useRef(false);
  const aria = fieldAria({
    shown,
    ids: norm,
    hasHelper: !inline && hasText(helperText),
    hasWarnText: hasText(warnText),
    hasInvalidText: hasText(invalidText),
    describedBy: sel.count ? countId : undefined,
  });

  /* ── keyboard ──────────────────────────────────────────────────────── */

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!interactive) {
      // Read-only: it takes focus, never opens (v11).
      if (['ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(e.key))
        e.preventDefault();
      return;
    }
    const printable =
      e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    // Space inside a typeahead run is part of the word, not a toggle.
    const typing = e.key === ' ' && e.timeStamp - typedAt.current < 500;
    if (!open) {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'Enter' ||
        (e.key === ' ' && !typing)
      ) {
        e.preventDefault();
        show(first(), null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        show(last(), null);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        show(e.key === 'Home' ? first() : last(), null);
      } else if (
        (e.key === 'Delete' || e.key === 'Escape') &&
        !isComposing(e)
      ) {
        // v11: clears the choice.
        if (sel.selected.length) {
          e.preventDefault();
          e.stopPropagation();
          clearAll();
        }
      } else if (printable && e.key !== ' ') {
        e.preventDefault();
        typedAt.current = e.timeStamp;
        const i = typeahead(
          e.key,
          -1,
          options.map((o) => o.label),
          isDisabled
        );
        show(i ?? first(), null);
      } else if (typing) e.preventDefault();
      return;
    }
    const cur = active.index;
    const move = (index: number) =>
      setActive({ index, how: e.repeat ? 'repeat' : 'key' });
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        if (e.altKey && e.key === 'ArrowUp') {
          setOpen(false);
          return;
        }
        const next =
          cur < 0
            ? e.key === 'ArrowDown'
              ? first()
              : last()
            : step(e.key, cur);
        if (next != null && next >= 0) move(next);
        return;
      }
      case 'Home':
      case 'End':
        e.preventDefault();
        move(e.key === 'Home' ? first() : last());
        return;
      case 'PageDown':
      case 'PageUp':
        e.preventDefault();
        move(
          page(
            cur < 0 ? (e.key === 'PageDown' ? -1 : options.length) : cur,
            e.key === 'PageDown' ? 1 : -1
          )
        );
        return;
      case 'Enter':
        e.preventDefault();
        if (cur >= 0) toggle(cur, 'key');
        return;
      case ' ':
        e.preventDefault();
        if (!typing && cur >= 0) toggle(cur, 'key');
        return;
      case 'Escape':
        if (isComposing(e)) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
    if (printable) {
      e.preventDefault();
      typedAt.current = e.timeStamp;
      const i = typeahead(
        e.key,
        cur,
        options.map((o) => o.label),
        isDisabled
      );
      if (i != null) move(i);
    }
  };

  // The active option follows its item through a reorder (v11 keeps the highlighted item).
  const [seenOrder, setSeenOrder] = useState(() =>
    options.map((o) => o.key).join('|')
  );
  const order = options.map((o) => o.key).join('|');
  if (order !== seenOrder) {
    setSeenOrder(order);
    const prevKey = seenOrder.split('|')[active.index];
    const at =
      prevKey === undefined ? -1 : options.findIndex((o) => o.key === prevKey);
    if (at !== active.index)
      setActive({ index: at, how: by === 'key' ? 'key' : 'filter' });
  }

  /* ── render ────────────────────────────────────────────────────────── */

  const deco = slug ?? decorator;
  const hasTitle =
    titleText !== undefined && titleText !== null && titleText !== '';
  const iconPx = iconSizeFor(size);
  const toggleOpen = (e: {
    clientX: number;
    clientY: number;
    detail: number;
  }) => {
    if (!interactive) return;
    if (open) return setOpen(false);
    // No pointer behind the click (assistive tech): from the field's center.
    const byKey = e.detail === 0;
    show(byKey ? first() : -1, byKey ? null : press.current);
  };

  return (
    <FieldFrame
      id={id}
      labelId={labelId}
      titleText={titleText}
      hideLabel={hideLabel}
      onLabelClick={() => triggerRef.current?.focus()}
      helperText={helperText}
      warnText={warnText}
      invalidText={invalidText}
      shown={shown}
      norm={norm}
      size={size}
      inline={inline}
      readOnly={readOnly}
      corners={corners}
      frame={frame}
      className={className}
      // The Dropdown's classes, and its inline form (`cds-dropdown--inline`).
      variantClass="cds-multi-select cds-dropdown"
      rest={rest}>
      <div
        ref={setField}
        className="cds-text-input__field cds-multi-select__field"
        data-focus={focus ?? undefined}
        onPointerDown={(e) => {
          press.current = { x: e.clientX, y: e.clientY };
          if (document.activeElement !== triggerRef.current)
            pointerDown.current = true;
          else {
            // A press on the focused field holds its focus edge (it never steps down).
            const el = e.currentTarget;
            holdUntilRelease(el);
          }
        }}
        onMouseDown={(e) => {
          // A press off the trigger (the tag, the padding) keeps focus on it.
          if (triggerRef.current?.contains(e.target as Node) || norm.disabled)
            return;
          e.preventDefault();
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          if (triggerRef.current?.contains(e.target as Node)) return;
          toggleOpen(e);
        }}>
        <CountTag
          count={sel.count}
          size={size}
          label={sel.count > 1 ? t('clear.all') : t('clear.selection')}
          disabled={norm.disabled}
          readOnly={readOnly}
          onClear={() => {
            clearAll();
            triggerRef.current?.focus();
          }}
          timeScale={timeScale}
        />
        <button
          ref={mergedRef}
          id={id}
          type="button"
          className="cds-dropdown__field cds-multi-select__trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            open && options[active.index]
              ? optionId(listId, options[active.index]!.key)
              : undefined
          }
          aria-labelledby={hasTitle ? labelId : undefined}
          aria-label={hasTitle ? undefined : ariaLabelProp}
          aria-readonly={readOnly || undefined}
          {...aria}
          disabled={norm.disabled}
          title={typeof label === 'string' ? label : undefined}
          data-motion-icon-frame=""
          onClick={toggleOpen}
          onKeyDown={onKeyDown}
          // Space's click comes on keyup: the keydown already acted.
          onKeyUp={(e) => {
            if (e.key === ' ') e.preventDefault();
          }}
          onFocus={() => {
            setFocus(pointerDown.current ? 'pointer' : 'keyboard');
            pointerDown.current = false;
            late.onFocus();
          }}
          onBlur={() => {
            setFocus(null);
            setOpen(false);
            late.onBlur();
          }}>
          <span className="cds-dropdown__value">{label}</span>
          <span className="cds-text-input__trail">
            <span className="cds-text-input__mark-slot">
              <FieldStatusMark status={shown} />
            </span>
            {deco ? (
              <span className="cds-text-input__decorator">{deco}</span>
            ) : null}
            <span className="cds-dropdown__chevron">
              <ChevronDownToggle
                size={iconPx}
                toggled={open}
                disableToggle
                aria-hidden="true"
              />
            </span>
          </span>
        </button>
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
        label={ariaLabelProp}
        options={options}
        active={active}
        onHover={(index) => setActive({ index, how: 'pointer' })}
        onPick={(i) => toggle(i)}
        onRowLeave={placing.left}
        followPointer={placing.follow}
        size={size}
        direction={direction}
        origin={origin}
        hug={inline}
        multiple
        shadow={shadow}
        timeScale={timeScale}
      />
    </FieldFrame>
  );
}

/** v11's MultiSelect, on the kit's text field and the selection family's list. The ref is the trigger. */
export const MultiSelect = forwardRef(MultiSelectInner) as <Item>(
  props: MultiSelectProps<Item> & { ref?: Ref<HTMLButtonElement> }
) => ReactElement | null;
(MultiSelect as { displayName?: string }).displayName = 'MultiSelect';
