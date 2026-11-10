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
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  durationStepForDistance,
  motionTokens,
  stepDown,
  type DurationToken,
  easingCss,
  TooltipMotionContext,
} from '@carbon-labs/v12-motion';
import { MODAL_CHROME_ATTR } from '@carbon-labs/react-modal';
import { SidePanelOpenToggle } from '@carbon-labs/react-motion-icons';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Scroller, WindowScroller } from '@carbon-labs/react-scroller';
import { JumpTo } from '@carbon-labs/react-jump-to';
import { type SidePanelProps } from '@carbon-labs/react-side-panel';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';
import {
  APP_HEADER_HEIGHT,
  APP_SHELL_LAYOUT,
  AppShellActionsSlotContext,
  AppShellContext,
  AppShellFoldToggleContext,
  AppShellFootSlotContext,
  AppShellHeaderSlotContext,
  AppShellMenuButtonContext,
  AppShellWorkspaceContext,
  type AppShellFoldPlacement,
  type AppShellFrame,
  type AppShellHeaderPlacement,
  type AppShellLayout,
  type AppShellNavMode,
  type AppShellOpenNavOptions,
  type AppShellScope,
  type AppShellState,
} from './context';
import { NavOverlay } from './NavOverlay';
import { useTheme } from '@carbon/react';
import {
  inverseTheme,
  KIT_THEME,
  themeZoneAt,
  ThemeZone,
  zoneClass,
  type CarbonThemeName,
  type KitTheme,
  type ZoneTheme,
} from '@carbon-labs/react-theme-zone';
import { onThemeChange } from '@carbon-labs/react-util';
import { useSizeClass, type SizeClass } from './useSizeClass';
import './app-shell.scss';

/* ============================================================================
 * AppShell — the frame a recipe sits in
 * ============================================================================
 *
 * Slots: `header` (the kit's Header), `nav` (a SideNav, as a render
 * function), `children` (main) and an optional `panel` (a SidePanel). It
 * reads its own size class (useSizeClass) and sets the nav's and the panel's
 * modes from it (APP_SHELL_LAYOUT):
 *
 *   compact   the nav an overlay (NavOverlay): a SidePanel at the start,
 *             under the header, over the page with its dim, opened from the
 *             header's menu button, which is its Close while it's open
 *             (Carbon's UI shell); Escape, a press outside or a link
 *             followed in it close it too; focus goes in, Tab goes round
 *             the menu button and the nav, and focus comes back to the
 *             menu button. The header's actions that don't fit move into
 *             the overlay's top. The panel a full-width sheet with its
 *             overlay
 *   medium    the nav a rail (`collapsed` to the nav's render function); the
 *             panel over the page
 *   expanded,
 *   large     the nav a panel; the panel pushed beside main (SidePanel's
 *             `slideIn`: main makes room on the panel's clock)
 *
 * A class edge crossed while the panel is open re-places it at once, the
 * same panel (no second entrance); its overlay is the opening's.
 *
 * The motion is the parts' own: the rail's fold and soft edge are the
 * SideNav's, the overlay's and the panel's entrance, push and overlay the
 * SidePanel's. Reduced motion is theirs too.
 *
 *   page       (default) the header fixed at the top, the nav sticky under
 *              it, main scrolling with the page under the kit's
 *              WindowScroller, inset under the header
 *   container  the shell fills its container (a lab's frame, a pane): main
 *              scrolls in the kit's Scroller, the nav and the panel are
 *              placed in the shell
 *
 * The workspace layout, each its own axis:
 *
 *   frame            flush (default): main is a column on the page. inset:
 *                    main is the workspace, its own rounded surface (16, the
 *                    outermost on the page) standing in from the page, 8px
 *                    from the nav's column and 16 from the other edges, the
 *                    quiet fill with no hairline; what's in it takes a framed
 *                    surface's defaults (ghost, rounded containers). By size class
 *                    (APP_SHELL_LAYOUT `main`): flush and square at compact
 *   chromeTheme      dark (default), light, page or inverse: the chrome's
 *                    theme (the header, the nav column, the page round an
 *                    inset workspace), dark on every theme as Carbon's UI
 *                    shell
 *   mainTheme        page (default), light, dark or inverse (the opposite
 *                    of the page's): the workspace's theme, and the panel's.
 *                    Page is the theme round the shell, not the chrome's
 *   headerPlacement  bar (default): across the top. nav: the header is the
 *                    nav column's top row, ghost, its actions pinned to the
 *                    column's foot, and main runs from the top. By size class
 *                    (APP_SHELL_LAYOUT `header`): a bar at compact (the menu
 *                    button needs it); on the rail, the logo alone
 *   the panel        on an inset shell, an inset SidePanel (its own `frame`
 *                    wins): a second surface beside the workspace, the
 *                    workspace's gutter (16) and corners (16), pushing it
 * ========================================================================== */

