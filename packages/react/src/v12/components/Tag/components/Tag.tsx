/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createStillness, type StillnessMember } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { TAG_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { tagDrawn, tagSnapIn, tagSnapOut } from './tag-snap';
import './tag.scss';

/* ============================================================================
 * Tag — a short read-only label: a status, a kind, a count. Carbon v11's
 * read-only Tag.
 *
 *   type     v11's colors on v11's tag tokens: `red` · `magenta` · `purple` ·
 *            `blue` · `cyan` · `teal` · `green` · `cool-gray` · `warm-gray` ·
 *            `high-contrast`; and the kit's status pills: `gray`
 *            (default, the quiet layer fill) · `success` · `warning` ·
 *            `outline`. Status reads from the fill: a solid support color
 *            means "this is settled", the outline means "this is a draft"
 *   size     `sm` (18px) · `md` (20px, default; v11's is 24px) · `lg` (32px);
 *            the text 8px in at sm, 10px at md, 16px at lg, clear of the curve
 *   corners  `full` (the pill, default) · `rounded` (2px) · `square`, each with
 *            its own inset. With no curve
 *            to clear, the text sits closer: 6px in at sm and md, 8px at lg
 *   motion   it never answers the pointer: a tag is content, not a control
 *            (principle 5). It does arrive:
 *   in       a tag that appears in UI already on screen (a "Changed" tag
 *            after an edit) snaps in from below, 2px smaller at sm and md,
 *            3px at lg: from 16/18 (sm), 18/20 (md) or 29/32 (lg) up to full
 *            from its own center, on `TAG_SNAP_IN` (moderate-01, 160ms) with
 *            entrance-productive, fading up over its first 40ms (`tag-snap.ts`).
 *            `arrive`: `auto` (default) snaps it when it arrives on its own
 *            — the commit added the tag (or a bare wrapper), not a page, card
 *            or list it came with, so it doesn't move on first paint; `true`
 *            always, `false` never
 *   still    a tag is a mark, on the stillness standard (motion-core's
 *            `createStillness`): only the first of a run moves. The run is
 *            warm while a tag's snap (in or out) plays and for
 *            `STILLNESS.windowMs` (400ms, times the slow motion) after the
 *            last one ends; a tag appearing then, on a later frame, is simply
 *            there, and keeps the run warm for the window. Tags appearing on
 *            the same frame snap together
 *   out      `show={false}` holds it while it snaps out (`TAG_SNAP_OUT`,
 *            fast-02, exit-productive), down to the same scale, fading out
 *            over its last 40ms, then it's gone. Unmounted, it goes at once
 *   turn     shown again mid-exit (or hidden mid-arrival), it turns round
 *            from where it is: from its scale and opacity as drawn, on the
 *            share of the clock its travel leaves
 *   reduced  no snap: in and out at once
 * ========================================================================== */

export type TagType =
  | 'red'
  | 'magenta'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'gray'
  | 'cool-gray'
  | 'warm-gray'
  | 'high-contrast'
  | 'outline'
  | 'success'
  | 'warning';

export type TagSize = 'sm' | 'md' | 'lg';

/**
 * `full`: the pill (default). `rounded`: 2px. `square`: none. As on every
 * component, `rounded` is the component's own radius: 8px on most, 2px on a
 * tag.
 */
export type TagCorners = 'full' | 'rounded' | 'square';

/** The tags' run (stillness): warm while a tag's snap plays, and for the window after the last one ends. */
const TAGS = createStillness();
/** Tags appearing within one frame of each other are one arrival. */
const SAME_FRAME_MS = 20;
let lastSnapAt = -Infinity;

/* What the last commit added to the page, from one MutationObserver on the
   document: a tag decides after the commit (in a microtask, after the
   observer's) whether it was added on its own, into UI already on screen,
   or came inside something bigger (a page, a card, a list).

   The observer runs only while a tag that arrives on its own (`arrive`
   `auto`) is on the page. It starts when such a tag renders, before the
   commit that inserts it, so it sees that commit: the first tag shown alone
   snaps in too. Each mounted tag holds it; the last one to go disconnects it
   (in a microtask, so a tag replaced by another in one commit keeps it). A
   render that never commits holds nothing: the observer stops again after
   `UNHELD_MS` if no tag took hold. */
let inserted = new WeakSet<Element>();
let observer: MutationObserver | null = null;
let holders = 0;
const UNHELD_MS = 1000;
function stopIfUnheld() {
  if (holders > 0 || !observer) return;
  observer.disconnect();
  observer = null;
  inserted = new WeakSet();
}
/** Starts the watcher (at render, so before the commit; idempotent). */
function startWatching() {
  if (
    observer ||
    typeof MutationObserver === 'undefined' ||
    typeof document === 'undefined'
  )
    return;
  observer = new MutationObserver((records) => {
    inserted = new WeakSet();
    for (const r of records)
      for (const n of r.addedNodes) if (n instanceof Element) inserted.add(n);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(stopIfUnheld, UNHELD_MS);
}
/** A mounted tag's hold on the watcher; the returned release lets it go. */
function holdWatching(): () => void {
  holders++;
  return () => {
    holders--;
    queueMicrotask(stopIfUnheld);
  };
}

/**
 * Whether `tag` arrived on its own: the subtree the last commit added is the
 * tag, or a chain of wrappers with nothing else in them. Linear in the tag's
 * depth: it climbs only while each parent holds just the one element.
 */
function arrivedAlone(tag: Element): boolean {
  if (inserted.has(tag)) return true;
  for (let n = tag.parentElement; n; n = n.parentElement) {
    if (n.childElementCount !== 1) return false;
    if (inserted.has(n)) return true;
  }
  return false;
}

/** Stillness: a tag snaps in unless the run is warm (tags on one frame move together). */
function firstOfRun(): boolean {
  const now = performance.now();
  if (now - lastSnapAt <= SAME_FRAME_MS) return true;
  if (TAGS.warm()) return false;
  lastSnapAt = now;
  return true;
}

/**
 * One tag in the run: on screen while `motion` plays (none: an arrival that
 * was simply there), then gone, the run warm for the window from then.
 */
function joinRun(motion: Animation | null, timeScale: number) {
  const m: StillnessMember = { warms: () => true, kill: () => {} };
  TAGS.claim(m, false);
  const end = () => {
    TAGS.leave(m, timeScale);
    TAGS.gone(m);
  };
  if (motion) motion.finished.then(end, end);
  else end();
}

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  type?: TagType;
  size?: TagSize;
  /** `full` (the pill, default), `rounded` (the tag's own radius, 2px) or `square`. */
  corners?: TagCorners;
  /** Snap in when it appears: `auto` (default) when it arrives on its own into UI already on screen; `true`; `false`. Notification's name for it. */
  arrive?: boolean | 'auto';
  /** Shown (default). `false` snaps it out, then it's gone. */
  show?: boolean;
  /** Slow motion: multiplies the snap in and out. Default 1. */
  timeScale?: number;
  /** An icon before the text (v11's `renderIcon`). */
  renderIcon?: import('react').ElementType;
  children: ReactNode;
}

/** The ref is the tag's element while it's shown. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    type = 'gray',
    size: sizeProp,
    corners: cornersProp,
    arrive,
    show = true,
    timeScale = 1,
    renderIcon: Icon,
    className,
    children,
    ...rest
  },
  refProp
) {
  // KitDefaults: the provider's size (the tag's own scale) and corners for the props not given.
  const { size = 'md', corners = 'full' } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    TAG_KIT
  );
  const animateIn = arrive ?? 'auto';
  const el = useRef<HTMLSpanElement | null>(null);
  const reduced = usePrefersReducedMotion();
  // Shown, or leaving after `show` turned false.
  const [present, setPresent] = useState(show);
  if (show && !present) setPresent(true);
  // Reduced motion: it goes at once.
  if (!show && present && reduced) setPresent(false);
  // The snap playing (its scale), and its fade beside it.
  const anim = useRef<Animation | null>(null);
  const fade = useRef<Animation | null>(null);
  const play = (pair: [Animation, Animation] | null) => {
    anim.current?.cancel();
    fade.current?.cancel();
    anim.current = pair?.[0] ?? null;
    fade.current = pair?.[1] ?? null;
    return anim.current;
  };
  const mounted = useRef(false);
  // `auto`: the insertion watcher, started before this render's commit and
  // held while the tag is mounted.
  const watches = animateIn === 'auto';
  if (watches) startWatching();
  useLayoutEffect(() => (watches ? holdWatching() : undefined), [watches]);
  // The caller's ref: the tag's element while it's shown.
  useImperativeHandle(refProp, () => el.current as HTMLSpanElement);
  const setEl = useCallback((node: HTMLSpanElement | null) => {
    el.current = node;
    // Gone: shown again, it's a new arrival.
    if (!node) mounted.current = false;
  }, []);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node || typeof node.animate !== 'function') return;
    const first = !mounted.current;
    mounted.current = true;
    if (show) {
      // Arriving: on mount, or turning back from leaving.
      const turning = anim.current?.playState === 'running';
      if (!first && !turning) return;
      if (turning) {
        // Shown again mid-exit: back from where it is (its scale and opacity
        // as drawn), on the share of the snap's clock its travel leaves.
        const from = tagDrawn(node);
        const back = play(
          reduced ? null : tagSnapIn(node, { timeScale, from })
        );
        if (back) joinRun(back, timeScale);
        return;
      }
      play(null);
      if (reduced || animateIn === false) return;
      // The first of a run snaps; one in a warm run is simply there.
      const arrive = () => {
        if (!firstOfRun()) return joinRun(null, timeScale);
        joinRun(play(tagSnapIn(node, { timeScale }))!, timeScale);
      };
      if (animateIn === true) {
        arrive();
        return;
      }
      // `auto`: decided after the commit, once the observer has seen what it
      // added (still before the frame is drawn).
      let live = true;
      queueMicrotask(() => {
        if (live && node.isConnected && arrivedAlone(node)) arrive();
      });
      return () => {
        live = false;
      };
    }
    if (!present) return;
    // Leaving: one step faster, up to the scale it came from, fading, then
    // gone; from where it is if it was still arriving.
    const from = tagDrawn(node);
    const out = play(tagSnapOut(node, { timeScale, from }))!;
    joinRun(out, timeScale);
    out.finished.then(
      () => {
        if (anim.current === out) setPresent(false);
      },
      () => {}
    );
    // `arrive` and `present` are read when `show` changes, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  if (!present) return null;
  return (
    <span
      {...rest}
      ref={setEl}
      aria-hidden={show ? rest['aria-hidden'] : true}
      className={[
        'cds-tag',
        `cds-tag--${type}`,
        `cds-tag--${size}`,
        Icon && 'cds-tag--icon',
        corners !== 'full' && `cds-tag--${corners}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      {Icon && (
        <span className="cds-tag__icon" aria-hidden="true">
          <Icon
            size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16}
            animated={false}
          />
        </span>
      )}
      {children}
    </span>
  );
});
