/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  SNAP_FRAME,
  animateLayout,
  followLayout,
  attachRollover,
  motionTokens,
  selectionDuration,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { ChevronLeft, ChevronRight } from '@carbon-labs/react-motion-icons';
import {
  SelectionMarker,
  resolveSelectionStyle,
  useLatest,
  type SelectionSize,
} from '@carbon-labs/react-selection-kit';
import {
  inertProps,
  useDirection,
  useReducedGetter,
  useStableCallback,
} from '@carbon-labs/react-util';
import {
  TabsContext,
  readTabs,
  useTabs,
  useTabsRoot,
  type TabItem,
  type TabsRootProps,
  type TabsSize,
} from './shared';
import { CLOSE, TabButton, tabBody, useTabList } from './list';
import type { KeyboardMode } from '@carbon-labs/react-props';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tabs.scss';

/* ============================================================================
 * Tabs — Carbon v11's Tabs / TabList / Tab / IconTab / TabPanels / TabPanel,
 * on the selection family's look and motion.
 * The horizontal sibling of vertical tabs (./TabsVertical.tsx).
 * ============================================================================
 *
 *   line        (default) the selector is a 2px underline on the family's
 *               hairline; the selected label turns primary text, and heavier,
 *               where the underline's span covers it. Square by default; the
 *               underline is blue with `variant="hero"`. `frame="line"`:
 *               the rule the selector rides
 *   inset       `frame="inset"` (v11's `contained`): the content switcher's
 *               track and selector (`variant` inverse by default, tonal,
 *               outlined, hero). Rounded by default
 *   glide       either selector travels from where it is on the kit's
 *               timing, its leading edge ahead (the kit's stretch); press
 *               reaches, slides retarget, drag lands on the nearest tab
 *   hover       the kit's rollover on unselected tabs and a label step to
 *               primary; motion icons play on the tab's hover
 *   icons       `renderIcon` before the label; `IconTab`, icon only, with
 *               the kit's tooltip (and `badgeIndicator`, a dot)
 *   overflow    the list scrolls (no scrollbar): scroll buttons at the ends
 *               with more, the family's 16px soft edge inside them, the
 *               selected (or focused) tab kept clear of both
 *   dismissable a close glyph on each tab and Delete on the focused one call
 *               `onTabCloseRequest(index)`; focus lands on the tab after.
 *               One motion: the closed tab's copy fades as its space closes
 *               and the tabs after it slide in; a closed selected tab's
 *               selector glides on into its new tab as that tab slides
 *   panels      the content swap along x, in the direction the selector
 *               moved, in a container that resizes as a window
 *   keyboard    the kit's list model (`useSelectionList`): ← / → wrap and
 *               skip disabled tabs, in reading order (right to left, ← is
 *               next), Home / End; automatic or manual activation; the kit's
 *               keyboard-only rings
 *
 * The list's behavior (selection, keys, rollover, gesture, tooltip,
 * overflow) is shared with vertical tabs (./list.tsx); this file adds the
 * scroll buttons and closing a tab.
 * ========================================================================== */

/** The kit size each tab size takes its type, padding and icon from. */
const KIT_SIZE: Record<TabsSize, SelectionSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
};

/** A close the list asked for: the tab, as it was. */
interface Closing {
  id: number;
  index: number;
  /** The list's length when it asked. */
  count: number;
  item: TabItem;
  selected: boolean;
}

