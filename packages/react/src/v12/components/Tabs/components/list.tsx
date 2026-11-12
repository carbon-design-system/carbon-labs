/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { Close } from '@carbon-labs/react-motion-icons';
import {
  SelectionFaces,
  SelectionSkeletonText,
  SelectionTakenFace,
  createTooltip,
  rolloverItems,
  rowStructureProps,
  useIconPixelSnap,
  useItemRollover,
  useLandingHold,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionEnds,
  useSelectionGesture,
  useSelectionList,
  type LandingHold,
  type ResolvedSelectionStyle,
  type SelectionItemProps,
  type SelectionItemState,
  type TooltipController,
} from '@carbon-labs/react-selection-kit';
import type { KeyboardMode } from '@carbon-labs/react-props';
import {
  assignRef,
  isComposing,
  useStableCallback,
} from '@carbon-labs/react-util';
import {
  TabLabels,
  panelId,
  sameTab,
  tabId,
  truncatedText,
  useTabs,
  type TabItem,
} from './shared';

/* ============================================================================
 * The one tab list behind horizontal tabs (`TabList`) and vertical tabs
 * (`TabListVertical`): the selection kit's list model as a tablist (roles,
 * the tab stop, the keys, right to left), the selector's glide, weight and
 * landing, the rollover, the press, reach and drag, the tooltip, keeping
 * the selected tab in view, and the overflow marks. Each list adds its own:
 * horizontal tabs close and scroll by buttons; vertical tabs load and ride
 * a line.
 * ========================================================================== */

export const ITEM = '.sel__item';
export const CLOSE = '.tabs__close';

/** A tab's faces (icon, labels, close glyph) and badge: the tab's and a closed tab's copy's. */
export function tabBody(it: TabItem, dismissable: boolean) {
  const icon = it.kind === 'icon';
  return (
    <>
      <SelectionFaces>
        {icon ? (
          it.content
        ) : (
          <>
            {it.Icon && <it.Icon aria-hidden="true" />}
            <TabLabels item={it} />
          </>
        )}
        {dismissable && !icon && (
          // Decorative for assistive tech: Delete closes the focused tab (v11's).
          <span
            className="tabs__close"
            aria-hidden="true"
            data-motion-icon-frame="">
            <Close aria-hidden="true" />
          </span>
        )}
      </SelectionFaces>
      {it.badge && !it.disabled && (
        <span className="tabs__badge" aria-hidden="true" />
      )}
    </>
  );
}

/**
 * A placeholder tab's labels, in the tab's own label markup: the label's bar
 * (out over the icon's slot with `icon`: one bar for the line), and the
 * second line's.
 */
export function skeletonFaceLabels(
  label: string,
  secondary: string | null,
  icon = false
) {
  return (
    <span className="tabs__labels">
      <SelectionSkeletonText className="sel__text" text={label} lead={icon} />
      {secondary != null && (
        <SelectionSkeletonText
          className="tabs__secondary sel__quiet"
          text={secondary}
        />
      )}
    </span>
  );
}

interface TabButtonProps {
  it: TabItem;
  index: number;
  selected: boolean;
  /** The list's one tab stop. */
  tabStop: boolean;
  /** Stable: the list model's attributes for a tab. */
  itemProps: (index: number, state: SelectionItemState) => SelectionItemProps;
  /** `tabs__tab` (horizontal) or `vtabs__tab` (vertical). */
  kind: string;
  dismissable: boolean;
  /** Loading: the placeholder key the tab took over, its takeover number and label. */
  entryKey?: string;
  took?: number;
  takenLabel?: string;
  secondaryText?: string | null;
  skeletonIcon?: boolean;
  /** Stable: records the tab's element by index. */
  setRef: (index: number, el: HTMLButtonElement | null) => void;
  /** Stable: a click with no pointer behind it selects. */
  onCommit: (index: number) => void;
  /** Stable: a click on the close glyph. */
  onClose?: (index: number) => void;
}

/**
 * One tab. Memoized, as every row of a selection list is: a render of the
 * list (a pick, the page's state) re-renders only the tabs whose own props
 * changed; its face is compared by `sameNode` (`sameTab`).
 */
