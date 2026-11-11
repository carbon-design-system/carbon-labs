/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import {
  DEPTH,
  SNAP,
  SNAP_FRAME,
  SNAP_PIN,
  reducedClock,
  snapAnimations,
  snapClocks,
  snapProfileOn,
  stepDown,
  motionTokens,
  usePrefersReducedMotion,
  useSnapSurface,
  type DurationToken,
  type SnapOrigin,
  type SnapProfile,
  easingCss,
} from '@carbon-labs/v12-motion';
import { themeOf } from '@carbon-labs/v12-motion';
import { Close } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { snapEntranceContentMs } from '@carbon-labs/react-side-panel';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import type { ButtonLookProps } from '@carbon-labs/react-props';
import { IconButton } from '@carbon-labs/react-tooltip';
import {
  createTooltipHold,
  TooltipHoldContext,
} from '@carbon-labs/react-tooltip';
import { Scroller } from '@carbon-labs/react-scroller';
import { lockPageScroll } from '@carbon-labs/react-scroller';
import { useLatest } from '@carbon-labs/react-selection-kit';
import {
  backdropBlurStyle,
  holdPageScale,
  prewarmBackdrop,
  releasePageScale,
  resolveBackdrop,
  type ModalBackdrop,
} from '@carbon-labs/react-modal';
import {
  enterLayer,
  focusInto,
  leaveLayer,
  useLayerKeys,
  usePressOutside,
  wrapTab,
} from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';
import '@carbon-labs/react-modal/scss/modal.scss';
import './tearsheet.scss';

/* ============================================================================
 * Tearsheet, TearsheetNarrow — Carbon for IBM Products' tearsheets, on the kit
 * ============================================================================
 *
 * Their props: `open`, `onClose` (return `false` to stay open), `title`,
 * `label`, `description`, `actions`, `hasCloseIcon` (default: when there
 * are no actions), `closeIconDescription`, `headerActions`, `navigation`,
 * `influencer`, `influencerPosition` (start / end), `influencerWidth`
 * (narrow / wide), `verticalPosition` (normal / lower), `ariaLabel`,
 * `launcherButtonRef`, `selectorPrimaryFocus`, `selectorsFloatingMenus`,
 * `portalTarget`, `className`, `children`. TearsheetNarrow has no
 * influencer, navigation or header actions. They follow `open`, and close
 * themselves unless `onClose` returns false.
 *
 *   a11y     role="dialog", aria-modal, named by its title (or `ariaLabel`);
 *            focus moves in on open (`selectorPrimaryFocus`, else the first
 *            tab stop in its main area, else the close button), Tab wraps,
 *            Escape closes the topmost, focus goes back to
 *            `launcherButtonRef` (else what had it) as it starts to leave;
 *            the page doesn't scroll while one is open
 *   rise     Snap's larger-surface profile (`SNAP.surface`), timed by Axial:
 *            it enters by its bottom edge — its height from nothing there,
 *            its width from 60% about its middle (the side panel's start,
 *            turned to the bottom) — the height, the axis it enters along,
 *            over the whole total, and the width leading, done at Axial's
 *            share of it (the longer clock in the direction
 *            of entrance); the total from its size on the travel steps, one
 *            step shorter (`tearsheetProfileOn`). Its
 *            content rides up with it along the height, Axial's long axis
 *            (the profile names no `contentAxis`), from the entrance's first
 *            frame, landing just after its longest axis clock
 *            (the snap entrance's content clock,
 *            `tearsheetContentClock`). The sliver guard both ways (`sliver: true`)
 *   leave    the snap's collapse, its top edge back down to the bottom at
 *            full width, two steps shorter than the entrance; its content
 *            held still, the clip passing over it (`tearsheetExitProfile`).
 *            Square at the bottom on every frame
 *   recede   the page behind draws back to depth (`DEPTH.recedeScale`, 98%)
 *            on the sheet's own total, standard-productive (the page moves;
 *            it doesn't arrive or leave); out on the sheet's out total.
 *            Carbon's $overlay and the blur over it are the sheet's presence,
 *            not a move: on its clock, entrance-productive in and
 *            exit-productive out, so they clear as the sheet goes. Reduced:
 *            the dim on the reduced clock, the scale at once
 *   stack    a tearsheet opened over another: the one below recedes too —
 *            98% per level about its top, lifted `DEPTH.arrive` (16px) per
 *            level so its top shows above the new one, dimmed by the overlay
 *            — and rounds its bottom corners (`data-receded`), on the arriving
 *            sheet's clock (standard-productive); it comes forward again,
 *            corners square, on the leaving one's. One dim and one page recede
 *            for the whole stack, the bottom open sheet's: if it leaves while
 *            one above stays, the next one takes them over at once (nothing
 *            moves) and the leaving one gives them up
 *   theme    the launcher's (or the focused element's) Carbon theme, kept
 *            while it leaves
 * ========================================================================== */

