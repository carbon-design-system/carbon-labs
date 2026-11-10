/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState, type ReactNode } from 'react';
import { Close } from '@carbon-labs/react-motion-icons';
import { RollText } from '@carbon-labs/react-roll-text';
import { Tag } from '@carbon-labs/react-tag';
import { mixedCheckbox, mixedState } from '@carbon-labs/react-selection-kit';
import { isItemDisabled, type ListboxSize } from './FieldFrame';
import type { ListboxOption } from './ListboxSurface';

/* ============================================================================
 * What MultiSelect and FilterableMultiSelect share: v11's select-all item,
 * its sorting (`sortItems`, `compareItems`, `locale`, `selectionFeedback`),
 * the chosen items (controlled or not) and the count tag in the field.
 * ========================================================================== */

/** v11's select-all item: an object item with `isSelectAll: true`. */
export const isSelectAllItem = (item: unknown): boolean =>
  !!item &&
  typeof item === 'object' &&
  'isSelectAll' in item &&
  !!item.isSelectAll;

export type CompareItems = (
  itemA: string,
  itemB: string,
  options: { locale: string }
) => number;

export interface SortItemsOptions<Item> {
  selectedItems: Item[];
  itemToString: (item: Item) => string;
  compareItems: CompareItems;
  locale: string;
}

/** v11's: `localeCompare` with numeric collation (so "Item 2" comes before "Item 10"). */
export const defaultCompareItems: CompareItems = (a, b, { locale }) =>
  a.localeCompare(b, locale, { numeric: true });

/**
 * v11's: the chosen items first, then the rest, each by `compareItems` on
 * their strings. (It sorts a copy; v11's sorts `items` in place.)
 */
export function defaultSortItems<Item>(
  items: readonly Item[],
  { selectedItems, itemToString, compareItems, locale }: SortItemsOptions<Item>
): Item[] {
  return [...items].sort((a, b) => {
    const hasA = selectedItems.includes(a);
    const hasB = selectedItems.includes(b);
    if (hasA && !hasB) return -1;
    if (hasB && !hasA) return 1;
    return compareItems(itemToString(a), itemToString(b), { locale });
  });
}

/**
 * Where the chosen items sort while the list is open (v11): `top` — to the
 * top as they're chosen; `fixed` — they stay where they are;
 * `top-after-reopen` (default) — they stay while the list is open and are on
 * top the next time it opens.
 */
export type SelectionFeedback = 'top' | 'fixed' | 'top-after-reopen';

/**
 * The set `selectionFeedback` sorts on top, and when it changes.
 *
 * - `fixed`: none.
 * - `top-after-reopen`: the choice as the list opened, held while it's open.
 * - `top`: the choice, at once for a key's toggle. A row toggled with the
 *   pointer doesn't move out from under it: the order before the
 *   pick is held until the pointer leaves that row, a key toggles, or the
 *   text changes. Held at close, the row is on top when the list reopens.
 *
 * `follow` is true while the last reorder came from the pointer leaving a
 * held row: once it lands, the option under the resting pointer is active
 * (ListboxSurface's `followPointer`), as the rows between the top and the
 * held row's old place move down one.
 */
export function useFeedbackOrder<Item>(
  feedback: SelectionFeedback,
  open: boolean,
  selected: Item[]
) {
  const [snapshot, setSnapshot] = useState<Item[]>(selected);
  const [held, setHeld] = useState<{ key: string; top: Item[] } | null>(null);
  const [follow, setFollow] = useState(false);
  const top =
    feedback === 'fixed'
      ? []
      : feedback === 'top'
        ? (held?.top ?? selected)
        : open
          ? snapshot
          : selected;
  const release = () => {
    if (held) setHeld(null);
    if (follow) setFollow(false);
  };
  return {
    top,
    /** `top` once `release`d. */
    released: feedback === 'top' ? selected : top,
    follow,
    /** The list opens: `top-after-reopen` takes its order, a held row goes on top. */
    opened: () => {
      setSnapshot(selected);
      release();
    },
    /** About to toggle the option `key` (null: a select-all); `selected` is still the choice before it. */
    toggling: (key: string | null, by: 'key' | 'pointer') => {
      if (feedback !== 'top') return;
      if (by === 'key' || key === null) return release();
      setHeld({ key, top: held?.top ?? selected });
      if (follow) setFollow(false);
    },
    /** The pointer left the option `key`'s row: a pick held there goes on top. */
    left: (key: string) => {
      if (held?.key !== key) return;
      setHeld(null);
      setFollow(true);
    },
    /** The text changed (a FilterableMultiSelect): the order is the choice's again. */
    release,
  };
}

export interface MultiSelectionProps<Item> {
  items: Item[];
  itemToString: (item: Item | null) => string;
  selectedItems?: Item[];
  initialSelectedItems?: Item[];
  onChange?: (data: { selectedItems: Item[] }) => void;
}

