/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Time display mode - defines how the time value is interpreted
 */
export type TimeDisplayMode = 'count-up' | 'count-down' | 'duration';

/**
 * Display format - defines the visual presentation style
 */
export type TimeDisplayFormat = 'split' | 'boxed' | 'colon' | 'inline';

/**
 * Time unit types
 */
export type TimeUnit = 'days' | 'hours' | 'minutes' | 'seconds';

/**
 * Label position options
 */
export type LabelPosition = 'top' | 'inline';

/**
 * Announcement mode for accessibility
 */
export type AnnouncementMode = 'off' | 'threshold';

/**
 * Threshold configuration for accessibility announcements
 */
export interface TimeThreshold {
  /** Time value in seconds when announcement should trigger */
  value: number;
  /** Accessible label to announce */
  label: string;
  /**
   * Optional callback fired once when this threshold is crossed.
   * Use this to trigger side effects such as showing a toast,
   * updating application state, or logging analytics.
   * Receives the threshold value (remaining seconds) that was crossed.
   */
  onReach?: (value: number) => void;
}

/**
 * Calculated time values broken down by unit
 */
export interface TimeValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * Props for the TimeDisplay component
 */
export interface TimeDisplayProps {
  /**
   * Mode determines how the time value is calculated and displayed.
   * - `count-up`: Shows elapsed time from `startTime`
   * - `count-down`: Shows remaining time until `endTime`
   * - `duration`: Shows a fixed duration value
   */
  mode: TimeDisplayMode;

  /**
   * Label describing what the time value represents.
   * Examples: "Elapsed time", "Time remaining", "Total runtime"
   */
  label: string;

  /**
   * Hide the label visually (still accessible to screen readers).
   * @default false
   */
  hideLabel?: boolean;

  /**
   * Position of the label relative to the time display.
   * Defaults to `'inline'` for the `inline` format, `'top'` for all others.
   */
  labelPosition?: LabelPosition;

  /**
   * Start time for `count-up` mode.
   * Accepts a `Date`, Unix timestamp (ms), or ISO date string.
   */
  startTime?: Date | number | string;

  /**
   * End time for `count-down` mode.
   * Accepts a `Date`, Unix timestamp (ms), or ISO date string.
   */
  endTime?: Date | number | string;

  /**
   * Fixed duration in seconds for `duration` mode.
   */
  duration?: number;

  /**
   * Which time units to display.
   * @default ['hours', 'minutes', 'seconds']
   */
  units?: TimeUnit[];

  /**
   * Visual format for displaying the time.
   * @default 'split'
   */
  format?: TimeDisplayFormat;

  /**
   * Pad numeric values with leading zeros for stable layout.
   * @default true
   */
  padWithZero?: boolean;

  /**
   * Keep units visible even when their value is zero.
   * @default true
   */
  keepZeroValueUnits?: boolean;

  /**
   * Enable Carbon productive-motion animations for digit changes.
   * Automatically disabled when `prefers-reduced-motion: reduce` is set.
   * @default true
   */
  animated?: boolean;

  /**
   * Label to display when a countdown reaches zero.
   * When omitted the display stops at all zeros.
   */
  completeLabel?: string;

  /**
   * Callback fired once when a countdown reaches zero.
   */
  onComplete?: () => void;

  /**
   * Accessibility announcement mode.
   * @default 'off'
   */
  announcementMode?: AnnouncementMode;

  /**
   * Threshold configurations for accessibility announcements.
   * Only used when `announcementMode` is `'threshold'`.
   */
  thresholds?: TimeThreshold[];

  /**
   * Helper text displayed below the time display.
   * Examples: "Job is still running", "Session expires soon"
   */
  helperText?: string;

  /**
   * Additional CSS class name applied to the root element.
   */
  className?: string;

  /**
   * Test ID forwarded to the root element.
   */
  'data-testid'?: string;
}
