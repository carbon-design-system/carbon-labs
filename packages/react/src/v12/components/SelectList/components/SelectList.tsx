/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import type { Selection, SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  createTypeahead,
  resolveSelectionStyle,
  useDefaultFrame,
  rolloverItems,
  rovingKey,
  useIconPixelSnap,
  useItemRollover,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionGesture,
  sameNode,
  type SelectionMotion,
  type SelectionStyleProps,
  isComponentType,
  useSelectionLoading,
  skeletonRowProps,
  rowStructureProps,
  SelectionSkeletonFace,
  SelectionTakenFace,
  type SelectionLoadingProps,
} from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import type { KeyboardMode } from '@carbon-labs/react-props';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './select-list.scss';

/* ============================================================================
 * SelectList: pick one value from a vertical list of rows.
 *
 *   look      the selection kit's track and rows; inverse, tonal, outlined;
 *             `frame` inset or ghost; xs to lg, the switcher's heights
 *   glide     the selector travels by distance, its leading edge ahead
 *   press     the reach toward the pressed row; slide to retarget or cancel
 *   drag      the selector follows the pointer and lands on the nearest row
 *   none      no value marks nothing; the first pick grows the selector in
 *   keyboard  arrows, Home, End and typeahead; `activation` automatic or manual
 *   loading   placeholder rows in the rows' own box, taken as one reflow
 *   reduced   the selection kit's
 *
 * API: Carbon's Select names: SelectItem, SelectItemGroup, plus SelectItemDivider.
 * ========================================================================== */

export type SelectListValue = string | number;

