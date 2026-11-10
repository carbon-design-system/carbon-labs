/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  NOTIFICATION_OFF_RING_MS,
  Notification,
  NotificationOffToggle,
} from '@carbon-labs/react-motion-icons';

/* ============================================================================
 * NotificationsBell — the header bell that opens the NotificationsPanel.
 *
 *   count     motion-icons' `Notification` with `count` and `tone`: its pip
 *             (and, at 32px, the count's pill) in `--cds-support-error`,
 *             v11's badge colour
 *   dnd       `doNotDisturb`: the bell takes its
 *             off drawing, motion-icons' `NotificationOffToggle`, on that
 *             icon's own motion: turned on, the pip goes and the slash draws
 *             in; turned off, the slash retracts and the bell rings, then
 *             the pip is back. Only the drawing changes: arrivals keep coming
 *             and the count stays in the trigger's name (the host's label)
 *   reduced   the drawings change at once
 *
 * Put it in the trigger (an IconButton) and pass the panel's
 * `onDoNotDisturbChange` state to it, and the same state to the panel's
 * `doNotDisturbDefaultToggled` so it opens as it was left.
 * ========================================================================== */

/**
 * The off bell's ring after Do not disturb turns off: motion-icons'
 * NotificationOffToggle rings its track (NOTIFICATION_OFF_RING_MS) as
 * the slash retracts. The pip comes back once it has rung.
 */
export const RING_MS = NOTIFICATION_OFF_RING_MS;

/** The ring's wait at a time scale, ms. */
export const ringMs = (timeScale = 1) => RING_MS * timeScale;

export interface NotificationsBellProps {
  /** Unread notifications: the pip (a count at 32px). 0: no pip. */
  count?: number;
  /** Do not disturb is on: the bell's off drawing. Default false. */
  doNotDisturb?: boolean;
  /** The icon's size. Default 20 (an md header button). */
  size?: 16 | 20 | 24 | 32;
  /** Slow motion: multiplies the wait for the ring. Default 1. */
  timeScale?: number;
}

export function NotificationsBell({
  count = 0,
  doNotDisturb = false,
  size = 20,
  timeScale = 1,
}: NotificationsBellProps) {
  const reduced = usePrefersReducedMotion();
  // The off drawing is shown while on and while it rings back; `slashed` drives its toggle.
  const [off, setOff] = useState(doNotDisturb);
  const [slashed, setSlashed] = useState(doNotDisturb);
  if (doNotDisturb && !off) setOff(true);
  if (!doNotDisturb && slashed) setSlashed(false);
  if (!doNotDisturb && off && reduced) setOff(false);

  useEffect(() => {
    if (doNotDisturb) {
      // Mounted unslashed (the same bell), then slashed: the icon draws its slash in.
      const raf = requestAnimationFrame(() => setSlashed(true));
      return () => cancelAnimationFrame(raf);
    }
    if (!off) return;
    // The slash retracts and the bell rings; then the bell with its pip.
    const t = window.setTimeout(() => setOff(false), ringMs(timeScale));
    return () => window.clearTimeout(t);
  }, [doNotDisturb, off, timeScale]);

  return off ? (
    <NotificationOffToggle
      size={size}
      toggled={slashed}
      disableToggle
      aria-hidden="true"
    />
  ) : (
    <Notification size={size} count={count} tone aria-hidden="true" />
  );
}
NotificationsBell.displayName = 'NotificationsBell';
