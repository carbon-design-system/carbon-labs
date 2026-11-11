/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  cloneElement,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { inLayout } from '@carbon-labs/v12-motion';
import {
  DURATION_FLOOR_MS,
  animateLayout,
  reflowTiming,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import {
  AppShell,
  Region,
  useAppShell,
  type AppShellFoldPlacement,
  type AppShellFrame,
  type AppShellHeaderPlacement,
  type AppShellNavRenderProps,
  type AppShellScope,
  type SizeClass,
} from '@carbon-labs/react-app-shell';
import type { ZoneTheme } from '@carbon-labs/react-theme-zone';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { SwapSlot } from '@carbon-labs/react-feedback';
import {
  DataTableRevealFollow,
  type DataTableRevealFollower,
} from '@carbon-labs/react-data-table';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import type {
  SidePanelFrame,
  SidePanelProps,
} from '@carbon-labs/react-side-panel';
import type { Density } from './define';
import { resourceIndex } from './resource-index';
import './recipes.scss';

/* ============================================================================
 * ResourceIndex — the pilot recipe
 * ============================================================================
 *
 * One prop per slot of its definition (`resourceIndex`); the team fills the
 * slots, and the recipe owns the rest:
 *
 *   the frame   the app shell (header, nav, the panel's placement by size
 *               class, and its frame: inset, its own panel, pushed beside
 *               main or over the page; flush as the compact sheet,
 *               `resourceIndexPanelFrame`), the workspace layout by
 *               default: the workspace inset in the page's theme,
 *               the header in the nav column, the nav and the header ghost on
 *               the dark chrome (each its own prop: `frame`, `mainTheme`,
 *               `headerPlacement`, as AppShell's), and the regions in it: the
 *               page header, the toolbar row (the batch bar in its place
 *               while rows are selected, ContextualBar's `placement="toolbar"`:
 *               it takes no room, the tools hidden under it), the
 *               filters in use, main on the quiet surface (8px: the table
 *               in it takes `corners="rounded"` from the Region), the footer
 *   density     its own over the screen (KitDefaults), the toolbar's compact
 *   states      `state` sets what the regions show: while loading the footer
 *               and the filters wait for main (the footer for the table's
 *               last row, below); first use and an error leave
 *               only main and the page header; an empty state replaces the
 *               table whole, so the footer (the table's pagination) goes
 *               with it (Carbon's empty-states pattern)
 *   motion      a change of what main shows (the table, no results, first
 *               use, an error) is a content swap, out then in, travelling
 *               16px (SwapSlot fit="fill"), main resizing with the in; loading →
 *               loaded is the table's own structure reveal (DataTableReveal:
 *               the skeleton dissolving over its rows, in place), and a
 *               filter changing its rows is its list reflow (out, move, in),
 *               whose move holds for a layout change already under way (the
 *               panel's push); the filters in use arrive and leave as room
 *               opening and shutting on the kit's disclosure (FiltersRoom:
 *               its room opens by its travel, the filters coming down 8px
 *               from half the open under the soft edge; shut one step
 *               faster, the filters holding still), main moving with it and
 *               its reflow holding until it lands; the batch bar and the
 *               panel's push are those parts' own, and the tag set reflows on
 *               its own; the footer arrives with the table's last row (on its
 *               reveal's clock, told through DataTableRevealFollow) on the
 *               same arrival, the pagination coming down 8px from half the
 *               open; anywhere else it's there or gone at once.
 *               The toolbar row's tools wrap: a change of its height is a
 *               move (useRowMove), in the change under way when there is one
 * ========================================================================== */

export type ResourceIndexState = (typeof resourceIndex.states)[number];

export interface ResourceIndexProps {
  /** What the screen is showing. Default `loaded`. */
  state?: ResourceIndexState;
  /** The shell's header: the kit's Header. */
  header?: ReactNode;
  /** The shell's nav: a SideNav, or a function given the nav's mode (see AppShell). */
  nav?: ReactNode | ((nav: AppShellNavRenderProps) => ReactNode);
  /** The page header: title, a short description, the primary action. */
  pageHeader: ReactNode;
  /** Search, the filters and the table's actions. */
  toolbar?: ReactNode;
  /** The filters in use (a TagSet). Shown only while there are some. */
  filters?: ReactNode;
  /** The table, or what shows instead: an EmptyState for first use, no results or an error. */
  main: ReactNode;
  /** The batch actions while rows are selected: a ContextualBar, open while any are. */
  batch?: ReactNode;
  /** Pagination. */
  footer?: ReactNode;
  /** The filters in full: a SidePanel. The shell places it by size class. */
  panel?: ReactElement<SidePanelProps>;
  /** The screen's density. Default the recipe's (`default`). */
  density?: Density;
  /** Where the screen lives: the page, or a container (a frame, a pane). Default `page`. */
  scope?: AppShellScope;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** The shell's frame (AppShell's): `inset`, the workspace (default), or `flush`. */
  frame?: AppShellFrame;
  /** Where the header goes (AppShell's): `nav`, the nav column's top row (default), or `bar`. */
  headerPlacement?: AppShellHeaderPlacement;
  /** The fold toggle's place (AppShell's): default the header's row, or the nav column's foot under a bar. */
  foldToggle?: AppShellFoldPlacement;
  /** The workspace's theme (AppShell's `mainTheme`): `page` (default), `inverse` (the opposite of the page's) or a Carbon theme. */
  mainTheme?: ZoneTheme;
  /** Force a size class (a fixture). Default: the screen's own width's. */
  sizeClass?: SizeClass;
  onSizeClassChange?: (sizeClass: SizeClass) => void;
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
}

