/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The behavior scenarios: a component in a host (a `V12/Scenes` story),
// its arguments, what it does, what is tracked and which rules hold.
//
//   id             unique, `<component>/<what>`
//   component      the lane folder (packages/react/src/v12/components/<it>)
//   host           the scene story: inset-shell, flush-shell, in-scroller,
//                  page-scroll
//   args           the story's arguments (subject, frame, size, placement…)
//   rtl            right to left
//   themes         default v12 light; reduced: default [false, true]
//   setup          steps before sampling: scrollTo, set, click
//   track          { name: selector | 'viewport' | { sel, nth, shown } }
//   scroller       the scrolling element's selector; the window when absent
//   actions        set, turn, repeat, wheel, theme, hover, click, wait
//                  (src/behaviors.js)
//   paint          { docked, container }: check the compositor's frames
//   checks         [invariant, options] (src/invariants.js)
//   reducedChecks  under reduced motion, in place of `checks`
//   known          a behavior the lane does not have yet: the run reports
//                  `known`, not `fail`, until it passes. A check can carry
//                  its own `known` in its options, for one rule of many

/** Wheel steps: eight of 40px down. */
const DOWN = Array(8).fill(40);

/** Open, close, close part-way into an open, and open, close, open quickly. */
const OPEN_CLOSE = [
  { do: 'set', name: 'open', state: { open: true } },
  { do: 'set', name: 'close', state: { open: false } },
  {
    do: 'turn',
    name: 'turn',
    state: { open: true },
    back: { open: false },
    clock: 'open',
  },
  {
    do: 'repeat',
    name: 'rapid',
    states: [{ open: true }, { open: false }, { open: true }],
    clock: 'open',
  },
];

const BAR = {
  bar: '.cds-contextual-bar__bar',
  dock: '.cds-contextual-bar',
};
const SHELL = {
  ws: '.cds-app-shell__workspace',
  /** The workspace below its resting top: the line a bar docks under. */
  wsView: { sel: '.cds-app-shell__workspace', holdTop: true },
  nav: '.cds-app-shell__nav-col',
  header: '.cds-app-header',
  vp: 'viewport',
};

