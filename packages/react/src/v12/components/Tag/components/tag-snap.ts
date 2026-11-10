/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DURATION_FLOOR_MS,
  SNAP,
  motionTokens,
  snapDurationMs,
  snapEaseCss,
  snapFadeFor,
  staggerSteps,
  type DurationToken,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * The tags' snap, from below: a tag grows a few px into place, 2px at sm and
 * md, 3px at lg. One helper for every tag that arrives or leaves: the
 * Tag (`show`, `arrive`), the DismissibleTag on it, and TagSet's reflow and
 * dismissal.
 *
 *   in       from `tagSnapScale` (below 1) up to 1 from its own center,
 *            on `TAG_SNAP_IN` (moderate-01, 160ms) with entrance-productive,
 *            fading up over the first 40ms (`snapFadeFor`)
 *   out      one step faster (`TAG_SNAP_OUT`, fast-02, exit-productive), back
 *            down to the same scale; fading out over the last 40ms; an
 *            optional delay staggers a group leaving together
 *   fade     the fade standard: 40ms at 220ms or less, so 40ms in and out
 *   turn     from where it is (scale and opacity as drawn), on the share of
 *            the clock its travel leaves
 *   reduced  callers don't call it: in and out at once
 *
 * The scale, by size, set in px: the height it starts at, over its height.
 *
 *   sm  18px  16/18 (0.8889)   from 16px, 1px in each edge
 *   md  20px  18/20 (0.9)      from 18px, 1px in each edge
 *   lg  32px  29/32 (0.90625)  from 29px, 1.5px in each edge
 *
 * The mark's curve (entrance-productive); `TAG_SNAP_IN` is one step up from
 * the mark's `fast-02` so the 2–3px travel reads at a comfortable pace.
 * ========================================================================== */

export type TagSnapSize = 'sm' | 'md' | 'lg';

/** A tag's height by size, px. */
const TAG_HEIGHT_PX: Record<TagSnapSize, number> = { sm: 18, md: 20, lg: 32 };

/** How much shorter a tag starts its snap, px: sm and md 2px, lg 3px. */
const TAG_SNAP_INSET_PX: Record<TagSnapSize, number> = { sm: 2, md: 2, lg: 3 };

/** The scale a tag snaps in from and out to, by its size: 16/18 (sm), 18/20 (md), 29/32 (lg). */
export const TAG_SNAP_SCALE: Record<TagSnapSize, number> = {
  sm: (TAG_HEIGHT_PX.sm - TAG_SNAP_INSET_PX.sm) / TAG_HEIGHT_PX.sm,
  md: (TAG_HEIGHT_PX.md - TAG_SNAP_INSET_PX.md) / TAG_HEIGHT_PX.md,
  lg: (TAG_HEIGHT_PX.lg - TAG_SNAP_INSET_PX.lg) / TAG_HEIGHT_PX.lg,
};

/** The in clock: one step up from the mark's `fast-02` so the 2–3px travel reads. */
const TAG_SNAP_IN: DurationToken = 'moderate-01';
/** The out clock: one step faster than `TAG_SNAP_IN`. */
const TAG_SNAP_OUT: DurationToken = 'fast-02';
/** Stagger step for a group leaving together (ms, unscaled): stagger-step-02. */
export const TAG_STAGGER_MS = staggerSteps['02'];

/** The scale for `el`, by its size class (`cds-tag--sm|md|lg`); md otherwise (the "+N"). */
function tagSnapScale(el: Element): number {
  for (const s of ['sm', 'lg'] as const) {
    if (el.classList.contains(`cds-tag--${s}`)) {
      return TAG_SNAP_SCALE[s];
    }
  }
  return TAG_SNAP_SCALE.md;
}

/** The tag as drawn now (mid-snap, or at rest): its scale and opacity. */
export function tagDrawn(el: Element): { scale: number; opacity: number } {
  const cs = getComputedStyle(el);
  const scale =
    cs.transform && cs.transform !== 'none'
      ? new DOMMatrixReadOnly(cs.transform).a
      : 1;
  const opacity = parseFloat(cs.opacity);
  return { scale, opacity: Number.isFinite(opacity) ? opacity : 1 };
}

