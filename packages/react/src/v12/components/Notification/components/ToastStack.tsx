/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  attachFloatingCastShadow,
  durationStepForDistance,
  holdLayout,
  inLayout,
  motionTokens,
  snapAnimations,
  snapDurationMs,
  snapEaseAt,
  snapEaseCss,
  snapIn,
  snapProfileFor,
  reducedClock,
  stepDown,
  DURATION_FLOOR_MS,
  type CastElevation,
  type FloatingCastShadow,
  type SnapLive,
  type StackSource,
  type StackSwap,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { FEEDBACK_SNAP, StackHost, stackOf } from '@carbon-labs/react-feedback';
import {
  ActionableNotification,
  ToastNotification,
  ToastSlotContext,
  type ActionableNotificationProps,
  type NotificationCorners,
  type ToastNotificationProps,
  type ToastSlot,
} from './Notification';

/* ============================================================================
 * ToastStack — the one place toasts live. Carbon leaves where toasts go to
 * the app.
 *
 *   place     top-right under the header, beside the notifications bell
 *   deck      several toasts are one deck: the newest in front, the next
 *             `peek` (2) behind it, each showing 8px below the one in front
 *             and inset 6px a side — geometry, never a scale, so the outline
 *             stays 1px — their content faded out, and each further back
 *             dimmer, toward the page
 *   front     the top card is one surface that never fades (`frontChange`,
 *             default `swap`): a
 *             new toast turns the top card to its outline, fill and height
 *             while the text crossfades in place, and a duplicate of the old
 *             top card steps down the stack behind it. A top card leaving is
 *             the mirror: it turns to the card behind, which rises under it.
 *             The icon's beat waits for the change. The snap only into an
 *             empty deck, and out of a last card. Inside the move:
 *             old text out, the surface's colors turn while it
 *             is empty, new text in — so no text ever sits on a surface of
 *             the wrong color. On the same fill the swap is a crossfade with
 *             no empty moment (nearly the same words: the new text sits
 *             under the old, which fades away over it, so what is unchanged
 *             never dims). A toast arriving while another swap is still
 *             playing updates the card (colors at once, text closely
 *             behind), never replaying the sequence. The timeout ring is
 *             the surface's, not the text's: it never fades or doubles, and
 *             refills from the ring it replaces. The status icon's beat
 *             plays only when the mark changes
 *   one move  every change is ONE motion: whatever arrives,
 *             leaves or is pushed out, every card's place, height, inset,
 *             dimming and fade start on the same frame and run on one clock
 *             and one curve — the swap's (`moderate-02`, standard-productive;
 *             the snap's under `frontChange="snap"`) when a toast arrives or
 *             leaves, a distance step when the deck opens or closes. A toast
 *             leaving starts the others moving at once
 *   open      hover or focus deals the deck into a list, newest at the top:
 *             the stack slides down at once, and as it passes each slot that
 *             card stops and sizes up to fill it while the rest keep going;
 *             leaving gathers them back from the bottom (`dealOf`). Leaving
 *             closes it after a beat, so crossing a gap doesn't; while the
 *             pointer is still over its box (a card closed under it), it
 *             stays open. Opening under a swap drops the old front's words
 *             at once, then shows the new (out, then in)
 *   cap       `cap` (3) at once. One more pushes the oldest to the back of
 *             the deck, where it fades out in the same move
 *   missed    a toast that times out or is pushed out doesn't vanish: it is
 *             counted in the bell on the frame it starts to go (`onMissed`).
 *             No flight to the bell — the count says it. A toast the person closes just leaves
 *   group     `show` with a `group` already showing merges into that toast:
 *             its count rolls up, its text and kind become the latest, and it
 *             comes to the front (a burst animates once — principle 9). In
 *             front already, it updates in place (the content swap); behind, its newest member
 *             arrives as a new card (the swap) with the count rolling on, and
 *             the old card fades at the back — it never climbs over the front
 *   coalesce  `show` with an `id` already showing updates it in place: its
 *             words swap out, then in (the family's content swap);
 *             a change of height waits for the out and moves on its travel's
 *             step before the in
 *   covered   a front a new one takes the place of drops its words and its
 *             shadow at once: the new front carries both from its first
 *             frame
 *   burst     toasts shown at once (one commit): only the newest arrives;
 *             the ones behind it fade in at their places once it has landed.
 *             A toast arriving while the front is still snapping in goes on
 *             growing from where the front had got to
 *   handoff   a card that changes its place in the deck mid-snap or mid-swap
 *             carries on from where it is: the deck's transitions take over
 *             from the stack's animations (none could start under them, and
 *             each part jumped when they ended)
 *   touch     no hover: a tap on the deck opens it, a tap elsewhere closes it
 *   priority  an error, or a toast asking for action, is never pushed out by
 *             newer ones — the cap takes the oldest card that can wait
 *   behind    a card behind the front that times out fades at its place
 *   swipe     right, off the screen's edge
 *   pause     hover or focus anywhere in the stack holds every timer
 *   announce  two live regions, there from the start, read each toast once
 *             (alert assertive, the rest polite); the cards carry no live
 *             role of their own (rule 11)
 *   focus     closing the focused toast hands focus to the next card, and
 *             the last one back to where focus came from
 *   reduced   the deck's clock is the reduced clock; no travel, no deal
 * ========================================================================== */

type ToastInput =
  | ({ type?: 'toast' } & Omit<ToastNotificationProps, 'arrive' | 'from'>)
  | ({ type: 'actionable' } & Omit<
      ActionableNotificationProps,
      'arrive' | 'from' | 'inline'
    >);

export type ToastOptions = ToastInput & { id?: string; group?: string };

interface Entry {
  /** Unique per entry (React's key): an id can come back while its old card is still going. */
  key: string;
  id: string;
  group?: string;
  props: ToastInput;
  count: number;
  from?: StackSource;
  version: number;
  closeReq: number;
  /** Pushed past the cap: fading at the back of the deck. */
  evicted: boolean;
  /** On its way out (closed, timed out, swiped). */
  leaving: boolean;
  /** Evicted because its group's newest member took the front as a new card: not missed. */
  merged?: boolean;
  /** A group's card that came back to the front as a new card: its count rolls from this. */
  countFrom?: number;
}

export interface Toasts {
  /** Show a toast (or update the one with this `id`, or merge into this `group`). Returns its id. */
  show: (toast: ToastOptions, opts?: { from?: StackSource }) => string;
  /** Close a toast as if its close button were pressed. */
  close: (id: string) => void;
}

const ToastsContext = createContext<Toasts | null>(null);

