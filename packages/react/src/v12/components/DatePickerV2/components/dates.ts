/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * Dates for the DatePicker — v11's flatpickr formats, limits and locales,
 * without flatpickr. Plain local-time `Date`s at midnight, compared by day.
 * ============================================================================
 *
 *   format    flatpickr's tokens: d (01–31), j (1–31), m (01–12), n (1–12),
 *             Y (2026), y (26), F (January), M (Jan), l (Monday), D (Mon);
 *             a backslash escapes a character. v11's default is `m/d/Y`
 *   parse     the same tokens, read back; with `m/d/Y`, v11's lenient rule:
 *             a month or day out of range reads as 1, and no year is no date
 *   limits    `minDate` / `maxDate`, v11's `disable` / `enable` lists (a
 *             date, a `{ from, to }` range or a function)
 *   locale    month and weekday names from `Intl`, the week's first day from
 *             the locale (Sunday for `en`, as flatpickr's l10n), or an object
 *             with `firstDayOfWeek` (flatpickr's locale shape)
 * ========================================================================== */

/** A date as v11 takes one: a `Date`, a timestamp, or a string in the picker's format (or ISO). */
export type DateOption = Date | string | number;
/** v11's `disable` / `enable` entries. */
export type DateLimit =
  | DateOption
  | { from: DateOption; to: DateOption }
  | ((date: Date) => boolean);

/** The locale's data the calendar reads. */
export interface CalendarLocale {
  /** The BCP 47 tag `Intl` formats with. */
  tag: string;
  /** 0 Sunday … 6 Saturday. */
  firstDayOfWeek: number;
  months: { longhand: string[]; shorthand: string[] };
  weekdays: { longhand: string[]; shorthand: string[] };
  /** The weekday header's label: v11's single letters for `en` (Th for Thursday). */
  weekdayHeader: string[];
}

/** The day, at local midnight. */
export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDay = (
  a: Date | null | undefined,
  b: Date | null | undefined
) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
/** By day: negative before, 0 the same day, positive after. */
export const compareDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() - startOfDay(b).getTime();
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** The same day `n` months on, held to the month's last day (Jan 31 + 1 → Feb 28). */
export function addMonths(d: Date, n: number) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(
    first.getFullYear(),
    first.getMonth(),
    Math.min(d.getDate(), last)
  );
}
export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);
/** A month's key: year × 12 + month (orders months, and is the swap's direction). */
export const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();

const pad = (n: number) => String(n).padStart(2, '0');

/* ── locale ──────────────────────────────────────────────────────────── */

const cache = new Map<string, CalendarLocale>();

/** v11's `locale`: a code (`en`, `fr` …) or flatpickr's locale object (`{ firstDayOfWeek, … }`). */
export function resolveLocale(locale: unknown): CalendarLocale {
  const obj =
    locale && typeof locale === 'object'
      ? (locale as Record<string, unknown>)
      : null;
  const tag =
    typeof locale === 'string'
      ? locale
      : typeof obj?.locale === 'string'
        ? (obj.locale as string)
        : 'en';
  const base = cache.get(tag) ?? build(tag);
  cache.set(tag, base);
  if (!obj) {
    return base;
  }
  const fdw =
    typeof obj.firstDayOfWeek === 'number'
      ? obj.firstDayOfWeek
      : base.firstDayOfWeek;
  const months = obj.months as CalendarLocale['months'] | undefined;
  const weekdays = obj.weekdays as CalendarLocale['weekdays'] | undefined;
  return {
    ...base,
    firstDayOfWeek: fdw,
    months: months ?? base.months,
    weekdays: weekdays ?? base.weekdays,
    weekdayHeader: weekdays
      ? weekdays.shorthand.map(shortHeader)
      : base.weekdayHeader,
  };
}

/** v11's weekday header: the first letter, and Th for Thursday (`initializeWeekdayShorthand`). */
const shortHeader = (s: string) =>
  s === 'Thu' || s === 'Th' ? 'Th' : s.charAt(0);

function build(tag: string): CalendarLocale {
  let safe = tag;
  try {
    new Intl.DateTimeFormat(tag);
  } catch {
    safe = 'en';
  }
  const month = (style: 'long' | 'short') =>
    Array.from({ length: 12 }, (_, i) =>
      new Intl.DateTimeFormat(safe, { month: style }).format(
        new Date(2026, i, 1)
      )
    );
  // January 4, 2026 is a Sunday.
  const weekday = (style: 'long' | 'short') =>
    Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(safe, { weekday: style }).format(
        new Date(2026, 0, 4 + i)
      )
    );
  const short = weekday('short');
  const en = safe === 'en' || safe.startsWith('en-');
  return {
    tag: safe,
    firstDayOfWeek: firstDayOf(safe),
    months: { longhand: month('long'), shorthand: month('short') },
    weekdays: { longhand: weekday('long'), shorthand: short },
    weekdayHeader: en
      ? short.map(shortHeader)
      : short.map((s) => s.replace(/\.$/, '').slice(0, 2)),
  };
}

