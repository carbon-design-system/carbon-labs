/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  SNAP_FRAME,
  snapProfileFor,
  usePrefersReducedMotion,
  useSnapSurface,
  type CastElevation,
  type SelectionRect,
} from '@carbon-labs/v12-motion';
import { anchorInset } from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import {
  resolveShadow,
  useKitDefaults,
  type KitDefaultsValue,
} from '@carbon-labs/react-kit-defaults';
import { usePortalBrand } from '@carbon-labs/react-kit-defaults';
import { SNAP_EXIT_FADE_ATTR } from '@carbon-labs/v12-motion';
import { clientRect, useLatest } from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import { floatingOrSurface } from '@carbon-labs/react-snap';
import { playSoftEdge } from './soft-edge';
import { isComposing } from '@carbon-labs/react-util';
import { useFloatingMount, useFloatingPresence } from './useFloatingPresence';
import {
  inverseTheme,
  themeZoneAt,
  writeZone,
} from '@carbon-labs/react-theme-zone';
import {
  normalizePopoverAlign,
  placePopover,
  popoverBounds,
  type PopoverAlignment,
  type PopoverAlignmentDeprecated,
  type PopoverBoundary,
  type PopoverPlacement,
} from './placement';
import './popover.scss';

/* ============================================================================
 * Popover — Carbon v11's Popover and PopoverContent on the family's floating
 * surface. Anything opened from a trigger that
 * isn't a list of actions; the Toggletip is built on it.
 * ============================================================================
 *
 * Two forms, one surface:
 *
 *   v11       `<Popover open align …>{trigger}<PopoverContent>…</PopoverContent></Popover>`:
 *             v11's props — `align` (twelve, and the deprecated names;
 *             default `bottom`, `bottom-start` for a tab tip), `dropShadow`
 *             (default off here; v11: on),
 *             `highContrast`, `isTabTip`, `autoAlign`, `autoAlignBoundary`,
 *             `alignmentAxisOffset`, `backgroundToken`, `border`, `as`,
 *             `onRequestClose` (a click outside, focus leaving, Escape
 *             inside the content). The content is rendered in place (so Tab
 *             goes from the trigger into it, as v11) and drawn in a fixed
 *             layer, corrected for a transformed ancestor
 *   anchored  `<Popover open anchor={el} label onClose>…</Popover>`: the
 *             content is portalled with its trigger's theme; it takes focus
 *             (the first control inside, else the panel; `role="dialog"`),
 *             Escape returns focus to the trigger, a press outside or focus
 *             leaving closes it. The chat shell's panels
 *
 *   arrive   the floating surface's snap, timed by size (`floatingOrSurface`):
 *            the frame grows from its cause (the press on the trigger, else the
 *            trigger's center) and the content slides out of it on y;
 *            leaving, the far edge folds back toward the cause and the
 *            surface is gone on the fold's last frame, fading over its last
 *            part, as it fades up over its first part coming in (the
 *            fade standard: 40ms on a clock of 220ms or less, else 80ms, carbon-motion's `snapFadeFor`;
 *            `exitFade={false}` leaves opaque). Reopened
 *            mid-exit it turns round from where it is. Reduced motion: there
 *            and gone at once
 *   edge     the soft edge on every side the container clips the content,
 *            the disclosure's `min(16px, h, H − h)` per side, played from the
 *            snap's live geometry (`soft-edge.ts`; the snap's own soft edge,
 *            which fades only the moving edges, is off here)
 *   caret    none: every floating surface sits the family's
 *            4px off its trigger, as the menu and the tooltip do. v11's
 *            `caret` prop isn't taken
 *   tab tip  flush on its trigger, which takes the surface's fill and
 *            hairline while it's open, so the two read as one shape (a 1px
 *            seam of the fill covers the surface's hairline under it)
 *   look     the floating standard (`--cds-surface`, `--cds-surface-divider`
 *            hairline) in every variant, 16px corners (`corners="square"`:
 *            none); `highContrast` (or `variant="inverse"`): the same surface
 *            in the opposite theme (white ↔ g100), its contents a
 *            layer up; `border={false}` / `outline={false}` drops the
 *            hairline; `backgroundToken="background"` fills with the page's
 *            `$background`
 *   shadow   none by default (the kit's default, `KitDefaults shadow`);
 *            `dropShadow`, or `shadow` to name an elevation, turns
 *            on the cast shadow lit from above, drawn by the snap surface and
 *            following it
 * ========================================================================== */

