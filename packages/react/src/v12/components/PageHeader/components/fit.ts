/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * PageHeader's fit: what folds
 * into the two overflow menus, for one form at one width. Pure: the widths
 * come in, what moved goes out. IBM Products' PageHeader, read from its
 * source (PageHeader.tsx, _page-header.scss, ButtonSetWithOverflow,
 * ActionBar, useOverflowItems):
 *
 *   split     each row is split between a left section (the breadcrumb; the
 *             title) and a right one (the action bar; the page actions):
 *             60% / 40% from md (672px) up, 75% / 25% below it
 *             (`$left-section-std-width`, `$left-section-alt-width`). Below
 *             md, expanded, the title and the page actions each take the
 *             whole row instead, the actions under the title. Collapsed, the
 *             page actions join the action bar in the right section
 *   page      the page actions are a set (ButtonSetWithOverflow): all of
 *             them as buttons when the set fits its room, else all of them,
 *             the primary included, in one "Page actions" MenuButton. The
 *             primary never stays out on its own. Collapsed, the set stays
 *             buttons only when it fits beside the whole action bar
 *   bar       the action bar keeps its leading items and gives up the rest
 *             from its end into its OverflowMenu, at its end (useOverflowItems),
 *             in the room the page actions leave it
 *   title     no minimum of its own: it takes what the right section leaves
 *             and truncates there, its full text in its tooltip
 * ========================================================================== */

export type PageHeaderForm = 'expanded' | 'collapsed';

export interface PageHeaderFitItem {
  key: string;
  /** Its width, px (border box). */
  width: number;
}

export interface PageHeaderFitInput {
  form: PageHeaderForm;
  /** Below md (the compact size class): the 75 / 25 split, and expanded, the page actions on a row of their own. */
  stacked: boolean;
  /** The grid's content width, px (inside its inline padding). */
  room: number;
  /** The grid's column gap in this form, px. */
  gap: number;
  /** The page actions as descriptions, in order (none when they're a node). */
  pageActions: readonly PageHeaderFitItem[];
  /** The "Page actions" MenuButton, px. */
  pageMenu: number;
  /** Page actions given as a node: their width, px. They never fold. */
  fixedActions: number;
  /** The gap between page actions, px. */
  pageGap: number;
  /** The action bar's items, in order. */
  bar: readonly PageHeaderFitItem[];
  /** The gap between the bar's buttons, px. */
  barGap: number;
  /** The bar's inline-end margin, px (negative: its ghost buttons sit flush with the edge's text). */
  barEnd: number;
  /** The collapse button's width, px; 0 without one. It never folds. */
  toggle: number;
  /** The bar's OverflowMenu button, px. */
  trigger: number;
}

export interface PageHeaderFit {
  /** The page actions are folded into the "Page actions" MenuButton. */
  pageFolded: boolean;
  /** The bar items' keys that moved into its OverflowMenu, in their order (the trailing ones). */
  bar: string[];
}

/** IBM Products' right section: 40% of the row from md up, 25% below. */
export const RIGHT_SHARE = { wide: 0.4, narrow: 0.25 } as const;

/** Half a pixel of rounding. */
const EPSILON = 0.5;

/** A row of widths with a gap between each. */
const run = (widths: readonly number[], gap: number) =>
  widths.length
    ? widths.reduce((s, w) => s + w, 0) + gap * (widths.length - 1)
    : 0;

/** The right section's track, px: its share of the row, less the gap between the two. */
export function rightRoom(
  input: Pick<PageHeaderFitInput, 'room' | 'gap' | 'stacked'>
): number {
  return (
    (input.stacked ? RIGHT_SHARE.narrow : RIGHT_SHARE.wide) *
    Math.max(0, input.room - input.gap)
  );
}

/** The page actions' width as buttons (or a node's), px. */
export function pageSetWidth(input: PageHeaderFitInput): number {
  return (
    run(
      input.pageActions.map((a) => a.width),
      input.pageGap
    ) + input.fixedActions
  );
}

/** The bar's width with its first `n` items (and the menu button when any moved), px. */
export function barWidth(input: PageHeaderFitInput, n: number): number {
  if (!input.bar.length && !input.toggle) {
    return 0;
  }
  const widths = input.bar.slice(0, n).map((b) => b.width);
  if (n < input.bar.length) {
    widths.push(input.trigger);
  }
  if (input.toggle > 0) {
    widths.push(input.toggle);
  }
  return Math.max(0, run(widths, input.barGap) + input.barEnd);
}

/** How many of the bar's leading items fit `room` (none: only its menu button). */
function barFit(input: PageHeaderFitInput, room: number): number {
  for (let n = input.bar.length; n > 0; n--) {
    if (barWidth(input, n) <= room + EPSILON) {
      return n;
    }
  }
  return 0;
}

export function fitPageHeaderActions(input: PageHeaderFitInput): PageHeaderFit {
  const set = pageSetWidth(input);
  const canFold = input.pageActions.length > 0;
  const right = rightRoom(input);
  let pageFolded: boolean;
  let barRoom: number;
  if (input.form === 'collapsed') {
    // One right section for both: the set stays buttons only beside the whole bar.
    const hasPage = canFold || input.fixedActions > 0;
    const hasBar = input.bar.length > 0 || input.toggle > 0;
    const between = hasPage && hasBar ? input.gap : 0;
    pageFolded =
      canFold &&
      set + between + barWidth(input, input.bar.length) > right + EPSILON;
    barRoom = right - (pageFolded ? input.pageMenu : set) - between;
  } else {
    // Expanded, each row on its own: the page actions in the title row's
    // right section (the whole row below md), the bar in the breadcrumb row's.
    pageFolded =
      canFold && set > (input.stacked ? input.room : right) + EPSILON;
    barRoom = right;
  }
  const n = barFit(input, barRoom);
  return { pageFolded, bar: input.bar.slice(n).map((b) => b.key) };
}
