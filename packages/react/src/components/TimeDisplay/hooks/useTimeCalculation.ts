/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useRef } from 'react';
import type {
  TimeDisplayMode,
  TimeValues,
  TimeThreshold,
} from '../components/TimeDisplay.types';
import {
  calculateElapsedTime,
  calculateRemainingTime,
  calculateTimeValues,
  isCountdownComplete,
  hasThresholdBeenCrossed,
} from '../utils/timeUtils';

interface UseTimeCalculationProps {
  mode: TimeDisplayMode;
  startTime?: Date | number | string;
  endTime?: Date | number | string;
  duration?: number;
  onComplete?: () => void;
  thresholds?: TimeThreshold[];
  /** When true, threshold labels are injected into the aria-live region */
  announceThresholds?: boolean;
}

interface UseTimeCalculationResult {
  timeValues: TimeValues;
  isComplete: boolean;
  announcementText: string | null;
}

/**
 * Custom hook for managing time calculation and live updates.
 */
export function useTimeCalculation({
  mode,
  startTime,
  endTime,
  duration,
  onComplete,
  thresholds = [],
  announceThresholds = false,
}: UseTimeCalculationProps): UseTimeCalculationResult {
  const calculateCurrentTimeValues = (now: Date): TimeValues => {
    if (mode === 'count-up' && startTime) {
      return calculateElapsedTime(startTime, now);
    }
    if (mode === 'count-down' && endTime) {
      return calculateRemainingTime(endTime, now);
    }
    if (mode === 'duration' && duration !== undefined) {
      return calculateTimeValues(duration);
    }
    return calculateTimeValues(0);
  };

  const [timeValues, setTimeValues] = useState<TimeValues>(() =>
    calculateCurrentTimeValues(new Date())
  );
  const [isComplete, setIsComplete] = useState(false);
  const [announcementText, setAnnouncementText] = useState<string | null>(null);

  const previousSecondsRef = useRef<number>(timeValues.totalSeconds);
  const announcedThresholdsRef = useRef<Set<number>>(new Set());
  const onCompleteCalledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkThresholds = (
    currentSeconds: number,
    previousSeconds: number
  ) => {
    if (thresholds.length === 0) return;

    for (const threshold of thresholds) {
      if (announcedThresholdsRef.current.has(threshold.value)) continue;

      if (hasThresholdBeenCrossed(currentSeconds, previousSeconds, threshold.value)) {
        announcedThresholdsRef.current.add(threshold.value);
        if (announceThresholds) {
          setAnnouncementText(threshold.label);
          setTimeout(() => setAnnouncementText(null), 100);
        }
        threshold.onReach?.(threshold.value);
      }
    }
  };

  useEffect(() => {
    // Duration mode is static — compute once and return
    if (mode === 'duration') {
      setTimeValues(calculateCurrentTimeValues(new Date()));
      return;
    }

    const now = new Date();
    const values = calculateCurrentTimeValues(now);
    setTimeValues(values);
    previousSecondsRef.current = values.totalSeconds;

    intervalRef.current = setInterval(() => {
      const newNow = new Date();
      const newValues = calculateCurrentTimeValues(newNow);

      setTimeValues(newValues);

      if (mode === 'count-down' && isCountdownComplete(newValues)) {
        setIsComplete(true);

        if (onComplete && !onCompleteCalledRef.current) {
          onCompleteCalledRef.current = true;
          onComplete();
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      checkThresholds(newValues.totalSeconds, previousSecondsRef.current);
      previousSecondsRef.current = newValues.totalSeconds;
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onComplete]);

  // Reset announced thresholds when thresholds prop changes
  useEffect(() => {
    announcedThresholdsRef.current.clear();
  }, [thresholds]);

  return { timeValues, isComplete, announcementText };
}
