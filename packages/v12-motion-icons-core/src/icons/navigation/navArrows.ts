/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ArrowDown16 from '@carbon/icons/es/arrow--down/16.js';
import ArrowDown32 from '@carbon/icons/es/arrow--down/32.js';
import ArrowUp16 from '@carbon/icons/es/arrow--up/16.js';
import ArrowUp32 from '@carbon/icons/es/arrow--up/32.js';
import ArrowLeft16 from '@carbon/icons/es/arrow--left/16.js';
import ArrowLeft32 from '@carbon/icons/es/arrow--left/32.js';
import ArrowRight16 from '@carbon/icons/es/arrow--right/16.js';
import ArrowRight20 from '@carbon/icons/es/arrow--right/20.js';
import ArrowRight24 from '@carbon/icons/es/arrow--right/24.js';
import ArrowRight32 from '@carbon/icons/es/arrow--right/32.js';
import ArrowDownLeft32 from '@carbon/icons/es/arrow--down-left/32.js';
import ArrowDownRight32 from '@carbon/icons/es/arrow--down-right/32.js';
import ArrowUpLeft32 from '@carbon/icons/es/arrow--up-left/32.js';
import ArrowUpRight32 from '@carbon/icons/es/arrow--up-right/32.js';
import CaretDown32 from '@carbon/icons/es/caret--down/32.js';
import CaretUp32 from '@carbon/icons/es/caret--up/32.js';
import CaretLeft32 from '@carbon/icons/es/caret--left/32.js';
import CaretRight32 from '@carbon/icons/es/caret--right/32.js';
import ChevronDown16 from '@carbon/icons/es/chevron--down/16.js';
import ChevronDown32 from '@carbon/icons/es/chevron--down/32.js';
import ChevronUp16 from '@carbon/icons/es/chevron--up/16.js';
import ChevronUp32 from '@carbon/icons/es/chevron--up/32.js';
import ChevronLeft16 from '@carbon/icons/es/chevron--left/16.js';
import ChevronLeft32 from '@carbon/icons/es/chevron--left/32.js';
import ChevronRight16 from '@carbon/icons/es/chevron--right/16.js';
import ChevronRight32 from '@carbon/icons/es/chevron--right/32.js';
import PageFirst32 from '@carbon/icons/es/page--first/32.js';
import PageLast32 from '@carbon/icons/es/page--last/32.js';
import UpToTop32 from '@carbon/icons/es/up-to-top/32.js';
import DownToBottom32 from '@carbon/icons/es/down-to-bottom/32.js';
import { hoverIcon, carbonArt, withStatic } from '../../engine';
import { rectPath } from '../../geometry';
import { f } from '../../paint';

/**
 * The navigation arrows, carets and chevrons on the frame engine: the same
 * motion as their reference animations, with the shared hover (160ms entrance in,
 * 120ms exit out), cleanup on unmount, and no clipping at the frame edge.
 *
 *  - Arrow (8 directions), Caret, Chevron: a standalone arrow reaches 4px:
 *    the head moves and the shaft lengthens behind it (Arrow); the glyph
 *    slides (Caret, Chevron).
 *  - Page first / last, Up to top, Down to bottom: an arrow at a bar
 *    reaches 2px, and the bar's ends reach 2px further out.
 * Rest matches Carbon.
 */

/** Two paths with the same commands, interpolated number by number. */
/* @__NO_SIDE_EFFECTS__ */
function morph(rest: string, hover: string): (h: number) => string {
  const nums = (d: string) => d.match(/-?\d*\.?\d+/g)!.map(Number);
  const [a, b] = [nums(rest), nums(hover)];
  const parts = rest.split(/-?\d*\.?\d+/g);
  return (h) =>
    parts.reduce(
      (d, part, i) =>
        d + part + (i < a.length ? f(a[i] + (b[i] - a[i]) * h) : ''),
      ''
    );
}
const rect = (x0: number, y0: number, x1: number, y1: number) =>
  rectPath(x0, y0, x1, y1);

type ArrowSpec = { shaft: (h: number) => string; head: (h: number) => string };
/**
 * Carbon's own small-size arrow (one outline, a longer shaft): its points in
 * its viewBox, scaled into the 32 frame; the head's points (past `head` along
 * the arrow's direction) move 4 units, the tail's stay.
 */