/** A press's handlers on a footer action (a step flow's reach). */
type TearsheetActionPress = Pick<
  HTMLAttributes<HTMLButtonElement>,
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onPointerLeave'
  | 'onPointerCancel'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onBlur'
>;

/** A footer action: the Button's `kind` (default: the last primary, the rest secondary), `variant` and `frame` (the kit's defaults). */
export interface TearsheetAction extends ButtonLookProps, TearsheetActionPress {
  label?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Busy: the kit's Button `busy`. */
  loading?: boolean;
  renderIcon?: ElementType;
  className?: string;
}

/** The narrow tearsheet's props; the wide one's add to them. */
export interface TearsheetNarrowProps {
  /** Up to four buttons in its footer. */
  actions?: TearsheetAction[];
  /** Names it when there's no title. */
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  /** The close button's tooltip and name. Default "Close". */
  closeIconDescription?: string;
  /** Accepted, not drawn (the AI label slot). */
  decorator?: ReactNode;
  /** Accepted, not drawn. */
  slug?: ReactNode;
  description?: ReactNode;
  /** A close button in its header. Default: when there are no actions. */
  hasCloseIcon?: boolean;
  /** A label over the title. */
  label?: ReactNode;
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** Asks to close; returning `false` keeps it open. */
  onClose?: (event: SyntheticEvent | Event) => boolean | void;
  open?: boolean;
  /** Where it's portalled. Default the body. */
  portalTarget?: HTMLElement | null;
  /** Focused on open. */
  selectorPrimaryFocus?: string;
  /** Floating menus opened from inside it (focus there isn't pulled back). */
  selectorsFloatingMenus?: string[];
  title?: ReactNode;
  /** `lower` starts it further down the page. Default normal. */
  verticalPosition?: 'normal' | 'lower';
  /** The backdrop effects (dim, page recede, and blur). */
  backdrop?: ModalBackdrop | false;
  /** Slow motion. Default 1. */
  timeScale?: number;
  /** Mounts hidden, with its content, while the launcher is hovered or focused. Default true. */
  warm?: boolean;
}

export interface TearsheetProps extends TearsheetNarrowProps {
  /** Beside the title. */
  headerActions?: ReactNode;
  /** A side column beside the main area (a list of steps, a filter). */
  influencer?: ReactNode;
  // @carbon-proposal api: logical-positions — Placement values are logical, `start` and `end`, so they follow the reading direction. TBD
  /** Default `start`. */
  influencerPosition?: TearsheetInfluencerPosition;
  /** narrow 16rem, wide 20rem. Default narrow. */
  influencerWidth?: 'narrow' | 'wide';
  /** Under the header, across its width (tabs). */
  navigation?: ReactNode;
}

/** The influencer's side, logical: `start` (default) or `end`, so right to left mirrors it (IBM Products: `left` · `right`). */
export type TearsheetInfluencerPosition = 'start' | 'end';

/** The tearsheet's start: its height from nothing at its bottom edge, its width from 60% (the side panel's, turned). */
export const TEARSHEET_MOTION = { fromX: 0.6, fromY: 0 } as const;

/** Snap's larger-surface profile for a tearsheet (Axial times it on the sheet it plays on; `tearsheetProfileOn`). */
export function tearsheetSnapProfile(): SnapProfile {
  return {
    ...SNAP.surface,
    // Joined to the bottom edge: the sliver guard, opaque from 4px tall, so no sliver shows.
    sliver: true,
    from: TEARSHEET_MOTION.fromX,
    fromX: TEARSHEET_MOTION.fromX,
    fromY: TEARSHEET_MOTION.fromY,
    exitMode: 'collapse',
    collapseAxis: 'y',
    // A short content travel, not a reduced-motion setting: 8% of the content's height, not the
    // default half height.
    contentOffset: 0.08,
  };
}

/** Axial's clocks for `el`, a step shorter in and two shorter out: a sheet the height of the page
 * reads slow on the shared travel steps, its exit most. */
