/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import {
  usePrefersReducedMotion,
  type Selection,
} from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  useLatest,
  useSelectionEngine,
  useSelectionGesture,
  type SelectionMotion,
} from '@carbon-labs/react-selection-kit';
import { RadioMark } from '@carbon-labs/react-radio-button';
import { SkeletonText } from '@carbon-labs/react-feedback';
import { quietSteps } from '@carbon-labs/react-util';
import {
  useContainerCorners,
  type ContainerCorners,
} from '@carbon-labs/react-kit-defaults';
import type { Frame } from '@carbon-labs/react-props';
import './structured-list.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * StructuredList — Carbon v11's StructuredListWrapper, Head, Body, Row, Cell
 * and Input, and StructuredListSkeleton, on the kit's look and motion.
 * The same props, roles (`table`, `rowgroup`, `row`, `columnheader`,
 * `cell`) and keyboard.
 *
 *   look       v11's table layout (columns size to their content), on the
 *              page: hairlines between rows in the kit's rule
 *              (`--cds-surface-rule`), the header in `heading-compact-01`,
 *              cells in `$text-secondary`, a hovered or selected row's in
 *              `$text-primary`. `isCondensed` 8px cells, `isFlush` no
 *              start padding (not with `selection`)
 *   hover      `selection` only (a static list doesn't answer the pointer,
 *              principle 5): the rollover on the row, the quiet card hover
 *              (`quietSteps`, half the house steps), as an even wash
 *              (`--rollover-flat`: a glow is a spot in a long bar). Rows
 *              press flat, flush with their hairlines. The cells' text
 *              steps up to primary on the hover's clock
 *   selected   the selection kit's marker, travelling from the row it's
 *              on to the new one, its duration from the travel (40 / 80 /
 *              120 / 160ms), its leading edge ahead. The first pick grows
 *              it in from its row's center. A press on another row reaches
 *              toward it; sliding retargets, sliding off cancels. The
 *              marked row takes no hover and no release circle: the
 *              arriving marker is the release. The leading cell's radio is
 *              the kit's RadioMark. Its look is the `frame`:
 *   frame      `line` (default): the selector is the two row lines it
 *              lands on, in the selected treatment (2px
 *              `$layer-selected-inverse`, line tabs' bar): no fill and no
 *              sides, always drawn while it's shown, so nothing switches
 *              on or off as it travels; the rows' own lines stay.
 *              `ghost`: one wash (the data table's selected step, 10% of
 *              the text color); while it reaches or stretches across rows
 *              the hairlines inside it hide and it carries a line on each
 *              edge (the CSS reads the engine's edges on the covered rows)
 *   keyboard   v11's: `StructuredListInput` is a visually hidden radio in
 *              the row (one group, one tab stop; arrows move and select).
 *              The row takes the kit's ring (2px `$text-primary`, inside
 *              its edge) only for the keyboard
 *   reduced    the marker fades at its new row while a ghost fades at the
 *              old, at half the clock; the hover at once
 *   corners    `square` (v11, the default) or `rounded`, inside a card or a
 *              rounded region: 8px on the list, and the rows at its corners
 *              (the last row; the first, with no head) on the same radius
 *              (they sit at inset 0): their hover, their focus ring and the
 *              marker on them. Given none, KitDefaults' (a rounded Region's)
 *
 * The kit adds `timeScale` (slow motion), `corners` and `frame` on the wrapper.
 * ========================================================================== */

/**
 * What the selection marker looks like (`frame`): `line` (default)
 * the row lines it lands on, in the selected treatment; `ghost` a wash over
 * the row.
 */
export type StructuredListFrame = Extract<Frame, 'line' | 'ghost'>;

/** A body row: what the selection marker stops on. */
const ROW = '.cds-structured-list__row--body';

interface ListState {
  selection: boolean;
  selectedRow: string | null;
  setSelectedRow: (id: string) => void;
  name: string;
}

const ListContext = createContext<ListState | null>(null);
const RowContext = createContext<{ id: string } | null>(null);

/* ── the wrapper ───────────────────────────────────────────────────────── */