/** The Carbon theme round the shell (the page's), read before the first paint and on every theme change; null is Carbon's white. */
function useThemeRound(ref: RefObject<HTMLElement | null>) {
  const context = useTheme().theme as string | undefined;
  const [read, setRead] = useState<CarbonThemeName | null | undefined>();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setRead(themeZoneAt(el.parentElement));
    measure();
    return onThemeChange(el, measure);
  }, [ref]);
  if (read !== undefined) return read;
  return context === 'white' || context === 'g100' ? context : null;
}

/**
 * The workspace's theme in a chrome of its own: `page` and `inverse` are the page's, not the chrome's. The
 * chrome's own theme is `page`: the workspace adds no zone and keeps its quiet fill.
 */
function workspaceTheme(
  mainTheme: ZoneTheme,
  chromeTheme: ZoneTheme,
  round: CarbonThemeName | null
): ZoneTheme {
  if (chromeTheme === 'page') return mainTheme;
  const kit = (theme: CarbonThemeName | null): KitTheme =>
    KIT_THEME[theme ?? 'white'];
  const chrome =
    chromeTheme === 'inverse' ? kit(inverseTheme(round)) : chromeTheme;
  const want =
    mainTheme === 'page'
      ? kit(round)
      : mainTheme === 'inverse'
        ? kit(inverseTheme(round))
        : mainTheme;
  return want === chrome ? 'page' : want;
}

/** Main's surface and theme zone (inset, themed, or a plain box): the same elements in every class, so main keeps its state. */
function Workspace({
  frame,
  theme,
  children,
}: {
  frame: AppShellFrame;
  theme: ZoneTheme;
  children: ReactNode;
}) {
  const inset = frame === 'inset';
  // A framed surface: what's in it is ghost and its containers rounded, unless given their own.
  const inner = (
    <AppShellWorkspaceContext.Provider value={inset}>
      <KitDefaults
        frame={inset ? 'ghost' : undefined}
        containerCorners={inset ? 'rounded' : undefined}>
        {children}
      </KitDefaults>
    </AppShellWorkspaceContext.Provider>
  );
  if (theme === 'page')
    return (
      <div className="cds-app-shell__workspace" data-frame={frame}>
        {inner}
      </div>
    );
  return (
    <ThemeZone
      theme={theme}
      className="cds-app-shell__workspace"
      data-frame={frame}>
      {inner}
    </ThemeZone>
  );
}

const bezier = (name: keyof typeof motionTokens.easing) => easingCss(name);

/** A page workspace's gutter and corner radius, px (app-shell.scss: `$spacing-05`, `corners.$over`). */
const WORKSPACE_GUTTER_PX = 16;
const WORKSPACE_RADIUS_PX = 16;

/** The page's scroller: under the bar; on an inset workspace, inside it, a corner's radius short of each end. */
function pageScrollerInsets(bar: boolean, inset: boolean) {
  const top = bar ? APP_HEADER_HEIGHT : 0;
  if (!inset) return { top };
  const end = WORKSPACE_GUTTER_PX + WORKSPACE_RADIUS_PX;
  return {
    top: bar ? `calc(${APP_HEADER_HEIGHT} + ${end}px)` : end,
    bottom: end,
    right: WORKSPACE_GUTTER_PX,
  };
}

