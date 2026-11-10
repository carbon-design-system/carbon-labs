/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  animateLayout,
  distanceTokens,
  motionTokens,
  easingCss,
} from '@carbon-labs/v12-motion';
import { disclosureTiming } from '@carbon-labs/react-disclosure';
import { tokenMs } from '@carbon-labs/react-disclosure';

/* ============================================================================
 * The search expand: an expandable search grows from its icon button into
 * the full field, and closes back into the button. The disclosure module's
 * two standards, duration follows travel and expanding content moves with
 * the opening, on the inline axis — a candidate carbon-motion pattern:
 *
 *   clock     the width's travel picks the step (`disclosureTiming`, the
 *             disclosure module's: under 24px fast-02, under 120px
 *             moderate-01, under 480px moderate-02 …); opening on
 *             entrance-productive, closing one step faster on
 *             exit-productive. Travel is from where the field is, so a turn
 *             mid-move takes the step of what's left
 *   layout    the width moves as a layout change (`animateLayout`): one
 *             transaction on the layout it sits in (its toolbar, else its
 *             parent), so what sits beside it moves on the same clock and a
 *             toolbar's overflow holds until it lands
 *   content   moves with the opening: shut, it waits 8px back toward the
 *             button (`distance-sm`); opening from shut, it starts at half
 *             the clock and comes into place over fast-02,
 *             entrance-productive. It is laid out at its open width
 *             throughout, so its text never reflows or truncates while the
 *             field moves. Closing, it holds still and the soft edge closes
 *             over it; it goes back only once the field has closed. A turn
 *             (reopened while closing) skips the lead
 *   edge      while it moves, the clip's trailing edge fades over
 *             `min(16px, w, W − w)` for a clip w wide of its open W
 *             (`--cds-motion-soft-edge`, the disclosure's), so nothing pops
 *             as it lands
 *   reduced   no travel: open or shut at once; the content fades in on the
 *             reduced clock (search.scss)
 *
 * The step's time and curve are read from their CSS variables where the
 * search is, so slow motion reaches them.
 * ========================================================================== */

export type SearchMove = 'open' | 'shut';

export interface SearchExpand {
  /** Moving, and which way; null at rest. */
  moving: SearchMove | null;
  /** For the search's root. */
  rootProps: { 'data-moving'?: SearchMove };
}

type EasingName = keyof typeof motionTokens.easing;

/** The CSS easing of a curve token where `el` is: its variable, else the token. */
function easingOf(el: Element, name: EasingName): string {
  const v = getComputedStyle(el)
    .getPropertyValue(`--cds-motion-easing-${name}`)
    .trim();
  return v || easingCss(name);
}

/** The layout the width change moves: the toolbar it sits in, else its parent. */
function layoutRootOf(el: HTMLElement): HTMLElement {
  return (
    el.parentElement?.closest<HTMLElement>('[role="toolbar"]') ??
    el.parentElement ??
    el
  );
}

const VARS = ['--cds-search-open'] as const;

interface Run {
  width: Animation | null;
  content: Animation | null;
  timer: number;
}

