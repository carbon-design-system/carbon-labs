/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  REDUCED_MOTION,
  SNAP,
  SNAP_FRAME,
  animateLayout,
  attachRollover,
  durationStepForDistance,
  motionTokens,
  playContentSwap,
  staggerSteps,
  stepDown,
  useSnapSurface,
  usePrefersReducedMotion,
  useStagger,
  type SnapProfile,
} from '@carbon-labs/v12-motion';
import {
  placeOnAnchor,
  themeOf,
  type SurfaceAlignment,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import { floatingOrSurface } from '@carbon-labs/react-snap';
import {
  ArrowRight,
  ChevronDownUpToggle,
  Close,
  Notification,
  NotificationOffToggle,
  Settings,
} from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Link } from '@carbon-labs/react-link';
import { RollText } from '@carbon-labs/react-roll-text';
import { Scroller } from '@carbon-labs/react-scroller';
import { StatusMark, type FeedbackKind } from '@carbon-labs/react-feedback';
import { useLatest } from '@carbon-labs/react-selection-kit';
import {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from '@carbon-labs/react-popover';
import { disclosureArrival } from '@carbon-labs/react-disclosure';
import './notifications-panel.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * NotificationsPanel — Carbon for IBM Products' NotificationsPanel, prop for
 * prop, on the kit's look and motion.
 *
 *   surface   the quiet surface (`--cds-surface`, its hairline), 16px
 *             corners (the floating surfaces' cast shadow with `shadow`;
 *             none by default); placed under its
 *             trigger (`triggerButtonRef`), end-aligned, inside the viewport
 *   open      the snap from its header trigger (`SNAP.floating`, timed by
 *             size: `floatingOrSurface`): the frame grows from the
 *             trigger while the content layer moves down with the opening
 *             from `t = 0`, landing just after the longest axis clock
 *             (one step or 60ms later, whichever is sooner); closing,
 *             the far edge pulls back into the trigger. Reopened mid-exit
 *             it turns round
 *   items     the notifications in Today, Yesterday and Previous, each a
 *             status mark (the kit's notification icons and colors), when
 *             (in Yesterday, only the time: the group says the day), title,
 *             description (Read more / Read less past two lines) and link.
 *             Unread ones carry a blue dot, knocked out of the mark (a cut,
 *             so it holds on the row's rest, hover and press), and a
 *             semibold title
 *   actions   Read more and the link share a line under the description:
 *             Read more is the kit's text button (`Button frame="none"`)
 *             with the disclosure's chevron (ChevronDownUpToggle, as
 *             CodeSnippet's Show more), `aria-expanded` and `aria-controls`
 *             on the description; the link is the kit's `Link`
 *   more      Read more / Read less: the text's place opens on the travel's
 *             step (entrance-productive) and shuts one step faster
 *             (exit-productive) under the disclosure's soft edge; its two
 *             lines are already there, so the text is uncovered in place.
 *             Shutting, the text holds still and whole; the clamp and its
 *             ellipsis come back once the place has closed
 *   dismiss   a dismissed row's place shuts (its height to nothing on
 *             exit-productive) while its content holds still and the soft
 *             edge closes over it, no fade, and what's below closes up with
 *             it: one layout move (`animateLayout`) on the travel's step,
 *             one step faster as an exit. A group's title goes with its last
 *             row
 *   all       Dismiss all: the rows leave on a stagger faster than the
 *             entrance (each up 8px and out), then the list's place resizes
 *             to the empty state, which comes in after it (out, then in)
 *   arrive    a notification added while the panel is open opens its place
 *             on the travel's step under the soft edge and its content
 *             comes down 8px into it from half the open over fast-02, no
 *             fade (the kit's disclosure, `disclosureArrival`); its status
 *             mark plays its beat once it has landed
 *   density   compact:
 *             a 40px header, the content 12px in (the sm field inset), rows
 *             8px top and bottom with when on the title's line, a 40px
 *             footer
 *   dnd       Do not disturb is an icon toggle in the header: motion-icons'
 *             NotificationOffToggle (the bell, the bell slashed) in a ghost
 *             IconButton, pressed (`isSelected`: `aria-pressed`, the selected look).
 *             The trigger's bell follows it (`NotificationsBell`):
 *             the host passes the state on, and back as
 *             `doNotDisturbDefaultToggled`; arrivals keep coming
 *   view all  the whole footer cell, from the divider to the panel's foot,
 *             inside the hairline, with the panel's bottom corners (less the
 *             hairline), on the ghost Button's rollover (`rollover-ghost`:
 *             link-blue tints, the label's step, press and release; no 1px
 *             grow or press, the cell's geometry);
 *             its label at the content inset, an arrow at the end; a link
 *             with `viewAllHref`, else a button. Its count rolls (the kit's
 *             RollText)
 *   close     a press outside it (not on the trigger) or Escape asks the
 *             host (`onClickOutside`); Escape puts focus back on the trigger
 *   reduced   the panel fades in place; the stagger and an arrival's content
 *             are fades on the reduced clock; the places open and close at
 *             once
 *
 * Carbon for IBM Products' props: `open`, `data`, `onClickOutside`,
 * `triggerButtonRef`, `onDismissAllNotifications`,
 * `onDismissSingleNotification`, `onDoNotDisturbChange`, `onViewAllClick`,
 * `onSettingsClick`, `title`, `todayLabel`, `yesterdayLabel`,
 * `previousLabel`, `dismissAllLabel`, `doNotDisturbLabel`, `viewAllLabel`,
 * `emptyStateLabel`, `readMoreLabel`, `readLessLabel`,
 * `dismissSingleNotificationIconDescription`, `settingsIconDescription`, the
 * time texts (`nowText`, `minuteAgoText` … `yearsAgoText`,
 * `yesterdayAtText`), `className`. The kit adds: `align`, `shadow`,
 * `timeScale`, `doNotDisturbDefaultToggled`, `viewAllHref`.
 * ========================================================================== */

const bezier = (name: keyof typeof motionTokens.easing) =>
  `cubic-bezier(${motionTokens.easing[name].join(', ')})`;

/**
 * A place opening or shutting (a row arriving or dismissed, Read more):
 * clipped under the disclosure's soft bottom edge, `min(16px, h − shut,
 * H − h)` for a place h tall of its open H that rests `shut` tall
 * (notifications-panel.scss, `[data-npanel-clip]`).
 */
function clipPlace(el: HTMLElement, open: number, shut = 0) {
  el.style.setProperty('--cds-npanel-open', `${open}px`);
  el.style.setProperty('--cds-npanel-shut', `${shut}px`);
  el.setAttribute('data-npanel-clip', '');
}

function unclipPlace(el: HTMLElement) {
  el.removeAttribute('data-npanel-clip');
  el.style.removeProperty('--cds-npanel-open');
  el.style.removeProperty('--cds-npanel-shut');
}

export type NotificationsPanelType =
  | 'error'
  | 'warning'
  | 'success'
  | 'informational';

export interface NotificationsPanelData {
  id: string | number;
  type: NotificationsPanelType;
  title: string;
  description?: string;
  timestamp: Date;
  /** Unread: a blue dot and a semibold title. */
  unread?: boolean;
  /** The row is a control: a click (or Enter on its title) calls this. */
  onNotificationClick?: (notification: NotificationsPanelData) => void;
  link?: { text: string; url: string };
}

const KIND: Record<NotificationsPanelType, FeedbackKind> = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  informational: 'info',
};

/** The floating surface, timed by Axial from the panel's size (`floatingOrSurface`); reduced motion fades in place. */
const PROFILE: SnapProfile = {
  ...SNAP.floating,
  timing: 'axial',
  blinkOff: false,
};

type Group = 'today' | 'yesterday' | 'previous';

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupOf(ts: Date, now: Date): Group {
  const day = dayStart(ts);
  if (day >= dayStart(now)) return 'today';
  // Yesterday's start by the calendar, not 24h back: a day a clock change makes 23 or 25 hours long still counts whole.
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  ).getTime();
  if (day >= yesterday) return 'yesterday';
  return 'previous';
}