type Small = { vb: number; pts: number[]; dir: [number, number]; head: number };
function smallArrow({ vb, pts, dir, head }: Small, h: number): string {
  const k = 32 / vb;
  const out: string[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const [x, y] = [pts[i] * k, pts[i + 1] * k];
    const moves = x * dir[0] + y * dir[1] > head * k;
    out.push(
      `${f(x + (moves ? 4 * h * dir[0] : 0))} ${f(y + (moves ? 4 * h * dir[1] : 0))}`
    );
  }
  return `M${out.join('L')}Z`;
}
/* @__NO_SIDE_EFFECTS__ */
const arrow = (
  name: string,
  spec: ArrowSpec,
  small: Record<number, Small> = {}
) =>
  hoverIcon(name, {
    geo: ({ h }, size) => {
      const sm = size !== undefined ? small[size] : undefined;
      // The same two keys at every size: the small drawings are one outline.
      return sm
        ? { shaft: { d: smallArrow(sm, h) }, head: { d: '' } }
        : { shaft: { d: spec.shaft(h) }, head: { d: spec.head(h) } };
    },
  });

export const ArrowDownSpec = /* @__PURE__ */ withStatic(
  arrow(
    'ArrowDown',
    {
      shaft: (h) => rect(15, 4, 17, 25 + 4 * h),
      head: morph(
        'M6,18 L7.41,16.59 L16,25.18 L24.59,16.59 L26,18 L16,28 Z',
        'M6,22 L7.41,20.59 L16,29.18 L24.59,20.59 L26,22 L16,32 Z'
      ),
    },
    {
      16: {
        vb: 16,
        pts: [
          12.3, 9.3, 8.5, 13.1, 8.5, 1, 7.5, 1, 7.5, 13.1, 3.7, 9.3, 3, 10, 8,
          15, 13, 10,
        ],
        dir: [0, 1],
        head: 5,
      },
    }
  ),
  /* @__PURE__ */ carbonArt(ArrowDown16, ArrowDown32)
);
export const ArrowUpSpec = /* @__PURE__ */ withStatic(
  arrow(
    'ArrowUp',
    {
      shaft: (h) => rect(15, 6 - 4 * h, 17, 28),
      head: morph(
        'M16,6.82 L7.41,15.41 L6,14 L16,4 L26,14 L24.59,15.41 Z',
        'M16,2.82 L7.41,11.41 L6,10 L16,0 L26,10 L24.59,11.41 Z'
      ),
    },
    {
      16: {
        vb: 16,
        pts: [
          3.7, 6.7, 7.5, 2.9, 7.5, 15, 8.5, 15, 8.5, 2.9, 12.3, 6.7, 13, 6, 8,
          1, 3, 6,
        ],
        dir: [0, -1],
        head: -11,
      },
    }
  ),
  /* @__PURE__ */ carbonArt(ArrowUp16, ArrowUp32)
);
export const ArrowLeftSpec = /* @__PURE__ */ withStatic(
  arrow(
    'ArrowLeft',
    {
      shaft: (h) => rect(6 - 4 * h, 15, 28, 17),
      head: morph(
        'M6.82,16 L15.41,7.41 L14,6 L4,16 L14,26 L15.41,24.59 Z',
        'M2.82,16 L11.41,7.41 L10,6 L0,16 L10,26 L11.41,24.59 Z'
      ),
    },
    {
      16: {
        vb: 16,
        pts: [
          6.7, 12.3, 2.9, 8.5, 15, 8.5, 15, 7.5, 2.9, 7.5, 6.7, 3.7, 6, 3, 1, 8,
          6, 13,
        ],
        dir: [-1, 0],
        head: -11,
      },
    }
  ),
  /* @__PURE__ */ carbonArt(ArrowLeft16, ArrowLeft32)
);
export const ArrowRightSpec = /* @__PURE__ */ withStatic(
  arrow(
    'ArrowRight',
    {
      shaft: (h) => rect(4, 15, 26 + 4 * h, 17),
      head: morph(
        'M25.18,16 L25.16,15.98 L16.57,24.57 L18,26 L28,16 L18,6 L16.57,7.39 Z',
        'M29.18,16 L29.16,15.98 L20.57,24.57 L22,26 L32,16 L22,6 L20.57,7.39 Z'
      ),
    },
    {
      16: {
        vb: 16,
        pts: [
          9.3, 3.7, 13.1, 7.5, 1, 7.5, 1, 8.5, 13.1, 8.5, 9.3, 12.3, 10, 13, 15,
          8, 10, 3,
        ],
        dir: [1, 0],
        head: 5,
      },
      20: {
        vb: 20,
        pts: [
          11.8, 2.8, 10.8, 3.8, 16.2, 9.3, 1, 9.3, 1, 10.7, 16.2, 10.7, 10.8,
          16.2, 11.8, 17.2, 19, 10,
        ],
        dir: [1, 0],
        head: 6,
      },
      24: {
        vb: 24,
        pts: [
          14, 4, 12.9, 5.1, 18.9, 11.2, 2, 11.2, 2, 12.8, 18.9, 12.8, 12.9,
          18.9, 14, 20, 22, 12,
        ],
        dir: [1, 0],
        head: 8,
      },
    }
  ),
  /* @__PURE__ */ carbonArt(
    ArrowRight16,
    ArrowRight20,
    ArrowRight24,
    ArrowRight32
  )
);
export const ArrowDownLeftSpec = /* @__PURE__ */ withStatic(
  arrow('ArrowDownLeft', {
    shaft: morph(
      'M24.59,6 L6,24.59 L7.41,26 L26,7.41 Z',
      'M24.59,6 L3.17,27.42 L4.58,28.83 L26,7.41 Z'
    ),
    head: morph(
      'M8,24 L8,10 L6,10 L6,26 L22,26 L22,24 Z',
      'M5.17,26.83 L5.17,12.83 L3.17,12.83 L3.17,28.83 L19.17,28.83 L19.17,26.83 Z'
    ),
  }),
  /* @__PURE__ */ carbonArt(ArrowDownLeft32)
);
export const ArrowDownRightSpec = /* @__PURE__ */ withStatic(
  arrow('ArrowDownRight', {
    shaft: morph(
      'M7.41,6 L25,23.59 L23.59,25 L6,7.41 Z',
      'M7.41,6 L27.83,26.42 L26.42,27.83 L6,7.41 Z'
    ),
    head: morph(
      'M24,24 L24,10 L26,10 L26,26 L10,26 L10,24 Z',
      'M26.83,26.83 L26.83,12.83 L28.83,12.83 L28.83,28.83 L12.83,28.83 L12.83,26.83 Z'
    ),
  }),
  /* @__PURE__ */ carbonArt(ArrowDownRight32)
);
export const ArrowUpLeftSpec = /* @__PURE__ */ withStatic(
  arrow('ArrowUpLeft', {
    shaft: morph(
      'M24.59,26 L7,8.41 L8.41,7 L26,24.59 Z',
      'M24.59,26 L4.17,5.58 L5.58,4.17 L26,24.59 Z'
    ),
    head: morph(
      'M8,8 L8,22 L6,22 L6,6 L22,6 L22,8 Z',
      'M5.17,5.17 L5.17,19.17 L3.17,19.17 L3.17,3.17 L19.17,3.17 L19.17,5.17 Z'
    ),
  }),
  /* @__PURE__ */ carbonArt(ArrowUpLeft32)
);
export const ArrowUpRightSpec = /* @__PURE__ */ withStatic(
  arrow('ArrowUpRight', {
    shaft: morph(
      'M7.41,26 L25,8.41 L23.59,7 L6,24.59 Z',
      'M7.41,26 L27.83,5.58 L26.42,4.17 L6,24.59 Z'
    ),
    head: morph(
      'M24,8 L24,22 L26,22 L26,6 L10,6 L10,8 Z',
      'M26.83,5.17 L26.83,19.17 L28.83,19.17 L28.83,3.17 L12.83,3.17 L12.83,5.17 Z'
    ),
  }),
  /* @__PURE__ */ carbonArt(ArrowUpRight32)
);

