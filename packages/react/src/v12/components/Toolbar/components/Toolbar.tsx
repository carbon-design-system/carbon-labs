/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useLayer } from '@carbon/react';
import {
  SNAP,
  attachRollover,
  holdLayout,
  snapDurationMs,
  snapEaseCss,
  usePrefersReducedMotion,
  watchTonal,
} from '@carbon-labs/v12-motion';
import {
  OverflowMenuHorizontal,
  OverflowMenuVertical,
} from '@carbon-labs/react-motion-icons';
import { Menu } from '@carbon-labs/react-menu';
import { useMenuTrigger } from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  isComponentType,
  resolveSelectionStyle,
  useDefaultFrame,
  rovingKey,
  useIconPixelSnap,
  type SelectionMotion,
  type SelectionSize,
  type TooltipAlign,
} from '@carbon-labs/react-selection-kit';
import { TooltipGroup } from '@carbon-labs/react-tooltip';
import {
  CONTROL_PX,
  ToolbarContext,
  useToolbar,
  type OverflowEntry,
  type ToolbarContextValue,
  type ToolbarGroupFrame,
  type ToolbarOrientation,
  type ToolbarStyleProps,
} from './context';
import { ToolbarControl, ToolbarDivider } from './ToolbarButton';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './toolbar.scss';
import { inlineKey, useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Toolbar: a row or column of controls with one tab stop.
 *
 *   focus     roving: arrows across every control, Home / End, no wrap by default
 *   tooltip   one TooltipGroup: snaps in once, then slides between controls
 *   hover     the rollover on every control; the kit's hover on a track's toggles
 *   groups    single: a selection track whose selector glides; multiple: pressed fills
 *   overflow  trailing units move into a more menu; the more button arrives as the snap's mark
 *   layer     an inset group is a rounded layer; a divider beside a layer isn't drawn
 *   reduced   the glide and the mark go at once; the fill fade is kept
 *
 * API: IBM Products' Toolbar parts, plus size, orientation, overflow, groupFrame,
 * surface and the kit's style props.
 * ========================================================================== */

export interface ToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, ToolbarStyleProps {
  children?: ReactNode;
  /** `horizontal` (default): a row; `vertical`: a column (a side toolbar). */
  orientation?: ToolbarOrientation;
  /** xs (24) / sm (32) / md (40, default) / lg (48): every control's size. */
  size?: SelectionSize;
  /** Exclusive groups' frame: `inset` (default, a track) or `ghost`; a group's own `frame` wins. */
  groupFrame?: ToolbarGroupFrame;
  /** `menu` (default): what doesn't fit moves into a "more" menu (a row only). `none`: it doesn't. */
  overflow?: 'menu' | 'none';
  /** The more button's tooltip and the menu's name. Default `More`. */
  overflowLabel?: string;
  /** Arrows wrap past the ends. Default false (see the docs). */
  wrap?: boolean;
  /** `none` (default); `filled`: the quiet surface, everything inside a layer up; `outlined`: with its hairline. */
  surface?: 'none' | 'filled' | 'outlined';
  /** Where tooltips sit. Default `bottom` in a row, `right` in a column: away from the toolbar. */
  tooltipAlign?: TooltipAlign;
  /** The kit's motion dials (the exclusive groups' glide, reach, drag; `timeScale` everywhere). */
  motion?: Partial<SelectionMotion>;
}

const STOP = '[data-toolbar-stop]';
const LAYER_NAMES = ['one', 'two', 'three'] as const;
const UNIT = '[data-toolbar-unit]';

/** A stop that can't take focus now: disabled, or moved into the overflow. */
const isOffStop = (el: Element) =>
  el.matches(':disabled') ||
  el.getAttribute('aria-disabled') === 'true' ||
  !!el.closest('[data-overflowed]');

const GROUP_FRAMES = ['inset', 'ghost'] as const;

export function Toolbar({
  children,
  className,
  orientation = 'horizontal',
  size = 'md',
  variant,
  lowContrast,
  corners = 'full',
  interaction,
  contour,
  outlinedFill,
  selectorGlow,
  outline,
  groupFrame: groupFrameProp,
  overflow = 'menu',
  overflowLabel = 'More',
  wrap = false,
  surface = 'none',
  tooltipAlign,
  motion,
  onKeyDown,
  onFocus,
  ...rest
}: ToolbarProps) {
  // The motion preference, or a MotionProvider's level above it.
  const reduced = usePrefersReducedMotion();
  const rolloverReduced = useReducedGetter();
  const m: SelectionMotion = useMemo(
    () => ({ ...SELECTION_KIT_MOTION, ...motion }),
    [motion]
  );
  const style = useMemo<ToolbarStyleProps>(
    () => ({
      variant,
      lowContrast,
      corners,
      interaction,
      contour,
      outlinedFill,
      selectorGlow,
      outline,
    }),
    [
      variant,
      lowContrast,
      corners,
      interaction,
      contour,
      outlinedFill,
      selectorGlow,
      outline,
    ]
  );
  const kit = resolveSelectionStyle({ ...style, size }, m);
  // A Region's default (inset on the page, ghost in a framed region) when none is given.
  const groupFrame = useDefaultFrame(groupFrameProp, GROUP_FRAMES, 'inset');
  // A surface paints the layer it sits on and steps what's inside up one, as a <Layer> would;
  // `useLayer().level` is the level a <Layer> here would take, so the surface's is one less.
  const { level: next } = useLayer() as { level: number };
  const level = Math.max(0, next - 1);
  const inner = Math.min(2, next);

  /* ── the overflow registry ──────────────────────────────────────────── */

  const registry = useRef(new Set<OverflowEntry>());
  const register = useCallback((e: OverflowEntry) => {
    registry.current.add(e);
    return () => {
      registry.current.delete(e);
    };
  }, []);

  const ctx = useMemo<ToolbarContextValue>(
    () => ({
      size,
      orientation,
      style,
      groupFrame,
      motion: m,
      reduced,
      register,
    }),
    [size, orientation, style, groupFrame, m, reduced, register]
  );

  const rootRef = useRef<HTMLDivElement>(null);
  // A tonal toolbar takes its hue from where it sits (the core's tonal watcher, for the tonal look only).
  useLayoutEffect(
    () => (kit.variant === 'tonal' ? watchTonal(rootRef.current) : undefined),
    [kit.variant]
  );
  const units = Children.toArray(children);
  const unitKey = units
    .map((u, i) => (isValidElement(u) ? String(u.key ?? i) : i))
    .join('|');

  /* ── overflow: which trailing units don't fit ───────────────────────── */

  const canOverflow = overflow === 'menu' && orientation === 'horizontal';
  const [cut, setCut] = useState<number | null>(null);
  const effCut = canOverflow ? cut : null;

  // The more button arrives as the snap's mark only once the toolbar has
  // settled: a toolbar that is already narrow when it mounts just has one.
  const settled = useRef(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      settled.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !canOverflow) return;
    const more = CONTROL_PX[size];
    const compute = () => {
      const els = Array.from(
        root.querySelectorAll<HTMLElement>(`:scope > ${UNIT}`)
      );
      const cs = getComputedStyle(root);
      const gap = parseFloat(cs.columnGap) || 0;
      const avail =
        root.clientWidth -
        (parseFloat(cs.paddingLeft) || 0) -
        (parseFloat(cs.paddingRight) || 0);
      // An overflowed unit is out of flow but still laid out (hidden), so its width is always known.
      const w = els.map((el) => el.offsetWidth);
      const total =
        w.reduce((a, b) => a + b, 0) + gap * Math.max(0, w.length - 1);
      let next: number | null = null;
      if (total > avail + 0.5) {
        let used = more;
        let k = 0;
        for (; k < w.length; k++) {
          if (used + w[k]! + gap > avail + 0.5) break;
          used += w[k]! + gap;
        }
        // No divider left trailing before the more button.
        while (k > 0 && els[k - 1]!.hasAttribute('data-toolbar-divider')) k--;
        next = k;
      }
      setCut((c) => (c === next ? c : next));
    };
    compute();
    // In a layout transaction (a panel opening beside it) the cut is made once, at the settle,
    // so controls don't drop into the overflow one by one.
    const hold = holdLayout(root, compute);
    const ro = new ResizeObserver(() => {
      if (!hold.holding()) compute();
    });
    ro.observe(root);
    for (const el of root.querySelectorAll(`:scope > ${UNIT}`)) ro.observe(el);
    return () => {
      ro.disconnect();
      hold.detach();
    };
  }, [canOverflow, size, unitKey]);

  /** The overflowed controls' menu items, in document order, built from their latest state. */
  const buildOverflow = useCallback((): ReactNode[] => {
    const root = rootRef.current;
    if (!root) return [];
    const placed = [...registry.current]
      .map((e) => ({ e, el: e.el() }))
      .filter(
        (x): x is { e: OverflowEntry; el: Element } =>
          !!x.el && root.contains(x.el) && !!x.el.closest('[data-overflowed]')
      )
      .sort((a, b) =>
        a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1
      );
    const out: OverflowEntry[] = [];
    for (const { e } of placed) {
      if (e.divider && (!out.length || out[out.length - 1]!.divider)) continue;
      out.push(e);
    }
    while (out.length && out[out.length - 1]!.divider) out.pop();
    return out.map((e, i) => e.menu(`overflow-${i}`));
  }, []);

  /* ── roving focus: one tab stop ─────────────────────────────────────── */

  const activeRef = useRef<HTMLElement | null>(null);
  const stops = useCallback((): HTMLElement[] => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(STOP)).filter(
      (el) => el.closest('[role="toolbar"]') === root
    );
  }, []);

  /** Exactly one stop is tabbable: the one that last had focus, else the first enabled one. */
  const syncTabStop = useCallback(() => {
    const all = stops();
    let a = activeRef.current;
    if (!a || !all.includes(a) || isOffStop(a))
      a = all.find((el) => !isOffStop(el)) ?? null;
    activeRef.current = a;
    for (const el of all) el.tabIndex = el === a ? 0 : -1;
  }, [stops]);

  // After every render (controls mount, overflow, disabled changes).
  useLayoutEffect(() => {
    syncTabStop();
  });

  const handleFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    const stop = (e.target as Element).closest<HTMLElement>(STOP);
    if (stop && stops().includes(stop)) {
      activeRef.current = stop;
      syncTabStop();
    }
    onFocus?.(e);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    // A control's own key (the more button's ↓ opens its menu) wins.
    if (e.defaultPrevented) return;
    const stop = (e.target as Element).closest<HTMLElement>(STOP);
    if (!stop) return;
    const list = stops().filter((el) => !el.closest('[data-overflowed]'));
    const i = list.indexOf(stop);
    if (i < 0) return;
    // ← / → the way they point: right to left, → is the previous control.
    const next = rovingKey(inlineKey(e.key, e.currentTarget), i, {
      orientation,
      wrap,
      count: list.length,
      isDisabled: (k) => isOffStop(list[k]!),
    });
    if (next == null) return;
    e.preventDefault();
    if (next !== i) list[next]!.focus();
  };

  /* ── hover: the rollover on every control ───────────────────────────── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const detach = attachRollover(root, {
      selector: '.cds-toolbar__ctl:not(:disabled)',
      timeScale: m.timeScale,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      for (const b of root.querySelectorAll<HTMLElement>('.cds-toolbar__ctl')) {
        b.style.removeProperty('--cds-motion-rollover-hover-color');
        b.style.removeProperty('--cds-motion-rollover-press-color');
        b.style.removeProperty('--cds-motion-rollover-color');
      }
    };
  }, [m.timeScale, rolloverReduced, kit.variant]);

  useIconPixelSnap(
    rootRef,
    '.cds-toolbar__ctl svg, .sel__face svg',
    `${size}/${orientation}/${effCut}/${unitKey}`
  );

  /* ── render ──────────────────────────────────────────────────────────── */

  const classes = [
    'cds-toolbar',
    `cds-toolbar--${orientation}`,
    `cds-toolbar--${size}`,
    `cds-toolbar--${kit.variant}`,
    canOverflow && 'cds-toolbar--overflow',
    (contour ?? false) && kit.variant === 'tonal' && 'cds-toolbar--contour',
    kit.variant === 'outlined' &&
      (outlinedFill ?? 'subtle') === 'subtle' &&
      'cds-toolbar--outline-led',
    corners === 'square' && 'cds-toolbar--square',
    corners === 'full' && 'cds-toolbar--full',
    surface !== 'none' && [
      'cds-toolbar--surface',
      `cds-toolbar--surface-l${level}`,
      `cds--layer-${LAYER_NAMES[inner]}`,
    ],
    surface === 'outlined' && 'cds-toolbar--surface-outlined',
    surface === 'none' &&
      (level >= 1 ? 'cds-toolbar--in-layer' : 'cds-toolbar--no-layer'),
    className,
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  return (
    <ToolbarContext.Provider value={ctx}>
      <TooltipGroup
        align={
          tooltipAlign ?? (orientation === 'vertical' ? 'right' : 'bottom')
        }
        autoAlign>
        <div
          {...rest}
          ref={rootRef}
          role="toolbar"
          aria-orientation={orientation}
          className={classes}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}>
          {units.map((u, i) => (
            <div
              key={isValidElement(u) ? (u.key ?? i) : i}
              className="cds-toolbar__unit"
              data-toolbar-unit=""
              {...(isValidElement(u) && isComponentType(u.type, ToolbarDivider)
                ? { 'data-toolbar-divider': '' }
                : null)}
              {...(effCut != null && i >= effCut
                ? { 'data-overflowed': '' }
                : null)}>
              {u}
            </div>
          ))}
          {effCut != null && (
            <ToolbarOverflow
              label={overflowLabel}
              build={buildOverflow}
              settled={settled}
            />
          )}
        </div>
      </TooltipGroup>
    </ToolbarContext.Provider>
  );
}
Toolbar.displayName = 'Toolbar';

