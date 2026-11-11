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
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  attachRollover,
  motionTokens,
  playContentSwap,
} from '@carbon-labs/v12-motion';
import { ChevronLeft, ChevronRight } from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionMarker,
  resolveSelectionStyle,
  rolloverItems,
  useItemRollover,
  useLatest,
  useSelectionEngine,
  type SelectionMotion,
} from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import { RollText } from '@carbon-labs/react-roll-text';
import { Tooltip } from '@carbon-labs/react-tooltip';
import {
  addDays,
  addMonths,
  ariaDate,
  compareDay,
  describeMarks,
  fromIsoDay,
  isoDay as iso,
  MAX_PIPS,
  monthGrid,
  monthKey,
  sameDay,
  startOfMonth,
  type CalendarLocale,
  type DateMarkKind,
  type ResolvedDateMark,
} from './dates';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './date-picker.scss';
import { useReducedGetter } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * The calendar — the month the DatePicker opens on.
 * Presentational: the DatePicker owns the dates, the month shown and the
 * focused day; this draws them and reports keys, picks and hovers.
 * ============================================================================
 *
 *   header    the month nav (ghost buttons on the rollover, motion-icons'
 *             chevrons), the month's name rolling to the next (RollText,
 *             horizontal: a later month enters from the right) and the year
 *             as v11's number field (↑ / ↓ step it)
 *   days      six weeks, always (flatpickr's 42 days), so a month change
 *             never resizes the surface. Each month is a selection root (the
 *             kit's): its days are the kit's items — the rollover's hover,
 *             today a 1px stroke on the same surface (neutral), disabled
 *             days quiet; picked, today keeps a 2px ring outside the selector
 *   marker    the kit's marker on the picked day, in the hero blue: it
 *             glides from day to day within a month (by travel, 40–160ms),
 *             arrives (grows in) on a first pick, and comes with the month
 *             when the month changes — each month carries its own
 *   range     nothing travels from one end to the other. The band previews
 *             under the pointer (or the keys) in a light tint of the blue,
 *             its free end rounded; picking the end grows the marker in
 *             where it is (the kit's arrival) and the band firms to its own
 *             tint. The end picked first is painted still, in the marker's
 *             colors. A press on a day starts a range there and the band
 *             follows the drag; the release sets the end. Holding the drag
 *             on the month nav, past the grid's side or on a day of the
 *             next or previous month turns the month (`HOLD_MS`)
 *   pips      marked dates: up to three dots under the number in the
 *             support colors (ringed in the label's white on a picked day),
 *             the events read with the day's name and shown in the kit's
 *             Tooltip on hover and keyboard focus (stillness: only the first
 *             of a run snaps in)
 *   swap      a month change is a content swap (`playContentSwap`): the old
 *             days leave 8px away and fade, then the new ones come in from
 *             8px on the side of travel — never overlapping
 *   reduced   the swap a snap; the marker fades
 *             in place; the band is simply there
 * ========================================================================== */

/**
 * A drag held on the month's edge turns the month after this long, and again
 * as long as it's held: slow-02 (520ms), long enough that sweeping past the
 * arrows doesn't turn it.
 */
const HOLD_MS = motionTokens.duration['slow-02'];
/** A touch waits this long before it drags (sooner, a move is a scroll). React Aria's figure. */
const TOUCH_ARM_MS = 200;
/** How far a touch may move before it's a scroll. */
const TOUCH_SLOP = 8;

export interface CalendarProps {
  /** The grid's id (the days' ids derive from it). */
  id: string;
  /** The month shown (any day in it). */
  view: Date;
  /** The day with the roving tab stop (and, from the keys, focus). */
  focused: Date;
  mode: 'single' | 'range';
  /** The picked days, in order (a range's start, then its end). */
  dates: Date[];
  /** The index in `dates` the marker sits on: the end picked last. */
  markerIndex: number;
  /** A range's provisional end while only its start is picked (the hovered or focused day). */
  preview: Date | null;
  isEnabled: (d: Date) => boolean;
  locale: CalendarLocale;
  /** The months the nav can reach, by `monthKey`. */
  minMonth: number | null;
  maxMonth: number | null;
  prevMonthAriaLabel: string;
  nextMonthAriaLabel: string;
  /** Show another month (the nav, the year field, a key). */
  onView: (month: Date) => void;
  /** Move the tab stop (a key); `focus`: move DOM focus there too. */
  onFocusDay: (d: Date) => void;
  onPick: (d: Date) => void;
  onHoverDay: (d: Date | null) => void;
  /** Marked dates by `isoDay`: pips under the number, read with the day. */
  marks?: Map<string, ResolvedDateMark[]>;
  /** Range: a press on a day (a click or a drag starts). */
  onPressDay?: (d: Date) => void;
  /** Range: the press dragged onto another day. */
  onDragDay?: (d: Date) => void;
  /** Range: the press ended; `cancel` (Escape, a scroll took the touch) puts the dates back. */
  onRelease?: (cancel: boolean) => void;
  /** Keys the picker handles (Tab, Escape); return true when handled. */
  onGridKey?: (e: ReactKeyboardEvent<HTMLElement>) => boolean;
  /** Bumped to move DOM focus to the focused day (the picker's Tab in). */
  focusToken: number;
  timeScale?: number;
  reduced: boolean;
}

/** One month's page: the month, and whether it is the one shown (the other is leaving). */
interface Page {
  key: number;
  month: Date;
}

/** The month steps' icons, made once: a month change re-renders the header, not them. */
const PREV_ICON = <ChevronLeft size={16} aria-hidden="true" />;
const NEXT_ICON = <ChevronRight size={16} aria-hidden="true" />;

export function Calendar(p: CalendarProps) {
  const timeScale = p.timeScale ?? 1;
  const latest = useLatest(p);

  /* ── the pages: the month shown, and the one leaving ───────────────── */

  const key = monthKey(p.view);
  const [pages, setPages] = useState<Page[]>(() => [
    { key, month: startOfMonth(p.view) },
  ]);
  const shown = pages[pages.length - 1]!;
  if (shown.key !== key)
    setPages([shown, { key, month: startOfMonth(p.view) }]);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());
  const onRoot = useCallback((k: number, el: HTMLDivElement) => {
    pageRefs.current.set(k, el);
  }, []);
  const swapFrom = useRef(key);

  useLayoutEffect(() => {
    const from = swapFrom.current;
    swapFrom.current = key;
    if (from === key) return;
    const inEl = pageRefs.current.get(key);
    if (!inEl) return;
    const kept = pageRefs.current.get(from);
    const outEl = kept?.isConnected ? kept : null;
    // Pages that are gone: forget them.
    for (const [k, el] of pageRefs.current)
      if (!el.isConnected) pageRefs.current.delete(k);
    const swap = playContentSwap({
      out: outEl,
      in: inEl,
      axis: 'x',
      direction: Math.sign(key - from),
      timeScale,
      reduced: p.reduced,
    });
    const drop = () =>
      setPages((ps) => {
        const now = monthKey(latest.current.view);
        return ps.length > 1 ? ps.filter((x) => x.key === now) : ps;
      });
    if (swap.outAnimation) {
      swap.outAnimation.onfinish = drop;
      // A hidden tab never finishes it: the clock ends it too.
      const t = window.setTimeout(drop, swap.outMs + 50);
      return () => window.clearTimeout(t);
    }
    drop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a month change only
  }, [key]);

  /* ── the header ────────────────────────────────────────────────────── */

  const month = p.view.getMonth();
  const year = p.view.getFullYear();
  const canPrev = p.minMonth == null || key - 1 >= p.minMonth;
  const canNext = p.maxMonth == null || key + 1 <= p.maxMonth;
  const [yearText, setYearText] = useState<string | null>(null);
  const labelId = `${p.id}-label`;
  const step = (n: number) =>
    latest.current.onView(addMonths(startOfMonth(latest.current.view), n));
  const canStep = (n: number) => {
    const { minMonth, maxMonth, view } = latest.current;
    const k = monthKey(view) + n;
    return (
      (minMonth == null || k >= minMonth) && (maxMonth == null || k <= maxMonth)
    );
  };

  /* ── a range's drag ────────────────────────────────────────────────── */

  const rootRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ stop: () => void } | null>(null);
  useLayoutEffect(() => () => gesture.current?.stop(), []);

  /**
   * A press on a day in a range: the picker starts (or aims) the range, and
   * from here the pointer is followed over the whole window, so the drag
   * keeps going off the grid and across a month change. Mouse and pen drag
   * at once; a touch waits `TOUCH_ARM_MS` still, so a swipe still scrolls.
   */
  const pressDay = (e: ReactPointerEvent<HTMLElement>, d: Date) => {
    if (e.button !== 0 || gesture.current || !latest.current.onPressDay) return;
    const doc = e.currentTarget.ownerDocument;
    const win = doc.defaultView ?? window;
    const touch = e.pointerType === 'touch';
    const g = {
      id: e.pointerId,
      armed: !touch,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      pressed: iso(d),
      last: iso(d),
      left: false,
      /** The day a month change brought under a still pointer: no turn there until the pointer moves off it. */
      settled: null as string | null,
      hold: null as { dir: number; timer: number } | null,
      timers: [] as number[],
    };
    latest.current.onPressDay(d);

    /** The hold's direction where the pointer is: the nav, past the grid's side, or a day of another month. */
    const zoneAt = (el: Element | null, day: Date | null): number => {
      const nav = el?.closest<HTMLElement>('.cds-calendar__nav');
      if (nav && rootRef.current?.contains(nav))
        return Number(nav.dataset.step) || 0;
      if (day) return Math.sign(monthKey(day) - monthKey(latest.current.view));
      const r = pagesRef.current?.getBoundingClientRect();
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      if (!r || g.y < top || g.y > r.bottom) return 0;
      const rtl =
        getComputedStyle(pagesRef.current!).direction === 'rtl' ? -1 : 1;
      if (g.x < r.left) return -rtl;
      if (g.x > r.right) return rtl;
      return 0;
    };

    const hold = (dir: number) => {
      if (!g.left) dir = 0;
      if (g.hold?.dir === dir) return;
      if (g.hold) win.clearTimeout(g.hold.timer);
      g.hold = null;
      if (!dir || !canStep(dir)) return;
      g.hold = {
        dir,
        timer: win.setTimeout(() => {
          g.hold = null;
          if (!canStep(dir)) return;
          step(dir);
          // The month under the pointer changed: look again once it's drawn
          // (and hold on, if the pointer is still on the edge).
          g.timers.push(win.setTimeout(() => look(true), 32));
        }, HOLD_MS),
      };
    };

    /** The day (or edge) under the pointer; `settle`: the month just changed under it. */
    const look = (settle = false) => {
      const el = doc.elementFromPoint(g.x, g.y);
      const dayEl = el?.closest<HTMLElement>('.cds-calendar__day');
      const ours =
        !!dayEl &&
        !!pagesRef.current?.contains(dayEl) &&
        !dayEl.closest('.cds-calendar__grid--leaving');
      const k = ours ? dayEl!.dataset.date! : null;
      if (k !== g.pressed) g.left = true;
      if (settle) g.settled = k;
      else if (k !== g.settled) g.settled = null;
      const day = k ? fromIsoDay(k) : null;
      if (
        k &&
        k !== g.last &&
        dayEl!.getAttribute('aria-disabled') !== 'true'
      ) {
        g.last = k;
        setDragging(true);
        latest.current.onDragDay?.(day!);
      }
      // A day of another month turns to it; not one a month change just
      // brought under a still pointer (that would turn month after month).
      const outside =
        !!day && dayEl!.hasAttribute('data-outside') && k !== g.settled;
      hold(zoneAt(el, outside ? day : null));
    };

    const stop = () => {
      win.removeEventListener('pointermove', onMove, true);
      win.removeEventListener('pointerup', onUp, true);
      win.removeEventListener('pointercancel', onCancel, true);
      win.removeEventListener('keydown', onKey, true);
      win.removeEventListener('touchmove', onTouchMove);
      if (g.hold) win.clearTimeout(g.hold.timer);
      g.timers.forEach((t) => win.clearTimeout(t));
      gesture.current = null;
      setDragging(false);
    };
    const finish = (cancel: boolean) => {
      stop();
      latest.current.onRelease?.(cancel);
    };
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== g.id) return;
      g.x = ev.clientX;
      g.y = ev.clientY;
      if (!g.armed) {
        // A touch that moves before it's armed is a scroll: let it go.
        if (Math.hypot(g.x - g.x0, g.y - g.y0) > TOUCH_SLOP) finish(true);
        return;
      }
      look();
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId === g.id) finish(false);
    };
    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId === g.id) finish(true);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape' || isComposing(ev)) return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(true);
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (g.armed) ev.preventDefault();
    };
    win.addEventListener('pointermove', onMove, true);
    win.addEventListener('pointerup', onUp, true);
    win.addEventListener('pointercancel', onCancel, true);
    win.addEventListener('keydown', onKey, true);
    win.addEventListener('touchmove', onTouchMove, { passive: false });
    if (touch)
      g.timers.push(win.setTimeout(() => (g.armed = true), TOUCH_ARM_MS));
    gesture.current = { stop };
  };

  return (
    <div
      className="cds-calendar"
      ref={rootRef}
      data-range-drag={dragging || undefined}>
      <div className="cds-calendar__header">
        <button
          type="button"
          className="cds-calendar__nav"
          // v11: the nav is for the pointer; the keys page by month (Ctrl+← →, Page Up / Down).
          tabIndex={-1}
          aria-label={p.prevMonthAriaLabel}
          data-step="-1"
          disabled={!canPrev}
          data-motion-icon-frame=""
          onClick={() => step(-1)}>
          {PREV_ICON}
        </button>
        <div className="cds-calendar__title" id={labelId} aria-live="polite">
          <RollText
            className="cds-calendar__month"
            text={p.locale.months.longhand[month]!}
            order={key}
            direction="horizontal"
            timeScale={timeScale}
          />
          <input
            className="cds-calendar__year"
            tabIndex={-1}
            aria-label="Year"
            inputMode="numeric"
            value={yearText ?? String(year)}
            size={4}
            maxLength={4}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setYearText(v);
              if (v.length === 4)
                latest.current.onView(new Date(Number(v), month, 1));
            }}
            onBlur={() => setYearText(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                setYearText(null);
                step(e.key === 'ArrowUp' ? 12 : -12);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                setYearText(null);
              }
            }}
          />
        </div>
        <button
          type="button"
          className="cds-calendar__nav"
          // v11: the nav is for the pointer; the keys page by month (Ctrl+← →, Page Up / Down).
          tabIndex={-1}
          aria-label={p.nextMonthAriaLabel}
          data-step="1"
          disabled={!canNext}
          data-motion-icon-frame=""
          onClick={() => step(1)}>
          {NEXT_ICON}
        </button>
      </div>
      <div className="cds-calendar__weekdays" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => {
          const d = (p.locale.firstDayOfWeek + i) % 7;
          return (
            <span
              key={d}
              className="cds-calendar__weekday"
              title={p.locale.weekdays.longhand[d]}>
              {p.locale.weekdayHeader[d]}
            </span>
          );
        })}
      </div>
      <div className="cds-calendar__pages" ref={pagesRef}>
        {pages.map((page) => (
          <MonthPage
            key={page.key}
            pageKey={page.key}
            onRoot={onRoot}
            calendar={p}
            month={page.month}
            leaving={page.key !== key}
            labelId={labelId}
            onPressDay={pressDay}
          />
        ))}
      </div>
    </div>
  );
}

