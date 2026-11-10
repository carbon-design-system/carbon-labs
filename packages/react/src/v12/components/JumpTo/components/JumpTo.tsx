/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  SELECTION_ARRIVAL,
  SNAP_FRAME,
  arrivalRect,
  deriveCastShadowColor,
  usePrefersReducedMotion,
  useSnapSurface,
  type SnapProfile,
} from '@carbon-labs/v12-motion';
import { ArrowDown, ArrowUp } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import {
  useSurfaceShadow,
  type KitShadow,
} from '@carbon-labs/react-kit-defaults';
import type { JumpBlock, JumpDirection, JumpPlace } from './engine';
import {
  useJumpToEngine,
  type JumpContainer,
  type JumpTarget,
} from './useJumpTo';
import './jump-to.scss';

/* ============================================================================
 * JumpTo: a pill back to a point in a scrolled container.
 *
 *   shows     while its target is out of view past a threshold; hides when back
 *   place     top or bottom centre of the view, sticky; its arrow to the target
 *   presence  the kit's 4px arrival about its centre, in and out; its fade
 *   shadow    `shadow`: the floating cast shadow; `shadowTone` its backdrop's hue
 *   jump      a glide by distance, far ones jumping close first; instant
 *             under reduced motion; focus follows a keyboard jump only
 *   announce  a count, politely, never taking focus
 *   presets   latest (sticks to the end, counts what arrives), unread, top,
 *             selection, current
 *
 * API: no Carbon v11 counterpart. `useJumpTo` is the same without the pill.
 * ========================================================================== */

export type JumpToPreset =
  | 'latest'
  | 'unread'
  | 'top'
  | 'selection'
  | 'current';
export type JumpToSize = 'xs' | 'sm' | 'md' | 'lg';
export const JumpToPresets: readonly JumpToPreset[] = [
  'latest',
  'unread',
  'top',
  'selection',
  'current',
];
export const JumpToSizes: readonly JumpToSize[] = ['xs', 'sm', 'md', 'lg'];

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** Each preset's target, words and landing. */
export const JUMP_TO_PRESETS: Record<
  JumpToPreset,
  {
    target?: JumpTarget;
    label: string;
    block: JumpBlock;
    stick?: boolean;
    countLabel: (n: number) => string;
  }
> = {
  latest: {
    target: 'end',
    label: 'Jump to latest',
    block: 'end',
    stick: true,
    countLabel: (n) => plural(n, 'new message', 'new messages'),
  },
  unread: {
    label: 'Jump to unread',
    block: 'start',
    countLabel: (n) => `${n} unread`,
  },
  top: {
    target: 'start',
    label: 'Back to top',
    block: 'start',
    countLabel: (n) => plural(n, 'new item', 'new items'),
  },
  selection: {
    label: 'Jump to selection',
    block: 'center',
    countLabel: (n) => plural(n, 'selected', 'selected'),
  },
  current: {
    label: 'Jump to current',
    block: 'center',
    countLabel: (n) => plural(n, 'new line', 'new lines'),
  },
};

export interface JumpToProps {
  /** The scroll container: a ref or the element. */
  container: JumpContainer;
  /** The live edge, the start, an element, its ref, or a function returning one. Default: the preset's. */
  target?: JumpTarget;
  /** Latest, Unread, Top, Selection or Current: a target, words and landing. Default Latest. */
  preset?: JumpToPreset;
  /** The pill's words when there is no count. Default: the preset's. */
  label?: string;
  /** A count to show and announce. Latest counts on its own from `items`. */
  count?: number;
  /** Latest: how many items there are; those added while away are counted. */
  items?: number;
  /** The words for a count. Default: the preset's, such as "3 new messages". */
  countLabel?: (n: number) => string;
  /** After a jump starts. */
  onJump?: (how: { keyboard: boolean }) => void;
  /** The button size. Default sm. */
  size?: JumpToSize;
  /** Px past the view before the target counts as away. Default 48. */
  threshold?: number;
  /** At the end, growing content keeps the view there. Default: on for Latest. */
  stick?: boolean;
  /** Where an element target lands. Default: the preset's. */
  block?: JumpBlock;
  /** Shows only for a target in this direction. Default both. */
  directions?: 'both' | JumpDirection;
  /** Not watching: never shown. */
  disabled?: boolean;
  /** What takes focus after a keyboard jump. Default: the target, else the container. */
  focusTarget?: () => HTMLElement | null;
  /** Overrides the reduced-motion preference. */
  reduced?: boolean;
  /** The floating cast shadow: `true`, an elevation, or `false`. Default: the kit's (none). */
  shadow?: KitShadow;
  /** The shadow's colour: Neutral, or Backdrop (the hue of what it floats over). Default Neutral. */
  shadowTone?: 'neutral' | 'backdrop';
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
}

/** The kit's 4px arrival (`arrivalRect`) as a snap on the measured box: its clocks and curve, the
 * content still under the clip, the presence fade; reduced, the fade alone. */
export function shrinkSnap(el: HTMLElement | null): SnapProfile {
  const w = el?.offsetWidth ?? 0;
  const h = el?.offsetHeight ?? 0;
  const r = arrivalRect({ l: 0, t: 0, r: w, b: h });
  const x = w > 0 ? (r.r - r.l) / w : 1;
  const y = h > 0 ? (r.b - r.t) / h : 1;
  return {
    from: Math.min(x, y),
    fromX: x,
    fromY: y,
    toOutX: x,
    toOutY: y,
    in: SELECTION_ARRIVAL.in,
    out: SELECTION_ARRIVAL.out,
    ease: SELECTION_ARRIVAL.ease,
    exitEase: 'exit-productive',
    exitMode: 'scale',
    contentOffset: 0,
    blinkOff: false,
    timing: 'own',
  };
}

