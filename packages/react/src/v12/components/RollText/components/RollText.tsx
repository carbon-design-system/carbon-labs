/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef } from 'react';
import { motionTokens, toEasing, cubicBezier } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { rollParts, type RollPart } from './rollParts';
import './roll-text.scss';

/* ============================================================================
 * RollText — a short text that rolls to its next value, in and out through
 * clips as big number counter does. A component behavior of its own: any value that
 * steps through a list (a slider's step, a status word, a count's label).
 * ============================================================================
 *
 *   only what  when the text changes by a few characters, only those
 *   changed    characters move, not the whole word. The
 *              characters the old and new text share stay still, and each
 *              part that differs rolls in a window of its own: change →
 *              changes rolls in the "s"; 1 item → 2 items rolls 1 → 2 and
 *              brings in the "s", " item" still; 12 → 13 rolls the 2. Which
 *              parts stay is `rollParts` (rollParts.ts): word by word, part of
 *              the text stays only when every change is an inflection (a word
 *              gains or loses an ending, exactly, case included: item → items,
 *              start → started), a number (its figures stay by place only with
 *              as many digits) or words only added or removed. Anything else
 *              is a conceptual change and rolls the whole text: a negation
 *              added or removed (1 item selected → 1 item not selected), any
 *              other word swapped (Selected → Unselected, on → off, Low →
 *              High, Agree → agree). At least half the text must stay or the
 *              whole text rolls
 *   in, out    a character only added (or only removed) rolls in (or out)
 *              through its own window, which opens from nothing (or closes to
 *              nothing): the same roll, direction, blur and clock as any other
 *              part, so the change is one motion. The window opens before the
 *              text arrives and closes after it has left (below), so it is
 *              out, then in, in space as in time. What follows the window
 *              slides along with its width, on the same clock
 *   clip       each part that changes sits in a window its own size; the old
 *              text leaves through one edge as the new one enters through the
 *              other, both on one strip, a gap apart (a quarter line; Big
 *              Number Counter's reel pitch), so they never touch mid-roll
 *   direction  `vertical` (default): a rise rolls up (the new text enters from
 *              below), a fall rolls down. `horizontal`, left and right: a rise
 *              moves left (the new text enters from the right), a fall right
 *   blur       while it moves, a motion blur along the roll, not a soft edge:
 *              vertical for up and down, horizontal for left and right. An SVG
 *              Gaussian on one axis (`stdDeviation="0 N"`; CSS `blur()` is
 *              round), two strengths (0.6, 1.4px) defined once in the page and
 *              stepped through on the moving texts' `filter` with the roll's
 *              speed: none, light, strong at the middle (where the ease is
 *              fastest), light, none. At rest there is no filter at all, so
 *              the glyphs are crisp and nothing is filtered; a roll that
 *              interrupts one already moving starts strong and settles. The
 *              window clips with a hard edge (the blur softens what crosses
 *              it)
 *   timing     big number counter's productive reel: moderate-01 (160ms) on the
 *              productive standard ease; a roll that interrupts one already
 *              moving carries on at speed, on the productive entrance ease.
 *              Every window, and its size, runs on that one clock: a window
 *              grows in the first 40% (the arriving text has room) and shrinks
 *              in the last 40% (the leaving text is mostly out)
 *   interrupt  a new value mid-roll carries on from where the text is, never
 *              leaving a window empty, even on quick big jumps. If the new
 *              change keeps the same still parts (10%
 *              → 20% → 30%, the "0%" still), each window carries on by the
 *              rule below. If not, the text as it is on screen leaves as a
 *              whole and the new text rolls in whole, and the text keeps
 *              rolling whole until it lands. The rule in a window: going the
 *              same way, if the arriving text is still in the first half of
 *              its travel, the new value takes its place there and carries on
 *              in on the rest of the clock (no new text queues behind it), and
 *              the text leaving is retimed to that clock, so the two stay a
 *              pitch apart; once it is more than halfway in, it leaves as the
 *              new one comes in a gap behind it. So a fast drag through many
 *              steps is one steady roll whose label keeps updating, with at
 *              most two texts on the strip, always a pitch apart: the window is
 *              never less than about three quarters full (measured).
 *              Turning round, the arriving text leaves the way it
 *              came
 *   rest       once it lands, the text is one plain run again (the windows go)
 *   reduced    the text swaps in place
 *
 * `tone="ai"` takes the AI color (IBM blue), and the text leaving keeps the
 * tone it came with. A change of tone rolls the whole text (it's a different kind
 * of value).
 *
 * The text is drawn by the component itself (React renders the empty host),
 * so a change can split it, roll its parts and join it again in place.
 * ========================================================================== */

