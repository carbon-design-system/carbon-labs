/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Hover-only icons drawn from a toggle held in one state: Asleep, Awake,
 * Favorite, Locked, Notification, Unlocked. Each is the toggle's geometry
 * at that state (`p` 0 or 1) with the toggle's hover, as a plain hover
 * icon; with `animated={false}` it draws Carbon's art.
 * Under reduced motion they draw their rest geometry, as every hover icon
 * does.
 */
import Asleep16 from '@carbon/icons/es/asleep/16.js';
import Asleep32 from '@carbon/icons/es/asleep/32.js';
import Favorite32 from '@carbon/icons/es/favorite/32.js';
import Locked32 from '@carbon/icons/es/locked/32.js';
import Notification16 from '@carbon/icons/es/notification/16.js';
import Notification32 from '@carbon/icons/es/notification/32.js';
import Sun32 from '@carbon/icons/es/sun/32.js';
import Unlocked16 from '@carbon/icons/es/unlocked/16.js';
import Unlocked32 from '@carbon/icons/es/unlocked/32.js';
import {
  carbonArt,
  defineAction,
  hoverIcon,
  type Shapes,
  type ToggleFrame,
  type ToggleFrameIn,
} from '../../engine';
import { AsleepAwakeOutlineToggleSpec } from './asleepAwake';
import { LockedUnlockedOutlineToggleSpec } from './lockToggle';
import {
  asleepShapes,
  bellRungShapes,
  favoriteShapes,
  lockedShapes,
  notificationShapes,
} from './stateToggles';
import {
  BELL_RING,
  KNOCKER_RING,
  RING_MS,
  RING_SLOW,
  trackAt,
} from './notificationOff';

/** A toggle's geometry held at `p` (0 off, 1 on), as a hover icon's. */
/* @__NO_SIDE_EFFECTS__ */
const held =
  (geo: (f: ToggleFrame & ToggleFrameIn, size?: number) => Shapes, p: 0 | 1) =>
  (f: { h: number; entering?: number }, size?: number) =>
    geo({ ...f, p, e: 0 } as ToggleFrame & ToggleFrameIn, size);

/** Asleep: AsleepToggle's outline moon. On hover the moon tips and grows a little. */
export const AsleepSpec = /* @__PURE__ */ hoverIcon('Asleep', {
  geo: held(asleepShapes, 0),
  static: /* @__PURE__ */ carbonArt(Asleep16, Asleep32),
});
/** Awake: AsleepAwakeToggle's sun. On hover the sun grows and its rays reach out. */
export const AwakeSpec = /* @__PURE__ */ hoverIcon('Awake', {
  geo: held(AsleepAwakeOutlineToggleSpec.geo, 1),
  static: /* @__PURE__ */ carbonArt(Sun32),
});
/** Favorite: FavoriteToggle's outline heart. */
export const FavoriteSpec = /* @__PURE__ */ hoverIcon('Favorite', {
  geo: held(favoriteShapes, 0),
  static: /* @__PURE__ */ carbonArt(Favorite32),
});
/** Locked: LockedToggle's outline lock. */
export const LockedSpec = /* @__PURE__ */ hoverIcon('Locked', {
  geo: held(lockedShapes, 0),
  static: /* @__PURE__ */ carbonArt(Locked32),
});
/** Notification: NotificationToggle's outline bell. Its action rings it once (NotificationToggle's ring). */
export const NotificationSpec = /* @__PURE__ */ hoverIcon('Notification', {
  geo: held(notificationShapes, 0),
  static: /* @__PURE__ */ carbonArt(Notification16, Notification32),
  action: /* @__PURE__ */ defineAction({
    description:
      'A new notification: the bell swings side to side once, its clapper a beat behind, then settles. With a hand-off to `notification`, the dot enters as it settles.',
    duration: (RING_SLOW * RING_MS) / 1000,
    geo: ({ h, a }, size) => {
      const ms = a * RING_MS;
      return bellRungShapes(
        { h, p: 0, e: 0 },
        size,
        trackAt(ms, BELL_RING),
        trackAt(ms, KNOCKER_RING)
      );
    },
  }),
});
/** Unlocked: LockedUnlockedToggle's open lock. */
export const UnlockedSpec = /* @__PURE__ */ hoverIcon('Unlocked', {
  geo: held(LockedUnlockedOutlineToggleSpec.geo, 1),
  static: /* @__PURE__ */ carbonArt(Unlocked16, Unlocked32),
});
