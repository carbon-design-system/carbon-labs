/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  loadPlexVar,
  rovingKey,
  useRovingFocus,
} from '@carbon-labs/react-selection-kit';
import {
  cellClasses,
  cutStyle,
  gridCuts,
  shellClasses,
  useShellRollover,
  type ShellCorners,
  type ShellLook,
} from './shell';
import { resolveButtonLook } from '@carbon-labs/react-props';

/* ============================================================================
 * ButtonGrid — many equal actions as one button shell, wrapping into rows
 * ============================================================================
 *
 * The button shell (shell.ts) in many cells, wrapping into rows, the outer
 * corners the only rounded ones. The cells and rows divided by the kit's
 * seam rule: a 1px knockout on primary and secondary, the outline's own line
 * on tertiary and the quiet hairline on neutral. For a set of equal actions,
 * such as a grid of plays, one click each.
 *
 *   cells     each a real <button> (`ButtonGridCell`) with the Button's hover,
 *             press and focus, its glow, pressed colour and release circle
 *             clipped to the cell; no growth or press-in. Cells fill their column, their
 *             labels centred
 *   columns   a CSS grid of equal columns, as many as fit at
 *             `minCellWidth` (default 76px), never more than the largest
 *             group has cells; every group on the same columns
 *   groups    optional (`ButtonGridGroup`): labelled rows in one grid, each
 *             group its own shell under a small label (label-01)
 *   keys      one Tab stop (`role="toolbar"`, roving tabindex, the selection
 *             kit's `useRovingFocus`): ← / → along the cells in order, across
 *             the groups, the way they point (right-to-left: → toward the
 *             inline start); Home / End to the first and last; ↑ / ↓ to the
 *             nearest cell in the row above or below, by layout, across the
 *             groups. Disabled cells are skipped
 *   disabled  a cell keeps its place (no reflow) and reads as unavailable:
 *             the Button's disabled colours, native `disabled`
 *   selected  `selected` on a cell: a quiet selected tint (a step of
 *             `$text-primary`, 1.40:1 against the rest in every theme;
 *             a quiet look's label medium, 500) and `aria-current`, for
 *             the action that last ran. A text label holds its width at the
 *             selected weight, so selecting never changes it
 *   sizes     xs 24, sm 32 (default), md 40. Nothing under 24px (WCAG 2.2's
 *             target size)
 *   looks     the grid's `variant` defaults to outlined (the Button's
 *             outline, neutral in hue, `$text-primary` on the light themes
 *             and white on the dark); `variant="filled"` fills it in its
 *             `kind` (primary, secondary); `variant="tonal"`: the quieter look
 *             grey lines in the kit's
 *             standard surface, `$text-primary` labels, the quiet card hover
 *             (shell.ts). No ghost frame: no surface to divide
 *
 * Why `toolbar` and not `group` or `grid`: a toolbar is the ARIA composite for
 * a set of action buttons with one Tab stop and arrow keys, and screen readers
 * pass the arrows through to it (in a plain group they would move the
 * reading cursor instead). `grid` would need rows of `gridcell`s that change
 * as the cells wrap. The labelled groups are `role="group"` inside it, as
 * the APG's toolbar example groups its controls.
 * ========================================================================== */

/** The roles a grid takes (`kind`). */
export const ButtonGridKinds = ['primary', 'secondary'] as const;
export type ButtonGridKind = (typeof ButtonGridKinds)[number];
/** The treatments a grid takes (`variant`), `outlined` its default. */
export const ButtonGridVariants = ['outlined', 'filled', 'tonal'] as const;
export type ButtonGridVariant = (typeof ButtonGridVariants)[number];
export const ButtonGridSizes = ['xs', 'sm', 'md'] as const;
export type ButtonGridSize = (typeof ButtonGridSizes)[number];

interface GridContext {
  look: ShellLook;
  size: ButtonGridSize;
  corners: ShellCorners;
  cols: number;
}
const GridCtx = createContext<GridContext>({
  look: 'tertiary',
  size: 'sm',
  corners: 'full',
  cols: 1,
});
const CellCtx = createContext<{ i: number; n: number }>({ i: 0, n: 1 });