/* ── ToolbarGroup ──────────────────────────────────────────────────────── */

export interface ToolbarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label'
> {
  children?: ReactNode;
  /** The group's name (its `aria-label`), as `ToolbarToggleGroup` takes it. */
  label?: string;
}

/** Controls that belong together (`role="group"`, named by `label`). They overflow together. */
export function ToolbarGroup({
  children,
  className,
  label,
  ...rest
}: ToolbarGroupProps) {
  return (
    <div
      role="group"
      {...rest}
      aria-label={label}
      className={['cds-toolbar__group', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
ToolbarGroup.displayName = 'ToolbarGroup';

/* ── the overflow: a "more" button and its Menu ────────────────────────── */

/** OverflowMenu from its parts, so its button is a roving stop and a tooltip trigger, and its items are built on open. */
function ToolbarOverflow({
  label,
  build,
  settled,
}: {
  label: string;
  build: () => ReactNode[];
  settled: RefObject<boolean>;
}) {
  const tb = useToolbar()!;
  const { open, setOpen, button, setButton, origin, initialFocus, handlers } =
    useMenuTrigger({ openFrom: 'pointer', timeScale: tb.motion.timeScale });
  const [items, setItems] = useState<ReactNode[]>([]);
  const unitRef = useRef<HTMLDivElement>(null);
  const menuId = `cds-toolbar-more-${useId().replace(/:/g, '')}`;
  const timeScale = tb.motion.timeScale;
  const reduced = tb.reduced;

  // In: the snap's mark, opaque from half size about its center (fast-02, entrance-productive).
  // Out: it goes at once, as the controls it holds left the row.
  useLayoutEffect(() => {
    const el = unitRef.current;
    if (!el || reduced || !settled.current || typeof el.animate !== 'function')
      return;
    const mark = el.animate(
      [{ transform: `scale(${SNAP.mark.from})` }, { transform: 'scale(1)' }],
      {
        duration: snapDurationMs(SNAP.mark.in) * timeScale,
        easing: snapEaseCss(SNAP.mark.ease),
      }
    );
    return () => mark.cancel();
    // Mount only: never replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Icon =
    tb.orientation === 'vertical'
      ? OverflowMenuVertical
      : OverflowMenuHorizontal;
  const s = tb.style;
  return (
    <div ref={unitRef} className="cds-toolbar__unit cds-toolbar__more">
      <ToolbarControl
        label={label}
        renderIcon={Icon}
        buttonRef={setButton}
        noTooltip={open}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onPointerDown={handlers.onPointerDown}
        onClick={(e) => {
          if (!open) setItems(build());
          handlers.onClick(e);
        }}
        onKeyDown={(e) => {
          // ↑ / ↓ open it in a row (the menu button's keys); in a column they rove.
          if (
            tb.orientation !== 'horizontal' ||
            (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
          )
            return;
          setItems(build());
          handlers.onKeyDown(e);
        }}
      />
      <Menu
        id={menuId}
        label={label}
        open={open}
        onClose={() => setOpen(false)}
        anchor={button}
        menuAlignment="bottom-end"
        origin={origin}
        initialFocus={initialFocus}
        size={tb.size}
        motion={{ timeScale }}
        variant={s.variant === 'hero' ? 'inverse' : s.variant}
        lowContrast={s.lowContrast}
        // A pill toolbar's menu takes Menu's own corners (8px, or the kit's);
        // a square toolbar keeps a square menu.
        corners={s.corners === 'full' ? undefined : s.corners}
        contour={s.contour}
        outlinedFill={s.outlinedFill}>
        {items}
      </Menu>
    </div>
  );
}
