/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentType,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type ReactNode,
} from 'react';
import {
  animateLayout,
  attachRollover,
  durationStepForDistance,
  motionTokens,
  playContentSwap,
  DURATION_FLOOR_MS,
  type StackSource,
  type StackSwap,
} from '@carbon-labs/v12-motion';
import { Close } from '@carbon-labs/react-motion-icons';
import { IconButton } from '@carbon-labs/react-tooltip';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { StackHost, useStackItem } from '@carbon-labs/react-feedback';
import { CountPill, type CountClock } from '@carbon-labs/react-feedback';
import {
  StatusMark,
  type ActionIcon,
  type FeedbackKind,
} from '@carbon-labs/react-feedback';
import './notification.scss';
import { useReducedGetter } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';
import type { NodeRef } from '@carbon-labs/react-util';
import { IN_DEVELOPMENT } from '@carbon-labs/react-util';

/* ============================================================================
 * Notifications — Carbon v11's InlineNotification, ToastNotification,
 * ActionableNotification and Callout, on the kit's look and motion.
 * ============================================================================
 *
 * The same API as `@carbon/react`: the six kinds (error, info, info-square,
 * success, warning, warning-alt) and their icons; `title`, `subtitle`,
 * `caption`; `lowContrast`, `hideCloseButton`, `role` ('alert' | 'log' |
 * 'status'), the toast's `timeout`; `onClose` (return false to stay open —
 * except on a timeout, as v11), `onCloseButtonClick`, `statusIconDescription`,
 * the close button's `aria-label`; the actionable notification's `inline`,
 * `hasFocus`, `closeOnEscape`, `actionButtonLabel`, `onActionButtonClick`, its
 * `alertdialog` role and focus wrap; the callout's `titleId`;
 * `StaticNotification` (Callout's deprecated alias), `NotificationButton`
 * and `NotificationActionButton`.
 *
 * The kit adds:
 *
 *   arrive      the snap, from the top center: the container grows from 80%,
 *               the content slides on y, nothing else moves (principle 9).
 *               `from` opts into growing from a control
 *   leave       the floating-surface standard: the far
 *               edge folds back into the top center it grew from, on the
 *               snap's own clock. In a ToastStack, a toast that times out is
 *               counted in the bell as it leaves (`ToastStack`)
 *   beat        the status mark plays its motion-icon once it has landed;
 *               `icon` carries an action icon that loads in with its status
 *               (`StatusMark`); a change of kind is a match cut
 *   timer       a toast's timeout you can see, nested in the content — a bar
 *               under the text, or a ring round the close button; hover or
 *               focus anywhere in the stack pauses it (WCAG 2.2.1)
 *   swipe       in a ToastStack, a toast can be swiped off toward the screen
 *               edge; it settles back if you let go early
 *   look        a plain surface whose outline, in the status color, says the
 *               kind — no tinted fill; a toast casts the
 *               floating surfaces' shadow, `variant` picks the
 *               family's outlined / inverse / tonal
 *   contrast    low contrast by default; errors and actionable notifications
 *               high. `variant` names it outright
 *   inline      an inline notification opens its place in the page as it
 *               arrives and closes it as it leaves, on one clock — a layout
 *               transaction, so what is below it follows on that clock
 *   hover       the close and action buttons take the rollover (slide off to
 *               cancel); the close is the family's IconButton, a motion icon
 *   focus       closed with focus inside, focus moves on (the next toast, or
 *               back where it came from) instead of falling to the page
 *   update      new words in place (an update by id, a group's next member):
 *               the content swap in place, out then in; the status turns on the
 *               empty card between them, and so does a change of height (by
 *               its travel). No frame shows both
 *
 * Fixed from v11: the actionable notification focuses its OWN action button
 * (v11 queries the whole document for the first one); interactive content
 * in a toast or inline notification is reported in the console instead of
 * thrown.
 * ========================================================================== */

export type NotificationKind = FeedbackKind;
/** The selection family's styles: `outlined` (default), `inverse` (errors, actionable), `tonal`. */
export type NotificationVariant = 'outlined' | 'inverse' | 'tonal';
/** Where a toast's timeout shows — a bar under its text, or a ring round its close button. */
export type TimerStyle = 'bar' | 'ring';
/** The family's corner modes: `rounded` (8px, default), `full` (pill controls in a concentric frame, half of 48px), `square` (none). */
export type NotificationCorners = 'full' | 'rounded' | 'square';

/* ── a toast stack's item, when there is one ────────────────────────────── */

