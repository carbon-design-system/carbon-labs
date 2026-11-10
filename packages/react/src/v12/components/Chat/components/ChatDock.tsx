/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  beginLayout,
  CONTENT_SWAP,
  DURATION_FLOOR_MS,
  durationStepForDistance,
  motionTokens,
  playContentSwap,
  toEasing,
  type LayoutTransaction,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { inertProps } from '@carbon-labs/react-util';
import './chat-surface.scss';

/* ============================================================================
 * ChatDock: the prompt and its slots, a card above and rows below.
 *
 *   out      what leaves plays the content swap's out toward the prompt
 *   move     then one layout move: every changing slot resizes on one clock by
 *            the larger travel, standard-productive, in one transaction
 *   in       then what arrives plays the swap's in, out of the prompt
 *   leaving  inert and out of flow while it plays out
 *   mount    what's there on the first render is simply there
 *   reduced  fades only; the move lands at once
 * ========================================================================== */

export interface ChatDockProps {
  /** The prompt. */
  children: ReactNode;
  /** Above the prompt: a keyed element (a FollowUpCard). A new key swaps it. */
  above?: ReactElement | null;
  /** Below the prompt: a keyed element (Suggestions). A new key swaps it. */
  below?: ReactElement | null;
  /** The layout transaction's root: the chat column (the transcript and the dock). Default the dock's parent. */
  layoutRoot?: () => HTMLElement | null;
  /** Multiplies every duration (a lab's slow motion). Default 1. */
  timeScale?: number;
  /** Overrides `prefers-reduced-motion`. */
  reduced?: boolean;
  className?: string;
}

type SlotName = 'above' | 'below';
const SLOTS: SlotName[] = ['above', 'below'];

interface Entry {
  key: string;
  el: ReactElement;
}

const keyOf = (
  el: ReactElement | null | undefined,
  slot: SlotName
): string | null => (el && isValidElement(el) ? String(el.key ?? slot) : null);

const STANDARD = `cubic-bezier(${toEasing({ name: 'standard', mode: 'productive' }).join(', ')})`;
const EXIT = `cubic-bezier(${motionTokens.easing[CONTENT_SWAP.out.easing].join(', ')})`;

/** The swap's direction in `slot`: leaving toward the prompt, arriving out of it (above +1, below −1). */
const fromPrompt = (slot: SlotName) => (slot === 'above' ? 1 : -1);

