/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useSyncExternalStore } from 'react';

/* ============================================================================
 * Relative time: one shared minute clock for every "5 min ago" on a page.
 *
 *   tick      one timer, at each wall-clock minute, only while something
 *             listens and the page is shown; a shown page catches up at once
 *   render    each reader takes its own text from the clock
 *             (`useSyncExternalStore` with the text as the snapshot), so a
 *             tick re-renders only the times whose words change, never the
 *             list they sit in
 * ========================================================================== */

const MINUTE = 60_000;
const DAY = 86_400_000;

export interface RelativeTimeWords {
  /** Under a minute. Default "Just now". */
  nowText?: string;
  /** Under an hour. Default "n min ago". */
  minutesAgoText?: (n: number) => string;
  /** Earlier today. Default "n h ago". */
  hoursAgoText?: (n: number) => string;
}

/** The start of `t`'s day, local time, ms. */
export function dayStart(t: number): number {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** The clock time, for an event on an earlier day (its day header says the day). */
export function clockText(t: number): string {
  return new Date(t).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** `t` as words from `now`: just now, minutes, hours today; the clock time on an earlier day. */
export function relativeTimeText(
  t: number,
  now: number,
  words: RelativeTimeWords = {}
): string {
  if (dayStart(t) < dayStart(now)) {
    return clockText(t);
  }
  const m = Math.floor(Math.max(0, now - t) / MINUTE);
  if (m < 1) {
    return words.nowText ?? 'Just now';
  }
  if (m < 60) {
    return (words.minutesAgoText ?? ((n) => `${n} min ago`))(m);
  }
  const h = Math.floor(m / 60);
  return (words.hoursAgoText ?? ((n) => `${n} h ago`))(h);
}

/** A day's header: today, yesterday, else the weekday and date (and the year, when it isn't this one). */
export function dayLabel(
  day: number,
  now: number,
  words: { todayLabel?: string; yesterdayLabel?: string } = {}
): string {
  const today = dayStart(now);
  if (day >= today) {
    return words.todayLabel ?? 'Today';
  }
  if (day >= dayStart(today - DAY / 2)) {
    return words.yesterdayLabel ?? 'Yesterday';
  }
  const d = new Date(day);
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/* ── the clock ─────────────────────────────────────────────────────────── */

/** The clock reads whole minutes, so every reader in a minute agrees. */
const minuteOf = (t: number) => Math.floor(t / MINUTE) * MINUTE;
let now = minuteOf(Date.now());
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let visibilityBound = false;

function notify() {
  now = minuteOf(Date.now());
  listeners.forEach((l) => l());
}

function schedule() {
  if (timer != null) {
    clearTimeout(timer);
  }
  timer = null;
  if (!listeners.size) {
    return;
  }
  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'hidden'
  ) {
    return;
  }
  const wait = MINUTE - (Date.now() % MINUTE) + 20;
  timer = setTimeout(() => {
    timer = null;
    notify();
    schedule();
  }, wait);
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    if (timer != null) {
      clearTimeout(timer);
    }
    timer = null;
    return;
  }
  notify();
  schedule();
}

function subscribe(listener: () => void): () => void {
  if (!listeners.size) {
    now = minuteOf(Date.now());
    if (!visibilityBound && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
      visibilityBound = true;
    }
  }
  listeners.add(listener);
  if (timer == null) {
    schedule();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      if (timer != null) {
        clearTimeout(timer);
      }
      timer = null;
    }
  };
}

function snapshot() {
  // Nothing listening: the clock isn't ticking, so read the minute now.
  if (!listeners.size) {
    now = minuteOf(Date.now());
  }
  return now;
}

/** Every listener's text again now (a page that knows time moved: a resume from sleep). */
export function refreshRelativeTimes(): void {
  notify();
  schedule();
}

/** The clock's minute, ms: changes once a minute. */
export function useMinuteClock(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The start of today on the shared clock: changes at midnight only. */
export function useToday(): number {
  const read = () => dayStart(snapshot());
  return useSyncExternalStore(subscribe, read, read);
}

/** `t` as relative words, re-rendering only when the words change. */
export function useRelativeTime(t: number, words?: RelativeTimeWords): string {
  const read = () => relativeTimeText(t, snapshot(), words);
  return useSyncExternalStore(subscribe, read, read);
}