export interface ToastSlot {
  /** The card's key in its stack, stable for its life (`data-stack-key`): what names it to its shadow, the inspector and tests. */
  cardKey?: string;
  /** The cause it grows from. */
  from?: StackSource;
  /** Pushed past the cap: the deck takes it to the back, where it fades, and removes it. */
  evicted: boolean;
  /** Bumped by an update in place (`show` with the same id): restart the timer. */
  version: number;
  /** Bumped by `close(id)`: close as if its close button were pressed. */
  closeReq: number;
  /**
   * It has started to leave — the deck moves the others on the same frame,
   * as one move. `missed`: it timed out, and goes to the bell's count now.
   */
  leaving: (missed: boolean) => void;
  /** It has gone — remove it. */
  done: () => void;
  /** Arriving over a front already showing: take its place (the swap) rather than snap. */
  swapIn: () => StackSwap | null;
  /** Mounting behind a newer card from the same commit: no arrival of its own (the deck fades it in). */
  quiet: (el: HTMLElement) => boolean;
  /** It has arrived: the deck finishes what the stack's arrival doesn't (a takeover of a front still snapping in). */
  arrived: (el: HTMLElement) => void;
  /** Leaving the front with another card to take its place: fade where it is (the swap). */
  swapOut: (el: HTMLElement | null) => StackSwap | null;
  /** Leaving from behind the front: the deck fades it where it is (resolves when it has gone), or null. */
  leaveBehind: (el: HTMLElement | null) => Promise<void> | null;
  /** A group's card come back to the front as a new card: the count it rolls on from. */
  countFrom?: number;
  /** That roll's clock: the arrival's, so the count lands as the card does (one motion, one clock). */
  countClock?: () => CountClock;
  /** Arriving by the swap: the icon's beat waits this long (ms, unscaled) — the crossfade; null: the snap's. */
  beatAfter: () => number | null;
  /** Whether the front it takes the place of shows this same mark (kind and icon): then its icon has nothing to announce — no beat (stillness). */
  sameMark: (key: string) => boolean;
  /** Closing with focus inside it: the card focus moves to (the next one in the open deck), or null. */
  focusAfter: (el: HTMLElement) => HTMLElement | null;
  /** Where focus was before it entered the stack: where it goes back when no card is left to take it. */
  entryFocus: () => HTMLElement | null;
}

/** A key for a mark: its kind and its action icon, if any. */
const iconIds = new WeakMap<object, number>();
let iconSeq = 0;
function markKeyOf(kind: string, icon?: object | null): string {
  if (!icon) return kind;
  if (!iconIds.has(icon)) iconIds.set(icon, ++iconSeq);
  return `${kind}:${iconIds.get(icon)}`;
}

export const ToastSlotContext = createContext<ToastSlot | null>(null);

/* ── buttons ─────────────────────────────────────────────────────────────── */

export interface NotificationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default `"close notification"` — also its `title`, as v11. */
  'aria-label'?: string;
  /** The icon. Default the motion-icons Close. */
  renderIcon?: ComponentType<{ size?: 16 | 20 | 24 | 32; className?: string }>;
  notificationType?: 'toast' | 'inline' | 'actionable';
  name?: string;
}

/**
 * v11's close button, as the selection family's IconButton (ghost, sm 32px):
 * its 8px corners, the rollover on matched lightness, the motion-icons Close
 * playing on hover, and its label as a tooltip that snaps in — v11's
 * `aria-label` ("close notification") is the label.
 */
export const NotificationButton = forwardRef<
  HTMLButtonElement,
  NotificationButtonProps
>(function NotificationButton(
  {
    'aria-label': ariaLabel = 'close notification',
    className,
    type = 'button',
    renderIcon: Icon = Close,
    notificationType = 'toast',
    name,
    title: _title,
    ...rest
  },
  ref
) {
  void _title;
  const { timeScale } = useFeedbackMotion();
  return (
    <IconButton
      {...rest}
      ref={ref}
      type={type}
      name={name}
      frame="ghost"
      size="sm"
      align="bottom"
      label={ariaLabel}
      timeScale={timeScale}
      wrapperClasses={['fb-close', `fb-close--${notificationType}`, className]
        .filter(Boolean)
        .join(' ')}>
      <Icon size={16} />
    </IconButton>
  );
});

export interface NotificationActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ghost when inline, outlined on a toast (v11: ghost / tertiary). */
  inline?: boolean;
}

export const NotificationActionButton = forwardRef<
  HTMLButtonElement,
  NotificationActionButtonProps