/* ── a month ──────────────────────────────────────────────────────────── */

interface MonthPageProps {
  calendar: CalendarProps;
  month: Date;
  leaving: boolean;
  labelId: string;
  pageKey: number;
  /** The page's root, for the swap. */
  onRoot: (key: number, el: HTMLDivElement) => void;
  /** Range: a press on a day (the calendar follows the drag). */
  onPressDay: (e: ReactPointerEvent<HTMLElement>, d: Date) => void;
}

const ITEM = '.sel__item';
/** A day between a confirmed range's ends: it holds the band (not the provisional one), and is not an end. */
const IN_RANGE = `${ITEM}:has(> .cds-calendar__band:not([data-preview])):not([aria-selected='true'])`;

function MonthPage({
  calendar: p,
  month,
  leaving,
  labelId,
  pageKey,
  onRoot,
  onPressDay,
}: MonthPageProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const attach = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (el) onRoot(pageKey, el);
    },
    [onRoot, pageKey]
  );
  const timeScale = p.timeScale ?? 1;
  const reducedRef = useLatest(p.reduced);
  const rolloverReduced = useReducedGetter(p.reduced);
  const latest = useLatest(p);
  const days = monthGrid(month, p.locale.firstDayOfWeek);
  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    drag: false,
    pressColor: false,
    timeScale,
  };
  const style = resolveSelectionStyle(
    // Hero: the picked days in the interactive blue, so what's picked
    // reads apart from the rest.
    { size: 'md', selectedWeight: false, highlight: true, variant: 'hero' },
    { drag: false, pressColor: false }
  );

  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced: p.reduced,
    getRest: () => null,
    layoutKey: String(monthKey(month)),
  });
  useItemRollover(rootRef, {
    // The days between a range's ends have their own rollover (below).
    selector: `${rolloverItems(ITEM, style)}:not(${IN_RANGE})`,
    itemSelector: ITEM,
    press: false,
    preview: style.preview,
    timeScale,
    reduced: reducedRef,
  });
  // A day inside a confirmed range: the blue-contrast hover of date-picker.scss, as written (`colors: 'tokens'`):
  // matched lightness would write a grey over it, which vanishes against the band. No press, as every day:
  // a press picks the day, and the selector arrives.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachRollover(root, {
      selector: IN_RANGE,
      press: false,
      colors: 'tokens',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [rootRef, timeScale, rolloverReduced]);

  /* ── the marker ────────────────────────────────────────────────────── */

  const markerDate = p.dates[p.markerIndex] ?? null;
  const markerIso = markerDate ? iso(markerDate) : null;
  /** The page's first placing: the marker comes with the page. */
  const mounted = useRef(false);
  /** The days painted as picked at the last placing. */
  const painted = useRef<string[]>([]);
  const pickedKey = p.dates.map(iso).join(' ');
  useLayoutEffect(() => {
    const sel = selRef.current;
    const root = rootRef.current;
    if (!sel || !root || leaving) return;
    const first = !mounted.current;
    mounted.current = true;
    const wasPainted = !!markerIso && painted.current.includes(markerIso);
    painted.current = pickedKey ? pickedKey.split(' ') : [];
    const el = markerIso
      ? root.querySelector<HTMLElement>(`${ITEM}[data-date="${markerIso}"]`)
      : null;
    if (!el) {
      if (sel.shown()) sel.hide();
      return;
    }
    // On mount the marker comes with the month (it is part of the content
    // swapping in, or of the surface snapping in): simply there. A first
    // pick grows in.
    if (first || !sel.shown()) {
      sel.show(el, { instant: first });
      return;
    }
    // Single: a pick after another glides (by travel).
    if (p.mode !== 'range') {
      sel.show(el);
      return;
    }
    // Range: nothing travels between the ends; an end's selector never
    // animates from the start selector's position.
    // A day already painted as an end (the anchor, as a drag lets go of the
    // other end) is taken over unseen; a new end grows in where it is.
    if (wasPainted) {
      sel.show(el, { instant: true });
      return;
    }
    sel.hide();
    sel.show(el);
  }, [markerIso, pickedKey, leaving, selRef, p.mode]);

  /* ── keys ──────────────────────────────────────────────────────────── */

  /** The next enabled day `n` days on (stepping `n` at a time), within six weeks; null none. */
  const enabledFrom = (from: Date, n: number) => {
    let d = addDays(from, n);
    for (let k = 0; k < 42; k++) {
      if (latest.current.isEnabled(d)) return d;
      d = addDays(d, Math.sign(n) || 1);
    }
    return null;
  };
  const firstEnabledOf = (mo: Date) =>
    enabledFrom(addDays(startOfMonth(mo), -1), 1);

  const wantFocus = useRef(false);
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (p.onGridKey?.(e)) return;
    const cur = p.focused;
    const rtl = rootRef.current
      ? getComputedStyle(rootRef.current).direction === 'rtl'
      : false;
    let next: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight': {
        const dir = (e.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
        // v11 (flatpickr): Ctrl + ← / → change the month, to its first day.
        next = e.ctrlKey
          ? firstEnabledOf(addMonths(startOfMonth(cur), dir))
          : enabledFrom(cur, dir);
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        // v11 (flatpickr): Ctrl + ↑ / ↓ change the year (↑ the next), to the month's first day.
        next = e.ctrlKey
          ? firstEnabledOf(addMonths(startOfMonth(cur), -12 * dir))
          : enabledFrom(cur, 7 * dir);
        break;
      }
      case 'PageUp':
      case 'PageDown': {
        const n = (e.key === 'PageDown' ? 1 : -1) * (e.shiftKey ? 12 : 1);
        const d = addMonths(cur, n);
        next = p.isEnabled(d) ? d : enabledFrom(d, n > 0 ? 1 : -1);
        break;
      }
      case 'Home':
      case 'End': {
        const col = (cur.getDay() - p.locale.firstDayOfWeek + 7) % 7;
        const d = addDays(cur, e.key === 'Home' ? -col : 6 - col);
        next = p.isEnabled(d) ? d : enabledFrom(d, e.key === 'Home' ? 1 : -1);
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (p.isEnabled(cur)) p.onPick(cur);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (!next) return;
    wantFocus.current = true;
    p.onFocusDay(next);
  };

  // Focus follows the tab stop when a key moved it (here, or into a new month).
  const focusedIso = iso(p.focused);
  const lastToken = useRef(p.focusToken);
  useLayoutEffect(() => {
    if (leaving) return;
    const asked = lastToken.current !== p.focusToken;
    lastToken.current = p.focusToken;
    const root = rootRef.current;
    const carried = !!root?.ownerDocument.activeElement?.closest(
      '.cds-calendar__pages'
    );
    if (!wantFocus.current && !asked && !carried) return;
    const el = root?.querySelector<HTMLElement>(
      `${ITEM}[data-date="${focusedIso}"]`
    );
    if (!el) return;
    wantFocus.current = false;
    if (root!.ownerDocument.activeElement !== el)
      el.focus({ preventScroll: true });
  }, [focusedIso, p.focusToken, leaving]);

  /* ── the range ─────────────────────────────────────────────────────── */

  const [start, end] = p.dates;
  const range = p.mode === 'range';
  const lo = range && start ? (end ?? p.preview) : null;
  const span =
    range && start && lo
      ? compareDay(start, lo) <= 0
        ? { a: start, b: lo, preview: !end }
        : { a: lo, b: start, preview: !end }
      : null;

  const today = new Date();
  const rows = Array.from({ length: 6 }, (_, r) =>
    days.slice(r * 7, r * 7 + 7)
  );

  // The days' handlers: stable, so the memoized days (DayCell) re-render
  // only when what they draw changed, not with every hover of a range.
  const onDayClick = useStableCallback(
    (e: ReactMouseEvent<HTMLDivElement>, d: Date, enabled: boolean) => {
      // A range's pointer picks are the press and the release (`onPressDay`); a click
      // with no pointer behind it (assistive tech) still picks.
      if (range && p.onPressDay && e.detail > 0) return;
      if (enabled) latest.current.onPick(d);
    }
  );
  const onDayPointerDown = useStableCallback(
    (e: ReactPointerEvent<HTMLDivElement>, d: Date, enabled: boolean) => {
      if (range && enabled && !leaving) onPressDay(e, d);
    }
  );
  const onDayEnter = useStableCallback(
    (e: ReactPointerEvent<HTMLDivElement>, d: Date, enabled: boolean) => {
      if (e.pointerType !== 'touch')
        latest.current.onHoverDay(enabled ? d : null);
    }
  );

  return (
    <div
      ref={attach}
      className={[
        ...style.classes,
        'cds-calendar__grid',
        leaving && 'cds-calendar__grid--leaving',
      ]
        .filter(Boolean)
        .join(' ')}
      role="grid"
      aria-labelledby={labelId}
      aria-hidden={leaving || undefined}
      {...inertProps(leaving)}
      data-reduced={p.reduced || undefined}
      onKeyDown={onKeyDown}
      onPointerLeave={() => p.onHoverDay(null)}>
      <SelectionMarker />
      {rows.map((week, r) => (
        <div key={r} role="row" className="cds-calendar__row">
          {week.map((d, c) => {
            const dIso = iso(d);
            const outside = d.getMonth() !== month.getMonth();
            const enabled = p.isEnabled(d);
            const picked = p.dates.findIndex((x) => sameDay(x, d));
            const isMarker = picked >= 0 && picked === p.markerIndex;
            const isStill = picked >= 0 && !isMarker;
            const inSpan =
              !!span && compareDay(d, span.a) > 0 && compareDay(d, span.b) < 0;
            const isA =
              !!span && sameDay(d, span.a) && compareDay(span.a, span.b) < 0;
            const isB =
              !!span && sameDay(d, span.b) && compareDay(span.a, span.b) < 0;
            // The preview's free end (under the pointer or the keys): the band runs through it, rounded.
            const free =
              !!span?.preview && (isA || isB) && sameDay(d, p.preview);
            // The band: between the ends, into the gaps either side, rounded at a week's ends.
            const band: BandKind | null = inSpan
              ? 'between'
              : free
                ? isA
                  ? 'free-start'
                  : 'free-end'
                : isA && c < 6
                  ? 'start'
                  : isB && c > 0
                    ? 'end'
                    : null;
            return (
              <DayCell
                key={dIso}
                d={d}
                dIso={dIso}
                col={c}
                gridId={p.id}
                outside={outside}
                enabled={enabled}
                picked={picked >= 0}
                isStill={isStill}
                isToday={sameDay(d, today)}
                focusable={!leaving && sameDay(d, p.focused)}
                name={ariaDate(d, p.locale)}
                marks={p.marks?.get(dIso)}
                band={band}
                bandPreview={!!span?.preview}
                onDayClick={onDayClick}
                onDayPointerDown={onDayPointerDown}
                onDayEnter={onDayEnter}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

type BandKind = 'between' | 'start' | 'end' | 'free-start' | 'free-end';

interface DayCellProps {
  d: Date;
  dIso: string;
  /** The day's column (0–6): where the band rounds. */
  col: number;
  gridId: string;
  outside: boolean;
  enabled: boolean;
  picked: boolean;
  isStill: boolean;
  isToday: boolean;
  /** The grid's tab stop. */
  focusable: boolean;
  /** The day's accessible name, before its events. */
  name: string;
  marks?: readonly ResolvedDateMark[];
  band: BandKind | null;
  bandPreview: boolean;
  /** Stable (the page's `useStableCallback`). */
  onDayClick: (
    e: ReactMouseEvent<HTMLDivElement>,
    d: Date,
    enabled: boolean
  ) => void;
  onDayPointerDown: (
    e: ReactPointerEvent<HTMLDivElement>,
    d: Date,
    enabled: boolean
  ) => void;
  onDayEnter: (
    e: ReactPointerEvent<HTMLDivElement>,
    d: Date,
    enabled: boolean
  ) => void;
}

/**
 * One day. Memoized, as a selection list's rows are: a range's preview
 * re-renders the month on every day the
 * pointer crosses; a day re-renders only when what it draws changed (its
 * picked state, its band, its tab stop).
 */
const DayCell = memo(
  function DayCell({
    d,
    dIso,
    col,
    gridId,
    outside,
    enabled,
    picked,
    isStill,
    isToday,
    focusable,
    name,
    marks,
    band,
    bandPreview,
    onDayClick,
    onDayPointerDown,
    onDayEnter,
  }: DayCellProps) {
    const face = (
      <>
        <span className="sel__text">{d.getDate()}</span>
        {marks && (
          <span className="cds-calendar__pips" aria-hidden="true">
            {marks.slice(0, MAX_PIPS).map((m, i) => (
              <span key={i} className="cds-calendar__pip" data-kind={m.kind} />
            ))}
          </span>
        )}
      </>
    );
    const cell = (
      <div
        id={`${gridId}-${dIso}`}
        role="gridcell"
        className="sel__item cds-calendar__day"
        tabIndex={focusable ? 0 : -1}
        aria-label={name + (marks ? `, ${describeMarks(marks)}` : '')}
        aria-selected={picked}
        aria-disabled={!enabled || undefined}
        aria-current={isToday ? 'date' : undefined}
        // The events are in the name already: the tooltip doesn't describe the day again.
        aria-describedby={marks ? '' : undefined}
        data-date={dIso}
        data-outside={outside || undefined}
        data-today={isToday || undefined}
        data-still={isStill || undefined}
        onClick={(e) => onDayClick(e, d, enabled)}
        onPointerDown={(e) => onDayPointerDown(e, d, enabled)}
        onPointerEnter={(e) => onDayEnter(e, d, enabled)}>
        {band && (
          <span
            className="cds-calendar__band"
            data-preview={bandPreview || undefined}
            style={bandStyle(band, col)}
            aria-hidden="true"
          />
        )}
        {isStill && <span className="cds-calendar__still" aria-hidden="true" />}
        {isToday && <span className="cds-calendar__today" aria-hidden="true" />}
        {/* The selection kit's two faces (SelectionFaces) as plain markup: a
            day has no icon for the selected face to animate, so it needs
            neither the twin's state nor its icon provider, and a month of
            days mounts one component each, not three. */}
        <span className="sel__face">{face}</span>
        <span className="sel__face sel__face--on" aria-hidden="true">
          {face}
        </span>
      </div>
    );
    if (!marks) return cell;
    // A marked day: its events in the kit's Tooltip, on hover and on
    // keyboard focus. The wrapper stays out of the grid's layout and
    // its tree (`display: contents`, `presentation`).
    return (
      <Tooltip
        className="cds-calendar__tip"
        role="presentation"
        align="top"
        autoAlign
        description={<EventList marks={marks} />}>
        {cell}
      </Tooltip>
    );
  },
  (a, b) => {
    for (const k of Object.keys(a) as (keyof DayCellProps)[]) {
      if (k === 'd' ? a.d.getTime() !== b.d.getTime() : a[k] !== b[k])
        return false;
    }
    return true;
  }
);

const KIND_WORD: Record<DateMarkKind, string> = {
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
  info: 'Info',
  neutral: 'Event',
};

/** A marked day's tooltip: each event on its own line, after a pip of its kind (most severe first, as under the day). */
function EventList({ marks }: { marks: readonly ResolvedDateMark[] }) {
  return (
    <span className="cds-calendar__events">
      {marks.map((m, i) => (
        <span key={i} className="cds-calendar__event">
          <span
            className="cds-calendar__event-pip"
            data-kind={m.kind}
            aria-hidden="true"
          />
          {m.label ?? KIND_WORD[m.kind]}
        </span>
      ))}
    </span>
  );
}

/**
 * The band's box on one day. A day between the ends reaches half the gap
 * past each side to meet its neighbours' (`out`), or stops at a week's
 * first or last day, rounded (`edge`). An end's strip lies outside its
 * marker: from its edge to the gap's middle (`start`: after a range's
 * start, `end`: before its end). A preview's free end (`free-start`,
 * `free-end`) has no marker: the band runs through it and rounds there.
 */
function bandStyle(kind: BandKind, col: number): CSSProperties {
  const half = 'calc(-0.5 * var(--sel-gap))';
  const r = 'var(--sel-radius)';
  if (kind === 'start')
    return { insetInlineStart: '100%', insetInlineEnd: half };
  if (kind === 'end') return { insetInlineStart: half, insetInlineEnd: '100%' };
  const first = col === 0 || kind === 'free-start';
  const last = col === 6 || kind === 'free-end';
  return {
    insetInlineStart: first ? 0 : half,
    insetInlineEnd: last ? 0 : half,
    borderStartStartRadius: first ? r : 0,
    borderEndStartRadius: first ? r : 0,
    borderStartEndRadius: last ? r : 0,
    borderEndEndRadius: last ? r : 0,
  };
}