export interface NotificationsPanelProps {
  /** Shown while true; it snaps out when it turns false. */
  open: boolean;
  /** The notifications, newest first. */
  data?: NotificationsPanelData[];
  /** A press outside the panel (not on its trigger), or Escape. */
  onClickOutside?: () => void;
  /** The button that opens it: placed from it, grown from it, focus returned to it. */
  triggerButtonRef?: RefObject<HTMLElement | null>;
  onDismissAllNotifications?: () => void;
  onDismissSingleNotification?: (notification: NotificationsPanelData) => void;
  /** Shows the Do not disturb toggle (an icon toggle in the header). */
  onDoNotDisturbChange?: (checked: boolean) => void;
  /** Do not disturb's starting state. Default false. */
  doNotDisturbDefaultToggled?: boolean;
  /**
   * Shows View all. Called with the click; with `viewAllHref`, a host that
   * routes on the client calls `event.preventDefault()`.
   */
  onViewAllClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  /** View all is a link to the full notifications page. Shows View all on its own too. */
  viewAllHref?: string;
  /** Shows the settings button. */
  onSettingsClick?: () => void;
  title?: string;
  todayLabel?: string;
  yesterdayLabel?: string;
  previousLabel?: string;
  dismissAllLabel?: string;
  doNotDisturbLabel?: string;
  viewAllLabel?: (count: number) => string;
  emptyStateLabel?: string;
  readMoreLabel?: string;
  readLessLabel?: string;
  dismissSingleNotificationIconDescription?: string;
  settingsIconDescription?: string;
  nowText?: string;
  minuteAgoText?: (n: number) => string;
  minutesAgoText?: (n: number) => string;
  hourAgoText?: (n: number) => string;
  hoursAgoText?: (n: number) => string;
  yesterdayAtText?: (time: string) => string;
  daysAgoText?: (n: number) => string;
  monthAgoText?: (n: number) => string;
  monthsAgoText?: (n: number) => string;
  yearAgoText?: (n: number) => string;
  yearsAgoText?: (n: number) => string;
  className?: string;
  /** Where it sits on its trigger. Default `bottom-end`. */
  align?: SurfaceAlignment;
  /** The cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

/** The warm-up's strength and length: invisible, about the snap's open. */
const WARM_ALPHA = 0.005;
const WARM_MS = 320;
let warmedPage = false;

/** Once per page, on idle: the panel opens at 0.5% for WARM_MS, so the
 *  first real open doesn't pay its first-render costs mid-snap. */
function useFirstOpenWarmUp(closed: boolean): boolean {
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (!closed || warmedPage || typeof window === 'undefined') return;
    let started = false;
    let cancelled = false;
    const start = () => {
      if (cancelled || warmedPage) return;
      // A hidden page draws nothing: wait to be shown.
      if (document.visibilityState === 'hidden') {
        document.addEventListener('visibilitychange', start, { once: true });
        return;
      }
      warmedPage = true;
      started = true;
      setWarm(true);
    };
    const idle = 'requestIdleCallback' in window;
    const id = idle
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      document.removeEventListener('visibilitychange', start);
      if (started) setWarm(false);
    };
  }, [closed]);
  // WARM_MS from its first frame drawn: the first render's cost doesn't shorten it.
  useEffect(() => {
    if (!warm) return;
    let stop = 0;
    const frame = window.requestAnimationFrame(() => {
      stop = window.setTimeout(() => setWarm(false), WARM_MS);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stop);
    };
  }, [warm]);
  return warm && closed;
}