const contextualBar = [
  {
    id: 'contextual-bar/inline-inset-shell-open-close',
    component: 'ContextualBar',
    host: 'inset-shell',
    args: { subject: 'contextual-bar' },
    track: { ...BAR, ws: SHELL.ws, first: '[data-scene-item]' },
    actions: OPEN_CLOSE,
    checks: [
      ['staysInside', { el: 'bar', container: 'ws' }],
      // The page's content moves with the bar's room, on one clock.
      ['continuous', { el: 'first', edge: 'top', maxStep: 'auto' }],
      ['wholePixels', { el: 'bar' }],
      ['wholePixels', { el: 'first', edges: ['top'] }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['reducedPath', { el: 'bar' }],
      ['reducedPath', { el: 'first' }],
    ],
  },
  {
    id: 'contextual-bar/overlay-scroller',
    component: 'ContextualBar',
    host: 'in-scroller',
    args: { subject: 'contextual-bar', placement: 'overlay' },
    track: {
      ...BAR,
      sc: '.cds-scroller__viewport',
      first: '[data-scene-item]',
    },
    scroller: '.cds-scroller__viewport',
    actions: [
      ...OPEN_CLOSE,
      { do: 'wheel', name: 'scroll', over: 'sc', steps: DOWN },
    ],
    checks: [
      ['staysInside', { el: 'bar', container: 'sc' }],
      // An overlay takes no room: the rows never move but for the scroll.
      [
        'continuous',
        { el: 'first', edge: 'top', maxStep: 0, withScroll: true },
      ],
      [
        'continuous',
        { el: 'bar', edge: 'top', maxStep: 'auto', withScroll: true },
      ],
      ['wholePixels', { el: 'bar' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['staysInside', { el: 'bar', container: 'sc' }],
      ['reducedPath', { el: 'bar' }],
    ],
  },
];

/** The side panel's push in an app shell: the page's edge and the panel's. */
const panelTrack = { panel: '.cds-side-panel', ...SHELL };

const pushHolds = (gap) => [
  'gapHolds',
  { a: 'ws', aEdge: 'end', b: 'panel', bEdge: 'start', gap, minSize: 24 },
];

const sidePanel = [
  {
    id: 'side-panel/inset-end-md-open-close',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size: 'md' },
    themes: ['v12-light', 'v12-dark'],
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 2),
    checks: [
      ['staysInside', { el: 'panel', container: 'vp' }],
      [
        'gapHolds',
        {
          a: 'panel',
          aEdge: 'end',
          b: 'vp',
          bEdge: 'end',
          gap: 16,
          rest: true,
        },
      ],
      ['gapHolds', { ...pushHolds(16)[1], rest: true }],
      ['continuous', { el: 'panel', edge: 'start', maxStep: 'auto' }],
      ['wholePixels', { el: 'panel' }],
      ['wholePixels', { el: 'ws', edges: ['start', 'end', 'top'] }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['reducedPath', { el: 'panel' }],
      ['reducedPath', { el: 'ws' }],
      ['gapHolds', { ...pushHolds(16)[1], rest: true }],
    ],
  },
  {
    id: 'side-panel/inset-gap-holds-while-opening',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size: 'md' },
    reduced: [false],
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 2),
    checks: [pushHolds(16)],
    known:
      'the inset panel’s gap to the page grows from 0 to 16px as it opens, instead of holding at 16px',
  },
  {
    id: 'side-panel/close-mid-open',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size: 'md' },
    reduced: [false],
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 3),
    checks: [
      [
        'arriveTogether',
        {
          a: 'panel',
          aEdge: 'start',
          b: 'ws',
          bEdge: 'end',
          from: 'turn-back',
        },
      ],
      ['gapHolds', { ...pushHolds(16)[1], from: 'turn-back', tol: 4 }],
    ],
    known:
      'closing part-way into the open runs the page back early: it lands before the panel',
  },
  {
    id: 'side-panel/resize-while-open',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size: 'md' },
    track: panelTrack,
    actions: [
      { do: 'set', name: 'open', state: { open: true } },
      { do: 'set', name: 'resize', state: { size: 'lg' } },
      { do: 'set', name: 'back', state: { size: 'md' } },
    ],
    checks: [
      ['gapHolds', { ...pushHolds(16)[1], rest: true }],
      ['staysInside', { el: 'panel', container: 'vp' }],
    ],
    known:
      'a new size while open leaves the page under the panel: the page keeps the old size’s room',
  },
  {
    id: 'side-panel/start-beside-nav',
    component: 'SidePanel',
    host: 'inset-shell',
    args: {
      subject: 'side-panel',
      frame: 'inset',
      size: 'md',
      placement: 'start',
    },
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 2),
    checks: [
      // Beside the nav, not over it; the page pushed by its width and gap.
      [
        'gapHolds',
        {
          a: 'nav',
          aEdge: 'end',
          b: 'panel',
          bEdge: 'start',
          gap: 0,
          atLeast: true,
          rest: true,
        },
      ],
      [
        'gapHolds',
        {
          a: 'panel',
          aEdge: 'end',
          b: 'ws',
          bEdge: 'start',
          gap: 16,
          rest: true,
        },
      ],
    ],
    known:
      'a start panel in a shell with a nav covers the nav and pushes the page too far',
  },
  ...['xl', '2xl'].map((size) => ({
    id: `side-panel/${size}-in-workspace`,
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size },
    reduced: [false],
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 1),
    checks: [
      // Its share is of the workspace beside the nav, so it never reaches the nav.
      [
        'gapHolds',
        {
          a: 'nav',
          aEdge: 'end',
          b: 'panel',
          bEdge: 'start',
          gap: 0,
          atLeast: true,
          rest: true,
        },
      ],
      // Pushing, it leaves the page at least 20rem.
      [
        'gapHolds',
        {
          a: 'ws',
          aEdge: 'start',
          b: 'ws',
          bEdge: 'end',
          gap: 320,
          atLeast: true,
          rest: true,
        },
      ],
    ],
    known: `an ${size} panel takes its width from the whole shell, not the workspace beside the nav, and leaves the page too narrow`,
  })),
  {
    id: 'side-panel/flush-in-inset-shell',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'flush', size: 'md' },
    reduced: [false],
    track: panelTrack,
    actions: OPEN_CLOSE.slice(0, 1),
    checks: [
      // Flush: against the window's edge and the header, no inset.
      [
        'gapHolds',
        { a: 'panel', aEdge: 'end', b: 'vp', bEdge: 'end', gap: 0, rest: true },
      ],
      [
        'gapHolds',
        {
          a: 'header',
          aEdge: 'bottom',
          b: 'panel',
          bEdge: 'top',
          gap: 0,
          rest: true,
        },
      ],
    ],
    known:
      'a flush panel in an inset shell stands in from the edges, as an inset one',
  },
  {
    id: 'side-panel/flush-shell-open-close',
    component: 'SidePanel',
    host: 'flush-shell',
    args: { subject: 'side-panel', size: 'md' },
    track: { ...panelTrack, ws: '.cds-app-shell__main-col' },
    actions: OPEN_CLOSE.slice(0, 2),
    checks: [
      ['staysInside', { el: 'panel', container: 'vp' }],
      [
        'gapHolds',
        { a: 'panel', aEdge: 'end', b: 'vp', bEdge: 'end', gap: 0, rest: true },
      ],
      ['gapHolds', { ...pushHolds(0)[1], rest: true }],
      ['wholePixels', { el: 'panel' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['reducedPath', { el: 'panel' }],
      ['reducedPath', { el: 'ws' }],
    ],
  },
  {
    id: 'side-panel/open-scroll-close-rtl',
    component: 'SidePanel',
    host: 'inset-shell',
    args: { subject: 'side-panel', frame: 'inset', size: 'md' },
    rtl: true,
    track: panelTrack,
    actions: [
      { do: 'set', name: 'open', state: { open: true } },
      { do: 'wheel', name: 'scroll', over: 'ws', steps: DOWN },
      { do: 'set', name: 'close', state: { open: false } },
    ],
    checks: [
      ['staysInside', { el: 'panel', container: 'vp' }],
      // The panel holds still while the page scrolls beside it.
      ['still', { el: 'panel', during: ['scroll'] }],
      ['gapHolds', { ...pushHolds(16)[1], rest: true }],
      [
        'gapHolds',
        {
          a: 'panel',
          aEdge: 'end',
          b: 'vp',
          bEdge: 'end',
          gap: 16,
          rest: true,
        },
      ],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['still', { el: 'panel', during: ['scroll'] }],
      ['reducedPath', { el: 'panel', actions: ['open', 'close'] }],
      ['gapHolds', { ...pushHolds(16)[1], rest: true }],
    ],
  },
];

/** A dialog over the page: open, close, the turn and the quick repeat. */
const dialog = (
  component,
  subject,
  surface,
  host = 'page-scroll',
  pixels = {}
) => ({
  id: `${subject}/open-close`,
  component,
  host,
  args: { subject },
  themes: ['v12-light', 'v12-dark'],
  track: { surface, vp: 'viewport' },
  actions: OPEN_CLOSE,
  checks: [
    ['staysInside', { el: 'surface', container: 'vp' }],
    ['continuous', { el: 'surface', edge: 'top', maxStep: 'auto' }],
    ['continuous', { el: 'surface', edge: 'start', maxStep: 'auto' }],
    ['wholePixels', { el: 'surface', ...pixels }],
    ['noLongFrames', { maxMs: 120 }],
  ],
  reducedChecks: [['reducedPath', { el: 'surface' }]],
});

const dialogs = [
  dialog('Tearsheet', 'tearsheet', '.cds-tearsheet__container', 'inset-shell'),
];

/** A surface and its trigger: their gap from the scroll on. */
const RIDES = {
  a: 'trigger',
  aEdge: 'bottom',
  b: 'surface',
  bEdge: 'top',
  gap: 'first',
  from: 'scroll',
};
// Tied to its trigger by anchor positioning, the surface rides a scroll on
// the compositor; its client rect, read by script, lags what is painted
// while the scroll runs. So the gap is checked at rest here; on the frames
// of a scroll it takes the compositor's frames.
const AT_REST = { ...RIDES, rest: true };

/** A popover or menu at a row's end, then the page scrolled under it. */
const anchored = (component, subject, surface, at) => ({
  id: `${subject}/open-at-${at}-and-scroll`,
  component,
  host: 'page-scroll',
  args: { subject, at },
  track: { surface, trigger: '[data-scene-trigger]', vp: 'viewport' },
  actions: [
    ...OPEN_CLOSE.slice(0, 2),
    { do: 'set', name: 'reopen', state: { open: true } },
    // Small steps: the trigger stays in view, so the surface has no
    // reason to leave it.
    { do: 'wheel', name: 'scroll', steps: [16, 16, -16, -16] },
  ],
  checks: [
    ['staysInside', { el: 'surface', container: 'vp' }],
    // It rides with its trigger: their gap holds once the scroll settles.
    ['gapHolds', AT_REST],
    [
      'continuous',
      { el: 'surface', edge: 'top', maxStep: 'auto', until: 'scroll' },
    ],
    ['wholePixels', { el: 'surface' }],
    ['noLongFrames', { maxMs: 120 }],
  ],
  reducedChecks: [
    ['reducedPath', { el: 'surface', actions: ['open', 'close', 'reopen'] }],
    ['gapHolds', AT_REST],
  ],
});

const anchoredSurfaces = [
  anchored('Popover', 'popover', '.cds-popover__frame', 'end'),
  anchored('Popover', 'popover', '.cds-popover__frame', 'start'),
  anchored('Menu', 'menu', '.cds-menu__frame', 'end'),
];

const tooltip = [
  {
    id: 'tooltip/warm-run',
    component: 'Tooltip',
    host: 'page-scroll',
    args: { subject: 'tooltip' },
    track: {
      tip: { sel: '[data-scene-tooltips] .sel__tip', shown: true },
    },
    actions: [
      {
        do: 'hover',
        name: 'hover',
        targets: '[data-scene-tooltips] button',
        each: 400,
        leave: true,
      },
    ],
    checks: [
      // Stillness: once the run is warm, each next tip is in place at once.
      [
        'reducedPath',
        {
          el: 'tip',
          clockMs: 50,
          actions: ['hover-1', 'hover-2', 'hover-3', 'hover-4'],
        },
      ],
      ['wholePixels', { el: 'tip' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      [
        'reducedPath',
        {
          el: 'tip',
          known:
            'under reduced motion the tip still takes the full clock to fade out on leave, not half of it',
        },
      ],
    ],
  },
];

const accordion = [
  {
    id: 'accordion/expand-while-scrolled',
    component: 'Accordion',
    host: 'inset-shell',
    args: { subject: 'accordion' },
    setup: [{ do: 'scrollTo', y: 40 }],
    track: {
      head: { sel: '.cds-accordion__item', nth: 1 },
      body: { sel: '.cds-accordion__content', nth: 1 },
      next: { sel: '.cds-accordion__item', nth: 2 },
      ws: SHELL.ws,
    },
    actions: [
      { do: 'set', name: 'open', state: { open: true } },
      { do: 'set', name: 'close', state: { open: false } },
      {
        do: 'turn',
        name: 'turn',
        state: { open: true },
        back: { open: false },
        clock: 'open',
      },
    ],
    checks: [
      // The item opening holds its place; what follows moves with the opening.
      ['continuous', { el: 'head', edge: 'top', maxStep: 0 }],
      ['continuous', { el: 'next', edge: 'top', maxStep: 'auto' }],
      [
        'staysInside',
        { el: 'body', container: 'head', sides: ['start', 'end'] },
      ],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['continuous', { el: 'head', edge: 'top', maxStep: 0 }],
      ['reducedPath', { el: 'next' }],
    ],
  },
];

const tabs = [
  {
    id: 'tabs/select-and-rapid',
    component: 'Tabs',
    host: 'page-scroll',
    args: { subject: 'tabs' },
    track: {
      marker: '.sel__indicator',
      list: '[role=tablist]',
    },
    actions: [
      { do: 'set', name: 'select', state: { index: 2 } },
      { do: 'set', name: 'back', state: { index: 0 } },
      {
        do: 'repeat',
        name: 'rapid',
        states: [{ index: 3 }, { index: 1 }, { index: 2 }],
        clock: 'select',
      },
    ],
    checks: [
      ['staysInside', { el: 'marker', container: 'list' }],
      ['continuous', { el: 'marker', edge: 'start', maxStep: 'auto' }],
      ['continuous', { el: 'marker', edge: 'end', maxStep: 'auto' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [['reducedPath', { el: 'marker' }]],
  },
];

const toasts = [
  {
    id: 'notification/toast-stack',
    component: 'Notification',
    host: 'page-scroll',
    args: { subject: 'toasts' },
    track: {
      stack: '.scene-toasts',
      front: { sel: '.scene-toasts .fb-n--toast', shown: true },
      vp: 'viewport',
    },
    actions: [
      { do: 'set', name: 'first', state: { toasts: 1 } },
      { do: 'set', name: 'second', state: { toasts: 2 } },
      {
        do: 'repeat',
        name: 'burst',
        states: [{ toasts: 3 }, { toasts: 4 }, { toasts: 5 }],
        clock: 'second',
      },
      { do: 'wheel', name: 'scroll', steps: DOWN },
    ],
    checks: [
      ['staysInside', { el: 'front', container: 'vp' }],
      // Fixed to the view: the scroll does not move it.
      ['continuous', { el: 'stack', edge: 'bottom', maxStep: 'auto' }],
      ['wholePixels', { el: 'front' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['staysInside', { el: 'front', container: 'vp' }],
      ['reducedPath', { el: 'front', actions: ['first', 'second'] }],
    ],
  },
];

const dataTable = [
  {
    id: 'data-table/expand-row',
    component: 'DataTable',
    host: 'inset-shell',
    args: { subject: 'data-table', variant: 'expand' },
    track: {
      next: {
        sel: 'tbody tr.cds-table-expand-row',
        nth: 1,
      },
      first: {
        sel: 'tbody tr.cds-table-expand-row',
        nth: 0,
      },
    },
    actions: [
      {
        do: 'click',
        name: 'open',
        target: '.cds-table-expand__button',
        nth: 1,
      },
      {
        do: 'click',
        name: 'close',
        target: '.cds-table-expand__button',
        nth: 1,
      },
    ],
    checks: [
      ['continuous', { el: 'first', edge: 'top', maxStep: 0 }],
      ['continuous', { el: 'next', edge: 'top', maxStep: 'auto' }],
      ['wholePixels', { el: 'next' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [['reducedPath', { el: 'next' }]],
  },
];

const toggle = [
  {
    id: 'toggle/switch-and-rapid',
    component: 'Toggle',
    host: 'page-scroll',
    args: { subject: 'toggle' },
    track: {
      row: '.cds-toggle__row',
      track: '.cds-toggle__track',
      fill: '.cds-toggle__fill',
    },
    actions: [
      { do: 'set', name: 'on', state: { open: true } },
      { do: 'set', name: 'off', state: { open: false } },
      {
        do: 'repeat',
        name: 'rapid',
        states: [{ open: true }, { open: false }, { open: true }],
        clock: 'on',
      },
    ],
    checks: [
      // A toggle never resizes what holds it.
      ['continuous', { el: 'row', edge: 'end', maxStep: 0 }],
      ['continuous', { el: 'track', edge: 'end', maxStep: 0 }],
      ['wholePixels', { el: 'track' }],
      ['noLongFrames', { maxMs: 120 }],
    ],
    reducedChecks: [
      ['continuous', { el: 'row', edge: 'end', maxStep: 0 }],
      ['reducedPath', { el: 'fill' }],
    ],
  },
];

/** Every scenario. */
export const SCENARIOS = [
  ...contextualBar,
  ...sidePanel,
  ...dialogs,
  ...anchoredSurfaces,
  ...tooltip,
  ...accordion,
  ...tabs,
  ...toasts,
  ...dataTable,
  ...toggle,
];

/**
 * The scenarios for some components (lane folder names, any case).
 *
 * @param {object[]} scenarios The scenarios.
 * @param {string[] | null} components The components, or null for all.
 * @returns {object[]} Those scenarios.
 */
export function forComponents(scenarios, components) {
  if (!components) {
    return scenarios;
  }
  const want = new Set(components.map((c) => c.toLowerCase()));
  return scenarios.filter((s) => want.has(s.component.toLowerCase()));
}

/** The components the scenarios cover, sorted. */
export function componentsOf(scenarios) {
  return [...new Set(scenarios.map((s) => s.component))].sort();
}
