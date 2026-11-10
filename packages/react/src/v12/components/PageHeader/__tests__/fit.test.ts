/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  barWidth,
  fitPageHeaderActions,
  rightRoom,
  type PageHeaderFitInput,
} from '../components/fit';

/**
 * The lab's header, by its measured widths: Edit (93) and Deploy (113), a
 * 140px "Page actions" MenuButton, three 40px bar buttons and the 40px
 * overflow button; at 400px the grid's content is 366px.
 */
const LAB: PageHeaderFitInput = {
  form: 'collapsed',
  stacked: true,
  room: 366,
  gap: 8,
  pageActions: [
    { key: 'edit', width: 93 },
    { key: 'deploy', width: 113 },
  ],
  pageMenu: 140,
  fixedActions: 0,
  pageGap: 8,
  bar: [
    { key: 'share', width: 40 },
    { key: 'download', width: 40 },
    { key: 'settings', width: 40 },
  ],
  barGap: 2,
  barEnd: -8,
  toggle: 0,
  trigger: 40,
};
const at = (over: Partial<PageHeaderFitInput>): PageHeaderFitInput => ({
  ...LAB,
  ...over,
});
const ALL_BAR = ['share', 'download', 'settings'];

describe('PageHeader fit: the split (IBM Products 60 / 40 from md, 75 / 25 below)', () => {
  it('the right section is 40% of the row from md up, 25% below, less the gap', () => {
    expect(rightRoom({ room: 866, gap: 16, stacked: false })).toBeCloseTo(
      0.4 * 850
    );
    expect(rightRoom({ room: 366, gap: 16, stacked: true })).toBeCloseTo(
      0.25 * 350
    );
  });

  it("the bar's width counts its menu button only when an item moved, and the collapse button always", () => {
    expect(barWidth(LAB, 3)).toBe(3 * 40 + 2 * 2 - 8);
    expect(barWidth(LAB, 1)).toBe(2 * 40 + 2 - 8);
    expect(barWidth(at({ toggle: 40 }), 0)).toBe(2 * 40 + 2 - 8);
  });
});

describe('PageHeader fit: the page actions fold as a set', () => {
  it('collapsed at 400: the whole set, primary included, into the MenuButton; the bar into its menu', () => {
    expect(fitPageHeaderActions(LAB)).toEqual({
      pageFolded: true,
      bar: ALL_BAR,
    });
  });

  it('expanded at 400: the set has its own row and stays; the bar keeps what fits its 25%', () => {
    expect(fitPageHeaderActions(at({ form: 'expanded', gap: 16 }))).toEqual({
      pageFolded: false,
      bar: ['download', 'settings'],
    });
  });

  it('expanded at compact, the set folds only when it is wider than the row', () => {
    expect(
      fitPageHeaderActions(at({ form: 'expanded', gap: 16, room: 200 }))
        .pageFolded
    ).toBe(true);
  });

  it('at 600 collapsed (still compact) the set folds; expanded nothing moves', () => {
    expect(fitPageHeaderActions(at({ room: 566 }))).toEqual({
      pageFolded: true,
      bar: ALL_BAR,
    });
    expect(
      fitPageHeaderActions(at({ room: 566, form: 'expanded', gap: 16 }))
    ).toEqual({ pageFolded: false, bar: [] });
  });

  it('at 900 nothing moves, expanded or collapsed', () => {
    expect(fitPageHeaderActions(at({ room: 866, stacked: false }))).toEqual({
      pageFolded: false,
      bar: [],
    });
    expect(
      fitPageHeaderActions(
        at({ room: 866, stacked: false, form: 'expanded', gap: 16 })
      )
    ).toEqual({ pageFolded: false, bar: [] });
  });

  it('expanded wider, the set folds when it is wider than its 40%, however short the title', () => {
    const three = at({
      stacked: false,
      form: 'expanded',
      gap: 16,
      room: 700,
      pageActions: [...LAB.pageActions, { key: 'more', width: 120 }],
    });
    // 93 + 8 + 113 + 8 + 120 = 342 > 0.4 × 684.
    expect(fitPageHeaderActions(three).pageFolded).toBe(true);
  });

  it('collapsed wider, the set stays buttons only beside the whole bar', () => {
    // 0.4 × (800 − 8) = 316.8: the set and the whole bar (214 + 8 + 116 = 338) don't fit; folded, the bar does.
    expect(fitPageHeaderActions(at({ room: 800, stacked: false }))).toEqual({
      pageFolded: true,
      bar: [],
    });
  });

  it('a node of page actions never folds; the bar works in what it leaves', () => {
    const fit = fitPageHeaderActions(
      at({ room: 866, stacked: false, pageActions: [], fixedActions: 300 })
    );
    expect(fit.pageFolded).toBe(false);
    expect(fit.bar.length).toBeGreaterThan(0);
  });
});

describe('PageHeader fit: the bar gives up its items from the end', () => {
  it('keeps its leading items, in order', () => {
    // 0.4 × 692 = 276.8; beside a 180px MenuButton, 276.8 − 180 − 8 = 88.8:
    // Share and the menu button (40 + 2 + 40 − 8 = 74), not two and it (116).
    const fit = fitPageHeaderActions(
      at({ room: 700, stacked: false, pageMenu: 180 })
    );
    expect(fit).toEqual({ pageFolded: true, bar: ['download', 'settings'] });
  });

  it('the collapse button never moves; with no room at all only the menu button and it remain', () => {
    expect(fitPageHeaderActions(at({ toggle: 40 }))).toEqual({
      pageFolded: true,
      bar: ALL_BAR,
    });
  });

  it('without page actions the bar has the whole right section', () => {
    expect(
      fitPageHeaderActions(at({ pageActions: [], room: 566 })).bar
    ).toEqual([]);
  });
});