// Read when used, so a token draft reaches them.
const rollMs = () => motionTokens.duration['moderate-01'];
const curve = (name: 'standard' | 'entrance') =>
  cubicBezier(toEasing({ name, mode: 'productive' }));
/** The gap between the two texts on the strip, as a share of the line (big number counter's `PITCH_GAP`). */
const PITCH_GAP = 0.25;

/** The motion blur's filters: one axis each, two strengths (px), defined once per page. */
const BLUR = [0.6, 1.4];
const FILTERS_ID = 'cds-roll-blur';
function ensureBlurFilters() {
  if (typeof document === 'undefined' || document.getElementById(FILTERS_ID))
    return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.id = FILTERS_ID;
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  for (const axis of ['y', 'x'] as const) {
    BLUR.forEach((n, i) => {
      const f = document.createElementNS(ns, 'filter');
      f.id = `${FILTERS_ID}-${axis}${i + 1}`;
      // Room for the blur along its axis.
      const box =
        axis === 'y'
          ? { x: '0', y: '-50%', width: '100%', height: '200%' }
          : { x: '-25%', y: '0', width: '150%', height: '100%' };
      for (const [k, v] of Object.entries(box)) f.setAttribute(k, v);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const g = document.createElementNS(ns, 'feGaussianBlur');
      g.setAttribute('stdDeviation', axis === 'y' ? `0 ${n}` : `${n} 0`);
      f.appendChild(g);
      svg.appendChild(f);
    });
  }
  document.body.appendChild(svg);
}
/** The blur's steps over a roll: with the standard ease (fastest mid-roll), or the entrance ease (fastest at the start). */
const blurFrames = (axis: 'x' | 'y', entrance: boolean): Keyframe[] => {
  const f = (i: 0 | 1 | 2, offset: number) => ({
    filter: i ? `url(#${FILTERS_ID}-${axis}${i})` : 'none',
    offset,
  });
  return entrance
    ? [f(2, 0), f(2, 0.35), f(1, 0.65), f(0, 1)]
    : [f(0, 0), f(1, 0.12), f(2, 0.3), f(2, 0.62), f(1, 0.82), f(0, 1)];
};

/** A window a changing part rolls in: its text now, the text leaving, the roll in flight (its direction and the strip's pitch), and its width as last laid out. */
interface Win {
  el: HTMLSpanElement;
  cur: HTMLSpanElement;
  ghost: HTMLSpanElement | null;
  roll: { dir: number; pitch: number } | null;
  w: number;
}

/** The text mid-change: its parts and the windows of those that change. */
interface Line {
  parts: RollPart[];
  wins: Win[];
}

/** A roll's settings, shared by every window of one change. */
interface Roll {
  dir: number;
  ms: number;
  across: boolean;
  tone: string | undefined;
  /** It carries on a motion already under way (the text as it is on screen, leaving as a whole). */
  moving: boolean;
  /** Called as each motion ends: the text joins up once nothing moves. */
  settle: () => void;
}

const span = (className: string, text: string | Node, tone?: string) => {
  const s = document.createElement('span');
  s.className = className;
  s.append(text);
  if (tone) s.dataset.tone = tone;
  return s;
};

/** The still parts' shape: their texts in order, and where the windows are. */
const shape = (parts: RollPart[]) =>
  parts.map((p) => ('still' in p ? p.still : null)).join('\u0000|');

/**
 * A copy of the text as it is on screen right now: each moving part held where it is, at its
 * width and blur, so it can leave as a whole.
 */
function freeze(host: HTMLElement) {
  const copy = span('cds-roll__frozen', '');
  const hold = (from: Element, to: Element) => {
    if (from.getAnimations().length && to instanceof HTMLElement) {
      const s = getComputedStyle(from);
      to.style.transform = s.transform;
      to.style.width = s.width;
      to.style.filter = s.filter;
    }
    Array.from(from.children).forEach((c, i) => hold(c, to.children[i]));
  };
  for (const child of Array.from(host.children)) {
    const c = child.cloneNode(true) as Element;
    hold(child, c);
    copy.append(c);
  }
  return copy;
}