>(function NotificationActionButton(
  { inline = false, className, type = 'button', children, ...rest },
  ref
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={[
        'fb-action',
        inline ? 'fb-action--ghost' : 'fb-action--outline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      {children}
    </button>
  );
});

/* ── the shared surface ─────────────────────────────────────────────────── */

type Variant =
  | 'toast'
  | 'inline'
  | 'actionable-toast'
  | 'actionable-inline'
  | 'callout';

interface SurfaceProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role'
> {
  kind: NotificationKind;
  title?: ReactNode;
  subtitle?: ReactNode;
  caption?: ReactNode;
  lowContrast?: boolean;
  styleVariant?: NotificationVariant;
  hideCloseButton?: boolean;
  role?: string;
  timeout?: number;
  onClose?: (evt?: ReactMouseEvent | KeyboardEvent) => boolean | void;
  onCloseButtonClick?: (evt: ReactMouseEvent) => void;
  statusIconDescription?: string;
  closeLabel?: string;
  action?: ReactNode;
  arrive?: boolean;
  from?: StackSource;
  titleId?: string;
  subtitleId?: string;
  variant: Variant;
  /** Interactive children are a mistake here (v11 throws; we report). */
  guardChildren?: 'none' | 'described';
  onKeyDownCapture?: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  surfaceRef?: NodeRef<HTMLDivElement>;
  icon?: ActionIcon;
  pending?: boolean;
  count?: number;
  timer?: TimerStyle;
  corners?: NotificationCorners;
}

/** A notification's words as they were shown: what an update in place swaps out. */
interface TextLayer {
  id: number;
  title?: ReactNode;
  subtitle?: ReactNode;
  caption?: ReactNode;
  count: number;
  /** Its words as text (`textSigOf`): what the next words are compared with. */
  sig: string;
}

/** What a notification shows of its status: held while an update's old words leave, so they never sit on the new status's surface. */
interface Look {
  kind: NotificationKind;
  icon?: ActionIcon;
  pending?: boolean;
}

let textSeq = 0;

/** The content swap in place (distance 0: no travel for words in a stack): the old words out on `fast-01`,
 * then the new in on `fast-02`, never both; reduced motion, a snap. `inDelay`: the swap's (`ContentSwapOptions`). */
function playSwapInPlace(
  out: HTMLElement,
  incoming: HTMLElement,
  timeScale: number,
  reduced: boolean,
  inDelay?: number
) {
  return playContentSwap({
    out,
    in: incoming,
    axis: 'y',
    direction: 1,
    distance: 0,
    timeScale,
    reduced,
    inDelay,
  });
}

/** What an update in place compares: the words (a subtitle that is a node, not text, counts as unchanged). */
/** The height moves an update makes: outside a deck, the body's own; in one, a wait as long as the deck's move. */
const RESIZE_ID = 'fb-resize';
const RESIZE_WAIT_ID = 'fb-resize-wait';

const textSigOf = (...parts: ReactNode[]) =>
  parts
    .map((p) =>
      typeof p === 'string' || typeof p === 'number'
        ? String(p)
        : p == null
          ? ''
          : '\u0000'
    )
    .join('\u0001');

/** The close button is a circle but in `square`, and so is its ring. */
const CIRCLE_RING = 'M16 1A15 15 0 1 1 16 31A15 15 0 1 1 16 1Z';

/** The timeout ring's path round the close button's 32px box, from its top center (stroke 2, so 1 in). */
const RING_PATH: Record<NotificationCorners, string> = {
  rounded: CIRCLE_RING,
  full: CIRCLE_RING,
  square: 'M16 1H31V31H1V1Z',
};

/**
 * The style, in the selection family's names: `outlined` —
 * the layer's own fill and the status hairline (low contrast); `inverse` —
 * the inverse surface (high contrast); `tonal` — a step up the layers
 * (`$layer-selected`, the kit's tonal) with the status hairline. Named
 * outright (`variant`), else v11's `lowContrast`
 * when given, else the kit's default: errors and actionable inverse,
 * the rest outlined.
 */
function variantOf(
  kind: NotificationKind,
  variant: Variant,
  style?: NotificationVariant,
  lowContrast?: boolean
): NotificationVariant {
  if (style) return style;
  if (lowContrast !== undefined) return lowContrast ? 'outlined' : 'inverse';
  return kind === 'error' || variant.startsWith('actionable')
    ? 'inverse'
    : 'outlined';
}

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function useChildrenGuard(
  ref: RefObject<HTMLElement | null>,
  mode: 'none' | 'described' | undefined,
  name: string
) {
  useEffect(() => {
    if (!mode || !IN_DEVELOPMENT) return;
    const text = ref.current?.querySelector('.fb-n__text');
    if (!text) return;
    const found = Array.from(text.querySelectorAll<HTMLElement>(FOCUSABLE));
    const bad =
      mode === 'none'
        ? found
        : found.filter((el) => !el.hasAttribute('aria-describedby'));
    if (bad.length)
      console.error(
        mode === 'none'
          ? `${name}: interactive content isn't allowed here (v11 throws). Use an ActionableNotification.`
          : `${name}: interactive content needs aria-describedby pointing at the title (v11 throws).`,
        bad
      );
  });
}

function Surface({
  kind,
  title,
  subtitle,
  caption,
  lowContrast,
  styleVariant,
  hideCloseButton = false,
  role,
  timeout = 0,
  onClose,
  onCloseButtonClick,
  statusIconDescription,
  closeLabel,
  action,
  arrive = true,
  from,
  titleId,
  subtitleId,
  variant,
  guardChildren,
  className,
  children,
  surfaceRef,
  icon,
  pending,
  count = 1,
  timer = 'ring',
  corners = 'rounded',
  ...rest
}: SurfaceProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = surfaceRef ?? ownRef;
  const closeRef = useRef<HTMLButtonElement>(null);
  const slot = useContext(ToastSlotContext);
  const { reduced, timeScale } = useFeedbackMotion();
  const rolloverReduced = useReducedGetter(reduced);
  const [open, setOpen] = useState(true);
  const going = useRef(false);
  // The icon's beat, once the arrival has landed: after the snap, or after a deck's crossfade.
  // Taking the place of a card with the same mark, it doesn't beat again: nothing changed for it to say.
  const markKey = markKeyOf(kind, icon);
  const [beatAfter] = useState(() =>
    slot?.sameMark(markKey)
      ? null
      : (slot?.beatAfter() ?? motionTokens.duration['fast-02'])
  );

  const finish = () => {
    if (slot) slot.done();
    else setOpen(false);
  };

  // Focus that would be lost with it (WCAG 2.4.3): closed with focus inside
  // it, focus moves to the next card in the deck, else back to where it came
  // from before it entered — never to the page's start.
  const entry = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onIn = (e: FocusEvent) => {
      const from = e.relatedTarget as HTMLElement | null;
      if (from && !el.contains(from)) entry.current = from;
    };
    el.addEventListener('focusin', onIn);
    return () => el.removeEventListener('focusin', onIn);
  }, [ref]);
  const handOffFocus = () => {
    const el = ref.current;
    if (!el || !el.contains(document.activeElement)) return;
    const to = slot
      ? (slot.focusAfter(el) ?? slot.entryFocus())
      : entry.current;
    if (to?.isConnected) to.focus();
  };

  // Its ways out, kept current for the stack's callbacks.
  const exits = useRef({ expire: () => {}, swiped: () => {} });
  const item = useStackItem(ref, {
    arrive,
    from: slot?.from ?? from,
    timeout: variant === 'toast' ? timeout : 0,
    swapIn: () => slot?.swapIn() ?? null,
    quiet: (el) => slot?.quiet(el) ?? false,
    arrived: (el) => slot?.arrived(el),
    onExpire: () => exits.current.expire(),
    onSwipe: () => exits.current.swiped(),
  });

  // Timed out: the arrival in reverse, and — in a ToastStack — counted in
  // the bell on the same frame, with no flight into the bell.
  const expire = async () => {
    if (going.current) return;
    going.current = true;
    onClose?.(undefined); // v11: a timeout closes whatever onClose returns
    const swap = slot?.swapOut(ref.current) ?? undefined;
    const behind = swap ? null : (slot?.leaveBehind(ref.current) ?? null);
    slot?.leaving(true);
    await (behind ?? item.leave({ swap }));
    finish();
  };

  const close = async (evt?: ReactMouseEvent | KeyboardEvent) => {
    if (going.current) return;
    if (onClose?.(evt) === false) return;
    going.current = true;
    handOffFocus();
    const swap = slot?.swapOut(ref.current) ?? undefined;
    const behind = swap ? null : (slot?.leaveBehind(ref.current) ?? null);
    slot?.leaving(false);
    await (behind ?? item.leave({ swap })); // the fold out, the swap, or a fade behind the front
    finish();
  };

  useLayoutEffect(() => {
    exits.current = {
      expire: () => void expire(),
      swiped: () => {
        if (going.current) return;
        going.current = true;
        onClose?.(undefined);
        slot?.leaving(false);
        finish();
      },
    };
  });

  // An update in place restarts the timer.
  const version = slot?.version ?? 0;
  const closeReq = slot?.closeReq ?? 0;
  const seen = useRef({ version, closeReq });
  useEffect(() => {
    if (seen.current.version !== version) item.restartTimer();
    if (seen.current.closeReq !== closeReq) void close();
    seen.current = { version, closeReq };
  });

  // The rollover on the close and action buttons.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Matched lightness: motion-core's backdrop lookup reads the frame that
    // paints the surface. The close button is an IconButton,
    // which attaches its own.
    return attachRollover(el, {
      selector: '.fb-action',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [ref, timeScale, rolloverReduced]);

  useChildrenGuard(ref, guardChildren, variant);

  // An update in place ("Deploying" to "Deployed", a group's next member):
  // the family's content swap — the old words leave, then
  // the new come in, in place (`playSwapInPlace`), instead of a cut.
  // The old words are a still copy (`TextLayer`) beside the live text in its
  // grid cell, dropped once they have gone.
  //
  // One thing at a time:
  //   look    the status (kind, icon, outline, fill) is held until the old
  //           words are out, then turns on the empty card: old words never
  //           sit on the new status's surface (an info toast updated to an
  //           error turned dark under its old dark words), and the mark's
  //           cue plays in the gap, not over the leaving words
  //   height  new words on another line: out, then the card's height moves
  //           (duration by travel; a layout transaction outside a deck, the
  //           deck's own move in one), then in — one thing moves at a time,
  //           and words never hang past an edge that hasn't reached them
  const sig = textSigOf(title, subtitle, caption);
  const lastText = useRef<TextLayer>({
    id: 0,
    title,
    subtitle,
    caption,
    count,
    sig,
  });
  const [shownSig, setShownSig] = useState(sig);
  const [outs, setOuts] = useState<TextLayer[]>([]);
  const shownLook = useRef<Look>({ kind, icon, pending });
  const [held, setHeld] = useState<Look | null>(null);
  // The count's clock (one motion, one clock): a count that changes with the
  // words has no roll of its own: it comes in with them. A group's card come
  // back to the front rolls on its arrival's. A count changing alone keeps
  // its own. It holds for the count it was set with.
  const [countEvent, setCountEvent] = useState<{
    count: number;
    clock: CountClock | null;
  } | null>(() =>
    slot?.countFrom != null && slot.countClock
      ? { count, clock: slot.countClock() }
      : null
  );
  if (sig !== shownSig) {
    setShownSig(sig);
    setOuts((o) => [...o, { ...lastText.current, id: ++textSeq }]);
    setHeld((h) => h ?? shownLook.current);
    setCountEvent(() => ({ count, clock: null }));
  }
  const countClock = countEvent?.count === count ? countEvent.clock : undefined;
  const look: Look = held ?? { kind, icon, pending };
  useLayoutEffect(() => {
    lastText.current = { id: 0, title, subtitle, caption, count, sig };
    shownLook.current = look;
  });
  const textRef = useRef<HTMLDivElement>(null);
  const swapped = useRef(new Set<number>());
  // The body's height as last laid out, and the update under way (a newer one supersedes it).
  const bodyH = useRef<number | null>(null);
  const run = useRef(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const inEl = textRef.current;
    const out = outs.at(-1);
    if (!el || !inEl || !out || swapped.current.has(out.id)) return;
    swapped.current.add(out.id);
    const me = ++run.current;
    const live = () => run.current === me;
    const drop = () => setOuts((o) => o.filter((x) => x.id !== out.id));
    const release = () => {
      if (live()) setHeld(null);
    };
    const outEl = el.querySelector<HTMLElement>(
      `:scope > .fb-n__body > [data-text-out="${out.id}"]`
    );
    const body = el.querySelector<HTMLElement>(':scope > .fb-n__body');

    // The height: from where it is drawn (held, or mid-move), to the new words'.
    let fromH = bodyH.current ?? 0;
    let toH = fromH;
    if (body) {
      const moving =
        body.style.height !== '' ||
        body.getAnimations().some((a) => a.id === RESIZE_ID);
      if (moving || bodyH.current == null)
        fromH = body.getBoundingClientRect().height;
      body
        .getAnimations()
        .forEach(
          (a) => (a.id === RESIZE_ID || a.id === RESIZE_WAIT_ID) && a.cancel()
        );
      body.style.height = '';
      toH = body.offsetHeight;
    }
    const travel = Math.abs(toH - fromH);
    const resizes = !!body && travel >= 0.5;

    // Only words that were showing leave: a card behind the front (its content faded out) simply has its new text.
    const deck = el.dataset.deck;
    const showing =
      deck !== 'peek' &&
      deck !== 'hidden' &&
      getComputedStyle(el).visibility !== 'hidden' &&
      (!body || Number(getComputedStyle(body).opacity) > 0.05);
    if (!outEl || !showing) {
      drop();
      release();
      return;
    }
    // The old words as drawn now: an update mid-swap leaves from where its text had got to.
    outEl.style.opacity = getComputedStyle(inEl).opacity;

    // Out, then the height, then in.
    if (resizes) body!.style.height = `${fromH}px`;
    // A resize holds the in and plays it after the height: no delay of its own then.
    const swap = playSwapInPlace(
      outEl,
      inEl,
      timeScale,
      reduced,
      resizes && !reduced ? 0 : undefined
    );
    const inA = swap.inAnimation;
    if (resizes && !reduced) inA.pause();
    const afterOut = swap.outAnimation
      ? swap.outAnimation.finished
      : Promise.resolve(null);
    const next = () => {
      drop();
      if (!live()) return;
      release();
      if (!resizes) return;
      body!.style.height = '';
      if (reduced) return;
      const goIn = () => {
        if (!live()) return;
        inA.play();
      };
      // In a deck the deck moves the card (on the same travel's step); on its own, the card moves itself.
      const moved = slot
        ? body!.animate([], { duration: stepFor(travel), id: RESIZE_WAIT_ID })
        : resize(el, body!, fromH, toH, travel);
      moved.finished.then(goIn, () => undefined);
    };
    afterOut.then(next, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per update
  }, [outs]);
  useLayoutEffect(() => {
    const body = ref.current?.querySelector<HTMLElement>(
      ':scope > .fb-n__body'
    );
    if (
      body &&
      body.style.height === '' &&
      !body.getAnimations().some((a) => a.id === RESIZE_ID)
    )
      bodyH.current = body.offsetHeight;
  });

  /** A height step's clock: duration follows travel. */
  function stepFor(travel: number) {
    return Math.max(
      DURATION_FLOOR_MS,
      motionTokens.duration[durationStepForDistance(travel)] * timeScale
    );
  }
  /**
   * A notification outside a deck growing or shrinking to its new words: a
   * layout transaction on its host's container, the body leading, so what is
   * below it (an inline notification's page) follows on its clock.
   */
  function resize(
    el: HTMLElement,
    body: HTMLElement,
    fromH: number,
    toH: number,
    travel: number
  ) {
    const host = el.closest<HTMLElement>('[data-fb-stack]') ?? el;
    const { animation } = animateLayout(
      host.parentElement ?? host,
      body,
      [{ height: `${fromH}px` }, { height: `${toH}px` }],
      {
        ms: stepFor(travel),
        easing: `cubic-bezier(${motionTokens.easing['standard-productive'].join(', ')})`,
        reason: 'notification-resize',
      }
    );
    animation.id = RESIZE_ID;
    return animation;
  }

  if (!open) return null;
  const style = variantOf(look.kind, variant, styleVariant, lowContrast);
  const tone = style === 'inverse' ? 'inverse' : 'low';
  const isToast = variant === 'toast' || variant === 'actionable-toast';
  const closeType =
    variant === 'toast'
      ? 'toast'
      : variant === 'inline'
        ? 'inline'
        : 'actionable';
  const timed = variant === 'toast' && timeout > 0;
  // In a ToastStack the stack announces each toast once, from live regions
  // that were there before it (a region inserted with its text is often not
  // read); the card keeps only a dialog's role.
  const ownRole = slot && role !== 'alertdialog' ? undefined : role;

  return (
    <div
      {...rest}
      ref={ref}
      role={ownRole}
      data-stack-item=""
      data-stack-key={slot?.cardKey}
      data-mark={markKeyOf(look.kind, look.icon)}
      data-evicted={slot?.evicted ? '' : undefined}
      className={[
        'fb-n',
        `fb-n--${variant}`,
        isToast ? 'fb-n--floating' : 'fb-n--flat',
        `fb-n--${look.kind}`,
        `fb--${tone}`,
        `fb-n--style-${style}`,
        corners !== 'rounded' && `fb-n--corners-${corners}`,
        hideCloseButton ? 'fb-n--no-close' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      <span className="fb-n__frame" data-snap-frame="" aria-hidden="true" />
      <div className="fb-n__body">
        <div className="fb-n__mark">
          <StatusMark
            kind={look.kind}
            description={statusIconDescription}
            arriveAfter={arrive ? beatAfter : null}
            icon={look.icon}
            pending={look.pending}
          />
        </div>
        <div ref={textRef} className="fb-n__text">
          {title != null && title !== '' && (
            <div className="fb-n__title" id={titleId}>
              {title}
              {count > 1 && (
                <CountPill
                  value={count}
                  from={
                    slot?.countFrom != null && slot.countFrom > 1
                      ? slot.countFrom
                      : undefined
                  }
                  clock={countClock}
                  className="fb-n__count"
                />
              )}
            </div>
          )}
          {subtitle != null && subtitle !== '' && (
            <div className="fb-n__subtitle" id={subtitleId}>
              {subtitle}
            </div>
          )}
          {caption != null && caption !== '' && (
            <div className="fb-n__caption">{caption}</div>
          )}
          {children}
        </div>
        {/* The words an update swaps out, on their way out (above). */}
        {outs.map((l) => (
          <div
            key={l.id}
            className="fb-n__text fb-n__text--out"
            data-text-out={l.id}
            aria-hidden="true"
            {...inertProps(true)}>
            {l.title != null && l.title !== '' && (
              <div className="fb-n__title">
                {l.title}
                {l.count > 1 && (
                  <span className="fb-count fb-n__count">
                    <span className="fb-count__figure">{l.count}</span>
                  </span>
                )}
              </div>
            )}
            {l.subtitle != null && l.subtitle !== '' && (
              <div className="fb-n__subtitle">{l.subtitle}</div>
            )}
            {l.caption != null && l.caption !== '' && (
              <div className="fb-n__caption">{l.caption}</div>
            )}
          </div>
        ))}
        {action}
        {!hideCloseButton && (
          <span className="fb-n__close">
            <NotificationButton
              ref={closeRef}
              notificationType={closeType}
              aria-label={closeLabel}
              onClick={(evt) => {
                onCloseButtonClick?.(evt);
                void close(evt);
              }}
            />
          </span>
        )}
        {/* The timeout, nested in the content (not along the rounded edge). */}
        {timed && (timer === 'bar' || hideCloseButton) && (
          <span className="fb-n__track" aria-hidden="true">
            <span className="fb-n__timer" data-stack-timer="" />
          </span>
        )}
      </div>
      {/* The ring is the surface's, not the content's (`data-stack-persist`): a swap neither fades nor ghosts it, so it never pulses. */}
      {timed && timer === 'ring' && !hideCloseButton && (
        <svg
          className="fb-n__ring"
          viewBox="0 0 32 32"
          aria-hidden="true"
          data-stack-persist="">
          {/* Round the IconButton's box in its corner mode, concentric with its inset fill, from its top center. */}
          <path d={RING_PATH[corners]} pathLength={1} data-stack-timer="dash" />
        </svg>
      )}
      {variant.startsWith('actionable') && (
        <EscapeAndWrap host={ref} close={close} />
      )}
    </div>
  );
}

/** Wraps an element in its own stack host when it isn't in one already. */
function Solo({ flow, children }: { flow: boolean; children: ReactNode }) {
  const slot = useContext(ToastSlotContext);
  if (slot) return <>{children}</>;
  return (
    <StackHost
      className={flow ? 'fb-solo fb-solo--flow' : 'fb-solo'}
      flow={flow}
      origin="top">
      {children}
    </StackHost>
  );
}

/* ── the actionable notification's keyboard ─────────────────────────────── */

function EscapeAndWrap({
  host,
  close,
}: {
  host: RefObject<HTMLDivElement | null>;
  close: (e: KeyboardEvent) => void;
}) {
  const ctx = useContext(ActionableContext);
  useEffect(() => {
    const el = host.current;
    if (!el || !ctx) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === 'Escape' && ctx.closeOnEscape && !isComposing(e)) {
        close(e);
        return;
      }
      // The focus wrap (alertdialog only): Tab cycles inside the notification.
      if (e.key !== 'Tab' || ctx.role !== 'alertdialog') return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  return null;
}

const ActionableContext = createContext<{
  closeOnEscape: boolean;
  role: string;
} | null>(null);

/* ── the four components ────────────────────────────────────────────────── */

interface CommonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role'
> {
  kind?: NotificationKind;
  title?: string;
  subtitle?: ReactNode;
  lowContrast?: boolean;
  /** The selection family's style — `outlined` | `inverse` | `tonal`. Wins over `lowContrast`. */
  variant?: NotificationVariant;
  statusIconDescription?: string;
  /** Snap in on mount (default true). False when it is part of the page from the start. */
  arrive?: boolean;
  /** Grow from this control instead of the top center (opt-in; the default is the snap from top center). */
  from?: StackSource;
  /** An action icon (a status-capable motion-icon: Save, CloudUpload …) in place of the kind's mark; it loads in with its status. */
  icon?: ActionIcon;
  /** With `icon`, the action is under way (the icon's spinner) until the kind changes. */
  pending?: boolean;
  /** `rounded` (8px, default) | `full` | `square` — the frame, the buttons, the ring and the count together. */
  corners?: NotificationCorners;
}

interface ClosableProps extends CommonProps {
  hideCloseButton?: boolean;
  onClose?: (evt?: ReactMouseEvent | KeyboardEvent) => boolean | void;
  onCloseButtonClick?: (evt: ReactMouseEvent) => void;
  'aria-label'?: string;
  /** @deprecated v11's spelling of `aria-label`. */
  ariaLabel?: string;
}

export interface ToastNotificationProps extends ClosableProps {
  role?: 'alert' | 'log' | 'status';
  caption?: string;
  /** ms; 0 = never. */
  timeout?: number;
  /** Where the timeout shows — `ring` (round the close button, default) or `bar` (under the text). */
  timer?: TimerStyle;
  /** How many notifications this one stands for (a group, `ToastStack`'s `group`). */
  count?: number;
}

export function ToastNotification({
  kind = 'error',
  role = 'status',
  'aria-label': al,
  ariaLabel,
  variant: styleVariant,
  ...rest
}: ToastNotificationProps) {
  return (
    <Solo flow={false}>
      <Surface
        {...rest}
        kind={kind}
        role={role}
        styleVariant={styleVariant}
        variant="toast"
        closeLabel={al ?? ariaLabel}
        guardChildren="none"
      />
    </Solo>
  );
}

export interface InlineNotificationProps extends ClosableProps {
  role?: 'alert' | 'log' | 'status';
}

export function InlineNotification({
  kind = 'error',
  role = 'status',
  'aria-label': al,
  ariaLabel,
  variant: styleVariant,
  ...rest
}: InlineNotificationProps) {
  return (
    <Solo flow>
      <Surface
        {...rest}
        kind={kind}
        role={role}
        styleVariant={styleVariant}
        variant="inline"
        closeLabel={al ?? ariaLabel}
        guardChildren="none"
      />
    </Solo>
  );
}

export interface ActionableNotificationProps extends ClosableProps {
  role?: 'alert' | 'log' | 'status' | 'alertdialog';
  caption?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  inline?: boolean;
  hasFocus?: boolean;
  closeOnEscape?: boolean;
}

export function ActionableNotification({
  kind = 'error',
  role = 'alertdialog',
  actionButtonLabel,
  onActionButtonClick,
  inline = false,
  hasFocus = true,
  closeOnEscape = true,
  'aria-label': al,
  ariaLabel,
  title,
  subtitle,
  variant: styleVariant,
  ...rest
}: ActionableNotificationProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const subtitleId = `${id}-subtitle`;
  const actionRef = useRef<HTMLButtonElement>(null);
  // Focus its own action button on arrival (v11 queries the whole document).
  useEffect(() => {
    if (hasFocus && role === 'alertdialog') actionRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on arrival only
  }, []);
  return (
    <ActionableContext.Provider value={{ closeOnEscape, role }}>
      <Solo flow={inline}>
        <Surface
          {...rest}
          kind={kind}
          role={role}
          title={title}
          subtitle={subtitle}
          titleId={titleId}
          subtitleId={subtitleId}
          aria-labelledby={title ? titleId : subtitleId}
          styleVariant={styleVariant}
          variant={inline ? 'actionable-inline' : 'actionable-toast'}
          closeLabel={al ?? ariaLabel}
          action={
            actionButtonLabel ? (
              <NotificationActionButton
                ref={actionRef}
                inline={inline}
                onClick={onActionButtonClick}>
                {actionButtonLabel}
              </NotificationActionButton>
            ) : null
          }
        />
      </Solo>
    </ActionableContext.Provider>
  );
}

export interface CalloutProps extends Omit<CommonProps, 'kind'> {
  /** 'info' | 'warning' (v11 maps the deprecated error and success to warning and info). */
  kind?:
    | 'info'
    | 'info-square'
    | 'warning'
    | 'warning-alt'
    | 'error'
    | 'success';
  titleId?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

export function Callout({
  kind = 'info',
  titleId,
  actionButtonLabel,
  onActionButtonClick,
  arrive = false,
  variant: styleVariant,
  ...rest
}: CalloutProps) {
  const id = useId();
  const tid = titleId ?? `${id}-title`;
  const k: NotificationKind =
    kind === 'error' ? 'warning' : kind === 'success' ? 'info' : kind;
  return (
    <Solo flow>
      <Surface
        {...rest}
        kind={k}
        arrive={arrive}
        hideCloseButton
        titleId={tid}
        styleVariant={styleVariant}
        variant="callout"
        guardChildren="described"
        action={
          actionButtonLabel ? (
            <NotificationActionButton
              inline
              aria-describedby={tid}
              onClick={onActionButtonClick}>
              {actionButtonLabel}
            </NotificationActionButton>
          ) : null
        }
      />
    </Solo>
  );
}

let warned = false;
/** @deprecated v11: use Callout. */
export function StaticNotification(props: CalloutProps) {
  useEffect(() => {
    if (warned || !IN_DEVELOPMENT) return;
    warned = true;
    console.warn(
      'StaticNotification is deprecated; use Callout (v11 codemod refactor-to-callout).'
    );
  }, []);
  return <Callout {...props} />;
}