export interface SelectItemProps {
  /** The value this row selects; passed back in `onChange`. */
  value: SelectListValue;
  /** The label (and the typeahead's text). `children` wins when both are given. */
  text?: string;
  /** An icon before the label (Carbon's `renderIcon`): a motion icon plays on the row's hover. */
  renderIcon?: ElementType;
  /** Quieter text after the label, on the same line (a description, a detail). Tab's name for it. */
  secondaryLabel?: ReactNode;
  /** A trailing element at the row's end: a shortcut, a count, a chevron. */
  accessory?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

/** A row. Read by `SelectList`; renders nothing on its own. */
export function SelectItem(_props: SelectItemProps): null {
  return null;
}
SelectItem.displayName = 'SelectItem';

export interface SelectItemGroupProps {
  /** The group's heading, and its accessible name. */
  label: ReactNode;
  /** Disables every row in the group. */
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Rows under a heading. Read by `SelectList`; renders nothing on its own. */
export function SelectItemGroup(_props: SelectItemGroupProps): null {
  return null;
}
SelectItemGroup.displayName = 'SelectItemGroup';

/** A line between rows. Read by `SelectList`; renders nothing on its own. */
export function SelectItemDivider(_props: { className?: string }): null {
  return null;
}
SelectItemDivider.displayName = 'SelectItemDivider';

export interface SelectListChangeParams {
  value: SelectListValue;
  index: number;
  text?: string;
  /** The key that made the change, when a key did. */
  key?: string;
}

/** The list's motion dials — the selection kit's. */
export type SelectListMotion = SelectionMotion;
/** The content switcher's timing by travel, for every move. */
export const SELECT_LIST_MOTION: SelectListMotion = SELECTION_KIT_MOTION;

export interface SelectListProps
  extends
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'onChange' | 'children' | 'defaultValue'
    >,
    SelectionStyleProps,
    SelectionLoadingProps {
  /** `SelectItem`, `SelectItemGroup` and `SelectItemDivider` elements. */
  children?: ReactNode;
  className?: string;
  /** The accessible name (`aria-label`); or pass `aria-labelledby`. */
  label?: string;
  /** The selected value; `null` for none. Follows changes to the prop, as the content switcher does. */
  value?: SelectListValue | null;
  /** The value selected at first when `value` isn't given. Default none. */
  defaultValue?: SelectListValue | null;
  onChange?: (params: SelectListChangeParams) => void;
  // @carbon-proposal api: activation-prop — One keyboard word, `activation` (automatic or manual), on every selection list: the arrows select, or only move focus. TBD
  /** `automatic` (default): arrows and typeahead select. `manual`: they move focus; Enter / Space select. */
  activation?: KeyboardMode;
  /** ↑ / ↓ wrap past the ends. Default false: a list has ends. */
  wrap?: boolean;
  /** `hug` (default): as wide as the widest row. `fill`: the container's width. */
  fit?: 'hug' | 'fill';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `inset`: its own track (default; `ghost` in a framed Region). `ghost`: no track, inside a card or panel. */
  frame?: 'inset' | 'ghost';
  /** Motion dials; omitted keys take `SELECT_LIST_MOTION`. */
  motion?: Partial<SelectListMotion>;
  /** Called as each glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
  /** Overrides the reduced-motion preference: the selector moves at once. */
  reduced?: boolean;
}

/* ── reading the children ──────────────────────────────────────────────── */

interface Row {
  kind: 'row';
  index: number;
  key: string;
  value: SelectListValue;
  text?: string;
  /** What typeahead matches. */
  label: string;
  Icon?: ElementType;
  content: ReactNode;
  secondary?: ReactNode;
  accessory?: ReactNode;
  disabled: boolean;
  className?: string;
}
interface Group {
  kind: 'group';
  key: string;
  label: ReactNode;
  entries: Entry[];
  className?: string;
}
interface Divider {
  kind: 'divider';
  key: string;
  className?: string;
}
type Entry = Row | Group | Divider;

function readEntries(children: ReactNode): { entries: Entry[]; rows: Row[] } {
  const rows: Row[] = [];
  const read = (
    nodes: ReactNode,
    prefix: string,
    groupDisabled: boolean
  ): Entry[] => {
    const out: Entry[] = [];
    Children.toArray(nodes).forEach((child, i) => {
      if (!isValidElement(child)) return;
      const key = `${prefix}${String(child.key ?? i)}`;
      if (child.type === Fragment) {
        out.push(
          ...read(
            (child.props as { children?: ReactNode }).children,
            `${key}/`,
            groupDisabled
          )
        );
      } else if (isComponentType(child.type, SelectItem)) {
        const p = child.props as SelectItemProps;
        const content = p.children ?? p.text;
        const row: Row = {
          kind: 'row',
          index: rows.length,
          key,
          value: p.value,
          text: p.text,
          label:
            p.text ??
            (typeof p.children === 'string' ? p.children : String(p.value)),
          Icon: p.renderIcon,
          content,
          secondary: p.secondaryLabel,
          accessory: p.accessory,
          disabled: groupDisabled || !!p.disabled,
          className: p.className,
        };
        rows.push(row);
        out.push(row);
      } else if (isComponentType(child.type, SelectItemGroup)) {
        const p = child.props as SelectItemGroupProps;
        out.push({
          kind: 'group',
          key,
          label: p.label,
          entries: read(p.children, `${key}/`, groupDisabled || !!p.disabled),
          className: p.className,
        });
      } else if (isComponentType(child.type, SelectItemDivider)) {
        out.push({
          kind: 'divider',
          key,
          className: (child.props as { className?: string }).className,
        });
      }
    });
    return out;
  };
  const entries = read(children, '', false);
  return { entries, rows };
}

// The track's children flattened through groups: the end rows reach into the track's inset only
// when no heading or divider sits between them and the edge.
function edgeRows(entries: Entry[]): { first: number; last: number } {
  const flat: (Row | 'other')[] = [];
  const walk = (es: Entry[]) => {
    for (const e of es) {
      if (e.kind === 'row') flat.push(e);
      else if (e.kind === 'divider') flat.push('other');
      else {
        flat.push('other');
        walk(e.entries);
      }
    }
  };
  walk(entries);
  const at = (x: Row | 'other' | undefined) =>
    x && x !== 'other' ? x.index : -1;
  return { first: at(flat[0]), last: at(flat[flat.length - 1]) };
}

interface SelectRowProps {
  r: Row;
  selected: boolean;
  /** The list's tab stop. */
  tabStop: boolean;
  /** `start` / `end`: the row at the track's edge. */
  edge?: string;
  /** Loading: the placeholder key the row took over, its takeover number and label. */
  entryKey?: string;
  took?: number;
  takenLabel?: string;
  skeletonIcon: boolean;
  /** Stable: records the row's element by index. */
  setRef: (index: number, el: HTMLButtonElement | null) => void;
  /** Stable: a click with no pointer behind it selects. */
  onCommit: (index: number) => void;
}

// One row, memoized: a list render re-renders only the rows whose own props changed, their content
// compared by `sameNode`.
const SelectRow = memo(
  function SelectRow({
    r,
    selected: isSel,
    tabStop,
    edge,
    entryKey,
    took,
    takenLabel,
    skeletonIcon,
    setRef,
    onCommit,
  }: SelectRowProps) {
    return (
      <button
        {...rowStructureProps(entryKey, took)}
        ref={(el) => setRef(r.index, el)}
        type="button"
        role="option"
        aria-selected={isSel}
        aria-disabled={r.disabled || undefined}
        tabIndex={tabStop ? 0 : -1}
        disabled={r.disabled}
        data-index={r.index}
        data-edge={edge}
        // The whole row is its icon's hover frame: hovering (or focusing)
        // anywhere on it plays a motion icon.
        {...(r.Icon ? { 'data-motion-icon-frame': '' } : null)}
        className={['sel__item', 'sl__row', r.className]
          .filter(Boolean)
          .join(' ')}
        // Pointer selections happen on pointerup (they can slide or drag); a click with no pointer
        // behind it (Enter, Space, assistive tech) selects here.
        onClick={(e) => {
          if (e.detail === 0) onCommit(r.index);
        }}>
        <SelectionFaces>
          {r.Icon && <r.Icon aria-hidden="true" />}
          <span className="sel__text">{r.content}</span>
          {r.secondary != null && (
            <span className="sl__secondary sel__quiet">{r.secondary}</span>
          )}
          {r.accessory != null && (
            <span className="sel__accessory">{r.accessory}</span>
          )}
        </SelectionFaces>
        {took !== undefined && (
          <SelectionTakenFace
            key={`taken-${took}`}
            label={takenLabel ?? ''}
            icon={skeletonIcon}
          />
        )}
      </button>
    );
  },
  (a, b) =>
    a.selected === b.selected &&
    a.tabStop === b.tabStop &&
    a.edge === b.edge &&
    a.entryKey === b.entryKey &&
    a.took === b.took &&
    a.takenLabel === b.takenLabel &&
    a.skeletonIcon === b.skeletonIcon &&
    a.setRef === b.setRef &&
    a.onCommit === b.onCommit &&
    (a.r === b.r ||
      (a.r.index === b.r.index &&
        a.r.key === b.r.key &&
        a.r.Icon === b.r.Icon &&
        a.r.disabled === b.r.disabled &&
        a.r.className === b.r.className &&
        sameNode(a.r.content, b.r.content) &&
        sameNode(a.r.secondary, b.r.secondary) &&
        sameNode(a.r.accessory, b.r.accessory)))
);

const ITEM = '.sel__item';

const SELECT_LIST_FRAMES = ['inset', 'ghost'] as const;

export function SelectList({
  children,
  className,
  label,
  value: valueProp,
  defaultValue = null,
  onChange,
  activation = 'automatic',
  wrap = false,
  size = 'md',
  fit = 'hug',
  frame: frameProp,
  variant,
  lowContrast,
  corners,
  interaction,
  contour,
  outlinedFill,
  selectorGlow,
  outline,
  motion,
  onMove,
  reduced: reducedProp,
  selectedWeight,
  holdWidth = true,
  loading,
  skeletonCount,
  skeletonLabels,
  skeletonIcon = false,
  ...rest
}: SelectListProps) {
  // A Region's default (inset on the page, ghost in a framed region) when none is given.
  const frame = useDefaultFrame(frameProp, SELECT_LIST_FRAMES, 'inset');
  const { entries, rows } = useMemo(() => readEntries(children), [children]);
  const m: SelectListMotion = { ...SELECT_LIST_MOTION, ...motion };
  const style = resolveSelectionStyle(
    {
      variant,
      lowContrast,
      size,
      corners,
      interaction,
      contour,
      outlinedFill,
      selectedWeight,
      selectorGlow,
      outline,
      orientation: 'vertical',
      frame,
    },
    m
  );

  // The selected value: the prop when given, followed when it changes (as
  // the content switcher follows `selectedIndex`); otherwise our own.
  const [value, setValue] = useState<SelectListValue | null>(
    valueProp !== undefined ? valueProp : defaultValue
  );
  const prevProp = useRef(valueProp);
  useEffect(() => {
    if (prevProp.current !== valueProp) {
      prevProp.current = valueProp;
      if (valueProp !== undefined) setValue(valueProp);
    }
  }, [valueProp]);
  const selected =
    value == null ? -1 : rows.findIndex((r) => r.value === value);

  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Loading options: the structure tier (placeholder rows, taken in order).
  const load = useSelectionLoading(
    rootRef,
    { loading, skeletonCount, skeletonLabels },
    rows.length,
    4,
    { timeScale: m.timeScale, labels: rows.map((r) => r.label) }
  );
  const systemReduced = usePrefersReducedMotion();
  const reduced = reducedProp ?? systemReduced;
  const reducedRef = useLatest(reduced);
  const mRef = useLatest(m);
  const selectedRef = useLatest(selected);
  const rowsRef = useLatest(rows);
  const onChangeRef = useLatest(onChange);
  const [typeahead] = useState(() => createTypeahead());

  /* ── the selection ──────────────────────────────────────────────────── */

  const layoutKey = `${entries
    .map(function keyOf(e): string {
      return e.kind === 'group'
        ? `${e.key}[${e.entries.map(keyOf).join(',')}]`
        : e.key;
    })
    .join(
      '|'
    )}/${size}/${fit}/${frame}/${load.busy ? 'busy' : ''}${load.standing.length}`;
  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced,
    onMove,
    // The list places its selector itself (below): it can have none.
    getRest: () => null,
    layoutKey,
  });

