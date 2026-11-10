/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Resource index: find, filter and act on many items of one kind. The pilot recipe. */
import { defineRecipe } from './define';

export const resourceIndex = defineRecipe({
  id: 'resource-index',
  title: 'Resource index',
  use: 'Find, filter and act on many items of one kind (roughly 10 or more): search, filter, sort, and act on several at once.',
  avoid: 'A handful of items (use a list), or one item (use a details page).',
  density: 'default',
  regions: {
    header: {
      role: 'header',
      accepts: ['Header'],
      surface: 'page',
      note: 'The product’s global header, from the app shell: ghost, the nav column’s top row, its actions at the column’s foot (the logo alone on the rail); a bar at compact.',
    },
    nav: {
      role: 'nav',
      accepts: ['SideNav'],
      surface: 'page',
      note: 'The product’s navigation, ghost on the page beside the workspace: an overlay at compact, a rail at medium, a column wider.',
    },
    pageHeader: {
      role: 'page-header',
      accepts: ['PageHeader'],
      required: true,
      surface: 'page',
      note: 'The title, a short description and the primary action, at the top of the workspace (the app shell’s main: its own rounded surface, inverse, 16px corners; flush and square at compact).',
    },
    toolbar: {
      role: 'bar',
      accepts: [
        'Search',
        'Dropdown',
        'MultiSelect',
        'Button',
        'IconButton',
        'MenuButton',
      ],
      density: 'compact',
      surface: 'page',
      note: 'Search, the filters and the table actions. At compact width the filters fold into a button that opens the panel.',
    },
    filters: {
      role: 'bar',
      accepts: ['FilterSummary', 'TagSet', 'Button'],
      surface: 'page',
      note: 'The filters in use, each a DismissibleTag in a TagSet (dismissing one clears that filter), and Clear filters. Absent when none are.',
    },
    main: {
      role: 'main',
      accepts: ['DataTable', 'DataTableReveal', 'EmptyState'],
      required: true,
      surface: 'quiet',
      corners: 'rounded',
      scroll: 'page',
      note: 'The table (a DataTableReveal, so its rows reveal out of its skeleton and reflow when a filter changes them), or what shows instead of it: first use, no results, an error.',
    },
    batch: {
      role: 'bar',
      accepts: ['ContextualBar'],
      surface: 'quiet',
      note: 'The selected rows’ actions, while any are selected.',
    },
    footer: { role: 'footer', accepts: ['Pagination'], surface: 'page' },
    panel: {
      role: 'panel',
      accepts: ['FilterPanel', 'SidePanel'],
      surface: 'quiet',
      width: { default: 320, min: 280, max: 480 },
      note: 'The filters, in full: an inset panel of its own, pushed beside main where there’s room, over the page at medium, a sheet at compact.',
    },
  },
  layouts: {
    compact: { panes: ['main'], panel: 'sheet', fold: { toolbar: 'menu' } },
    medium: { panes: ['main'], panel: 'over' },
    expanded: { panes: ['main', 'panel'], panel: 'push' },
    large: { panes: ['main', 'panel'], panel: 'push' },
  },
  states: [
    'loading',
    'first-use',
    'loaded',
    'filtered-empty',
    'batch',
    'panel-open',
    'error',
  ],
  transitions: [
    {
      from: 'loading',
      to: 'loaded',
      lead: 'main',
      primitive: 'structure-reveal',
      follows: ['footer'],
      defers: ['filters'],
    },
    {
      from: 'loaded',
      to: 'loaded',
      reason: 'a filter changes',
      lead: 'main',
      primitive: 'reflow',
      holds: ['toolbar'],
      follows: ['filters'],
    },
    {
      from: 'loaded',
      to: 'batch',
      lead: 'batch',
      primitive: 'contextual-bar',
      holds: ['main'],
    },
    {
      from: 'loaded',
      to: 'panel-open',
      lead: 'panel',
      primitive: 'push',
      follows: ['main'],
      holds: ['toolbar'],
    },
    {
      from: 'loaded',
      to: 'filtered-empty',
      lead: 'main',
      primitive: 'content-swap',
    },
    { from: 'loaded', to: 'error', lead: 'main', primitive: 'content-swap' },
    {
      from: 'loading',
      to: 'first-use',
      lead: 'main',
      primitive: 'content-swap',
    },
  ],
});