/** The week's first day: Sunday for `en` (flatpickr's default l10n), else the locale's (Monday when unknown). */
function firstDayOf(tag: string): number {
  if (tag === 'en') {
    return 0;
  }
  try {
    const loc = new Intl.Locale(tag) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) {
      return info.firstDay % 7;
    }
  } catch {
    /* fall through */
  }
  return tag.startsWith('en-US') ? 0 : 1;
}

/* ── format and parse ────────────────────────────────────────────────── */

/** A date in flatpickr's format tokens. */
export function formatDate(
  d: Date,
  format: string,
  loc: CalendarLocale
): string {
  let out = '';
  for (let i = 0; i < format.length; i++) {
    const c = format[i]!;
    if (c === '\\') {
      out += format[++i] ?? '';
      continue;
    }
    switch (c) {
      case 'd':
        out += pad(d.getDate());
        break;
      case 'j':
        out += d.getDate();
        break;
      case 'm':
        out += pad(d.getMonth() + 1);
        break;
      case 'n':
        out += d.getMonth() + 1;
        break;
      case 'Y':
        out += d.getFullYear();
        break;
      case 'y':
        out += String(d.getFullYear()).slice(-2);
        break;
      case 'F':
        out += loc.months.longhand[d.getMonth()];
        break;
      case 'M':
        out += loc.months.shorthand[d.getMonth()];
        break;
      case 'l':
        out += loc.weekdays.longhand[d.getDay()];
        break;
      case 'D':
        out += loc.weekdays.shorthand[d.getDay()];
        break;
      default:
        out += c;
    }
  }
  return out;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * Text in the format back to a date; null when it isn't one. With v11's
 * default `m/d/Y`, v11's lenient read: a month or day out of range is 1.
 */
export function parseDate(
  text: string,
  format: string,
  loc: CalendarLocale
): Date | null {
  const s = text.trim();
  if (!s) {
    return null;
  }
  if (format === 'm/d/Y') {
    const [m, d, y] = s.split('/');
    const year = Number.parseInt(y ?? '', 10);
    if (!Number.isFinite(year) || !/^\d{4}$/.test((y ?? '').trim())) {
      return null;
    }
    const mi = Number.parseInt(m ?? '', 10);
    const month = mi >= 1 && mi <= 12 ? mi : 1;
    const days = new Date(year, month, 0).getDate();
    const di = Number.parseInt(d ?? '', 10);
    return new Date(year, month - 1, di >= 1 && di <= days ? di : 1);
  }
  const parts: string[] = [];
  let re = '^';
  for (let i = 0; i < format.length; i++) {
    const c = format[i]!;
    if (c === '\\') {
      re += escape(format[++i] ?? '');
      continue;
    }
    const names = (list: string[]) => `(${list.map(escape).join('|')})`;
    const token: Record<string, string> = {
      d: '(\\d{1,2})',
      j: '(\\d{1,2})',
      m: '(\\d{1,2})',
      n: '(\\d{1,2})',
      Y: '(\\d{4})',
      y: '(\\d{2})',
      F: names(loc.months.longhand),
      M: names(loc.months.shorthand),
      l: names(loc.weekdays.longhand),
      D: names(loc.weekdays.shorthand),
    };
    if (token[c]) {
      parts.push(c);
      re += token[c];
    } else {
      re += escape(c);
    }
  }
  const match = new RegExp(re + '$', 'i').exec(s);
  if (!match) {
    // ISO, as flatpickr also takes.
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return iso
      ? valid(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
      : null;
  }
  let y = NaN;
  let mo = 0;
  let d = 1;
  parts.forEach((t, i) => {
    const v = match[i + 1]!;
    const lower = (list: string[]) =>
      list.findIndex((x) => x.toLowerCase() === v.toLowerCase());
    if (t === 'd' || t === 'j') {
      d = Number(v);
    } else if (t === 'm' || t === 'n') {
      mo = Number(v) - 1;
    } else if (t === 'Y') {
      y = Number(v);
    } else if (t === 'y') {
      y = 2000 + Number(v);
    } else if (t === 'F') {
      mo = lower(loc.months.longhand);
    } else if (t === 'M') {
      mo = lower(loc.months.shorthand);
    }
  });
  return valid(y, mo, d);
}

function valid(y: number, m: number, d: number): Date | null {
  if (!Number.isFinite(y) || m < 0 || m > 11 || d < 1) {
    return null;
  }
  const date = new Date(y, m, d);
  return date.getMonth() === m ? date : null;
}

/** v11's `DateOption` to a day; null when it isn't one. */
export function toDate(
  v: DateOption | null | undefined,
  format: string,
  loc: CalendarLocale
): Date | null {
  if (v === null || v === undefined || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : startOfDay(v);
  }
  if (typeof v === 'number') {
    return startOfDay(new Date(v));
  }
  if (v === 'today') {
    return startOfDay(new Date());
  }
  return parseDate(v, format, loc);
}

/** v11's `value`: one date, or an array of them; empties dropped. */
export function toDates(
  v: DateOption | DateOption[] | null | undefined,
  format: string,
  loc: CalendarLocale
): Date[] {
  const list = Array.isArray(v) ? v : [v];
  return list.map((x) => toDate(x, format, loc)).filter((x): x is Date => !!x);
}

/** v11's `isEmptyDateValue`: nothing, an empty string, or an array of those. */
export const isEmptyDateValue = (v: unknown): boolean =>
  v === undefined ||
  v === null ||
  v === '' ||
  (Array.isArray(v) && v.every(isEmptyDateValue));

/* ── limits ──────────────────────────────────────────────────────────── */

export interface DateLimits {
  min: Date | null;
  max: Date | null;
  /** v11's `enable` (only these) or `disable` (all but these). */
  list: DateLimit[] | null;
  mode: 'enable' | 'disable';
}

function inLimit(d: Date, l: DateLimit, format: string, loc: CalendarLocale) {
  if (typeof l === 'function') {
    return l(d);
  }
  if (l && typeof l === 'object' && !(l instanceof Date) && 'from' in l) {
    const from = toDate(l.from, format, loc);
    const to = toDate(l.to, format, loc);
    return !!from && !!to && compareDay(d, from) >= 0 && compareDay(d, to) <= 0;
  }
  return sameDay(d, toDate(l as DateOption, format, loc));
}

/** Can this day be picked? */
export function isDayEnabled(
  d: Date,
  lim: DateLimits,
  format: string,
  loc: CalendarLocale
) {
  if (lim.min && compareDay(d, lim.min) < 0) {
    return false;
  }
  if (lim.max && compareDay(d, lim.max) > 0) {
    return false;
  }
  if (!lim.list || !lim.list.length) {
    return true;
  }
  const hit = lim.list.some((l) => inLimit(d, l, format, loc));
  return lim.mode === 'enable' ? hit : !hit;
}

/* ── the month ───────────────────────────────────────────────────────── */

/** A month's 42 days (six weeks, as flatpickr draws), from the week holding the 1st. */
export function monthGrid(month: Date, firstDayOfWeek: number): Date[] {
  const first = startOfMonth(month);
  const lead = (first.getDay() - firstDayOfWeek + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** v11's aria date: "Thursday, October 22, 2026" (`l, F j, Y`). */
export const ariaDate = (d: Date, loc: CalendarLocale) =>
  formatDate(d, 'l, F j, Y', loc);

/** A day's key: `YYYY-MM-DD`. */
export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A day's key back to the day. */
export function fromIsoDay(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/* ── marked dates (status pips) ──────────────────────────────────────── */

/** An event's status: the support colors, or a neutral gray. */
export type DateMarkKind = 'error' | 'warning' | 'success' | 'info' | 'neutral';

/** A date with an event on it: a pip under the number, and its label in the day's name. */
export interface DateMark {
  date: DateOption;
  /** Default `neutral`. */
  kind?: DateMarkKind;
  /** What's on: read with the date ("Release freeze"). Default: the kind. */
  label?: string;
}

export interface ResolvedDateMark {
  kind: DateMarkKind;
  label?: string;
}

/** The most pips a day draws; its name reads every event. */
export const MAX_PIPS = 3;

const SEVERITY: Record<DateMarkKind, number> = {
  error: 0,
  warning: 1,
  success: 2,
  info: 3,
  neutral: 4,
};

/** Marks by day (`isoDay`), each day's most severe first (so the pips it shows are the ones that matter). */
export function resolveMarks(
  marks: readonly DateMark[] | undefined,
  format: string,
  loc: CalendarLocale
): Map<string, ResolvedDateMark[]> {
  const byDay = new Map<string, ResolvedDateMark[]>();
  for (const m of marks ?? []) {
    const d = toDate(m.date, format, loc);
    if (!d) {
      continue;
    }
    const k = isoDay(d);
    const list = byDay.get(k) ?? [];
    list.push({ kind: m.kind ?? 'neutral', label: m.label });
    byDay.set(k, list);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => SEVERITY[a.kind] - SEVERITY[b.kind]);
  }
  return byDay;
}

/** A day's events, for its accessible name: "2 events: Release freeze (warning), Team lunch". */
export function describeMarks(list: readonly ResolvedDateMark[]): string {
  const items = list
    .map((m) =>
      m.label
        ? m.kind === 'neutral'
          ? m.label
          : `${m.label} (${m.kind})`
        : m.kind === 'neutral'
          ? ''
          : m.kind
    )
    .filter(Boolean);
  const count = `${list.length} ${list.length === 1 ? 'event' : 'events'}`;
  return items.length ? `${count}: ${items.join(', ')}` : count;
}