/** Mounted while open and while it leaves; portalled with its trigger's theme. */
export function NotificationsPanel(props: NotificationsPanelProps) {
  const { present, exited } = useFloatingMount(props.open);
  const warm = useFirstOpenWarmUp(!props.open && !present);
  const themeClass = useKeptTheme(
    props.open || warm ? themeOf(props.triggerButtonRef?.current) : undefined
  );
  if (!present && !warm) return null;
  // The portal leaves the brand zone: KitPortal carries the brand with it.
  return (
    <KitPortal
      anchor={() => props.triggerButtonRef?.current}
      hold={!props.open && !warm}
      className={cx(
        'cds-npanel-portal',
        warm && 'cds-npanel-portal--warm',
        themeClass,
        themeClass && 'cds--layer-one'
      )}
      aria-hidden={warm || undefined}
      {...inertProps(warm)}
      data-cds-npanel-warm={warm ? '' : undefined}
      style={warm ? { opacity: WARM_ALPHA } : undefined}>
      {/* Keyed: a real open after the warm-up starts afresh, with its own snap. */}
      <PanelBody
        key={warm ? 'warm' : 'live'}
        {...props}
        open={props.open || warm}
        warm={warm}
        onExited={exited}
      />
    </KitPortal>
  );
}
NotificationsPanel.displayName = 'NotificationsPanel';

interface Entry {
  n: NotificationsPanelData;
  leaving: boolean;
  /** Added while the panel was open: its place opens. */
  entering: boolean;
}

/** The new list, the ones that left kept in place (leaving) until their exit ends. */
function merge(
  prev: Entry[],
  data: NotificationsPanelData[],
  animateNew: boolean
): Entry[] {
  const ids = new Set(data.map((d) => d.id));
  const out: Entry[] = data.map((n) => {
    const old = prev.find((e) => e.n.id === n.id);
    return {
      n,
      leaving: false,
      entering: old ? old.entering && !old.leaving : animateNew,
    };
  });
  prev.forEach((e, i) => {
    if (ids.has(e.n.id)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const k = out.findIndex((o) => o.n.id === prev[j]!.n.id);
      if (k >= 0) {
        at = k + 1;
        break;
      }
    }
    out.splice(at, 0, { ...e, leaving: true, entering: false });
  });
  return out;
}

const entryKey = (id: string | number) => CSS.escape(String(id));

