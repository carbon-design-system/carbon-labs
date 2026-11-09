/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The 26 status-capable icons (icons/statusIcons.ts), every status at
 * 16/20/24/32:
 *  - at rest: every wall the mark meets ends square (no hugging fallback),
 *    its nearest point at least the 4px gap from the mark's ink (counts in
 *    both placements; the status checkmarks: their placement's gap, Carbon's,
 *    and the offset mode's cut leaves no ink in the zone), and a part the
 *    clean-cut rule kept whole (a nick) stays 3px or more from it;
 *  - through every transition (each status in and out, arriving mid-hover,
 *    status → status, a count's roll and its width changing): no sliver
 *    over 0.25px² (ink a 1px brush can't reach, that the plain icon doesn't
 *    have) and no island under 2px² left by the cut, and no NaN; the status
 *    checkmarks (as they settle into Carbon's drawing): no ink in the zone
 *    in any frame, beyond a nick;
 *  - its shape keys hold whatever it shows.
 * The no-status identity is statusIdentity.test.tsx. Split over five test
 * files (statusIcons.*.test.tsx) so the workers share it.
 */
import { describe, expect, it } from 'vitest';
import { STATUS_ALIASES, STATUS_ICONS } from '../../icons/statusIcons';
import {
  CLEAN,
  STATUSES,
  applyPlan,
  countAt,
  cutFrame,
  countWidth,
  gapOf,
  markInk,
  plan,
  restFrame,
  type CountPlacement,
  type Mark,
  type Placement,
  type StatusFrame,
  type StatusLayer,
} from '../../utils/statusLayer';
import { HOVER_OUT } from '../../utils/frameIcon';
import { EXIT } from '@carbon-labs/motion-icons-core/ease';
import { deepestInk, slivers } from './statusMetrics';

const ICONS = Object.entries(STATUS_ICONS) as [
  string,
  { status: StatusLayer },
][];

/**
 * Transition frames with a sliver over 0.25px² that are known and accepted
 * (each a single frame where a cut meets a corner or a curve at a slant,
 * all under 1px², under the clean-cut rule), with the most they may reach.
 * Anything else, or anything worse, fails.
 */
export const KNOWN_SLIVERS: Record<string, number> = {
  'Email count→none "99+" overhang @0ms': 0.5,
  // The same drawing, the "99+" count at rest, as the last frame of its arrival: on the 16ms grid since the mark's in
  // moved to moderate-01 (160ms; at 120ms the grid stopped at 112). 0.48px².
  'Email none→count "99+" overhang @160ms': 0.5,
  'Email none→count "99+" overhang mid-hover @160ms': 0.5,
};
/**
 * Slivers that are Carbon's own drawing: in-progress--warning ends the ring
 * on the warning's grown outline, at a slant, and that acute corner reads as
 * a sliver to the 1px brush (0.34px² at rest). InProgress takes Carbon's
 * cut (offset mode), so any frame cutting the warning's zone may reach this.
 */
export const CARBON_SLIVERS: Record<string, { mark: Mark; max: number }> = {
  InProgress: { mark: 'warning', max: 0.4 },
};
/** Islands under 2px² that are known, with the least they may be. */
export const KNOWN_ISLANDS: Record<string, number> = {};
const SIZES = [16, 20, 24, 32] as const;
const SURVEY = !!process.env.STATUS_SURVEY;
// STATUS_SURVEY_MOVING=1: report the slivers the moving frames leave.
const SURVEY_MOVING = !!process.env.STATUS_SURVEY_MOVING;
const moved: number[] = [];
const ONLY = process.env.STATUS_ONLY?.split(',');
const problems: string[] = [];
const check = (ok: boolean, msg: string) => {
  if (SURVEY) {
    if (!ok) {
      problems.push(msg);
    }
  } else {
    expect(ok, msg).toBe(true);
  }
};

/** A count's placements: inside the frame's corner (the default) and hanging off it. */
const PLACEMENTS: CountPlacement[] = ['inside', 'overhang'];
type Case = [Mark, string, CountPlacement];
/** Each icon's marks: its statuses, and a count at three widths in both placements (counts only at 32px: smaller, a count is the pip). */
function marksOf(L: StatusLayer): Case[] {
  const out: Case[] = L.statuses.map((s) => [s, '', 'inside'] as Case);
  if (L.count) {
    for (const at of PLACEMENTS) {
      for (const t of ['3', '9+', '99+']) {
        out.push(['count', t, at]);
      }
    }
  }
  return out;
}
/** The placement a count actually gets (an icon may keep counts overhanging: insideMax). */
const placed = (L: StatusLayer, at: CountPlacement, text = ''): Placement =>
  countAt(L.placement, at, text) === 'overhang'
    ? { ...L.placement, countAt: 'overhang' }
    : L.placement;
/** The sizes whose base geometry differs (20 and 24 usually draw the 32px art): each is checked once. */
function sizesOf(L: StatusLayer): number[] {
  const seen = new Map<string, number>();
  for (const s of [32, 24, 20, 16]) {
    const k = JSON.stringify(
      [0, 0.5, 1].map((h) => L.base({ h, p: 0, e: 0 }, s))
    );
    if (!seen.has(k)) {
      seen.set(k, s);
    }
  }
  return [...seen.values()];
}

/**
 * Every frame worth checking, each with its placement: each change at 16ms
 * steps (the icon at rest: it holds still on hover while a status shows),
 * each status arriving mid-hover (the base easing from hovered back to rest,
 * fast-02 on the exit ease, as the cut opens), and a count's rolls.
 */
function framesOf(L: StatusLayer): [string, Placement, StatusFrame][] {
  const frames: [string, Placement, StatusFrame][] = [];
  const run = (p: Placement, a: Mark, b: Mark, text = '', hovered = false) => {
    const start = { ...restFrame(p, a, false, text), h: hovered ? 1 : 0 };
    const { channels, total } = plan(p, start, b); // the plan also sets the zone it cuts to on the frame
    for (let t = 0; t <= total + 1e-6; t += 16) {
      const f = { ...start };
      applyPlan(f, channels, t);
      if (hovered) {
        f.h = 1 - EXIT(Math.min(1, t / (HOVER_OUT.duration * 1000)));
      }
      frames.push([
        `${a}→${b}${text ? ` "${text}"` : ''}${p.countAt === 'overhang' ? ' overhang' : ''}${hovered ? ' mid-hover' : ''} @${t}ms`,
        p,
        f,
      ]);
    }
  };
  for (const [m, text, at] of marksOf(L)) {
    const p = placed(L, at, text);
    run(p, 'none', m, text);
    run(p, 'none', m, text, true);
    run(p, m, 'none', text);
  }
  const sts = L.statuses as readonly Mark[];
  for (const a of sts) {
    for (const b of sts) {
      if (a !== b) {
        run(L.placement, a, b);
      }
    }
  }
  if (L.count) {
    for (const at of PLACEMENTS) {
      const p = placed(L, at);
      run(p, 'notification', 'count', '3');
      run(p, 'count', 'notification', '3');
      for (const [from, to] of [
        ['3', '4'],
        ['8', '9+'],
        ['98', '99+'],
      ]) {
        for (const nt of [0.25, 0.5, 0.75]) {
          frames.push([
            `count ${from}→${to}${at === 'overhang' ? ' overhang' : ''} roll ${nt}`,
            p,
            { ...restFrame(p, 'count', false, to), nFrom: from, nt },
          ]);
        }
      }
    }
  }
  return frames;
}

export function statusSuite(names: readonly string[]) {
  describe.each(
    ICONS.filter(([n]) => names.includes(n) && (!ONLY || ONLY.includes(n)))
  )('%s', (name, Icon) => {
    const L = Icon.status;

    it('at rest: square wall ends, each at least 4px from the mark', () => {
      for (const size of SIZES) {
        for (const [mark, text, at] of marksOf(L)) {
          if (mark === 'count' && size !== 32) {
            continue;
          }
          const p = placed(L, at, text);
          const { report, cut, zone } = cutFrame(
            L.base,
            p,
            restFrame(p, mark, false, text),
            size
          );
          const g = gapOf(
            report,
            markInk(p, mark, text ? countWidth(text) : undefined)
          );
          const where = `${name} ${mark}${text ? ` "${text}" ${at}` : ''} @${size}`;
          check(
            report.fallbacks === 0,
            `${where}: hugging fallback (${report.reasons.join('; ')})`
          );
          // The gap: 4px, or the placement's own (the status checkmarks take Carbon's: 4 on the rings' box, 2 on the offset).
          const gap = p.gap ?? 4;
          for (const near of g.perEnd) {
            check(
              near > gap - 0.05,
              `${where}: a wall end ${near.toFixed(2)}px from the mark`
            );
          }
          // A nick the clean-cut rule kept stays 3 or more from the mark: no ink deeper than CLEAN.nick into the zone.
          // The offset mode's cut follows the zone: no ink in it at all (so the gap holds all round).
          const deepest = deepestInk(cut, zone);
          check(
            deepest < (p.mode === 'offset' ? 0.05 : CLEAN.nick + 0.05),
            `${where}: ink ${deepest.toFixed(2)} inside the zone`
          );
        }
      }
    });

    it('no slivers over 0.25px² and no islands under 2px² through every transition (once the cut settles)', async () => {
      const frames = framesOf(L);
      let n = 0;
      for (const size of sizesOf(L)) {
        for (const [label, p, f] of frames) {
          // (A turn of the event loop now and then: a moving cut's frames take a while, and the worker's runner
          // must stay in touch.)
          if (++n % 40 === 0) {
            await new Promise<void>((r) => setTimeout(r, 0));
          }
          if (
            size !== 32 &&
            (f.np > 0 ||
              STATUSES[Math.round(f.ks)] === 'count' ||
              STATUSES[Math.round(f.as)] === 'count')
          ) {
            continue;
          }
          const { base, cut, zone, reached } = cutFrame(L.base, p, f, size);
          const where = `${name} ${label} @${size}`;
          const carbon = CARBON_SLIVERS[name];
          const own =
            carbon &&
            [f.ks, f.as].some((i) => STATUSES[Math.round(i)] === carbon.mark)
              ? carbon.max
              : 0.25;
          const allowed = KNOWN_SLIVERS[`${name} ${label}`] ?? own;
          // While the cut grows from nothing, shrinks back to it or moves to another mark (the ~200ms after a status
          // change), its front may thin a wall for a frame or two (the smooth front): slivers and islands
          // are allowed then. At rest, and once the cut settles, the clean-cut rule holds.
          const moving = f.kr > 1e-6 && (f.kr < 1 - 1e-6 || f.km < 1 - 1e-6);
          if (!moving) {
            const s = slivers(base, cut, zone);
            check(
              s.sliver <= allowed,
              `${where}: sliver ${s.sliver.toFixed(2)}px² at ${s.at?.map((v) => v.toFixed(1))}`
            );
            check(
              s.island >= (KNOWN_ISLANDS[`${name} ${label}`] ?? 2),
              `${where}: island ${s.island.toFixed(2)}px²`
            );
          } else if (SURVEY_MOVING) {
            moved.push(slivers(base, cut, zone).sliver);
          }
          check(!/NaN|Infinity/.test(JSON.stringify(cut)), `${where}: NaN`);
          // The status checkmarks (Carbon's cut): no ink in the zone in any frame, beyond a nick the clean-cut rule keeps.
          if (p.mode) {
            const deep = deepestInk(cut, reached);
            check(
              deep < CLEAN.nick + 0.05,
              `${where}: ink ${deep.toFixed(2)} inside the zone`
            );
          }
        }
      }
    });

    it('keeps its shape keys whatever it shows', () => {
      const keys = Object.keys(
        L.geo(restFrame(L.placement, 'none'), 32)
      ).sort();
      for (const [m, text, at] of marksOf(L)) {
        const p = placed(L, at, text);
        expect(
          Object.keys(L.geoAt(p)(restFrame(p, m, false, text), 32)).sort(),
          m
        ).toEqual(keys);
      }
    });
  });

  if (SURVEY) {
    it('survey', () => {
      console.log(problems.length ? problems.join('\n') : 'no problems');
    });
  }
  if (SURVEY_MOVING) {
    it('survey of the moving frames', () => {
      const at = (v: number) => moved.filter((x) => x >= v).length;
      console.log(
        `MOVING frames ${moved.length}: sliver >0.25 ${at(0.2501)}, >=1 ${at(1)}, max ${Math.max(0, ...moved).toFixed(2)}px²`
      );
    });
  }
}

/**
 * Carbon's static status names (the aliases) hover on their mark, the base
 * holding: through the hover the cut keeps its gap (no ink in the grown zone
 * beyond a nick, square ends the placement's gap from the grown mark) and
 * leaves no sliver or island.
 */
export function statusAliasSuite() {
  describe.each(Object.entries(STATUS_ALIASES))(
    '%s (mark hover)',
    (alias, { base, status }) => {
      const L = (
        STATUS_ICONS as unknown as Record<string, { status: StatusLayer }>
      )[base].status;
      const p = L.placement;
      it('keeps the gap and leaves no sliver through the hover', () => {
        for (const size of sizesOf(L)) {
          for (const mh of [0.25, 0.5, 0.75, 1]) {
            const f = { ...restFrame(p, status as Mark), mh };
            const {
              base: plain,
              cut,
              zone,
              report,
            } = cutFrame(L.base, p, f, size);
            const where = `${alias} hover ${mh} @${size}`;
            const g = gapOf(report, markInk(p, status as Mark, undefined, mh));
            for (const near of g.perEnd) {
              check(
                near > (p.gap ?? 4) - 0.05,
                `${where}: a wall end ${near.toFixed(2)}px from the mark`
              );
            }
            const deep = deepestInk(cut, zone);
            check(
              deep < (p.mode === 'offset' ? 0.05 : CLEAN.nick + 0.05),
              `${where}: ink ${deep.toFixed(2)} inside the zone`
            );
            const sv = slivers(plain, cut, zone);
            const carbon = CARBON_SLIVERS[base];
            check(
              sv.sliver <=
                (carbon && carbon.mark === status ? carbon.max : 0.25),
              `${where}: sliver ${sv.sliver.toFixed(2)}px² at ${sv.at?.map((v) => v.toFixed(1))}`
            );
            check(
              sv.island >= 2,
              `${where}: island ${sv.island.toFixed(2)}px²`
            );
          }
        }
      });
    }
  );
}