export interface ButtonGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** The grid's accessible name (or pass `aria-labelledby`). */
  label?: string;
  /** ButtonGridCells, or ButtonGridGroups of them. */
  children?: ReactNode;
  /** xs 24, sm 32 (default), md 40. */
  size?: ButtonGridSize;
  /** The role: `primary` (default) or `secondary`. */
  kind?: ButtonGridKind;
  /** The treatment: `outlined` (the grid's default: v11's tertiary), `filled` (the role's fill) or `tonal` (the quieter look: grey lines in the kit's standard surface). Setting `kind` keeps it. */
  variant?: ButtonGridVariant;
  /** The shell's outer corners: full (default), rounded (8px), square. */
  corners?: ShellCorners;
  /** The narrowest a cell gets, px: the grid fits as many columns as this allows. Default 76. */
  minCellWidth?: number;
}

const isGroup = (c: unknown) => isValidElement(c) && c.type === ButtonGridGroup;
const countOf = (children: ReactNode) => Children.toArray(children).length;

export const ButtonGrid = forwardRef<HTMLDivElement, ButtonGridProps>(
  function ButtonGrid(
    {
      label,
      children,
      size = 'sm',
      kind,
      variant,
      corners = 'full',
      minCellWidth = 76,
      className,
      style,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const items = Children.toArray(children);
    const grouped = items.some(isGroup);
    const counts = grouped
      ? items.map((g) =>
          isGroup(g)
            ? countOf((g as { props: { children?: ReactNode } }).props.children)
            : 0
        )
      : [items.length];
    const most = Math.max(1, ...counts);

    // As many columns as fit, no more than the largest group fills.
    const [cols, setCols] = useState(most);
    useLayoutEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const fit = () => {
        const w = el.clientWidth;
        setCols(Math.max(1, Math.min(most, Math.floor(w / minCellWidth))));
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      return () => ro.disconnect();
    }, [most, minCellWidth]);

    // ← / →, Home / End: the selection kit's roving tab stop, across the groups.
    useRovingFocus(rootRef, { items: '.cds-btn-cell' });
    // Right-to-left, ← / → the way they point: the DOM order runs right to left, so → is the
    // previous cell. Taken before useRovingFocus (which steps in DOM order) sees the key.
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (getComputedStyle(root).direction !== 'rtl') return;
        const cells = [
          ...root.querySelectorAll<HTMLButtonElement>('.cds-btn-cell'),
        ];
        const from = cells.indexOf(e.target as HTMLButtonElement);
        if (from < 0) return;
        e.preventDefault();
        e.stopPropagation();
        const next = rovingKey(
          e.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft',
          from,
          {
            orientation: 'horizontal',
            wrap: false,
            count: cells.length,
            isDisabled: (k) =>
              cells[k]!.disabled ||
              cells[k]!.getAttribute('aria-disabled') === 'true',
          }
        );
        if (next != null && next !== from) cells[next]!.focus();
      };
      root.addEventListener('keydown', onKey, true);
      return () => root.removeEventListener('keydown', onKey, true);
    }, []);
    const look = resolveButtonLook(
      { kind, variant },
      { variant: 'outlined' }
    ) as ShellLook;
    useShellRollover(rootRef, look, 1, look === 'neutral');
    // The labels' face (button-shell.scss): Plex Sans Variable, so the selected medium is a real 500.
    useEffect(() => {
      void loadPlexVar();
    }, []);

    // ↑ / ↓: the nearest enabled cell in the nearest row above or below that has one.
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      )
        return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const root = rootRef.current;
      const from = (e.target as Element).closest?.<HTMLElement>(
        '.cds-btn-cell'
      );
      if (!root || !from || !root.contains(from)) return;
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const r0 = from.getBoundingClientRect();
      const cx = r0.left + r0.width / 2;
      let best: HTMLElement | null = null;
      let bestDy = Infinity;
      let bestDx = Infinity;
      for (const c of root.querySelectorAll<HTMLButtonElement>(
        '.cds-btn-cell'
      )) {
        if (c.disabled || c.getAttribute('aria-disabled') === 'true') continue;
        const r = c.getBoundingClientRect();
        const dy = (r.top - r0.top) * dir;
        if (dy < 1) continue;
        const dx = Math.abs(r.left + r.width / 2 - cx);
        if (
          dy < bestDy - 0.5 ||
          (Math.abs(dy - bestDy) <= 0.5 && dx < bestDx)
        ) {
          best = c;
          bestDy = dy;
          bestDx = dx;
        }
      }
      best?.focus();
    };

    return (
      <div
        {...rest}
        ref={(el) => {
          rootRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        role="toolbar"
        aria-label={rest['aria-labelledby'] ? undefined : label}
        className={['cds-btn-grid', `cds-btn-grid--${size}`, className]
          .filter(Boolean)
          .join(' ')}
        style={{ ...style, '--cols': cols } as CSSProperties}
        onKeyDown={handleKeyDown}>
        <GridCtx.Provider value={{ look, size, corners, cols }}>
          {grouped ? children : <ButtonGridGroup>{children}</ButtonGridGroup>}
        </GridCtx.Provider>
      </div>
    );
  }
);
ButtonGrid.displayName = 'ButtonGrid';