export type {
  PopoverAlignment,
  PopoverAlignmentDeprecated,
  PopoverBoundary,
} from './placement';

export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Whether it is open (v11: required). */
  open: boolean;
  /** v11's twelve, or its deprecated names. Default `bottom` (`bottom-start` for a tab tip; the anchored form `bottom-start`). */
  align?: PopoverAlignment | PopoverAlignmentDeprecated;
  /** The container's element (v11's `as`). Default `span`. */
  as?: ElementType;
  /** Flip to the first of v11's fallbacks that fits, kept in view. Default false (the anchored form: true). */
  autoAlign?: boolean;
  /** What `autoAlign` fits: an element, elements, a client rect, or `clippingAncestors` (default). */
  autoAlignBoundary?: PopoverBoundary;
  /** Along the alignment axis, px, inward from a `-start` / `-end` edge (v11). */
  alignmentAxisOffset?: number;
  /** `layer` (default: the kit's quiet surface) or `background` (the page's). */
  backgroundToken?: 'layer' | 'background';
  /** v11's border: the hairline. Default on (the family's outlined surface); `outline` wins. */
  border?: boolean;
  /** The trigger and a `PopoverContent` (the v11 form), or the content (the anchored form). */
  children?: ReactNode;
  className?: string;
  /** The cast shadow. Default off (v11: on); `shadow` wins. */
  dropShadow?: boolean;
  /** The opposite theme's surface (v11's high contrast). */
  highContrast?: boolean;
  /** A tab: flush on its trigger, which joins the surface while open. `bottom-start` / `bottom-end`. */
  isTabTip?: boolean;
  /** Asks the host to close it: a click outside, focus leaving, Escape inside the content. */
  onRequestClose?: () => void;

  /* ── Beyond Carbon's API ── */

  /** The anchored form: the trigger it opens from (portalled, its theme carried, focus returned to it). */
  anchor?: HTMLElement | null;
  /** The anchored form's close request (as `onRequestClose`). */
  onClose?: () => void;
  /** The anchored form's accessible name (its `role="dialog"`). */
  label?: string;
  /** The snap's origin, client px: the press that opened it. Default the press on the trigger, else its center. */
  origin?: { x: number; y: number } | null;
  /** `rounded` (16px, default) or `square`. */
  corners?: 'rounded' | 'square';
  /** The look: `outlined` (default), `tonal` (no hairline), `inverse` (the opposite theme; as `highContrast`). */
  variant?: 'inverse' | 'tonal' | 'outlined';
  /** The hairline. Default on, except `tonal` and `inverse`. */
  outline?: boolean;
  /** The cast shadow: `true` is the `floating` elevation, or name one; `false` none. Default: the kit's (`KitDefaults shadow`, none). Wins over `dropShadow`. */
  shadow?: SurfaceShadowOption;
  /** Slow motion for the snap. Default 1. */
  timeScale?: number;
  /**
   * The snap exit's fade (40ms on a short exit, else 80ms). Default true, every snap exit's
   * (carbon-motion's `snapExitFades`). `false`: it folds back opaque and is
   * gone on its last frame, for one that must not show what's under it.
   */
  exitFade?: boolean;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children?: ReactNode;
}

/** The forms' props: the Popover's, and its forwarded ref. */
type PopoverFormProps = PopoverProps & { forwardedRef?: Ref<HTMLElement> };

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** A press on the trigger counts as the snap's cause this long, ms. */
const CAUSE_MS = 1000;

