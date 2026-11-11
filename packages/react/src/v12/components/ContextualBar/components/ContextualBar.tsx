/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Layer as CarbonLayer } from '@carbon/react';
import {
  distanceTokens,
  durationStepForDistance,
  motionTokens,
  snapFadeFor,
  SNAP_FRAME,
  snapEaseBezier,
  stepDown,
  type DurationToken,
  type SnapEase,
  type SnapOrigin,
  type SnapProfile,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import {
  animateLayout,
  lightnessColors,
  lightnessStep,
  playContentSwap,
  usePrefersReducedMotion,
  useSnapSurface,
} from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import type { FeedbackKind } from '@carbon-labs/react-feedback';
import {
  contrastRatio,
  cssHex,
  solveStatusColor,
  surfaceOf,
  type SolvedStatus,
} from '@carbon-labs/react-slider';
import { RollText } from '@carbon-labs/react-roll-text';
import { ghostSteps } from '@carbon-labs/react-selection-kit';
import { parseCssColor } from '@carbon-labs/react-util';
import { onThemeChange } from '@carbon-labs/react-util';
import {
  KIT_THEME,
  inverseTheme,
  isV12Theme,
  themeOf,
  themeZoneAt,
  writeZone,
  type KitTheme,
} from '@carbon-labs/react-theme-zone';
import { snapEntranceContentMs } from '@carbon-labs/react-side-panel';
import { AppShellWorkspaceContext } from '@carbon-labs/react-app-shell';
import { inertProps } from '@carbon-labs/react-util';
import './contextual-bar.scss';

/* ============================================================================
 * ContextualBar — a bar that appears over the page while something is true
 * (a draft, a selection, unsaved changes) and goes when it isn't: a
 * component behaviour of its own.
 *
 *   one ease  no fades for the bar itself, and the exit travels from one
 *            edge, not both: the bar's edges, the room it opens in the layout and the
 *            mask round it move on ONE clock and ONE curve
 *            (`contextualBarTiming`: the travel's step in, a step shorter
 *            out, the Standard curve — the bar's moving edge is the layout's
 *            edge, so it moves as layout does) and land on the same frame.
 *            The bar never changes opacity: it travels and clips
 *   in       it grows from its edge nearest the pointer (carbon-motion's
 *            principle 6, origin): the bar's top or bottom
 *            edge, whichever is nearer the press, holds still and the other
 *            travels away from it — docked at the top of a list and pressed on
 *            a row below, its bottom edge holds and its top edge rises; pressed
 *            above it, or docked at the bottom of a list, its top edge holds
 *            and its bottom edge travels down. It widens from 75% about the
 *            point right across from the press on that edge (`originBand` 0.5:
 *            anywhere along that edge, a smaller band keeps it nearer the
 *            middle). From a key, the key's target (the checkbox, the button)
 *            stands in for the press, at its center; with neither, its top
 *            edge's middle, the line it's docked to (`causePoint`, `originOf`).
 *            One exception: inline and at rest in the flow, its room opens
 *            below it and pushes the rows down, so its bottom edge has to
 *            travel with them — there it grows from its top edge, whatever
 *            the press (`pushes`). Carried over content (scrolled, stuck) the
 *            rows hold still under it, and it grows from the pointer's edge
 *   content  moves with the opening, on the snap entrance's content clock:
 *            in, it starts 8px back (`distance-sm`, against the way
 *            the bar grows: up while it unfolds down, down while it rises) on
 *            the entrance's first frame, no wait, and moves into place over
 *            just after the bar's clock
 *            (`snapEntranceContentMs`) on entrance-productive; the snap's soft
 *            edge at the moving edge, `min(16px, h, H − h)`, reveals it. Out,
 *            it holds still where it is and the soft edge closes over it as the
 *            far edge returns; it goes back to its starting place only once the
 *            bar has gone. A turn (reopened as it folds away) goes on from
 *            where it stopped, on the same clock. Two layers: the snap's
 *            content layer (`__content`, held still, the soft edge's mask) and
 *            the row in it that moves (`__row`), so the mask stays on the clip
 *            while the content travels under it
 *   out      the fold, the content holding still under a soft edge: the far
 *            edge pulls back to the edge it grew from, which holds still, the
 *            width held — inline at rest, back up into the line it came from,
 *            taking the rows up with it. One edge moves, a step faster than it
 *            came. What it last showed, not what the change that closed it
 *            would show (a count dropping to 0, a label changing width), so
 *            nothing shifts under the clip
 *   dock     sticky under the header (`--cds-contextual-bar-top`, 3rem), 8px
 *            clear of it. Carried over content, what's around it fades out
 *            like the soft edge, to 0% opacity (the cast shadow reads as a
 *            glow, so it's off unless asked for, `shadow`):
 *            its container is masked, nothing above the bar (what has passed
 *            behind it), the bar, then `--cds-motion-soft-edge` below it from
 *            nothing to all. No fill over anything, so its container's own
 *            lines stay. The mask comes on over the first soft edge of travel
 *            (nothing at rest), its strength moves on the bar's clock, and
 *            while the bar moves the mask follows its moving edge (rising, the
 *            soft edge rides above its top edge too, `min(16px, h, H − h)`)
 *   placement inline, it moves the layout smoothly; on top, it never pushes
 *            it; either way it never breaks the layout.
 *            `inline` (default): in the flow. Its room opens and closes on
 *            the bar's clock and curve, and changes on it when its content
 *            wraps onto another line or back, so the content below glides
 *            rather than jumping; one layout transaction (`animateLayout`) on
 *            its parent, so what's inside holds its own geometry and settles
 *            once. Gone after. The curve is the Standard one, not entrance or
 *            exit, and the bar's edge takes it too.
 *            In a container out of the flow (absolute or fixed: a bar laid
 *            over a toolbar row, as the Resource index's batch region and
 *            the data table's are) nothing follows it, so it opens no room
 *            (`roomless`); the snap is the whole move
 *            `overlay`: floats over the content at the same place, sticky
 *            too, and never takes room: the layout never changes. A pill by
 *            default (a floating thing, not a band of the page)
 *            `toolbar`: in a toolbar row's place, a table's
 *            batch actions. Over its positioned container's first line
 *            (`--cds-contextual-bar-line`), not sticky, no room, no mask; the
 *            row's other children hidden while it's there, so only its one
 *            surface shows. It grows from its base (its bottom edge) on the
 *            side of the press (`baseOrigin`) and folds back down into it
 *   variant  `tonal` (default): the side nav's quiet fill and
 *            hairline. `inverse`: dark on a light page and light on a dark
 *            one — the page's opposite theme, read where it opens. `kind`
 *            colors the outline as a notification's does (its status), on
 *            either
 *   content  changes animate smoothly between states.
 *            `ContextualBar.Count`: a number (and its label) that rolls, the
 *            kit's RollText — up as it rises, down as it falls.
 *            `ContextualBar.Swap`: content that changes as a whole (one
 *            item's actions, then many items'), keyed by `swapKey`: the
 *            content swap, out then in, never overlapping, while its width
 *            glides from the old to the new, so what follows it glides too
 *   corners  the filled and outlined controls in it step their
 *            corners down from the bar's, concentric: its 8px less the 8px
 *            inset, floored at the kit's 2px (the overlay's pill: pills). A
 *            ghost control has no surface of its own: its hover is full round,
 *            the hovers rule
 *   fade     joined to the edge it grows from, the surface takes the sliver guard in every
 *            placement (`barProfile`'s `sliver: true`): opacity min(1, height / 4px), opaque
 *            on every frame from 4px, so it never fades over what it covers. Its contents
 *            take the fade standard (`snapFadeFor`); over content that is their own fade
 *            (`showContent`, `hideContent`); either way
 *            they wait, unseen, until its start edge has passed them (`clearOfStart`).
 *            Under a still pointer nothing it comes over or uncovers lights its hover until
 *            the pointer moves (the rollover's own stillness, labels included)
 *   layer    the bar is a surface: what's in it steps up one of
 *            Carbon's layers (a Carbon `Layer`), as on a card or a filled
 *            toolbar, so a selection track or a field in it reads on the
 *            quiet fill (on the fill's own color, a toolbar's alignment
 *            group loses its track in the bar)
 *   reduced  the bar, its room and its content are there, or gone, at once, the content
 *            after it held still on screen (the scroll takes up the room, so the scroller's
 *            pill shows); counts swap in place; swaps snap
 *   slow     `timeScale` reaches its Count and Swap too (through context), so
 *            a lab's slow motion slows the roll and the swap with the snap
 * ========================================================================== */

export type ContextualBarPlacement = 'inline' | 'overlay' | 'toolbar';
export type ContextualBarVariant = 'tonal' | 'inverse';

export interface ContextualBarProps {
  /** Shown while true; snaps out when it turns false. */
  open: boolean;
  children: ReactNode;
  /** Its region's name. */
  label: string;
  /**
   * `inline` (default): in the flow; its room opens and closes smoothly, the content below gliding.
   * `overlay`: over the content, never taking room — the layout never changes.
   * `toolbar`: in a toolbar row's place (a table's batch actions): laid over the row's first line in
   * its positioned container, not sticky, taking no room; what else is in the row is hidden while the
   * bar is there. It grows from its base (its bottom edge, the row's line over the rows it acts on) on
   * the side of the press that opened it, and folds back down into that line.
   */
  placement?: ContextualBarPlacement;
  /** How far along its nearest edge it may grow from, either side of the middle: 0.5 (default) anywhere, right across from the press. */
  originBand?: number;
  /** `tonal`: the quiet fill and hairline. `inverse`: the opposite theme. Default tonal, inverse in an inset workspace. */
  variant?: ContextualBarVariant;
  /** A status: on tonal its outline, on inverse its fill (solved for the text). Default: tonal `info`, inverse none; `null`, none. */
  kind?: FeedbackKind | null;
  /** The floating surfaces' cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none: the soft edge instead). */
  shadow?: SurfaceShadowOption;
  /** A lab's slow motion: the snap and the room at 1 / timeScale. Default 1. */
  timeScale?: number;
  className?: string;
}

type Pt = { x: number; y: number };

/** The bar's slow motion, for its Count and Swap. */
const BarTimeScale = createContext(1);

const bezier = (e: SnapEase) => cubicBezier(snapEaseBezier(e));

/** The bar's one curve: its edges, its room and its mask. */
const EASE: SnapEase = 'standard-productive';
/** Its width on its first frame in, about the point above the press. */
const FROM_X = 0.75;

/** The bar's one clock: in and out, as tokens and ms, and its curve as CSS. */
export interface ContextualBarTiming {
  /** The farthest any of its edges (or, inline, its room) travels, px. */
  travel: number;
  in: DurationToken;
  out: DurationToken;
  inMs: number;
  outMs: number;
  easing: string;
}

/**
 * The bar's clock, by its travel (duration by travel, the shared steps): the farther of its
 * side edges' (from `FROM_X` about `originX`) and its moving edge's (its height) — inline, the
 * room's, its height and its margins. Out a step shorter.
 */
export function contextualBarTiming(
  bar: HTMLElement,
  originX = bar.offsetWidth / 2
): ContextualBarTiming {
  const w = bar.offsetWidth;
  const dock = bar.parentElement;
  const inline =
    !!dock && dock.classList.contains('cds-contextual-bar--inline');
  const margin = dock
    ? parseFloat(getComputedStyle(dock).marginBlockStart) || 0
    : 0;
  const sides = Math.max(originX, w - originX) * (1 - FROM_X);
  // An overlay's dock is a line (no height): its moving edge travels the bar's height.
  const room = inline
    ? (dock?.offsetHeight ?? bar.offsetHeight) + 2 * margin
    : bar.offsetHeight;
  const travel = Math.max(sides, room);
  const tin = durationStepForDistance(travel);
  const tout = stepDown(tin);
  return {
    travel,
    in: tin,
    out: tout,
    inMs: motionTokens.duration[tin],
    outMs: motionTokens.duration[tout],
    easing: bezier(EASE),
  };
}

/**
 * The bar's snap: from the edge its origin is on (`originOf`: top or bottom, held), the other
 * travelling, its width from `FROM_X`; out, the far edge back to it, the width held (`toOutX` 1). One
 * clock and one curve, and at once when reduced (`blinkOff`). Its content layer is held still
 * (`contentOffset` 0) under the soft edge, at the standard's 16px (`softEdgeCap` 1: the snap's own
 * cap, a quarter of the bar, made it 12px); the row in it arrives on its own (`arrive`).
 *
 * Joined to the edge it grows from, it takes the sliver guard (`sliver: true`), not the presence
 * fade, covering content or not: opaque on every frame from 4px tall, so what it covers never
 * shows through it and no line is left across a row at the end of the fold. Whether it covers content (an overlay,
 * or inline carried over the rows by the scroll) decides only its contents' fade (`covers`,
 * `showContent`, `hideContent`).
 */
export function barProfile(
  bar: HTMLElement | null,
  originX: number | undefined,
  originBand: number
): SnapProfile {
  const t = bar ? contextualBarTiming(bar, originX) : null;
  return {
    from: FROM_X,
    fromX: FROM_X,
    fromY: 0,
    toOutX: 1,
    toOutY: 0,
    in: t?.in ?? 'moderate-02',
    out: t?.out ?? 'moderate-01',
    ease: EASE,
    exitEase: EASE,
    // The sliver guard (README.md, "Fades"), in both placements, covering or not.
    sliver: true,
    blinkOff: true,
    exitMode: 'scale',
    contentAxis: 'y',
    contentOffset: 0,
    softEdgeCap: 1,
    originBand,
  };
}

/** The curve's progress at `t` (0–1 of its clock): the cubic Bézier solved on x. */
function easeAt(e: SnapEase, t: number): number {
  const [x1, y1, x2, y2] = snapEaseBezier(e);
  const at = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (at(x1, x2, mid) < t) lo = mid;
    else hi = mid;
  }
  return at(y1, y2, (lo + hi) / 2);
}