/**
 * What main shows, for the swap: a change of kind swaps. Loading and the
 * table are one face: main's DataTableReveal reveals its rows out of its own
 * skeleton, in place, with no swap.
 */
const MAIN_FACE: Record<ResourceIndexState, string> = {
  loading: 'table',
  loaded: 'table',
  batch: 'table',
  'panel-open': 'table',
  'filtered-empty': 'no-results',
  'first-use': 'first-use',
  error: 'error',
};

/**
 * The table's rows, for the footer that follows them: `ready` once they're
 * in (or arriving), `arrive` when the footer comes in with the last row
 * rather than at once. Told by a DataTableReveal in main; with none (a
 * DataTable, an empty state), ready.
 */
function useRowsReveal() {
  const [rows, setRows] = useState({ ready: true, arrive: false });
  const latest = useRef(0);
  const follow = useCallback<DataTableRevealFollower>((phase, lastRow) => {
    const call = ++latest.current;
    if (phase === 'loading' || phase === 'unload' || phase === 'handoff') {
      setRows({ ready: false, arrive: false });
      // With the last row, on the reveal's clock.
      void lastRow?.then(
        () => latest.current === call && setRows({ ready: true, arrive: true })
      );
    } else {
      // Landed (a tab that drew no frames gets here first), or gone: there at once.
      setRows((r) => (r.ready ? r : { ready: true, arrive: false }));
    }
  }, []);
  return { ...rows, follow };
}

/** ms until a transaction's lead lands: the longest of its own running moves (null: none). */
function leadLeft(lead: Element | null): number | null {
  let left: number | null = null;
  for (const a of lead?.getAnimations() ?? []) {
    const t = a.effect?.getComputedTiming();
    if (!t || typeof t.endTime !== 'number') continue;
    const at = typeof t.localTime === 'number' ? t.localTime : 0;
    left = Math.max(left ?? 0, t.endTime - at);
  }
  return left;
}

/**
 * The toolbar row's height, as a move: when its tools wrap onto another line
 * (or back), the row grows (or shrinks) to its new height rather than
 * jumping, so the regions below move with it, on its travel's step. Inside a
 * layout change already under way (the filters' room opening, the panel's
 * push) it rides that change's clock and curve, one motion, when that has at
 * least its step left (a wrap late in a push: its own step from there);
 * otherwise it is a layout transaction of its own on `root` (the column), so
 * a reflow below holds until it lands. While it moves, the row clips its tools to
 * its height, so a tool on the new line is revealed as the row opens.
 * Reduced motion: at once.
 */
