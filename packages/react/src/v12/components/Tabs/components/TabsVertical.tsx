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
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { SNAP_FRAME } from '@carbon-labs/v12-motion';
import {
  SelectionMarker,
  SelectionSkeletonFace,
  resolveSelectionStyle,
  skeletonRowProps,
  useSelectionLoading,
  type SelectionLoadingProps,
  type SelectionSize,
} from '@carbon-labs/react-selection-kit';
import { useDefaultFrame } from '@carbon-labs/react-kit-defaults';
import { Scroller } from '@carbon-labs/react-scroller';
import type { KeyboardMode } from '@carbon-labs/react-props';
import {
  TABS_MOTION,
  TabsContext,
  readTabs,
  useTabs,
  useTabsRoot,
  type TabsMotion,
  type TabsRootProps,
  type TabsSize,
} from './shared';
import { TabButton, skeletonFaceLabels, useTabList } from './list';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tabs.scss';
import './vertical-tabs.scss';

/* ============================================================================
 * Vertical tabs — Carbon v11's TabsVertical, on the selection family's look
 * and motion.
 * ============================================================================
 *
 * The same API as `@carbon/react`'s TabsVertical / TabListVertical / Tab /
 * TabPanels / TabPanel: `selectedIndex`, `defaultSelectedIndex`,
 * `onChange({ selectedIndex })`, `height`, `activation` ('automatic' |
 * 'manual'), disabled tabs, `renderIcon`, `secondaryLabel`,
 * `role="tablist"` with `aria-orientation="vertical"`, `tab` / `tabpanel`
 * wired by `aria-controls` / `aria-labelledby`, a roving tab stop, and ↑ / ↓
 * that wrap.
 *
 * The tab list is a selection-kit track on its side (`.sel--vertical`):
 *
 *   look        the content switcher's: a selector with concentric corners
 *               inside an 8px track; `inverse` (default), `tonal`, `outlined`
 *   frame       `inset` (default): the track; `ghost`: no track, for
 *               tabs inside a card or a side panel — rows 2px apart with a
 *               4px corner, the hover solved against what's behind (the
 *               kit's `.sel--ghost`); `line`: v11's vertical tabs, a hairline
 *               along the list's start and a 2px bar riding it (line tabs'
 *               underline on its side), square rows edge to edge;
 *               `linePosition="end"` puts the hairline and the bar on the
 *               list's end edge (the right, the left in RTL)
 *   glide       the selector travels from where it is, down or up the list,
 *               its duration from the distance, its leading edge (the bottom
 *               going down) 4px ahead; labels change color where it covers them.
 *               On a line only the move's two ends do (`.sel--ends`): the bar
 *               slides past the rows between, which stay as they are
 *   secondary   the second line one step quieter than its label: helper
 *               text unselected, the selected label's color a step down on
 *               the selector (the kit's `--sel-quiet` / `--sel-on-quiet`)
 *   press       reach 4px toward the pressed tab; slide to retarget, slide off
 *               to cancel; the pressed tab takes the flat pressed color
 *   drag        on by default: the selector drags along the list and lands on
 *               the nearest tab, stopping at the ends with the 4px squash
 *   hover       the rollover on unselected tabs and a label color step; never
 *               a weight change; motion icons play on the tab's hover
 *   icons       `renderIcon` before the label (the family's rows read icon,
 *               label); 16px, 20 at lg, on whole device pixels
 *   secondary   `secondaryLabel` as a second line (v11 drops it in vertical
 *               tabs); a list with any second line has two-line rows
 *   panels      beside the list: the content swap along y, in the direction
 *               the selection moved, in a container that resizes as a window
 *   height      v11's `height`: the list scrolls (the kit's Scroller, gradient
 *               edges, the selected tab kept in view) and each panel scrolls
 *               (the kit's Scroller; its viewport is the panel's tab stop)
 *   tooltip     a truncated label shows in full in a tooltip on hover or
 *               keyboard focus (v11 does this too), the kit's group tooltip
 *
 * The list's behavior (selection, keys, rollover, gesture, tooltip,
 * overflow) is shared with horizontal tabs (./list.tsx); this file adds
 * loading, the line frame and the list's own Scroller.
 * ========================================================================== */