/**
 * One stable ref callback for several refs. A new callback each render is
 * detached and attached again in every commit, and attached only after the
 * children's layout effects: the surface, a child of its container, would
 * read the container as null while it opens.
 */
export function useMergedRef<T>(
  ...refs: (Ref<T> | undefined)[]
): (el: T | null) => void {
  const all = useRef(refs);
  useLayoutEffect(() => {
    all.current = refs;
  });
  return useCallback((el: T | null) => mergeRefs(...all.current)(el), []);
}

/* ── the look ─────────────────────────────────────────────────────────── */

interface Look {
  variant: 'inverse' | 'tonal' | 'outlined';
  outline: boolean;
  background: 'layer' | 'background';
  corners: 'rounded' | 'square';
  /** The snap exit's fade (`exitFade`, default true). */
  exitFade: boolean;
}

function lookOf(p: PopoverProps): Look {
  const variant = p.variant ?? (p.highContrast ? 'inverse' : 'outlined');
  return {
    variant,
    outline: p.outline ?? p.border ?? variant === 'outlined',
    background: p.backgroundToken ?? 'layer',
    corners: p.corners ?? 'rounded',
    exitFade: p.exitFade ?? true,
  };
}

/**
 * No shadow unless asked for (the kit's default): `shadow`, else `dropShadow`,
 * else the provider's (`KitDefaults shadow`), else none.
 */
const elevationOf = (
  p: PopoverProps,
  kit: KitDefaultsValue
): CastElevation | null => resolveShadow(p.shadow ?? p.dropShadow, kit);

/* ── the surface (both forms) ──────────────────────────────────────────── */

interface SurfaceProps {
  open: boolean;
  /** The element it is placed from. */
  anchor: () => HTMLElement | null;
  /** The trigger itself, for its fill inset (`--cds-anchor-inset`). */
  trigger: () => HTMLElement | null;
  /** The press that opened it, client px. */
  cause: () => { x: number; y: number } | null;
  align: PopoverAlignment;
  autoAlign: boolean;
  boundary?: PopoverBoundary;
  alignmentAxisOffset?: number;
  tabTip: boolean;
  look: Look;
  shadow: CastElevation | null;
  timeScale: number;
  /** Portalled out of its trigger's DOM: carry the trigger's theme over. */
  portal: boolean;
  /** Snap in when it mounts open (a gesture opened it); else there at once. */
  snapOnMount: boolean;
  /** Take focus on open (the anchored form). */
  takeFocus: boolean;
  onPlaced?: (align: PopoverAlignment) => void;
  onExited?: () => void;
  surfaceProps: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };
  children?: ReactNode;
}