/** A glyph that slides 4px in the direction it points. */
const slide = (name: string, d: string, dx: number, dy: number) =>
  hoverIcon(name, {
    geo: ({ h }) => ({
      glyph: { d, transform: `translate(${f(dx * h)} ${f(dy * h)})` },
    }),
  });
export const CaretDownSpec = /* @__PURE__ */ withStatic(
  slide('CaretDown', 'M8,12 L24,12 L16,22 Z', 0, 4),
  /* @__PURE__ */ carbonArt(CaretDown32)
);
export const CaretUpSpec = /* @__PURE__ */ withStatic(
  slide('CaretUp', 'M24,20 L8,20 L16,10 Z', 0, -4),
  /* @__PURE__ */ carbonArt(CaretUp32)
);
export const CaretLeftSpec = /* @__PURE__ */ withStatic(
  slide('CaretLeft', 'M20,8 L20,24 L10,16 Z', -4, 0),
  /* @__PURE__ */ carbonArt(CaretLeft32)
);
export const CaretRightSpec = /* @__PURE__ */ withStatic(
  slide('CaretRight', 'M12,24 L12,8 L22,16 Z', 4, 0),
  /* @__PURE__ */ carbonArt(CaretRight32)
);
export const ChevronDownSpec = /* @__PURE__ */ withStatic(
  slide(
    'ChevronDown',
    'M7.4,10.6 L16,19.2 L24.6,10.6 L26,12 L16,22 L6,12 Z',
    0,
    4
  ),
  /* @__PURE__ */ carbonArt(ChevronDown16, ChevronDown32)
);
export const ChevronUpSpec = /* @__PURE__ */ withStatic(
  slide(
    'ChevronUp',
    'M24.6,21.4 L16,12.8 L7.4,21.4 L6,20 L16,10 L26,20 Z',
    0,
    -4
  ),
  /* @__PURE__ */ carbonArt(ChevronUp16, ChevronUp32)
);
export const ChevronLeftSpec = /* @__PURE__ */ withStatic(
  slide(
    'ChevronLeft',
    'M21.4,7.4 L12.8,16 L21.4,24.6 L20,26 L10,16 L20,6 Z',
    -4,
    0
  ),
  /* @__PURE__ */ carbonArt(ChevronLeft16, ChevronLeft32)
);
export const ChevronRightSpec = /* @__PURE__ */ withStatic(
  slide(
    'ChevronRight',
    'M10.6,24.6 L19.2,16 L10.6,7.4 L12,6 L22,16 L12,26 Z',
    4,
    0
  ),
  /* @__PURE__ */ carbonArt(ChevronRight16, ChevronRight32)
);