/** The chosen items: controlled (`selectedItems`) or not; items match by identity, else by their string. */
export function useMultiSelection<Item>(p: MultiSelectionProps<Item>) {
  const controlled = p.selectedItems !== undefined;
  const [own, setOwn] = useState<Item[]>(p.initialSelectedItems ?? []);
  const selected = (controlled ? p.selectedItems : own) ?? [];
  const same = (a: Item, b: Item) => {
    if (a === b) return true;
    const s = p.itemToString(a);
    return s !== '' && s === p.itemToString(b);
  };
  const isSelected = (item: Item) => selected.some((s) => same(s, item));
  const set = (next: Item[]) => {
    if (!controlled) setOwn(next);
    p.onChange?.({ selectedItems: next });
  };
  return {
    selected,
    isSelected,
    /** The chosen items that aren't a select-all. */
    count: selected.filter((s) => !isSelectAllItem(s)).length,
    toggle: (item: Item) =>
      set(
        isSelected(item)
          ? selected.filter((s) => !same(s, item))
          : [...selected, item]
      ),
    /** A select-all over `scope` (the enabled items it covers): any chosen clears them, none chosen chooses them all. */
    toggleAll: (scope: Item[]) =>
      set(
        scope.some(isSelected)
          ? selected.filter((s) => !scope.some((x) => same(x, s)))
          : [...selected, ...scope.filter((x) => !isSelected(x))]
      ),
    clear: () => {
      if (selected.length) set([]);
    },
  };
}

/**
 * The list's options, in the order they show: the select-all first (with
 * its divider) when there's anything for it to choose, then `sortItems`'
 * order of the rest. `top` is the set `selectionFeedback` sorts on top.
 */
export function sortedOptions<Item>(
  shown: readonly Item[],
  o: {
    items: Item[];
    itemToString: (item: Item | null) => string;
    itemToElement?: ((item: Item) => ReactNode) | null;
    sortItems: (
      items: readonly Item[],
      options: SortItemsOptions<Item>
    ) => Item[];
    compareItems: CompareItems;
    locale: string;
    top: Item[];
    isSelected: (item: Item) => boolean;
  }
): { list: Item[]; options: ListboxOption[]; scope: Item[] } {
  const all = o.items.find(isSelectAllItem);
  const real = shown.filter((item) => !isSelectAllItem(item));
  const scope = real.filter((item) => !isItemDisabled(item));
  const sorted = o.sortItems(real, {
    selectedItems: o.top,
    itemToString: o.itemToString,
    compareItems: o.compareItems,
    locale: o.locale,
  });
  const list = all !== undefined && scope.length ? [all, ...sorted] : sorted;
  const at = new Map(o.items.map((item, i) => [item, i]));
  // The select-all's state: the selection kit's mixed rule (selection-kit/mixed.ts).
  const allBox = mixedCheckbox(
    mixedState(scope.filter(o.isSelected).length, scope.length)
  );
  const options = list.map((item): ListboxOption => {
    const key = String(at.get(item) ?? o.items.indexOf(item));
    if (isSelectAllItem(item))
      return {
        key,
        label: o.itemToString(item),
        selected: allBox.checked,
        indeterminate: allBox.indeterminate,
        divider: true,
      };
    return {
      key,
      label: o.itemToString(item),
      content: o.itemToElement ? o.itemToElement(item) : undefined,
      disabled: isItemDisabled(item),
      selected: o.isSelected(item),
    };
  });
  return { list, options, scope };
}

export const MULTI_TRANSLATIONS: Record<string, string> = {
  'clear.all': 'Clear selected items',
  'clear.selection': 'Clear selected item',
  'open.menu': 'Open',
  'close.menu': 'Close',
};

/**
 * The count of chosen items with its clear, in the field (v11's
 * `ListBoxSelection`): the high-contrast Tag, which snaps in when the first
 * item is chosen and out when the last goes; the number rolls (RollText) up
 * as items are added and down as they go. The clear isn't a tab stop (v11):
 * Delete or Escape on the field clears from the keyboard. Read-only, there's
 * no clear: the tag is the count alone (v11 shows one that does
 * nothing). Disabled, it stays, stepped back with the field.
 */
export function CountTag({
  count,
  size,
  label,
  disabled,
  readOnly,
  onClear,
  timeScale,
}: {
  count: number;
  size: ListboxSize;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  onClear: () => void;
  timeScale?: number;
}) {
  // The number it leaves with, while it snaps out.
  const [last, setLast] = useState(count);
  if (count > 0 && count !== last) setLast(count);
  const inert = disabled || readOnly;
  return (
    <Tag
      type="high-contrast"
      size={size === 'md' || size === 'lg' ? 'md' : 'sm'}
      corners="full"
      show={count > 0}
      timeScale={timeScale}
      className={[
        'cds-multi-select__tag',
        disabled && 'cds-multi-select__tag--disabled',
        readOnly && 'cds-multi-select__tag--read-only',
      ]
        .filter(Boolean)
        .join(' ')}>
      <span className="cds-multi-select__count" title={String(last)}>
        <RollText text={String(last)} order={last} timeScale={timeScale} />
      </span>
      {!readOnly && (
        <span
          role="button"
          tabIndex={-1}
          className="cds-multi-select__clear"
          aria-label={label}
          title={label}
          aria-disabled={inert || undefined}
          // The field keeps its focus (and a press here never opens the list).
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!inert) onClear();
          }}>
          <Close size={16} aria-hidden="true" />
        </span>
      )}
    </Tag>
  );
}