/** The stack's API when a `<ToastStack>` is above, else null (a part that toasts only where a page has a stack). */
export function useOptionalToasts(): Toasts | null {
  return useContext(ToastsContext);
}

export function useToasts(): Toasts {
  const t = useContext(ToastsContext);
  if (!t) throw new Error('useToasts needs a <ToastStack> above it.');
  return t;
}

export interface ToastStackProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** A toast was missed — it timed out, or was pushed out by newer ones: count it (the bell). */
  onMissed?: (toast: ToastInput & { id: string; count: number }) => void;
  /** Toasts kept at once. Default 3. */
  cap?: number;
  /** Swipe to dismiss. Default on. */
  swipe?: boolean;
  /** How the front changes on a deck that already shows a card. Default `swap`. */
  frontChange?: FrontChange;
  /** The page; `useToasts` works anywhere inside. */
  children?: ReactNode;
  /** Class for the stack region (place it with CSS). */
  stackClassName?: string;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** Every toast's corner mode, unless a toast sets its own. Default `rounded`. */
  corners?: NotificationCorners;
  /** Each card's cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none), the card on its fill and status outline. */
  shadow?: SurfaceShadowOption;
}

/** The deck's geometry. */
export const DECK = {
  /** Cards showing behind the front one. */
  peek: 2,
  /** Each card behind shows this much below the one in front, px. */
  offset: 8,
  /** And is inset this much each side, px. */
  inset: 6,
  /** And dims this far toward the page, per card back. */
  dim: [0, 0.4, 0.55],
  /** Open: the gap between cards, px. */
  gap: 8,
  /** Leaving the open deck closes it after this, ms. */
  closeDelay: 300,
  /** The swap's clock: a crossfade, unhurried and even. */
  swap: { duration: 'moderate-02', ease: 'standard-productive' } as const,
};

/**
 * How the front changes while the deck already shows a card. `swap` (default): the
 * front stays one surface — a new card takes its place (its outline and
 * height from the old front's, its content in 8px from above), and a front
 * that leaves fades where it is while the card behind comes forward; the
 * snap only into an empty deck and out of a last card. `snap`:
 * every arrival and exit snaps.
 */
export type FrontChange = 'swap' | 'snap';

let seq = 0;

/** Toasts shown within this long are read out as one announcement, ms. */
const ANNOUNCE_MS = 150;

/** The deal's curve: it starts at once (the stack answers the hover) and settles. */
const DEAL_EASE = 'entrance-productive' as const;
const DEAL_EASE_CSS = `cubic-bezier(${motionTokens.easing[DEAL_EASE].join(', ')})`;
/** A card's size-up as it lands in its slot (or size-down as the stack gathers it). */
const DEAL_SIZE = 'fast-02' as const;

/** The deal: one move of the stack, timed by its travel. Opening, the cards ride down, each
 * stopping at its slot as the stack passes it; closing, a sweep from the bottom gathers each.
 * `at` is when (ms) a card lands or is gathered (sizes up or down), on a track sampled from
 * that move. Every card starts where it is on screen, so a deal turns round (principle 7). */
function dealOf(
  starts: number[],
  tops: number[],
  opening: boolean,
  timeScale: number
) {
  const n = tops.length;
  const last = n - 1;
  const travel = opening
    ? Math.max(0, ...tops.map((t, i) => t - starts[i]!))
    : Math.max(0, starts[last]! - tops[last]!);
  // One step quicker than the distance's: the stack answers the hover at once and is there.
  const ms = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[stepDown(durationStepForDistance(travel))] * timeScale
  );
  const sizeMs = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[DEAL_SIZE] * timeScale
  );
  // Where card i is when the stack has moved S.
  const place = (i: number, S: number) =>
    opening
      ? Math.min(tops[i]!, starts[i]! + S)
      : Math.max(
          tops[i]!,
          Math.min(starts[i]!, starts[last]! - S - (tops[last]! - tops[i]!))
        );
  // The stack's travel at which card i lands (opening) or is gathered (closing).
  const landsAt = (i: number) =>
    opening
      ? tops[i]! - starts[i]!
      : starts[last]! - starts[i]! - (tops[last]! - tops[i]!);
  const STEPS = 30;
  const tracks = tops.map((t, i) =>
    Array.from({ length: STEPS + 1 }, (_, k) => {
      const p = k / STEPS;
      const S = travel * snapEaseAt(DEAL_EASE, p);
      return { offset: p, translate: `0px ${place(i, S) - t}px` };
    })
  );
  // When (as a share of the clock) the stack's travel first reaches a card's mark.
  const timeOf = (S: number) => {
    if (travel <= 0 || S <= 0) return 0;
    for (let k = 1; k <= 100; k++)
      if (travel * snapEaseAt(DEAL_EASE, k / 100) >= S - 0.01) return k / 100;
    return 1;
  };
  const at = tops.map((_, i) =>
    Math.round(timeOf(Math.min(travel, Math.max(0, landsAt(i)))) * ms)
  );
  // The content's own fade: fast-01, so quick it isn't noticed as a fade.
  const bodyMs = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration['fast-01'] * timeScale
  );
  return { ms, sizeMs, bodyMs, tracks, at };
}

/**
 * The deck's cast shadows, with `shadow` (the kit's default is none): the
 * floating surfaces' shadow, lit from above (motion-core
 * `attachFloatingCastShadow`), one per card. Its host sits beside the card,
 * not in it: a card is clipped (its height in the deck, the snap's clip), and
 * a shadow is all outside that clip. A card moves in more ways than the
 * shadow's mirror copies (the stack's FLIP translates, a swipe's transform,
 * the swap's clip and frame, the peeks' inset transitions), so each frame the
 * host takes its card's frame rect as drawn — whatever moved it — with the
 * card's opacity, one step under the card's own z (the deck's z-indices are
 * even, every shadow odd): the front's shadow falls on the cards behind it.
 * Only the front casts in a closed deck (the peeks' shadows would pile up
 * under it); every card does in the open list. A front leaving by the swap
 * hands its shadow to the card rising under it (one fades as the other
 * comes up), and a hidden card casts nothing on the frame it hides.
 */
let shadowSeq = 0;