function PanelBody({
  open,
  data = [],
  onClickOutside,
  triggerButtonRef,
  onDismissAllNotifications,
  onDismissSingleNotification,
  onDoNotDisturbChange,
  doNotDisturbDefaultToggled = false,
  onViewAllClick,
  viewAllHref,
  onSettingsClick,
  title = 'Notifications',
  todayLabel = 'Today',
  yesterdayLabel = 'Yesterday',
  previousLabel = 'Previous',
  dismissAllLabel = 'Dismiss all',
  doNotDisturbLabel = 'Do not disturb',
  viewAllLabel = (n) => `View all (${n})`,
  emptyStateLabel = 'You do not have any notifications',
  readMoreLabel = 'Read more',
  readLessLabel = 'Read less',
  dismissSingleNotificationIconDescription = 'Dismiss',
  settingsIconDescription = 'Settings',
  nowText = 'Now',
  minuteAgoText = (n) => `${n} minute ago`,
  minutesAgoText = (n) => `${n} minutes ago`,
  hourAgoText = (n) => `${n} hour ago`,
  hoursAgoText = (n) => `${n} hours ago`,
  // The Yesterday group says the day: its rows show only the time.
  yesterdayAtText = (t) => t,
  daysAgoText = (n) => `${n} days ago`,
  monthAgoText = (n) => `${n} month ago`,
  monthsAgoText = (n) => `${n} months ago`,
  yearAgoText = (n) => `${n} year ago`,
  yearsAgoText = (n) => `${n} years ago`,
  className,
  align = 'bottom-end',
  shadow,
  timeScale = 1,
  onExited,
  warm = false,
}: NotificationsPanelProps & { onExited: () => void; warm?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const id = `cds-npanel-${useId().replace(/:/g, '')}`;
  const latest = useLatest({
    triggerButtonRef,
    align,
    onClickOutside,
    onExited,
    reduced,
    timeScale,
    warm,
  });
  const rolloverReduced = useReducedGetter();
  const [dnd, setDnd] = useState(doNotDisturbDefaultToggled);

  /* ── the list: what's there, what's leaving, what's arriving ─────────── */

  const [entries, setEntries] = useState<Entry[]>(() =>
    data.map((n) => ({ n, leaving: false, entering: false }))
  );
  const [seen, setSeen] = useState(data);
  if (seen !== data) {
    setSeen(data);
    setEntries((prev) => merge(prev, data, open));
  }
  const live = entries.filter((e) => !e.leaving);
  // After a dismiss all: the empty state, coming in once the list's place has resized.
  const [emptyFrom, setEmptyFrom] = useState<number | null>(null);

  // "5 minutes ago" moves on while it's open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, [open]);

  const when = (ts: Date) => {
    const s = Math.max(0, (now.getTime() - ts.getTime()) / 1000);
    const group = groupOf(ts, now);
    if (group === 'yesterday')
      return yesterdayAtText(
        ts.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    if (s < 60) return nowText;
    const m = Math.floor(s / 60);
    if (m < 60) return m === 1 ? minuteAgoText(m) : minutesAgoText(m);
    const h = Math.floor(m / 60);
    if (group === 'today') return h === 1 ? hourAgoText(h) : hoursAgoText(h);
    const d = Math.max(
      2,
      Math.round((dayStart(now) - dayStart(ts)) / 86_400_000)
    );
    if (d < 30) return daysAgoText(d);
    const mo = Math.floor(d / 30);
    if (mo < 12) return mo === 1 ? monthAgoText(mo) : monthsAgoText(mo);
    const y = Math.floor(d / 365) || 1;
    return y === 1 ? yearAgoText(y) : yearsAgoText(y);
  };

  /* ── the surface: the snap from its trigger ──────────────────────────── */

  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(ref, {
    profile: () => floatingOrSurface(ref.current, PROFILE),
    reduced,
    timeScale,
    shadow: elevation,
  });

  const place = () => {
    const el = ref.current;
    const a = latest.current.triggerButtonRef?.current;
    if (!el) return;
    el.style.left = '0px';
    el.style.top = '0px';
    const r = el.getBoundingClientRect();
    const size = { w: Math.ceil(r.width), h: Math.ceil(r.height) };
    // No trigger: under the header (3rem), at the window's end edge.
    const anchor =
      a?.getBoundingClientRect() ??
      new DOMRect(window.innerWidth - 8, 0, 0, 48);
    const at = placeOnAnchor(anchor, size, latest.current.align);
    const dpr = window.devicePixelRatio || 1;
    el.style.left = `${Math.round(at.left * dpr) / dpr}px`;
    el.style.top = `${Math.round(at.top * dpr) / dpr}px`;
  };

  // Dismiss all: the groups' titles and rows leave on one stagger.
  const items = () => [
    ...(bodyRef.current?.querySelectorAll<HTMLElement>('[data-npanel-item]') ??
      []),
  ];
  const leave = useStagger({
    count: Math.max(1, entries.length + 3),
    each: staggerSteps['02'],
  });
  const staggerRef = useLatest({ leave });

  // Its lifecycle (`useFloatingPresence`). It doesn't follow its trigger:
  // the header it opens from holds still.
  useFloatingPresence(surface, {
    open,
    enter: () => {
      const el = ref.current;
      if (!el) return;
      const a =
        latest.current.triggerButtonRef?.current?.getBoundingClientRect();
      surface.open({
        cause: a ? { x: a.left + a.width / 2, y: a.top + a.height / 2 } : null,
        place,
      });
      if (!latest.current.warm) el.focus({ preventScroll: true });
    },
    leave: () => (ref.current ? undefined : false),
    onExited: () => latest.current.onExited(),
  });

  /* ── leaving and arriving rows ───────────────────────────────────────── */

  const played = useRef(new Set<string | number>());
  const entriesNow = useLatest(entries);
  // A dismiss all in flight: its fades, held at their end until the rows are dropped.
  const allOut = useRef<Animation[] | null>(null);
  // Groups shutting (their last row dismissed), with the animation shutting each.
  const shutting = useRef(new Map<HTMLElement, Animation>());
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const ts = latest.current.timeScale;
    const red = latest.current.reduced;
    const rowOf = (key: string | number) =>
      body.querySelector<HTMLElement>(`[data-entry="${entryKey(key)}"]`);
    const drop = (ids: Set<string | number>) =>
      setEntries((prev) => prev.filter((e) => !(e.leaving && ids.has(e.n.id))));
    /** Whether `scope` (a group, the list) holds a row that's staying, in the latest list. */
    const holdsLive = (scope: Element) =>
      entriesNow.current.some(
        (o) => !o.leaving && scope.contains(rowOf(o.n.id))
      );
    /** Hands an animation's state to the inline style and ends it (its fill with it). */
    const settle = (a: Animation) => {
      try {
        a.commitStyles();
      } catch {
        // Not rendered (already removed): nothing to keep.
      }
      a.cancel();
    };

    // One row dismissed: its place closes (its group's, if it was the
    // group's last), what's below closes up with it.
    const shut = (e: Entry) => {
      const el = rowOf(e.n.id);
      if (!el) return;
      const group = el.closest<HTMLElement>('[data-npanel-group]');
      const groupGoes = group && !holdsLive(group);
      // Its group is already shutting (another of its rows): it goes with it.
      const already = groupGoes ? shutting.current.get(group) : undefined;
      if (already?.playState === 'running') {
        already.finished.then(
          () => drop(new Set([e.n.id])),
          () => {}
        );
        return;
      }
      const target = groupGoes ? group : el;
      const h = target.offsetHeight;
      const ms =
        motionTokens.duration[
          stepDown(
            durationStepForDistance(h)
          ) as keyof typeof motionTokens.duration
        ] * ts;
      // Shutting: its content holds still while the soft edge closes over it.
      clipPlace(target, h);
      const { animation } = animateLayout(
        body,
        target,
        [{ height: `${h}px` }, { height: '0px' }],
        {
          ms,
          easing: bezier('exit-productive'),
          reason: 'notifications-panel-dismiss',
          reduced: red,
        }
      );
      if (groupGoes) shutting.current.set(group, animation);
      animation.finished.then(
        () => {
          // A row arrived into the group as it shut: it stays open.
          if (groupGoes && holdsLive(group)) {
            group.style.removeProperty('height');
            unclipPlace(group);
          } else target.style.height = '0px';
          drop(new Set([e.n.id]));
        },
        () => {}
      );
    };

    // A row added into a group as it shuts: the shutting stops where it is
    // and lets go of the group's height; the dismissed rows in it close
    // their own places instead.
    // Only rows whose leaving already played: one dismissed in this pass is
    // in `leaving` below and shuts there (once). Keyed, so a row is shut once.
    const reshut = new Map<string | number, Entry>();
    const again = (o: Entry) => {
      if (played.current.has(o.n.id)) reshut.set(o.n.id, o);
    };
    for (const [group, a] of shutting.current) {
      if (!group.isConnected) {
        shutting.current.delete(group);
        continue;
      }
      if (!holdsLive(group)) continue;
      shutting.current.delete(group);
      settle(a);
      group.style.removeProperty('height');
      unclipPlace(group);
      for (const o of entries)
        if (o.leaving && group.contains(rowOf(o.n.id))) again(o);
    }

    // A row added during a dismiss all: the dismiss all stops. The rows
    // still leaving keep where their fade got to and close their places;
    // what stays (a returning group's title) comes back from there.
    const all = allOut.current;
    if (all && entries.some((e) => !e.leaving)) {
      allOut.current = null;
      const back =
        motionTokens.duration['fast-02'] *
        ts *
        (red ? REDUCED_MOTION.clock : 1);
      for (const a of all) {
        const item = (a.effect as KeyframeEffect | null)
          ?.target as HTMLElement | null;
        settle(a);
        if (!item?.isConnected) continue;
        const id = item.getAttribute('data-entry');
        const gone =
          id != null ? entries.find((o) => String(o.n.id) === id) : undefined;
        if (gone?.leaving) {
          again(gone);
          continue;
        }
        const group = item.closest('[data-npanel-group]');
        if (id == null && group && !holdsLive(group)) continue; // its group is going: it stays out
        const from = {
          opacity: item.style.opacity || '1',
          transform: item.style.transform || 'none',
        };
        item.style.removeProperty('opacity');
        item.style.removeProperty('transform');
        item.animate([from, { opacity: 1, transform: 'none' }], {
          duration: back,
          easing: bezier('entrance-productive'),
        });
      }
    }
    // Closed (or closing): nothing to show, so they go at once.
    if (open) reshut.forEach(shut);
    else if (reshut.size) drop(new Set(reshut.keys()));

    // A row back from leaving (added again): whole.
    for (const e of entries) {
      if (e.leaving || !played.current.has(e.n.id)) continue;
      played.current.delete(e.n.id);
      const el = rowOf(e.n.id);
      if (!el) continue;
      el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      unclipPlace(el);
      // An interrupted dismiss all committed its fade to the row (`settle`).
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
    }

    const leaving = entries.filter(
      (e) => e.leaving && !played.current.has(e.n.id)
    );
    const arriving = entries.filter(
      (e) => e.entering && !e.leaving && !played.current.has(`+${e.n.id}`)
    );
    if (!open) {
      if (leaving.length) drop(new Set(leaving.map((e) => e.n.id)));
      return;
    }
    leaving.forEach((e) => played.current.add(e.n.id));
    arriving.forEach((e) => played.current.add(`+${e.n.id}`));

    if (leaving.length && !entries.some((e) => !e.leaving)) {
      // Dismiss all: every row out on a stagger faster than the entrance, then the empty state.
      const fromH = body.offsetHeight;
      const out = items();
      const step = motionTokens.duration['fast-01'] * ts * (red ? 0.5 : 1);
      const anims = out.map((item, i) =>
        item.animate(
          red
            ? [{ opacity: 1 }, { opacity: 0 }]
            : [
                { opacity: 1, transform: 'none' },
                { opacity: 0, transform: 'translateY(-8px)' },
              ],
          {
            duration: step,
            delay: staggerRef.current.leave.delay(i) * ts,
            easing: bezier('exit-productive'),
            fill: 'forwards',
          }
        )
      );
      allOut.current = anims;
      void Promise.all(anims.map((a) => a.finished)).then(
        () => {
          // Stopped (a row arrived): the rows still leaving close their own places.
          if (allOut.current !== anims) return;
          // The empty state only if the list is still empty; a row that
          // arrived on the last frame ends the dismiss all on the next pass.
          if (!entriesNow.current.some((e) => !e.leaving)) {
            allOut.current = null;
            setEmptyFrom(fromH);
          }
          drop(new Set(leaving.map((e) => e.n.id)));
        },
        () => {}
      );
      return;
    }

    // One row (or a few) dismissed: its place closes, what's below closes up with it.
    leaving.forEach(shut);

    // Added while open: its place opens, and its content comes down into it from half the open.
    for (const e of arriving) {
      const el = rowOf(e.n.id);
      if (!el) continue;
      const h = el.offsetHeight;
      const token = durationStepForDistance(
        h
      ) as keyof typeof motionTokens.duration;
      const ms = motionTokens.duration[token] * ts;
      clipPlace(el, h);
      const { animation } = animateLayout(
        body,
        el,
        [{ height: '0px' }, { height: `${h}px` }],
        {
          ms,
          easing: bezier('entrance-productive'),
          reason: 'notifications-panel-arrive',
          reduced: red,
        }
      );
      // The content moves with the opening (the kit's disclosure): 8px back,
      // from half the open, over fast-02, no fade. Reduced: no travel, a fade
      // on the reduced clock. The clip lets go once both have landed.
      const arrival = disclosureArrival(el, ms, { timeScale: ts });
      const content = el.firstElementChild?.animate(
        red
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { transform: `translateY(-${arrival.distance}px)` },
              { transform: 'none' },
            ],
        {
          duration: arrival.duration * (red ? REDUCED_MOTION.clock : 1),
          delay: red ? 0 : arrival.delay,
          easing: arrival.easing,
          fill: 'backwards',
        }
      );
      Promise.all([animation.finished, content?.finished]).then(
        () => unclipPlace(el),
        () => {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs as the list changes
  }, [entries, open]);

  // The empty state after a dismiss all: the list's place resizes to it, then it comes in.
  const emptyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    const empty = emptyRef.current;
    if (emptyFrom == null || !body || !empty) return;
    setEmptyFrom(null);
    const toH = body.offsetHeight;
    const ts = latest.current.timeScale;
    const red = latest.current.reduced;
    const token = durationStepForDistance(
      Math.abs(toH - emptyFrom)
    ) as keyof typeof motionTokens.duration;
    animateLayout(
      body,
      body,
      [{ height: `${emptyFrom}px` }, { height: `${toH}px` }],
      {
        ms: motionTokens.duration[token] * ts,
        easing: bezier('standard-productive'),
        reason: 'notifications-panel-empty',
        reduced: red,
      }
    ).animation.finished.then(
      () => surface.syncShadow(),
      () => {}
    );
    playContentSwap({
      out: null,
      in: empty,
      axis: 'y',
      direction: 1,
      timeScale: ts,
      reduced: red,
    });
  }, [emptyFrom, latest, surface]);

  /* ── closing: a press outside, Escape ────────────────────────────────── */

  useEffect(() => {
    if (!open || warm) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (
        ref.current?.contains(t) ||
        latest.current.triggerButtonRef?.current?.contains(t)
      )
        return;
      // A tooltip or menu opened from inside it lives elsewhere.
      if (t instanceof Element && t.closest('[data-cds-menu], .sel__tip'))
        return;
      latest.current.onClickOutside?.();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, warm, latest]);

  // Escape anywhere while it's open (focus can be on the page: a dismissed row's button is gone).
  useEffect(() => {
    if (!open || warm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || isComposing(e)) return;
      const t = e.target as Node | null;
      if (
        t &&
        t !== document.body &&
        !ref.current?.contains(t) &&
        !latest.current.triggerButtonRef?.current?.contains(t)
      )
        return;
      e.preventDefault();
      latest.current.onClickOutside?.();
      latest.current.triggerButtonRef?.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, warm, latest]);

  // The panel's own rollovers: a row's, an even wash (a row in a list); View
  // all's, the ghost Button's (its tone is in the SCSS, `rollover-ghost`; the
  // default steps, as the Button's call). Read more (a kit Button) and the
  // link (a kit Link) attach their own.
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    return attachRollover(panel, {
      selector: '.cds-npanel__item--clickable, .cds-npanel__view-all',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  /* ── render ──────────────────────────────────────────────────────────── */

  const groups: { key: Group; label: string; rows: Entry[] }[] = [
    { key: 'today', label: todayLabel, rows: [] },
    { key: 'yesterday', label: yesterdayLabel, rows: [] },
    { key: 'previous', label: previousLabel, rows: [] },
  ];
  for (const e of entries)
    groups.find((g) => g.key === groupOf(e.n.timestamp, now))!.rows.push(e);

  // Focus moves on from a dismissed row (its button goes with it): the next row's, else the one before, else the panel.
  const dismiss = (n: NotificationsPanelData) => {
    const body = bodyRef.current;
    const rows = [
      ...(body?.querySelectorAll<HTMLElement>(
        '.cds-npanel__entry:not([data-leaving])'
      ) ?? []),
    ];
    const at = rows.findIndex((r) => r.dataset.entry === String(n.id));
    const next = rows[at + 1] ?? rows[at - 1];
    (
      next?.querySelector<HTMLElement>('.cds-npanel__dismiss') ?? ref.current
    )?.focus({ preventScroll: true });
    onDismissSingleNotification?.(n);
  };
  const dismissAll = () => {
    ref.current?.focus({ preventScroll: true });
    onDismissAllNotifications?.();
  };
  const showEmpty = entries.length === 0;

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={cx('cds-npanel', className)}>
      <span className="cds-npanel__frame" {...SNAP_FRAME} />
      <div className="cds-npanel__content">
        <header className="cds-npanel__header">
          <h2 className="cds-npanel__title">{title}</h2>
          {live.length > 0 && onDismissAllNotifications && (
            <Button
              frame="ghost"
              size="sm"
              className="cds-npanel__dismiss-all"
              onClick={dismissAll}
              timeScale={timeScale}>
              {dismissAllLabel}
            </Button>
          )}
          {onDoNotDisturbChange && (
            <IconButton
              frame="ghost"
              size="sm"
              corners="full"
              align="bottom"
              label={doNotDisturbLabel}
              className="cds-npanel__dnd"
              isSelected={dnd}
              timeScale={timeScale}
              onClick={() => {
                const next = !dnd;
                setDnd(next);
                onDoNotDisturbChange(next);
              }}>
              <NotificationOffToggle
                size={16}
                toggled={dnd}
                disableToggle
                aria-hidden="true"
              />
            </IconButton>
          )}
          {onSettingsClick && (
            <IconButton
              frame="ghost"
              size="sm"
              corners="full"
              align="bottom"
              label={settingsIconDescription}
              timeScale={timeScale}
              onClick={() => onSettingsClick()}>
              <Settings size={16} />
            </IconButton>
          )}
        </header>
        {/* The list scrolls in the kit's Scroller; its rows are the tab stops. */}
        <Scroller
          className="cds-npanel__scroller"
          viewportClassName="cds-npanel__body"
          viewportRef={bodyRef}
          focusable={false}
          timeScale={timeScale}>
          {showEmpty ? (
            <div ref={emptyRef} className="cds-npanel__empty">
              <Notification size={32} animated={false} aria-hidden="true" />
              <p>{emptyStateLabel}</p>
            </div>
          ) : (
            groups
              .filter((g) => g.rows.length)
              .map((g) => (
                <section
                  key={g.key}
                  className="cds-npanel__group"
                  data-npanel-group=""
                  aria-label={g.label}>
                  <h3 className="cds-npanel__group-title" data-npanel-item="">
                    {g.label}
                  </h3>
                  {g.rows.map((e) => (
                    <PanelRow
                      key={e.n.id}
                      entry={e}
                      when={when(e.n.timestamp)}
                      onDismiss={dismiss}
                      dismissLabel={dismissSingleNotificationIconDescription}
                      readMoreLabel={readMoreLabel}
                      readLessLabel={readLessLabel}
                      timeScale={timeScale}
                      body={bodyRef}
                    />
                  ))}
                </section>
              ))
          )}
        </Scroller>
        {(onViewAllClick || viewAllHref) && (
          <footer className="cds-npanel__footer">
            <ViewAll
              href={viewAllHref}
              onClick={onViewAllClick}
              label={
                <RollText
                  text={viewAllLabel(live.length)}
                  order={live.length}
                  timeScale={timeScale}
                />
              }
            />
          </footer>
        )}
      </div>
    </div>
  );
}

/* Read more's chevron: the disclosure's (the Accordion's and CodeSnippet's
   Show more), down while shut, up while open. A stable component for
   Button's `renderIcon`, reading the row's state from context. */
const MoreOpen = createContext(false);

function MoreChevron(props: { className?: string; size?: 16 | 20 }) {
  const open = useContext(MoreOpen);
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

function PanelRow({
  entry,
  when,
  onDismiss,
  dismissLabel,
  readMoreLabel,
  readLessLabel,
  timeScale,
  body,
}: {
  entry: Entry;
  when: ReactNode;
  onDismiss: (n: NotificationsPanelData) => void;
  dismissLabel: string;
  readMoreLabel: string;
  readLessLabel: string;
  timeScale: number;
  body: RefObject<HTMLDivElement | null>;
}) {
  const { n, leaving, entering } = entry;
  const reduced = usePrefersReducedMotion();
  const clickable = !!n.onNotificationClick;
  const descRef = useRef<HTMLParagraphElement>(null);
  const [long, setLong] = useState(false);
  const [more, setMore] = useState(false);
  // Read less: the text stays whole while its place shuts over it; the
  // clamp and its ellipsis come back once it has closed.
  const [shutting, setShutting] = useState(false);
  const clamped = !more && !shutting;
  const moveRef = useRef<Animation | null>(null);
  const descId = `cds-npanel-desc-${useId().replace(/:/g, '')}`;

  // Read more only when the description runs past its two lines.
  useLayoutEffect(() => {
    const d = descRef.current;
    if (!d || !clamped) return;
    d.style.removeProperty('height');
    setLong(d.scrollHeight > d.clientHeight + 1);
  }, [n.description, clamped]);

  // Read more / Read less: the kit's disclosure on the text's own place. Its
  // two lines are already there, so the text doesn't arrive: the place
  // uncovers it under the soft edge (as CodeSnippet's Show more), on the
  // travel's step, entrance-productive; shutting, one step faster on
  // exit-productive while the text holds still under the closing edge.
  const toggleMore = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const d = descRef.current;
    const root = body.current;
    const opening = !more;
    setMore(opening);
    if (!d || !root) return;
    // From where it is (a turn mid-move too) to the whole text or its two lines.
    const from = d.getBoundingClientRect().height;
    const lines = parseFloat(getComputedStyle(d).lineHeight) * 2;
    const to = opening ? d.scrollHeight : Math.min(lines, d.scrollHeight);
    moveRef.current?.cancel();
    d.style.removeProperty('height');
    if (Math.abs(to - from) < 1) return setShutting(false);
    setShutting(!opening);
    const token = durationStepForDistance(
      Math.abs(to - from)
    ) as keyof typeof motionTokens.duration;
    const ms =
      motionTokens.duration[
        opening ? token : (stepDown(token) as typeof token)
      ] * timeScale;
    clipPlace(d, d.scrollHeight, lines);
    const { animation } = animateLayout(
      root,
      d,
      [{ height: `${from}px` }, { height: `${to}px` }],
      {
        ms,
        easing: bezier(opening ? 'entrance-productive' : 'exit-productive'),
        reason: 'notifications-panel-more',
        reduced,
      }
    );
    moveRef.current = animation;
    animation.finished.then(
      () => {
        moveRef.current = null;
        unclipPlace(d);
        if (opening) return;
        // Held at its two lines until the clamp is back (the layout effect below lets go).
        d.style.height = `${to}px`;
        setShutting(false);
      },
      () => {}
    );
  };

  return (
    <div
      className="cds-npanel__entry"
      data-entry={String(n.id)}
      data-npanel-item=""
      data-leaving={leaving || undefined}
      {...inertProps(leaving)}>
      <div
        className={cx(
          'cds-npanel__item',
          n.unread && 'cds-npanel__item--unread',
          clickable && 'cds-npanel__item--clickable'
        )}
        onClick={clickable ? () => n.onNotificationClick?.(n) : undefined}>
        <StatusMark
          kind={KIND[n.type]}
          size={16}
          arriveAfter={entering ? motionTokens.duration['moderate-01'] : null}
          className="cds-npanel__mark"
        />
        <div className="cds-npanel__text">
          <div className="cds-npanel__title-row">
            {clickable ? (
              <button
                type="button"
                className="cds-npanel__item-title cds-npanel__item-title--button"
                onClick={(e) => {
                  e.stopPropagation();
                  n.onNotificationClick?.(n);
                }}>
                {n.title}
              </button>
            ) : (
              <p className="cds-npanel__item-title">{n.title}</p>
            )}
            <p className="cds-npanel__when">{when}</p>
          </div>
          {n.description && (
            <p
              ref={descRef}
              id={descId}
              className={cx(
                'cds-npanel__desc',
                clamped && 'cds-npanel__desc--clamped'
              )}>
              {n.description}
            </p>
          )}
          {/* The row's actions on one line: Read more (the kit's text
              button with the disclosure's chevron, as CodeSnippet's Show
              more) and the link (the kit's Link). */}
          {(long || more || n.link) && (
            <div className="cds-npanel__actions">
              {(long || more) && (
                <MoreOpen.Provider value={more}>
                  <Button
                    frame="none"
                    className="cds-npanel__more"
                    renderIcon={MoreChevron}
                    aria-expanded={more}
                    aria-controls={descId}
                    timeScale={timeScale}
                    onClick={toggleMore}>
                    {reduced ? (
                      more ? (
                        readLessLabel
                      ) : (
                        readMoreLabel
                      )
                    ) : (
                      <RollText
                        text={more ? readLessLabel : readMoreLabel}
                        order={more ? 1 : 0}
                        timeScale={timeScale}
                      />
                    )}
                  </Button>
                </MoreOpen.Provider>
              )}
              {n.link && (
                <Link
                  className="cds-npanel__link"
                  href={n.link.url}
                  timeScale={timeScale}
                  onClick={(e) => e.stopPropagation()}>
                  {n.link.text}
                </Link>
              )}
            </div>
          )}
        </div>
        <IconButton
          frame="ghost"
          size="xs"
          corners="full"
          align="left"
          label={dismissLabel}
          className="cds-npanel__dismiss"
          timeScale={timeScale}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(n);
          }}>
          <Close size={16} />
        </IconButton>
      </div>
    </div>
  );
}

/**
 * View all: the whole footer cell on the ghost Button's rollover (the label
 * at the content inset, an arrow at the end); a link to
 * the full notifications page with `href`, else a button.
 */
function ViewAll({
  href,
  onClick,
  label,
}: {
  href?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  label: ReactNode;
}) {
  const inner = (
    <>
      <span className="cds-npanel__view-all-label">{label}</span>
      <ArrowRight size={16} aria-hidden="true" />
    </>
  );
  return href ? (
    <a
      className="cds-npanel__view-all"
      href={href}
      onClick={onClick}
      data-motion-icon-frame="">
      {inner}
    </a>
  ) : (
    <button
      type="button"
      className="cds-npanel__view-all"
      onClick={onClick}
      data-motion-icon-frame="">
      {inner}
    </button>
  );
}
