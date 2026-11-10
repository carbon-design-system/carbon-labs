/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  distanceTokens,
  motionTokens,
  playContentSwap,
  usePrefersReducedMotion,
  easingCss,
} from '@carbon-labs/v12-motion';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * ModalSwap — content that swaps out, then in (the kit's content swap rule)
 * ============================================================================
 *
 *   key      when `swapKey` changes, the old content leaves (fast-01, 16px up,
 *            fading) and the new content enters after it (fast-02, from
 *            16px below): `playContentSwap` on y, at 16px
 *   height   the box holds the old height through the out and glides to the
 *            new one with the in, so the modal resizes once, with the content
 *            that caused it. `glideWidth`: its width too (a natural-width
 *            button's label: `Add` → `Adding…`)
 *   reduced  a snap: the new content at once, no fade, no glide
 *
 * The modal body (`ModalBody swapKey`) and the primary button's loading label
 * use it.
 * ========================================================================== */

export interface ModalSwapProps {
  /** A new key swaps the content. */
  swapKey: string | number;
  children?: ReactNode;
  className?: string;
  /** Slow motion: every duration × this. Default 1. */
  timeScale?: number;
  /** The width holds and glides as the height does (content that sizes its box: a button's label). */
  glideWidth?: boolean;
}

/** A leaving layer: what it showed as it left. */
interface Layer {
  id: number;
  node: ReactNode;
}

let nextLayer = 1;
const ease = (name: keyof typeof motionTokens.easing) => easingCss(name);

export function ModalSwap({
  swapKey,
  children,
  className,
  timeScale = 1,
  glideWidth = false,
}: ModalSwapProps) {
  // The current layer is rendered from props: only a new key is state (with
  // the layers leaving), so a parent's render renders it once.
  const [current, setCurrent] = useState(() => ({
    id: nextLayer++,
    key: swapKey,
  }));
  const [leaving, setLeaving] = useState<Layer[]>([]);
  /** What the current layer showed at the last commit: the leaving layer keeps it. */
  const shownNode = useRef<ReactNode>(children);
  useLayoutEffect(() => {
    shownNode.current = children;
  });
  if (swapKey !== current.key) {
    // Read in the render a new key causes, before it commits: the last content shown.
    const node = shownNode.current;
    setLeaving((l) => [...l, { id: current.id, node }]);
    setCurrent({ id: nextLayer++, key: swapKey });
  }

  const box = useRef<HTMLDivElement>(null);
  const shown = useRef(current.id);
  const lastH = useRef<number | null>(null);
  const lastW = useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();

  // Its height at rest, kept current (what the next swap glides from).
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const note = () => {
      if ('swapping' in el.dataset) return;
      lastH.current = el.offsetHeight;
      lastW.current = el.offsetWidth;
    };
    note();
    const ro = new ResizeObserver(note);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    const layer = (id: number) =>
      el?.querySelector<HTMLElement>(`:scope > [data-swap-layer="${id}"]`) ??
      null;
    const inEl = layer(current.id);
    if (!el || !inEl) return;
    const was = shown.current;
    shown.current = current.id;
    if (was === current.id) return;
    const swap = playContentSwap({
      out: layer(was),
      in: inEl,
      axis: 'y',
      direction: 1,
      distance: distanceTokens.md,
      timeScale,
      reduced,
    });
    el.dataset.swapping = '';
    const settle = () => {
      if (!el.getAnimations().length && !inEl.getAnimations().length)
        delete el.dataset.swapping;
    };
    void swap.inAnimation.finished.then(settle, () => undefined);
    const drop = () => setLeaving((l) => l.filter((x) => x.id !== was));
    if (swap.outAnimation) swap.outAnimation.onfinish = drop;
    else drop();

    // The height (and the width, with glideWidth): held through the out, then
    // gliding to the new content's with the in.
    const running = el.getAnimations();
    const live = running.length ? el.getBoundingClientRect() : null;
    const h0 = live ? live.height : (lastH.current ?? el.offsetHeight);
    const w0 = live ? live.width : (lastW.current ?? el.offsetWidth);
    running.forEach((a) => a.cancel());
    const h1 = el.offsetHeight;
    const w1 = el.offsetWidth;
    lastH.current = h1;
    lastW.current = w1;
    if (reduced) return;
    const from: Keyframe = {};
    const to: Keyframe = {};
    if (Math.abs(h1 - h0) >= 0.5) {
      from.height = `${h0}px`;
      to.height = `${h1}px`;
    }
    if (glideWidth && Math.abs(w1 - w0) >= 0.5) {
      from.width = `${w0}px`;
      to.width = `${w1}px`;
    }
    if (!Object.keys(to).length) return;
    const glide = el.animate([from, to], {
      duration: swap.inMs,
      delay: swap.wait,
      easing: ease('standard-productive'),
      fill: 'backwards',
    });
    void glide.finished.then(settle, () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  return (
    <div
      ref={box}
      className={['cds-modal-swap', className].filter(Boolean).join(' ')}>
      {leaving.map((l) => (
        <div
          key={l.id}
          data-swap-layer={l.id}
          className="cds-modal-swap__layer cds-modal-swap__layer--out"
          aria-hidden="true"
          {...inertProps(true)}>
          {l.node}
        </div>
      ))}
      <div
        key={current.id}
        data-swap-layer={current.id}
        className="cds-modal-swap__layer">
        {children}
      </div>
    </div>
  );
}