function useRowMove(
  toolsRef: { current: HTMLElement | null },
  rootRef: { current: HTMLElement | null },
  timeScale: number,
  reduced: boolean,
  present: boolean
) {
  const latest = useRef({ timeScale, reduced });
  useLayoutEffect(() => {
    latest.current = { timeScale, reduced };
  });
  useLayoutEffect(() => {
    const tools = toolsRef.current;
    const row = tools?.parentElement;
    if (!tools || !row || typeof ResizeObserver === 'undefined') return;
    // The row's height at rest (layout px: the screen may be drawn scaled).
    const heightOf = () => parseFloat(getComputedStyle(row).height) || 0;
    let rest = heightOf();
    let toolsHeight = tools.offsetHeight;
    let move: Animation | null = null;
    const ro = new ResizeObserver(() => {
      // Only a change of the tools' height (a wrap), not of their width.
      if (Math.abs(tools.offsetHeight - toolsHeight) < 0.5) return;
      toolsHeight = tools.offsetHeight;
      // From where it is: mid-move its live height, else where it rested.
      const from = move ? heightOf() : rest;
      move?.cancel();
      move = null;
      delete row.dataset.moving;
      const to = heightOf();
      rest = to;
      const root = rootRef.current ?? row.parentElement;
      const { timeScale: k, reduced: r } = latest.current;
      if (
        Math.abs(to - from) < 0.5 ||
        r ||
        !root ||
        row.closest('[data-still]')
      )
        return;
      const frames = [{ blockSize: `${from}px` }, { blockSize: `${to}px` }];
      const t = reflowTiming(Math.abs(to - from), k);
      const own = {
        ms: Math.max(DURATION_FLOOR_MS, t.ms),
        easing: `cubic-bezier(${t.ease.join(', ')})`,
      };
      const outer = inLayout(row);
      let a: Animation;
      if (outer) {
        // Part of the change under way: its clock and curve, no transaction
        // of its own. A wrap that comes late in it (the push narrowing the
        // row near its end) takes its own step from here instead, so it
        // never lands in a frame or two.
        const left = leadLeft(outer.lead) ?? outer.remaining();
        a = row.animate(
          frames,
          left >= own.ms
            ? { duration: left, easing: outer.easing }
            : { duration: own.ms, easing: own.easing }
        );
      } else {
        a = animateLayout(root, row, frames, {
          ...own,
          reason: 'recipe-toolbar',
          reduced: false,
        }).animation;
      }
      move = a;
      row.dataset.moving = '';
      void a.finished.then(
        () => {
          if (move !== a) return;
          move = null;
          delete row.dataset.moving;
        },
        () => undefined
      );
    });
    ro.observe(tools);
    return () => {
      ro.disconnect();
      move?.cancel();
      delete row.dataset.moving;
    };
  }, [toolsRef, rootRef, present]);
}

/**
 * The filters' room, a disclosure body, as the footer's is ("Expanding
 * content moves with the opening"): opening, its room (the gap above it
 * included) opens on its travel's step and the filters come down 8px from
 * half the open, under the soft edge; shutting, one step faster, they hold
 * still where they are while the edge closes over them, showing what they
 * showed last. Its move is one motion with everything else under the body
 * (`root`), so main moves with it and its reflow holds until it lands; a
 * reopen while it shuts turns it from where it is. Reduced motion: open or
 * shut at once, the filters fading in on the reduced clock. Shut it takes no
 * room, and the region isn't there.
 */