/** The share of the travel (between 1 and `S`) still ahead of a tag at `scale` going `to` (1 or `S`). */
function travelLeft(scale: number, to: number, s: number): number {
  const span = Math.abs(s - 1);
  return span > 0 ? Math.min(1, Math.max(0, Math.abs(to - scale) / span)) : 1;
}

/** The containers' fade for a clock of `clockMs` (unscaled), scaled, never longer than the clock. */
function fadeMs(clockMs: number, timeScale: number): number {
  return (
    Math.min(motionTokens.duration[snapFadeFor(clockMs)], clockMs) * timeScale
  );
}

export interface TagSnapOptions {
  /** Slow motion. Default 1. */
  timeScale?: number;
  /** Wait this long (ms, already scaled): unseen before an in, at rest before an out. */
  delay?: number;
  /** Where it is now (a turn): its scale and opacity as drawn. Default at rest (in: the scale, transparent; out: 1, opaque). */
  from?: { scale: number; opacity: number };
}

/** A tag's snap in: from a few px below its size up to 1, fading up over the first 40ms.
 *  Returns [the scale, the fade]; the scale's clock is the whole motion. */
export function tagSnapIn(
  el: HTMLElement,
  o: TagSnapOptions = {}
): [Animation, Animation] {
  const ts = o.timeScale ?? 1;
  const s = tagSnapScale(el);
  const from = o.from ?? { scale: s, opacity: 0 };
  const clock = snapDurationMs(TAG_SNAP_IN);
  const delay = o.delay ?? 0;
  const scale = el.animate(
    [{ transform: `scale(${from.scale})` }, { transform: 'scale(1)' }],
    {
      duration: Math.max(
        DURATION_FLOOR_MS,
        clock * ts * travelLeft(from.scale, 1, s)
      ),
      delay,
      easing: snapEaseCss(SNAP.mark.ease),
      fill: 'backwards',
    }
  );
  const fade = el.animate([{ opacity: from.opacity }, { opacity: 1 }], {
    duration: Math.max(
      DURATION_FLOOR_MS,
      fadeMs(clock, ts) * (1 - from.opacity)
    ),
    delay,
    easing: 'linear',
    fill: 'backwards',
  });
  return [scale, fade];
}

/** A tag's snap out: back down to the scale it came from, fading over the last 40ms, held at the
 *  end for the caller to remove. Returns [the scale, the fade], both on the whole clock. */
export function tagSnapOut(
  el: HTMLElement,
  o: TagSnapOptions = {}
): [Animation, Animation] {
  const ts = o.timeScale ?? 1;
  const s = tagSnapScale(el);
  const from = o.from ?? { scale: 1, opacity: 1 };
  const delay = o.delay ?? 0;
  const clock = snapDurationMs(TAG_SNAP_OUT);
  const ms = Math.max(
    DURATION_FLOOR_MS,
    clock * ts * travelLeft(from.scale, s, s)
  );
  const scale = el.animate(
    [{ transform: `scale(${from.scale})` }, { transform: `scale(${s})` }],
    {
      duration: ms,
      delay,
      easing: snapEaseCss('exit-productive'),
      fill: 'both',
    }
  );
  // Held, then out over the last part (less, from partway up).
  const tail = Math.min(ms, fadeMs(clock, ts) * from.opacity);
  const hold = ms > 0 ? 1 - tail / ms : 0;
  const fade = el.animate(
    hold > 0
      ? [
          { opacity: from.opacity, offset: 0 },
          { opacity: from.opacity, offset: hold },
          { opacity: 0, offset: 1 },
        ]
      : [{ opacity: from.opacity }, { opacity: 0 }],
    { duration: ms, delay, easing: 'linear', fill: 'both' }
  );
  return [scale, fade];
}