function PopoverSurface({
  open,
  look,
  tabTip,
  portal,
  surfaceProps: { className: extraClass, ref: extraRef, ...surfaceProps },
  children,
  ...p
}: SurfaceProps) {
  const ref = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const seamRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const stopSoftEdge = useRef<(() => void) | null>(null);
  const reduced = usePrefersReducedMotion();
  const latest = useLatest({ ...p, tabTip, look, portal, reduced });
  const mounted = useRef(false);
  const surfaceRef = useMergedRef(ref, extraRef);
  // Portalled, it leaves its trigger's brand zone: the layer carries the brand (as KitPortal's container does).
  usePortalBrand(layerRef, p.anchor, { enabled: portal, hold: !open });

  // The floating surface's lifecycle (`useSnapSurface`): from its cause,
  // turning round mid-exit, back into it. Hidden (`hidden`) once it has left.
  const surface = useSnapSurface(ref, {
    // The soft edge is the Popover's own, on every clipped side (`soft-edge.ts`). Timed by its size: a large popover (a form) on the surface rule.
    profile: () =>
      floatingOrSurface(ref.current, {
        ...snapProfileFor('popover'),
        softEdge: false,
      }),
    reduced,
    timeScale: p.timeScale,
    shadow: p.shadow,
    show: (el) => {
      el.hidden = false;
      el.style.visibility = '';
    },
    hide: (el) => {
      el.hidden = true;
    },
  });

  /** The theme it is drawn in: the opposite one (high contrast), or the trigger's carried into a portal. */
  const applyTheme = () => {
    const layer = layerRef.current;
    const o = latest.current;
    if (!layer) return;
    const own = themeZoneAt(o.anchor());
    const theme =
      o.look.variant === 'inverse' ? inverseTheme(own) : o.portal ? own : null;
    layer.className = ['cds-popover-layer', theme && 'cds--layer-one']
      .filter(Boolean)
      .join(' ');
    writeZone(layer, theme);
  };

  /** A tab tip's seam: the trigger's width, 1px in, over the surface's hairline under it. */
  const placeSeam = (
    pl: PopoverPlacement,
    size: { w: number; h: number },
    off: { x: number; y: number },
    a: SelectionRect
  ) => {
    const c = seamRef.current;
    if (!c) return;
    const side = pl.align.split('-')[0]!;
    const l = Math.max(pl.left, a.l + 1);
    const r = Math.min(pl.left + size.w, a.r - 1);
    c.style.left = `${l - off.x}px`;
    c.style.width = `${Math.max(0, r - l)}px`;
    c.style.top = `${(side === 'bottom' ? pl.top : pl.top + size.h - 1) - off.y}px`;
  };

  /** Where it goes, at its size, on whole device px; a tab tip's seam with it. */
  const place = () => {
    const el = ref.current;
    const o = latest.current;
    const a = o.anchor();
    if (!el || !a) return;
    el.style.left = '0px';
    el.style.top = '0px';
    // At 0, 0 its box is the containing block's origin: the viewport's, or a
    // transformed ancestor's (the v11 form is drawn inside its trigger's DOM).
    const r = el.getBoundingClientRect();
    const off = { x: r.left, y: r.top };
    const size = { w: r.width, h: r.height };
    const trigger = o.trigger() ?? a;
    // The gap is taken from a trigger's visible fill; a tab tip sits on its box.
    const inset = o.tabTip ? 0 : anchorInset(trigger);
    const box = clientRect(a);
    const align =
      o.tabTip && !/^(bottom|top)-(start|end)$/.test(o.align)
        ? 'bottom-start'
        : o.align;
    const vertical = /^(top|bottom)/;
    const anchor: SelectionRect = vertical.test(align)
      ? { ...box, t: box.t + inset, b: box.b - inset }
      : { ...box, l: box.l + inset, r: box.r - inset };
    const pl = placePopover({
      anchor,
      size,
      align,
      autoAlign: o.autoAlign,
      tabTip: o.tabTip,
      alignmentAxisOffset: o.alignmentAxisOffset,
      bounds: popoverBounds(a, o.boundary),
    });
    const dpr = window.devicePixelRatio || 1;
    const px = (n: number) => Math.round(n * dpr) / dpr;
    pl.left = px(pl.left);
    pl.top = px(pl.top);
    el.style.left = `${pl.left - off.x}px`;
    el.style.top = `${pl.top - off.y}px`;
    el.dataset.placement = pl.align;
    if (o.tabTip) placeSeam(pl, size, off, box);
    o.onPlaced?.(pl.align);
  };

  /** A tab tip's seam goes with the surface: shown with it, any fade mirrored, hidden with it. */
  const followSeam = (shown: boolean) => {
    const c = seamRef.current;
    const el = ref.current;
    if (!c || !el) return;
    c.getAnimations().forEach((a) => a.cancel());
    c.hidden = !shown;
    if (!shown) return;
    for (const a of el.getAnimations()) {
      const effect = a.effect as KeyframeEffect | null;
      if (!effect) continue;
      const frames = effect
        .getKeyframes()
        .filter((k) => k.opacity != null)
        .map((k) => ({
          offset: k.offset,
          opacity: k.opacity,
          easing: k.easing,
        }));
      if (frames.length < 2) continue;
      const t = effect.getTiming();
      const m = c.animate(frames as Keyframe[], {
        duration: t.duration,
        delay: t.delay,
        easing: t.easing,
        fill: t.fill,
      });
      m.currentTime = a.currentTime;
      m.playbackRate = a.playbackRate;
    }
  };

  /** The soft edge, for the snap that has just started. */
  const softEdge = () => {
    stopSoftEdge.current?.();
    const el = ref.current;
    const content = contentRef.current;
    stopSoftEdge.current = el && content ? playSoftEdge(el, content) : null;
  };
  useEffect(() => () => stopSoftEdge.current?.(), []);

  /** The first open or close this surface has seen (it was mounted open, or never shown). */
  const firstRun = () => {
    const first = !mounted.current;
    mounted.current = true;
    return first;
  };

  // Its lifecycle (`useFloatingPresence`): open, close, and while open it
  // follows its trigger — scrolling (anything but its own content) and
  // resizing re-place it, and its shadow with it, once a frame.
  useFloatingPresence(surface, {
    open,
    enter: () => {
      const el = ref.current;
      const first = firstRun();
      if (!el) return;
      const o = latest.current;
      applyTheme();
      if (first && !o.snapOnMount) {
        // Open from the start (nobody's gesture): there, no motion.
        el.hidden = false;
        // Mounted open, the v11 form's container (an ancestor) has no ref yet in
        // this effect: it is placed once the commit is done, before the first paint.
        const anchored = !!o.anchor();
        if (anchored) {
          place();
        }
        surface.set(true);
        followSeam(true);
        if (!anchored) {
          queueMicrotask(() => {
            place();
            surface.syncShadow();
          });
        }
      } else {
        const a = o.anchor()?.getBoundingClientRect();
        surface.open({
          cause:
            o.cause() ??
            (a ? { x: a.left + a.width / 2, y: a.top + a.height / 2 } : null),
          place,
        });
        softEdge();
        followSeam(true);
      }
      if (o.takeFocus) {
        // Focus comes with the surface: the first control inside, else the panel.
        const firstControl = el.querySelector<HTMLElement>(FOCUSABLE);
        (firstControl ?? el).focus({ preventScroll: true });
      }
    },
    // Shown open from the start, it folds back into its trigger.
    source: () => {
      const a = latest.current.anchor()?.getBoundingClientRect();
      return a ? { x: a.left + a.width / 2, y: a.top + a.height / 2 } : null;
    },
    leave: () => {
      const el = ref.current;
      const first = firstRun();
      if (!el) return false;
      if (first || el.hidden) {
        // Never shown (or already gone): nothing leaves.
        el.hidden = true;
        followSeam(false);
        return false;
      }
    },
    // It fades over the fold's last 40ms (80ms past a 160ms fold), gone on its last frame (carbon-motion's
    // `snapExitFades`; `exitFade={false}` keeps it opaque).
    leaving: () => {
      softEdge();
      followSeam(true);
    },
    onExited: () => {
      followSeam(false);
      latest.current.onExited?.();
    },
    follow: {
      ignore: (e) =>
        e.target instanceof Node && !!ref.current?.contains(e.target),
      reflow: () => {
        place();
        surface.syncShadow();
      },
    },
  });

  const classes = [
    'cds-popover',
    `cds-popover--${look.variant}`,
    look.corners === 'square' && 'cds-popover--square',
    !look.outline && 'cds-popover--no-outline',
    look.background === 'background' && 'cds-popover--background',
    tabTip && 'cds-popover--tab-tip',
    extraClass,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={layerRef} className="cds-popover-layer">
      <span
        ref={surfaceRef}
        {...surfaceProps}
        {...(look.exitFade ? null : { [SNAP_EXIT_FADE_ATTR]: 'false' })}
        className={classes}>
        <span className="cds-popover__frame" {...SNAP_FRAME} />
        <span ref={contentRef} className="cds-popover__content">
          {children}
        </span>
      </span>
      {tabTip && (
        <span
          ref={seamRef}
          aria-hidden="true"
          className={[
            'cds-popover__seam',
            look.background === 'background' && 'cds-popover__seam--background',
          ]
            .filter(Boolean)
            .join(' ')}
          hidden
        />
      )}
    </span>
  );
}