/**
 * Row heights, v11's layout sizes: sm 32 / md 40 / lg 48 / xl 64px (default
 * xl, v11's own default for vertical tabs). A list with any
 * second line: 48 / 56 / 64 / 64px.
 */
export type VerticalTabsSize = TabsSize;
/** The kit size each row size takes its type, inset, padding and icon from. */
const KIT_SIZE: Record<VerticalTabsSize, SelectionSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
};
/** v11's row heights (one line, two lines) and the kit's inset at each size: `corners="full"` rounds by them. */
const ROW_PX: Record<VerticalTabsSize, [number, number]> = {
  sm: [32, 48],
  md: [40, 56],
  lg: [48, 64],
  xl: [64, 64],
};
const INSET_PX: Record<VerticalTabsSize, number> = {
  sm: 3,
  md: 4,
  lg: 4,
  xl: 4,
};

/** The tabs' motion dials — the selection kit's. */
export type VerticalTabsMotion = TabsMotion;
/** The content switcher's timing (40 / 80 / 120 / 160ms), as every selection component. */
export const VERTICAL_TABS_MOTION: VerticalTabsMotion = TABS_MOTION;

const VERTICAL_TABS_FRAMES = ['inset', 'ghost', 'line'] as const;

/** Which edge of the list a line frame's hairline and bar are on: `start` (default) or `end`. Logical, so RTL flips it. */
export type VerticalTabsLinePosition = 'start' | 'end';
const LinePositionContext = createContext<VerticalTabsLinePosition>('start');

/* ── TabsVertical ──────────────────────────────────────────────────────── */

export interface TabsVerticalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>, TabsRootProps {
  /** Row height: sm 32 / md 40 / lg 48 / xl 64px (default). */
  size?: VerticalTabsSize;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /**
   * What the list stands on. `inset` (default; `ghost` in a framed Region): its own track. `ghost`: no
   * track, for tabs inside something that already frames them (a card, a
   * side panel); only the selector, the hover and the focus show. `line`
   * (v11's vertical tabs): a hairline along the list's start, the selector a
   * 2px bar riding it, as line tabs' underline.
   */
  frame?: 'inset' | 'ghost' | 'line';
  /**
   * `frame="line"` only: the edge the hairline and the bar are on. `start`
   * (default, v11's): the list's start, beside the labels' start. `end`: its
   * end, toward the panels. Logical, so right to left mirrors both.
   */
  linePosition?: VerticalTabsLinePosition;
  /** A `TabListVertical` and a `TabPanels`. */
  children?: ReactNode;
  /**
   * v11's `height` (any CSS length): the tabs take this height; a list longer
   * than it scrolls, and so does a panel taller than it. Without it the list
   * hugs its tabs and the panel container resizes to each panel.
   */
  height?: string;
}

export function TabsVertical({
  children,
  height,
  defaultSelectedIndex,
  selectedIndex,
  onChange,
  variant,
  lowContrast,
  size,
  frame: frameProp,
  linePosition = 'start',
  corners,
  interaction,
  contour,
  outlinedFill,
  selectorGlow,
  selectedWeight,
  holdWidth,
  outline,
  motion,
  timeScale,
  onMove,
  className,
  style: styleProp,
  ...rest
}: TabsVerticalProps) {
  // A Region's default (inset on the page, ghost in a framed region) when none is given.
  const frame = useDefaultFrame(frameProp, VERTICAL_TABS_FRAMES, 'inset');
  const { ctx, busy } = useTabsRoot({
    // prettier-ignore
    defaultSelectedIndex,
    selectedIndex,
    onChange,
    variant,
    lowContrast,
    size,
    frame,
    corners,
    interaction,
    contour,
    outlinedFill,
    selectorGlow,
    selectedWeight,
    holdWidth,
    motion,
    timeScale,
    onMove,
    outline,
    prefix: 'vtabs',
    axis: 'y',
    fixed: height != null,
  });
  return (
    <TabsContext.Provider value={ctx}>
      <LinePositionContext.Provider value={linePosition}>
        <div
          {...rest}
          className={['vtabs', height != null && 'vtabs--fixed', className]
            .filter(Boolean)
            .join(' ')}
          aria-busy={busy || undefined}
          style={
            height != null
              ? { ...styleProp, ['--vtabs-height' as string]: height }
              : styleProp
          }>
          <div className="vtabs__layout">{children}</div>
        </div>
      </LinePositionContext.Provider>
    </TabsContext.Provider>
  );
}
TabsVertical.displayName = 'TabsVertical';

