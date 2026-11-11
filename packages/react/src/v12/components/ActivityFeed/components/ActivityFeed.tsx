/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Component,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  CONTENT_SWAP,
  contentSwapClocks,
  motionTokens,
  playContentSwap,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import { Button, type ButtonProps } from '@carbon-labs/react-button';
import { EmptyState } from '@carbon-labs/react-empty-state';
import {
  SkeletonPlaceholder,
  SkeletonReveal,
  SkeletonText,
} from '@carbon-labs/react-feedback';
import { JumpTo } from '@carbon-labs/react-jump-to';
import { Scroller } from '@carbon-labs/react-scroller';
import {
  StatusIndicator,
  type StatusIndicatorKind,
} from '@carbon-labs/react-status-indicator';
import { SelectableTag } from '@carbon-labs/react-tag';
import { UserAvatar } from '@carbon-labs/react-user-avatar';
import {
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { openPlace } from '@carbon-labs/react-disclosure';
import {
  dayLabel,
  dayStart,
  useRelativeTime,
  useToday,
  type RelativeTimeWords,
} from './relativeTime';
import './activity-feed.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * ActivityFeed: events in time order, newest first, by day.
 *
 *   days      a sticky header per day, never folded; an event's time is relative today, the clock earlier
 *   actions   up to two ghost buttons, only on an event that asks for one
 *   tick      one shared minute clock: only the times whose words change re-render
 *   arrive    at the top, a new event's place opens and its content comes down into it
 *   hold      scrolled down, the row read holds still; Jump to latest counts the new
 *   detail    the kit's disclosure; filter: category tags, the list out, then in
 *   window    past `windowAt`, blocks off screen are spacers: observers, no scroll reads
 *   loading   the kit's skeleton reveal; empty, the kit's EmptyState
 *   reduced   places open at once; content fades on the reduced clock; the filter snaps
 *
 * API: no Carbon counterpart.
 * ========================================================================== */

/** An event's action: its label as `text`, and the Button's `onClick`, `disabled`, `href`, `kind`, `renderIcon`. Drawn ghost, small. */
export interface ActivityEventAction extends Pick<
  ButtonProps,
  'onClick' | 'disabled' | 'href' | 'kind' | 'renderIcon'
> {
  text: ReactNode;
}

export interface ActivityEvent {
  id: string;
  /** Who did it: their name (initials in the avatar). */
  actor: string;
  /** Their image, a URL. */
  actorImage?: string;
  /** What they did: a verb phrase, "deployed". */
  action: string;
  /** What they did it to, set in the text's strong weight. */
  object?: string;
  /** When. */
  timestamp: Date | number;
  /** Its category, for the filters. */
  category?: string;
  /** Its outcome, as a status kind. */
  kind?: StatusIndicatorKind;
  /** The outcome's words. Default: the kind's. */
  kindLabel?: string;
  /** More about it (a diff, a comment), behind Show details. */
  detail?: ReactNode;
  /** Up to two actions, for an event that asks for one: a review request, an approval. */
  actions?:
    | readonly [ActivityEventAction]
    | readonly [ActivityEventAction, ActivityEventAction];
}

/** At most two actions on an event. */
const MAX_ACTIONS = 2;

export interface ActivityFeedCategory {
  id: string;
  label: string;
}

export interface ActivityFeedProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  events: readonly ActivityEvent[];
  /** The category filters, as tags over the list. None: no filters. */
  categories?: readonly ActivityFeedCategory[];
  /** The categories shown at first. Default: all. */
  defaultSelectedCategories?: readonly string[];
  /** The filter changed: the categories shown (empty: all). */
  onSelectedCategoriesChange?: (categories: string[]) => void;
  /** The events are on their way: the skeleton. */
  loading?: boolean;
  /** Its accessible name. Default "Activity". */
  label?: string;
  /** Past this many events, the list is windowed. Default 200. */
  windowAt?: number;
  emptyTitle?: string;
  emptySubtitle?: ReactNode;
  todayLabel?: string;
  yesterdayLabel?: string;
  allLabel?: string;
  /** The filters' group name. Default "Filter by category". */
  filterLabel?: string;
  showDetailsLabel?: string;
  hideDetailsLabel?: string;
  latestLabel?: string;
  newEventsLabel?: (n: number) => string;
  /** The relative time's words. */
  timeWords?: RelativeTimeWords;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

/** Events per window block. */
const BLOCK = 25;
/** A row's height before any is measured, px. */
const ROW_EST = 64;
/** How far past the view a block renders, px. */
const REACH = 800;

const STATUS_WORDS: Record<StatusIndicatorKind, string> = {
  success: 'Succeeded',
  warning: 'Warning',
  error: 'Failed',
  info: 'Info',
  pending: 'In progress',
  'not-started': 'Not started',
  paused: 'Paused',
  unknown: 'Unknown',
};

const tsOf = (e: ActivityEvent) =>
  typeof e.timestamp === 'number' ? e.timestamp : e.timestamp.getTime();

interface Block {
  key: string;
  events: ActivityEvent[];
}
interface Day {
  day: number;
  count: number;
  blocks: Block[];
}

/** `el`'s top inside `root`, layout px (its offset parents' offsets, up to `root`). */
function offsetIn(el: HTMLElement, root: HTMLElement): number {
  let top = 0;
  for (
    let e: HTMLElement | null = el;
    e && e !== root;
    e = e.offsetParent as HTMLElement | null
  ) {
    if (!root.contains(e)) return top;
    top += e.offsetTop;
  }
  return top;
}

/** Where each day's section lies in the viewport, and the soft edge's cap: read off the scroll path. */
interface DayLayout {
  cap: number;
  days: {
    day: number;
    top: number;
    height: number;
    title: HTMLElement | null;
  }[];
}

function dayLayout(vp: HTMLElement, list: HTMLElement): DayLayout {
  const base = offsetIn(list, vp);
  return {
    cap:
      parseFloat(
        getComputedStyle(vp).getPropertyValue('--cds-motion-soft-edge')
      ) || 16,
    days: [...list.children].map((c) => {
      const sec = c as HTMLElement;
      return {
        day: Number(sec.dataset.day),
        top: base + sec.offsetTop,
        height: sec.offsetHeight,
        title: sec.querySelector<HTMLElement>(':scope > .cds-afeed__day-title'),
      };
    }),
  };
}

/** Days, newest first, each cut into blocks counted from its oldest event, so a new event never moves an older block's members. */
function daysOf(events: readonly ActivityEvent[]): Day[] {
  const days: Day[] = [];
  let cur: { day: number; events: ActivityEvent[] } | null = null;
  const all: { day: number; events: ActivityEvent[] }[] = [];
  for (const e of events) {
    const d = dayStart(tsOf(e));
    if (!cur || cur.day !== d) all.push((cur = { day: d, events: [] }));
    cur.events.push(e);
  }
  for (const { day, events: list } of all) {
    const n = list.length;
    const blocks: Block[] = [];
    for (let k = Math.ceil(n / BLOCK) - 1; k >= 0; k--) {
      const from = Math.max(0, n - (k + 1) * BLOCK);
      blocks.push({
        key: `${day}:${k}`,
        events: list.slice(from, n - k * BLOCK),
      });
    }
    days.push({ day, count: n, blocks });
  }
  return days;
}

/* ── the shared parts, for the rows ─────────────────────────────────────── */

interface FeedShared {
  words: Required<
    Pick<ActivityFeedProps, 'showDetailsLabel' | 'hideDetailsLabel'>
  > & { time?: RelativeTimeWords };
  /** Which details are open: kept here, so a block windowed away and back keeps them. */
  open: Map<string, boolean>;
  moves: DisclosureMoves;
  timeScale: number;
}
const Shared = createContext<FeedShared | null>(null);

/** The time beside an event: relative today, the clock on an earlier day. */
const EventTime = memo(function EventTime({
  t,
  words,
}: {
  t: number;
  words?: RelativeTimeWords;
}) {
  const text = useRelativeTime(t, words);
  return (
    <time
      className="cds-afeed__time"
      dateTime={new Date(t).toISOString()}
      title={new Date(t).toLocaleString()}>
      {text}
    </time>
  );
});

const DetailOpen = createContext(false);
function DetailChevron(props: { className?: string }) {
  const open = useContext(DetailOpen);
  return (
    <ChevronDownUpToggle
      {...props}
      size={16}
      toggled={open}
      disableToggle
      aria-hidden="true"
    />
  );
}

const Row = memo(function Row({
  event,
  pos,
  total,
}: {
  event: ActivityEvent;
  pos: number;
  total: number;
}) {
  const shared = useContext(Shared)!;
  const { reduced } = useFeedbackMotion();
  const [open, setOpen] = useState(() => shared.open.get(event.id) ?? false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const body = useDisclosureBody(bodyRef, open, shared.moves, reduced);
  const id = useId();
  const t = tsOf(event);
  const toggle = () => {
    shared.open.set(event.id, !open);
    setOpen(!open);
  };
  return (
    <article
      className="cds-afeed__event"
      data-event-id={event.id}
      aria-posinset={pos}
      aria-setsize={total}
      aria-labelledby={`${id}-what`}
      tabIndex={-1}>
      <div className="cds-afeed__event-content">
        <UserAvatar
          className="cds-afeed__avatar"
          name={event.actor}
          image={event.actorImage}
          size="sm"
        />
        <div className="cds-afeed__main">
          <p className="cds-afeed__what" id={`${id}-what`}>
            <span className="cds-afeed__actor">{event.actor}</span>{' '}
            {event.action}
            {event.object && (
              <>
                {' '}
                <span className="cds-afeed__object">{event.object}</span>
              </>
            )}
          </p>
          <div className="cds-afeed__meta">
            {event.kind && (
              <StatusIndicator
                size="sm"
                kind={event.kind}
                label={event.kindLabel ?? STATUS_WORDS[event.kind]}
              />
            )}
            <EventTime t={t} words={shared.words.time} />
          </div>
          {event.actions && event.actions.length > 0 && (
            <div className="cds-afeed__actions">
              {event.actions
                .slice(0, MAX_ACTIONS)
                .map(
                  ({ text, onClick, disabled, href, kind, renderIcon }, i) => (
                    // Described by its event's line, so two events' "Approve" are told apart.
                    <Button
                      key={i}
                      className="cds-afeed__action"
                      aria-describedby={`${id}-what`}
                      onClick={onClick}
                      disabled={disabled}
                      href={href}
                      kind={kind}
                      renderIcon={renderIcon}
                      frame="ghost"
                      size="sm"
                      timeScale={shared.timeScale}>
                      {text}
                    </Button>
                  )
                )}
            </div>
          )}
          {event.detail != null && (
            <>
              <DetailOpen.Provider value={open}>
                <Button
                  className="cds-afeed__toggle"
                  frame="none"
                  size="sm"
                  renderIcon={DetailChevron}
                  aria-expanded={open}
                  aria-controls={`${id}-detail`}
                  onClick={toggle}
                  timeScale={shared.timeScale}>
                  {open
                    ? shared.words.hideDetailsLabel
                    : shared.words.showDetailsLabel}
                </Button>
              </DetailOpen.Provider>
              <div
                ref={bodyRef}
                id={`${id}-detail`}
                className="cds-disclosure__body cds-afeed__detail"
                {...body.bodyProps}>
                <div className="cds-disclosure__clip">
                  <div className="cds-disclosure__content">
                    {body.present && (
                      <div className="cds-afeed__detail-inner">
                        {event.detail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
});

interface BlockProps {
  block: Block;
  /** The 1-based position of its first event in the list. */
  first: number;
  total: number;
  shown: boolean;
  /** Its spacer's height while not shown, px. */
  spacer: number;
  register: (key: string, el: HTMLElement | null) => void;
}

const sameEvents = (a: ActivityEvent[], b: ActivityEvent[]) =>
  a.length === b.length && a.every((e, i) => e === b[i]);

const BlockView = memo(
  function BlockView({
    block,
    first,
    total,
    shown,
    spacer,
    register,
  }: BlockProps) {
    const ref = useCallback(
      (el: HTMLDivElement | null) => register(block.key, el),
      [register, block.key]
    );
    return (
      <div
        ref={ref}
        className="cds-afeed__block"
        data-block={block.key}
        data-count={block.events.length}
        data-shown={shown || undefined}
        style={shown ? undefined : { blockSize: `${spacer}px` }}>
        {shown &&
          block.events.map((e, i) => (
            <Row key={e.id} event={e} pos={first + i} total={total} />
          ))}
      </div>
    );
  },
  (a, b) =>
    a.shown === b.shown &&
    a.first === b.first &&
    a.total === b.total &&
    a.register === b.register &&
    (a.shown ? true : a.spacer === b.spacer) &&
    sameEvents(a.block.events, b.block.events)
);

/* ── the feed ───────────────────────────────────────────────────────────── */

export function ActivityFeed({
  events,
  categories,
  defaultSelectedCategories,
  onSelectedCategoriesChange,
  loading = false,
  label = 'Activity',
  windowAt = 200,
  emptyTitle = 'No activity yet',
  emptySubtitle,
  todayLabel,
  yesterdayLabel,
  allLabel = 'All',
  filterLabel = 'Filter by category',
  showDetailsLabel = 'Show details',
  hideDetailsLabel = 'Hide details',
  latestLabel = 'Jump to latest',
  newEventsLabel = (n) => `${n} new ${n === 1 ? 'event' : 'events'}`,
  timeWords,
  timeScale = 1,
  className,
  ...rest
}: ActivityFeedProps) {
  const { reduced } = useFeedbackMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const today = useToday();
  const headId = useId();

  /* ── what's shown: sorted, filtered ──────────────────────────────────── */

  const [selected, setSelected] = useState<readonly string[]>(
    defaultSelectedCategories ?? []
  );
  const sorted = useMemo(
    () => [...events].sort((a, b) => tsOf(b) - tsOf(a)),
    [events]
  );
  const filtered = useMemo(
    () =>
      selected.length
        ? sorted.filter(
            (e) => e.category != null && selected.includes(e.category)
          )
        : sorted,
    [sorted, selected]
  );
  const days = useMemo(() => daysOf(filtered), [filtered]);
  const windowed = filtered.length > windowAt;

  /* ── the window: blocks near the view render, the rest are spacers ──── */

  const near = useRef(new Set<string>());
  const [shownKeys, setShownKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  // Measured block heights, for the spacers: written by the resize observer, read on render.
  const [sizes] = useState(() => ({
    heights: new Map<string, { h: number; n: number }>(),
    avg: { h: 0, n: 0 },
  }));
  const els = useRef(new Map<string, HTMLElement>());
  const io = useRef<IntersectionObserver | null>(null);
  const ro = useRef<ResizeObserver | null>(null);
  const lastSize = useRef(new WeakMap<Element, number>());
  // The days' layout for the break under a stuck title: measured here and on a change, never on the scroll.
  const dayRects = useRef<DayLayout | null>(null);
  const drawBreak = useRef<() => void>(() => {});

  // Before the observers report: the first blocks, enough for a view or two.
  const firstKeys = useMemo(() => {
    const out = new Set<string>();
    let n = 0;
    for (const d of days)
      for (const b of d.blocks) {
        if (n >= BLOCK * 2) return out;
        out.add(b.key);
        n += b.events.length;
      }
    return out;
  }, [days]);
  const isShown = (key: string) =>
    !windowed ||
    shownKeys.has(key) ||
    (shownKeys.size === 0 && firstKeys.has(key));

  const spacerOf = (b: Block) => {
    const rowH = sizes.avg.n ? sizes.avg.h / sizes.avg.n : ROW_EST;
    const rec = sizes.heights.get(b.key);
    return Math.round(
      rec ? rec.h + (b.events.length - rec.n) * rowH : b.events.length * rowH
    );
  };

  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;
    io.current = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const en of entries) {
          const key = (en.target as HTMLElement).dataset.block;
          if (!key) continue;
          if (en.isIntersecting === near.current.has(key)) continue;
          if (en.isIntersecting) near.current.add(key);
          else near.current.delete(key);
          changed = true;
        }
        if (changed) setShownKeys(new Set(near.current));
      },
      { root: vp, rootMargin: `${REACH}px 0px` }
    );
    // A shown block's size: recorded for its spacer, and, when it lies above the view, the
    // scroll moves with it so what's read holds still (layout is clean in this callback).
    ro.current = new ResizeObserver((entries) => {
      const box = viewport.current;
      if (!box) return;
      const top = box.getBoundingClientRect().top;
      for (const en of entries) {
        const el = en.target as HTMLElement;
        const h = en.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
        const before = lastSize.current.get(el);
        lastSize.current.set(el, h);
        if (el.dataset.shown != null) {
          const key = el.dataset.block!;
          const n = Number(el.dataset.count);
          const prev = sizes.heights.get(key);
          if (prev) {
            sizes.avg.h -= prev.h;
            sizes.avg.n -= prev.n;
          }
          sizes.heights.set(key, { h, n });
          sizes.avg.h += h;
          sizes.avg.n += n;
        }
        if (
          before != null &&
          before !== h &&
          el.getBoundingClientRect().bottom <= top + 1
        )
          box.scrollTop += h - before;
      }
      if (listRef.current) {
        dayRects.current = dayLayout(box, listRef.current);
        drawBreak.current();
      }
    });
    els.current.forEach((el) => {
      io.current!.observe(el);
      ro.current!.observe(el);
    });
    return () => {
      io.current?.disconnect();
      ro.current?.disconnect();
      io.current = null;
      ro.current = null;
    };
  }, [sizes]);

  const register = useCallback((key: string, el: HTMLElement | null) => {
    const old = els.current.get(key);
    if (old && old !== el) {
      io.current?.unobserve(old);
      ro.current?.unobserve(old);
      els.current.delete(key);
      near.current.delete(key);
    }
    if (!el) return;
    els.current.set(key, el);
    io.current?.observe(el);
    ro.current?.observe(el);
  }, []);

  /* ── at the top, or reading further down ─────────────────────────────── */

  const sentinel = useRef<HTMLDivElement>(null);
  const atTop = useRef(true);
  const [unseen, setUnseen] = useState(0);
  useEffect(() => {
    const vp = viewport.current;
    const s = sentinel.current;
    if (!vp || !s) return;
    const obs = new IntersectionObserver(
      (es) => {
        const top = es[es.length - 1]!.isIntersecting;
        atTop.current = top;
        if (top) setUnseen(0);
      },
      { root: vp }
    );
    obs.observe(s);
    return () => obs.disconnect();
  }, []);

  /* ── a change of events: hold the reader's place, or let new ones arrive ─ */

  const seenIds = useRef<Set<string> | null>(null);
  const wasLoading = useRef(loading);
  const lastSelected = useRef(selected);
  const shownDays = useRef(new Set<number>());
  // Set by PlaceHold, whose commit runs before this component's layout effect.
  const held = useRef(false);
  const holdWhen = useCallback(
    () => !atTop.current && lastSelected.current === selected,
    [selected]
  );
  const onHeld = useCallback(() => {
    held.current = true;
    // The blocks' sizes as they are now: the resize observer has nothing more to hold.
    els.current.forEach((el) =>
      lastSize.current.set(el, el.getBoundingClientRect().height)
    );
  }, []);

  useLayoutEffect(() => {
    const vp = viewport.current;
    const list = listRef.current;
    const ids = new Set(filtered.map((e) => e.id));
    const before = seenIds.current;
    const filterChanged = lastSelected.current !== selected;
    lastSelected.current = selected;
    seenIds.current = ids;
    const daysBefore = shownDays.current;
    shownDays.current = new Set(days.map((d) => d.day));
    const fromNothing = !before || before.size === 0 || wasLoading.current;
    if (fromNothing || filterChanged) held.current = false;
    wasLoading.current = loading;
    if (fromNothing || filterChanged || !vp || !list) return;
    const added = filtered.filter((e) => !before.has(e.id));
    if (held.current) {
      // Reading further down: PlaceHold holds the row being read; count the new ones.
      held.current = false;
      if (added.length) setUnseen((n) => n + added.length);
      return;
    }
    if (!added.length || added.length > BLOCK) return;
    // At the top: each new event's place opens (a new day's, with its header).
    const opened = new Set<number>();
    for (const e of added) {
      const day = dayStart(tsOf(e));
      if (!daysBefore.has(day)) {
        if (opened.has(day)) continue;
        opened.add(day);
        const section = list.querySelector<HTMLElement>(`[data-day="${day}"]`);
        if (section)
          void openPlace(list, section, {
            timeScale,
            reduced,
            reason: 'activity-feed-arrive',
          });
        continue;
      }
      const row = list.querySelector<HTMLElement>(
        `[data-event-id="${CSS.escape(e.id)}"]`
      );
      if (row)
        void openPlace(list, row, {
          timeScale,
          reduced,
          reason: 'activity-feed-arrive',
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per new list
  }, [filtered, loading]);

  /* ── the filters: the list out, then in ──────────────────────────────── */

  // The top day's title holds still when the same day leads both lists:
  // its place can't change. Everything else swaps, out then in.
  const outAnims = useRef<Animation[]>([]);
  const heldDay = useRef<number | null>(null);
  /** What swaps: every day's title and blocks but the held title. */
  const swapping = (list: HTMLElement) =>
    [
      ...list.querySelectorAll<HTMLElement>(':scope > .cds-afeed__day > *'),
    ].filter(
      (el) =>
        !(
          el.classList.contains('cds-afeed__day-title') &&
          Number((el.parentElement as HTMLElement).dataset.day) ===
            heldDay.current
        )
    );
  const choose = (next: string[]) => {
    onSelectedCategoriesChange?.(next);
    const list = listRef.current;
    outAnims.current.forEach((a) => a.cancel());
    outAnims.current = [];
    const nextFirst =
      (next.length
        ? sorted.find((e) => e.category != null && next.includes(e.category))
        : sorted[0]) ?? null;
    const lead = nextFirst ? dayStart(tsOf(nextFirst)) : null;
    // Only while the first day's section is still at the top: scrolled past it, its title is gone and arrives.
    const first = dayRects.current?.days[0];
    const atTop =
      !!first &&
      first.day === days[0]?.day &&
      (viewport.current?.scrollTop ?? 0) < first.top + first.height;
    heldDay.current =
      lead != null && lead === days[0]?.day && atTop ? lead : null;
    if (!list || reduced) return setSelected(next);
    const ms =
      motionTokens.duration[contentSwapClocks(CONTENT_SWAP.distance).out] *
      timeScale;
    const easing = `cubic-bezier(${motionTokens.easing['exit-productive'].join(', ')})`;
    const anims = swapping(list).map((el) =>
      el.animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: `translateY(-${CONTENT_SWAP.distance}px)` },
        ],
        { duration: ms, easing, fill: 'forwards' }
      )
    );
    outAnims.current = anims;
    Promise.all(anims.map((a) => a.finished)).then(
      () => outAnims.current === anims && setSelected(next),
      () => {}
    );
  };
  const swapped = useRef(selected);
  useLayoutEffect(() => {
    if (swapped.current === selected) return;
    swapped.current = selected;
    const list = listRef.current;
    const vp = viewport.current;
    if (vp) vp.scrollTop = 0;
    setUnseen(0);
    if (!list) return;
    for (const el of swapping(list))
      playContentSwap({
        out: null,
        in: el,
        axis: 'y',
        direction: 1,
        timeScale,
        reduced,
      });
  }, [selected, timeScale, reduced]);

  /* ── the break under a stuck day title ───────────────────────────────── */

  // A divider and the soft edge under the stuck title, grown over the first 16px under it so neither
  // pops: the Scroller leaves its own top edge to a stuck title (softEdge.ts).
  const shownCount = filtered.length;
  useEffect(() => {
    const vp = viewport.current;
    const list = listRef.current;
    if (!vp || !list) return;
    let raf = 0;
    let lit: HTMLElement | null = null;
    const write = () => {
      raf = 0;
      const at = dayRects.current;
      if (!at) return;
      const y = vp.scrollTop;
      let hit: HTMLElement | null = null;
      let under = 0;
      for (const d of at.days) {
        if (y < d.top) break;
        if (y < d.top + d.height) {
          hit = d.title;
          under = Math.min(at.cap, y - d.top);
        }
      }
      if (lit && lit !== hit) {
        lit.style.removeProperty('--cds-afeed-under');
        lit.style.removeProperty('--cds-afeed-rule');
      }
      lit = under > 0 ? hit : null;
      if (lit) {
        lit.style.setProperty('--cds-afeed-under', `${under}px`);
        lit.style.setProperty('--cds-afeed-rule', String(under / at.cap));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    drawBreak.current = schedule;
    dayRects.current = dayLayout(vp, list);
    vp.addEventListener('scroll', schedule, { passive: true });
    schedule();
    return () => {
      vp.removeEventListener('scroll', schedule);
      cancelAnimationFrame(raf);
      drawBreak.current = () => {};
    };
  }, [loading, shownCount]);

  const toggleCategory = (id: string) => {
    const has = selected.includes(id);
    choose(has ? selected.filter((t) => t !== id) : [...selected, id]);
  };

  /* ── the rows' shared parts ──────────────────────────────────────────── */

  const [openMap] = useState(() => new Map<string, boolean>());
  const moves = useDisclosureMoves(listRef, {
    reason: 'activity-feed-detail',
    timeScale,
  });
  const shared = useMemo<FeedShared>(
    () => ({
      words: { showDetailsLabel, hideDetailsLabel, time: timeWords },
      open: openMap,
      moves,
      timeScale,
    }),
    [showDetailsLabel, hideDetailsLabel, timeWords, openMap, moves, timeScale]
  );

  /* ── render ──────────────────────────────────────────────────────────── */

  const total = filtered.length;
  const firstOf = useMemo(() => {
    const m = new Map<string, number>();
    let n = 1;
    for (const d of days)
      for (const b of d.blocks) {
        m.set(b.key, n);
        n += b.events.length;
      }
    return m;
  }, [days]);
  const list = (
    <div
      ref={listRef}
      className="cds-afeed__list"
      role="feed"
      aria-labelledby={headId}
      aria-busy={loading || undefined}>
      {days.map((d) => (
        <section
          key={d.day}
          className="cds-afeed__day"
          data-day={d.day}
          aria-labelledby={`${headId}-${d.day}`}>
          <h3 className="cds-afeed__day-title" id={`${headId}-${d.day}`}>
            {dayLabel(d.day, today, { todayLabel, yesterdayLabel })}
          </h3>
          {d.blocks.map((b) => (
            <BlockView
              key={b.key}
              block={b}
              first={firstOf.get(b.key)!}
              total={total}
              shown={isShown(b.key)}
              spacer={spacerOf(b)}
              register={register}
            />
          ))}
        </section>
      ))}
    </div>
  );

  const empty = !loading && total === 0;

  return (
    <div
      {...rest}
      className={cx('cds-afeed', windowed && 'cds-afeed--windowed', className)}
      data-motion-icon-frame="">
      <span id={headId} className="cds-afeed__label">
        {label}
      </span>
      {categories && categories.length > 0 && (
        <div
          className="cds-afeed__filters"
          role="group"
          aria-label={filterLabel}>
          <SelectableTag
            size="md"
            selected={selected.length === 0}
            onChange={() => selected.length && choose([])}
            timeScale={timeScale}>
            {allLabel}
          </SelectableTag>
          {categories.map((t) => (
            <SelectableTag
              key={t.id}
              size="md"
              selected={selected.includes(t.id)}
              onChange={() => toggleCategory(t.id)}
              timeScale={timeScale}>
              {t.label}
            </SelectableTag>
          ))}
        </div>
      )}
      <Shared.Provider value={shared}>
        <Scroller
          className="cds-afeed__scroller"
          viewportClassName="cds-afeed__viewport"
          viewportRef={viewport}
          aria-label={label}
          timeScale={timeScale}>
          <div
            ref={sentinel}
            className="cds-afeed__sentinel"
            aria-hidden="true"
          />
          <SkeletonReveal loading={loading} skeleton={<FeedSkeleton />}>
            {empty ? (
              <EmptyState
                className="cds-afeed__empty"
                context="panel"
                title={emptyTitle}
                subtitle={emptySubtitle}
                timeScale={timeScale}
              />
            ) : (
              <PlaceHold
                watch={filtered}
                when={holdWhen}
                viewport={viewport}
                onHeld={onHeld}>
                {list}
              </PlaceHold>
            )}
          </SkeletonReveal>
          {!loading && (
            <JumpTo
              container={viewport}
              preset="top"
              label={latestLabel}
              count={unseen}
              countLabel={newEventsLabel}
              timeScale={timeScale}
            />
          )}
        </Scroller>
      </Shared.Provider>
    </div>
  );
}
ActivityFeed.displayName = 'ActivityFeed';

/** The loading rows: an avatar, a line and a shorter one, as an event. */
function FeedSkeleton() {
  return (
    <div className="cds-afeed__skeleton" aria-hidden="true">
      {[72, 56, 64, 48, 68, 52].map((w, i) => (
        <div key={i} className="cds-afeed__skeleton-row">
          <SkeletonPlaceholder className="cds-afeed__skeleton-avatar" />
          <div className="cds-afeed__skeleton-lines">
            <SkeletonText width={`${w}%`} />
            <SkeletonText width="24%" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PlaceHoldProps {
  /** A new value is a new list. */
  watch: unknown;
  /** Whether to hold: the reader is away from the top. */
  when: () => boolean;
  viewport: RefObject<HTMLDivElement | null>;
  onHeld: () => void;
  children: ReactNode;
}

interface Snap {
  vp: HTMLElement;
  id: string;
  offset: number;
}

/** Holds the reader's place: the first row in view, read before the commit's
 *  DOM changes and put back after, so new events above move nothing on screen. */
class PlaceHold extends Component<PlaceHoldProps> {
  getSnapshotBeforeUpdate(prev: PlaceHoldProps): Snap | null {
    const vp = this.props.viewport.current;
    if (prev.watch === this.props.watch || !vp || !this.props.when())
      return null;
    const top = vp.getBoundingClientRect().top;
    for (const row of vp.querySelectorAll<HTMLElement>('.cds-afeed__event')) {
      const r = row.getBoundingClientRect();
      if (r.bottom > top)
        return { vp, id: row.dataset.eventId!, offset: r.top - top };
    }
    return null;
  }

  componentDidUpdate(
    _prev: PlaceHoldProps,
    _state: unknown,
    snap: Snap | null
  ) {
    // The view from the snapshot: the scroller's ref is re-attached after this runs.
    if (!snap) return;
    const { vp } = snap;
    const row = vp.querySelector<HTMLElement>(
      `[data-event-id="${CSS.escape(snap.id)}"]`
    );
    if (row)
      vp.scrollTop +=
        row.getBoundingClientRect().top -
        vp.getBoundingClientRect().top -
        snap.offset;
    this.props.onHeld();
  }

  render() {
    return this.props.children;
  }
}
