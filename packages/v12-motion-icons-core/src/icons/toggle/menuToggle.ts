/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Close32 from '@carbon/icons/es/close/32.js';
import Menu16 from '@carbon/icons/es/menu/16.js';
import Menu20 from '@carbon/icons/es/menu/20.js';
import Menu24 from '@carbon/icons/es/menu/24.js';
import Menu32 from '@carbon/icons/es/menu/32.js';
import { carbonArt, toggleIcon, TOGGLE_IN, type Shapes } from '../../engine';
import { rectPath } from '../../geometry';
import { CUT_SHRINK, cut } from '../controls/playback';
import { bars, MENU_REACH, menuBars } from '../navigation/navZoom';
import { CLOSE, plus, polyD } from '../operations/signs';

/**
 * Menu ⇄ Close, for a button that opens and closes a menu or navigation
 * panel.
 *
 * Toggle: Play ⇄ Pause's match cut (playback.ts). The outgoing glyph shrinks
 * on the exit ease until the cut at 6/15, then the incoming glyph appears at
 * that small size and grows to full on the entrance ease; played backwards
 * for close → menu. Menu's bars lose 4px at each end (Play ⇄ Pause's bars
 * do the same) and close up toward the middle by the same ratio, so the
 * stack shrinks as a whole and the gaps between the bars stay open. At the
 * cut, the X's arms are as long as the shrunk bars, so four short bars cut
 * to two crossed ones of the same length. Every bar and arm keeps its
 * weight: only the ends and the bars' places move.
 *
 * Timing: 160ms (moderate-01) both ways, as Play ⇄ Pause, Recording ⇄ Stop
 * and the side panel's open ⇄ close: Menu and Close are both actions (open,
 * close), and neither is an "off".
 *
 * Hover: each end hovers as its own icon. Menu's bars reach 1.5px further at
 * each end, all together, on Menu's timing (`menu`); Close's arms reach 2px
 * further at each end on the standard hover (`h`). Through the cut, the
 * hover follows whichever glyph shows.
 *
 * With motion off (and under reduced motion) each state draws Carbon's
 * Menu or Close at once.
 */

const C = 16;

/**
 * Menu ⇄ Close geometry. `p` is the toggle (0 menu, 1 close); `h` Close's
 * hover and `menu` Menu's (outside the engine it defaults to `h`).
 */
export function menuCloseShapes(
  { h, p, menu }: { h: number; p: number; menu?: number },
  size?: number
): Shapes {
  const c = cut(p);
  const b = menuBars(size);
  // The bars' half-length at the cut, and the ratio the stack closes up by.
  const half = (b.x1 - b.x0) / 2;
  const sigma = (half - CUT_SHRINK) / half;
  const shapes: Shapes = {};
  const k = MENU_REACH * bars.at(menu ?? h);
  b.ys.forEach((y, i) => {
    if (c.second) {
      return void (shapes[`b${i}`] = { d: '' });
    }
    const shrink = CUT_SHRINK * c.small;
    const dy = (y + b.t / 2 - C) * (sigma - 1) * c.small;
    shapes[`b${i}`] = {
      d: rectPath(b.x0 - k + shrink, y + dy, b.x1 + k - shrink, y + dy + b.t),
    };
  });
  // The X shrinks to arms as long as the shrunk bars: each arm reaches `half − CUT_SHRINK` from the centre.
  const armShrink = CLOSE.l - (half - CUT_SHRINK);
  shapes.sign = {
    d: c.second
      ? polyD(plus(CLOSE.l + 2 * h - armShrink * c.small, CLOSE.w, 45))
      : '',
  };
  return shapes;
}

/** Menu ⇄ Close: Menu (`menu`, the start) and Close (`close`, toggled). */
export const MenuToggleSpec = /* @__PURE__ */ toggleIcon<'menu' | 'close'>(
  'MenuToggle',
  {
    states: ['menu', 'close'],
    statics: [
      /* @__PURE__ */ carbonArt(Menu16, Menu20, Menu24, Menu32),
      /* @__PURE__ */ carbonArt(Close32),
    ],
    geo: (fr, size) => menuCloseShapes(fr, size),
    // Menu's bars hover on Menu's own timing; Close's arms on the standard one (h).
    hovers: { menu: { hover: bars.hover } },
    // Linear progress: the match cut applies its own two eases. 160ms both ways.
    change: (on, _f, tween) =>
      tween('p', on ? 1 : 0, {
        duration: TOGGLE_IN.duration,
        ease: [0, 0, 1, 1],
      }),
  }
);