/* ── the v11 form ─────────────────────────────────────────────────────── */

interface PopoverContextValue {
  open: boolean;
  container: RefObject<HTMLElement | null>;
  cause: () => { x: number; y: number } | null;
  align: PopoverAlignment;
  autoAlign: boolean;
  boundary?: PopoverBoundary;
  alignmentAxisOffset?: number;
  tabTip: boolean;
  look: Look;
  shadow: CastElevation | null;
  timeScale: number;
  onPlaced: (align: PopoverAlignment) => void;
  content: RefObject<HTMLElement | null>;
  /** Escape inside the content: closes it once nothing inside handled the key. */
  onContentKey: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

/** Marks a component as the content (`PopoverContent`, `ToggletipContent`): not a trigger. */
export const POPOVER_CONTENT = Symbol.for('cn.popover.content');
const isContent = (child: unknown) =>
  isValidElement(child) &&
  typeof child.type !== 'string' &&
  (child.type as { [POPOVER_CONTENT]?: boolean })[POPOVER_CONTENT] === true;

/**
 * The popover's content (v11's PopoverContent): drawn on the surface,
 * placed from its Popover. Its props go on the surface element (an `id`
 * for `aria-controls`).
 */
export const PopoverContent = forwardRef<HTMLElement, PopoverContentProps>(
  function PopoverContent({ className, children, onKeyDown, ...rest }, ref) {
    const ctx = useContext(PopoverContext);
    if (!ctx) throw new Error('PopoverContent must be inside a Popover.');
    const container = ctx.container;
    const contentRef = useMergedRef(ctx.content, ref);
    const anchor = () => container.current;
    const trigger = () => {
      const c = container.current;
      const first = c?.firstElementChild;
      return first instanceof HTMLElement &&
        !first.classList.contains('cds-popover-layer')
        ? first
        : c;
    };
    return (
      <PopoverSurface
        open={ctx.open}
        anchor={anchor}
        trigger={trigger}
        cause={ctx.cause}
        align={ctx.align}
        autoAlign={ctx.autoAlign}
        boundary={ctx.boundary}
        alignmentAxisOffset={ctx.alignmentAxisOffset}
        tabTip={ctx.tabTip}
        look={ctx.look}
        shadow={ctx.shadow}
        timeScale={ctx.timeScale}
        portal={false}
        snapOnMount={false}
        takeFocus={false}
        onPlaced={ctx.onPlaced}
        surfaceProps={{
          ...rest,
          className,
          ref: contentRef,
          onKeyDown: (e) => {
            onKeyDown?.(e);
            ctx.onContentKey(e);
          },
        }}>
        {children}
      </PopoverSurface>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';
(PopoverContent as unknown as Record<symbol, boolean>)[POPOVER_CONTENT] = true;

function PopoverV11(props: PopoverFormProps) {
  const {
    open,
    align: alignProp,
    as: As = 'span',
    autoAlign = false,
    autoAlignBoundary,
    alignmentAxisOffset,
    isTabTip = false,
    className,
    children,
    onRequestClose,
    origin,
    timeScale = 1,
    forwardedRef: ref,
    // Taken off before the spread (the look and the shadow are read from props).
    backgroundToken: _bg,
    border: _border,
    dropShadow: _dropShadow,
    highContrast: _hc,
    variant: _variant,
    outline: _outline,
    shadow: _shadow,
    corners: _corners,
    exitFade: _exitFade,
    label: _label,
    anchor: _anchor,
    onClose: _onClose,
    onPointerDown,
    ...rest
  } = props;
  const container = useRef<HTMLElement>(null);
  const content = useRef<HTMLElement>(null);
  const containerRef = useMergedRef(container, ref);
  const press = useRef<{ x: number; y: number; t: number } | null>(null);
  const latest = useLatest({ open, onRequestClose, origin });
  const align = normalizePopoverAlign(
    alignProp,
    isTabTip ? 'bottom-start' : 'bottom'
  );
  const looked = lookOf(props);
  // One object while its fields hold (the context below is memoised on it).
  const look = useMemo(
    () => looked,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      looked.variant,
      looked.outline,
      looked.background,
      looked.corners,
      looked.exitFade,
    ]
  );
  const shadow = elevationOf(props, useKitDefaults());

  const cause = useStableCallback((): { x: number; y: number } | null => {
    const o = latest.current.origin;
    if (o) return o;
    const p = press.current;
    press.current = null;
    return p && performance.now() - p.t < CAUSE_MS ? { x: p.x, y: p.y } : null;
  });

  const onPlaced = useCallback((a: PopoverAlignment) => {
    const c = container.current;
    if (c) c.dataset.placement = a;
  }, []);

  // A click outside closes it (v11: the window's click).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node) || container.current?.contains(t)) return;
      // Nor a menu opened from inside it (portalled elsewhere: a dropdown's list).
      if (t instanceof Element && t.closest('[data-cds-menu]')) return;
      latest.current.onRequestClose?.();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [open, latest]);

  // Escape inside closes it, focus to the trigger: on the content's bubble, so a control inside takes
  // the key first; preventDefault, not stopPropagation, keeps the layers below (document, window) off it.
  const onContentKey = useStableCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (
        !latest.current.open ||
        e.key !== 'Escape' ||
        e.defaultPrevented ||
        isComposing(e)
      )
        return;
      if (!(e.target instanceof Node) || !content.current?.contains(e.target))
        return;
      e.preventDefault();
      latest.current.onRequestClose?.();
      container.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }
  );