export function tearsheetProfileOn(
  p: SnapProfile,
  el: Element | null,
  origin?: SnapOrigin
): SnapProfile {
  const played = snapProfileOn(p, el, origin);
  if (
    played === p ||
    typeof played.in !== 'string' ||
    typeof played.out !== 'string'
  )
    return p;
  const ms = (t: DurationToken) => motionTokens.duration[t];
  const inT = stepDown(played.in);
  const outT = stepDown(stepDown(played.out));
  const kIn = ms(inT) / ms(played.in);
  const kOut = ms(outT) / ms(played.out);
  const by = (v: SnapProfile['inX'], k: number) =>
    typeof v === 'number' ? Math.round(v * k * 1000) / 1000 : v;
  return {
    ...played,
    // Resolved here, so the snap plays these clocks as they are.
    timing: 'own',
    in: inT,
    out: outT,
    inX: by(played.inX, kIn),
    inY: by(played.inY, kIn),
    outX: by(played.outX, kOut),
    outY: by(played.outY, kOut),
  };
}

/**
 * The tearsheet's profile on the way out: its content doesn't move, the clip
 * passes over it (content moves with the opening and holds still leaving).
 * Read at each close; an entrance turning round from it starts from the
 * content at rest.
 */
export function tearsheetExitProfile(p: SnapProfile): SnapProfile {
  return { ...p, contentOffset: 0 };
}

/**
 * The snap entrance's content clock on a tearsheet: its
 * content (the snap's content layer) moves from the entrance's first frame,
 * landing just after the sheet's longest axis clock as Axial
 * plays it on `el` (`snapEntranceContentMs`). Exits are the profile's own.
 * carbon-motion's snap gives the same clock by default; the profile names it
 * so the sheet's tests can read it.
 */
export function tearsheetContentClock(
  p: SnapProfile,
  el: Element | null,
  origin?: SnapOrigin
): SnapProfile {
  const { ms } = snapClocks(snapProfileOn(p, el, origin), 'in');
  return { ...p, contentIn: snapEntranceContentMs(ms) };
}

/** Runs `fn` once the open's first frame has painted, or after 200ms where frames don't run. Returns a cancel. */
function afterFirstFrame(fn: () => void): () => void {
  let done = false;
  let task = 0;
  const run = () => {
    if (done) return;
    done = true;
    cancel();
    fn();
  };
  const frame = requestAnimationFrame(() => {
    task = window.setTimeout(run, 0);
  });
  const fallback = window.setTimeout(run, 200);
  function cancel() {
    cancelAnimationFrame(frame);
    clearTimeout(task);
    clearTimeout(fallback);
  }
  return () => {
    done = true;
    cancel();
  };
}

/* ── the stack: the open tearsheets, oldest first ─────────────────────────── */

const sheets: object[] = [];
/**
 * The sheets that own the dim and the page's recede (the base): the one
 * that opened with no other open, kept while it leaves; handed to the
 * bottom open sheet when it leaves while others stay.
 */
const owners = new Set<object>();
/** Took the base over (shows it at once) → from the sheet that left (its hold on the page, let go then). */
const handed = new Map<object, object>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
function joinStack(t: object) {
  if (sheets.includes(t)) return;
  if (sheets.length === 0) owners.add(t);
  sheets.push(t);
  emit();
}
function leaveStack(t: object) {
  const i = sheets.indexOf(t);
  if (i < 0) return;
  sheets.splice(i, 1);
  const next = sheets[0];
  if (owners.has(t) && next) {
    owners.delete(t);
    if (!owners.has(next)) {
      owners.add(next);
      handed.set(next, t);
    }
  }
  emit();
}
/** Gone (left, or unmounted): it owns nothing. */
function dropSheet(t: object) {
  leaveStack(t);
  handed.delete(t);
  if (owners.delete(t)) emit();
}
/** Whether `t` owns the base: it does, or (opening, not yet joined) it will, as no other sheet is open. */
const ownsBase = (t: object, open: boolean) =>
  owners.has(t) || (open && !sheets.includes(t) && sheets.length === 0);
/** How many open sheets are above `t` (0: it's the top, or not open). */
const depthOf = (t: object) => {
  const i = sheets.indexOf(t);
  return i < 0 ? 0 : sheets.length - 1 - i;
};

/* ── the shell ───────────────────────────────────────────────────────────── */

interface ShellProps extends TearsheetProps {
  variant: 'wide' | 'narrow';
}

