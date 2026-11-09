/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DoubleChevronLeft32 from '@carbon/icons/es/double-chevron--left/32.js';
import DoubleChevronRight32 from '@carbon/icons/es/double-chevron--right/32.js';
import {
  carbonArt,
  HOVER,
  hoverIcon,
  type HoverIconSpec,
  type Shapes,
  type CarbonArt,
} from '../../engine';

/**
 * Carbon `double-chevron--right` / `double-chevron--left` (no reference animation).
 *
 * Hover: both chevrons nudge 3px in the seek direction, together (no lead/trail
 * stagger).
 * Carbon's compound path is split into its two chevrons verbatim.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const NUDGE = 3;

const RIGHT = {
  lead: 'M16.0146,25.8994l-1.4141-1.4141,8.4854-8.4854L14.6006,7.5146l1.4141-1.4141,9.8994,9.8994-9.8994,9.8994Z',
  trail:
    'M7.5146,25.8994l-1.4141-1.4141,8.4854-8.4854L6.1006,7.5146l1.4141-1.4141,9.8994,9.8994-9.8994,9.8994Z',
};
const LEFT = {
  lead: 'M15.9854,25.8994l-9.8994-9.8994L15.9854,6.1006l1.4141,1.4141-8.4854,8.4854,8.4854,8.4854-1.4141,1.4141Z',
  trail:
    'M24.4854,25.8994l-9.8994-9.8994,9.8994-9.8994,1.4141,1.4141-8.4854,8.4854,8.4854,8.4854-1.4141,1.4141Z',
};

/* @__NO_SIDE_EFFECTS__ */
function makeDoubleChevron(
  name: string,
  paths: { lead: string; trail: string },
  dir: 1 | -1,
  art: CarbonArt
): HoverIconSpec {
  const geo = ({ h }: { h: number }): Shapes => {
    const transform = `translate(${Math.round(dir * NUDGE * h * 1e4) / 1e4 || 0} 0)`;
    return {
      lead: { d: paths.lead, transform },
      trail: { d: paths.trail, transform },
    };
  };
  return hoverIcon(name, { geo, hover: HOVER, static: art });
}

export const DoubleChevronRightSpec = /* @__PURE__ */ makeDoubleChevron(
  'DoubleChevronRight',
  RIGHT,
  1,
  /* @__PURE__ */ carbonArt(DoubleChevronRight32)
);
export const DoubleChevronLeftSpec = /* @__PURE__ */ makeDoubleChevron(
  'DoubleChevronLeft',
  LEFT,
  -1,
  /* @__PURE__ */ carbonArt(DoubleChevronLeft32)
);