/** Rolls one window to its next text (`to`), from wherever it is. */
function rollWindow(win: Win, to: string, r: Roll) {
  const { el: h, cur: c } = win;
  const { across, dir, ms } = r;
  // Where the text now in the window is (mid-roll if a roll is running), and the window's width now.
  const m = new DOMMatrixReadOnly(getComputedStyle(c).transform);
  const from = across ? m.m41 : m.m42;
  // (A horizontal window at an end of the text has room on its outer side: its content width is the text's.)
  const hs = getComputedStyle(h);
  const room = across
    ? parseFloat(hs.paddingLeft) + parseFloat(hs.paddingRight)
    : 0;
  const fromW = h.getAnimations().length
    ? h.getBoundingClientRect().width - room
    : win.w;
  const rolling = win.roll !== null && c.getAnimations().length > 0;
  // A fresh roll eases in and out (standard); one that interrupts a roll is already moving, so
  // it carries on at speed (entrance: no ease-in), or each new value would stall the text.
  const running = rolling || r.moving;
  const easing = curve(running ? 'entrance' : 'standard');
  const translate = (v: number) =>
    across ? `translateX(${v}px)` : `translateY(${v}px)`;
  // The motion blur along the roll, on the moving texts, with their speed.
  const blur = (el: Element, duration: number, entrance: boolean) =>
    el.animate(blurFrames(across ? 'x' : 'y', entrance), { duration });
  const leave = (
    g: HTMLSpanElement,
    frames: Keyframe[],
    duration: number,
    entrance: boolean
  ) => {
    const out = g.animate(frames, { duration, easing, fill: 'forwards' });
    out.onfinish = () => {
      g.remove();
      if (win.ghost === g) win.ghost = null;
      r.settle();
    };
    blur(g, duration, entrance);
  };

  if (
    rolling &&
    win.roll!.dir === dir &&
    Math.abs(from) > win.roll!.pitch / 2
  ) {
    // Still in the first half of its travel: the new value takes its place and carries on in,
    // and the text leaving is retimed to the same clock, so the two stay a pitch apart and the
    // window always holds one or both (on its own clock the leaving text would go early and
    // leave the window empty on fast runs).
    const pitch = win.roll!.pitch;
    c.textContent = to;
    if (r.tone) c.dataset.tone = r.tone;
    const toW = c.getBoundingClientRect().width;
    win.w = toW;
    for (const a of c.getAnimations()) a.cancel();
    for (const a of h.getAnimations()) a.cancel();
    const rest = (Math.abs(from) / pitch) * ms;
    c.animate([{ transform: translate(from) }, { transform: translate(0) }], {
      duration: rest,
      easing,
    }).onfinish = r.settle;
    h.animate([{ width: `${fromW}px` }, { width: `${toW}px` }], {
      duration: rest,
      easing,
    });
    blur(c, rest, true);
    const g = win.ghost;
    if (g) {
      for (const a of g.getAnimations()) a.cancel();
      leave(
        g,
        [
          { transform: translate(from - dir * pitch) },
          { transform: translate(-dir * pitch) },
        ],
        rest,
        true
      );
    }
    return;
  }

  for (const a of c.getAnimations()) a.cancel();
  for (const a of h.getAnimations()) a.cancel();
  win.ghost?.remove();

  // The text leaving moves out of the window's text into a ghost (keeping its tone); the new text takes its place.
  const g = span('cds-roll__ghost', '', c.dataset.tone);
  g.append(...Array.from(c.childNodes));
  g.setAttribute('aria-hidden', 'true');
  h.appendChild(g);
  win.ghost = g;
  c.textContent = to;
  if (r.tone) c.dataset.tone = r.tone;
  else delete c.dataset.tone;
  const toW = c.getBoundingClientRect().width;
  win.w = toW;

  const pitch = across
    ? Math.max(fromW, toW) + c.offsetHeight * PITCH_GAP
    : c.offsetHeight * (1 + PITCH_GAP);
  win.roll = { dir, pitch };
  // The leaving text goes out through the far edge (a pitch past it) from wherever it is; the
  // new one starts a pitch behind it, so the two travel the same distance, a gap apart, in step.
  leave(
    g,
    [{ transform: translate(from) }, { transform: translate(-dir * pitch) }],
    ms,
    running
  );
  const inn = c.animate(
    [{ transform: translate(from + dir * pitch) }, { transform: translate(0) }],
    { duration: ms, easing }
  );
  inn.onfinish = () => {
    if (c.getAnimations().length === 0) win.roll = null;
    r.settle();
  };
  blur(c, ms, running);
  // The window grows early (the arriving text has room as it comes in) and shrinks late (the
  // leaving text is mostly out before its edge closes in), so neither is cropped mid-roll.
  if (Math.abs(toW - fromW) > 0.5) {
    const frames =
      toW > fromW
        ? [
            { width: `${fromW}px` },
            { width: `${toW}px`, offset: 0.4 },
            { width: `${toW}px` },
          ]
        : [
            { width: `${fromW}px` },
            { width: `${fromW}px`, offset: 0.6 },
            { width: `${toW}px` },
          ];
    h.animate(frames, { duration: ms, easing }).onfinish = r.settle;
  }
}