/** Opened from `el`: its theme, and the element itself for the portal's brand. */
function openedFrom(el: Element | null) {
  return { open: true, name: themeOf(el), from: el };
}

/** ms the hidden sheet outlasts the pointer or the focus leaving its launcher. */
const INTENT_GRACE_MS = 400;

/** An open is likely: `launcher` hovered or focused, until `INTENT_GRACE_MS` after it leaves. Only
 * while `armed` (closed, nothing leaving); `reset` forgets it, so a close returns to a fresh mount. */
function useLauncherIntent(
  launcher: RefObject<HTMLElement | null> | undefined,
  armed: boolean
): [boolean, () => void] {
  const [likely, setLikely] = useState(false);
  const live = useLatest({ armed });
  useEffect(() => {
    if (!launcher) return;
    let off = 0;
    // Read on each event, so a launcher mounted after the sheet still counts.
    const inside = (n: EventTarget | null) => {
      const el = launcher.current;
      return !!el && n instanceof Node && el.contains(n);
    };
    const on = (e: Event) => {
      if (!inside(e.target) || !live.current.armed) return;
      clearTimeout(off);
      startTransition(() => setLikely(true));
    };
    const leave = (e: Event) => {
      if (
        !inside(e.target) ||
        inside((e as PointerEvent | FocusEvent).relatedTarget)
      )
        return;
      clearTimeout(off);
      off = window.setTimeout(() => {
        const el = launcher.current;
        if (!el?.matches(':hover') && !el?.contains(document.activeElement))
          setLikely(false);
      }, INTENT_GRACE_MS);
    };
    const events: [string, (e: Event) => void][] = [
      ['pointerover', on],
      ['pointerdown', on],
      ['focusin', on],
      ['pointerout', leave],
      ['focusout', leave],
    ];
    events.forEach(([t, fn]) => document.addEventListener(t, fn, true));
    return () => {
      clearTimeout(off);
      events.forEach(([t, fn]) => document.removeEventListener(t, fn, true));
    };
  }, [launcher, live]);
  const reset = useCallback(() => setLikely(false), []);
  return [likely, reset];
}

function TearsheetRoot(props: ShellProps & { forwarded: Ref<HTMLDivElement> }) {
  const {
    open: openProp = false,
    onClose,
    launcherButtonRef,
    portalTarget,
  } = props;
  // The first open's work done while idle: here, mounted while closed (the shell mounts on intent or as it opens).
  const { blur: warmBlur, scale: warmScale } = resolveBackdrop(props.backdrop);
  useEffect(
    () =>
      prewarmBackdrop(
        'tearsheet',
        { blur: warmBlur, scale: warmScale },
        () => launcherButtonRef?.current
      ),
    [warmBlur, warmScale, launcherButtonRef]
  );
  // It follows `open`, and closes itself unless `onClose` says no.
  const [isOpen, setIsOpen] = useState(openProp);
  const [wasOpen, setWasOpen] = useState(openProp);
  if (openProp !== wasOpen) {
    setWasOpen(openProp);
    setIsOpen(openProp);
  }
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);
  // An open is likely: mounted hidden ahead, in the launcher's theme (unless `warm` is false).
  const [intent, forget] = useLauncherIntent(
    launcherButtonRef,
    !isOpen && !present
  );
  const likely = intent && props.warm !== false;

  const [theme, setTheme] = useState<{
    open: boolean;
    name: string | null;
    from: Element | null;
  }>({
    open: false,
    name: null,
    from: null,
  });
  if (isOpen !== theme.open) {
    const from =
      isOpen && typeof document !== 'undefined' ? document.activeElement : null;
    // eslint-disable-next-line react-hooks/refs -- the launcher is already mounted: its theme is read once, as the sheet opens
    setTheme(
      isOpen
        ? openedFrom(launcherButtonRef?.current ?? from)
        : { ...theme, open: false }
    );
  }
  // Mounted ahead: in the launcher's theme then, so the open doesn't change it.
  const [wasLikely, setWasLikely] = useState(likely);
  if (likely !== wasLikely) {
    setWasLikely(likely);
    // eslint-disable-next-line react-hooks/refs -- as above: the launcher's theme, read once as it mounts ahead
    const from = launcherButtonRef?.current ?? null;
    if (likely && !isOpen && !present && from)
      setTheme({ ...openedFrom(from), open: false });
  }

  const requestClose = useCallback(
    (event: SyntheticEvent | Event) => {
      if (!onClose || onClose(event) !== false) setIsOpen(false);
    },
    [onClose]
  );
  // Left: unmounted, whatever the intent (the focus is back on the launcher), so a reopen starts fresh.
  const exited = useCallback(() => {
    forget();
    setPresent(false);
  }, [forget]);

  if ((!present && !likely) || typeof document === 'undefined') return null;
  return (
    <KitPortal
      target={portalTarget}
      anchor={theme.from}
      hold={!isOpen}
      className={['cds-tearsheet-portal', theme.name]
        .filter(Boolean)
        .join(' ')}>
      <TearsheetShell
        {...props}
        ref={props.forwarded}
        open={isOpen}
        requestClose={requestClose}
        onExited={exited}
      />
    </KitPortal>
  );
}