  // Focus leaving the container closes it (v11) — not a press on the
  // content's own text (no focus to move to), nor a menu opened from inside.
  const pressedInside = useRef(false);
  const onFocusOut = (e: ReactFocusEvent<HTMLElement>) => {
    rest.onBlur?.(e);
    if (!latest.current.open) return;
    const to = e.relatedTarget as Element | null;
    if (!to) {
      if (pressedInside.current) {
        pressedInside.current = false;
        return;
      }
      latest.current.onRequestClose?.();
      return;
    }
    if (container.current?.contains(to) || to.closest('[data-cds-menu]'))
      return;
    latest.current.onRequestClose?.();
  };

  const onDown = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerDown?.(e);
    const inContent =
      e.target instanceof Node && !!content.current?.contains(e.target);
    pressedInside.current = inContent;
    if (inContent) setTimeout(() => (pressedInside.current = false), 0);
    else press.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  const ctx = useMemo<PopoverContextValue>(
    () => ({
      open,
      container,
      cause,
      align,
      autoAlign,
      boundary: autoAlignBoundary,
      alignmentAxisOffset,
      tabTip: isTabTip,
      look,
      shadow,
      timeScale,
      onPlaced,
      content,
      onContentKey,
    }),
    [
      open,
      cause,
      align,
      autoAlign,
      autoAlignBoundary,
      alignmentAxisOffset,
      isTabTip,
      look,
      shadow,
      timeScale,
      onPlaced,
      onContentKey,
    ]
  );