/** The kit's name for `TabsVertical`. */
export const VerticalTabs = TabsVertical;

/* ── TabListVertical ───────────────────────────────────────────────────── */

export interface TabListVerticalProps
  extends HTMLAttributes<HTMLDivElement>, SelectionLoadingProps {
  /** Loading: the tabs will have a second line — the placeholders are two-line rows, with this expected text (true: a typical one). */
  skeletonSecondary?: boolean | string;
  /** `Tab` elements (`IconTab` is horizontal tabs' only). */
  children?: ReactNode;
  /** `automatic` (default): arrows select. `manual`: arrows move focus; Enter / Space select. */
  activation?: KeyboardMode;
  'aria-label'?: string;
  /** The row size, overriding `TabsVertical`'s: sm 32 / md 40 / lg 48 / xl 64px (default). */
  size?: VerticalTabsSize;
  /** Keep the selected tab in view when the list scrolls (v11's). Default true. */
  scrollIntoView?: boolean;
}

export function TabListVertical({
  children,
  activation = 'automatic',
  size: sizeProp,
  scrollIntoView = true,
  className,
  style: styleProp,
  loading,
  skeletonCount,
  skeletonLabels,
  skeletonIcon = false,
  skeletonSecondary = false,
  ...rest
}: TabListVerticalProps) {
  const {
    selected,
    style: s,
    motion: m,
    fixed,
    setBusy,
  } = useTabs('TabListVertical');
  const items = readTabs(children).filter((it) => it.kind === 'text');
  const size: VerticalTabsSize = sizeProp ?? s.size ?? 'xl';
  // Line tabs have two looks, as the horizontal ones: the bar in the inverse
  // selector's color, or with `variant="hero"` in the brand blue. Square by default.
  const line = s.frame === 'line';
  const linePosition = useContext(LinePositionContext);
  const lineEnd = line && linePosition === 'end';
  const hero = s.variant === 'hero';
  const corners = s.corners ?? (line ? 'square' : undefined);
  const style = resolveSelectionStyle(
    {
      ...s,
      corners,
      size: KIT_SIZE[size],
      orientation: 'vertical',
      ...(line
        ? { variant: hero ? 'hero' : 'inverse', lowContrast: false }
        : null),
    },
    m
  );

  const rootRef = useRef<HTMLDivElement>(null);
  // Loading tabs: the structure tier (placeholder rows, taken in order).
  const load = useSelectionLoading(
    rootRef,
    { loading, skeletonCount, skeletonLabels },
    items.length,
    4,
    { timeScale: m.timeScale, labels: items.map((it) => it.text) }
  );
  const secondaryText =
    typeof skeletonSecondary === 'string'
      ? skeletonSecondary
      : skeletonSecondary
        ? 'Secondary label'
        : null;
  const twoLine = load.busy
    ? secondaryText != null
    : items.some((it) => it.secondary);
  useLayoutEffect(() => {
    setBusy(load.busy);
  }, [load.busy, setBusy]);

  const layoutKey = `${items.map((it) => `${it.key}:${it.secondary ?? ''}`).join('|')}/${size}/${s.frame ?? ''}/${fixed}/${load.busy ? 'busy' : ''}${load.standing.length}`;
  const {
    list,
    wrapRef,
    scrollerRef,
    setItemRef,
    commitByClick,
    tipElRef,
    onPointerOver,
    onPointerLeave,
    listProps,
  } = useTabList('TabListVertical', {
    axis: 'y',
    items,
    activation,
    style,
    layoutKey,
    scrollIntoView,
    // Clear of the gradient edge, so what's next shows past it.
    revealPad: (b, wrap) =>
      Math.max(
        b.height / 2,
        wrap?.querySelector<HTMLElement>('.vtabs__fade')?.offsetHeight ?? 0
      ),
    tipAlign: 'right',
    // A line's selector is only the bar: only the move's ends restyle, the rows it passes stay still (`.sel--ends`).
    ends: line,
    load,
    rootRef,
    rest,
  });

  /* ── render ──────────────────────────────────────────────────────────── */

  return (
    <div
      ref={wrapRef}
      className={[
        'vtabs__list',
        style.ghost && 'vtabs__list--ghost',
        line && 'vtabs__list--line',
        lineEnd && 'vtabs__list--line-end',
        line && hero && 'vtabs__list--hero',
        corners === 'square' && 'vtabs__list--square',
        corners === 'full' && 'vtabs__list--full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        s.corners === 'full'
          ? {
              // Pill rows; the list's corner concentric with them (half a row, plus the inset).
              ['--vtabs-row-radius' as string]: `${ROW_PX[size][twoLine ? 1 : 0] / 2}px`,
              ['--vtabs-full-radius' as string]: `${ROW_PX[size][twoLine ? 1 : 0] / 2 + (style.ghost ? 0 : INSET_PX[size])}px`,
              ...styleProp,
            }
          : styleProp
      }>
      {/* The kit's Scroller (its pill, under the gradient edges). Not a tab
          stop: the tabs are, and the selected one is kept in view. */}
      <Scroller
        className="vtabs__scroller"
        viewportClassName="vtabs__viewport"
        viewportRef={scrollerRef}
        focusable={false}
        timeScale={m.timeScale}>
        <div
          {...listProps}
          className={[
            ...style.classes,
            line && 'sel--ends',
            'vtabs__track',
            `vtabs__track--${size}`,
            twoLine && 'vtabs__track--two-line',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-busy={load.busy || undefined}
          onPointerOver={onPointerOver}
          onPointerLeave={onPointerLeave}>
          <SelectionMarker />
          {items.map((it, i) => {
            // Loading tabs: only the tabs the structure has committed, under their placeholder's key.
            const entry = load.active ? load.rowEntry(i) : undefined;
            if (load.active && !entry) return null;
            const took = entry ? load.took(entry.key) : undefined;
            return (
              <TabButton
                key={entry?.key ?? it.key}
                it={it}
                index={i}
                selected={i === selected}
                tabStop={i === list.tabStop}
                itemProps={list.itemProps}
                kind="vtabs__tab"
                dismissable={false}
                entryKey={entry?.key}
                took={took}
                takenLabel={took !== undefined ? load.labelFor(i) : undefined}
                secondaryText={secondaryText}
                skeletonIcon={skeletonIcon}
                setRef={setItemRef}
                onCommit={commitByClick}
              />
            );
          })}
          {load.standing.map((e) => (
            <button
              key={e.key}
              type="button"
              {...skeletonRowProps(e.key)}
              className={[
                'sel__item',
                'vtabs__tab',
                secondaryText != null && 'tabs__tab--two-line',
              ]
                .filter(Boolean)
                .join(' ')}>
              <SelectionSkeletonFace
                label={load.labelFor(e.slot)}
                icon={skeletonIcon}>
                {skeletonFaceLabels(
                  load.labelFor(e.slot),
                  secondaryText,
                  skeletonIcon
                )}
              </SelectionSkeletonFace>
            </button>
          ))}
        </div>
      </Scroller>
      <span className="vtabs__fade vtabs__fade--top" aria-hidden="true" />
      <span className="vtabs__fade vtabs__fade--bottom" aria-hidden="true" />
      <div className="sel__tip" ref={tipElRef} hidden aria-hidden="true">
        <span className="sel__tip-frame" {...SNAP_FRAME} />
        <span className="sel__tip-text" />
      </div>
    </div>
  );
}
TabListVertical.displayName = 'TabListVertical';