const TearsheetShell = forwardRef<
  HTMLDivElement,
  ShellProps & {
    requestClose: (e: SyntheticEvent | Event) => void;
    onExited: () => void;
  }
>(function TearsheetShell(
  {
    actions,
    ariaLabel,
    children,
    className,
    closeIconDescription = 'Close',
    decorator: _decorator,
    slug: _slug,
    description,
    hasCloseIcon,
    headerActions,
    influencer,
    influencerPosition = 'start',
    influencerWidth = 'narrow',
    label,
    launcherButtonRef,
    navigation,
    onClose: _onClose,
    open = false,
    portalTarget: _portalTarget,
    selectorPrimaryFocus,
    selectorsFloatingMenus,
    title,
    verticalPosition = 'normal',
    backdrop,
    timeScale = 1,
    variant,
    requestClose,
    onExited,
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [token] = useState(() => ({}));
  /** It owns the dim and the page's recede (the stack's base), from the stack on each change. */
  const base = useSyncExternalStore(
    subscribe,
    () => ownsBase(token, open),
    () => false
  );
  const release = useRef<(() => void) | null>(null);
  const [tips] = useState(createTooltipHold);
  const { blur, scale: pageScale } = resolveBackdrop(backdrop);
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const titleId = `${uid}-title`;
  const depth = useSyncExternalStore(
    subscribe,
    () => depthOf(token),
    () => 0
  );
  const latest = useLatest({
    reduced,
    timeScale,
    requestClose,
    onExited,
    launcherButtonRef,
    selectorPrimaryFocus,
    blur,
    pageScale,
  });

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      surfaceRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  /** Which way it is going: the profile is read at each open and close. */
  const leaving = useRef(false);
  /** It has opened since it mounted (mounted ahead on intent, it rests hidden until then). */
  const opened = useRef(false);
  /** At rest and hidden: mounted ahead, or left. It takes no presses. */
  const rest = (on: boolean) =>
    rootRef.current?.toggleAttribute('data-resting', on);
  const surface = useSnapSurface(surfaceRef, {
    // In: its content from the first frame, just after the sheet's longest clock
    // (`snapEntranceContentMs`). Out: its content held still (`tearsheetExitProfile`).
    profile: () => {
      const p = tearsheetContentClock(played(), surfaceRef.current, origin());
      return leaving.current ? tearsheetExitProfile(p) : p;
    },
    reduced,
    timeScale,
  });

  /** Its origin and played profile, read once at the start of an open or close, before any write. */
  const held = useRef<{ origin: SnapOrigin; played: SnapProfile } | null>(null);

  /** Its bottom edge, the middle of it. */
  const origin = (): SnapOrigin => {
    if (held.current) return held.current.origin;
    const el = surfaceRef.current;
    return { x: (el?.offsetWidth ?? 0) / 2, y: el?.offsetHeight ?? 0 };
  };

  const played = () =>
    held.current?.played ??
    tearsheetProfileOn(tearsheetSnapProfile(), surfaceRef.current, origin());

  /** Holds the origin and the profile for one open or close, so its reads run once and first. */
  const holding = <T,>(fn: () => T): T => {
    held.current = null;
    const o = origin();
    held.current = {
      origin: o,
      played: tearsheetProfileOn(tearsheetSnapProfile(), surfaceRef.current, o),
    };
    try {
      return fn();
    } finally {
      held.current = null;
    }
  };

  /** The dim and blur animations it started, so it reads and stops its own without a style flush. */
  const dims = useRef(new WeakMap<HTMLElement, Animation>());

  /**
   * The sheet's whole clock as the snap plays it: `easing` (standard-productive)
   * for what moves, the page and the stack below; `presence` (entrance-productive
   * in, exit-productive out) for the dim and the blur.
   */
  const clock = (phase: 'in' | 'out') => {
    const p = played();
    const { ms } = snapClocks(p, phase);
    const toEasing = (tok: keyof typeof motionTokens.easing) => easingCss(tok);
    const presenceTok =
      phase === 'in' ? 'entrance-productive' : 'exit-productive';
    return {
      ms: ms * latest.current.timeScale,
      easing: toEasing('standard-productive'),
      presence: toEasing(presenceTok),
    };
  };

  /** The dim and blur (`presence`) and the page's recede (`easing`), the stack's first sheet only, from where they are. */
  const recedePage = (on: boolean) => {
    // It handed the base to the sheet above (it left first): that one has the dim and lets the page go.
    if (!owners.has(token)) return;
    const { reduced: r, pageScale: s } = latest.current;
    const c = clock(on ? 'in' : 'out');
    const blurs = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('.cds-modal__blur') ?? []
    );
    const els = overlayRef.current ? [overlayRef.current, ...blurs] : blurs;
    // Every opacity read before any write: a read after a write restyles the page. At rest
    // (no fade of its own running) the opacity is the one it last wrote, so nothing is read.
    const from = els.map((el) =>
      dims.current.get(el)?.playState === 'running'
        ? parseFloat(getComputedStyle(el).opacity) || 0
        : parseFloat(el.style.opacity) || 0
    );
    els.forEach((el, i) => {
      dims.current.get(el)?.cancel();
      el.style.opacity = on ? '1' : '0';
      if (el === overlayRef.current || c.ms > 0)
        dims.current.set(
          el,
          el.animate([{ opacity: from[i] }, { opacity: on ? 1 : 0 }], {
            duration: Math.max(1, c.ms * reducedClock(r)),
            easing: r ? 'linear' : c.presence,
          })
        );
    });
    if (on && s != null && !r) holdPageScale(token, s, r ? 0 : c.ms, c.easing);
    else if (!on) releasePageScale(token, r ? 0 : c.ms, c.easing);
  };

  // Open and close. Reads first (its size, the launcher), then the writes that draw the first
  // frame; the scroll lock and the focus move wait until that frame has painted.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    if (!open && !opened.current) {
      surface.set(false);
      rest(true);
      return;
    }
    if (open) {
      opened.current = true;
      rest(false);
      joinStack(token);
      enterLayer(token);
      const active = document.activeElement;
      if (active instanceof HTMLElement && !el.contains(active))
        restoreRef.current = active;
      leaving.current = false;
      const anims = holding(() => {
        recedePage(true);
        surface.open({ origin: origin() });
        return snapAnimations(el);
      });
      const settle = afterFirstFrame(() => {
        release.current ??= lockPageScroll();
        focusInto(el, latest.current.selectorPrimaryFocus, mainRef.current);
      });
      // Tooltips inside wait until the sheet and its content have landed.
      if (anims.length > 0 && !latest.current.reduced) {
        tips.hold();
        let live = true;
        void Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(
          () => {
            if (live) tips.land();
          }
        );
        return () => {
          live = false;
          settle();
          tips.land();
        };
      }
      tips.land();
      return settle;
    }
    leaveStack(token);
    leaveLayer(token);
    const back =
      latest.current.launcherButtonRef?.current ?? restoreRef.current;
    if (back?.isConnected && el.contains(document.activeElement)) back.focus();
    leaving.current = true;
    const closing = holding(() => {
      recedePage(false);
      return surface.close();
    });
    let gone = false;
    void closing.then((done) => {
      if (!done || gone) return;
      release.current?.();
      release.current = null;
      // Left, it gives up the dim and the page (it may stay mounted, hidden, while its launcher has intent).
      handed.delete(token);
      if (owners.delete(token)) emit();
      rest(true);
      latest.current.onExited();
    });
    return () => {
      gone = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /*
   * Took the base over (the sheet below left first): the dim and the blur
   * are there at once and the page stays where it is, as they were the
   * leaving sheet's a frame before.
   */
  useLayoutEffect(() => {
    const from = handed.get(token);
    if (!base || !from) return;
    handed.delete(token);
    const { reduced: r, pageScale: s } = latest.current;
    for (const el of [
      overlayRef.current,
      ...Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('.cds-modal__blur') ?? []
      ),
    ]) {
      if (!el) continue;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.opacity = '1';
    }
    if (s != null && !r) holdPageScale(token, s, 0, 'linear');
    // The page goes to this sheet's scale (unchanged when it asks the same) on its leaving clock.
    const c = clock('out');
    releasePageScale(from, r ? 0 : c.ms, c.easing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Unmounted while open or leaving: the stack, the layer, the lock and the page let go.
  useEffect(() => {
    const t = token;
    return () => {
      dropSheet(t);
      leaveLayer(t);
      releasePageScale(t, 0, 'linear');
      release.current?.();
      release.current = null;
    };
  }, [token]);

  /** Stacked: it recedes, rounds its bottom corners and dims on the arriving sheet's clock;
   * it comes forward on the leaving one's. Reduced: at once. */
  const shownDepth = useRef(0);
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    const scrim = scrimRef.current;
    if (!el || !scrim || depth === shownDepth.current) return;
    const deeper = depth > shownDepth.current;
    shownDepth.current = depth;
    const { reduced: r } = latest.current;
    const c = clock(deeper ? 'in' : 'out');
    const cs = getComputedStyle(el);
    const scale0 = cs.scale === 'none' ? '1' : cs.scale;
    const lift0 = cs.translate === 'none' ? '0px 0px' : cs.translate;
    const dim0 = getComputedStyle(scrim).opacity;
    // Receded, the bottom corners round (CSS holds the rest); from where they are, so 1 to 2 doesn't move.
    const frame = el.querySelector<HTMLElement>(
      ':scope > .cds-tearsheet__frame'
    );
    const corners = frame ? [frame, scrim] : [scrim];
    const from = corners.map((t) => getComputedStyle(t).borderBottomLeftRadius);
    el.getAnimations()
      .filter((a) => a.id === 'cds-tearsheet-depth')
      .forEach((a) => a.cancel());
    scrim.getAnimations().forEach((a) => a.cancel());
    const scale = String(DEPTH.recedeScale ** depth);
    const lift = `0px ${-DEPTH.arrive * depth}px`;
    el.style.scale = depth ? scale : '';
    el.style.translate = depth ? lift : '';
    scrim.style.opacity = depth ? '1' : '0';
    for (const t of corners)
      t.getAnimations()
        .filter((a) => a.id === 'cds-tearsheet-corners')
        .forEach((a) => a.cancel());
    el.toggleAttribute('data-receded', depth > 0);
    if (!r) {
      corners.forEach((t, i) => {
        const to = getComputedStyle(t).borderBottomLeftRadius;
        if (from[i] === to) return;
        t.animate(
          [
            {
              borderBottomLeftRadius: from[i],
              borderBottomRightRadius: from[i],
            },
            { borderBottomLeftRadius: to, borderBottomRightRadius: to },
          ],
          { duration: c.ms, easing: c.easing, id: 'cds-tearsheet-corners' }
        );
      });
      el.animate(
        [
          { scale: scale0, translate: lift0 },
          { scale, translate: lift },
        ],
        {
          duration: c.ms,
          easing: c.easing,
          id: 'cds-tearsheet-depth',
        }
      );
    }
    scrim.animate([{ opacity: dim0 }, { opacity: depth ? 1 : 0 }], {
      duration: Math.max(1, c.ms * reducedClock(r)),
      easing: r ? 'linear' : c.easing,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  useLayerKeys({
    open,
    token: token,
    surface: surfaceRef,
    onEscape: (e) => latest.current.requestClose(e),
    trap: true,
    refocus: () =>
      focusInto(
        surfaceRef.current,
        latest.current.selectorPrimaryFocus,
        mainRef.current
      ),
    selectorsFloatingMenus,
  });

  const passive = !actions?.length;
  // A passive sheet (no actions) closes on a press outside it, as a passive modal.
  usePressOutside(
    open && passive,
    token,
    () => [overlayRef.current, rootRef.current],
    (e) => latest.current.requestClose(e)
  );

  const closeIcon = hasCloseIcon ?? passive;
  const hasTitle = title != null && title !== '';
  const wide = variant === 'wide';
  const shown = (actions ?? []).slice(0, 4);

  const main = (
    <div className="cds-tearsheet__main-column">
      <Scroller
        className="cds-tearsheet__body"
        viewportClassName="cds-tearsheet__viewport"
        timeScale={timeScale}
        viewportRef={(el) => {
          mainRef.current = el;
        }}>
        {/* A framed surface: what selects and navigates inside it is ghost by default; its containers are rounded, as the sheet is (a rounded Region's rule). */}
        <div className="cds-tearsheet__inner">
          <KitDefaults frame="ghost" containerCorners="rounded">
            {children}
          </KitDefaults>
        </div>
      </Scroller>
      {shown.length > 0 && (
        <div className="cds-tearsheet__actions">
          {shown.map(({ label, kind, loading, ...a }, i) => (
            <Button
              key={i}
              {...a}
              busy={loading}
              kind={kind ?? (i === shown.length - 1 ? 'primary' : 'secondary')}
              size="lg"
              timeScale={timeScale}>
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={['cds-tearsheet', className].filter(Boolean).join(' ')}>
      {base && blur === 'even' && (
        <div
          className="cds-modal__blur cds-modal__blur--even"
          style={backdropBlurStyle()}
          aria-hidden="true"
        />
      )}
      {base && (
        <div
          ref={overlayRef}
          className="cds-tearsheet__overlay"
          aria-hidden="true"
          onMouseDown={(e) => e.preventDefault()}
        />
      )}
      <div
        ref={setRef}
        role="dialog"
        aria-modal="true"
        aria-label={hasTitle ? undefined : ariaLabel}
        aria-labelledby={hasTitle ? titleId : undefined}
        tabIndex={-1}
        className={[
          'cds-tearsheet__container',
          `cds-tearsheet__container--${variant}`,
          verticalPosition === 'lower' && 'cds-tearsheet__container--lower',
          'cds--layer-one',
        ]
          .filter(Boolean)
          .join(' ')}
        {...inertProps(!open)}
        onKeyDown={(e) => wrapTab(e, surfaceRef.current)}>
        <span className="cds-tearsheet__frame" {...SNAP_FRAME} />
        <TooltipHoldContext.Provider value={tips}>
          <div className="cds-tearsheet__content">
            <div className="cds-tearsheet__header">
              <div className="cds-tearsheet__heading">
                {label != null && label !== '' && (
                  <p className="cds-tearsheet__label">{label}</p>
                )}
                {hasTitle && (
                  <h2 id={titleId} className="cds-tearsheet__title">
                    {title}
                  </h2>
                )}
                {description != null && description !== '' && (
                  <div className="cds-tearsheet__description">
                    {description}
                  </div>
                )}
              </div>
              {wide && headerActions != null && (
                <div className="cds-tearsheet__header-actions">
                  {headerActions}
                </div>
              )}
              {closeIcon && (
                <div className="cds-tearsheet__close">
                  <IconButton
                    frame="ghost"
                    size="md"
                    corners="full"
                    align="left"
                    label={closeIconDescription}
                    data-layer-close=""
                    timeScale={timeScale}
                    onClick={(e) => latest.current.requestClose(e)}>
                    <Close size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              )}
            </div>
            {wide && navigation != null && (
              <div className="cds-tearsheet__navigation">{navigation}</div>
            )}
            <div
              className={[
                'cds-tearsheet__main',
                wide &&
                  influencer != null &&
                  `cds-tearsheet__main--influencer-${influencerPosition}`,
              ]
                .filter(Boolean)
                .join(' ')}>
              {wide && influencer != null && (
                // The influencer scrolls on its own, in the kit's Scroller (as the main area).
                <Scroller
                  className={`cds-tearsheet__influencer cds-tearsheet__influencer--${influencerWidth}`}
                  viewportClassName="cds-tearsheet__influencer-viewport"
                  timeScale={timeScale}>
                  {influencer}
                </Scroller>
              )}
              {main}
            </div>
          </div>
        </TooltipHoldContext.Provider>
        <div
          ref={scrimRef}
          className="cds-tearsheet__scrim"
          aria-hidden="true"
          {...SNAP_PIN}
        />
      </div>
    </div>
  );
});
TearsheetShell.displayName = 'TearsheetShell';

/** A large sheet that rises over the page: header, navigation, an influencer and a main area. */
export const Tearsheet = forwardRef<HTMLDivElement, TearsheetProps>(
  function Tearsheet(props, ref) {
    return <TearsheetRoot {...props} variant="wide" forwarded={ref} />;
  }
);
Tearsheet.displayName = 'Tearsheet';

/** The narrow tearsheet: a header and a main area, no influencer or navigation. */
export const TearsheetNarrow = forwardRef<HTMLDivElement, TearsheetNarrowProps>(
  function TearsheetNarrow(props, ref) {
    return <TearsheetRoot {...props} variant="narrow" forwarded={ref} />;
  }
);
TearsheetNarrow.displayName = 'TearsheetNarrow';
