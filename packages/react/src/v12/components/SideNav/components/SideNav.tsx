/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  DURATION_FLOOR_MS,
  SNAP_FRAME,
  attachCastShadow,
  beginLayout,
  bezierEase,
  centerCastShadow,
  deriveCastShadowColor,
  deriveLightnessColors,
  durationStepForDistance,
  lightnessColors,
  lightnessStep,
  motionTokens,
  stepDown,
  type LayoutTransaction,
  type Selection,
  type SelectionMoveInfo,
  reducedClock,
  snapEaseCss,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  ArrowUpRight,
  ChevronDownUpToggle,
  SidePanelOpenToggle,
} from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  createTooltip,
  ghostSteps,
  MEASURE_STAGE,
  layoutScale,
  measureScheduler,
  resolveSelectionStyle,
  stretchForLength,
  textWidth,
  useIconPixelSnap,
  useItemRollover,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionGesture,
  useSelectionJump,
  type MeasureJob,
  type SelectionMotion,
  type SelectionStyleProps,
  type TooltipController,
} from '@carbon-labs/react-selection-kit';
import {
  useDefaultFrame,
  useSurfaceShadow,
} from '@carbon-labs/react-kit-defaults';
import {
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { SideNavFlyout } from './flyout';
import { useSideNavFilter, type SideNavFilterOptions } from './filter';
import { parseCssColor } from '@carbon-labs/react-util';
import { onThemeChange } from '@carbon-labs/react-util';
import { createLeads, type Leads } from '@carbon-labs/v12-motion';
import { AppShellFoldToggleContext } from '@carbon-labs/react-app-shell';
import { useWithTimeScale } from '@carbon-labs/react-props';
import { exitPullbackStyle } from '@carbon-labs/react-snap';
import { ROW_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './side-nav.scss';
import { clamp01 } from '@carbon-labs/v12-motion';
import { inertProps } from '@carbon-labs/react-util';
import { IN_DEVELOPMENT } from '@carbon-labs/react-util';

/* ============================================================================
 * Side nav — the app's page navigation on the selection family's look and
 * motion.
 * ============================================================================
 *
 * A `<nav>` of links, not a tablist or a listbox: each item is a real link
 * (an `<a href>`, or a router link through `as`), and the current page is
 * `aria-current="page"`. The list is one selection-kit track on its side
 * (`.sel .sel--vertical`):
 *
 *   selector   marks the current page and glides to the new one in its
 *              group on navigation: the kit's timing by travel, the leading
 *              edge ahead (stretch from the track's length,
 *              `stretchForLength`), labels taking the selected face where it
 *              covers them; to a page in another group it jumps (below)
 *   first      on mount it is simply there (stillness); the groups that hold
 *              the current page mount open, with no transition
 *   still      `still`: while it's true the nav's changes snap — groups open
 *              and shut at once (the chevron too), the selector arrives and
 *              leaves at once —
 *              for a list that changes as someone types (a filter in the
 *              shell: reactive UI snaps). A move to a new page
 *              still glides. Links and groups may come and go (mount and
 *              unmount) at any time: when the current page's link goes, the
 *              selector leaves, and it comes back when the link does
 *   press      reach toward the pressed link (the kit's, from the incremental
 *              travel); slide to another link to retarget, slide off to cancel
 *   hover      the kit's rollover and label step; the selector's glow on the
 *              current page. A row clicked to keeps its hover until the
 *              selector lands on it, glide or jump (`data-landing`): round
 *              the selector the wash and the label's hover color, on it the
 *              glow; a selected row's hover is the selector's, so without
 *              this it went at the click, before the selector came
 *   groups     collapsible (`SideNavGroup`), the chevron a motion icon; the
 *              selector re-measures as a group opens and shuts, and when the
 *              current page's group is shut the selector leaves (the header
 *              isn't the page) and a 2px bar at its start, as tall as the
 *              icon frame, marks the group (the hero line's colour); it
 *              holds still through a fold; a group opens when
 *              you go to one of its pages (even after you shut it) and
 *              never shuts on its own. Opening and shutting is the kit's
 *              disclosure: the travel's step (a shut one step faster), the
 *              links coming down 8px from the opening's first frame, one
 *              layout transaction per motion. The current page's group header takes
 *              the selected weight (held to its regular width), every other
 *              header is regular
 *   jump       the default between groups, with no fades for the
 *              selectors: a move between groups doesn't glide. The old
 *              selector, from where it is (leaning, if the press reached
 *              toward the new link), shrinks 4px in width and height (2px
 *              in on every side), exit-productive, opaque to its last
 *              frame, and is gone; then the new one comes in at the new
 *              link 4px small (2px in on every side), opaque, growing to
 *              full, entrance-snap. The whole jump runs on the glide's
 *              shortest clock (one row's travel: fast-01, 80ms), a third
 *              for the out and two thirds for the in; the out
 *              starts on the frame after the click's commit. Out, then in:
 *              the kit's leave and arrival (the engine's `hide` / `show`),
 *              on their share of that clock, and with the leave's fade held
 *              at opaque. The old row keeps its selected face under the
 *              shrinking selector and the new row its hover (the pointer is
 *              on it) until the cut, where the faces change together as the
 *              new selector comes in carrying the selected row's hover; the
 *              wash stays round it until it has landed, so its fringe
 *              never shows the panel (`data-landing`). That hover shrinks
 *              with the old selector, the same 2px a side on the same clock
 *              and curve, and the new selector comes in at its size, so its
 *              entrance reads more. A keyboard move's hover (the focused row's)
 *              shrinks the same way; with no hover (a change from outside)
 *              the selector shrinks and grows alone, the same amounts and
 *              clock. The jump is the selection kit's (selection-kit/jump.ts).
 *              Between groups: the two links are in different groups, one
 *              in a group and the other top-level, or both top-level with a
 *              group between them (the glide would pass its header). Within
 *              a group it glides. A move during the out waits for it, and
 *              the in plays at whatever is current then. Reduced: no size
 *              change and no fade, the selector is at the new link at once.
 *              The rail's group pages are marked by the bar, so there it's
 *              only top-level moves across a group; a flyout is its own menu
 *   pass       `crossGroup="glide"`: the selector glides between groups too,
 *              and isn't shown over a group's header it passes: it goes out
 *              as it reaches the header's row and comes back as it leaves it
 *   ghost     `frame="ghost"`: no panel; an open group is a container that
 *              grows out of its header's hover background, its rows inset
 *              inside it as a menu's are, casting the cast shadow lit from
 *              the pointer; top-level rows two insets apart, so it clears
 *              its neighbours; hover by matched lightness always; one group
 *              is open at a time (`exclusive`), the one opening and the one
 *              it shuts one motion on one clock (the swap). A jump to a page
 *              in a shut group goes out as the swap starts and comes in once
 *              the group has opened; to a link in the group just opened (the
 *              selector gone with the group it shut), the hover's shrink is
 *              the out
 *   keyboard   the standard nav's: every link and group header is a tab
 *              stop (a shut group's links are skipped); Enter follows a link,
 *              Enter / Space toggles a group; rings keyboard-only
 *   reduced    the kit's within a group: the selector fades at the new page
 *              while a ghost fades at the old (no travel, no reach); between
 *              groups the jump's: at the new page at once
 *   icons      `renderIcon` on links and group headers: top-level rows get
 *              an icon column, the icon centered in a row-height square, so
 *              it never moves between the expanded nav and the rail; a
 *              group's links start where its header's label starts
 *   rail       `collapsed` / `defaultCollapsed` (or `collapsible`), when
 *              every top-level row has an icon: a toggle at the nav's foot,
 *              its lower start, folds it to a rail of square, icon-only rows. One
 *              layout transaction, one motion: the width shrinks while its
 *              soft edge clips the content away in place; growing, the edge
 *              reveals it as the labels slide in on a longer clock. A
 *              group in the rail opens a flyout (the Menu) with its links;
 *              rows show their label in the kit's tooltip. `expandOnHover`
 *              expands it over the page after a short intent delay
 * ========================================================================== */

export type SideNavSize = 'sm' | 'md' | 'lg';
export type SideNavVariant = 'tonal' | 'inverse' | 'outlined' | 'hero';
/**
 * What the nav stands on (`frame`): `inset`, a rounded panel with inset
 * rows; `flush`, a full-height column of square rows stacked edge to edge
 * (v11's); `ghost`, no panel, an open group a container grown out of its
 * header's hover background.
 */
export type SideNavFrame = 'inset' | 'flush' | 'ghost';
/** Each frame's class (side-nav.scss keeps its earlier names). */
const FRAME_CLASS: Record<SideNavFrame, string> = {
  inset: 'floating',
  flush: 'container',
  ghost: 'ghost',
};
const SIDE_NAV_FRAMES: readonly SideNavFrame[] = ['inset', 'flush', 'ghost'];
/**
 * How the selector moves between groups: `jump` (default) leaves the old
 * link and comes in at the new one, out then in; `glide` travels there, not
 * shown over the headers it passes.
 */
export type SideNavCrossGroup = 'glide' | 'jump';

/** The side nav's motion dials: the selection kit's. `stretch` left out comes from the track's length. */
export type SideNavMotion = SelectionMotion;

/** The kit's dials, with drag off: a nav's selector marks a page, it isn't dragged to another. */
export const SIDE_NAV_MOTION: SideNavMotion = {
  ...SELECTION_KIT_MOTION,
  drag: false,
};

const ITEM = '.sel__item';
const LINK = '.sidenav__link';
const HEADER = '.sidenav__header';
/** The pass's soft edges, px: the selector fades out over this much of a header's row, and back in. */
const PASS_FEATHER = 4;

/**
 * The selector's mask while it glides: opaque, but clear over every group
 * header's row (soft at its edges), in the track's space — the indicator
 * takes it offset by its own top, so the clear bands stay on the headers
 * as it moves. Read, with the track's height (the mask's), before anything
 * is written.
 */
function passMask(
  root: HTMLElement,
  sel: Selection
): { mask: string; height: number } | null {
  const bands = [...root.querySelectorAll<HTMLElement>(HEADER)]
    .filter((h) => h.offsetHeight > 0)
    .map((h) => sel.rectOf(h))
    .sort((a, b) => a.t - b.t);
  if (!bands.length) return null;
  const stops = ['#000 0px'];
  for (const { t, b } of bands) {
    const f = Math.min(PASS_FEATHER, (b - t) / 2);
    stops.push(
      `#000 ${t}px`,
      `transparent ${t + f}px`,
      `transparent ${b - f}px`,
      `#000 ${b}px`
    );
  }
  return {
    mask: `linear-gradient(to bottom, ${stops.join(', ')})`,
    height: root.scrollHeight,
  };
}

/** The selector's marks: the pass's mask goes on them, its only reader (on the track it restyled every row). */
/** The track's length for the glide's head start: its rows, not the free space above a foot. */
function trackLength(root: HTMLElement): number {
  const foot = root.querySelector<HTMLElement>(':scope > .sidenav__foot');
  const free = foot
    ? parseFloat(getComputedStyle(foot).marginBlockStart) || 0
    : 0;
  return root.offsetHeight - Math.max(0, free);
}

const indicatorsOf = (root: HTMLElement) =>
  root.querySelectorAll<HTMLElement>(':scope > .sel__indicator');

/** The pass is over: the selector shows everywhere again. */
function endPass(root: HTMLElement) {
  if (!('passing' in root.dataset)) return;
  delete root.dataset.passing;
  for (const el of indicatorsOf(root)) {
    el.style.removeProperty('--sidenav-pass-mask');
    el.style.removeProperty('--sidenav-pass-h');
  }
}

const groupOf = (el: Element) => el.closest('.sidenav__group');

/**
 * A move from `from` to `to` is between groups: they're in different groups
 * (or one is top-level), or both are top-level with a group between them
 * (the glide would pass its header). Document order only: no layout read.
 */
function betweenGroups(root: HTMLElement, from: Element, to: Element): boolean {
  const g = groupOf(from);
  if (g !== groupOf(to)) return true;
  if (g) return false;
  const after = (a: Node, b: Node) =>
    !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  const [first, last] = after(from, to) ? [from, to] : [to, from];
  for (const group of root.querySelectorAll('.sidenav__group'))
    if (after(first, group) && after(group, last)) return true;
  return false;
}

/* ── context ───────────────────────────────────────────────────────────── */

/**
 * The nav's context, split by how often it changes, so a link re-renders
 * only for what it reads: this one is stable (it changes with the nav's
 * props, not with its state); `NavStateContext` carries the rail and the
 * flyout, and only groups read it.
 */
interface NavContextValue {
  /**
   * A mark may have moved (a link's, a group's): place the selector on
   * whatever is marked, once for the commit, however many ask. `rows`: a
   * row came, went or changed its label — its box is measured and its
   * selected face held again.
   */
  requestSync: (rows?: boolean) => void;
  /** Top-level rows have an icon column (some row has an icon, or the nav folds to a rail). */
  iconColumn: boolean;
  /** Selected labels take this weight (the current page's group header too); null: no weight change. */
  weight: number | null;
  /** One group open at a time. */
  exclusive: boolean;
  /** `frame="ghost"`: an open group is a container casting a shadow. */
  ghost: boolean;
  /** Ghost's open container casts the kit's cast shadow (`ghostShadow`). */
  ghostShadow: boolean;
  /** Snap the icons to device px again (after a move lands). */
  resnapIcons: () => void;
  /** Hold the selected faces' widths again (a header's own weight changed). */
  reholdWeight: () => void;
  /** With `exclusive`: who's open, and who opened last. */
  leads: Leads;
  /** The groups' bodies opening and shutting: the kit's disclosure moves on the nav (one motion, one transaction, for every group moving at once). */
  moves: DisclosureMoves;
  /** A rail group's header asks for its flyout. */
  toggleFlyout: (req: FlyoutRequest) => void;
  /** A press on a header began just as that header's flyout closed (a press outside it): the click shouldn't reopen it. */
  pressClosedFlyout: (group: string) => boolean;
}

/** The nav's state that changes as it moves: read by groups only (their links take it from GroupContext). */
interface NavStateValue {
  /**
   * The nav is (or is becoming) the rail: from the moment its labels start to
   * leave until they start to arrive again. Groups are folded, a group's
   * header opens its flyout, and a page inside a group is marked by the bar.
   */
  railish: boolean;
  /** The group whose flyout is open, if any. */
  flyoutGroup: string | null;
  /** `still`: changes snap (a group's chevron too). */
  still: boolean;
}

/** One of a group's links, as its flyout shows it. */
interface FlyoutEntry {
  label: string;
  Icon?: ElementType;
  current: boolean;
  disabled: boolean;
}

interface FlyoutRequest {
  group: string;
  title: string;
  anchor: HTMLElement;
  /** The group's links, in order, and the element each one follows. */
  entries: { key: string; entry: FlyoutEntry; el: HTMLElement | null }[];
  /** The press that opened it (client px), or null from the keyboard. */
  pointer: { x: number; y: number } | null;
}

/** Where a flyout opens: the Menu's x / y ranges (client px) and its snap's origin. */
interface FlyoutPlace {
  x: [number, number];
  y: [number, number];
  origin: { x: number; y: number };
}

/** A node's text (a label given as elements), for the flyout's rows and the missing-icon warning. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return '';
}

/**
 * The top-level rows (links and group headers) with no icon, by label. A nav
 * folds to a rail only when this is empty: no collapsed
 * navigation without icons. Rows wrapped in another component can't be read
 * here and count as having one.
 */
function topRowsWithoutIcon(node: ReactNode): string[] {
  const out: string[] = [];
  Children.forEach(node, (child) => {
    if (
      !isValidElement<{
        renderIcon?: unknown;
        children?: ReactNode;
        title?: ReactNode;
      }>(child)
    )
      return;
    if (child.type === Fragment)
      out.push(...topRowsWithoutIcon(child.props.children));
    else if (
      (child.type === SideNavLink || child.type === SideNavGroup) &&
      !child.props.renderIcon
    )
      out.push(
        textOf(
          child.type === SideNavGroup ? child.props.title : child.props.children
        ) || '(unlabelled)'
      );
  });
  return out;
}

/** Does any top-level row (a link or a group header) have an icon? (Read from the elements, so the first render is right.) */
function hasTopIcon(node: ReactNode): boolean {
  let found = false;
  Children.forEach(node, (child) => {
    if (
      found ||
      !isValidElement<{ renderIcon?: unknown; children?: ReactNode }>(child)
    )
      return;
    if (child.props.renderIcon) found = true;
    else if (child.type === Fragment) found = hasTopIcon(child.props.children);
  });
  return found;
}

/** A row's icon slot in the icon column: the icon, or an empty column (a row with none, in a nav that has some). */
function IconSlot({ Icon }: { Icon?: ElementType }) {
  return (
    <span className="sidenav__icon">{Icon && <Icon aria-hidden="true" />}</span>
  );
}

const NavContext = createContext<NavContextValue | null>(null);

function useNav(who: string): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error(`${who} must be inside SideNav`);
  return ctx;
}

const NavStateContext = createContext<NavStateValue>({
  railish: false,
  flyoutGroup: null,
  still: false,
});

interface GroupContextValue {
  /** Open and done opening: its rows are in view, so its current link may take the selector. */
  revealed: boolean;
  /** The nav is (or is becoming) the rail: the group is folded, its bar marks the page. */
  railish: boolean;
  /** A link reports whether it's the current page (for links the group can't see in its children). */
  report: (id: string, current: boolean) => void;
  /** A link registers what the group's flyout shows for it (null: it's gone). */
  register: (id: string, entry: FlyoutEntry | null) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

/** The id of the bar's entrance (SideNavGroup), so a new one can replace it. */
const MARK_IN = 'sidenav-mark-in';

/* ── ghost: the open container's cast shadow ─────────────────────────────
 *
 * The cast shadow's own pointer response (motion-core's attachCastShadow,
 * delegated on the track): while the pointer is over an open group, its
 * shadow falls away from the cursor, written on each pointer event to the
 * layers' custom properties (they feed `translate` only: composited, no
 * layout), re-aimed once a frame while the group grows or shrinks under a
 * still pointer. What this adds, for a shadow that stays when the pointer
 * goes: arriving and leaving, the light eases over moderate-01
 * (`data-cast-ease`, off under reduced motion), and leaving, it comes to
 * rest lit from straight above.
 */

const GHOST_OPEN = '.sidenav__group[data-open]';

/*
 * Ghost's hover and its container step by matched lightness, both themes'
 * steps softened: the selection kit's ghost solve (`ghostSteps`,
 * selection-kit/ghost.ts). The side nav
 * keeps its own geometry (the track's inset round its rows, the inset's gap
 * between them: an open group's container grows into that inset), so it
 * doesn't take `.sel--ghost`'s.
 */

function attachGhostLight(
  track: HTMLElement,
  easeMs: () => number
): () => void {
  const detach = attachCastShadow(track, { selector: GHOST_OPEN });
  const timers = new Map<HTMLElement, number>();
  let under: HTMLElement | null = null;
  const ease = (group: HTMLElement) => {
    const ms = easeMs();
    if (ms <= 0) return;
    window.clearTimeout(timers.get(group));
    group.dataset.castEase = '';
    timers.set(
      group,
      window.setTimeout(() => {
        delete group.dataset.castEase;
        timers.delete(group);
      }, ms)
    );
  };
  const enter = (group: HTMLElement | null) => {
    if (group === under) return;
    if (under) {
      ease(under);
      centerCastShadow(under);
    }
    if (group) ease(group);
    under = group;
  };
  const onPointer = (e: PointerEvent) =>
    enter(
      (e.target as Element | null)?.closest?.<HTMLElement>(GHOST_OPEN) ?? null
    );
  const onLeave = () => enter(null);
  track.addEventListener('pointerover', onPointer);
  track.addEventListener('pointermove', onPointer);
  track.addEventListener('pointerleave', onLeave);
  return () => {
    detach();
    track.removeEventListener('pointerover', onPointer);
    track.removeEventListener('pointermove', onPointer);
    track.removeEventListener('pointerleave', onLeave);
    for (const [group, t] of timers) {
      window.clearTimeout(t);
      delete group.dataset.castEase;
    }
    for (const layer of track.querySelectorAll(
      '.sidenav__group > [data-cast-layer]'
    ))
      layer.remove();
  };
}

/* ── the rail: expand and collapse as one layout transaction ─────────────
 *
 * Written every frame, px, each only where it's read and only when it
 * changes (an inherited property written on the nav restyled all of it,
 * every frame):
 *
 *   inline-size         the track's: the panel's width, what you see; the
 *                       nav's: its width in the page's layout — the panel's,
 *                       except while it's expanded over the page (hover),
 *                       when it stays the rail's
 *   --sidenav-edge-w    on the soft edge's readers (the list, the toggle):
 *                       the soft edge at the panel's moving edge, the shared soft edge
 *                       (`--cds-motion-soft-edge`, 16px), narrowing to 0
 *                       over the last px of the travel so nothing pops when
 *                       the mask goes
 *   --sidenav-fold-edge on each folding group's clip (and the selector it
 *                       cuts): the fold's soft bottom edge, the
 *                       disclosure's `min(16px, h, H − h)` for a body h
 *                       tall of its open H, so it grows over the first 16px
 *                       of the fold and closes over the last
 *
 * The labels' slide on x (expanding only) is a compositor animation of
 * `translate`, one keyframe pair on one clock for every label. The tokens a
 * move reads (the soft edge, the rail's width, the slide) are read once, as
 * it starts, before it writes anything.
 *
 * One motion, width and content together, a single ease:
 *
 *   collapse  the width shrinks on one curve (its duration from the
 *             distance, one step faster as an exit). The content doesn't
 *             move: each row's content stays laid out at the expanded width
 *             while its row narrows, and the panel's moving edge clips it
 *             away through the soft edge (a mask). Open groups fold on the
 *             same clock. Then the rail's labels leave the layout (they stay
 *             each row's name).
 *             A current page in an open group keeps its selector, which folds
 *             away with the group: clipped by the group's soft bottom edge
 *             every frame (data-sel-cut; the cut worked out from the fold,
 *             not measured), and gone, not faded, at the end (data-sel-gone,
 *             until it next arrives).
 *   expand    the width grows (a plain width tween, standard-productive),
 *             revealing the content through the moving soft edge, while the
 *             labels slide in on x from the icon gap (8px at md) toward the
 *             start — never over the icon — on a clock one step longer than
 *             the width's (as the snap's content rides fast-02 against its
 *             container's fast-01), same curve. Text never scales or
 *             reflows. The selector comes with the width: a top-level page's
 *             grows with its row; a page in an open group arrives the frame
 *             its row is revealed by the unfolding group.
 *   reduced   the width changes at once; the labels only fade (half the
 *             clock): out before a collapse, in after an expand.
 *
 * The state lives on the nav's attributes, written here, not by React:
 *   data-rail     the labels are out of the layout (still the rows' names)
 *   data-folded   groups are folded (the grid row at 0fr)
 *   data-resizing the width is moving: rows' content holds the expanded
 *                 width, the soft edge clips it, groups fold on its clock
 *   data-tree     hidden: the labels faded out (reduced motion only)
 *   data-overlay  the panel is wider than its place in the layout (hover)
 *   data-sel-cut  the selector is clipped at its group's folding edge
 *                 (--sidenav-sel-cut on the selector, px from its top)
 *   data-sel-gone the selector folded away with its group: hidden until it
 *                 next arrives
 *
 * Rows aren't interactive while the width moves: any hover or press wash
 * fades out over fast-01 as it starts and stays off until it ends (CSS).
 */

/** Both ways, and the labels' slide: the standard in / out curve (tweens use standard). */
const RAIL_EASE = motionTokens.easing['standard-productive'] as readonly [
  number,
  number,
  number,
  number,
];
const railEase = bezierEase(RAIL_EASE);
/** The entrance's curve, for the bar's entrance. */
const ENTRANCE = snapEaseCss('entrance-productive');
/** How long the pointer rests on a collapsed nav before it expands over the page (`expandOnHover`), ms. */
const HOVER_EXPAND_MS = 250;
/** How long the pointer may be off an expanded-on-hover nav before it folds again, ms (a slip past its edge). */
const HOVER_COLLAPSE_MS = 100;
/** What slides in as the rail expands: every part of a row but its icon in the column. */
const SLIDING = '.sel__face > :not(.sidenav__icon)';
/** The id of the labels' slide (createRail). */
const SLIDE = 'sidenav-slide';

interface RailOptions {
  /** Docked state: the nav's place in the layout is the rail. */
  collapsed: boolean;
  /** What you see: the panel expanded (docked open, or open over the page on hover). */
  expanded: boolean;
  /** The expanded panel's width, px. */
  width: number;
  timeScale: number;
  reduced: boolean;
  onRailish: (railish: boolean) => void;
}

interface RailController {
  /** Move to the options' state (animated, from wherever it is). */
  go: () => void;
  /** Place at the options' state at once (mount, and a width or size change at rest). */
  place: () => void;
  destroy: () => void;
}

/** Container edges: the inset's sides, the radius and the gap's margin. */
const GHOST_EDGE =
  /^(top|right|bottom|left|inset|margin-top|margin-block-start|border-.*radius)/;

/**
 * Ghost: the open containers, their shadows and the gap's margin move with
 * the bodies, so they take the motion's clock as it starts (the disclosure's
 * `onTimed`): every edge transition that started with it, and the shut
 * container's fade and colour wait for its shrink (the fade's own clock
 * kept). Only transitions that started this frame: one still under way from
 * an earlier move keeps its clock.
 */
function retimeGhost(nav: HTMLElement, clock: number) {
  for (const li of nav.querySelectorAll<HTMLElement>('.sidenav__group')) {
    const layers = li.querySelectorAll<HTMLElement>(
      ':scope > :is(.sidenav__group-bg, [data-cast-layer])'
    );
    for (const el of [li, ...layers]) {
      const started = el
        .getAnimations()
        .filter(
          (a): a is CSSTransition =>
            a instanceof CSSTransition && Number(a.currentTime ?? 0) < 1
        );
      const fade = started.find((a) => a.transitionProperty === 'opacity');
      const fadeMs = Number(fade?.effect?.getTiming().duration ?? 0);
      for (const a of started) {
        const p = a.transitionProperty;
        const delay = Number(a.effect?.getTiming().delay ?? 0);
        if (GHOST_EDGE.test(p)) a.effect?.updateTiming({ duration: clock });
        else if (delay > 0 && p === 'opacity')
          a.effect?.updateTiming({ delay: clock });
        else if (delay > 0 && p === 'background-color')
          a.effect?.updateTiming({ delay: clock + fadeMs });
      }
    }
  }
}

/** The subtree a resize affects: the nav's column and what sits beside it (the shell's row). */
function layoutRootOf(nav: HTMLElement): HTMLElement {
  return nav.parentElement?.parentElement ?? nav.parentElement ?? nav;
}

type DurationName = keyof typeof motionTokens.duration;

/** The step one longer than `token` (the content's clock against the width's). */
function stepUp(token: DurationName): DurationName {
  const order: DurationName[] = [
    'fast-01',
    'fast-02',
    'moderate-01',
    'moderate-02',
    'moderate-03',
    'slow-01',
  ];
  const i = order.indexOf(token);
  return i < 0 ? token : order[Math.min(order.length - 1, i + 1)]!;
}

/** An open group's body folding or unfolding with the width: its height from → to, px. */
interface Fold {
  el: HTMLElement;
  /** Its clip, where the soft edge is. */
  clip: HTMLElement | null;
  from: number;
  to: number;
  /** Its open height, H (its list's). */
  open: number;
}

function createRail(
  nav: HTMLElement,
  track: HTMLElement,
  opts: () => RailOptions
): RailController {
  let live = { panel: 0, layout: 0 };
  let raf = 0;
  let timers: number[] = [];
  let tx: LayoutTransaction | null = null;
  let finishResize: (() => void) | null = null;

  const attr = (name: string, value: string | null) => {
    if (nav.getAttribute(`data-${name}`) === value) return;
    if (value == null) nav.removeAttribute(`data-${name}`);
    else nav.setAttribute(`data-${name}`, value);
  };

  /** The tokens a move reads, read once as it starts: the soft edge, the rail's width (the kit's `--sel-h`), the slide (its icon gap). */
  let tokens = { edge: 16, rail: 40, slide: 8, dir: 1 };
  const readTokens = () => {
    const nc = getComputedStyle(nav);
    const tc = getComputedStyle(track);
    tokens = {
      edge: parseFloat(nc.getPropertyValue('--cds-motion-soft-edge')) || 16,
      rail: parseFloat(tc.getPropertyValue('--sel-h')) || 40,
      slide: parseFloat(tc.getPropertyValue('--sel-icon-gap')) || 8,
      dir: nc.direction === 'rtl' ? -1 : 1,
    };
  };
  /** Who reads what a frame writes, found once a move: the soft edge's readers, the selector. */
  let edges: HTMLElement[] = [];
  let markers: HTMLElement[] = [];
  /** What is last written (written again only when it changes). */
  let shown = { panel: NaN, layout: NaN, edge: NaN };
  const findReaders = () => {
    markers = [...track.querySelectorAll<HTMLElement>('.sel__indicator')];
    // Ghost: the track takes the list's edge (side-nav.scss), so the selector shares the rows' layer.
    edges = [
      track,
      ...track.querySelectorAll<HTMLElement>(
        ':scope > .sidenav__list, :scope > .sidenav__foot > .sidenav__toggle'
      ),
    ];
    shown = { ...shown, edge: NaN };
  };

  let edgeTarget = 0;
  /** Run after every frame's write while a resize moves, at the width's eased progress (the selector's clip, its reveal). */
  let frame: ((k: number) => void) | null = null;
  const write = (k = 1) => {
    if (live.panel !== shown.panel)
      track.style.inlineSize = `${(shown.panel = live.panel)}px`;
    if (live.layout !== shown.layout)
      nav.style.inlineSize = `${(shown.layout = live.layout)}px`;
    // The soft edge closes up over the travel's last px: no pop when the mask goes.
    const edge = Math.min(tokens.edge, Math.abs(edgeTarget - live.panel));
    if (edge !== shown.edge) {
      shown.edge = edge;
      for (const el of edges)
        el.style.setProperty('--sidenav-edge-w', `${edge}px`);
    }
    attr('overlay', live.panel > live.layout + 0.5 ? '' : null);
    frame?.(k);
  };
  const writeCut = (px: number | null, edge = 0) => {
    for (const m of markers) {
      if (px == null) {
        m.style.removeProperty('--sidenav-sel-cut');
        m.style.removeProperty('--sidenav-fold-edge');
      } else {
        m.style.setProperty('--sidenav-sel-cut', `${px}px`);
        m.style.setProperty('--sidenav-fold-edge', `${edge}px`);
      }
    }
  };

  /**
   * Open groups folding (or unfolding) with the width, on its clock: each
   * body's height, px, written every frame by the same tween (a CSS
   * transition would start on the frame's timeline, before the click's work,
   * and run ahead of the width).
   */
  let folds: Fold[] = [];
  const heightAt = (f: Fold, k: number) => f.from + (f.to - f.from) * k;
  /** The fold's soft edge at `k`, px: the disclosure's `min(16px, h, H − h)`. */
  const foldEdge = (f: Fold, k: number) => {
    const h = heightAt(f, k);
    return Math.max(0, Math.min(tokens.edge, h, f.open - h));
  };
  const writeFolds = (k: number) => {
    for (const f of folds) {
      f.el.style.setProperty('--sidenav-body-h', `${heightAt(f, k)}px`);
      f.clip?.style.setProperty('--sidenav-fold-edge', `${foldEdge(f, k)}px`);
    }
  };
  const clearFolds = () => {
    for (const f of folds) {
      f.el.removeAttribute('data-folding');
      f.el.style.removeProperty('--sidenav-body-h');
      f.clip?.style.removeProperty('--sidenav-fold-edge');
    }
    folds = [];
  };
  /**
   * The open groups' bodies, from their height now to folded (0) or unfolded
   * (their list's height); and `link`'s place in its group's clip (its top
   * from the clip's, and its height), so how much of it the folding clip
   * shows is arithmetic every frame. All read, then written.
   */
  const startFolds = (unfold: boolean, link: HTMLElement | null) => {
    clearFolds();
    const next = [
      ...nav.querySelectorAll<HTMLElement>(
        '.sidenav__group[data-open] > .sidenav__body'
      ),
    ].map((el) => {
      const list = el.querySelector<HTMLElement>('.sidenav__list--nested');
      const full = list?.offsetHeight ?? 0;
      const clip = el.querySelector<HTMLElement>(':scope > .sidenav__clip');
      return {
        el,
        clip,
        from: el.getBoundingClientRect().height,
        to: unfold ? full : 0,
        open: full,
      };
    });
    let place: { fold: Fold; top: number; height: number } | null = null;
    const fold = link && next.find((f) => f.el.contains(link));
    const clip = link?.closest('.sidenav__clip');
    if (link && fold && clip) {
      const r = link.getBoundingClientRect();
      place = {
        fold,
        top: r.top - clip.getBoundingClientRect().top,
        height: r.height,
      };
    }
    folds = next;
    for (const f of folds) f.el.setAttribute('data-folding', '');
    writeFolds(0);
    return place;
  };
  /** The current page's link, when it's inside an open group (null otherwise). */
  const groupCurrent = () =>
    nav.querySelector<HTMLElement>(
      '.sidenav__group[data-open] > .sidenav__body [aria-current="page"]'
    );

  /**
   * The labels' slide (expanding): one keyframe pair on one clock for every
   * label, its start set to the width's own (so it's where the width's tween
   * would put it, every frame). `slideAt` is where it is.
   */
  let slide: { x0: number; t0: number; ms: number; anims: Animation[] } | null =
    null;
  const slideAt = (now = performance.now()) =>
    slide ? slide.x0 * (1 - railEase(clamp01((now - slide.t0) / slide.ms))) : 0;
  const stopSlide = () => {
    for (const a of slide?.anims ?? []) a.cancel();
    slide = null;
  };
  const startSlide = (x0: number, t0: number, ms: number) => {
    stopSlide();
    if (Math.abs(x0) < 0.5) return;
    const x = `${x0 * tokens.dir}px 0`;
    const easing = cubicBezier([...RAIL_EASE]);
    const anims = [...track.querySelectorAll<HTMLElement>(SLIDING)].map(
      (el) => {
        const a = el.animate([{ translate: x }, { translate: '0px 0' }], {
          duration: ms,
          easing,
          id: SLIDE,
        });
        a.startTime = t0;
        return a;
      }
    );
    slide = { x0, t0, ms, anims };
  };
  /** Where a stopped move left the labels' slide, for the next move to start from. */
  let carried = 0;

  const ms = (token: DurationName) => {
    const o = opts();
    return Math.max(
      DURATION_FLOOR_MS,
      motionTokens.duration[token] * o.timeScale * reducedClock(o.reduced)
    );
  };
  const targets = () => {
    const o = opts();
    return {
      panel: o.expanded ? o.width : tokens.rail,
      layout: o.collapsed ? tokens.rail : o.width,
    };
  };
  const wait = (delay: number, fn: () => void) => {
    if (delay <= 0.5) return fn();
    timers.push(window.setTimeout(fn, delay));
  };
  const cancel = () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    frame = null;
    clearFolds();
    attr('sel-cut', null);
    writeCut(null);
    // A resize under way stops where it is (the next one starts from there).
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    finishResize = null;
    carried = slideAt();
    stopSlide();
    attr('resizing', null);
    tx?.end();
    tx = null;
  };

  /** The clocks the CSS reads (reduced motion's fades), in this nav's slow motion; written when they change. */
  let clocked = '';
  const clocks = () => {
    const o = opts();
    const out = `${ms('fast-02')}ms`;
    const into = `${ms('moderate-01')}ms`;
    const w = `${o.width}px`;
    if (`${out}|${into}|${w}` === clocked) return;
    clocked = `${out}|${into}|${w}`;
    nav.style.setProperty('--sidenav-out-ms', out);
    nav.style.setProperty('--sidenav-in-ms', into);
    nav.style.setProperty('--sidenav-expanded-w', w);
  };
  /** Before a move writes anything: its tokens and its readers. */
  const prepare = () => {
    readTokens();
    findReaders();
    clocks();
  };

  /**
   * Resize to `to` as one layout transaction — the width on its clock, and
   * (expanding) the labels' slide on a clock one step longer — then `done`.
   */
  const resize = (
    to: { panel: number; layout: number },
    collapsing: boolean,
    done: () => void,
    landed?: () => void
  ) => {
    const from = { ...live };
    const travel = Math.max(
      Math.abs(to.panel - from.panel),
      Math.abs(to.layout - from.layout)
    );
    const o = opts();
    const fromX = carried;
    carried = 0;
    if (travel < 0.5 && Math.abs(fromX) < 0.5) {
      live = { ...to };
      write();
      landed?.();
      return done();
    }
    let token = durationStepForDistance(travel) as DurationName;
    // An exit leaves one step faster than an entrance arrives.
    if (collapsing) token = stepDown(token) as DurationName;
    const widthMs = Math.max(
      DURATION_FLOOR_MS,
      motionTokens.duration[token] * o.timeScale
    );
    // Expanding, the labels come in from the start side on the longer clock
    // (a turn mid-collapse starts them where they are: at rest).
    const contentMs = collapsing
      ? widthMs
      : Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[stepUp(token)] * o.timeScale
        );
    const x0 = collapsing
      ? fromX
      : fromX !== 0
        ? fromX
        : travel > 0.5 && nav.hasAttribute('data-rail-was')
          ? -tokens.slide
          : 0;
    nav.removeAttribute('data-rail-was');
    const total = Math.max(widthMs, contentMs);
    edgeTarget = to.panel;
    const t0 = performance.now();
    // The first frame already has its edge and the labels' start.
    startSlide(x0, t0, contentMs);
    write(0);
    attr('resizing', '');
    const mine = beginLayout(layoutRootOf(nav), {
      ms: widthMs,
      easing: RAIL_EASE,
      lead: track,
      reason: collapsing ? 'side-nav-collapse' : 'side-nav-expand',
      reduced: false,
    });
    tx = mine;
    let widthDone = false;
    const endWidth = () => {
      if (widthDone) return;
      widthDone = true;
      if (tx === mine) tx = null;
      mine.end();
      landed?.();
    };
    const finish = () => {
      if (finishResize !== finish) return;
      finishResize = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      live = { ...to };
      writeFolds(1);
      write(1);
      clearFolds();
      stopSlide();
      attr('resizing', null);
      endWidth();
      done();
    };
    finishResize = finish;
    const tick = (now: number) => {
      raf = 0;
      const pw = clamp01((now - t0) / widthMs);
      const pc = clamp01((now - t0) / contentMs);
      const k = railEase(pw);
      live = {
        panel: from.panel + (to.panel - from.panel) * k,
        layout: from.layout + (to.layout - from.layout) * k,
      };
      writeFolds(k);
      write(k);
      // The layout lands with the width; the labels may still be sliding.
      if (pw >= 1) endWidth();
      if (pw >= 1 && pc >= 1) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // A hidden tab never ticks: land on a task just after the clock.
    wait(total + 50, () => finishResize === finish && finish());
  };

  /** Focus inside a group about to fold goes to its header (its links are about to be inert). */
  const keepFocus = () => {
    const a = document.activeElement;
    if (!(a instanceof HTMLElement) || !nav.contains(a)) return;
    const body = a.closest('.sidenav__body');
    body?.parentElement
      ?.querySelector<HTMLElement>(':scope > .sidenav__header')
      ?.focus({ preventScroll: true });
  };

  const go = () => {
    cancel();
    prepare();
    const o = opts();
    const to = targets();
    if (o.reduced) {
      carried = 0;
      // No travel: the labels fade out before the rail, in after the expanded panel.
      if (o.expanded) {
        live = { ...to };
        write();
        attr('tree', 'hidden');
        attr('rail', null);
        attr('folded', null);
        void nav.offsetWidth;
        attr('tree', 'shown');
        o.onRailish(false);
        return;
      }
      o.onRailish(true);
      keepFocus();
      const out =
        nav.getAttribute('data-tree') === 'hidden' ? 0 : ms('fast-02');
      attr('tree', 'hidden');
      wait(out, () => {
        live = { ...to };
        write();
        attr('rail', '');
        attr('folded', '');
      });
      return;
    }
    attr('tree', 'shown');
    if (o.expanded) {
      // The labels are laid out again (clipped by the edge), groups unfold on the width's clock.
      if (nav.hasAttribute('data-rail')) nav.setAttribute('data-rail-was', '');
      // Set data-resizing before removing data-rail / data-folded so the
      // soft-edge mask is in place for the first frame — prevents a one-frame
      // flash where the full-width rows show unclipped.
      attr('resizing', '');
      attr('rail', null);
      // The selector comes with the width: at once for a top-level page; for
      // a page in an open group, the frame its row is revealed (at the latest
      // when the width lands).
      const link = groupCurrent();
      const place = startFolds(true, link);
      attr('folded', null);
      let arrived = false;
      const arrive = () => {
        if (arrived) return;
        arrived = true;
        frame = null;
        attr('sel-gone', null);
        opts().onRailish(false);
      };
      if (!link) arrive();
      else if (place)
        frame = (k) =>
          heightAt(place.fold, k) - place.top >= place.height - 0.5 && arrive();
      resize(to, false, () => {}, arrive);
      return;
    }
    keepFocus();
    // A current page in an open group keeps its selector while the group
    // folds, clipped at the group's soft edge, and it's gone at the end;
    // otherwise the rail's state (the bar, the flyouts) starts now.
    const link = nav.querySelector<HTMLElement>(
      '.sidenav__group[data-open] > .sidenav__body [aria-current="page"][data-selected]'
    );
    const place = startFolds(false, link);
    attr('folded', '');
    if (link && place) {
      attr('sel-cut', '');
      frame = (k) =>
        writeCut(
          Math.max(0, heightAt(place.fold, k) - place.top),
          foldEdge(place.fold, k)
        );
    } else o.onRailish(true);
    resize(to, true, () => {
      frame = null;
      attr('rail', '');
      if (link && place) {
        attr('sel-gone', '');
        attr('sel-cut', null);
        writeCut(null);
        opts().onRailish(true);
      }
    });
  };

  const place = () => {
    cancel();
    carried = 0;
    prepare();
    const o = opts();
    live = { ...targets() };
    edgeTarget = live.panel;
    write();
    attr('tree', 'shown');
    attr('sel-gone', null);
    attr('rail', o.expanded ? null : '');
    attr('folded', o.expanded ? null : '');
    o.onRailish(!o.expanded);
  };

  return {
    go,
    place,
    destroy: () => {
      cancel();
      for (const a of [
        'tree',
        'rail',
        'folded',
        'resizing',
        'overlay',
        'rail-was',
        'sel-cut',
        'sel-gone',
      ])
        attr(a, null);
      nav.style.removeProperty('inline-size');
      track.style.removeProperty('inline-size');
      for (const el of edges) el.style.removeProperty('--sidenav-edge-w');
      for (const p of [
        '--sidenav-expanded-w',
        '--sidenav-out-ms',
        '--sidenav-in-ms',
      ])
        nav.style.removeProperty(p);
      clocked = '';
    },
  };
}

/* ── SideNav ───────────────────────────────────────────────────────────── */

export interface SideNavProps
  extends
    HTMLAttributes<HTMLElement>,
    Omit<SelectionStyleProps, 'size' | 'variant' | 'outline'> {
  /** The nav's accessible name. */
  'aria-label': string;
  /** `SideNavLink`s and `SideNavGroup`s. */
  children?: ReactNode;
  /** Row size: `sm` (26px rows) / `md` (32px rows, default) / `lg` (40px rows) — the kit's row scale. Unset, a `KitDefaults` density's: compact sm, default md, spacious lg. */
  size?: SideNavSize;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `inverse` (default) / `tonal` / `outlined`: the kit's selector styles; `hero` the brand blue, for a nav that is the page's one emphasized control. */
  variant?: SideNavVariant;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /**
   * `inset` (default; `ghost` in a framed Region): a rounded panel, its rows inset, with a hairline
   * just outside it. `flush`: the column itself, full height, its rows
   * square and stacked edge to edge, a rule on its inline-end edge (v11's).
   * `ghost`: no panel; an open group is a container grown out of its
   * header's hover.
   */
  frame?: SideNavFrame;
  /** Motion dials; omitted keys take `SIDE_NAV_MOTION`, and `stretch` the track's length. */
  motion?: Partial<SideNavMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called as each glide starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
  /**
   * While true, the nav's changes snap: groups open and shut at once, and the
   * selector arrives and leaves at once (a link coming or going, a group
   * opening). A move to a new page still glides. For a list that changes as
   * someone types, as a filter does. Default false.
   */
  still?: boolean;
  /**
   * How the selector moves to a page in another group: `jump` (default)
   * shrinks 4px and is gone from the old link, then comes in at the new one
   * from 4px small, with no fade, on the glide's shortest clock; `glide` travels there, not shown over the
   * headers it passes. Within a group it always glides.
   */
  crossGroup?: SideNavCrossGroup;
  /**
   * The nav folds to a rail of icons: a toggle at its foot, the lower start (in an
   * AppShell the shell draws it instead), and an
   * explicit width. Default: true when `collapsed`, `defaultCollapsed`,
   * `onCollapsedChange` or `expandOnHover` is given.
   */
  collapsible?: boolean;
  /** Controlled: folded to the rail. */
  collapsed?: boolean;
  /** Uncontrolled: start folded. Default false. */
  defaultCollapsed?: boolean;
  /** The toggle row (or the hover expansion's docking) asks to change it. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * The rail expands over the page (not pushing it) while the pointer rests
   * on it, after a short intent delay, and folds again when it leaves; the
   * toggle's state is unaffected. Default false.
   */
  expandOnHover?: boolean;
  /** A collapsible nav's expanded width, px. Default 256 for `flush` (v11's), 240 otherwise. */
  expandedWidth?: number;
  /**
   * One group open at a time: opening one shuts the others, as one motion
   * (both on one clock, starting in the same frame). On mount, the last open
   * group in tree order stays open and the others shut. A controlled group
   * whose parent ignores `onOpenChange(false)` stays open beside the new
   * one, and is asked again at the next opening. Default true for `ghost`,
   * false otherwise.
   */
  exclusive?: boolean;
  /**
   * A filter pinned at the top of the panel that narrows the nav to the
   * links matching what's typed (their labels and `keywords`; a group's
   * title keeps all its links), with a count for assistive tech, `/` to
   * focus it and ↓ / ↑ / Enter. `true` takes the defaults ("Filter pages");
   * an object sets the words, the query (`value` / `defaultValue` /
   * `onChange`), `onEscape` and the shortcut (filter.tsx). While there's a
   * query the nav is `still` and one group isn't `exclusive` of the others.
   */
  filter?: boolean | SideNavFilterOptions;
  /**
   * `frame="ghost"`: the open container casts the kit's cast shadow, lit
   * from the pointer. The floating surfaces' option: `false` none; `true`
   * or an elevation, on (the ghost container has one elevation of its own).
   * Default: the kit's (`KitDefaults shadow`, none).
   */
  shadow?: SurfaceShadowOption;
}

export function SideNav({
  children: childrenProp,
  size: sizeProp,
  variant,
  frame: frameProp,
  lowContrast,
  corners,
  interaction,
  contour,
  outlinedFill,
  selectorGlow,
  selectedWeight,
  holdWidth = true,
  motion: motionProp,
  timeScale,
  onMove,
  still: stillProp = false,
  crossGroup = 'jump',
  collapsible: collapsibleProp,
  collapsed: collapsedProp,
  defaultCollapsed,
  onCollapsedChange,
  expandOnHover = false,
  expandedWidth,
  exclusive: exclusiveProp,
  shadow,
  filter,
  className,
  onPointerEnter: onPointerEnterProp,
  onPointerLeave: onPointerLeaveProp,
  ...rest
}: SideNavProps) {
  // A Region's default (inset on the page, ghost in a framed region) when none is given.
  const frame = useDefaultFrame(frameProp, SIDE_NAV_FRAMES, 'inset');
  // KitDefaults: the provider's density through the row scale when no `size` is given.
  const { size = 'md' } = useKitProps({ size: sizeProp }, ROW_KIT);
  const motion = useWithTimeScale(motionProp, timeScale);
  const ghostShadow = !!useSurfaceShadow(shadow);
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // The filter (`filter`): its field, and the children it narrows.
  const filtered = useSideNavFilter(
    childrenProp,
    filter,
    navRef,
    size,
    { link: SideNavLink, group: SideNavGroup },
    // The rows' corners (a container's are square): the field's follow them.
    frame === 'flush' ? 'square' : corners,
    // A ghost nav's field is ghost too.
    frame === 'ghost' ? 'ghost' : undefined
  );
  const children = filtered.children;
  const still = stillProp || filtered.still;
  const reduced = usePrefersReducedMotion();
  const reducedRef = useLatest(reduced);

  const m = useMemo<SideNavMotion>(
    () => ({ ...SIDE_NAV_MOTION, ...motion }),
    [motion]
  );
  const mRef = useLatest(m);
  const stretchProp = useLatest(motion?.stretch);

  const style = resolveSelectionStyle(
    // A container's rows are square.
    {
      variant,
      lowContrast,
      size,
      corners: frame === 'flush' ? 'square' : corners,
      // Ghost has no track for a hover to step from toward the selection
      // (the rows sit on the page, and an open group's rows on its
      // container, whose fill is a hover's own): its rows always step by
      // matched lightness, off whatever they sit on.
      interaction: frame === 'ghost' ? 'lightness' : interaction,
      contour,
      outlinedFill,
      selectorGlow,
      selectedWeight,
      orientation: 'vertical',
    },
    m
  );

  const layoutKey = `${size}/${frame}/${style.variant}/${Children.count(children)}`;
  const selRef = useSelectionEngine({
    rootRef,
    itemSelector: ITEM,
    motion: m,
    reduced,
    onMove,
    // The nav places its selector itself (`sync`): it can have none.
    getRest: () => null,
    layoutKey,
  });

  /* ── the selector: on whatever is marked ─────────────────────────────── */

  // Mounting: the first mark is simply there, never an entrance. The track
  // is `data-still` until then, and again while `still` (the disclosure, the
  // bar and the ghost's container read it): set as the commit is, so a
  // group's own layout effect in the same commit already sees it.
  const mounting = useRef(true);
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    mounting.current = true;
    const t = window.setTimeout(() => {
      mounting.current = false;
      setAwake(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const stillRef = useLatest(still);

  /** A press reached toward a link and let go: until a mark moves, the selector still leans. */
  const leaning = useRef(false);
  const placedFor = useRef<Selection | null>(null);
  /** The pass (passMask) ends when the glide lands. */
  const passTimer = useRef(0);
  const crossGroupRef = useLatest(crossGroup);
  const ghostFrameRef = useLatest(frame === 'ghost');
  /** `sync`, for the jump's out to call when it's done (it ends after the commit that started it). */
  const syncRef = useRef<() => void>(() => {});
  /**
   * The selection kit's jump (`crossGroup="jump"`, selection-kit/jump.ts):
   * out, then in, between groups. It also holds the current page's row's
   * hover round the selector until the selector lands on it, a glide's as a
   * jump's (`data-landing`).
   */
  const jump = useSelectionJump({
    root: () => rootRef.current,
    sel: () => selRef.current,
    motion: () => mRef.current,
    reduced: () => reducedRef.current,
  });

  /**
   * The leading edge's head start from the track's length (lengthMotion),
   * set as a move starts (it's only read then), from `length` read before
   * anything is written: not state fed by an observer, which would re-render
   * the nav every frame the rail moves.
   */
  const applyStretch = useCallback(
    (length: number) => {
      selRef.current?.configure({
        stretch: stretchProp.current ?? Math.round(stretchForLength(length)),
      });
    },
    [selRef, stretchProp]
  );

  const sync = useCallback(() => {
    const root = rootRef.current;
    const sel = selRef.current;
    if (!root || !sel) return;
    const page = root.querySelector('[aria-current="page"]');
    const length = trackLength(root);
    sel.measure();
    const el = root.querySelector<HTMLElement>(`${ITEM}[data-selected]`);
    // A new engine (a remount, StrictMode's) places at once again.
    const first = placedFor.current !== sel;
    placedFor.current = sel;
    if (!el) {
      // Ghost: the current page is in a group still opening (marked once it
      // has landed), the swap shutting the one the selector is in. A jump:
      // the out now, from where the selector is; the in once the group has
      // opened, at the page's place then. Until then the in waits, as it
      // waits for the out. (Inset and flush keep their leave and arrival for
      // a page in a shut group: there the other groups stay open, and a
      // move between groups is a jump between open ones.)
      const opening =
        page?.matches(ITEM) && page.closest('.sidenav__group[data-open]')
          ? page
          : null;
      if (
        opening &&
        ghostFrameRef.current &&
        !stillRef.current &&
        crossGroupRef.current === 'jump'
      ) {
        if (jump.leaving() || jump.arriving()) return;
        const from = sel.shown() ? sel.target() : null;
        if (from && from !== opening && betweenGroups(root, from, opening)) {
          window.clearTimeout(passTimer.current);
          endPass(root);
          leaning.current = false;
          jump.leave(opening, () => syncRef.current());
          return;
        }
      }
      jump.clear();
      if (sel.shown()) {
        // The current page's group shut: the selector goes with its row,
        // at once (its exit, played at the row's old place, would hang over the
        // rows moving under it). Any other leaving (a page not in the nav, its
        // link gone) snaps out. While `still`, the leave is over at once.
        if (page?.closest('.sidenav__group:not([data-open])'))
          root.dataset.selFolded = '';
        sel.hide();
        if (stillRef.current)
          for (const ind of indicatorsOf(root))
            for (const a of ind.getAnimations()) a.finish();
      }
      return;
    }
    // A page in the rail's own rows after the selector folded away with its group:
    // it arrives there, not from the group's old box, where it hides.
    const nav = root.closest<HTMLElement>('.sidenav');
    if (nav?.hasAttribute('data-sel-gone') && !el.closest('.sidenav__body')) {
      nav.removeAttribute('data-sel-gone');
      sel.hide();
    }
    /** The selector went with its row as the page's group shut (and hasn't been back). */
    const folded = root.dataset.selFolded !== undefined;
    delete root.dataset.selFolded;
    // A jump's out under way: the in waits for it (out, then in), and plays
    // at whatever is current when it's done.
    if (jump.leaving()) return;
    if (!sel.shown()) {
      const instant = mounting.current || first || stillRef.current;
      const from = sel.target();
      leaning.current = false;
      // The jump's in: the kit's arrival, from JUMP_IN_SHRINK small, on its share of the jump's clock.
      if (jump.arriving() && !instant) jump.arrive(el);
      // To a page in another group with the selector already gone with its
      // own (it folded away as the person opened this group: ghost, one
      // group open): the jump all the same, its out the hover's alone.
      else if (
        !instant &&
        folded &&
        from &&
        from !== el &&
        crossGroupRef.current === 'jump' &&
        betweenGroups(root, from, el)
      ) {
        jump.leave(el, () => syncRef.current());
        return;
      } else sel.show(el, instant ? { instant: true } : undefined);
      jump.clear();
      return;
    }
    jump.clear();
    const from = sel.target();
    if (
      from !== el &&
      from &&
      crossGroupRef.current === 'jump' &&
      betweenGroups(root, from, el)
    ) {
      window.clearTimeout(passTimer.current);
      endPass(root);
      leaning.current = false;
      // The jump's out: the kit's leave, from where the selector is (its
      // reach, if a press leaned it), JUMP_OUT_SHRINK small, with no fade
      // (no fades for the selectors). Its row
      // keeps its selected face under it, and the new row its hover
      // (`data-landing`), until the cut; then the in, from `sync`. Reduced:
      // no size change and no fade, the selector is there at once.
      jump.leave(el, () => syncRef.current());
      return;
    }
    if (from !== el) {
      // Every read (the bands, the track's height) before the glide writes.
      const pass = reducedRef.current ? null : passMask(root, sel);
      applyStretch(length);
      const ms = sel.moveTo(el);
      // The clicked row keeps its hover until the selector arrives on it, as on a jump.
      if (ms > 0) jump.hold();
      leaning.current = false;
      window.clearTimeout(passTimer.current);
      if (pass && ms > 0) {
        for (const ind of indicatorsOf(root)) {
          ind.style.setProperty('--sidenav-pass-mask', pass.mask);
          ind.style.setProperty('--sidenav-pass-h', `${pass.height}px`);
        }
        root.dataset.passing = '';
        passTimer.current = window.setTimeout(() => endPass(root), ms + 34);
      } else endPass(root);
    }
  }, [
    selRef,
    reducedRef,
    applyStretch,
    crossGroupRef,
    ghostFrameRef,
    stillRef,
    jump,
  ]);
  useLayoutEffect(() => {
    syncRef.current = sync;
  }, [sync]);
  useEffect(() => () => window.clearTimeout(passTimer.current), []);

  // Neither depends on the page: a label's width and an icon's place don't
  // change with which page is current. Rows that come or go (or change their
  // label) are held and snapped again from `requestSync` (below), wherever
  // they are: a group's rows don't change the nav's own children.
  const reholdWeight = useSelectedWeight(rootRef, {
    weight: style.selectedWeight,
    holdWidth,
    itemSelector: ITEM,
    key: layoutKey,
  });
  // The icons, and the group's bar (whole layout px in its row, side-nav.scss; this the row's own fraction).
  const resnapIcons = useIconPixelSnap(
    rootRef,
    '.sel__face svg, .sidenav__marker',
    layoutKey
  );

  /*
   * One `sync` per commit. Links and groups ask (`requestSync`) from their
   * layout effects as their marks move; the nav's own layout effect runs
   * after theirs and places the selector once. A commit the nav isn't part
   * of (a group's own update, a link's) is flushed from a microtask, still
   * before paint. A render of the nav that changes nothing measures nothing:
   * the nav asks on its own only when its layout key changes.
   */
  const dirty = useRef(false);
  const rowsDirty = useRef(false);
  const queued = useRef(false);
  const flush = useCallback(() => {
    // A new engine (a remount, StrictMode's) is placed again.
    if (selRef.current && placedFor.current !== selRef.current)
      dirty.current = true;
    if (!dirty.current || !selRef.current) return;
    dirty.current = false;
    sync();
    if (!rowsDirty.current) return;
    rowsDirty.current = false;
    reholdWeight();
    resnapIcons();
  }, [selRef, sync, reholdWeight, resnapIcons]);
  const requestSync = useCallback(
    (rows?: boolean) => {
      dirty.current = true;
      if (rows) rowsDirty.current = true;
      if (queued.current) return;
      queued.current = true;
      queueMicrotask(() => {
        queued.current = false;
        flush();
      });
    },
    [flush]
  );
  const syncedKey = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (syncedKey.current !== layoutKey) {
      syncedKey.current = layoutKey;
      dirty.current = true;
    }
    flush();
  });

  // Ghost: the open container's cast shadow, lit from the pointer.
  const ghost = frame === 'ghost';
  const timeScaleRef = useLatest(m.timeScale);
  useEffect(() => {
    const track = rootRef.current;
    if (!ghost || !ghostShadow || !track) return;
    return attachGhostLight(track, () =>
      reducedRef.current
        ? 0
        : motionTokens.duration['moderate-01'] * timeScaleRef.current
    );
  }, [ghost, ghostShadow, reducedRef, timeScaleRef]);

  /* ── hover, press ──────────────────────────────────────────────────── */

  useItemRollover(rootRef, {
    // Every enabled row (the selector glows under the pointer on the current page).
    selector: style.selectorGlow
      ? `${ITEM}:not([aria-disabled="true"])`
      : `${ITEM}:not([data-selected]):not([aria-disabled="true"])`,
    itemSelector: ITEM,
    press: m.pressColor,
    preview: style.preview,
    timeScale: m.timeScale,
    reduced: reducedRef,
    steps: frame === 'ghost' ? ghostSteps : undefined,
  });

  /** The links in order, a shut group's current link standing in for its header (where the selector rests). */
  const links = useCallback((): HTMLElement[] => {
    const root = rootRef.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>(LINK)].map((el) => {
      if (
        el.getAttribute('aria-current') !== 'page' ||
        el.hasAttribute('data-selected')
      )
        return el;
      return (
        el
          .closest('.sidenav__group')
          ?.querySelector<HTMLElement>(
            ':scope > .sidenav__header[data-selected]'
          ) ?? el
      );
    });
  }, []);
  /** A link the pointer can't reach: disabled, or inside a shut group. */
  const unreachable = (el: HTMLElement | undefined) =>
    !el ||
    !el.matches(LINK) ||
    el.getAttribute('aria-disabled') === 'true' ||
    !!el.closest('[inert]');

  const pressed = useRef<HTMLElement | null>(null);
  const { onPointerDown: gestureDown } = useSelectionGesture({
    rootRef,
    selRef,
    axis: 'y',
    items: links,
    // The gesture hands over the item it already has: no list per item (that would be O(n²) a move).
    isDisabled: (i, el) =>
      unreachable(el === undefined ? links()[i] : (el ?? undefined)),
    selected: () => links().findIndex((el) => el.hasAttribute('data-selected')),
    motion: () => mRef.current,
    commit: (i) => {
      const el = links()[i];
      if (!el) return;
      leaning.current = true;
      // Released on another link than the one pressed (a slide): the click
      // goes to neither, so follow that link here. Released on the pressed
      // link, its own click follows it.
      if (el !== pressed.current) el.click();
    },
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // A modified click opens elsewhere (a new tab, a download): no reach.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = (e.target as Element).closest<HTMLElement>(LINK);
    pressed.current = el;
    if (!el) return;
    // The reach and any glide the press leads to take the head start for the track's length now.
    if (rootRef.current) applyStretch(trackLength(rootRef.current));
    gestureDown(e, LINK);
  };

  // After a click: if the page didn't change (an external link, a link to
  // this page, a prevented one), the selector stops leaning and goes home.
  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const link = (e.target as Element).closest<HTMLElement>(LINK);
    if (!link) return;
    // A click that navigates in place: the new page can take a moment (a page
    // loaded on demand), and sending the selector home meanwhile made the
    // reach contract before the glide. It keeps leaning until the page
    // changes (`sync` ends the lean), or a second passes. Anything else —
    // this page, a disabled link, another tab or site — goes home at once.
    // (Not `defaultPrevented`: a router link prevents the browser's
    // navigation to make its own.)
    const anchor = link as HTMLAnchorElement;
    const navigates =
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      link.getAttribute('aria-current') !== 'page' &&
      link.getAttribute('aria-disabled') !== 'true' &&
      !!anchor.href &&
      (!anchor.target || anchor.target === '_self') &&
      new URL(anchor.href, location.href).origin === location.origin;
    // One wait at a time: a later click's wait replaces an earlier one's.
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(
      () => {
        if (!leaning.current) return;
        leaning.current = false;
        const sel = selRef.current;
        const root = rootRef.current;
        const home = root?.querySelector(`${ITEM}[data-selected]`);
        if (!sel || !root || !home) return;
        applyStretch(trackLength(root));
        sel.moveTo(home);
      },
      navigates ? 1000 : 0
    );
  };
  const clickTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(clickTimer.current), []);

  /* ── keyboard: the standard nav's — every link and group header is a tab
     stop in reading order (links in a shut group are inert, so skipped);
     Enter follows a link, Enter / Space toggles a group. Rings keyboard-only. */

  /* ── the tooltip: a label cut short (or a short form with a full name in
     `data-tooltip`) shows in full, on hover or keyboard
     focus (v11 does this too), the kit's snap. Fixed, so it escapes the
     column's scroller. ───────────────────────────────────────────────── */

  const tipElRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<TooltipController | null>(null);
  useEffect(() => {
    if (!tipElRef.current) return;
    const t = createTooltip(tipElRef.current, {
      reduced: () => reducedRef.current,
      strategy: 'fixed',
    });
    tipRef.current = t;
    return () => {
      t.destroy();
      tipRef.current = null;
    };
  }, [reducedRef]);
  // Slow motion reaches the tooltip too.
  useEffect(() => {
    tipRef.current?.configure({ timeScale: m.timeScale });
  }, [m.timeScale]);

  /** The row's full label when it's cut short, else null. */
  const truncated = (row: HTMLElement): string | null => {
    const text = row.querySelector<HTMLElement>(
      '.sel__face:not(.sel__face--on) .sel__text'
    );
    return text && text.scrollWidth > text.clientWidth + 0.5
      ? (text.textContent ?? '').trim()
      : null;
  };

  /* ── the rail ────────────────────────────────────────────────────────── */

  const wantsRail =
    collapsibleProp ??
    (collapsedProp !== undefined ||
      defaultCollapsed !== undefined ||
      onCollapsedChange !== undefined ||
      expandOnHover);
  // No rail without an icon on every top-level row: no toggle, never collapsed.
  const missingIcons = wantsRail ? topRowsWithoutIcon(children) : [];
  const collapsible = wantsRail && missingIcons.length === 0;
  const missingKey = missingIcons.join('\u0000');
  useEffect(() => {
    if (IN_DEVELOPMENT && missingKey) {
      console.warn(
        `SideNav "${rest['aria-label']}": no rail (collapsed navigation needs an icon on every top-level row). Rows without one: ${missingKey.split('\u0000').join(', ')}`
      );
    }
    // Warn when the set of rows without icons changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey]);
  const [ownCollapsed, setOwnCollapsed] = useState(defaultCollapsed ?? false);
  const collapsed = collapsible && (collapsedProp ?? ownCollapsed);
  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setOwnCollapsed(next);
    onCollapsedChange?.(next);
  };

  // Expanded over the page while the pointer rests on the rail (`expandOnHover`).
  const [hoverOpen, setHoverOpen] = useState(false);
  if (hoverOpen && (!collapsed || !expandOnHover)) setHoverOpen(false);
  const expanded = !collapsed || hoverOpen;
  const expandedRef = useLatest(expanded);
  const hoverTimer = useRef(0);
  /** Folded from the toggle with the pointer still on the nav: no hover expansion until it leaves. */
  const hoverSuppressed = useRef(false);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const width = expandedWidth ?? (frame === 'flush' ? 256 : 240);
  const [railish, setRailish] = useState(collapsible && !expanded);
  const railOpts = useLatest<RailOptions>({
    collapsed,
    expanded,
    width,
    timeScale: m.timeScale,
    reduced,
    onRailish: setRailish,
  });
  const railRef = useRef<RailController | null>(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const track = rootRef.current;
    if (!collapsible || !nav || !track) return;
    const rail = createRail(nav, track, () => railOpts.current);
    railRef.current = rail;
    rail.place();
    return () => {
      rail.destroy();
      railRef.current = null;
    };
  }, [collapsible, railOpts]);
  // A change of state animates; a change of width or size at rest places at once.
  const railState = useRef({ collapsed, expanded });
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const was = railState.current;
    railState.current = { collapsed, expanded };
    if (was.collapsed !== collapsed || was.expanded !== expanded) {
      tipRef.current?.hide(true);
      rail.go();
    }
  }, [collapsed, expanded]);
  useLayoutEffect(() => {
    railRef.current?.place();
  }, [width, size, frame]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    // Folding from the toggle under the pointer: stay folded until it leaves.
    if (next) hoverSuppressed.current = true;
    setHoverOpen(false);
    setCollapsed(next);
  };

  const onNavPointerEnter = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerEnterProp?.(e);
    window.clearTimeout(hoverTimer.current);
    if (
      !expandOnHover ||
      !collapsed ||
      e.pointerType === 'touch' ||
      hoverSuppressed.current
    )
      return;
    if (hoverOpen) return;
    hoverTimer.current = window.setTimeout(() => {
      setFlyOpen(false);
      setHoverOpen(true);
    }, HOVER_EXPAND_MS);
  };
  const onNavPointerLeave = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerLeaveProp?.(e);
    window.clearTimeout(hoverTimer.current);
    hoverSuppressed.current = false;
    if (hoverOpen)
      hoverTimer.current = window.setTimeout(
        () => setHoverOpen(false),
        HOVER_COLLAPSE_MS
      );
  };

  /* ── the rail's group flyout: the Menu, beside the group's icon ──────── */

  const [fly, setFly] = useState<
    (FlyoutRequest & { place: FlyoutPlace }) | null
  >(null);
  const [flyOpen, setFlyOpen] = useState(false);
  if (flyOpen && !railish) setFlyOpen(false);
  const flyId = `sidenav-flyout-${useId().replace(/:/g, '')}`;
  const flyClosedAt = useRef<{ group: string; at: number } | null>(null);
  const flyRef = useLatest({ fly, flyOpen });
  const toggleFlyout = useCallback(
    (req: FlyoutRequest) => {
      tipRef.current?.hide(true);
      const { fly: cur, flyOpen: isOpen } = flyRef.current;
      if (isOpen && cur?.group === req.group) {
        setFlyOpen(false);
        return;
      }
      // Beside the panel, its first row level with the header (a submenu's
      // placement), flipping when there's no room.
      const a = req.anchor.getBoundingClientRect();
      const t = (rootRef.current ?? req.anchor).getBoundingClientRect();
      const inset =
        parseFloat(
          getComputedStyle(req.anchor).getPropertyValue('--sel-inset')
        ) || 4;
      setFly({
        ...req,
        place: {
          x: [t.right + 4, t.left - 4],
          y: [a.bottom + inset, a.top - inset],
          origin: req.pointer ?? { x: a.right, y: (a.top + a.bottom) / 2 },
        },
      });
      setFlyOpen(true);
    },
    [flyRef]
  );
  const pressClosedFlyout = useCallback((group: string) => {
    const c = flyClosedAt.current;
    return !!c && c.group === group && performance.now() - c.at < 300;
  }, []);
  const closeFlyout = () => {
    if (fly) flyClosedAt.current = { group: fly.group, at: performance.now() };
    setFlyOpen(false);
  };

  /* ── the tooltip's text: in the rail every row shows its label ───────── */

  const label = (row: HTMLElement) =>
    (
      row.querySelector<HTMLElement>(
        '.sel__face:not(.sel__face--on) .sel__text'
      )?.textContent ?? ''
    ).trim() || null;
  const inRail = () =>
    !!navRef.current?.hasAttribute('data-rail') && !expandedRef.current;

  const showTip = (
    row: HTMLElement | null,
    pointer: { x: number; y: number } | null
  ) => {
    // In the rail: the row's label (its open flyout says it already). Otherwise
    // `data-tooltip`, a link whose label is a short form, shows its full name.
    const rail = !!row && inRail();
    const text =
      row &&
      (rail
        ? row.getAttribute('aria-expanded') === 'true' &&
          row.hasAttribute('aria-haspopup')
          ? null
          : row.dataset.tooltip || label(row)
        : row.dataset.tooltip || truncated(row));
    if (!row || !text) return tipRef.current?.hide(pointer == null, pointer);
    const r = row.getBoundingClientRect();
    tipRef.current?.show({
      key: row.id || text,
      text,
      anchor: { l: r.left, t: r.top, r: r.right, b: r.bottom },
      align: 'right',
      pointer,
    });
  };

  const onPointerOver = (e: ReactPointerEvent<HTMLDivElement>) => {
    showTip((e.target as Element).closest<HTMLElement>(ITEM), {
      x: e.clientX,
      y: e.clientY,
    });
  };
  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    tipRef.current?.hide(false, { x: e.clientX, y: e.clientY });
  };
  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    const row = (e.target as Element).closest<HTMLElement>(ITEM);
    if (row?.matches(':focus-visible')) showTip(row, null);
  };
  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null))
      tipRef.current?.hide(true);
  };

  /* ── render ──────────────────────────────────────────────────────────── */

  const iconColumn = hasTopIcon(children);
  // While filtering, every group with a match is open.
  const exclusive = (exclusiveProp ?? frame === 'ghost') && !filtered.filtering;

  /*
   * A group opening or shutting is the kit's disclosure (`../disclosure`,
   * the one implementation of the expanding standards): its clock is its travel's step, shutting one step
   * faster, and its links come down 8px from the opening's first frame.
   * Every group moving in one commit is one motion on one clock, and one
   * layout transaction on the nav, so the selection, the rollover and the
   * icon snap hold while it moves and settle once everything has landed (a
   * later move turns it, on the clock that lands last).
   *
   * THE SWAP: opening a ghost container and shutting another feel like one
   * fluid ease. With
   * `exclusive`, the group that opens and the one it shuts are one motion:
   * both start in the same frame (the shut comes from the opening's layout
   * effect, before paint), so the rows between and below them move once,
   * together, on the larger travel's step and standard-productive (one
   * thing grows while another shrinks within the nav, a move within the
   * view). `data-swap` on the nav puts ghost's containers and shadows on
   * standard too (side-nav.scss); ghost's container edges, shadows and the
   * gap's margin take the motion's clock as it starts (`retimeGhost`).
   */
  const ghostRef = useLatest(frame === 'ghost');
  const moves = useDisclosureMoves(navRef, {
    reason: 'side-nav-group',
    onEnd: () => {
      delete navRef.current?.dataset.swap;
    },
    onTimed: (clock) => {
      if (ghostRef.current && navRef.current)
        retimeGhost(navRef.current, clock);
    },
  });
  const railishRef = useLatest(collapsible && railish);
  const [leads] = useState(createLeads);
  // After every group has claimed on mount: the last open one stays open (createLeads).
  useLayoutEffect(
    () =>
      leads.settle(() => {
        const nav = navRef.current;
        if (nav && !reducedRef.current && !railishRef.current)
          nav.dataset.swap = '';
      }),
    [leads, reducedRef, railishRef]
  );

  const ctx = useMemo<NavContextValue>(
    () => ({
      requestSync,
      iconColumn,
      weight: style.selectedWeight,
      exclusive,
      ghost,
      ghostShadow,
      resnapIcons,
      reholdWeight,
      leads,
      moves,
      toggleFlyout,
      pressClosedFlyout,
    }),
    [
      requestSync,
      iconColumn,
      style.selectedWeight,
      exclusive,
      ghost,
      ghostShadow,
      resnapIcons,
      reholdWeight,
      leads,
      moves,
      toggleFlyout,
      pressClosedFlyout,
    ]
  );
  const flyoutGroup = flyOpen ? (fly?.group ?? null) : null;
  const navState = useMemo<NavStateValue>(
    () => ({ railish: collapsible && railish, flyoutGroup, still }),
    [collapsible, railish, flyoutGroup, still]
  );
  const trackStyle: CSSProperties = {
    ...exitPullbackStyle,
    ...(style.selectedWeight != null
      ? { ['--sel-on-weight' as string]: style.selectedWeight }
      : null),
  };
  const listId = `sidenav-list-${useId().replace(/:/g, '')}`;
  // Inside an AppShell that draws the toggle in its header's row, the nav has none of its own.
  const shellFold = useContext(AppShellFoldToggleContext);
  const footed = collapsible && !shellFold;
  const jumpRef = useLatest(jump);
  // A footed track fills its column, so rows moving inside it (a ghost group's
  // gap) don't resize it: the engine isn't told. Re-place the resting selector.
  useEffect(() => {
    const root = rootRef.current;
    const list = root?.querySelector(':scope > .sidenav__list');
    if (!footed || !root || !list || typeof ResizeObserver === 'undefined')
      return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) return void (first = false);
      const sel = selRef.current;
      const t = sel?.target();
      if (
        !sel ||
        !t ||
        !sel.shown() ||
        leaning.current ||
        jumpRef.current.leaving() ||
        jumpRef.current.arriving()
      )
        return;
      if (
        root.matches('[data-landing], [data-jump], [data-passing]') ||
        root.closest('[data-resizing]')
      )
        return;
      if (
        [...indicatorsOf(root)].some((ind) =>
          ind.getAnimations().some((a) => a.playState === 'running')
        )
      )
        return;
      sel.measure();
      sel.moveTo(t, { instant: true });
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, [footed, selRef, jumpRef]);
  const toggleLabel = collapsed ? 'Expand navigation' : 'Collapse navigation';

  return (
    <NavContext.Provider value={ctx}>
      <NavStateContext.Provider value={navState}>
        <nav
          {...rest}
          ref={navRef}
          className={[
            'sidenav',
            `sidenav--${size}`,
            `sidenav--${FRAME_CLASS[frame]}`,
            iconColumn && 'sidenav--icons',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          data-collapsible={collapsible || undefined}
          data-foot={footed || undefined}
          onPointerEnter={onNavPointerEnter}
          onPointerLeave={onNavPointerLeave}>
          <div
            ref={rootRef}
            id={listId}
            className={[...style.classes, 'sidenav__track']
              .filter(Boolean)
              .join(' ')}
            style={trackStyle}
            data-still={!awake || still ? '' : undefined}
            onPointerDown={onPointerDown}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerLeave={onPointerLeave}
            onFocus={onFocus}
            onBlur={onBlur}>
            {filtered.field}
            <SelectionMarker />
            <ul className="sidenav__list">
              {children}
              {filtered.empty}
            </ul>
            {footed && (
              // The foot: the toggle at the nav's lower start, held at the bottom of a scrolling column.
              <div className="sidenav__foot">
                <span className="sidenav__foot-edge" aria-hidden="true" />
                <button
                  type="button"
                  className="sel__item sidenav__toggle"
                  // Icon only (a well-understood icon): the name is for assistive tech.
                  aria-label={toggleLabel}
                  aria-expanded={!collapsed}
                  aria-controls={listId}
                  data-motion-icon-frame=""
                  onClick={toggleCollapsed}>
                  <SelectionFaces>
                    <span className="sidenav__icon">
                      <SidePanelOpenToggle
                        size={16}
                        value={collapsed ? 'open' : 'close'}
                        disableToggle
                        aria-hidden="true"
                      />
                    </span>
                  </SelectionFaces>
                </button>
              </div>
            )}
            <div
              className="sel__tip sel__tip--fixed"
              ref={tipElRef}
              hidden
              aria-hidden="true">
              <span className="sel__tip-frame" {...SNAP_FRAME} />
              <span className="sel__tip-text" />
            </div>
          </div>
        </nav>
        {/* The flyout's Menu loads on demand: when idle, or at a rail header's hover or focus (flyout.tsx). */}
        {collapsible && (
          <SideNavFlyout
            navRef={navRef}
            id={flyId}
            fly={fly}
            open={flyOpen}
            onClose={closeFlyout}
            size={size}
            timeScale={m.timeScale}
          />
        )}
      </NavStateContext.Provider>
    </NavContext.Provider>
  );
}
SideNav.displayName = 'SideNav';

/* ── SideNavLink ───────────────────────────────────────────────────────── */

type SideNavLinkOwnProps<C extends ElementType> = {
  /** The element or component to render: `'a'` (default) or a router link (`as={Link} to="/x"`). */
  as?: C;
  /** The label. */
  children?: ReactNode;
  /** This link is the current page: `aria-current="page"`, and the selector rests on it. */
  current?: boolean;
  /** Leaves the app: an arrow (the motion icon `ArrowUpRight`) after the label. */
  external?: boolean;
  /** A small trailing tag (Draft, TBD): a string gets the nav's tag; any other node renders as given. */
  tag?: ReactNode;
  /** Not available: no rollover, not reachable, not followed. */
  disabled?: boolean;
  /** An icon before the label (a motion icon), 16px. */
  renderIcon?: ElementType;
  /** Other words the nav's `filter` finds it by (an alias, v11's name for it). */
  keywords?: readonly string[];
};

export type SideNavLinkProps<C extends ElementType = 'a'> =
  SideNavLinkOwnProps<C> &
    Omit<ComponentPropsWithoutRef<C>, keyof SideNavLinkOwnProps<C>>;

function SideNavLinkRow<C extends ElementType = 'a'>({
  as,
  children,
  current = false,
  external = false,
  tag,
  disabled = false,
  renderIcon: Icon,
  keywords: _keywords,
  className,
  ...rest
}: SideNavLinkProps<C>) {
  const { requestSync, iconColumn } = useNav('SideNavLink');
  const group = useContext(GroupContext);
  const id = useId();
  const Comp: ElementType = as ?? 'a';
  // In a group, only once its rows are revealed: the selector arrives on a
  // row that's in view (a Menu highlight's arrival), never over one the
  // opening clip still hides — and never in the rail, where the group is
  // folded (its bar marks the page).
  const marked =
    current && !disabled && (group ? group.revealed && !group.railish : true);
  const text = textOf(children);

  // What the group's flyout shows for this link in the rail.
  const register = group?.register;
  useLayoutEffect(() => {
    if (!register) return;
    register(id, { label: text, Icon, current, disabled });
    return () => register(id, null);
  }, [register, id, text, Icon, current, disabled]);

  const report = group?.report;
  useLayoutEffect(() => {
    if (!report) return;
    report(id, current);
    return () => report(id, false);
  }, [report, id, current]);

  // A row came, went or changed its label: measured, its selected face held again.
  useLayoutEffect(() => {
    requestSync(true);
    return () => requestSync(true);
  }, [requestSync, text]);
  // Its mark moved.
  useLayoutEffect(() => {
    requestSync();
  }, [marked, requestSync]);

  const disabledProps = disabled
    ? {
        'aria-disabled': true,
        href: undefined,
        to: undefined,
        onClick: (e: ReactMouseEvent) => e.preventDefault(),
      }
    : null;

  return (
    <li className="sidenav__entry">
      <Comp
        {...rest}
        {...disabledProps}
        className={['sel__item', 'sidenav__link', className]
          .filter(Boolean)
          .join(' ')}
        aria-current={current ? 'page' : undefined}
        data-selected={marked ? '' : undefined}
        // A press can slide along the list (the kit's gesture): no native link drag.
        draggable={false}
        data-sidenav-link={group ? id : undefined}
        {...(Icon || external ? { 'data-motion-icon-frame': '' } : null)}>
        <SelectionFaces>
          {/* A top-level row in an icon column: the icon in the column; in a
              group, an icon at the label's start. */}
          {iconColumn && !group ? (
            <IconSlot Icon={Icon} />
          ) : (
            Icon && <Icon aria-hidden="true" />
          )}
          <span className="sel__text">{children}</span>
          {tag != null &&
            tag !== false &&
            (typeof tag === 'string' ? (
              <span className="sidenav__tag">{tag}</span>
            ) : (
              <span className="sidenav__tag-slot">{tag}</span>
            ))}
          {external && (
            <span className="sel__accessory sidenav__external">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          )}
        </SelectionFaces>
      </Comp>
    </li>
  );
}
SideNavLinkRow.displayName = 'SideNavLink';

/**
 * A link: a row of the nav. Memoised: a navigation re-renders the old and
 * the new current page's links, not every link (its props are a router
 * link's, and its context changes only with the nav's props).
 */
export const SideNavLink = memo(SideNavLinkRow) as typeof SideNavLinkRow;
SideNavLink.displayName = 'SideNavLink';

/* ── SideNavGroup ──────────────────────────────────────────────────────── */

export interface SideNavGroupProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'title'
> {
  /** The header's label (and the group's name). */
  title: ReactNode;
  /** `SideNavLink`s. */
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /**
   * Uncontrolled initial state. Leave both `open` and `defaultOpen` out for
   * the automatic group: open at first if it holds the current page. Either
   * way it opens when the person goes to one of its pages, and otherwise
   * stays as they left it.
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An icon before the header's label (a motion icon), in the nav's icon column; the rail shows it alone. */
  renderIcon?: ElementType;
}

/**
 * The current page's link in this subtree, as a key (its place among the
 * elements, by React key where it has one), or '' when there's none. Read
 * from the elements, so the first render is right.
 */
function currentKeyOf(node: ReactNode, path = ''): string {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ current?: boolean; children?: ReactNode }>(child))
      continue;
    const key = `${path}/${String(child.key)}`;
    if (child.props.current) return key;
    if (child.props.children) {
      const inner = currentKeyOf(child.props.children, key);
      if (inner) return inner;
    }
  }
  return '';
}