export function useSearchExpand(
  rootRef: RefObject<HTMLElement | null>,
  {
    expandable,
    expanded,
    reduced,
  }: { expandable: boolean; expanded: boolean; reduced: boolean }
): SearchExpand {
  // The state it last came to rest in; a change of `expanded` is moving in
  // the same render (as the disclosure's bodies), so the shut look never
  // flashes before the move starts.
  const [rest, setRest] = useState<boolean | null>(expanded);
  const landed = !expandable || rest === expanded;

  const run = useRef<Run | null>(null);
  const gen = useRef(0);
  // The root's width at rest (where the next move starts), and its open width.
  const restW = useRef(0);
  const openW = useRef(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !expandable) {
      return;
    }
    const measure = () => {
      if (run.current) {
        return;
      }
      restW.current = root.getBoundingClientRect().width;
      if (root.classList.contains('cds-search--expanded')) {
        openW.current = restW.current;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [rootRef, expandable]);

  const was = useRef(expanded);
  useLayoutEffect(() => {
    if (was.current === expanded) {
      return;
    }
    was.current = expanded;
    const root = rootRef.current;
    const my = ++gen.current;
    const settle = () => {
      if (gen.current !== my) {
        return;
      }
      const r = run.current;
      if (r) {
        window.clearTimeout(r.timer);
      }
      run.current = null;
      for (const v of VARS) {
        root?.style.removeProperty(v);
      }
      root
        ?.querySelector<HTMLElement>('.cds-search__content')
        ?.style.removeProperty('translate');
      if (root) {
        restW.current = root.getBoundingClientRect().width;
      }
      if (root && expanded) {
        openW.current = restW.current;
      }
      setRest(expanded);
    };
    if (!root || !expandable) {
      return settle();
    }

    // From where it is: mid-move, its live width (a turn).
    const prev = run.current;
    const from = prev ? root.getBoundingClientRect().width : restW.current;
    const content = root.querySelector<HTMLElement>('.cds-search__content');
    // Closing before the content arrived: it holds still where it is (the
    // edge closes over it), not jumping into place.
    const held =
      prev?.content && content ? getComputedStyle(content).translate : null;
    if (prev) {
      window.clearTimeout(prev.timer);
      prev.width?.cancel();
      prev.content?.cancel();
      run.current = null;
    }
    const to = root.getBoundingClientRect().width;
    const travel = to - from;
    if (reduced || root.closest('[data-still]') || Math.abs(travel) < 0.5) {
      return settle();
    }

    const clip = root.querySelector<HTMLElement>('.cds-search__clip');
    if (content && held && held !== 'none' && !expanded) {
      content.style.translate = held;
    }
    // The clip starts after the magnifier: its open width is the field's less that.
    const lead = clip
      ? clip.getBoundingClientRect().left - root.getBoundingClientRect().left
      : 0;
    const open = Math.max(expanded ? to : Math.max(from, openW.current), 0);
    if (expanded) {
      openW.current = to;
    }
    root.style.setProperty(
      '--cds-search-open',
      `${Math.max(0, open - Math.abs(lead))}px`
    );

    // Turned back to where it last rested before it got there: it's moving.
    setRest((r) => (r === expanded ? null : r));

    const timing = disclosureTiming([travel]);
    const clock = tokenMs(root, timing.token);
    const easing = easingOf(
      root,
      expanded ? 'entrance-productive' : 'exit-productive'
    );
    const { animation } = animateLayout(
      layoutRootOf(root),
      root,
      [{ width: `${from}px` }, { width: `${to}px` }],
      {
        ms: clock,
        easing,
        reason: expanded ? 'search-expand' : 'search-collapse',
        reduced: false,
      }
    );

    // The content's arrival: 8px, from half the open (a turn: at once, from
    // where it is — it held still while closing, so it's already in place).
    let arrive: Animation | null = null;
    let arriveDelay = 0;
    // Shut: no wider than the magnifier's box (the text starts after it, a few px either side of that).
    const boxW =
      root
        .querySelector<HTMLElement>('.cds-search__magnifier')
        ?.getBoundingClientRect().width ?? Math.abs(lead);
    const fromShut = from <= boxW + 0.5;
    // Reopened while it was held short of its place: it resumes from there, at once.
    const waiting = content?.style.translate || '';
    if (expanded && content && (fromShut || waiting)) {
      const d = distanceTokens.sm;
      arriveDelay = fromShut ? clock / 2 : 0;
      content.style.removeProperty('translate');
      arrive = content.animate(
        [
          { translate: fromShut ? `${-d}px 0` : waiting },
          { translate: '0px 0' },
        ],
        {
          duration: tokenMs(root, 'fast-02'),
          delay: arriveDelay,
          easing: easingOf(root, 'entrance-productive'),
          fill: 'backwards',
        }
      );
    }

    const total = Math.max(
      clock,
      arrive ? arriveDelay + tokenMs(root, 'fast-02') : 0
    );
    run.current = {
      width: animation,
      content: arrive,
      // A hidden tab never finishes it: the clock lands it too.
      timer: window.setTimeout(settle, total * 2 + 250),
    };
    Promise.all([animation.finished, arrive?.finished]).then(settle, () => {});
  }, [rootRef, expanded, expandable, reduced]);

  // Unmounting mid-move: let it go.
  useLayoutEffect(
    () => () => {
      const r = run.current;
      if (!r) {
        return;
      }
      window.clearTimeout(r.timer);
      r.width?.cancel();
      r.content?.cancel();
    },
    []
  );

  const moving: SearchMove | null = landed ? null : expanded ? 'open' : 'shut';
  return { moving, rootProps: { 'data-moving': moving ?? undefined } };
}