function useDeckShadows(
  rootRef: { current: HTMLDivElement | null },
  elevation: CastElevation | null
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !elevation) return;
    const shadows = new Map<HTMLElement, FloatingCastShadow>();
    const sync = () => {
      const items = new Set(
        root.querySelectorAll<HTMLElement>(':scope > [data-stack-item]')
      );
      for (const [el, s] of shadows) {
        if (items.has(el)) continue;
        s.detach();
        shadows.delete(el);
      }
      for (const el of items) {
        if (shadows.has(el)) continue;
        const s = attachFloatingCastShadow(el, { manual: true, elevation });
        s.host.classList.add('fb-deck__shadow');
        // Whose shadow it is: the card's own key (it has one, shadow or not).
        s.host.dataset.shadowOf = el.dataset.stackKey ?? String(++shadowSeq);
        s.follow(true);
        shadows.set(el, s);
      }
    };
    const put = (el: HTMLElement, prop: string, value: string) => {
      if (el.style.getPropertyValue(prop) !== value)
        el.style.setProperty(prop, value);
    };
    // Only while something moves: a change in the deck (a card in or out, a style or state, a transition or an animation starting) wakes the loop,
    // which sleeps after a few frames with no finite animation. A loop inside a card (a spinner, a progress bar) moves nothing the shadow follows.
    let raf = 0;
    let idle = 0;
    // What a shadow follows: the deck, a card (its FLIP, swipe, fade, clip, inset) and a card's frame.
    // Not a card's content (its words, its mark, its timer ring), which moves nothing the shadow reads.
    const carries = (t: Element | null | undefined) =>
      !!t &&
      !t.classList.contains('fb-deck__shadow') &&
      (t === root ||
        t.parentElement === root ||
        (t.parentElement?.parentElement === root &&
          t.hasAttribute('data-snap-frame')));
    const moving = () =>
      root
        .getAnimations({ subtree: true })
        .some(
          (a) =>
            a.playState === 'running' &&
            a.effect?.getTiming().iterations !== Infinity &&
            carries(a.effect instanceof KeyframeEffect ? a.effect.target : null)
        );
    // A change is drawn at once (before this frame paints, whatever else asks for it), then followed
    // frame by frame while it moves.
    const wake = () => {
      idle = 0;
      draw();
      if (!raf) raf = requestAnimationFrame(place);
    };
    const place = () => {
      raf = 0;
      if (!shadows.size) return;
      if (moving()) idle = 0;
      // Two still frames: a move started in the frame after its change (a FLIP's, a swap's) is caught.
      else if (++idle > 2) return;
      raf = requestAnimationFrame(place);
      draw();
    };
    // Every card read, then every host written: one layout per draw, not one per card.
    const draw = () => {
      if (!shadows.size) return;
      const base = root.getBoundingClientRect();
      const seen = [...shadows].map(([el, s]) => {
        const r = (
          el.querySelector<HTMLElement>(':scope > [data-snap-frame]') ?? el
        ).getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          el,
          h: s.host,
          r,
          opacity: cs.visibility === 'hidden' ? '0' : cs.opacity,
        };
      });
      for (const { el, h, r, opacity } of seen) {
        put(h, 'left', `${r.left - base.left}px`);
        put(h, 'top', `${r.top - base.top}px`);
        put(h, 'width', `${r.width}px`);
        put(h, 'height', `${r.height}px`);
        // Hidden (the blink at a leave's end) is gone: its shadow with it, on that frame.
        put(h, 'opacity', opacity);
        put(h, 'z-index', String(Number(el.style.zIndex || 0) - 1));
        // Its own name: the deck finds its cards by `data-deck`. A front
        // leaving by the swap hands its shadow to the card rising under it:
        // its own fades on the deck's clock as that one's comes up, so the
        // two never stack, and none is left when it goes.
        const deck = el.hasAttribute('data-deck-swapout')
          ? 'leaving'
          : (el.dataset.deck ?? '');
        if (h.dataset.shadowDeck !== deck) {
          // A front covered by a new one (the swap) drops its shadow at once:
          // the new front casts the same shadow over the same box from its
          // first frame; the two together would read as one darker, longer
          // shadow that lightens over the move.
          h.toggleAttribute(
            'data-shadow-covered',
            h.dataset.shadowDeck === 'front' &&
              deck === 'peek' &&
              root.dataset.frontChange === 'swap'
          );
          h.dataset.shadowDeck = deck;
        }
      }
    };
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.type === 'childList' && r.target === root))
        sync();
      // A card in or out, or a change to the deck, a card or its frame. The shadows' own hosts (written
      // here) and the cards' content don't move what a shadow follows.
      if (
        records.some(
          (r) =>
            (r.type === 'childList' && r.target === root) ||
            carries(r.target as Element)
        )
      )
        wake();
    });
    mo.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'style',
        'class',
        'hidden',
        'data-deck',
        'data-deck-swapout',
        'data-deck-leaving',
        'data-front-change',
      ],
    });
    sync();
    // CSS transitions and animations (the peeks' insets, the dim) start without a mutation of their own.
    const started = (e: Event) => carries(e.target as Element) && wake();
    root.addEventListener('transitionrun', started);
    root.addEventListener('animationstart', started);
    // The deck's box changes size (a card's body grows, the viewport narrows).
    const ro =
      typeof ResizeObserver === 'function' ? new ResizeObserver(wake) : null;
    ro?.observe(root);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro?.disconnect();
      root.removeEventListener('transitionrun', started);
      root.removeEventListener('animationstart', started);
      shadows.forEach((s) => s.detach());
    };
  }, [rootRef, elevation]);
}

/** What can take focus in a card. */
const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** What a content ghost keeps of its own card: the notification's color properties. */
const CARRY = [
  '--fb-bg',
  '--fb-fg',
  '--fb-fg-2',
  '--fb-status',
  '--fb-status-low',
  '--fb-status-inverse',
];

/**
 * A card's frame colors as they will be in front (undimmed) — the end of a
 * leaving front's turn. Read with the card's transition held, so reading
 * doesn't start it.
 */
function frontColorsOf(
  el: HTMLElement
): { backgroundColor: string; boxShadow: string } | null {
  const frame = el.querySelector<HTMLElement>(':scope > [data-snap-frame]');
  if (!frame) return null;
  const dim = el.style.getPropertyValue('--deck-dim');
  frame.style.transition = 'none';
  el.style.setProperty('--deck-dim', '0%');
  const c = getComputedStyle(frame);
  const colors = { backgroundColor: c.backgroundColor, boxShadow: c.boxShadow };
  el.style.setProperty('--deck-dim', dim);
  void frame.offsetWidth;
  frame.style.transition = '';
  return colors;
}

/** What the deck's own CSS transitions run on a card's parts (its height and fade, the frame's insets and colors, the content's and the ring's fades). */
const DECK_PROPS = new Set([
  'top',
  'right',
  'bottom',
  'left',
  'height',
  'opacity',
  'backgroundColor',
  'boxShadow',
]);
const kebab = (p: string) => p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * Hands a card's parts from the stack's animations to the deck's transitions
 * as the card changes its place in the deck (front to peek, front to the
 * open list …). A Web Animation holds its property over any CSS transition:
 * none starts under it, and when it ends the property jumps to where the deck
 * put it — the inset of a card pushed back while still snapping in (6px in
 * one frame), the content of a card pushed back mid-swap (full to none in one
 * frame). So each running snap or swap animation that only moves the deck's
 * properties is committed where it is and cancelled; the caller then lays the
 * card out and calls the returned function, which lets go of the committed
 * values: each transition runs from where the animation left it. The clip,
 * the content's offset and the soft edge (no transition of the deck's) play
 * on. Returns null when nothing was handed over.
 */