  // A tab tip's trigger joins the surface (v11 marks a `<button>` child; here the first trigger element).
  const kids = Children.toArray(children);
  const tab = isTabTip
    ? kids.findIndex((c) => isValidElement(c) && !isContent(c))
    : -1;
  const mapped = kids.map((child, i) => {
    if (i !== tab || !isValidElement<{ className?: string }>(child))
      return child;
    return cloneElement(child as ReactElement<{ className?: string }>, {
      className: ['cds-popover--tab-tip__button', child.props.className]
        .filter(Boolean)
        .join(' '),
    });
  });

  return (
    <PopoverContext.Provider value={ctx}>
      <As
        {...rest}
        ref={containerRef}
        className={[
          'cds-popover-container',
          open && 'cds-popover-container--open',
          isTabTip && 'cds-popover-container--tab-tip',
          look.variant === 'inverse' && 'cds-popover-container--high-contrast',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-placement={align}
        onPointerDown={onDown}
        onBlur={onFocusOut}>
        {mapped}
      </As>
    </PopoverContext.Provider>
  );
}

/* ── the anchored form ────────────────────────────────────────────────── */

function PopoverAnchored(props: PopoverFormProps) {
  const { present, exited } = useFloatingMount(props.open);
  if (!present) return null;
  return createPortal(
    <AnchoredBody {...props} onExited={exited} />,
    document.body
  );
}

function AnchoredBody({
  open,
  anchor,
  align: alignProp,
  autoAlign = true,
  autoAlignBoundary,
  alignmentAxisOffset,
  isTabTip = false,
  origin,
  label,
  timeScale = 1,
  className,
  children,
  onExited,
  forwardedRef,
  ...props
}: PopoverFormProps & { onExited: () => void }) {
  const all = { ...props, open } as PopoverProps;
  const close = props.onClose ?? props.onRequestClose;
  const ref = useRef<HTMLElement>(null);
  const surfaceRef = useMergedRef(ref, forwardedRef);
  const latest = useLatest({ anchor, close });
  const id = `cds-popover-${useId().replace(/:/g, '')}`;
  const look = lookOf(all);
  const kit = useKitDefaults();
  const align = normalizePopoverAlign(alignProp, 'bottom-start');
  const anchorFn = () => latest.current.anchor ?? null;
  const causeFn = () => origin ?? null;

  // A press outside closes it — not on its trigger, which toggles.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      // Nor on a menu opened from inside it (portalled elsewhere: a select's list).
      if (
        ref.current?.contains(t) ||
        latest.current.anchor?.contains(t) ||
        (t instanceof Element && t.closest('[data-cds-menu]'))
      )
        return;
      latest.current.close?.();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, latest]);

