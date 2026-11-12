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
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import {
  DURATION_FLOOR_MS,
  SNAP,
  SNAP_FRAME,
  animateLayout,
  distanceTokens,
  motionTokens,
  reducedClock,
  snapClocks,
  snapEaseCss,
  snapFloating,
  snapAnimations,
  snapAxisClock,
  snapCollapseAxis,
  snapProfileOn,
  stepDown,
  usePrefersReducedMotion,
  useSnapSurface,
  type SnapOrigin,
  type SnapProfile,
  easingCss,
} from '@carbon-labs/v12-motion';
import { ArrowLeft, Close } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { KitDefaults, useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { IconButton, type IconButtonProps } from '@carbon-labs/react-tooltip';
import {
  TooltipHoldContext,
  createTooltipHold,
} from '@carbon-labs/react-tooltip';
import type { ButtonLookProps } from '@carbon-labs/react-props';
import { Scroller } from '@carbon-labs/react-scroller';
import { lockPageScroll } from '@carbon-labs/react-scroller';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { isRtl, useDirection } from '@carbon-labs/react-selection-kit';
import { ModalSwap } from '@carbon-labs/react-modal';
import { floatingOrSurface } from '@carbon-labs/react-snap';
import { snapEntranceContentMs } from './snap-content';
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
import './side-panel.scss';

/* ============================================================================
 * SidePanel — Carbon for IBM Products' SidePanel, on the kit
 * ============================================================================
 *
 * Its props, prop for prop: `open`, `onRequestClose`, `onUnmount`, `title`,
 * `labelText`, `subtitle`, `size` (xs / sm / md / lg / xl / 2xl, default
 * md), `placement` (end / start), `slideIn` with `selectorPageContent`,
 * `includeOverlay`, `preventCloseOnClickOutside`, `actions`,
 * `condensedActions`, `actionToolbarButtons`, `animateTitle`,
 * `currentStep` with `onNavigationBack` and `navigationBackIconDescription`,
 * `closeIconDescription`, `launcherButtonRef`, `selectorPrimaryFocus`, `id`,
 * `className`, `children`. Controlled: every way of closing asks
 * `onRequestClose`, and only `open` closes it.
 *
 *   a11y     role="dialog", named by its title; with an overlay it is modal
 *            (aria-modal, focus kept inside, Tab wraps); focus moves in on
 *            open (`selectorPrimaryFocus`, else the first tab stop in its
 *            body, else the close button), Escape asks to close (the topmost
 *            layer), focus goes back to `launcherButtonRef` (else what had it)
 *            as it starts to leave
 *   frame    what it stands on (`frame`, the kit's vocabulary, as SideNav's):
 *            `flush` (default), attached to the page's edge, full height,
 *            square, the hairline on the page-facing edge; `inset`, its own
 *            panel 8px in from the edges, 8px corners (in the page), the
 *            hairline round it; `floating`, a separate panel raised over the
 *            page, 8px in, 16px corners (over the page), the hairline round
 *            it (and the floating cast shadow, with `shadow`; none by
 *            default, the kit's)
 *   in       flush and inset: Snap's larger-surface profile (`SNAP.surface`):
 *            it enters by its edge — its width from nothing at that edge, its
 *            height from 60% about its middle.
 *            Floating: Snap's floating surface (`snapFloating()`) from its cause — the press that opened it, else (a
 *            key) its launcher's center — the height from 75% and the width
 *            from 25%. Every frame on Axial (one rule for
 *            every surface; `timing: 'axial'`, worked out by the snap for the
 *            panel it plays on). By its edge, the default rule: the width,
 *            the axis it enters along, takes the whole total (by the larger
 *            axis's travel on the travel steps: an md panel 480 × 900,
 *            moderate-03, 300ms) and the height is done at the share (0.55,
 *            165ms). Floating, by size: the surface rule over 320px
 *   content  moves with the opening, on the snap entrance's content clock:
 *            the snap's own content layer holds still
 *            under its clip and soft edge, and the content inside it starts
 *            8px back toward where the panel grows from (along x by its edge,
 *            Axial's long axis; along y when floating, Snap's content axis)
 *            and moves into place from the entrance's first frame, just after
 *            the longest axis clock, one step or 60ms later, whichever is sooner
 *            (`snapEntranceContentMs`: a 300ms width, 360ms; a 400ms width,
 *            460ms), entrance-productive, not the disclosure's
 *            arrival. Shutting it holds still; a turn goes on from where it is
 *   out      every frame and every way of closing, by default (`exit`): the
 *            collapse, Snap's own, one step faster: the far edge pulls back
 *            toward the near one (by its edge: the edge it's attached to, as
 *            its box is when it closes; floating: the edge nearest its cause,
 *            to Snap's out scale, fading over its last 40ms or 80ms by its
 *            clock, the fade standard), the other axis held, the content held
 *            still. Flush and inset: the sliver guard (`sliver: true`).
 *            `reversed` plays the entrance back
 *   push     `slideIn` (flush and inset; a floating panel is over the page):
 *            the page beside it (`selectorPageContent`) makes room, its
 *            margin on that side moving on the panel's width clock and its
 *            curve, in and out, so the gap between them holds, as one layout transaction
 *            (`animateLayout`). Without it the panel slides over the page
 *   overlay  `includeOverlay`: Carbon's $overlay over the page, on the
 *            modal's clocks (in moderate-01, out fast-02)
 *   title    `animateTitle` (default): the title scrolls with the body, and
 *            once it has gone under the top bar the bar shows it, small
 *   steps    a new `currentStep` swaps the body out, then in (ModalSwap)
 *   reduced  the snap's fade on the reduced clock (floating: there, or
 *            gone, at once); no content lead; the page makes room at once
 * ========================================================================== */

export type SidePanelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
/** The edge it's attached to, logical: `end` (default) or `start`, so right to left mirrors it (IBM Products: `right` · `left`). */
export type SidePanelPlacement = 'start' | 'end';
/** Where it is placed: over the page (the viewport), or in its positioned container. */
export type SidePanelScope = 'page' | 'container';
/** How it leaves: the profile's reversed entrance, or the collapse to its edge. */
export type SidePanelExit = 'reversed' | 'collapse';
/**
 * What it stands on (the kit's `frame`, as SideNav's): `flush`, attached to the
 * edge, square; `inset`, its own panel in from the edges; `floating`, a
 * separate panel raised over the page, opening on Snap from its cause.
 */
export type SidePanelFrame = 'flush' | 'inset' | 'floating';
export const SIDE_PANEL_FRAMES: readonly SidePanelFrame[] = [
  'flush',
  'inset',
  'floating',
];

/** A footer action: the Button's `kind` (default: the last primary, the rest secondary), `variant` and `frame` (the kit's defaults). */
export interface SidePanelAction extends ButtonLookProps {
  label?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Busy: the kit's Button `busy`. */
  loading?: boolean;
  renderIcon?: ElementType;
  className?: string;
}

/** A toolbar button: the Button's `kind`, `variant` and `frame`; its `frame` defaults to ghost. */
export interface SidePanelToolbarButton extends Pick<
  IconButtonProps,
  'kind' | 'variant' | 'frame'
> {
  label: string;
  /** Icon-only, the label its tooltip and name; without one, a ghost button with its label. */
  icon?: ElementType;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
}

export interface SidePanelProps {
  /** Up to three buttons in its footer. */
  actions?: SidePanelAction[];
  /** Buttons under the title. */
  actionToolbarButtons?: SidePanelToolbarButton[];
  /** The title scrolls with the body and comes back, small, in the top bar. Default true. */
  animateTitle?: boolean;
  children?: ReactNode;
  className?: string;
  /** The close button's tooltip and name. Default "Close". */
  closeIconDescription?: string;
  /** Smaller footer buttons. */
  condensedActions?: boolean;
  /** The step shown: a new step swaps the body out, then in; past 0, a back button. Default 0. */
  currentStep?: number;
  /** Accepted, not drawn (the AI label slot). */
  decorator?: ReactNode;
  /** Accepted, not drawn. */
  slug?: ReactNode;
  id?: string;
  /** Dim the page and keep focus in the panel. */
  includeOverlay?: boolean;
  /** A label over the title. */
  labelText?: ReactNode;
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** The back button's tooltip and name. Default "Back". */
  navigationBackIconDescription?: string;
  /** The back button. */
  onNavigationBack?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Every way of closing asks here; set `open` to close it. */
  onRequestClose?: (event: SyntheticEvent | Event) => void;
  /** After it has left. */
  onUnmount?: () => void;
  open: boolean;
  // @carbon-proposal api: logical-positions — Placement values are logical, `start` and `end`, so they follow the reading direction. TBD
  /** Default `end`. */
  placement?: SidePanelPlacement;
  /** With an overlay: a press on it doesn't close the panel. */
  preventCloseOnClickOutside?: boolean;
  /** The page beside it, which makes room with `slideIn`. */
  selectorPageContent?: string;
  /** Focused on open. */
  selectorPrimaryFocus?: string;
  /** Default md. */
  size?: SidePanelSize;
  /** Push the page aside (`selectorPageContent`) instead of sliding over it. */
  slideIn?: boolean;
  subtitle?: ReactNode;
  title?: ReactNode;
  /** Where it is placed. `page` (default): over the viewport. `container`: in its positioned container (a page region, a demo stage). */
  scope?: SidePanelScope;
  /** How it leaves. `collapse` (default, every frame): the far edge pulls back to the near one, the content still (no fade by its edge; floating, the containers' fade). `reversed`: the entrance played back. */
  exit?: SidePanelExit;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** What it stands on. Default `flush`: attached to the edge, square. `inset`: its own panel in from the edges. `floating`: raised over the page, opening on Snap from the press (or its launcher). */
  frame?: SidePanelFrame;
  /**
   * A floating panel's cast shadow: `true` (`floating`), an
   * elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none:
   * the hairline round it sets it off). Flush and inset panels never cast one.
   */
  shadow?: SurfaceShadowOption;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

/** The side panel's start: no width at its edge, 60% of its height. */
export const SIDE_PANEL_MOTION = {
  fromX: 0,
  fromY: 0.6,
  overlayIn: 'moderate-01',
  overlayOut: 'fast-02',
} as const;

const tokenCss = (name: keyof typeof motionTokens.easing) => easingCss(name);

/**
 * The side panel's overlay (its dim) from where it is to shown (`on`) or
 * gone, on its clocks (`SIDE_PANEL_MOTION`: in `moderate-01` on
 * entrance-productive, out `fast-02` on exit-productive), times `timeScale`;
 * reduced, the reduced clock. Already there, it doesn't animate. SidePanel's
 * `includeOverlay` and NavOverlay's dim are both this.
 */
export function fadeSidePanelOverlay(
  el: HTMLElement,
  on: boolean,
  {
    reduced = false,
    timeScale = 1,
  }: { reduced?: boolean; timeScale?: number } = {}
): void {
  const from = parseFloat(getComputedStyle(el).opacity) || 0;
  const to = on ? 1 : 0;
  el.getAnimations().forEach((a) => a.cancel());
  el.style.opacity = String(to);
  if (from === to) return;
  const d =
    motionTokens.duration[
      on ? SIDE_PANEL_MOTION.overlayIn : SIDE_PANEL_MOTION.overlayOut
    ] *
    timeScale *
    reducedClock(reduced);
  el.animate([{ opacity: from }, { opacity: to }], {
    duration: Math.max(DURATION_FLOOR_MS, d),
    easing: tokenCss(on ? 'entrance-productive' : 'exit-productive'),
  });
}

/**
 * Snap's larger-surface profile for a side panel by its edge (flush and inset),
 * on Axial's default rule (`SNAP.surface`'s `timing: 'axial'`,
 * one rule for every surface): the snap works its clocks out for
 * the panel it plays on, from its size and its edge (`snapProfileOn`). The
 * axis it enters along, its width, takes the whole total, on the travel
 * steps by the larger axis's travel (an md panel, 480 × 900: moderate-03,
 * 300ms); the height is done at Axial's share (0.55: 165ms). The width on
 * the follower's curves (expressive), the height on the lead's (productive).
 *
 *   collapse  (default) the far edge pulls back to the near one (the edge
 *             it's attached to), the height held, the content held still
 *             under the clip, on the out total; no fade but the guard's:
 *             the snap's soft edge,
 *             `min(16px, w, W − w)`, rides the moving edge over the content.
 *             Snap's own collapse on x (`exitMode: 'collapse'`, `collapseAxis:
 *             'x'`), opaque but for the sliver guard (`sliver: true`: its
 *             opacity width / 4px once under 4px wide), so the
 *             scale-exit stand-in (`toOutX: 0`, `toOutY: 1`) is gone
 *   reversed  the entrance played back: the width back to nothing at its
 *             edge and the height back to 60% about its middle, last in
 *             first out (Axial's mirrored out)
 */
export function sidePanelSnapProfile(
  exit: SidePanelExit = 'collapse'
): SnapProfile {
  return {
    ...SNAP.surface,
    // Joined to its edge: the sliver guard, opaque from 4px wide, so no sliver
    // shows. The floating panel takes the presence fade.
    sliver: true,
    from: SIDE_PANEL_MOTION.fromY,
    fromX: SIDE_PANEL_MOTION.fromX,
    fromY: SIDE_PANEL_MOTION.fromY,
    exitMode: exit === 'collapse' ? 'collapse' : 'scale',
    collapseAxis: 'x',
    // Its content layer held still under the clip and soft edge: the content inside it moves with the opening on the snap entrance's content clock instead (SidePanelShell's `arrive`), along the width, Axial's long axis.
    contentOffset: 0,
  };
}

/**
 * A frame's exit when none is given: the collapse, every frame, the far edge
 * pulling back with no content move.
 */
export function sidePanelDefaultExit(_frame?: SidePanelFrame): SidePanelExit {
  return 'collapse';
}

/**
 * Snap's floating surface for a floating side panel: the profile as tuned
 * (`snapFloating()`: the height from 75%, the width from 25%,
 * on one clock, entrance-snap), on Axial's floating rule (`axial:
 * 'floating'`; `sidePanelProfile` times it by size), with the side panel's
 * own:
 *
 *   out      `stepDown` of the profile's in, moved with it by size; the
 *            content's out the same. The floating in is fast-01 and
 *            `stepDown` stops at fast-01, so the out equals the in at every
 *            size (Axial's floating rule moves both by the same steps): a
 *            floating panel leaves on its entrance's clock, not a step faster
 *   exit     `collapse` (default): Snap's own fold, the far edge pulled back
 *            toward the edge nearest the cause (`collapseAxis: 'auto'`: the
 *            axis on which the origin sits at an edge; from a launcher beside
 *            the panel, across), to the profile's out scale (70%), the near
 *            edge and the content held, fading over its last 40ms or 80ms (the
 *            containers' fade: it is a container on the snap), gone on its
 *            last frame (`blinkOff`: at once when reduced); `reversed`, back
 *            toward the cause on both axes
 *   content  held still (`contentOffset` 0): the content moves with the
 *            opening on the snap entrance's content clock instead (`arrive`)
 */
export function sidePanelFloatingProfile(
  exit: SidePanelExit = 'collapse'
): SnapProfile {
  const base = snapFloating();
  const out = typeof base.in === 'string' ? stepDown(base.in) : base.out;
  return {
    ...base,
    out,
    contentOut: out,
    // No fadeIn / fadeOut: the snap's fade standard at the start and end, by each direction's
    // clock as played (`snapFadeFor`: 40ms for 220ms or less, 80ms for longer).
    blinkOff: true,
    contentOffset: 0,
    exitMode: exit === 'collapse' ? 'collapse' : 'scale',
    collapseAxis: 'auto',
  };
}

/** The profile a frame opens on; the snap works its Axial clocks out on the panel (`snapProfileOn`).
 *  Floating, `el` times it by size: the surface rule over 320px. */
export function sidePanelProfile(
  frame: SidePanelFrame,
  exit: SidePanelExit = sidePanelDefaultExit(frame),
  el: HTMLElement | null = null
): SnapProfile {
  return frame === 'floating'
    ? floatingOrSurface(el, sidePanelFloatingProfile(exit))
    : sidePanelSnapProfile(exit);
}

/** A press counts as the floating panel's cause this long, ms (the Popover's rule). */
const CAUSE_MS = 1000;
/** The last press anywhere (client px, when), while a floating panel is mounted; a key clears it. */
let lastPress: { x: number; y: number; t: number } | null = null;
let pressWatchers = 0;
const onPress = (e: PointerEvent) => {
  lastPress = { x: e.clientX, y: e.clientY, t: performance.now() };
};
const onKey = (e: KeyboardEvent) => {
  if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) lastPress = null;
};
function watchPresses(): () => void {
  if (pressWatchers++ === 0) {
    window.addEventListener('pointerdown', onPress, true);
    window.addEventListener('keydown', onKey, true);
  }
  return () => {
    if (--pressWatchers > 0) return;
    window.removeEventListener('pointerdown', onPress, true);
    window.removeEventListener('keydown', onKey, true);
    lastPress = null;
  };
}
/** The press that opened it, if a press did, just now. */
function pressCause(): { x: number; y: number } | null {
  const p = lastPress;
  return p && performance.now() - p.t < CAUSE_MS ? { x: p.x, y: p.y } : null;
}

/** Whether a panel at `placement` is on the right: the end left to right, the start right to left. */
function atRight(placement: SidePanelPlacement, el: Element | null): boolean {
  return (placement === 'end') !== (!!el && isRtl(el));
}

/** The arrival's live offset (its relative `left` / `top`), px. */
function offsetOf(el: HTMLElement): { x: number; y: number } {
  const cs = getComputedStyle(el);
  return { x: parseFloat(cs.left) || 0, y: parseFloat(cs.top) || 0 };
}

/** Mounted while open and while it leaves. */
export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const [present, setPresent] = useState(props.open);
    if (props.open && !present) setPresent(true);
    // Floating, it opens from the press that opened it: watched before it mounts.
    const floating = props.frame === 'floating';
    useEffect(() => (floating ? watchPresses() : undefined), [floating]);
    const onUnmount = useLatest(props.onUnmount);
    const exited = useCallback(() => {
      setPresent(false);
      onUnmount.current?.();
    }, [onUnmount]);
    if (!present) return null;
    return <SidePanelShell {...props} ref={ref} onExited={exited} />;
  }
);
SidePanel.displayName = 'SidePanel';

