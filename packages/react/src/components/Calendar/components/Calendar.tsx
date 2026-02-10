/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

import { DatePicker, DatePickerInput, IconButton } from '@carbon/react';
import { SidePanelClose } from '@carbon/icons-react';

import { CalendarHeader } from './CalendarHeader';
import { Timeline } from './CalendarTimeline';

import type {
  CalendarFormats,
  CalendarProps,
  CalendarView,
  DateInput,
  Device,
  ToolbarSize,
  MonthDay,
} from './Calendar.types';

type WeekdayHeader = { key: `day${number}`; header: string };

type MonthWeek = {
  id: string;
  [key: `day${number}`]: MonthDay;
};

const BASE_WEEKDAYS: WeekdayHeader[] = [
  { key: 'day0', header: 'Sunday' },
  { key: 'day1', header: 'Monday' },
  { key: 'day2', header: 'Tuesday' },
  { key: 'day3', header: 'Wednesday' },
  { key: 'day4', header: 'Thursday' },
  { key: 'day5', header: 'Friday' },
  { key: 'day6', header: 'Saturday' },
];

// classname utility
const cls = (...tokens: Array<string | boolean | null | undefined>) =>
  tokens.filter(Boolean).join(' ');

const defaultViews: CalendarView[] = [
  'month',
  'week',
  'day',
  'threeDays',
  'workWeek',
];

const toDate = (value: DateInput | undefined, fallback: Date): Date => {
  if (value == null) {
    return fallback;
  }
  const parsedDate = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? fallback : parsedDate;
};

const startOfDay = (date: Date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart;
};

const addDays = (date: Date, daysToAdd: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + daysToAdd);
  return newDate;
};

const addMonths = (date: Date, monthsToAdd: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + monthsToAdd);
  return newDate;
};

const getDateTime = (date: Date) => startOfDay(date).getTime();

const sameDay = (dateA: Date, dateB: Date) =>
  getDateTime(dateA) === getDateTime(dateB);

const formatIntl = (
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
) => new Intl.DateTimeFormat(locale, options).format(date);

const getWeekStart = (date: Date, weekStartsOn: number) => {
  const normalizedDate = startOfDay(date);
  const dayOfWeek = normalizedDate.getDay();
  const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
  return addDays(normalizedDate, -daysToSubtract);
};

const getDayColumnIndex = (date: Date, weekStartsOn: number) => {
  const day = date.getDay();
  return (day - weekStartsOn + 7) % 7;
};

const getDates = (start: Date, count: number) =>
  Array.from({ length: count }, (_, i) => addDays(start, i));

const getLocaleWeekStartsOn = (locale: string) => {
  if (locale.startsWith('en-US') || locale.startsWith('en-CA')) {
    return 0;
  }
  return 1;
};