export interface RollTextProps {
  text: string;
  /** The value's order (a step's index): a rise rolls up (or left), a fall rolls down (or right). */
  order: number;
  tone?: 'ai';
  /** `vertical` (default) or `horizontal`. */
  direction?: 'vertical' | 'horizontal';
  /** Multiplies the duration (slow motion). */
  timeScale?: number;
  className?: string;
}

export function RollText({
  text,
  order,
  tone,
  direction = 'vertical',
  timeScale = 1,
  className,
}: RollTextProps) {
  const host = useRef<HTMLSpanElement>(null);
  const prev = useRef({ text, order, tone });
  /** The text mid-change (null at rest, when it is one plain run). */
  const line = useRef<Line | null>(null);
  const reduced = usePrefersReducedMotion();
  const across = direction === 'horizontal';

  useLayoutEffect(() => {
    if (!reduced) ensureBlurFilters();
  }, [reduced]);

  useLayoutEffect(() => {
    const h = host.current;
    if (!h) return;
    const p = prev.current;
    prev.current = { text, order, tone };
    // At rest: one plain run of the text as it is now.
    const rest = () => {
      // Only a change in flight has motion to stop; asking otherwise (each
      // mount) costs a style pass of the page.
      if (line.current)
        for (const a of h.getAnimations({ subtree: true })) a.cancel();
      h.replaceChildren(
        span('cds-roll__still', prev.current.text, prev.current.tone)
      );
      line.current = null;
    };
    if (reduced || (p.text === text && !line.current)) {
      rest();
      return;
    }
    if (p.text === text) return;

    const r: Roll = {
      dir: order >= p.order ? 1 : -1,
      ms: rollMs() * timeScale,
      across,
      tone,
      moving: false,
      settle: () => {
        if (host.current !== h || line.current === null) return;
        if (
          h
            .getAnimations({ subtree: true })
            .some((a) => a.playState === 'running')
        )
          return;
        rest();
      },
    };
    const whole: RollPart[] = [{ from: p.text, to: text }];
    const now = line.current;
    // Rolling as a whole, it stays whole until it lands; a change of tone rolls whole.
    const wholeNow =
      now !== null && now.parts.length === 1 && 'from' in now.parts[0];
    const parts = wholeNow || p.tone !== tone ? whole : rollParts(p.text, text);

    if (now && shape(now.parts) === shape(parts)) {
      // Mid-change, with the same still parts: each window carries on from where it is.
      // (A window already on its way to its text carries on as it is.)
      let i = 0;
      for (const part of parts) {
        if (!('to' in part)) continue;
        const win = now.wins[i++];
        if (win.cur.textContent !== part.to) rollWindow(win, part.to, r);
      }
      now.parts = parts;
      return;
    }

    // A fresh change: the still parts as they are, and a window for each part that changes,
    // holding its old text until it rolls. Mid-change with other still parts, the text as it is
    // on screen leaves as a whole.
    const next = now ? whole : parts;
    const frozen = now ? freeze(h) : null;
    r.moving = frozen !== null;
    const frozenW = now ? h.getBoundingClientRect().width : 0;
    for (const a of h.getAnimations({ subtree: true })) a.cancel();
    const wins: Win[] = [];
    h.replaceChildren(
      ...next.map((part) => {
        if ('still' in part) return span('cds-roll__still', part.still, tone);
        const cur = span('cds-roll__cur', frozen ?? part.from, p.tone);
        const win: Win = {
          el: span('cds-roll__win', cur),
          cur,
          ghost: null,
          roll: null,
          w: 0,
        };
        wins.push(win);
        return win.el;
      })
    );
    for (const win of wins)
      win.w = frozen ? frozenW : win.cur.getBoundingClientRect().width;
    line.current = { parts: next, wins };
    let i = 0;
    for (const part of next)
      if ('to' in part) rollWindow(wins[i++], part.to, r);
  }, [text, order, tone, reduced, timeScale, across]);

  return (
    <span
      ref={host}
      className={['cds-roll', across && 'cds-roll--horizontal', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
