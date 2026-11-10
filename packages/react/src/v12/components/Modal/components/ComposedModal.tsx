/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import {
  SNAP_FRAME,
  SNAP_PROPOSED_EASE,
  deriveCastShadowColor,
  distanceTokens,
  motionTokens,
  parseColor,
  reducedClock,
  stepDown,
  usePrefersReducedMotion,
  useSnapSurface,
  type RGBA,
  type SnapProfile,
  easingCss,
} from '@carbon-labs/v12-motion';
import { themeOf } from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { modalCause } from './press-cause';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { lockPageScroll } from '@carbon-labs/react-scroller';
import {
  enterLayer,
  floatingOpen,
  isTopLayer,
  leaveLayer,
  tabbablesIn,
  useLayerKeys,
  usePressOutside,
  wrapTab,
} from '@carbon-labs/react-util';
import {
  MODAL_BACKDROP,
  holdPageScale,
  prewarmBackdrop,
  releasePageScale,
  resolveBackdrop,
  type ModalBackdrop,
} from './backdrop';
import './modal.scss';

/* ============================================================================
 * ComposedModal — Carbon v11's ComposedModal: the modal's shell
 * ============================================================================
 *
 * v11's props: `open` (followed, and closed from inside unless `onClose`
 * returns false), `onClose`, `onKeyDown`, `size` (xs / sm / md / lg),
 * `danger`, `preventCloseOnClickOutside`, `launcherButtonRef`,
 * `selectorPrimaryFocus`, `selectorsFloatingMenus`, `isFullWidth`,
 * `containerClassName`, `aria-label` / `aria-labelledby`. Its parts are
 * ModalHeader, ModalBody and ModalFooter (parts.tsx); Modal is the one-piece
 * v11 Modal on top of it.
 *
 *   a11y     role="dialog" (`alertdialog` with `alert`), aria-modal, named by
 *            its header's label and title; focus moves in on open (v11's
 *            order, below), Tab wraps inside it, Escape closes the topmost
 *            layer, focus goes back to `launcherButtonRef` (else to what had
 *            it before) as it starts to leave; the page doesn't scroll while
 *            one is open. The keys, the focus guard and the press outside are
 *            the page layers' (util/layer.ts): one stack with the side
 *            panels and tearsheets, so a panel opened from a modal has them
 *   outside  a press that starts and ends on the overlay closes a passive
 *            modal (no footer), and a transactional one only with
 *            `preventCloseOnClickOutside={false}` (v11's rule). Never a drag
 *            from inside, never the press that dismisses a menu opened from
 *            it, and only the topmost modal
 *   overlay  Carbon's $overlay, fading in over moderate-01 (entrance-
 *            productive) and out one step faster, fast-02 (exit-productive)
 *   backdrop over the dim (`backdrop`, by default both): the page scales to
 *            99% and blurs evenly, one layer (either left out; backdrop.ts).
 *            On the overlay's clocks; reduced: the blur at once, no scale.
 *            What the first open builds is built while the browser is idle
 *            after the modal mounts (closed), so its first open doesn't stall
 *   arrive   the snap's container model, landing centred: the frame grows
 *            from 92% of its box on each axis, or 16px in on a side (the md
 *            distance) where that is more, over
 *            fast-02 (the 16px travel's step, kept), on the floating
 *            surface's curve (entrance-snap), its content fading up over
 *            fast-01. It grows from its top or bottom edge facing the press
 *            that opened it, at the press's x (`originEdge`, `modalCause`); from
 *            a key, the focused launcher's centre (else `launcherButtonRef`),
 *            placed the same way; with no launcher, its own centre
 *   leave    it pulls back: the frame shrinks to the same start toward the
 *            same origin, one step faster (fast-01), on the floating
 *            surface's pull-back (exit-pullback), fading as it goes. Reopened
 *            while leaving, it turns round from where it is
 *   reduced  fades only, at final geometry, on the reduced clock (half)
 *   shadow   the cast shadow under the surface (`shadow`; off by default;
 *            `true` the floating elevation), lit by the
 *            pointer while it is over or near the modal (falling away from
 *            it), at rest (from above) when it leaves; its colour solved
 *            against the dimmed page it falls on
 *   theme    the launcher's (or the focused element's) Carbon theme, kept
 *            while it leaves; none: the page's
 * ========================================================================== */

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg';