const SidePanelShell = forwardRef<
  HTMLDivElement,
  SidePanelProps & { onExited: () => void }
>(function SidePanelShell(
  {
    actions,
    actionToolbarButtons,
    animateTitle = true,
    children,
    className,
    closeIconDescription = 'Close',
    condensedActions = false,
    currentStep = 0,
    decorator: _decorator,
    slug: _slug,
    id,
    includeOverlay = false,
    labelText,
    launcherButtonRef,
    navigationBackIconDescription = 'Back',
    onNavigationBack,
    onRequestClose,
    onUnmount: _onUnmount,
    open,
    placement = 'end',
    preventCloseOnClickOutside = false,
    selectorPageContent,
    selectorPrimaryFocus,
    size = 'md',
    slideIn = false,
    subtitle,
    title,
    scope = 'page',
    exit: exitProp,
    frame = 'flush',
    shadow,
    timeScale = 1,
    onExited,
  },
  ref
) {
  const exit = exitProp ?? sidePanelDefaultExit(frame);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  // Its close button's tooltip opens away from the edge it's on.
  const dir = useDirection(surfaceRef);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const arriveRef = useRef<HTMLDivElement>(null);
  const arrival = useRef<Animation | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [token] = useState(() => ({}));
  // Its tooltips (close, back, the toolbar's, the body's icon buttons) wait while it moves.
  const [tips] = useState(createTooltipHold);
  const release = useRef<(() => void) | null>(null);
  const pushAnim = useRef<Animation | null>(null);
  const pushed = useRef<{
    el: HTMLElement;
    prop: 'marginInlineEnd' | 'marginInlineStart';
  } | null>(null);
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const titleId = `${uid}-title`;
  const latest = useLatest({
    exit,
    frame,
    placement,
    reduced,
    timeScale,
    slideIn,
    selectorPageContent,
    onRequestClose,
    onExited,
    launcherButtonRef,
    selectorPrimaryFocus,
    includeOverlay,
    contained: scope === 'container',
  });

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      surfaceRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(surfaceRef, {
    // Read at each open and close; the snap works its Axial clocks out on the panel as it is then (its size, its origin).
    profile: () =>
      sidePanelProfile(
        latest.current.frame,
        latest.current.exit,
        surfaceRef.current
      ),
    reduced,
    timeScale,
    // A floating panel is raised over the page: the floating surfaces' cast shadow, when asked for.
    shadow: frame === 'floating' ? elevation : null,
  });

  /** By its edge: its edge, the middle of it, where it grows from and goes back to. */
  const origin = (): SnapOrigin => {
    const el = surfaceRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    return { x: atRight(latest.current.placement, el) ? w : 0, y: h / 2 };
  };

  /**
   * Where it folds back to, leaving (the collapse: the far edge pulls back
   * to this line, the near edge on it holds). By its edge: the middle of
   * the edge it's attached to, as its box is now — the origin it opened
   * from is stale once its box has changed while open (a size picked, a
   * size-class edge re-placing it as a sheet), and the fold to that old
   * line moved its near edge too. Floating: toward its cause, on the axis
   * Snap's collapse picks for it (`snapCollapseAxis`, `collapseAxis:
   * 'auto'`), put on that axis's nearest edge, so the far edge pulls back to
   * the near one rather than both closing on a press inside the box.
   */
  const foldOrigin = (): SnapOrigin => {
    if (latest.current.frame !== 'floating') return origin();
    const el = surfaceRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    const o = surface.origin() ?? { x: w / 2, y: h / 2 };
    // Reversed, it goes back toward the cause itself.
    if (latest.current.exit !== 'collapse') return o;
    return snapCollapseAxis({ w, h }, o) === 'x'
      ? { x: o.x < w / 2 ? 0 : w, y: o.y }
      : { x: o.x, y: o.y < h / 2 ? 0 : h };
  };

  /**
   * The content moves with the opening (the snap entrance's content clock):
   * it starts 8px back toward where the panel grows from —
   * by its edge, along x (Axial's long axis, the direction of entrance);
   * floating, along y (Snap's content axis), against the height's growth
   * from its origin — and moves into place from the entrance's first frame,
   * no wait, just after the entrance's longest axis clock
   * (`snapEntranceContentMs`: the md panel's 300ms width, 360ms), on
   * entrance-productive. A turn (reopened as it
   * left): from where it stopped, on the same clock. Reduced: none.
   *
   * It moves by its relative offset (`left` / `top`), not `translate`: a
   * `translate` runs on the compositor, while the snap's clip, frame, soft
   * edge and cast shadow run on the main thread, so whenever the main
   * thread drops frames as the panel opens (its first frames are the
   * busiest: the mount, focus, the body's controls) the content would keep
   * sliding under a frozen clip and the clip then jump after it, a
   * flicker. On the main thread with them, it holds and goes on with them.
   */
  const arrive = (turn: boolean) => {
    const el = arriveRef.current;
    const s = surfaceRef.current;
    const was = arrival.current;
    arrival.current = null;
    const live = el && was ? offsetOf(el) : null;
    was?.cancel();
    const {
      frame: f,
      exit: x,
      placement: side,
      reduced: r,
      timeScale: k,
    } = latest.current;
    if (!el || !s || r) return;
    const at = surface.origin() ?? origin();
    // The longest axis's clock in (the snap's `ms`), and the content just after it, from the first frame.
    const { ms } = snapClocks(
      snapProfileOn(sidePanelProfile(f, x, s), s, at),
      'in'
    );
    const onY = f === 'floating';
    const back = onY
      ? at.y > s.offsetHeight / 2 + 0.5
        ? 1
        : -1
      : atRight(side, s)
        ? 1
        : -1;
    const from = turn
      ? live
        ? onY
          ? live.y
          : live.x
        : 0
      : back * distanceTokens.sm;
    if (Math.abs(from) < 0.01) return;
    const along = onY ? 'top' : 'left';
    arrival.current = el.animate(
      [{ [along]: `${from}px` }, { [along]: '0px' }],
      {
        duration: snapEntranceContentMs(ms) * k,
        easing: snapEaseCss('entrance-productive'),
        fill: 'backwards',
      }
    );
  };
  /** Shutting: the content holds where it is (waiting or moving); the clip's soft edge closes over it. */
  const holdContent = () => {
    if (arrival.current?.playState === 'running') arrival.current.pause();
  };

  /** The width's clock and curve as the snap plays them on this panel: the page's edge moves with the panel's, so the gap holds. */
  const widthClock = (phase: 'in' | 'out') => {
    const el = surfaceRef.current;
    const c = snapAxisClock(
      sidePanelSnapProfile(latest.current.exit),
      el,
      origin(),
      'x',
      phase,
      {
        curve: 'surface',
      }
    );
    return { ms: c.ms * latest.current.timeScale, easing: c.easing };
  };

  /**
   * Push: the page beside it makes room (its margin on that side), from
   * wherever it is, on the width's clock. Closed, its own margin is back.
   */
  const push = (to: 'open' | 'closed') => {
    const {
      slideIn,
      frame: f,
      selectorPageContent: sel,
      placement: side,
      reduced: r,
    } = latest.current;
    // A floating panel is over the page: nothing makes room for it.
    const on = slideIn && f !== 'floating';
    const el = surfaceRef.current;
    const prop = side === 'end' ? 'marginInlineEnd' : 'marginInlineStart';
    let page = pushed.current?.el ?? null;
    if (!page && on && sel) page = document.querySelector<HTMLElement>(sel);
    if (!page || !el) return;
    if (to === 'open' && !on) return;
    // Its room: its width, and an inset panel's distance from the edge.
    const cs = getComputedStyle(el);
    const room =
      el.offsetWidth +
      (parseFloat(side === 'end' ? cs.insetInlineEnd : cs.insetInlineStart) ||
        0);
    pushed.current = { el: page, prop };
    const live = parseFloat(getComputedStyle(page)[prop]) || 0;
    pushAnim.current?.cancel();
    page.style[prop] = '';
    const base = parseFloat(getComputedStyle(page)[prop]) || 0;
    const end = to === 'open' ? base + room : base;
    page.style[prop] = `${end}px`;
    const clock = widthClock(to === 'open' ? 'in' : 'out');
    const share = Math.min(1, Math.abs(end - live) / Math.max(1, room));
    if (share < 0.001) {
      if (to === 'closed') page.style[prop] = '';
      return;
    }
    // The transaction's root is the page itself, not its parent: only what
    // the push resizes is in the move. On its parent (the app shell's body)
    // it covered the nav column too, and every selector there followed the
    // push frame by frame though nothing round it moved.
    const { animation } = animateLayout(
      page,
      page,
      [{ [prop]: `${live}px` }, { [prop]: `${end}px` }],
      {
        ms: clock.ms * share,
        easing: clock.easing,
        reason: 'side-panel',
        reduced: r,
      }
    );
    pushAnim.current = animation;
    if (to === 'closed')
      void animation.finished.then(
        () => {
          page.style[prop] = '';
          pushed.current = null;
        },
        () => undefined
      );
  };

  /** The overlay from where it is to shown or gone (`fadeSidePanelOverlay`). */
  const fadeOverlay = (on: boolean) => {
    const el = overlayRef.current;
    if (!el) return;
    const { reduced, timeScale: k } = latest.current;
    fadeSidePanelOverlay(el, on, { reduced, timeScale: k });
  };

  /**
   * Its tooltips wait until it has landed (tooltip/hold.ts): a tooltip asked
   * for mid-move (a pointer resting where the close button lands, the focus
   * moved in on open) would be placed against the button's moving box, up to 8px
   * off, and stay there. Landed: the snap and the arrival have finished.
   * Interrupted (it closed, or turned): the next motion lands it instead.
   */
  const landTips = () => {
    const el = surfaceRef.current;
    if (!el) return;
    tips.hold();
    const moving = [...snapAnimations(el), arrival.current].filter(
      (a): a is Animation => a != null
    );
    void Promise.all(moving.map((a) => a.finished)).then(
      () => {
        if (surfaceRef.current === el && !surface.leaving()) tips.land();
      },
      () => undefined
    );
  };

  const focusIn = () =>
    focusInto(
      surfaceRef.current,
      latest.current.selectorPrimaryFocus,
      bodyRef.current
    );

  // Open and close.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    if (open) {
      enterLayer(token);
      const active = document.activeElement;
      if (active instanceof HTMLElement && !el.contains(active))
        restoreRef.current = active;
      if (latest.current.includeOverlay && !latest.current.contained)
        release.current ??= lockPageScroll();
      const turn = surface.leaving();
      if (latest.current.frame === 'floating') {
        // From its cause: the press that opened it, else (a key) its launcher's center, clamped into it.
        const launcher =
          latest.current.launcherButtonRef?.current ?? restoreRef.current;
        surface.open({
          cause: pressCause(),
          trigger: launcher?.isConnected ? launcher : null,
        });
      } else surface.open({ origin: origin() });
      arrive(turn);
      fadeOverlay(true);
      push('open');
      landTips();
      focusIn();
      return;
    }
    leaveLayer(token);
    tips.hold();
    const back =
      latest.current.launcherButtonRef?.current ?? restoreRef.current;
    if (back?.isConnected && el.contains(document.activeElement)) back.focus();
    fadeOverlay(false);
    push('closed');
    holdContent();
    let gone = false;
    void surface.close({ origin: foldOrigin() }).then((done) => {
      if (!done || gone) return;
      arrival.current?.cancel();
      arrival.current = null;
      release.current?.();
      release.current = null;
      latest.current.onExited();
    });
    return () => {
      gone = true;
    };
    // On open / close only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Unmounted while open or leaving: the layer, the lock and the page let go.
  useEffect(() => {
    const t = token;
    return () => {
      leaveLayer(t);
      release.current?.();
      release.current = null;
      pushAnim.current?.cancel();
      const p = pushed.current;
      if (p) p.el.style[p.prop] = '';
    };
  }, [token]);

  const requestClose = (e: SyntheticEvent | Event) =>
    latest.current.onRequestClose?.(e);

  // The Back button is there past the first step only. Leaving with focus on it, it hands the
  // focus to the close button (else the panel). A ref is let go before its element is removed,
  // focus still on it; a button that only rendered again takes its ref back.
  const backEl = useRef<HTMLElement | null>(null);
  const backLeftFocused = useRef(false);
  const setBack = useCallback((el: HTMLElement | null) => {
    backLeftFocused.current =
      !el && !!backEl.current && backEl.current === document.activeElement;
    backEl.current = el;
  }, []);
  const hasBack = currentStep > 0;
  useLayoutEffect(() => {
    if (hasBack || !backLeftFocused.current) return;
    backLeftFocused.current = false;
    const el = surfaceRef.current;
    (el?.querySelector<HTMLElement>('[data-layer-close]') ?? el)?.focus();
  }, [hasBack]);

  useLayerKeys({
    open,
    token: token,
    surface: surfaceRef,
    onEscape: requestClose,
    trap: includeOverlay,
    refocus: focusIn,
  });
  usePressOutside(
    open && includeOverlay && !preventCloseOnClickOutside,
    token,
    () => [overlayRef.current],
    requestClose
  );

  // The title, once it has scrolled under the top bar, shows in the bar.
  useEffect(() => {
    const vp = bodyRef.current;
    const el = surfaceRef.current;
    if (!animateTitle || !vp || !el) return;
    const read = () => {
      const t = titleRef.current;
      const past = t
        ? vp.scrollTop > Math.max(8, t.offsetHeight - 24)
        : vp.scrollTop > 8;
      el.toggleAttribute('data-condensed', past);
    };
    read();
    vp.addEventListener('scroll', read, { passive: true });
    return () => vp.removeEventListener('scroll', read);
  }, [animateTitle]);

  const hasTitle = title != null && title !== '';
  const titleBlock = (
    <div ref={titleRef} className="cds-side-panel__title-block">
      {labelText != null && labelText !== '' && (
        <p className="cds-side-panel__label">{labelText}</p>
      )}
      {hasTitle && (
        <h2 id={titleId} className="cds-side-panel__title">
          {title}
        </h2>
      )}
      {subtitle != null && subtitle !== '' && (
        <p className="cds-side-panel__subtitle">{subtitle}</p>
      )}
      {actionToolbarButtons?.length ? (
        <div className="cds-side-panel__toolbar">
          {actionToolbarButtons.map((b, i) =>
            b.icon ? (
              <IconButton
                key={i}
                kind={b.kind}
                variant={b.variant}
                frame={b.frame ?? 'ghost'}
                size="sm"
                corners="full"
                label={b.label}
                disabled={b.disabled}
                className={b.className}
                onClick={b.onClick}
                renderIcon={b.icon}
              />
            ) : (
              <Button
                key={i}
                kind={b.kind}
                variant={b.variant}
                frame={b.frame ?? 'ghost'}
                size="sm"
                corners="full"
                disabled={b.disabled}
                className={b.className}
                onClick={b.onClick}
                timeScale={timeScale}>
                {b.label}
              </Button>
            )
          )}
        </div>
      ) : null}
    </div>
  );

  const shown = (actions ?? []).slice(0, 3);
  const stepped = currentStep > 0;

  return (
    <>
      {includeOverlay && (
        <div
          ref={overlayRef}
          className={`cds-side-panel__overlay${scope === 'container' ? ' cds-side-panel__overlay--contained' : ''}`}
          aria-hidden="true"
          onMouseDown={(e) => e.preventDefault()}
        />
      )}
      <div
        ref={setRef}
        id={id}
        role="dialog"
        aria-modal={includeOverlay || undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        tabIndex={-1}
        className={[
          'cds-side-panel',
          `cds-side-panel--${size}`,
          `cds-side-panel--${placement}`,
          `cds-side-panel--${frame}`,
          scope === 'container' && 'cds-side-panel--contained',
          stepped && 'cds-side-panel--stepped',
          animateTitle && 'cds-side-panel--animate-title',
          'cds--layer-one',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...inertProps(!open)}
        onKeyDown={(e) => includeOverlay && wrapTab(e, surfaceRef.current)}>
        <span className="cds-side-panel__frame" {...SNAP_FRAME} />
        <TooltipHoldContext.Provider value={tips}>
          <div className="cds-side-panel__content">
            {/* The snap's content layer holds still under its clip and soft edge; this moves with the opening. */}
            <div ref={arriveRef} className="cds-side-panel__arrive">
              <div className="cds-side-panel__bar">
                {stepped && (
                  <IconButton
                    ref={setBack}
                    frame="ghost"
                    size="md"
                    corners="full"
                    align="right"
                    label={navigationBackIconDescription}
                    className="cds-side-panel__back"
                    onClick={(e) => onNavigationBack?.(e)}>
                    <ArrowLeft size={16} aria-hidden="true" />
                  </IconButton>
                )}
                {animateTitle && hasTitle && (
                  <p className="cds-side-panel__bar-title" aria-hidden="true">
                    {title}
                  </p>
                )}
                <div className="cds-side-panel__close">
                  <IconButton
                    frame="ghost"
                    size="md"
                    corners="full"
                    align={
                      (placement === 'end') !== (dir === 'rtl')
                        ? 'left'
                        : 'right'
                    }
                    label={closeIconDescription}
                    data-layer-close=""
                    onClick={requestClose}>
                    <Close size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
              {!animateTitle && titleBlock}
              <Scroller
                className="cds-side-panel__body"
                viewportClassName="cds-side-panel__viewport"
                timeScale={timeScale}
                viewportRef={(el) => {
                  bodyRef.current = el;
                }}>
                {animateTitle && titleBlock}
                <div className="cds-side-panel__inner">
                  <ModalSwap swapKey={currentStep} timeScale={timeScale}>
                    {/* A framed surface, in every frame: what selects and navigates inside it is ghost by default; its containers are square in a flush panel (attached to an edge, as it is), rounded in an inset or floating one. */}
                    <KitDefaults
                      frame="ghost"
                      containerCorners={
                        frame === 'flush' ? 'square' : 'rounded'
                      }>
                      {children}
                    </KitDefaults>
                  </ModalSwap>
                </div>
              </Scroller>
              {shown.length > 0 && (
                <div
                  className={[
                    'cds-side-panel__actions',
                    condensedActions && 'cds-side-panel__actions--condensed',
                  ]
                    .filter(Boolean)
                    .join(' ')}>
                  {shown.map((a, i) => (
                    <Button
                      key={i}
                      kind={
                        a.kind ??
                        (i === shown.length - 1 ? 'primary' : 'secondary')
                      }
                      variant={a.variant}
                      frame={a.frame}
                      size={condensedActions ? 'md' : 'lg'}
                      corners="full"
                      disabled={a.disabled}
                      busy={a.loading}
                      renderIcon={a.renderIcon}
                      className={a.className}
                      onClick={a.onClick}
                      timeScale={timeScale}>
                      {a.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TooltipHoldContext.Provider>
      </div>
    </>
  );
});
SidePanelShell.displayName = 'SidePanelShell';
