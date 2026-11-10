/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  box,
  closed,
  HiddenLines,
  isoAt,
  keyhole,
  type Layer,
} from '@carbon-labs/react-illustrations';

/* Line drawings of a path of tiles (illustrations/tiles.tsx): 404 a tile missing,
 * 403 a slab with a keyhole, custom a cracked tile. Placeholders. */

const iso = isoAt(296, 60);
const W = 22; // a tile's half extent on a and b
const T = 10; // a tile's thickness

/** The tiles' centres along b, back to front. */
const PATH = [0, 1, 2, 3, 4, 5].map((i) => -2 * W * i);

function layers(kind: 'custom' | '403' | '404'): Layer[] {
  const out: Layer[] = [];
  PATH.forEach((b, i) => {
    if (kind === '404' && i === 2) {
      const top = [
        iso(-W, b - W),
        iso(W, b - W),
        iso(W, b + W),
        iso(-W, b + W),
      ];
      out.push({ lines: [closed(top)], className: 'cds-fpe-art__missing' });
      return;
    }
    out.push(box(iso, [-W, W], [b - W, b + W], [-T, 0]));
    if (kind === 'custom' && i === 2) {
      const crack: [number, number][] = [
        [-16, b + 14],
        [-6, b + 4],
        [-9, b - 3],
        [3, b - 4],
        [6, b - 14],
        [16, b - 16],
      ];
      out.push({ lines: [crack.map(([a, bb]) => iso(a, bb))] });
    }
  });
  if (kind === '403') {
    // The slab: upright across the path where the third tile meets the fourth.
    const [b0, b1] = [PATH[2]! - W - 4, PATH[2]! - W + 4];
    out.push(box(iso, [-W, W], [b0, b1], [0, 50]));
    out.push({ lines: [keyhole((a, z) => iso(a, b0, z), 32, 5, 14, 2, 3.5)] });
  }
  return out;
}

export function FullPageErrorArt({ kind }: { kind: 'custom' | '403' | '404' }) {
  return (
    <svg
      className={`cds-fpe-art cds-fpe-art--${kind}`}
      viewBox="0 0 400 260"
      aria-hidden="true"
      focusable="false">
      <HiddenLines draw={layers} kind={kind} step={0.5} />
    </svg>
  );
}