/** Back to top on a page's inset workspace (JumpTo's Top, the window's): two views down, centred on it, in its theme. */
function WorkspaceTop({
  mainColId,
  bar,
  mainTheme,
  timeScale,
}: {
  mainColId: string;
  bar: boolean;
  mainTheme: ZoneTheme;
  timeScale: number;
}) {
  const [theme, setTheme] = useState<CarbonThemeName | null>(null);
  const [views, setViews] = useState(0);
  useLayoutEffect(() => {
    const col = document.getElementById(mainColId);
    if (!col) return;
    const ws = col.querySelector(':scope > .cds-app-shell__workspace');
    const root = document.documentElement;
    const write = () => {
      const r = col.getBoundingClientRect();
      root.style.setProperty(
        '--cds-app-shell-workspace-mid',
        `${r.left + r.width / 2}px`
      );
      setTheme(themeZoneAt(ws));
      setViews(window.innerHeight * 2);
    };
    write();
    const ro = new ResizeObserver(write);
    ro.observe(col);
    window.addEventListener('resize', write);
    // A theme changed round it (the page's): its zone's theme again.
    const offTheme = ws
      ? onThemeChange(ws, () => setTheme(themeZoneAt(ws)))
      : () => {};
    return () => {
      offTheme();
      ro.disconnect();
      window.removeEventListener('resize', write);
      root.style.removeProperty('--cds-app-shell-workspace-mid');
    };
  }, [mainColId, mainTheme]);
  if (typeof document === 'undefined' || !views) return null;
  return (
    <JumpTo
      container={document.scrollingElement as HTMLElement}
      preset="top"
      threshold={views}
      timeScale={timeScale}
      className={[
        'cds-app-shell__top',
        bar && 'cds-app-shell__top--under-bar',
        zoneClass(theme),
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

/** The strip a hidden nav leaves (`foldTo="hide"`): the toggle (48) and its equal insets (4 a side), up to the
 *  workspace (app-shell.scss, the strip). */
const NAV_STRIP_PX = 56;

/** The fold's progress on the column, 0 open to 1 folded, on the fold's own clock (app-shell.scss registers it). */
const FOLD_VAR = '--cds-nav-fold';

/** The column's content held at the width it has open, so the moving edge passes over it (app-shell.scss, "Folding"). */
function holdContent(col: HTMLElement, width: number) {
  col.style.setProperty('--cds-fold-hold', `${width}px`);
  col.setAttribute('data-folding', '');
}
function releaseContent(col: HTMLElement) {
  col.style.removeProperty('--cds-fold-hold');
  col.removeAttribute('data-folding');
}

/** The column's clock: the step for its width's travel; shrinking, one step faster. */
function foldClock(px: number, phase: 'in' | 'out') {
  const step = durationStepForDistance(px) as DurationToken;
  const name = phase === 'in' ? step : (stepDown(step) as DurationToken);
  return motionTokens.duration[name];
}

/** What the nav's render function is given. */
export interface AppShellNavRenderProps {
  /** The nav's mode. */
  mode: AppShellNavMode;
  /** Pass to the SideNav: it can fold to a rail (not in the overlay). */
  collapsible: boolean;
  /** Pass to the SideNav: folded to the rail. */
  collapsed: boolean;
  /** Pass to the SideNav: its toggle row asks to fold or unfold (until the size class changes). */
  onCollapsedChange: (collapsed: boolean) => void;
  /** Closes the overlay (a link that navigates without a click, say). */
  close: () => void;
}

export interface AppShellProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** The kit's Header. */
  header?: ReactNode;
  /**
   * The nav: a SideNav. A function is given the mode and `collapsed` to pass
   * on, so the nav folds to a rail at medium (every top-level row needs an
   * icon for that). A node is shown as it is in every mode.
   */
  nav?: ReactNode | ((nav: AppShellNavRenderProps) => ReactNode);
  /** The overlay nav's accessible name (NavOverlay's `navLabel`). Default "Navigation". */
  navLabel?: string;
  /** Main. */
  children?: ReactNode;
  /** A SidePanel. The shell sets where it goes (`scope`, `slideIn`, `includeOverlay`); its `open` is the caller's. */
  panel?: ReactElement<SidePanelProps>;
  /** Where the shell lives: `page` (default) or `container`, as SidePanel's and NavOverlay's `scope`. */
  scope?: AppShellScope;
  /** Force a size class (a fixture); default: the shell's own width's. */
  sizeClass?: SizeClass;
  /** Called when the size class changes. */
  onSizeClassChange?: (sizeClass: SizeClass) => void;
  /** Main's element's props (an id, a label). */
  mainProps?: HTMLAttributes<HTMLElement>;
  /**
   * What main stands on: `flush` (default), the page; `inset`, the workspace: its own rounded surface
   * standing in from the page, the nav ghost beside it. Inset from medium up, flush at compact (`APP_SHELL_LAYOUT`).
   */
  frame?: AppShellFrame;
  /**
   * Where the header goes: `bar` (default), across the top; `nav`, the nav column's top row (ghost), its
   * actions at the column's foot. A bar again at compact.
   */
  headerPlacement?: AppShellHeaderPlacement;
  /** Main's theme, and the panel's: `light`, `dark`, `page` (default) or `inverse` (the opposite of the page's). */
  mainTheme?: ZoneTheme;
  /** The chrome's theme (the header, the nav column, the page round an inset workspace): `dark` (default), `light`,
   *  `page` or `inverse`. */
  chromeTheme?: ZoneTheme;
  /** The fold toggle: `header` (the nav column's top row), `foot` (its foot, the shell's lower start) or `nav` (the
   *  SideNav's row). Default `header` with the header in the nav, else `foot`; for a nav function, medium up.
   *  `header` with the header in the bar is the column's top row with `foldTo="hide"`, else the SideNav's. */
  foldToggle?: AppShellFoldPlacement;
  /** A class's layout changed from `APP_SHELL_LAYOUT`'s: `{ medium: { nav: 'overlay' } }` for a nav with no
   *  icons (nothing to show on a rail). */
  layout?: Partial<Record<SizeClass, Partial<AppShellLayout>>>;
  /** Folding: `rail` (default), the SideNav's icons; `overlay`, the nav opens from the menu button; `hide`, the
   *  column narrows to a strip with the toggle at its foot (`foldToggle="header"`: its top), no menu button. */
  foldTo?: 'rail' | 'overlay' | 'hide';
  /** `foldTo="hide"`: what the strip shows at its top, given `unfold` (a search button that opens the filter). */
  navStrip?: (strip: { unfold: () => void }) => ReactNode;
  /** The fold, controlled (with `onNavCollapsedChange`). Default: the shell's own, kept until the size class changes. */
  navCollapsed?: boolean;
  /** Called when the fold toggle asks to fold or unfold. */
  onNavCollapsedChange?: (collapsed: boolean) => void;
  /** Focused when the overlay nav opens from the menu button (a selector in the nav); default its first tab stop. */
  navFocus?: string;
  /** The kit's WindowScroller for a `page` shell. Default true; false for a page that brings its own. */
  windowScroller?: boolean;
  /** Slow motion for the overlay nav and the panel (the nav's own is the SideNav's prop). Default 1. */
  timeScale?: number;
}

/** The fold toggle's tooltip side right to left. */
const FOLD_ALIGN_RTL = {
  'bottom-start': 'bottom-end',
  'top-start': 'top-end',
  right: 'left',
} as const;

const cssId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/**
 * The shell's chrome (the header and the nav column) stands beside or over a
 * workspace on another surface, where a tooltip's fill alone can sink into
 * what it lies on: its tooltips are outlined, unless a `TooltipMotion` above
 * sets the outline.
 */
function ChromeTooltips({ children }: { children: ReactNode }) {
  const ctx = useContext(TooltipMotionContext);
  const value = useMemo(
    () => (ctx.outline === undefined ? { ...ctx, outline: true } : ctx),
    [ctx]
  );
  return (
    <TooltipMotionContext.Provider value={value}>
      {children}
    </TooltipMotionContext.Provider>
  );
}

export function AppShell({
  header,
  nav,
  navLabel = 'Navigation',
  children,
  panel,
  scope = 'page',
  sizeClass: sizeClassProp,
  onSizeClassChange,
  mainProps,
  frame = 'flush',
  headerPlacement = 'bar',
  mainTheme = 'page',
  chromeTheme = 'dark',
  foldToggle: foldToggleProp,
  layout: layoutProp,
  foldTo = 'rail',
  navStrip,
  navCollapsed: navCollapsedProp,
  onNavCollapsedChange,
  navFocus,
  windowScroller = true,
  timeScale = 1,
  className,
  style,
  ...rest
}: AppShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  // The overlay's actions row, while it's there: the header's overflow goes in it.
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);
  const measured = useSizeClass(rootRef);
  const round = useThemeRound(rootRef);
  const wsTheme = workspaceTheme(mainTheme, chromeTheme, round);
  const sizeClass = sizeClassProp ?? measured;
  const layout = { ...APP_SHELL_LAYOUT[sizeClass], ...layoutProp?.[sizeClass] };
  // The fold the toggle asks for (or the caller's), for the class's mode it belongs to.
  const [fold, setFold] = useState<{
    mode: AppShellNavMode;
    collapsed: boolean;
  } | null>(null);
  const folded =
    layout.nav === 'overlay'
      ? false
      : (navCollapsedProp ??
        (fold?.mode === layout.nav
          ? fold.collapsed
          : foldTo === 'rail' && layout.nav === 'rail'));
  // Folded to the overlay: the column goes, the nav is the overlay.
  const foldedAway = foldTo === 'overlay' && folded;
  // Folded away: no column and no overlay; the toggle alone brings it back.
  const hiddenAway = foldTo === 'hide' && folded;
  const navMode: AppShellNavMode = foldedAway ? 'overlay' : layout.nav;
  // What the SideNav is given: a rail's fold only.
  const collapsed = foldTo === 'rail' && folded;
  const panelMode = layout.panel;
  // An inset shell's main at this class; the header in the nav column where there is one.
  const mainFrame: AppShellFrame = frame === 'inset' ? layout.main : 'flush';
  const headerAt: AppShellHeaderPlacement =
    headerPlacement === 'nav' && nav != null ? layout.header : 'bar';
  // The nav column's foot, while the header is in the column: its actions go there.
  const [footSlot, setFootSlot] = useState<HTMLDivElement | null>(null);

  const uid = cssId(useId());
  const navId = `cds-app-shell-${uid}-nav`;
  const mainColId = `cds-app-shell-${uid}-main`;

  const onSizeClass = useLatest(onSizeClassChange);
  const seen = useRef(sizeClass);
  useEffect(() => {
    if (seen.current === sizeClass) return;
    seen.current = sizeClass;
    onSizeClass.current?.(sizeClass);
  }, [sizeClass, onSizeClass]);

  // The overlay's open state for the mode it belongs to, and how it opened
  // (`openNav`'s options).
  const [open, setOpen] = useState<{
    mode: AppShellNavMode;
    open: boolean;
    how?: AppShellOpenNavOptions;
  }>({
    mode: navMode,
    open: false,
  });
  const navOpen = open.mode === navMode && navMode === 'overlay' && open.open;

  const openNav = useCallback(
    (how?: AppShellOpenNavOptions) =>
      setOpen({ mode: 'overlay', open: true, how }),
    []
  );
  const closeNav = useCallback(
    () => setOpen((o) => (o.open ? { ...o, open: false } : o)),
    []
  );
  const toggleNav = useCallback(
    // A close keeps how it opened (where focus goes back).
    () =>
      setOpen((o) =>
        o.mode === 'overlay' && o.open
          ? { ...o, open: false }
          : { mode: 'overlay', open: true }
      ),
    []
  );
  const onFold = useLatest(onNavCollapsedChange);
  const baseMode = layout.nav;
  const onCollapsedChange = useCallback(
    (c: boolean) => {
      setFold({ mode: baseMode, collapsed: c });
      onFold.current?.(c);
    },
    [baseMode, onFold]
  );

  const state = useMemo<AppShellState>(
    () => ({
      sizeClass,
      navMode,
      panelMode,
      mainFrame,
      headerPlacement: headerAt,
      scope,
      navOpen,
      openNav,
      closeNav,
      toggleNav,
      navId,
    }),
    [
      sizeClass,
      navMode,
      panelMode,
      mainFrame,
      headerAt,
      scope,
      navOpen,
      openNav,
      closeNav,
      toggleNav,
      navId,
    ]
  );

  // The fold toggle the shell draws: in the header's row (the header in the column), else at the
  // column's foot, the shell's lower start, outside the nav's own container.
  const foldAsked = foldToggleProp ?? (headerAt === 'nav' ? 'header' : 'foot');
  const foldAt: AppShellFoldPlacement =
    foldAsked === 'header' && headerAt !== 'nav' && foldTo !== 'hide'
      ? 'nav'
      : foldAsked;
  const foldToggle =
    foldAt !== 'nav' && typeof nav === 'function' && navMode !== 'overlay';
  const inHead = foldToggle && foldAt === 'header';
  const atFoot = foldToggle && foldAt === 'foot';
  // Folded to the overlay: the toggle stays at the shell's lower start, the column's foot's place.
  const docked = foldAt !== 'nav' && typeof nav === 'function' && foldedAway;

  // The fold tooltip's side follows the direction (its align is physical): read on each render and
  // whenever a `dir` changes, before a hover can open it.
  const [rtl, setRtl] = useState(false);
  const readRtl = useCallback(
    () =>
      setRtl(
        !!rootRef.current &&
          getComputedStyle(rootRef.current).direction === 'rtl'
      ),
    []
  );
  useLayoutEffect(readRtl);
  useEffect(() => {
    const mo = new MutationObserver(readRtl);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    });
    return () => mo.disconnect();
  }, [readRtl]);

  // `hide`: one motion, the column's width to the strip's and back, main following its edge (the gap held), the
  // content at its open width; the strip swaps in when it lands. A turn goes on from the width drawn. Reduced: at once.
  const reducedFold = useReducedGetter();
  const foldRun = useRef<{ anim: Animation; to: 'strip' | 'open' } | null>(
    null
  );
  const openWidth = useRef(0);
  const growing = useRef(false);
  const colEl = () =>
    rootRef.current?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__body > .cds-app-shell__nav-col'
    );
  /** The column's width folded: the strip's room less main's gap beside an open column (the strip has none). */
  const stripWidth = () => {
    const mainCol = rootRef.current?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__body > .cds-app-shell__main-col'
    );
    const gap = mainCol
      ? parseFloat(getComputedStyle(mainCol).paddingInlineStart) || 0
      : 0;
    return NAV_STRIP_PX - gap;
  };
  /** The fold's progress at a width: 0 open, 1 folded. */
  const progressAt = (width: number) => {
    const travel = openWidth.current - stripWidth();
    return travel > 0
      ? Math.min(1, Math.max(0, (openWidth.current - width) / travel))
      : 1;
  };
  /** The column's width from `from` to `to` px, on the fold's clock for the distance (shrinking, a step faster).
   *  Its progress (`--cds-nav-fold`) rides the same clock, so what's in it can move with the fold. */
  const moveColumn = (col: HTMLElement, from: number, to: number) => {
    const shrinking = to < from;
    const anim = col.animate(
      [
        { inlineSize: `${from}px`, [FOLD_VAR]: progressAt(from) },
        { inlineSize: `${to}px`, [FOLD_VAR]: shrinking ? 1 : 0 },
      ],
      {
        duration:
          foldClock(Math.abs(from - to), shrinking ? 'out' : 'in') * timeScale,
        easing: bezier(shrinking ? 'exit-productive' : 'entrance-productive'),
        fill: 'forwards',
      }
    );
    foldRun.current = { anim, to: shrinking ? 'strip' : 'open' };
    return anim;
  };
  /** Opens the column from `from` px to its open width, then lets its content go. */
  const openColumn = (col: HTMLElement, from: number) => {
    holdContent(col, openWidth.current);
    const anim = moveColumn(col, from, openWidth.current);
    anim.finished.then(
      () => {
        if (foldRun.current?.anim !== anim) return;
        foldRun.current = null;
        anim.cancel();
        releaseContent(col);
      },
      () => {}
    );
  };
  /** Folds the column from `from` px to the strip, then puts the strip in its place. */
  const foldColumn = (col: HTMLElement, from: number) => {
    if (!foldRun.current) openWidth.current = col.offsetWidth;
    holdContent(col, openWidth.current);
    const anim = moveColumn(col, from, stripWidth());
    anim.finished.then(
      () => {
        if (foldRun.current?.anim !== anim || !col.isConnected) return;
        foldRun.current = null;
        onCollapsedChange(true);
        // A parent that keeps the nav open (`navCollapsed`): no strip comes, so the column opens back up.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (
              col.isConnected &&
              !foldRun.current &&
              col.hasAttribute('data-folding')
            )
              openColumn(col, stripWidth());
          })
        );
      },
      () => {}
    );
  };
  const setFolded = useStableCallback((next: boolean) => {
    const col = colEl();
    if (foldTo !== 'hide' || reducedFold()) return onCollapsedChange(next);
    const run = foldRun.current;
    // A turn: from the width as drawn, toward where it's going now.
    if (run && col && col.isConnected) {
      if ((run.to === 'strip') === next) return;
      const now = col.getBoundingClientRect().width;
      run.anim.cancel();
      foldRun.current = null;
      return next ? foldColumn(col, now) : openColumn(col, now);
    }
    if (next === folded) return;
    if (!next) {
      growing.current = true;
      return onCollapsedChange(false);
    }
    if (!col) return onCollapsedChange(true);
    foldColumn(col, col.offsetWidth);
  });
  // Unmounted mid-fold: the run stops, so it never calls back.
  useEffect(
    () => () => {
      foldRun.current?.anim.cancel();
      foldRun.current = null;
    },
    []
  );
  const unfold = useStableCallback(() => setFolded(false));
  const refocusFold = useRef(false);
  useLayoutEffect(() => {
    if (!refocusFold.current) return;
    refocusFold.current = false;
    const toggle = rootRef.current?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__body > :is(.cds-app-shell__nav-col, .cds-app-shell__fold-dock) .cds-app-shell__fold'
    );
    if (toggle && document.activeElement !== toggle)
      toggle.focus({ preventScroll: true });
  }, [folded]);
  useLayoutEffect(() => {
    // Unfolded: the column is back at its open width; it grows to it from the strip, before the first paint
    // (from the strip's width as main's gap beside the column has it now).
    const grow = growing.current;
    growing.current = false;
    const col = colEl();
    if (!grow || hiddenAway || !col) return;
    openWidth.current = col.offsetWidth;
    openColumn(col, stripWidth());
    // Only when the fold changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenAway]);

  const navNode =
    typeof nav === 'function'
      ? nav({
          mode: navMode,
          collapsible: foldTo === 'rail' && navMode !== 'overlay',
          collapsed,
          onCollapsedChange,
          close: closeNav,
        })
      : nav;

  const contained = scope === 'container';
  const modalPage =
    scope === 'page' ? { 'data-cds-modal-page': '' } : undefined;
  // The header on the page is the app's fixed chrome: a modal dims and blurs
  // it, and its page scale leaves it be (modal/backdrop.ts, "The chrome").
  const modalChrome =
    scope === 'page' ? { [MODAL_CHROME_ATTR]: '' } : undefined;

  // The panel's modality (the sheet's overlay, its trap and the page's lock)
  // is the opening's: SidePanel takes it as it opens and lets go once it has
  // left, so it's kept until then, whatever the class does meanwhile.
  const panelOpen = isValidElement<SidePanelProps>(panel) && panel.props.open;
  const [opening, setOpening] = useState({
    open: panelOpen,
    sheet: panelMode === 'sheet',
  });
  if (opening.open !== panelOpen)
    setOpening({
      open: panelOpen,
      sheet: panelOpen ? panelMode === 'sheet' : opening.sheet,
    });
  const sheetOverlay = opening.sheet;

  // A class edge crossed while the panel is open re-places it at once: one
  // panel throughout (no new entrance, its content and focus kept), main's
  // room given or taken back here. SidePanel pushes only as it opens and
  // closes; its close later eases main back from wherever it is.
  const placedMode = useRef(panelMode);
  useLayoutEffect(() => {
    const was = placedMode.current;
    placedMode.current = panelMode;
    if (was === panelMode || !panelOpen) return;
    const mainCol = document.getElementById(mainColId);
    const surface = rootRef.current?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__body > .cds-app-shell__panel'
    );
    if (!mainCol) return;
    const side =
      isValidElement<SidePanelProps>(panel) && panel.props.placement === 'start'
        ? 'marginInlineStart'
        : 'marginInlineEnd';
    mainCol.getAnimations().forEach((a) => a.cancel());
    mainCol.style[side] = '';
    if (panelMode === 'push' && surface) {
      // Its room, as SidePanel's push: its width, and an inset panel's distance from the edge.
      const cs = getComputedStyle(surface);
      const gap =
        parseFloat(
          side === 'marginInlineEnd' ? cs.insetInlineEnd : cs.insetInlineStart
        ) || 0;
      const base = parseFloat(getComputedStyle(mainCol)[side]) || 0;
      mainCol.style[side] = `${base + surface.offsetWidth + gap}px`;
    }
    // On a class edge only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelMode]);

  const placedPanel =
    panel && isValidElement<SidePanelProps>(panel)
      ? cloneElement(panel, {
          // On an inset shell, a second inset surface beside the workspace (its gutter and corners: app-shell.scss).
          frame:
            panel.props.frame ?? (mainFrame === 'inset' ? 'inset' : undefined),
          scope: contained ? 'container' : 'page',
          slideIn: panelMode === 'push',
          selectorPageContent:
            panelMode === 'push' ? `#${mainColId}` : undefined,
          includeOverlay: sheetOverlay ? true : panel.props.includeOverlay,
          timeScale: panel.props.timeScale ?? timeScale,
          className: [
            panel.props.className,
            'cds-app-shell__panel',
            mainFrame === 'inset' && 'cds-app-shell__panel--inset',
            panelMode === 'sheet' && 'cds-app-shell__sheet',
          ]
            .filter(Boolean)
            .join(' '),
        })
      : panel;

  const main = (
    <main
      {...mainProps}
      className={['cds-app-shell__main', mainProps?.className]
        .filter(Boolean)
        .join(' ')}>
      {children}
    </main>
  );

  // The nav in its column: ghost (the chrome is what it stands on), unless given its own frame.
  const navInColumn = <KitDefaults frame="ghost">{navNode}</KitDefaults>;
  const navScroller = (
    <Scroller
      className="cds-app-shell__nav"
      viewportClassName="cds-app-shell__nav-viewport"
      data-nav-mode={navMode}
      timeScale={timeScale}
      {...(headerAt === 'nav' ? undefined : modalPage)}>
      {navInColumn}
    </Scroller>
  );
  const foldButton = (align: 'bottom-start' | 'top-start' | 'right') => (
    <IconButton
      frame="ghost"
      size="lg"
      corners="full"
      align={rtl ? FOLD_ALIGN_RTL[align] : align}
      label={folded ? 'Expand navigation' : 'Collapse navigation'}
      outline
      aria-expanded={!folded}
      className="cds-app-shell__fold"
      timeScale={timeScale}
      onClick={(e) => {
        // The column, strip and dock each draw their own toggle: focus follows it to the new one.
        refocusFold.current = document.activeElement === e.currentTarget;
        // Mid-fold, a press turns it round: away from where it's going.
        const run = foldRun.current;
        setFolded(run ? run.to !== 'strip' : !folded);
      }}>
      <SidePanelOpenToggle
        size={20}
        value={folded ? 'open' : 'close'}
        disableToggle
        aria-hidden="true"
      />
    </IconButton>
  );
  const navColumn =
    navNode == null || navMode === 'overlay' ? null : hiddenAway ? (
      // Hidden: the strip it leaves, what the caller puts at its top and the toggle at its foot (or above it).
      <div
        key="strip"
        className="cds-app-shell__nav-col cds-app-shell__nav-strip"
        data-nav-mode="strip"
        {...modalPage}>
        {inHead && (
          <div className="cds-app-shell__nav-head" data-fold-toggle>
            {foldButton('right')}
          </div>
        )}
        <div className="cds-app-shell__nav-strip-head">
          {navStrip?.({ unfold })}
        </div>
        <div
          className="cds-app-shell__nav-foot"
          data-fold-toggle={atFoot || undefined}>
          {atFoot && foldButton('right')}
        </div>
      </div>
    ) : headerAt === 'nav' || atFoot || inHead ? (
      // The column: the header as its top row (ghost: the column is the page) when it's there, the nav, then
      // the foot: the fold toggle at its start when it's there, and the header's actions (portalled in).
      <div
        key="col"
        className="cds-app-shell__nav-col"
        data-nav-mode={navMode}
        {...modalPage}>
        {((header != null && headerAt === 'nav') || inHead) && (
          <div
            className="cds-app-shell__nav-head"
            data-fold-toggle={inHead || undefined}>
            {inHead &&
              foldButton(headerAt === 'nav' ? 'bottom-start' : 'right')}
            {header != null && headerAt === 'nav' && (
              <AppShellHeaderSlotContext.Provider value="nav">
                {header}
              </AppShellHeaderSlotContext.Provider>
            )}
          </div>
        )}
        {navScroller}
        <div
          ref={setFootSlot}
          className="cds-app-shell__nav-foot"
          data-fold-toggle={atFoot || undefined}>
          {atFoot && foldButton(navMode === 'rail' ? 'right' : 'top-start')}
        </div>
      </div>
    ) : (
      navScroller
    );

  const scrolled = contained ? (
    <Scroller
      className="cds-app-shell__main-scroller"
      viewportClassName="cds-app-shell__main-viewport"
      timeScale={timeScale}>
      {main}
    </Scroller>
  ) : (
    main
  );

  return (
    <AppShellContext.Provider value={state}>
      <AppShellMenuButtonContext.Provider value={menuButtonRef}>
        <AppShellActionsSlotContext.Provider value={actionsSlot}>
          <AppShellFootSlotContext.Provider
            value={headerAt === 'nav' ? footSlot : null}>
            <AppShellFoldToggleContext.Provider value={foldToggle || docked}>
              <ThemeZone
                {...rest}
                ref={rootRef}
                theme={chromeTheme}
                className={[
                  'cds-app-shell',
                  `cds-app-shell--${scope}`,
                  className,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={style}
                data-size-class={sizeClass}
                data-nav-mode={navMode}
                data-panel-mode={panelMode}
                data-main-frame={mainFrame}
                data-header-placement={headerAt}>
                {header != null && headerAt === 'bar' && (
                  <div className="cds-app-shell__header" {...modalChrome}>
                    <AppShellHeaderSlotContext.Provider value="bar">
                      <ChromeTooltips>{header}</ChromeTooltips>
                    </AppShellHeaderSlotContext.Provider>
                  </div>
                )}
                <div className="cds-app-shell__body">
                  <ChromeTooltips>{navColumn}</ChromeTooltips>
                  {navNode != null && navMode === 'overlay' && (
                    <NavOverlay
                      id={navId}
                      open={navOpen}
                      onRequestClose={closeNav}
                      launcherButtonRef={
                        open.how?.returnFocus === 'previous'
                          ? undefined
                          : menuButtonRef
                      }
                      selectorPrimaryFocus={open.how?.focus ?? navFocus}
                      menuButtonRef={menuButtonRef}
                      actionsRef={setActionsSlot}
                      navLabel={navLabel}
                      scope={contained ? 'container' : 'page'}
                      timeScale={timeScale}>
                      <ChromeTooltips>
                        <KitDefaults frame="ghost">{navNode}</KitDefaults>
                      </ChromeTooltips>
                    </NavOverlay>
                  )}
                  <div
                    id={mainColId}
                    className="cds-app-shell__main-col"
                    data-beside-nav={navColumn != null || undefined}
                    {...modalPage}>
                    {/* The shell's fold toggle is the nav's: a SideNav in main (a lab's) keeps its own. */}
                    <AppShellFoldToggleContext.Provider value={false}>
                      <Workspace frame={mainFrame} theme={wsTheme}>
                        {scrolled}
                      </Workspace>
                    </AppShellFoldToggleContext.Provider>
                  </div>
                  <AppShellFoldToggleContext.Provider value={false}>
                    {placedPanel && wsTheme !== 'page' ? (
                      <ThemeZone
                        theme={wsTheme}
                        className="cds-app-shell__panel-zone">
                        {placedPanel}
                      </ThemeZone>
                    ) : (
                      placedPanel
                    )}
                  </AppShellFoldToggleContext.Provider>
                  {docked && (
                    <div className="cds-app-shell__fold-dock" {...modalChrome}>
                      {foldButton('top-start')}
                    </div>
                  )}
                </div>
                {!contained && mainFrame === 'inset' && (
                  <WorkspaceTop
                    mainColId={mainColId}
                    bar={headerAt === 'bar'}
                    mainTheme={wsTheme}
                    timeScale={timeScale}
                  />
                )}
                {!contained && windowScroller && (
                  <WindowScroller
                    insets={pageScrollerInsets(
                      headerAt === 'bar',
                      mainFrame === 'inset'
                    )}
                    timeScale={timeScale}
                  />
                )}
              </ThemeZone>
            </AppShellFoldToggleContext.Provider>
          </AppShellFootSlotContext.Provider>
        </AppShellActionsSlotContext.Provider>
      </AppShellMenuButtonContext.Provider>
    </AppShellContext.Provider>
  );
}
