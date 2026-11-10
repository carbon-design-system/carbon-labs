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
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  afterLayout,
  animateLayout,
  DURATION_FLOOR_MS,
  durationStepForDistance,
  inLayout,
  motionTokens,
  onLayout,
  SNAP_FADE_SHORT,
  stepDown,
} from '@carbon-labs/v12-motion';
import { reflowTiming, usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { flushSync } from 'react-dom';
import { mergeRefs } from '@carbon-labs/v12-motion';
import {
  ChevronDownUpToggle,
  OverflowMenuVertical,
} from '@carbon-labs/react-motion-icons';
import {
  sizeClassOf,
  useSizeClass,
  type SizeClass,
} from '@carbon-labs/react-app-shell';
import { Breadcrumb, BreadcrumbItem } from '@carbon-labs/react-breadcrumb';
import {
  CONTROL_SIZES,
  KitDefaults,
  useContainerCorners,
  useKitDefaults,
  type KitDensity,
} from '@carbon-labs/react-kit-defaults';
import { Button } from '@carbon-labs/react-button';
import { MenuButton, MenuItem, OverflowMenu } from '@carbon-labs/react-menu';
import type { ButtonLookProps } from '@carbon-labs/react-props';
import {
  jumpBoxes,
  JUMP_OUT_SHARE,
  JUMP_OUT_SHRINK,
  useLatest,
} from '@carbon-labs/react-selection-kit';
import { Tag, type TagType } from '@carbon-labs/react-tag';
import {
  fitPageHeaderActions,
  type PageHeaderFit,
  type PageHeaderForm,
} from './fit';
import './page-header.scss';
import { cx } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * PageHeader — Carbon for IBM Products' PageHeader, prop for prop, on the
 * kit's quiet surface: the top of a page,
 * with its breadcrumb, title, subtitle, page actions, action bar, tags and
 * tabs, that collapses to one compact row as the page scrolls.
 *
 *   layout    expanded: the breadcrumb with the action bar at its end; the
 *             title (heading-04) with the page actions at its end; the
 *             subtitle, `children` and the tags; the navigation (tabs).
 *             Collapsed: one 48px row (the breadcrumb, the title after it,
 *             the page actions, the action bar), then the navigation
 *   widths    by the header's own size class (`useSizeClass`: its width,
 *             not the window's). At compact (< 672px) the page actions go
 *             under the title, at its start, so the title has the row
 *             (IBM Products' PageHeader below md: the title column 100%, the
 *             page actions 100% under it, 16px down, at the start). A resize
 *             across the edge changes the layout at once: the resize is the
 *             motion (the person's drag, or a panel or nav moving the
 *             header's width every frame), and a second move on top of it
 *             would chase a moving target. A collapse or expand in progress
 *             lands first
 *   surface   `--cds-surface` with the `--cds-surface-rule` hairline under it
 *             (`withoutBackground`: the page's, until it collapses); sticky
 *             at the top of its scroll container (`pageHeaderOffset` below
 *             it)
 *   collapse  it collapses once the page is scrolled past 16px and expands
 *             back at the top (edges, so a collapse from the toggle holds
 *             until the next crossing; one crossed while it moves is
 *             answered when it lands). On the scroll it keeps the room it
 *             gives up (`keptRoom`: a margin below what sticks, moving with
 *             its height), so nothing below moves and the page's height
 *             doesn't change, and a short page collapses too.
 *             `collapseHeader` holds it collapsed; `hasCollapseHeaderToggle`
 *             adds a button for it; neither keeps room (the content follows)
 *   fade      `motion.fade` (default true): the rolls' and the details'
 *             soft edges and the slash's fade; false, the jump's way, hard
 *             edges and the slash on its beats, opaque throughout
 *   motion    one layout transaction (carbon-motion's `animateLayout`): the
 *             header's height leads, and the parts that move (the
 *             breadcrumb, the tabs) move from where they were to where they
 *             land on its clock (FLIP: laid out once at the end, translated
 *             back); the page actions' and the bar's buttons jump instead
 *             (moving, below). The clock is the step of
 *             the farthest travel (`durationStepForDistance`; collapsing one
 *             step faster, `stepDown`), standard-productive: a reflow in
 *             view. The title doesn't travel: two copies
 *             swap in place, out then in, on the clock's thirds (the jump's
 *             shares): collapsing, the large one rolls up a line and away
 *             through a soft edge, then the compact row's rolls up into place
 *             from a line below through one, landing with the header;
 *             expanding, the mirror (`roll`, `[data-ph-roll]`). The
 *             breadcrumb's last slash (the one before the compact title)
 *             comes and goes on the same beats, and where one form has no
 *             breadcrumb (compact, collapsed) it rolls out and in with the
 *             title. The subtitle, children and tags fade in place on the
 *             title's beats (out collapsing, in expanding), under the edge
 *             that cuts them where the header ends. Ghost, collapsed: a
 *             hairline, in on fast-00 as the title lands. A turn mid-move goes
 *             from where everything is. Content below the header follows it
 *             (the transaction's root is the header's container)
 *   overflow  IBM Products' (fit.ts): each row split 60 / 40 between the
 *             title or breadcrumb and the page actions or action bar from md
 *             up, 75 / 25 below; expanded below md the page actions have a
 *             row of their own. The page actions fold as a set, the primary
 *             included, into a "Page actions" MenuButton
 *             (`pageActionsOverflowLabel`) when they don't fit their room
 *             (ButtonSetWithOverflow; its menu lists them last to first); the
 *             bar gives up its items from the end into its OverflowMenu at its
 *             end, before the collapse button (the vertical overflow icon, its
 *             menu below with its end on the button's: ActionBar, `flipped`),
 *             each by its label, with its icon. Collapsed, the page actions
 *             join the bar in the right section and stay buttons only beside
 *             the whole bar. The title takes what's left and truncates there,
 *             its full text in its tooltip. Measured from a hidden copy
 *             (`__sizer`) whose widths don't depend on the form, so a
 *             collapse commits its fit in the same render as the change and
 *             the transaction moves one layout; a resize mid-move applies
 *             when the move lands
 *   moving    every button that changes place jumps, as the side nav's
 *             selector does between groups (the selection kit's `jumpBoxes`):
 *             folding into a menu button or
 *             back out of one, going from their rows to the compact row and
 *             back, and on a resize, where a fold or a size class's edge
 *             puts them somewhere else. Copies of the ones leaving shrink
 *             out 4px, opaque, and go; then the ones arriving grow in from
 *             4px small; a third of the clock out, two thirds in. In a
 *             collapse or expand the clock is the move's, so the jump's
 *             beats are the title's; on a resize it's the jump's own
 *             (fast-01). Where the edge passes over them they're under it
 *             too. One within 4px of its old place stays put
 *   size      its controls one size down from the density around it
 *             (`PAGE_HEADER_DENSITY`): sm (32px) at the default density; a
 *             node of page actions is in a KitDefaults at that density
 *   frame     `flush` (default): the quiet surface and its hairline;
 *             `ghost`: no surface of its own, the ground it sits on painted
 *             (the page's, a quiet Region's, an inset workspace's), no
 *             hairline: the Resource index's look
 *   edge      content scrolling under it leaves into a soft edge at its
 *             bottom, the soft-edge token, growing over
 *             the first 16px under it (`underEdge`, its `::after`)
 *   reduced   at once
 *   corners   square by default (v11's, attached to the shell's edge);
 *             `rounded` when it sits in the page or in a card, by the
 *             kit's ladder: 8 in the page; in a quiet or raised Region,
 *             the region's inner radius (outer − inset, so square when the
 *             inset takes it all); `--cds-page-header-radius` sets it in a
 *             card of your own. The provider's (KitDefaults) when it isn't
 *             given; its `full` is `rounded` here (a header is no pill)
 *
 * IBM Products' props: `breadcrumbs` ({ key, href, label, title,
 * isCurrentPage, onClick }), `title` (a string, or { text, icon }),
 * `subtitle`, `children`, `actionBarItems` ({ key, renderIcon,
 * iconDescription, label, onClick, href, disabled }), `pageActions` (button
 * descriptions { key, kind, label, onClick, disabled, renderIcon, href },
 * or a node), `tags` ({ label, type, id }), `navigation`, `collapseHeader`,
 * `hasCollapseHeaderToggle`, `collapseHeaderIconDescription`,
 * `expandHeaderIconDescription`, `withoutBackground`,
 * `hasBackgroundAlways`, `pageHeaderOffset`, `actionBarOverflowAriaLabel`
 * (the bar's OverflowMenu's name), `pageActionsOverflowLabel` (the folded
 * page actions' MenuButton), `className`. Accepted with no
 * effect: `collapseTitle` (the compact row always carries the title),
 * `breadcrumbOverflowAriaLabel`, `showAllTagsLabel`, `allTagsModal*`,
 * `disableBreadcrumbScroll`, `enableBreadcrumbScroll`, `fullWidthGrid`,
 * `narrowGrid`. The kit adds: `corners`, `frame`, `scrollContainer`,
 * `onCollapsedChange`, `timeScale`.
 * ========================================================================== */

export interface PageHeaderBreadcrumb {
  key: string;
  label: ReactNode;
  href?: string;
  /** The link's title (a tooltip for a long label). */
  title?: string;
  isCurrentPage?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface PageHeaderActionBarItem {
  key: string;
  /** A motion icon. */
  renderIcon: ElementType;
  /** The button's name and tooltip. */
  iconDescription: string;
  /** Its text in the overflow menu, when it has moved there (IBM Products'). Default `iconDescription`. */
  label?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
  disabled?: boolean;
}

/** A page action: the Button's `kind`, `variant` and `frame` (default primary). */
export interface PageHeaderPageAction extends ButtonLookProps {
  key: string;
  label: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  renderIcon?: ElementType;
  href?: string;
}

export interface PageHeaderTag {
  label: ReactNode;
  type?: TagType;
  id?: string;
  key?: string;
}

export interface PageHeaderTitleObject {
  text: string;
  /** An icon before the title. */
  icon?: ElementType;
}

/** The kit's corners for a container: no pill. */
export type PageHeaderCorners = 'square' | 'rounded';

/** PageHeader's motion: one object, each key left out the shipped one. */
export interface PageHeaderMotion {
  /**
   * The collapse's and the expand's fades: the soft edges the titles roll
   * through and the details are cut by, and the breadcrumb's slash fading
   * on the title's beats. `true` (default). `false`: the jump's way, opaque to the
   * last frame. The titles roll through a hard edge at their line, the
   * edge over the details is hard, and the slash comes at the start of the
   * in beat and goes at the end of the out beat, with no fade.
   */
  fade: boolean;
}

/** The shipped motion. */
export const PAGE_HEADER_MOTION: PageHeaderMotion = { fade: true };

/** What the header stands on: `flush` (default), its own quiet surface and hairline, attached to the shell's edge; `ghost`, none of its own, on the page's or the workspace's ground. */
export type PageHeaderFrame = 'flush' | 'ghost';
export const PAGE_HEADER_FRAMES: readonly PageHeaderFrame[] = [
  'flush',
  'ghost',
];

/**
 * A header's controls sit one size down from the density around it: the default
 * density's md (40px) is sm (32px) here, spacious's lg is md; compact stays
 * sm, the smallest of the controls' scale. The page actions, the action bar,
 * its menus and the collapse button take it, and so do page actions given as
 * a node (they're in a `KitDefaults` at this density).
 */
export const PAGE_HEADER_DENSITY: Readonly<Record<KitDensity, KitDensity>> = {
  spacious: 'default',
  default: 'compact',
  compact: 'compact',
};

/** A button that changed place by more than this, px, jumps there (the jump's own shrink: less is a nudge, not a move). */
const JUMP_MOVE_PX = JUMP_OUT_SHRINK;

/** It takes the provider's corners (KitDefaults). */

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'children'
> {
  actionBarItems?: readonly PageHeaderActionBarItem[];
  breadcrumbs?: readonly PageHeaderBreadcrumb[];
  /** Under the subtitle: anything the page needs there (a status, a summary). */
  children?: ReactNode;
  className?: string;
  /** Collapsed while true (the page's scroll doesn't expand it). */
  collapseHeader?: boolean;
  collapseHeaderIconDescription?: string;
  expandHeaderIconDescription?: string;
  /** A button that collapses and expands it. */
  hasCollapseHeaderToggle?: boolean;
  /** The surface behind it while expanded. Default true. */
  hasBackgroundAlways?: boolean;
  /** No surface while expanded (the page's own); the compact row still has it. */
  withoutBackground?: boolean;
  /** Tabs under it (the kit's Tabs). */
  navigation?: ReactNode;
  /** The page's buttons: descriptions, or a node of your own. */
  pageActions?: readonly PageHeaderPageAction[] | ReactNode;
  /** Where it sticks: this far below the top of its scroll container, px. */
  pageHeaderOffset?: number;
  subtitle?: ReactNode;
  tags?: readonly PageHeaderTag[];
  title?: string | PageHeaderTitleObject;
  /** IBM Products: the title in the breadcrumb when collapsed. Accepted; the compact row always has it. */
  collapseTitle?: boolean;
  /** The action bar's OverflowMenu's name: its button's and the menu's. Default `Options` (the OverflowMenu's). */
  actionBarOverflowAriaLabel?: string;
  /** The label of the MenuButton the page actions fold into when they don't fit (IBM Products'). Default `Page actions`. */
  pageActionsOverflowLabel?: ReactNode;
  breadcrumbOverflowAriaLabel?: string;
  showAllTagsLabel?: string;
  allTagsModalTitle?: string;
  allTagsModalSearchLabel?: string;
  allTagsModalSearchPlaceholderText?: string;
  disableBreadcrumbScroll?: boolean;
  enableBreadcrumbScroll?: boolean;
  fullWidthGrid?: boolean | 'xl';
  narrowGrid?: boolean;
  /** `square` (attached to the shell's edge) or `rounded`: 8px in the page, a Region's inner radius in one, `--cds-page-header-radius` in your own. Default the provider's (`full` is `rounded`), else `square`. */
  corners?: PageHeaderCorners;
  /** `flush` (default): its own quiet surface and hairline. `ghost`: none of its own, on the ground it sits on. Content scrolling under it leaves into a soft edge either way. */
  frame?: PageHeaderFrame;
  /** The scroll container it collapses with. Default the nearest one above it, else the window. */
  scrollContainer?: HTMLElement | null;
  /** It collapsed or expanded. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The collapse's motion (`PageHeaderMotion`; each key left out is `PAGE_HEADER_MOTION`'s). */
  motion?: Partial<PageHeaderMotion>;
  /** Multiplies the motion's clock (slow motion). Default 1. */
  timeScale?: number;
}

/** Scrolled this far, it collapses; back at the top (this or less), it expands. */
const COLLAPSE_AT = 16;
const EXPAND_AT = 0;

/** The parts that move between the two forms. */
type Part = 'crumbs' | 'title' | 'actions' | 'bar' | 'nav';

/** A copy that rolls out of its line: the copy, its box, its line's height and where it is in its roll (px). */
interface Rolled {
  node: HTMLElement;
  rect: DOMRect;
  line: number;
  roll: number;
}

interface Snapshot {
  height: number;
  parts: Map<string, DOMRect>;
  /** The page actions' and the bar's buttons, by key (`data-ph-item`): a part whose buttons change travels by one that stays. */
  items: Map<string, DOMRect>;
  /** Copies of those buttons, for the ones that leave (the change's snapshot only). */
  clones: Map<string, HTMLElement>;
  /** Where the edge is (the top of the tabs, else the header's bottom), px from the header's top. */
  edge: number;
  /**
   * The title as drawn (the change's snapshot only): a copy of it in its own
   * type, its box, and where its text is in its roll (px, `--cds-ph-roll`:
   * mid-swap on a turn). `waiting`: the roll of a copy still leaving from the
   * last swap, which the title now arriving takes up from (a turn).
   */
  title: (Rolled & { waiting: number | null }) | null;
  /** The breadcrumb as drawn, likewise (the change's snapshot only; null where it's hidden). */
  crumbs: Rolled | null;
  /** The details' copy, and its old place, collapsing. */
  ghost: { node: HTMLElement; rect: DOMRect } | null;
}

/** The roll's offset where `el` is, px (0 at rest). */
const rollOf = (el: Element) =>
  parseFloat(getComputedStyle(el).getPropertyValue('--cds-ph-roll')) || 0;

/** The height of `el`'s content box (its line: the roll's window), px. */
function lineOf(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  return (
    el.clientHeight -
    (parseFloat(cs.paddingBlockStart) || 0) -
    (parseFloat(cs.paddingBlockEnd) || 0)
  );
}

/**
 * A title rolling in its line (`[data-ph-roll]`, page-header.scss): its
 * content `from` → `to` px down (negative up) in a window its line `line` px
 * tall, through the soft edge where it's cut. One registered property moves
 * the text and the edge, so they share the clock and no script runs per
 * frame.
 */
function roll(
  el: HTMLElement,
  line: number,
  from: number,
  to: number,
  timing: { duration: number; delay?: number; easing: string }
): Animation {
  el.setAttribute('data-ph-roll', '');
  el.style.setProperty('--cds-ph-roll-h', `${line}px`);
  return el.animate(
    [{ '--cds-ph-roll': `${from}px` }, { '--cds-ph-roll': `${to}px` }],
    { ...timing, fill: 'both' }
  );
}

/** The title's type, written onto a copy so it keeps it whatever form the header is in. */
const TYPE_PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'padding-block-start',
  'padding-block-end',
  'column-gap',
] as const;

const bezier = (name: keyof typeof motionTokens.easing) =>
  `cubic-bezier(${motionTokens.easing[name].join(', ')})`;

/**
 * The content under the header's bottom edge, px, clamped to the soft-edge
 * token, written as `--cds-ph-under` on the header (registered, not
 * inherited: page-header.scss's `::after` paints the edge from it). It's how
 * far the box after what sticks (`hostOf`) has gone above that box's
 * bottom, so a header lower on the page, or one keeping room below it, has
 * no edge until something is really under it; with no
 * box after it, the scroll. Once a frame; it writes only on a change, and
 * the clamp stops the writes past the first 16px.
 *
 * Reads: the token and what sticks are read once,
 * and again after a move or a resize (`reset`), not per frame; and once the
 * edge is full, nothing is read while the scroll stays at or past where it
 * filled (content only goes further under), so the middle of a long page
 * reads only the scroll position.
 */
function underEdge(
  header: HTMLElement,
  scrolled: () => number
): { schedule: () => void; reset: () => void; stop: () => void } {
  let raf = 0;
  let last = -1;
  let soft = 16;
  let host = header;
  /** The scroll position where the edge filled (∞ while it isn't full). */
  let fullAt = Infinity;
  const read = () => {
    soft =
      parseFloat(
        getComputedStyle(header).getPropertyValue('--cds-motion-soft-edge')
      ) || 16;
    host = hostOf(header);
    fullAt = Infinity;
  };
  read();
  const write = () => {
    raf = 0;
    if (!header.isConnected) return;
    const y = scrolled();
    if (last === soft && y >= fullAt) return;
    const next = host.nextElementSibling as HTMLElement | null;
    let past: number;
    // The room it keeps (a margin) is empty: content is under it only once
    // it reaches the bottom of what sticks.
    if (next)
      past =
        (host.getBoundingClientRect().bottom -
          next.getBoundingClientRect().top) /
        drawnScale(header).y;
    else past = y;
    const v = Math.round(Math.max(0, Math.min(soft, past)) * 10) / 10;
    fullAt = v === soft ? y : Infinity;
    if (v === last) return;
    last = v;
    if (v > 0) header.style.setProperty('--cds-ph-under', `${v}px`);
    else header.style.removeProperty('--cds-ph-under');
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(write);
  };
  return {
    schedule,
    reset: () => {
      if (!header.isConnected) return;
      read();
      schedule();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      header.style.removeProperty('--cds-ph-under');
    },
  };
}

/** The nearest scroll container above `el`, or null (the window). */
function scrollerOf(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if (o === 'auto' || o === 'scroll' || o === 'overlay') return p;
  }
  return null;
}

/**
 * What sticks with it: the header itself (it's sticky), or a sticky box
 * round it that it fills (a recipe's page-header region, which sticks in its
 * place: the header's own sticky has no room in a box only as tall as it).
 * The room it keeps goes below that, outside what sticks.
 */
function hostOf(header: HTMLElement): HTMLElement {
  const p = header.parentElement;
  return p && getComputedStyle(p).position === 'sticky' ? p : header;
}

/** The room it keeps now, px (mid-move: where it is). */
function keptNow(header: HTMLElement): number {
  const host = hostOf(header);
  const base = parseFloat(host.dataset.phKeepBase ?? '');
  if (Number.isNaN(base)) return 0;
  return Math.max(
    0,
    (parseFloat(getComputedStyle(host).marginBlockEnd) || 0) - base
  );
}

/**
 * The room it keeps. Collapsing on the scroll, the header keeps the room
 * it gives up, below what sticks (`hostOf`), as a margin: its height and
 * that margin add up to the same on every frame of the move, so what's
 * below it doesn't move and the page's height and scroll don't change, and
 * a page too short to stay scrolled once the header shrinks still collapses.
 * The compact row's edge rises over the page, the content scrolling on
 * under it; back at the top it expands into the room it kept, and nothing below moves either.
 * A collapse that isn't the scroll's (`collapseHeader`, the toggle) keeps
 * no room: the content follows the header, a reflow in view. Returns where
 * the room goes from and to (px over the host's own margin), with the margin
 * already set to where it lands; null when there's nothing to keep or give
 * back.
 */
function keptRoom(
  header: HTMLElement,
  keep: boolean,
  before: number,
  from: number
): { host: HTMLElement; base: number; from: number; to: number } | null {
  const host = hostOf(header);
  host.getAnimations().forEach((a) => {
    const kf = (a.effect as KeyframeEffect | null)?.getKeyframes?.() ?? [];
    if (kf.some((f) => 'marginBlockEnd' in f)) a.cancel();
  });
  if (!keep && from < 0.5 && host.dataset.phKeepBase === undefined) {
    host.style.removeProperty('min-block-size');
    return null;
  }
  // The host's own margin, under what it keeps (a style read: no layout).
  host.style.removeProperty('margin-block-end');
  const base = parseFloat(getComputedStyle(host).marginBlockEnd) || 0;
  let to = 0;
  if (keep) {
    // Measured with the room it took still held below it (all of it, for
    // the moment), so this layout can't shorten the page and clamp its
    // scroll; then the room it keeps.
    host.style.setProperty('margin-block-end', `${base + before}px`);
    host.style.removeProperty('min-block-size');
    to = Math.max(
      0,
      before - header.getBoundingClientRect().height / drawnScale(header).y
    );
  }
  host.style.removeProperty('min-block-size');
  if (to < 0.5) {
    host.style.removeProperty('margin-block-end');
    // Its base stays known while the room it kept goes (a turn reads it).
    if (from < 0.5) delete host.dataset.phKeepBase;
  } else {
    host.dataset.phKeepBase = String(base);
    host.style.setProperty('margin-block-end', `${base + to}px`);
  }
  return { host, base, from, to };
}

/**
 * The buttons that move as wholes (`data-ph-item`): each of the page actions'
 * and the bar's buttons, the menu buttons, the collapse button, and page
 * actions given as a node (the part itself, one box).
 */
const ITEMS = '[data-ph-part] [data-ph-item], [data-ph-part][data-ph-item]';

/** The parts' boxes, relative to the header's, as they are (mid-move included). */
function snapshot(
  header: HTMLElement,
  withGhost: boolean,
  withClones = false
): Snapshot {
  const h = header.getBoundingClientRect();
  // In layout px: the copies are placed and the parts translated in the header's own px, and a page drawn
  // scaled (a preview frame) would put them that scale off.
  const { x: kx, y: ky } = drawnScale(header);
  const rel = (r: DOMRect) =>
    new DOMRect(
      (r.left - h.left) / kx,
      (r.top - h.top) / ky,
      r.width / kx,
      r.height / ky
    );
  const parts = new Map<string, DOMRect>();
  header.querySelectorAll<HTMLElement>('[data-ph-part]').forEach((el) => {
    parts.set(el.dataset.phPart!, rel(el.getBoundingClientRect()));
  });
  const items = new Map<string, DOMRect>();
  const clones = new Map<string, HTMLElement>();
  header.querySelectorAll<HTMLElement>(ITEMS).forEach((el) => {
    const box = boxOf(el);
    items.set(el.dataset.phItem!, rel(box.getBoundingClientRect()));
    if (withClones) {
      const node = box.cloneNode(true) as HTMLElement;
      node.removeAttribute('id');
      // A node's part, copied whole, is no part (the next snapshot would count it).
      node.removeAttribute('data-ph-part');
      node.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      node.dataset.phItem = el.dataset.phItem;
      clones.set(el.dataset.phItem!, node);
    }
  });
  const nav = header.querySelector<HTMLElement>('[data-ph-part="nav"]');
  const edge =
    (nav && nav.offsetHeight > 0
      ? nav.getBoundingClientRect().top - h.top
      : h.height) / ky;
  let title: Snapshot['title'] = null;
  const h1 = header.querySelector<HTMLElement>(
    '.cds-page-header__grid .cds-page-header__title'
  );
  if (withClones && h1 && h1.offsetHeight > 0) {
    const node = h1.cloneNode(true) as HTMLElement;
    node.removeAttribute('id');
    node.removeAttribute('data-ph-part');
    node.removeAttribute('title');
    const cs = getComputedStyle(h1);
    for (const p of TYPE_PROPS)
      node.style.setProperty(p, cs.getPropertyValue(p));
    const leaving = header.querySelector<HTMLElement>(
      ':scope > .cds-page-header__ghost .cds-page-header__title[data-ph-roll]'
    );
    title = {
      node,
      rect: rel(h1.getBoundingClientRect()),
      line: lineOf(h1),
      roll: rollOf(h1),
      waiting: leaving ? rollOf(leaving) : null,
    };
  }
  let crumbs: Snapshot['crumbs'] = null;
  const trail = header.querySelector<HTMLElement>(
    '.cds-page-header__grid .cds-page-header__breadcrumb'
  );
  if (withClones && trail && trail.offsetHeight > 0) {
    const node = trail.cloneNode(true) as HTMLElement;
    node.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    crumbs = {
      node,
      rect: rel(trail.getBoundingClientRect()),
      line: lineOf(trail),
      roll: rollOf(trail),
    };
  }
  let ghost: Snapshot['ghost'] = null;
  const details = header.querySelector<HTMLElement>(
    '.cds-page-header__details'
  );
  if (withGhost && details && details.offsetParent) {
    const node = details.cloneNode(true) as HTMLElement;
    node.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    ghost = { node, rect: rel(details.getBoundingClientRect()) };
  }
  return {
    height: h.height / ky,
    parts,
    items,
    clones,
    edge,
    title,
    crumbs,
    ghost,
  };
}

/** How much larger the element is drawn than laid out on each axis (a scaled ancestor; rotation is unsupported). */
function drawnScale(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return {
    x: el.offsetWidth ? r.width / el.offsetWidth || 1 : 1,
    y: el.offsetHeight ? r.height / el.offsetHeight || 1 : 1,
  };
}

/**
 * What the fit is worked out from (fit.ts), px. Nothing here depends on the
 * form: the header's content width, and the hidden copy's widths (`__sizer`:
 * each button at its own size, the menus' buttons, the gaps), so the fit for
 * either form is known before it's laid out.
 */
interface Metrics {
  room: number;
  gap: Record<PageHeaderForm, number>;
  page: Record<string, number>;
  pageMenu: number;
  fixedActions: number;
  pageGap: number;
  bar: Record<string, number>;
  barGap: number;
  barEnd: number;
  toggle: number;
  trigger: number;
}

const NOTHING_MOVED: PageHeaderFit = { pageFolded: false, bar: [] };

/** What the fit depends on besides the metrics. */
interface FitInputs {
  form: PageHeaderForm;
  stacked: boolean;
  actionList: readonly PageHeaderPageAction[] | null;
  actionBarItems: readonly PageHeaderActionBarItem[];
  hasToggle: boolean;
}

/** The fit (fit.ts) for this form, at this width, from the metrics. */
function fitOf(m: Metrics | null, i: FitInputs): PageHeaderFit {
  if (!m) return NOTHING_MOVED;
  return fitPageHeaderActions({
    form: i.form,
    stacked: i.stacked,
    room: m.room,
    gap: m.gap[i.form],
    pageActions: (i.actionList ?? []).map((a) => ({
      key: a.key,
      width: m.page[a.key] ?? 0,
    })),
    pageMenu: m.pageMenu,
    fixedActions: i.actionList ? 0 : m.fixedActions,
    pageGap: m.pageGap,
    bar: i.actionBarItems.map((a) => ({
      key: a.key,
      width: m.bar[a.key] ?? 0,
    })),
    barGap: m.barGap,
    barEnd: m.barEnd,
    toggle: i.hasToggle ? m.toggle : 0,
    trigger: m.trigger,
  });
}

/** What a fit has moved, as one string. */
const fitKey = (f: PageHeaderFit) => `${f.pageFolded} ${f.bar.join(' ')}`;

/** The header's metrics, as laid out (transforms left out: the parts move by transform, the copy doesn't move). */
function measure(header: HTMLElement): Metrics | null {
  const grid = header.querySelector<HTMLElement>(
    ':scope > .cds-page-header__grid'
  );
  const sizer = header.querySelector<HTMLElement>(
    ':scope > .cds-page-header__sizer'
  );
  if (!grid || !sizer) return null;
  const width = (el: Element | null | undefined) =>
    el ? el.getBoundingClientRect().width : 0;
  const size = (name: string) =>
    width(sizer.querySelector(`[data-ph-size="${name}"]`));
  const px = (v: string) => parseFloat(v) || 0;
  const gs = getComputedStyle(grid);
  const keyed = (row: Element | null) => {
    const out: Record<string, number> = {};
    row?.querySelectorAll<HTMLElement>('[data-ph-key]').forEach((el) => {
      out[el.dataset.phKey!] = width(el);
    });
    return out;
  };
  const actionsRow = sizer.querySelector('[data-ph-size="actions"]');
  const barRow = sizer.querySelector('[data-ph-size="bar"]')!;
  // Page actions given as a node never move: their own width, from the live row.
  const live = header.querySelector<HTMLElement>(
    '.cds-page-header__actions[data-ph-fixed]'
  );
  let fixedActions = 0;
  if (live && live.children.length) {
    const kids = [...live.children];
    fixedActions =
      kids.reduce((s, k) => s + width(k), 0) +
      px(getComputedStyle(live).columnGap) * (kids.length - 1);
  }
  return {
    room:
      grid.getBoundingClientRect().width -
      px(gs.paddingInlineStart) -
      px(gs.paddingInlineEnd),
    gap: { expanded: size('gap-expanded'), collapsed: size('gap-collapsed') },
    page: keyed(actionsRow),
    pageMenu: size('page-menu'),
    fixedActions,
    pageGap: actionsRow ? px(getComputedStyle(actionsRow).columnGap) : 0,
    bar: keyed(barRow),
    barGap: px(getComputedStyle(barRow).columnGap),
    barEnd: px(getComputedStyle(barRow).marginInlineEnd),
    toggle: size('toggle'),
    trigger: size('trigger'),
  };
}

const HOLD_IN_LAYOUT = { holdInLayout: true };

/** What a part's widths follow, read without a layout: its elements, classes and text (not inline styles). */
function markupKey(root: Element | null): string {
  if (!root) return '';
  let key = '';
  for (const e of root.querySelectorAll('*'))
    key += `${e.tagName}.${e.getAttribute('class') ?? ''};`;
  return `${key}|${root.textContent ?? ''}`;
}

/** A row's button as the row lays it out: the child of its part that holds it (a MenuButton's shell, a tooltip's wrapper). */
function boxOf(el: HTMLElement): HTMLElement {
  if (el.hasAttribute('data-ph-part')) return el;
  let box = el;
  while (box.parentElement && !box.parentElement.hasAttribute('data-ph-part'))
    box = box.parentElement;
  return box;
}

/** `el`'s laid-out top inside `root`, px (transforms left out). */
function layoutTop(el: HTMLElement, root: HTMLElement): number {
  let top = 0;
  for (
    let e: HTMLElement | null = el;
    e && e !== root;
    e = e.offsetParent as HTMLElement | null
  )
    top += e.offsetTop;
  return top;
}

/** A label's text, for a menu item (MenuItem's label is a string). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node))
    return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

/** The collapse toggle's chevron: up while expanded, down while collapsed. */
const CollapsedContext = createContext(false);
function CollapseIcon(props: { size?: number; className?: string }) {
  const collapsed = useContext(CollapsedContext);
  return (
    <ChevronDownUpToggle
      {...props}
      size={16}
      toggled={!collapsed}
      disableToggle
      aria-hidden="true"
    />
  );
}

const isActionList = (v: unknown): v is readonly PageHeaderPageAction[] =>
  Array.isArray(v) &&
  v.every(
    (a) => a && typeof a === 'object' && !isValidElement(a) && 'key' in a
  );

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      actionBarItems = [],
      breadcrumbs = [],
      children,
      className,
      collapseHeader = false,
      collapseHeaderIconDescription = 'Collapse the page header',
      expandHeaderIconDescription = 'Expand the page header',
      hasCollapseHeaderToggle = false,
      hasBackgroundAlways = true,
      withoutBackground = false,
      navigation,
      pageActions,
      pageHeaderOffset = 0,
      subtitle,
      tags = [],
      title,
      collapseTitle: _collapseTitle,
      actionBarOverflowAriaLabel,
      pageActionsOverflowLabel,
      breadcrumbOverflowAriaLabel: _crumbLabel,
      showAllTagsLabel: _allTags,
      allTagsModalTitle: _allTagsTitle,
      allTagsModalSearchLabel: _allTagsSearch,
      allTagsModalSearchPlaceholderText: _allTagsPlaceholder,
      disableBreadcrumbScroll: _noCrumbScroll,
      enableBreadcrumbScroll: _crumbScroll,
      fullWidthGrid: _fullWidth,
      narrowGrid: _narrow,
      corners: cornersProp,
      frame = 'flush',
      scrollContainer,
      onCollapsedChange,
      motion,
      timeScale = 1,
      style,
      ...rest
    },
    ref
  ) {
    const fade = motion?.fade ?? PAGE_HEADER_MOTION.fade;
    const fadeRef = useLatest(fade);
    const el = useRef<HTMLElement>(null);
    const titleId = `page-header-title-${useId().replace(/:/g, '')}`;
    const reduced = usePrefersReducedMotion();
    const [collapsed, setCollapsed] = useState(collapseHeader);
    const collapsedRef = useLatest(collapsed);
    const reducedRef = useLatest(reduced);
    const timeScaleRef = useLatest(timeScale);
    const onChangeRef = useLatest(onCollapsedChange);
    const pending = useRef<Snapshot | null>(null);
    const running = useRef<Animation[]>([]);
    const resizing = useRef<Animation | null>(null);
    /** The copies of what leaves (the details, buttons), until the move lands. */
    const ghosts = useRef<HTMLElement[]>([]);
    const clearGhosts = useCallback(() => {
      for (const g of ghosts.current) g.remove();
      ghosts.current = [];
    }, []);
    // A layout change round it (a push) changes its rows once, at its start (`atStart`, below), with the refit's jump.
    const measuredClass = useSizeClass(el, undefined, HOLD_IN_LAYOUT);
    const [atStart, setAtStart] = useState<SizeClass | null>(null);
    const sizeClass = atStart ?? measuredClass;
    // A container's corners, as DataTable's and the lists' are: the prop, else a Region's or KitDefaults'.
    const corners: PageHeaderCorners = useContainerCorners(cornersProp);
    // Its controls, one size down from the density around it (PAGE_HEADER_DENSITY).
    const headerDensity =
      PAGE_HEADER_DENSITY[useKitDefaults().density ?? 'default'];
    const controlSize = CONTROL_SIZES[headerDensity];
    const stacked = sizeClass === 'compact';
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const metricsRef = useLatest(metrics);
    const fitInputs: FitInputs = {
      form: collapsed ? 'collapsed' : 'expanded',
      stacked,
      actionList: isActionList(pageActions) ? pageActions : null,
      actionBarItems,
      hasToggle: hasCollapseHeaderToggle,
    };
    const fitInputsRef = useLatest(fitInputs);
    /** A refit's snapshot: the buttons as they were before new metrics moved some into or out of a menu. */
    const refit = useRef<Pick<
      Snapshot,
      'items' | 'clones' | 'edge' | 'height'
    > | null>(null);
    /** A layout change under way round it (a side panel's push): mid-move metrics wait for it to land. */
    const heldFor = useRef<object | null>(null);
    const remeasureRef = useRef<() => void>(() => undefined);
    // New metrics for a class: a refit that moves buttons (a menu, a class's edge) snapshots
    // them first, still in the old layout, so the commit can jump them.
    /** The header's width its metrics were read at. */
    const fitWidth = useRef(-1);
    const commitFit = useCallback(
      (header: HTMLElement, next: Metrics, cls: SizeClass, width: number) => {
        fitWidth.current = width;
        const prev = metricsRef.current;
        const was = header.dataset.sizeClass;
        const crossing = was !== undefined && cls !== was;
        if (
          prev &&
          !reducedRef.current &&
          (crossing ||
            fitKey(fitOf(prev, fitInputsRef.current)) !==
              fitKey(fitOf(next, fitInputsRef.current)))
        ) {
          refit.current = snapshot(header, false, true);
        }
        setMetrics((p) =>
          p && JSON.stringify(p) === JSON.stringify(next) ? p : next
        );
      },
      [metricsRef, reducedRef, fitInputsRef]
    );
    const remeasure = useCallback(() => {
      const header = el.current;
      if (!header || header.dataset.moving !== undefined) return;
      // Held while a layout transaction covers it: a push resizes it every frame,
      // and each frame's refit re-rendered it. Its start read the target (below).
      const tx = inLayout(header);
      if (tx) {
        if (heldFor.current !== tx) {
          heldFor.current = tx;
          void afterLayout(header).then(() => {
            if (heldFor.current !== tx) return;
            heldFor.current = null;
            remeasureRef.current();
          });
        }
        return;
      }
      // A truncated title shows its full text in its tooltip.
      const text = header.querySelector<HTMLElement>(
        '.cds-page-header__title-text'
      );
      const h1 = text?.closest('h1');
      if (text && h1) {
        if (text.scrollWidth > text.clientWidth + 0.5)
          h1.title = text.textContent ?? '';
        else h1.removeAttribute('title');
      }
      const next = measure(header);
      if (next)
        commitFit(
          header,
          next,
          sizeClassOf(header.offsetWidth),
          header.offsetWidth
        );
    }, [commitFit]);
    useLayoutEffect(() => {
      remeasureRef.current = remeasure;
    });
    // The class read at a start holds until the measured one next changes.
    const seenMeasured = useRef(measuredClass);
    useLayoutEffect(() => {
      if (seenMeasured.current === measuredClass) return;
      seenMeasured.current = measuredClass;
      setAtStart(null);
    }, [measuredClass]);
    // A push round it refits at its start: the layout then is the one it lands
    // on, so the buttons jump there as it plays, not once it lands.
    useLayoutEffect(() => {
      const header = el.current;
      if (!header) return;
      let live = true;
      const off = onLayout(header, {
        start: () => {
          if (header.dataset.moving !== undefined) return;
          // A transaction that leaves its width as it is (most round it) changes nothing here.
          const width = header.offsetWidth;
          if (Math.abs(width - fitWidth.current) < 0.5) return;
          const next = measure(header);
          const cls = sizeClassOf(width);
          if (!next) return;
          // Once the opener's move has started, the layout is the old one again: the snapshot, then the new rows, before its first frame.
          queueMicrotask(() => {
            if (!live || header.dataset.moving !== undefined) return;
            flushSync(() => {
              commitFit(header, next, cls, width);
              setAtStart(cls);
            });
          });
          // Where it landed, should a turn have changed it.
          void afterLayout(header).then(
            () => live && setAtStart(sizeClassOf(header.offsetWidth))
          );
        },
      });
      return () => {
        live = false;
        off();
      };
    }, [commitFit]);

    /**
     * The room it keeps (`keptRoom`): whether the change under way asked for
     * it (`keep`), the room it took before the change (its height and the
     * room it kept then, px) and that room it kept, as they were drawn.
     */
    const room = useRef<{ keep: boolean; before: number; kept: number } | null>(
      null
    );
    /** An edge the scroll crossed while it moved, answered once it lands (the scroll's effect sets it). */
    const recheck = useRef<(() => void) | null>(null);
    /** Collapse or expand: the parts' boxes as they are now, then the change. `keep`: a scroll's (see `keptRoom`). */
    const change = useCallback(
      (next: boolean, keep = false) => {
        if (next === collapsedRef.current) return;
        const header = el.current;
        pending.current =
          header && !reducedRef.current ? snapshot(header, next, true) : null;
        if (header) {
          const kept = keptNow(header);
          const before =
            header.getBoundingClientRect().height / drawnScale(header).y + kept;
          room.current = { keep, before, kept };
          // Until the change lays out its room (`keptRoom`, in the same task
          // as the commit, so never drawn), what sticks holds the room it
          // takes now: the commit can't shorten the page under its scroll (a
          // short page's scroll would clamp, losing what collapsed it).
          if (keep)
            hostOf(header).style.setProperty('min-block-size', `${before}px`);
        } else room.current = null;
        setCollapsed(next);
        onChangeRef.current?.(next);
      },
      [collapsedRef, reducedRef, onChangeRef]
    );

    // `collapseHeader`: collapsed while it's true; back with the scroll when it goes false.
    const mounted = useRef(false);
    useLayoutEffect(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      change(collapseHeader);
    }, [collapseHeader, change]);
    const forcedRef = useLatest(collapseHeader);

    /**
     * What the edge opens or closes over (the details expanding, their copy
     * collapsing; the buttons that leave or arrive under it), every frame until
     * `until` have all finished: the top of what's below them (the tabs, else
     * the header's bottom), through the disclosure's soft edge,
     * `min(16px, h, H − h)` for the h of each one's H that's open
     * (page-header.scss, `[data-ph-edge]`).
     */
    const edgeRaf = useRef(0);
    const edgeEls = useRef<HTMLElement[]>([]);
    const stopEdge = useCallback(() => {
      cancelAnimationFrame(edgeRaf.current);
      edgeRaf.current = 0;
      for (const e of edgeEls.current) {
        e.removeAttribute('data-ph-edge');
        e.style.removeProperty('--cds-ph-cut');
        e.style.removeProperty('--cds-ph-edge');
      }
      edgeEls.current = [];
    }, []);
    const followEdge = useCallback(
      (header: HTMLElement, targets: HTMLElement[], until: Animation[]) => {
        stopEdge();
        if (!targets.length) return;
        edgeEls.current = targets;
        // Without the fade (`motion.fade` false), a hard edge.
        const soft = fadeRef.current
          ? parseFloat(
              getComputedStyle(header).getPropertyValue(
                '--cds-motion-soft-edge'
              )
            ) || 16
          : 0;
        const nav = header.querySelector<HTMLElement>('[data-ph-part="nav"]');
        // Where each is laid out, from the header's top (an arrival's
        // translate and its row's travel left out), and its height.
        const laid = targets.map((t) => ({
          t,
          top: layoutTop(t, header),
          H: t.offsetHeight,
        }));
        // Every read first, then every write: a write between two reads would
        // have each read lay the page out again (it did: two to three style
        // recalcs a frame, one per target).
        const k = drawnScale(header).y;
        const write = () => {
          const hr = header.getBoundingClientRect();
          const below =
            nav && nav.offsetHeight > 0
              ? nav.getBoundingClientRect().top
              : hr.bottom;
          const tops = laid.map(({ t }) => t.getBoundingClientRect().top);
          laid.forEach(({ t, top, H }, i) => {
            const h = Math.min(H, Math.max(0, (below - hr.top) / k - top));
            const edge = Math.max(0, Math.min(soft, h, H - h));
            t.style.setProperty('--cds-ph-cut', `${(below - tops[i]!) / k}px`);
            t.style.setProperty('--cds-ph-edge', `${edge}px`);
          });
        };
        for (const t of targets) t.setAttribute('data-ph-edge', '');
        write();
        const tick = () => {
          write();
          edgeRaf.current = requestAnimationFrame(tick);
        };
        edgeRaf.current = requestAnimationFrame(tick);
        // Finished or cancelled from outside: the loop stops once all have
        // settled, so a cancel never leaves it running every frame.
        void Promise.allSettled(until.map((a) => a.finished)).then(
          () => edgeEls.current === targets && stopEdge()
        );
      },
      [stopEdge, fadeRef]
    );

    /** A copy of what left, in its old place, until the move lands (or, for a refit, its jump ends). */
    const ghostAt = useCallback(
      (header: HTMLElement, node: HTMLElement, rect: DOMRect) => {
        node.setAttribute('aria-hidden', 'true');
        node.inert = true;
        node.classList.add('cds-page-header__ghost');
        Object.assign(node.style, {
          insetInlineStart: `${rect.left}px`,
          insetBlockStart: `${rect.top}px`,
          inlineSize: `${rect.width}px`,
          blockSize: `${rect.height}px`,
        });
        header.appendChild(node);
        ghosts.current.push(node);
        return node;
      },
      []
    );

    /**
     * The buttons that fold into a menu button (the page actions into "Page
     * actions", the bar's trailing items into its overflow button) or come back
     * out of one: the selection kit's jump, on boxes (`jumpBoxes`, the side nav's
     * jump between groups). Copies of the buttons leaving shrink out 4px where
     * they were; then the buttons arriving (the menu button, or the buttons back
     * from it) grow in from 4px small where they land; a third of the clock out,
     * two thirds in. On a resize the clock is the jump's own (the glide's
     * shortest, fast-01). On a collapse or expand it's the move's, so the fold's
     * beats are the title's: the out with the title leaving, the in with it
     * arriving, and a menu button never grows in over a breadcrumb still leaving.
     * The edge still passes over the rows it passes: a copy below the closing
     * edge is under it, and so is a button arriving in a row the opening reveals.
     *
     * Every button that changes place jumps the same way: the page actions and
     * the bar going from their rows to the compact row and back, a page-actions
     * node as one box, and on a resize the buttons a fold or a size class's edge
     * puts somewhere else. A button within the jump's 4px of its old place stays.
     */
    const foldJump = useCallback(
      (
        header: HTMLElement,
        snap: Pick<Snapshot, 'items' | 'clones' | 'edge'>,
        now: Pick<Snapshot, 'items' | 'edge'>,
        o: { collapsing?: boolean; ms?: number; timeScale: number }
      ) => {
        // A button that stays in place (within the jump's 4px) doesn't
        // move; one that left, arrived, or changed place jumps.
        const stays = (key: string) => {
          const a = snap.items.get(key);
          const b = now.items.get(key);
          return (
            !!a &&
            !!b &&
            Math.hypot(a.left - b.left, a.top - b.top) <= JUMP_MOVE_PX
          );
        };
        const out: HTMLElement[] = [];
        const under: HTMLElement[] = [];
        for (const [key, rect] of snap.items) {
          if (stays(key)) continue;
          const clone = snap.clones.get(key);
          if (!clone) continue;
          const g = ghostAt(header, clone, rect);
          out.push(g);
          if (o.collapsing === true && rect.bottom > now.edge + 0.5)
            under.push(g);
        }
        const into: HTMLElement[] = [];
        for (const b of header.querySelectorAll<HTMLElement>(ITEMS)) {
          const key = b.dataset.phItem!;
          if (stays(key)) continue;
          const rect = now.items.get(key);
          if (!rect) continue;
          const box = boxOf(b);
          into.push(box);
          if (o.collapsing === false && rect.top >= snap.edge - 0.5)
            under.push(box);
        }
        const { animations } = jumpBoxes({
          out,
          in: into,
          timeScale: o.timeScale,
          clock: o.ms,
        });
        return { animations, out, underEdge: under };
      },
      [ghostAt]
    );

    // The motion: laid out at the end, every part moved back to its old place
    // and brought home on the header's clock.
    useLayoutEffect(() => {
      const snap = pending.current;
      pending.current = null;
      const header = el.current;
      for (const a of running.current) a.cancel();
      running.current = [];
      stopEdge();
      clearGhosts();
      header
        ?.querySelectorAll('[data-ph-roll]')
        .forEach((n) => n.removeAttribute('data-ph-roll'));
      // The room it keeps after this change, and from where (mid-move: where it is).
      const asked = room.current;
      room.current = null;
      const kept =
        header && asked
          ? keptRoom(header, collapsed && asked.keep, asked.before, asked.kept)
          : null;
      if (!snap || !header) {
        if (header) delete header.dataset.moving;
        return;
      }
      const now = snapshot(header, false);
      const collapsing = collapsed;
      // What the swap reads, read now, before anything below starts an
      // animation or adds a copy (each read after one laid the page out again).
      const live = header.querySelector<HTMLElement>(
        '.cds-page-header__grid .cds-page-header__title'
      );
      const liveLine = live && live.offsetHeight > 0 ? lineOf(live) : 0;
      const trail = header.querySelector<HTMLElement>(
        '.cds-page-header__grid .cds-page-header__breadcrumb'
      );
      const trailLine = trail && trail.offsetHeight > 0 ? lineOf(trail) : 0;
      const sepFade = header
        .querySelector<HTMLElement>(
          '.cds-page-header__crumbs .cds-breadcrumb__item[data-last] .cds-breadcrumb__sep'
        )
        ?.getAnimations()
        .find(
          (a): a is CSSTransition =>
            a instanceof CSSTransition && a.transitionProperty === 'opacity'
        );

      // The clock: the step of the farthest travel, collapsing one step faster.
      let far = Math.abs(snap.height - now.height);
      const moves: {
        el: HTMLElement;
        from: DOMRect;
        to: DOMRect;
        part: Part;
        dx: number;
        dy: number;
      }[] = [];
      // The page actions and the bar don't travel: their buttons jump from where they were to where
      // they land (`foldJump`, below), so they set no travel for the clock either.
      header.querySelectorAll<HTMLElement>('[data-ph-part]').forEach((p) => {
        const part = p.dataset.phPart as Part;
        // The title doesn't travel: it swaps in place (below).
        if (part === 'title' || part === 'actions' || part === 'bar') return;
        const from = snap.parts.get(part);
        const to = now.parts.get(part);
        // Not a part hidden in either form (the breadcrumb, collapsed at
        // compact or with no trail): its box there is 0×0 at the viewport's
        // corner, a "travel" of hundreds of px that set a slower clock.
        if (
          !from ||
          !to ||
          (to.width === 0 && to.height === 0) ||
          (from.width === 0 && from.height === 0)
        )
          return;
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        far = Math.max(far, Math.hypot(dx, dy));
        moves.push({ el: p, from, to, part, dx, dy });
      });
      if (far < 0.5) return;
      let token = durationStepForDistance(far);
      if (collapsing) token = stepDown(token);
      const k = timeScaleRef.current;
      const ms = Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * k);
      const easing = bezier('standard-productive');
      // The lead: the header's height. Content below follows it.
      header.dataset.moving = '';
      const lead = animateLayout(
        header.parentElement ?? header,
        header,
        [{ blockSize: `${snap.height}px` }, { blockSize: `${now.height}px` }],
        {
          ms,
          easing,
          reason: collapsing ? 'page-header-collapse' : 'page-header-expand',
        }
      );
      running.current.push(lead.animation);
      // The room it keeps moves with its height, on its clock and its curve,
      // so the two add up to the same on every frame and nothing below moves.
      if (kept && Math.abs(kept.to - kept.from) >= 0.5)
        running.current.push(
          kept.host.animate(
            [
              { marginBlockEnd: `${kept.base + kept.from}px` },
              { marginBlockEnd: `${kept.base + kept.to}px` },
            ],
            { duration: ms, easing }
          )
        );
      const done = () => {
        if (running.current[0] !== lead.animation) return;
        delete header.dataset.moving;
        // A resize while it moved: its fit now, once it has landed.
        remeasure();
        // An edge the scroll crossed while it moved: answered now.
        recheck.current?.();
      };
      lead.animation.finished.then(done, () => {});
      const land = () => clearGhosts();
      lead.animation.finished.then(land, land);

      // The parts, on its clock (each joins its transaction): a translate.
      for (const m of moves) {
        const { dx, dy } = m;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        const { animation } = animateLayout(
          header,
          m.el,
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          {
            ms,
            easing,
          }
        );
        running.current.push(animation);
      }

      // Under the edge: what it closes over (collapsing) or opens over (expanding).
      const underEdge: HTMLElement[] = [];
      const until: Animation[] = [lead.animation];

      // The title: two copies, swapped in place, with no travel across the
      // header and no scale. Collapsing, everything goes up:
      // the large title's copy slides up a whole line, out through a soft edge
      // at its top, on the first third of the clock (exit-productive, the
      // jump's share: it leaves faster); then the compact row's title comes up
      // a whole line from below, in through a soft edge at its bottom, on the
      // rest (entrance-productive), landing with the header. Expanding, the
      // mirror: the small one leaves down, the large one comes down from above.
      // Out, then in: never both drawn whole. The edge is `min(16px, h, H − h)`
      // for the h of its line H in view (the disclosure's), so it grows from
      // nothing and closes to nothing (page-header.scss, `[data-ph-roll]`). The
      // breadcrumb's last slash, the one before the compact title, comes and
      // goes on the same beats. A turn takes up each copy from where it is.
      const dir = collapsing ? -1 : 1;
      let outMs = Math.max(DURATION_FLOOR_MS, ms * JUMP_OUT_SHARE);
      /** A copy leaving: a whole line away (up collapsing, down expanding) on the out beat, from where it is. */
      const leave = (c: Rolled) => {
        const wrap = document.createElement('div');
        wrap.appendChild(c.node);
        ghostAt(header, wrap, c.rect);
        const away = dir * c.line;
        const left = Math.min(1, Math.abs(away - c.roll) / (c.line || 1));
        const d = Math.max(DURATION_FLOOR_MS, ms * JUMP_OUT_SHARE * left);
        running.current.push(
          roll(c.node, c.line, c.roll, away, {
            duration: d,
            easing: bezier('exit-productive'),
          })
        );
        // Under the edge too, should the tabs' top reach it before it has gone.
        underEdge.push(wrap);
        return d;
      };
      /** `el` arriving from a whole line the other way (or from `from`, a turn) on the in beat, landing with the header. */
      const arrive = (el: HTMLElement, line: number, from?: number) => {
        const a = roll(el, line, from ?? -dir * line, 0, {
          duration: Math.max(DURATION_FLOOR_MS, ms - outMs),
          delay: outMs,
          easing: bezier('entrance-productive'),
        });
        a.finished.then(
          () => {
            if (!running.current.includes(a)) return;
            el.removeAttribute('data-ph-roll');
            a.cancel();
          },
          () => {}
        );
        running.current.push(a);
      };
      const swapsTitle = !!snap.title && !!live && liveLine > 0;
      if (snap.title && live && swapsTitle) {
        const t = snap.title;
        outMs = leave(t);
        arrive(
          live,
          liveLine,
          t.waiting != null && Math.sign(t.waiting) === -dir
            ? t.waiting
            : undefined
        );
      }
      // The breadcrumb, where one form has it and the other doesn't (compact:
      // the collapsed row has no room for it), goes and comes the title's way:
      // it went at once, a one-frame pop of the whole trail.
      if (snap.crumbs && !trailLine) leave(snap.crumbs);
      else if (!snap.crumbs && trail && trailLine) arrive(trail, trailLine);
      if (swapsTitle) {
        const inMs = Math.max(DURATION_FLOOR_MS, ms - outMs);
        // The slash before the compact title (the breadcrumb's last one, shown
        // while collapsed): in with the title, out with it.
        // Without the fade (`motion.fade` false) it's there or not, on the
        // same beats: it comes as the in starts and goes as the out ends.
        const f = fadeRef.current;
        sepFade?.effect?.updateTiming(
          collapsing
            ? {
                delay: outMs,
                duration: inMs,
                easing: f
                  ? bezier('entrance-productive')
                  : 'steps(1, jump-start)',
              }
            : {
                delay: 0,
                duration: outMs,
                easing: f ? bezier('exit-productive') : 'steps(1, jump-end)',
              }
        );
      }

      // The details fade in place on the title's beats, out collapsing, in expanding: no travel, so
      // nothing in them shifts. The edge still cuts them where the header ends.
      const fadeDetails = fadeRef.current;
      const inBeat = Math.max(DURATION_FLOOR_MS, ms - outMs);
      if (snap.ghost) {
        const copy = ghostAt(header, snap.ghost.node, snap.ghost.rect);
        if (fadeDetails)
          running.current.push(
            copy.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: outMs,
              easing: 'linear',
              fill: 'forwards',
            })
          );
        underEdge.push(copy);
      } else if (!collapsing) {
        const details = header.querySelector<HTMLElement>(
          '.cds-page-header__details'
        );
        if (details) {
          if (fadeDetails) {
            const arrive = details.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: inBeat,
              delay: outMs,
              easing: 'linear',
              fill: 'backwards',
            });
            running.current.push(arrive);
            until.push(arrive);
          }
          underEdge.push(details);
        }
      }

      // Ghost: the collapsed row's hairline fades in on the shortest presence
      // fade as the compact title lands, and out as the large one starts back.
      if (header.classList.contains('cds-page-header--ghost')) {
        const fade = Math.min(ms, motionTokens.duration[SNAP_FADE_SHORT] * k);
        running.current.push(
          header.animate(
            collapsing
              ? [{ opacity: 0 }, { opacity: 1 }]
              : [{ opacity: 1 }, { opacity: 0 }],
            {
              pseudoElement: '::before',
              duration: fade,
              delay: collapsing ? ms - fade : 0,
              // Without the fade (`motion.fade` false), there or not, on the same beat.
              easing: fadeRef.current
                ? 'linear'
                : collapsing
                  ? 'steps(1, jump-end)'
                  : 'steps(1, jump-start)',
              fill: 'backwards',
            }
          )
        );
      }

      // The buttons folding into a menu button or coming back out of one.
      const fold = foldJump(header, snap, now, {
        collapsing,
        ms,
        timeScale: k,
      });
      running.current.push(...fold.animations);
      underEdge.push(...fold.underEdge);
      followEdge(header, underEdge, until);
    }, [
      collapsed,
      timeScaleRef,
      fadeRef,
      followEdge,
      stopEdge,
      remeasure,
      clearGhosts,
      ghostAt,
      foldJump,
    ]);

    // A resize across a size class changes the layout at once: a collapse or
    // expand in progress lands first, so nothing is left where the old layout
    // put it. (Before the refit's jump below, which this would otherwise land
    // as soon as it started.)
    const seenSize = useRef(sizeClass);
    useLayoutEffect(() => {
      if (seenSize.current === sizeClass) return;
      seenSize.current = sizeClass;
      for (const a of running.current) a.finish();
    }, [sizeClass]);

    // A refit (a resize, not a collapse) that moved buttons into or out of a
    // menu, or across a size class's edge: the fold's jump, from where each
    // button stood to where it is. The rows themselves change at once, as a
    // resize does; the copies go once their out has played.
    useLayoutEffect(() => {
      const snap = refit.current;
      refit.current = null;
      const header = el.current;
      if (!snap || !header || header.dataset.moving !== undefined) return;
      const { animations, out } = foldJump(
        header,
        snap,
        snapshot(header, false),
        { timeScale: timeScaleRef.current }
      );
      // Refits between collapses keep only what still plays (the first is a collapse's lead, which its own end checks).
      running.current = running.current.filter(
        (a, i) =>
          i === 0 || (a.playState !== 'finished' && a.playState !== 'idle')
      );
      running.current.push(...animations);
      // Its height (a row of page actions added or gone) is a move, as the recipe's toolbar row: what's below goes with it.
      const to = header.offsetHeight;
      const from = snap.height;
      const root = hostOf(header).parentElement;
      if (root && Math.abs(to - from) >= 0.5) {
        const t = reflowTiming(Math.abs(to - from), timeScaleRef.current);
        const { animation } = animateLayout(
          root,
          header,
          [{ blockSize: `${from}px` }, { blockSize: `${to}px` }],
          {
            ms: Math.max(DURATION_FLOOR_MS, t.ms),
            easing: `cubic-bezier(${t.ease.join(', ')})`,
            reason: 'page-header-refit',
            reduced: false,
          }
        );
        header.dataset.phResizing = '';
        // Only the latest refit clears the clip, so an overlapping one keeps it.
        resizing.current = animation;
        const done = () => {
          if (resizing.current === animation) delete header.dataset.phResizing;
        };
        animation.finished.then(done, done);
        running.current.push(animation);
      }
      const gone = () => {
        for (const g of out) {
          g.remove();
          ghosts.current = ghosts.current.filter((n) => n !== g);
        }
      };
      Promise.all(animations.map((a) => a.finished)).then(gone, gone);
    });

    // Which rows the copy has (the observer below watches each).
    const sizerShape = [
      !!title,
      breadcrumbs.length > 0,
      isActionList(pageActions) && pageActions.length > 0,
      actionBarItems.length,
      hasCollapseHeaderToggle,
    ].join();

    // The fit's metrics: after every commit that changed the copy, the node actions or the title (`markupKey`,
    // no layout read), and as the header or the copy's rows resize; never mid-move (`done`, above, lands it).
    const measuredKey = useRef<string | null>(null);
    useLayoutEffect(() => {
      const header = el.current;
      if (!header) return;
      // The grid's inline padding (an inset from round it): a style read, no layout.
      const grid = header.querySelector(':scope > .cds-page-header__grid');
      const gs = grid ? getComputedStyle(grid) : null;
      const key = [
        gs ? `${gs.paddingInlineStart} ${gs.paddingInlineEnd}` : '',
        markupKey(header.querySelector(':scope > .cds-page-header__sizer')),
        markupKey(
          header.querySelector('.cds-page-header__actions[data-ph-fixed]')
        ),
        header.querySelector('.cds-page-header__title-text')?.textContent,
      ].join('\u0000');
      if (key === measuredKey.current) return;
      // Mid-move it waits: the next commit after the move measures.
      if (header.dataset.moving === undefined) measuredKey.current = key;
      remeasure();
    });
    useLayoutEffect(() => {
      const header = el.current;
      const sizer = header?.querySelector(':scope > .cds-page-header__sizer');
      if (!header || !sizer || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => remeasure());
      ro.observe(header);
      for (const row of sizer.children) ro.observe(row);
      return () => ro.disconnect();
    }, [remeasure, sizerShape]);

    // The scroll: collapse past COLLAPSE_AT, expand at the top. Edges only, so
    // a collapse from the toggle holds until the next crossing.
    useEffect(() => {
      const header = el.current;
      if (!header) return;
      const scroller = scrollContainer ?? scrollerOf(header);
      const target: HTMLElement | Window = scroller ?? window;
      const anchorEl =
        scroller ?? (document.scrollingElement as HTMLElement | null);
      // The header's height changing above the content must not move the
      // scroll position (scroll anchoring would, and expand it again).
      const prevAnchor =
        anchorEl?.style.getPropertyValue('overflow-anchor') ?? '';
      anchorEl?.style.setProperty('overflow-anchor', 'none');
      const read = () => (scroller ? scroller.scrollTop : window.scrollY);
      let zone: 'top' | 'past' | 'between' = 'top';
      // An edge crossed while it moves: answered once it lands (`recheck`), so
      // a page scrolled back to the top while it collapses expands there (and
      // one scrolled down while it expands collapses).
      let missed = false;
      const answer = () => {
        if (forcedRef.current) return;
        if (header.dataset.moving !== undefined) {
          missed = true;
          return;
        }
        // Collapsing on the scroll, it keeps the room it gives up (`keptRoom`),
        // so the page's height and its scroll don't change: a short page can
        // collapse too, rather than stay expanded with the content sliding under it.
        if (zone === 'past' && !collapsedRef.current) change(true, true);
        else if (zone === 'top' && collapsedRef.current) change(false);
      };
      const onScroll = () => {
        const y = read();
        const z = y <= EXPAND_AT ? 'top' : y > COLLAPSE_AT ? 'past' : 'between';
        if (z === zone) return;
        zone = z;
        answer();
      };
      // The soft edge at its bottom, content disappearing into it: how far the content below has gone
      // under what sticks, clamped to the soft-edge token, so the edge grows over the first 16px, as
      // the Scroller's does (softEdge.ts, which leaves a side with a sticky header on it to the
      // header). Read off the next box below what sticks.
      const under = underEdge(header, read);
      recheck.current = () => {
        under.reset();
        if (!missed) return;
        missed = false;
        answer();
      };
      const onScrollAll = () => {
        onScroll();
        under.schedule();
      };
      target.addEventListener('scroll', onScrollAll, { passive: true });
      // A resize can move what's below it: read it all again.
      window.addEventListener('resize', under.reset);
      onScroll();
      under.schedule();
      return () => {
        recheck.current = null;
        under.stop();
        target.removeEventListener('scroll', onScrollAll);
        window.removeEventListener('resize', under.reset);
        if (prevAnchor)
          anchorEl?.style.setProperty('overflow-anchor', prevAnchor);
        else anchorEl?.style.removeProperty('overflow-anchor');
      };
    }, [scrollContainer, change, collapsedRef, forcedRef]);

    useEffect(
      () => () => {
        for (const a of running.current) a.cancel();
        for (const g of ghosts.current) g.remove();
        cancelAnimationFrame(edgeRaf.current);
        // The room it kept, given back.
        const header = el.current;
        if (header) hostOf(header).style.removeProperty('margin-block-end');
      },
      []
    );

    const titleText = typeof title === 'string' ? title : title?.text;
    const TitleIcon = typeof title === 'object' ? title?.icon : undefined;
    const hasDetails = subtitle != null || children != null || tags.length > 0;
    const actionList = fitInputs.actionList;
    const hasBar = actionBarItems.length > 0 || hasCollapseHeaderToggle;

    // The fit (fit.ts): for this form, at this width, from the metrics.
    const fit = fitOf(metrics, fitInputs);
    const movedBar = new Set(fit.bar);
    const pageMenuLabel = textOf(pageActionsOverflowLabel) || 'Page actions';

    const crumbs = () => (
      // Its last slash is the one before the compact title: shown while collapsed with a title.
      <Breadcrumb
        className="cds-page-header__breadcrumb"
        noTrailingSlash={!(collapsed && titleText)}
        timeScale={timeScale}>
        {breadcrumbs.map((b) => (
          <BreadcrumbItem key={b.key} isCurrentPage={b.isCurrentPage}>
            {b.href && !b.isCurrentPage ? (
              <a href={b.href} title={b.title} onClick={b.onClick}>
                {b.label}
              </a>
            ) : (
              <span title={b.title}>{b.label}</span>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    );
    const pageButton = (a: PageHeaderPageAction, sizing = false) => (
      <Button
        key={a.key}
        data-ph-key={sizing ? a.key : undefined}
        data-ph-item={sizing ? undefined : `page:${a.key}`}
        kind={a.kind}
        variant={a.variant}
        frame={a.frame}
        size={controlSize}
        renderIcon={a.renderIcon}
        disabled={a.disabled}
        href={sizing ? undefined : a.href}
        onClick={sizing ? undefined : a.onClick}
        timeScale={timeScale}>
        {a.label}
      </Button>
    );
    const barButton = (a: PageHeaderActionBarItem, sizing = false) => (
      <Button
        key={a.key}
        data-ph-key={sizing ? a.key : undefined}
        data-ph-item={sizing ? undefined : `bar:${a.key}`}
        frame="ghost"
        size={controlSize}
        hasIconOnly
        renderIcon={a.renderIcon}
        iconDescription={a.iconDescription}
        tooltipPosition="bottom"
        href={sizing ? undefined : a.href}
        disabled={a.disabled}
        onClick={sizing ? undefined : a.onClick}
        timeScale={timeScale}
      />
    );
    /** A moved action runs from its menu item as from its button: its onClick, then its href. */
    const activate =
      (
        onClick: ((e: MouseEvent<HTMLElement>) => void) | undefined,
        href: string | undefined
      ) =>
      (e: { defaultPrevented: boolean }) => {
        onClick?.(e as MouseEvent<HTMLElement>);
        if (href && !e.defaultPrevented) window.location.assign(href);
      };
    // The page actions folded (IBM Products' ButtonSetWithOverflow): one
    // "Page actions" MenuButton in their place, md, the primary role, its menu
    // below it; the items last to first (ButtonSetWithOverflow reverses them),
    // default or danger, text only, as its MenuItems are.
    const pageMenu =
      fit.pageFolded && actionList ? (
        <MenuButton
          key="cds-page-header-page-menu"
          className="cds-page-header__page-menu"
          data-ph-item="page-menu"
          label={pageMenuLabel}
          size={controlSize}
          menuAlignment="bottom"
          timeScale={timeScale}>
          {[...actionList].reverse().map((a) => (
            <MenuItem
              key={a.key}
              label={textOf(a.label) || a.key}
              kind={a.kind === 'danger' ? 'danger' : 'default'}
              disabled={a.disabled}
              onClick={activate(a.onClick, a.href)}
            />
          ))}
        </MenuButton>
      ) : null;
    // The bar's items that don't fit (IBM Products' ActionBar): its trailing
    // ones, in order, in an OverflowMenu at its end, each by its label with
    // its icon; the menu below, its end on the button's (`flipped`).
    const overflow = fit.bar.length ? (
      <OverflowMenu
        key="cds-page-header-overflow"
        className="cds-page-header__overflow"
        data-ph-item="overflow"
        label={actionBarOverflowAriaLabel}
        size={controlSize}
        renderIcon={OverflowMenuVertical}
        flipped
        timeScale={timeScale}>
        {actionBarItems
          .filter((a) => movedBar.has(a.key))
          .map((a) => (
            <MenuItem
              key={a.key}
              label={a.label ?? a.iconDescription}
              renderIcon={a.renderIcon}
              disabled={a.disabled}
              onClick={activate(a.onClick, a.href)}
            />
          ))}
      </OverflowMenu>
    ) : null;

    return (
      <header
        {...rest}
        ref={mergeRefs(ref, el)}
        className={cx(
          'cds-page-header',
          collapsed
            ? 'cds-page-header--collapsed'
            : 'cds-page-header--expanded',
          (withoutBackground || !hasBackgroundAlways) &&
            'cds-page-header--clear',
          navigation != null && 'cds-page-header--with-nav',
          breadcrumbs.length === 0 && 'cds-page-header--no-crumbs',
          corners === 'rounded' && 'cds-page-header--rounded',
          frame === 'ghost' && 'cds-page-header--ghost',
          className
        )}
        data-frame={frame}
        data-collapsed={collapsed || undefined}
        data-ph-fade={fade ? undefined : 'none'}
        data-size-class={sizeClass}
        data-overflow={
          fit.pageFolded || fit.bar.length
            ? [...(fit.pageFolded ? ['page-actions'] : []), ...fit.bar].join(
                ' '
              )
            : undefined
        }
        aria-labelledby={titleText ? titleId : undefined}
        style={{
          ...style,
          ['--cds-page-header-offset' as string]: `${pageHeaderOffset}px`,
        }}>
        <div className="cds-page-header__grid">
          <div className="cds-page-header__crumbs" data-ph-part="crumbs">
            {breadcrumbs.length ? crumbs() : null}
          </div>
          {titleText ? (
            <div className="cds-page-header__title-cell">
              <h1
                id={titleId}
                className="cds-page-header__title"
                data-ph-part="title">
                {TitleIcon ? (
                  <span
                    className="cds-page-header__title-icon"
                    aria-hidden="true">
                    <TitleIcon size={32} />
                  </span>
                ) : null}
                <span className="cds-page-header__title-text">{titleText}</span>
              </h1>
            </div>
          ) : null}
          {pageActions != null ? (
            <div
              className="cds-page-header__actions"
              data-ph-part="actions"
              data-ph-fixed={actionList ? undefined : ''}
              // A node of your own moves as one box (it jumps: foldJump).
              data-ph-item={actionList ? undefined : 'page:node'}>
              {actionList ? (
                (pageMenu ?? actionList.map((a) => pageButton(a)))
              ) : (
                // Its controls at the header's size, as the header's own (PAGE_HEADER_DENSITY).
                <KitDefaults density={headerDensity}>
                  {pageActions as ReactNode}
                </KitDefaults>
              )}
            </div>
          ) : null}
          {hasBar ? (
            <div className="cds-page-header__bar" data-ph-part="bar">
              {actionBarItems
                .filter((a) => !movedBar.has(a.key))
                .map((a) => barButton(a))}
              {overflow}
              {hasCollapseHeaderToggle ? (
                <CollapsedContext.Provider value={collapsed}>
                  <Button
                    data-ph-item="toggle"
                    frame="ghost"
                    size={controlSize}
                    hasIconOnly
                    renderIcon={CollapseIcon}
                    iconDescription={
                      collapsed
                        ? expandHeaderIconDescription
                        : collapseHeaderIconDescription
                    }
                    tooltipPosition="bottom"
                    aria-expanded={!collapsed}
                    onClick={() => change(!collapsedRef.current)}
                    timeScale={timeScale}
                  />
                </CollapsedContext.Provider>
              ) : null}
            </div>
          ) : null}
          {hasDetails ? (
            <div className="cds-page-header__details" hidden={collapsed}>
              {subtitle != null ? (
                <p className="cds-page-header__subtitle">{subtitle}</p>
              ) : null}
              {children != null ? (
                <div className="cds-page-header__available">{children}</div>
              ) : null}
              {tags.length ? (
                <ul className="cds-page-header__tags" aria-label="Tags">
                  {tags.map((t, i) => (
                    <li key={t.key ?? t.id ?? i}>
                      <Tag type={t.type ?? 'gray'} size="md" arrive={false}>
                        {t.label}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {navigation != null ? (
            <div className="cds-page-header__nav" data-ph-part="nav">
              {navigation}
            </div>
          ) : null}
        </div>
        {/* The fit's copy: each part at its own width, whatever the form and
          whatever has moved (page-header.scss). Hidden, inert, out of flow. */}
        <div
          className="cds-page-header__sizer"
          aria-hidden="true"
          {...inertProps(true)}>
          <span
            className="cds-page-header__sizer-gap cds-page-header__sizer-gap--expanded"
            data-ph-size="gap-expanded"
          />
          <span
            className="cds-page-header__sizer-gap cds-page-header__sizer-gap--collapsed"
            data-ph-size="gap-collapsed"
          />
          {actionList?.length ? (
            <>
              <span
                className="cds-page-header__sizer-row cds-page-header__sizer-actions"
                data-ph-size="actions">
                {actionList.map((a) => pageButton(a, true))}
              </span>
              <span className="cds-page-header__sizer-row">
                <MenuButton
                  data-ph-size="page-menu"
                  label={pageMenuLabel}
                  size={controlSize}
                  tabIndex={-1}
                />
              </span>
            </>
          ) : null}
          <span
            className="cds-page-header__sizer-row cds-page-header__sizer-bar"
            data-ph-size="bar">
            {actionBarItems.map((a) => barButton(a, true))}
            {hasCollapseHeaderToggle ? (
              <Button
                data-ph-size="toggle"
                frame="ghost"
                size={controlSize}
                hasIconOnly
                renderIcon={CollapseIcon}
                iconDescription={collapseHeaderIconDescription}
              />
            ) : null}
            <OverflowMenu
              data-ph-size="trigger"
              size={controlSize}
              renderIcon={OverflowMenuVertical}
              label=""
              tabIndex={-1}
            />
          </span>
        </div>
      </header>
    );
  }
);
PageHeader.displayName = 'PageHeader';