const show = (el: HTMLElement) => {
  el.dataset.shown = '';
};
const hide = (el: HTMLElement) => {
  delete el.dataset.shown;
};

export function JumpTo({
  container,
  preset = 'latest',
  target,
  label,
  count: countProp,
  items,
  countLabel,
  onJump,
  size = 'sm',
  threshold,
  stick,
  block,
  directions = 'both',
  disabled,
  focusTarget,
  reduced,
  shadow,
  shadowTone = 'neutral',
  timeScale = 1,
  className,
}: JumpToProps) {
  const p = JUMP_TO_PRESETS[preset];
  const systemReduced = usePrefersReducedMotion();
  const jt = useJumpToEngine({
    container,
    target: target ?? p.target ?? null,
    threshold,
    stick: stick ?? p.stick ?? false,
    block: block ?? p.block,
    disabled,
    focusTarget,
    reduced,
    timeScale,
    pill: true,
  });

  // Latest's count: the items added since the view last held the end.
  const [base, setBase] = useState(items ?? 0);
  if (items != null && jt.atEnd && base !== items) setBase(items);
  const count = countProp ?? (items != null ? Math.max(0, items - base) : 0);
  const words =
    count > 0 ? (countLabel ?? p.countLabel)(count) : (label ?? p.label);

  const want =
    jt.away && (directions === 'both' || directions === jt.direction);
  const toward: JumpPlace = jt.direction === 'up' ? 'top' : 'bottom';
  const [place, setPlace] = useState<JumpPlace>(toward);

  const ref = useRef<HTMLDivElement>(null);
  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(ref, {
    profile: () => shrinkSnap(ref.current),
    reduced: reduced ?? systemReduced,
    timeScale,
    shadow: elevation,
    show,
    hide,
  });
  // From, and back to, its own centre.
  const centre = () => {
    const el = ref.current;
    return { x: (el?.offsetWidth ?? 0) / 2, y: (el?.offsetHeight ?? 0) / 2 };
  };
  const shown = useRef(false);

  const { setPlace: placeHost } = jt;
  useLayoutEffect(() => {
    placeHost(place);
  }, [placeHost, place]);

  useLayoutEffect(() => {
    if (!jt.host) return;
    if (!want) {
      if (shown.current) {
        shown.current = false;
        void surface.close({ origin: centre() });
      }
      return;
    }
    if (place !== toward) {
      // Out at the old place, then in at the new one.
      if (shown.current) {
        shown.current = false;
        void surface
          .close({ origin: centre() })
          .then((left) => left && setPlace(toward));
      } else {
        setPlace(toward);
      }
      return;
    }
    if (!shown.current) {
      shown.current = true;
      surface.open({ origin: centre });
    }
    // On a change of what it shows or where.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want, toward, place, jt.host]);

  // While it shows, its shadow follows what it floats over: a theme or a background changing on
  // an ancestor re-solves the colour (the snap solves it only as the pill arrives).
  useEffect(() => {
    const el = ref.current;
    if (!want || !elevation || !el) return;
    /** The first opaque background above it: read from styles only, so a check costs no layout. */
    const ground = () => {
      for (let a = el.parentElement; a; a = a.parentElement) {
        const c = getComputedStyle(a).backgroundColor;
        if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
      }
      return '';
    };
    let seen = ground();
    let frame = 0;
    const resolve = () => {
      frame = 0;
      const now = ground();
      if (now === seen) return;
      seen = now;
      const f = el.previousElementSibling?.querySelector<HTMLElement>(
        ':scope > .cast-floating__frame'
      );
      if (!f) return;
      // Hit-tested again where it lands, not the backdrop it first solved on.
      f.style.removeProperty('--cast-backdrop');
      deriveCastShadowColor(f);
    };
    const watch = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(resolve);
    });
    for (let a = el.parentElement; a; a = a.parentElement)
      watch.observe(a, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'style'],
      });
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [want, elevation]);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    // A key's click has no pointer detail: focus goes with the jump.
    const keyboard = e.detail === 0;
    jt.jump({ keyboard });
    onJump?.({ keyboard });
  };

  if (!jt.host) return null;
  const Arrow = place === 'top' ? ArrowUp : ArrowDown;
  return createPortal(
    <>
      <div
        ref={ref}
        className={['cds-jump-to', `cds-jump-to--${place}`, className]
          .filter(Boolean)
          .join(' ')}
        data-arrow={place === 'top' ? 'up' : 'down'}
        data-cast-tone={shadowTone === 'backdrop' ? 'backdrop' : undefined}>
        <span className="cds-jump-to__frame" {...SNAP_FRAME} />
        <Button
          className="cds-jump-to__button"
          kind="secondary"
          variant="tonal"
          size={size}
          renderIcon={Arrow}
          // The pointer leaves focus where it is (a prompt being typed in).
          onMouseDown={(e: MouseEvent) => e.preventDefault()}
          onClick={onClick}>
          {words}
        </Button>
      </div>
      <span className="cds-jump-to__live" aria-live="polite">
        {want && count > 0 ? words : ''}
      </span>
    </>,
    jt.host
  );
}
JumpTo.displayName = 'JumpTo';
