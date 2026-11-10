/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  attachJumpTo,
  type JumpBlock,
  type JumpDirection,
  type JumpEngine,
  type JumpEngineOptions,
  type JumpPlace,
  type JumpTargetValue,
  type JumpWatch,
} from './engine';

/** The scroll container: a ref or the element. */
export type JumpContainer = RefObject<HTMLElement | null> | HTMLElement | null;

/** What it jumps to: the live edge, the start, an element (or its ref), or a function returning one. */
export type JumpTarget =
  | 'end'
  | 'start'
  | Element
  | RefObject<Element | null>
  | (() => Element | null)
  | null;

export interface UseJumpToOptions {
  container: JumpContainer;
  target: JumpTarget;
  /** Px past the view before the target counts as away. Default 48. */
  threshold?: number;
  /** At the end, growing content keeps the view there. Default false. */
  stick?: boolean;
  /** Where an element target lands. Default `center`. */
  block?: JumpBlock;
  /** Overrides the reduced-motion preference. */
  reduced?: boolean;
  /** Slow motion: the glide's clock times this. Default 1. */
  timeScale?: number;
  /** Not watching: never away. */
  disabled?: boolean;
  /** What takes focus after a keyboard jump. */
  focusTarget?: () => HTMLElement | null;
}

export interface JumpToState {
  away: boolean;
  direction: JumpDirection;
  /** The live edge is in view. */
  atEnd: boolean;
  /** Glides to the target; `keyboard` moves focus to it. */
  jump: (how?: { keyboard?: boolean }) => void;
}

const isRef = (v: unknown): v is RefObject<Element | null> =>
  typeof v === 'object' && v !== null && 'current' in v;

function resolveContainer(c: JumpContainer): HTMLElement | null {
  return isRef(c) ? (c.current as HTMLElement | null) : c;
}

function resolveTarget(t: JumpTarget): JumpTargetValue {
  if (t === 'end' || t === 'start' || t == null) {
    return t;
  }
  if (typeof t === 'function') {
    return t();
  }
  return isRef(t) ? t.current : t;
}

/** The hook, plus the pill's host in the container (JumpTo's). */
export function useJumpToEngine(
  o: UseJumpToOptions & { pill?: boolean }
): JumpToState & {
  host: HTMLElement | null;
  setPlace: (p: JumpPlace) => void;
} {
  const systemReduced = usePrefersReducedMotion();
  const [watch, setWatch] = useState<JumpWatch>({
    away: false,
    direction: 'down',
    atEnd: true,
  });
  const [host, setHost] = useState<HTMLElement | null>(null);
  const latest = useRef<JumpEngineOptions | null>(null);
  const engine = useRef<{ box: HTMLElement; e: JumpEngine } | null>(null);

  const sync = (settled: boolean) => {
    latest.current = {
      threshold: o.threshold ?? 48,
      stick: (o.stick ?? false) && !o.disabled,
      block: o.block ?? 'center',
      reduced: o.reduced ?? systemReduced,
      timeScale: o.timeScale ?? 1,
      focusTarget: o.focusTarget,
      onChange: setWatch,
    };
    // The container and the target as they are now (the engine skips what is unchanged).
    const box = resolveContainer(o.container);
    // A parent's callback ref is null in our layout phase while it is re-attached: wait for the passive one.
    if (!box && !settled) {
      return;
    }
    if (engine.current?.box !== box) {
      engine.current?.e.destroy();
      engine.current = box
        ? { box, e: attachJumpTo(box, () => latest.current!) }
        : null;
    }
    engine.current?.e.setTarget(o.disabled ? null : resolveTarget(o.target));
    const h = o.pill && engine.current ? engine.current.e.host() : null;
    if (h !== host) {
      setHost(h);
    }
  };
  // Each render, in layout; and again once the commit's refs are all set (a container that is our parent).
  useLayoutEffect(() => sync(false));
  useEffect(() => sync(true));

  useEffect(
    () => () => {
      engine.current?.e.destroy();
      engine.current = null;
    },
    []
  );

  const jump = useCallback(
    (how?: { keyboard?: boolean }) => engine.current?.e.jump(how),
    []
  );
  const setPlace = useCallback(
    (p: JumpPlace) => engine.current?.e.setPlace(p),
    []
  );
  const away = watch.away && !o.disabled;
  return {
    away,
    direction: watch.direction,
    atEnd: watch.atEnd,
    jump,
    host,
    setPlace,
  };
}

/** Whether a target in a scroll container is away and which way, and a jump to it. */
export function useJumpTo(o: UseJumpToOptions): JumpToState {
  const { away, direction, atEnd, jump } = useJumpToEngine(o);
  return { away, direction, atEnd, jump };
}