  // A menu opened from inside it (a select's list) is portalled elsewhere:
  // focus moving there keeps it open; focus going anywhere else closes it.
  const onBlur = (e: ReactFocusEvent<HTMLElement>) => {
    const to = e.relatedTarget as Element | null;
    if (
      !to ||
      ref.current?.contains(to) ||
      latest.current.anchor?.contains(to) ||
      to.closest('[data-cds-menu]')
    )
      return;
    latest.current.close?.();
  };

  // A control inside that handled the key (a date picker's calendar) keeps it.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Escape' || e.defaultPrevented || isComposing(e)) return;
    e.stopPropagation();
    latest.current.close?.();
    latest.current.anchor?.focus({ preventScroll: true });
  };

  return (
    <PopoverSurface
      open={open}
      anchor={anchorFn}
      trigger={anchorFn}
      cause={causeFn}
      align={align}
      autoAlign={autoAlign}
      boundary={autoAlignBoundary}
      alignmentAxisOffset={alignmentAxisOffset}
      tabTip={isTabTip}
      look={look}
      shadow={elevationOf(all, kit)}
      timeScale={timeScale}
      portal
      snapOnMount
      takeFocus
      onExited={onExited}
      surfaceProps={{
        ref: surfaceRef,
        id,
        role: 'dialog',
        'aria-label': label,
        tabIndex: -1,
        className,
        onKeyDown,
        onBlur,
      }}>
      {children}
    </PopoverSurface>
  );
}

/**
 * Popover — v11's Popover (a trigger and a `PopoverContent`), or, with
 * `anchor`, a portalled panel opened from that trigger.
 */
export const Popover = forwardRef<HTMLElement, PopoverProps>(
  function Popover(props, ref) {
    return props.anchor !== undefined ? (
      <PopoverAnchored {...props} forwardedRef={ref} />
    ) : (
      <PopoverV11 {...props} forwardedRef={ref} />
    );
  }
);
Popover.displayName = 'Popover';
