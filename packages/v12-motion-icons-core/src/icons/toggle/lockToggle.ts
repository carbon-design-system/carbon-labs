/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Locked32 from '@carbon/icons/es/locked/32.js';
import LockedFilled32 from '@carbon/icons/es/locked--filled/32.js';
import Unlocked16 from '@carbon/icons/es/unlocked/16.js';
import Unlocked32 from '@carbon/icons/es/unlocked/32.js';
import UnlockedFilled32 from '@carbon/icons/es/unlocked--filled/32.js';
import {
  carbonArt,
  toggleIcon,
  variantToggle,
  type Frame,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
  type ToggleIconProps,
} from '../../engine';
import { ENTRANCE, STANDARD } from '../../ease';
import { lockBody, shackleD } from './stateToggles';

const CLocked = /* @__PURE__ */ carbonArt(Locked32);
const CLockedFilled = /* @__PURE__ */ carbonArt(LockedFilled32);
const CUnlocked = /* @__PURE__ */ carbonArt(Unlocked16, Unlocked32);
const CUnlockedFilled = /* @__PURE__ */ carbonArt(UnlockedFilled32);

/**
 * Locked ⇄ Unlocked on the frame engine (see utils/frameIcon).
 *
 * Toggle (the reference animation, 250ms both ways: both are valid
 * states): the body drops 1px and the shackle 4px more (100ms, standard
 * ease), the shackle snaps open or shut at the bottom of the drop, and
 * both spring back (150ms, entrance ease). Hover: as Locked, the body
 * scales 107.5% about (16,10) and lifts 2px, the arch drops 1px and the
 * legs retract 2px (an open leg ends with the arch). The shackle's legs
 * stop at the body's top edge, never inside it. `filled` draws Carbon's
 * filled locks (a solid body). Rest matches Carbon.
 *
 * Frame: `p` is the state shown at rest (0 locked, 1 unlocked); `e` runs
 * the bounce's 250ms timeline (0 at rest). The bounce's starting depth and
 * the state shown before the snap ride along on the frame (`k0`, `o0`), so
 * a re-click mid-bounce carries on from where the lock is.
 */

const DROP_MS = 100;
const TOTAL_MS = 250;
const BODY_DROP = 1;
const SHACKLE_DROP = 4;

type LockFrame = ToggleFrame & { k0?: number; o0?: number };

/** The bounce depth (0–1 of the drop) at timeline e. */
function depth(f: LockFrame): number {
  if (f.e <= 0) {
    return 0;
  }
  const t = f.e * TOTAL_MS;
  const k0 = f.k0 ?? 0;
  return t < DROP_MS
    ? k0 + (1 - k0) * STANDARD(t / DROP_MS)
    : 1 - ENTRANCE((t - DROP_MS) / (TOTAL_MS - DROP_MS));
}
/** Whether the shackle is shown open. */
const isOpen = (f: LockFrame) =>
  (f.e > 0 && f.e * TOTAL_MS < DROP_MS ? (f.o0 ?? 1 - f.p) : f.p) >= 0.5;

function lockShapes(f: LockFrame, filled: boolean): Shapes {
  const { h } = f;
  const k = depth(f);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pts is dropped; the rest is the body's rect
  const { pts: _pts, ...rect } = lockBody(
    1 + 0.075 * h,
    -2 * h + BODY_DROP * k
  );
  const off = (BODY_DROP + SHACKLE_DROP) * k;
  const left = Math.min(15 - 2 * h + off, rect.y);
  const mid = 8 + h + off;
  const shapes: Shapes = {
    shackle: { d: shackleD(mid, left, isOpen(f) ? mid : left) },
  };
  if (filled) {
    shapes.solid = { tag: 'rect', ...rect, rx: 1, ry: 1 };
  }
  shapes.body = {
    tag: 'rect',
    ...rect,
    rx: 1,
    ry: 1,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
  };
  return shapes;
}

function lockChange(
  toUnlocked: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  const f = fr as LockFrame & Frame;
  f.k0 = depth(f);
  f.o0 = isOpen(f) ? 1 : 0;
  f.p = toUnlocked ? 1 : 0;
  // Just past 0, so the old state shows until the snap (e = 0 is rest).
  f.e = 1e-6;
  return tween(
    'e',
    1,
    { duration: TOTAL_MS / 1000, ease: [0, 0, 1, 1] as never },
    () => {
      f.e = 0;
      f.k0 = 0;
      repaint();
    }
  );
}

const spec = (filled: boolean) => ({
  states: ['locked', 'unlocked'] as const,
  statics: filled
    ? ([CLockedFilled, CUnlockedFilled] as const)
    : ([CLocked, CUnlocked] as const),
  geo: (f: ToggleFrame) => lockShapes(f, filled),
  change: lockChange,
});

export const LockedUnlockedOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'locked' | 'unlocked'
>('LockedUnlockedToggle', spec(false));
export const LockedUnlockedFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'locked' | 'unlocked'
>('LockedUnlockedToggle(filled)', spec(true));

/**
 * Locked ⇄ Unlocked; `filled` draws Carbon's filled locks. Named for both
 * ends: LockedToggle is Locked's own outline ⇄ filled toggle.
 */
export const LockedUnlockedToggleSpec = /* @__PURE__ */ variantToggle(
  'LockedUnlockedToggle',
  (p: ToggleIconProps<'locked' | 'unlocked'>) =>
    p.filled ? LockedUnlockedFilledToggleSpec : LockedUnlockedOutlineToggleSpec
);