/** A closed tab's copy, playing out before the tab now at `index` (or at the end). */
interface Leaving {
  id: number;
  index: number;
  item: TabItem;
  /** A closed selected tab's: the selector glides on from it to the new selection. */
  held: boolean;
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

export interface TabsProps extends TabsRootProps {
  /** A `TabList` and a `TabPanels`. */
  children?: ReactNode;
  /** Every tab gets a close glyph, and Delete on a tab asks to close it. */
  dismissable?: boolean;
  /** Called with the tab's index when it asks to close; remove the tab in response. */
  onTabCloseRequest?: (index: number) => void;
}

/** The tabs' state: a provider for a `TabList` and its `TabPanels` (no element of its own, as v11's). */
export function Tabs({
  children,
  dismissable = false,
  onTabCloseRequest,
  ...root
}: TabsProps) {
  const { ctx } = useTabsRoot({
    ...root,
    prefix: 'tabs',
    axis: 'x',
    dismissable,
    onTabCloseRequest,
  });
  useEffect(() => {
    if (dismissable && !onTabCloseRequest)
      console.error('Tabs: `dismissable` without `onTabCloseRequest`.');
  }, [dismissable, onTabCloseRequest]);
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}
Tabs.displayName = 'Tabs';

/* ── TabList ───────────────────────────────────────────────────────────── */

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** `automatic` (default): arrows select. `manual`: arrows move focus; Enter / Space select. */
  activation?: KeyboardMode;
  'aria-label'?: string;
  /** `Tab` and `IconTab` elements. */
  children?: ReactNode;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /**
   * What the tabs stand on. `line` (default): the underline on the
   * family's hairline. `inset`: the content switcher's track and selector
   * (v11's `contained`).
   */
  frame?: 'line' | 'inset';
  /** `hug` (default): each tab sized by its label. `fill`: the tabs share the list's width equally (the content switcher's `fit`). */
  fit?: 'hug' | 'fill';
  /** Icon tabs' icon: `default` 16px, `lg` 20px (and the lg size, unless `size` is given). */
  iconSize?: 'default' | 'lg';
  /** Spread onto the scroll buttons, as v11's: left onto the previous (the right one, right to left), right onto the next. */
  leftOverflowButtonProps?: HTMLAttributes<HTMLButtonElement>;
  rightOverflowButtonProps?: HTMLAttributes<HTMLButtonElement>;
  /** @deprecated in v11 for `Layer`; accepted and ignored. */
  light?: boolean;
  /** v11: accepted and ignored (the scroll state updates on every scroll). */
  scrollDebounceWait?: number;
  /** Keep the selected tab in view when the list scrolls. Default true. */
  scrollIntoView?: boolean;
  /** sm 32 / md 40 / lg 48 / xl 64px. Default md, inset lg (v11's contained). */
  size?: TabsSize;
}

/** How far in from the scroller's ends a tab must sit to be clear: a scroll button and the soft edge. */
function edgePad(wrap: HTMLElement | null): number {
  if (!wrap) return 0;
  const btn =
    wrap.querySelector<HTMLElement>('.tabs__scroll')?.offsetWidth ?? 0;
  return (
    btn +
    (parseFloat(
      getComputedStyle(wrap).getPropertyValue('--cds-motion-soft-edge')
    ) || 16)
  );
}