export function SideNavGroup({
  title,
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  renderIcon: Icon,
  className,
  ...rest
}: SideNavGroupProps) {
  const {
    requestSync,
    iconColumn,
    weight,
    exclusive,
    ghost,
    ghostShadow,
    reholdWeight,
    leads,
    moves,
    toggleFlyout,
    pressClosedFlyout,
  } = useNav('SideNavGroup');
  const { railish, flyoutGroup, still } = useContext(NavStateContext);
  const groupId = useId();
  const bodyId = `sidenav-${groupId.replace(/:/g, '')}`;
  const titleText = textOf(title);

  // Links the group can't see in its children (wrapped in another component) report in.
  const [reported, setReported] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const report = useCallback((id: string, current: boolean) => {
    setReported((prev) => {
      if (prev.has(id) === current) return prev;
      const next = new Set(prev);
      if (current) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  /**
   * Which of its pages is current ('' none): from its children as rendered
   * (`walked`), else from the links that report in (`reportedKey`).
   */
  const walked = currentKeyOf(children);
  const reportedKey = [...reported].sort().join(' ');
  const holds = (walked || reportedKey) !== '';

  // Uncontrolled: `defaultOpen`, or (automatic, with neither prop) open when
  // it holds the current page. Either way a group opens when the person
  // goes to one of its pages — the current page moving into it, or to
  // another page in it, even after they shut it — and otherwise
  // stays as they left it: it never shuts on its own. (Shutting the old
  // group as the selector leaves it would move every row below it mid-glide,
  // the selector chasing its target.) Its own state, adjusted as it renders: the
  // nav doesn't render again for it.
  const auto = openProp === undefined && defaultOpen === undefined;
  const [own, setOwn] = useState(auto ? holds : (defaultOpen ?? false));
  // The group reopens when the current page moves into it: one of its
  // children turns current, or a report turns up (a wrapped link's). Every
  // link reports, a commit late: in the render where the current page
  // leaves one of the links the group sees, that link's report is still in
  // (it's withdrawn in the link's layout effect, after this render). Read as
  // the current page, it opened the shut group the page had just left, and
  // with `exclusive` that shut the group of the link just clicked: ghost's
  // move between groups.
  const [seen, setSeen] = useState({ walked, reportedKey });
  if (seen.walked !== walked || seen.reportedKey !== reportedKey) {
    setSeen({ walked, reportedKey });
    const into = walked
      ? walked !== seen.walked
      : reportedKey !== '' && reportedKey !== seen.reportedKey;
    if (into && !own) setOwn(true);
  }
  const open = openProp ?? own;

  const toggle = () => {
    const next = !open;
    if (openProp === undefined) setOwn(next);
    onOpenChange?.(next);
  };

  // One group at a time (`exclusive`): a group that opens claims the lead,
  // and every other open group shuts (its own state; a controlled group is
  // asked to, and asked again on every later claim while it stays open). In
  // a layout effect, so the one that shuts starts in the frame the one that
  // opens does (the swap). On mount the last open group in tree order stays
  // open (createLeads).
  const openRef = useLatest(open);
  const controlled = useLatest(openProp !== undefined);
  const onOpenChangeRef = useLatest(onOpenChange);
  useLayoutEffect(
    () =>
      leads.join(groupId, {
        open: () => openRef.current,
        oust: () => {
          if (controlled.current) onOpenChangeRef.current?.(false);
          else setOwn(false);
        },
      }),
    [leads, groupId, openRef, controlled, onOpenChangeRef]
  );
  // On opening (and on mount), not when `exclusive` itself turns on: then
  // the open groups stay open until the next one opens, as they always have.
  const exclusiveRef = useLatest(exclusive);
  useLayoutEffect(() => {
    if (open && exclusiveRef.current) leads.claim(groupId);
  }, [open, exclusiveRef, leads, groupId]);

  // Opening or shutting: the kit's disclosure, a move on the nav (one motion
  // and one layout transaction for every group moving at once). Not on the
  // first paint, under reduced motion, or in the rail (folded, the rail's own
  // transaction moves it). Open and landed (its links too): the clip lets go
  // (and its soft edge goes), so the rows' hover and rings aren't cut at its
  // edges, and the current link takes the selector. It clips again the
  // moment the group starts to shut.
  const headerRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const disclosure = useDisclosureBody(
    bodyRef,
    open,
    moves,
    reducedMotion,
    railish
  );
  const settled = open && disclosure.landed;

  // Shut over the current page (or folded in the rail): the header isn't
  // selected (it isn't the page); the selector leaves. Opening the group
  // brings the selector back to the page. The bar at the header's start says
  // the page is in here, open or shut.
  const holdsHidden = holds && (!open || railish);
  useLayoutEffect(() => {
    requestSync();
  }, [holdsHidden, open, requestSync]);
  // The header is a row: it came or went, or changed its label.
  useLayoutEffect(() => {
    requestSync(true);
    return () => requestSync(true);
  }, [requestSync, titleText]);

  // The bar's entrance, played only when the group comes to hold the page: a CSS
  // animation would replay each time a fold or `still` lets go of it (a flicker).
  const markRef = useRef<HTMLSpanElement>(null);
  const markShown = useRef(holds);
  useLayoutEffect(() => {
    if (markShown.current === holds) return;
    markShown.current = holds;
    const mark = markRef.current;
    if (!mark) return;
    for (const a of mark.getAnimations()) if (a.id === MARK_IN) a.cancel();
    if (
      !holds ||
      reducedMotion ||
      mark.closest('[data-still], [data-resizing]')
    )
      return;
    const ms =
      parseFloat(
        getComputedStyle(mark).getPropertyValue('--cds-motion-duration-fast-02')
      ) || motionTokens.duration['fast-02'];
    const a = mark.animate(
      [{ clipPath: 'inset(25% 0)' }, { clipPath: 'inset(0)' }],
      {
        duration: ms,
        easing: ENTRANCE,
      }
    );
    a.id = MARK_IN;
  }, [holds, reducedMotion]);

  // Ghost: the container's shadow, its color solved against the page (its
  // layers made shut, so the first open grows them like any other), and on
  // opening lit from straight above until the pointer is over it (the
  // pointer takes it from there: attachGhostLight).
  const groupRef = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const li = groupRef.current;
    if (!ghost || !ghostShadow || railish || !li) return;
    deriveCastShadowColor(li);
    if (open && !li.matches(':hover')) centerCastShadow(li);
  }, [ghost, ghostShadow, open, railish]);

  // Ghost: the container is the header's hover colour, solved by matched lightness off the page
  // (ghostSteps); each render and each theme change round it (a render alone read the old theme).
  const solveWash = () => {
    const li = groupRef.current;
    const header = headerRef.current;
    if (!ghost || !li || !header) return;
    const page = parseCssColor(
      getComputedStyle(li).getPropertyValue('--cast-backdrop')
    );
    if (!page || page[3] < 0.999) {
      li.style.removeProperty('--sidenav-ghost-wash');
      return;
    }
    const rest = parseCssColor(
      getComputedStyle(header).getPropertyValue('--rollover-rest')
    ) ?? [0, 0, 0, 0];
    const size = Math.sqrt(header.offsetWidth * header.offsetHeight);
    const steps = ghostSteps();
    const [r, g, b] = lightnessColors(
      rest,
      page,
      lightnessStep(page, size, steps),
      steps
    ).hover;
    const wash = `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
    if (li.style.getPropertyValue('--sidenav-ghost-wash') !== wash)
      li.style.setProperty('--sidenav-ghost-wash', wash);
  };
  useLayoutEffect(solveWash);
  const solveWashRef = useLatest(solveWash);
  useEffect(() => {
    const li = groupRef.current;
    if (!ghost || !li) return;
    return onThemeChange(li, () => solveWashRef.current());
  }, [ghost, solveWashRef]);
  // The container is the rows' frame (`data-snap-frame`): their matched
  // hover steps off it while it's there, off the page once it's gone. A
  // header under the pointer as its group opens, or as the container finishes
  // going, takes its hover again for what it now sits on.
  const rehover = () => {
    const header = headerRef.current;
    if (header?.matches(':hover')) deriveLightnessColors(header, ghostSteps());
  };
  const ghostOpen = useRef(open);
  useLayoutEffect(() => {
    if (!ghost || ghostOpen.current === open) return;
    ghostOpen.current = open;
    const bg = groupRef.current?.querySelector<HTMLElement>(
      ':scope > .sidenav__group-bg'
    );
    const cs = bg && getComputedStyle(bg);
    const later =
      cs && /[1-9]/.test(cs.transitionDelay + cs.transitionDuration);
    if (open || !later) rehover();
  }, [ghost, open]);

  // The current page's group: its header takes the selected weight, held to
  // its regular width (as the kit holds a selected label: its letters drawn
  // closer), so the chevron after it doesn't move.
  const heavy = holds && !railish && weight != null;
  // On the kit's measure frame, with every other hold on the page. The
  // regular width is read off the header's selected-face copy of the text,
  // put to weight 400 and its own spacing for the read (both restored after),
  // so no header writes and reads in turn.
  useLayoutEffect(() => {
    const header = headerRef.current;
    const text = header?.querySelector<HTMLElement>(
      '.sel__face:not(.sel__face--on) .sel__text'
    );
    const twin = header?.querySelector<HTMLElement>(
      '.sel__face--on .sel__text'
    );
    if (!text) return;
    let n = 0;
    let spacing: string | null = null;
    // The copy's own spacing (the kit's hold of the selected face), put back after the read.
    let twinSpacing = '';
    const job: MeasureJob = {
      stage: MEASURE_STAGE.label,
      clear: () => {
        text.style.letterSpacing = '';
        n = heavy && twin ? Array.from(text.textContent ?? '').length : 0;
        if (!n) return;
        twinSpacing = twin!.style.letterSpacing;
        twin!.style.letterSpacing = '';
        twin!.style.fontWeight = '400';
      },
      read: () => {
        if (!n) return;
        // The text's own width (not the box's, which an ellipsis clips), in
        // layout px (a scaled row's rect isn't).
        const k = layoutScale(text);
        const wide = textWidth(text) * k;
        const regular = textWidth(twin!) * k;
        const base = parseFloat(getComputedStyle(text).letterSpacing) || 0;
        spacing = `${base + (regular - wide) / n}px`;
      },
      write: () => {
        if (n) {
          twin!.style.fontWeight = '';
          twin!.style.letterSpacing = twinSpacing;
        }
        if (spacing != null) text.style.letterSpacing = spacing;
        spacing = null;
      },
    };
    measureScheduler().schedule(job);
    // The header's selected face takes the weight with it: the kit holds it
    // again, after this (its stage is later).
    reholdWeight();
    let live = true;
    void document.fonts?.ready.then(
      () => live && measureScheduler().schedule(job)
    );
    return () => {
      live = false;
      measureScheduler().cancel(job);
    };
  }, [heavy, weight, titleText, reholdWeight]);

  // The links, for the rail's flyout (a registry, not state: read when it opens).
  const entries = useRef(new Map<string, FlyoutEntry>());
  const register = useCallback((id: string, entry: FlyoutEntry | null) => {
    if (entry) entries.current.set(id, entry);
    else entries.current.delete(id);
  }, []);

  // In the rail the header opens the group's flyout (the Menu): Enter /
  // Space / → on the first row, a press on the menu itself; Escape closes it
  // back to the header.
  const flyout = (pointer: { x: number; y: number } | null) => {
    const header = headerRef.current;
    if (!header) return;
    const els = [
      ...(bodyRef.current?.querySelectorAll<HTMLElement>(
        '[data-sidenav-link]'
      ) ?? []),
    ];
    toggleFlyout({
      group: groupId,
      title: titleText,
      anchor: header,
      pointer,
      entries: els.flatMap((el) => {
        const key = el.dataset.sidenavLink!;
        const entry = entries.current.get(key);
        return entry ? [{ key, entry, el }] : [];
      }),
    });
  };
  const pressedClosed = useRef(false);
  const onHeaderClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!railish) return toggle();
    if (pressedClosed.current) {
      pressedClosed.current = false;
      return;
    }
    // No pointer behind the click (Enter, Space, assistive tech): from the header.
    flyout(e.detail === 0 ? null : { x: e.clientX, y: e.clientY });
  };

  const revealed = open && settled;
  const groupCtx = useMemo<GroupContextValue>(
    () => ({ revealed, railish, report, register }),
    [revealed, railish, report, register]
  );
  const flyoutOpen = flyoutGroup === groupId;

  return (
    <li
      {...rest}
      ref={groupRef}
      className={['sidenav__group', className].filter(Boolean).join(' ')}
      data-open={open || undefined}>
      {/* Ghost: the container an open group grows into (side-nav.scss); the cast shadow's layers are appended after the body. */}
      <span
        className="sidenav__group-bg"
        {...SNAP_FRAME}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'background-color' && !open) rehover();
        }}
      />
      <button
        type="button"
        ref={headerRef}
        className="sel__item sidenav__header"
        aria-expanded={railish ? flyoutOpen : open}
        aria-controls={railish ? undefined : bodyId}
        aria-haspopup={railish ? 'menu' : undefined}
        data-holds-current={holdsHidden || undefined}
        data-parent-current={heavy || undefined}
        data-motion-icon-frame=""
        onPointerDown={() => {
          // This press closed its own flyout (the menu's press outside): the click mustn't reopen it.
          pressedClosed.current = railish && pressClosedFlyout(groupId);
        }}
        onClick={onHeaderClick}
        onKeyDown={(e) => {
          if (railish && e.key === 'ArrowRight' && !flyoutOpen) {
            e.preventDefault();
            flyout(null);
          }
        }}>
        {/* Always mounted, so it can snap in and out (side-nav.scss). */}
        {/* The bar, at the row's start (just before the icon column in an icon nav). */}
        <span
          ref={markRef}
          className="sidenav__marker"
          data-on={holds || undefined}
          aria-hidden="true"
        />
        <SelectionFaces>
          {iconColumn ? (
            <IconSlot Icon={Icon} />
          ) : (
            Icon && <Icon aria-hidden="true" />
          )}
          <span className="sel__text">{title}</span>
          <span className="sel__accessory sidenav__chevron">
            {/* `still`: the icon has no way to change at once, so it's drawn
                anew in the new state (keyed by it) rather than turning. */}
            <ChevronDownUpToggle
              key={still ? String(open) : undefined}
              size={16}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </span>
        </SelectionFaces>
      </button>
      <div
        ref={bodyRef}
        className="sidenav__body"
        id={bodyId}
        {...inertProps(!open || railish)}
        data-unclipped={settled || undefined}
        data-reduced={reducedMotion || undefined}>
        <div className="sidenav__clip">
          <GroupContext.Provider value={groupCtx}>
            <ul className="sidenav__list sidenav__list--nested">{children}</ul>
          </GroupContext.Provider>
        </div>
      </div>
    </li>
  );
}
SideNavGroup.displayName = 'SideNavGroup';