export function ChatDock({
  children,
  above = null,
  below = null,
  layoutRoot,
  timeScale = 1,
  reduced: reducedProp,
  className,
}: ChatDockProps) {
  const { reduced: systemReduced } = useFeedbackMotion();
  const reduced = reducedProp ?? systemReduced;
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Record<SlotName, HTMLDivElement | null>>({
    above: null,
    below: null,
  });

  // What's leaving each slot, kept mounted through its out and the move;
  // what's there now comes from the props.
  const [prev, setPrev] = useState({ above, below });
  const [leaving, setLeaving] = useState<Record<SlotName, Entry[]>>({
    above: [],
    below: [],
  });
  const [gen, setGen] = useState(0);
  const now = { above, below };
  if (prev.above !== above || prev.below !== below) {
    let changed = false;
    const next = { ...leaving };
    for (const s of SLOTS) {
      const was = prev[s];
      const k0 = keyOf(was, s);
      const k1 = keyOf(now[s], s);
      if (k0 === k1) continue;
      changed = true;
      // The old one leaves; one coming back while it leaves is simply current again.
      next[s] = [
        ...next[s].filter((e) => e.key !== k0 && e.key !== k1),
        ...(was && k0 ? [{ key: k0, el: was }] : []),
      ];
    }
    setPrev(now);
    if (changed) {
      setLeaving(next);
      setGen((g) => g + 1);
    }
  }

  const run = useRef<{
    gen: number;
    tx: LayoutTransaction | null;
    anims: Animation[];
    timer: number;
  }>({ gen: 0, tx: null, anims: [], timer: 0 });
  // The keys on screen after the last change.
  const shown = useRef<Record<SlotName, string | null>>({
    above: keyOf(above, 'above'),
    below: keyOf(below, 'below'),
  });

  const currentOf = (slot: HTMLElement) =>
    slot.querySelector<HTMLElement>(
      ':scope > [data-chat-dock-entry]:not([data-chat-dock-leaving])'
    );
  // A slot's height is always set: a frame with it collapsed would let the browser clamp the
  // transcript's scroll to the top. At rest it follows its entry (below).
  const pin = (slot: HTMLElement) => {
    slot.style.blockSize = `${currentOf(slot)?.offsetHeight ?? 0}px`;
  };

  // At rest, a slot follows its entry's size at once (a card's field, new text).
  useLayoutEffect(() => {
    const slots = SLOTS.map((s) => slotRefs.current[s]!);
    slots.forEach(pin);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() =>
      slots.forEach((slot) => !slot.hasAttribute('data-moving') && pin(slot))
    );
    const observe = () =>
      slots.forEach((slot) =>
        slot
          .querySelectorAll(':scope > [data-chat-dock-entry]')
          .forEach((e) => ro.observe(e))
      );
    observe();
    const mo = new MutationObserver(observe);
    slots.forEach((slot) => mo.observe(slot, { childList: true }));
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
    // Once: the observers follow the entries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (gen === 0) return;
    const root = rootRef.current;
    if (!root) return;
    const column = layoutRoot?.() ?? root.parentElement ?? root;
    const k = timeScale * (reduced ? CONTENT_SWAP.reducedScale : 1);
    const last = run.current;

    // Where each slot is now (its set height, or its live one mid-move), and where it goes.
    const plan = SLOTS.map((s) => {
      const slot = slotRefs.current[s]!;
      const outs = [
        ...slot.querySelectorAll<HTMLElement>(
          ':scope > [data-chat-dock-leaving]'
        ),
      ];
      const cur = currentOf(slot);
      const key = keyOf(now[s], s);
      const fresh = cur && key !== shown.current[s] ? cur : null;
      shown.current[s] = key;
      const from = slot.getBoundingClientRect().height;
      const to = cur ? cur.offsetHeight : 0;
      return { s, slot, outs, fresh, from, to };
    });
    last.anims.forEach((a) => a.cancel());
    window.clearTimeout(last.timer);

    const outsAll = plan.flatMap((p) =>
      p.outs.map((el) => ({ el, slot: p.s }))
    );
    const outMs = outsAll.length
      ? Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[CONTENT_SWAP.out.duration] * k
        )
      : 0;
    const distance = Math.max(0, ...plan.map((p) => Math.abs(p.to - p.from)));
    const moveMs =
      distance < 0.5
        ? 0
        : reduced
          ? DURATION_FLOOR_MS
          : Math.max(
              DURATION_FLOOR_MS,
              motionTokens.duration[durationStepForDistance(distance)] *
                timeScale
            );

    // One transaction over the out and the move: the transcript's holders
    // hold, and the in (playContentSwap) waits for its end.
    const tx = beginLayout(column, {
      ms: Math.max(1, outMs + moveMs),
      easing: STANDARD,
      lead: root,
      reason: 'chat-dock',
      reduced,
    });
    const anims: Animation[] = [];
    const waits: Animation[] = [];

    // The swap's pairs: an arrival takes a piece leaving (its own slot's,
    // else the other's) as its out; the rest play the same out alone.
    const paired = new Set<HTMLElement>();
    for (const p of plan) {
      if (!p.fresh) continue;
      const out =
        outsAll.find((o) => o.slot === p.s && !paired.has(o.el)) ??
        outsAll.find((o) => !paired.has(o.el));
      if (out) paired.add(out.el);
      const swap = playContentSwap({
        out: out?.el ?? null,
        in: p.fresh,
        axis: 'y',
        direction: fromPrompt(p.s),
        timeScale,
        reduced,
      });
      if (swap.outAnimation) waits.push(swap.outAnimation);
      anims.push(swap.inAnimation);
    }
    for (const o of outsAll) {
      if (paired.has(o.el)) continue;
      const opacity = Number(getComputedStyle(o.el).opacity);
      o.el.getAnimations().forEach((a) => a.cancel());
      if (opacity <= 0.001) continue;
      // Toward the prompt: down from above it, up from below.
      const toward = `translateY(${fromPrompt(o.slot) * CONTENT_SWAP.distance}px)`;
      waits.push(
        o.el.animate(
          reduced
            ? [{ opacity }, { opacity: 0 }]
            : [
                { opacity, transform: 'none' },
                { opacity: 0, transform: toward },
              ],
          {
            duration: Math.max(DURATION_FLOOR_MS, outMs * opacity),
            easing: EXIT,
            fill: 'forwards',
          }
        )
      );
    }

    // The move: after the out, every slot that changes, on one clock.
    for (const p of plan) {
      p.slot.style.blockSize = `${p.to}px`;
      if (Math.abs(p.to - p.from) < 0.5) continue;
      p.slot.dataset.moving = '';
      waits.push(
        p.slot.animate(
          [{ blockSize: `${p.from}px` }, { blockSize: `${p.to}px` }],
          {
            duration: Math.max(DURATION_FLOOR_MS, moveMs),
            delay: outMs,
            easing: STANDARD,
            fill: 'backwards',
          }
        )
      );
    }
    anims.push(...waits);

    // Settled: each slot at its entry's height again, the leaving gone.
    const settle = () => {
      if (run.current.gen !== gen) return;
      window.clearTimeout(run.current.timer);
      for (const p of plan) {
        delete p.slot.dataset.moving;
        pin(p.slot);
      }
      tx.end();
      setLeaving({ above: [], below: [] });
    };
    run.current = {
      gen,
      tx,
      anims,
      // A hidden tab never finishes the animations: the clock settles it too.
      timer: window.setTimeout(
        settle,
        outMs + moveMs + motionTokens.duration['fast-01']
      ),
    };
    if (!waits.length) settle();
    else Promise.all(waits.map((a) => a.finished)).then(settle, () => {});
    // Once per change (gen); what it reads is that change's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen]);

  useLayoutEffect(
    () => () => {
      window.clearTimeout(run.current.timer);
      run.current.tx?.cancel();
    },
    []
  );

  const renderSlot = (s: SlotName) => {
    const cur = now[s];
    const k = keyOf(cur, s);
    return (
      <div
        ref={(el) => {
          slotRefs.current[s] = el;
        }}
        className={`cds-chat-dock__slot cds-chat-dock__slot--${s}`}>
        {leaving[s].map((e) => (
          <div
            key={e.key}
            className="cds-chat-dock__entry"
            data-chat-dock-entry=""
            data-chat-dock-leaving=""
            {...inertProps(true)}>
            {e.el}
          </div>
        ))}
        {cur && k && (
          <div key={k} className="cds-chat-dock__entry" data-chat-dock-entry="">
            {cur}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={['cds-chat-dock', className].filter(Boolean).join(' ')}>
      {renderSlot('above')}
      <div className="cds-chat-dock__prompt">{children}</div>
      {renderSlot('below')}
    </div>
  );
}
ChatDock.displayName = 'ChatDock';