  useSelectedWeight(rootRef, {
    weight: style.selectedWeight,
    holdWidth,
    itemSelector: ITEM,
    key: layoutKey,
  });
  useIconPixelSnap(rootRef, '.sel__face svg', layoutKey);

  // The selector shows while there's a selection: placed at once on mount, gliding between rows, in
  // and out with the value. A remount places at once again rather than snapping in.
  const placedFor = useRef<Selection | null>(null);
  useLayoutEffect(() => {
    const sel = selRef.current;
    if (!sel) return;
    const el = selected >= 0 ? itemRefs.current[selected] : null;
    const first = placedFor.current !== sel;
    placedFor.current = sel;
    if (!el) {
      if (sel.shown()) sel.hide();
      return;
    }
    if (!sel.shown()) {
      sel.show(el);
      // On mount the selection is already there: no entrance (principle 3).
      if (first) sel.moveTo(el, { instant: true });
      return;
    }
    if (sel.target() !== el) sel.moveTo(el);
    // `load.busy`: a value known before its row exists marks it when the row lands.
  }, [selected, selRef, load.busy]);

  const commit = useCallback(
    (index: number, key?: string) => {
      const row = rowsRef.current[index];
      const el = itemRefs.current[index];
      if (!row || row.disabled || !el) return;
      const sel = selRef.current;
      if (sel?.shown()) sel.moveTo(el);
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      setValue(row.value);
      onChangeRef.current?.({
        value: row.value,
        index,
        text: row.text,
        ...(key ? { key } : null),
      });
    },
    [rowsRef, selRef, selectedRef, onChangeRef]
  );

