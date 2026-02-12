/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type CalendarView = 'month' | 'week' | 'day' | 'threeDays' | 'workWeek';

export type DateInput = Date | string | number;

export interface CalendarFormats {
  dateFormat?: Intl.DateTimeFormatOptions;
  timeFormat?: Intl.DateTimeFormatOptions;
  weekdayFormat?: Intl.DateTimeFormatOptions;
  monthHeaderFormat?: Intl.DateTimeFormatOptions;
  weekHeaderFormat?: Intl.DateTimeFormatOptions;
  dayHeaderFormat?: Intl.DateTimeFormatOptions;
}

export type Device = 'xsm' | 'sm' | 'md' | 'lg' | 'xlg';
export type ToolbarSize = Device;

export type MonthDay = {
  date: Date;
  month: number;
  number: number;
  year: number;
  currentMonth: boolean;
  selected: boolean;
};

export interface TimelineProps {
  blockClass?: string;
  hour: string; // "09:00" etc.
  onPositionChange?: (percentage: number, shouldShowLabel: boolean) => void;
  locale?: string;
}

export interface CalendarHeaderProps {
  blockClass?: string;

  view: CalendarView;
  calendarViews: CalendarView[];

  formatDate: () => string;
  viewDateRange: (view: CalendarView) => string;

  onToday: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onViewChange: (view: CalendarView) => void;

  toggleDatePicker: boolean;
  onToggleDatePickerPanel: () => void;

  toolbarSize: ToolbarSize;
  smallDeviceSize: boolean;

  calendarTableRef?: React.RefObject<HTMLElement>;
  calendarHeaderRightRef?: React.RefObject<HTMLDivElement>;
  onCalendarScroll?: (
    e: React.UIEvent<HTMLDivElement>,
    targetRef?: React.RefObject<HTMLElement>
  ) => void;
}

export interface CalendarProps {
  /** Initial value (defaults to today). */
  initialDate?: DateInput;

  /** The “now” value used for current-time indicator/highlight (defaults to new Date()). */
  getCurrentDate?: () => Date;

  /** Called whenever navigation changes the “selected date”. */
  onNavigate?: (nextDate: Date) => void;

  /** Initial view (defaults to 'month'). */
  defaultView?: CalendarView;

  /** Trigger when view changes. */
  onViewChange?: (nextView: CalendarView) => void;

  /** Allowed views (defaults to all). */
  views?: CalendarView[];

  /** Show/hide toolbar (defaults to true). */
  toolbar?: boolean;

  /** Right-to-left layout (defaults to false). */
  rtl?: boolean;

  /** Auto-scroll the time grid to “now” when entering today view (defaults to true). */
  scrollToCurrentTime?: boolean;

  /** Locale tag, e.g. 'en-US', 'ar', 'fr-FR' (defaults to browser locale). */
  region?: string;

  /** Formatting rules for headers/labels. */
  formats?: CalendarFormats;

  /**
   * The index of the day that the week starts on (0 - Sunday, 1 - Monday, etc.)
   * If not provided, it defaults to the locale's start day.
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Optional slot to render cell contents (events, etc.).
   * Called for every visible cell in all views.
   */
  renderCell?: (args: {
    view: CalendarView;
    date: Date;
    start: Date;
    end: Date;
    isToday: boolean;
    isCurrentTimeSlot: boolean;
  }) => React.ReactNode;

  /** Optional className passthrough. */
  className?: string;

  /** makes the header sticky */
  stickyHeader?: boolean;
}
