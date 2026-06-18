/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { TimelineProps } from './Calendar.types';

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
    const shouldShowLabel = p < 85 && p > 15;
    onPositionChange?.(p, shouldShowLabel);
    return p;
  }, [now, onPositionChange]);

  const label = useMemo(
    () =>
      now.toLocaleString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    [now, locale]
  );

  const shouldShowLabel = percentage < 85 && percentage > 15;

  if (!isCurrentHour) {
    return null;
  }

  return (
    <div
      className={`${blockClass}__current-timeline active`}
      // eslint-disable-next-line react/forbid-dom-props
      style={{ top: `${percentage}%` }}
      title={label}>
      {shouldShowLabel && (
        <div className={`${blockClass}__current-timeline-label`}>{label}</div>
      )}
    </div>
  );
};