function handOff(el: HTMLElement): (() => void) | null {
  const parts = [
    el,
    el.querySelector<HTMLElement>(':scope > [data-snap-frame]'),
    el.querySelector<HTMLElement>(':scope > .fb-n__body'),
    ...el.querySelectorAll<HTMLElement>(':scope > [data-stack-persist]'),
  ].filter((p): p is HTMLElement => !!p);
  const held: [HTMLElement, string[]][] = [];
  for (const part of parts) {
    const props = new Set<string>();
    for (const a of part.getAnimations()) {
      if (
        (a.id !== 'snap' && a.id !== 'stack-swap') ||
        a.playState !== 'running' ||
        !(a.effect instanceof KeyframeEffect)
      )
        continue;
      const keys = [
        ...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k))),
      ].filter(
        (k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)
      );
      if (!keys.length || !keys.every((k) => DECK_PROPS.has(k))) continue;
      try {
        a.commitStyles();
      } catch {
        /* not rendered: nothing to hold */
      }
      a.cancel();
      keys.forEach((k) => props.add(kebab(k)));
    }
    if (props.size) held.push([part, [...props]]);
  }
  if (!held.length) return null;
  // The committed values are the transitions' start.
  held.forEach(([part]) => getComputedStyle(part).opacity);
  return () =>
    held.forEach(([part, props]) =>
      props.forEach((p) => part.style.removeProperty(p))
    );
}

/** A swap's content ghosts in a card, faded out from where they are over `ms`: the deck opened under a swap. Returns how long the fade takes (0: none was showing). */
function fadeGhosts(el: HTMLElement, ms: number): number {
  let longest = 0;
  el.querySelectorAll<HTMLElement>(':scope > [data-stack-ghost]').forEach(
    (g) => {
      const op = Number(getComputedStyle(g).opacity);
      if (op < 0.01) {
        g.getAnimations().forEach((a) => a.cancel());
        return g.remove();
      }
      // A copy fades: cancelled, the earlier fade removes its own ghost, which would drop this one at once.
      const copy = g.cloneNode(true) as HTMLElement;
      copy.style.opacity = String(op);
      g.replaceWith(copy);
      g.getAnimations().forEach((a) => a.cancel());
      const d = ms * op;
      longest = Math.max(longest, d);
      copy
        .animate([{ opacity: op }, { opacity: 0 }], {
          duration: d,
          easing: 'linear',
          fill: 'forwards',
        })
        .finished.then(
          () => copy.remove(),
          () => copy.remove()
        );
    }
  );
  return longest;
}

/** A front still snapping in, as it is now: what a card taking its place continues from. */
interface Takeover {
  insets: [number, number, number, number];
  height: number;
  shift: { x: number; y: number };
}

function takeoverOf(over: HTMLElement): Takeover | null {
  if (!snapAnimations(over).length) return null;
  const frame = over.querySelector<HTMLElement>(':scope > [data-snap-frame]');
  const body = over.querySelector<HTMLElement>(':scope > .fb-n__body');
  if (!frame) return null;
  const fs = getComputedStyle(frame);
  const tr = body ? getComputedStyle(body).translate : 'none';
  const [x = 0, y = 0] =
    !tr || tr === 'none' ? [] : tr.split(/\s+/).map((v) => parseFloat(v) || 0);
  return {
    insets: [fs.top, fs.right, fs.bottom, fs.left].map(
      (v) => parseFloat(v) || 0
    ) as Takeover['insets'],
    height: over.offsetHeight,
    shift: { x, y },
  };
}