export const TabButton = memo(function TabButton({
  it,
  index: i,
  selected: isSel,
  tabStop,
  itemProps,
  kind,
  dismissable,
  entryKey,
  took,
  takenLabel,
  secondaryText = null,
  skeletonIcon = false,
  setRef,
  onCommit,
  onClose,
}: TabButtonProps) {
  const { className: itemClass, onClick, ...itemRest } = it.props;
  const icon = it.kind === 'icon';
  return (
    <button
      {...itemRest}
      {...rowStructureProps(entryKey, took)}
      ref={(el) => {
        setRef(i, el);
        assignRef(it.ref, el);
      }}
      type="button"
      {...itemProps(i, { selected: isSel, tabStop })}
      aria-label={icon ? it.text : undefined}
      aria-keyshortcuts={dismissable && !it.disabled ? 'Delete' : undefined}
      disabled={it.disabled}
      // The whole tab is its icon's hover frame: hovering (or focusing)
      // anywhere on it plays a motion icon.
      {...(icon || it.Icon ? { 'data-motion-icon-frame': '' } : null)}
      className={[
        'sel__item',
        kind,
        icon && 'sel__item--icon',
        it.secondary && 'tabs__tab--two-line',
        itemClass,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        if (onClose && (e.target as Element).closest(CLOSE)) return onClose(i);
        // Pointer selections happen on pointerup (they can slide or drag);
        // a click with no pointer behind it — Enter, Space, assistive tech — selects here.
        if (e.detail === 0) onCommit(i);
        onClick?.(e);
      }}>
      {tabBody(it, dismissable)}
      {took !== undefined && (
        <SelectionTakenFace
          key={`taken-${took}`}
          label={takenLabel ?? ''}
          icon={skeletonIcon}>
          {skeletonFaceLabels(takenLabel ?? '', secondaryText, skeletonIcon)}
        </SelectionTakenFace>
      )}
    </button>
  );
}, sameTabButton);

function sameTabButton(a: TabButtonProps, b: TabButtonProps): boolean {
  return (
    a.index === b.index &&
    a.selected === b.selected &&
    a.tabStop === b.tabStop &&
    a.itemProps === b.itemProps &&
    a.kind === b.kind &&
    a.dismissable === b.dismissable &&
    a.entryKey === b.entryKey &&
    a.took === b.took &&
    a.takenLabel === b.takenLabel &&
    a.secondaryText === b.secondaryText &&
    a.skeletonIcon === b.skeletonIcon &&
    a.setRef === b.setRef &&
    a.onCommit === b.onCommit &&
    a.onClose === b.onClose &&
    sameTab(a.it, b.it)
  );
}

export interface TabListOptions {
  /** `x`: horizontal tabs. `y`: vertical tabs. */
  axis: 'x' | 'y';
  items: TabItem[];
  activation: KeyboardMode;
  /** The list's resolved kit style. */
  style: ResolvedSelectionStyle;
  /** What re-places the selector when it changes. */
  layoutKey: string;
  /** Keep the selected tab in view when the list scrolls. */
  scrollIntoView: boolean;
  /** How far in from the scroller's ends a revealed tab sits, px. */
  revealPad: (tab: DOMRect, wrap: HTMLElement | null) => number;
  /** The tooltip's side of the tab. */
  tipAlign: 'bottom' | 'right';
  /** The pointer between tabs hides the tooltip (horizontal tabs). */
  hideTipBetween?: boolean;
  /** A line frame: only the move's two ends restyle (`.sel--ends`). */
  ends?: boolean;
  /** Loading tabs: the selector arrives on the selected tab when it lands. */
  load?: { active: boolean; busy: boolean };
  /** The selector holds where it is (on a closed tab's copy): no glide to the selection yet. */
  holding?: () => boolean;
  /** The selector is being carried (a close): it has no resting place. */
  carrying?: () => boolean;
  /** The list element's ref, when the list needs it before this hook (loading). */
  rootRef?: RefObject<HTMLDivElement>;
  /** Keys handled before the list's (Delete on a dismissable tab): true when handled. */
  onKey?: (e: ReactKeyboardEvent<HTMLDivElement>, index: number) => boolean;
  /** The list element's own props: its key and focus handlers run first. */
  rest: HTMLAttributes<HTMLDivElement>;
}