/** A blur layer's filter (its radius from MODAL_BACKDROP, the one place it is set). */
const blurStyle = (px: number) => ({
  backdropFilter: `blur(${px}px)`,
  WebkitBackdropFilter: `blur(${px}px)`,
});

/** The modal's motion: the scale and inset its container grows from, its clocks, the overlay's clocks, the shadow's reach. */
export const MODAL_MOTION = {
  /**
   * The scale the frame starts from on each axis (and pulls back to), 92%
   * of its box. Between the role tokens' `scale-enter`
   * (0.96) and the larger surfaces' 0.75 (`SNAP.surface`); no scale token
   * holds it yet.
   */
  from: 0.92,
  /** px, at least, the frame starts in from each side (and pulls back to): where 92% would travel less (a short modal's height). */
  inset: distanceTokens.md,
  /** The snap's clock in (out one step faster): the 16px travel's step, kept when the scale grew. */
  in: 'fast-02',
  overlayIn: 'moderate-01',
  overlayOut: 'fast-02',
  /** px round the modal where the pointer still lights its shadow. */
  near: distanceTokens.xl,
} as const;

/**
 * The modal's snap for a surface of `w` × `h` px: the floating surface's
 * curves on a large surface's travel — on each axis from 92% of its box, or
 * 16px in on a side where that is more, centred, over `fast-02`, out one
 * step faster.
 */
export function modalSnapProfile(w: number, h: number): SnapProfile {
  const d = MODAL_MOTION.inset;
  const start = (size: number) =>
    size > 4 * d
      ? Math.min(MODAL_MOTION.from, 1 - (2 * d) / size)
      : MODAL_MOTION.from;
  const fx = start(w);
  const fy = start(h);
  const inStep = MODAL_MOTION.in;
  return {
    from: Math.min(fx, fy),
    fromX: fx,
    fromY: fy,
    toOutX: fx,
    toOutY: fy,
    in: inStep,
    out: stepDown(inStep),
    ease: SNAP_PROPOSED_EASE['entrance-snap'],
    exitEase: SNAP_PROPOSED_EASE['exit-pullback'],
    // No fadeIn / fadeOut: the snap's fade standard, by each direction's clock as played (`snapFadeFor`).
    blinkOff: false,
    exitMode: 'scale',
    contentAxis: 'y',
    contentOffset: 1,
    // From the top or bottom edge facing the press, leaning along it toward the press.
    originEdge: 'y',
  };
}

