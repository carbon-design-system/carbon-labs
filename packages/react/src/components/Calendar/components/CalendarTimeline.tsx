/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

export interface TimelineProps {
  blockClass?: string;
  hour: string; // "09:00" etc.
  onPositionChange?: (percentage: number) => void;
  locale?: string;
}

const getHourNumber = (hour: string) => {
  const hh = Number.parseInt(hour.slice(0, 2), 10);
  return Number.isFinite(hh) ? hh : Number.parseInt(hour, 10);
};

export const Timeline = ({
  blockClass: blockClassProp,
  hour,
  onPositionChange,
  locale = 'en-US',
}: TimelineProps) => {
  const prefix = usePrefix();
  const blockClass = blockClassProp ?? `${prefix}--calendar`;

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const hourNumber = useMemo(() => getHourNumber(hour), [hour]);
  const isCurrentHour = now.getHours() === hourNumber;

  const percentage = useMemo(() => {
    const p = (now.getMinutes() / 60) * 100;
    onPositionChange?.(p);
    return p;
  }, [now, onPositionChange]);

  const label = useMemo(
    () => now.toLocaleString(locale, { hour: 'numeric', minute: '2-digit', hour12: true }),
    [now, locale]
  );

  if (!isCurrentHour) return null;

  return (
    <div
      className={`${blockClass}__current-timeline active`}
      style={{ top: `${percentage}%` }}
      title={label}
    >
      <div className={`${blockClass}__current-timeline-label`}>{label}</div>
    </div>
  );
};