export function ToastStack({
  onMissed,
  cap = 3,
  swipe = true,
  frontChange = 'swap',
  children,
  stackClassName,
  corners,
  shadow,
  ...rest
}: ToastStackProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useDeckShadows(rootRef, useSurfaceShadow(shadow));
  const { timeScale, reduced } = useFeedbackMotion();
  const onMissedRef = useRef(onMissed);
  useLayoutEffect(() => {
    onMissedRef.current = onMissed;
  });
  const missed = useCallback(
    (e: Entry) =>
      onMissedRef.current?.({ ...e.props, id: e.id, count: e.count }),
    []
  );

  // The deck's move clock: the swap's, or the snap's. Under reduced motion
  // the reduced clock: the deck's fades and resizes are shorter, its travel
  // is gone (attachStack moves nothing; there is no deal).
  const swapping = frontChange === 'swap';
  const k = timeScale * reducedClock(reduced);
  const moveMs = Math.max(
    DURATION_FLOOR_MS,
    (swapping
      ? motionTokens.duration[DECK.swap.duration]
      : snapDurationMs(FEEDBACK_SNAP.in)) * k
  );
  const moveEase = swapping
    ? `cubic-bezier(${motionTokens.easing[DECK.swap.ease].join(', ')})`
    : snapEaseCss(FEEDBACK_SNAP.ease);
  const moveMsRef = useRef(moveMs);
  useLayoutEffect(() => {
    moveMsRef.current = moveMs;
  });

  // What a screen reader hears (rule 11, one announcement per change): two
  // live regions there from the start — a toast's own role on a card
  // inserted with its text is often not read — the polite one for `status`
  // and `log`, the assertive one for `alert`. Changes within ANNOUNCE_MS are
  // one announcement (a burst, a group's members, an update by id), and an
  // update that says the same thing says nothing.
  const entriesRef = useRef(entries);
  useLayoutEffect(() => {
    entriesRef.current = entries;
  });
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const spoken = useRef(new Map<string, string>());
  const pending = useRef(
    new Map<string, { text: string; assertive: boolean }>()
  );
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announce = useCallback((key: string, toast: ToastInput) => {
    const text = [
      toast.title,
      typeof toast.subtitle === 'string' ? toast.subtitle : null,
      toast.caption,
    ]
      .filter(Boolean)
      .join('. ');
    // Focused on arrival, a dialog is read as it takes focus.
    const focused =
      toast.type === 'actionable' &&
      (toast.role ?? 'alertdialog') === 'alertdialog' &&
      (toast.hasFocus ?? true);
    const showing = entriesRef.current.some(
      (e) => (e.group ?? e.id) === key && !e.leaving && !e.evicted
    );
    if (!showing) spoken.current.delete(key);
    if (!text || focused || spoken.current.get(key) === text) return;
    spoken.current.set(key, text);
    pending.current.set(key, { text, assertive: toast.role === 'alert' });
    if (announceTimer.current) clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => {
      announceTimer.current = null;
      const all = [...pending.current.values()];
      pending.current.clear();
      const say = (el: HTMLDivElement | null, lines: string[]) => {
        if (!el || !lines.length) return;
        // Emptied first, so the same words again are a change.
        el.textContent = '';
        requestAnimationFrame(() => (el.textContent = lines.join(' ')));
      };
      say(
        assertiveRef.current,
        all.filter((a) => a.assertive).map((a) => a.text)
      );
      say(
        politeRef.current,
        all.filter((a) => !a.assertive).map((a) => a.text)
      );
    }, ANNOUNCE_MS);
  }, []);
  useEffect(
    () => () => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
    },
    []
  );

  const show = useCallback<Toasts['show']>(
    (toast, opts) => {
      const { id: given, group, ...props } = toast;
      const id = given ?? `toast-${++seq}`;
      announce(group ?? id, props as ToastInput);
      setEntries((list) => {
        const live = (e: Entry) => !e.evicted && !e.leaving;
        const byId = list.findIndex((e) => e.id === id && live(e));
        const byGroup =
          byId < 0 && group
            ? list.findIndex((e) => e.group === group && live(e))
            : -1;
        const at = byId >= 0 ? byId : byGroup;
        // A group's newest member comes to the front. Already the front, it
        // updates in place, as an update by id does wherever it is.
        const newest = list.filter(live).at(-1);
        if (at >= 0 && (byGroup < 0 || list[at] === newest)) {
          const e = list[at]!;
          const next = {
            ...e,
            props: props as ToastInput,
            version: e.version + 1,
            count: byGroup >= 0 ? e.count + 1 : e.count,
          };
          return list.map((x, i) => (i === at ? next : x));
        }
        // A group's card behind the front: it doesn't climb over the front.
        // Its newest
        // member arrives as a new card — the front's swap, as any arrival —
        // its count rolling on from the old card's, and the old card fades
        // at the back as an evicted one does (not missed: it is still shown).
        const regroup = at >= 0 ? list[at]! : null;
        const next: Entry[] = [
          ...list.map((x) =>
            x === regroup ? { ...x, evicted: true, merged: true } : x
          ),
          {
            key: `e${++seq}`,
            id: regroup?.id ?? id,
            group,
            props: props as ToastInput,
            count: regroup ? regroup.count + 1 : 1,
            countFrom: regroup?.count,
            from: opts?.from,
            version: 0,
            closeReq: 0,
            evicted: false,
            leaving: false,
          },
        ];
        // Past the cap: the oldest still showing goes to the back and fades —
        // the oldest that can wait: an error or a toast asking for action is
        // never pushed out by newer ones; it persists until dealt with
        // (principle 9). Only if every card is one does the oldest go.
        const showing = next.filter(live);
        const over = showing.length - cap;
        if (over <= 0) return next;
        const persists = (e: Entry) =>
          e.props.kind === 'error' || e.props.type === 'actionable';
        const order = [
          ...showing.slice(0, -1).filter((e) => !persists(e)),
          ...showing.slice(0, -1).filter(persists),
        ];
        const old = new Set(order.slice(0, over).map((e) => e.key));
        return next.map((e) => (old.has(e.key) ? { ...e, evicted: true } : e));
      });
      return id;
    },
    [cap, announce]
  );

  // An evicted toast is counted now and removed once the move has run. Each
  // has its own timer, kept across later evictions (a shared one, cleared by
  // the next eviction, left earlier cards in the deck for good — hidden, but
  // there).
  const evictedIds = entries
    .filter((e) => e.evicted)
    .map((e) => e.key)
    .join(',');
  const counted = useRef(new Set<string>());
  const evictTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const fresh = entries.filter(
      (e) => e.evicted && !counted.current.has(e.key)
    );
    if (!fresh.length) return;
    fresh.forEach((e) => {
      counted.current.add(e.key);
      if (!e.merged) missed(e);
    });
    const keys = new Set(fresh.map((e) => e.key));
    const t = setTimeout(() => {
      evictTimers.current.delete(t);
      setEntries((list) => list.filter((e) => !keys.has(e.key)));
    }, moveMsRef.current);
    evictTimers.current.add(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new eviction
  }, [evictedIds]);
  useEffect(
    () => () => {
      evictTimers.current.forEach(clearTimeout);
    },
    []
  );

  const close = useCallback(
    (id: string) =>
      setEntries((list) =>
        list.map((e) => (e.id === id ? { ...e, closeReq: e.closeReq + 1 } : e))
      ),
    []
  );
  const api = useMemo(() => ({ show, close }), [show, close]);

  /* ── the deck ──────────────────────────────────────────────────────── */

  const wasOpen = useRef(open);
  // Settling after a layout transaction: in place at once (the container's move showed it).
  const settling = useRef(false);
  // Each card's height as last laid out: a resize's travel.
  const lastNatural = useRef(new WeakMap<HTMLElement, number>());
  const layout = useCallback(
    (opts?: { resize?: boolean }) => {
      const root = rootRef.current;
      if (!root) return;
      const stack = stackOf(root);
      const all = Array.from(
        root.querySelectorAll<HTMLElement>(':scope > [data-stack-item]')
      );
      // Leaving cards stay where they are, on top, snapping out; evicted ones
      // go to the back; the rest take their places in order, newest first.
      const leaving = all.filter(
        (el) => stack?.isLeaving(el) || el.hasAttribute('data-deck-leaving')
      );
      const evicted = all.filter(
        (el) => !leaving.includes(el) && el.hasAttribute('data-evicted')
      );
      const items = all.filter(
        (el) => !leaving.includes(el) && !evicted.includes(el)
      );
      const natural = items.map(
        (el) =>
          el.querySelector<HTMLElement>('.fb-n__body')?.offsetHeight ??
          el.offsetHeight
      );
      const front = natural[0] ?? 0;
      const isOpen = open && items.length > 0;

      // One clock for every part: the swap's (or the snap's) when something
      // arrives or leaves; the deal when the deck opens or closes.
      const toggled = wasOpen.current !== isOpen;
      wasOpen.current = isOpen;
      const tops: number[] = [];
      let y = 0;
      items.forEach((_, i) => {
        tops.push(isOpen ? y : Math.min(i, DECK.peek) * DECK.offset);
        y += natural[i]! + DECK.gap;
      });
      // Where each card is on screen now, before anything moves (a deal turns round from there).
      const rootTop = root.getBoundingClientRect().top;
      const starts = items.map(
        (el) => el.getBoundingClientRect().top - rootTop
      );
      const deal =
        toggled && !reduced && items.length > 1 && !settling.current
          ? dealOf(starts, tops, isOpen, timeScale)
          : null;
      // A card's words changed height (an update on another line), nothing
      // else: duration follows travel, as the
      // notification's own wait for it does — not the
      // arrival's swap clock.
      const travel = Math.max(
        0,
        ...items.map((el, i) =>
          Math.abs(natural[i]! - (lastNatural.current.get(el) ?? natural[i]!))
        )
      );
      items.forEach((el, i) => lastNatural.current.set(el, natural[i]!));
      const resizeMs =
        opts?.resize && !toggled && travel >= 0.5
          ? Math.max(
              DURATION_FLOOR_MS,
              motionTokens.duration[durationStepForDistance(travel)] * k
            )
          : null;
      const ms = settling.current ? 0 : (resizeMs ?? moveMs);
      root.style.setProperty('--deck-ms', `${deal ? deal.ms : ms}ms`);
      root.style.setProperty('--deck-ease', deal ? DEAL_EASE_CSS : moveEase);
      // The colors turn early and fast on their own clock, whatever the move's.
      root.style.setProperty(
        '--deck-color-ms',
        `${Math.max(DURATION_FLOOR_MS, motionTokens.duration['fast-01'] * k)}ms`
      );

      // Opening under a swap: the ghost of the old front's words would sit in
      // the new front while the old front itself deals into the list below it —
      // the same words twice. They go at once (the deal's content fade), and
      // the new front's own content comes in after them (out, then in).
      const ghostMs =
        toggled && isOpen
          ? new Map(
              items.map((el) => [
                el,
                fadeGhosts(
                  el,
                  deal
                    ? deal.bodyMs
                    : Math.max(
                        DURATION_FLOOR_MS,
                        motionTokens.duration['fast-01'] * k
                      )
                ),
              ])
            )
          : null;
      const letGo: (() => void)[] = [];
      items.forEach((el, i) => {
        const back = Math.min(i, DECK.peek);
        const now = isOpen
          ? 'open'
          : i === 0
            ? 'front'
            : i <= DECK.peek
              ? 'peek'
              : 'hidden';
        // A new place in the deck: the transitions take over from the stack's animations, from where they are.
        if (el.dataset.deck && el.dataset.deck !== now) {
          const release = handOff(el);
          if (release) letGo.push(release);
        }
        // A dealt card sizes up as it lands in its slot (or down as the stack
        // gathers it); otherwise every part runs on the move's own clock.
        el.style.setProperty('--deck-delay', deal ? `${deal.at[i]}ms` : '0ms');
        el.style.setProperty(
          '--deck-size-ms',
          deal ? `${deal.sizeMs}ms` : `${ms}ms`
        );
        // Its content: in a deal, a quick fade that ends as the card lands.
        // Covered by a new front (the swap), at once: the new front carries
        // its words as a ghost, fading on the swap's out beat; this card's own
        // copy, faded over the whole move, would stay in view below a shorter
        // new front while the new words come in.
        const covered =
          swapping &&
          !isOpen &&
          el.dataset.deck === 'front' &&
          (now === 'peek' || now === 'hidden');
        el.style.setProperty(
          '--deck-body-ms',
          deal ? `${deal.bodyMs}ms` : covered ? '0ms' : `${ms}ms`
        );
        el.style.setProperty(
          '--deck-body-delay',
          `${Math.max(deal ? Math.max(0, deal.at[i]! - deal.bodyMs * 1.5) : 0, ghostMs?.get(el) ?? 0)}ms`
        );
        el.style.top = `${tops[i]}px`;
        el.style.height = `${isOpen ? natural[i] : front}px`;
        el.dataset.deck = now;
        // Only what can be seen can be reached: the cards behind are inert
        // until the deck opens (focusing the front opens it).
        el.inert = !isOpen && i > 0;
        el.style.setProperty(
          '--deck-inset',
          isOpen ? '0px' : `${back * DECK.inset}px`
        );
        el.style.setProperty(
          '--deck-dim',
          isOpen ? '0%' : `${(DECK.dim[back] ?? 0) * 100}%`
        );
        // Even: each card's shadow sits one under it (`useDeckShadows`).
        el.style.zIndex = String(2 * (items.length - i + 1));
        // Shown behind a newer card in the same commit (a burst at once): it
        // didn't snap in on its own; it fades in at its place, once the front
        // has landed (beside a front still snapping in, its edges would show).
        if (el.hasAttribute('data-deck-quiet')) {
          el.removeAttribute('data-deck-quiet');
          // It is simply at its place: measured once already (its height,
          // above), it would otherwise transition there from a front's look —
          // its text fading out, its frame drawing in.
          void getComputedStyle(el).opacity;
          el.getAnimations({ subtree: true }).forEach(
            (a) => a instanceof CSSTransition && a.finish()
          );
          const landing = reduced
            ? 0
            : Math.max(
                0,
                ...snapAnimations(items[0] ?? null).map(
                  (a) =>
                    (Number(a.effect?.getComputedTiming().endTime ?? 0) -
                      Number(a.currentTime ?? 0)) /
                    (a.playbackRate || 1)
                )
              );
          if (now === 'peek' || now === 'open')
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: moveMs,
              delay: landing,
              easing: moveEase,
              fill: 'backwards',
              id: 'deck-fade',
            });
        }
      });
      evicted.forEach((el) => {
        if (el.dataset.deck !== 'hidden') {
          const release = handOff(el);
          if (release) letGo.push(release);
        }
        el.style.top = `${isOpen ? y : DECK.peek * DECK.offset}px`;
        el.dataset.deck = 'hidden';
        el.style.zIndex = '0';
        el.inert = true;
      });
      leaving.forEach((el) => {
        // Only a closed deck's front leaves on top, where it is (it turns to the
        // card behind, or is alone). Any other card leaves BEHIND the cards in
        // place (z 2; theirs are 4 and up, even, their shadows odd): behind the front, it would flash
        // over its text (the blink on exit); in the open list, the cards below
        // rise over it as it shrinks, so they never cross see-through.
        el.style.zIndex =
          el.dataset.deck === 'front' ? String(2 * (all.length + 2)) : '2';
        el.inert = true;
      });
      root.style.height = isOpen
        ? `${Math.max(0, y - DECK.gap)}px`
        : `${front + Math.min(Math.max(0, items.length - 1), DECK.peek) * DECK.offset}px`;
      // Laid out: the handed-over parts let go of where the animations were, and transition on from there.
      letGo.forEach((f) => f());
      if (deal) {
        items.forEach((el, i) => {
          el.getAnimations().forEach((x) => x.id === 'stack-gap' && x.cancel());
          el.animate(deal.tracks[i]!, {
            duration: deal.ms,
            easing: 'linear',
            id: 'stack-gap',
          });
        });
        stack?.measure();
      } else if (settling.current) stack?.measure();
      else stack?.reflow({ ms, easing: moveEase });
    },
    [open, moveMs, moveEase, timeScale, reduced, k, swapping]
  );

  // The swap: a new card over the front showing, a front leaving with another behind it.
  const openRef = useRef(open);
  useLayoutEffect(() => {
    openRef.current = open;
  });
  const frontEl = (): HTMLElement | null => {
    const root = rootRef.current;
    const stack = stackOf(root);
    return (
      Array.from(
        root?.querySelectorAll<HTMLElement>(':scope > [data-deck="front"]') ??
          []
      ).find(
        (el) => !stack?.isLeaving(el) && !el.hasAttribute('data-deck-leaving')
      ) ?? null
    );
  };
  // A front still snapping in when the next card takes its place: the new
  // card goes on growing from where the front had got to (read here, played
  // as it arrives), instead of standing at full size over it at once.
  const takeover = useRef<Takeover | null>(null);
  const swapIn = (): StackSwap | null => {
    takeover.current = null;
    if (!swapping || openRef.current) return null;
    const over = frontEl();
    if (!over) return null;
    if (!reduced) takeover.current = takeoverOf(over);
    return { ms: moveMs, easing: moveEase, over, carry: CARRY };
  };
  const arrived = (el: HTMLElement) => {
    const t = takeover.current;
    takeover.current = null;
    if (!t) return;
    const frame = el.querySelector<HTMLElement>(':scope > [data-snap-frame]');
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!frame || !w || !h) return;
    // The front's drawn rect, in this card's box: the same top and sides, the same visible height.
    const [top, right, bottom, left] = t.insets;
    const seen = t.height - top - bottom;
    const insets: [number, number, number, number] = [
      top,
      right,
      Math.max(0, h - top - seen),
      left,
    ];
    const from: SnapLive = {
      scale: 1 - (left + right) / w,
      opacity: 1,
      shift: t.shift,
      scale2: { x: 1 - (left + right) / w, y: 1 - (insets[0] + insets[2]) / h },
      insets,
    };
    // The snap carries the height now: the swap's own height move would fight it for the clip and the frame's edge.
    const moves = (a: Animation, prop: string) =>
      a.id === 'stack-swap' &&
      a.effect instanceof KeyframeEffect &&
      a.effect.getKeyframes().some((kf) => prop in kf);
    el.getAnimations().forEach((a) => moves(a, 'clipPath') && a.cancel());
    frame.getAnimations().forEach((a) => moves(a, 'bottom') && a.cancel());
    snapIn(el, { x: w / 2, y: 0 }, false, {
      profile: snapProfileFor('notification'),
      from,
    });
    if (timeScale !== 1)
      snapAnimations(el).forEach((a) => (a.playbackRate = 1 / timeScale));
  };
  const swapOut = (el: HTMLElement | null): StackSwap | null => {
    // Inside a layout transaction the swap still runs: its content fades at
    // once, its turn to the card behind waits for the end (attachStack's
    // leave), with the deck's queued move.
    if (!swapping || openRef.current || !el || el !== frontEl()) return null;
    const to =
      rootRef.current?.querySelector<HTMLElement>(
        ':scope > [data-deck="peek"]:not([data-evicted]):not([data-deck-leaving])'
      ) ?? null;
    if (!to) return null;
    // Its shadow fades as the card behind rises with its own (`useDeckShadows`): one shadow throughout, none left over.
    el.setAttribute('data-deck-swapout', '');
    return {
      ms: moveMs,
      easing: moveEase,
      to,
      toColors: frontColorsOf(to),
      carry: CARRY,
    };
  };
  // A card behind the front that times out (or is closed by `close(id)`)
  // fades where it is, at the back, as an evicted card does. Snapping out, it
  // went to full width first (the snap owns the frame's insets): its lip
  // jumped 6px wider a side, then folded up.
  const leaveBehind = (el: HTMLElement | null): Promise<void> | null => {
    if (
      !el ||
      openRef.current ||
      (el.dataset.deck !== 'peek' && el.dataset.deck !== 'hidden')
    )
      return null;
    stackOf(rootRef.current)?.stopTimer(el);
    el.setAttribute('data-deck-leaving', '');
    el.inert = true;
    const fade = el.animate(
      [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }],
      {
        duration: moveMsRef.current,
        easing: moveEase,
        fill: 'forwards',
        id: 'deck-fade',
      }
    );
    return fade.finished.then(
      () => void (el.style.visibility = 'hidden'),
      () => undefined
    );
  };

  // After every commit (a toast added, leaving, removed, reordered or updated) and on resize.
  //
  // While a layout transaction moves the deck's container (a hold): a
  // commit that changes nothing of the
  // deck's own (a re-render) re-lays it in place; a real change — a toast
  // arriving, leaving, evicted, the deck opening or closing — is QUEUED:
  // the cards stay where they are, and when the
  // transaction ends the deck makes one move to its new layout, from where
  // it is then, on its own clock. However many changes came in, one move. A
  // closed toast's own exit still answers at once (the person asked): with
  // the swap, its content fades now and its turn to the card behind plays
  // at the end with the others' move.
  const deckSig = `${open}|${entries.map((e) => `${e.key}${e.leaving ? 'L' : ''}${e.evicted ? 'E' : ''}`).join(',')}`;
  const laidSig = useRef(deckSig);
  const queued = useRef(false);
  const deckSigRef = useRef(deckSig);
  useLayoutEffect(() => {
    deckSigRef.current = deckSig;
    if (!inLayout(rootRef.current)) {
      queued.current = false;
      laidSig.current = deckSig;
      return layout();
    }
    if (queued.current || deckSig !== laidSig.current) {
      queued.current = true;
      return;
    }
    settling.current = true;
    layout();
    settling.current = false;
  });
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver !== 'function') return;
    // While a layout transaction moves the deck's container, a resize re-lays the deck in place,
    // never with a move of its own; it settles once, in place, when the transaction ends.
    const inPlace = () => {
      // A queued change: the cards stay where they are until the end.
      if (queued.current) return;
      settling.current = true;
      layout();
      settling.current = false;
    };
    // The settle: the queued change as one move, or in place.
    const settle = () => {
      if (!queued.current) return inPlace();
      queued.current = false;
      laidSig.current = deckSigRef.current;
      layout();
    };
    const hold = holdLayout(root, settle);
    const ro = new ResizeObserver(() =>
      hold.holding() ? inPlace() : layout({ resize: true })
    );
    // Each body once, and let go of it when it leaves: observing one again re-reports its
    // size (a layout per mutation), and the stack lives as long as the app.
    const observed = new Set<Element>();
    const watch = () => {
      const bodies = new Set(root.querySelectorAll('.fb-n__body'));
      for (const b of observed) {
        if (bodies.has(b)) continue;
        ro.unobserve(b);
        observed.delete(b);
      }
      for (const b of bodies) {
        if (observed.has(b)) continue;
        ro.observe(b);
        observed.add(b);
      }
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      observed.clear();
      mo.disconnect();
      hold.detach();
    };
  }, [layout]);

  // Hover or focus opens it; leaving closes it after a beat.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hold = (on: boolean) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    if (on) setOpen(true);
    else closeTimer.current = setTimeout(() => setOpen(false), DECK.closeDelay);
  };
  // The pointer is still over the open deck's box when the card under it
  // goes (closed, it turns inert and folds away; the stack itself takes no
  // pointer): the deck stays open while the pointer is inside its box, and
  // closes once it leaves — not under the pointer, mid-list (closing a card
  // in the middle gathered the whole deck when the card below hadn't yet
  // risen under the pointer).
  const watch = useRef<((e: PointerEvent) => void) | null>(null);
  const unwatch = () => {
    if (watch.current)
      document.removeEventListener('pointermove', watch.current);
    watch.current = null;
  };
  const inside = (x: number, y: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  const pointerLeft = (e: { clientX: number; clientY: number }) => {
    unwatch();
    if (!openRef.current || !inside(e.clientX, e.clientY)) return hold(false);
    const onMove = (m: PointerEvent) => {
      if (inside(m.clientX, m.clientY)) return;
      unwatch();
      hold(false);
    };
    watch.current = onMove;
    document.addEventListener('pointermove', onMove);
  };
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      unwatch();
    },
    []
  );
  // Touch: a tap anywhere else closes the open deck.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (
        e.pointerType === 'touch' &&
        !rootRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  // Newest first: the front card is the first child.
  const ordered = [...entries].reverse();
  const liveKeys = ordered
    .filter((e) => !e.leaving && !e.evicted)
    .map((e) => e.key);

  // Focus that leaves with a card (Notification's hand-off): the next card
  // in the open deck takes it — the one below, else the one above — or it
  // goes back to where it was before it came into the stack.
  const entryFocus = useRef<HTMLElement | null>(null);
  const focusAfter = (el: HTMLElement): HTMLElement | null => {
    const root = rootRef.current;
    const stack = stackOf(root);
    const cards = Array.from(
      root?.querySelectorAll<HTMLElement>(':scope > [data-stack-item]') ?? []
    );
    const at = cards.indexOf(el);
    const can = (c: HTMLElement) =>
      c !== el &&
      !c.inert &&
      !stack?.isLeaving(c) &&
      !c.hasAttribute('data-evicted') &&
      !c.hasAttribute('data-deck-leaving');
    const next =
      cards.slice(at + 1).find(can) ??
      cards.slice(0, Math.max(0, at)).reverse().find(can);
    return next?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
  };

  return (
    <ToastsContext.Provider value={api}>
      {children}
      <StackHost
        {...rest}
        hostRef={rootRef}
        data-front-change={frontChange}
        className={['fb-stack', 'fb-deck', stackClassName]
          .filter(Boolean)
          .join(' ')}
        swipe={swipe ? { axis: 'x', toward: 1 } : false}
        origin="top"
        // A landmark only while it holds toasts: an empty one is noise in the landmarks list.
        role={entries.length ? 'region' : undefined}
        aria-label={entries.length ? 'Notifications' : undefined}
        onClick={(e) => {
          // Touch has no hover: a tap on the deck opens it, a tap on an open card's text closes it.
          if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') return;
          if ((e.target as Element).closest('button, a, [role="button"]'))
            return;
          setOpen((o) => !o);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'touch') return;
          unwatch();
          hold(true);
        }}
        onPointerLeave={(e) => e.pointerType !== 'touch' && pointerLeft(e)}
        onFocus={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            entryFocus.current = e.relatedTarget as HTMLElement | null;
          hold(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            hold(false);
        }}>
        {ordered.map((e) => {
          const rank = liveKeys.indexOf(e.key);
          const slot: ToastSlot = {
            cardKey: e.key,
            from: e.from,
            evicted: e.evicted,
            version: e.version,
            closeReq: e.closeReq,
            leaving: (wasMissed) => {
              if (wasMissed) missed(e);
              setEntries((list) =>
                list.map((x) => (x.key === e.key ? { ...x, leaving: true } : x))
              );
            },
            done: () =>
              setEntries((list) => list.filter((x) => x.key !== e.key)),
            swapIn,
            // Mounted behind a newer card in the same commit (a burst at once): no arrival of its own.
            quiet: (el) => {
              if (openRef.current || rank <= 0) return false;
              el.setAttribute('data-deck-quiet', '');
              return true;
            },
            arrived,
            swapOut,
            leaveBehind,
            countFrom: e.countFrom,
            countClock: () => ({ ms: moveMsRef.current, easing: moveEase }),
            // No beat when the card it takes over shows the same mark, or is itself still mid-swap (the card updates; it doesn't replay).
            sameMark: (key) => {
              const front = swapping && !openRef.current ? frontEl() : null;
              return (
                !!front &&
                (front.dataset.mark === key ||
                  front
                    .getAnimations({ subtree: true })
                    .some(
                      (a) => a.id === 'stack-swap' && a.playState === 'running'
                    ))
              );
            },
            beatAfter: () =>
              swapping && !openRef.current && frontEl()
                ? motionTokens.duration[DECK.swap.duration]
                : null,
            focusAfter,
            entryFocus: () => entryFocus.current,
          };
          const { type, ...p } = e.props as ToastInput & { type?: string };
          return (
            <ToastSlotContext.Provider key={e.key} value={slot}>
              {type === 'actionable' ? (
                <ActionableNotification
                  corners={corners}
                  {...(p as ActionableNotificationProps)}
                  inline={false}
                />
              ) : (
                <ToastNotification
                  corners={corners}
                  {...(p as ToastNotificationProps)}
                  count={e.count}
                />
              )}
            </ToastSlotContext.Provider>
          );
        })}
      </StackHost>
      <div ref={politeRef} className="fb-stack__live" role="status" />
      <div ref={assertiveRef} className="fb-stack__live" role="alert" />
    </ToastsContext.Provider>
  );
}