/** A tab list's state and behavior; the list draws its own markup with it. */
export function useTabList(who: string, o: TabListOptions) {
  const ctx = useTabs(who);
  const { baseId, selected, select, style: s, motion: m, onMove } = ctx;
  const { axis, items, style, layoutKey, rest } = o;

  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ownRootRef = useRef<HTMLDivElement>(null);
  const rootRef = o.rootRef ?? ownRootRef;
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const setItemRef = useCallback((i: number, el: HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  }, []);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useLatest(reduced);
  const mRef = useLatest(m);
  const selectedRef = useLatest(selected);
  const itemsRef = useLatest(items);
  const oRef = useLatest(o);

  /* ── the selection ──────────────────────────────────────────────────── */

  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced,
    onMove,
    getRest: () =>
      oRef.current.holding?.() || oRef.current.carrying?.()
        ? null
        : (itemRefs.current[selectedRef.current] ?? null),
    layoutKey,
  });

  useSelectedWeight(rootRef, {
    weight: style.selectedWeight,
    holdWidth: s.holdWidth,
    itemSelector: ITEM,
    key: layoutKey,
  });
  useSelectionEnds(
    rootRef,
    () => itemRefs.current[selected],
    !!o.ends,
    layoutKey
  );
  useIconPixelSnap(rootRef, '.sel__face svg', layoutKey);

  /** Bring a tab clear of the list's ends (buttons, soft or gradient edges), in the list's own scroller only. */
  const reveal = useCallback(
    (index: number, instant = false) => {
      const el = itemRefs.current[index];
      const sc = scrollerRef.current;
      if (!el || !sc) return;
      const x = axis === 'x';
      if (
        x
          ? sc.scrollWidth <= sc.clientWidth + 1
          : sc.scrollHeight <= sc.clientHeight
      )
        return;
      const v = sc.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const pad = oRef.current.revealPad(b, wrapRef.current);
      const [lo, hi, vlo, vhi] = x
        ? [b.left, b.right, v.left, v.right]
        : [b.top, b.bottom, v.top, v.bottom];
      let d = 0;
      if (lo - pad < vlo) d = lo - pad - vlo;
      else if (hi + pad > vhi) d = hi + pad - vhi;
      if (Math.abs(d) > 0.5)
        sc.scrollBy({
          [x ? 'left' : 'top']: d,
          behavior: instant || reducedRef.current ? 'auto' : 'smooth',
        });
    },
    [axis, oRef, reducedRef]
  );

  // A selection from anywhere (a click, a key, the prop) glides there — unless
  // the gesture that made it already sent the selector on its way. The first
  // placement scrolls at once: never an entrance. Loading: nothing is marked
  // until the selected tab lands; then the selector arrives on it.
  const revealed = useRef(false);
  const loadActive = !!o.load?.active;
  const loadBusy = !!o.load?.busy;
  const { scrollIntoView } = o;
  useLayoutEffect(() => {
    const sel = selRef.current;
    const el = itemRefs.current[selected];
    if (sel && el && loadActive && !sel.shown()) sel.show(el);
    else if (sel && el && sel.target() !== el && !oRef.current.holding?.())
      sel.moveTo(el);
    if (scrollIntoView && el) reveal(selected, !revealed.current);
    if (el) revealed.current = true;
  }, [selected, selRef, scrollIntoView, reveal, loadActive, loadBusy, oRef]);

  // As v11: a disabled tab can't be the selection on first render; the first enabled tab is.
  useEffect(() => {
    const its = itemsRef.current;
    if (!its[selectedRef.current]?.disabled) return;
    const first = its.findIndex((it) => !it.disabled);
    if (first >= 0) select(first);
    // First render only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The tab a move lands on keeps its hover round the selector until it has
  // landed (selection-kit `useLandingHold`, `data-landing`).
  const hold = useLandingHold({
    root: () => rootRef.current,
    sel: () => selRef.current,
    reduced: () => reducedRef.current,
  });
  const commit = useCallback(
    (index: number, how: LandingHold = 'hover-focus') => {
      const item = itemsRef.current[index];
      const el = itemRefs.current[index];
      if (!item || item.disabled || !el) return;
      hold(el, selRef.current?.moveTo(el), how);
      select(index);
    },
    [itemsRef, selRef, select, hold]
  );
  // A click with no pointer behind it: stable, so the memoized tabs hold.
  const commitByClick = useStableCallback((i: number) => commit(i));

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

  /** The gesture started on the selected tab: a grab (and maybe a drag) of the selector. */
  const grabbed = useRef(false);
  const { onPointerDown: gestureDown, gesture } = useSelectionGesture({
    rootRef,
    selRef,
    axis,
    items: () => itemRefs.current,
    isDisabled: (i) => !!itemsRef.current[i]?.disabled,
    selected: () => selectedRef.current,
    motion: () => mRef.current,
    // A press holds its tab's hover; a drag of the selector had none.
    commit: (i) => commit(i, grabbed.current ? 'none' : 'hover'),
    onPress: () => tipRef.current?.hide(true),
  });
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    grabbed.current = !!(e.target as Element).closest(
      `${ITEM}[aria-selected="true"]`
    );
    gestureDown(e, ITEM);
  };

  /* ── keyboard: the tablist's contract, tab stop and keys ─────────────── */

  const id = useCallback((i: number) => tabId(baseId, i), [baseId]);
  const controls = useCallback((i: number) => panelId(baseId, i), [baseId]);
  const list = useSelectionList({
    role: 'tablist',
    orientation: axis === 'x' ? 'horizontal' : 'vertical',
    selected,
    count: items.length,
    isDisabled: (i) => !!items[i]?.disabled,
    activation: o.activation,
    id,
    controls,
    focus: (i) => {
      itemRefs.current[i]?.focus({ preventScroll: true });
      reveal(i);
    },
    // Its focus only just arrived: only a resting pointer's hover is held.
    select: (i) => commit(i, 'hover'),
  });

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn || e.defaultPrevented) return;
    const index = Number(btn.dataset.index);
    if (e.key === 'Escape' && !isComposing(e))
      return tipRef.current?.hide(true);
    if (oRef.current.onKey?.(e, index)) return;
    list.onKeyDown(e, index);
  };

  /* ── the tooltip: icon tabs, and labels cut short ────────────────────── */

  const tipElRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<TooltipController | null>(null);
  useEffect(() => {
    if (!tipElRef.current) return;
    const t = createTooltip(tipElRef.current, {
      reduced: () => reducedRef.current,
    });
    tipRef.current = t;
    return () => {
      t.destroy();
      tipRef.current = null;
    };
  }, [reducedRef]);
  // Slow motion reaches the tooltip too.
  useEffect(() => {
    tipRef.current?.configure({ timeScale: m.timeScale });
  }, [m.timeScale]);

  const showTip = (index: number, pointer: { x: number; y: number } | null) => {
    const item = itemsRef.current[index];
    const btn = itemRefs.current[index];
    const wrap = wrapRef.current;
    const text = item?.kind === 'icon' ? item.text : truncatedText(btn, item);
    if (!text || !btn || !wrap)
      return tipRef.current?.hide(pointer == null, pointer);
    const w = wrap.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    tipRef.current?.show({
      key: String(index),
      text,
      anchor: {
        l: b.left - w.left,
        t: b.top - w.top,
        r: b.right - w.left,
        b: b.bottom - w.top,
      },
      align: oRef.current.tipAlign,
      pointer,
    });
  };

  const onPointerOver = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (gesture.current?.mode === 'drag') return;
    const at = { x: e.clientX, y: e.clientY };
    // On the tooltip itself (hoverable, WCAG 1.4.13): it stays.
    if (tipElRef.current?.contains(e.target as Node))
      return tipRef.current?.hold(at);
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (btn && rootRef.current?.contains(btn))
      showTip(Number(btn.dataset.index), at);
    else if (oRef.current.hideTipBetween) tipRef.current?.hide(false, at);
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) =>
    tipRef.current?.hide(false, { x: e.clientX, y: e.clientY });

  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    rest.onFocus?.(e);
    const btn = (e.target as Element).closest<HTMLButtonElement>(ITEM);
    if (!btn || !btn.matches(':focus-visible')) return;
    reveal(Number(btn.dataset.index));
    showTip(Number(btn.dataset.index), null);
  };

  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    rest.onBlur?.(e);
    if (!rootRef.current?.contains(e.relatedTarget as Node | null))
      tipRef.current?.hide(true);
  };

  /* ── overflow: the marks at the ends where the list has more ─────────── */

  useLayoutEffect(() => {
    const sc = scrollerRef.current;
    const wrap = wrapRef.current;
    if (!sc || !wrap) return;
    const update = () => {
      if (axis === 'x') {
        const max = sc.scrollWidth - sc.clientWidth;
        // From the inline start: right to left, scrollLeft runs from 0 down to -max.
        const at = Math.abs(sc.scrollLeft);
        wrap.toggleAttribute('data-overflow-start', max > 1 && at > 1);
        wrap.toggleAttribute('data-overflow-end', max > 1 && at < max - 1);
      } else {
        wrap.toggleAttribute('data-overflow-top', sc.scrollTop > 1);
        wrap.toggleAttribute(
          'data-overflow-bottom',
          sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1
        );
      }
    };
    update();
    const ro =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(sc);
    if (rootRef.current) ro?.observe(rootRef.current);
    sc.addEventListener('scroll', update, { passive: true });
    return () => {
      ro?.disconnect();
      sc.removeEventListener('scroll', update);
    };
  }, [layoutKey, axis]);

  /* ── the list element ────────────────────────────────────────────────── */

  const { onKeyDown: _k, onFocus: _f, onBlur: _b, ...domRest } = rest;
  const rootStyle: CSSProperties | undefined =
    style.selectedWeight != null
      ? { ['--sel-on-weight' as string]: style.selectedWeight }
      : undefined;

  return {
    ctx,
    list,
    wrapRef,
    scrollerRef,
    rootRef,
    itemRefs,
    setItemRef,
    reduced,
    reducedRef,
    mRef,
    selectedRef,
    itemsRef,
    selRef,
    reveal,
    commitByClick,
    tipElRef,
    onPointerOver,
    onPointerLeave,
    /** The list element's props: its role and orientation, handlers and style. */
    listProps: {
      ...domRest,
      ...list.listProps,
      ref: rootRef,
      style: rootStyle,
      onPointerDown,
      onKeyDown,
      onFocus,
      onBlur,
    },
  };
}