export interface StructuredListWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** Read by screen readers. Default "Structured list section" (v11). */
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  /** 8px cells. */
  isCondensed?: boolean;
  /** No start padding, for a list in line with the page's text. Not with `selection`. */
  isFlush?: boolean;
  /** Rows are choices: one is selected (a radio in the leading cell). */
  selection?: boolean;
  /** The row selected at first: its `id`. */
  selectedInitialRow?: string;
  /** Slow motion for the marker. Default 1. */
  timeScale?: number;
  /** `square` (v11, default) or `rounded` (8px), inside a card or a rounded region. Default: KitDefaults' (a Region's), else `square`. */
  corners?: ContainerCorners;
  /**
   * The selection marker's look. `line` (default): the two row
   * lines it lands on, in the selected treatment, no fill and no sides.
   * `ghost`: a wash over the row. Not read from KitDefaults (a list on a
   * framed region keeps its lines, as line tabs do).
   */
  frame?: StructuredListFrame;
}

export function StructuredListWrapper({
  children,
  className,
  'aria-label': ariaLabel = 'Structured list section',
  ariaLabel: deprecatedAriaLabel,
  isCondensed = false,
  isFlush = false,
  selection = false,
  selectedInitialRow,
  timeScale = 1,
  corners: cornersProp,
  frame = 'line',
  onPointerDown,
  ...rest
}: StructuredListWrapperProps) {
  const corners = useContainerCorners(cornersProp);
  const [selectedRow, setSelectedRow] = useState<string | null>(
    selectedInitialRow ?? null
  );
  const name = `cds-structured-list-${useId().replace(/:/g, '')}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const rolloverReduced = useReducedGetter();
  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    drag: false,
    timeScale,
  };
  const mRef = useLatest(m);
  const latestSelected = useLatest(selectedRow);

  const rows = useCallback(
    () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(ROW) ?? []),
    []
  );
  const rowFor = (id: string | null) =>
    id == null ? null : (rows().find((r) => r.dataset.rowId === id) ?? null);

  /* ── the marker: the selection kit's engine ─────────────────────────── */

  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ROW,
    motion: m,
    reduced,
    getRest: () => null,
    layoutKey: `${isCondensed}/${isFlush}/${selection}`,
  });

  // The marker follows the selection: placed at once the first time (the
  // selection is already there, principle 3), a glide after, the snap's
  // arrival from a row's center when there is none.
  const placedFor = useRef<Selection | null>(null);
  useLayoutEffect(() => {
    const sel = selRef.current;
    if (!sel || !selection) return;
    const el = rowFor(selectedRow);
    const first = placedFor.current !== sel;
    placedFor.current = sel;
    if (!el) {
      if (sel.shown()) sel.hide();
      return;
    }
    if (!sel.shown()) {
      sel.show(el);
      if (first) sel.moveTo(el, { instant: true });
      return;
    }
    if (sel.target() !== el) sel.moveTo(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rows are read from the DOM
  }, [selectedRow, selection, selRef]);

  // Ghost: the marker draws its lines while it spans a row's line, two body
  // rows covered at once; `data-spans-rows` on the root says so. Kept here,
  // not in a `:has()` on the rows' `data-selection-covered`: a `:has()` that
  // reads that attribute restyles the whole page each time the engine writes
  // it on any item of any selection list (every slider's knob), which can
  // hold a page's first render for seconds.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !selection || frame !== 'ghost') return;
    const covered = `${ROW}[data-selection-covered]`;
    const update = () =>
      root.toggleAttribute(
        'data-spans-rows',
        rows().some(
          (r) => r.matches(covered) && !!r.nextElementSibling?.matches(covered)
        )
      );
    const watch = new MutationObserver(update);
    watch.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-selection-covered'],
    });
    update();
    return () => {
      watch.disconnect();
      root.removeAttribute('data-spans-rows');
    };
  }, [selection, frame, rows]);

  const choose = useCallback((id: string) => setSelectedRow(id), []);

  /* ── hover and press: the rollover on the body rows ──────────────────── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !selection) return;
    return attachRollover(root, {
      selector: ROW,
      steps: quietSteps(),
      timeScale,
      reduced: rolloverReduced,
    });
  }, [selection, timeScale, rolloverReduced]);

  // The press reaches the marker toward the pressed row; sliding retargets,
  // off the list cancels; the release commits (the selection kit's gesture,
  // without the drag).
  const { onPointerDown: gestureDown } = useSelectionGesture({
    rootRef,
    selRef,
    axis: 'y',
    items: rows,
    isDisabled: () => false,
    selected: () =>
      rows().findIndex((r) => r.dataset.rowId === latestSelected.current),
    motion: () => mRef.current,
    commit: (i) => {
      const id = rows()[i]?.dataset.rowId;
      if (id) choose(id);
    },
  });

  const state = useMemo<ListState>(
    () => ({ selection, selectedRow, setSelectedRow: choose, name }),
    [selection, selectedRow, choose, name]
  );

  return (
    <ListContext.Provider value={state}>
      <div
        role="table"
        {...rest}
        ref={rootRef}
        aria-label={deprecatedAriaLabel || ariaLabel}
        className={cx(
          'cds-structured-list',
          selection && 'cds-structured-list--selection',
          selection && `cds-structured-list--${frame}`,
          isCondensed && 'cds-structured-list--condensed',
          isFlush && !selection && 'cds-structured-list--flush',
          corners === 'rounded' && 'cds-structured-list--rounded',
          className
        )}
        onPointerDown={(e) => {
          if (selection) gestureDown(e, ROW);
          onPointerDown?.(e);
        }}>
        {selection && (
          <>
            <span
              className="cds-structured-list__ghost"
              data-selection-ghost=""
              aria-hidden="true"
            />
            <span
              className="cds-structured-list__marker"
              data-selection-indicator=""
              aria-hidden="true"
            />
          </>
        )}
        {children}
      </div>
    </ListContext.Provider>
  );
}

/* ── head and body ─────────────────────────────────────────────────────── */

export interface StructuredListHeadProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function StructuredListHead({
  children,
  className,
  ...rest
}: StructuredListHeadProps) {
  return (
    <div
      role="rowgroup"
      {...rest}
      className={cx('cds-structured-list__head', className)}>
      {children}
    </div>
  );
}

export interface StructuredListBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** v11: accepted (unused there too). */
  head?: boolean;
}

export function StructuredListBody({
  children,
  className,
  head: _head,
  ...rest
}: StructuredListBodyProps) {
  return (
    <div
      role="rowgroup"
      {...rest}
      className={cx('cds-structured-list__body', className)}>
      {children}
    </div>
  );
}

/* ── rows ──────────────────────────────────────────────────────────────── */

export interface StructuredListRowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** The header row. */
  head?: boolean;
  /** @deprecated v11: no longer needed. Accepted. */
  label?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** A selectable row: the leading cell shows its radio (and a header row keeps that column). */
  selection?: boolean;
  /** The row's id, for `selectedInitialRow` and the radio's value. */
  id?: string;
}

export function StructuredListRow({
  children,
  className,
  head = false,
  label: _label,
  onClick,
  onKeyDown,
  selection = false,
  id,
  ...rest
}: StructuredListRowProps) {
  const generated = `cds-structured-list-row-${useId().replace(/:/g, '')}`;
  const rowId = id ?? generated;
  const list = useContext(ListContext);
  const selected = !head && list?.selectedRow === rowId;
  const row = useMemo(() => ({ id: rowId }), [rowId]);

  if (head) {
    return (
      <div
        role="row"
        {...rest}
        id={id}
        className={cx(
          'cds-structured-list__row',
          'cds-structured-list__row--head',
          className
        )}>
        {selection && (
          <StructuredListCell head className="cds-structured-list__select" />
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      {...rest}
      id={id}
      role="row"
      data-row-id={rowId}
      // No aria-selected: it is valid on a row only in a grid or treegrid; the row's radio
      // carries the selection.
      className={cx(
        'cds-structured-list__row',
        'cds-structured-list__row--body',
        selected && 'cds-structured-list__row--selected',
        className
      )}
      onClick={(e) => {
        list?.setSelectedRow(rowId);
        // The pick takes the row's radio's focus, so the arrow keys carry on
        // from it (the kit's items do the same); no ring for the pointer.
        // The engine calls focus arriving from outside the list the
        // keyboard's when the browser matches it `:focus-visible`, and
        // Chrome lets a scripted focus inherit "visible" from a keyboard
        // focus before it (a field typed in, then a row picked): the ring's
        // rectangle showed round a row picked with the mouse. A click with
        // a pointer (`detail` > 0; a key's click on the radio has 0) puts
        // the pointer back.
        if (list?.selection) {
          const input = e.currentTarget.querySelector<HTMLInputElement>(
            '.cds-structured-list__input'
          );
          if (input && document.activeElement !== input) {
            input.focus({ preventScroll: true });
            const root = e.currentTarget.closest<HTMLElement>(
              '.cds-structured-list'
            );
            if (root && e.detail > 0) root.dataset.input = 'pointer';
          }
        }
        onClick?.(e);
      }}
      onKeyDown={onKeyDown}>
      <RowContext.Provider value={row}>
        {selection && (
          <StructuredListCell className="cds-structured-list__select">
            <RadioMark checked={selected} />
          </StructuredListCell>
        )}
        {children}
      </RowContext.Provider>
    </div>
  );
}

/* ── the radio ─────────────────────────────────────────────────────────── */

export interface StructuredListInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'checked'
> {
  className?: string;
  /** @deprecated v11: no longer needed. Accepted. */
  defaultChecked?: boolean;
  id?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  /** @deprecated v11: the row's id is the value. Accepted. */
  value?: string | number;
}

/** The row's radio: visually hidden, the list's keyboard (v11's). */
export function StructuredListInput({
  className,
  defaultChecked: _defaultChecked,
  id,
  name,
  onChange,
  title,
  value: _value,
  ...rest
}: StructuredListInputProps) {
  const fallbackId = `cds-structured-list-input-${useId().replace(/:/g, '')}`;
  const row = useContext(RowContext);
  const list = useContext(ListContext);
  return (
    <input
      {...rest}
      type="radio"
      tabIndex={0}
      checked={!!row && row.id === list?.selectedRow}
      value={row?.id ?? ''}
      onChange={(e) => {
        list?.setSelectedRow(e.target.value);
        onChange?.(e);
      }}
      id={id ?? fallbackId}
      name={name ?? list?.name}
      title={title}
      className={cx('cds-structured-list__input', className)}
    />
  );
}

/* ── cells ─────────────────────────────────────────────────────────────── */

export interface StructuredListCellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  /** A header cell. */
  head?: boolean;
  /** Keep the text on one line. */
  noWrap?: boolean;
}

export function StructuredListCell({
  children,
  className,
  head = false,
  noWrap = false,
  ...rest
}: StructuredListCellProps) {
  return (
    <div
      role={head ? 'columnheader' : 'cell'}
      {...rest}
      className={cx(
        head ? 'cds-structured-list__th' : 'cds-structured-list__td',
        noWrap && 'cds-structured-list__cell--nowrap',
        className
      )}>
      {children}
    </div>
  );
}

/* ── the skeleton ──────────────────────────────────────────────────────── */

export interface StructuredListSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** The rows to show. Default 5 (v11). */
  rowCount?: number;
  /** v11's selection column. */
  selection?: boolean;
}

/** v11's StructuredListSkeleton: three columns of placeholder lines on the list's rows. */
export function StructuredListSkeleton({
  className,
  rowCount = 5,
  selection = false,
  ...rest
}: StructuredListSkeletonProps) {
  const cols = ['30%', '45%', '60%'];
  return (
    <div
      {...rest}
      aria-busy="true"
      className={cx(
        'cds-structured-list',
        'cds-structured-list--skeleton',
        selection && 'cds-structured-list--selection',
        className
      )}>
      <div className="cds-structured-list__head">
        <div className="cds-structured-list__row cds-structured-list__row--head">
          {selection && (
            <div className="cds-structured-list__th cds-structured-list__select" />
          )}
          {cols.map((w, i) => (
            <div key={i} className="cds-structured-list__th">
              <SkeletonText width={w} />
            </div>
          ))}
        </div>
      </div>
      <div className="cds-structured-list__body">
        {Array.from({ length: rowCount }, (_, r) => (
          <div key={r} className="cds-structured-list__row">
            {selection && (
              <div className="cds-structured-list__td cds-structured-list__select" />
            )}
            {cols.map((w, i) => (
              <div key={i} className="cds-structured-list__td">
                <SkeletonText width={i === 0 ? '75%' : w} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