export function TabList({
  activation = 'automatic',
  children,
  frame = 'line',
  fit = 'hug',
  iconSize,
  leftOverflowButtonProps,
  rightOverflowButtonProps,
  light: _light,
  scrollDebounceWait: _wait,
  scrollIntoView = true,
  size: sizeProp,
  className,
  style: styleProp,
  ...rest
}: TabListProps) {
  const contained = frame === 'inset';
  const fullWidth = fit === 'fill';
  const {
    selected,
    select,
    style: s,
    motion: m,
    dismissable,
    onTabCloseRequest,
  } = useTabs('TabList');
  const items = readTabs(children);
  const size: TabsSize =
    sizeProp ?? s.size ?? (contained || iconSize === 'lg' ? 'lg' : 'md');
  const twoLine = items.some((it) => it.secondary);
  // Line tabs have two looks: the underline in the inverse selector's color,
  // or with `variant="hero"` in the brand blue. The other variants and their
  // dials are the contained track's.
  const hero = s.variant === 'hero';
  // Square line tabs, rounded contained ones.
  const corners = s.corners ?? (contained ? 'rounded' : 'square');
  const style = resolveSelectionStyle(
    {
      ...s,
      corners,
      size: KIT_SIZE[size],
      // The frame, so the track's opt-in hairline (`outline`) is an inset track's only.
      frame,
      ...(contained
        ? null
        : { variant: hero ? 'hero' : 'inverse', lowContrast: false }),
    },
    m
  );

  // A closed selected tab's copy, until its close starts: the selector stays
  // where it is (on the copy, or mid-glide from an earlier close), rather
  // than being re-placed on the new selection as the list changes; then it
  // glides on from there, with the close.
  const heldRef = useRef<HTMLElement | null>(null);
  // Closes carrying the selector to its new tab: the engine leaves it alone
  // meanwhile too (it isn't re-placed mid-glide if the list changes again).
  const carrying = useRef(0);

  const layoutKey = `${items.map((it) => `${it.key}:${it.secondary ?? ''}`).join('|')}/${size}/${contained}/${fullWidth}/${dismissable}/${iconSize}`;
  const {
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
    commitByClick,
    tipElRef,
    onPointerOver,
    onPointerLeave,
    listProps,
  } = useTabList('TabList', {
    axis: 'x',
    items,
    activation,
    style,
    layoutKey,
    scrollIntoView,
    // Clear of a scroll button and the soft edge.
    revealPad: (_b, wrap) => edgePad(wrap),
    tipAlign: 'bottom',
    hideTipBetween: true,
    holding: () => !!heldRef.current,
    carrying: () => carrying.current > 0,
    onKey: (e, index) => {
      if (e.key !== 'Delete' || !dismissable) return false;
      e.preventDefault();
      requestClose(index);
      return true;
    },
    rest,
  });
  const rolloverReduced = useReducedGetter();
  const closeRef = useLatest(onTabCloseRequest);

  /* ── closed tabs, leaving (see "closing a tab" below) ───────────────── */

  // A close asked for, until the list answers by losing that tab.
  const [closing, setClosing] = useState<Closing | null>(null);
  // Copies of closed tabs, playing out where they were.
  const [leaving, setLeaving] = useState<Leaving[]>([]);
  const [seenCount, setSeenCount] = useState(items.length);
  if (items.length !== seenCount) {
    setSeenCount(items.length);
    if (closing) {
      setClosing(null);
      if (!reduced && items.length === closing.count - 1) {
        const c = closing;
        setLeaving((l) => [
          // A copy after the closed tab moves down a place with the tabs it stands before.
          ...l.map((p) =>
            p.index > c.index ? { ...p, index: p.index - 1 } : p
          ),
          { id: c.id, index: c.index, item: c.item, held: c.selected },
        ]);
      }
    }
  }
  // Tabs closed past the selection: the last enabled tab is selected.
  useEffect(() => {
    const its = itemsRef.current;
    if (!its.length || selected < its.length) return;
    let last = its.length - 1;
    while (last >= 0 && its[last]!.disabled) last--;
    if (last >= 0) select(last);
  }, [items.length, selected, itemsRef, select]);

  /* ── closing a tab ───────────────────────────────────────────────────── */

  // The tab to focus once the list has changed: the one that took the closed
  // tab's place, or the one before it if it was the last (v11's).
  const pendingFocus = useRef<{ index: number; count: number } | null>(null);
  const closeSeq = useRef(0);
  const requestClose = (index: number) => {
    const item = itemsRef.current[index];
    if (!dismissable || !item || item.disabled) return;
    pendingFocus.current = { index, count: itemsRef.current.length };
    closeSeq.current += 1;
    setClosing({
      id: closeSeq.current,
      index,
      count: itemsRef.current.length,
      item,
      selected: index === selectedRef.current,
    });
    closeRef.current?.(index);
  };

  // Leaving, in one motion. When the list loses the
  // tab, a copy of it stays in its place, out of the tab order and hidden
  // from assistive tech, and everything goes at once, on one clock and the
  // glide's curve: the copy's content fades while its width, and the gap
  // after it, close as one layout transaction on the track, and the tabs
  // after it slide in. A closed selected tab's selector never leaves: from
  // the copy it glides to where its new tab lands, so it stretches (or
  // rides) into that tab as the tab slides under it, and the tab's label
  // turns selected exactly where the selector covers it. The clock is the
  // glide's step for the farthest travel: the space closing or the
  // selector's. Focus moves at once. Reduced motion: no copy, the
  // tab is simply gone.
  const leavingEls = useRef(new Map<number, HTMLElement>());
  /** Each copy's layout move while it runs. */
  const closes = useRef(new Map<number, Animation>());
  const started = useRef(new Set<number>());
  const settle = useRef(false);

  // While a close runs, the selector's items are read every frame: tabs
  // slide under a selector that may be gliding, so their boxes (the frame
  // the selected labels are windowed in) must be where the tabs are now.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return followLayout(root, (_p, tx) => {
      if (tx.root === root && tx.reason === 'tab-close')
        selRef.current?.measure();
    });
  }, [selRef]);

  /**
   * `read` on the layout the closes under way land on: each runs to its end
   * for the read, then back to where it was (one task: nothing paints).
   */
  const landed = useCallback((read: () => void) => {
    const back = [...closes.current.values()].map((a) => {
      const t = a.currentTime;
      a.currentTime = Math.max(
        0,
        Number(a.effect?.getComputedTiming().endTime ?? 0) - 0.01
      );
      return () => {
        a.currentTime = t;
      };
    });
    try {
      read();
    } finally {
      back.forEach((b) => b());
    }
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Several tabs closed in one commit: every copy's width (and the gap) read before any is
    // written to, so no pass reads layout after the one before it wrote.
    const fresh = leaving.flatMap((p) => {
      const el = leavingEls.current.get(p.id);
      return el && !started.current.has(p.id) ? [{ p, el }] : [];
    });
    if (!fresh.length) return;
    const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
    const widths = fresh.map(({ el }) => el.getBoundingClientRect().width);
    for (const [i, { p, el }] of fresh.entries()) {
      started.current.add(p.id);
      if (heldRef.current === el) heldRef.current = null;
      const m = mRef.current;
      const w = widths[i]!;
      // Its own width from here on (a full-width list shares the rest among
      // the others), and the layout it lands on: no width, the gap taken back.
      el.style.flex = '0 0 auto';
      el.style.inlineSize = '0px';
      el.style.marginInlineEnd = `${-gap}px`;

      // A closed selected tab hands the selection on: to the selection, or
      // past the end, the last enabled tab.
      let to: HTMLElement | null = null;
      if (p.held) {
        const its = itemsRef.current;
        let i = selectedRef.current;
        if (i >= its.length) {
          i = its.length - 1;
          while (i >= 0 && its[i]!.disabled) i--;
        }
        to = i >= 0 ? (itemRefs.current[i] ?? null) : null;
      }

      // The farthest travel: the space closing (the tabs after it move that
      // far), or the selector's way to where its new tab lands.
      let travel = w + gap;
      const sel = selRef.current;
      if (sel && to) {
        const target = to;
        landed(() => {
          const a = sel.live();
          const b = sel.rectOf(target);
          travel = Math.max(
            travel,
            ...(['l', 't', 'r', 'b'] as const).map((e) => Math.abs(b[e] - a[e]))
          );
          // The selector's glide, on the close's clock (never a wrap, even
          // just after an arrow key).
          const token = selectionDuration(travel, m.timing);
          sel.configure({ timing: [{ under: Infinity, token }] });
          sel.moveTo(target, { direction: undefined });
          sel.configure({ timing: m.timing });
        });
        carrying.current += 1;
      }
      const ms =
        motionTokens.duration[selectionDuration(travel, m.timing)] *
        m.timeScale;
      const easing = cubicBezier([...m.ease]);
      const done = () => {
        if (!closes.current.delete(p.id)) return;
        if (to) carrying.current -= 1;
        settle.current = true;
        setLeaving((l) => l.filter((x) => x.id !== p.id));
      };
      // Fade and close start now, on the selector's clock (just after its
      // glide's start), not on the next frame that paints: a slow frame
      // mustn't put them behind it. Before their first frame they hold their
      // start (a copy at its full width, opaque).
      const t0 = performance.now();
      const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: ms,
        easing,
        fill: 'both',
      });
      fade.startTime = t0;
      const { animation } = animateLayout(
        root,
        el,
        {
          inlineSize: [`${w}px`, '0px'],
          marginInlineEnd: ['0px', `${-gap}px`],
        },
        { ms, easing, reason: 'tab-close' }
      );
      animation.effect?.updateTiming({ fill: 'backwards' });
      animation.startTime = t0;
      closes.current.set(p.id, animation);
      void animation.finished.then(done, done);
    }
  }, [leaving, mRef, selRef, itemsRef, selectedRef, landed]);

  // A copy gone: the selector re-measures, and rests on the selection.
  useLayoutEffect(() => {
    if (!settle.current) return;
    settle.current = false;
    const sel = selRef.current;
    const el = itemRefs.current[selectedRef.current];
    if (!sel || !el) return;
    sel.measure();
    if (sel.target() !== el && !carrying.current)
      sel.moveTo(el, { instant: true });
  }, [leaving, selRef, selectedRef]);

  useEffect(
    () => () => {
      leavingEls.current.forEach((el) =>
        el.getAnimations().forEach((a) => a.cancel())
      );
    },
    []
  );
  useLayoutEffect(() => {
    const p = pendingFocus.current;
    if (!p || p.count === items.length) return;
    pendingFocus.current = null;
    const its = itemsRef.current;
    let i = Math.min(p.index, its.length - 1);
    while (i >= 0 && its[i]?.disabled) i--;
    const el = i >= 0 ? itemRefs.current[i] : null;
    const active = document.activeElement;
    if (
      el &&
      (!active || active === document.body || rootRef.current?.contains(active))
    )
      el.focus({ preventScroll: true });
  }, [items.length, itemsRef]);

  // A press on a close glyph is the glyph's, not the tab's: no reach, no
  // drag, no press on the tab (a capture listener, ahead of the rollover's).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest?.(CLOSE)) e.stopPropagation();
    };
    root.addEventListener('pointerdown', onDown, true);
    return () => root.removeEventListener('pointerdown', onDown, true);
  }, []);

  /* ── the scroll buttons ─────────────────────────────────────────────── */

  // The scroll buttons: the kit's rollover too.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    return attachRollover(wrap, {
      selector: '.tabs__scroll',
      colors: 'tokens',
      timeScale: m.timeScale,
      reduced: rolloverReduced,
    });
  }, [m.timeScale, rolloverReduced, wrapRef]);

  // Previous is toward the inline start: the right, right to left.
  const rtl = useDirection(wrapRef) === 'rtl';

  /** A scroll button: a page of tabs that way, less what the buttons and edges cover. */
  const scrollPage = (dir: 1 | -1) => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const page = Math.max(sc.clientWidth - 2 * edgePad(wrapRef.current), 48);
    sc.scrollBy({
      left: (rtl ? -dir : dir) * page,
      behavior: reducedRef.current ? 'auto' : 'smooth',
    });
  };

  /* ── render ──────────────────────────────────────────────────────────── */

  // A click on a close glyph: stable, so the memoized tabs hold.
  const closeByClick = useStableCallback(requestClose);

  /** A closed tab's copy, playing out where it was: no role, no focus, no pointer. */
  const leavingCopy = (p: Leaving) => (
    <span
      key={`~leaving-${p.id}`}
      ref={(el) => {
        if (el) {
          leavingEls.current.set(p.id, el);
          if (p.held && !started.current.has(p.id)) heldRef.current = el;
        } else leavingEls.current.delete(p.id);
      }}
      aria-hidden="true"
      {...inertProps(true)}
      className={[
        'sel__item',
        'tabs__tab',
        'tabs__tab--leaving',
        p.item.kind === 'icon' && 'sel__item--icon',
        p.item.secondary && 'tabs__tab--two-line',
      ]
        .filter(Boolean)
        .join(' ')}>
      {tabBody(p.item, dismissable)}
    </span>
  );

  const scrollButton = (
    dir: 1 | -1,
    props?: HTMLAttributes<HTMLButtonElement>
  ) => {
    const left = rtl ? dir > 0 : dir < 0;
    const Icon = left ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        // As v11's: out of the tab order and hidden from assistive tech — the arrows reach every tab.
        tabIndex={-1}
        aria-hidden="true"
        aria-label={left ? 'Scroll left' : 'Scroll right'}
        data-motion-icon-frame=""
        {...props}
        className={[
          'tabs__scroll',
          dir < 0 ? 'tabs__scroll--prev' : 'tabs__scroll--next',
          // Full round, as an icon on its own hovers, unless the
          // tabs are given `corners="square"` (line tabs' own square default
          // doesn't reach it).
          s.corners === 'square' && 'tabs__scroll--square',
          props?.className,
        ]
          .filter(Boolean)
          .join(' ')}
        // Keep focus where it is.
        onMouseDown={(e) => {
          e.preventDefault();
          props?.onMouseDown?.(e);
        }}
        onClick={(e) => {
          scrollPage(dir);
          props?.onClick?.(e);
        }}>
        <Icon aria-hidden="true" />
      </button>
    );
  };

  return (
    <div
      ref={wrapRef}
      className={[
        'tabs',
        contained ? 'tabs--contained' : 'tabs--line',
        `tabs--${size}`,
        twoLine && 'tabs--two-line',
        fullWidth && 'tabs--full-width',
        dismissable && 'tabs--dismissable',
        iconSize && `tabs--icon-${iconSize}`,
        hero && 'tabs--hero',
        corners === 'square' && 'tabs--square',
        corners === 'full' && 'tabs--full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={styleProp}
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}>
      {scrollButton(-1, leftOverflowButtonProps)}
      <div className="tabs__scroller" ref={scrollerRef}>
        <div
          {...listProps}
          className={[...style.classes, 'tabs__track', fullWidth && 'sel--fill']
            .filter(Boolean)
            .join(' ')}>
          <SelectionMarker />
          {items.flatMap((it, i) => {
            const isSel = i === selected;
            const before = leaving
              .filter((p) => p.index === i)
              .map(leavingCopy);
            return [
              ...before,
              <TabButton
                key={it.key}
                it={it}
                index={i}
                selected={isSel}
                tabStop={i === list.tabStop}
                itemProps={list.itemProps}
                kind="tabs__tab"
                dismissable={dismissable}
                setRef={setItemRef}
                onCommit={commitByClick}
                onClose={closeByClick}
              />,
            ];
          })}
          {leaving.filter((p) => p.index >= items.length).map(leavingCopy)}
        </div>
      </div>
      {scrollButton(1, rightOverflowButtonProps)}
      <div
        className="sel__tip sel__tip--hoverable"
        ref={tipElRef}
        hidden
        aria-hidden="true">
        <span className="sel__tip-frame" {...SNAP_FRAME} />
        <span className="sel__tip-text" />
      </div>
    </div>
  );
}
TabList.displayName = 'TabList';