/**
 * When its contents may show, as a share of its clock in, so a count is never clipped at its
 * start edge as the bar grows: the surface widens from `FROM_X` about `originX`, so its
 * start edge comes in from `(1 − FROM_X) × originX` (the end's, RTL); the contents, held still,
 * wait until that edge has passed their start — the first thing in it (the count, its label) is
 * never drawn cut, only softened by the snap's soft edge as that edge goes by. A press near its
 * start (a row's checkbox) clears at once; far along it, later in the clock. Its end edge is the
 * reveal's.
 */
function clearOfStart(
  bar: HTMLElement,
  row: HTMLElement,
  originX: number
): number {
  const w = bar.offsetWidth;
  const rtl = getComputedStyle(bar).direction === 'rtl';
  const first = row.firstElementChild ?? row;
  const r = bar.getBoundingClientRect();
  const f = first.getBoundingClientRect();
  const k = r.width > 0 ? w / r.width : 1;
  // Its contents' start, from its own start edge (layout px).
  const gap = (rtl ? r.right - f.right : f.left - r.left) * k;
  const from = (1 - FROM_X) * (rtl ? w - originX : originX);
  const clear = (e: number) => from * (1 - e) <= gap;
  if (clear(0)) return 0;
  for (let i = 1; i <= 100; i++)
    if (clear(easeAt(EASE, i / 100))) return i / 100;
  return 1;
}

