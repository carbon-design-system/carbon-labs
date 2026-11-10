/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { OverflowMenuHorizontal } from '@carbon-labs/react-motion-icons';
import {
  createTypeahead,
  rovingKey,
  type SelectionSize,
} from '@carbon-labs/react-selection-kit';
import {
  ListboxSurface,
  optionId,
  type ListboxActive,
  type ListboxOption,
} from '@carbon-labs/react-dropdown';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * The pagination nav's overflow: v11 draws a native select of the hidden
 * pages behind a "…" icon. Here the "…" is one of the row's items, and its
 * list is the kit's floating listbox (the Dropdown's: the Menu's surface,
 * snapping from the press and folding back into it, five and a half rows
 * that scroll, the kit's highlight). A select-only combobox, as the
 * Dropdown: focus stays on the trigger (`aria-activedescendant`).
 *
 * Keyboard — closed: ↓ / Enter / Space open on the first page, ↑ on the
 * last, Home / End. Open: ↑ / ↓ (no wrap), Home / End, Page Up / Down (10),
 * digits find a page, Enter / Space choose, Escape and Tab close.
 * ========================================================================== */

const PAGE = 10;

export interface PageOverflowProps {
  /** The first hidden page's index (0-based). */
  fromIndex: number;
  count: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  /** The trigger's and the list's name. */
  label: string;
  size: SelectionSize;
  timeScale?: number;
}

export function PageOverflow({
  fromIndex,
  count,
  onSelect,
  disabled = false,
  label,
  size,
  timeScale,
}: PageOverflowProps) {
  const listId = `cds-pnav-list-${useId().replace(/:/g, '')}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ListboxActive>({
    index: -1,
    how: 'open',
  });
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const typeahead = useMemo(() => createTypeahead(), []);

  const options: ListboxOption[] = Array.from({ length: count }, (_, i) => ({
    key: String(fromIndex + i),
    label: String(fromIndex + i + 1),
  }));
  const none = () => false;
  const step = (key: string, from: number) =>
    rovingKey(key, from, {
      orientation: 'vertical',
      wrap: false,
      count,
      isDisabled: none,
    });

  const show = (index: number, from: { x: number; y: number } | null) => {
    setOrigin(from);
    setActive({ index, how: 'open' });
    setOpen(true);
  };
  const choose = (i: number) => {
    setOpen(false);
    if (i >= 0 && i < count) onSelect(fromIndex + i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const digit = /^\d$/.test(e.key);
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        show(0, null);
      } else if (e.key === 'ArrowUp' || e.key === 'End') {
        e.preventDefault();
        show(count - 1, null);
      } else if (e.key === 'Home') {
        e.preventDefault();
        show(0, null);
      }
      return;
    }
    const cur = active.index;
    const move = (index: number) =>
      setActive({ index, how: e.repeat ? 'repeat' : 'key' });
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const next =
          cur < 0 ? (e.key === 'ArrowDown' ? 0 : count - 1) : step(e.key, cur);
        if (next != null) move(next);
        return;
      }
      case 'Home':
      case 'End':
        e.preventDefault();
        move(e.key === 'Home' ? 0 : count - 1);
        return;
      case 'PageDown':
      case 'PageUp':
        e.preventDefault();
        move(
          Math.max(
            0,
            Math.min(
              count - 1,
              (cur < 0 ? 0 : cur) + (e.key === 'PageDown' ? PAGE : -PAGE)
            )
          )
        );
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (cur >= 0) choose(cur);
        else setOpen(false);
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
    if (digit) {
      e.preventDefault();
      const i = typeahead(
        e.key,
        cur,
        options.map((o) => o.label),
        none
      );
      if (i != null) move(i);
    }
  };

  return (
    <>
      <button
        ref={setButton}
        type="button"
        className="sel__item sel__item--icon cds-pagination-nav__overflow"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && options[active.index]
            ? optionId(listId, options[active.index]!.key)
            : undefined
        }
        aria-label={label}
        disabled={disabled}
        data-motion-icon-frame=""
        onPointerDown={(e) => {
          press.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          if (disabled) return;
          if (open) return setOpen(false);
          // No pointer behind the click (assistive tech): from the trigger's center, on the first page.
          const byKey = e.detail === 0;
          show(byKey ? 0 : -1, byKey ? null : press.current);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => {
          if (e.key === ' ') e.preventDefault();
        }}
        onBlur={() => setOpen(false)}>
        <span className="sel__face">
          <OverflowMenuHorizontal aria-hidden="true" />
        </span>
      </button>
      <ListboxSurface
        id={listId}
        open={open}
        anchor={button}
        label={label}
        options={options}
        active={active}
        onHover={(index) => setActive({ index, how: 'pointer' })}
        onPick={choose}
        size={size}
        origin={origin}
        hug
        timeScale={timeScale}
      />
    </>
  );
}