const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const hours: string[] = (() => {
  const hrs = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}:00` : `${i}:00`
  );
  hrs.unshift('-1');
  hrs.push('24');
  return hrs;
})();

const defaultFormats: Required<CalendarFormats> = {
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  timeFormat: { hour: 'numeric', minute: '2-digit' },
  weekdayFormat: { weekday: 'short' },
  monthHeaderFormat: { month: 'long', year: 'numeric' },
  weekHeaderFormat: { month: 'short', day: '2-digit' },
  dayHeaderFormat: {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
};

const chunk = <Day,>(arr: Day[], num: number): Day[][] => {
  const result: Day[][] = [];
  for (let i = 0; i < arr.length; i += num) {
    result.push(arr.slice(i, i + num));
  }
  return result;
};

const hourStringToHourNumber = (hour: string) => {
  if (hour === '-1') {
    return -1;
  }
  if (hour === '24') {
    return 24;
  }
  return Number.parseInt(hour.slice(0, 2), 10);
};

const observeSize = (el: HTMLElement, onChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  onChange();

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(onChange);
    observer.observe(el);
    window.addEventListener('resize', onChange);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onChange);
    };
  }

  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

export function Calendar({
  initialDate,
  getCurrentDate,
  onNavigate,
  defaultView = 'month',
  onViewChange,
  views = defaultViews,
  toolbar = true,
  rtl = false,
  scrollToCurrentTime = true,
  region,
  formats,
  renderCell,
  className,
  stickyHeader = true,
  weekStartsOn,
}: CalendarProps) {
  const prefix = usePrefix();
  const blockClass = `${prefix}--calendar`;

  const locale =
    region ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const format: Required<CalendarFormats> = {
    ...defaultFormats,
    ...(formats ?? {}),
  };

  const now = useMemo(() => getCurrentDate?.() ?? new Date(), [getCurrentDate]);
  const today = startOfDay(now);

  const [view, setView] = useState<CalendarView>(() =>
    views.includes(defaultView) ? defaultView : views[0] ?? 'month'
  );

  const [currentDay, setCurrentDay] = useState<Date>(() =>
    startOfDay(toDate(initialDate, new Date()))
  );
  const [toggleDatePicker, setToggleDatePicker] = useState(false);
  const [daySelected, setDaySelected] = useState(false);

  const [tableFocused, setTableFocused] = useState(false);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const [device, setDevice] = useState<Device>('lg');
  const [toolbarSize, setToolbarSize] = useState<ToolbarSize>('lg');
  const [smallDeviceSize, setSmallDeviceSize] = useState(false);

  const [currentTimePercent, setCurrentTimePercent] = useState(0);
  const [shouldShowTimelineLabel, setShouldShowTimelineLabel] = useState(false);

  const handleTimelinePositionChange = useCallback(
    (percentage: number, shouldShowLabel: boolean) => {
      setCurrentTimePercent(percentage);
      setShouldShowTimelineLabel(shouldShowLabel);
    },
    []
  );

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const calendarTableRef = useRef<HTMLElement | null>(null);
  const calendarHeaderRightRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const datePickerRef = useRef<any>(null);

  const focusedHeadRef = useRef<Record<number, HTMLTableCellElement | null>>(
    {}
  );
  const focusedCellRef = useRef<Record<number, HTMLTableCellElement | null>>(
    {}
  );

  useEffect(() => {
    if (initialDate == null) {
      return;
    }
    const next = startOfDay(toDate(initialDate, currentDay));
    if (next.getTime() !== currentDay.getTime()) {
      setCurrentDay(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate]);

  const effectiveWeekStartsOn = useMemo(() => {
    if (weekStartsOn !== undefined) {
      return weekStartsOn;
    }
    return getLocaleWeekStartsOn(locale);
  }, [weekStartsOn, locale]);

  const weekdays = useMemo(() => {
    const start = effectiveWeekStartsOn;
    return [...BASE_WEEKDAYS.slice(start), ...BASE_WEEKDAYS.slice(0, start)];
  }, [effectiveWeekStartsOn]);

  useEffect(() => {
    const el = calendarTableRef.current;
    if (!el) {
      return;
    }
    return observeSize(el, () => {
      const w = el.offsetWidth;
      if (w <= 320) {
        setDevice('xsm');
      } else if (w <= 576) {
        setDevice('sm');
      } else if (w <= 768) {
        setDevice('md');
      } else if (w <= 1056) {
        setDevice('lg');
      } else {
        setDevice('xlg');
      }
    });
  }, []);

  useEffect(() => {
    if (!datePickerRef?.current?.calendar) {
      return;
    }

    setTimeout(() => {
      const calendarContainer =
        datePickerRef?.current?.calendar?.calendarContainer;

      if (calendarContainer) {
        calendarContainer.setAttribute('tabindex', '-1');

        datePickerRef?.current.calendar.set('onReady', () => {
          calendarContainer.setAttribute('tabindex', '-1');

          const focusableElements = calendarContainer.querySelectorAll(
            'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
          );
          focusableElements.forEach((el: Element) => {
            el.setAttribute('tabindex', '-1');
          });
        });

        const focusableElements = calendarContainer.querySelectorAll(
          'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        focusableElements.forEach((el: Element) => {
          el.setAttribute('tabindex', '-1');
        });
      }
    }, 0);
  }, [datePickerRef, view]);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) {
      return;
    }
    return observeSize(el, () => {
      const w = el.offsetWidth;
      if (w <= 350) {
        setSmallDeviceSize(true);
        setToggleDatePicker((prev) => !prev);
      } else if (w <= 480) {
        setToolbarSize('xsm');
        setSmallDeviceSize(true);
        setToggleDatePicker(false);
      } else if (w <= 672) {
        setToolbarSize('sm');
        setSmallDeviceSize(true);
      } else if (w <= 1056) {
        setToolbarSize('md');
        setSmallDeviceSize(false);
      } else if (w <= 1312) {
        setToolbarSize('lg');
        setSmallDeviceSize(false);
      } else {
        setToolbarSize('xlg');
        setSmallDeviceSize(false);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const modalOpen = smallDeviceSize && toggleDatePicker;
    if (!modalOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [smallDeviceSize, toggleDatePicker]);

  const updateDate = useCallback(
    (next: Date) => {
      const nextDay = startOfDay(next);
      setCurrentDay(nextDay);
      onNavigate?.(nextDay);
    },
    [onNavigate]
  );

  const updateView = useCallback(
    (next: CalendarView) => {
      if (!views.includes(next)) {
        return;
      }
      setView(next);
      onViewChange?.(next);
    },
    [onViewChange, views]
  );

  const handlePrevious = useCallback(() => {
    switch (view) {
      case 'day':
        updateDate(addDays(currentDay, -1));
        break;
      case 'month':
        updateDate(addMonths(currentDay, -1));
        break;
      case 'week':
      case 'workWeek':
        updateDate(addDays(currentDay, -7));
        break;
      case 'threeDays':
        updateDate(addDays(currentDay, -3));
        break;
      default:
        break;
    }
  }, [currentDay, updateDate, view]);

  const handleNext = useCallback(() => {
    switch (view) {
      case 'day':
        updateDate(addDays(currentDay, 1));
        break;
      case 'month':
        updateDate(addMonths(currentDay, 1));
        break;
      case 'week':
      case 'workWeek':
        updateDate(addDays(currentDay, 7));
        break;
      case 'threeDays':
        updateDate(addDays(currentDay, 3));
        break;
      default:
        break;
    }
  }, [currentDay, updateDate, view]);

  const handleToday = useCallback(() => updateDate(new Date()), [updateDate]);

  const handleDatePickerPanel = useCallback(() => {
    setToggleDatePicker((prev) => !prev);
  }, []);

  const handleCalendarScroll = useCallback(
    (
      e: React.UIEvent<HTMLDivElement>,
      targetRef?: React.RefObject<HTMLElement>
    ) => {
      if (targetRef?.current) {
        targetRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
      }
    },
    []
  );

  const formatDate = useCallback(() => {
    return new Date(currentDay).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentDay]);

  const weekDates = useMemo(() => {
    const start = getWeekStart(currentDay, effectiveWeekStartsOn);
    return getDates(start, 7);
  }, [currentDay, effectiveWeekStartsOn]);

  const threeDayDates = useMemo(() => {
    const currentDayIndex = weekDates.findIndex(
      (d) => d.toDateString() === currentDay.toDateString()
    );
    const start = getWeekStart(currentDay, effectiveWeekStartsOn);
    const fullWeek = getDates(start, 7);
    const sliceStart = Math.max(0, currentDayIndex);
    return fullWeek.slice(sliceStart, sliceStart + 3);
  }, [currentDay, weekDates, effectiveWeekStartsOn]);

  const workWeekDates = useMemo(() => {
    const start = getWeekStart(currentDay, 1);
    return getDates(start, 5);
  }, [currentDay]);

  const viewDateRange = useCallback(
    (v: CalendarView) => {
      if (v === 'month') {
        return formatIntl(currentDay, locale, format.monthHeaderFormat);
      }
      if (v === 'day') {
        return formatIntl(currentDay, locale, format.dayHeaderFormat);
      }

      const start = getWeekStart(
        currentDay,
        v === 'workWeek' ? 1 : effectiveWeekStartsOn
      );
      const daysCount = v === 'threeDays' ? 3 : v === 'workWeek' ? 5 : 7;
      const end = addDays(start, daysCount - 1);

      const startPart = formatIntl(start, locale, format.weekHeaderFormat);
      const endPart = formatIntl(end, locale, format.weekHeaderFormat);
      return `${startPart} - ${endPart} ${end.getFullYear()}`;
    },
    [
      currentDay,
      format.dayHeaderFormat,
      format.monthHeaderFormat,
      format.weekHeaderFormat,
      locale,
      effectiveWeekStartsOn,
    ]
  );

  const visibleDatesForView: Date[] = useMemo(() => {
    switch (view) {
      case 'week':
        return weekDates;
      case 'threeDays':
        return threeDayDates;
      case 'workWeek':
        return workWeekDates;
      case 'day':
        return [currentDay];
      default:
        return [];
    }
  }, [view, weekDates, threeDayDates, workWeekDates, currentDay]);

  const monthDays: MonthWeek[] = useMemo(() => {
    const year = currentDay.getFullYear();
    const month = currentDay.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const gridStart = getWeekStart(firstOfMonth, effectiveWeekStartsOn);

    const lastWeekStart = getWeekStart(lastOfMonth, effectiveWeekStartsOn);
    const lastWeekEnd = addDays(lastWeekStart, 6);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysNeeded =
      Math.round((lastWeekEnd.getTime() - gridStart.getTime()) / msPerDay) + 1;

    const totalDays = Math.max(daysNeeded, 35);

    const days = getDates(gridStart, totalDays).map((d) => {
      const date = new Date(d);
      return {
        date,
        month: date.getMonth(),
        number: date.getDate(),
        year: date.getFullYear(),
        currentMonth: date.getMonth() === currentDay.getMonth(),
        selected: date.toDateString() === currentDay.toDateString(),
      } satisfies MonthDay;
    });

    return chunk(days, 7).map((week, wi) => {
      const row: MonthWeek = {
        id: `week-${wi}-${week[0].date.toISOString()}`,
      } as MonthWeek;
      week.forEach((day, di) => {
        row[`day${di}`] = day;
      });
      return row;
    });
  }, [currentDay, effectiveWeekStartsOn]);

  const getWeekView = useCallback(
    (date: Date) => {
      const start = getWeekStart(date, effectiveWeekStartsOn);
      return getDates(start, 7);
    },
    [effectiveWeekStartsOn]
  );

  const getWorkWeekView = useCallback((date: Date) => {
    const start = getWeekStart(date, 1);
    return getDates(start, 5);
  }, []);

  const getThreeDaysView = useCallback(
    (date: Date) => {
      const weekStart = getWeekStart(date, effectiveWeekStartsOn);
      const fullWeek = getDates(weekStart, 7);
      const idx = fullWeek.findIndex(
        (d) => d.toDateString() === date.toDateString()
      );
      const safeIdx = Math.max(0, idx);
      return fullWeek.slice(safeIdx, safeIdx + 3);
    },
    [effectiveWeekStartsOn]
  );

  const highlightView = useCallback((instance: any, days: Date[]) => {
    if (!instance || !days || days.length === 0) {
      return;
    }
    const dayElements =
      instance.calendarContainer.querySelectorAll('.flatpickr-day');
    dayElements.forEach((dayElement: any) => {
      dayElement.classList.remove('highlight-day');
      const dateObj = dayElement.dateObj;
      if (days.some((d) => sameDay(d, dateObj))) {
        dayElement.classList.add('highlight-day');
      }
    });
  }, []);

  // Flatpickr instance changes

  const handleCreateDaySelection = useCallback(
    (dObj: Date, dStr: string, fp: any, dayElements: any) => {
      if (!dayElements || !dayElements.classList) {
        return;
      }
      const date = dayElements.dateObj
        ? new Date(dayElements.dateObj)
        : dObj instanceof Date
        ? dObj
        : new Date(dObj);
      if (isNaN(date.getTime())) {
        return;
      }

      const weekNumber = getWeekNumber(date);

      const classList = Array.from(dayElements.classList) as string[];
      classList.forEach((className) => {
        if (className.startsWith('week-')) {
          dayElements.classList.remove(className);
        }
      });

      if (view === 'week' || view === 'workWeek') {
        dayElements.classList.add(`week-${weekNumber}`);
      }

      if (view === 'week') {
        const handleMouseOver = () => {
          const weekDays = fp.daysContainer.querySelectorAll(
            `.week-${weekNumber}`
          );
          weekDays.forEach((day: any) => {
            day.classList.add('days-hovered');
          });
        };
        const handleMouseOut = () => {
          fp.daysContainer
            .querySelectorAll(`.week-${weekNumber}`)
            .forEach((day: any) => {
              day.classList.remove('days-hovered');
            });
        };

        if (dayElements._weekMouseOver) {
          dayElements.removeEventListener(
            'mouseover',
            dayElements._weekMouseOver
          );
        }
        if (dayElements._weekMouseOut) {
          dayElements.removeEventListener(
            'mouseout',
            dayElements._weekMouseOut
          );
        }

        dayElements._weekMouseOver = handleMouseOver;
        dayElements._weekMouseOut = handleMouseOut;
        dayElements.addEventListener('mouseover', handleMouseOver);
        dayElements.addEventListener('mouseout', handleMouseOut);
      }

      if (view === 'threeDays') {
        const handleMouseOver = () => {
          const allDays = Array.from(
            fp.daysContainer.querySelectorAll('.flatpickr-day')
          );
          const index = allDays.indexOf(dayElements);
          if (index !== -1) {
            for (let i = 0; i < 3; i++) {
              const target = allDays[index + i] as HTMLElement;
              if (target) {
                (allDays[index] as HTMLElement).classList.add('three-day');
                target.classList.add('three-day');
                target.classList.add('days-hovered');
              }
            }
          }
        };
        const handleMouseOut = () => {
          const allDays = Array.from(
            fp.daysContainer.querySelectorAll('.flatpickr-day')
          );
          const index = allDays.indexOf(dayElements);
          if (index !== -1) {
            for (let i = 0; i < 3; i++) {
              const target = allDays[index + i] as HTMLElement;
              if (target) {
                target.classList.remove('days-hovered');
              }
            }
          }
        };

        if (dayElements._threeDaysMouseOver) {
          dayElements.removeEventListener(
            'mouseover',
            dayElements._threeDaysMouseOver
          );
        }
        if (dayElements._threeDaysMouseOut) {
          dayElements.removeEventListener(
            'mouseout',
            dayElements._threeDaysMouseOut
          );
        }

        dayElements._threeDaysMouseOver = handleMouseOver;
        dayElements._threeDaysMouseOut = handleMouseOut;
        dayElements.addEventListener('mouseover', handleMouseOver);
        dayElements.addEventListener('mouseout', handleMouseOut);
      }

      if (view === 'workWeek') {
        dayElements.classList.add('week-day');
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dayElements.classList.add('weekend-day');
        }
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          dayElements.classList.add('work-week');
        }

        const handleMouseOver = () => {
          fp.daysContainer
            .querySelectorAll(`.week-${weekNumber}`)
            .forEach((day: any) => {
              const dayObj = day.dateObj;
              const currentDayOfWeek = new Date(dayObj).getDay();
              if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
                day.classList.add('weekend-day');
              }
              if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
                dayElements.classList.add('work-week');
              }
              if (
                currentDayOfWeek >= 1 &&
                currentDayOfWeek <= 5 &&
                !day.classList.contains('selected') &&
                !day.classList.contains('highlight-day')
              ) {
                day.classList.add('days-hovered');
              }
            });
        };
        const handleMouseOut = () => {
          fp.daysContainer
            .querySelectorAll(`.week-${weekNumber}`)
            .forEach((day: any) => {
              if (
                !day.classList.contains('selected') &&
                !day.classList.contains('highlight-day')
              ) {
                day.classList.remove('days-hovered');
              }
            });
        };

        if (dayElements._workWeekMouseOver) {
          dayElements.removeEventListener(
            'mouseover',
            dayElements._workWeekMouseOver
          );
        }
        if (dayElements._workWeekMouseOut) {
          dayElements.removeEventListener(
            'mouseout',
            dayElements._workWeekMouseOut
          );
        }

        dayElements._workWeekMouseOver = handleMouseOver;
        dayElements._workWeekMouseOut = handleMouseOut;
        dayElements.addEventListener('mouseover', handleMouseOver);
        dayElements.addEventListener('mouseout', handleMouseOut);
      }
    },
    [view]
  );

  useEffect(() => {
    if (!datePickerRef.current) {
      return;
    }

    const fp =
      datePickerRef.current.calendar || datePickerRef.current.flatpickr;

    if (!fp) {
      return;
    }

    if (
      !fp.config.onDayCreate.some((fn: any) => fn === handleCreateDaySelection)
    ) {
      fp.config.onDayCreate.push(handleCreateDaySelection);
    }

    fp.redraw();

    if (view === 'week') {
      highlightView(fp, getWeekView(currentDay));
    } else if (view === 'threeDays') {
      highlightView(fp, getThreeDaysView(currentDay));
    } else if (view === 'workWeek') {
      highlightView(fp, getWorkWeekView(currentDay));
    }

    if (fp.calendarContainer) {
      fp.calendarContainer.setAttribute('tabindex', '0');
    }
  }, [
    datePickerRef,
    view,
    handleCreateDaySelection,
    highlightView,
    currentDay,
    getWeekView,
    getThreeDaysView,
    getWorkWeekView,
  ]);

  const handleDateChange = useCallback(
    (selectedDates: Array<Date | string>, _: any, instance: any) => {
      if (selectedDates.length > 0) {
        const selected = selectedDates[0];
        const next = selected instanceof Date ? selected : new Date(selected);
        updateDate(next);

        if (view === 'month') {
          setDaySelected(true);
        } else if (view === 'week') {
          highlightView(instance, getWeekView(next));
        } else if (view === 'threeDays') {
          highlightView(instance, getThreeDaysView(next));
        } else if (view === 'workWeek') {
          highlightView(instance, getWorkWeekView(next));
        }
      }
      if (toolbarSize === 'xsm') {
        handleDatePickerPanel();
      }
    },
    [
      handleDatePickerPanel,
      toolbarSize,
      updateDate,
      view,
      getWeekView,
      getThreeDaysView,
      getWorkWeekView,
      highlightView,
    ]
  );

  useEffect(() => {
    if (!datePickerRef?.current?.calendar) {
      return;
    }

    const timeout = setTimeout(() => {
      const fp = datePickerRef.current.calendar;
      fp.set('onDayCreate', handleCreateDaySelection);

      fp.set('onReady', () => {
        fp.calendarContainer.setAttribute('tabindex', '0');
      });

      if (view === 'week') {
        highlightView(fp, getWeekView(currentDay));
      } else if (view === 'threeDays') {
        highlightView(fp, getThreeDaysView(currentDay));
      } else if (view === 'workWeek') {
        highlightView(fp, getWorkWeekView(currentDay));
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    datePickerRef,
    view,
    handleCreateDaySelection,
    highlightView,
    currentDay,
    getWeekView,
    getThreeDaysView,
    getWorkWeekView,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!focusedDate) {
        return;
      }

      const newDate = new Date(focusedDate);
      let shouldUpdate = false;

      if (view === 'month') {
        const firstRowDates = monthDays[0]
          ? Object.values(monthDays[0])
              .filter(
                (v): v is MonthDay =>
                  typeof v === 'object' && v !== null && 'date' in v
              )
              .map((v) => getDateTime(v.date))
          : [];

        const lastRowDates = monthDays[monthDays.length - 1]
          ? Object.values(monthDays[monthDays.length - 1])
              .filter(
                (v): v is MonthDay =>
                  typeof v === 'object' && v !== null && 'date' in v
              )
              .map((v) => getDateTime(v.date))
          : [];

        const firstColumnDates = monthDays.map((w) => getDateTime(w.day0.date));
        const lastColumnDates = monthDays.map((w) => getDateTime(w.day6.date));

        const currentWeekIndexFromCol = (col: 0 | 6) =>
          monthDays.findIndex(
            (w) =>
              getDateTime((col === 0 ? w.day0 : w.day6).date) ===
              getDateTime(newDate)
          );

        const previousWeek = (() => {
          const idx = currentWeekIndexFromCol(0);
          return idx > 0 ? monthDays[idx - 1] : null;
        })();

        const nextWeek = (() => {
          const idx = currentWeekIndexFromCol(6);
          return idx >= 0 && idx < monthDays.length - 1
            ? monthDays[idx + 1]
            : null;
        })();

        switch (event.key) {
          case 'ArrowUp':
            if (firstRowDates.includes(getDateTime(newDate))) {
              event.preventDefault();
              const colIndex = getDayColumnIndex(
                newDate,
                effectiveWeekStartsOn
              );
              setFocusedDay(colIndex);
              setFocusedDate(null);
              setTimeout(() => focusedHeadRef.current[colIndex]?.focus(), 0);
              return;
            }
            event.preventDefault();
            newDate.setDate(newDate.getDate() - 7);
            shouldUpdate = true;
            break;

          case 'ArrowDown':
            if (lastRowDates.includes(getDateTime(newDate))) {
              event.preventDefault();
              const colIndex = getDayColumnIndex(
                newDate,
                effectiveWeekStartsOn
              );
              setFocusedDay(colIndex);
              setFocusedDate(null);
              return;
            }
            event.preventDefault();
            newDate.setDate(newDate.getDate() + 7);
            shouldUpdate = true;
            break;

          case 'ArrowLeft':
            if (firstColumnDates.includes(getDateTime(newDate))) {
              if (previousWeek) {
                event.preventDefault();
                newDate.setTime(previousWeek.day6.date.getTime());
                shouldUpdate = true;
              }
            } else {
              event.preventDefault();
              newDate.setDate(newDate.getDate() - 1);
              shouldUpdate = true;
            }
            break;

          case 'ArrowRight':
            if (lastColumnDates.includes(getDateTime(newDate))) {
              if (nextWeek) {
                event.preventDefault();
                newDate.setTime(nextWeek.day0.date.getTime());
                shouldUpdate = true;
              }
            } else {
              event.preventDefault();
              newDate.setDate(newDate.getDate() + 1);
              shouldUpdate = true;
            }
            break;

          case 'Tab':
            if (event.shiftKey && toggleDatePicker) {
              event.preventDefault();
              setTableFocused(false);
              setFocusedDate(null);

              setTimeout(() => {
                if (calendarTableRef?.current) {
                  calendarTableRef.current.tabIndex = -1;
                  setTableFocused(false);
                }
                calendarTableRef?.current?.focus();
              }, 0);
            }
            return;

          default:
            return;
        }

        if (shouldUpdate) {
          setFocusedDate(new Date(newDate));
        }
        return;
      }

      const currentHour = newDate.getHours();

      let visibleDates: Date[] = [];
      switch (view) {
        case 'week':
          visibleDates = weekDates;
          break;
        case 'threeDays':
          visibleDates = threeDayDates;
          break;
        case 'workWeek':
          visibleDates = workWeekDates;
          break;
        case 'day':
          visibleDates = [currentDay];
          break;
        default:
          visibleDates = visibleDatesForView;
      }

      const currentDateIndex = visibleDates.findIndex((d) =>
        sameDay(d, newDate)
      );
      const isFirstColumn = currentDateIndex === 0;
      const isLastColumn = currentDateIndex === visibleDates.length - 1;

      switch (event.key) {
        case 'ArrowUp':
          if (currentHour > 0) {
            event.preventDefault();
            newDate.setHours(currentHour - 1);
            shouldUpdate = true;
          }
          break;

        case 'ArrowDown':
          if (currentHour < 23) {
            event.preventDefault();
            newDate.setHours(currentHour + 1);
            shouldUpdate = true;
          }
          break;

        case 'ArrowLeft':
          if (!isFirstColumn) {
            event.preventDefault();
            newDate.setDate(newDate.getDate() - 1);
            shouldUpdate = true;
          }
          break;

        case 'ArrowRight':
          if (!isLastColumn) {
            event.preventDefault();
            newDate.setDate(newDate.getDate() + 1);
            shouldUpdate = true;
          }
          break;

        case 'Home':
          event.preventDefault();
          newDate.setHours(0);
          shouldUpdate = true;
          break;

        case 'End':
          event.preventDefault();
          newDate.setHours(23);
          shouldUpdate = true;
          break;

        case 'PageUp':
          event.preventDefault();
          newDate.setHours(Math.max(0, currentHour - 6));
          shouldUpdate = true;
          break;

        case 'PageDown':
          event.preventDefault();
          newDate.setHours(Math.min(23, currentHour + 6));
          shouldUpdate = true;
          break;

        case 'Tab':
          if (event.shiftKey && toggleDatePicker) {
            event.preventDefault();
            setTableFocused(false);
            setFocusedDate(null);

            setTimeout(() => {
              if (calendarTableRef?.current) {
                calendarTableRef.current.tabIndex = -1;
                setTableFocused(false);
              }
              calendarTableRef?.current?.focus();
            }, 0);
          } else if (event.shiftKey) {
            calendarTableRef.current?.focus();
          }
          return;

        default:
          return;
      }

      if (shouldUpdate) {
        setFocusedDate(new Date(newDate));
      }
    },
    [
      focusedDate,
      monthDays,
      view,
      effectiveWeekStartsOn,
      weekDates,
      threeDayDates,
      workWeekDates,
      visibleDatesForView,
      toggleDatePicker,
      currentDay,
    ]
  );

  useEffect(() => {
    if (!tableFocused) {
      return;
    }
    if (focusedDate != null) {
      return;
    }

    if (view === 'month') {
      const initial = monthDays.find((w) => w.day0)?.day0?.date;
      if (initial) {
        setFocusedDate(new Date(initial));
      }
    } else {
      const firstDate = visibleDatesForView[0];
      if (firstDate) {
        const initialDate = new Date(firstDate);
        const currentHour = now.getHours();
        const targetHour =
          currentHour >= 0 && currentHour <= 23 ? currentHour : 8;
        initialDate.setHours(targetHour, 0, 0, 0);
        setFocusedDate(initialDate);
      }
    }
  }, [tableFocused, focusedDate, view, visibleDatesForView, now, monthDays]);

  useEffect(() => {
    if (focusedDay == null) {
      return;
    }
    const el = focusedHeadRef.current[focusedDay];
    if (el) {
      setTimeout(() => el.focus(), 0);
    }
  }, [focusedDay]);

  useEffect(() => {
    if (!focusedDate) {
      return;
    }

    const attemptFocus = () => {
      const el =
        focusedCellRef.current[focusedDate.getTime()] ??
        focusedCellRef.current[getDateTime(focusedDate)];
      if (el) {
        el.focus();
        if (view !== 'month') {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        return true;
      }
      return false;
    };

    setTimeout(() => {
      if (!attemptFocus()) {
        setTimeout(() => {
          attemptFocus();
        }, 50);
      }
    }, 0);
  }, [focusedDate, view]);

  useEffect(() => {
    if (!scrollToCurrentTime) {
      return;
    }
    if (view === 'month') {
      return;
    }
    const scroller = calendarTableRef.current;
    if (!scroller) {
      return;
    }

    const approxRowHeight = 48;
    const top = Math.max(
      0,
      now.getHours() * approxRowHeight - scroller.clientHeight / 2
    );
    scroller.scrollTop = top;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSlot = (
    args: Parameters<NonNullable<CalendarProps['renderCell']>>[0]
  ) => (renderCell ? renderCell(args) : null);

  const overlayOpen = smallDeviceSize && toggleDatePicker;

  return (
    <div
      className={cls(blockClass, rtl && `${blockClass}--rtl`, className)}
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label="Calendar"
      role="region"
      ref={calendarRef}>
      {toolbar && (
        <CalendarHeader
          ref={toolbarRef}
          blockClass={blockClass}
          view={view}
          calendarViews={views}
          formatDate={formatDate}
          viewDateRange={viewDateRange}
          onToday={handleToday}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onViewChange={updateView}
          toggleDatePicker={toggleDatePicker}
          onToggleDatePickerPanel={handleDatePickerPanel}
          toolbarSize={toolbarSize}
          smallDeviceSize={smallDeviceSize}
          calendarTableRef={calendarTableRef}
          calendarHeaderRightRef={calendarHeaderRightRef}
          onCalendarScroll={handleCalendarScroll}
        />
      )}

      <div className={`${blockClass}__body`}>
        <div
          className={cls(
            `${blockClass}__date-picker-overlay`,
            overlayOpen && `${blockClass}__date-picker-overlay-show`
          )}
          role="button"
          tabIndex={0}
          onClick={handleDatePickerPanel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDatePickerPanel();
            }
          }}
        />
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          className={cls(
            `${blockClass}__date-picker-panel`,
            toggleDatePicker && `${blockClass}__date-picker-open`,
            view !== 'month' && `${blockClass}__date-picker-border`,
            overlayOpen && `${blockClass}__date-picker-slide`,
            overlayOpen && `${blockClass}__date-picker-panel-modal`
          )}
          role="group"
          aria-label="date picker"
          tabIndex={toggleDatePicker ? 0 : -1} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
          onFocus={(e) => {
            if (e.target === e.currentTarget) {
              const calendarContainer =
                datePickerRef?.current?.calendar?.calendarContainer;
              if (calendarContainer) {
                calendarContainer.focus();
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              e.stopPropagation();

              if (e.shiftKey) {
                // Backward tab
                const asideElement = e.currentTarget as HTMLElement;
                const allFocusable = Array.from(
                  document.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                  )
                );
                const asideIndex = allFocusable.indexOf(asideElement);

                if (asideIndex > 0) {
                  allFocusable[asideIndex - 1]?.focus();
                }
              } else {
                // Forward tab
                setTimeout(() => {
                  if (calendarTableRef?.current) {
                    calendarTableRef.current.tabIndex = 0;
                    calendarTableRef.current.focus();
                  }
                }, 0);
              }
            }
          }}>
          {smallDeviceSize && toggleDatePicker && (
            <div className={`${blockClass}__date-picker-close-wrapper`}>
              <IconButton
                align="bottom"
                kind="ghost"
                label="Close date picker"
                size="md"
                onClick={handleDatePickerPanel}
                className={`${blockClass}__date-picker-close`}>
                <SidePanelClose />
              </IconButton>
            </div>
          )}
          <DatePicker
            value={currentDay}
            datePickerType="single"
            dateFormat="m/d/Y"
            inline
            allowInput={false}
            onChange={handleDateChange}
            ref={datePickerRef}
            locale={locale ? locale.split('-')[0] : undefined}
            className={cls(
              `${blockClass}__date-picker`,
              view === 'week' && `${blockClass}__date-picker-week`,
              view === 'threeDays' && `${blockClass}__date-picker-three-day`,
              view === 'workWeek' && `${blockClass}__date-picker-workWeek`
            )}>
            <DatePickerInput
              id="date-picker-input-id-start"
              placeholder="mm/dd/yyyy"
              labelText="Date picker"
              hideLabel
            />
          </DatePicker>
        </div>

        <section
          className={cls(
            `${blockClass}__calendar`,
            toggleDatePicker && `${blockClass}__date-picker-open`
          )}
          aria-label="Calendar grid"
          ref={calendarTableRef}
          onScroll={(e) =>
            handleCalendarScroll(
              e as unknown as React.UIEvent<HTMLDivElement>,
              calendarHeaderRightRef
            )
          }>
          <table
            role="grid"
            className={cls(
              `${blockClass}__table`,
              `${blockClass}__table-${device}`,
              stickyHeader && `${blockClass}__table-sticky`,
              view !== 'month' && `${blockClass}__table-scroll`
            )}
            aria-labelledby="calendar-caption"
            tabIndex={0}
            onFocus={() => setTableFocused(true)}
            onBlur={() => setTableFocused(false)}
            onKeyDown={handleKeyDown}>
            <thead>
              {view === 'month' ? (
                <tr>
                  {weekdays.map((header, i) => {
                    const _isFocused = focusedDay === i;
                    let label = header.header;

                    if (device === 'xsm') {
                      label = header.header.charAt(0);
                    } else if (device === 'sm') {
                      label = header.header.slice(0, 3);
                    } else {
                      label = header.header;
                    }

                    return (
                      <th
                        key={header.key}
                        scope="col"
                        className={cls(
                          `${blockClass}__th`,
                          (device === 'xsm' || device === 'sm') &&
                            `${blockClass}__th-sm`
                        )}
                        aria-label={header.header}>
                        <div>{label}</div>
                      </th>
                    );
                  })}
                </tr>
              ) : (
                <tr>
                  <th
                    className={cls(
                      `${blockClass}__th`,
                      `${blockClass}__hour-col`,
                      (device === 'xsm' || device === 'sm') &&
                        `${blockClass}__th-sm`,
                      (device === 'xsm' || device === 'sm') &&
                        `${blockClass}__hour-col-sm`
                    )}
                    scope="col">
                    <div>&nbsp;</div>
                  </th>

                  {visibleDatesForView.map((d, i) => {
                    const isCurrentDay =
                      d.toDateString() === today.toDateString();
                    const _isFocused = focusedDay === i;

                    let dayOfWeek = '';
                    const dateContent = d.toLocaleDateString('en-US', {
                      day: 'numeric',
                    });

                    if (view === 'day') {
                      if (device === 'xsm') {
                        dayOfWeek = d.toLocaleDateString('en-US', {
                          weekday: 'short',
                        });
                      } else {
                        dayOfWeek = d.toLocaleDateString('en-US', {
                          weekday: 'long',
                        });
                      }
                    } else {
                      if (device === 'xsm') {
                        dayOfWeek = d.toString().split(' ')[0].slice(0, 1);
                      } else if (device === 'sm') {
                        dayOfWeek = d.toLocaleDateString('en-US', {
                          weekday: 'short',
                        });
                      } else if (device === 'md') {
                        dayOfWeek = d.toLocaleDateString('en-US', {
                          weekday: 'short',
                        });
                      } else {
                        dayOfWeek = d.toLocaleDateString('en-US', {
                          weekday: 'long',
                        });
                      }
                    }

                    return (
                      <th
                        key={d.toISOString()}
                        scope="col"
                        aria-current={isCurrentDay ? 'date' : undefined}
                        className={cls(
                          `${blockClass}__th`,
                          (device === 'xsm' || device === 'sm') &&
                            `${blockClass}__th-sm`,
                          isCurrentDay && 'current-day'
                        )}>
                        <div
                          className={cls(
                            `${blockClass}__table-head-date`,
                            (device === 'xsm' ||
                              device === 'sm' ||
                              device === 'md') &&
                              `${blockClass}__table-head-sm-date`
                          )}>
                          <div>{dayOfWeek}</div>
                          <div>{dateContent}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              )}
            </thead>

            <tbody>
              {view === 'month' &&
                monthDays.map((week) => (
                  <tr key={week.id}>
                    {weekdays.map((_, i) => {
                      const dayObj = week[`day${i}`];
                      const cellDate = dayObj.date;
                      const isFocused = focusedDate
                        ? getDateTime(cellDate) === getDateTime(focusedDate)
                        : false;

                      const start = startOfDay(cellDate);
                      const end = addDays(start, 1);

                      return (
                        <td
                          key={`${week.id}-day${i}`}
                          className={cls(
                            `${blockClass}__day`,
                            `${blockClass}__month-cell`,
                            dayObj.currentMonth && 'selected',
                            sameDay(cellDate, today) && 'current',
                            daySelected &&
                              dayObj.selected &&
                              cellDate.getMonth() === today.getMonth() &&
                              'highlight-up'
                          )}
                          onKeyDown={handleKeyDown}
                          onFocus={() => setFocusedDate(cellDate)}
                          tabIndex={isFocused ? 0 : -1}
                          aria-selected={isFocused}
                          aria-label={cellDate.toDateString()}
                          ref={(el) => {
                            if (!el) {
                              return;
                            }
                            focusedCellRef.current[getDateTime(cellDate)] = el;
                          }}>
                          <div className={`${blockClass}__day-content`}>
                            <div className={`${blockClass}__day-label`}>
                              <div className={`${blockClass}__day-number`}>
                                {dayObj.number}
                              </div>
                            </div>

                            <div className={`${blockClass}__day-events`}>
                              {renderSlot({
                                view,
                                date: cellDate,
                                start,
                                end,
                                isToday: sameDay(cellDate, today),
                                isCurrentTimeSlot: false,
                              })}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

              {view !== 'month' &&
                hours.map((hour) => {
                  const hourNum = hourStringToHourNumber(hour);
                  const isHalfRow = hourNum === -1 || hourNum === 24;
                  const hour24 = parseInt(hour);
                  const hour12 =
                    hourNum === -1 ||
                    hour24 === 0 ||
                    hour24 === 24 ||
                    hour24 % 12 === 0
                      ? 12
                      : hour24 % 12;
                  const amPm =
                    hourNum === -1 || hour24 < 12 || hour24 === 24
                      ? 'AM'
                      : 'PM';

                  const currentHour = today.getHours();
                  const currentMinutes = today.getMinutes();
                  const isCurrentHour = hour24 === currentHour;

                  const isNearestHour =
                    (hour24 === currentHour + 1 && currentMinutes >= 45) ||
                    (hour24 === currentHour % 24 && currentMinutes < 15);

                  const showTimeline =
                    !isHalfRow &&
                    hour !== '-1' &&
                    hour !== '24' &&
                    currentDay.toDateString() === today.toDateString();

                  const isToday =
                    currentDay.toDateString() === today.toDateString();
                  const shouldHideLabel =
                    (isToday &&
                      (isNearestHour ||
                        (isCurrentHour &&
                          (currentMinutes >= 45 || currentMinutes < 15)))) ||
                    (isToday && isCurrentHour && shouldShowTimelineLabel);

                  return (
                    <tr
                      key={`hour-${hour}`}
                      className={cls(isHalfRow && `${blockClass}__half-row`)}>
                      <th
                        scope="row"
                        className={cls(
                          `${blockClass}__hour-col`,
                          (device === 'xsm' || device === 'sm') &&
                            `${blockClass}__hour-col-sm`
                        )}
                        tabIndex={-1}>
                        {showTimeline && (
                          <Timeline
                            blockClass={blockClass}
                            hour={hour}
                            onPositionChange={handleTimelinePositionChange}
                            locale={locale}
                          />
                        )}

                        <div
                          className={cls(
                            `${blockClass}__hour-label`,
                            (device === 'xsm' || device === 'sm') &&
                              `${blockClass}__hour-label-sm`
                          )}>
                          {!shouldHideLabel &&
                          hourNum !== -1 &&
                          hourNum !== 24 &&
                          hourNum !== 0 ? (
                            <span>
                              <span>{hour12}</span> <span>{amPm}</span>
                            </span>
                          ) : hourNum === 24 || hourNum === 0 ? (
                            <span>
                              <span>{hour12}</span> <span>{amPm}</span>
                            </span>
                          ) : null}
                        </div>
                      </th>

                      {visibleDatesForView.map((d) => {
                        const merged = new Date(d);

                        if (hourNum === 24) {
                          merged.setHours(23, 59, 59, 999);
                        } else if (hourNum === -1) {
                          merged.setHours(0, 0, 0, 0);
                        } else {
                          merged.setHours(hourNum, 0, 0, 0);
                        }

                        const isCurrentDay =
                          d.toDateString() === today.toDateString();

                        const start = new Date(merged);
                        const end = new Date(merged);
                        end.setMinutes(59, 59, 999);

                        const isFocused = focusedDate
                          ? merged.getTime() === focusedDate.getTime()
                          : false;
                        const focusable = !isHalfRow;

                        const tillCurrentDay = d <= today;
                        const showTimelineInCell =
                          tillCurrentDay &&
                          currentDay.toDateString() === today.toDateString() &&
                          !isHalfRow;

                        return (
                          <td
                            key={`${d.toISOString()}-${hour}`}
                            className={cls(
                              `${blockClass}__day`,
                              view === 'day'
                                ? `${blockClass}__day-cell`
                                : `${blockClass}__week-cell`,
                              isCurrentDay && 'current',
                              isCurrentDay && 'selected'
                            )}
                            aria-current={isCurrentDay ? 'date' : undefined}
                            aria-label={merged.toString()}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setFocusedDate(new Date(merged))}
                            tabIndex={focusable && isFocused ? 0 : -1}
                            aria-selected={focusable ? isFocused : undefined}
                            ref={(el) => {
                              if (!el || !focusable) {
                                return;
                              }
                              focusedCellRef.current[merged.getTime()] = el;
                            }}>
                            {showTimelineInCell && (
                              <Timeline
                                blockClass={blockClass}
                                hour={hour}
                                onPositionChange={handleTimelinePositionChange}
                                locale={locale}
                              />
                            )}
                            <div
                              className={`${blockClass}__day-events-wrapper`}>
                              {renderSlot({
                                view,
                                date: d,
                                start,
                                end,
                                isToday: sameDay(d, today),
                                isCurrentTimeSlot:
                                  sameDay(d, today) &&
                                  !isHalfRow &&
                                  hourNum === now.getHours(),
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      </div>

      <div className={`${blockClass}__hidden`} aria-hidden="true">
        {currentTimePercent}
      </div>
    </div>
  );
}

export default Calendar;