/**
 * Where it grows from (principle 6, origin): its long edge nearest the cause — the bottom when
 * the cause is below its middle, else the top — right across from the cause, no further from the
 * middle than `band` of its width. No cause: its top edge's middle, the line it's docked to.
 * `docked`: its top edge whatever the cause (inline, while its room pushes what's below it).
 * Never a side edge: then both long edges would travel.
 */
function originOf(
  bar: HTMLElement,
  at: Pt | null,
  band: number,
  docked: boolean
): SnapOrigin {
  const r = bar.getBoundingClientRect();
  if (bar.parentElement?.classList.contains('cds-contextual-bar--toolbar'))
    return baseOrigin(bar, r, at);
  // In the snap's own box, layout px: the screen may be drawn scaled (a lab's frame).
  const w = bar.offsetWidth;
  const k = r.width > 0 ? w / r.width : 1;
  const mid = w / 2;
  if (!at) return { x: mid, y: 0 };
  const b = Math.max(0, band) * w;
  const x = Math.min(mid + b, Math.max(mid - b, (at.x - r.left) * k));
  return {
    x,
    y: !docked && at.y > r.top + r.height / 2 ? bar.offsetHeight : 0,
  };
}

/**
 * In a toolbar row's place (`placement="toolbar"`): its base, the bottom edge (the row's line, over
 * the rows it acts on), at the end of it on the side of the cause: a row's checkbox at the
 * table's start, its start corner. No cause: the start. Layout px (the snap's own box; the screen may
 * be drawn scaled).
 */
function baseOrigin(bar: HTMLElement, r: DOMRect, at: Pt | null): SnapOrigin {
  const rtl = getComputedStyle(bar).direction === 'rtl';
  const left = at ? at.x - r.left < r.width / 2 : !rtl;
  return { x: left ? 0 : bar.offsetWidth, y: bar.offsetHeight };
}

/** What last could have opened it: a press (where), or a key (on what). */
type Cause = { press: Pt } | { key: Element };

/** The last cause, for every bar, from one set of window listeners while any is mounted. */
const input: { cause: Cause | null } = { cause: null };
let tracking = 0;
const onPress = (e: PointerEvent) => {
  input.cause = { press: { x: e.clientX, y: e.clientY } };
};
const onKey = (e: KeyboardEvent) => {
  if (e.target instanceof Element) input.cause = { key: e.target };
};
function trackInput(): () => void {
  if (!tracking++) {
    window.addEventListener('pointerdown', onPress, true);
    window.addEventListener('keydown', onKey, true);
  }
  return () => {
    if (--tracking) return;
    // The last bar gone: a later one starts from no cause, not an old press or a detached key target.
    input.cause = null;
    window.removeEventListener('pointerdown', onPress, true);
    window.removeEventListener('keydown', onKey, true);
  };
}

/**
 * The cause as a point, client px: a press, where it landed; a key, its target's center (a
 * checkbox's, a button's — principle 6: without a pointer, the trigger's center). None, or a key
 * on nothing in particular (the page, the bar itself, something gone): `null`.
 */