/** An arrow at a bar: the arrow reaches 2px toward it... */
/* @__NO_SIDE_EFFECTS__ */
const atBar = (
  name: string,
  glyph: (h: number) => string,
  bar: (h: number) => string
) =>
  hoverIcon(name, {
    geo: ({ h }) => ({ glyph: { d: glyph(h) }, bar: { d: bar(h) } }),
  });
export const PageFirstSpec = /* @__PURE__ */ withStatic(
  atBar(
    'PageFirst',
    morph(
      'M14 16 L24 6 L25.4 7.4 L16.8 16 L25.4 24.6 L24 26 Z',
      'M12 16 L22 6 L23.4 7.4 L14.8 16 L23.4 24.6 L22 26 Z'
    ),
    (h) => rect(8, 4 - 2 * h, 10, 28 + 2 * h)
  ),
  /* @__PURE__ */ carbonArt(PageFirst32)
);
export const PageLastSpec = /* @__PURE__ */ withStatic(
  atBar(
    'PageLast',
    morph(
      'M18 16 L8 26 L6.6 24.6 L15.2 16 L6.6 7.4 L8 6 Z',
      'M20 16 L10 26 L8.6 24.6 L17.2 16 L8.6 7.4 L10 6 Z'
    ),
    (h) => rect(22, 4 - 2 * h, 24, 28 + 2 * h)
  ),
  /* @__PURE__ */ carbonArt(PageLast32)
);
export const UpToTopSpec = /* @__PURE__ */ withStatic(
  atBar(
    'UpToTop',
    morph(
      'M16 14 6 24 7.4 25.4 16 16.8 24.6 25.4 26 24z',
      'M16 12 6 22 7.4 23.4 16 14.8 24.6 23.4 26 22z'
    ),
    (h) => rect(4 - 2 * h, 8, 28 + 2 * h, 10)
  ),
  /* @__PURE__ */ carbonArt(UpToTop32)
);
export const DownToBottomSpec = /* @__PURE__ */ withStatic(
  atBar(
    'DownToBottom',
    morph(
      'M16 18 6 8 7.4 6.6 16 15.2 24.6 6.6 26 8z',
      'M16 20 6 10 7.4 8.6 16 17.2 24.6 8.6 26 10z'
    ),
    (h) => rect(4 - 2 * h, 22, 28 + 2 * h, 24)
  ),
  /* @__PURE__ */ carbonArt(DownToBottom32)
);
