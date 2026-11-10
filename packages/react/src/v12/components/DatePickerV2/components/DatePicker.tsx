/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  SNAP_FRAME,
  motionTokens,
  snapAnimations,
  snapProfileFor,
  useSnapSurface,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { placeOnAnchor, themeOf } from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import { useLatest } from '@carbon-labs/react-selection-kit';
import {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from '@carbon-labs/react-popover';
import { Calendar } from './Calendar';
import {
  DatePickerHostContext,
  DatePickerSlotContext,
  type DatePickerInputHost,
  type DatePickerInputProps,
} from './DatePickerInput';
import {
  compareDay,
  formatDate,
  isDayEnabled,
  isEmptyDateValue,
  monthKey,
  parseDate,
  resolveLocale,
  resolveMarks,
  sameDay,
  startOfDay,
  startOfMonth,
  toDate,
  toDates,
  type DateLimit,
  type DateLimits,
  type DateMark,
  type DateOption,
} from './dates';
import '@carbon-labs/react-menu/scss/menu.scss';
import './date-picker.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * DatePicker — Carbon v11's DatePicker (simple, single and range) without
 * flatpickr: the kit's field, and a calendar of its own on the floating
 * surface.
 * ============================================================================
 *
 * v11's props: `datePickerType` (`simple` · `single` · `range`), `value`
 * (a date, a timestamp, a string in the format, or an array of them),
 * `dateFormat` (flatpickr's tokens, default `m/d/Y`), `locale` (a code or
 * flatpickr's locale object), `minDate` / `maxDate`, `disable` / `enable`,
 * `allowInput` (default true), `closeOnSelect` (default true), `inline`,
 * `readOnly`, `invalid` / `warn` (passed to the inputs), `short`, `light`,
 * `appendTo`, `parseDate`, `onChange` / `onOpen` / `onClose`
 * (`(selectedDates, dateStr, instance)`), `nextMonthAriaLabel` /
 * `prevMonthAriaLabel`, `className`, and the rest on the wrapper. The ref's
 * `calendar` is a small instance: `selectedDates`, `isOpen`, `open()`,
 * `close()`, `clear()`, `setDate()`. The children are DatePickerInputs: the
 * first is the start, the second the end.
 *
 * Keyboard (v11's, from flatpickr and its Carbon wrapper):
 *   input     focus or a click opens the calendar; typing a date and Enter
 *             (or leaving) sets it; Enter closes; Escape closes; Tab moves
 *             into the calendar while it shows (in a range with only a
 *             start, on to the end input first); Shift+Tab from the start
 *             closes it
 *   calendar  ← → a day, ↑ ↓ a week (into the next month as needed),
 *             Ctrl+← → a month, Ctrl+↑ ↓ a year (↑ the next), Enter / Space
 *             pick, Escape closes and goes back to the input, Tab goes on to
 *             the last input (closing from it), Shift+Tab back to the input.
 *             Added: Page Up / Down a month, Shift+Page Up / Down a year,
 *             Home / End the week's first and last day. Disabled days are
 *             skipped
 *
 * The kit adds:
 *   surface   the Menu's floating surface (`snapProfileFor('popover')`): it
 *             snaps from the press (or the field's center from the keyboard)
 *             and folds back into it; the frame and hairline (the cast
 *             shadow with `shadow`; none by default);
 *             under the start input, flipping above when there's no room
 *   calendar  Calendar.tsx: the kit's marker (the hero blue), the rollover, a
 *             content swap between months, the month's name rolling
 *   range     click, then click; or press, drag and release (React Aria's
 *             model). A press on a
 *             day starts a range there, or with only a start picked, aims
 *             the end; a press on an end of a range and a drag moves that
 *             end; a press and release on it starts again. Escape mid-drag
 *             puts the dates back
 *   marks     `markedDates`: status pips under the days, read with them
 * ========================================================================== */

export type DatePickerType = 'simple' | 'single' | 'range';

/** The `calendar` on the ref, and the third argument of the hooks: what v11's flatpickr instance offers that a page uses. */
export interface DatePickerInstance {
  readonly selectedDates: Date[];
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  clear(): void;
  setDate(value: DateOption | DateOption[], triggerChange?: boolean): void;
  config: { dateFormat: string; mode: DatePickerType };
}

export type DatePickerHook = (
  selectedDates: Date[],
  dateStr: string,
  instance: DatePickerInstance
) => void;

export interface DatePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children'
> {
  /** Typing a date (default true). False: the calendar only; clear with `value`. */
  allowInput?: boolean;
  /** @deprecated v11: the element the calendar is placed in (default `<body>`). */
  appendTo?: HTMLElement;
  /** DatePickerInputs: the first is the start, the second (range) the end. */
  children: ReactNode;
  className?: string;
  /** Close once a date (or a range's end) is picked. Default true. */
  closeOnSelect?: boolean;
  /** flatpickr's format tokens. Default `m/d/Y`. */
  dateFormat?: string;
  /** `simple` (no calendar, the default), `single` or `range`. */
  datePickerType?: DatePickerType;
  /** Days that can't be picked: dates, `{ from, to }` ranges or functions. */
  disable?: DateLimit[];
  /** Only these days can be picked. */
  enable?: DateLimit[];
  /** The calendar always shows, in flow under the inputs. */
  inline?: boolean;
  /** Passed to the inputs (v11: Fluid only; here, every input). */
  invalid?: boolean;
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  /** A code (`en`, `fr` …) or flatpickr's locale object (`{ firstDayOfWeek, … }`). Default `en`. */
  locale?: string | Record<string, unknown>;
  maxDate?: DateOption;
  minDate?: DateOption;
  onChange?: DatePickerHook;
  onClose?: DatePickerHook;
  onOpen?: DatePickerHook;
  /** Reads the typed text instead of the format (v11, from flatpickr). */
  parseDate?: (date: string) => Date | false;
  readOnly?: boolean;
  /** The short simple field. */
  short?: boolean;
  value?: DateOption | DateOption[] | null;
  /** Passed to the inputs (v11: Fluid only; here, every input). */
  warn?: boolean;
  nextMonthAriaLabel?: string;
  prevMonthAriaLabel?: string;

  /* ── Beyond Carbon's API ────────────────────────────────────────────────────── */

  /** Dates with events: a status pip under each (up to three a day), the label read with the day. */
  markedDates?: DateMark[];
  /** The calendar's cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion for the calendar (a lab dial). Default 1. */
  timeScale?: number;
}

export interface DatePickerHandle {
  readonly calendar: DatePickerInstance;
}

const sortDays = (ds: Date[]) => [...ds].sort(compareDay);

export const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(
  function DatePicker(
    {
      allowInput = true,
      appendTo,
      children,
      className,
      closeOnSelect = true,
      dateFormat = 'm/d/Y',
      datePickerType,
      disable,
      enable,
      inline = false,
      invalid,
      light: _light,
      locale = 'en',
      maxDate,
      minDate,
      onChange,
      onClose,
      onOpen,
      parseDate: parseDateProp,
      readOnly: ownReadOnly = false,
      short = false,
      value,
      warn,
      nextMonthAriaLabel = 'Next month',
      prevMonthAriaLabel = 'Previous month',
      markedDates,
      shadow,
      timeScale = 1,
      ...rest
    },
    ref
  ) {
    // A FormSection's read-only or disabled keeps the calendar shut and the date as it is.
    const form = useFormFieldState(false, ownReadOnly);
    const readOnly = form.readOnly;
    const locked = form.readOnly || form.disabled;
    const type: DatePickerType = datePickerType ?? 'simple';
    const hasCalendar = type === 'single' || type === 'range';
    const range = type === 'range';
    const loc = useMemo(() => resolveLocale(locale), [locale]);
    const marks = useMemo(
      () => resolveMarks(markedDates, dateFormat, loc),
      [markedDates, dateFormat, loc]
    );
    const calendarId = `${useId()}-calendar`;
    const reduced = usePrefersReducedMotion();

    const parse = useCallback(
      (text: string): Date | null => {
        if (parseDateProp) {
          const d = parseDateProp(text);
          return d ? startOfDay(d) : null;
        }
        return parseDate(text, dateFormat, loc);
      },
      [parseDateProp, dateFormat, loc]
    );

    /* ── the limits ────────────────────────────────────────────────────── */

    const limits: DateLimits = {
      min: toDate(minDate ?? null, dateFormat, loc),
      max: toDate(maxDate ?? null, dateFormat, loc),
      list: enable ?? disable ?? null,
      mode: enable ? 'enable' : 'disable',
    };
    const isEnabled = (d: Date) => isDayEnabled(d, limits, dateFormat, loc);

    /* ── the dates ─────────────────────────────────────────────────────── */

    const fromValue = (v: typeof value) => {
      const ds = toDates(v ?? null, dateFormat, loc);
      return range ? sortDays(ds.slice(0, 2)) : ds.slice(0, 1);
    };
    const [dates, setDatesState] = useState<Date[]>(() => fromValue(value));
    /** The end the marker sits on: the one picked last. */
    const [markerIndex, setMarkerIndex] = useState(() =>
      Math.max(0, dates.length - 1)
    );
    const [drafts, setDrafts] = useState<(string | null)[]>([null, null]);
    // `value` sets the dates whenever it changes (v11 calls `setDate` / `clear`).
    const valueSig = JSON.stringify(
      (Array.isArray(value) ? value : [value]).map((v) =>
        v instanceof Date ? v.getTime() : (v ?? null)
      )
    );
    const firstSig = useRef(valueSig);
    useEffect(() => {
      if (firstSig.current === valueSig) return;
      firstSig.current = valueSig;
      const next = isEmptyDateValue(value) ? [] : fromValue(value);
      setDatesState(next);
      setMarkerIndex(Math.max(0, next.length - 1));
      setDrafts([null, null]);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new value only
    }, [valueSig]);

    /** The text of the dates, joined as flatpickr does. */
    const dateStr = (ds: Date[]) =>
      ds.map((d) => formatDate(d, dateFormat, loc)).join(range ? ' to ' : ', ');

    /* ── open, the month shown, the focused day ────────────────────────── */

    const [open, setOpen] = useState(false);
    const shownOpen = inline || open;
    const [view, setView] = useState<Date>(() =>
      startOfMonth(dates[0] ?? new Date())
    );
    const [focused, setFocused] = useState<Date>(
      () => dates[0] ?? startOfDay(new Date())
    );
    const [hover, setHover] = useState<Date | null>(null);
    const [focusToken, setFocusToken] = useState(0);
    const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

    const inputs = useRef<(HTMLInputElement | null)[]>([null, null]);
    const lastInput = useRef(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const onSurface = useCallback((el: HTMLDivElement | null) => {
      surfaceRef.current = el;
    }, []);
    /** A focus we moved back to an input: it doesn't reopen the calendar. */
    const quietFocus = useRef(false);
    const press = useRef<{ x: number; y: number } | null>(null);

    const instance = useRef<DatePickerInstance>(
      null as unknown as DatePickerInstance
    );
    const latest = useLatest({
      dates,
      open: shownOpen,
      onChange,
      onOpen,
      onClose,
      dateStr,
    });

    const emit = (hook: DatePickerHook | undefined, ds: Date[]) =>
      hook?.(ds, dateStr(ds), instance.current);

    const setDates = (next: Date[], marker: number, fire = true) => {
      const same =
        next.length === dates.length &&
        next.every((d, i) => sameDay(d, dates[i]));
      setDatesState(next);
      setMarkerIndex(marker);
      setDrafts([null, null]);
      if (fire && !same && !locked) emit(onChange, next);
    };

    const showFor = (slot: number, from: { x: number; y: number } | null) => {
      if (!hasCalendar || locked || open || inline) return;
      const d = dates[slot] ?? dates[0] ?? null;
      const at = d ?? clampToLimits(startOfDay(new Date()));
      setView(startOfMonth(at));
      setFocused(at);
      setHover(null);
      setOrigin(from);
      setOpen(true);
      emit(onOpen, dates);
    };
    const close = (refocus = false) => {
      if (!open) return;
      setOpen(false);
      setHover(null);
      emit(onClose, latest.current.dates);
      if (refocus) {
        const el = inputs.current[lastInput.current] ?? inputs.current[0];
        if (el && document.activeElement !== el) {
          quietFocus.current = true;
          el.focus();
        }
      }
    };

    function clampToLimits(d: Date) {
      if (limits.min && compareDay(d, limits.min) < 0) return limits.min;
      if (limits.max && compareDay(d, limits.max) > 0) return limits.max;
      return d;
    }

    const nextInstance: DatePickerInstance = {
      get selectedDates() {
        return latest.current.dates;
      },
      get isOpen() {
        return latest.current.open;
      },
      open: () => showFor(0, null),
      close: () => close(),
      clear: () => setDates([], 0),
      setDate: (v, trigger = false) => {
        const next = isEmptyDateValue(v) ? [] : fromValue(v);
        setDates(next, Math.max(0, next.length - 1), trigger);
        if (next[0]) setView(startOfMonth(next[0]));
      },
      config: { dateFormat, mode: type },
    };
    useLayoutEffect(() => {
      instance.current = nextInstance;
    });
    useImperativeHandle(ref, () => ({
      get calendar() {
        return instance.current;
      },
    }));

    /* ── picking ───────────────────────────────────────────────────────── */

    const pick = (d: Date, byKey: boolean) => {
      if (locked || !isEnabled(d)) return;
      let next: Date[];
      let marker = 0;
      let done = true;
      if (!range) next = [d];
      else if (dates.length !== 1) {
        next = [d];
        done = false;
      } else {
        next = sortDays([dates[0]!, d]);
        marker = sameDay(next[1], d) && !sameDay(next[0], d) ? 1 : 0;
      }
      setDates(next, marker);
      setFocused(d);
      // A range keeps its month: its other end is on it.
      if (!range && monthKey(d) !== monthKey(view)) setView(startOfMonth(d));
      if (done && closeOnSelect && !inline) close(byKey);
    };

    /* ── a range by the pointer: press, drag, release ──────────────────── */

    /**
     * The press under way. `anchor` the end that stays (none yet: the press
     * starts a range there); `last` the day the drag is over; `before` the
     * dates to put back on a cancel and to tell a change from.
     */
    const drag = useRef<{
      day: Date;
      mode: 'new' | 'aim' | 'grab';
      anchor: Date | null;
      last: Date | null;
      before: Date[];
      beforeMarker: number;
    } | null>(null);

    const finishRange = (
      next: Date[],
      marker: number,
      before: Date[],
      done: boolean
    ) => {
      setDatesState(next);
      setMarkerIndex(marker);
      setDrafts([null, null]);
      setHover(null);
      const same =
        next.length === before.length &&
        next.every((d, i) => sameDay(d, before[i]));
      if (!same && !locked) emit(onChange, next);
      if (done && closeOnSelect && !inline) close();
    };

    const pressDay = (d: Date) => {
      if (locked || !isEnabled(d)) return;
      const grabbed =
        dates.length === 2 ? dates.findIndex((x) => sameDay(x, d)) : -1;
      const mode = grabbed >= 0 ? 'grab' : dates.length === 1 ? 'aim' : 'new';
      drag.current = {
        day: d,
        mode,
        anchor:
          mode === 'grab'
            ? dates[1 - grabbed]!
            : mode === 'aim'
              ? dates[0]!
              : d,
        last: null,
        before: dates,
        beforeMarker: markerIndex,
      };
      setFocused(d);
      // A new range starts at the press (its marker arrives at once); aiming
      // previews the end under it.
      if (mode === 'new') {
        setDatesState([d]);
        setMarkerIndex(0);
      } else if (mode === 'aim') setHover(d);
    };

    const dragDay = (d: Date) => {
      const g = drag.current;
      if (!g) return;
      if (!g.last && g.mode === 'grab') {
        // The grabbed end comes off: the other end anchors, the band follows.
        setDatesState([g.anchor!]);
        setMarkerIndex(0);
      }
      g.last = d;
      setHover(d);
      setFocused(d);
    };

    const release = (cancel: boolean) => {
      const g = drag.current;
      drag.current = null;
      if (!g) return;
      if (cancel) {
        setDatesState(g.before);
        setMarkerIndex(g.beforeMarker);
        setHover(null);
        return;
      }
      const end = g.last ?? (g.mode === 'aim' ? g.day : null);
      if (!end) {
        // A press and release on one day: the start (a grabbed end starts again there).
        finishRange([g.day], 0, g.before, false);
        return;
      }
      const next = sortDays([g.anchor!, end]);
      finishRange(
        next,
        sameDay(next[1], end) && !sameDay(next[0], end) ? 1 : 0,
        g.before,
        true
      );
    };

    /* ── typing ────────────────────────────────────────────────────────── */

    const commit = (slot: number) => {
      // `simple`: a plain field (v11 has no calendar or parsing there).
      if (type === 'simple') return;
      const text = drafts[slot];
      if (text === null || text === undefined) return;
      if (!text.trim()) {
        const next = slot === 0 ? [] : dates.slice(0, 1);
        setDates(next, Math.max(0, next.length - 1));
        return;
      }
      const d = parse(text);
      if (!d || !isEnabled(d)) return;
      let next: Date[];
      if (!range) next = [d];
      else if (slot === 0) next = dates[1] ? sortDays([d, dates[1]]) : [d];
      else next = dates[0] ? sortDays([dates[0], d]) : [d];
      setDates(
        next,
        Math.max(
          0,
          next.findIndex((x) => sameDay(x, d))
        )
      );
      setFocused(d);
      setView(startOfMonth(d));
    };

    /** The inputs given (a range's start and end, or one). */
    const slots = Children.toArray(children).filter(isValidElement).slice(0, 2);

    const text = (slot: number) => {
      const draft = drafts[slot];
      if (draft !== null && draft !== undefined) return draft;
      if (type === 'simple' && typeof value === 'string') return value;
      // A range with a single input shows both ends in it (flatpickr's); with
      // two, each shows its own end (v11's rangePlugin). Counted from the
      // children, not the inputs' refs: those aren't set on the first render,
      // so a `value` showed "start to end" in the start field until a pick.
      if (range && slot === 0 && slots.length < 2 && dates.length)
        return dateStr(dates);
      const d = dates[slot];
      return d ? formatDate(d, dateFormat, loc) : '';
    };

    /** The day the keyboard lands on in the calendar: the picked one, today, or the first that can be. */
    const entryDay = () => {
      const d = dates[lastInput.current] ?? dates[0];
      if (d && monthKey(d) === monthKey(view)) return d;
      const today = startOfDay(new Date());
      if (monthKey(today) === monthKey(view) && isEnabled(today)) return today;
      return clampToLimits(view);
    };

    /*
     * The inputs' host: one object while what they show holds (the texts, open,
     * the ids), so a render that changes none of it doesn't re-render them. The
     * handlers call this render's (`handlers`, kept current).
     */
    const register = useCallback(
      (slot: number, el: HTMLInputElement | null) => {
        inputs.current[slot] = el;
      },
      []
    );
    const handlers: Pick<
      DatePickerInputHost,
      'onChange' | 'onFocus' | 'onBlur' | 'onClick' | 'onKeyDown'
    > = {
      onChange: (slot, e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setDrafts((ds) => {
          const n = [...ds];
          n[slot] = v;
          return n;
        });
      },
      onFocus: (slot, _e: FocusEvent<HTMLInputElement>) => {
        lastInput.current = slot;
        if (quietFocus.current) {
          quietFocus.current = false;
          return;
        }
        showFor(slot, press.current);
        press.current = null;
      },
      onBlur: (slot) => commit(slot),
      onClick: (slot, e: MouseEvent<HTMLInputElement>) => {
        lastInput.current = slot;
        if (!open)
          showFor(slot, e.detail === 0 ? null : { x: e.clientX, y: e.clientY });
      },
      onKeyDown: (slot, e: KeyboardEvent<HTMLInputElement>) => {
        lastInput.current = slot;
        if (e.key === 'Enter') {
          commit(slot);
          if (open) {
            e.preventDefault();
            close();
          }
          return;
        }
        if (e.key === 'Escape') {
          if (open && !isComposing(e)) {
            e.preventDefault();
            close();
          }
          return;
        }
        if (
          (e.key === 'Backspace' || e.key === 'Delete') &&
          !allowInput &&
          !locked
        ) {
          e.preventDefault();
          setDates([], 0);
          return;
        }
        if (e.key !== 'Tab' || !hasCalendar || locked) return;
        if (e.shiftKey) {
          if (slot === 0 && open) close();
          return;
        }
        // v11: in a range with only a start, Tab goes on to the end input first.
        if (
          range &&
          slot === 0 &&
          dates.length === 1 &&
          inputs.current[1] &&
          !inputs.current[1].disabled
        ) {
          e.preventDefault();
          commit(slot);
          inputs.current[1].focus();
          return;
        }
        if (!shownOpen) return;
        e.preventDefault();
        commit(slot);
        const d = entryDay();
        setFocused(d);
        setFocusToken((t) => t + 1);
      },
    };
    const live = useLatest(handlers);
    const text0 = text(0);
    const text1 = text(1);
    const host = useMemo<DatePickerInputHost>(
      () => ({
        // This render's texts: the memo holds while they do.
        text: (slot) => (slot === 0 ? text0 : slot === 1 ? text1 : ''),
        calendarId,
        open: shownOpen,
        allowInput,
        register,
        onChange: (slot, e) => live.current.onChange(slot, e),
        onFocus: (slot, e) => live.current.onFocus(slot, e),
        onBlur: (slot, e) => live.current.onBlur(slot, e),
        onClick: (slot, e) => live.current.onClick(slot, e),
        onKeyDown: (slot, e) => live.current.onKeyDown(slot, e),
      }),
      [text0, text1, calendarId, shownOpen, allowInput, register, live]
    );

    /* ── the calendar's own keys: Tab, Escape ──────────────────────────── */

    const onSurfaceKey = (e: KeyboardEvent<HTMLElement>): boolean => {
      if (e.key === 'Escape' && !isComposing(e)) {
        e.preventDefault();
        e.stopPropagation();
        if (inline) inputs.current[lastInput.current]?.focus();
        else close(true);
        return true;
      }
      if (e.key !== 'Tab') return false;
      const lastSlot = range && inputs.current[1] ? 1 : 0;
      const last = inputs.current[lastSlot];
      e.preventDefault();
      if (!e.shiftKey) {
        if (lastInput.current === lastSlot) {
          if (inline) {
            last?.focus();
            return true;
          }
          close(true);
        } else {
          quietFocus.current = true;
          lastInput.current = lastSlot;
          last?.focus();
        }
      } else {
        quietFocus.current = true;
        (inputs.current[lastInput.current] ?? inputs.current[0])?.focus();
      }
      return true;
    };

    /* ── closing from outside ──────────────────────────────────────────── */

    // Attached while open (not again on every render: every key re-added
    // them, audit OV-10); `close` is read through `closeRef`.
    const closeRef = useLatest(close);
    useEffect(() => {
      if (!open || inline) return;
      const inside = (t: EventTarget | null) =>
        t instanceof Node &&
        (!!wrapperRef.current?.contains(t) ||
          !!surfaceRef.current?.contains(t));
      const onDown = (e: PointerEvent) => {
        if (!inside(e.target)) closeRef.current();
      };
      const onFocusIn = (e: FocusEvent | Event) => {
        if (!inside(e.target)) closeRef.current();
      };
      document.addEventListener('pointerdown', onDown, true);
      document.addEventListener('focusin', onFocusIn, true);
      return () => {
        document.removeEventListener('pointerdown', onDown, true);
        document.removeEventListener('focusin', onFocusIn, true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- the refs are stable
    }, [open, inline]);

    /* ── render ────────────────────────────────────────────────────────── */

    const minMonth = limits.min ? monthKey(limits.min) : null;
    const maxMonth = limits.max ? monthKey(limits.max) : null;
    const preview = range && dates.length === 1 ? hover : null;

    const calendar = hasCalendar ? (
      <Calendar
        id={calendarId}
        view={view}
        focused={focused}
        mode={range ? 'range' : 'single'}
        dates={dates}
        markerIndex={markerIndex}
        preview={preview}
        isEnabled={isEnabled}
        locale={loc}
        minMonth={minMonth}
        maxMonth={maxMonth}
        prevMonthAriaLabel={prevMonthAriaLabel}
        nextMonthAriaLabel={nextMonthAriaLabel}
        onView={(m) => {
          let mo = startOfMonth(m);
          if (minMonth != null && monthKey(mo) < minMonth)
            mo = startOfMonth(limits.min!);
          if (maxMonth != null && monthKey(mo) > maxMonth)
            mo = startOfMonth(limits.max!);
          setView(mo);
        }}
        onFocusDay={(d) => {
          setFocused(d);
          if (range && dates.length === 1) setHover(d);
          if (monthKey(d) !== monthKey(view)) setView(startOfMonth(d));
        }}
        onPick={(d) =>
          pick(d, document.activeElement?.closest('.cds-calendar') != null)
        }
        // While a press drags, the drag says where the end is.
        onHoverDay={(d) => !drag.current && setHover(d)}
        marks={marks}
        onPressDay={range ? pressDay : undefined}
        onDragDay={dragDay}
        onRelease={release}
        onGridKey={onSurfaceKey}
        focusToken={focusToken}
        timeScale={timeScale}
        reduced={reduced}
      />
    ) : null;

    return (
      <div
        {...rest}
        ref={wrapperRef}
        className={['cds-date-picker-wrapper', className]
          .filter(Boolean)
          .join(' ')}>
        <div
          className={[
            'cds-date-picker',
            `cds-date-picker--${type}`,
            short && 'cds-date-picker--short',
          ]
            .filter(Boolean)
            .join(' ')}
          onPointerDown={(e) => {
            press.current = { x: e.clientX, y: e.clientY };
          }}>
          <DatePickerHostContext.Provider value={host}>
            {slots.map((child, i) => {
              const el = child as ReactElement<DatePickerInputProps>;
              const childInvalid = el.props.invalid;
              const mergedInvalid = invalid ?? childInvalid;
              const mergedWarn = mergedInvalid
                ? false
                : (warn ?? el.props.warn);
              return (
                <DatePickerSlotContext.Provider key={el.key ?? i} value={i}>
                  {cloneElement(el, {
                    datePickerType: type,
                    readOnly: readOnly || el.props.readOnly,
                    invalid: mergedInvalid,
                    warn: mergedWarn,
                  })}
                </DatePickerSlotContext.Provider>
              );
            })}
          </DatePickerHostContext.Provider>
        </div>
        {hasCalendar && inline ? (
          <div
            className="cds-date-picker__inline"
            onKeyDown={(e) => {
              if (!e.defaultPrevented) onSurfaceKey(e);
            }}>
            {calendar}
          </div>
        ) : hasCalendar ? (
          <CalendarSurface
            open={open}
            anchor={() =>
              wrapperRef.current?.querySelector<HTMLElement>(
                '.cds-text-input__field'
              ) ?? null
            }
            origin={origin}
            container={appendTo}
            shadow={shadow}
            timeScale={timeScale}
            reduced={reduced}
            onSurface={onSurface}
            id={calendarId}
            onKey={onSurfaceKey}>
            {calendar}
          </CalendarSurface>
        ) : null}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

/* ── the floating surface ─────────────────────────────────────────────── */

interface CalendarSurfaceProps {
  id: string;
  open: boolean;
  anchor: () => HTMLElement | null;
  origin: { x: number; y: number } | null;
  container?: HTMLElement;
  shadow?: SurfaceShadowOption;
  timeScale: number;
  reduced: boolean;
  /** The surface's node, for the picker's outside-press test. */
  onSurface: (el: HTMLDivElement | null) => void;
  onKey: (e: KeyboardEvent<HTMLElement>) => boolean;
  children: ReactNode;
}

/** Every motion-token duration × `k`: slow motion for the CSS inside the portal (the page's vars don't reach it). */
function slowVars(k: number): CSSProperties | undefined {
  if (k === 1) return undefined;
  const vars: Record<string, string> = {};
  for (const [name, ms] of Object.entries(motionTokens.duration))
    vars[`--cds-motion-duration-${name}`] = `${ms * k}ms`;
  return vars as CSSProperties;
}

/** Mounted while open and while it leaves; portalled with its field's theme. */
function CalendarSurface(p: CalendarSurfaceProps) {
  const { present, exited } = useFloatingMount(p.open);
  const theme = useKeptTheme(p.open ? themeOf(p.anchor()) : undefined);
  if (!present || typeof document === 'undefined') return null;
  return (
    <KitPortal
      target={p.container}
      anchor={p.anchor}
      hold={!p.open}
      className={['cds-menu-portal', theme, theme && 'cds--layer-one']
        .filter(Boolean)
        .join(' ')}>
      <SurfaceBody {...p} onExited={exited} />
    </KitPortal>
  );
}

function SurfaceBody(p: CalendarSurfaceProps & { onExited: () => void }) {
  const el = useRef<HTMLDivElement | null>(null);
  const latest = useLatest(p);
  const { onSurface } = p;
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      el.current = node;
      onSurface(node);
    },
    [onSurface]
  );
  const elevation = useSurfaceShadow(p.shadow);
  const surface = useSnapSurface(el, {
    profile: () => snapProfileFor('popover'),
    reduced: p.reduced,
    timeScale: p.timeScale,
    shadow: elevation,
  });

  /** Under (or over) the field, from its start edge, on whole device px. */
  const place = (node: HTMLElement) => {
    const a = latest.current.anchor();
    if (!a) return;
    const r = a.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const snap = (v: number) => Math.round(v * dpr) / dpr;
    node.style.left = '0px';
    node.style.top = '0px';
    const box = node.getBoundingClientRect();
    const at = placeOnAnchor(
      r,
      { w: box.width, h: box.height },
      'bottom-start'
    );
    node.style.left = `${snap(at.left)}px`;
    node.style.top = `${snap(at.top)}px`;
  };

  // Its lifecycle (`useFloatingPresence`): open, close, and while open it
  // follows the field through scrolls and resizes, once a frame.
  useFloatingPresence(surface, {
    open: p.open,
    enter: () => {
      if (el.current)
        surface.open({
          cause: latest.current.origin,
          trigger: latest.current.anchor(),
          place,
        });
    },
    leave: () => (el.current ? undefined : false),
    onExited: () => latest.current.onExited(),
    follow: {
      reflow: () => {
        const node = el.current;
        if (node && !snapAnimations(node).length) {
          place(node);
          surface.syncShadow();
        }
      },
    },
  });

  return (
    <div
      ref={attach}
      id={`${p.id}-dialog`}
      className="cds-menu cds-date-picker__calendar"
      role="dialog"
      aria-label="Calendar"
      style={slowVars(p.timeScale)}
      // The pointer never takes focus from the field (the year field excepted).
      onMouseDown={(e) => {
        if (!(e.target as Element).closest('input')) e.preventDefault();
      }}
      onKeyDown={(e) => {
        if (!e.defaultPrevented) p.onKey(e);
      }}>
      <span className="cds-menu__frame" {...SNAP_FRAME} />
      {p.children}
    </div>
  );
}
