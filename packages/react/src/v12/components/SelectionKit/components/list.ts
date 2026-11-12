/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useState, type KeyboardEvent } from 'react';
import { createTypeahead, rovingKey } from '@carbon-labs/v12-motion/selection';
import type { KeyboardMode } from '@carbon-labs/react-props';
import { inlineKey, isRtl } from '@carbon-labs/react-util';

/* ============================================================================
 * One selection list model: the collection behind the content switcher, tabs
 * (horizontal and vertical) and the select list. Each list keeps its look and
 * motion; this is what they share underneath.
 *
 *   roles       one ARIA contract per role: `tablist` of `tab`s (the selected
 *               one `aria-selected`, joined to its panel by `aria-controls`),
 *               `radiogroup` of `radio`s (`aria-checked`), `listbox` of
 *               `option`s (`aria-selected`)
 *   tab stop    one: the selected item, or with none (or a disabled one) the
 *               first enabled item
 *   keys        the arrows along the list's orientation, Home and End;
 *               `wrap` past the ends; typeahead when the list gives labels
 *   activation  `automatic`: a key that moves focus selects too. `manual`:
 *               it moves focus only; Enter or Space (the item's own click)
 *               selects
 *   direction   right to left, ArrowLeft is next and ArrowRight previous on
 *               a horizontal list; a vertical list's keys never change
 * ========================================================================== */

export type SelectionListRole = 'tablist' | 'radiogroup' | 'listbox';
export type SelectionListOrientation = 'horizontal' | 'vertical';

const ITEM_ROLE = {
  tablist: 'tab',
  radiogroup: 'radio',
  listbox: 'option',
} as const;

/** One item's state, as its list sees it. */
export interface SelectionItemState {
  selected: boolean;
  /** The list's one tab stop. */
  tabStop: boolean;
  /** The item's id; wins over the list's `id`. */
  id?: string;
  /** The id of what the item controls (a tab's panel); wins over the list's `controls`. */
  controls?: string;
}

/** The ARIA and focus attributes of one item. */
export interface SelectionItemProps {
  role: (typeof ITEM_ROLE)[SelectionListRole];
  id?: string;
  'aria-controls'?: string;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  tabIndex: 0 | -1;
  'data-index': number;
}

/** An item's attributes under a role's contract. */
export function selectionItemProps(
  role: SelectionListRole,
  index: number,
  state: SelectionItemState
): SelectionItemProps {
  return {
    role: ITEM_ROLE[role],
    id: state.id,
    'aria-controls': state.controls,
    ...(role === 'radiogroup'
      ? { 'aria-checked': state.selected }
      : { 'aria-selected': state.selected }),
    tabIndex: state.tabStop ? 0 : -1,
    'data-index': index,
  };
}

/** The list's tab stop: the selected item when it can take focus, else the first enabled one (-1: none). */
export function selectionTabStop(
  selected: number,
  count: number,
  isDisabled: (index: number) => boolean
): number {
  if (selected >= 0 && selected < count && !isDisabled(selected)) {
    return selected;
  }
  for (let i = 0; i < count; i++) {
    if (!isDisabled(i)) {
      return i;
    }
  }
  return -1;
}

export interface SelectionStepOptions {
  orientation: SelectionListOrientation;
  count: number;
  /** Out of the arrow keys' path. */
  isDisabled: (index: number) => boolean;
  /** Past an end to the other. Default true. */
  wrap?: boolean;
  /** Right to left: a horizontal list's arrows swap. */
  rtl?: boolean;
}

/** Where a key moves focus from `from`, or null when the key isn't the list's. */
export function selectionStep(
  key: string,
  from: number,
  o: SelectionStepOptions
): number | null {
  const k = o.orientation === 'horizontal' ? inlineKey(key, !!o.rtl) : key;
  return rovingKey(k, from, {
    orientation: o.orientation,
    wrap: o.wrap ?? true,
    count: o.count,
    isDisabled: o.isDisabled,
  });
}

export interface SelectionListOptions {
  role: SelectionListRole;
  /** Default `vertical` for a listbox, `horizontal` otherwise. */
  orientation?: SelectionListOrientation;
  /** The selected index; -1 for none. */
  selected: number;
  count: number;
  /** Out of the arrow keys' path (and never the tab stop). */
  isDisabled: (index: number) => boolean;
  /** Past an end to the other. Default true. */
  wrap?: boolean;
  /** Default `automatic`. */
  activation?: KeyboardMode;
  /** A key moved focus here: focus the item. */
  focus: (index: number) => void;
  /** A key selected this item (automatic activation). */
  select: (index: number, key: string) => void;
  /** Each item's text, for typeahead. Without it, no typeahead. */
  labels?: () => readonly string[];
  /** Each item's id. Stable (a `useCallback`): the item props getter keeps its identity. */
  id?: (index: number) => string | undefined;
  /** The id of what each item controls. Stable, as `id`. */
  controls?: (index: number) => string | undefined;
}

export interface SelectionList {
  /** The list element's role and orientation. */
  listProps: {
    role: SelectionListRole;
    'aria-orientation': SelectionListOrientation;
  };
  /** The tab stop's index (-1: none). */
  tabStop: number;
  /**
   * One item's attributes. Stable while the role, `id` and `controls` are, so
   * a memoized row can take it as a prop.
   */
  itemProps: (index: number, state: SelectionItemState) => SelectionItemProps;
  /**
   * The list's keys, from the item at `from`: true when the key was the
   * list's (focus moved, and with automatic activation the item selected).
   */
  onKeyDown: (e: KeyboardEvent, from: number) => boolean;
}

export function useSelectionList(o: SelectionListOptions): SelectionList {
  const {
    role,
    orientation = role === 'listbox' ? 'vertical' : 'horizontal',
    id,
    controls,
  } = o;
  const [typeahead] = useState(() => createTypeahead());

  const itemProps = useCallback(
    (index: number, state: SelectionItemState) =>
      selectionItemProps(role, index, {
        ...state,
        id: state.id ?? id?.(index),
        controls: state.controls ?? controls?.(index),
      }),
    [role, id, controls]
  );

  const onKeyDown = (e: KeyboardEvent, from: number): boolean => {
    const target = e.target as Element;
    let next = selectionStep(e.key, from, {
      orientation,
      count: o.count,
      isDisabled: o.isDisabled,
      wrap: o.wrap,
      rtl:
        orientation === 'horizontal' &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
        isRtl(target),
    });
    if (next == null && o.labels && !e.ctrlKey && !e.metaKey && !e.altKey) {
      next = typeahead(e.key, from, [...o.labels()], o.isDisabled);
    }
    if (next == null) {
      return false;
    }
    e.preventDefault();
    o.focus(next);
    if (o.activation !== 'manual') {
      o.select(next, e.key);
    }
    return true;
  };

  return {
    listProps: { role, 'aria-orientation': orientation },
    tabStop: selectionTabStop(o.selected, o.count, o.isDisabled),
    itemProps,
    onKeyDown,
  };
}
