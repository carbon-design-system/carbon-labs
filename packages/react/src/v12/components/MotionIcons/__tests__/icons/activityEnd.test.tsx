/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Activity's status cut (statusFixes.ts, activity): the pulse ends square.
 * The sliver checks (statusSuite.ts) miss a step at least 1px thick, so here
 * every frame at rest and every frame between two marks is held to the line
 * cut square across itself: the cut pulse against the same polyline, 2px
 * wide with round joins, ending at its best-fitting length with a butt end
 * (within 0.3px²: the round marks graze the rising stroke at rest, 0.22).
 * Opening and closing are not held to it: those frames show the final cut
 * through the engine's growing box (cutFrame's smooth front).
 */
import { describe, expect, it } from 'vitest';
import { STATUS_ICONS } from '../../icons/statusIcons';
import {
  applyPlan,
  cutFrame,
  plan,
  restFrame,
  type Mark,
  type StatusFrame,
  type StatusLayer,
} from '../../utils/statusLayer';
import { raster, RES, setWindow } from './statusMetrics';

const L = (STATUS_ICONS as unknown as Record<string, { status: StatusLayer }>)
  .Activity.status;
const P = L.placement;
const MARKS: Mark[] = ['success', 'warning', 'error', 'pending'];
/** The pulse at rest (data-a.ts), and its length to each corner. */
const LINE: [number, number][] = [
  [2, 16],
  [7.04, 16],
  [12, 28.03],
  [21, 4.08],
  [24.98, 16],
  [30, 16],
];
const AT = LINE.map((_, i) =>
  LINE.slice(1, i + 1).reduce(
    (s, q, j) => s + Math.hypot(q[0] - LINE[j][0], q[1] - LINE[j][1]),
    0
  )
);

/** The pulse cut square `s` along it. */
function upTo(s: number) {
  const pts: [number, number][] = [LINE[0]];
  for (let i = 1; i < LINE.length; i++) {
    if (AT[i] <= s) {
      pts.push(LINE[i]);
      continue;
    }
    const t = (s - AT[i - 1]) / (AT[i] - AT[i - 1]);
    pts.push([
      LINE[i - 1][0] + (LINE[i][0] - LINE[i - 1][0]) * t,
      LINE[i - 1][1] + (LINE[i][1] - LINE[i - 1][1]) * t,
    ]);
    break;
  }
  return {
    pulse: {
      d: `M${pts.map((q) => q.join(' ')).join('L')}`,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
  };
}
const pulseOnly = (k: string) => k !== 'pulse';
/** How far the cut pulse is from the nearest square-cut pulse, in px² (32px units). */
function offSquare(f: StatusFrame, size: number): number {
  setWindow(-3, -3, 38);
  const got = raster(cutFrame(L.base, P, f, size).cut, pulseOnly);
  const off = (s: number) => {
    const want = raster(upTo(s) as never, pulseOnly);
    let d = 0;
    for (let i = 0; i < got.length; i++) if (got[i] !== want[i]) d++;
    return d / RES / RES;
  };
  // Coarse, then fine about the best.
  let [best, at] = [Infinity, AT[3]];
  for (let s = AT[3]; s <= AT[5] + 1e-9; s += 0.5) {
    const d = off(s);
    if (d < best) [best, at] = [d, s];
  }
  for (
    let s = Math.max(AT[3], at - 0.5);
    s <= Math.min(AT[5], at + 0.5) + 1e-9;
    s += 0.05
  )
    best = Math.min(best, off(s));
  return best;
}

describe.each([16, 32])('Activity: the pulse ends square @%i', (size) => {
  it('at rest with every mark', () => {
    const bad = MARKS.map(
      (m) => [m, offSquare(restFrame(P, m, false, ''), size)] as const
    ).filter(([, d]) => d > 0.3);
    expect(bad.map(([m, d]) => `${m}: ${d.toFixed(2)}px²`).join('\n')).toBe('');
  });
  // One test per change, so no single test holds the worker for long.
  for (const a of MARKS)
    for (const b of MARKS) {
      if (a === b) continue;
      it(`${a} → ${b}, every frame`, () => {
        const bad: string[] = [];
        const start = restFrame(P, a, false, '');
        const { channels, total } = plan(P, start, b);
        for (let t = 0; t <= total + 1e-6; t += 4) {
          const f = { ...start };
          applyPlan(f, channels, t);
          const d = offSquare(f, size);
          if (d > 0.3) bad.push(`@${t}ms: ${d.toFixed(2)}px²`);
        }
        expect(bad.join('\n')).toBe('');
      }, 60_000);
    }
});