function FiltersRoom({
  open,
  rootRef,
  timeScale,
  children,
}: {
  open: boolean;
  rootRef: { current: HTMLElement | null };
  timeScale: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const moves = useDisclosureMoves(rootRef, {
    timeScale,
    reason: 'recipe-filters',
  });
  const { bodyProps, present } = useDisclosureBody(ref, open, moves, reduced);
  // What it showed last, kept while it shuts.
  const kept = useRef<ReactNode>(children);
  useLayoutEffect(() => {
    if (open) kept.current = children;
  });
  return (
    <div
      ref={ref}
      className="cds-disclosure__body cds-recipe__room"
      {...bodyProps}>
      <div className="cds-disclosure__clip">
        <div className="cds-disclosure__content">
          {present && (
            <Region
              className="cds-recipe__filters"
              data-region="filters"
              surface="page">
              {/* eslint-disable-next-line react-hooks/refs -- the last content, kept while it shuts */}
              {open ? children : kept.current}
            </Region>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The footer's room, a disclosure body: it arrives on the kit's arrival (its
 * room opens by its travel, the footer coming down 8px from half the open,
 * under the soft edge) when `arrive`, else it's there or gone at once. Its
 * gap above is inside it, so shut it takes no room.
 */
function FooterRoom({
  open,
  arrive,
  timeScale,
  children,
}: {
  open: boolean;
  arrive: boolean;
  timeScale: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const moves = useDisclosureMoves(ref, { timeScale, reason: 'recipe-footer' });
  const still = !(open && arrive);
  const { bodyProps } = useDisclosureBody(ref, open, moves, reduced, still);
  return (
    <div
      ref={ref}
      className="cds-disclosure__body cds-recipe__footer-room"
      data-still={still || undefined}
      {...bodyProps}>
      <div className="cds-disclosure__clip">
        <div className="cds-disclosure__content">
          {open && (
            <Region
              className="cds-recipe__footer"
              data-region="footer"
              surface="page">
              {children}
            </Region>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The filters panel's frame, by where the shell puts it: the variant with
 * its own container, on snap motion, pushing the workspace content. `inset`, its own rounded
 * panel 8px in from the workspace's edges, opening on Snap's larger surface
 * by its edge, wherever it stands beside or over the page: pushed beside
 * main at expanded and large (main narrows by its width and its 8px, on the
 * panel's clock), over the page at medium. As a sheet (compact) it fills the
 * shell's width, attached to its edges: `flush`. The team's own `frame` wins.
 * It reads the shell's panel mode, so it changes with the size class, as the
 * placement does.
 */
export function resourceIndexPanelFrame(
  mode: 'sheet' | 'over' | 'push'
): SidePanelFrame {
  return mode === 'sheet' ? 'flush' : 'inset';
}

/**
 * The panel as the shell places it: the team's SidePanel, given the recipe's
 * frame (`resourceIndexPanelFrame`) unless it has its own. AppShell clones
 * this with the placement (scope, push, overlay) and it passes all of it on.
 */
function RecipePanel({
  element,
  ...props
}: SidePanelProps & { element: ReactElement<SidePanelProps> }) {
  const shell = useAppShell();
  const frame =
    props.frame ?? resourceIndexPanelFrame(shell?.panelMode ?? 'push');
  return cloneElement(element, { ...props, frame });
}

/**
 * The batch bar in the toolbar row's place: the team's ContextualBar as the
 * kit's `placement="toolbar"` (over the row's first line, taking no room,
 * the tools hidden while it's there, growing from its base on the side of the
 * checkbox pressed), unless it has a placement of its own. The bar's dock
 * (its position, its sticky top, its margins) is the component's, not the
 * recipe's.
 */
function RecipeBatch({ element }: { element: ReactNode }) {
  if (!isValidElement<{ placement?: string; className?: string }>(element))
    return element;
  const { placement, className } = element.props;
  return cloneElement(element, {
    placement: placement ?? 'toolbar',
    className: ['cds-recipe__batch', className].filter(Boolean).join(' '),
  });
}

/** The screen inside the shell: what ResourceIndex puts in AppShell's main, for a shell of the caller's own. */
export type ResourceIndexScreenProps = Pick<
  ResourceIndexProps,
  | 'state'
  | 'pageHeader'
  | 'toolbar'
  | 'filters'
  | 'main'
  | 'batch'
  | 'footer'
  | 'density'
  | 'timeScale'
  | 'className'
>;

/** The recipe's screen without the shell: page header, toolbar row, filters, main and footer, on the recipe's motion.
 *  ResourceIndex puts it in its AppShell; a shell holding several pages puts it in its own main. */
export function ResourceIndexScreen({
  state = 'loaded',
  pageHeader,
  toolbar,
  filters,
  main,
  batch,
  footer,
  density = resourceIndex.density,
  timeScale = 1,
  className,
}: ResourceIndexScreenProps) {
  const face = MAIN_FACE[state];
  // First use and an error have nothing to search, filter or page through.
  const bare = state === 'first-use' || state === 'error';
  // While loading, the filters and the footer wait for main to land.
  const settled = state !== 'loading';
  // The footer is the table's: it shows only with the table, not with an
  // empty state in its place.
  const table = face === 'table';
  const bodyRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tools = !bare && !!(toolbar || batch);
  useRowMove(toolsRef, bodyRef, timeScale, reduced, tools);
  const rows = useRowsReveal();
  return (
    <KitDefaults density={density}>
      <div
        className={['cds-recipe', 'cds-recipe--resource-index', className]
          .filter(Boolean)
          .join(' ')}
        data-recipe={resourceIndex.id}
        data-state={state}
        data-density={density}>
        {/* The page header spans the screen under the global header, square
            and on its own surface (attached to an edge); the rest is inset. */}
        <Region
          className="cds-recipe__page-header"
          data-region="pageHeader"
          surface="page">
          {pageHeader}
        </Region>
        <div ref={bodyRef} className="cds-recipe__body">
          {tools && (
            <KitDefaults density={resourceIndex.regions.toolbar.density}>
              <Region
                className="cds-recipe__toolbar-row"
                data-region="toolbar"
                surface="page"
                role="group"
                aria-label="Table tools">
                <div ref={toolsRef} className="cds-recipe__toolbar">
                  {toolbar}
                </div>
                {batch && <RecipeBatch element={batch} />}
              </Region>
            </KitDefaults>
          )}
          {/* The filters in use come and go as room opening and closing, so
              main moves rather than jumps; its reflow holds until they land. */}
          <FiltersRoom
            open={!bare && settled && !!filters}
            rootRef={bodyRef}
            timeScale={timeScale}>
            {filters}
          </FiltersRoom>
          {/* Quiet, so rounded (8), and the table in it is too (KitDefaults' containerCorners). */}
          <Region
            className="cds-recipe__main"
            data-region="main"
            surface="quiet">
            <DataTableRevealFollow.Provider value={rows.follow}>
              <SwapSlot swapKey={face} fit="fill">
                {main}
              </SwapSlot>
            </DataTableRevealFollow.Provider>
          </Region>
          {/* The footer is the table's: it comes in with the table's last
              row, and goes with the table. */}
          {footer && (
            <FooterRoom
              open={table && settled && rows.ready}
              arrive={rows.arrive}
              timeScale={timeScale}>
              {footer}
            </FooterRoom>
          )}
        </div>
      </div>
    </KitDefaults>
  );
}

export function ResourceIndex({
  state = 'loaded',
  header,
  nav,
  pageHeader,
  toolbar,
  filters,
  main,
  batch,
  footer,
  panel,
  density = resourceIndex.density,
  scope,
  frame = 'inset',
  headerPlacement = 'nav',
  foldToggle,
  mainTheme = 'page',
  sizeClass,
  onSizeClassChange,
  timeScale = 1,
  className,
}: ResourceIndexProps) {
  return (
    <KitDefaults density={density}>
      <AppShell
        header={header}
        nav={nav}
        panel={panel && <RecipePanel element={panel} {...panel.props} />}
        scope={scope}
        frame={frame}
        headerPlacement={headerPlacement}
        foldToggle={foldToggle}
        mainTheme={mainTheme}
        sizeClass={sizeClass}
        onSizeClassChange={onSizeClassChange}
        timeScale={timeScale}>
        <ResourceIndexScreen
          state={state}
          pageHeader={pageHeader}
          toolbar={toolbar}
          filters={filters}
          main={main}
          batch={batch}
          footer={footer}
          density={density}
          timeScale={timeScale}
          className={className}
        />
      </AppShell>
    </KitDefaults>
  );
}