/** What the parts read from their shell. */
export interface ModalContextValue {
  /** Asks to close (the close button, a secondary button). */
  closeModal: (event: SyntheticEvent | Event) => void;
  danger: boolean;
  labelId: string;
  titleId: string;
  bodyId: string;
  /** The parts say what they render (the label's ids, a footer makes it transactional). */
  register: (part: 'label' | 'title' | 'footer', on: boolean) => void;
  /** Slow motion, for the parts' own swaps. */
  timeScale: number;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export interface ComposedModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onKeyDown'
> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: ReactNode;
  /** On the root (the overlay's layer). */
  className?: string;
  /** On the dialog. */
  containerClassName?: string;
  /** The footer's primary button is a danger button, and focus starts on the secondary (v11). */
  danger?: boolean;
  /** v11: accepted, not drawn yet. */
  decorator?: ReactNode;
  /** No padding round the body. */
  isFullWidth?: boolean;
  /** Focus goes back here when it closes. Default: what had focus when it opened. */
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** Asks to close; returning `false` keeps it open (v11). */
  onClose?: (event: SyntheticEvent | Event) => boolean | void;
  /** Every key press inside it (v11). */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  open?: boolean;
  /** v11's rule: a passive modal closes on a press outside unless this is true; a transactional one only when it is `false`. */
  preventCloseOnClickOutside?: boolean;
  /** Focused on open. Default `[data-modal-primary-focus]`. */
  selectorPrimaryFocus?: string;
  /** Floating menus opened from inside it (focus there isn't pulled back). */
  selectorsFloatingMenus?: string[];
  /** Default md. */
  size?: ModalSize;
  /** v11: accepted, not drawn yet. */
  slug?: ReactNode;
  /** `alertdialog`, described by its body, as Carbon's Modal `alert`. */
  alert?: boolean;
  /** The page behind the dim: its `scale` (`true`: 99%) and `blur` (`'even'`), each `false` to leave it out. Default `{ scale: true, blur: 'even' }`, per field; `false`: the dim alone. */
  backdrop?: ModalBackdrop | false;
  /** The cast shadow — `true` the floating elevation, or name one; `false` none. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

const opaque = (c: RGBA): RGBA => [c[0], c[1], c[2], 1];
const over = (under: RGBA, top: RGBA): RGBA => {
  const a = top[3];
  return [0, 1, 2]
    .map((i) => under[i]! + (top[i]! - under[i]!) * a)
    .concat(1) as RGBA;
};

const ms = (t: keyof typeof motionTokens.duration) => motionTokens.duration[t];
const bezier = (name: keyof typeof motionTokens.easing) => easingCss(name);

/** Mounted while open and while it leaves; portalled with its launcher's theme. */
export const ComposedModal = forwardRef<HTMLDivElement, ComposedModalProps>(
  function ComposedModal(props, ref) {
    const { open: openProp = false, onClose, launcherButtonRef } = props;
    // The first open's work done while the browser is idle: here, where the modal is
    // mounted while closed (its shell mounts only as it opens, too late to warm anything).
    const { blur: warmBlur, scale: warmScale } = resolveBackdrop(
      props.backdrop
    );
    useEffect(
      () =>
        prewarmBackdrop(
          'modal',
          { blur: warmBlur, scale: warmScale },
          () => launcherButtonRef?.current
        ),
      [warmBlur, warmScale, launcherButtonRef]
    );
    // v11's state: it follows `open`, and closes itself unless `onClose` says no.
    const [isOpen, setIsOpen] = useState(openProp);
    const [wasOpen, setWasOpen] = useState(openProp);
    if (openProp !== wasOpen) {
      setWasOpen(openProp);
      setIsOpen(openProp);
    }
    const [present, setPresent] = useState(isOpen);
    if (isOpen && !present) setPresent(true);

    // The theme: the launcher's (or what had focus) on open, kept while it leaves.
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
        isOpen && typeof document !== 'undefined'
          ? document.activeElement
          : null;
      const opener = isOpen
        ? (props.launcherButtonRef?.current ?? from)
        : theme.from;
      setTheme({
        open: isOpen,
        name: isOpen ? themeOf(opener) : theme.name,
        from: opener,
      });
    }

    const requestClose = useCallback(
      (event: SyntheticEvent | Event) => {
        if (!onClose || onClose(event) !== false) setIsOpen(false);
      },
      [onClose]
    );
    const exited = useCallback(() => setPresent(false), []);

    if (!present || typeof document === 'undefined') return null;
    return (
      <KitPortal
        anchor={theme.from}
        hold={!isOpen}
        className={['cds-modal-portal', theme.name].filter(Boolean).join(' ')}>
        <ModalShell
          {...props}
          ref={ref}
          open={isOpen}
          requestClose={requestClose}
          onExited={exited}
        />
      </KitPortal>
    );
  }
);
ComposedModal.displayName = 'ComposedModal';

interface ShellProps extends ComposedModalProps {
  open: boolean;
  requestClose: (event: SyntheticEvent | Event) => void;
  onExited: () => void;
}

