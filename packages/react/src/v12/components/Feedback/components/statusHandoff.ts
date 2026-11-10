/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DURATION_FLOOR_MS,
  durationStepForDistance,
  motionTokens,
  stepDown,
  type DurationToken,
  easingCss,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * The status hand-off: a loader (the kit's Spinner, a ProgressRing's ring)
 * becoming a status mark, out then in, with no fades, wherever a loader
 * turns into a success or error: the loader shrinks, the status disc grows
 * from 4px under its size, and the slash or check draws on.
 *
 *   out      the loader shrinks by 4px in diameter (`shrinkPx`), opaque, its
 *            line keeping its weight, and goes on turning. 4px, the kit's
 *            out and in: its outer edge lands where the
 *            disc starts (exactly at 16 and 32px; at 20 and 24px the disc
 *            is 0.5 and 1px larger than the ring, as the icons draw it).
 *            Begun while it is still arriving (a spinner's start, a ring's
 *            reveal), its lines snap to their final opacity: nothing fades;
 *            and a spinner still growing in from 60% shrinks from its live
 *            scale, or, early in its entrance, already inside the out's end,
 *            holds where it is (an out never grows). One step faster
 *            than the in (`stepDown` of its 2px edge travel's step):
 *            `fast-01`, exit-productive
 *   cut      the loader goes and the status disc takes its place on the same
 *            frame: never both, never neither
 *   in       the disc, opaque from its first frame, grows from 4px under its
 *            diameter (`growPx`) to its size, its glyph covered: the step
 *            for its edge's 2px travel, `fast-02`, entrance-productive
 *   draw     then the check or the slash draws on along its path, the way
 *            it's drawn (the check from its short arm, the slash from the top
 *            left): a cover over the glyph in the disc's colour retreats. The
 *            step for the path's length in px: `fast-02` at 16–32px (9–19px)
 *   reduced  the status at once, its glyph drawn: nothing shrinks or grows
 *   slow     every clock × the time scale
 *
 * Every loader that becomes a status calls these: `StatusMark` (pending → a
 * status, and a mark mounted `from="pending"`), so InlineLoading, the modal's
 * busy button and chat's StepList and TurnStatus; and `ProgressRing` (its
 * ring or spinner → finished or failed), so the file uploader.
 * ========================================================================== */

export const STATUS_HANDOFF = {
  /** The loader's shrink, px of diameter: the disc's 4px, so the loader lands where the disc starts. */
  shrinkPx: 4,
  /** The disc starts this many px under its diameter. */
  growPx: 4,
};

export interface HandoffMotion {
  timeScale: number;
  reduced: boolean;
}

const ms = (token: DurationToken, timeScale: number) =>
  Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * timeScale);
const curve = (name: 'entrance-productive' | 'exit-productive') =>
  easingCss(name);

/** The hand-off's three clocks (tokens), by travel: the out's edge travel, the disc's, and the glyph's path length (px). */
export function handoffSteps(drawPx: number): {
  out: DurationToken;
  grow: DurationToken;
  draw: DurationToken;
} {
  const grow = durationStepForDistance(STATUS_HANDOFF.growPx / 2);
  return {
    // Exits leave faster than entrances arrive.
    out: stepDown(durationStepForDistance(STATUS_HANDOFF.shrinkPx / 2)),
    grow,
    draw: durationStepForDistance(drawPx),
  };
}

/**
 * The out: the loader's svg shrinks by `shrinkPx` in diameter, opaque, its
 * line holding its weight. Returns its animations (held at the end), for the
 * host to wait on, turn round or cancel; none under reduced motion or without
 * Web Animations, and the host then cuts at once.
 */
export function playHandoffOut(
  loader: SVGSVGElement,
  { timeScale, reduced }: HandoffMotion
): Animation[] {
  if (reduced || typeof loader.animate !== 'function') {
    return [];
  }
  const box = loader.viewBox.baseVal;
  const unit = box && box.width ? loader.width.baseVal.value / box.width : 1;
  // The radius as drawn: a ring's line grows inward with its value, so its `r` is a property, not the attribute.
  const radius = (c: SVGCircleElement) =>
    parseFloat(getComputedStyle(c).r) || c.r.baseVal.value;
  const circles = [...loader.querySelectorAll('circle')].filter(
    (c) => radius(c) > 3
  );
  // The outer ring's centreline diameter, px: the line stays, so its edge moves by the scale alone.
  const centre = Math.max(0, ...circles.map(radius)) * 2 * unit;
  if (centre <= STATUS_HANDOFF.shrinkPx) {
    return [];
  }
  const s = (centre - STATUS_HANDOFF.shrinkPx) / centre;
  const opts: KeyframeAnimationOptions = {
    duration: ms(handoffSteps(0).out, timeScale),
    easing: curve('exit-productive'),
    fill: 'forwards',
  };
  // From the live scale: a spinner still growing in (its entrance, from 60%) shrinks from where it is, and one
  // still inside the out's end (early in its entrance) holds where it is: an out never grows.
  const live = parseFloat(getComputedStyle(loader).scale) || 1;
  const to = Math.min(live, s);
  // `scale`, not `transform`: a spinner's turn is its transform, and goes on.
  const anims = [
    loader.animate([{ scale: `${live}` }, { scale: `${to}` }], opts),
  ];
  // Every line opaque from the out's first frame: a spinner still in its start (its base fading up with
  // its draw) or a ring still arriving (its track fading up) snaps to its final opacity, so nothing fades
  // through the hand-off. Later in the composite order, this wins over the CSS and the arrival's own fade.
  for (const c of circles) {
    // The line at full size: an entrance in flight has it counter-scaled by its live scale.
    const w = (parseFloat(getComputedStyle(c).strokeWidth) || 0) * live;
    anims.push(
      c.animate(
        [
          { strokeWidth: `${w / live}`, opacity: 1 },
          { strokeWidth: `${w / to}`, opacity: 1 },
        ],
        opts
      )
    );
  }
  return anims;
}

export interface HandoffIn extends HandoffMotion {
  /** The disc's diameter at rest, px. */
  diameter: number;
  /** The glyph's path length, px (its draw's clock). */
  drawPx: number;
  /** The cover's length, in its own units (what its dash offset runs over). */
  coverLength: number;
}

/**
 * The in: the mark grows from `growPx` under its diameter, then the cover
 * over its glyph retreats along the glyph's path. The cover holds over the
 * glyph while the disc grows. Returns the animations (the draw last).
 */
export function playHandoffIn(
  mark: Element,
  cover: SVGPathElement | null,
  { diameter, drawPx, coverLength, timeScale, reduced }: HandoffIn
): Animation[] {
  if (
    reduced ||
    typeof mark.animate !== 'function' ||
    diameter <= STATUS_HANDOFF.growPx
  ) {
    return [];
  }
  const steps = handoffSteps(drawPx);
  const growMs = ms(steps.grow, timeScale);
  const anims = [
    mark.animate(
      [
        { scale: `${(diameter - STATUS_HANDOFF.growPx) / diameter}` },
        { scale: '1' },
      ],
      {
        duration: growMs,
        easing: curve('entrance-productive'),
      }
    ),
  ];
  if (cover) {
    anims.push(
      cover.animate(
        [{ strokeDashoffset: '0' }, { strokeDashoffset: `${-coverLength}` }],
        {
          duration: ms(steps.draw, timeScale),
          delay: growMs,
          easing: curve('entrance-productive'),
          fill: 'both',
        }
      )
    );
  }
  return anims;
}