function causePoint(cause: Cause | null, bar: HTMLElement): Pt | null {
  if (!cause) return null;
  if ('press' in cause) return cause.press;
  const t = cause.key;
  if (
    !t.isConnected ||
    bar.contains(t) ||
    t === document.body ||
    t === document.documentElement
  )
    return null;
  const r = t.getBoundingClientRect();
  if (r.width < 1 && r.height < 1) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Inverse: the opposite of the zone where the bar opens (theme-zone: the one place a zone's class is written). */
function invert(bar: HTMLElement, variant: ContextualBarVariant) {
  const theme =
    variant === 'inverse' ? inverseTheme(themeZoneAt(bar.parentElement)) : null;
  writeZone(bar, theme);
  const side = theme ? KIT_THEME[theme] : undefined;
  if (side) bar.dataset.inverse = side;
  else delete bar.dataset.inverse;
}

const SUPPORT: Record<FeedbackKind, SolvedStatus> = {
  error: 'error',
  success: 'success',
  warning: 'warning',
  'warning-alt': 'warning',
  info: 'info',
  'info-square': 'info',
};
/** AA for the bar's text (and its icons, which take the text's color) on a toned fill. */
const TEXT_CONTRAST = 4.5;
/** Below this against the inverse text, a status takes the other theme's text (see `tone`). */
const FLIP_BELOW = 2;
const TONE_PROPS = [
  '--cds-contextual-bar-fill',
  '--cds-contextual-bar-edge',
  '--cds-link-primary',
  '--cds-link-primary-hover',
];

/**
 * A status, solved for the bar it's on (the slider's method, `statusColor.ts`: the theme's
 * support color moved in L*, hue kept, the fewest steps that reach the contrast):
 *   inverse  the fill takes the status, so it reads on inverse: the page's support color, stepped away
 *            from the bar's text until the text holds AA on it; the outline is the fill. A
 *            status far too light for the inverse text (under 2:1: warning's yellow on a dark
 *            bar) takes the other theme's text instead, keeping its own color. A link in it
 *            reads in the text's color (the link blue doesn't hold on a status fill)
 *   tonal    the fill one step off its backdrop (`tonalFill`); the outline the support
 *            color stepped off that fill to 3:1 (warning's yellow on a light fill too)
 * Read where the bar is, so it follows the theme it opens in (and the inverse one).
 */
function tone(
  bar: HTMLElement,
  variant: ContextualBarVariant,
  kind: FeedbackKind | undefined
) {
  for (const p of TONE_PROPS) bar.style.removeProperty(p);
  const fill = variant === 'tonal' ? tonalFill(bar) : null;
  if (fill) bar.style.setProperty('--cds-contextual-bar-fill', fill);
  if (!kind) return;
  const token = `--cds-support-${SUPPORT[kind]}`;
  if (variant === 'inverse') {
    // The page's support color: made for the opposite of the bar's theme, so it holds the bar's
    // text as it is, or nearly (the bar's own, made for its own fill, mostly doesn't).
    const support = cssHex(
      getComputedStyle(bar.parentElement ?? bar).getPropertyValue(token)
    );
    let text = cssHex(getComputedStyle(bar).color);
    if (!support || !text) return;
    // A status far too light (or dark) for the inverse text — warning's yellow under light
    // text — takes the other text instead, so it keeps its own color rather than going muddy.
    if (contrastRatio(support, text) < FLIP_BELOW) {
      const was = bar.dataset.inverse === 'light' ? 'light' : 'dark';
      // A v12 zone's class is its theme (no rule over it, contextual-bar.scss): it flips too.
      const zone = themeZoneAt(bar);
      const flip = (side: KitTheme) => {
        bar.dataset.inverse = side;
        if (isV12Theme(zone)) writeZone(bar, themeOf(side, zone));
      };
      flip(was === 'dark' ? 'light' : 'dark');
      const other = cssHex(getComputedStyle(bar).color);
      if (other && contrastRatio(support, other) >= TEXT_CONTRAST) text = other;
      else flip(was);
    }
    const fill = solveStatusColor(support, text, TEXT_CONTRAST);
    bar.style.setProperty('--cds-contextual-bar-fill', fill);
    bar.style.setProperty('--cds-contextual-bar-edge', fill);
    bar.style.setProperty('--cds-link-primary', text);
    bar.style.setProperty('--cds-link-primary-hover', text);
    return;
  }
  const support = cssHex(getComputedStyle(bar).getPropertyValue(token));
  if (!support) return;
  const frame = bar.querySelector<HTMLElement>('.cds-contextual-bar__frame');
  const surface =
    fill ??
    (frame && cssHex(getComputedStyle(frame).backgroundColor)) ??
    surfaceOf(bar);
  if (surface)
    bar.style.setProperty(
      '--cds-contextual-bar-edge',
      solveStatusColor(support, surface)
    );
}

/** A row's size for the step: the ghost group's, not the bar's own (a wide surface would soften it). */
const FILL_STEP_SIZE = 40;

/** The tonal fill: one matched-lightness step off the first opaque surface behind the bar. */
function tonalFill(bar: HTMLElement): string | null {
  const back = surfaceOf(bar);
  const page = back ? parseCssColor(back) : null;
  if (!page) return null;
  const steps = ghostSteps();
  const [r, g, b] = lightnessColors(
    [0, 0, 0, 0],
    page,
    lightnessStep(page, FILL_STEP_SIZE, steps),
    steps
  ).hover;
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

/** The nearest scroll container (none: the viewport). */
function scrollerOf(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if (o !== 'visible' && o !== 'clip') return p;
  }
  return null;
}

/**
 * Reduced motion, inline: its room opened or closed at once, moving what follows it by `d` px.
 * Its scroll container (or the page) scrolls by the same, so what follows holds still on screen;
 * the scroll is activity, so the scroller's pill shows. Clamped at the top: closed from a scroll
 * shorter than its room, the rest of the change shows.
 */
function holdInPlace(el: HTMLElement, d: number): void {
  const sc =
    scrollerOf(el) ?? (document.scrollingElement as HTMLElement | null);
  if (sc) sc.scrollTop += d;
}

/** Where a sticky element sits in the flow: its top with its stickiness off. */
function unstuckTop(el: HTMLElement): number {
  el.style.position = 'static';
  const top = el.getBoundingClientRect().top;
  el.style.position = '';
  return top;
}

/**
 * The soft edge's mask on its container round the bar, `carried` px over content
 * (contextual-bar.scss). Above it, what has passed behind it, in over the first soft edge of
 * travel; below it, the soft edge — likewise inline, always for an overlay (it always floats
 * over content).
 */
function fade(
  root: HTMLElement,
  bar: HTMLElement,
  carried: number,
  overlay: boolean
) {
  const edge =
    parseFloat(
      getComputedStyle(root).getPropertyValue('--cds-motion-soft-edge')
    ) || 16;
  const above = Math.min(1, Math.max(0, carried) / edge);
  root.dataset.cdsContextualBarFade = '';
  root.style.setProperty('--cds-contextual-bar-fade-above', String(above));
  root.style.setProperty(
    '--cds-contextual-bar-fade-below',
    String(overlay ? 1 : above)
  );
  // An overlay's surface and the soft edge below it at full strength from its first frame to its
  // last: they open and close with the surface itself (`-soft`, `outline`), so the rows it covers
  // come back in step with the fold. What is above it (scrolled behind) moves on the strength.
  root.style.setProperty('--cds-contextual-bar-fade-held', overlay ? '1' : '');
  root.style.setProperty(
    '--cds-contextual-bar-fade-keep',
    `${root.clientTop}px`
  );
  // Its box gone, and the bar added back as it is: nothing beside its corners (a pill's round
  // ends), at any strength. The box's top and bottom and the soft edges at them: `outline`.
  const r = root.getBoundingClientRect();
  const b = bar.getBoundingClientRect();
  root.style.setProperty('--cds-contextual-bar-fade-x', `${b.left - r.left}px`);
  root.style.setProperty('--cds-contextual-bar-fade-w', `${b.width}px`);
  outline(root, bar);
}

/**
 * The bar as it is now, to its rounded outline: its surface (the snap's frame), so while it
 * unfolds or folds away only the bar shows where it is, never what's under the part it hasn't
 * reached. Its box is taken out across its width between the surface's top and bottom edges,
 * the soft edge below the bottom one: as an edge travels, what's past it shows (the rows riding
 * it, or the content a rising bar comes up over) and nothing beside the surface does. Rising
 * (its top edge travelling), the soft edge rides above that edge too, `min(16px, h, H − h)`
 * (`-rise`): it grows over the first 16px of travel and closes over the last, so it's gone at
 * rest. Unfolding down, the top edge is the box's and `-rise` is 0.
 */
function outline(root: HTMLElement, bar: HTMLElement) {
  const frame =
    bar.querySelector<HTMLElement>('.cds-contextual-bar__frame') ?? bar;
  const r = root.getBoundingClientRect();
  const b = bar.getBoundingClientRect();
  const f = frame.getBoundingClientRect();
  const edge =
    parseFloat(
      getComputedStyle(root).getPropertyValue('--cds-motion-soft-edge')
    ) || 16;
  const rise =
    f.top > b.top + 0.5
      ? Math.max(0, Math.min(edge, f.height, b.height - f.height))
      : 0;
  root.style.setProperty('--cds-contextual-bar-fade-top', `${f.top - r.top}px`);
  // Where its box starts: above it, what has passed behind it (`-above`); between there and its
  // surface's top edge (rising, or folding down into its bottom edge), what it is coming over or
  // has just uncovered — there, as it is, up to the soft edge riding that edge, so
  // the rows it uncovers never come back at mixed opacity.
  root.style.setProperty('--cds-contextual-bar-fade-box', `${b.top - r.top}px`);
  root.style.setProperty('--cds-contextual-bar-fade-rise', `${rise}px`);
  // Below it, the soft edge no deeper than the surface is tall: it opens with the surface's first
  // 16px and closes with its last, so the rows it covers come back in step with the fold, never
  // round a line drawn through them.
  root.style.setProperty(
    '--cds-contextual-bar-fade-soft',
    `${Math.max(0, Math.min(edge, f.height))}px`
  );
  root.style.setProperty('--cds-contextual-bar-fade-y', `${f.top - r.top}px`);
  root.style.setProperty(
    '--cds-contextual-bar-fade-h',
    `${Math.max(0, f.bottom - f.top)}px`
  );
  root.style.setProperty(
    '--cds-contextual-bar-fade-bottom',
    `${f.bottom - r.top}px`
  );
  const w = Math.max(0, f.width);
  const h = Math.max(0, f.height);
  const rx = Math.min(
    parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0,
    h / 2,
    w / 2
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}"/></svg>`;
  root.style.setProperty(
    '--cds-contextual-bar-fade-shape',
    `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  );
  root.style.setProperty(
    '--cds-contextual-bar-fade-sx',
    `${f.left - r.left}px`
  );
  root.style.setProperty('--cds-contextual-bar-fade-sy', `${f.top - r.top}px`);
  root.style.setProperty('--cds-contextual-bar-fade-sw', `${w}px`);
  root.style.setProperty('--cds-contextual-bar-fade-sh', `${h}px`);
}

/**
 * Inline, its corner concentric with the rounded container it sits in: the container's less the
 * bar's inset from it, 2px at least, never more than its own 8px. No rounded container within reach
 * (the page): its own. Its controls step down from it again (contextual-bar.scss).
 */
function nest(bar: HTMLElement) {
  const b = bar.getBoundingClientRect();
  for (
    let p = bar.parentElement, i = 0;
    p && p !== document.body && i < 6;
    p = p.parentElement, i++
  ) {
    const radius = parseFloat(getComputedStyle(p).borderTopLeftRadius) || 0;
    if (!radius) continue;
    const c = p.getBoundingClientRect();
    const inset = Math.min(b.left - c.left, c.right - b.right);
    if (inset > 24) break;
    bar.style.setProperty(
      '--cds-contextual-bar-radius',
      `${Math.max(2, Math.min(8, radius - inset))}px`
    );
    return;
  }
  bar.style.removeProperty('--cds-contextual-bar-radius');
}

/** The row's offset on y now, px (its `translate`, which only its arrival sets). */
function rowOffset(el: HTMLElement): number {
  const t = getComputedStyle(el).translate;
  if (!t || t === 'none') return 0;
  return parseFloat(t.split(/\s+/)[1] ?? '0') || 0;
}

/**
 * Inline in a container out of the flow (absolute or fixed: a bar laid over a toolbar row, as the
 * Resource index's batch region and the data table's are): nothing follows its container, so it has
 * no room to open or close, and none is animated (an open room there only resized that container).
 */
function roomless(dock: HTMLElement): boolean {
  if (!dock.classList.contains('cds-contextual-bar--inline')) return true;
  const root = dock.parentElement;
  if (!root) return true;
  const pos = getComputedStyle(root).position;
  return pos === 'absolute' || pos === 'fixed';
}

/** The soft edge's mask off its container (`data-cds-contextual-bar-fade`, contextual-bar.scss). */
function unfade(root: HTMLElement) {
  delete root.dataset.cdsContextualBarFade;
  for (const p of [
    'above',
    'below',
    'held',
    'keep',
    'box',
    'top',
    'rise',
    'soft',
    'bottom',
    'shape',
    'x',
    'y',
    'w',
    'h',
    'sx',
    'sy',
    'sw',
    'sh',
  ])
    root.style.removeProperty(`--cds-contextual-bar-fade-${p}`);
}

function ContextualBarRoot({
  open,
  children,
  label,
  placement = 'inline',
  originBand = 0.5,
  variant: variantProp,
  kind: kindProp,
  shadow,
  timeScale = 1,
  className,
}: ContextualBarProps) {
  // Tonal on the page; in an inset workspace (v12's App Shell), inverse: the dark fill reads on the theme-color workspace.
  const inWorkspace = useContext(AppShellWorkspaceContext);
  const variant: ContextualBarVariant =
    variantProp ?? (inWorkspace ? 'inverse' : 'tonal');
  // A tonal bar is Info unless told otherwise.
  const kind =
    kindProp === undefined
      ? variant === 'tonal'
        ? 'info'
        : undefined
      : (kindProp ?? undefined);
  // In the flow while open, and while it snaps out (`leaving`).
  const [prevOpen, setPrevOpen] = useState(open);
  const [leaving, setLeaving] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setLeaving(!open);
  }
  // What it last showed while open: held while it leaves.
  const [held, setHeld] = useState<ReactNode>(children);
  if (open && held !== children) setHeld(children);

  const dock = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Where along its edge it grows from (box px), read for its clock.
  const originX = useRef<number | undefined>(undefined);
  // Whether it grows up from its bottom edge (its content then comes up from below).
  const rises = useRef(false);
  // Over content (an overlay; inline, carried over the rows): its contents take the fade standard
  // (`showContent`, `hideContent`); the surface has the sliver guard either way. Read as it opens and as it closes.
  const covers = useRef(placement === 'overlay');
  const elevation = useSurfaceShadow(shadow);
  const surface = useSnapSurface(bar, {
    profile: () => barProfile(bar.current, originX.current, originBand),
    reduced,
    timeScale,
    shadow: elevation,
    show: (el) => (el.style.visibility = ''),
    hide: (el) => (el.style.visibility = 'hidden'),
  });
  const inline = placement === 'inline';
  // The bar's one clock, for its room and its mask: the snap's own (`barProfile`), slowed with it.
  const clockOf = (phase: 'in' | 'out') => {
    const el = bar.current;
    const t = el ? contextualBarTiming(el, originX.current) : null;
    const ms = t ? (phase === 'in' ? t.inMs : t.outMs) : 0;
    return { ms: ms * timeScale, easing: bezier(EASE) };
  };

  // What the person last did, a press (where) or a key (on what): the change that opens it came
  // from there (`causePoint`), read from `input`.

  useEffect(() => {
    const off = trackInput();
    return off;
  }, []);

  /**
   * The content moves with the opening (the snap entrance's content clock): the
   * row (`__row`) starts 8px back against the way the bar grows (up while it unfolds down, down
   * while it rises) on the entrance's first frame, no wait, and moves into place, landing just after
   * the bar's clock (`snapEntranceContentMs`), under the snap's content layer,
   * which holds still and carries the soft edge. A turn (reopened as it folds away): from where it
   * stopped, on the same clock. Reduced: none.
   */
  const row = useRef<HTMLDivElement>(null);
  const arrival = useRef<Animation | null>(null);
  const arrive = (turn: boolean) => {
    const el = row.current;
    const b = bar.current;
    const was = arrival.current;
    arrival.current = null;
    const live = el && was ? rowOffset(el) : null;
    was?.cancel();
    if (!el || !b || reduced) return;
    const { inMs } = contextualBarTiming(b, originX.current);
    const from = turn
      ? (live ?? 0)
      : rises.current
        ? distanceTokens.sm
        : -distanceTokens.sm;
    // Held in place through the fold: it's there already.
    if (Math.abs(from) < 0.01) return;
    arrival.current = el.animate(
      [{ translate: `0 ${from}px` }, { translate: '0 0' }],
      {
        duration: snapEntranceContentMs(inMs) * timeScale,
        easing: bezier('entrance-productive'),
        fill: 'backwards',
      }
    );
  };
  // Shutting: it holds still where it is (waiting, moving or in place); the soft edge closes over it.
  const holdRow = () => arrival.current?.pause();
  // Gone: back to its waiting place (the next opening starts it there).
  const resetRow = () => {
    arrival.current?.cancel();
    arrival.current = null;
    contentFade.current?.cancel();
    contentFade.current = null;
  };

  /**
   * Its contents' fade (the fade standard, `snapFadeFor`: 40ms on a clock of 220ms or less,
   * else 80ms, never longer than its clock). Over content (`covers`) the surface is opaque but for the
   * sliver guard, and this is the contents' fade: up over it as it opens, out over its last part as it folds away. Either way the contents wait, unseen, until
   * the surface's start edge has passed their start (`clearOfStart`), so nothing in them is drawn
   * cut. A turn: back up from where they are, at the same rate. Reduced: none (there, or gone).
   */
  const content = useRef<HTMLDivElement>(null);
  const contentFade = useRef<Animation | null>(null);
  const fadeMs = (phase: 'in' | 'out') => {
    const ms = clockOf(phase).ms / timeScale;
    return Math.min(motionTokens.duration[snapFadeFor(ms)], ms) * timeScale;
  };
  const showContent = (turn: boolean) => {
    const el = content.current;
    const b = bar.current;
    const was = contentFade.current;
    const o = el && was ? parseFloat(getComputedStyle(el).opacity) : 1;
    was?.cancel();
    contentFade.current = null;
    if (!el || !b || reduced) return;
    const ms = fadeMs('in');
    if (turn) {
      if (o < 0.999)
        contentFade.current = el.animate([{ opacity: o }, { opacity: 1 }], {
          duration: ms * (1 - o),
          easing: 'linear',
        });
      return;
    }
    const r = row.current;
    const wait = r
      ? clearOfStart(b, r, originX.current ?? b.offsetWidth / 2) *
        clockOf('in').ms
      : 0;
    // Not over content, the surface's guard fade is its contents' too.
    if (!covers.current && wait <= 0) return;
    contentFade.current = el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: ms,
      delay: wait,
      easing: 'linear',
      fill: 'backwards',
    });
  };
  const hideContent = () => {
    const el = content.current;
    if (!el || reduced) return;
    const was = contentFade.current;
    if (!covers.current) {
      // The surface's guard fades it: its contents hold where they are (waiting, or partway up).
      was?.pause();
      return;
    }
    const o = was ? parseFloat(getComputedStyle(el).opacity) : 1;
    was?.cancel();
    const ms = clockOf('out').ms;
    const tail = Math.min(ms, fadeMs('out') * o);
    const hold = ms > 0 ? 1 - tail / ms : 0;
    contentFade.current = el.animate(
      hold > 0
        ? [
            { opacity: o, offset: 0 },
            { opacity: o, offset: hold },
            { opacity: 0, offset: 1 },
          ]
        : [{ opacity: o }, { opacity: 0 }],
      { duration: ms, easing: 'linear', fill: 'forwards' }
    );
  };

  /**
   * Inline, its room in the flow: opening (from none) or closing (to none), from wherever it is,
   * on the bar's clock. The margin below it carries the change — the bar's own box never
   * resizes, so its content doesn't reflow — and is left at the end value, so the last frame
   * is the layout that follows (closed: none, until the bar is gone).
   */
  const space = useRef<Animation | null>(null);
  const glideSpace = (to: 'open' | 'closed', first: boolean): Promise<void> => {
    const el = dock.current;
    const root = el?.parentElement;
    if (!el || !root || roomless(el)) return Promise.resolve();
    const running = space.current?.playState === 'running';
    const live = parseFloat(getComputedStyle(el).marginBlockEnd) || 0;
    space.current?.cancel();
    el.style.marginBlockEnd = '';
    const cs = getComputedStyle(el);
    const rest = parseFloat(cs.marginBlockEnd) || 0;
    // Everything it takes in the flow: its box and its two margins (the top one pulls it up).
    const room =
      el.offsetHeight + (parseFloat(cs.marginBlockStart) || 0) + rest;
    const none = rest - room;
    const end = to === 'open' ? rest : none;
    const from = running ? live : first && to === 'open' ? none : live;
    el.style.marginBlockEnd = `${end}px`;
    const clock = clockOf(to === 'open' ? 'in' : 'out');
    // Reduced: there, or gone, with the bar, on the same frame — and the content after it held
    // in place on screen: its scroll takes up the room, and the scroller's pill shows for
    // it, so the rows below never jump.
    if (reduced) {
      if (Math.abs(end - from) >= 0.5) holdInPlace(el, end - from);
      return Promise.resolve();
    }
    if (Math.abs(end - from) < 0.5) return Promise.resolve();
    // Interrupted, it turns round on the whole clock from where it is, as the snap does, so the
    // two still land together.
    const { animation } = animateLayout(
      root,
      el,
      [{ marginBlockEnd: `${from}px` }, { marginBlockEnd: `${end}px` }],
      { ms: clock.ms, easing: clock.easing, reason: 'contextual-bar', reduced }
    );
    space.current = animation;
    return animation.finished.then(
      () => undefined,
      () => undefined
    );
  };

  // Inline and open, a change in its own height (its content wrapping onto a second line, or
  // back) glides too: the room below it takes up the difference and lets it go on the bar's
  // clock, so the content below never jumps. Read after layout, before paint.
  useEffect(() => {
    const el = dock.current;
    if (!inline || !open || !el || roomless(el)) return;
    let h = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h1 = el.offsetHeight;
      const dh = h1 - h;
      h = h1;
      if (
        Math.abs(dh) < 0.5 ||
        space.current?.playState === 'running' ||
        !el.parentElement
      )
        return;
      const rest = parseFloat(el.style.marginBlockEnd) || 0;
      const clock = clockOf('in');
      space.current = animateLayout(
        el.parentElement,
        el,
        [{ marginBlockEnd: `${rest - dh}px` }, { marginBlockEnd: `${rest}px` }],
        {
          ms: clock.ms,
          easing: clock.easing,
          reason: 'contextual-bar',
          reduced,
        }
      ).animation;
    });
    ro.observe(el);
    return () => ro.disconnect();
    // clockOf reads refs, read when it runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inline, open, reduced]);

  /**
   * The soft edge: carried over content (stuck, or pushed on by its container's end), its
   * container is masked round the bar — its own top edge kept (a line), nothing from there to
   * the bar, the bar, then the soft edge below it. How far it has been carried, up to the soft
   * edge's width, brings the mask in (`-ramp`), so nothing changes at rest or pops as it sticks.
   * Where it sits in the flow is read as it is when it isn't stuck, else with its stickiness off.
   */
  const natural = useRef<number | null>(null);
  const faded = useRef<HTMLElement | null>(null);
  // Leaving, the mask holds where it is and goes with the strength (its room closing can move
  // the scroll under it, and a dropped mask would blink off).
  const closing = useRef(false);
  // Inline, while it snaps in or folds away and its room opens or closes, the rows gliding under
  // it are masked out of its box even at rest in the flow: what it opens over (a row just
  // checked, at the top of its list) never flashes beside the part of the bar not drawn yet.
  const moving = useRef(false);
  // How far it has been carried past where it sits in the flow, px (0 or less: at rest there).
  const carriedNow = (d: HTMLElement, root: HTMLElement): number => {
    const sc = scrollerOf(d);
    const line =
      (sc ? sc.getBoundingClientRect().top + sc.clientTop : 0) +
      (parseFloat(getComputedStyle(d).top) || 0);
    const r = root.getBoundingClientRect();
    const scrolled = sc === root ? root.scrollTop : 0;
    const top = d.getBoundingClientRect().top;
    if (top > line + 0.5 || natural.current == null)
      natural.current =
        (top > line + 0.5 ? top : unstuckTop(d)) - r.top + scrolled;
    return line - (r.top + natural.current - scrolled);
  };
  // In a toolbar row's place nothing is beside it or under it (the row's tools are hidden while it's
  // there): no mask.
  const masked = placement !== 'toolbar';
  const syncFade = () => {
    if (closing.current || !masked) return;
    const d = dock.current;
    const b = bar.current;
    const root = d?.parentElement;
    if (!d || !b || !root) return;
    faded.current = root;
    const carried = carriedNow(d, root);
    if (inline && carried <= 0.5 && !moving.current) return unfade(root);
    fade(root, b, carried, !inline);
  };
  /**
   * Inline and at rest in the flow, with content after it in the flow: its room opening pushes
   * that content down, so its bottom edge has to travel with it (it grows from its top edge,
   * `originOf`'s `docked`). Carried over content, the scroll keeps what's under it in place (the
   * browser's scroll anchoring), and alone in its container (a slot, the data table's toolbar
   * row) nothing moves: there it grows from the pointer's edge.
   */
  // Over content: an overlay always; inline, while carried over the rows (stuck, scrolled).
  const coversNow = (): boolean => {
    if (placement === 'overlay') return true;
    const d = dock.current;
    const root = d?.parentElement;
    return inline && !!d && !!root && carriedNow(d, root) > 0.5;
  };
  const pushes = (): boolean => {
    const d = dock.current;
    const root = d?.parentElement;
    if (!inline || !d || !root || carriedNow(d, root) > 0.5) return false;
    for (let n = d.nextElementSibling; n; n = n.nextElementSibling) {
      const pos = getComputedStyle(n).position;
      if (
        pos !== 'absolute' &&
        pos !== 'fixed' &&
        (n as HTMLElement).offsetHeight > 0
      )
        return true;
    }
    return false;
  };
  // Once the snap and the room have both come to rest, the mask goes back to what the scroll
  // says (none, at rest in the flow).
  const settling = useRef(0);
  const settle = () => {
    cancelAnimationFrame(settling.current);
    const step = () => {
      const frame = bar.current?.querySelector('.cds-contextual-bar__frame');
      const snapping = frame
        ?.getAnimations()
        .some((a) => a.playState === 'running' || a.pending);
      if (snapping || space.current?.playState === 'running') {
        settling.current = requestAnimationFrame(step);
        return;
      }
      moving.current = false;
      syncFade();
    };
    settling.current = requestAnimationFrame(step);
  };
  // While it unfolds or folds away, the mask's outline follows its surface frame by frame —
  // only while the snap runs, so the surface reset under the hidden bar at its end is never
  // read.
  const tracing = useRef(0);
  const trace = () => {
    cancelAnimationFrame(tracing.current);
    const step = () => {
      const root = faded.current;
      const b = bar.current;
      if (!root || !b || !root.hasAttribute('data-cds-contextual-bar-fade'))
        return;
      const frame = b.querySelector('.cds-contextual-bar__frame');
      if (
        !frame
          ?.getAnimations()
          .some((a) => a.playState === 'running' || a.pending)
      )
        return;
      outline(root, b);
      tracing.current = requestAnimationFrame(step);
    };
    tracing.current = requestAnimationFrame(step);
  };
  // Its strength (`--cds-contextual-bar-fade`, 0–1) on the bar's clock and curve: up as it
  // opens, down as it leaves, from wherever it is; at once when reduced. (What's beside its
  // corners needs none: the box taken out follows its bottom edge, `outline`, so it goes with
  // the fold and no sliver of its soft edge blinks off.)
  const strength = useRef<Animation | null>(null);
  const fadeTo = (k: 0 | 1, now = false) => {
    const root = dock.current?.parentElement;
    if (!root || !masked) return;
    faded.current = root;
    const was =
      getComputedStyle(root)
        .getPropertyValue('--cds-contextual-bar-fade')
        .trim() || '0';
    strength.current?.cancel();
    strength.current = null;
    root.style.setProperty('--cds-contextual-bar-fade', String(k));
    if (now || reduced || Number(was) === k) return;
    const clock = clockOf(k ? 'in' : 'out');
    strength.current = root.animate(
      [
        { '--cds-contextual-bar-fade': was },
        { '--cds-contextual-bar-fade': String(k) },
      ],
      { duration: clock.ms, easing: clock.easing }
    );
  };
  // Its container as it started.
  const release = () => {
    strength.current?.cancel();
    strength.current = null;
    const root = faded.current;
    if (!root) return;
    unfade(root);
    root.style.removeProperty('--cds-contextual-bar-fade');
  };
  useEffect(() => {
    if (!open && !leaving) return;
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (inline && bar.current) nest(bar.current);
          syncFade();
        });
    };
    syncFade();
    // Read in the scroll's own frame, so the mask moves with what it masks.
    window.addEventListener('scroll', syncFade, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    if (dock.current) ro.observe(dock.current);
    if (dock.current?.parentElement) ro.observe(dock.current.parentElement);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', syncFade, { capture: true });
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
    // syncFade reads refs and the placement (a dependency here).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leaving, inline]);
  // Gone (or unmounted): its container as it started.
  useLayoutEffect(() => {
    if (open || leaving) return;
    natural.current = null;
    moving.current = false;
    cancelAnimationFrame(settling.current);
    release();
    faded.current = null;
  }, [open, leaving]);
  useEffect(
    () => () => {
      cancelAnimationFrame(settling.current);
      release();
      resetRow();
    },
    []
  );

  useEffect(() => {
    if (!leaving) return;
    // Back into the line it unfolded from: its bottom edge rises to its top, and (inline) its
    // room closes with it, on the one clock. Inline, the rows closing up under it stay out of
    // its box above that edge while it folds away.
    cancelAnimationFrame(settling.current);
    if (inline) {
      moving.current = true;
      syncFade();
    }
    covers.current = coversNow();
    closing.current = true;
    fadeTo(0);
    trace();
    holdRow();
    hideContent();
    let live = true;
    const folding = surface.close();
    void Promise.all([
      folding,
      inline ? glideSpace('closed', false) : null,
    ]).then(([done]) => {
      if (!done || !live) return;
      // Hidden: its mask goes in the same task, before a frame can show it round nothing.
      release();
      resetRow();
      setLeaving(false);
    });
    return () => {
      live = false;
    };
    // glideSpace reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, surface, inline]);
  // Inline, its corner nested in its container's, before it snaps or paints.
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (inline) nest(el);
    else el.style.removeProperty('--cds-contextual-bar-radius');
  }, [inline, open]);
  // Snap in when it opens (open with the page: just there).
  const opened = useRef(open);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    if (!open) {
      opened.current = false;
      return;
    }
    // Open with the page: its room, and its soft edge, are just there.
    if (opened.current) return fadeTo(1, true);
    opened.current = true;
    const el = bar.current;
    // From its edge nearest the press (or the key's target), right across from it (its clock
    // reads where); its top edge while its room pushes the rows.
    const at = el
      ? originOf(el, causePoint(input.cause, el), originBand, pushes())
      : undefined;
    // Reopened as it folds away: a turn, toward the origin it had (the snap keeps it).
    const turn = surface.leaving();
    if (!turn) {
      originX.current = at?.x;
      rises.current = !!at && at.y > 0;
      covers.current = coversNow();
    }
    surface.open({ origin: at });
    arrive(turn);
    showContent(turn);
    closing.current = false;
    moving.current = inline;
    syncFade();
    fadeTo(1);
    trace();
    if (inline) {
      void glideSpace('open', !space.current);
      settle();
    }
    // glideSpace reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, surface, inline]);
  // Inverse: the page's opposite theme, read where it is, before its first paint (and again on
  // a new variant).
  // Its status solved for that surface too, and both again when a theme changes round it.
  const shown = open || leaving;
  // Closed, it follows nothing: it reads again as it opens.
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const read = () => {
      invert(el, variant);
      tone(el, variant, kind);
    };
    read();
    if (!shown) return;
    let raf = 0;
    const off = onThemeChange(el, () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        read();
      });
    });
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [variant, kind, shown]);
  // Gone: the next opening starts from no room.
  useLayoutEffect(() => {
    if (!open && !leaving) space.current = null;
  }, [open, leaving]);
  // In a toolbar row's place: the row says so while the dock is in it, and
  // its other content hides (contextual-bar.scss). Marked here rather than
  // matched with a `:has()` on the row, which restyled the whole page on
  // every hover.
  const docked = open || leaving;
  useLayoutEffect(() => {
    const row =
      placement === 'toolbar' && docked ? dock.current?.parentElement : null;
    if (!row) return;
    // Counted per row: two bars in one row, the first to leave keeps the mark for the other.
    const n = (toolbarDocks.get(row) ?? 0) + 1;
    toolbarDocks.set(row, n);
    row.setAttribute('data-cds-contextual-bar-toolbar', '');
    return () => {
      const left = (toolbarDocks.get(row) ?? 1) - 1;
      if (left > 0) return void toolbarDocks.set(row, left);
      toolbarDocks.delete(row);
      row.removeAttribute('data-cds-contextual-bar-toolbar');
    };
  }, [placement, docked]);

  if (!open && !leaving) return null;

  return (
    <div
      ref={dock}
      className={`cds-contextual-bar cds-contextual-bar--${placement}${className ? ` ${className}` : ''}`}>
      <CarbonLayer
        as="div"
        ref={bar}
        className="cds-contextual-bar__bar"
        data-variant={variant}
        data-kind={kind}
        role="region"
        aria-label={label}
        {...inertProps(!open)}>
        <span className="cds-contextual-bar__frame" {...SNAP_FRAME} />
        {/* The snap's content layer, held still under the soft edge; the row in it moves. */}
        <div ref={content} className="cds-contextual-bar__content">
          <div ref={row} className="cds-contextual-bar__row">
            <BarTimeScale.Provider value={timeScale}>
              {open ? children : held}
            </BarTimeScale.Provider>
          </div>
        </div>
      </CarbonLayer>
    </div>
  );
}

/* ── Count: a number that rolls ───────────────────────────────────────── */

export interface ContextualBarCountProps {
  /** The count. A rise rolls up, a fall rolls down. */
  value: number;
  /** What it counts, after the number ("selected", or a function of the count for a plural); it rolls with the number when it changes. */
  label?: string | ((value: number) => string);
  /** The number as shown. Default `String`. */
  format?: (value: number) => string;
  className?: string;
}

function ContextualBarCount({
  value,
  label,
  format = String,
  className,
}: ContextualBarCountProps) {
  const timeScale = useContext(BarTimeScale);
  const text = typeof label === 'function' ? label(value) : label;
  return (
    <span
      className={`cds-contextual-bar__count${className ? ` ${className}` : ''}`}>
      <RollText text={format(value)} order={value} timeScale={timeScale} />
      {text ? (
        <>
          {' '}
          <RollText text={text} order={value} timeScale={timeScale} />
        </>
      ) : null}
    </span>
  );
}

/* ── Swap: content that changes as a whole, out then in ───────────────── */

export interface ContextualBarSwapProps {
  /** What the content is; a new key swaps it (out, then in). The same key updates it in place. */
  swapKey: string | number;
  children: ReactNode;
  /** The swap's axis. Default `y`. */
  axis?: 'x' | 'y';
  /** +1 (default): the new content comes from below (or the end side); −1: from above (or the start). */
  direction?: number;
  className?: string;
}

interface Layer {
  id: number;
  key: string | number;
  node: ReactNode;
}

let nextLayer = 1;

function ContextualBarSwap({
  swapKey,
  children,
  axis = 'y',
  direction = 1,
  className,
}: ContextualBarSwapProps) {
  const [current, setCurrent] = useState<Layer>(() => ({
    id: nextLayer++,
    key: swapKey,
    node: children,
  }));
  const [leaving, setLeaving] = useState<Layer[]>([]);
  if (swapKey !== current.key) {
    setLeaving((l) => [...l, current]);
    setCurrent({ id: nextLayer++, key: swapKey, node: children });
  } else if (children !== current.node) {
    setCurrent({ ...current, node: children });
  }

  const box = useRef<HTMLSpanElement>(null);
  const lastW = useRef<number | null>(null);
  const shown = useRef(current.id);
  const reduced = usePrefersReducedMotion();
  const timeScale = useContext(BarTimeScale);

  useLayoutEffect(() => {
    const el = box.current;
    const layer = (id: number) =>
      el?.querySelector<HTMLElement>(`:scope > [data-layer="${id}"]`) ?? null;
    const inEl = layer(current.id);
    if (!el || !inEl) return;
    const was = shown.current;
    shown.current = current.id;
    if (was === current.id) {
      if (!el.getAnimations().length) lastW.current = el.offsetWidth;
      return;
    }
    const outEl = layer(was);
    const swap = playContentSwap({
      out: outEl,
      in: inEl,
      axis,
      direction,
      reduced,
      timeScale,
    });
    // While it swaps, the box is a window: the arriving content, laid out at its own width
    // under a box still at the old one, never reaches past it (no sideways overflow).
    el.dataset.swapping = '';
    const settle = () => {
      if (!el.getAnimations().length && !inEl.getAnimations().length)
        delete el.dataset.swapping;
    };
    void swap.inAnimation.finished.then(settle, () => undefined);
    const drop = () => setLeaving((l) => l.filter((x) => x.id !== was));
    if (swap.outAnimation) swap.outAnimation.onfinish = drop;
    else drop();

    // The width: held through the out, then gliding to the new content's with the in.
    const running = el.getAnimations();
    const w0 = running.length
      ? el.getBoundingClientRect().width
      : (lastW.current ?? el.offsetWidth);
    running.forEach((a) => a.cancel());
    const w1 = el.offsetWidth;
    lastW.current = w1;
    if (reduced || Math.abs(w1 - w0) < 0.5) return;
    const glide = el.animate([{ width: `${w0}px` }, { width: `${w1}px` }], {
      duration: swap.inMs,
      delay: swap.wait,
      easing: bezier('standard-productive'),
      fill: 'backwards',
    });
    void glide.finished.then(settle, () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  return (
    <span
      ref={box}
      className={`cds-contextual-bar__swap${className ? ` ${className}` : ''}`}>
      {leaving.map((l) => (
        <span
          key={l.id}
          data-layer={l.id}
          className="cds-contextual-bar__layer cds-contextual-bar__layer--out"
          aria-hidden="true"
          {...inertProps(true)}>
          {l.node}
        </span>
      ))}
      <span
        key={current.id}
        data-layer={current.id}
        className="cds-contextual-bar__layer">
        {current.node}
      </span>
    </span>
  );
}

/** The contextual bar, with its parts: `ContextualBar.Count` (a rolling count) and `ContextualBar.Swap` (content swapped out then in). */
/** The toolbar-placed bars docked in each row, so the row's mark outlives all but the last. */
const toolbarDocks = new WeakMap<Element, number>();

export const ContextualBar = Object.assign(ContextualBarRoot, {
  Count: ContextualBarCount,
  Swap: ContextualBarSwap,
});