  /* ── hover, press, drag ─────────────────────────────────────────────── */

  useItemRollover(rootRef, {
    selector: rolloverItems(ITEM, style),
    itemSelector: ITEM,
    press: m.pressColor,
    preview: style.preview,
    timeScale: m.timeScale,
    reduced: reducedRef,
    steps: style.steps,
  });

  const { onPointerDown: gestureDown } = useSelectionGesture({
    rootRef,
    selRef,
    axis: 'y',
    items: () => itemRefs.current,
    isDisabled: (i) => !!rowsRef.current[i]?.disabled,
    selected: () => selectedRef.current,
    motion: () => mRef.current,
    commit: (i) => commit(i),
  });

  /* ── keyboard ────────────────────────────────────────────────────────── */

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn) return;
    const from = Number(btn.dataset.index);
    const isDisabled = (i: number) => !!rowsRef.current[i]?.disabled;
    let next = rovingKey(e.key, from, {
      orientation: 'vertical',
      wrap,
      count: rowsRef.current.length,
      isDisabled,
    });
    if (next == null && !e.ctrlKey && !e.metaKey && !e.altKey) {
      next = typeahead(
        e.key,
        from,
        rowsRef.current.map((r) => r.label),
        isDisabled
      );
    }
    if (next == null) return;
    e.preventDefault();
    itemRefs.current[next]?.focus();
    if (activation !== 'manual') commit(next, e.key);
  };

  /* ── render ──────────────────────────────────────────────────────────── */

  // The tab stop: the selected row, or the first enabled one.
  const tabStop =
    selected >= 0 && !rows[selected]?.disabled
      ? selected
      : rows.findIndex((r) => !r.disabled);
  const edges = edgeRows(entries);
  // Placeholders after the rows: the last real row isn't at the track's end.
  if (load.standing.length) edges.last = -1;
  const headingId = useId();

  // The rows' handlers: stable, so the memoized rows (SelectRow) re-render
  // only when their own props changed.
  const setItemRef = useCallback((i: number, el: HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  }, []);
  const commitByClick = useStableCallback((i: number) => commit(i));

  const renderRow = (r: Row) => {
    const isSel = r.index === selected;
    // Loading options: only the rows the structure has committed, under their placeholder's key.
    const entry = load.active ? load.rowEntry(r.index) : undefined;
    if (load.active && !entry) return null;
    const took = entry ? load.took(entry.key) : undefined;
    return (
      <SelectRow
        key={entry?.key ?? r.key}
        r={r}
        selected={isSel}
        tabStop={r.index === tabStop}
        edge={
          [r.index === edges.first && 'start', r.index === edges.last && 'end']
            .filter(Boolean)
            .join(' ') || undefined
        }
        entryKey={entry?.key}
        took={took}
        takenLabel={took !== undefined ? load.labelFor(r.index) : undefined}
        skeletonIcon={skeletonIcon}
        setRef={setItemRef}
        onCommit={commitByClick}
      />
    );
  };

  const renderPlaceholder = (e: (typeof load.standing)[number], k: number) => {
    const first = k === 0 && (!rows.length || load.busy);
    const last = k === load.standing.length - 1;
    return (
      <button
        key={e.key}
        type="button"
        {...skeletonRowProps(e.key)}
        data-edge={
          [first && 'start', last && 'end'].filter(Boolean).join(' ') ||
          undefined
        }
        className="sel__item sl__row">
        <SelectionSkeletonFace
          label={load.labelFor(e.slot)}
          icon={skeletonIcon}
        />
      </button>
    );
  };

  const renderEntry = (e: Entry, at: number, siblings: Entry[]): ReactNode => {
    if (e.kind === 'row') return renderRow(e);
    // Loading options: headings and dividers come with the rows.
    if (load.busy) return null;
    if (e.kind === 'divider') {
      return (
        <div
          key={e.key}
          className={['sl__divider', e.className].filter(Boolean).join(' ')}
          role="none"
          aria-hidden="true"
        />
      );
    }
    const id = `${headingId}-${e.key}`;
    // A heading at the very top of the track sits closer to its edge.
    const top = at === 0 && siblings === entries;
    return (
      // `display: contents`: its rows stay the track's own flex items.
      <div
        key={e.key}
        role="group"
        aria-labelledby={id}
        className={['sl__group', e.className].filter(Boolean).join(' ')}>
        <div
          id={id}
          role="presentation"
          className={['sl__heading', top && 'sl__heading--top']
            .filter(Boolean)
            .join(' ')}
          // Loading options: a heading arrives with its rows, fading.
          {...(load.active
            ? {
                'data-presence': `heading-${e.key}`,
                'data-presence-kind': 'fade',
                'data-presence-at': 'auto',
              }
            : null)}>
          {e.label}
        </div>
        {e.entries.map((c, k) => renderEntry(c, k, e.entries))}
      </div>
    );
  };

  const classes = [...style.classes, 'sl', `sel--${fit}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...rest}
      ref={rootRef}
      className={classes}
      style={
        style.selectedWeight != null
          ? {
              ...rest.style,
              ['--sel-on-weight' as string]: style.selectedWeight,
            }
          : rest.style
      }
      role="listbox"
      aria-label={rest['aria-label'] ?? label}
      aria-orientation="vertical"
      aria-busy={load.busy || undefined}
      onPointerDown={(e) => gestureDown(e, ITEM)}
      onKeyDown={onKeyDown}>
      <SelectionMarker />
      {entries.map((e, k) => renderEntry(e, k, entries))}
      {load.standing.map(renderPlaceholder)}
    </div>
  );
}
SelectList.displayName = 'SelectList';