export interface ButtonGridGroupProps {
  /** The group's label, shown small above its row(s); its accessible name. */
  label?: ReactNode;
  /** ButtonGridCells. */
  children?: ReactNode;
  className?: string;
}

/** A labelled run of cells in a ButtonGrid: its own rows on the grid's columns. */
export function ButtonGridGroup({
  label,
  children,
  className,
}: ButtonGridGroupProps) {
  const { look, size, corners } = useContext(GridCtx);
  const id = `cds-btn-grid-${useId().replace(/:/g, '')}`;
  const cells = Children.toArray(children);
  const shell = (
    <div
      className={shellClasses({
        look,
        size,
        corners,
        className: 'cds-btn-shell--grid',
      })}>
      {cells.map((c, i) => (
        <CellCtx.Provider
          key={(isValidElement(c) && c.key) || i}
          value={{ i, n: cells.length }}>
          {c}
        </CellCtx.Provider>
      ))}
    </div>
  );
  if (label == null || label === '') return shell;
  return (
    <div
      role="group"
      aria-labelledby={id}
      className={['cds-btn-grid__group', className].filter(Boolean).join(' ')}>
      <span id={id} className="cds-btn-grid__label">
        {label}
      </span>
      {shell}
    </div>
  );
}
ButtonGridGroup.displayName = 'ButtonGridGroup';

export interface ButtonGridCellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The quiet selected tint and `aria-current` (the action that last ran). A string label keeps its width when selected. */
  selected?: boolean;
  children?: ReactNode;
}

/** One action in a ButtonGrid: a real <button>. */
export const ButtonGridCell = forwardRef<
  HTMLButtonElement,
  ButtonGridCellProps
>(function ButtonGridCell(
  {
    selected = false,
    disabled = false,
    children,
    className,
    style,
    type = 'button',
    ...rest
  },
  ref
) {
  const { look, cols } = useContext(GridCtx);
  const { i, n } = useContext(CellCtx);
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-current={selected ? 'true' : undefined}
      className={cellClasses({
        look,
        role: 'grid',
        disabled,
        selected,
        className,
      })}
      style={{ ...cutStyle(gridCuts(i, n, cols)), ...style }}>
      {/* A text label reserves its width at the selected weight (`data-label`, button-shell.scss). */}
      <span
        className="cds-btn-cell__label"
        data-label={
          typeof children === 'string' || typeof children === 'number'
            ? String(children)
            : undefined
        }>
        {children}
      </span>
    </button>
  );
});
ButtonGridCell.displayName = 'ButtonGridCell';