const ModalShell = forwardRef<HTMLDivElement, ShellProps>(function ModalShell(
  {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    containerClassName,
    danger = false,
    decorator: _decorator,
    isFullWidth = false,
    launcherButtonRef,
    onClose: _onClose,
    onKeyDown,
    open,
    preventCloseOnClickOutside,
    selectorPrimaryFocus = '[data-modal-primary-focus]',
    selectorsFloatingMenus,
    size = 'md',
    slug: _slug,
    alert = false,
    backdrop,
    shadow,
    timeScale = 1,
    requestClose,
    onExited,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  /** The surface's client rect at rest (placed), for the shadow's light. */
  const rectRef = useRef<DOMRect | null>(null);
  const token = useRef({});
  const release = useRef<(() => void) | null>(null);
  const lock = () => {
    release.current ??= lockPageScroll();
  };
  const unlock = () => {
    release.current?.();
    release.current = null;
  };
  const { blur, scale: pageScale } = resolveBackdrop(backdrop);
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const ids = {
    labelId: `${uid}-label`,
    titleId: `${uid}-title`,
    bodyId: `${uid}-body`,
  };
  const [parts, setParts] = useState({ label: false, title: false });
  const hasFooter = useRef(0);
  const latest = useLatest({
    open,
    requestClose,
    onExited,
    launcherButtonRef,
    selectorPrimaryFocus,
    selectorsFloatingMenus,
    preventCloseOnClickOutside,
    danger,
    reduced,
    timeScale,
    pageScale,
  });

  const register = useCallback(
    (part: 'label' | 'title' | 'footer', on: boolean) => {
      if (part === 'footer') hasFooter.current += on ? 1 : -1;
      else setParts((p) => (p[part] === on ? p : { ...p, [part]: on }));
    },
    []
  );

  const setRootRef = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  /** Centred in the viewport, on whole device px (the shadow copies its box from these). */
  const place = useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const html = document.documentElement;
    const dpr = window.devicePixelRatio || 1;
    const snap = (v: number) => Math.round(Math.max(0, v) * dpr) / dpr;
    el.style.left = `${snap((html.clientWidth - el.offsetWidth) / 2)}px`;
    el.style.top = `${snap((html.clientHeight - el.offsetHeight) / 2)}px`;
    const r = el.getBoundingClientRect();
    rectRef.current = r;
  }, []);

  /** The cast shadow's frame (motion-core's floating shadow: the surface's sibling, drawn first). */
  const castFrame = () => {
    const host = surfaceRef.current?.previousElementSibling;
    return host?.classList.contains('cast-floating')
      ? host.querySelector<HTMLElement>('.cast-floating__frame')
      : null;
  };

  /**
   * The shadow's colour, solved against what it falls on: the page at its
   * foot with the dim over it (the floating shadow's own solve looks
   * through the overlay to the undimmed page).
   */
  const solveShadow = () => {
    const el = surfaceRef.current;
    const root = rootRef.current;
    const overlay = overlayRef.current;
    const frame = castFrame();
    if (!el || !root || !overlay || !frame) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(innerHeight - 1, Math.max(0, r.bottom + 4));
    let page: RGBA | null = null;
    for (const n of document.elementsFromPoint(x, y)) {
      if (root.contains(n)) continue;
      const c = parseColor(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.999) {
        page = c;
        break;
      }
    }
    page ??= [255, 255, 255, 1];
    const dim = parseColor(getComputedStyle(overlay).backgroundColor);
    const under = dim ? over(opaque(page), dim) : opaque(page);
    frame.style.setProperty(
      '--cast-backdrop',
      `rgb(${under
        .slice(0, 3)
        .map((v) => Math.round(v))
        .join(' ')})`
    );
    deriveCastShadowColor(frame);
  };

  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(surfaceRef, {
    profile: () => {
      const el = surfaceRef.current;
      return modalSnapProfile(el?.offsetWidth ?? 0, el?.offsetHeight ?? 0);
    },
    reduced,
    timeScale,
    shadow: elevation,
  });

  /**
   * The overlay and the backdrop's effects, from where they are to shown or
   * gone, on the overlay's clocks. Reduced: the dim fades on the reduced
   * clock, the blur is there at once, and the page doesn't scale.
   */
  const fadeOverlay = (on: boolean) => {
    const { reduced: r, timeScale: k, pageScale: s } = latest.current;
    const d = ms(on ? MODAL_MOTION.overlayIn : MODAL_MOTION.overlayOut) * k;
    const easing = bezier(on ? 'entrance-productive' : 'exit-productive');
    const blurs = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('.cds-modal__blur') ?? []
    );
    const els = overlayRef.current ? [overlayRef.current, ...blurs] : blurs;
    // Every opacity read before any write: a read after a write restyles the page.
    const from = els.map((el) => parseFloat(getComputedStyle(el).opacity) || 0);
    els.forEach((el, i) => {
      const duration =
        el === overlayRef.current
          ? Math.max(1, d * reducedClock(r))
          : r
            ? 0
            : d;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.opacity = on ? '1' : '0';
      if (duration > 0)
        el.animate([{ opacity: from[i] }, { opacity: on ? 1 : 0 }], {
          duration,
          easing,
        });
    });
    if (on && s != null && !r) holdPageScale(token.current, s, d, easing);
    if (!on) releasePageScale(token.current, r ? 0 : d, easing);
  };

  /** Where focus starts: v11's order. */
  const focusIn = () => {
    const el = surfaceRef.current;
    if (!el) return;
    const { selectorPrimaryFocus: sel, danger: d } = latest.current;
    const pick =
      (sel ? el.querySelector<HTMLElement>(sel) : null) ??
      (d ? el.querySelector<HTMLElement>('[data-modal-secondary]') : null) ??
      el.querySelector<HTMLElement>('[data-modal-primary]:not([disabled])') ??
      el.querySelector<HTMLElement>('[data-modal-close]') ??
      tabbablesIn(el)[0] ??
      el;
    pick.focus({ preventScroll: true });
  };

  // Open and close.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    if (open) {
      enterLayer(token.current);
      lock();
      const active = document.activeElement;
      // The body (nothing focused) is no launcher: fall through to `launcherButtonRef`.
      const outside =
        active instanceof HTMLElement &&
        active !== document.body &&
        active !== document.documentElement &&
        !el.contains(active)
          ? active
          : null;
      if (outside) restoreRef.current = outside;
      // The cursor origin rule: from the press that opened it; from a key, the focused launcher's
      // centre; both onto its edge facing them (the profile's `originEdge`). No launcher: its centre.
      surface.open({
        place,
        cause: modalCause(outside ?? latest.current.launcherButtonRef?.current),
      });
      solveShadow();
      fadeOverlay(true);
      focusIn();
      return;
    }
    leaveLayer(token.current);
    // Focus goes back as it starts to leave.
    const back =
      latest.current.launcherButtonRef?.current ?? restoreRef.current;
    if (back?.isConnected && el.contains(document.activeElement)) back.focus();
    fadeOverlay(false);
    let gone = false;
    void surface.close().then((done) => {
      if (!done || gone) return;
      unlock();
      latest.current.onExited();
    });
    return () => {
      gone = true;
    };
    // On open / close only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Unmounted while open (or leaving): the lock, the stack and the page's scale let go.
  useEffect(() => {
    const t = token.current;
    return () => {
      leaveLayer(t);
      releasePageScale(t, 0, 'linear');
      unlock();
    };
  }, []);

  // Re-centred when the viewport or its own size changes (a swap's height glide).
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => place());
    ro.observe(el);
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [place]);

  const topmost = () => isTopLayer(token.current);

  // Escape closes the topmost layer (unless something inside handled it: a
  // menu). Focus that escapes it (a click on the page, a script) is brought
  // back, unless it went to a menu, popover or tooltip opened from it, or to
  // a layer above it.
  useLayerKeys({
    open,
    token: token.current,
    surface: surfaceRef,
    onEscape: (e) => latest.current.requestClose(e),
    trap: true,
    refocus: focusIn,
    selectorsFloatingMenus,
  });

  // Tab wraps inside it.
  const onKeyDownInside = (e: ReactKeyboardEvent<HTMLElement>) => {
    wrapTab(e, surfaceRef.current);
    onKeyDown?.(e);
  };

  /*
   * A press outside, v11's rule for whether it closes, and the standard for
   * what counts (the layers' `usePressOutside`): it starts AND ends on this
   * modal's overlay — not a drag from inside, not one that ends inside, not
   * the press that dismisses a menu opened from it, and only on the topmost
   * layer. Pointer events on the window's capture phase, so nothing in the
   * page can hide the press from it (before: React's mousedown and click on
   * the overlay, and a window listener that claims a press, as the window
   * scroller's strip did, swallowed both).
   */
  usePressOutside(
    open,
    token.current,
    () => [overlayRef.current],
    (e) => {
      const prevent = latest.current.preventCloseOnClickOutside;
      const passive = hasFooter.current === 0;
      if (passive ? !prevent : prevent === false)
        latest.current.requestClose(e);
    },
    () => floatingOpen(latest.current.selectorsFloatingMenus)
  );

  /*
   * The shadow's light: the cast shadow's own pointer response (its layers'
   * `--cast-x` / `--cast-y`, which feed `translate` only — composited, no
   * layout; the rect is the placed one, read when it is placed, not per
   * move). While the pointer is over the modal or within `MODAL_MOTION.near`
   * of it, the shadow falls away from it; elsewhere it rests, lit from
   * above. Crossing in or out, the light eases over moderate-01
   * (`data-cast-ease`), as the side nav's ghost; reduced motion: at once.
   */
  useEffect(() => {
    if (!open) return;
    let lit = false;
    let timer = 0;
    const write = (frame: HTMLElement, x: string, y: string) => {
      for (const s of Array.from(
        frame.querySelectorAll<HTMLElement>(':scope > [data-cast-layer]')
      )) {
        s.style.setProperty('--cast-x', x);
        s.style.setProperty('--cast-y', y);
      }
    };
    const ease = (frame: HTMLElement) => {
      const { reduced: r, timeScale: k } = latest.current;
      if (r) return;
      frame.dataset.castEase = '';
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => delete frame.dataset.castEase,
        ms('moderate-01') * k
      );
    };
    const rest = () => {
      const frame = castFrame();
      if (!lit || !frame) return;
      lit = false;
      ease(frame);
      write(frame, '0', '0');
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const frame = castFrame();
      const r = rectRef.current;
      if (!frame || !r || !r.width || !r.height || !topmost()) return rest();
      const n = MODAL_MOTION.near;
      const { clientX: x, clientY: y } = e;
      if (
        x < r.left - n ||
        x > r.right + n ||
        y < r.top - n ||
        y > r.bottom + n
      )
        return rest();
      if (!lit) {
        lit = true;
        ease(frame);
      }
      const unit = (v: number) => Math.max(-1, Math.min(1, v)).toFixed(3);
      write(
        frame,
        unit(((x - r.left) / r.width) * 2 - 1),
        unit(((y - r.top) / r.height) * 2 - 1)
      );
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) rest();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      // Leaving lit: it eases back to rest as the surface goes (the timer clears the ease).
      rest();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const context = useMemo<ModalContextValue>(
    () => ({ closeModal: requestClose, danger, register, timeScale, ...ids }),
    // `ids` is new each render; its strings are one `uid`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestClose, danger, register, timeScale, uid]
  );

  const named = ariaLabel
    ? undefined
    : (ariaLabelledBy ??
      ([parts.label && ids.labelId, parts.title && ids.titleId]
        .filter(Boolean)
        .join(' ') ||
        undefined));

  return (
    <div
      ref={setRootRef}
      className={['cds-modal', className].filter(Boolean).join(' ')}
      {...rest}>
      {blur === 'even' && (
        <div
          className="cds-modal__blur cds-modal__blur--even"
          style={blurStyle(MODAL_BACKDROP.even)}
          aria-hidden="true"
        />
      )}
      <div
        ref={overlayRef}
        className="cds-modal__overlay"
        aria-hidden="true"
        // A press here keeps focus where it is (inside the modal).
        onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
      />
      <div
        ref={surfaceRef}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={named}
        aria-describedby={alert ? ids.bodyId : undefined}
        tabIndex={-1}
        className={[
          'cds-modal__container',
          `cds-modal__container--${size}`,
          isFullWidth && 'cds-modal__container--full-width',
          danger && 'cds-modal__container--danger',
          'cds--layer-one',
          containerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        onKeyDown={onKeyDownInside}>
        <span className="cds-modal__frame" {...SNAP_FRAME} />
        <div className="cds-modal__content">
          <ModalContext.Provider value={context}>
            {children}
          </ModalContext.Provider>
        </div>
      </div>
    </div>
  );
});
